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
      const requestedPlanId = typeof req.body?.planId === "string" && req.body.planId.trim() ? req.body.planId.trim() : undefined;
      let targetPlanId = requestedPlanId;
      if (!targetPlanId) {
        const plans = await getPublicPlans();
        targetPlanId = plans[0]?.id;
      }
      if (!targetPlanId) return res.status(503).json({ error: "L'offre vendeur gratuite est indisponible." });
      const result = await createSubscriptionRequest(sellerId, targetPlanId, "Boutique Olmart", req.user?.email || "");
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

// Validation de sécurité et blocage IDOR/XSS sur la déclaration de paiement
router.post(
  "/api/v1/seller/subscription/declare-payment",
  authenticateToken,
  authorizeSeller,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user?.uid;
      if (!sellerId) return res.status(401).json({ error: "Authentification requise." });

      const { requestId, proofFileUrl } = req.body || {};
      if (typeof proofFileUrl === "string" && proofFileUrl.trim() !== "") {
        try {
          const parsed = new URL(proofFileUrl.trim());
          if (parsed.protocol !== "https:") {
            return res.status(400).json({ error: "L'URL du justificatif doit utiliser le protocole HTTPS." });
          }
        } catch {
          return res.status(400).json({ error: "L'URL du justificatif doit utiliser le protocole HTTPS." });
        }
      }

      if (!requestId || typeof requestId !== "string") {
        return res.status(404).json({ error: "Demande introuvable." });
      }

      const { db } = await import("../../../config/firebase-admin");
      const reqSnap = await db.collection("subscription_requests").doc(requestId).get();
      if (!reqSnap.exists) {
        return res.status(404).json({ error: "Les paiements d'abonnement vendeur ne sont pas activés." });
      }

      const reqData = reqSnap.data() || {};
      if (reqData.sellerId && reqData.sellerId !== sellerId) {
        return res.status(400).json({ error: "Accès refusé : vous ne pouvez pas modifier la demande d'un autre vendeur." });
      }

      return res.status(404).json({ error: "Les paiements d'abonnement vendeur ne sont pas activés." });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erreur lors du traitement.";
      return res.status(400).json({ error: msg });
    }
  }
);

export default router;
