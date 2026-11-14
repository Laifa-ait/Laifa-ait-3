import crypto from "crypto";
import { getCsrfSecret } from "../middlewares/csrf";
import type { CustomPageSection, StoreConfig, StoreCustomPageItem } from "../domains/seller/customPage.types";

/**
 * A16 — Liste blanche positive des statuts de produits autorisés sur la vitrine publique.
 */
export const PUBLISHABLE_PRODUCT_STATUSES = new Set(["active", "approved", "published"]);

export function isPubliclyVisibleProductStatus(rawStatus: unknown): boolean {
  if (typeof rawStatus !== "string") return false;
  return PUBLISHABLE_PRODUCT_STATUSES.has(rawStatus.trim().toLowerCase());
}

/**
 * B2 — Résolution centralisée et déterministe des images d'un produit (`image` et `images[]`).
 */
export function resolveProductImagesList(rawProduct: Record<string, unknown> | null | undefined): string[] {
  if (!rawProduct || typeof rawProduct !== "object") return [];
  const results: string[] = [];
  if (typeof rawProduct.image === "string" && rawProduct.image.trim()) results.push(rawProduct.image.trim());
  if (Array.isArray(rawProduct.images)) {
    for (const item of rawProduct.images) {
      if (typeof item === "string" && item.trim() && !results.includes(item.trim())) results.push(item.trim());
    }
  }
  return results;
}

export function resolveProductPrimaryImage(rawProduct: Record<string, unknown> | null | undefined, fallback = ""): string {
  return resolveProductImagesList(rawProduct)[0] ?? fallback;
}

function parseTimestampMs(rawExp: unknown): number {
  if (!rawExp) return NaN;
  if (typeof (rawExp as { toMillis?: () => number }).toMillis === "function") return (rawExp as { toMillis: () => number }).toMillis();
  if (typeof rawExp === "string" || typeof rawExp === "number") return new Date(rawExp).getTime();
  return NaN;
}

/**
 * A14 — Évaluation stricte de l'abonnement Studio payé à partir des sources serveur vérifiées.
 */
export function evaluatePaidStudioSubscription(
  userData: Record<string, unknown> | null | undefined,
  subscriptionDocs: Array<Record<string, unknown>>
): boolean {
  const nowMs = Date.now();
  if (userData && typeof userData === "object") {
    const subStatus = typeof userData.subscriptionStatus === "string" ? userData.subscriptionStatus.trim().toLowerCase() : "";
    if (subStatus === "active" || subStatus === "paid" || subStatus === "granted") {
      const expMs = parseTimestampMs(userData.subscriptionExpiresAt);
      if (Number.isNaN(expMs) || expMs > nowMs) return true;
    }
  }
  for (const doc of subscriptionDocs) {
    if (!doc || typeof doc !== "object") continue;
    const status = typeof doc.status === "string" ? doc.status.trim().toLowerCase() : "";
    if (status !== "payment_confirmed" && status !== "granted" && status !== "active") continue;
    const expMs = parseTimestampMs(doc.expiresAt ?? doc.validUntil);
    if (!Number.isNaN(expMs) && expMs <= nowMs) continue;
    const planSnapshot = doc.planSnapshot as { price?: unknown } | undefined;
    const price = Number(planSnapshot?.price ?? doc.amount ?? 0);
    if (status === "granted" || price > 0) return true;
  }
  return false;
}

/**
 * A12 — Protection VIP par mot de passe de bout en bout (Tokens HMAC liés à la boutique + Anti-Bruteforce).
 */
function getVipHmacSecret(): string {
  const configured = (process.env.STUDIO_VIP_TOKEN_SECRET || "").trim();
  if (configured.length >= 32) {
    return configured;
  }
  if (process.env.NODE_ENV === "production" && !process.env.CSRF_SECRET) {
    throw new Error("STUDIO_VIP_TOKEN_SECRET or CSRF_SECRET is required in production");
  }
  return configured || getCsrfSecret();
}

const DEFAULT_VIP_TTL_MS = 2 * 60 * 60 * 1000;
const MAX_VIP_ATTEMPTS = 5;
const VIP_LOCKOUT_WINDOW_MS = 10 * 60 * 1000;

interface VipAttemptRecord { count: number; firstAttemptAt: number; }
const vipAttemptStore = new Map<string, VipAttemptRecord>();

function purgeExpiredVipAttempts(now: number): void {
  for (const [k, rec] of vipAttemptStore.entries()) {
    if (now - rec.firstAttemptAt > VIP_LOCKOUT_WINDOW_MS) {
      vipAttemptStore.delete(k);
    }
  }
}

function getStorePasswordSecret(config: StoreConfig | null | undefined): string {
  if (!config?.storeStatus) return "";
  return config.storeStatus.passwordProtectionCode?.trim() || config.storeStatus.storefrontPassword?.trim() || "";
}

