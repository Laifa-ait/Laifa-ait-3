import React, { Suspense } from "react";
import { Eye, EyeOff, Maximize2 } from "lucide-react";
import { SectionInspectorPanel } from "../inspector/SectionInspectorPanel";
import { StoreIdentityEditor } from "../identity/StoreIdentityEditor";
import { StudioNavMode } from "./studio.types";
import { CatalogLoadStatus } from "../../hooks/studioCatalogLoader";
import {
  CustomPageSection, CustomPageSectionType, CustomPageTheme,
  MediaFolderCategory, MediaGalleryItem, SellerStoreConfig,
} from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/product/product.types";

const ThemeInspectorPanel = React.lazy(() => import("../context/ThemeInspectorPanel").then((m) => ({ default: m.ThemeInspectorPanel })));
const MediaInspectorPanel = React.lazy(() => import("../context/MediaInspectorPanel").then((m) => ({ default: m.MediaInspectorPanel })));
const StoreSettingsInspectorPanel = React.lazy(() => import("../context/StoreSettingsInspectorPanel").then((m) => ({ default: m.StoreSettingsInspectorPanel })));
const PagesInspectorPanel = React.lazy(() => import("../context/PagesInspectorPanel").then((m) => ({ default: m.PagesInspectorPanel })));
const CatalogInspectorPanel = React.lazy(() => import("../context/CatalogInspectorPanel").then((m) => ({ default: m.CatalogInspectorPanel })));
const OrdersInspectorPanel = React.lazy(() => import("../context/OrdersInspectorPanel").then((m) => ({ default: m.OrdersInspectorPanel })));
const SetupGuideInspectorPanel = React.lazy(() => import("../context/SetupGuideInspectorPanel").then((m) => ({ default: m.SetupGuideInspectorPanel })));
const HeaderNavigationInspectorPanel = React.lazy(() => import("../context/HeaderNavigationInspectorPanel").then((m) => ({ default: m.HeaderNavigationInspectorPanel })));

interface PropertiesInspectorProps {
  navMode: StudioNavMode;
  onSelectNavMode?: (mode: StudioNavMode) => void;
  onReturnToCanvas?: () => void;
  mobileSplitPreviewOpen?: boolean;
  onToggleMobileSplitPreview?: () => void;
  onSelectSection?: (id: string) => void;
  selectedSection: CustomPageSection | null;
  sections?: CustomPageSection[];
  products?: Product[];
  catalogStatus?: CatalogLoadStatus;
  catalogError?: string | null;
  catalogTruncated?: boolean;
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
  onAddSection?: (type: CustomPageSectionType, defaultSettings: Record<string, unknown>, defaultTitle?: string) => void;
  onSaveTheme: (theme: CustomPageTheme) => Promise<void>;
  onThemeChangeLive: (theme: CustomPageTheme) => void;
  onLiveStorePatch?: (patch: Partial<SellerStoreConfig>) => void;
  onSaveConfig: (updatedConfig: Partial<SellerStoreConfig>) => Promise<void>;
  onApplyFullArchetype?: (sections: CustomPageSection[], theme: CustomPageTheme) => Promise<void> | void;
  onReplaceSections?: (sections: CustomPageSection[]) => void;
  onSaveDraft?: () => unknown | Promise<unknown>;
}

