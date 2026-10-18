import React from "react";
import { SectionInspectorPanel } from "../SectionInspectorPanel";
import { ThemeInspectorPanel } from "../context/ThemeInspectorPanel";
import { MediaInspectorPanel } from "../context/MediaInspectorPanel";
import { StoreSettingsInspectorPanel } from "../context/StoreSettingsInspectorPanel";
import { PagesInspectorPanel } from "../context/PagesInspectorPanel";
import { StoreIdentityEditor } from "../StoreIdentityEditor";
import { StudioNavMode } from "../SectionTreePanel";
import { CustomPageSection, CustomPageTheme, MediaGalleryItem, SellerStoreConfig } from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/products/product.types";

interface PropertiesInspectorProps {
  navMode: StudioNavMode | "identity";
  selectedSection: CustomPageSection | null;
  products?: Product[];
  storeConfig?: SellerStoreConfig | null;
  mediaGallery?: MediaGalleryItem[];
  onUpdateSection: (id: string, updatedData: Partial<CustomPageSection>) => void;
  onSaveTheme: (theme: CustomPageTheme) => Promise<void>;
  onThemeChangeLive: (theme: CustomPageTheme) => void;
  onSaveConfig: (updatedConfig: Partial<SellerStoreConfig>) => Promise<void>;
}

export const PropertiesInspector: React.FC<PropertiesInspectorProps> = ({
  navMode,
  selectedSection,
  products = [],
  storeConfig,
  mediaGallery = [],
  onUpdateSection,
  onSaveTheme,
  onThemeChangeLive,
  onSaveConfig,
}) => {
  return (
    <aside className="w-full md:w-[320px] md:min-w-[320px] md:max-w-[320px] bg-[#FFFFFF] border-l border-[#E5E7EB] flex flex-col h-full shrink-0 overflow-y-auto min-w-0 min-h-0">
      {navMode === "pages" ? (
        <PagesInspectorPanel />
      ) : navMode === "theme" ? (
        <ThemeInspectorPanel
          storeConfig={storeConfig}
          onSaveTheme={onSaveTheme}
          onThemeChangeLive={onThemeChangeLive}
        />
      ) : navMode === "media" ? (
        <MediaInspectorPanel mediaGallery={mediaGallery} />
      ) : navMode === "identity" ? (
        <div className="p-4">
          <StoreIdentityEditor
            storeConfig={storeConfig}
            onSave={onSaveConfig}
          />
        </div>
      ) : navMode === "settings" ? (
        <StoreSettingsInspectorPanel
          storeConfig={storeConfig}
          onSaveConfig={onSaveConfig}
        />
      ) : (
        <SectionInspectorPanel
          section={selectedSection}
          products={products}
          onUpdateSection={onUpdateSection}
        />
      )}
    </aside>
  );
};

