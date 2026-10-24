import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, CheckCircle2, Megaphone, ShieldCheck } from "lucide-react";

interface StudioSubscriptionBannerProps {
  isPublished: boolean;
  versionNumber?: number;
  sectionCount: number;
  productCount?: number;
}

export const StudioSubscriptionBanner: React.FC<StudioSubscriptionBannerProps> = ({
  isPublished,
  versionNumber = 1,
  sectionCount,
  productCount = 0,
}) => {
  const navigate = useNavigate();

  return (
    <div className="hidden md:flex bg-[#FFFFFF] border-b border-[#E4E7EC] px-4 py-1.5 items-center justify-between text-[12px] shrink-0 gap-3 select-none">
      <div className="flex items-center gap-2.5 min-w-0">
        {isPublished ? (
          <span className="px-2 py-0.5 bg-[#F0FDF4] border border-[#86EFAC] text-[#15803D] rounded-md font-semibold text-[11px] flex items-center gap-1 shrink-0">
            <CheckCircle2 className="w-3 h-3" />
            <span>Boutique en ligne (v{versionNumber})</span>
          </span>
        ) : (
          <span className="px-2 py-0.5 bg-[#FFF7ED] border border-[#FDBA74] text-[#EA580C] rounded-md font-semibold text-[11px] flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-[#F97316]" />
            <span>Mode Brouillon</span>
          </span>
        )}
        <span className="text-[#475467] truncate">
          {sectionCount} section{sectionCount > 1 ? "s" : ""} configurée{sectionCount > 1 ? "s" : ""} ·{" "}
          {productCount} produit{productCount > 1 ? "s" : ""} au catalogue
        </span>
        <span className="hidden lg:inline-flex items-center gap-1 text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded text-[11px] font-medium">
          <ShieldCheck className="w-3 h-3" />
          <span>0% commission sur vos ventes · Publication 100% gratuite</span>
        </span>
      </div>

      <button
        type="button"
        onClick={() => navigate("/dashboard/seller/sponsorships")}
        className="h-7 px-2.5 bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#C2410C] border border-[#FDBA74] rounded-lg font-semibold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
      >
        <Megaphone className="w-3 h-3 text-[#F97316]" />
        <span>Booster ma visibilité (Pub)</span>
      </button>
    </div>
  );
};
