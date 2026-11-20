import { Router, Request, Response } from "express";
import {
  authenticateToken,
  authorizeAdmin,
  AuthenticatedRequest,
} from "../../middlewares/auth";
import { safeLogger } from "../../utils/logger";
import {
  ArtisanOfferPricingType,
  ArtisanOfferStatus,
} from "../../types/artisanOffers";
import { ArtisanOffersService } from "./services/artisanOffers.service";
import { ArtisanOffersAdminService } from "./services/artisanOffersAdmin.service";

export const artisanOffersRouter = Router();

/**
 * GET /api/v1/artisans/offers (Public Demandeur Catalog)
 */
artisanOffersRouter.get("/artisans/offers", async (req: Request, res: Response) => {
  try {
    const { q, tradeId, wilaya, commune, pricingType, maxPrice, availableOnly, sort, limit } =
      req.query;

    const offers = await ArtisanOffersService.listPublicOffers({
      q: q ? String(q) : undefined,
      tradeId: tradeId ? String(tradeId) : undefined,
      wilaya: wilaya ? String(wilaya) : undefined,
      commune: commune ? String(commune) : undefined,
      pricingType: pricingType ? (String(pricingType) as ArtisanOfferPricingType) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      availableOnly: availableOnly === "true",
      sort: sort
        ? (String(sort) as "relevance" | "rating" | "price_asc" | "price_desc" | "recent")
        : "relevance",
      limit: limit ? parseInt(String(limit), 10) : 40,
    });

    return res.json({ success: true, data: offers });
  } catch (error) {
    safeLogger.error("[artisanOffersRouter] GET /artisans/offers failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ error: "Erreur lors du chargement du catalogue d'offres" });
  }
});

/**
 * GET /api/v1/artisans/offers/:id (Public Offer Detail)
 */
artisanOffersRouter.get("/artisans/offers/:id", async (req: Request, res: Response) => {
  try {
    const offer = await ArtisanOffersService.getOfferById(req.params.id, true);
    if (!offer || offer.status !== "active") {
      return res.status(404).json({ error: "Offre de travaux introuvable ou indisponible." });
    }
    return res.json({ success: true, data: offer });
  } catch (error) {
    safeLogger.error("[artisanOffersRouter] GET /artisans/offers/:id failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ error: "Erreur lors du chargement de l'offre" });
  }
});

/**
 * GET /api/v1/artisans/me/offers (Authenticated Artisan's own offers)
 */
artisanOffersRouter.get(
  "/artisans/me/offers",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: "Authentification requise" });

      const offers = await ArtisanOffersService.listMyOffers(uid);
      return res.json({ success: true, data: offers });
    } catch (error) {
      safeLogger.error("[artisanOffersRouter] GET /artisans/me/offers failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Impossible de charger vos offres" });
    }
  }
);

/**
 * POST /api/v1/artisans/me/offers (Artisan publishes a new offer)
 */
artisanOffersRouter.post(
  "/artisans/me/offers",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: "Authentification requise" });

      const { title, tradeId, tradeName, description, pricingType, wilaya } = req.body;
      if (!title || !tradeId || !tradeName || !description || !pricingType || !wilaya) {
        return res.status(400).json({
          error: "Champs requis manquants (titre, métier, description, tarification, wilaya).",
        });
      }

      const result = await ArtisanOffersService.createOffer(uid, req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error || "Création impossible" });
      }
      return res.status(201).json({ success: true, data: result.offer });
    } catch (error) {
      safeLogger.error("[artisanOffersRouter] POST /artisans/me/offers failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors de la création de l'offre" });
    }
  }
);

/**
 * PUT /api/v1/artisans/me/offers/:id (Artisan edits their own offer)
 */
artisanOffersRouter.put(
  "/artisans/me/offers/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: "Authentification requise" });

      const result = await ArtisanOffersService.updateOffer(uid, req.params.id, req.body);
      if (!result.success) {
        const statusCode = result.error?.includes("Accès refusé") ? 403 : 400;
        return res.status(statusCode).json({ error: result.error || "Mise à jour impossible" });
      }
      return res.json({ success: true, data: result.offer });
    } catch (error) {
      safeLogger.error("[artisanOffersRouter] PUT /artisans/me/offers/:id failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors de la mise à jour de l'offre" });
    }
  }
);

/**
 * DELETE /api/v1/artisans/me/offers/:id (Artisan deletes their own offer)
 */
artisanOffersRouter.delete(
  "/artisans/me/offers/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: "Authentification requise" });

      const result = await ArtisanOffersService.deleteOffer(uid, req.params.id);
      if (!result.success) {
        const statusCode = result.error?.includes("Accès refusé") ? 403 : 400;
        return res.status(statusCode).json({ error: result.error || "Suppression impossible" });
      }
      return res.json({ success: true, data: { deletedId: req.params.id } });
    } catch (error) {
      safeLogger.error("[artisanOffersRouter] DELETE /artisans/me/offers/:id failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors de la suppression de l'offre" });
    }
  }
);

/**
 * GET /api/v1/artisans/admin/offers (Admin moderation queue)
 */
artisanOffersRouter.get(
  "/artisans/admin/offers",
  authenticateToken,
  authorizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status, tradeId, search, limit } = req.query;
      const offers = await ArtisanOffersAdminService.listAllOffers({
        status: status ? (String(status) as ArtisanOfferStatus | "all") : "all",
        tradeId: tradeId ? String(tradeId) : undefined,
        search: search ? String(search) : undefined,
        limit: limit ? parseInt(String(limit), 10) : 120,
      });
      return res.json({ success: true, data: offers });
    } catch (error) {
      safeLogger.error("[artisanOffersRouter] GET /artisans/admin/offers failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors du chargement des offres (Admin)" });
    }
  }
);

/**
 * PUT /api/v1/artisans/admin/offers/:id/status (Admin approves/rejects/pauses offer)
 */
artisanOffersRouter.put(
  "/artisans/admin/offers/:id/status",
  authenticateToken,
  authorizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status, reason } = req.body;
      if (!status || !["active", "paused", "rejected", "pending_review"].includes(status)) {
        return res.status(400).json({ error: "Statut de modération invalide." });
      }

      const result = await ArtisanOffersAdminService.moderateOffer(
        req.user?.uid || "admin",
        req.user?.email || "admin@olmart.dz",
        req.params.id,
        status as ArtisanOfferStatus,
        reason
      );

      if (!result.success) {
        return res.status(400).json({ error: result.error || "Modération impossible" });
      }
      return res.json({ success: true, data: { id: req.params.id, status } });
    } catch (error) {
      safeLogger.error("[artisanOffersRouter] PUT /artisans/admin/offers/:id/status failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors de la modération de l'offre" });
    }
  }
);
