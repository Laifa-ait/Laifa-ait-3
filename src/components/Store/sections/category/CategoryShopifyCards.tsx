import React, { RefObject } from "react";
import { ArrowUpRight, Camera } from "lucide-react";
import {
  CategoryItem,
  CategoryCardSize,
  CategoryImagePosition,
  CategoryImageFit,
} from "../../../../pages/Seller/StoreBuilder/constants/categoryPresetTypes";
import {
  resolveCategoryPhoto,
  resolveCategoryImageClasses,
  handleCategoryImageError,
} from "./categoryImageHelper";
import { resolveOuterAndMediaRadius } from "./categoryResponsiveHelper";

interface CategoryShopifyCardsProps {
  categories: CategoryItem[];
  layout: string;
  carouselRef?: RefObject<HTMLDivElement | null>;
  containerGridColsClass: string;
  gapClass: string;
  aspectRatioClass: string;
  cardRadius?: string;
  cardRadiusClass: string;
  hoverImgClass: string;
  hoverCardClass: string;
  effectiveOverlay: boolean;
  textPosition: string;
  overlayOpacity: number;
  glassmorphism: boolean;
  showTitle?: boolean;
  showBadge: boolean;
  showItemCount: boolean;
  cardSize?: CategoryCardSize;
  cardSkin?: string;
  columnsMobile?: number;
  imagePosition?: CategoryImagePosition;
  imageFit?: CategoryImageFit;
  textColor?: string;
  primaryColor?: string;
  isEditable?: boolean;
  selectedSectionId?: string | null;
  selectedSubElement?: string | null;
  sectionId: string;
  getCountLabel: (cat: CategoryItem) => string;
  onCardClick: (cat: CategoryItem, idx: number, e: React.MouseEvent) => void;
  onEditItem: (idx: number, e: React.MouseEvent) => void;
  onOpenPage: (cat: CategoryItem, e: React.MouseEvent) => void;
}

