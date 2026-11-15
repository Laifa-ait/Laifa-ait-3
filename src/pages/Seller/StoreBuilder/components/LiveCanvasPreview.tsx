import React, { useState, useEffect, useMemo } from "react";
import {
  CategoryItem, CollectionPageDesignConfig, CustomPageSection, CustomPageTheme, SellerStoreConfig, StoreCustomPageItem,
} from "../../../../domains/seller/customPage.types";
import { Product } from "../../../../domains/product/product.types";
import { StoreSectionRenderer } from "../../../../components/Store/sections/StoreSectionRenderer";
import { StoreCollectionPageView } from "../../../../components/Store/StoreCollectionPageView";
import { StoreCustomHeaderBar } from "../../../../components/Store/StoreCustomHeaderBar";
import { ArtisticAtmosphereLayer } from "../../../../components/Store/ArtisticAtmosphereLayer";
import { useStoreFontLoader, buildStoreThemeCssVariables } from "../../../../components/Store/useStoreFontLoader";
import { Sparkles } from "lucide-react";
import { PreviewControlToolbar, PreviewDevice, PreviewOrientation } from "./preview/PreviewControlToolbar";
import { PreviewQrModal } from "./preview/PreviewQrModal";
import { PreviewAuditModal } from "./preview/PreviewAuditModal";
import { CanvasGridOverlay } from "./preview/CanvasGridOverlay";
import { InteractiveCartSimulator } from "./preview/InteractiveCartSimulator";
import { CanvasPageSwitcherBar } from "./preview/CanvasPageSwitcherBar";
import { useStudioStore } from "../store/useStudioStore";
import { useCanvasPreviewEvents } from "../hooks/useCanvasPreviewEvents";

interface LiveCanvasPreviewProps {
  sections: CustomPageSection[];
  theme: CustomPageTheme;
  products: Product[];
  storeConfig?: SellerStoreConfig | null;
  viewport?: "mobile" | "tablet" | "desktop";
  onViewportChange?: (vp: "mobile" | "tablet" | "desktop") => void;
  selectedSectionId: string | null;
  shopSlug?: string;
  shopName?: string;
  onSelectSection: (id: string) => void;
  showLeftSidebar?: boolean;
  onToggleLeftSidebar?: () => void;
  showRightSidebar?: boolean;
  onToggleRightSidebar?: () => void;
}

function getContainerWidthClass(device: PreviewDevice, orientation: PreviewOrientation): string {
  if (device === "mobile") {
    return orientation === "portrait"
      ? "w-full sm:w-[390px] max-w-full min-h-[680px] rounded-xl sm:rounded-[28px] border border-slate-300 sm:border-[6px] sm:border-slate-800 shadow-lg"
      : "w-full sm:w-[720px] max-w-full min-h-[390px] rounded-xl sm:rounded-[28px] border border-slate-300 sm:border-[6px] sm:border-slate-800 shadow-lg";
  }
  if (device === "tablet") {
    return orientation === "portrait"
      ? "w-full sm:w-[768px] max-w-full min-h-[820px] rounded-xl sm:rounded-[20px] border border-slate-300 sm:border-[6px] sm:border-slate-700 shadow-lg"
      : "w-full sm:w-[960px] max-w-full min-h-[600px] rounded-xl sm:rounded-[20px] border border-slate-300 sm:border-[6px] sm:border-slate-700 shadow-lg";
  }
  return "w-full max-w-6xl rounded-xl border border-slate-200/90 shadow-sm";
}

