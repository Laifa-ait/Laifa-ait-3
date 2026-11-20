import React from "react";
import { SectionTreePanel } from "./SectionTreePanel";
import { StudioPreview } from "./StudioPreview";
import { PropertiesInspector } from "./PropertiesInspector";
import { StudioNavMode } from "./studio.types";
import { MobileStudioColumn } from "./MobileStudioNavigation";
import { CatalogLoadStatus } from "../../hooks/studioCatalogLoader";
import {
  CustomPageSection,
  CustomPageSectionType,
  CustomPageTheme,
  SellerStoreConfig,
  MediaFolderCategory,
  MediaGalleryItem,
} from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/product/product.types";

interface StudioColumnsLayoutProps {
  mobileColumn: MobileStudioColumn;
  showLeftSidebar: boolean;
  showRightSidebar: boolean;
  sections: CustomPageSection[];
  selectedSectionId: string | null;
  navMode: StudioNavMode;
  onSelectNavMode: (mode: StudioNavMode) => void;
  setSelectedSectionId: (id: string | null) => void;
  setNavMode: (mode: StudioNavMode) => void;
  setShowRightSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  setMobileColumn: (column: MobileStudioColumn) => void;
  reorderSections: (from: number, to: number) => void;
  toggleVisibility: (id: string) => void;
  deleteSection: (id: string) => void;
  duplicateSection?: (id: string) => void;
  addSection: (type: CustomPageSectionType, settings: Record<string, unknown>, title?: string, insertAtIndex?: number) => void;
  currentTheme: CustomPageTheme;
  products: Product[];
  catalogStatus?: CatalogLoadStatus;
  catalogError?: string | null;
  catalogTruncated?: boolean;
  onReloadCatalog?: () => void | Promise<void>;
  storeConfig?: SellerStoreConfig | null;
  viewport: "mobile" | "tablet" | "desktop";
  setViewport: (vp: "mobile" | "tablet" | "desktop") => void;
  setShowLeftSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  selectedSection: CustomPageSection | null;
  mediaGallery: MediaGalleryItem[];
  handleSelectMediaUrl: (url: string) => void;
  onReplaceMediaUrl?: (oldUrl: string, newUrl: string) => Promise<number>;
  onUploadMedia?: (file: File, options?: { folder?: MediaFolderCategory; allowVideo?: boolean }) => Promise<MediaGalleryItem>;
  onDeleteMedia?: (id: string) => Promise<void>;
  isMediaUploading?: boolean;
  mediaUploadProgress?: number;
  mediaUploadError?: string | null;
  updateSection: (id: string, updatedData: Partial<CustomPageSection>) => void;
  handleSaveTheme: (theme: CustomPageTheme) => Promise<void>;
  setLiveThemeOverride: (theme: CustomPageTheme | null) => void;
  onLiveStorePatch?: (patch: Partial<SellerStoreConfig>) => void;
  saveStoreConfig: (config: Partial<SellerStoreConfig>) => Promise<void>;
  handleApplyFullArchetype: (sections: CustomPageSection[], theme: CustomPageTheme) => Promise<void>;
  onReplaceSections?: (sections: CustomPageSection[]) => void;
  onSaveDraft?: () => unknown | Promise<unknown>;
  lastSaveError?: string | null;
}

