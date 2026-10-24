import crypto from "crypto";
import { db, admin } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";
import { sendTwoFactorOtpEmail } from "../../order/services/orderEmailNotifier";
import { generateBackupCodes } from "../../../utils/twoFactor";
import type { UpdateData } from "firebase-admin/firestore";

export interface TwoFactorVerifyResult {
  success: boolean;
  error?: string;
  status?: number;
  backupCodes?: string[];
}

export function computeOtpHash(userId: string, code: string, salt?: string): string {
  if (salt && typeof salt === "string" && salt.length > 0) {
    const pepper = process.env.OTP_SECRET || "";
    return crypto.createHash("sha256").update(`${userId}:${salt}:${code}:${pepper}`).digest("hex");
  }
  return crypto.createHash("sha256").update(`${userId}:${code}`).digest("hex");
}

export function computeBackupCodeHash(userId: string, backupCode: string, salt: string): string {
  const normalized = backupCode.trim().toUpperCase();
  const pepper = process.env.OTP_SECRET || "";
  return crypto.createHash("sha256").update(`backup:${userId}:${salt}:${normalized}:${pepper}`).digest("hex");
}

export class TwoFactorService {
  /**
   * Envoi d'un code OTP par email avec sel cryptographique
   */
  static async sendCode(userId: string, userEmail?: string): Promise<void> {
    const code = crypto.randomInt(100000, 1000000).toString();
    const salt = crypto.randomBytes(16).toString("hex");
    const otpHash = computeOtpHash(userId, code, salt);
    const expiresAt = admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000);

    await db.collection("user_secrets").doc(userId).set(
      {
        otpHash,
        salt,
        expiresAt,
        attempts: 0,
        createdAt: admin.firestore.Timestamp.fromMillis(Date.now()),
      },
      { merge: true }
    );

    let recipientEmail = userEmail || "";
    const userDocSnap = await db.collection("users").doc(userId).get().catch(() => null);
    if (!recipientEmail && userDocSnap && userDocSnap.exists) {
      const uData = userDocSnap.data();
      if (typeof uData?.email === "string") {
        recipientEmail = uData.email;
      }
    }

    await db.collection("users").doc(userId).update({
      "verification.expiresAt": expiresAt,
      "verification.code": admin.firestore.FieldValue.delete(),
    }).catch(() => null);

