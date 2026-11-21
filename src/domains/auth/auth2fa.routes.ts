import { Router, Response } from "express";
import { authenticateToken } from "../../middlewares/auth";
import { pinLimiter } from "../../middlewares/rateLimiters";
import { safeLogger } from "../../utils/logger";
import {
  TwoFactorService,
  computeOtpHash,
  computeBackupCodeHash,
} from "./services/twoFactor.service";

export { TwoFactorService, computeOtpHash, computeBackupCodeHash };

const router = Router();

interface Authenticated2FARequest extends Express.Request {
  user?: {
    uid?: string;
    role?: string;
    email?: string;
    [key: string]: unknown;
  };
  body: {
    code?: string;
    [key: string]: unknown;
  };
}

router.post(
  "/send-code",
  pinLimiter,
  authenticateToken,
  async (req: Authenticated2FARequest, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    try {
      await TwoFactorService.sendCode(userId, req.user?.email);
      safeLogger.info("2FA verification code dispatched", { userId });
      return res.json({ success: true, method: "email" });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error("2FA send code error", { userId, err: errorMsg });
      return res.status(500).json({ error: "Une erreur interne est survenue lors de l'envoi du code 2FA." });
    }
  }
);

router.post(
  "/verify",
  pinLimiter,
  authenticateToken,
  async (req: Authenticated2FARequest, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const { code } = req.body;

    if (
      !code ||
      typeof code !== "string" ||
      (!/^\d{6}$/.test(code) && !/^OLM-[A-Z0-9]{6}$/i.test(code.trim()))
    ) {
      return res.status(400).json({ error: "Code requis et doit être un format de 6 chiffres." });
    }

    try {
      const result = await TwoFactorService.verifyCode(userId, code);
      if (!result.success) {
        return res.status(result.status || 400).json({ error: result.error });
      }

      return res.json({ success: true, backupCodes: result.backupCodes });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error("2FA verify code error", { userId, err: errorMsg });
      return res.status(500).json({ error: "Une erreur interne est survenue lors de la vérification du code 2FA." });
    }
  }
);

export default router;
