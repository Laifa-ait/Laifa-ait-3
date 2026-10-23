import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth";
import { getSellerSubscriptionStatus } from "../domains/seller/services/sellerSubscription.service";
import { SellerSubscription } from "../domains/seller/subscription.types";

export interface SubscriptionAuthenticatedRequest extends AuthenticatedRequest {
  subscription?: SellerSubscription;
}

export const requireSubscriptionFeature = (featureKey: string) => {
  return async (req: SubscriptionAuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentification requise." });
      }

      // Les administrateurs ont un accès superviseur complet
      if (req.user.role === "admin" || req.user.role === "superadmin") {
        return next();
      }

      const sellerId = req.user.uid;
      const statusSummary = await getSellerSubscriptionStatus(sellerId);

      if (!statusSummary.hasActiveSubscription || !statusSummary.subscription) {
        return res.status(403).json({
          error: "Un abonnement Olmart Commerce Studio actif est requis pour accéder à cette fonctionnalité.",
          code: "SUBSCRIPTION_REQUIRED",
          requiredFeature: featureKey
        });
      }

      const sub = statusSummary.subscription;
      const hasPermission =
        sub.permissions.includes(featureKey) ||
        (featureKey === "custom_pages" && (sub.limits?.maxPages ?? 0) > 0) ||
        (featureKey === "tiktok_ads" && Boolean(sub.limits?.tiktokAdsAllowed)) ||
        (featureKey === "custom_sections" && (sub.limits?.maxCustomSections ?? 0) > 0);

      if (!hasPermission) {
        return res.status(403).json({
          error: `Votre forfait actuel (${sub.planName}) n'inclut pas la fonctionnalité demandée.`,
          code: "FEATURE_NOT_IN_PLAN",
          requiredFeature: featureKey,
          currentPlan: sub.planName
        });
      }

      req.subscription = sub;
      return next();
    } catch {
      return res.status(500).json({ error: "Erreur lors de la vérification des permissions d'abonnement." });
    }
  };
};
