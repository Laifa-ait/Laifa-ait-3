import { db } from "../../../config/firebase-admin";
import { SubscriptionPlan } from "../../seller/subscription.types";

export const PLANS_COLLECTION = "subscription_plans";
export const AUDIT_LOGS_COLLECTION = "audit_logs";

export const DEFAULT_PLANS: Omit<SubscriptionPlan, "createdAt" | "updatedAt">[] = [
  {
    id: "plan_decouverte",
    name: "Découverte Standard",
    description: "Boutique standard Olmart pour débuter sans engagement.",
    price: 0,
    currency: "DZD",
    durationDays: 365,
    features: ["Boutique standard publique", "Catalogue jusqu'à 20 produits", "Paiement à la livraison (COD)"],
    limits: {
      maxPages: 1,
      maxCustomSections: 0,
      customDomainAllowed: false,
      tiktokAdsAllowed: false,
      analyticsAdvanced: false
    },
    isActive: true
  },
  {
    id: "plan_artisan_pro",
    name: "Pro Artisan & Créateur",
    description: "Studio visuel complet pour valoriser votre marque et vos créations algériennes.",
    price: 3900,
    currency: "DZD",
    durationDays: 30,
    badge: "Populaire Créateurs",
    features: [
      "Constructeur de pages modulaires (3 pages)",
      "Thèmes sectoriels : Artisanat, Mode, Beauté",
      "Sections promos & avis clients vérifiés",
      "Support prioritaire Olmart"
    ],
    limits: {
      maxPages: 3,
      maxCustomSections: 12,
      customDomainAllowed: false,
      tiktokAdsAllowed: false,
      analyticsAdvanced: true
    },
    isPopular: true,
    isActive: true
  },
  {
    id: "plan_business_performance",
    name: "Business & Multicanal",
    description: "Multi-pages illimitées, landing de campagnes et intégration prioritaire TikTok Ads.",
    price: 7900,
    currency: "DZD",
    durationDays: 30,
    badge: "Recommandé Vendeurs",
    features: [
      "Pages et sections illimitées",
      "Landing pages optimisées pour campagnes publicitaires",
      "Connecteur officiel TikTok Ads",
      "Analytics de conversion COD en temps réel",
      "Restauration des versions de page"
    ],
    limits: {
      maxPages: 25,
      maxCustomSections: 50,
      customDomainAllowed: true,
      tiktokAdsAllowed: true,
      analyticsAdvanced: true
    },
    isActive: true
  }
];

export async function listAllPlans(): Promise<SubscriptionPlan[]> {
  const snapshot = await db.collection(PLANS_COLLECTION).get();
  if (snapshot.empty) {
    const now = new Date().toISOString();
    const batch = db.batch();
    for (const p of DEFAULT_PLANS) {
      const ref = db.collection(PLANS_COLLECTION).doc(p.id);
      batch.set(ref, { ...p, createdAt: now, updatedAt: now });
    }
    await batch.commit();
    return DEFAULT_PLANS.map((p) => ({ ...p, createdAt: now, updatedAt: now }));
  }
  return snapshot.docs.map((d) => ({ ...(d.data() as SubscriptionPlan), id: d.id }));
}

export async function upsertPlan(
  planId: string,
  data: Partial<SubscriptionPlan>,
  adminId: string
): Promise<SubscriptionPlan> {
  const now = new Date().toISOString();
  const ref = db.collection(PLANS_COLLECTION).doc(planId);
  const existing = await ref.get();
  const payload = {
    ...data,
    id: planId,
    updatedAt: now,
    ...(existing.exists ? {} : { createdAt: now })
  };
  await ref.set(payload, { merge: true });
  await db.collection(AUDIT_LOGS_COLLECTION).add({
    action: existing.exists ? "subscription_plan_updated" : "subscription_plan_created",
    adminId,
    targetId: planId,
    timestamp: now
  });
  const updated = await ref.get();
  return { ...(updated.data() as SubscriptionPlan), id: updated.id };
}
