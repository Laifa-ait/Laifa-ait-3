import { db } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";
import {
  SubscriptionPlan,
  SubscriptionRequest,
  SellerSubscription,
  SubscriptionStatusSummary,
  PaymentProof
} from "../subscription.types";
import { listAllPlans } from "../../admin/services/adminSubscription.service";

const REQUESTS_COLLECTION = "subscription_requests";
const SUBSCRIPTIONS_COLLECTION = "seller_subscriptions";
const AUDIT_LOGS_COLLECTION = "audit_logs";

export async function getSellerSubscriptionStatus(sellerId: string): Promise<SubscriptionStatusSummary> {
  const now = new Date();
  const subSnap = await db
    .collection(SUBSCRIPTIONS_COLLECTION)
    .where("sellerId", "==", sellerId)
    .where("status", "==", "active")
    .limit(1)
    .get();

  let activeSub: SellerSubscription | null = null;
  let daysRemaining = 0;

  if (!subSnap.empty) {
    const data = subSnap.docs[0].data() as SellerSubscription;
    const endDate = new Date(data.endDate);
    if (endDate.getTime() > now.getTime()) {
      activeSub = { ...data, id: subSnap.docs[0].id };
      daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }
  }

  const reqSnap = await db
    .collection(REQUESTS_COLLECTION)
    .where("sellerId", "==", sellerId)
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();

  let pendingRequest: SubscriptionRequest | null = null;
  if (!reqSnap.empty) {
    const rData = reqSnap.docs[0].data() as SubscriptionRequest;
    if (["pending", "payment_requested", "payment_declared", "payment_confirmed"].includes(rData.status)) {
      pendingRequest = { ...rData, id: reqSnap.docs[0].id };
    }
  }

  return {
    hasActiveSubscription: Boolean(activeSub),
    subscription: activeSub,
    daysRemaining,
    permissions: activeSub ? activeSub.permissions : ["standard_store"],
    limits: activeSub ? activeSub.limits : null,
    pendingRequest
  };
}

export async function getPublicPlans(): Promise<SubscriptionPlan[]> {
  const all = await listAllPlans();
  return all.filter((p) => p.isActive);
}

export async function createSubscriptionRequest(
  sellerId: string,
  planId: string,
  shopName: string,
  sellerEmail: string
): Promise<SubscriptionRequest> {
  const plans = await listAllPlans();
  const selectedPlan = plans.find((p) => p.id === planId && p.isActive);
  if (!selectedPlan) {
    throw new Error("Le forfait sélectionné est indisponible.");
  }

  const existingPending = await db
    .collection(REQUESTS_COLLECTION)
    .where("sellerId", "==", sellerId)
    .where("status", "in", ["pending", "payment_requested", "payment_declared"])
    .limit(1)
    .get();

  if (!existingPending.empty) {
    throw new Error("Vous avez déjà une demande d'abonnement en cours de traitement.");
  }

  const now = new Date().toISOString();
  const reqRef = db.collection(REQUESTS_COLLECTION).doc();

  const newRequest: SubscriptionRequest = {
    id: reqRef.id,
    sellerId,
    shopName,
    sellerEmail,
    planId: selectedPlan.id,
    planSnapshot: {
      name: selectedPlan.name,
      price: selectedPlan.price,
      currency: selectedPlan.currency,
      durationDays: selectedPlan.durationDays,
      features: selectedPlan.features,
      limits: selectedPlan.limits
    },
    status: "pending",
    createdAt: now,
    updatedAt: now
  };

  await reqRef.set(newRequest);

  await db.collection(AUDIT_LOGS_COLLECTION).add({
    action: "subscription_request_submitted",
    sellerId,
    planId: selectedPlan.id,
    targetId: reqRef.id,
    timestamp: now
  });

  safeLogger.info(`[SellerSubscriptions] 🟢 Request submitted [${reqRef.id}] for seller [${sellerId}]`);
  return newRequest;
}

export async function declarePayment(
  requestId: string,
  sellerId: string,
  proofData: Omit<PaymentProof, "submittedAt">
): Promise<SubscriptionRequest> {
  const reqRef = db.collection(REQUESTS_COLLECTION).doc(requestId);
  const snap = await reqRef.get();
  if (!snap.exists) {
    throw new Error("Demande d'abonnement introuvable.");
  }
  const data = snap.data() as SubscriptionRequest;
  if (data.sellerId !== sellerId) {
    throw new Error("Accès refusé. Cette demande ne vous appartient pas.");
  }
  if (data.status !== "payment_requested") {
    throw new Error(`Impossible de déclarer un reçu sur une demande au statut [${data.status}].`);
  }

  const now = new Date().toISOString();
  const proof: PaymentProof = {
    ...proofData,
    submittedAt: now
  };

  await reqRef.update({
    status: "payment_declared",
    paymentProof: proof,
    updatedAt: now
  });

  await db.collection(AUDIT_LOGS_COLLECTION).add({
    action: "subscription_payment_declared",
    sellerId,
    targetId: requestId,
    transactionReference: proof.transactionReference,
    timestamp: now
  });

  safeLogger.info(`[SellerSubscriptions] 🟢 Payment declared on request [${requestId}] by seller [${sellerId}]`);
  const updated = await reqRef.get();
  return { ...(updated.data() as SubscriptionRequest), id: updated.id };
}

export async function getSellerRequestHistory(sellerId: string): Promise<SubscriptionRequest[]> {
  const snap = await db
    .collection(REQUESTS_COLLECTION)
    .where("sellerId", "==", sellerId)
    .orderBy("createdAt", "desc")
    .limit(20)
    .get();

  return snap.docs.map((doc) => ({ ...(doc.data() as SubscriptionRequest), id: doc.id }));
}
