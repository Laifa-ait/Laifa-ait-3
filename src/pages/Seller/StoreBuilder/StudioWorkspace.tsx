import React, { Suspense, lazy, useMemo, useState } from "react";
import "./studio-tokens.css";
import { StudioTopBar } from "./components/studio/StudioTopBar";
import { StudioColumnsLayout } from "./components/studio/StudioColumnsLayout";
import { MobileStudioColumn } from "./components/studio/MobileStudioNavigation";
import { MobileStudioBar } from "./components/studio/MobileStudioBar";
import { StudioRecoveryAndConflictBar } from "./components/studio/StudioRecoveryAndConflictBar";
const StudioCommandPalette = lazy(() => import("./components/studio/StudioCommandPalette").then((m) => ({ default: m.StudioCommandPalette })));
import { StudioNavMode } from "./components/studio/studio.types";
import { SaveStatus, CatalogLoadStatus } from "./hooks/useSellerStudio";
import { StudioLocalBackupData, areStudioValuesEqual } from "./hooks/studioBackupStorage";
import { useStudioWorkspaceEvents } from "./hooks/useStudioWorkspaceEvents";
import { applyMediaToSection } from "./utils/studioMediaHandler";
import { replaceMediaUrlInSections } from "./utils/studioMediaValidation";
import { buildPendingStoreConfigPatch, hasPendingStoreConfigChanges, extractSaveErrorMessage } from "./utils/studioConfigSanitizers";
import { StudioMediaProvider } from "./context/StudioMediaContext";
import { useStudioStore } from "./store/useStudioStore";
import {
  CustomPageSection, CustomPageSectionType, CustomPageTheme,
  SellerStoreConfig, StoreLayoutVersion, StoreHistoryEntry, MediaFolderCategory, MediaGalleryItem,
} from "../../../domains/seller/customPage.types";
import { Product } from "../../../domains/product/product.types";
import { DEFAULT_MODERN_THEME } from "./constants/studioThemeDefaults";

interface StudioWorkspaceProps {
  saveStatus: SaveStatus; lastSaveError?: string | null; isPublishing?: boolean;
  storeConfig?: SellerStoreConfig | null; draftLayout?: StoreLayoutVersion | null; publishedLayout?: StoreLayoutVersion | null;
  sections: CustomPageSection[]; products?: Product[];
  catalogStatus?: CatalogLoadStatus; catalogError?: string | null; catalogTruncated?: boolean;
  onReloadCatalog?: () => void | Promise<void>;
  historyList?: StoreHistoryEntry[]; mediaGallery?: MediaGalleryItem[];
  onUploadMedia?: (file: File, options?: { folder?: MediaFolderCategory; allowVideo?: boolean }) => Promise<MediaGalleryItem>;
  onDeleteMedia?: (id: string) => Promise<void>;
  isMediaUploading?: boolean; mediaUploadProgress?: number; mediaUploadError?: string | null;
  selectedSectionId: string | null; setSelectedSectionId: (id: string | null) => void;
  recoverableBackup?: StudioLocalBackupData | null;
  onRestoreBackup?: () => void; onDismissBackup?: () => void;
  onReloadServerVersion?: () => void | Promise<void>;
  onForceOverwriteDraft?: () => unknown | Promise<unknown>;
  addSection: (type: CustomPageSectionType, settings: Record<string, unknown>, title?: string) => void;
  updateSection: (id: string, updatedData: Partial<CustomPageSection>) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  deleteSection: (id: string) => void; duplicateSection?: (id: string) => void;
  toggleVisibility: (id: string) => void;
  saveStoreConfig: (updatedConfig: Partial<SellerStoreConfig>, options?: { skipUndoPush?: boolean }) => Promise<void>;
  onSaveDraft?: () => unknown | Promise<unknown>;
  publishStudio: (changeSummary?: string) => boolean | void | Promise<boolean | void>;
  onRollback?: (versionNumber: number) => void;
  onReplaceSections?: (sections: CustomPageSection[], newTheme?: CustomPageTheme) => void;
  onExitStudio?: () => void; onOpenSponsorships?: () => void;
  undo?: () => void; redo?: () => void; canUndo?: boolean; canRedo?: boolean;
}

