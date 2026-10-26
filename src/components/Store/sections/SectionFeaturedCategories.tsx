import React, { useRef } from "react";
import { CustomPageSection, CustomPageTheme } from "../../../domains/seller/customPage.types";
import {
  CategoryItem,
  CategoryLayoutType,
  CategoryAspectRatio,
  CategoryCardRadius,
  CategoryHoverEffect,
  CategoryTextPosition,
  CategoryCardSize,
} from "../../../pages/Seller/StoreBuilder/constants/categoryPresetTypes";
import {
  buildSectionContainerStyle,
  resolveBorderRadiusClass,
  resolveContainerWidthClass,
  resolveShadowClass,
  resolveAnimationClass,
  SectionDividerRenderer,
} from "./sectionStyleHelper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CategoryMesh3DRow } from "./category/CategoryMesh3DRow";
import { CategoryShopifyBento } from "./category/CategoryShopifyBento";
import { CategoryShopifyStories } from "./category/CategoryShopifyStories";
import { CategoryShopifyPills } from "./category/CategoryShopifyPills";
import { CategoryShopifyCards } from "./category/CategoryShopifyCards";
import { CategoryCanvasQuickBar } from "./category/CategoryCanvasQuickBar";
import { useStudioStore } from "../../../pages/Seller/StoreBuilder/store/useStudioStore";

interface SectionFeaturedCategoriesProps {
  section: CustomPageSection<"featured_categories">;
  theme: CustomPageTheme;
  isEditable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  previewViewport?: "mobile" | "tablet" | "desktop";
}