export const LiveCanvasPreview: React.FC<LiveCanvasPreviewProps> = ({
  sections, theme, products, storeConfig, viewport: propViewport, onViewportChange,
  selectedSectionId: propSelectedSectionId, shopSlug, shopName, onSelectSection,
  showLeftSidebar = true, onToggleLeftSidebar, showRightSidebar = true, onToggleRightSidebar,
}) => {
  const storeViewport = useStudioStore((s) => s.viewport);
  const storeSetViewport = useStudioStore((s) => s.setViewport);
  const zoom = useStudioStore((s) => s.zoom);
  const setZoom = useStudioStore((s) => s.setZoom);
  const storeSelectedSectionId = useStudioStore((s) => s.selectedSectionId);
  const selectSectionInStore = useStudioStore((s) => s.selectSection);
  const isInteractiveMode = useStudioStore((s) => s.isInteractiveMode);
  const setIsInteractiveMode = useStudioStore((s) => s.setIsInteractiveMode);

  const device: PreviewDevice = propViewport ?? storeViewport;
  const selectedSectionId = storeSelectedSectionId ?? propSelectedSectionId;

  const [orientation, setOrientation] = useState<PreviewOrientation>("portrait");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [simulatedCart, setSimulatedCart] = useState<Product[]>([]);
  const [canvasViewMode, setCanvasViewMode] = useState<"home" | "category" | "collection" | "custom-page">("home");
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);
  const [activeCategoryOverride, setActiveCategoryOverride] = useState<CategoryItem | null>(null);
  const [activeCustomPage, setActiveCustomPage] = useState<StoreCustomPageItem | null>(null);
  const [liveCollectionConfig, setLiveCollectionConfig] = useState<CollectionPageDesignConfig | undefined>(storeConfig?.collectionPageConfig);

  useStoreFontLoader(theme, "studio-canvas");

  useEffect(() => {
    if (storeConfig?.collectionPageConfig) setLiveCollectionConfig(storeConfig.collectionPageConfig);
  }, [storeConfig?.collectionPageConfig]);

  const allCategories = useMemo<CategoryItem[]>(() => {
    const catSec = sections.find((s) => s.type === "featured_categories");
    const raw = (catSec?.settings as { categories?: CategoryItem[] } | undefined)?.categories;
    return Array.isArray(raw) ? raw : [];
  }, [sections]);

  const activeCategory = useMemo<CategoryItem | null>(() => {
    if (activeCategoryOverride) return activeCategoryOverride;
    if (!activeCategorySlug) return null;
    return allCategories.find((c) => c.slug === activeCategorySlug || c.id === activeCategorySlug) || null;
  }, [allCategories, activeCategorySlug, activeCategoryOverride]);

  useEffect(() => {
    if (propViewport && propViewport !== storeViewport) storeSetViewport(propViewport);
  }, [propViewport, storeViewport, storeSetViewport]);

  useCanvasPreviewEvents({
    setCanvasViewMode, setActiveCategorySlug, setActiveCategoryOverride, setActiveCustomPage,
    setLiveCollectionConfig, setIsAuditModalOpen, setIsQrModalOpen, setIsInteractiveMode,
  });

  const canvasStyle = { isolation: "isolate" as const, ...buildStoreThemeCssVariables(theme, isDarkMode) };
  const sectionGapPx = typeof theme.spacingYPx === "number" ? theme.spacingYPx : 28;
  const isCollectionView = canvasViewMode === "category" || canvasViewMode === "collection" || (canvasViewMode === "custom-page" && activeCustomPage?.templateId === "collection");
  const displayedSections = canvasViewMode === "custom-page" && activeCustomPage?.sectionIds?.length ? sections.filter((s) => activeCustomPage.sectionIds?.includes(s.id)) : sections;

  return (
    <div className={`flex flex-col min-h-0 min-w-0 flex-1 overflow-hidden ${isFullscreen ? "fixed inset-0 z-50 bg-[#F4F5F7]" : "relative h-full"}`}>
      <PreviewControlToolbar
        device={device} setDevice={(next) => { storeSetViewport(next); onViewportChange?.(next); }}
        orientation={orientation} toggleOrientation={() => setOrientation((p) => (p === "portrait" ? "landscape" : "portrait"))}
        zoom={zoom} setZoom={(val) => setZoom(typeof val === "function" ? val(zoom) : val)}
        isInteractiveMode={isInteractiveMode} setIsInteractiveMode={setIsInteractiveMode}
        isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}
        showGrid={showGrid} setShowGrid={setShowGrid}
        isFullscreen={isFullscreen} toggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        onOpenQrModal={() => setIsQrModalOpen(true)} onOpenAuditModal={() => setIsAuditModalOpen(true)}
        showLeftSidebar={showLeftSidebar} onToggleLeftSidebar={onToggleLeftSidebar}
        showRightSidebar={showRightSidebar} onToggleRightSidebar={onToggleRightSidebar}
      />

      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain touch-pan-y studio-canvas-backdrop pt-4 pb-8 px-3 sm:px-6 relative flex flex-col items-center">
        <CanvasGridOverlay showGrid={showGrid} />
        <div className="transition-transform duration-200 origin-top flex justify-center w-full" style={{ transform: `scale(${zoom})` }}>
          <div className={`olmart-store-canvas-scope @container/store @container transition-all duration-300 relative overflow-hidden ${getContainerWidthClass(device, orientation)}`} data-studio-preview-viewport={device} style={canvasStyle}>
            <ArtisticAtmosphereLayer theme={theme} isDarkMode={isDarkMode} />

            <div className="relative z-10">
              <CanvasPageSwitcherBar
                canvasViewMode={canvasViewMode} activeCategorySlug={activeCategorySlug} allCategories={allCategories}
                customPages={storeConfig?.customPages} activeCustomPage={activeCustomPage}
                onSelectHome={() => { setCanvasViewMode("home"); setActiveCategorySlug(null); setActiveCustomPage(null); }}
                onSelectCollection={() => { setCanvasViewMode("collection"); setActiveCategorySlug(null); setActiveCustomPage(null); }}
                onSelectCategorySlug={(slug) => { if (!slug) { setCanvasViewMode("home"); setActiveCategorySlug(null); } else { setCanvasViewMode("category"); setActiveCategorySlug(slug); } }}
                onSelectCustomPage={(cp) => { setCanvasViewMode("custom-page"); setActiveCustomPage(cp); setActiveCategorySlug(null); }}
              />

              <StoreCustomHeaderBar
                storeConfig={storeConfig}
                theme={theme}
                shopName={shopName}
                isEditable={!isInteractiveMode}
                onSelectHeader={() =>
                  window.dispatchEvent(
                    new CustomEvent("studio:select-nav-mode", { detail: { mode: "header" } })
                  )
                }
                onNavigateView={(mode) => { setCanvasViewMode(mode); setActiveCategorySlug(null); }}
              />

              {isCollectionView ? (
                <StoreCollectionPageView
                  activeCategory={activeCategory} allCategories={allCategories} products={products} theme={theme}
                  config={liveCollectionConfig || storeConfig?.collectionPageConfig}
                  pageTitle={canvasViewMode === "custom-page" ? activeCustomPage?.title : undefined}
                  pageSubtitle={canvasViewMode === "custom-page" ? activeCustomPage?.subtitle : undefined}
                  pageBannerUrl={canvasViewMode === "custom-page" ? activeCustomPage?.bannerUrl : undefined}
                  isStudioPreview={!isInteractiveMode} previewViewport={device}
                  onSelectCategory={(cat) => { if (cat) { setCanvasViewMode("category"); setActiveCategorySlug(cat.slug); } else { setCanvasViewMode("collection"); setActiveCategorySlug(null); } }}
                  onBackToHome={() => { setCanvasViewMode("home"); setActiveCategorySlug(null); }}
                />
              ) : displayedSections.length === 0 ? (
                <div className="p-14 text-center text-[#667085] space-y-3" data-testid="canvas-empty-state">
                  <Sparkles className="w-8 h-8 text-amber-600 mx-auto" />
                  <p className="font-bold text-sm text-[#17191C]">Votre page ne contient aucune section</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Ajoutez votre première section pour construire l&apos;aperçu de votre vitrine en direct.
                  </p>
                  {!isInteractiveMode && (
                    <button
                      type="button"
                      data-testid="canvas-empty-add-section-btn"
                      onClick={() => window.dispatchEvent(new CustomEvent("studio:open-add-section-modal"))}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      + Ajouter une première section
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col p-2 @sm:p-4" style={{ gap: `${sectionGapPx}px`, paddingTop: `${Math.round(sectionGapPx * 0.5)}px`, paddingBottom: `${Math.round(sectionGapPx * 0.5)}px` }}>
                  {canvasViewMode === "custom-page" && activeCustomPage && (
                    <div className="px-4 py-3 rounded-xl border border-slate-200 bg-white/90 flex items-center justify-between" data-testid="canvas-custom-page-banner">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Page personnalisée • /store/{shopSlug || "boutique"}/p/{activeCustomPage.slug}</span>
                        <h2 className="text-base font-black text-slate-900">{activeCustomPage.title}</h2>
                      </div>
                      <button type="button" onClick={() => { setCanvasViewMode("home"); setActiveCustomPage(null); }} className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700">Retour Accueil</button>
                    </div>
                  )}
                  {displayedSections.map((section, idx) => (
                    <StoreSectionRenderer
                      key={section.id} section={section} theme={theme} products={products}
                      isEditable={!isInteractiveMode} isSelected={!isInteractiveMode && section.id === selectedSectionId}
                      sectionIndex={idx} totalSections={displayedSections.length} previewViewport={device}
                      onSelectSection={isInteractiveMode ? () => { if (products[0]) setSimulatedCart((p) => [...p, products[0]]); } : (id) => { selectSectionInStore(id); onSelectSection(id); }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <InteractiveCartSimulator isInteractiveMode={isInteractiveMode} cartItems={simulatedCart} onClearCart={() => setSimulatedCart([])} />
      <PreviewQrModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} shopSlug={shopSlug} shopName={shopName} />
      <PreviewAuditModal isOpen={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} sections={sections} theme={theme} products={products} storeConfig={storeConfig} shopName={shopName} shopSlug={shopSlug} />
    </div>
  );
};
