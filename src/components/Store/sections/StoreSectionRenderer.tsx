import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { CustomPageSection, CustomPageTheme } from "../../../domains/seller/customPage.types";
import { Product } from "../../../domains/product/product.types";
import { SectionHeroBanner } from "./SectionHeroBanner";
import { SectionPromoCarousel } from "./SectionPromoCarousel";
import { KineticMarqueeSection } from "./KineticMarqueeSection";
import { SectionFeaturedCategories } from "./SectionFeaturedCategories";
import { SectionProductFeeds } from "./SectionProductFeeds";
import { SectionContentAndTrust } from "./SectionContentAndTrust";
import { CanvasSectionFloatingDock } from "./CanvasSectionFloatingDock";
import { ArtisticAtmosphereLayer } from "../ArtisticAtmosphereLayer";
import {
  resolveResponsiveSectionValues,
  sanitizeControlledCssClasses,
  sanitizeAnchorId,
  isSectionConditionallyVisible,
} from "./responsiveInheritanceHelper";
import {
  useStudioStore,
  StudioInspectorTab,
  StudioSectionActionType,
} from "../../../pages/Seller/StoreBuilder/store/useStudioStore";

const SECTION_BADGE_LABELS: Record<string, string> = {
  hero_banner: "Bannière Principale",
  promo_carousel: "Carrousel Promotionnel",
  kinetic_marquee: "Bandeau Cinétique Infini",
  featured_categories: "Rayons & Catégories",
  curated_collections: "Collections Ciblées",
  new_arrivals: "Nouveautés",
  featured_products: "Produits Vedettes",
  best_sellers: "Meilleures Ventes",
  product_grid: "Catalogue Complet",
  brand_story: "Notre Histoire",
  showcase_video: "Vidéo Vitrine",
  verified_reviews: "Avis Vérifiés",
  delivery_info: "Livraison 69 Wilayas",
  return_policy: "Retours & Échanges",
  faq_accordion: "Questions Fréquentes",
  contact_footer: "Contact & Horaires",
};

interface StoreSectionRendererProps {
  section: CustomPageSection;
  theme: CustomPageTheme;
  products: Product[];
  isEditable?: boolean;
  isSelected?: boolean;
  sectionIndex?: number;
  totalSections?: number;
  onSelectSection?: (sectionId: string) => void;
  previewViewport?: "mobile" | "tablet" | "desktop";
}

