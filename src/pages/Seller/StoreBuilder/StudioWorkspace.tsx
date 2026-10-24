import React, { useState } from "react";
import "./studio-tokens.css";
import { StudioTopBar } from "./components/studio/StudioTopBar";
import { SectionTreePanel } from "./components/studio/SectionTreePanel";
import { StudioPreview } from "./components/studio/StudioPreview";
import { PropertiesInspector } from "./components/studio/PropertiesInspector";
import { MobileStudioHeader } from "./components/studio/MobileStudioHeader";
import { MobileStudioNavigation, MobileStudioColumn } from "./components/studio/MobileStudioNavigation";
import { StudioMobileMenu } from "./components/studio/StudioMobileMenu";
import { StudioNavMode } from "./components/studio/studio.types";
import { SaveStatus } from "./hooks/useSellerStudio";
import { applyMediaToSection } from "./utils/studioMediaHandler";
import {
  CustomPageSection,
  CustomPageSectionType,
  CustomPageTheme,
  SellerStoreConfig,
  StoreLayoutVersion,
  StoreHistoryEntry,
  MediaGalleryItem,
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
  addSection: (
    type: CustomPageSectionType,
    defaultSettings: Record<string, unknown>,
    defaultTitle?: string
  ) => void;
  updateSection: (id: string, updatedData: Partial<CustomPageSection>) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  deleteSection: (id: string) => void;
  duplicateSection?: (id: string) => void;
  toggleVisibility: (id: string) => void;
  saveStoreConfig: (updatedConfig: Partial<SellerStoreConfig>) => Promise<void>;
  onSaveDraft?: () => void;
  publishStudio: (changeSummary?: string) => void;
  onRollback?: (versionNumber: number) => void;
}

export const StudioWorkspace: React.FC<StudioWorkspaceProps> = ({
  saveStatus,
  storeConfig,
  publishedLayout,
  sections,
  products = [],
  historyList = [],
  mediaGallery = [],
  onUploadMedia,
  onDeleteMedia,
  selectedSectionId,
  setSelectedSectionId,
  addSection,
  updateSection,
  reorderSections,
  deleteSection,
  duplicateSection,
  toggleVisibility,
  saveStoreConfig,
  onSaveDraft,
  publishStudio,
  onRollback,
}) => {
  const [navMode, setNavMode] = useState<StudioNavMode>("sections");
  const [viewport, setViewport] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [mobileColumn, setMobileColumn] = useState<MobileStudioColumn>("canvas");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [liveThemeOverride, setLiveThemeOverride] = useState<CustomPageTheme | null>(null);

  const selectedSection = sections.find((sec) => sec.id === selectedSectionId) || null;
  const currentTheme: CustomPageTheme =
    liveThemeOverride ||
    storeConfig?.theme || {
      sector: "artisanat",
      primaryColor: "#B85B35",
      secondaryColor: "#1C2A39",
      accentColor: "#D4AF37",
      canvasColor: "#FAF6F0",
      surfaceColor: "#FFFFFF",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    };

  const isPublished = Boolean(publishedLayout && publishedLayout.sections?.length > 0);

  const handleSaveTheme = async (updatedTheme: CustomPageTheme) => {
    setLiveThemeOverride(updatedTheme);
    await saveStoreConfig({ theme: updatedTheme });
  };

  const handleSelectNavMode = (mode: StudioNavMode) => {
    setNavMode(mode);
    setMobileColumn(mode === "sections" ? "tree" : "inspector");
  };

  const handleSelectMediaUrl = (url: string) => {
    applyMediaToSection(selectedSection, url, updateSection, () => {
      setNavMode("sections");
      setMobileColumn("inspector");
    });
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-[#F7F8FA] text-[#17191C] overflow-hidden select-none min-w-0 min-h-0">
      <div className="hidden md:block shrink-0">
        <StudioTopBar
          viewport={viewport}
          setViewport={setViewport}
          saveStatus={saveStatus}
          shopName={storeConfig?.shopName || "Ma Boutique"}
          shopSlug={storeConfig?.shopSlug}
          isPublished={isPublished}
          historyList={historyList}
          onSaveDraft={onSaveDraft}
          onPublish={publishStudio}
          onRollback={onRollback}
        />
      </div>

      <div className="block md:hidden shrink-0">
        <MobileStudioHeader
          shopName={storeConfig?.shopName || "Ma Boutique"}
          isPublished={isPublished}
          onPublish={() => publishStudio()}
          onOpenMenu={() => setIsMobileMenuOpen(true)}
        />
        <MobileStudioNavigation
          mobileColumn={mobileColumn}
          setMobileColumn={setMobileColumn}
          sectionCount={sections.length}
        />
      </div>

      <StudioMobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navMode={navMode}
        onSelectNavMode={handleSelectNavMode}
        shopName={storeConfig?.shopName}
      />

      <div className="flex-1 flex overflow-hidden min-w-0 min-h-0">
        {/* Left Column: Unified Navigation + Section Tree */}
        <div
          className={`h-full min-w-0 ${
            mobileColumn === "tree"
              ? "block w-full flex-1"
              : "hidden md:block md:w-[290px] lg:w-[300px] md:shrink-0"
          }`}
        >
          <SectionTreePanel
            sections={sections}
            selectedSectionId={selectedSectionId}
            navMode={navMode}
            onSelectNavMode={handleSelectNavMode}
            onSelectSection={(id) => {
              setSelectedSectionId(id);
              setNavMode("sections");
              setMobileColumn("inspector");
            }}
            onReorder={reorderSections}
            onToggleVisibility={toggleVisibility}
            onDeleteSection={deleteSection}
            onDuplicateSection={duplicateSection}
            onAddSection={addSection}
          />
        </div>

        {/* Center Column: Live Storefront Canvas */}
        <div
          className={`h-full flex-1 min-w-0 overflow-hidden ${
            mobileColumn === "canvas" ? "block w-full" : "hidden md:block"
          }`}
        >
          <StudioPreview
            sections={sections}
            theme={currentTheme}
            products={products}
            viewport={viewport}
            selectedSectionId={selectedSectionId}
            shopSlug={storeConfig?.shopSlug}
            shopName={storeConfig?.shopName}
            onSelectSection={(id) => {
              setSelectedSectionId(id);
              setNavMode("sections");
              setMobileColumn("inspector");
            }}
          />
        </div>

        {/* Right Column: Contextual Inspector */}
        <div
          className={`h-full min-w-0 ${
            mobileColumn === "inspector"
              ? "block w-full flex-1"
              : "hidden md:block md:w-[330px] md:shrink-0"
          }`}
        >
          <PropertiesInspector
            navMode={navMode}
            selectedSection={selectedSection}
            sections={sections}
            products={products}
            storeConfig={storeConfig}
            currentTheme={currentTheme}
            mediaGallery={mediaGallery}
            onSelectMediaUrl={handleSelectMediaUrl}
            onUploadMedia={onUploadMedia}
            onDeleteMedia={onDeleteMedia}
            onUpdateSection={updateSection}
            onAddSection={addSection}
            onSaveTheme={handleSaveTheme}
            onThemeChangeLive={(newTheme) => setLiveThemeOverride(newTheme)}
            onSaveConfig={saveStoreConfig}
          />
        </div>
      </div>
    </div>
  );
};

export default StudioWorkspace;
