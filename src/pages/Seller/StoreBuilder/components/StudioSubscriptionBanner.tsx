import React from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { SubscriptionRequest } from "../../../../domains/seller/subscription.types";

interface StudioSubscriptionBannerProps {
  daysRemaining: number;
  pendingRequest?: SubscriptionRequest | null;
  isPublished: boolean;
  hasActiveSubscription: boolean;
  sectionCount: number;
  sectionLimit?: number;
  onOpenSubModal: () => void;
}

export const StudioSubscriptionBanner: React.FC<StudioSubscriptionBannerProps> = ({
  daysRemaining,
  pendingRequest,
  isPublished,
  hasActiveSubscription,
  sectionCount,
  sectionLimit,
  onOpenSubModal,
}) => {
  const overSectionLimit = hasActiveSubscription && typeof sectionLimit === "number" && sectionCount > sectionLimit;
  return (
    <div className="hidden md:flex bg-[#FFFFFF] border-b border-[#E4E7EC] px-4 py-2 flex-col sm:flex-row items-center justify-between text-[13px] shrink-0 gap-2">
      <div className="flex items-center gap-2">
        {hasActiveSubscription ? (
          <span className="px-2 py-0.5 bg-[#F0FDF4] border border-[#86EFAC] text-[#15803D] rounded-md font-semibold text-[11px] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Abonnement actif
          </span>
        ) : (
          <span className="px-2 py-0.5 bg-[#FFF7ED] border border-[#FDBA74] text-[#F97316] rounded-md font-semibold text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#F97316]" />
            Studio gratuit en brouillon
          </span>
        )}
        <span className={overSectionLimit ? "text-red-700" : "text-[#667085]"}>
          {hasActiveSubscription
            ? `${daysRemaining} jour${daysRemaining > 1 ? "s" : ""} restant${daysRemaining > 1 ? "s" : ""} à votre formule · ${sectionCount}${typeof sectionLimit === "number" ? ` / ${sectionLimit}` : ""} sections.`
            : `${sectionCount} section${sectionCount > 1 ? "s" : ""} dans votre brouillon gratuit. Un abonnement actif est requis pour la publier.`}
          {overSectionLimit && ` Retirez ${sectionCount - sectionLimit} section${sectionCount - sectionLimit > 1 ? "s" : ""} pour publier.`}
        </span>
      </div>
      <div>
        {pendingRequest && !hasActiveSubscription ? (
          <span className="px-2.5 py-1 bg-[#FFFBEB] border border-[#B45309]/30 text-[#B45309] rounded-md font-medium text-[12px]">
            {pendingRequest.status === "payment_requested"
              ? "Coordonnées de paiement reçues"
              : pendingRequest.status === "payment_declared" || pendingRequest.status === "payment_confirmed"
              ? "Paiement en vérification"
              : "Demande reçue · instructions à venir"}
          </span>
        ) : isPublished ? (
          <span className="px-2.5 py-1 bg-[#F0FDF4] border border-[#15803D]/30 text-[#15803D] rounded-md font-medium text-[12px] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
            Boutique en ligne active
          </span>
        ) : (
          <button
            onClick={onOpenSubModal}
            className="h-[32px] px-3 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg font-medium text-[12px] transition-colors cursor-pointer"
          >
            Choisir un abonnement
          </button>
        )}
      </div>
    </div>
  );
};
