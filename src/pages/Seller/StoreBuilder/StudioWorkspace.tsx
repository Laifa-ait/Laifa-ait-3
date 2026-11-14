import React, { useState } from "react";
import "./studio-tokens.css";
import { StudioTopBar } from "./components/studio/StudioTopBar";
import { StudioColumnsLayout } from "./components/studio/StudioColumnsLayout";
import { MobileStudioHeader } from "./components/studio/MobileStudioHeader";
import { MobileStudioNavigation, MobileStudioColumn } from "./components/studio/MobileStudioNavigation";
import { StudioMobileMenu } from "./components/studio/StudioMobileMenu";
import { StudioCommandPalette } from "./components/studio/StudioCommandPalette";
import { StudioNavMode } from "./components/studio/studio.types";
import { SaveStatus } from "./hooks/useSellerStudio";
import { useStudioWorkspaceEvents } from "./hooks/useStudioWorkspaceEvents";
import { applyMediaToSection } from "./utils/studioMediaHandler";
import { useStudioStore } from "./store/useStudioStore";
import {
  CustomPageSection, CustomPageSectionType, CustomPageTheme,
  SellerStoreConfig, StoreLayoutVersion, StoreHistoryEntry, MediaGalleryItem,
} from "../../../domains/seller/customPage.types";
import { Product } from "../../../domains/product/product.types";