export function isStorePasswordLocked(config: StoreConfig | null | undefined): boolean {
  if (!config?.storeStatus) return false;
  return config.storeStatus.mode === "password" && getStorePasswordSecret(config).length > 0;
}

function computePasswordFingerprint(secret: string): string {
  return crypto.createHash("sha256").update(secret, "utf8").digest("hex").slice(0, 16);
}

export function issueStoreVipAccessToken(
  sellerId: string,
  storedConfig: StoreConfig,
  ttlMs = DEFAULT_VIP_TTL_MS
): { token: string; expiresAt: number } | null {
  const secret = getStorePasswordSecret(storedConfig);
  if (!sellerId || !secret) return null;
  const expiresAt = Date.now() + Math.max(1000, ttlMs);
  const pwdFp = computePasswordFingerprint(secret);
  const payload = `${sellerId}:${expiresAt}:${pwdFp}`;
  const sig = crypto.createHmac("sha256", getVipHmacSecret()).update(payload, "utf8").digest("hex");
  const token = Buffer.from(`${payload}:${sig}`, "utf8").toString("base64url");
  return { token, expiresAt };
}

export function verifyStoreVipAccessToken(
  token: string | undefined | null,
  sellerId: string,
  storedConfig: StoreConfig
): boolean {
  if (!token || typeof token !== "string" || !sellerId) return false;
  const secret = getStorePasswordSecret(storedConfig);
  if (!secret) return true;
  try {
    const trimmedToken = token.trim();
    const decoded = Buffer.from(trimmedToken, "base64url").toString("utf8");
    if (Buffer.from(decoded, "utf8").toString("base64url") !== trimmedToken) return false;
    const parts = decoded.split(":");
    if (parts.length !== 4) return false;
    const [tokenSellerId, expStr, tokenPwdFp, providedSig] = parts;
    if (tokenSellerId !== sellerId) return false;
    const expiresAt = Number(expStr);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
    if (tokenPwdFp !== computePasswordFingerprint(secret)) return false;
    const payload = `${tokenSellerId}:${expStr}:${tokenPwdFp}`;
    const expectedSig = crypto.createHmac("sha256", getVipHmacSecret()).update(payload, "utf8").digest("hex");
    const a = Buffer.from(providedSig, "utf8");
    const b = Buffer.from(expectedSig, "utf8");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function checkAndRecordVipAttempt(clientKey: string, sellerId: string): { allowed: boolean; retryAfterSec: number } {
  const key = `${sellerId}::${clientKey || "anon"}`;
  const now = Date.now();
  purgeExpiredVipAttempts(now);
  const existing = vipAttemptStore.get(key);
  if (!existing || now - existing.firstAttemptAt > VIP_LOCKOUT_WINDOW_MS) {
    vipAttemptStore.set(key, { count: 1, firstAttemptAt: now });
    return { allowed: true, retryAfterSec: 0 };
  }
  if (existing.count >= MAX_VIP_ATTEMPTS) {
    const remainingMs = Math.max(1000, VIP_LOCKOUT_WINDOW_MS - (now - existing.firstAttemptAt));
    return { allowed: false, retryAfterSec: Math.ceil(remainingMs / 1000) };
  }
  existing.count += 1;
  vipAttemptStore.set(key, existing);
  return { allowed: true, retryAfterSec: 0 };
}

export function resetVipAttempts(clientKey: string, sellerId: string): void {
  vipAttemptStore.delete(`${sellerId}::${clientKey || "anon"}`);
}

export function clearAllVipAttemptsForTesting(): void {
  vipAttemptStore.clear();
}

/**
 * A13 — Extraction exhaustive de tous les identifiants de produits référencés.
 */
export function extractAllReferencedProductIds(sections: CustomPageSection[], customPages?: StoreCustomPageItem[]): string[] {
  const ids = new Set<string>();
  const addId = (raw: unknown) => { if (typeof raw === "string" && raw.trim()) ids.add(raw.trim()); };
  for (const sec of Array.isArray(sections) ? sections : []) {
    if (!sec || typeof sec.settings !== "object" || !sec.settings) continue;
    const settings = sec.settings as Record<string, unknown>;
    if (Array.isArray(settings.productIds)) settings.productIds.forEach(addId);
    addId(settings.spotlightProductId);
    if (Array.isArray(settings.hotspots)) {
      for (const hs of settings.hotspots) {
        if (hs && typeof hs === "object") addId((hs as { productId?: unknown }).productId);
      }
    }
    for (const listKey of ["collections", "categories"] as const) {
      const list = settings[listKey];
      if (!Array.isArray(list)) continue;
      for (const entry of list) {
        if (entry && typeof entry === "object" && Array.isArray((entry as { productIds?: unknown[] }).productIds)) {
          (entry as { productIds: unknown[] }).productIds.forEach(addId);
        }
      }
    }
  }
  for (const page of Array.isArray(customPages) ? customPages : []) {
    if (page && Array.isArray(page.productIds)) page.productIds.forEach(addId);
  }
  return Array.from(ids);
}
