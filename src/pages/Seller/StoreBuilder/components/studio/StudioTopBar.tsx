import React, { useState } from "react";
import { ArrowLeft, Undo2, Redo2, Monitor, Tablet, Smartphone, Eye, Pencil } from "lucide-react";
import { StudioViewport } from "../../store/useStudioStore";
import { SaveStatus } from "../../hooks/useStudioSaveManager";
import type { StoreHistoryEntry } from "../../../../../domains/seller/customPage.types";
import { StudioHistoryModal } from "../topbar/StudioHistoryModal";
import { StudioDirectPublishModal } from "../topbar/StudioDirectPublishModal";
import { StudioTopBarRightActions } from "./StudioTopBarRightActions";

interface StudioTopBarProps {
  shopName?: string;
  shopSlug?: string;
  sellerId?: string;
  isPublished?: boolean;
  versionNumber?: number;
  sectionCount?: number;
  productCount?: number;
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
  onOpenAudit?: () => void;
  onOpenCommandPalette?: () => void;
  onSaveDraft?: () => void | Promise<unknown>;
  onPublish: (changeSummary?: string) => void;
  onRollback?: (versionNumber: number) => void;
  onExitStudio?: () => void;
  onOpenSponsorships?: () => void;
}

const VIEWPORT_OPTIONS = [
  { id: "desktop", label: "Bureau", icon: Monitor },
  { id: "tablet", label: "Tablette", icon: Tablet },
  { id: "mobile", label: "Mobile", icon: Smartphone },
] as const;

export const StudioTopBar: React.FC<StudioTopBarProps> = ({
  shopName, shopSlug, sellerId, isPublished = false, versionNumber = 1,
  sectionCount, productCount, historyList = [], saveStatus,
  canUndo = false, canRedo = false, onUndo, onRedo,
  viewport, setViewport, onViewportChange,
  previewMode = "edit", onPreviewModeChange,
  onOpenAudit, onOpenCommandPalette, onSaveDraft, onPublish, onRollback,
  onExitStudio, onOpenSponsorships,
}) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [changeSummary, setChangeSummary] = useState("");

  const handleViewport = (vp: StudioViewport) => {
    setViewport?.(vp);
    onViewportChange?.(vp);
  };

  return (
    <>
      <header className="h-[52px] bg-white border-b border-slate-200 px-3 sm:px-4 flex items-center justify-between gap-4 sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {onExitStudio && (
            <button
              type="button"
              onClick={onExitStudio}
              aria-label="Retour au tableau de bord"
              title="Retour au tableau de bord vendeur"
              className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="min-w-0 flex items-baseline gap-2">
            <h1 className="text-[13.5px] font-semibold tracking-tight text-slate-900 truncate max-w-[180px] lg:max-w-[240px]">
              {shopName || "Ma Boutique"}
            </h1>
            <span className="hidden xl:inline-flex items-center gap-1.5 text-[11.5px] text-slate-500 whitespace-nowrap shrink-0 tabular-nums">
              <span aria-hidden="true">·</span>
              <span className={isPublished ? "text-emerald-700 font-medium" : "text-slate-600 font-medium"}>
                {isPublished ? `En ligne v${versionNumber}` : "Brouillon"}
              </span>
              {typeof sectionCount === "number" && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{sectionCount} sections</span>
                </>
              )}
              {typeof productCount === "number" && productCount > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{productCount} produits</span>
                </>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              title="Annuler (Ctrl+Z)"
              aria-label="Annuler"
              className="w-7 h-7 flex items-center justify-center rounded-md text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              title="Rétablir (Ctrl+Y)"
              aria-label="Rétablir"
              className="w-7 h-7 flex items-center justify-center rounded-md text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="hidden md:flex items-center bg-slate-100 p-0.5 rounded-lg">
            {VIEWPORT_OPTIONS.map((vp) => {
              const Icon = vp.icon;
              const active = viewport === vp.id;
              return (
                <button
                  key={vp.id}
                  type="button"
                  onClick={() => handleViewport(vp.id)}
                  className={`h-7 px-2.5 rounded-md text-[11.5px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600 hover:text-slate-900"
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
              className={`h-8 px-2.5 rounded-lg text-[11.5px] font-medium border flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                previewMode === "preview"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {previewMode === "preview" ? <Pencil className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{previewMode === "preview" ? "Édition" : "Aperçu client"}</span>
            </button>
          )}
        </div>

        <StudioTopBarRightActions
          saveStatus={saveStatus}
          shopSlug={shopSlug}
          sellerId={sellerId}
          isPublished={isPublished}
          onSaveDraft={onSaveDraft}
          onOpenHistory={onRollback ? () => setIsHistoryOpen(true) : undefined}
          onOpenAudit={onOpenAudit}
          onOpenCommandPalette={onOpenCommandPalette}
          onOpenSponsorships={onOpenSponsorships}
          onOpenPublishModal={() => setIsPublishModalOpen(true)}
        />
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
          onPublish(changeSummary.trim() || undefined);
          setChangeSummary("");
          setIsPublishModalOpen(false);
        }}
      />
    </>
  );
};
