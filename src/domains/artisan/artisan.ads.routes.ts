import { Router, Response } from "express";
import {
  authenticateToken,
  authorizeAdmin,
  AuthenticatedRequest,
} from "../../middlewares/auth";
import { safeLogger } from "../../utils/logger";
import { ArtisanServiceLayer } from "./artisan.service";
import {
  ArtisanAdsService,
  computeArtisanQualityBreakdown,
} from "./services/artisanAds.service";
import { ArtisanAdsAdminService } from "./services/artisanAdsAdmin.service";
import {
  ArtisanAdStatus,
  INDIVIDUAL_ARTISAN_AD_PACKS,
} from "../../types/artisanAds";

export const artisanAdsRouter = Router();

/**
 * GET /api/v1/artisans/ads/packs
 */
artisanAdsRouter.get("/artisans/ads/packs", (_req, res: Response) => {
  return res.json({ success: true, data: INDIVIDUAL_ARTISAN_AD_PACKS });
});

/**
 * GET /api/v1/artisans/ads/feed
 */
artisanAdsRouter.get("/artisans/ads/feed", async (req, res: Response) => {
  try {
    const tradeId = req.query.tradeId ? String(req.query.tradeId) : undefined;
    const wilaya = req.query.wilaya ? String(req.query.wilaya) : undefined;
    const urgencyOnly = req.query.urgency === "true";

    const feed = await ArtisanAdsService.getSponsoredFeed({
      tradeId,
      wilaya,
      urgencyOnly,
    });
    return res.json({ success: true, data: feed });
  } catch (error) {
    safeLogger.error("[artisanAdsRouter] GET /artisans/ads/feed failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ error: "Erreur lors du chargement des emplacements sponsorisés" });
  }
});

/**
 * POST /api/v1/artisans/ads/events
 */
artisanAdsRouter.post("/artisans/ads/events", async (req, res: Response) => {
  try {
    const { campaignId, eventType } = req.body as {
      campaignId?: string;
      eventType?: "impression" | "click" | "lead";
    };

    if (!campaignId || !["impression", "click", "lead"].includes(String(eventType))) {
      return res.status(400).json({ error: "Paramètres d'événement publicitaire invalides" });
    }

    await ArtisanAdsService.recordEvent(campaignId, eventType as "impression" | "click" | "lead");
    return res.json({ success: true, data: { recorded: true } });
  } catch (error) {
    safeLogger.warn("[artisanAdsRouter] POST /artisans/ads/events failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ error: "Erreur lors de l'enregistrement de l'événement" });
  }
});

/**
 * GET /api/v1/artisans/ads/my-campaigns
 */
artisanAdsRouter.get(
  "/artisans/ads/my-campaigns",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: "Utilisateur non authentifié" });

      const profile = await ArtisanServiceLayer.getArtisanByUserId(uid);
      if (!profile) {
        return res.status(404).json({ error: "Aucun profil artisan trouvé" });
      }

      const campaigns = await ArtisanAdsService.listMyCampaigns(uid);
      const quality = computeArtisanQualityBreakdown(profile);

      return res.json({
        success: true,
        data: {
          campaigns,
          quality,
          packs: INDIVIDUAL_ARTISAN_AD_PACKS,
        },
      });
    } catch (error) {
      safeLogger.error("[artisanAdsRouter] GET /artisans/ads/my-campaigns failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors du chargement de vos campagnes" });
    }
  }
);

/**
 * POST /api/v1/artisans/ads/campaigns
 */
artisanAdsRouter.post(
  "/artisans/ads/campaigns",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: "Utilisateur non authentifié" });

      const profile = await ArtisanServiceLayer.getArtisanByUserId(uid);
      if (!profile) {
        return res.status(404).json({ error: "Créez d'abord votre profil artisan" });
      }

      const { packId, targetWilayas, headline, paymentReference } = req.body as {
        packId?: string;
        targetWilayas?: string[];
        headline?: string;
        paymentReference?: string;
      };

      if (!packId) {
        return res.status(400).json({ error: "Veuillez sélectionner un pack publicitaire" });
      }

      const result = await ArtisanAdsService.createArtisanBoostCampaign(uid, profile, {
        packId,
        targetWilayas: Array.isArray(targetWilayas) ? targetWilayas : [profile.wilaya],
        headline,
        paymentReference,
      });

      if (!result.success) {
        return res.status(400).json({ error: result.error || "Impossible de créer la campagne" });
      }

      return res.status(201).json({ success: true, data: result.data });
    } catch (error) {
      safeLogger.error("[artisanAdsRouter] POST /artisans/ads/campaigns failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors de la création de la campagne" });
    }
  }
);

/**
 * PUT /api/v1/artisans/ads/campaigns/:id/toggle
 */
artisanAdsRouter.put(
  "/artisans/ads/campaigns/:id/toggle",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: "Utilisateur non authentifié" });

      const result = await ArtisanAdsService.toggleOwnCampaign(uid, req.params.id);
      if (!result.success) {
        return res.status(400).json({ error: result.error || "Action non autorisée" });
      }
      return res.json({ success: true, data: { status: result.status } });
    } catch (error) {
      safeLogger.error("[artisanAdsRouter] PUT /artisans/ads/campaigns/:id/toggle failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors de la mise à jour de la campagne" });
    }
  }
);

/**
 * ADMIN: GET /api/v1/artisans/admin/ads
 */
artisanAdsRouter.get(
  "/artisans/admin/ads",
  authenticateToken,
  authorizeAdmin,
  async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await ArtisanAdsAdminService.listAll();
      return res.json({ success: true, data: result });
    } catch (error) {
      safeLogger.error("[artisanAdsRouter] GET /artisans/admin/ads failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors du chargement des campagnes publicitaires" });
    }
  }
);

/**
 * ADMIN: POST /api/v1/artisans/admin/ads
 */
artisanAdsRouter.post(
  "/artisans/admin/ads",
  authenticateToken,
  authorizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const adminUid = req.user?.uid || "admin";
      const body = req.body;
      if (!body.advertiserName || !body.title || !body.targetUrl || !body.format) {
        return res.status(400).json({
          error: "Annonceur, titre, format et lien de destination sont obligatoires",
        });
      }

      const result = await ArtisanAdsAdminService.createSponsorAd(adminUid, body);
      if (!result.success) {
        return res.status(400).json({ error: result.error || "Erreur lors de la création" });
      }
      return res.status(201).json({ success: true, data: result.data });
    } catch (error) {
      safeLogger.error("[artisanAdsRouter] POST /artisans/admin/ads failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors de la création de la publicité" });
    }
  }
);

/**
 * ADMIN: PUT /api/v1/artisans/admin/ads/:id/status
 */
artisanAdsRouter.put(
  "/artisans/admin/ads/:id/status",
  authenticateToken,
  authorizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status } = req.body as { status?: ArtisanAdStatus };
      if (!status || !["pending_payment", "active", "paused", "ended", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Statut publicitaire invalide" });
      }

      const result = await ArtisanAdsAdminService.updateStatus(req.params.id, status);
      if (!result.success) {
        return res.status(404).json({ error: result.error || "Campagne introuvable" });
      }
      return res.json({ success: true, data: { status } });
    } catch (error) {
      safeLogger.error("[artisanAdsRouter] PUT /artisans/admin/ads/:id/status failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors de la mise à jour du statut" });
    }
  }
);