export const StoreSectionRenderer: React.FC<StoreSectionRendererProps> = ({
  section, theme, products, isEditable, isSelected: propIsSelected,
  sectionIndex = 0, totalSections = 1, onSelectSection, previewViewport = "desktop",
}) => {
  const prefersReducedMotion = useReducedMotion();
  const hoveredSectionId = useStudioStore((s) => s.hoveredSectionId);
  const selectedSectionId = useStudioStore((s) => s.selectedSectionId);
  const hoverElement = useStudioStore((s) => s.hoverElement);
  const clearHover = useStudioStore((s) => s.clearHover);
  const selectSection = useStudioStore((s) => s.selectSection);
  const setActiveInspectorTab = useStudioStore((s) => s.setActiveInspectorTab);
  const triggerSectionAction = useStudioStore((s) => s.triggerSectionAction);

  const settingsRecord = (section.settings || {}) as Record<string, unknown>;
  const isLocked = Boolean(settingsRecord.isLocked);
  const anchorId = sanitizeAnchorId((settingsRecord.anchorId as string) || "") || undefined;
  const safeCustomClasses = sanitizeControlledCssClasses((settingsRecord.customCssClasses as string) || "");
  const ariaLabel = typeof settingsRecord.ariaLabel === "string" && settingsRecord.ariaLabel.trim() ? settingsRecord.ariaLabel.trim() : undefined;
  const ariaRole = typeof settingsRecord.ariaRole === "string" && settingsRecord.ariaRole.trim() ? settingsRecord.ariaRole.trim() : undefined;
  const sectionOpacity = typeof settingsRecord.sectionOpacity === "number" ? Math.min(100, Math.max(50, settingsRecord.sectionOpacity)) / 100 : 1;

  const responsiveVals = resolveResponsiveSectionValues(section, theme, previewViewport);
  const isConditionallyVisible = isSectionConditionallyVisible(settingsRecord, products.length);
  const isViewportHidden = responsiveVals.isHiddenOnViewport || !isConditionallyVisible;

  if ((!section.isVisible || isViewportHidden) && !isEditable) {
    return null;
  }

  // Propagate viewport-resolved responsive settings & styles down to child renderers
  const effectiveTheme: CustomPageTheme = {
    ...theme,
    titleFontSizePx: responsiveVals.titleFontSizePx,
    bodyFontSizePx: responsiveVals.bodyFontSizePx,
    spacingYPx: responsiveVals.paddingY,
  };
  const effectiveSection: CustomPageSection = {
    ...section,
    settings: {
      ...section.settings,
      textAlignment: responsiveVals.textAlignment,
      columnsDesktop: responsiveVals.columns,
    } as CustomPageSection["settings"],
    styles: {
      ...section.styles,
      paddingY: responsiveVals.paddingY,
      paddingX: responsiveVals.paddingX,
    },
  };

  const isSelected = Boolean(propIsSelected || (isEditable && selectedSectionId === section.id));
  const isHovered = Boolean(isEditable && hoveredSectionId === section.id);
  const sectionBadgeLabel = section.title || SECTION_BADGE_LABELS[section.type] || section.type.replace(/_/g, " ");

  const handleSelect = () => {
    if (isEditable) selectSection(section.id);
    if (onSelectSection) onSelectSection(section.id);
  };

  const handleSectionAction = (action: StudioSectionActionType, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerSectionAction(section.id, action);
  };

  const handleSelectInspectorTab = (inspectorTab: StudioInspectorTab, e: React.MouseEvent) => {
    e.stopPropagation();
    selectSection(section.id, null);
    setActiveInspectorTab(inspectorTab);
    if (onSelectSection) onSelectSection(section.id);
    window.dispatchEvent(new CustomEvent("studio:open-inspector-tab", { detail: { sectionId: section.id, tab: inspectorTab } }));
  };

  const hiddenOpacityClass = (!section.isVisible || isViewportHidden) && isEditable ? "opacity-50 grayscale" : "";
  const shopifyOutlineClass = isEditable
    ? isSelected
      ? "ring-2 ring-[var(--store-primary,#023859)] rounded-2xl overflow-hidden shadow-md"
      : isHovered
      ? "ring-2 ring-[var(--store-accent,#54ACBF)]/80 rounded-2xl overflow-hidden"
      : ""
    : "";

  const animType = section.styles?.animation || "fade";
  const shouldAnimate = !prefersReducedMotion && animType !== "none";
  const initialAnim = shouldAnimate
    ? animType === "slide-up" ? { opacity: 0, y: 18 } : animType === "zoom" ? { opacity: 0, scale: 0.97 } : { opacity: 0 }
    : false;

  return (
    <motion.div
      id={`studio-section-${section.id}`}
      data-studio-section-id={section.id}
      data-section-type={section.type}
      data-anchor-id={anchorId}
      aria-label={ariaLabel}
      role={ariaRole}
      style={sectionOpacity < 1 ? { opacity: sectionOpacity } : undefined}
      initial={initialAnim}
      whileInView={shouldAnimate ? { opacity: 1, y: 0, scale: 1 } : undefined}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.42, ease: "easeOut" }}
      onMouseEnter={isEditable ? () => hoverElement(section.id) : undefined}
      onMouseLeave={isEditable ? () => clearHover() : undefined}
      className={`relative group/sec transition-all ${hiddenOpacityClass} ${shopifyOutlineClass} ${safeCustomClasses}`.trim()}
    >
      {anchorId && <span id={anchorId} className="absolute -top-16 pointer-events-none" aria-hidden="true" />}

      {(section.styles?.surfaceTexture || section.styles?.ambientLighting) && (
        <ArtisticAtmosphereLayer theme={effectiveTheme} sectionStyles={effectiveSection.styles} />
      )}

      {isEditable && (isHovered || isSelected) && (
        <CanvasSectionFloatingDock
          sectionId={section.id}
          sectionLabel={sectionBadgeLabel}
          isVisible={section.isVisible}
          isLocked={isLocked}
          isFirstSection={sectionIndex <= 0}
          isLastSection={sectionIndex >= totalSections - 1}
          colorScheme={section.styles?.colorScheme}
          onAction={handleSectionAction}
          onSelectInspectorTab={handleSelectInspectorTab}
        />
      )}

      {(!section.isVisible || isViewportHidden) && isEditable && (
        <span className="absolute bottom-2 right-2 z-20 bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
          {!section.isVisible
            ? "Masquée"
            : !isConditionallyVisible
            ? "Masquée (Condition)"
            : previewViewport === "mobile"
            ? "Masquée sur Mobile"
            : previewViewport === "tablet"
            ? "Masquée sur Tablette"
            : "Masquée sur PC"}
        </span>
      )}

      {section.type === "hero_banner" && (
        <SectionHeroBanner section={effectiveSection as CustomPageSection<"hero_banner">} theme={effectiveTheme} isEditable={isEditable} isSelected={isSelected} onSelect={handleSelect} previewViewport={previewViewport} />
      )}
      {section.type === "promo_carousel" && (
        <SectionPromoCarousel section={effectiveSection as CustomPageSection<"promo_carousel">} theme={effectiveTheme} isEditable={isEditable} isSelected={isSelected} onSelect={handleSelect} />
      )}
      {section.type === "kinetic_marquee" && (
        <KineticMarqueeSection section={effectiveSection as CustomPageSection<"kinetic_marquee">} theme={effectiveTheme} isEditable={isEditable} isSelected={isSelected} onSelect={handleSelect} />
      )}
      {section.type === "featured_categories" && (
        <SectionFeaturedCategories section={effectiveSection as CustomPageSection<"featured_categories">} theme={effectiveTheme} isEditable={isEditable} isSelected={isSelected} onSelect={handleSelect} previewViewport={previewViewport} />
      )}
      {(section.type === "featured_products" || section.type === "new_arrivals" || section.type === "best_sellers" || section.type === "product_grid") && (
        <SectionProductFeeds section={effectiveSection as CustomPageSection<"featured_products" | "new_arrivals" | "best_sellers" | "product_grid">} theme={effectiveTheme} products={products} isEditable={isEditable} isSelected={isSelected} onSelect={handleSelect} previewViewport={previewViewport} />
      )}
      {section.type !== "hero_banner" && section.type !== "promo_carousel" && section.type !== "kinetic_marquee" && section.type !== "featured_categories" && section.type !== "featured_products" && section.type !== "new_arrivals" && section.type !== "best_sellers" && section.type !== "product_grid" && (
        <SectionContentAndTrust section={effectiveSection} theme={effectiveTheme} products={products} isEditable={isEditable} isSelected={isSelected} onSelect={handleSelect} />
      )}
    </motion.div>
  );
};
