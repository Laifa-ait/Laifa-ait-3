import React, { useState } from "react";
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
import { SaveStatus } from "../hooks/useSellerStudio";
import { StoreHistoryEntry } from "../../../../domains/seller/customPage.types";
import { SubscriptionRequest } from "../../../../domains/seller/subscription.types";
import { StudioHistoryModal } from "./topbar/StudioHistoryModal";
import { StudioDirectPublishModal } from "./topbar/StudioDirectPublishModal";

interface StudioTopBarProps {
  viewport: "mobile" | "tablet" | "desktop";
  setViewport: (vp: "mobile" | "tablet" | "desktop") => void;
  saveStatus: SaveStatus;
  historyList: StoreHistoryEntry[];
  onPublish: (changeSummary?: string) => void;
  onRollback: (versionNumber: number) => void;
  shopName?: string;
  shopSlug?: string;
  isPublished?: boolean;
  pendingRequest?: SubscriptionRequest | null;
  onRequestPublication?: () => void;
}

export const StudioTopBar: React.FC<StudioTopBarProps> = ({
  viewport,
  setViewport,
  saveStatus,
  historyList,
  onPublish,
  onRollback,
  shopName = "Ma Boutique",
  shopSlug,
  isPublished,
  pendingRequest,
  onRequestPublication,
}) => {
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDirectPublishModal, setShowDirectPublishModal] = useState(false);
  const [changeSummary, setChangeSummary] = useState("");

  const handleConfirmDirectPublish = () => {
    onPublish(changeSummary);
    setShowDirectPublishModal(false);
    setChangeSummary("");
  };

  const isPendingReview =
    pendingRequest &&
    ["pending", "payment_requested", "payment_declared"].includes(pendingRequest.status);

  // Status mapping per strict Phase B specification
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
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] text-[#15803D] bg-[#F0FDF4] border border-[#15803D]/20">
          <span className="w-2 h-2 rounded-full bg-[#15803D]" />
          <span>Modifications enregistrées</span>
        </span>
      );
    }
    if (saveStatus === "error") {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] text-[#B42318] bg-[#FEF2F2] border border-[#B42318]/20">
          <span className="w-2 h-2 rounded-full bg-[#B42318]" />
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
    <header className="h-[64px] min-h-[64px] bg-[#FFFFFF] border-b border-[#E4E7EC] px-4 lg:px-6 flex items-center justify-between z-30 shrink-0">
      {/* 1. Logo Olmart Studio + 2. Séparateur + 3. Nom de boutique + 4. Sauvegarde */}
      <div className="flex items-center gap-3">
        {/* Logo / identité Olmart */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#F97316] flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[20px] font-[600] text-[#17191C] tracking-tight">
            OLMART
          </span>
          <span className="text-[12px] font-semibold text-[#F97316] bg-[#FFF7ED] border border-[#FDBA74] px-2 py-0.5 rounded-lg">
            Studio
          </span>
        </div>

        {/* Séparateur vertical */}
        <div className="h-6 w-[1px] bg-[#E4E7EC] mx-1 hidden sm:block" />

        {/* Nom de la boutique */}
        <div className="hidden sm:block max-w-[180px] truncate">
          <span className="text-[14px] font-semibold text-[#17191C] truncate block" title={shopName}>
            {shopName}
          </span>
        </div>

        {/* Indicateur d'état de sauvegarde */}
        <div className="hidden md:flex items-center ml-2">
          {renderSaveStatus()}
        </div>
      </div>

      {/* 5. Espace flexible (implicit flex gap/justify) */}
      <div className="flex-1" />

      {/* Dispositif responsive (Bureau / Tablette / Mobile) */}
      <div className="hidden lg:flex items-center bg-[#F5F6F8] p-1 border border-[#E4E7EC] rounded-lg mr-3">
        <button
          onClick={() => setViewport("desktop")}
          className={`h-[32px] px-2.5 rounded-md text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            viewport === "desktop"
              ? "bg-[#FFFFFF] text-[#F97316] shadow-xs"
              : "text-[#667085] hover:text-[#17191C]"
          }`}
          title="Aperçu Ordinateur"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Bureau</span>
        </button>
        <button
          onClick={() => setViewport("tablet")}
          className={`h-[32px] px-2.5 rounded-md text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            viewport === "tablet"
              ? "bg-[#FFFFFF] text-[#F97316] shadow-xs"
              : "text-[#667085] hover:text-[#17191C]"
          }`}
          title="Aperçu Tablette"
        >
          <Tablet className="w-3.5 h-3.5" />
          <span>Tablette</span>
        </button>
        <button
          onClick={() => setViewport("mobile")}
          className={`h-[32px] px-2.5 rounded-md text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            viewport === "mobile"
              ? "bg-[#FFFFFF] text-[#F97316] shadow-xs"
              : "text-[#667085] hover:text-[#17191C]"
          }`}
          title="Aperçu Mobile"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile</span>
        </button>
      </div>

      {/* 6. Bouton Aperçu + 7. Bouton Publier */}
      <div className="flex items-center gap-2.5">
        {shopSlug ? (
          <a
            href={`/store/${shopSlug}`}
            target="_blank"
            rel="noreferrer"
            className="h-[40px] px-4 rounded-lg border border-[#E4E7EC] bg-[#FFFFFF] hover:bg-[#F5F6F8] text-[#17191C] text-[14px] font-[500] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-[#667085]" />
            <span>Aperçu</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={() => setViewport(viewport === "desktop" ? "mobile" : "desktop")}
            className="h-[40px] px-4 rounded-lg border border-[#E4E7EC] bg-[#FFFFFF] hover:bg-[#F5F6F8] text-[#17191C] text-[14px] font-[500] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-[#667085]" />
            <span>Aperçu</span>
          </button>
        )}

        {/* Bouton Principal « Publier » */}
        {onRequestPublication ? (
          <button
            onClick={onRequestPublication}
            className={`h-[40px] px-4 rounded-lg text-[14px] font-[500] text-white flex items-center gap-2 transition-colors cursor-pointer shadow-xs ${
              isPendingReview
                ? "bg-[#B45309] hover:bg-[#92400E]"
                : isPublished
                ? "bg-[#15803D] hover:bg-[#166534]"
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
                <span>Publier</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Publier</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => setShowDirectPublishModal(true)}
            className="h-[40px] px-4 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg text-[14px] font-[500] flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span>Publier</span>
          </button>
        )}
      </div>

      {/* Modals */}
      <StudioHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        historyList={historyList}
        onRollback={onRollback}
      />

      <StudioDirectPublishModal
        isOpen={showDirectPublishModal}
        onClose={() => setShowDirectPublishModal(false)}
        changeSummary={changeSummary}
        setChangeSummary={setChangeSummary}
        onConfirm={handleConfirmDirectPublish}
      />
    </header>
  );
};
