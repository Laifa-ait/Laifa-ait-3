import React from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { SubscriptionRequest } from "../../../../domains/seller/subscription.types";

interface StudioSubscriptionBannerProps {
  daysRemaining: number;
  pendingRequest?: SubscriptionRequest | null;
  isPublished: boolean;
  onOpenSubModal: () => void;
}

export const StudioSubscriptionBanner: React.FC<StudioSubscriptionBannerProps> = ({
  daysRemaining,
  pendingRequest,
  isPublished,
  onOpenSubModal,
}) => {
  return (
    <div className="hidden md:flex bg-[#FFFFFF] border-b border-[#E4E7EC] px-4 py-2 flex-col sm:flex-row items-center justify-between text-[13px] shrink-0 gap-2">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 bg-[#FFF7ED] border border-[#FDBA74] text-[#F97316] rounded-md font-semibold text-[11px] flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#F97316]" />
          Création Gratuite
        </span>
        <span className="text-[#667085]">
          Accès complet au Studio ({daysRemaining} jours restants). Paiement du forfait DZD lors de la mise en ligne.
        </span>
      </div>
      <div>
        {pendingRequest ? (
          <span className="px-2.5 py-1 bg-[#FFFBEB] border border-[#B45309]/30 text-[#B45309] rounded-md font-medium text-[12px]">
            Demande en vérification ({pendingRequest.planId})
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
            Forfaits & Mise en ligne DZD
          </button>
        )}
      </div>
    </div>
  );
};
