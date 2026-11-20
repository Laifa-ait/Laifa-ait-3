import React, { useRef } from "react";
import { CustomPageSection, CustomPageTheme } from "../../../domains/seller/customPage.types";
import { Product } from "../../../domains/product/product.types";
import { resolveCategoryAssignedProducts } from "../../../domains/seller/studioCatalogResolver";
import {
  CategoryItem,
  CategoryCardRadius,
  CategoryHoverEffect,
  CategoryTextPosition,
  CategoryImagePosition,
  CategoryImageFit,
} from "../../../pages/Seller/StoreBuilder/constants/categoryPresetTypes";
import {
  buildSectionContainerStyle,
  resolveBorderRadiusClass,
  resolveContainerWidthClass,
  resolveShadowClass,
  resolveAnimationClass,
  SectionDividerRenderer,
} from "./sectionStyleHelper";
import { CategoryMesh3DRow } from "./category/CategoryMesh3DRow";
import { CategoryShopifyBento } from "./category/CategoryShopifyBento";
import { CategoryShopifyStories } from "./category/CategoryShopifyStories";
import { CategoryShopifyPills } from "./category/CategoryShopifyPills";
import { CategoryShopifyCards } from "./category/CategoryShopifyCards";
import { CategoryEditorialModels } from "./category/CategoryEditorialModels";
import {
  resolveCategoryGridCols,
  resolveCategoryGapClass,
  resolveOuterAndMediaRadius,
  useCategoryContainerDevice,
  resolveCategoryDeviceProfile,
} from "./category/categoryResponsiveHelper";
import { useStudioStore } from "../../../pages/Seller/StoreBuilder/store/useStudioStore";
import { EditorialHeading } from "../EditorialHeading";

interface SectionFeaturedCategoriesProps {
  section: CustomPageSection<"featured_categories">;
  theme: CustomPageTheme;
  products?: Product[];
  isEditable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  previewViewport?: "mobile" | "tablet" | "desktop";
}

const ASPECT_CLASS_MAP: Record<string, string> = {
  "1/1": "aspect-square",
  "4/5": "aspect-[4/5]",
  "16/9": "aspect-video",
  "4/3": "aspect-[4/3]",
  circle: "aspect-[4/5]",
};

