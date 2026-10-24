import { Router, Response } from "express";
import { authenticateToken, authorizeSeller, AuthenticatedRequest } from "../../../middlewares/auth";
import { safeLogger } from "../../../utils/logger";
import {
  getSellerSubscriptionStatus,
  getPublicPlans,
  createSubscriptionRequest,
  getSellerRequestHistory
} from "../services/sellerSubscription.service";

const router = Router();

// Obtenir le statut d'abonnement du vendeur connecté et ses limites
router.get(
  "/api/v1/seller/subscription/status",
  authenticateToken,
  authorizeSeller,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user?.uid;
      if (!sellerId) {
        return res.status(401).json({ error: "Authentification requise." });
      }
      const status = await getSellerSubscriptionStatus(sellerId);
      return res.json({ success: true, data: status });
    } catch (error) {
      safeLogger.error("[SellerSubscriptionController] ❌ Error fetching status", { err: error instanceof Error ? error.message : String(error) });
      return res.status(500).json({ error: "Erreur lors de la récupération du statut d'abonnement." });
    }
  }
);

// Obtenir les forfaits disponibles pour souscription
router.get(
  "/api/v1/seller/subscription/plans",
  authenticateToken,
  authorizeSeller,
  async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const plans = await getPublicPlans();
      return res.json({ success: true, data: plans });
    } catch (error) {
      safeLogger.error("[SellerSubscriptionController] ❌ Error fetching plans", { err: error instanceof Error ? error.message : String(error) });
      return res.status(500).json({ error: "Erreur lors de la récupération des forfaits disponibles." });
    }
  }
);

// Les offres vendeurs sont gratuites ; aucun parcours de paiement n'est proposé.
router.post(
  "/api/v1/seller/subscription/request",
  authenticateToken,
  authorizeSeller,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user?.uid;
      if (!sellerId) return res.status(401).json({ error: "Authentification requise." });
      const plans = await getPublicPlans();
      const plan = plans[0];
      if (!plan) return res.status(503).json({ error: "L'offre vendeur gratuite est indisponible." });
      const result = await createSubscriptionRequest(sellerId, plan.id, "Boutique Olmart", req.user?.email || "");
      return res.json({ success: true, message: "Votre demande pour l’offre vendeur gratuite a été enregistrée.", data: result });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erreur lors de l'activation de l'offre gratuite.";
      return res.status(400).json({ error: msg });
    }
  }
);

// Historique des demandes de souscription
router.get(
  "/api/v1/seller/subscription/history",
  authenticateToken,
  authorizeSeller,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user?.uid;
      if (!sellerId) {
        return res.status(401).json({ error: "Authentification requise." });
      }
      const history = await getSellerRequestHistory(sellerId);
      return res.json({ success: true, data: history });
    } catch (error) {
      safeLogger.error("[SellerSubscriptionController] ❌ Error fetching history", { err: error instanceof Error ? error.message : String(error) });
      return res.status(500).json({ error: "Erreur lors de la récupération de l'historique." });
    }
  }
);

export default router;
