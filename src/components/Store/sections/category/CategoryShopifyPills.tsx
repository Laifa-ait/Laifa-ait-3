import React from "react";
import { Camera, ChevronRight } from "lucide-react";
import {
  CategoryItem,
  CategoryCardSize,
  CategoryImagePosition,
  CategoryImageFit,
  CategoryDeviceViewport,
} from "../../../../pages/Seller/StoreBuilder/constants/categoryPresetTypes";
import { getLucideCategoryIcon } from "../../../../pages/Seller/StoreBuilder/constants/categoryCanvaOptions";
import {
  resolveCategoryPhoto,
  resolveCategoryImageClasses,
  handleCategoryImageError,
} from "./categoryImageHelper";
import { resolveCategoryGridCols } from "./categoryResponsiveHelper";

interface CategoryShopifyPillsProps {
  categories: CategoryItem[];
  cardRadius: string;
  pillShowImage: boolean;
  columnsDesktop?: number;
  columnsTablet?: number;
  columnsMobile?: number;
  previewViewport?: CategoryDeviceViewport;
  showTitle?: boolean;
  showBadge: boolean;
  showItemCount: boolean;
  gapClass: string;
  hoverCardClass: string;
  cardSize?: CategoryCardSize;
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

export const CategoryShopifyPills: React.FC<CategoryShopifyPillsProps> = ({
  categories,
  pillShowImage,
  columnsDesktop = 3,
  columnsTablet = 2,
  columnsMobile = 1,
  previewViewport = "desktop",
  showTitle = true,
  showBadge,
  showItemCount,
  gapClass,
  hoverCardClass,
  cardSize = "balanced",
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
  const isDarkSkin = cardSkin === "dark-glass";
  const isMobileSim = previewViewport === "mobile";

  const gridColsClass = resolveCategoryGridCols(
    columnsDesktop,
    columnsMobile,
    cardSize,
    previewViewport,
    columnsTablet,
    "pills",
    categories.length
  );

  // Proportionate thumbnail leaving generous breathing room for the title at all widths
  const thumbDimClass = isMobileSim
    ? "w-11 h-11"
    : cardSize === "compact"
    ? "w-10 h-10 @[768px]:w-11 @[768px]:h-11"
    : cardSize === "large"
    ? "w-12 h-12 @[768px]:w-14 @[768px]:h-14"
    : "w-10 h-10 @[768px]:w-12 @[768px]:h-12";

  const skinClasses = isDarkSkin
    ? "bg-slate-900 text-white border-white/10 hover:border-white/25"
    : cardSkin === "framed"
    ? "bg-white text-slate-900 border-slate-300/90 hover:border-slate-900/40 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
    : cardSkin === "soft-tint"
    ? "bg-slate-50 text-slate-900 border-slate-200/70 hover:bg-white hover:border-slate-300"
    : "bg-white text-slate-900 border-slate-200/80 hover:border-slate-300";

  const hideChevronOnNarrowMultiCol = !isMobileSim && columnsDesktop >= 3;

  return (
    <div className={`grid ${gridColsClass} ${gapClass}`} data-category-model="pills">
      {categories.map((cat, idx) => {
        const IconComp = getLucideCategoryIcon(cat.iconName);
        const photoUrl = resolveCategoryPhoto(cat, idx);
        const { posClass, fitClass } = resolveCategoryImageClasses(cat, imagePosition, imageFit);
        const countText = getCountLabel(cat);
        const idxLabel = String(idx + 1).padStart(2, "0");
        const isCardSelected =
          isEditable &&
          selectedSectionId === sectionId &&
          selectedSubElement === `category-items:${idx}`;

        const hasCount = showItemCount && Boolean(countText);
        const hasBadge = showBadge && Boolean(cat.badge);

        return (
          <article
            key={cat.id || idx}
            onClick={(e) => onCardClick(cat, idx, e)}
            className={`group relative col-span-1 flex items-center gap-2.5 @[768px]:gap-3 p-2 @[768px]:p-2.5 pr-3 rounded-2xl border transition-all duration-200 ease-out cursor-pointer select-none min-w-0 ${skinClasses} ${hoverCardClass} ${
              isCardSelected ? "ring-2 ring-[#2563EB] ring-offset-1" : ""
            }`}
          >
            {/* Left media thumbnail with nested radius math (outer 16px - 8px padding = 8px/12px) */}
            <div className="relative shrink-0">
              {pillShowImage ? (
                <div className={`${thumbDimClass} rounded-xl overflow-hidden bg-slate-100`}>
                  <img
                    src={photoUrl}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => handleCategoryImageError(e, idx)}
                    className={`w-full h-full ${posClass} ${fitClass} transition-transform duration-300 ease-out group-hover:scale-[1.04]`}
                  />
                </div>
              ) : (
                <div
                  className={`${thumbDimClass} rounded-xl flex items-center justify-center transition-colors ${
                    isDarkSkin
                      ? "bg-white/10 text-white"
                      : "bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white"
                  }`}
                >
                  <IconComp className="w-4 h-4 @[768px]:w-5 @[768px]:h-5" />
                </div>
              )}

              {isEditable && (
                <button
                  type="button"
                  onClick={(e) => onEditItem(idx, e)}
                  className={`absolute -top-1 -right-1 z-20 w-5 h-5 rounded-full bg-white/95 text-slate-700 border border-slate-200/90 shadow-xs flex items-center justify-center cursor-pointer transition-opacity duration-150 ${
                    isCardSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                  title="Modifier ce rayon"
                >
                  <Camera className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            {/* Center readable text — full width priority, zero colliding badges */}
            <div className="flex-1 min-w-0">
              {showTitle ? (
                <>
                  <h3
                    className={`font-semibold ${
                      cardSize === "large"
                        ? "text-sm @[768px]:text-base"
                        : "text-xs @[768px]:text-sm"
                    } tracking-tight leading-snug truncate`}
                    style={{ color: isDarkSkin ? "#FFFFFF" : textColor }}
                  >
                    {cat.name}
                  </h3>
                  {(hasCount || hasBadge) && (
                    <div
                      className={`flex items-center gap-1.5 mt-0.5 text-[11px] font-normal tabular-nums truncate ${
                        isDarkSkin ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {hasCount && <span className="truncate">{countText}</span>}
                      {hasCount && hasBadge && (
                        <span aria-hidden="true" className="opacity-50 shrink-0">
                          ·
                        </span>
                      )}
                      {hasBadge && (
                        <span
                          className="font-medium truncate"
                          style={{ color: isDarkSkin ? "#CBD5E1" : cat.badgeColor || primaryColor }}
                        >
                          {cat.badge}
                        </span>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <span
                  className={`text-xs font-medium tabular-nums block truncate ${
                    isDarkSkin ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {cat.badge || countText || idxLabel}
                </span>
              )}
            </div>

            {/* Subtle minimal directional chevron */}
            <ChevronRight
              aria-hidden="true"
              className={`w-4 h-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5 ${
                hideChevronOnNarrowMultiCol ? "hidden @[560px]:block" : ""
              } ${
                isDarkSkin
                  ? "text-slate-500 group-hover:text-white"
                  : "text-slate-400 group-hover:text-slate-900"
              }`}
            />
          </article>
        );
      })}
    </div>
  );
};
