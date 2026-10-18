import React from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { SaveStatus } from "../../hooks/useSellerStudio";
import { SubscriptionRequest } from "../../../../../domains/seller/subscription.types";

interface StudioTopBarProps {
  viewport: "mobile" | "tablet" | "desktop";
  setViewport: (vp: "mobile" | "tablet" | "desktop") => void;
  saveStatus: SaveStatus;
  shopName?: string;
  shopSlug?: string;
  isPublished?: boolean;
  pendingRequest?: SubscriptionRequest | null;
  onPublish: () => void;
  onRequestPublication?: () => void;
}

export const StudioTopBar: React.FC<StudioTopBarProps> = ({
  viewport,
  setViewport,
  saveStatus,
  shopName = "Ma Boutique",
  shopSlug,
  isPublished,
  pendingRequest,
  onPublish,
  onRequestPublication,
}) => {
  const isPendingReview =
    pendingRequest &&
    ["pending", "payment_requested", "payment_declared"].includes(pendingRequest.status);

  const renderSaveStatus = () => {
    if (saveStatus === "saving") {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] text-[#B45309] bg-[#FFFBEB] border border-[#B45309]/20">
          <span className="w-2 h-2 rounded-full bg-[#B45309] animate-pulse" />
          <span>Enregistrement…</span>
        </span>
      );
    }
    if (saveStatus === "saved") {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] text-[#16A34A] bg-[#F0FDF4] border border-[#16A34A]/20">
          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
          <span>Enregistré</span>
        </span>
      );
    }
    if (saveStatus === "error") {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] text-[#DC2626] bg-[#FEF2F2] border border-[#DC2626]/20">
          <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
          <span>Erreur d'enregistrement</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] text-[#667085]">
        <span className="w-2 h-2 rounded-full bg-[#667085]" />
        <span>Modifications non enregistrées</span>
      </span>
    );
  };

  return (
    <header className="h-[64px] min-h-[64px] bg-[#FFFFFF] border-b border-[#E5E7EB] px-4 lg:px-6 flex items-center justify-between z-30 shrink-0">
      {/* Brand & Boutique */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[10px] bg-[#F97316] flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[18px] font-bold text-[#17191C] tracking-tight">
            Studio Olmart
          </span>
        </div>

        <div className="h-6 w-[1px] bg-[#E5E7EB] mx-1 hidden sm:block" />

        <div className="hidden sm:block max-w-[180px] truncate">
          <span className="text-[14px] font-semibold text-[#17191C] truncate block" title={shopName}>
            {shopName}
          </span>
        </div>

        <div className="hidden md:flex items-center ml-2">
          {renderSaveStatus()}
        </div>
      </div>

      {/* Viewport Switcher */}
      <div className="hidden lg:flex items-center bg-[#F7F8FA] p-1 border border-[#E5E7EB] rounded-[10px]">
        <button
          type="button"
          onClick={() => setViewport("desktop")}
          className={`h-[32px] px-3 rounded-[8px] text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            viewport === "desktop"
              ? "bg-[#FFFFFF] text-[#F97316] shadow-xs"
              : "text-[#667085] hover:text-[#17191C]"
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Bureau</span>
        </button>
        <button
          type="button"
          onClick={() => setViewport("tablet")}
          className={`h-[32px] px-3 rounded-[8px] text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            viewport === "tablet"
              ? "bg-[#FFFFFF] text-[#F97316] shadow-xs"
              : "text-[#667085] hover:text-[#17191C]"
          }`}
        >
          <Tablet className="w-3.5 h-3.5" />
          <span>Tablette</span>
        </button>
        <button
          type="button"
          onClick={() => setViewport("mobile")}
          className={`h-[32px] px-3 rounded-[8px] text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            viewport === "mobile"
              ? "bg-[#FFFFFF] text-[#F97316] shadow-xs"
              : "text-[#667085] hover:text-[#17191C]"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        {shopSlug ? (
          <a
            href={`/store/${shopSlug}`}
            target="_blank"
            rel="noreferrer"
            className="h-[44px] min-h-[44px] px-4 rounded-[10px] border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#F7F8FA] text-[#17191C] text-[14px] font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-[#667085]" />
            <span>Aperçu</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={() => setViewport(viewport === "desktop" ? "mobile" : "desktop")}
            className="h-[44px] min-h-[44px] px-4 rounded-[10px] border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#F7F8FA] text-[#17191C] text-[14px] font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-[#667085]" />
            <span>Aperçu</span>
          </button>
        )}

        <button
          type="button"
          onClick={onRequestPublication || onPublish}
          className={`h-[44px] min-h-[44px] px-5 rounded-[10px] text-[14px] font-semibold text-white flex items-center gap-2 transition-colors cursor-pointer shadow-xs ${
            isPendingReview
              ? "bg-[#EA580C] hover:bg-[#C2410C]"
              : isPublished
              ? "bg-[#16A34A] hover:bg-[#15803D]"
              : "bg-[#F97316] hover:bg-[#EA580C]"
          }`}
        >
          {isPendingReview ? (
            <>
              <Clock className="w-4 h-4 animate-spin" />
              <span>En vérification</span>
            </>
          ) : isPublished ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Publié</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Publier</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