export const PropertiesInspector: React.FC<PropertiesInspectorProps> = ({
  navMode, onSelectNavMode, onReturnToCanvas, mobileSplitPreviewOpen = true, onToggleMobileSplitPreview,
  onSelectSection, selectedSection, sections = [], products = [], catalogStatus, catalogError, catalogTruncated,
  onReloadCatalog, storeConfig, currentTheme, mediaGallery = [], onSelectMediaUrl, onReplaceMediaUrl,
  onUploadMedia, onDeleteMedia, isMediaUploading, mediaUploadProgress, mediaUploadError, onUpdateSection,
  onAddSection, onSaveTheme, onThemeChangeLive, onLiveStorePatch, onSaveConfig, onApplyFullArchetype,
  onReplaceSections, onSaveDraft,
}) => {
  return (
    <aside className="w-full bg-white border-s border-[#E3E5E8] flex flex-col h-full flex-1 shrink-0 overflow-y-auto min-w-0 min-h-0">
      {onReturnToCanvas && (
        <div className="md:hidden px-3 py-1.5 border-b border-[#E3E5E8] bg-[#F6F7F9] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] font-semibold text-slate-700 truncate">
              {mobileSplitPreviewOpen ? "Aperçu direct en haut" : "Édition plein écran"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {onToggleMobileSplitPreview && (
              <button
                type="button" data-testid="mobile-toggle-split-preview-btn" onClick={onToggleMobileSplitPreview}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[10.5px] font-semibold transition-colors cursor-pointer ${
                  mobileSplitPreviewOpen ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {mobileSplitPreviewOpen ? (<><EyeOff className="w-3 h-3" /><span>Masquer aperçu</span></>) : (<><Eye className="w-3 h-3" /><span>Aperçu direct</span></>)}
              </button>
            )}
            <button
              type="button" data-testid="mobile-return-to-canvas-btn" onClick={onReturnToCanvas}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-[10.5px] font-semibold text-slate-800 shadow-2xs cursor-pointer"
            >
              <Maximize2 className="w-3 h-3 text-slate-600" />
              <span>Retour à l&apos;aperçu</span>
            </button>
          </div>
        </div>
      )}
      {navMode === "sections" ? (
        <SectionInspectorPanel
          section={selectedSection} sections={sections} products={products} storeConfig={storeConfig}
          currentTheme={currentTheme} onUpdateSection={onUpdateSection} onSelectSection={onSelectSection} onSaveStep={onSaveDraft}
        />
      ) : navMode === "identity" ? (
        <StoreIdentityEditor storeConfig={storeConfig} onLiveChange={onLiveStorePatch} onThemeChangeLive={onThemeChangeLive} onSave={onSaveConfig} />
      ) : (
        <Suspense fallback={<div className="p-6 text-center text-xs text-slate-400">Chargement du panneau…</div>}>
          {navMode === "launchpad" ? (
            <SetupGuideInspectorPanel storeConfig={storeConfig} sections={sections} products={products} onSelectNavMode={onSelectNavMode || (() => { /* no-op */ })} />
          ) : navMode === "header" ? (
            <HeaderNavigationInspectorPanel storeConfig={storeConfig} onLiveChange={onLiveStorePatch} onSaveConfig={onSaveConfig} />
          ) : navMode === "pages" ? (
            <PagesInspectorPanel storeConfig={storeConfig} sections={sections} onSaveConfig={onSaveConfig} />
          ) : navMode === "theme" || navMode === "atelier" ? (
            <ThemeInspectorPanel
              storeConfig={storeConfig} currentTheme={currentTheme} initialTab={navMode === "atelier" ? "atelier" : "architectures"}
              sections={sections} mediaGallery={mediaGallery} onUploadMedia={onUploadMedia} onUpdateSection={onUpdateSection}
              onReplaceSections={onReplaceSections} onSaveTheme={onSaveTheme} onThemeChangeLive={onThemeChangeLive} onApplyFullArchetype={onApplyFullArchetype}
            />
          ) : navMode === "media" ? (
            <MediaInspectorPanel
              mediaGallery={mediaGallery} sections={sections} storeConfig={storeConfig} onSelectMediaUrl={onSelectMediaUrl}
              onReplaceMediaUrl={onReplaceMediaUrl} onUploadMedia={onUploadMedia} onDeleteMedia={onDeleteMedia}
              isUploading={isMediaUploading} uploadProgress={mediaUploadProgress} uploadError={mediaUploadError} onSaveConfig={onSaveConfig}
            />
          ) : navMode === "catalog" ? (
            <CatalogInspectorPanel
              products={products} catalogStatus={catalogStatus} catalogError={catalogError} catalogTruncated={catalogTruncated}
              onReloadCatalog={onReloadCatalog} sections={sections} storeConfig={storeConfig} activeSector={currentTheme?.sector}
              onUpdateSection={onUpdateSection} onAddSection={onAddSection || (() => { /* no-op */ })} onSaveConfig={onSaveConfig}
            />
          ) : navMode === "orders" ? (
            <OrdersInspectorPanel />
          ) : (
            <StoreSettingsInspectorPanel storeConfig={storeConfig ?? null} onLiveChange={onLiveStorePatch} onSaveConfig={onSaveConfig} />
          )}
        </Suspense>
      )}
    </aside>
  );
};
