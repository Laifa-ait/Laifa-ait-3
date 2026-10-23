import { Router, Response } from "express";
import { authenticateToken, authorizeSeller, AuthenticatedRequest } from "../../../middlewares/auth";
import { validateRequest } from "../../../middlewares/validation";
import { StoreLayoutService } from "../services/storeLayout.service";
import {
  storeConfigSchema,
  saveDraftLayoutSchema,
  publishLayoutSchema,
  rollbackLayoutSchema,
} from "../validators/storeLayout.schema";
import { safeLogger } from "../../../utils/logger";

const router = Router();

// GET /api/v1/seller/studio
router.get("/api/v1/seller/studio", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellerId = req.user?.uid;
    if (!sellerId) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const data = await StoreLayoutService.getOrInitStudioData(sellerId);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur interne lors du chargement du Studio";
    safeLogger.error("[SellerStudioController] GET /studio error", { error: msg });
    return res.status(500).json({ error: msg });
  }
});

// PUT /api/v1/seller/store/config
router.put(
  "/api/v1/seller/store/config",
  authenticateToken,
  authorizeSeller,
  validateRequest(storeConfigSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user?.uid;
      if (!sellerId) {
        return res.status(401).json({ error: "Non authentifié" });
      }

      const updatedConfig = await StoreLayoutService.updateStoreConfig(sellerId, req.body);
      return res.json({ success: true, data: updatedConfig });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erreur lors de la mise à jour de la boutique";
      safeLogger.error("[SellerStudioController] PUT /store/config error", { error: msg });
      const statusCode = msg.includes("déjà utilisé") ? 409 : 400;
      return res.status(statusCode).json({ error: msg });
    }
  }
);

// PATCH /api/v1/seller/store/profile (Atomically updates store config, users, and publicProfiles via backend)
router.patch(
  "/api/v1/seller/store/profile",
  authenticateToken,
  authorizeSeller,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user?.uid;
      if (!sellerId) {
        return res.status(401).json({ error: "Non authentifié" });
      }

      const { shopName, shopDescription, wilaya, commune, logoUrl, bannerUrl, legalStatus, avgPreparationTime, returnPolicy } = req.body;
      const updatedConfig = await StoreLayoutService.updateStoreConfig(sellerId, {
        ...(shopName ? { shopName } : {}),
        ...(shopDescription !== undefined ? { shopDescription } : {}),
        ...(wilaya !== undefined ? { wilaya } : {}),
        ...(commune !== undefined ? { commune } : {}),
        ...(logoUrl !== undefined ? { logoUrl } : {}),
        ...(bannerUrl !== undefined ? { bannerUrl } : {}),
        ...(legalStatus !== undefined ? { legalStatus } : {}),
        ...(avgPreparationTime !== undefined ? { avgPreparationTime } : {}),
        ...(returnPolicy !== undefined ? { returnPolicy } : {}),
      });

      return res.json({ success: true, data: updatedConfig });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erreur de mise à jour du profil boutique";
      safeLogger.error("[SellerStudioController] PATCH /store/profile error", { error: msg });
      return res.status(400).json({ error: msg });
    }
  }
);

// PUT /api/v1/seller/studio/layout/draft
router.put(
  "/api/v1/seller/studio/layout/draft",
  authenticateToken,
  authorizeSeller,
  validateRequest(saveDraftLayoutSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user?.uid;
      if (!sellerId) {
        return res.status(401).json({ error: "Non authentifié" });
      }

      const savedDraft = await StoreLayoutService.saveDraftLayout(sellerId, req.body.sections);
      return res.json({ success: true, data: savedDraft });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erreur lors de la sauvegarde du brouillon";
      safeLogger.error("[SellerStudioController] PUT /layout/draft error", { error: msg });
      const statusCode = msg.includes("Violation d'accès") || msg.includes("introuvable") ? 403 : 400;
      return res.status(statusCode).json({ error: msg });
    }
  }
);

// POST /api/v1/seller/studio/layout/publish
router.post(
  "/api/v1/seller/studio/layout/publish",
  authenticateToken,
  authorizeSeller,
  validateRequest(publishLayoutSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user?.uid;
      if (!sellerId) {
        return res.status(401).json({ error: "Non authentifié" });
      }

      const publishedLayout = await StoreLayoutService.publishLayout(sellerId, req.body.changeSummary);
      return res.json({ success: true, data: publishedLayout });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erreur lors de la publication";
      safeLogger.error("[SellerStudioController] POST /layout/publish error", { error: msg });
      return res.status(400).json({ error: msg });
    }
  }
);

// POST /api/v1/seller/studio/layout/rollback
router.post(
  "/api/v1/seller/studio/layout/rollback",
  authenticateToken,
  authorizeSeller,
  validateRequest(rollbackLayoutSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user?.uid;
      if (!sellerId) {
        return res.status(401).json({ error: "Non authentifié" });
      }

      const restoredLayout = await StoreLayoutService.rollbackLayout(sellerId, req.body.versionNumber);
      return res.json({ success: true, data: restoredLayout });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erreur lors de la restauration";
      safeLogger.error("[SellerStudioController] POST /layout/rollback error", { error: msg });
      const statusCode = msg.includes("introuvable") ? 404 : 400;
      return res.status(statusCode).json({ error: msg });
    }
  }
);

export default router;
