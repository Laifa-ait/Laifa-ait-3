import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth";
import { autoService } from "./auto.service";
import {
  createVehicleListingSchema,
  updateVehicleListingSchema,
  vehicleFilterSchema,
  vehicleStatusTransitionSchema,
  vehicleReportSchema,
} from "./auto.validation";

export const autoController = {
  async getPublicListings(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const parsedFilters = vehicleFilterSchema.parse(req.query);
      const result = await autoService.listPublicVehicles(parsedFilters);
      return res.status(200).json({ success: true, data: result });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la récupération des annonces";
      return res.status(400).json({ success: false, error: msg });
    }
  },

  async getPublicListingById(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const listing = await autoService.getPublicVehicleById(id);
      if (!listing) {
        return res.status(404).json({ success: false, error: "Annonce introuvable ou indisponible" });
      }
      return res.status(200).json({ success: true, data: listing });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la récupération de l'annonce";
      return res.status(500).json({ success: false, error: msg });
    }
  },

  async createListing(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({ success: false, error: "Authentification requise pour publier une annonce" });
      }
      const validated = createVehicleListingSchema.parse(req.body);
      const sellerDisplayName =
        (typeof req.user.displayName === "string" && req.user.displayName) ||
        req.user.email?.split("@")[0] ||
        "Vendeur Olma";
      const result = await autoService.createVehicle(req.user.uid, sellerDisplayName, validated);
      return res.status(201).json({ success: true, data: result });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Données d'annonce invalides";
      return res.status(400).json({ success: false, error: msg });
    }
  },

  async updateListing(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({ success: false, error: "Authentification requise" });
      }
      const id = req.params.id;
      const validated = updateVehicleListingSchema.parse(req.body);
      const isAdmin = Boolean(req.user.admin || req.user.role === "admin");
      await autoService.updateVehicle(id, req.user.uid, isAdmin, validated);
      return res.status(200).json({ success: true, message: "Annonce mise à jour avec succès" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur de mise à jour";
      if (msg.includes("ACCÈS_INTERDIT")) {
        return res.status(403).json({ success: false, error: msg });
      }
      return res.status(400).json({ success: false, error: msg });
    }
  },

  async changeStatus(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({ success: false, error: "Authentification requise" });
      }
      const id = req.params.id;
      const { targetStatus, rejectionReason } = vehicleStatusTransitionSchema.parse(req.body);
      const isAdmin = Boolean(req.user.admin || req.user.role === "admin");
      await autoService.transitionStatus(id, req.user.uid, isAdmin, targetStatus, rejectionReason);
      return res.status(200).json({ success: true, message: `Statut mis à jour vers ${targetStatus}` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur de transition";
      if (msg.includes("TRANSITION_ILLÉGALE")) {
        return res.status(400).json({ success: false, error: msg });
      }
      return res.status(500).json({ success: false, error: msg });
    }
  },

  async revealContact(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const requesterUid = req.user?.uid;
      const contact = await autoService.revealContact(id, requesterUid);
      return res.status(200).json({ success: true, data: contact });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Impossible de dévoiler le contact";
      return res.status(400).json({ success: false, error: msg });
    }
  },

  async reportListing(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({ success: false, error: "Authentification requise pour signaler une annonce" });
      }
      const id = req.params.id;
      const report = vehicleReportSchema.parse(req.body);
      await autoService.reportListing(id, req.user.uid, { listingId: id, ...report });
      return res.status(200).json({ success: true, message: "Signalement transmis à l'équipe de modération" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Données de signalement invalides";
      return res.status(400).json({ success: false, error: msg });
    }
  },

  async getMyListings(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({ success: false, error: "Authentification requise" });
      }
      const listings = await autoService.listSellerVehicles(req.user.uid);
      return res.status(200).json({ success: true, data: listings });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la récupération de vos annonces";
      return res.status(500).json({ success: false, error: msg });
    }
  },
};
