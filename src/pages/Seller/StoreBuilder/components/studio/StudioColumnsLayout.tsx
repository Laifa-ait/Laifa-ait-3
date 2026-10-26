import React from "react";
import { SectionTreePanel } from "./SectionTreePanel";
import { StudioPreview } from "./StudioPreview";
import { PropertiesInspector } from "./PropertiesInspector";
import { StudioNavMode } from "./studio.types";
import { MobileStudioColumn } from "./MobileStudioNavigation";
import {
  CustomPageSection,
  CustomPageSectionType,
  CustomPageTheme,
  SellerStoreConfig,
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
  addSection: (type: CustomPageSectionType, settings: Record<string, unknown>, title?: string) => void;
  currentTheme: CustomPageTheme;
  products: Product[];
  storeConfig?: SellerStoreConfig | null;
  viewport: "mobile" | "tablet" | "desktop";
  setViewport: (vp: "mobile" | "tablet" | "desktop") => void;
  setShowLeftSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  selectedSection: CustomPageSection | null;
  mediaGallery: MediaGalleryItem[];
  handleSelectMediaUrl: (url: string) => void;
  onUploadMedia?: (file: File) => Promise<MediaGalleryItem>;
  onDeleteMedia?: (id: string) => Promise<void>;
  updateSection: (id: string, updatedData: Partial<CustomPageSection>) => void;
  handleSaveTheme: (theme: CustomPageTheme) => Promise<void>;
  setLiveThemeOverride: (theme: CustomPageTheme | null) => void;
  saveStoreConfig: (config: Partial<SellerStoreConfig>) => Promise<void>;
  handleApplyFullArchetype: (sections: CustomPageSection[], theme: CustomPageTheme) => Promise<void>;
  onReplaceSections?: (sections: CustomPageSection[]) => void;
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
  storeConfig,
  viewport,
  setViewport,
  setShowLeftSidebar,
  selectedSection,
  mediaGallery,
  handleSelectMediaUrl,
  onUploadMedia,
  onDeleteMedia,
  updateSection,
  handleSaveTheme,
  setLiveThemeOverride,
  saveStoreConfig,
  handleApplyFullArchetype,
  onReplaceSections,
}) => {
  return (
    <div className="flex-1 flex overflow-hidden min-w-0 min-h-0">
      {/* Left Column: Unified Navigation + Section Tree */}
      <div
        className={`h-full min-w-0 transition-all duration-200 ${
          mobileColumn === "tree" ? "block w-full flex-1 md:flex-none" : "hidden"
        } ${showLeftSidebar ? "md:block md:w-[295px] lg:w-[305px] md:shrink-0" : "md:hidden"}`}
      >
        <SectionTreePanel
          sections={sections}
          selectedSectionId={selectedSectionId}
          products={products}
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
          storeConfig={storeConfig}
          viewport={viewport}
          onViewportChange={setViewport}
          selectedSectionId={selectedSectionId}
          shopSlug={storeConfig?.shopSlug}
          shopName={storeConfig?.shopName}
          onSelectSection={(id) => {
            setSelectedSectionId(id);
            setNavMode("sections");
            setShowRightSidebar(true);
          }}
          showLeftSidebar={showLeftSidebar}
          onToggleLeftSidebar={() => setShowLeftSidebar((prev) => !prev)}
          showRightSidebar={showRightSidebar}
          onToggleRightSidebar={() => setShowRightSidebar((prev) => !prev)}
        />
      </div>

      {/* Right Column: Contextual Inspector */}
      <div
        className={`h-full min-w-0 transition-all duration-200 ${
          mobileColumn === "inspector" ? "block w-full flex-1 md:flex-none" : "hidden"
        } ${showRightSidebar ? "md:block md:w-[335px] md:shrink-0" : "md:hidden"}`}
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
          onApplyFullArchetype={handleApplyFullArchetype}
          onReplaceSections={onReplaceSections}
        />
      </div>
    </div>
  );
};
