import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth";
import { autoAdminService } from "./autoAdmin.service";
import { safeLogger } from "../../utils/logger";

export const autoAdminController = {
  async getPending(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await autoAdminService.listPendingModeration();
      return res.json({ success: true, ...data });
    } catch (e) {
      safeLogger.error("[AutoAdminController] getPending error", { err: String(e) });
      return res.status(500).json({ error: "Erreur lors de la récupération des annonces en attente" });
    }
  },

  async approve(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const adminUid = req.user?.uid || "admin";
      await autoAdminService.approveListing(adminUid, id);
      return res.json({ success: true, message: "Annonce approuvée et publiée avec succès" });
    } catch (e) {
      safeLogger.error("[AutoAdminController] approve error", { err: String(e) });
      return res.status(400).json({ error: e instanceof Error ? e.message : "Erreur lors de l'approbation" });
    }
  },

  async reject(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      if (!reason || typeof reason !== "string" || !reason.trim()) {
        return res.status(400).json({ error: "Un motif de rejet explicite est obligatoire" });
      }
      const adminUid = req.user?.uid || "admin";
      await autoAdminService.rejectListing(adminUid, id, reason.trim());
      return res.json({ success: true, message: "Annonce rejetée avec notification du motif" });
    } catch (e) {
      safeLogger.error("[AutoAdminController] reject error", { err: String(e) });
      return res.status(400).json({ error: e instanceof Error ? e.message : "Erreur lors du rejet" });
    }
  },

  async toggleVerified(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { isVerified } = req.body;
      const adminUid = req.user?.uid || "admin";
      await autoAdminService.toggleVerifiedBadge(adminUid, id, Boolean(isVerified));
      return res.json({ success: true, message: "Statut de vérification mis à jour" });
    } catch (e) {
      safeLogger.error("[AutoAdminController] toggleVerified error", { err: String(e) });
      return res.status(500).json({ error: "Erreur serveur" });
    }
  },

  async getReports(req: AuthenticatedRequest, res: Response) {
    try {
      const reports = await autoAdminService.listReports();
      return res.json({ success: true, reports });
    } catch (e) {
      safeLogger.error("[AutoAdminController] getReports error", { err: String(e) });
      return res.status(500).json({ error: "Erreur lors de la récupération des signalements" });
    }
  },

  async dismissReport(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const adminUid = req.user?.uid || "admin";
      await autoAdminService.dismissReport(adminUid, id);
      return res.json({ success: true, message: "Signalement classé sans suite" });
    } catch (e) {
      safeLogger.error("[AutoAdminController] dismissReport error", { err: String(e) });
      return res.status(500).json({ error: "Erreur serveur" });
    }
  },
};
