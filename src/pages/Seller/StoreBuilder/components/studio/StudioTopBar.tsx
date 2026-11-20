import React, { useMemo, useState } from "react";
import { ArrowLeft, Undo2, Redo2, Monitor, Tablet, Smartphone, Eye, Pencil } from "lucide-react";
import { StudioViewport } from "../../store/useStudioStore";
import { SaveStatus } from "../../hooks/useStudioSaveManager";
import type { CustomPageSection, SellerStoreConfig, StoreHistoryEntry } from "../../../../../domains/seller/customPage.types";
import type { Product } from "../../../../../domains/product/product.types";
import type { CatalogLoadStatus } from "../../hooks/studioCatalogLoader";
import { StudioHistoryModal } from "../topbar/StudioHistoryModal";
import { StudioDirectPublishModal } from "../topbar/StudioDirectPublishModal";
import { StudioTopBarRightActions } from "./StudioTopBarRightActions";
import { StudioNavMode } from "./studio.types";
import { evaluatePublishReadiness } from "../../utils/publishReadinessChecks";

interface StudioTopBarProps {
  shopName?: string;
  shopSlug?: string;
  sellerId?: string;
  isPublished?: boolean;
  isPublishing?: boolean;
  versionNumber?: number;
  draftRevision?: number;
  sectionCount?: number;
  productCount?: number;
  sections?: CustomPageSection[];
  products?: Product[];
  catalogStatus?: CatalogLoadStatus;
  storeConfig?: SellerStoreConfig | null;
  onSelectNavMode?: (mode: StudioNavMode) => void;
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
  onSaveDraft?: () => unknown | Promise<unknown>;
  onPublish: (changeSummary?: string) => boolean | void | Promise<boolean | void>;
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
  shopName, shopSlug, sellerId, isPublished = false, isPublishing = false, versionNumber = 1, draftRevision,
  sectionCount, productCount, sections, products = [], catalogStatus, storeConfig, onSelectNavMode,
  historyList = [], saveStatus, canUndo = false, canRedo = false, onUndo, onRedo,
  viewport, setViewport, onViewportChange, previewMode = "edit", onPreviewModeChange,
  onOpenAudit, onOpenCommandPalette, onSaveDraft, onPublish, onRollback,
  onExitStudio, onOpenSponsorships,
}) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [changeSummary, setChangeSummary] = useState("");
  const [localPublishing, setLocalPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const readinessReport = useMemo(() => {
    if (!isPublishModalOpen || !sections) return undefined;
    return evaluatePublishReadiness({
      storeConfig, sections, products, catalogStatus,
      draftRevision,
      currentVersionNumber: versionNumber,
      hasUnsavedChanges: saveStatus === "unsaved" || saveStatus === "saving",
    });
  }, [isPublishModalOpen, catalogStatus, draftRevision, products, saveStatus, sections, storeConfig, versionNumber]);

  const effectivePublishing = isPublishing || localPublishing;
  const publishingLockRef = React.useRef(false);

  const handleConfirmPublish = async () => {
    if (effectivePublishing || publishingLockRef.current) return;
    publishingLockRef.current = true;
    setPublishError(null);
    try {
      const outcome = onPublish(changeSummary.trim() || undefined);
      if (outcome !== null && typeof outcome === "object" && "then" in outcome && typeof outcome.then === "function") {
        setLocalPublishing(true);
        const resolved = await outcome;
        if (resolved === false) {
          setPublishError("La publication a échoué. Vérifiez votre connexion ou corrigez les blocages puis réessayez.");
          return;
        }
      } else if (outcome === false) {
        setPublishError("La publication a échoué. Veuillez réessayer.");
        return;
      }
      setChangeSummary("");
      setIsPublishModalOpen(false);
    } catch (err: unknown) {
      setPublishError(err instanceof Error ? err.message : "Échec de la publication. Veuillez réessayer.");
    } finally {
      publishingLockRef.current = false;
      setLocalPublishing(false);
    }
  };

  const handleViewport = (vp: StudioViewport) => {
    setViewport?.(vp);
    onViewportChange?.(vp);
  };

  return (
    <>
      <header className="h-[54px] bg-white border-b border-[#E3E5E8] px-3 sm:px-4 flex items-center justify-between gap-4 sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {onExitStudio && (
            <button
              type="button" onClick={onExitStudio} aria-label="Retour au tableau de bord" title="Retour au tableau de bord vendeur"
              className="w-8 h-8 rounded-lg border border-[#E3E5E8] hover:bg-[#F6F7F9] text-slate-600 hover:text-[#111827] flex items-center justify-center transition-colors cursor-pointer shrink-0"
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
              {typeof sectionCount === "number" && (<><span aria-hidden="true">·</span><span>{sectionCount} sections</span></>)}
              {typeof productCount === "number" && productCount > 0 && (<><span aria-hidden="true">·</span><span>{productCount} produits</span></>)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
            <button
              type="button" onClick={onUndo} disabled={!canUndo} title="Annuler (Ctrl+Z)" aria-label="Annuler"
              className="w-7 h-7 flex items-center justify-center rounded-md text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button" onClick={onRedo} disabled={!canRedo} title="Rétablir (Ctrl+Y)" aria-label="Rétablir"
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
                  key={vp.id} type="button" onClick={() => handleViewport(vp.id)}
                  className={`h-7 px-2.5 rounded-md text-[11.5px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /><span className="hidden lg:inline">{vp.label}</span>
                </button>
              );
            })}
          </div>

          {onPreviewModeChange && (
            <button
              type="button" onClick={() => onPreviewModeChange(previewMode === "edit" ? "preview" : "edit")}
              className={`h-8 px-2.5 rounded-lg text-[11.5px] font-medium border flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                previewMode === "preview" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {previewMode === "preview" ? <Pencil className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{previewMode === "preview" ? "Édition" : "Aperçu client"}</span>
            </button>
          )}
        </div>

        <StudioTopBarRightActions
          saveStatus={saveStatus} shopSlug={shopSlug} sellerId={sellerId} isPublished={isPublished}
          onSaveDraft={onSaveDraft} onOpenHistory={onRollback ? () => setIsHistoryOpen(true) : undefined}
          onOpenAudit={onOpenAudit} onOpenCommandPalette={onOpenCommandPalette}
          onOpenSponsorships={onOpenSponsorships} onOpenPublishModal={() => setIsPublishModalOpen(true)}
        />
      </header>

      {onRollback && (
        <StudioHistoryModal
          isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} historyList={historyList}
          currentPublishedVersion={isPublished ? versionNumber : undefined}
          draftSectionCount={sections?.length ?? sectionCount}
          hasUnsavedChanges={saveStatus === "unsaved" || saveStatus === "saving"}
          onRollback={onRollback}
        />
      )}

      <StudioDirectPublishModal
        isOpen={isPublishModalOpen}
        onClose={() => { setPublishError(null); setIsPublishModalOpen(false); }}
        changeSummary={changeSummary} setChangeSummary={setChangeSummary}
        isPublishing={effectivePublishing} publishError={publishError}
        readinessReport={readinessReport} onNavigateToFix={onSelectNavMode}
        onConfirm={() => void handleConfirmPublish()}
      />
    </>
  );
};