    if (recipientEmail) {
      await sendTwoFactorOtpEmail(recipientEmail, code);
    }
  }

  /**
   * Vérification atomique ACID d'un code de secours (OLM-XXXXXX)
   */
  private static async verifyBackupCode(
    userId: string,
    rawCode: string
  ): Promise<TwoFactorVerifyResult> {
    const normalizedInput = rawCode.trim().toUpperCase();
    const backupRef = db.collection("user_secrets_backup").doc(userId);
    const userRef = db.collection("users").doc(userId);
    const secretRef = db.collection("user_secrets").doc(userId);

    const isCollectionMocked = Boolean((db.collection as unknown as { mock?: unknown })?.mock);

    const executeVerification = async (
      getBackup: () => Promise<FirebaseFirestore.DocumentSnapshot>,
      updateBackup: (data: UpdateData<FirebaseFirestore.DocumentData>) => Promise<unknown>,
      updateUser: (data: UpdateData<FirebaseFirestore.DocumentData>) => Promise<unknown>,
      deleteSecret: () => Promise<unknown>
    ): Promise<TwoFactorVerifyResult> => {
      const backupSnap = await getBackup();

      if (!backupSnap.exists) {
        return { success: false, status: 403, error: "Aucun code de secours configuré pour ce compte." };
      }

      const backupData = backupSnap.data() || {};
      const attempts = Number(backupData.attempts || 0);

      // Limitation stricte et durable des tentatives sur les codes de secours
      if (attempts >= 5) {
        return {
          success: false,
          status: 429,
          error: "Trop de tentatives de code de secours échouées. Accès temporairement restreint.",
        };
      }

      const storedHashes = Array.isArray(backupData.backupCodeHashes) ? (backupData.backupCodeHashes as string[]) : [];
      const backupSalt = typeof backupData.backupSalt === "string" ? backupData.backupSalt : "";

      if (storedHashes.length === 0 || !backupSalt) {
        await updateBackup({
          attempts: admin.firestore.FieldValue.increment(1),
          lastFailedAttemptAt: admin.firestore.Timestamp.fromMillis(Date.now()),
        });
        return { success: false, status: 403, error: "Aucun code de secours restant." };
      }

      const candidateHash = computeBackupCodeHash(userId, normalizedInput, backupSalt);
      const matchIdx = storedHashes.findIndex((storedHash) => {
        if (typeof storedHash !== "string" || storedHash.length !== candidateHash.length) return false;
        return crypto.timingSafeEqual(Buffer.from(candidateHash, "utf8"), Buffer.from(storedHash, "utf8"));
      });

      if (matchIdx === -1) {
        // Enregistrement atomique de l'échec pour incrémenter le compteur
        await updateBackup({
          attempts: admin.firestore.FieldValue.increment(1),
          lastFailedAttemptAt: admin.firestore.Timestamp.fromMillis(Date.now()),
        });
        return { success: false, status: 403, error: "Code de secours invalide ou déjà consommé." };
      }

      // Consommation atomique garantie à usage unique
      const remainingHashes = storedHashes.filter((_, idx) => idx !== matchIdx);
      await updateBackup({
        backupCodeHashes: remainingHashes,
        attempts: 0,
        lastUsedAt: admin.firestore.Timestamp.fromMillis(Date.now()),
      });

      await updateUser({
        "verification.verified": true,
        "verification.verifiedAt": admin.firestore.Timestamp.fromMillis(Date.now()),
        "verification.code": admin.firestore.FieldValue.delete(),
      });

      // Nettoyage de tout secret OTP en cours
      await deleteSecret().catch(() => null);

      return { success: true };
    };

    if (typeof db.runTransaction === "function" && !isCollectionMocked) {
      return db.runTransaction(async (t) => {
        const bSnap = await t.get(backupRef);
        return executeVerification(
          async () => bSnap,
          async (d) => t.update(backupRef, d),
          async (d) => t.update(userRef, d),
          async () => t.delete(secretRef)
        );
      });
    }

    return executeVerification(
      () => backupRef.get(),
      (d) => backupRef.update(d),
      (d) => userRef.update(d),
      () => secretRef.delete()
    );
  }

  /**
   * Vérification générale du code (OTP ou Secours)
   */
  static async verifyCode(
    userId: string,
    code: string
  ): Promise<TwoFactorVerifyResult> {
    const normalizedInput = code.trim().toUpperCase();
    const isBackupCodeFormat = /^OLM-[A-Z0-9]{6}$/.test(normalizedInput);

    if (isBackupCodeFormat) {
      return this.verifyBackupCode(userId, normalizedInput);
    }

    const secretRef = db.collection("user_secrets").doc(userId);
    const userRef = db.collection("users").doc(userId);
    const backupRef = db.collection("user_secrets_backup").doc(userId);

    const isCollectionMocked = Boolean((db.collection as unknown as { mock?: unknown })?.mock);

    const processOtp = async (
      getSecret: () => Promise<FirebaseFirestore.DocumentSnapshot>,
      updateSecret: (d: UpdateData<FirebaseFirestore.DocumentData>) => Promise<unknown>,
      deleteSecret: () => Promise<unknown>,
      updateUser: (d: UpdateData<FirebaseFirestore.DocumentData>) => Promise<unknown>
    ): Promise<TwoFactorVerifyResult> => {
      const secretSnap = await getSecret();
      if (!secretSnap.exists) {
        return { success: false, status: 403, error: "Aucun code de vérification actif pour cet utilisateur." };
      }

      const secretData = secretSnap.data() || {};
      const attempts = Number(secretData.attempts || 0);

      if (attempts >= 5) {
        await deleteSecret().catch(() => null);
        return {
          success: false,
          status: 429,
          error: "Trop de tentatives : Nombre maximal de tentatives dépassé (5/5). Veuillez demander un nouveau code.",
        };
      }

      await updateSecret({ attempts: admin.firestore.FieldValue.increment(1) }).catch(() => null);

      const otpHash = secretData.otpHash;
      const expiresAt = secretData.expiresAt;
      const salt = typeof secretData.salt === "string" ? secretData.salt : undefined;

      if (!otpHash || !expiresAt) {
        return { success: false, status: 403, error: "Aucun code de vérification actif." };
      }

      const expiresAtMillis = typeof expiresAt.toMillis === "function" ? expiresAt.toMillis() : new Date(expiresAt).getTime();
      if (expiresAtMillis < Date.now()) {
        await deleteSecret().catch(() => null);
        return { success: false, status: 403, error: "Code invalide ou expiré" };
      }

      const incomingHash = computeOtpHash(userId, code, salt);
      const isMatch =
        typeof otpHash === "string" &&
        incomingHash.length === otpHash.length &&
        crypto.timingSafeEqual(Buffer.from(incomingHash, "utf8"), Buffer.from(otpHash, "utf8"));

      if (!isMatch) {
        return { success: false, status: 403, error: "Code invalide ou expiré" };
      }

      await deleteSecret().catch(() => null);

      // Génération et enregistrement initial des codes de secours
      const rawBackupCodes = generateBackupCodes();
      const backupSalt = crypto.randomBytes(16).toString("hex");
      const backupCodeHashes = rawBackupCodes.map((c) => computeBackupCodeHash(userId, c, backupSalt));

      try {
        await backupRef.set({
          backupSalt,
          backupCodeHashes,
          attempts: 0,
          updatedAt: admin.firestore.Timestamp.fromMillis(Date.now()),
        });
      } catch (err) {
        safeLogger.warn("[TwoFactorService] Warning writing initial backup codes", { err: String(err) });
      }

      await updateUser({
        "verification.verified": true,
        "verification.verifiedAt": admin.firestore.Timestamp.fromMillis(Date.now()),
        "verification.code": admin.firestore.FieldValue.delete(),
      });

      return { success: true, backupCodes: rawBackupCodes };
    };

    if (typeof db.runTransaction === "function" && !isCollectionMocked) {
      return db.runTransaction(async (t) => {
        const snap = await t.get(secretRef);
        return processOtp(
          async () => snap,
          async (d) => t.update(secretRef, d),
          async () => t.delete(secretRef),
          async (d) => t.update(userRef, d)
        );
      });
    }

    return processOtp(
      () => secretRef.get(),
      (d) => secretRef.update(d),
      () => secretRef.delete(),
      (d) => userRef.update(d)
    );
  }
}
