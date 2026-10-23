import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth";
import { autoPartsService } from "./autoParts.service";
import { autoPartFilterSchema, createAutoPartSchema } from "./autoParts.validation";
import { safeLogger } from "../../utils/logger";

export const autoPartsController = {
  async listParts(req: Request, res: Response) {
    try {
      const parsed = autoPartFilterSchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Filtres invalides", details: parsed.error.format() });
      }
      const data = await autoPartsService.listParts(parsed.data);
      return res.json({ success: true, ...data });
    } catch (e) {
      safeLogger.error("[AutoPartsController] listParts error", { err: String(e) });
      return res.status(500).json({ error: "Erreur serveur lors de la récupération des pièces" });
    }
  },

  async getPartById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const part = await autoPartsService.getPartById(id);
      if (!part) {
        return res.status(404).json({ error: "Pièce détachée introuvable" });
      }
      return res.json({ success: true, data: part });
    } catch (e) {
      safeLogger.error("[AutoPartsController] getPartById error", { err: String(e) });
      return res.status(500).json({ error: "Erreur serveur" });
    }
  },

  async revealPartContact(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const contact = await autoPartsService.revealPartContact(id);
      if (!contact) {
        return res.status(404).json({ error: "Pièce introuvable ou contact non disponible" });
      }
      return res.json({ success: true, data: contact });
    } catch (e) {
      safeLogger.error("[AutoPartsController] revealPartContact error", { err: String(e) });
      return res.status(500).json({ error: "Erreur serveur" });
    }
  },

  async createPart(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({ error: "Authentification requise" });
      }
      const parsed = createAutoPartSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Données de pièce invalides", details: parsed.error.format() });
      }
      const sellerName = req.user.email?.split("@")[0] || "Vendeur Olma";
      const result = await autoPartsService.createPart(req.user.uid, sellerName, parsed.data);
      return res.status(201).json({ success: true, data: result });
    } catch (e) {
      safeLogger.error("[AutoPartsController] createPart error", { err: String(e) });
      return res.status(500).json({ error: "Erreur serveur lors de la publication" });
    }
  },
};
