import React from "react";
import { SectionInspectorPanel } from "../inspector/SectionInspectorPanel";
import { ThemeInspectorPanel } from "../context/ThemeInspectorPanel";
import { MediaInspectorPanel } from "../context/MediaInspectorPanel";
import { StoreSettingsInspectorPanel } from "../context/StoreSettingsInspectorPanel";
import { PagesInspectorPanel } from "../context/PagesInspectorPanel";
import { StoreIdentityEditor } from "../identity/StoreIdentityEditor";
import { StudioNavMode } from "./studio.types";
import { CustomPageSection, CustomPageTheme, MediaGalleryItem, SellerStoreConfig } from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/product/product.types";

interface PropertiesInspectorProps {
  navMode: StudioNavMode | "identity";
  selectedSection: CustomPageSection | null;
  products?: Product[];
  storeConfig?: SellerStoreConfig | null;
  currentTheme?: CustomPageTheme;
  mediaGallery?: MediaGalleryItem[];
  onSelectMediaUrl?: (url: string) => void;
  onUploadMedia?: (file: File) => Promise<MediaGalleryItem>;
  onDeleteMedia?: (id: string) => Promise<void>;
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
  currentTheme,
  mediaGallery = [],
  onSelectMediaUrl,
  onUploadMedia,
  onDeleteMedia,
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
          currentTheme={currentTheme}
          onSaveTheme={onSaveTheme}
          onThemeChangeLive={onThemeChangeLive}
        />
      ) : navMode === "media" ? (
        <MediaInspectorPanel
          mediaGallery={mediaGallery}
          onSelectMediaUrl={onSelectMediaUrl}
          onUploadMedia={onUploadMedia}
          onDeleteMedia={onDeleteMedia}
        />
      ) : navMode === "identity" ? (
        <div className="p-4">
          <StoreIdentityEditor
            storeConfig={storeConfig}
            onSave={onSaveConfig}
          />
        </div>
      ) : navMode === "settings" ? (
        <StoreSettingsInspectorPanel
          storeConfig={storeConfig ?? null}
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

