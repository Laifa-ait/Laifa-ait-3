import React, { useRef } from "react";
import { Sparkles } from "lucide-react";
import {
  CategoryItem,
  CategoryCardSize,
} from "../../../pages/Seller/StoreBuilder/constants/categoryPresets";
import { CategoryMesh3DRow } from "./category/CategoryMesh3DRow";
import { CategoryShopifyBento } from "./category/CategoryShopifyBento";
import { CategoryShopifyStories } from "./category/CategoryShopifyStories";
import { CategoryShopifyPills } from "./category/CategoryShopifyPills";
import { CategoryShopifyCards } from "./category/CategoryShopifyCards";

interface FeaturedCategoriesRendererProps {
  settings: Record<string, unknown>;
  theme: {
    borderRadiusPx?: number;
    surfaceColor?: string;
    primaryColor?: string;
  };
  maxWidth: string;
  headingClass: string;
  headingStyle: React.CSSProperties;
  wrapperClass: string;
  sectionStyle: React.CSSProperties;
  isEditable?: boolean;
  onSelect?: () => void;
}

export const FeaturedCategoriesRenderer: React.FC<FeaturedCategoriesRendererProps> = ({
  settings,
  theme,
  maxWidth,
  headingClass,
  headingStyle,
  wrapperClass,
  sectionStyle,
  isEditable,
  onSelect,
}) => {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const rawCategories = Array.isArray(settings.categories)
    ? (settings.categories as CategoryItem[])
    : [];
  const categories = rawCategories.filter((c) => !c.hidden);

  const layout = String(settings.layout || "grid");
  const aspectRatio = String(settings.aspectRatio || "4/5");
  const borderRadius = String(settings.borderRadius || "md");
  const hoverEffect = String(settings.hoverEffect || "zoom");
  const textPosition = String(
    settings.textPosition || (layout === "overlay" ? "overlay-bottom" : "below")
  );
  const overlayOpacity =
    typeof settings.overlayOpacity === "number" ? settings.overlayOpacity / 100 : 0.4;
  const showTitle = settings.showTitle !== false && textPosition !== "none";
  const showBadge = Boolean(settings.showBadge);
  const showItemCount = Boolean(settings.showItemCount);
  const glassmorphism = Boolean(settings.glassmorphism);
  const cardSkin = String(settings.cardSkin || "editorial");
  const cardSize = (settings.cardSize as CategoryCardSize) || "balanced";
  const bubbleSize = String(settings.bubbleSize || "md");
  const bubbleRing = String(settings.bubbleRing || "gradient");
  const pillShowImage = settings.pillShowImage !== false;
  const columnsDesktop = Number(settings.columnsDesktop ?? 4);
  const columnsMobile = Number(settings.columnsMobile ?? 2);
  const gapSize = String(settings.gapSize || "normal");

  const getCountLabel = (cat: CategoryItem) => {
    if (Array.isArray(cat.productIds) && cat.productIds.length > 0) {
      return `${cat.productIds.length} article${cat.productIds.length > 1 ? "s" : ""}`;
    }
    if (cat.itemCount !== undefined && cat.itemCount !== "") {
      return `${cat.itemCount} articles`;
    }
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
  const cardRadiusClass = radiusClassMap[borderRadius] || "rounded-2xl";
  const gapClass =
    gapSize === "compact" ? "gap-2.5" : gapSize === "spacious" ? "gap-5" : "gap-3.5";

  const sharedProps = {
    categories,
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
    sectionId: "standalone",
    getCountLabel,
    onCardClick: () => {},
    onEditItem: () => {},
    onOpenPage: () => {},
  };

  return (
    <section
      onClick={isEditable ? onSelect : undefined}
      className={wrapperClass}
      style={sectionStyle}
    >
      <div className={maxWidth}>
        <div className="mb-6 text-center space-y-1">
          <h2 className={headingClass} style={headingStyle}>
            {String(settings.title || "Nos Rayons & Collections")}
          </h2>
          {Boolean(settings.subtitle) && (
            <p className="text-xs @sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
              {String(settings.subtitle)}
            </p>
          )}
        </div>

        {categories.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
            <Sparkles className="w-6 h-6 text-[#26658C] mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Aucun rayon actif</p>
          </div>
        ) : layout === "mesh-3d" ? (
          <CategoryMesh3DRow {...sharedProps} carouselRef={carouselRef} />
        ) : layout === "bubbles" ? (
          <CategoryShopifyStories
            {...sharedProps}
            bubbleSize={bubbleSize}
            bubbleRing={bubbleRing}
            columnsDesktop={columnsDesktop}
            columnsMobile={columnsMobile}
          />
        ) : layout === "pills" ? (
          <CategoryShopifyPills
            {...sharedProps}
            cardRadius={borderRadius}
            pillShowImage={pillShowImage}
          />
        ) : layout === "bento" ? (
          <CategoryShopifyBento {...sharedProps} />
        ) : (
          <CategoryShopifyCards
            {...sharedProps}
            layout={layout}
            carouselRef={carouselRef}
            containerGridColsClass="grid-cols-2 @sm:grid-cols-3 @lg:grid-cols-4"
            aspectRatioClass={aspectClassMap[aspectRatio] || "aspect-[4/5]"}
            effectiveOverlay={effectiveOverlay}
            textPosition={textPosition}
          />
        )}
      </div>
    </section>
  );
};