interface StudioWorkspaceProps {
  saveStatus: SaveStatus;
  storeConfig?: SellerStoreConfig | null;
  publishedLayout?: StoreLayoutVersion | null;
  sections: CustomPageSection[];
  products?: Product[];
  historyList?: StoreHistoryEntry[];
  mediaGallery?: MediaGalleryItem[];
  onUploadMedia?: (file: File) => Promise<MediaGalleryItem>;
  onDeleteMedia?: (id: string) => Promise<void>;
  selectedSectionId: string | null;
  setSelectedSectionId: (id: string | null) => void;
  addSection: (type: CustomPageSectionType, settings: Record<string, unknown>, title?: string) => void;
  updateSection: (id: string, updatedData: Partial<CustomPageSection>) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  deleteSection: (id: string) => void;
  duplicateSection?: (id: string) => void;
  toggleVisibility: (id: string) => void;
  saveStoreConfig: (updatedConfig: Partial<SellerStoreConfig>) => Promise<void>;
  onSaveDraft?: () => void | Promise<unknown>;
  publishStudio: (changeSummary?: string) => void;
  onRollback?: (versionNumber: number) => void;
  onReplaceSections?: (sections: CustomPageSection[]) => void;
  onExitStudio?: () => void;
  onOpenSponsorships?: () => void;
  undo?: () => void;
  redo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const StudioWorkspace: React.FC<StudioWorkspaceProps> = (props) => {
  const {
    saveStatus, storeConfig, publishedLayout, sections, products = [],
    historyList = [], mediaGallery = [], onUploadMedia, onDeleteMedia,
    selectedSectionId, setSelectedSectionId, addSection, updateSection,
    reorderSections, deleteSection, duplicateSection, toggleVisibility,
    saveStoreConfig, onSaveDraft, publishStudio, onRollback,
    onReplaceSections, onExitStudio, onOpenSponsorships, undo, redo, canUndo, canRedo,
  } = props;

  const viewport = useStudioStore((s) => s.viewport);
  const setViewport = useStudioStore((s) => s.setViewport);
  const isInteractiveMode = useStudioStore((s) => s.isInteractiveMode);
  const setIsInteractiveMode = useStudioStore((s) => s.setIsInteractiveMode);
  const toggleInteractiveMode = useStudioStore((s) => s.toggleInteractiveMode);
  const storeSelectedSectionId = useStudioStore((s) => s.selectedSectionId);
  const selectSectionInStore = useStudioStore((s) => s.selectSection);

  const studioExperienceMode = useStudioStore((s) => s.studioExperienceMode);
  const [navMode, setNavMode] = useState<StudioNavMode>(() =>
    studioExperienceMode === "guided" ? "identity" : "sections"
  );
  const [mobileColumn, setMobileColumn] = useState<MobileStudioColumn>("canvas");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [liveThemeOverride, setLiveThemeOverride] = useState<CustomPageTheme | null>(null);
  const [liveStorePatch, setLiveStorePatch] = useState<Partial<SellerStoreConfig> | null>(null);
  const [showLeftSidebar, setShowLeftSidebar] = useState<boolean>(true);
  const [showRightSidebar, setShowRightSidebar] = useState<boolean>(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const defaultTheme: CustomPageTheme = React.useMemo(() => ({
    sector: "artisanat",
    primaryColor: "#B85B35",
    secondaryColor: "#1C2A39",
    accentColor: "#D4AF37",
    canvasColor: "#FAF6F0",
    surfaceColor: "#FFFFFF",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  }), []);

  const handleSelectSection = (id: string | null) => {
    selectSectionInStore(id);
    setSelectedSectionId(id);
  };

  const activeSectionId = storeSelectedSectionId ?? selectedSectionId;
  const selectedSection = sections.find((sec) => sec.id === activeSectionId) || null;
  const currentTheme: CustomPageTheme =
    liveThemeOverride || liveStorePatch?.theme || storeConfig?.theme || defaultTheme;

  const effectiveStoreConfig = React.useMemo<SellerStoreConfig | null>(() => {
    if (!storeConfig && !liveStorePatch) return null;
    const base = (storeConfig || { shopName: "Ma Boutique", wilaya: "Alger" }) as SellerStoreConfig;
    return {
      ...base,
      ...(liveStorePatch || {}),
      theme: currentTheme,
    };
  }, [storeConfig, liveStorePatch, currentTheme]);

  useStudioWorkspaceEvents({
    sections, currentTheme, reorderSections, updateSection, duplicateSection, toggleVisibility,
    deleteSection, addSection, setShowRightSidebar, setNavMode,
    setMobileColumn, setIsCommandPaletteOpen,
  });

  const isPublished = Boolean(publishedLayout && publishedLayout.sections?.length > 0);

  const handleLiveStorePatch = React.useCallback((patch: Partial<SellerStoreConfig>) => {
    if (patch.theme) setLiveThemeOverride(patch.theme);
    setLiveStorePatch((prev) => ({ ...(prev || {}), ...patch }));
  }, []);

  const handleSaveStoreConfig = async (updatedConfig: Partial<SellerStoreConfig>) => {
    handleLiveStorePatch(updatedConfig);
    await saveStoreConfig(updatedConfig);
  };

  const handleSaveTheme = async (updatedTheme: CustomPageTheme) => {
    setLiveThemeOverride(updatedTheme);
    setLiveStorePatch((prev) => ({ ...(prev || {}), theme: updatedTheme }));
    await saveStoreConfig({ theme: updatedTheme });
  };

  const handleApplyFullArchetype = async (newSections: CustomPageSection[], newTheme: CustomPageTheme) => {
    setLiveThemeOverride(newTheme);
    setLiveStorePatch((prev) => ({ ...(prev || {}), theme: newTheme }));
    if (onReplaceSections) onReplaceSections(newSections);
    if (newSections.length > 0) handleSelectSection(newSections[0].id);
    await saveStoreConfig({ theme: newTheme });
  };

  const handleSelectNavMode = (mode: StudioNavMode) => {
    setNavMode(mode);
    setShowRightSidebar(true);
    setMobileColumn(mode === "sections" ? "tree" : "inspector");
  };

  const handleSelectMediaUrl = (url: string) => {
    applyMediaToSection(selectedSection, url, updateSection, () => {
      setNavMode("sections");
      setShowRightSidebar(true);
      setMobileColumn("inspector");
    });
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-[#F6F7F9] text-slate-900 overflow-hidden select-none min-w-0 min-h-0">
      <div className="hidden md:block shrink-0">
        <StudioTopBar
          viewport={viewport}
          setViewport={setViewport}
          saveStatus={saveStatus}
          shopName={effectiveStoreConfig?.shopName || "Ma Boutique"}
          shopSlug={effectiveStoreConfig?.shopSlug}
          sellerId={effectiveStoreConfig?.sellerId}
          isPublished={isPublished}
          versionNumber={publishedLayout?.versionNumber}
          sectionCount={sections.length}
          productCount={products.length}
          historyList={historyList}
          previewMode={isInteractiveMode ? "preview" : "edit"}
          onPreviewModeChange={(mode) => setIsInteractiveMode(mode === "preview")}
          onOpenAudit={() => window.dispatchEvent(new CustomEvent("studio:open-audit"))}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onSaveDraft={() => onSaveDraft?.()}
          onPublish={publishStudio}
          onRollback={onRollback}
          onExitStudio={onExitStudio}
          onOpenSponsorships={onOpenSponsorships}
          canUndo={Boolean(canUndo)}
          canRedo={Boolean(canRedo)}
          onUndo={() => undo?.()}
          onRedo={() => redo?.()}
        />
      </div>

      <div className="block md:hidden shrink-0">
        <MobileStudioHeader shopName={effectiveStoreConfig?.shopName || "Ma Boutique"} isPublished={isPublished} onPublish={() => publishStudio()} onOpenMenu={() => setIsMobileMenuOpen(true)} onExitStudio={onExitStudio} />
        <MobileStudioNavigation mobileColumn={mobileColumn} setMobileColumn={setMobileColumn} sectionCount={sections.length} />
      </div>

      <StudioMobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} navMode={navMode} onSelectNavMode={handleSelectNavMode} shopName={effectiveStoreConfig?.shopName} />

      <StudioColumnsLayout
        mobileColumn={mobileColumn} showLeftSidebar={showLeftSidebar} showRightSidebar={showRightSidebar}
        sections={sections} selectedSectionId={activeSectionId} navMode={navMode} onSelectNavMode={handleSelectNavMode}
        setSelectedSectionId={handleSelectSection} setNavMode={setNavMode} setShowRightSidebar={setShowRightSidebar}
        setMobileColumn={setMobileColumn} reorderSections={reorderSections} toggleVisibility={toggleVisibility}
        deleteSection={deleteSection} duplicateSection={duplicateSection} addSection={addSection}
        currentTheme={currentTheme} products={products} storeConfig={effectiveStoreConfig}
        viewport={viewport} setViewport={setViewport} setShowLeftSidebar={setShowLeftSidebar}
        selectedSection={selectedSection} mediaGallery={mediaGallery} handleSelectMediaUrl={handleSelectMediaUrl}
        onUploadMedia={onUploadMedia} onDeleteMedia={onDeleteMedia} updateSection={updateSection}
        handleSaveTheme={handleSaveTheme} setLiveThemeOverride={setLiveThemeOverride}
        onLiveStorePatch={handleLiveStorePatch} saveStoreConfig={handleSaveStoreConfig}
        handleApplyFullArchetype={handleApplyFullArchetype} onReplaceSections={onReplaceSections} onSaveDraft={onSaveDraft}
      />

      <StudioCommandPalette
        isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)}
        onAddSection={addSection} onSetViewport={setViewport}
        onNavigatePage={(viewMode, slug) => window.dispatchEvent(new CustomEvent("studio:navigate-page", { detail: { viewMode, categorySlug: slug } }))}
        onToggleInteractiveMode={toggleInteractiveMode} isInteractiveMode={isInteractiveMode}
        onOpenAuditModal={() => window.dispatchEvent(new CustomEvent("studio:open-audit"))}
        onOpenQrModal={() => window.dispatchEvent(new CustomEvent("studio:open-qr"))}
        onPublish={() => publishStudio()} onUndo={undo} onRedo={redo}
        canUndo={canUndo} canRedo={canRedo} onSelectNavMode={handleSelectNavMode}
      />
    </div>
  );
};

export default StudioWorkspace;