export const StudioColumnsLayout: React.FC<StudioColumnsLayoutProps> = ({
  mobileColumn,
  showLeftSidebar,
  showRightSidebar,
  sections,
  selectedSectionId,
  navMode,
  onSelectNavMode,
  setSelectedSectionId,
  setNavMode,
  setShowRightSidebar,
  setMobileColumn,
  reorderSections,
  toggleVisibility,
  deleteSection,
  duplicateSection,
  addSection,
  currentTheme,
  products,
  catalogStatus,
  catalogError,
  catalogTruncated,
  onReloadCatalog,
  storeConfig,
  viewport,
  setViewport,
  setShowLeftSidebar,
  selectedSection,
  mediaGallery,
  handleSelectMediaUrl,
  onReplaceMediaUrl,
  onUploadMedia,
  onDeleteMedia,
  isMediaUploading,
  mediaUploadProgress,
  mediaUploadError,
  updateSection,
  handleSaveTheme,
  setLiveThemeOverride,
  onLiveStorePatch,
  saveStoreConfig,
  handleApplyFullArchetype,
  onReplaceSections,
  onSaveDraft,
  lastSaveError,
}) => {
  const [mobileSplitPreviewOpen, setMobileSplitPreviewOpen] = React.useState<boolean>(true);
  const isMobileSplitActive = mobileColumn === "inspector" && mobileSplitPreviewOpen;

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-w-0 min-h-0">
      <div
        className={`h-full min-w-0 ${
          mobileColumn === "tree" ? "block w-full flex-1 md:flex-none" : "hidden"
        } ${showLeftSidebar ? "md:block md:w-[272px] lg:w-[280px] md:shrink-0" : "md:hidden"}`}
      >
        <SectionTreePanel
          sections={sections}
          selectedSectionId={selectedSectionId}
          products={products}
          activeSector={currentTheme.sector}
          storeConfig={storeConfig}
          navMode={navMode}
          onSelectNavMode={onSelectNavMode}
          onSelectSection={(id) => {
            setSelectedSectionId(id);
            setNavMode("sections");
            setShowRightSidebar(true);
            setMobileColumn("inspector");
          }}
          onUpdateSection={updateSection}
          onReorder={reorderSections}
          onToggleVisibility={toggleVisibility}
          onDeleteSection={deleteSection}
          onDuplicateSection={duplicateSection}
          onAddSection={addSection}
          onSaveDraft={onSaveDraft}
          lastSaveError={lastSaveError}
        />
      </div>

      <div
        data-testid="studio-canvas-column"
        data-mobile-split-active={isMobileSplitActive ? "true" : "false"}
        className={`min-w-0 overflow-hidden transition-all duration-200 ${
          mobileColumn === "canvas"
            ? "block w-full flex-1 h-full"
            : isMobileSplitActive
            ? "block w-full h-[38vh] min-h-[210px] max-h-[310px] shrink-0 border-b-2 border-slate-300 shadow-xs md:h-full md:max-h-none md:min-h-0 md:flex-1 md:border-b-0 md:shadow-none"
            : "hidden md:block md:h-full md:flex-1"
        }`}
      >
        <StudioPreview
          sections={sections}
          theme={currentTheme}
          products={products}
          catalogStatus={catalogStatus}
          storeConfig={storeConfig}
          viewport={viewport}
          onViewportChange={setViewport}
          selectedSectionId={selectedSectionId}
          shopSlug={storeConfig?.shopSlug}
          shopName={storeConfig?.shopName}
          isMobileSplitCompact={isMobileSplitActive}
          onSelectSection={(id) => {
            setSelectedSectionId(id);
            setNavMode("sections");
            setShowRightSidebar(true);
            setMobileColumn("inspector");
          }}
          showLeftSidebar={showLeftSidebar}
          onToggleLeftSidebar={() => setShowLeftSidebar((prev) => !prev)}
          showRightSidebar={showRightSidebar}
          onToggleRightSidebar={() => setShowRightSidebar((prev) => !prev)}
        />
      </div>

      <div
        className={`min-w-0 min-h-0 ${
          mobileColumn === "inspector" ? "flex flex-col w-full flex-1 md:h-full md:flex-none" : "hidden"
        } ${showRightSidebar ? "md:block md:h-full md:w-[356px] lg:w-[372px] md:shrink-0" : "md:hidden"}`}
      >
        <PropertiesInspector
          navMode={navMode}
          onSelectNavMode={onSelectNavMode}
          onReturnToCanvas={() => setMobileColumn("canvas")}
          mobileSplitPreviewOpen={mobileSplitPreviewOpen}
          onToggleMobileSplitPreview={() => setMobileSplitPreviewOpen((prev) => !prev)}
          onSelectSection={(id) => {
            setSelectedSectionId(id);
            setNavMode("sections");
          }}
          selectedSection={selectedSection}
          sections={sections}
          products={products}
          catalogStatus={catalogStatus}
          catalogError={catalogError}
          catalogTruncated={catalogTruncated}
          onReloadCatalog={onReloadCatalog}
          storeConfig={storeConfig}
          currentTheme={currentTheme}
          mediaGallery={mediaGallery}
          onSelectMediaUrl={handleSelectMediaUrl}
          onReplaceMediaUrl={onReplaceMediaUrl}
          onUploadMedia={onUploadMedia}
          onDeleteMedia={onDeleteMedia}
          isMediaUploading={isMediaUploading}
          mediaUploadProgress={mediaUploadProgress}
          mediaUploadError={mediaUploadError}
          onUpdateSection={updateSection}
          onAddSection={addSection}
          onSaveTheme={handleSaveTheme}
          onThemeChangeLive={(newTheme) => setLiveThemeOverride(newTheme)}
          onLiveStorePatch={onLiveStorePatch}
          onSaveConfig={saveStoreConfig}
          onApplyFullArchetype={handleApplyFullArchetype}
          onReplaceSections={onReplaceSections}
          onSaveDraft={onSaveDraft}
        />
      </div>
    </div>
  );
};
