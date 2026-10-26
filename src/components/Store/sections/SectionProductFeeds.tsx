import React, { useRef } from "react";
import {
  CustomPageSection,
  CustomPageTheme,
  ProductFeedSettings,
  FeaturedProductsSettings,
} from "../../../domains/seller/customPage.types";
import { Product } from "../../../domains/product/product.types";
import {
  buildSectionContainerStyle,
  resolveBorderRadiusClass,
  resolveContainerWidthClass,
  resolveShadowClass,
  resolveAnimationClass,
  SectionDividerRenderer,
} from "./sectionStyleHelper";
import { ChevronLeft, ChevronRight, Sparkles, Grid, Sliders } from "lucide-react";
import { LiveCountdownBanner } from "./ProductFeedEcommerceWidgets";
import { SectionProductItemCard } from "./SectionProductItemCard";
import { useStudioStore } from "../../../pages/Seller/StoreBuilder/store/useStudioStore";

interface SectionProductFeedsProps {
  section: CustomPageSection<"featured_products" | "new_arrivals" | "best_sellers" | "product_grid">;
  theme: CustomPageTheme;
  products: Product[];
  isEditable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  previewViewport?: "mobile" | "tablet" | "desktop";
}

export const SectionProductFeeds: React.FC<SectionProductFeedsProps> = ({
  section,
  theme,
  products,
  isEditable,
  isSelected,
  onSelect,
}) => {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const settings = (section.settings || {}) as ProductFeedSettings & FeaturedProductsSettings;
  const styles = section.styles || {};

  const selectSection = useStudioStore((s) => s.selectSection);
  const setActiveInspectorTab = useStudioStore((s) => s.setActiveInspectorTab);

  let displayProducts: Product[] = [];
  if (Array.isArray(settings.productIds) && settings.productIds.length > 0) {
    const byId = new Map(products.map((p) => [p.id, p]));
    displayProducts = settings.productIds
      .map((id) => byId.get(id))
      .filter((p): p is Product => Boolean(p));
    if (displayProducts.length === 0) {
      displayProducts = products.slice(0, 8);
    }
  } else {
    const filtered = settings.filterCategoryId
      ? products.filter((p) => p.category === settings.filterCategoryId)
      : products;
    const limit = settings.maxItems || 8;
    displayProducts = filtered.slice(0, limit);
  }

  const layoutMode = settings.layout || "grid";
  const cardStyle = settings.cardStyle || "modern";
  const aspectRatio = settings.cardAspectRatio || "4/5";
  const imagePosition = settings.cardImagePosition || "center";
  const imageFit = settings.cardImageFit || "cover";
  const columnsDesktop = settings.columnsDesktop || 4;
  const accentColor = settings.cardAccentColor || theme.primaryColor || "#023859";

  const triggerDesignFocus = (e: React.MouseEvent, focusTarget: string) => {
    if (!isEditable) return;
    e.stopPropagation();
    if (onSelect) onSelect();
    setActiveInspectorTab("content");
    selectSection(section.id, focusTarget);
  };

  const scrollCarousel = (dir: "left" | "right", e: React.MouseEvent) => {
    e.stopPropagation();
    if (!carouselRef.current) return;
    const amount = dir === "left" ? -280 : 280;
    carouselRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  const gridColsClass =
    columnsDesktop === 2
      ? "grid-cols-2 gap-3 @sm:gap-4"
      : columnsDesktop === 3
      ? "grid-cols-2 @md:grid-cols-3 gap-3 @sm:gap-5"
      : "grid-cols-2 @md:grid-cols-4 gap-3 @sm:gap-5";

  const renderCard = (prod: Product) => (
    <SectionProductItemCard
      key={prod.id}
      product={prod}
      cardStyle={cardStyle}
      aspectRatio={aspectRatio}
      imagePosition={imagePosition}
      imageFit={imageFit}
      accentColor={accentColor}
      showCategory={settings.showCategory !== false}
      showStockBadge={settings.showStockBadge !== false}
      showQuickWishlist={settings.showWishlistButton !== false}
      showStockProgressBar={Boolean(settings.showStockProgress)}
      showCompareAtPrice={settings.showCompareAtPrice !== false}
      showStarRating={settings.showRatingStars !== false}
      theme={theme}
      isEditable={isEditable}
      triggerDesignFocus={triggerDesignFocus}
    />
  );

  return (
    <div
      onClick={isEditable ? onSelect : undefined}
      style={buildSectionContainerStyle(styles, "transparent", "#111827")}
      className={`relative transition-all select-none ${resolveBorderRadiusClass(
        styles.borderRadius
      )} ${resolveShadowClass(styles.shadow)} ${resolveAnimationClass(styles.animation)}`}
    >
      {isEditable && isSelected && (
        <div
          className="mb-4 flex flex-wrap items-center justify-between gap-2 bg-[#F8FBFC] text-[#011C40] px-3 py-2 rounded-xl border border-slate-200/90 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#011C40]">
            <Sparkles className="w-3.5 h-3.5 text-[#023859]" />
            <span>Grille Produits ({displayProducts.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => triggerDesignFocus(e, "selection")}
              className="h-7 px-2.5 rounded-lg bg-[#023859] hover:bg-[#011C40] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Grid className="w-3 h-3" />
              <span>Sélecteur Produits</span>
            </button>
            <button
              type="button"
              onClick={(e) => triggerDesignFocus(e, "countdown")}
              className="h-7 px-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Sliders className="w-3 h-3 text-[#26658C]" />
              <span>Chrono Offre</span>
            </button>
          </div>
        </div>
      )}

      <div className={resolveContainerWidthClass(styles.containerWidth)}>
        {settings.showCountdown && (
          <div onClick={(e) => triggerDesignFocus(e, "countdown")}>
            <LiveCountdownBanner
              label={settings.countdownLabel}
              subtitle={settings.countdownSubtitle}
              endDate={settings.countdownEndDate}
              countdownStyle={settings.countdownStyle}
              bannerBgColor={settings.countdownBgColor}
              bannerTextColor={settings.countdownTextColor}
              accentColor={settings.countdownAccentColor}
              themePrimaryColor={theme.primaryColor}
            />
          </div>
        )}

        {(settings.title || section.title || settings.subtitle) && (
          <div className="mb-5 flex items-start justify-between gap-3">
            <div
              onClick={(e) => isEditable && triggerDesignFocus(e, "title")}
              className={`min-w-0 flex-1 ${
                isEditable ? "cursor-pointer rounded px-1 hover:ring-1 hover:ring-[#26658C]" : ""
              }`}
            >
              {(settings.title || section.title) && (
                <h3
                  className="text-lg @sm:text-xl @md:text-2xl font-extrabold tracking-tight leading-snug"
                  style={{ color: theme.secondaryColor || "#011C40" }}
                >
                  {settings.title || section.title}
                </h3>
              )}
              {settings.subtitle && (
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {settings.subtitle}
                </p>
              )}
            </div>

            {layoutMode === "carousel" && (
              <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                <button
                  type="button"
                  onClick={(e) => scrollCarousel("left", e)}
                  className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
                  title="Précédent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => scrollCarousel("right", e)}
                  className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
                  title="Suivant"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {layoutMode === "carousel" ? (
          <div
            ref={carouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-3 @sm:gap-4 pb-2 scrollbar-hide scroll-smooth"
          >
            {displayProducts.map((prod) => (
              <div
                key={prod.id}
                className="w-[46%] min-w-[155px] @sm:w-56 @md:w-64 shrink-0 snap-start"
              >
                {renderCard(prod)}
              </div>
            ))}
          </div>
        ) : (
          <div className={`grid ${gridColsClass}`}>
            {displayProducts.map((prod) => renderCard(prod))}
          </div>
        )}
      </div>

      <SectionDividerRenderer divider={styles.divider} theme={theme} />
    </div>
  );
};
