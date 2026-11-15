import React from "react";
import { UploadCloud, Menu, ArrowLeft, Undo2, Redo2, AlertCircle, Loader2, Check, Clock, WifiOff } from "lucide-react";
import { SaveStatus } from "../../hooks/useStudioSaveManager";

interface MobileStudioHeaderProps {
  shopName?: string;
  isPublished?: boolean;
  saveStatus?: SaveStatus;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onSaveDraft?: () => unknown | Promise<unknown>;
  onPublish: () => void;
  onOpenMenu?: () => void;
  onExitStudio?: () => void;
}

export const MobileStudioHeader: React.FC<MobileStudioHeaderProps> = ({
  shopName,
  isPublished,
  saveStatus = "saved",
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onSaveDraft,
  onPublish,
  onOpenMenu,
  onExitStudio,
}) => {
  const handleBack = () => {
    if (onExitStudio) {
      onExitStudio();
    } else if (typeof window !== "undefined") {
      window.location.assign("/dashboard/seller");
    }
  };

  const renderMobileSaveStatus = () => {
    if (saveStatus === "saving" || saveStatus === "retrying") {
      return (
        <span data-testid="mobile-save-status-saving" className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 shrink-0">
          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-label="Enregistrement" />
        </span>
      );
    }
    if (saveStatus === "unsaved") {
      return (
        <button
          type="button"
          data-testid="mobile-save-status-unsaved"
          onClick={() => { void onSaveDraft?.(); }}
          title="Modifications non enregistrées — appuyer pour sauvegarder"
          aria-label="Modifications non enregistrées"
          className="h-7 px-2 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>Non enregistré</span>
        </button>
      );
    }
    if (saveStatus === "error" || saveStatus === "conflict" || saveStatus === "offline") {
      return (
        <button
          type="button"
          data-testid="mobile-save-status-error"
          onClick={() => { void onSaveDraft?.(); }}
          title="Erreur de sauvegarde — appuyer pour réessayer"
          aria-label="Erreur sauvegarde"
          className="h-7 px-2 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0"
        >
          {saveStatus === "offline" ? <WifiOff className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
          <span>{saveStatus === "conflict" ? "Conflit" : saveStatus === "offline" ? "Hors ligne" : "Erreur"}</span>
        </button>
      );
    }
    return (
      <span data-testid="mobile-save-status-saved" className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 shrink-0" title="Sauvegardé">
        <Check className="w-4 h-4 text-emerald-600" aria-label="Sauvegardé" />
      </span>
    );
  };

  return (
    <div className="md:hidden h-[52px] min-h-[52px] bg-white border-b border-slate-200 px-2.5 flex items-center justify-between gap-1.5 z-20 select-none shrink-0">
      <div className="flex items-center gap-1 min-w-0">
        <button
          type="button"
          onClick={handleBack}
          className="h-9 w-9 rounded-lg border border-slate-200 bg-white active:bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 cursor-pointer"
          title="Retour au Tableau de Bord"
          aria-label="Retour au Tableau de Bord"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {onOpenMenu && (
          <button
            type="button"
            data-testid="mobile-menu-open-btn"
            onClick={onOpenMenu}
            className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white active:bg-slate-100 text-slate-800 font-medium text-[12px] flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
            aria-label="Ouvrir le menu Studio"
          >
            <Menu className="w-4 h-4" />
            <span>Menu</span>
          </button>
        )}

        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg shrink-0">
          <button
            type="button"
            data-testid="mobile-undo-btn"
            disabled={!canUndo}
            onClick={onUndo}
            aria-label="Annuler"
            title="Annuler"
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-600 hover:bg-white disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            data-testid="mobile-redo-btn"
            disabled={!canRedo}
            onClick={onRedo}
            aria-label="Rétablir"
            title="Rétablir"
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-600 hover:bg-white disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {shopName && (
          <span className="text-[12px] font-semibold text-slate-900 truncate hidden sm:inline">
            {shopName}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {renderMobileSaveStatus()}

        <button
          type="button"
          data-testid="mobile-publish-btn"
          onClick={onPublish}
          className="h-9 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-[12px] font-semibold text-white flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>{isPublished ? "Mettre à jour" : "Publier"}</span>
        </button>
      </div>
    </div>
  );
};

