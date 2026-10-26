import React, { RefObject } from "react";
import { Camera, ChevronRight } from "lucide-react";
import {
  CategoryItem,
  CategoryCardSize,
} from "../../../../pages/Seller/StoreBuilder/constants/categoryPresetTypes";
import { resolveCategoryPhoto } from "./categoryImageHelper";

interface CategoryShopifyCardsProps {
  categories: CategoryItem[];
  layout: string;
  carouselRef?: RefObject<HTMLDivElement | null>;
  containerGridColsClass: string;
  gapClass: string;
  aspectRatioClass: string;
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
  cardRadiusClass,
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
  const isTitleVisible = showTitle && textPosition !== "none";
  const isDarkSkin = cardSkin === "dark-glass";

  const safeRadiusClass =
    cardRadiusClass === "rounded-full" || cardRadiusClass === "rounded-3xl"
      ? "rounded-2xl"
      : cardRadiusClass;

  const safeAspectBase = aspectRatioClass.includes("rounded-full")
    ? "aspect-[4/5]"
    : aspectRatioClass;

  const resolvedAspectClass =
    cardSize === "compact"
      ? "aspect-[4/3]"
      : cardSize === "large"
      ? "aspect-[4/5]"
      : safeAspectBase;

  const carouselWidthClass =
    cardSize === "compact"
      ? "snap-start shrink-0 w-[44%] min-w-[140px] max-w-[190px] @sm:w-48 @md:w-56"
      : cardSize === "large"
      ? "snap-start shrink-0 w-[68%] min-w-[200px] max-w-[280px] @sm:w-64 @md:w-72"
      : "snap-start shrink-0 w-[47%] min-w-[152px] max-w-[230px] @sm:w-56 @md:w-64";

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
        const countText = getCountLabel(cat);
        const isCardSelected =
          isEditable &&
          selectedSectionId === sectionId &&
          selectedSubElement === `category-items:${idx}`;

        const surfaceClass = isDarkSkin
          ? "bg-slate-950 border border-white/12 text-white shadow-xs hover:border-white/25"
          : cardSkin === "soft-tint"
          ? "bg-[#F8FAFC] border border-slate-200/85 hover:bg-white hover:border-slate-300 shadow-[0_1px_3px_rgba(15,23,42,0.03)]"
          : cardSkin === "framed"
          ? "bg-white border border-slate-200/95 p-1.5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.05)] hover:border-slate-300"
          : "bg-white border border-slate-200/80 shadow-[0_1px_4px_rgba(15,23,42,0.04)] hover:border-slate-300/95";

        const imgCornerClass =
          cardSkin === "framed"
            ? "rounded-xl"
            : !effectiveOverlay && isTitleVisible
            ? "rounded-t-[inherit]"
            : "rounded-[inherit]";

        return (
          <article
            key={cat.id || idx}
            onClick={(e) => onCardClick(cat, idx, e)}
            className={`group flex flex-col overflow-hidden cursor-pointer select-none transition-all duration-200 ease-out ${safeRadiusClass} ${surfaceClass} ${hoverCardClass} ${
              isCarousel ? carouselWidthClass : ""
            } ${isCardSelected ? "ring-2 ring-[#2563EB] ring-offset-2" : ""}`}
          >
            {/* Image Container */}
            <div
              className={`relative w-full overflow-hidden bg-slate-100 ${imgCornerClass} ${resolvedAspectClass}`}
            >
              <img
                src={photoUrl}
                alt={cat.name}
                className={`w-full h-full object-cover transition-transform duration-200 ease-out ${hoverImgClass}`}
              />

              {/* Subtle inner hairline border */}
              <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/[0.05]" />

              {showBadge && cat.badge && (
                <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                  <span
                    className="text-[10px] font-semibold tracking-wide px-2.5 py-0.5 rounded-md text-white shadow-2xs"
                    style={{ backgroundColor: cat.badgeColor || primaryColor }}
                  >
                    {cat.badge}
                  </span>
                </div>
              )}

              {isEditable && (
                <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-95 @sm:opacity-0 @sm:group-hover:opacity-100 transition-opacity duration-150">
                  <button
                    type="button"
                    onClick={(e) => onEditItem(idx, e)}
                    className="bg-[#023859] hover:bg-[#011C40] text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-xs flex items-center gap-1 cursor-pointer border border-white/20"
                  >
                    <Camera className="w-2.5 h-2.5" />
                    <span>Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => onOpenPage(cat, e)}
                    className="bg-slate-900/90 hover:bg-slate-950 text-white text-[9px] font-bold px-1.5 py-1 rounded-md shadow-xs cursor-pointer border border-white/15"
                  >
                    Page →
                  </button>
                </div>
              )}