export const SectionFeaturedCategories: React.FC<SectionFeaturedCategoriesProps> = ({
  section,
  theme,
  products,
  isEditable,
  isSelected,
  onSelect,
  previewViewport = "desktop",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const rawSettings = (section.settings || {}) as unknown as Record<string, unknown>;
  const styles = section.styles || {};

  const selectSection = useStudioStore((s) => s.selectSection);
  const setActiveInspectorTab = useStudioStore((s) => s.setActiveInspectorTab);
  const selectedSectionId = useStudioStore((s) => s.selectedSectionId);
  const selectedSubElement = useStudioStore((s) => s.selectedSubElement);

  const activeDevice = useCategoryContainerDevice(containerRef, previewViewport, Boolean(isEditable));
  const deviceProfile = resolveCategoryDeviceProfile(rawSettings, activeDevice);

  const categories = Array.isArray(rawSettings.categories) ? (rawSettings.categories as CategoryItem[]) : [];
  const indexedVisible = categories.map((cat, origIdx) => ({ cat, origIdx })).filter((entry) => !entry.cat.hidden);
  const visibleCategories = indexedVisible.map((entry) => entry.cat);

  const title = typeof rawSettings.title === "string" ? rawSettings.title : section.title;
  const subtitle = typeof rawSettings.subtitle === "string" ? rawSettings.subtitle : "";
  const layout = deviceProfile.layout;
  const cardSize = deviceProfile.cardSize;
  const aspectRatio = deviceProfile.aspectRatio;
  const cardRadius = (rawSettings.borderRadius as CategoryCardRadius) || "md";
  const hoverEffect = (rawSettings.hoverEffect as CategoryHoverEffect) || "lift";
  const textPosition =
    (rawSettings.textPosition as CategoryTextPosition) ||
    (layout === "overlay" || layout === "bento" || layout === "glass-dock" ? "overlay-bottom" : "below");
  const overlayOpacity = typeof rawSettings.overlayOpacity === "number" ? rawSettings.overlayOpacity / 100 : 0.4;
  const glassmorphism = Boolean(rawSettings.glassmorphism);
  const showTitle = rawSettings.showTitle !== false && textPosition !== "none";
  const showBadge = Boolean(rawSettings.showBadge);
  const showItemCount = Boolean(rawSettings.showItemCount);
  const textAlign = (rawSettings.textAlignment as string) || "left";
  const columnsDesktop = Number(rawSettings.columnsDesktop ?? 4);
  const columnsTablet = typeof rawSettings.columnsTablet === "number" ? rawSettings.columnsTablet : columnsDesktop <= 2 ? 2 : 3;
  const columnsMobile = Number(rawSettings.columnsMobile ?? (layout === "pills" || layout === "mesh-3d" ? 1 : 2));
  const gapSize = (rawSettings.gapSize as string) || "normal";
  const bubbleSize = (rawSettings.bubbleSize as string) || "md";
  const bubbleRing = (rawSettings.bubbleRing as string) || "gradient";
  const pillShowImage = rawSettings.pillShowImage !== false;
  const cardSkin = (rawSettings.cardSkin as string) || "editorial";
  const imagePosition = (rawSettings.imagePosition as CategoryImagePosition) || "center";
  const imageFit = (rawSettings.imageFit as CategoryImageFit) || "cover";

  const triggerSubTab = (subTab: "style" | "items" | "presets", e?: React.MouseEvent, categoryIndex?: number) => {
    if (!isEditable) return;
    if (e) e.stopPropagation();
    if (onSelect) onSelect();
    setActiveInspectorTab("content");
    selectSection(section.id, typeof categoryIndex === "number" ? `category-${subTab}:${categoryIndex}` : `category-${subTab}`);
  };

  const openCategoryPage = (cat: CategoryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    window.dispatchEvent(new CustomEvent("studio:navigate-page", { detail: { viewMode: "category", categorySlug: cat.slug, categoryItem: cat } }));
  };

  const resolveOriginalIndex = (visibleIdx: number) => indexedVisible[visibleIdx]?.origIdx ?? visibleIdx;
  const getCountLabel = (cat: CategoryItem) => {
    if (Array.isArray(products)) {
      const liveCount = resolveCategoryAssignedProducts(cat, products).items.length;
      return `${liveCount} article${liveCount > 1 ? "s" : ""}`;
    }
    if (Array.isArray(cat.productIds) && cat.productIds.length > 0) return `${cat.productIds.length} article${cat.productIds.length > 1 ? "s" : ""}`;
    if (cat.itemCount !== undefined && cat.itemCount !== "") return `${cat.itemCount} articles`;
    return cat.subtitle || "";
  };

  const containerGridColsClass = resolveCategoryGridCols(
    columnsDesktop,
    columnsMobile,
    cardSize,
    activeDevice,
    columnsTablet,
    layout,
    visibleCategories.length
  );
  const gapClass = resolveCategoryGapClass(gapSize, cardSize);
  const { outerRadiusClass } = resolveOuterAndMediaRadius(cardRadius);
  const aspectRatioClass = ASPECT_CLASS_MAP[aspectRatio] || "aspect-[4/5]";

  const sharedProps = {
    categories: visibleCategories,
    cardRadius,
    cardRadiusClass: outerRadiusClass,
    aspectRatioClass,
    hoverImgClass: hoverEffect === "zoom" ? "group-hover:scale-[1.03]" : "",
    hoverCardClass: hoverEffect === "none" ? "" : hoverEffect === "glow" ? "hover:border-slate-900 hover:shadow-xs" : "hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-6px_rgba(15,23,42,0.1)]",
    textPosition,
    overlayOpacity,
    glassmorphism,
    showTitle,
    showBadge,
    showItemCount,
    gapClass,
    cardSize,
    cardSkin,
    columnsDesktop,
    columnsTablet,
    columnsMobile,
    imagePosition,
    imageFit,
    primaryColor: styles.badgeBgColor || styles.iconColor || theme.primaryColor,
    textColor: styles.cardTextColor || styles.textColor,
    previewViewport: activeDevice,
    isEditable,
    selectedSectionId,
    selectedSubElement,
    sectionId: section.id,
    getCountLabel,
    onCardClick: (cat: CategoryItem, visibleIdx: number, e: React.MouseEvent) => {
      if (isEditable) triggerSubTab("items", e, resolveOriginalIndex(visibleIdx));
      else openCategoryPage(cat, e);
    },
    onEditItem: (vIdx: number, e?: React.MouseEvent) => triggerSubTab("items", e, resolveOriginalIndex(vIdx)),
    onOpenPage: openCategoryPage,
  };

  const resolvedHeadingColor = styles.headingColor || (rawSettings.titleColor as string) || styles.textColor || theme.secondaryColor || "#111827";
  const resolvedSubtitleColor = styles.subtitleColor || (rawSettings.subtitleColor as string) || styles.textColor || theme.mutedTextColor;

  return (
    <div
      ref={containerRef}
      onClick={isEditable ? onSelect : undefined}
      style={buildSectionContainerStyle(styles, "transparent", "var(--store-secondary, #17191C)", theme)}
      className={`@container transition-all relative select-none ${resolveBorderRadiusClass(styles.borderRadius)} ${resolveShadowClass(styles.shadow)} ${resolveAnimationClass(styles.animation)}${isEditable && !isSelected ? " cursor-pointer" : ""}`}
    >
      <div className={resolveContainerWidthClass(styles.containerWidth)}>
        {(title || subtitle) && (
          <div className={`mb-4 @[768px]:mb-5 flex items-center justify-between gap-3 ${textAlign === "center" ? "text-center" : textAlign === "right" ? "text-end" : "text-start"}`}>
            <div className="flex-1 min-w-0">
              {title && (
                <EditorialHeading
                  as="h2"
                  text={title}
                  theme={theme}
                  sectionStyles={styles}
                  accentColorOverride={styles.kickerColor || styles.iconColor || theme.accentColor}
                  isEditable={isEditable}
                  editConfig={{ sectionId: section.id, settingKey: "title", alsoUpdateSectionTitle: true }}
                  onClick={(e) => isEditable && triggerSubTab("style", e)}
                  className={`text-base @[768px]:text-xl @[1024px]:text-2xl font-extrabold tracking-tight rounded px-1 break-words ${isEditable ? "cursor-pointer hover:ring-1 hover:ring-[#26658C]" : ""}`}
                  style={{ color: resolvedHeadingColor }}
                />
              )}
              {subtitle && <p className="text-[11px] @[768px]:text-xs @[1024px]:text-sm opacity-80 mt-0.5 break-words" style={{ color: resolvedSubtitleColor }}>{subtitle}</p>}
            </div>
          </div>
        )}

        {visibleCategories.length === 0 ? (
          <div onClick={(e) => triggerSubTab("items", e)} className="p-6 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 text-slate-700 text-xs cursor-pointer hover:bg-slate-100/70 transition-colors">
            Aucune carte affichée. Cliquez ici pour activer vos cartes de rayons.
          </div>
        ) : layout === "mesh-3d" ? (
          <CategoryMesh3DRow {...sharedProps} carouselRef={carouselRef} onNavigate={(cat, e) => openCategoryPage(cat, e)} />
        ) : layout === "bento" ? (
          <CategoryShopifyBento {...sharedProps} />
        ) : layout === "bubbles" ? (
          <CategoryShopifyStories {...sharedProps} bubbleSize={cardSize === "compact" ? "sm" : cardSize === "large" ? "lg" : bubbleSize} bubbleRing={bubbleRing} />
        ) : layout === "pills" ? (
          <CategoryShopifyPills {...sharedProps} pillShowImage={pillShowImage} />
        ) : layout === "accordion" || layout === "arch" || layout === "polaroid" || layout === "magazine" ? (
          <CategoryEditorialModels {...sharedProps} layout={layout} containerGridColsClass={containerGridColsClass} />
        ) : (
          <CategoryShopifyCards
            {...sharedProps}
            layout={layout}
            carouselRef={carouselRef}
            containerGridColsClass={containerGridColsClass}
            effectiveOverlay={layout === "overlay" || textPosition === "overlay-bottom" || textPosition === "overlay-center"}
          />
        )}
      </div>

      <SectionDividerRenderer divider={styles.divider} color={styles.dividerColor} theme={theme} />
    </div>
  );
};
