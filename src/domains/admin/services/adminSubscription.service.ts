import { db } from "../../../config/firebase-admin";
import { listAllPlans } from "./adminSubscriptionPlans.service";
import { safeLogger } from "../../../utils/logger";
import {
  SubscriptionRequest,
  SellerSubscription,
  BankPaymentInstructions
} from "../../seller/subscription.types";

export {
  PLANS_COLLECTION,
  DEFAULT_PLANS,
  listAllPlans,
  upsertPlan
} from "./adminSubscriptionPlans.service";

const REQUESTS_COLLECTION = "subscription_requests";
const SUBSCRIPTIONS_COLLECTION = "seller_subscriptions";
const AUDIT_LOGS_COLLECTION = "audit_logs";
const NOTIFICATIONS_COLLECTION = "user_notifications";

export async function listSubscriptionRequests(statusFilter?: string): Promise<SubscriptionRequest[]> {
  let query = db.collection(REQUESTS_COLLECTION).orderBy("createdAt", "desc");
  if (statusFilter && statusFilter !== "all") {
    query = query.where("status", "==", statusFilter);
  }
  const snapshot = await query.limit(100).get();
  return snapshot.docs.map((doc) => ({ ...(doc.data() as SubscriptionRequest), id: doc.id }));
}

export async function requestPaymentInstructions(
  requestId: string,
  instructions: Omit<BankPaymentInstructions, "requestedAt" | "requestedByAdminId">,
  adminId: string
): Promise<SubscriptionRequest> {
  const reqRef = db.collection(REQUESTS_COLLECTION).doc(requestId);
  const reqSnap = await reqRef.get();
  if (!reqSnap.exists) throw new Error("Demande d'abonnement introuvable.");
  const reqData = reqSnap.data() as SubscriptionRequest;
  if (Number(reqData.planSnapshot?.price) === 0) throw new Error("Aucun paiement n'est requis pour l'offre vendeur gratuite.");
  const now = new Date().toISOString();
  const fullInstructions: BankPaymentInstructions = {
    ...instructions,
    requestedAt: now,
    requestedByAdminId: adminId
  };

  await reqRef.update({
    status: "payment_requested",
    paymentInstructions: fullInstructions,
    updatedAt: now
  });

  const updatedDoc = await reqRef.get();
  const data = updatedDoc.data() as SubscriptionRequest;

  await db.collection(NOTIFICATIONS_COLLECTION).add({
    userId: data.sellerId,
    type: "subscription_payment_requested",
    title: "Instructions de paiement envoyées",
    message: `Veuillez effectuer le virement de ${instructions.amount} DZD avec la référence ${instructions.referenceCode}.`,
    createdAt: now,
    read: false
  });

  await db.collection(AUDIT_LOGS_COLLECTION).add({
    action: "subscription_payment_requested",
    adminId,
    targetId: requestId,
    sellerId: data.sellerId,
    timestamp: now
  });

  return { ...data, id: updatedDoc.id };
}

export async function confirmPaymentReceived(
  requestId: string,
  confirmedAmount: number,
  adminId: string,
  notes?: string
): Promise<SubscriptionRequest> {
  const reqRef = db.collection(REQUESTS_COLLECTION).doc(requestId);
  const reqSnap = await reqRef.get();
  if (!reqSnap.exists) throw new Error("Demande d'abonnement introuvable.");
  const reqData = reqSnap.data() as SubscriptionRequest;
  if (Number(reqData.planSnapshot?.price) === 0) throw new Error("Une offre gratuite ne nécessite pas de confirmation de paiement.");
  const now = new Date().toISOString();
  await reqRef.update({
    status: "payment_confirmed",
    paymentConfirmation: {
      confirmedAt: now,
      confirmedByAdminId: adminId,
      confirmedAmount,
      verificationNotes: notes || ""
    },
    updatedAt: now
  });

  const updatedDoc = await reqRef.get();
  const data = updatedDoc.data() as SubscriptionRequest;

  await db.collection(AUDIT_LOGS_COLLECTION).add({
    action: "subscription_payment_confirmed",
    adminId,
    targetId: requestId,
    sellerId: data.sellerId,
    confirmedAmount,
    timestamp: now
  });

  return { ...data, id: updatedDoc.id };
}

