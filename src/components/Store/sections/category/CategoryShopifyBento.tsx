import React from "react";
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
import {
  resolveResponsiveBentoSpan,
  resolveOuterAndMediaRadius,
} from "./categoryResponsiveHelper";

interface CategoryShopifyBentoProps {
  categories: CategoryItem[];
  cardRadius?: string;
  cardRadiusClass: string;
  hoverImgClass: string;
  hoverCardClass: string;
  textPosition?: string;
  overlayOpacity: number;
  glassmorphism: boolean;
  showTitle?: boolean;
  showBadge: boolean;
  showItemCount: boolean;
  gapClass: string;
  cardSize?: CategoryCardSize;
  cardSkin?: string;
  columnsMobile?: number;
  imagePosition?: CategoryImagePosition;
  imageFit?: CategoryImageFit;
  primaryColor?: string;
  previewViewport?: "mobile" | "tablet" | "desktop";
  isEditable?: boolean;
  selectedSectionId?: string | null;
  selectedSubElement?: string | null;
  sectionId: string;
  getCountLabel: (cat: CategoryItem) => string;
  onCardClick: (cat: CategoryItem, idx: number, e: React.MouseEvent) => void;
  onEditItem: (idx: number, e: React.MouseEvent) => void;
  onOpenPage: (cat: CategoryItem, e: React.MouseEvent) => void;
}

