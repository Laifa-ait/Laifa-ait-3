import React from "react";
import { Eye } from "lucide-react";
import { SectionInspectorPanel } from "../inspector/SectionInspectorPanel";
import { ThemeInspectorPanel } from "../context/ThemeInspectorPanel";
import { MediaInspectorPanel } from "../context/MediaInspectorPanel";
import { StoreSettingsInspectorPanel } from "../context/StoreSettingsInspectorPanel";
import { PagesInspectorPanel } from "../context/PagesInspectorPanel";
import { CatalogInspectorPanel } from "../context/CatalogInspectorPanel";
import { OrdersInspectorPanel } from "../context/OrdersInspectorPanel";
import { SetupGuideInspectorPanel } from "../context/SetupGuideInspectorPanel";
import { HeaderNavigationInspectorPanel } from "../context/HeaderNavigationInspectorPanel";
import { StoreIdentityEditor } from "../identity/StoreIdentityEditor";
import { StudioNavMode } from "./studio.types";
import { CatalogLoadStatus } from "../../hooks/studioCatalogLoader";
import {
  CustomPageSection,
  CustomPageSectionType,
  CustomPageTheme,
  MediaFolderCategory,
  MediaGalleryItem,
  SellerStoreConfig,
} from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/product/product.types";

interface PropertiesInspectorProps {
  navMode: StudioNavMode;
  onSelectNavMode?: (mode: StudioNavMode) => void;
  onReturnToCanvas?: () => void;
  onSelectSection?: (id: string) => void;
  selectedSection: CustomPageSection | null;
  sections?: CustomPageSection[];
  products?: Product[];
  catalogStatus?: CatalogLoadStatus;
  catalogError?: string | null;
  onReloadCatalog?: () => void | Promise<void>;
  storeConfig?: SellerStoreConfig | null;
  currentTheme?: CustomPageTheme;
  mediaGallery?: MediaGalleryItem[];
  onSelectMediaUrl?: (url: string) => void;
  onReplaceMediaUrl?: (oldUrl: string, newUrl: string) => Promise<number>;
  onUploadMedia?: (file: File, options?: { folder?: MediaFolderCategory; allowVideo?: boolean }) => Promise<MediaGalleryItem>;
  onDeleteMedia?: (id: string) => Promise<void>;
  isMediaUploading?: boolean;
  mediaUploadProgress?: number;
  mediaUploadError?: string | null;
  onUpdateSection: (id: string, updatedData: Partial<CustomPageSection>) => void;
  onAddSection?: (
    type: CustomPageSectionType,
    defaultSettings: Record<string, unknown>,
    defaultTitle?: string
  ) => void;
  onSaveTheme: (theme: CustomPageTheme) => Promise<void>;
  onThemeChangeLive: (theme: CustomPageTheme) => void;
  onLiveStorePatch?: (patch: Partial<SellerStoreConfig>) => void;
  onSaveConfig: (updatedConfig: Partial<SellerStoreConfig>) => Promise<void>;
  onApplyFullArchetype?: (sections: CustomPageSection[], theme: CustomPageTheme) => Promise<void> | void;
  onReplaceSections?: (sections: CustomPageSection[]) => void;
  onSaveDraft?: () => unknown | Promise<unknown>;
}

export const PropertiesInspector: React.FC<PropertiesInspectorProps> = ({
  navMode,
  onSelectNavMode,
  onReturnToCanvas,
  onSelectSection,
  selectedSection,
  sections = [],
  products = [],
  catalogStatus,
  catalogError,
  onReloadCatalog,
  storeConfig,
  currentTheme,
  mediaGallery = [],
  onSelectMediaUrl,
  onReplaceMediaUrl,
  onUploadMedia,
  onDeleteMedia,
  isMediaUploading,
  mediaUploadProgress,
  mediaUploadError,
  onUpdateSection,
  onAddSection,
  onSaveTheme,
  onThemeChangeLive,
  onLiveStorePatch,
  onSaveConfig,
  onApplyFullArchetype,
  onReplaceSections,
  onSaveDraft,
}) => {
  return (
    <aside className="w-full bg-white border-l border-slate-200 flex flex-col h-full shrink-0 overflow-y-auto min-w-0 min-h-0">
      {onReturnToCanvas && (
        <div className="md:hidden px-3 py-2 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-semibold text-slate-600">Édition des réglages</span>
          <button
            type="button"
            data-testid="mobile-return-to-canvas-btn"
            onClick={onReturnToCanvas}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold text-slate-800 shadow-2xs cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-600" />
            <span>Retour à l&apos;aperçu</span>
          </button>
        </div>
      )}
      {navMode === "launchpad" ? (
        <SetupGuideInspectorPanel
          storeConfig={storeConfig}
          sections={sections}
          products={products}
          onSelectNavMode={
            onSelectNavMode ||
            (() => {
              /* fallback no-op */
            })
          }
        />
      ) : navMode === "header" ? (
        <HeaderNavigationInspectorPanel
          storeConfig={storeConfig}
          onLiveChange={onLiveStorePatch}
          onSaveConfig={onSaveConfig}
        />
      ) : navMode === "pages" ? (
        <PagesInspectorPanel
          storeConfig={storeConfig}
          sections={sections}
          onSaveConfig={onSaveConfig}
        />
      ) : navMode === "theme" || navMode === "atelier" ? (
        <ThemeInspectorPanel
          storeConfig={storeConfig}
          currentTheme={currentTheme}
          initialTab={navMode === "atelier" ? "atelier" : "architectures"}
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
          sections={sections}
          storeConfig={storeConfig}
          onSelectMediaUrl={onSelectMediaUrl}
          onReplaceMediaUrl={onReplaceMediaUrl}
          onUploadMedia={onUploadMedia}
          onDeleteMedia={onDeleteMedia}
          isUploading={isMediaUploading}
          uploadProgress={mediaUploadProgress}
          uploadError={mediaUploadError}
          onSaveConfig={onSaveConfig}
        />
      ) : navMode === "identity" ? (
        <StoreIdentityEditor
          storeConfig={storeConfig}
          onLiveChange={onLiveStorePatch}
          onThemeChangeLive={onThemeChangeLive}
          onSave={onSaveConfig}
        />
      ) : navMode === "catalog" ? (
        <CatalogInspectorPanel
          products={products}
          catalogStatus={catalogStatus}
          catalogError={catalogError}
          onReloadCatalog={onReloadCatalog}
          sections={sections}
          storeConfig={storeConfig}
          activeSector={currentTheme?.sector}
          onUpdateSection={onUpdateSection}
          onAddSection={
            onAddSection ||
            (() => {
              /* fallback no-op */
            })
          }
          onSaveConfig={onSaveConfig}
        />
      ) : navMode === "orders" ? (
        <OrdersInspectorPanel />
      ) : navMode === "settings" ? (
        <StoreSettingsInspectorPanel
          storeConfig={storeConfig ?? null}
          onLiveChange={onLiveStorePatch}
          onSaveConfig={onSaveConfig}
        />
      ) : (
        <SectionInspectorPanel
          section={selectedSection}
          sections={sections}
          products={products}
          storeConfig={storeConfig}
          currentTheme={currentTheme}
          onUpdateSection={onUpdateSection}
          onSelectSection={onSelectSection}
          onSaveStep={onSaveDraft}
        />
      )}
    </aside>
  );
};