export async function grantSubscriptionTx(
  requestId: string,
  adminId: string,
  grantNotes?: string
): Promise<{ request: SubscriptionRequest; subscription: SellerSubscription }> {
  const now = new Date();
  const nowIso = now.toISOString();

  return await db.runTransaction(async (tx) => {
    const reqRef = db.collection(REQUESTS_COLLECTION).doc(requestId);
    const reqSnap = await tx.get(reqRef);
    if (!reqSnap.exists) {
      throw new Error("Demande d'abonnement introuvable.");
    }
    const reqData = reqSnap.data() as SubscriptionRequest;
    if (reqData.status === "granted") {
      throw new Error("L'abonnement a déjà été accordé pour cette demande (double attribution strictement interdite).");
    }
    const plans = await listAllPlans();
    const currentPlan = plans.find((plan) => plan.id === reqData.planId);
    if (Number(currentPlan?.price ?? reqData.planSnapshot?.price) === 0) {
      throw new Error("Cette offre est gratuite et ne peut pas être validée comme un abonnement payant.");
    }
    if (reqData.status !== "payment_confirmed") {
      throw new Error(`Attribution refusée: la demande doit être au statut 'payment_confirmed' (statut actuel: [${reqData.status}]). Seul un virement vérifié et confirmé administrativement autorise l'attribution.`);
    }

    const durationDays = reqData.planSnapshot?.durationDays || 30;
    const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    const subscriptionId = `sub_${reqData.sellerId}_${requestId}`;
    const subRef = db.collection(SUBSCRIPTIONS_COLLECTION).doc(subscriptionId);

    const subscription: SellerSubscription = {
      id: subscriptionId,
      sellerId: reqData.sellerId,
      planId: reqData.planId,
      planName: reqData.planSnapshot?.name || "Abonnement Vendeur",
      status: "active",
      permissions: reqData.planSnapshot?.features || ["custom_pages", "builder_access"],
      limits: reqData.planSnapshot?.limits || {
        maxPages: 3,
        maxCustomSections: 12,
        customDomainAllowed: false,
        tiktokAdsAllowed: false,
        analyticsAdvanced: true
      },
      startDate: nowIso,
      endDate,
      grantedByAdminId: adminId,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    tx.set(subRef, subscription);

    tx.update(reqRef, {
      status: "granted",
      grantDetails: {
        grantedAt: nowIso,
        grantedByAdminId: adminId,
        subscriptionId,
        grantNotes: grantNotes || ""
      },
      updatedAt: nowIso
    });

    const auditRef = db.collection(AUDIT_LOGS_COLLECTION).doc();
    tx.set(auditRef, {
      action: "subscription_granted_manually",
      adminId,
      targetId: requestId,
      sellerId: reqData.sellerId,
      subscriptionId,
      planId: reqData.planId,
      startDate: nowIso,
      endDate,
      timestamp: nowIso
    });

    const notifRef = db.collection(NOTIFICATIONS_COLLECTION).doc();
    tx.set(notifRef, {
      userId: reqData.sellerId,
      type: "subscription_granted",
      title: "🎉 Votre abonnement a été validé !",
      message: `Votre accès au Studio Olmart (${subscription.planName}) est désormais débloqué jusqu'au ${new Date(endDate).toLocaleDateString("fr-FR")}.`,
      createdAt: nowIso,
      read: false
    });

    safeLogger.info(`[Subscriptions] 🟢 Subscription [${subscriptionId}] granted to seller [${reqData.sellerId}]`);
    return {
      request: { ...reqData, status: "granted", id: reqRef.id },
      subscription
    };
  });
}

export async function rejectSubscriptionRequest(
  requestId: string,
  reason: string,
  adminId: string
): Promise<SubscriptionRequest> {
  const now = new Date().toISOString();
  const reqRef = db.collection(REQUESTS_COLLECTION).doc(requestId);
  await reqRef.update({
    status: "rejected",
    rejectionReason: reason,
    updatedAt: now
  });
  const updatedDoc = await reqRef.get();
  const data = updatedDoc.data() as SubscriptionRequest;

  await db.collection(AUDIT_LOGS_COLLECTION).add({
    action: "subscription_rejected",
    adminId,
    targetId: requestId,
    sellerId: data.sellerId,
    reason,
    timestamp: now
  });

  return { ...data, id: updatedDoc.id };
}
