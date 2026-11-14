import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, Loader2, AlertCircle, ExternalLink, ShieldCheck, Command,
  WifiOff, Clock, History, MoreHorizontal, Megaphone, UploadCloud,
} from "lucide-react";
import { SaveStatus } from "../../hooks/useStudioSaveManager";

interface StudioTopBarRightActionsProps {
  saveStatus: SaveStatus;
  shopSlug?: string;
  sellerId?: string;
  isPublished: boolean;
  onSaveDraft?: () => void | Promise<unknown>;
  onOpenHistory?: () => void;
  onOpenAudit?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenSponsorships?: () => void;
  onOpenPublishModal: () => void;
}

export const StudioTopBarRightActions: React.FC<StudioTopBarRightActionsProps> = ({
  saveStatus, shopSlug, sellerId, isPublished,
  onSaveDraft, onOpenHistory, onOpenAudit, onOpenCommandPalette,
  onOpenSponsorships, onOpenPublishModal,
}) => {
  const navigate = useNavigate();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const handleOpenStorefront = async () => {
    const targetIdentifier = shopSlug || sellerId;
    if (!targetIdentifier) return;
    if ((saveStatus === "unsaved" || saveStatus === "error") && onSaveDraft) {
      await onSaveDraft();
    }
    navigate(`/store/${targetIdentifier}?preview=draft`);
  };

  const renderSaveStatus = () => {
    if (saveStatus === "saving" || saveStatus === "retrying") {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-amber-700 whitespace-nowrap shrink-0">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="hidden lg:inline">
            {saveStatus === "retrying" ? "Nouvelle tentative..." : "Enregistrement..."}
          </span>
        </span>
      );
    }
    if (saveStatus === "unsaved") {
      return (
        <button
          type="button"
          onClick={onSaveDraft}
          title="Sauvegarder les modifications"
          className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-sky-700 hover:text-sky-900 cursor-pointer whitespace-nowrap shrink-0"
        >
          <Clock className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Non enregistré</span>
        </button>
      );
    }
    if (saveStatus === "offline" || saveStatus === "conflict" || saveStatus === "error") {
      return (
        <button
          type="button"
          onClick={onSaveDraft}
          title="Cliquer pour relancer la sauvegarde"
          className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-rose-600 hover:text-rose-800 cursor-pointer whitespace-nowrap shrink-0"
        >
          {saveStatus === "offline" ? <WifiOff className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          <span className="hidden lg:inline">
            {saveStatus === "offline" ? "Hors ligne" : saveStatus === "conflict" ? "Conflit" : "Erreur sauvegarde"}
          </span>
        </button>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-slate-500 whitespace-nowrap shrink-0">
        <Check className="w-3.5 h-3.5 text-emerald-600" />
        <span className="hidden lg:inline">Sauvegardé</span>
      </span>
    );
  };

  return (
    <div className="flex items-center gap-2 shrink-0">
      {renderSaveStatus()}

      <span className="h-4 w-px bg-slate-200 hidden sm:block" aria-hidden="true" />

      {onOpenHistory && (
        <button
          type="button"
          onClick={onOpenHistory}
          data-testid="topbar-history-btn"
          title="Historique des versions publiées"
          aria-label="Historique des versions"
          className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shrink-0"
        >
          <History className="w-3.5 h-3.5" />
        </button>
      )}

      {onOpenAudit && (
        <button
          type="button"
          onClick={onOpenAudit}
          data-testid="topbar-audit-btn"
          title="Audit Qualité & Accessibilité"
          className="hidden sm:inline-flex h-8 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11.5px] font-medium items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
          <span>Audit</span>
        </button>
      )}

      {onOpenCommandPalette && (
        <button
          type="button"
          onClick={onOpenCommandPalette}
          data-testid="topbar-cmd-btn"
          title="Palette de commandes (Ctrl+K)"
          className="hidden lg:inline-flex h-8 px-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px] font-mono font-medium items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Command className="w-3 h-3" />
          <span>K</span>
        </button>
      )}

      {(shopSlug || sellerId) && (
        <button
          type="button"
          onClick={handleOpenStorefront}
          data-testid="topbar-view-store-btn"
          title="Voir la boutique en direct"
          aria-label="Ouvrir la boutique publique"
          className="h-8 px-2.5 rounded-lg border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 text-[11.5px] font-medium transition-colors cursor-pointer shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Voir la boutique</span>
        </button>
      )}

      {onOpenSponsorships && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setMoreMenuOpen((prev) => !prev)}
            aria-label="Plus d'options"
            className="h-8 w-8 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {moreMenuOpen && (
            <div
              className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50"
              onMouseLeave={() => setMoreMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => {
                  setMoreMenuOpen(false);
                  onOpenSponsorships();
                }}
                className="w-full px-3 py-2 text-left text-[12px] font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <Megaphone className="w-3.5 h-3.5 text-slate-500" />
                <span>Promouvoir la boutique</span>
              </button>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        data-testid="topbar-publish-btn"
        onClick={onOpenPublishModal}
        className="h-8 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
      >
        <UploadCloud className="w-3.5 h-3.5" />
        <span>{isPublished ? "Mettre à jour" : "Publier"}</span>
      </button>
    </div>
  );
};