              {/* Overlay Title Mode ("Sur l'image") */}
              {isTitleVisible && effectiveOverlay && (
                <div
                  className={`absolute inset-0 flex flex-col p-3 @sm:p-3.5 transition-opacity duration-200 ${
                    textPosition === "overlay-center"
                      ? "items-center justify-center text-center"
                      : "justify-end text-left"
                  }`}
                  style={{
                    background:
                      textPosition === "overlay-center"
                        ? `rgba(15, 23, 42, ${Math.min(0.6, Math.max(0.28, overlayOpacity))})`
                        : `linear-gradient(180deg, rgba(15,23,42,0) 38%, rgba(10,15,29,${Math.min(
                            0.82,
                            overlayOpacity + 0.32
                          )}) 100%)`,
                  }}
                >
                  <div
                    className={
                      glassmorphism
                        ? "w-full bg-white/92 backdrop-blur-md text-slate-900 border border-white/70 rounded-xl px-3 py-2 shadow-xs flex items-center justify-between gap-2"
                        : "w-full flex items-end justify-between gap-2"
                    }
                  >
                    <div className="min-w-0">
                      <h3
                        className={`font-semibold tracking-[-0.01em] leading-snug line-clamp-1 ${
                          glassmorphism ? "text-slate-900" : "text-white"
                        } ${
                          cardSize === "compact"
                            ? "text-xs @sm:text-[13px]"
                            : "text-[13px] @sm:text-[15px]"
                        }`}
                      >
                        {cat.name}
                      </h3>
                      {showItemCount && countText && (
                        <p
                          className={`text-[11px] font-medium line-clamp-1 mt-0.5 ${
                            glassmorphism ? "text-slate-500" : "text-white/80"
                          }`}
                        >
                          {countText}
                        </p>
                      )}
                    </div>
                    {textPosition !== "overlay-center" && (
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200 ${
                          glassmorphism
                            ? "bg-slate-900/8 text-slate-800 group-hover:bg-slate-900 group-hover:text-white"
                            : "bg-white/20 text-white border border-white/25 group-hover:bg-white group-hover:text-slate-900"
                        }`}
                      >
                        <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Structured Footer Bar Below Card ("Sous la carte") */}
            {isTitleVisible && !effectiveOverlay && (
              <div
                className={`flex items-center justify-between gap-2 ${
                  cardSkin === "framed"
                    ? "px-2 pt-2.5 pb-1.5"
                    : "px-3 @sm:px-3.5 py-2.5 @sm:py-3 border-t border-slate-100/90"
                }`}
              >
                <div className="min-w-0">
                  <h3
                    className={`font-semibold tracking-[-0.01em] leading-snug line-clamp-1 ${
                      cardSize === "compact"
                        ? "text-xs @sm:text-[13px]"
                        : "text-[13px] @sm:text-[14px]"
                    }`}
                    style={{ color: isDarkSkin ? "#FFFFFF" : textColor }}
                  >
                    {cat.name}
                  </h3>
                  {showItemCount && countText && (
                    <p
                      className={`text-[11px] line-clamp-1 mt-0.5 ${
                        isDarkSkin ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {countText}
                    </p>
                  )}
                </div>
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200 ${
                    isDarkSkin
                      ? "bg-white/10 text-white group-hover:bg-white group-hover:text-slate-950"
                      : "bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white"
                  }`}
                >
                  <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};
