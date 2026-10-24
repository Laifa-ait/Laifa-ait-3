import { db } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";
import {
  SubscriptionPlan,
  SubscriptionRequest,
  SellerSubscription,
  SubscriptionStatusSummary,
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

  // Legacy paid subscription requests are not part of the free seller access flow.
  const pendingRequest: SubscriptionRequest | null = null;

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
  return all.filter((p) => p.isActive && Number(p.price) === 0);
}

export async function createSubscriptionRequest(
  sellerId: string,
  planId: string,
  shopName: string,
  sellerEmail: string
): Promise<SubscriptionRequest> {
  const plans = await listAllPlans();
  const selectedPlan = plans.find((p) => p.id === planId && p.isActive);
  if (!selectedPlan || Number(selectedPlan.price) !== 0) {
    throw new Error("Les offres payantes ne sont pas disponibles. L’accès vendeur standard est gratuit.");
  }

  const now = new Date().toISOString();
  const subscriptionId = `sub_${sellerId}_${selectedPlan.id}`;
  const subscriptionRef = db.collection(SUBSCRIPTIONS_COLLECTION).doc(subscriptionId);
  const existing = await subscriptionRef.get();
  if (existing.exists) {
    const current = existing.data() as SellerSubscription;
    if (current.status === "active" && new Date(current.endDate).getTime() > Date.now()) {
      return {
        id: subscriptionId, sellerId, shopName, sellerEmail, planId: selectedPlan.id,
        planSnapshot: { name: selectedPlan.name, price: 0, currency: selectedPlan.currency, durationDays: selectedPlan.durationDays, features: selectedPlan.features, limits: selectedPlan.limits },
        status: "granted", createdAt: current.createdAt, updatedAt: now
      };
    }
  }
  const endDate = new Date(Date.now() + selectedPlan.durationDays * 24 * 60 * 60 * 1000).toISOString();
  const subscription: SellerSubscription = {
    id: subscriptionId, sellerId, planId: selectedPlan.id, planName: selectedPlan.name,
    status: "active", permissions: selectedPlan.features, limits: selectedPlan.limits,
    startDate: now, endDate, createdAt: now, updatedAt: now
  };
  await subscriptionRef.set(subscription);
  await db.collection(AUDIT_LOGS_COLLECTION).add({
    action: "free_seller_access_activated", sellerId, planId: selectedPlan.id, targetId: subscriptionId, timestamp: now
  });
  safeLogger.info(`[SellerSubscriptions] Free access activated for seller [${sellerId}]`);
  return {
    id: subscriptionId, sellerId, shopName, sellerEmail, planId: selectedPlan.id,
    planSnapshot: { name: selectedPlan.name, price: 0, currency: selectedPlan.currency, durationDays: selectedPlan.durationDays, features: selectedPlan.features, limits: selectedPlan.limits },
    status: "granted", createdAt: now, updatedAt: now
  };
}

export async function declarePayment(): Promise<never> {
  throw new Error("Les paiements d'abonnement vendeur ne sont pas activés.");
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
