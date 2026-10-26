import React from "react";
import { SectionInspectorPanel } from "../inspector/SectionInspectorPanel";
import { ThemeInspectorPanel } from "../context/ThemeInspectorPanel";
import { MediaInspectorPanel } from "../context/MediaInspectorPanel";
import { StoreSettingsInspectorPanel } from "../context/StoreSettingsInspectorPanel";
import { PagesInspectorPanel } from "../context/PagesInspectorPanel";
import { CatalogInspectorPanel } from "../context/CatalogInspectorPanel";
import { OrdersInspectorPanel } from "../context/OrdersInspectorPanel";
import { StoreIdentityEditor } from "../identity/StoreIdentityEditor";
import { StudioNavMode } from "./studio.types";
import {
  CustomPageSection,
  CustomPageSectionType,
  CustomPageTheme,
  MediaGalleryItem,
  SellerStoreConfig,
} from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/product/product.types";

interface PropertiesInspectorProps {
  navMode: StudioNavMode;
  selectedSection: CustomPageSection | null;
  sections?: CustomPageSection[];
  products?: Product[];
  storeConfig?: SellerStoreConfig | null;
  currentTheme?: CustomPageTheme;
  mediaGallery?: MediaGalleryItem[];
  onSelectMediaUrl?: (url: string) => void;
  onUploadMedia?: (file: File) => Promise<MediaGalleryItem>;
  onDeleteMedia?: (id: string) => Promise<void>;
  onUpdateSection: (id: string, updatedData: Partial<CustomPageSection>) => void;
  onAddSection?: (
    type: CustomPageSectionType,
    defaultSettings: Record<string, unknown>,
    defaultTitle?: string
  ) => void;
  onSaveTheme: (theme: CustomPageTheme) => Promise<void>;
  onThemeChangeLive: (theme: CustomPageTheme) => void;
  onSaveConfig: (updatedConfig: Partial<SellerStoreConfig>) => Promise<void>;
  onApplyFullArchetype?: (sections: CustomPageSection[], theme: CustomPageTheme) => Promise<void> | void;
  onReplaceSections?: (sections: CustomPageSection[]) => void;
}

export const PropertiesInspector: React.FC<PropertiesInspectorProps> = ({
  navMode,
  selectedSection,
  sections = [],
  products = [],
  storeConfig,
  currentTheme,
  mediaGallery = [],
  onSelectMediaUrl,
  onUploadMedia,
  onDeleteMedia,
  onUpdateSection,
  onAddSection,
  onSaveTheme,
  onThemeChangeLive,
  onSaveConfig,
  onApplyFullArchetype,
  onReplaceSections,
}) => {
  return (
    <aside className="w-full md:w-[330px] md:min-w-[330px] md:max-w-[330px] bg-[#FFFFFF] border-l border-[#E5E7EB] flex flex-col h-full shrink-0 overflow-y-auto min-w-0 min-h-0">
      {navMode === "pages" ? (
        <PagesInspectorPanel
          storeConfig={storeConfig}
          sections={sections}
          onSaveConfig={onSaveConfig}
        />
      ) : navMode === "theme" ? (
        <ThemeInspectorPanel
          storeConfig={storeConfig}
          currentTheme={currentTheme}
          sections={sections}
          mediaGallery={mediaGallery}
          onUploadMedia={onUploadMedia}
          onUpdateSection={onUpdateSection}
          onReplaceSections={onReplaceSections}
          onSaveTheme={onSaveTheme}
          onThemeChangeLive={onThemeChangeLive}
          onApplyFullArchetype={onApplyFullArchetype}
        />
      ) : navMode === "media" ? (
        <MediaInspectorPanel
          mediaGallery={mediaGallery}
          onSelectMediaUrl={onSelectMediaUrl}
          onUploadMedia={onUploadMedia}
          onDeleteMedia={onDeleteMedia}
        />
      ) : navMode === "identity" ? (
        <div className="p-2">
          <StoreIdentityEditor storeConfig={storeConfig} onSave={onSaveConfig} />
        </div>
      ) : navMode === "catalog" ? (
        <CatalogInspectorPanel
          products={products}
          sections={sections}
          onUpdateSection={onUpdateSection}
          onAddSection={
            onAddSection ||
            (() => {
              /* fallback no-op */
            })
          }
        />
      ) : navMode === "orders" ? (
        <OrdersInspectorPanel />
      ) : navMode === "settings" ? (
        <StoreSettingsInspectorPanel
          storeConfig={storeConfig ?? null}
          onSaveConfig={onSaveConfig}
        />
      ) : (
        <SectionInspectorPanel
          section={selectedSection}
          sections={sections}
          products={products}
          currentTheme={currentTheme}
          onUpdateSection={onUpdateSection}
        />
      )}
    </aside>
  );
};
