import { Router, Response } from "express";
import { authenticateToken, authorizeSeller, AuthenticatedRequest } from "../../../middlewares/auth";
import { safeLogger } from "../../../utils/logger";
import {
  getSellerSubscriptionStatus,
  getPublicPlans,
  createSubscriptionRequest,
  declarePayment,
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

// Étape A : Soumission de la demande d'abonnement pour un forfait
router.post(
  "/api/v1/seller/subscription/request",
  authenticateToken,
  authorizeSeller,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user?.uid;
      const sellerEmail = req.user?.email || "";
      const shopName = (req.user as Record<string, unknown>)?.shopName as string || "Boutique Olmart";
      const { planId } = req.body;

      if (!sellerId) {
        return res.status(401).json({ error: "Authentification requise." });
      }
      if (!planId) {
        return res.status(400).json({ error: "Identifiant du forfait requis." });
      }

      const request = await createSubscriptionRequest(sellerId, planId, shopName, sellerEmail);
      return res.json({
        success: true,
        message: "Votre demande a été enregistrée. L'équipe Olmart va vous transmettre les instructions bancaires.",
        data: request
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erreur lors de la demande d'abonnement.";
      safeLogger.error("[SellerSubscriptionController] ❌ Error creating request", { err: error instanceof Error ? error.message : String(error) });
      return res.status(400).json({ error: msg });
    }
  }
);

// Étape D : Déclaration du transfert bancaire et soumission du reçu
router.post(
  "/api/v1/seller/subscription/declare-payment",
  authenticateToken,
  authorizeSeller,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user?.uid;
      if (!sellerId) {
        return res.status(401).json({ error: "Authentification requise." });
      }
      const { requestId, transactionReference, paymentDate, proofFileUrl, receiptNote } = req.body;

      if (!requestId || !transactionReference || !paymentDate) {
        return res.status(400).json({ error: "Référence de transaction et date de virement requises." });
      }

      if (proofFileUrl !== undefined && proofFileUrl !== null && proofFileUrl !== "") {
        if (typeof proofFileUrl !== "string" || proofFileUrl.length > 2048) {
          return res.status(400).json({ error: "L'URL du justificatif est invalide ou dépasse 2048 caractères." });
        }
        if (!proofFileUrl.startsWith("https://")) {
          return res.status(400).json({ error: "L'URL du justificatif doit impérativement utiliser le protocole sécurisé HTTPS (https://)." });
        }
        try {
          const parsed = new URL(proofFileUrl);
          if (parsed.protocol !== "https:") {
            return res.status(400).json({ error: "Protocole HTTPS strictement requis pour le justificatif." });
          }
        } catch {
          return res.status(400).json({ error: "Format d'URL de justificatif invalide." });
        }
      }

      const updated = await declarePayment(requestId, sellerId, {
        transactionReference,
        paymentDate,
        proofFileUrl,
        receiptNote
      });

      return res.json({
        success: true,
        message: "Preuve de paiement enregistrée. L'administrateur vérifiera les fonds avant d'activer votre studio.",
        data: updated
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erreur lors de la déclaration du paiement.";
      safeLogger.error("[SellerSubscriptionController] ❌ Error declaring payment", { err: error instanceof Error ? error.message : String(error) });
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
