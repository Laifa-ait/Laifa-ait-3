import React from "react";
import { ArrowUpRight, Camera } from "lucide-react";
import {
  CategoryItem,
  CategoryCardSize,
  CategoryImagePosition,
  CategoryImageFit,
  CategoryDeviceViewport,
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
  columnsDesktop?: number;
  columnsTablet?: number;
  columnsMobile?: number;
  imagePosition?: CategoryImagePosition;
  imageFit?: CategoryImageFit;
  primaryColor?: string;
  previewViewport?: CategoryDeviceViewport;
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
  imagePosition = "center",
  imageFit = "cover",
  primaryColor = "#0F172A",
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

  // RÈGLE 2.1 : Desktop = grille 3 col. asymétrique (2+1 / 1+2 pour 4 cartes). Tablette & Mobile = grille 2 col.
  const isCompactDevice = previewViewport === "mobile" || previewViewport === "tablet";
  const activeCols = isCompactDevice ? 2 : 3;
  const gridColsClass = isCompactDevice ? "grid-cols-2" : "grid-cols-3";

  const autoRowClass = isCompactDevice
    ? ""
    : cardSize === "compact"
    ? "auto-rows-[220px]"
    : cardSize === "large"
    ? "auto-rows-[340px]"
    : "auto-rows-[280px]";

  const heroRowH =
    previewViewport === "mobile"
      ? "h-[180px]"
      : previewViewport === "tablet"
      ? cardSize === "compact"
        ? "h-[190px]"
        : cardSize === "large"
        ? "h-[250px]"
        : "h-[220px]"
      : "h-full";

  const cellRowH =
    previewViewport === "mobile"
      ? "h-[160px]"
      : previewViewport === "tablet"
      ? cardSize === "compact"
        ? "h-[165px]"
        : cardSize === "large"
        ? "h-[220px]"
        : "h-[190px]"
      : "h-full";

  const isDarkSkin = cardSkin === "dark-glass";

  return (
    <div className={`grid ${gridColsClass} ${autoRowClass} ${gapClass}`} data-category-model="bento">
      {categories.map((cat, idx) => {
        const photoUrl = resolveCategoryPhoto(cat, idx);
        const { posClass, fitClass } = resolveCategoryImageClasses(cat, imagePosition, imageFit);
        const isWideTile = idx === 0 || (categories.length === 4 && idx === 3);
        const idxLabel = String(idx + 1).padStart(2, "0");
        const isCardSelected =
          isEditable && selectedSectionId === sectionId && selectedSubElement === `category-items:${idx}`;

        const spanClass = resolveResponsiveBentoSpan(
          idx,
          categories.length,
          heroRowH,
          cellRowH,
          previewViewport,
          activeCols
        );
        const countText = getCountLabel(cat);
        const useGlassDock = glassmorphism || cardSkin === "framed" || cardSkin === "soft-tint";

        return (
          <article
            key={cat.id || idx}
            onClick={(e) => onCardClick(cat, idx, e)}
            className={`group relative overflow-hidden cursor-pointer select-none transition-all duration-300 ease-out border ${
              isDarkSkin
                ? "border-white/15 bg-slate-950 shadow-sm"
                : cardSkin === "framed"
                ? "border-slate-200/95 bg-white p-1.5 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.08)]"
                : cardSkin === "soft-tint"
                ? "border-slate-200/90 bg-[#F8FAFC] p-1 shadow-2xs"
                : "border-transparent bg-slate-900 shadow-[0_2px_10px_-3px_rgba(15,23,42,0.06)]"
            } ${outerRadiusClass} ${spanClass} ${hoverCardClass} ${
              isCardSelected ? "ring-2 ring-[#2563EB] ring-offset-2" : ""
            }`}
          >
            <div className={`relative w-full h-full overflow-hidden ${cardSkin === "framed" || cardSkin === "soft-tint" ? mediaRadiusClass : ""}`}>
              <img
                src={photoUrl}
                alt={cat.name}
                referrerPolicy="no-referrer"
                onError={(e) => handleCategoryImageError(e, idx)}
                className={`absolute inset-0 w-full h-full ${posClass} ${fitClass} transition-transform duration-500 ease-out ${hoverImgClass}`}
              />
              <div className="absolute inset-2 rounded-xl border border-white/25 pointer-events-none z-10" />
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                style={{
                  background: showTitle
                    ? textPosition === "overlay-center"
                      ? `rgba(15, 23, 42, ${Math.min(0.65, Math.max(0.25, overlayOpacity))})`
                      : `linear-gradient(180deg, rgba(15,23,42,0.08) 0%, rgba(15,23,42,0) 40%, rgba(10,15,29,${Math.min(0.86, overlayOpacity + 0.34)}) 100%)`
                    : "linear-gradient(180deg, rgba(15,23,42,0.18) 0%, rgba(15,23,42,0) 55%, rgba(15,23,42,0.35) 100%)",
                }}
              />

              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 pointer-events-none">
                <span className="px-2 py-0.5 rounded-sm bg-slate-950/60 backdrop-blur-md border border-white/25 text-[10px] font-mono font-bold text-white tabular-nums">
                  BENTO #{idxLabel}
                </span>
                {showBadge && cat.badge && (
                  <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold tracking-wide text-white shadow-2xs truncate max-w-[110px]" style={{ backgroundColor: cat.badgeColor || primaryColor }}>
                    {cat.badge}
                  </span>
                )}
              </div>

              {isEditable && (
                <div className="absolute top-3 right-3 z-20 flex items-center gap-1 opacity-85 @[768px]:opacity-0 @[768px]:group-hover:opacity-100 transition-opacity duration-150">
                  <button type="button" onClick={(e) => onEditItem(idx, e)} className="bg-slate-900/90 hover:bg-slate-950 text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-xs flex items-center gap-1 cursor-pointer border border-white/20">
                    <Camera className="w-2.5 h-2.5" />
                    <span className="hidden @[768px]:inline">Photo</span>
                  </button>
                  <button type="button" onClick={(e) => onOpenPage(cat, e)} className="hidden @[768px]:inline-block bg-slate-900/90 hover:bg-slate-950 text-white text-[9px] font-bold px-1.5 py-1 rounded-md shadow-xs cursor-pointer border border-white/15">
                    Page →
                  </button>
                </div>
              )}

              {showTitle ? (
                <div className={`absolute inset-x-3 bottom-3 z-10 flex flex-col ${textPosition === "overlay-center" ? "inset-y-3 items-center justify-center text-center" : "justify-end"}`}>
                  <div className={useGlassDock ? "w-full bg-white/92 backdrop-blur-md text-slate-900 border border-white/80 rounded-xl px-3 py-2 shadow-sm flex items-center justify-between gap-2" : "w-full bg-slate-950/65 backdrop-blur-md text-white border border-white/20 rounded-xl px-3 py-2 flex items-center justify-between gap-2"}>
                    <div className="min-w-0 text-left">
                      <h3 className={`font-bold tracking-tight leading-snug line-clamp-1 ${useGlassDock ? "text-slate-900" : "text-white"} ${isWideTile ? "text-sm @[768px]:text-lg" : "text-xs @[768px]:text-[15px]"}`}>
                        {cat.name}
                      </h3>
                      {(showItemCount || isWideTile) && countText && (
                        <p className={`text-[10px] @[768px]:text-[11px] font-medium line-clamp-1 mt-0.5 ${useGlassDock ? "text-slate-500" : "text-white/80"}`}>{countText}</p>
                      )}
                    </div>
                    <span className={`w-6 h-6 @[768px]:w-7 @[768px]:h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${useGlassDock ? "bg-slate-900 text-white group-hover:scale-105" : "bg-white text-slate-950 group-hover:scale-105"}`}>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ) : (
                <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
                  <span className="w-7 h-7 rounded-full bg-white/85 backdrop-blur-md text-slate-950 border border-white/60 shadow-sm flex items-center justify-center">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};