export const SectionFeaturedCategories: React.FC<SectionFeaturedCategoriesProps> = ({
  section,
  theme,
  isEditable,
  isSelected,
  onSelect,
  previewViewport = "desktop",
}) => {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const rawSettings = (section.settings || {}) as unknown as Record<string, unknown>;
  const styles = section.styles || {};

  const selectSection = useStudioStore((s) => s.selectSection);
  const setActiveInspectorTab = useStudioStore((s) => s.setActiveInspectorTab);
  const selectedSectionId = useStudioStore((s) => s.selectedSectionId);
  const selectedSubElement = useStudioStore((s) => s.selectedSubElement);

  const categories = Array.isArray(rawSettings.categories)
    ? (rawSettings.categories as CategoryItem[])
    : [];

  const indexedVisible = categories
    .map((cat, origIdx) => ({ cat, origIdx }))
    .filter((entry) => !entry.cat.hidden);
  const visibleCategories = indexedVisible.map((entry) => entry.cat);

  const title = typeof rawSettings.title === "string" ? rawSettings.title : section.title;
  const subtitle = typeof rawSettings.subtitle === "string" ? rawSettings.subtitle : "";
  const layout = (rawSettings.layout as CategoryLayoutType) || "grid";
  const aspectRatio = (rawSettings.aspectRatio as CategoryAspectRatio) || "4/5";
  const cardRadius = (rawSettings.borderRadius as CategoryCardRadius) || "md";
  const hoverEffect = (rawSettings.hoverEffect as CategoryHoverEffect) || "lift";
  const textPosition = (rawSettings.textPosition as CategoryTextPosition) || "below";
  const overlayOpacity =
    typeof rawSettings.overlayOpacity === "number" ? rawSettings.overlayOpacity / 100 : 0.4;
  const glassmorphism = Boolean(rawSettings.glassmorphism);
  const showTitle = rawSettings.showTitle !== false && textPosition !== "none";
  const showBadge = Boolean(rawSettings.showBadge);
  const showItemCount = Boolean(rawSettings.showItemCount);
  const textAlign = (rawSettings.textAlignment as string) || "left";
  const columnsDesktop = Number(rawSettings.columnsDesktop ?? 4);
  const columnsMobile = Number(rawSettings.columnsMobile ?? 2);
  const gapSize = (rawSettings.gapSize as string) || "normal";
  const bubbleSize = (rawSettings.bubbleSize as string) || "md";
  const bubbleRing = (rawSettings.bubbleRing as string) || "gradient";
  const pillShowImage = rawSettings.pillShowImage !== false;
  const cardSkin = (rawSettings.cardSkin as string) || "editorial";
  const cardSize = (rawSettings.cardSize as CategoryCardSize) || "balanced";

  const triggerSubTab = (
    subTab: "style" | "items" | "presets",
    e?: React.MouseEvent,
    categoryIndex?: number
  ) => {
    if (!isEditable) return;
    if (e) e.stopPropagation();
    if (onSelect) onSelect();
    setActiveInspectorTab("content");
    const subEl =
      typeof categoryIndex === "number" ? `category-${subTab}:${categoryIndex}` : `category-${subTab}`;
    selectSection(section.id, subEl);
  };

  const openCategoryPage = (cat: CategoryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent("studio:navigate-page", {
        detail: { viewMode: "category", categorySlug: cat.slug, categoryItem: cat },
      })
    );
  };

  const resolveOriginalIndex = (visibleIdx: number) => indexedVisible[visibleIdx]?.origIdx ?? visibleIdx;

  const handleCardClick = (cat: CategoryItem, visibleIdx: number, e: React.MouseEvent) => {
    if (isEditable) triggerSubTab("items", e, resolveOriginalIndex(visibleIdx));
    else openCategoryPage(cat, e);
  };

  const getCountLabel = (cat: CategoryItem) => {
    if (Array.isArray(cat.productIds) && cat.productIds.length > 0) {
      return `${cat.productIds.length} article${cat.productIds.length > 1 ? "s" : ""}`;
    }
    if (cat.itemCount !== undefined && cat.itemCount !== "") return `${cat.itemCount} articles`;
    return cat.subtitle || "";
  };

  const aspectClassMap: Record<string, string> = {
    "1/1": "aspect-square",
    "4/5": "aspect-[4/5]",
    "16/9": "aspect-video",
    "4/3": "aspect-[4/3]",
    circle: "aspect-[4/5]",
  };

  const radiusClassMap: Record<string, string> = {
    none: "rounded-none",
    sm: "rounded-xl",
    md: "rounded-2xl",
    lg: "rounded-2xl",
    full: "rounded-2xl",
  };

  const hoverImgClass = hoverEffect === "zoom" ? "group-hover:scale-[1.02]" : "";
  const hoverCardClass =
    hoverEffect === "none"
      ? ""
      : hoverEffect === "glow"
      ? "hover:border-slate-900 hover:shadow-xs"
      : "hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-6px_rgba(15,23,42,0.1)]";

  const effectiveOverlay =
    layout === "overlay" || textPosition === "overlay-bottom" || textPosition === "overlay-center";
  const cardRadiusClass = radiusClassMap[cardRadius] || "rounded-2xl";
  const mobileCols =
    cardSize === "compact" ? "grid-cols-2" : columnsMobile === 1 ? "grid-cols-1" : "grid-cols-2";
  const containerGridColsClass =
    columnsDesktop === 1
      ? "grid-cols-1"
      : columnsDesktop === 2
      ? `${mobileCols} @sm:grid-cols-2`
      : columnsDesktop === 3
      ? `${mobileCols} @md:grid-cols-3`
      : `${mobileCols} @sm:grid-cols-3 @md:grid-cols-4`;
  const gapClass =
    gapSize === "compact" || cardSize === "compact"
      ? "gap-2.5"
      : gapSize === "spacious"
      ? "gap-5"
      : "gap-3.5";

  const sharedProps = {
    categories: visibleCategories,
    cardRadiusClass,
    hoverImgClass,
    hoverCardClass,
    overlayOpacity,
    glassmorphism,
    showTitle,
    showBadge,
    showItemCount,
    gapClass,
    cardSize,
    cardSkin,
    primaryColor: theme.primaryColor,
    textColor: styles.textColor,
    isEditable,
    selectedSectionId,
    selectedSubElement,
    sectionId: section.id,
    getCountLabel,
    onCardClick: handleCardClick,
    onEditItem: (vIdx: number, e?: React.MouseEvent) =>
      triggerSubTab("items", e, resolveOriginalIndex(vIdx)),
    onOpenPage: openCategoryPage,
  };

  return (
    <div
      onClick={isEditable ? onSelect : undefined}
      style={buildSectionContainerStyle(styles, "transparent", "#17191C")}
      className={`transition-all relative select-none ${resolveBorderRadiusClass(
        styles.borderRadius
      )} ${resolveShadowClass(styles.shadow)} ${resolveAnimationClass(styles.animation)}${
        isEditable && !isSelected ? " cursor-pointer" : ""
      }`}
    >
      {isEditable && isSelected && (
        <CategoryCanvasQuickBar
          sectionId={section.id}
          categories={categories}
          activeLayout={layout}
          cardSize={cardSize}
          showTitle={showTitle}
          textPosition={textPosition}
          onTriggerSubTab={triggerSubTab}
        />
      )}

      <div className={resolveContainerWidthClass(styles.containerWidth)}>
        {(title || subtitle) && (
          <div
            className={`mb-5 flex flex-col justify-between gap-2 ${
              textAlign === "center"
                ? "items-center text-center"
                : textAlign === "right"
                ? "items-end text-right"
                : "items-start text-left"
            }`}
          >
            <div className="flex items-center justify-between w-full gap-3">
              <div className="flex-1 min-w-0">
                {title && (
                  <h2
                    onClick={(e) => isEditable && triggerSubTab("style", e)}
                    className={`text-lg @sm:text-xl @md:text-2xl font-extrabold tracking-tight rounded px-1 ${
                      isEditable ? "cursor-pointer hover:ring-1 hover:ring-[#26658C]" : ""
                    }`}
                    style={{ color: styles.textColor || "#111827" }}
                  >
                    {title}
                  </h2>
                )}
                {subtitle && <p className="text-xs @md:text-sm opacity-75 mt-0.5">{subtitle}</p>}
              </div>
              {layout === "carousel" && visibleCategories.length > 2 && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      carouselRef.current?.scrollBy({ left: -240, behavior: "smooth" });
                    }}
                    className="w-7 h-7 @sm:w-8 @sm:h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 flex items-center justify-center shadow-2xs cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      carouselRef.current?.scrollBy({ left: 240, behavior: "smooth" });
                    }}
                    className="w-7 h-7 @sm:w-8 @sm:h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 flex items-center justify-center shadow-2xs cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {visibleCategories.length === 0 ? (
          <div
            onClick={(e) => triggerSubTab("items", e)}
            className="p-6 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 text-slate-700 text-xs cursor-pointer hover:bg-slate-100/70 transition-colors"
          >
            Aucune carte affichée. Cliquez ici pour activer vos cartes de rayons.
          </div>
        ) : layout === "mesh-3d" ? (
          <CategoryMesh3DRow
            {...sharedProps}
            carouselRef={carouselRef}
            onNavigate={(cat, e) => openCategoryPage(cat, e)}
          />
        ) : layout === "bento" ? (
          <CategoryShopifyBento {...sharedProps} previewViewport={previewViewport} />
        ) : layout === "bubbles" ? (
          <CategoryShopifyStories
            {...sharedProps}
            bubbleSize={cardSize === "compact" ? "sm" : cardSize === "large" ? "lg" : bubbleSize}
            bubbleRing={bubbleRing}
            columnsDesktop={columnsDesktop}
            columnsMobile={columnsMobile}
          />
        ) : layout === "pills" ? (
          <CategoryShopifyPills {...sharedProps} cardRadius={cardRadius} pillShowImage={pillShowImage} />
        ) : (
          <CategoryShopifyCards
            {...sharedProps}
            layout={layout}
            carouselRef={carouselRef}
            containerGridColsClass={containerGridColsClass}
            aspectRatioClass={aspectClassMap[aspectRatio] || "aspect-[4/5]"}
            effectiveOverlay={effectiveOverlay}
            textPosition={textPosition}
          />
        )}
      </div>

      <SectionDividerRenderer divider={styles.divider} theme={theme} />
    </div>
  );
};
