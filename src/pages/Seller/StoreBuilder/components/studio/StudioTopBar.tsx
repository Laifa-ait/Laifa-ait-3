import React from "react";
import {
  Check, Loader2, AlertCircle, ExternalLink, Rocket, Undo2, Redo2,
  Monitor, Tablet, Smartphone, ShieldCheck, Command, WifiOff, Clock,
} from "lucide-react";
import { StudioViewport } from "../../store/useStudioStore";
import { SaveStatus } from "../../hooks/useStudioSaveManager";
import type { StoreHistoryEntry } from "../../../../../domains/seller/customPage.types";

interface StudioTopBarProps {
  shopName?: string;
  shopSlug?: string;
  sellerId?: string;
  isPublished?: boolean;
  historyList?: StoreHistoryEntry[];
  saveStatus: SaveStatus;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  viewport: StudioViewport;
  setViewport?: (vp: StudioViewport) => void;
  onViewportChange?: (vp: StudioViewport) => void;
  previewMode?: "edit" | "preview";
  onPreviewModeChange?: (mode: "edit" | "preview") => void;
  auditScore?: number;
  onOpenAudit?: () => void;
  onOpenCommandPalette?: () => void;
  onSaveDraft?: () => void;
  onPublish: (changeSummary?: string) => void;
  onRollback?: (versionNumber: number) => void;
  showLeftSidebar?: boolean;
  onToggleLeftSidebar?: () => void;
  showRightSidebar?: boolean;
  onToggleRightSidebar?: () => void;
  onToggleBothSidebars?: () => void;
}

export const StudioTopBar: React.FC<StudioTopBarProps> = ({
  shopName, shopSlug, sellerId, saveStatus,
  canUndo = false, canRedo = false, onUndo, onRedo,
  viewport, setViewport, onViewportChange,
  previewMode = "edit", onPreviewModeChange,
  auditScore = 92, onOpenAudit, onOpenCommandPalette,
  onSaveDraft, onPublish,
}) => {
  const handleViewport = (vp: StudioViewport) => {
    setViewport?.(vp);
    onViewportChange?.(vp);
  };

  const renderSaveStatus = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50/90 border border-amber-200/80 px-2.5 py-1 rounded-md text-[11px] font-bold">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="hidden sm:inline">Enregistrement...</span>
          </div>
        );
      case "retrying":
        return (
          <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-md text-[11px] font-bold">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="hidden sm:inline">Nouvelle tentative...</span>
          </div>
        );
      case "unsaved":
        return (
          <button type="button" onClick={onSaveDraft} title="Cliquez pour sauvegarder immédiatement" className="flex items-center gap-1.5 text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer">
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Modifications non enregistrées</span>
          </button>
        );
      case "offline":
        return (
          <button type="button" onClick={onSaveDraft} title="Connexion perdue — cliquez pour réessayer" className="flex items-center gap-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer">
            <WifiOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Connexion perdue</span>
          </button>
        );
      case "conflict":
        return (
          <button type="button" onClick={onSaveDraft} title="Conflit multi-appareils détecté" className="flex items-center gap-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Échec de sauvegarde (Conflit)</span>
          </button>
        );
      case "error":
        return (
          <button type="button" onClick={onSaveDraft} title="Cliquez pour relancer la sauvegarde" className="flex items-center gap-1.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Échec de sauvegarde</span>
          </button>
        );
      case "saved":
      case "idle":
      default:
        return (
          <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50/90 border border-emerald-200/80 px-2.5 py-1 rounded-md text-[11px] font-bold">
            <Check className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sauvegardé</span>
          </div>
        );
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200/80 px-3 sm:px-5 flex items-center justify-between gap-2 sticky top-0 z-30 shrink-0 shadow-[0_1px_2px_rgba(1,28,64,0.03)]">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-[#011C40] text-white flex items-center justify-center font-black text-xs tracking-wider shrink-0 shadow-xs">OS</div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xs sm:text-sm font-black text-[#011C40] truncate">{shopName || "Ma Boutique Olmart"}</h1>
            <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest bg-[#023859]/10 text-[#023859]">Studio 3.0</span>
          </div>
          <p className="text-[10px] text-slate-400 truncate hidden sm:block">Éditeur Visuel Temps Réel</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="flex items-center bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/70">
          <button type="button" onClick={onUndo} disabled={!canUndo} title="Annuler (Ctrl+Z)" className="p-1.5 rounded-md text-slate-600 hover:text-[#011C40] hover:bg-white disabled:opacity-35 disabled:pointer-events-none transition-all cursor-pointer">
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={onRedo} disabled={!canRedo} title="Rétablir (Ctrl+Y)" className="p-1.5 rounded-md text-slate-600 hover:text-[#011C40] hover:bg-white disabled:opacity-35 disabled:pointer-events-none transition-all cursor-pointer">
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="hidden md:flex items-center bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/70">
          {([
            { id: "desktop", label: "Bureau", icon: Monitor },
            { id: "tablet", label: "Tablette", icon: Tablet },
            { id: "mobile", label: "Mobile", icon: Smartphone },
          ] as const).map((vp) => {
            const Icon = vp.icon;
            const active = viewport === vp.id;
            return (
              <button
                key={vp.id}
                type="button"
                onClick={() => handleViewport(vp.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  active ? "bg-white text-[#011C40] shadow-2xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{vp.label}</span>
              </button>
            );
          })}
        </div>

        {onPreviewModeChange && (
          <button
            type="button"
            onClick={() => onPreviewModeChange(previewMode === "edit" ? "preview" : "edit")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
              previewMode === "preview" ? "bg-[#023859] text-white border-[#023859]" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {previewMode === "preview" ? "Quitter l'aperçu" : "Aperçu client"}
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {renderSaveStatus()}

        {onOpenAudit && (
          <button type="button" onClick={onOpenAudit} title="Audit Qualité & Accessibilité" className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-[#011C40] text-[11px] font-bold transition-colors cursor-pointer">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{auditScore}%</span>
          </button>
        )}

        {onOpenCommandPalette && (
          <button type="button" onClick={onOpenCommandPalette} title="Palette de commandes (Ctrl+K)" className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-slate-600 text-[11px] font-bold transition-colors cursor-pointer">
            <Command className="w-3 h-3" /><span>K</span>
          </button>
        )}

        {(shopSlug || sellerId) && (
          <a href={`/store/${shopSlug || sellerId}`} target="_blank" rel="noopener noreferrer" title="Voir la boutique en ligne" className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#011C40] hover:bg-slate-50 transition-colors">
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        <button type="button" onClick={() => onPublish()} className="flex items-center gap-1.5 bg-[#011C40] hover:bg-[#023859] text-white px-3 py-1.5 rounded-lg text-xs font-black shadow-xs transition-all cursor-pointer">
          <Rocket className="w-3.5 h-3.5" />
          <span>Publier</span>
        </button>
      </div>
    </header>
  );
};
