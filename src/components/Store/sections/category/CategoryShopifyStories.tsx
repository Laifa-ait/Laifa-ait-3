import React from "react";
import { Camera } from "lucide-react";
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
import { resolveCategoryGridCols } from "./categoryResponsiveHelper";

interface CategoryShopifyStoriesProps {
  categories: CategoryItem[];
  bubbleSize: string;
  bubbleRing: string;
  columnsDesktop: number;
  columnsTablet?: number;
  columnsMobile: number;
  cardSize?: CategoryCardSize;
  previewViewport?: CategoryDeviceViewport;
  gapClass: string;
  hoverImgClass?: string;
  hoverCardClass?: string;
  showTitle?: boolean;
  showBadge: boolean;
  showItemCount: boolean;
  cardSkin?: string;
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
}

export const CategoryShopifyStories: React.FC<CategoryShopifyStoriesProps> = ({
  categories,
  bubbleSize,
  bubbleRing,
  columnsDesktop,
  columnsTablet,
  columnsMobile,
  cardSize = "balanced",
  previewViewport = "desktop",
  gapClass,
  hoverImgClass = "",
  hoverCardClass = "",
  showTitle = true,
  showBadge,
  showItemCount,
  cardSkin = "editorial",
  imagePosition = "center",
  imageFit = "cover",
  textColor = "#0F172A",
  primaryColor = "#0F172A",
  isEditable,
  selectedSectionId,
  selectedSubElement,
  sectionId,
  getCountLabel,
  onCardClick,
  onEditItem,
}) => {
  const effectiveScale =
    cardSize === "compact" || bubbleSize === "sm"
      ? "compact"
      : cardSize === "large" || bubbleSize === "lg"
      ? "large"
      : "balanced";

  const isMobile = previewViewport === "mobile";
  const isDarkSkin = cardSkin === "dark-glass";

  // Fluid circle max-width so medallions never overflow narrow columns or preview panes
  const circleMaxWidthClass = isMobile
    ? effectiveScale === "compact"
      ? "max-w-[84px]"
      : effectiveScale === "large"
      ? "max-w-[120px]"
      : "max-w-[100px]"
    : effectiveScale === "compact"
    ? "max-w-[96px]"
    : effectiveScale === "large"
    ? "max-w-[156px]"
    : "max-w-[124px]";

  const ringFrameClass =
    bubbleRing === "none"
      ? ""
      : bubbleRing === "solid"
      ? isDarkSkin
        ? "p-[2px] ring-1 ring-white/40"
        : "p-[2px] ring-1 ring-slate-900/75"
      : isDarkSkin
      ? "p-[3px] bg-slate-800 ring-1 ring-white/15 group-hover:ring-white/35"
      : "p-[3px] bg-white ring-1 ring-slate-200/90 group-hover:ring-slate-400";

  const cardSurfaceClass = isDarkSkin
    ? "bg-slate-900 border border-white/10 rounded-2xl p-3 @[768px]:p-4 text-white"
    : cardSkin === "framed"
    ? "bg-white border border-slate-200/85 rounded-2xl p-3 @[768px]:p-4 hover:border-slate-300"
    : cardSkin === "soft-tint"
    ? "bg-slate-50/90 border border-slate-200/60 rounded-2xl p-3 @[768px]:p-4 hover:bg-white"
    : "bg-transparent p-1.5 @[768px]:p-2 rounded-2xl";

  const responsiveCols = resolveCategoryGridCols(
    columnsDesktop,
    columnsMobile,
    cardSize,
    previewViewport,
    columnsTablet,
    "bubbles",
    categories.length
  );

  return (
    <div className={`grid ${responsiveCols} ${gapClass} py-1`} data-category-model="bubbles">
      {categories.map((cat, idx) => {
        const photoUrl = resolveCategoryPhoto(cat, idx);
        const { posClass, fitClass } = resolveCategoryImageClasses(cat, imagePosition, imageFit);
        const countText = getCountLabel(cat);
        const idxLabel = String(idx + 1).padStart(2, "0");
        const isCardSelected =
          isEditable &&
          selectedSectionId === sectionId &&
          selectedSubElement === `category-items:${idx}`;

        const appliedHoverClass =
          cardSkin === "editorial" ? "hover:-translate-y-0.5" : hoverCardClass;

        return (
          <article
            key={cat.id || idx}
            onClick={(e) => onCardClick(cat, idx, e)}
            className={`group relative col-span-1 flex flex-col items-center text-center cursor-pointer select-none transition-all duration-200 ease-out ${cardSurfaceClass} ${appliedHoverClass} ${
              isCardSelected ? "ring-2 ring-[#2563EB] ring-offset-1" : ""
            }`}
          >
            {/* Clean fluid circular photo medallion */}
            <div className={`relative w-full ${circleMaxWidthClass} aspect-square mx-auto shrink-0`}>
              <div
                className={`w-full h-full rounded-full transition-all duration-200 ease-out ${ringFrameClass}`}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100">
                  <img
                    src={photoUrl}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => handleCategoryImageError(e, idx)}
                    className={`w-full h-full ${posClass} ${fitClass} transition-transform duration-300 ease-out group-hover:scale-[1.04] ${hoverImgClass}`}
                  />
                </div>
              </div>

              {isEditable && (
                <button
                  type="button"
                  onClick={(e) => onEditItem(idx, e)}
                  className={`absolute top-0.5 right-0.5 z-20 w-6 h-6 rounded-full bg-white/95 text-slate-700 border border-slate-200/90 shadow-xs flex items-center justify-center cursor-pointer transition-opacity duration-150 ${
                    isCardSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                  title="Modifier ce rayon"
                >
                  <Camera className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Clean unboxed caption directly beneath the circle */}
            <div className="mt-2.5 w-full flex flex-col items-center gap-0.5 px-1">
              {showBadge && cat.badge && (
                <span
                  className="text-[10px] font-medium tracking-wide truncate max-w-full"
                  style={{ color: isDarkSkin ? "#94A3B8" : cat.badgeColor || primaryColor }}
                >
                  {cat.badge}
                </span>
              )}

              {showTitle ? (
                <>
                  <h3
                    className={`font-semibold ${
                      effectiveScale === "large"
                        ? "text-sm @[768px]:text-base"
                        : "text-xs @[768px]:text-sm"
                    } tracking-tight leading-snug line-clamp-1`}
                    style={{ color: isDarkSkin ? "#FFFFFF" : textColor }}
                  >
                    {cat.name}
                  </h3>
                  {showItemCount && countText && (
                    <span
                      className={`text-[11px] font-normal tabular-nums line-clamp-1 ${
                        isDarkSkin ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {countText}
                    </span>
                  )}
                </>
              ) : (
                <span
                  className={`text-[11px] font-medium tabular-nums truncate ${
                    isDarkSkin ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {countText || idxLabel}
                </span>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};
