import { Router, Response } from "express";
import { AuthenticatedRequest, authenticateToken, authorizeAdmin } from "../../../middlewares/auth";
import { safeLogger } from "../../../utils/logger";
import {
  listAllPlans,
  upsertPlan,
  listSubscriptionRequests,
  requestPaymentInstructions,
  confirmPaymentReceived,
  grantSubscriptionTx,
  rejectSubscriptionRequest
} from "../services/adminSubscription.service";

const router = Router();
router.use(["/admin", "/api/v1/admin"], authenticateToken, authorizeAdmin);

router.get(["/admin/subscriptions/plans", "/api/v1/admin/subscriptions/plans"], async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const plans = await listAllPlans();
    return res.json({ success: true, data: plans });
  } catch (error) {
    safeLogger.error("[AdminSubscriptions] ❌ Error fetching plans", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur lors de la récupération des forfaits." });
  }
});

router.post(["/admin/subscriptions/plans", "/api/v1/admin/subscriptions/plans"], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = req.user?.uid || "admin";
    const body = req.body as { id?: string; name?: string; price?: number };
    const planId = body.id || `plan_${Date.now()}`;
    const plan = await upsertPlan(planId, req.body, adminId);
    return res.json({ success: true, data: plan });
  } catch (error) {
    safeLogger.error("[AdminSubscriptions] ❌ Error creating plan", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur lors de la création du forfait." });
  }
});

router.put(["/admin/subscriptions/plans/:id", "/api/v1/admin/subscriptions/plans/:id"], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = req.user?.uid || "admin";
    const { id } = req.params;
    const plan = await upsertPlan(id, req.body, adminId);
    return res.json({ success: true, data: plan });
  } catch (error) {
    safeLogger.error("[AdminSubscriptions] ❌ Error updating plan", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur lors de la mise à jour du forfait." });
  }
});

router.get(["/admin/subscriptions/requests", "/api/v1/admin/subscriptions/requests"], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const requests = await listSubscriptionRequests(status);
    return res.json({ success: true, data: requests });
  } catch (error) {
    safeLogger.error("[AdminSubscriptions] ❌ Error fetching requests", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur lors de la récupération des demandes." });
  }
});

// Étape C : Envoi des instructions bancaires au vendeur
router.post(["/admin/subscriptions/requests/:id/request-payment", "/api/v1/admin/subscriptions/requests/:id/request-payment"], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = req.user?.uid || "admin";
    const { id } = req.params;
    const { accountHolder, accountNumber, bankName, rib, referenceCode, amount, instructions } = req.body;

    if (!accountHolder || !bankName || !referenceCode || amount === undefined) {
      return res.status(400).json({ error: "Coordonnées bancaires ou référence manquantes." });
    }

    const updated = await requestPaymentInstructions(
      id,
      {
        accountHolder,
        accountNumber: accountNumber || "",
        bankName,
        rib: rib || "",
        referenceCode,
        amount: Number(amount),
        currency: "DZD",
        instructions: instructions || "Effectuez le virement bancaire et déclarez votre reçu."
      },
      adminId
    );

    return res.json({ success: true, data: updated });
  } catch (error) {
    safeLogger.error("[AdminSubscriptions] ❌ Error requesting payment", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur lors de l'envoi des instructions bancaires." });
  }
});

// Étape E : Confirmation de la réception des fonds sur le compte bancaire réel
router.post(["/admin/subscriptions/requests/:id/confirm-payment", "/api/v1/admin/subscriptions/requests/:id/confirm-payment"], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = req.user?.uid || "admin";
    const { id } = req.params;
    const { confirmedAmount, notes } = req.body;

    if (confirmedAmount === undefined) {
      return res.status(400).json({ error: "Montant confirmé requis." });
    }

    const updated = await confirmPaymentReceived(id, Number(confirmedAmount), adminId, notes);
    return res.json({ success: true, data: updated });
  } catch (error) {
    safeLogger.error("[AdminSubscriptions] ❌ Error confirming payment", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur lors de la confirmation du paiement." });
  }
});

// Étape F : Bouton explicite « Accorder l'abonnement » avec transaction ACID
router.post(["/admin/subscriptions/requests/:id/grant", "/api/v1/admin/subscriptions/requests/:id/grant"], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = req.user?.uid || "admin";
    const { id } = req.params;
    const { notes } = req.body;

    const result = await grantSubscriptionTx(id, adminId, notes);
    return res.json({
      success: true,
      message: "Abonnement accordé avec succès.",
      data: result
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur lors de l'accord de l'abonnement.";
    safeLogger.error("[AdminSubscriptions] ❌ Error granting subscription", { err: error instanceof Error ? error.message : String(error) });
    return res.status(400).json({ error: msg });
  }
});

router.post(["/admin/subscriptions/requests/:id/reject", "/api/v1/admin/subscriptions/requests/:id/reject"], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = req.user?.uid || "admin";
    const { id } = req.params;
    const { reason } = req.body;

    const updated = await rejectSubscriptionRequest(id, reason || "Dossier non validé", adminId);
    return res.json({ success: true, data: updated });
  } catch (error) {
    safeLogger.error("[AdminSubscriptions] ❌ Error rejecting request", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur lors du rejet de la demande." });
  }
});

export default router;
