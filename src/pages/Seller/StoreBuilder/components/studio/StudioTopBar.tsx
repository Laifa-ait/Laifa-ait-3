import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Send,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  History,
  Save,
} from "lucide-react";
import { SaveStatus } from "../../hooks/useSellerStudio";
import { StoreHistoryEntry } from "../../../../../domains/seller/customPage.types";
import { StudioHistoryModal } from "../topbar/StudioHistoryModal";
import { StudioDirectPublishModal } from "../topbar/StudioDirectPublishModal";

interface StudioTopBarProps {
  viewport: "mobile" | "tablet" | "desktop";
  setViewport: (vp: "mobile" | "tablet" | "desktop") => void;
  saveStatus: SaveStatus;
  shopName?: string;
  shopSlug?: string;
  isPublished?: boolean;
  historyList?: StoreHistoryEntry[];
  onSaveDraft?: () => void;
  onPublish: (changeSummary?: string) => void;
  onRollback?: (versionNumber: number) => void;
}

export const StudioTopBar: React.FC<StudioTopBarProps> = ({
  viewport,
  setViewport,
  saveStatus,
  shopName = "Ma Boutique",
  shopSlug,
  isPublished,
  historyList = [],
  onSaveDraft,
  onPublish,
  onRollback,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [changeSummary, setChangeSummary] = useState("");

  const handleBack = () => {
    const target = location.pathname.startsWith("/dashboard/seller")
      ? "/dashboard/seller"
      : "/seller";
    navigate(target);
  };

  const renderSaveStatus = () => {
    if (saveStatus === "saving") {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium text-[#B45309] bg-[#FFFBEB] border border-[#B45309]/20">
          <span className="w-2 h-2 rounded-full bg-[#B45309] animate-pulse" />
          <span>Enregistrement…</span>
        </span>
      );
    }
    if (saveStatus === "saved") {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium text-[#16A34A] bg-[#F0FDF4] border border-[#16A34A]/20">
          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
          <span>Sauvegardé</span>
        </span>
      );
    }
    if (saveStatus === "error") {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium text-[#DC2626] bg-[#FEF2F2] border border-[#DC2626]/20">
          <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
          <span>Erreur de sauvegarde</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] text-[#667085] bg-[#F8FAFC] border border-[#E5E7EB]">
        <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
        <span>Brouillon synchronisé</span>
      </span>
    );
  };

  return (
    <>
      <header className="h-[60px] min-h-[60px] bg-[#FFFFFF] border-b border-[#E5E7EB] px-4 lg:px-5 flex items-center justify-between z-30 shrink-0 gap-3">
        {/* Left: Clear Back Button + Brand & Shop Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={handleBack}
            className="h-9 px-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] hover:bg-[#FFF7ED] hover:border-[#FDBA74] text-[#17191C] hover:text-[#EA580C] text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Retourner au tableau de bord vendeur"
          >
            <ArrowLeft className="w-4 h-4 text-[#F97316]" />
            <span>Retour</span>
          </button>

          <div className="h-5 w-[1px] bg-[#E5E7EB] hidden sm:block shrink-0" />

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#F97316] flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[14px] font-bold text-[#17191C] tracking-tight truncate block">
                {shopName}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#667085] block leading-none">
                Studio Olmart
              </span>
            </div>
          </div>

          <div className="hidden xl:flex items-center ml-2 shrink-0">
            {renderSaveStatus()}
          </div>
        </div>

        {/* Center: Viewport Switcher */}
        <div className="hidden lg:flex items-center bg-[#F7F8FA] p-1 border border-[#E5E7EB] rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setViewport("desktop")}
            className={`h-8 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewport === "desktop"
                ? "bg-[#FFFFFF] text-[#F97316] shadow-2xs"
                : "text-[#667085] hover:text-[#17191C]"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Bureau</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport("tablet")}
            className={`h-8 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewport === "tablet"
                ? "bg-[#FFFFFF] text-[#F97316] shadow-2xs"
                : "text-[#667085] hover:text-[#17191C]"
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablette</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport("mobile")}
            className={`h-8 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewport === "mobile"
                ? "bg-[#FFFFFF] text-[#F97316] shadow-2xs"
                : "text-[#667085] hover:text-[#17191C]"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Right: Save, History, Public Store Link & Publish */}
        <div className="flex items-center gap-2 shrink-0">
          {onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={saveStatus === "saving"}
              className="h-9 px-3 rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#F7F8FA] text-[#344054] text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Enregistrer le brouillon maintenant"
            >
              <Save className="w-3.5 h-3.5 text-[#F97316]" />
              <span className="hidden sm:inline">Enregistrer</span>
            </button>
          )}

          {historyList.length > 0 && onRollback && (
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="h-9 px-3 rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#F7F8FA] text-[#344054] text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Historique des versions publiées"
            >
              <History className="w-3.5 h-3.5 text-[#667085]" />
              <span className="hidden xl:inline">Versions ({historyList.length})</span>
            </button>
          )}

          {shopSlug && (
            <a
              href={`/store/${shopSlug}`}
              target="_blank"
              rel="noreferrer"
              className="h-9 px-3 rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#F7F8FA] text-[#17191C] text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Ouvrir votre vitrine publique dans un nouvel onglet"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#667085]" />
              <span className="hidden sm:inline">Voir la boutique</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => setIsPublishModalOpen(true)}
            className={`h-9 px-4 rounded-lg text-[13px] font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
              isPublished
                ? "bg-[#16A34A] hover:bg-[#15803D]"
                : "bg-[#F97316] hover:bg-[#EA580C]"
            }`}
          >
            {isPublished ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Mettre à jour</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Publier la boutique</span>
              </>
            )}
          </button>
        </div>
      </header>

      {onRollback && (
        <StudioHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          historyList={historyList}
          onRollback={onRollback}
        />
      )}

      <StudioDirectPublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        changeSummary={changeSummary}
        setChangeSummary={setChangeSummary}
        onConfirm={() => {
          setIsPublishModalOpen(false);
          onPublish(changeSummary.trim() || undefined);
          setChangeSummary("");
        }}
      />
    </>
  );
};
