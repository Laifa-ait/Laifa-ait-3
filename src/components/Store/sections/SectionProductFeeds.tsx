import React, { useMemo, useRef } from "react";
import { CustomPageSection, CustomPageTheme, ProductFeedSettings, FeaturedProductsSettings } from "../../../domains/seller/customPage.types";
import { Product } from "../../../domains/product/product.types";
import { resolveProductFeedItems } from "../../../domains/seller/studioCatalogResolver";
import {
  buildSectionContainerStyle, resolveBorderRadiusClass, resolveContainerWidthClass,
  resolveShadowClass, resolveAnimationClass, SectionDividerRenderer,
} from "./sectionStyleHelper";
import { ChevronLeft, ChevronRight, Sparkles, Grid, Sliders } from "lucide-react";
import { LiveCountdownBanner } from "./ProductFeedEcommerceWidgets";
import { SectionProductItemCard } from "./SectionProductItemCard";
import { useStudioStore } from "../../../pages/Seller/StoreBuilder/store/useStudioStore";
import { EditorialHeading } from "../EditorialHeading";
import { CanvasInlineText } from "./CanvasInlineText";

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
  section, theme, products, isEditable, isSelected, onSelect,
}) => {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const settings = useMemo(() => (section.settings || {}) as ProductFeedSettings & FeaturedProductsSettings, [section.settings]);
  const styles = section.styles || {};

  const selectSection = useStudioStore((s) => s.selectSection);
  const setActiveInspectorTab = useStudioStore((s) => s.setActiveInspectorTab);

  const feedResult = useMemo(() => resolveProductFeedItems(section.type, settings, products), [section.type, settings, products]);
  const displayProducts = feedResult.items;
  const invalidIdsCount = feedResult.missingProductIds.length + feedResult.inactiveProductIds.length;
  const manualIdsCount = Array.isArray(settings.productIds) ? settings.productIds.length : 0;
  const isBestSellersUnverified = section.type === "best_sellers" && !feedResult.hasRealSalesData;
  const hidePublicUnrankedBestSellers = !isEditable && isBestSellersUnverified && feedResult.effectiveMode === "auto";

  const layoutMode = settings.layout || "grid";
  const isListLayout = layoutMode === "vertical" || layoutMode === "list";
  const cardStyle = settings.cardStyle || "modern";
  const aspectRatio = settings.cardAspectRatio || "4/5";
  const imagePosition = settings.cardImagePosition || "center";
  const imageFit = settings.cardImageFit || "cover";
  const columnsDesktop = settings.columnsDesktop || 4;
  const accentColor = styles.iconColor || settings.cardAccentColor || theme.accentColor || theme.primaryColor || "#023859";
  const kickerColor = styles.kickerColor || accentColor;
  const headingColor = styles.headingColor || settings.titleColor || styles.textColor || theme.secondaryColor || "#18181B";
  const subtitleColor = styles.subtitleColor || settings.subtitleColor || styles.textColor || theme.mutedTextColor;

  const overtitleLabel =
    section.type === "featured_products" ? "SÉLECTION D'ATELIER"
    : section.type === "new_arrivals" ? "NOUVELLES CRÉATIONS"
    : section.type === "best_sellers" ? (feedResult.hasRealSalesData ? "PIÈCES PLÉBISCITÉES" : "SÉLECTION DE LA BOUTIQUE")
    : "CATALOGUE & COLLECTIONS";

  const triggerDesignFocus = (e: React.MouseEvent, focusTarget: string) => {
    if (!isEditable) return;
    e.stopPropagation();
    onSelect?.();
    setActiveInspectorTab("content");
    selectSection(section.id, focusTarget);
  };

  const scrollCarousel = (dir: "left" | "right", e: React.MouseEvent) => {
    e.stopPropagation();
    carouselRef.current?.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  };

  const gridColsClass = isListLayout
    ? columnsDesktop === 2 ? "grid-cols-1 @3xl:grid-cols-2 gap-3.5 @3xl:gap-5" : "grid-cols-1 gap-3.5 @3xl:gap-4"
    : columnsDesktop === 2 ? "grid-cols-2 gap-4 @3xl:gap-6"
    : columnsDesktop === 3 ? "grid-cols-2 @3xl:grid-cols-3 gap-4 @3xl:gap-6"
    : "grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4 gap-4 @3xl:gap-6";

  const renderCard = (prod: Product) => (
    <SectionProductItemCard
      key={prod.id} product={prod} layoutMode={layoutMode} cardStyle={cardStyle} aspectRatio={aspectRatio}
      imagePosition={imagePosition} imageFit={imageFit} accentColor={accentColor}
      cardBgColor={styles.cardBgColor} cardTextColor={styles.cardTextColor} cardBorderColor={styles.cardBorderColor}
      priceColor={styles.priceColor} badgeBgColor={styles.badgeBgColor} badgeTextColor={styles.badgeTextColor}
      cardMaterial={styles.cardMaterial} frameShape={styles.frameShape}
      showCategory={settings.showCategory !== false} showStockBadge={settings.showStockBadge !== false}
      showQuickWishlist={settings.showWishlistButton !== false} showStockProgressBar={Boolean(settings.showStockProgress)}
      showCompareAtPrice={settings.showCompareAtPrice !== false} showStarRating={settings.showRatingStars !== false}
      theme={theme} isEditable={isEditable} triggerDesignFocus={triggerDesignFocus}
    />
  );

  return (
    <div
      onClick={isEditable ? onSelect : undefined}
      style={buildSectionContainerStyle(styles, "transparent", "var(--store-secondary, #18181B)", theme)}
      className={`relative py-4 @3xl:py-6 transition-all select-none ${resolveBorderRadiusClass(styles.borderRadius)} ${resolveShadowClass(styles.shadow)} ${resolveAnimationClass(styles.animation)}`}
    >
      {isEditable && isSelected && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 bg-[#F8FBFC] text-[#011C40] px-3 py-2 rounded-xl border border-slate-200/90 select-none" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#011C40]">
            <Sparkles className="w-3.5 h-3.5 text-[#023859]" />
            <span>{isListLayout ? "Liste Bandeaux" : layoutMode === "carousel" ? "Carrousel Produits" : "Grille Produits"} ({displayProducts.length})</span>
            <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-semibold text-slate-600">
              {feedResult.effectiveMode === "manual" ? "Manuel" : "Règle dynamique"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={(e) => triggerDesignFocus(e, "selection")} className="h-7 px-2.5 rounded-lg bg-[#023859] hover:bg-[#011C40] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors">
              <Grid className="w-3 h-3" /><span>Sélecteur Produits</span>
            </button>
            <button type="button" onClick={(e) => triggerDesignFocus(e, "countdown")} className="h-7 px-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors">
              <Sliders className="w-3 h-3 text-[#26658C]" /><span>Chrono Offre</span>
            </button>
          </div>
        </div>
      )}

      <div className={resolveContainerWidthClass(styles.containerWidth)}>
        {settings.showCountdown && (
          <div onClick={(e) => triggerDesignFocus(e, "countdown")}>
            <LiveCountdownBanner
              label={settings.countdownLabel} subtitle={settings.countdownSubtitle} endDate={settings.countdownEndDate}
              countdownStyle={settings.countdownStyle} bannerBgColor={settings.countdownBgColor || styles.badgeBgColor}
              bannerTextColor={settings.countdownTextColor || styles.badgeTextColor}
              accentColor={settings.countdownAccentColor || accentColor} themePrimaryColor={theme.primaryColor}
            />
          </div>
        )}

        {(settings.title || section.title || settings.subtitle) && (
          <div className="mb-7 flex items-end justify-between gap-4 border-b border-black/[0.06] pb-4" style={{ borderColor: styles.sectionBorderColor || undefined }}>
            <div onClick={(e) => isEditable && triggerDesignFocus(e, "title")} className={`min-w-0 flex-1 ${isEditable ? "cursor-pointer rounded px-1 hover:ring-1 hover:ring-[#26658C]" : ""}`}>
              <span data-testid="product-feed-kicker" className="block text-[10px] @md:text-[11px] font-bold uppercase tracking-[0.28em] mb-1.5" style={{ color: kickerColor }}>
                {overtitleLabel}
              </span>
              {(settings.title || section.title) && (
                <EditorialHeading
                  as="h3" text={String(settings.title || section.title)} theme={theme} sectionStyles={styles}
                  accentColorOverride={kickerColor} isEditable={isEditable}
                  editConfig={{ sectionId: section.id, settingKey: "title", alsoUpdateSectionTitle: true }}
                  className="text-xl @md:text-2xl @3xl:text-3xl font-extrabold tracking-tight leading-snug"
                  style={{ color: headingColor }}
                />
              )}
              {settings.subtitle && (
                <CanvasInlineText
                  as="p" value={settings.subtitle} isEditable={isEditable}
                  editConfig={{ sectionId: section.id, settingKey: "subtitle" }}
                  style={{ color: subtitleColor }} className="text-xs @md:text-sm opacity-80 max-w-xl mt-1.5 leading-relaxed"
                />
              )}
            </div>

            {layoutMode === "carousel" && !hidePublicUnrankedBestSellers && (
              <div className="flex items-center gap-1.5 shrink-0 pb-1">
                <button type="button" onClick={(e) => scrollCarousel("left", e)} className="w-8 h-8 rounded-full border border-black/10 bg-white/80 flex items-center justify-center text-zinc-700 shadow-2xs hover:bg-white cursor-pointer" title="Précédent"><ChevronLeft className="w-4 h-4" /></button>
                <button type="button" onClick={(e) => scrollCarousel("right", e)} className="w-8 h-8 rounded-full border border-black/10 bg-white/80 flex items-center justify-center text-zinc-700 shadow-2xs hover:bg-white cursor-pointer" title="Suivant"><ChevronRight className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        )}

        {isEditable && feedResult.effectiveMode === "manual" && invalidIdsCount > 0 && (
          <div data-testid="product-feed-missing-ids-notice" className="mb-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-between gap-2">
            <span>
              {feedResult.missingProductIds.length > 0 && `${feedResult.missingProductIds.length} produit(s) supprimé(s)`}
              {feedResult.missingProductIds.length > 0 && feedResult.inactiveProductIds.length > 0 ? " et " : ""}
              {feedResult.inactiveProductIds.length > 0 && `${feedResult.inactiveProductIds.length} produit(s) inactif(s)`} dans cette sélection.
            </span>
            <button type="button" onClick={(e) => triggerDesignFocus(e, "selection")} className="px-2.5 py-1 rounded bg-amber-900 text-white text-[11px] font-bold shrink-0 cursor-pointer">
              Nettoyer
            </button>
          </div>
        )}

        {isEditable && section.type === "new_arrivals" && feedResult.undatedProductIds.length > 0 && (
          <div data-testid="new-arrivals-undated-warning" className="mb-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-between gap-2">
            <span>{feedResult.undatedProductIds.length} produit(s) actif(s) sans date de création fiable ({feedResult.effectiveMode === "auto" ? "exclus du classement automatique" : "épinglés manuellement"}).</span>
            <button type="button" onClick={(e) => triggerDesignFocus(e, "selection")} className="px-2.5 py-1 rounded bg-amber-900 text-white text-[11px] font-bold shrink-0 cursor-pointer">Vérifier</button>
          </div>
        )}

        {isEditable && isBestSellersUnverified && feedResult.effectiveMode === "auto" && displayProducts.length > 0 && (
          <div data-testid="best-sellers-no-sales-notice" className="mb-4 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium flex items-center justify-between gap-2">
            <span>Aucune vente livrée enregistrée — la vitrine publique masque ce bloc jusqu&apos;aux premières commandes, ou passez en sélection manuelle.</span>
            <button type="button" data-testid="best-sellers-switch-manual-btn" onClick={(e) => triggerDesignFocus(e, "selection")} className="px-2.5 py-1 rounded bg-slate-900 text-white text-[11px] font-bold shrink-0 cursor-pointer">Sélection manuelle</button>
          </div>
        )}

        {hidePublicUnrankedBestSellers ? (
          <div data-testid="best-sellers-public-no-sales-state" className="p-8 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 space-y-1.5">
            <p className="text-xs @md:text-sm font-semibold text-slate-800">Classement meilleures ventes bientôt disponible</p>
            <p className="text-xs text-slate-500">Les articles les plus commandés apparaîtront automatiquement dès les premières livraisons confirmées.</p>
          </div>
        ) : displayProducts.length === 0 ? (
          <div data-testid="product-feed-empty-state" className="p-8 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 space-y-2">
            <p className="text-xs @md:text-sm font-semibold text-slate-700">
              {feedResult.effectiveMode === "manual" && manualIdsCount > 0
                ? "Les produits sélectionnés ne sont plus disponibles ou actifs."
                : section.type === "new_arrivals" && feedResult.undatedProductIds.length > 0
                ? `Aucun produit daté disponible pour les nouveautés (${feedResult.undatedProductIds.length} produit(s) sans date exclu(s)).`
                : feedResult.obsoleteCategoryFilter
                ? `Aucun produit actif dans la catégorie « ${settings.filterCategoryId} » (filtre obsolète ou rayon vide).`
                : settings.filterCategoryId
                ? `Aucun produit actif dans la catégorie « ${settings.filterCategoryId} ».`
                : "Aucun produit actif à afficher dans cette section."}
            </p>
            {isEditable && (
              <button type="button" onClick={(e) => triggerDesignFocus(e, "selection")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#023859] text-white text-xs font-bold cursor-pointer">
                <Grid className="w-3.5 h-3.5" /><span>Configurer les produits</span>
              </button>
            )}
          </div>
        ) : layoutMode === "carousel" ? (
          <div ref={carouselRef} className="flex overflow-x-auto snap-x snap-mandatory gap-4 @3xl:gap-5 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth">
            {displayProducts.map((prod) => (
              <div key={prod.id} className="w-[46%] min-w-[160px] @md:w-56 @3xl:w-64 shrink-0 snap-start">{renderCard(prod)}</div>
            ))}
          </div>
        ) : (
          <div className={`grid ${gridColsClass}`}>{displayProducts.map((prod) => renderCard(prod))}</div>
        )}
      </div>

      <SectionDividerRenderer divider={styles.divider} color={styles.dividerColor || styles.backgroundColor} theme={theme} />
    </div>
  );
};
