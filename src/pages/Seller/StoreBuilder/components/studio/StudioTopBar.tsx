import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ExternalLink,
  Send,
  ArrowLeft,
  History,
  Save,
  PanelLeft,
  PanelRight,
  Search,
} from "lucide-react";
import { SaveStatus } from "../../hooks/useSellerStudio";
import { StoreHistoryEntry } from "../../../../../domains/seller/customPage.types";
import { StudioHistoryModal } from "../topbar/StudioHistoryModal";
import { StudioDirectPublishModal } from "../topbar/StudioDirectPublishModal";
import { StudioTopBarViewport } from "../topbar/StudioTopBarViewport";

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
  showLeftSidebar?: boolean;
  onToggleLeftSidebar?: () => void;
  showRightSidebar?: boolean;
  onToggleRightSidebar?: () => void;
  onToggleBothSidebars?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
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
  showLeftSidebar = true,
  onToggleLeftSidebar,
  showRightSidebar = true,
  onToggleRightSidebar,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
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
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#B45309] bg-[#FFFBEB] border border-[#B45309]/20">
          <span className="w-2 h-2 rounded-full bg-[#B45309] animate-pulse" />
          <span>Sauvegarde…</span>
        </span>
      );
    }
    if (saveStatus === "saved") {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#16A34A] bg-[#F0FDF4] border border-[#16A34A]/20">
          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
          <span>Synchronisé</span>
        </span>
      );
    }
    if (saveStatus === "error") {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#DC2626] bg-[#FEF2F2] border border-[#DC2626]/20">
          <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
          <span>Erreur</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] text-[#023859] bg-[#F0F7FA] border border-[#54ACBF]/30 font-semibold">
        <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
        <span>Prêt</span>
      </span>
    );
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shadow-2xs select-none">
      {/* Left: Back & Sidebar Toggles */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleBack}
          className="p-2 text-slate-600 hover:text-[#011C40] hover:bg-[#F0F7FA] rounded-lg transition-colors cursor-pointer"
          title="Retour au Tableau de bord"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={onToggleLeftSidebar}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            showLeftSidebar
              ? "text-[#023859] bg-[#F0F7FA] border border-[#54ACBF]/40"
              : "text-slate-600 hover:text-[#011C40] hover:bg-slate-100 border border-transparent"
          }`}
          title="Afficher/Masquer le panneau de navigation"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <span className="text-xs font-black text-[#011C40] tracking-tight max-w-[150px] sm:max-w-[220px] truncate">
          {shopName}
        </span>
      </div>

      {/* Center: Undo/Redo & Viewport Switcher */}
      <StudioTopBarViewport
        viewport={viewport}
        setViewport={setViewport}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={onUndo}
        onRedo={onRedo}
      />

      {/* Right: Actions & Publishing */}
      <div className="flex items-center gap-1.5">
        {renderSaveStatus()}

        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("studio:open-command-palette"))}
          className="h-8 px-2.5 text-slate-600 hover:text-[#023859] bg-slate-50 hover:bg-[#F0F7FA] border border-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Recherche rapide & Commandes (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-[#023859]" />
          <span className="hidden xl:inline">Actions</span>
          <kbd className="hidden lg:inline px-1 py-0.5 text-[9px] font-mono bg-white border border-slate-200 rounded text-slate-500">
            ⌘K
          </kbd>
        </button>

        {onSaveDraft && (
          <button
            type="button"
            onClick={onSaveDraft}
            className="p-2 text-slate-600 hover:text-[#023859] hover:bg-[#F0F7FA] rounded-lg transition-colors cursor-pointer"
            title="Enregistrer manuellement"
          >
            <Save className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsHistoryOpen(true)}
          className="p-2 text-slate-600 hover:text-[#023859] hover:bg-[#F0F7FA] rounded-lg transition-colors cursor-pointer"
          title="Historique des versions"
        >
          <History className="w-4 h-4" />
        </button>

        {shopSlug && isPublished && (
          <a
            href={`/store/${shopSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-600 hover:text-[#023859] hover:bg-[#F0F7FA] rounded-lg transition-colors"
            title="Voir la boutique publique"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        <button
          type="button"
          onClick={onToggleRightSidebar}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            showRightSidebar
              ? "text-[#023859] bg-[#F0F7FA] border border-[#54ACBF]/40"
              : "text-slate-600 hover:text-[#011C40] hover:bg-slate-100 border border-transparent"
          }`}
          title="Afficher/Masquer l'inspecteur"
        >
          <PanelRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setIsPublishModalOpen(true)}
          className="h-9 px-3.5 rounded-xl bg-[#023859] hover:bg-[#011C40] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer ml-1"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Publier</span>
        </button>
      </div>

      <StudioHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyList={historyList}
        onRollback={(versionNumber) => onRollback?.(versionNumber)}
      />

      <StudioDirectPublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        changeSummary={changeSummary}
        setChangeSummary={setChangeSummary}
        onConfirm={() => {
          onPublish(changeSummary);
          setIsPublishModalOpen(false);
          setChangeSummary("");
        }}
      />
    </header>
  );
};