export const CategoryShopifyBento: React.FC<CategoryShopifyBentoProps> = ({
  categories,
  cardRadius = "md",
  hoverImgClass,
  hoverCardClass,
  textPosition = "overlay-bottom",
  overlayOpacity,
  glassmorphism,
  showTitle = true,
  showBadge,
  showItemCount,
  gapClass,
  cardSize = "balanced",
  cardSkin = "editorial",
  columnsMobile = 2,
  imagePosition = "center",
  imageFit = "cover",
  primaryColor = "#023859",
  previewViewport = "desktop",
  isEditable,
  selectedSectionId,
  selectedSubElement,
  sectionId,
  getCountLabel,
  onCardClick,
  onEditItem,
  onOpenPage,
}) => {
  const { outerRadiusClass, mediaRadiusClass } = resolveOuterAndMediaRadius(
    cardRadius === "full" ? "lg" : cardRadius
  );

  const autoRowClass =
    previewViewport === "mobile" || previewViewport === "tablet"
      ? ""
      : cardSize === "compact"
      ? "@[900px]:auto-rows-[175px]"
      : cardSize === "large"
      ? "@[900px]:auto-rows-[240px]"
      : "@[900px]:auto-rows-[205px]";

  const heroMinH =
    cardSize === "compact"
      ? "min-h-[175px] @[560px]:min-h-[205px] @[900px]:min-h-full"
      : cardSize === "large"
      ? "min-h-[225px] @[560px]:min-h-[260px] @[900px]:min-h-full"
      : "min-h-[195px] @[560px]:min-h-[230px] @[900px]:min-h-full";

  const cellMinH =
    columnsMobile === 1
      ? "min-h-[185px] @[560px]:min-h-[185px] @[900px]:min-h-full"
      : cardSize === "compact"
      ? "min-h-[145px] @[560px]:min-h-[165px] @[900px]:min-h-full"
      : cardSize === "large"
      ? "min-h-[180px] @[560px]:min-h-[210px] @[900px]:min-h-full"
      : "min-h-[160px] @[560px]:min-h-[185px] @[900px]:min-h-full";

  const gridColsClass =
    previewViewport === "mobile" || previewViewport === "tablet"
      ? "grid-cols-2"
      : "grid-cols-2 @[900px]:grid-cols-4";

  const isDarkSkin = cardSkin === "dark-glass";

  return (
    <div className={`grid ${gridColsClass} ${autoRowClass} ${gapClass}`}>
      {categories.map((cat, idx) => {
        const photoUrl = resolveCategoryPhoto(cat, idx);
        const { posClass, fitClass } = resolveCategoryImageClasses(cat, imagePosition, imageFit);
        const isHero = idx === 0;
        const idxLabel = String(idx + 1).padStart(2, "0");
        const isCardSelected =
          isEditable && selectedSectionId === sectionId && selectedSubElement === `category-items:${idx}`;

        const spanClass = resolveResponsiveBentoSpan(
          idx,
          categories.length,
          heroMinH,
          cellMinH,
          previewViewport,
          columnsMobile
        );
        const countText = getCountLabel(cat);
        const useGlassDock = glassmorphism || cardSkin === "framed" || cardSkin === "soft-tint";

        return (
          <article
            key={cat.id || idx}
            onClick={(e) => onCardClick(cat, idx, e)}
            className={`group relative overflow-hidden cursor-pointer select-none transition-all duration-200 ease-out border ${
              isDarkSkin
                ? "border-white/15 bg-slate-950 shadow-sm"
                : cardSkin === "framed"
                ? "border-slate-200/95 bg-white p-1 @[560px]:p-1.5 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.06)]"
                : "border-slate-200/80 bg-slate-100 shadow-[0_2px_10px_-3px_rgba(15,23,42,0.05)]"
            } ${outerRadiusClass} ${spanClass} ${hoverCardClass} ${
              isCardSelected ? "ring-2 ring-[#2563EB] ring-offset-2" : ""
            }`}
          >
            <div className={`relative w-full h-full overflow-hidden ${cardSkin === "framed" ? mediaRadiusClass : ""}`}>
              <img
                src={photoUrl}
                alt={cat.name}
                referrerPolicy="no-referrer"
                onError={(e) => handleCategoryImageError(e, idx)}
                className={`absolute inset-0 w-full h-full ${posClass} ${fitClass} transition-transform duration-300 ease-out ${hoverImgClass}`}
              />
              <div className="absolute inset-1.5 @[560px]:inset-2 rounded-xl border border-white/20 pointer-events-none z-10" />
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                style={{
                  background: showTitle
                    ? textPosition === "overlay-center"
                      ? `rgba(15, 23, 42, ${Math.min(0.65, Math.max(0.25, overlayOpacity))})`
                      : `linear-gradient(180deg, rgba(15,23,42,0.05) 0%, rgba(15,23,42,0) 40%, rgba(10,15,29,${Math.min(0.86, overlayOpacity + 0.34)}) 100%)`
                    : "none",
                }}
              />

              <div className="absolute top-2 left-2 @[560px]:top-3 @[560px]:left-3 z-10 flex items-center gap-1 pointer-events-none">
                <span className="hidden @[420px]:inline-block px-1.5 @[560px]:px-2 py-0.5 rounded-full bg-black/35 backdrop-blur-md border border-white/25 text-[9px] @[560px]:text-[10px] font-mono font-bold text-white tabular-nums">
                  {idxLabel}
                </span>
                {showBadge && cat.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] @[560px]:text-[10px] font-semibold tracking-wide text-white shadow-2xs truncate max-w-[90px]" style={{ backgroundColor: cat.badgeColor || primaryColor }}>
                    {cat.badge}
                  </span>
                )}
              </div>

              {isEditable && (
                <div className="absolute top-2 right-2 @[560px]:top-3 @[560px]:right-3 z-20 flex items-center gap-1 opacity-85 @[560px]:opacity-0 @[560px]:group-hover:opacity-100 transition-opacity duration-150">
                  <button type="button" onClick={(e) => onEditItem(idx, e)} className="bg-[#023859]/90 hover:bg-[#011C40] text-white text-[9px] font-bold p-1.5 @[560px]:px-2 @[560px]:py-1 rounded-md shadow-xs flex items-center gap-1 cursor-pointer border border-white/20">
                    <Camera className="w-2.5 h-2.5" />
                    <span className="hidden @[560px]:inline">Photo</span>
                  </button>
                  <button type="button" onClick={(e) => onOpenPage(cat, e)} className="hidden @[560px]:inline-block bg-slate-900/90 hover:bg-slate-950 text-white text-[9px] font-bold px-1.5 py-1 rounded-md shadow-xs cursor-pointer border border-white/15">
                    Page →
                  </button>
                </div>
              )}

              {showTitle && (
                <div className={`absolute inset-x-2 bottom-2 @[560px]:inset-x-3 @[560px]:bottom-3 z-10 flex flex-col ${textPosition === "overlay-center" ? "inset-y-2 items-center justify-center text-center" : "justify-end"}`}>
                  <div className={useGlassDock ? "w-full bg-white/92 backdrop-blur-md text-slate-900 border border-white/80 rounded-xl px-2 py-1.5 @[560px]:px-3.5 @[560px]:py-2.5 shadow-sm flex items-center justify-between gap-1.5" : "w-full bg-slate-950/65 backdrop-blur-md text-white border border-white/20 rounded-xl px-2 py-1.5 @[560px]:px-3.5 @[560px]:py-2.5 flex items-center justify-between gap-1.5"}>
                    <div className="min-w-0 text-left">
                      <h3 className={`font-bold tracking-tight leading-snug line-clamp-1 ${useGlassDock ? "text-slate-900" : "text-white"} ${isHero ? "text-xs @[560px]:text-base @[900px]:text-lg" : "text-[11px] @[560px]:text-sm @[900px]:text-[15px]"}`}>
                        {cat.name}
                      </h3>
                      {(showItemCount || isHero) && countText && (
                        <p className={`text-[10px] @[560px]:text-[11px] font-medium line-clamp-1 mt-0.5 ${useGlassDock ? "text-slate-500" : "text-white/75"}`}>{countText}</p>
                      )}
                    </div>
                    <span className={`w-5 h-5 @[560px]:w-7 @[560px]:h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${useGlassDock ? "bg-slate-900 text-white group-hover:scale-105" : "bg-white text-slate-950 group-hover:scale-105"}`}>
                      <ArrowUpRight className="w-3 h-3 @[560px]:w-3.5 @[560px]:h-3.5" />
                    </span>
                  </div>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};
