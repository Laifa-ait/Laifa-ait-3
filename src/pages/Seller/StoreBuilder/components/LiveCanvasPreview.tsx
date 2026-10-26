import React, { useState, useEffect, useMemo } from "react";
import {
  CategoryItem,
  CollectionPageDesignConfig,
  CustomPageSection,
  CustomPageTheme,
  SellerStoreConfig,
  StoreCustomPageItem,
} from "../../../../domains/seller/customPage.types";
import { Product } from "../../../../domains/product/product.types";
import { StoreSectionRenderer } from "../../../../components/Store/sections/StoreSectionRenderer";
import { StoreCollectionPageView } from "../../../../components/Store/StoreCollectionPageView";
import { Sparkles, Home, Layers, FolderOpen } from "lucide-react";
import {
  PreviewControlToolbar,
  PreviewDevice,
  PreviewOrientation,
} from "./preview/PreviewControlToolbar";
import { PreviewQrModal } from "./preview/PreviewQrModal";
import { PreviewAuditModal } from "./preview/PreviewAuditModal";
import { CanvasGridOverlay } from "./preview/CanvasGridOverlay";
import { InteractiveCartSimulator } from "./preview/InteractiveCartSimulator";
import { useStudioStore } from "../store/useStudioStore";

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

export const LiveCanvasPreview: React.FC<LiveCanvasPreviewProps> = ({
  sections,
  theme,
  products,
  storeConfig,
  viewport: propViewport,
  onViewportChange,
  selectedSectionId: propSelectedSectionId,
  shopSlug,
  shopName,
  onSelectSection,
  showLeftSidebar = true,
  onToggleLeftSidebar,
  showRightSidebar = true,
  onToggleRightSidebar,
}) => {
  const storeViewport = useStudioStore((s) => s.viewport);
  const storeSetViewport = useStudioStore((s) => s.setViewport);
  const zoom = useStudioStore((s) => s.zoom);
  const setZoom = useStudioStore((s) => s.setZoom);
  const storeSelectedSectionId = useStudioStore((s) => s.selectedSectionId);
  const selectSectionInStore = useStudioStore((s) => s.selectSection);

  const device: PreviewDevice = propViewport ?? storeViewport;
  const selectedSectionId = storeSelectedSectionId ?? propSelectedSectionId;

  const [orientation, setOrientation] = useState<PreviewOrientation>("portrait");
  const [isInteractiveMode, setIsInteractiveMode] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [simulatedCart, setSimulatedCart] = useState<Product[]>([]);

  // Multi-Page / Category Page State on Canvas
  const [canvasViewMode, setCanvasViewMode] = useState<
    "home" | "category" | "collection" | "custom-page"
  >("home");
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);
  const [activeCustomPage, setActiveCustomPage] = useState<StoreCustomPageItem | null>(null);
  const [liveCollectionConfig, setLiveCollectionConfig] =
    useState<CollectionPageDesignConfig | undefined>(storeConfig?.collectionPageConfig);

  useEffect(() => {
    if (storeConfig?.collectionPageConfig) {
      setLiveCollectionConfig(storeConfig.collectionPageConfig);
    }
  }, [storeConfig?.collectionPageConfig]);

  const allCategories = useMemo<CategoryItem[]>(() => {
    const catSec = sections.find((s) => s.type === "featured_categories");
    if (!catSec) return [];
    const raw = (catSec.settings as { categories?: CategoryItem[] }).categories;
    return Array.isArray(raw) ? raw : [];
  }, [sections]);

  const activeCategory = useMemo<CategoryItem | null>(() => {
    if (!activeCategorySlug) return null;
    return (
      allCategories.find(
        (c) => c.slug === activeCategorySlug || c.id === activeCategorySlug
      ) || null
    );
  }, [allCategories, activeCategorySlug]);

  useEffect(() => {
    if (propViewport && propViewport !== storeViewport) {
      storeSetViewport(propViewport);
    }
  }, [propViewport, storeViewport, storeSetViewport]);

  useEffect(() => {
    const pageNavHandler = (event: Event) => {
      const custom = event as CustomEvent<{
        viewMode?: "home" | "category" | "collection" | "custom-page";
        categorySlug?: string;
        categoryItem?: CategoryItem;
        customPage?: StoreCustomPageItem;
      }>;
      const detail = custom.detail || {};
      if (detail.viewMode === "home") {
        setCanvasViewMode("home");
        setActiveCategorySlug(null);
      } else if (detail.viewMode === "category") {
        setCanvasViewMode("category");
        setActiveCategorySlug(
          detail.categorySlug || detail.categoryItem?.slug || null
        );
      } else if (detail.viewMode === "collection") {
        setCanvasViewMode("collection");
        setActiveCategorySlug(null);
      } else if (detail.viewMode === "custom-page" && detail.customPage) {
        setCanvasViewMode("custom-page");
        setActiveCustomPage(detail.customPage);
        setActiveCategorySlug(null);
      }
    };

    const colConfigHandler = (event: Event) => {
      const custom = event as CustomEvent<{
        collectionPageConfig?: CollectionPageDesignConfig;
      }>;
      if (custom.detail?.collectionPageConfig) {
        setLiveCollectionConfig(custom.detail.collectionPageConfig);
      }
    };

    const openAuditHandler = () => setIsAuditModalOpen(true);
    const openQrHandler = () => setIsQrModalOpen(true);
    const toggleInteractiveHandler = () => setIsInteractiveMode((prev) => !prev);

    window.addEventListener("studio:navigate-page", pageNavHandler);
    window.addEventListener("studio:collection-config-updated", colConfigHandler);
    window.addEventListener("studio:open-audit", openAuditHandler);
    window.addEventListener("studio:open-qr", openQrHandler);
    window.addEventListener("studio:toggle-interactive", toggleInteractiveHandler);
    return () => {
      window.removeEventListener("studio:navigate-page", pageNavHandler);
      window.removeEventListener("studio:collection-config-updated", colConfigHandler);
      window.removeEventListener("studio:open-audit", openAuditHandler);
      window.removeEventListener("studio:open-qr", openQrHandler);
      window.removeEventListener("studio:toggle-interactive", toggleInteractiveHandler);
    };
  }, []);

  const handleSetDevice = (nextDevice: PreviewDevice) => {
    storeSetViewport(nextDevice);
    if (onViewportChange) onViewportChange(nextDevice);
  };

  const getContainerWidthClass = () => {
    if (device === "mobile") {
      return orientation === "portrait"
        ? "w-full sm:w-[390px] max-w-full min-h-[680px] rounded-2xl sm:rounded-[34px] border border-slate-200 sm:border-[10px] sm:border-[#1F2937] shadow-lg sm:shadow-2xl"
        : "w-full sm:w-[720px] max-w-full min-h-[390px] rounded-2xl sm:rounded-[34px] border border-slate-200 sm:border-[10px] sm:border-[#1F2937] shadow-lg sm:shadow-2xl";
    }
    if (device === "tablet") {
      return orientation === "portrait"
        ? "w-full sm:w-[768px] max-w-full min-h-[820px] rounded-2xl sm:rounded-[24px] border border-slate-200 sm:border-[8px] sm:border-[#374151] shadow-lg sm:shadow-2xl"
        : "w-full sm:w-[960px] max-w-full min-h-[600px] rounded-2xl sm:rounded-[24px] border border-slate-200 sm:border-[8px] sm:border-[#374151] shadow-lg sm:shadow-2xl";
    }
    return "w-full max-w-6xl rounded-xl border border-[#E4E7EC] shadow-lg";
  };

  const canvasStyle: React.CSSProperties & Record<`--${string}`, string> = {
    isolation: "isolate",
    fontFamily: theme.fontFamily || "'Plus Jakarta Sans', sans-serif",
    backgroundColor: isDarkMode ? "#0F172A" : theme.canvasColor || "#FFFFFF",
    color: isDarkMode ? "#F8FAFC" : undefined,
    "--store-primary": theme.primaryColor || "#F97316",
    "--store-secondary": theme.secondaryColor || "#111827",
    "--store-accent": theme.accentColor || "#F59E0B",
    "--store-canvas": isDarkMode ? "#0F172A" : theme.canvasColor || "#FFFFFF",
    "--store-surface": theme.surfaceColor || "#FFFFFF",
    "--store-font": theme.fontFamily || "'Plus Jakarta Sans', sans-serif",
  };

  const openPageCustomizerInStudio = () => {
    window.dispatchEvent(
      new CustomEvent("studio:navigate-page", {
        detail: {
          viewMode: canvasViewMode === "home" ? "collection" : canvasViewMode,
          categorySlug: activeCategorySlug || undefined,
          openCustomizer: true,
        },
      })
    );
  };

  const handleSelectSectionOnCanvas = (id: string) => {
    selectSectionInStore(id);
    onSelectSection(id);
  };

  return (
    <div
      className={`flex flex-col min-h-0 min-w-0 flex-1 overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-50 bg-[#F5F6F8]" : "relative h-full"
      }`}
    >
      <PreviewControlToolbar
        device={device}
        setDevice={handleSetDevice}
        orientation={orientation}
        toggleOrientation={() =>
          setOrientation((prev) => (prev === "portrait" ? "landscape" : "portrait"))
        }
        zoom={zoom}
        setZoom={(val) => setZoom(typeof val === "function" ? val(zoom) : val)}
        isInteractiveMode={isInteractiveMode}
        setIsInteractiveMode={setIsInteractiveMode}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        isFullscreen={isFullscreen}
        toggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
        showLeftSidebar={showLeftSidebar}
        onToggleLeftSidebar={onToggleLeftSidebar}
        showRightSidebar={showRightSidebar}
        onToggleRightSidebar={onToggleRightSidebar}
      />

      <div
        className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain touch-pan-y bg-[#EEF2F6] p-3 sm:p-6 relative flex flex-col items-center"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <CanvasGridOverlay showGrid={showGrid} />

        <div
          className="transition-transform duration-200 origin-top flex justify-center w-full py-2"
          style={{ transform: `scale(${zoom})` }}
        >
          <div
            className={`olmart-store-canvas-scope @container/store @container transition-all duration-300 relative bg-white overflow-hidden ${getContainerWidthClass()}`}
            data-studio-preview-viewport={device}
            style={canvasStyle}
          >
            {/* Studio Multi-Page Navigation Strip — Clean Light Bar */}
            <div className="bg-[#F8FBFC] text-[#011C40] px-3 py-2 flex items-center justify-between gap-2 border-b border-slate-200/90">
              <div className="inline-flex items-center bg-slate-200/70 p-0.5 rounded-lg border border-slate-200/80 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setCanvasViewMode("home");
                    setActiveCategorySlug(null);
                  }}
                  className={`h-7 px-2.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                    canvasViewMode === "home"
                      ? "bg-[#023859] text-white shadow-2xs"
                      : "text-slate-600 hover:text-[#011C40]"
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Accueil</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCanvasViewMode("collection");
                    setActiveCategorySlug(null);
                  }}
                  className={`h-7 px-2.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                    canvasViewMode === "collection" && !activeCategorySlug
                      ? "bg-[#023859] text-white shadow-2xs"
                      : "text-slate-600 hover:text-[#011C40]"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Catalogue</span>
                </button>
              </div>

              {allCategories.length > 0 && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <FolderOpen className="w-3.5 h-3.5 text-[#26658C] shrink-0 hidden sm:block" />
                  <select
                    aria-label="Sélectionner un rayon à prévisualiser"
                    value={canvasViewMode === "category" && activeCategorySlug ? activeCategorySlug : ""}
                    onChange={(e) => {
                      const slug = e.target.value;
                      if (!slug) {
                        setCanvasViewMode("home");
                        setActiveCategorySlug(null);
                      } else {
                        setCanvasViewMode("category");
                        setActiveCategorySlug(slug);
                      }
                    }}
                    className={`h-7 pl-2.5 pr-6 rounded-lg text-[11px] font-bold border transition-all cursor-pointer outline-none max-w-[175px] sm:max-w-[220px] truncate ${
                      canvasViewMode === "category" && activeCategorySlug
                        ? "bg-[#023859] text-white border-[#023859]"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <option value="" className="bg-white text-slate-700">
                      Rayon ({allCategories.length})...
                    </option>
                    {allCategories.map((cat) => (
                      <option key={cat.id} value={cat.slug} className="bg-white text-slate-800">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {canvasViewMode !== "home" ? (
              <StoreCollectionPageView
                activeCategory={activeCategory}
                allCategories={allCategories}
                products={products}
                theme={theme}
                config={liveCollectionConfig || storeConfig?.collectionPageConfig}
                pageTitle={
                  canvasViewMode === "custom-page" ? activeCustomPage?.title : undefined
                }
                pageSubtitle={
                  canvasViewMode === "custom-page" ? activeCustomPage?.subtitle : undefined
                }
                pageBannerUrl={
                  canvasViewMode === "custom-page" ? activeCustomPage?.bannerUrl : undefined
                }
                isStudioPreview={!isInteractiveMode}
                previewViewport={device}
                onSelectCategory={(cat) => {
                  if (cat) {
                    setCanvasViewMode("category");
                    setActiveCategorySlug(cat.slug);
                  } else {
                    setCanvasViewMode("collection");
                    setActiveCategorySlug(null);
                  }
                }}
                onBackToHome={() => {
                  setCanvasViewMode("home");
                  setActiveCategorySlug(null);
                }}
                onOpenPageCustomizer={openPageCustomizerInStudio}
              />
            ) : sections.length === 0 ? (
              <div className="p-16 text-center text-[#667085] space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] text-[#F97316] border border-[#FDBA74] flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <p className="font-bold text-[14px] text-[#17191C]">
                  Prévisualisation en direct
                </p>
                <p className="text-[13px] text-[#667085] max-w-sm mx-auto leading-relaxed">
                  Ajoutez des sections depuis la colonne gauche pour composer votre vitrine.
                </p>
              </div>
            ) : (
              <div
                className="space-y-4 p-2 @sm:p-4"
                style={{
                  paddingTop: theme.spacingYPx ? `${theme.spacingYPx / 2}px` : undefined,
                  paddingBottom: theme.spacingYPx ? `${theme.spacingYPx / 2}px` : undefined,
                }}
              >
                {sections.map((section, idx) => {
                  const responsive = section.settings as unknown as {
                    hideOnMobile?: boolean;
                    hideOnDesktop?: boolean;
                  };
                  if (
                    (device === "mobile" && responsive.hideOnMobile) ||
                    (device === "desktop" && responsive.hideOnDesktop)
                  ) {
                    return null;
                  }
                  return (
                    <StoreSectionRenderer
                      key={section.id}
                      section={section}
                      theme={theme}
                      products={products}
                      isEditable={!isInteractiveMode}
                      isSelected={!isInteractiveMode && section.id === selectedSectionId}
                      sectionIndex={idx}
                      totalSections={sections.length}
                      previewViewport={device}
                      onSelectSection={
                        isInteractiveMode
                          ? () => {
                              if (products[0]) {
                                setSimulatedCart((prev) => [...prev, products[0]]);
                              }
                            }
                          : handleSelectSectionOnCanvas
                      }
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <InteractiveCartSimulator
        isInteractiveMode={isInteractiveMode}
        cartItems={simulatedCart}
        onClearCart={() => setSimulatedCart([])}
      />

      <PreviewQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        shopSlug={shopSlug}
        shopName={shopName}
      />

      <PreviewAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        sections={sections}
        theme={theme}
        products={products}
        shopName={shopName}
        shopSlug={shopSlug}
      />
    </div>
  );
};
