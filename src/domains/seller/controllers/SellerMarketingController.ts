import { Router, Response } from "express";
import { authenticateToken, authorizeSeller, AuthenticatedRequest } from "../../../middlewares/auth";
import { SellerMarketingService } from "../services/sellerMarketing.service";

const router = Router();

// GET marketing overview (KPIs, Ad spots, events log)
router.get(
  "/api/v1/seller/marketing/overview",
  authenticateToken,
  authorizeSeller,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user!.uid;
      const data = await SellerMarketingService.getSellerMarketingOverview(sellerId);
      return res.json({ success: true, data });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur chargement marketing";
      return res.status(500).json({ error: msg });
    }
  }
);

// GET seller promo campaigns
router.get(
  "/api/v1/seller/marketing/promos",
  authenticateToken,
  authorizeSeller,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user!.uid;
      const promos = await SellerMarketingService.listPromoCampaigns(sellerId);
      return res.json({ success: true, promos });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur récupération promotions";
      return res.status(500).json({ error: msg });
    }
  }
);

// POST create promo campaign
router.post(
  "/api/v1/seller/marketing/promos",
  authenticateToken,
  authorizeSeller,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user!.uid;
      const { title, description, discountType, discountValue, bannerUrl, productIds, startDate, endDate } = req.body;

      if (!title || !discountType || discountValue == null || !productIds || !startDate || !endDate) {
        return res.status(400).json({ error: "Tous les champs obligatoires doivent être renseignés." });
      }

      const campaign = await SellerMarketingService.createPromoCampaign(sellerId, {
        title,
        description,
        discountType,
        discountValue,
        bannerUrl,
        productIds,
        startDate,
        endDate,
      });

      return res.status(201).json({ success: true, message: "Campagne promotionnelle créée avec succès", campaign });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur création promotion";
      const status = (err as { statusCode?: number }).statusCode || 400;
      return res.status(status).json({ error: msg });
    }
  }
);

// DELETE promo campaign
router.delete(
  "/api/v1/seller/marketing/promos/:id",
  authenticateToken,
  authorizeSeller,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user!.uid;
      await SellerMarketingService.deletePromoCampaign(sellerId, req.params.id);
      return res.json({ success: true, message: "Campagne promotionnelle supprimée." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur suppression promotion";
      const status = (err as { statusCode?: number }).statusCode || 400;
      return res.status(status).json({ error: msg });
    }
  }
);

export default router;