export const CategoryShopifyCards: React.FC<CategoryShopifyCardsProps> = ({
  categories,
  layout,
  carouselRef,
  containerGridColsClass,
  gapClass,
  aspectRatioClass,
  cardRadius = "md",
  hoverImgClass,
  hoverCardClass,
  effectiveOverlay,
  textPosition,
  overlayOpacity,
  glassmorphism,
  showTitle = true,
  showBadge,
  showItemCount,
  cardSize = "balanced",
  cardSkin = "editorial",
  columnsMobile = 2,
  imagePosition = "center",
  imageFit = "cover",
  textColor = "#0F172A",
  primaryColor = "#023859",
  isEditable,
  selectedSectionId,
  selectedSubElement,
  sectionId,
  getCountLabel,
  onCardClick,
  onEditItem,
  onOpenPage,
}) => {
  const isCarousel = layout === "carousel";
  const isGlassDock = layout === "glass-dock";
  const isTitleVisible = showTitle && textPosition !== "none";
  const isDarkSkin = cardSkin === "dark-glass";
  const isOverlayMode =
    effectiveOverlay || isGlassDock || textPosition === "overlay-bottom" || textPosition === "overlay-center";

  const { outerRadiusClass, mediaRadiusClass } = resolveOuterAndMediaRadius(cardRadius === "full" ? "lg" : cardRadius);
  const resolvedAspectClass = aspectRatioClass.includes("rounded-full") ? "aspect-[4/5]" : aspectRatioClass;

  const padScaleClass =
    cardSize === "compact" ? "p-0.5 @[560px]:p-1" : cardSize === "large" ? "p-1.5 @[560px]:p-2.5" : "p-1 @[560px]:p-1.5";
  const titleSizeClass =
    cardSize === "compact"
      ? "text-[11px] @[560px]:text-xs @[900px]:text-sm"
      : cardSize === "large"
      ? "text-xs @[560px]:text-base @[900px]:text-lg"
      : "text-xs @[560px]:text-sm @[900px]:text-[15px]";

  const carouselWidthClass =
    columnsMobile === 1
      ? "snap-start shrink-0 w-[82%] min-w-[220px] @[560px]:w-[44%] @[900px]:w-[28%]"
      : cardSize === "compact"
      ? "snap-start shrink-0 w-[46%] min-w-[142px] @[560px]:w-[31%] @[900px]:w-[23%]"
      : cardSize === "large"
      ? "snap-start shrink-0 w-[72%] min-w-[200px] @[560px]:w-[44%] @[900px]:w-[31%]"
      : "snap-start shrink-0 w-[48%] min-w-[152px] @[560px]:w-[36%] @[900px]:w-[24%]";

  return (
    <div
      ref={isCarousel ? carouselRef : undefined}
      className={
        isCarousel
          ? `flex overflow-x-auto snap-x snap-mandatory ${gapClass} pb-3 pt-1 scrollbar-none scroll-smooth`
          : `grid ${containerGridColsClass} ${gapClass}`
      }
    >
      {categories.map((cat, idx) => {
        const photoUrl = resolveCategoryPhoto(cat, idx);
        const { posClass, fitClass } = resolveCategoryImageClasses(cat, imagePosition, imageFit);
        const countText = getCountLabel(cat);
        const idxLabel = String(idx + 1).padStart(2, "0");
        const isCardSelected = isEditable && selectedSectionId === sectionId && selectedSubElement === `category-items:${idx}`;

        const surfaceClass = isDarkSkin
          ? `bg-slate-950 border border-white/15 text-white ${padScaleClass} shadow-sm hover:border-white/30`
          : cardSkin === "soft-tint"
          ? `bg-[#F8FAFC] border border-slate-200/90 ${padScaleClass} hover:bg-white hover:border-slate-300 shadow-[0_2px_10px_-3px_rgba(15,23,42,0.05)]`
          : cardSkin === "framed"
          ? `bg-white border border-slate-200/95 p-1.5 @[560px]:p-2.5 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.07)] hover:border-slate-300`
          : layout === "overlay"
          ? "bg-slate-900 border border-slate-200/80 p-0 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.08)]"
          : `bg-white border border-slate-200/85 ${padScaleClass} shadow-[0_2px_12px_-3px_rgba(15,23,42,0.06)] hover:border-slate-300`;

        const innerMediaRadius = layout === "overlay" && cardSkin === "editorial" ? outerRadiusClass : mediaRadiusClass;
        const useDock = isGlassDock || glassmorphism;

        return (
          <article
            key={cat.id || idx}
            onClick={(e) => onCardClick(cat, idx, e)}
            className={`group relative flex flex-col overflow-hidden cursor-pointer select-none transition-all duration-200 ease-out ${outerRadiusClass} ${surfaceClass} ${hoverCardClass} ${
              isCarousel ? carouselWidthClass : ""
            } ${isCardSelected ? "ring-2 ring-[#2563EB] ring-offset-2" : ""}`}
          >
            <div className={`relative w-full overflow-hidden bg-slate-100 ${innerMediaRadius} ${resolvedAspectClass}`}>
              <img
                src={photoUrl}
                alt={cat.name}
                referrerPolicy="no-referrer"
                onError={(e) => handleCategoryImageError(e, idx)}
                className={`w-full h-full ${posClass} ${fitClass} transition-transform duration-300 ease-out ${hoverImgClass}`}
              />

              <div className="absolute top-2 left-2 @[560px]:top-2.5 @[560px]:left-2.5 z-10 flex items-center gap-1 pointer-events-none">
                <span className="hidden @[420px]:inline-block px-1.5 @[560px]:px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/25 text-[9px] @[560px]:text-[10px] font-mono font-bold text-white tabular-nums">
                  {idxLabel}
                </span>
                {showBadge && cat.badge && (
                  <span className="text-[9px] @[560px]:text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full text-white shadow-2xs truncate max-w-[95px]" style={{ backgroundColor: cat.badgeColor || primaryColor }}>
                    {cat.badge}
                  </span>
                )}
              </div>

              {isEditable && (
                <div className="absolute top-2 right-2 @[560px]:top-2.5 @[560px]:right-2.5 z-20 flex items-center gap-1 opacity-85 @[560px]:opacity-0 @[560px]:group-hover:opacity-100 transition-opacity duration-150">
                  <button type="button" onClick={(e) => onEditItem(idx, e)} className="bg-[#023859]/90 hover:bg-[#011C40] text-white text-[9px] font-bold p-1.5 @[560px]:px-2 @[560px]:py-1 rounded-md shadow-xs flex items-center gap-1 cursor-pointer border border-white/20">
                    <Camera className="w-2.5 h-2.5" />
                    <span className="hidden @[560px]:inline">Photo</span>
                  </button>
                  <button type="button" onClick={(e) => onOpenPage(cat, e)} className="hidden @[560px]:inline-block bg-slate-900/90 hover:bg-slate-950 text-white text-[9px] font-bold px-1.5 py-1 rounded-md shadow-xs cursor-pointer border border-white/15">
                    Page →
                  </button>
                </div>
              )}

              {isTitleVisible && isOverlayMode && (
                <div
                  className={`absolute inset-0 flex flex-col p-2 @[560px]:p-3 transition-opacity duration-200 ${
                    textPosition === "overlay-center" ? "items-center justify-center text-center" : "justify-end text-left"
                  }`}
                  style={{
                    background:
                      textPosition === "overlay-center"
                        ? `rgba(15, 23, 42, ${Math.min(0.68, Math.max(0.25, overlayOpacity))})`
                        : `linear-gradient(180deg, rgba(15,23,42,0) 40%, rgba(10,15,29,${Math.min(0.88, overlayOpacity + 0.32)}) 100%)`,
                  }}
                >
                  <div className={useDock ? `w-full ${isDarkSkin ? "bg-slate-950/88 text-white border-white/20" : "bg-white/92 text-slate-900 border-white/80"} backdrop-blur-md border rounded-xl px-2 py-1.5 @[560px]:px-3 @[560px]:py-2 shadow-sm flex items-center justify-between gap-1.5` : "w-full flex items-end justify-between gap-1.5 px-1 pb-0.5"}>
                    <div className="min-w-0">
                      <h3 className={`font-bold tracking-tight leading-snug line-clamp-1 ${useDock ? (isDarkSkin ? "text-white" : "text-slate-900") : "text-white drop-shadow-xs"} ${titleSizeClass}`}>
                        {cat.name}
                      </h3>
                      {showItemCount && countText && (
                        <p className={`text-[10px] @[560px]:text-[11px] font-medium line-clamp-1 mt-0.5 ${useDock ? (isDarkSkin ? "text-slate-300" : "text-slate-500") : "text-white/85"}`}>
                          {countText}
                        </p>
                      )}
                    </div>
                    <span className={`w-5 h-5 @[560px]:w-6 @[560px]:h-6 rounded-full flex items-center justify-center shrink-0 ${useDock ? (isDarkSkin ? "bg-white text-slate-950" : "bg-slate-900 text-white") : "bg-white/20 backdrop-blur-xs text-white border border-white/30"}`}>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {isTitleVisible && !isOverlayMode && (
              <div className="flex items-center justify-between gap-1.5 px-2 pt-2 pb-1 @[560px]:px-2.5 @[560px]:pt-2.5 @[560px]:pb-1.5">
                <div className="min-w-0">
                  <h3 className={`font-bold tracking-tight leading-snug line-clamp-1 ${titleSizeClass}`} style={{ color: isDarkSkin ? "#FFFFFF" : textColor }}>
                    {cat.name}
                  </h3>
                  <p className={`text-[10px] @[560px]:text-[11px] font-medium line-clamp-1 mt-0.5 ${isDarkSkin ? "text-slate-400" : "text-slate-500"}`}>
                    {showItemCount && countText ? countText : cat.subtitle || "Explorer la collection"}
                  </p>
                </div>
                <span className={`w-6 h-6 @[560px]:w-7 @[560px]:h-7 rounded-full flex items-center justify-center shrink-0 ${isDarkSkin ? "bg-white text-slate-950" : "bg-slate-900 text-white"}`}>
                  <ArrowUpRight className="w-3 h-3 @[560px]:w-3.5 @[560px]:h-3.5" />
                </span>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};