export const StudioWorkspace: React.FC<StudioWorkspaceProps> = (props) => {
  const {
    saveStatus, lastSaveError = null, isPublishing = false, storeConfig, draftLayout, publishedLayout, sections, products = [],
    catalogStatus, catalogError, onReloadCatalog, historyList = [], mediaGallery = [],
    onUploadMedia, onDeleteMedia, isMediaUploading, mediaUploadProgress, mediaUploadError,
    selectedSectionId, setSelectedSectionId, recoverableBackup, onRestoreBackup, onDismissBackup,
    onReloadServerVersion, onForceOverwriteDraft, addSection, updateSection, reorderSections,
    deleteSection, duplicateSection, toggleVisibility, saveStoreConfig, onSaveDraft, publishStudio,
    onRollback, onReplaceSections, onExitStudio, onOpenSponsorships, undo, redo, canUndo, canRedo,
  } = props;

  const viewport = useStudioStore((s) => s.viewport);
  const setViewport = useStudioStore((s) => s.setViewport);
  const isInteractiveMode = useStudioStore((s) => s.isInteractiveMode);
  const setIsInteractiveMode = useStudioStore((s) => s.setIsInteractiveMode);
  const toggleInteractiveMode = useStudioStore((s) => s.toggleInteractiveMode);
  const storeSelectedSectionId = useStudioStore((s) => s.selectedSectionId);
  const selectSectionInStore = useStudioStore((s) => s.selectSection);
  const studioExperienceMode = useStudioStore((s) => s.studioExperienceMode);

  const [navMode, setNavMode] = useState<StudioNavMode>(() => (studioExperienceMode === "guided" ? "identity" : "sections"));
  const [mobileColumn, setMobileColumn] = useState<MobileStudioColumn>("canvas");
  const [liveThemeOverride, setLiveThemeOverride] = useState<CustomPageTheme | null>(null);
  const [liveStorePatch, setLiveStorePatch] = useState<Partial<SellerStoreConfig> | null>(null);
  const [configSaveError, setConfigSaveError] = useState<string | null>(null);
  const [showLeftSidebar, setShowLeftSidebar] = useState<boolean>(true);
  const [showRightSidebar, setShowRightSidebar] = useState<boolean>(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const handleSelectSection = React.useCallback(
    (id: string | null) => { selectSectionInStore(id); setSelectedSectionId(id); },
    [selectSectionInStore, setSelectedSectionId]
  );
  const activeSectionId = storeSelectedSectionId ?? selectedSectionId;
  const selectedSection = sections.find((sec) => sec.id === activeSectionId) || null;
  const currentTheme: CustomPageTheme = liveThemeOverride || liveStorePatch?.theme || storeConfig?.theme || DEFAULT_MODERN_THEME;

  const effectiveStoreConfig = useMemo<SellerStoreConfig | null>(() => {
    if (!storeConfig && !liveStorePatch && !liveThemeOverride) return null;
    const base = (storeConfig || { shopName: "Ma Boutique", wilaya: "Alger" }) as SellerStoreConfig;
    return { ...base, ...(liveStorePatch || {}), theme: currentTheme };
  }, [storeConfig, liveStorePatch, liveThemeOverride, currentTheme]);

  useStudioWorkspaceEvents({
    sections, currentTheme, reorderSections, updateSection, duplicateSection, toggleVisibility,
    deleteSection, addSection, setShowRightSidebar, setNavMode, setMobileColumn, setIsCommandPaletteOpen,
  });

  const pendingStorePatch = useMemo(() => buildPendingStoreConfigPatch(liveStorePatch, liveThemeOverride), [liveStorePatch, liveThemeOverride]);
  const hasPendingConfigChanges = useMemo(() => hasPendingStoreConfigChanges(pendingStorePatch, storeConfig, areStudioValuesEqual), [pendingStorePatch, storeConfig]);
  const effectiveSaveStatus: SaveStatus = configSaveError ? "error" : saveStatus === "saved" && hasPendingConfigChanges ? "unsaved" : saveStatus;
  const effectiveLastSaveError = configSaveError ?? lastSaveError ?? null;

  const isPublished = Boolean(publishedLayout && publishedLayout.sections?.length > 0);
  const handleLiveStorePatch = React.useCallback((patch: Partial<SellerStoreConfig>) => {
    setConfigSaveError(null);
    if (patch.theme) setLiveThemeOverride(patch.theme);
    setLiveStorePatch((prev) => ({ ...(prev || {}), ...patch }));
  }, []);

  const persistStoreConfig = React.useCallback(async (payload: Partial<SellerStoreConfig>, options?: { skipUndoPush?: boolean }) => {
    setConfigSaveError(null);
    try {
      await saveStoreConfig(payload, options);
      setLiveStorePatch(null); setLiveThemeOverride(null);
    } catch (err: unknown) {
      setConfigSaveError(extractSaveErrorMessage(err, "Échec de l'enregistrement de la configuration."));
      throw err;
    }
  }, [saveStoreConfig]);

  const handleSaveStoreConfig = async (updatedConfig: Partial<SellerStoreConfig>) => {
    const mergedPayload: Partial<SellerStoreConfig> = { ...pendingStorePatch, ...updatedConfig };
    handleLiveStorePatch(mergedPayload);
    await persistStoreConfig(mergedPayload);
  };

  const handleSaveTheme = async (updatedTheme: CustomPageTheme) => {
    setLiveThemeOverride(updatedTheme);
    setLiveStorePatch((prev) => ({ ...(prev || {}), theme: updatedTheme }));
    await persistStoreConfig({ ...(liveStorePatch || {}), theme: updatedTheme });
  };

  const handleUndo = React.useCallback(() => { setConfigSaveError(null); setLiveThemeOverride(null); setLiveStorePatch(null); undo?.(); }, [undo]);
  const handleRedo = React.useCallback(() => { setConfigSaveError(null); setLiveThemeOverride(null); setLiveStorePatch(null); redo?.(); }, [redo]);

  const flushPendingStoreConfig = React.useCallback(async (): Promise<boolean> => {
    if (!hasPendingConfigChanges) { setConfigSaveError(null); return true; }
    try { await persistStoreConfig(pendingStorePatch); return true; } catch { return false; }
  }, [hasPendingConfigChanges, pendingStorePatch, persistStoreConfig]);

  const handleUnifiedSaveDraft = React.useCallback(async () => {
    return (await flushPendingStoreConfig()) ? (onSaveDraft ? await onSaveDraft() : true) : false;
  }, [flushPendingStoreConfig, onSaveDraft]);

  const handleUnifiedPublish = React.useCallback(async (changeSummary?: string) => {
    return (await flushPendingStoreConfig()) ? await publishStudio(changeSummary) : false;
  }, [flushPendingStoreConfig, publishStudio]);

  const handleApplyFullArchetype = async (newSections: CustomPageSection[], newTheme: CustomPageTheme) => {
    setLiveThemeOverride(newTheme); setLiveStorePatch((prev) => ({ ...(prev || {}), theme: newTheme }));
    if (onReplaceSections) onReplaceSections(newSections, newTheme);
    if (newSections.length > 0) handleSelectSection(newSections[0].id);
    await persistStoreConfig({ theme: newTheme }, { skipUndoPush: Boolean(onReplaceSections) });
  };

  const handleSelectNavMode = React.useCallback((mode: StudioNavMode) => {
    setNavMode(mode); setShowRightSidebar(true); setMobileColumn(mode === "sections" ? "tree" : "inspector");
  }, []);

  const handleSelectMediaUrl = (url: string) => {
    applyMediaToSection(selectedSection, url, updateSection, () => {
      setNavMode("sections"); setShowRightSidebar(true); setMobileColumn("inspector");
    });
  };

  const handleReplaceMediaInSections = async (oldUrl: string, newUrl: string): Promise<number> => {
    const { nextSections, updatedConfigPatch, replacedCount } = replaceMediaUrlInSections(sections, effectiveStoreConfig, oldUrl, newUrl);
    if (replacedCount === 0) return 0;
    if (onReplaceSections) {
      onReplaceSections(nextSections);
    } else {
      nextSections.forEach((sec, idx) => {
        if (sec !== sections[idx]) updateSection(sec.id, { settings: sec.settings, styles: sec.styles });
      });
    }
    if (updatedConfigPatch) await handleSaveStoreConfig(updatedConfigPatch);
    return replacedCount;
  };

  const mediaContextValue = useMemo(() => ({
    mediaGallery, onUploadMedia, isUploading: isMediaUploading,
    uploadProgress: mediaUploadProgress, uploadError: mediaUploadError,
  }), [mediaGallery, onUploadMedia, isMediaUploading, mediaUploadProgress, mediaUploadError]);

  return (
    <StudioMediaProvider value={mediaContextValue}>
      <div className="flex flex-col flex-1 h-full bg-[var(--studio-background)] text-[var(--studio-black)] overflow-hidden select-none min-w-0 min-h-0">
        <div className="hidden md:block shrink-0">
          <StudioTopBar
            viewport={viewport} setViewport={setViewport} saveStatus={effectiveSaveStatus} shopName={effectiveStoreConfig?.shopName || "Ma Boutique"}
            shopSlug={effectiveStoreConfig?.shopSlug} sellerId={effectiveStoreConfig?.sellerId} isPublished={isPublished} isPublishing={isPublishing}
            versionNumber={publishedLayout?.versionNumber} draftRevision={draftLayout?.draftRevision} sectionCount={sections.length} productCount={products.length} sections={sections}
            products={products} catalogStatus={catalogStatus} storeConfig={effectiveStoreConfig} onSelectNavMode={handleSelectNavMode}
            historyList={historyList} previewMode={isInteractiveMode ? "preview" : "edit"} onPreviewModeChange={(m) => setIsInteractiveMode(m === "preview")}
            onOpenAudit={() => window.dispatchEvent(new CustomEvent("studio:open-audit"))} onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onSaveDraft={handleUnifiedSaveDraft} onPublish={handleUnifiedPublish} onRollback={onRollback} onExitStudio={onExitStudio}
            onOpenSponsorships={onOpenSponsorships} canUndo={Boolean(canUndo)} canRedo={Boolean(canRedo)} onUndo={handleUndo} onRedo={handleRedo}
          />
        </div>
        <MobileStudioBar
          shopName={effectiveStoreConfig?.shopName || "Ma Boutique"} isPublished={isPublished} isPublishing={isPublishing}
          versionNumber={publishedLayout?.versionNumber} draftRevision={draftLayout?.draftRevision} saveStatus={effectiveSaveStatus} lastSaveError={effectiveLastSaveError}
          canUndo={Boolean(canUndo)} canRedo={Boolean(canRedo)} onUndo={handleUndo} onRedo={handleRedo} mobileColumn={mobileColumn}
          setMobileColumn={setMobileColumn} navMode={navMode} onSelectNavMode={handleSelectNavMode} sections={sections} products={products}
          catalogStatus={catalogStatus} storeConfig={effectiveStoreConfig} onSaveDraft={handleUnifiedSaveDraft} onPublish={handleUnifiedPublish} onExitStudio={onExitStudio}
        />
        <StudioRecoveryAndConflictBar
          saveStatus={effectiveSaveStatus} lastSaveError={effectiveLastSaveError} localSectionCount={sections.length} recoverableBackup={recoverableBackup} onRestoreBackup={onRestoreBackup}
          onDismissBackup={onDismissBackup} onReloadServerVersion={onReloadServerVersion} onForceOverwriteDraft={onForceOverwriteDraft}
          onRetrySave={() => { void handleUnifiedSaveDraft(); }}
        />
        <StudioColumnsLayout
          mobileColumn={mobileColumn} showLeftSidebar={showLeftSidebar} showRightSidebar={showRightSidebar} sections={sections}
          selectedSectionId={activeSectionId} navMode={navMode} onSelectNavMode={handleSelectNavMode} setSelectedSectionId={handleSelectSection}
          setNavMode={setNavMode} setShowRightSidebar={setShowRightSidebar} setMobileColumn={setMobileColumn} reorderSections={reorderSections}
          toggleVisibility={toggleVisibility} deleteSection={deleteSection} duplicateSection={duplicateSection} addSection={addSection}
          currentTheme={currentTheme} products={products} catalogStatus={catalogStatus} catalogError={catalogError}
          catalogTruncated={props.catalogTruncated} onReloadCatalog={onReloadCatalog}
          storeConfig={effectiveStoreConfig} viewport={viewport} setViewport={setViewport} setShowLeftSidebar={setShowLeftSidebar}
          selectedSection={selectedSection} mediaGallery={mediaGallery} handleSelectMediaUrl={handleSelectMediaUrl}
          onReplaceMediaUrl={handleReplaceMediaInSections} onUploadMedia={onUploadMedia} onDeleteMedia={onDeleteMedia}
          isMediaUploading={isMediaUploading} mediaUploadProgress={mediaUploadProgress} mediaUploadError={mediaUploadError}
          updateSection={updateSection} handleSaveTheme={handleSaveTheme} setLiveThemeOverride={setLiveThemeOverride}
          onLiveStorePatch={handleLiveStorePatch} saveStoreConfig={handleSaveStoreConfig} handleApplyFullArchetype={handleApplyFullArchetype}
          onReplaceSections={onReplaceSections} onSaveDraft={handleUnifiedSaveDraft} lastSaveError={effectiveLastSaveError}
        />
        {isCommandPaletteOpen && (
          <Suspense fallback={null}><StudioCommandPalette
            isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} onAddSection={addSection} onSetViewport={setViewport}
            onNavigatePage={(viewMode, slug) => window.dispatchEvent(new CustomEvent("studio:navigate-page", { detail: { viewMode, categorySlug: slug } }))}
            onToggleInteractiveMode={toggleInteractiveMode} isInteractiveMode={isInteractiveMode}
            onOpenAuditModal={() => window.dispatchEvent(new CustomEvent("studio:open-audit"))} onOpenQrModal={() => window.dispatchEvent(new CustomEvent("studio:open-qr"))}
            onPublish={() => { void handleUnifiedPublish(); }} onUndo={handleUndo} onRedo={handleRedo} canUndo={canUndo} canRedo={canRedo} onSelectNavMode={handleSelectNavMode}
          /></Suspense>
        )}
      </div>
    </StudioMediaProvider>
  );
};

export default StudioWorkspace;
