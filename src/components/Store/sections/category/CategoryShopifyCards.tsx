import React, { RefObject } from "react";
import { ArrowUpRight, Camera } from "lucide-react";
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
  const isGlassDock = layout === "glass-dock";
  const isTitleVisible = showTitle && textPosition !== "none";
  const isDarkSkin = cardSkin === "dark-glass";
  const isOverlayMode = effectiveOverlay || isGlassDock;

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
      ? "snap-start shrink-0 w-[46%] min-w-[148px] @[560px]:w-[31%] @[900px]:w-[23%]"
      : cardSize === "large"
      ? "snap-start shrink-0 w-[74%] min-w-[215px] @[560px]:w-[44%] @[900px]:w-[31%]"
      : "snap-start shrink-0 w-[64%] min-w-[175px] @[560px]:w-[38%] @[900px]:w-[24%]";

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
        const idxLabel = String(idx + 1).padStart(2, "0");
        const isCardSelected =
          isEditable &&
          selectedSectionId === sectionId &&
          selectedSubElement === `category-items:${idx}`;

        const surfaceClass = isDarkSkin
          ? "bg-slate-950 border border-white/15 text-white shadow-sm hover:border-white/30"
          : cardSkin === "soft-tint"
          ? "bg-[#F8FAFC] border border-slate-200/90 p-1 @[560px]:p-1.5 hover:bg-white hover:border-slate-300 shadow-[0_2px_10px_-3px_rgba(15,23,42,0.05)]"
          : cardSkin === "framed"
          ? "bg-white border border-slate-200/95 p-1.5 @[560px]:p-2 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.07)] hover:border-slate-300"
          : "bg-white border border-slate-200/85 p-1 @[560px]:p-1.5 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.06)] hover:border-slate-300";

        return (
          <article
            key={cat.id || idx}
            onClick={(e) => onCardClick(cat, idx, e)}
            className={`group flex flex-col overflow-hidden cursor-pointer select-none transition-all duration-200 ease-out ${safeRadiusClass} ${surfaceClass} ${hoverCardClass} ${
              isCarousel ? carouselWidthClass : ""
            } ${isCardSelected ? "ring-2 ring-[#2563EB] ring-offset-2" : ""}`}
          >
            <div className={`relative w-full overflow-hidden rounded-xl bg-slate-100 ${resolvedAspectClass}`}>
              <img
                src={photoUrl}
                alt={cat.name}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-transform duration-300 ease-out ${hoverImgClass}`}
              />

              <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/[0.06] rounded-xl" />
              {layout === "overlay" && (
                <div className="absolute inset-2 rounded-lg border border-white/25 pointer-events-none z-10" />
              )}

              {/* Top Editorial Index + Optional Badge */}
              <div className="absolute top-2 left-2 @[560px]:top-2.5 @[560px]:left-2.5 z-10 flex items-center gap-1 pointer-events-none">
                <span className="px-1.5 @[560px]:px-2 py-0.5 rounded-full bg-black/35 backdrop-blur-md border border-white/25 text-[9px] @[560px]:text-[10px] font-mono font-bold text-white tabular-nums">
                  {idxLabel}
                </span>
                {showBadge && cat.badge && (
                  <span
                    className="text-[9px] @[560px]:text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full text-white shadow-2xs truncate max-w-[85px]"
                    style={{ backgroundColor: cat.badgeColor || primaryColor }}
                  >
                    {cat.badge}
                  </span>
                )}
              </div>

              {isEditable && (
                <div className="absolute top-2 right-2 @[560px]:top-2.5 @[560px]:right-2.5 z-20 flex items-center gap-1 opacity-95 @[560px]:opacity-0 @[560px]:group-hover:opacity-100 transition-opacity duration-150">
                  <button
                    type="button"
                    onClick={(e) => onEditItem(idx, e)}
                    className="bg-[#023859] hover:bg-[#011C40] text-white text-[9px] font-bold px-1.5 @[560px]:px-2 py-1 rounded-md shadow-xs flex items-center gap-1 cursor-pointer border border-white/20"
                  >
                    <Camera className="w-2.5 h-2.5" />
                    <span className="hidden @[560px]:inline">Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => onOpenPage(cat, e)}
                    className="hidden @[560px]:inline-block bg-slate-900/90 hover:bg-slate-950 text-white text-[9px] font-bold px-1.5 py-1 rounded-md shadow-xs cursor-pointer border border-white/15"
                  >
                    Page →
                  </button>
                </div>
              )}

              {/* Overlay Title Mode ("Sur l'image", "overlay", or "glass-dock") */}
              {isTitleVisible && isOverlayMode && (
                <div
                  className={`absolute inset-0 flex flex-col p-2 @[560px]:p-3 transition-opacity duration-200 ${
                    textPosition === "overlay-center"
                      ? "items-center justify-center text-center"
                      : "justify-end text-left"
                  }`}
                  style={{
                    background:
                      textPosition === "overlay-center"
                        ? `rgba(15, 23, 42, ${Math.min(0.62, Math.max(0.3, overlayOpacity))})`
                        : `linear-gradient(180deg, rgba(15,23,42,0) 35%, rgba(10,15,29,${Math.min(
                            0.85,
                            overlayOpacity + 0.35
                          )}) 100%)`,
                  }}
                >
                  <div
                    className={
                      isGlassDock || glassmorphism
                        ? "w-full bg-white/92 backdrop-blur-md text-slate-900 border border-white/80 rounded-xl px-2.5 py-1.5 @[560px]:px-3 @[560px]:py-2.5 shadow-sm flex items-center justify-between gap-1.5"
                        : "w-full flex items-end justify-between gap-1.5 px-1 pb-0.5"
                    }
                  >
                    <div className="min-w-0">
                      <h3
                        className={`font-bold tracking-tight leading-snug line-clamp-1 ${
                          isGlassDock || glassmorphism ? "text-slate-900" : "text-white"
                        } text-xs @[560px]:text-sm @[900px]:text-[15px]`}
                      >
                        {cat.name}
                      </h3>
                      {showItemCount && countText && (
                        <p
                          className={`text-[10px] @[560px]:text-[11px] font-medium line-clamp-1 mt-0.5 ${
                            isGlassDock || glassmorphism ? "text-slate-500" : "text-white/80"
                          }`}
                        >
                          {countText}
                        </p>
                      )}
                    </div>
                    {textPosition !== "overlay-center" && (
                      <span
                        className={`w-6 h-6 @[560px]:w-7 @[560px]:h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                          isGlassDock || glassmorphism
                            ? "bg-slate-900 text-white group-hover:scale-105"
                            : "bg-white text-slate-950 group-hover:scale-105"
                        }`}
                      >
                        <ArrowUpRight className="w-3 h-3 @[560px]:w-3.5 @[560px]:h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Prestige Editorial Footer Bar Below Image ("Sous la carte") */}
            {isTitleVisible && !isOverlayMode && (
              <div className="flex items-center justify-between gap-1.5 px-2 pt-2 pb-1 @[560px]:px-2.5 @[560px]:pt-2.5 @[560px]:pb-1.5">
                <div className="min-w-0">
                  <h3
                    className="font-bold tracking-tight leading-snug line-clamp-1 text-xs @[560px]:text-sm @[900px]:text-[15px]"
                    style={{ color: isDarkSkin ? "#FFFFFF" : textColor }}
                  >
                    {cat.name}
                  </h3>
                  <p
                    className={`text-[10px] @[560px]:text-[11px] font-medium line-clamp-1 mt-0.5 ${
                      showItemCount && countText ? "block" : "hidden @[560px]:block"
                    } ${isDarkSkin ? "text-slate-400" : "text-slate-500"}`}
                  >
                    {showItemCount && countText ? countText : "Explorer la collection"}
                  </p>
                </div>
                <span
                  className={`w-6 h-6 @[560px]:w-7 @[560px]:h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isDarkSkin
                      ? "bg-white/15 text-white group-hover:bg-white group-hover:text-slate-950"
                      : "bg-slate-900 text-white group-hover:scale-105"
                  }`}
                >
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
