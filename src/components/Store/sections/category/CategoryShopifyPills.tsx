import React from "react";
import { ArrowUpRight, Camera } from "lucide-react";
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
import {
  resolveCategoryGridCols,
} from "./categoryResponsiveHelper";

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
  primaryColor = "#023859",
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

  // RÈGLE 2.11 : Dock Capsules -> Pilule complète (border-radius: 9999px), hauteur fixe 72px / 88px / 104px (68px en 1 col. sur Mobile)
  const gridColsClass = resolveCategoryGridCols(
    columnsDesktop,
    columnsMobile,
    cardSize,
    previewViewport,
    columnsTablet,
    "pills",
    categories.length
  );

  const pillHeightClass = isMobileSim
    ? "h-[68px]"
    : cardSize === "compact"
    ? "h-[72px]"
    : cardSize === "large"
    ? "h-[104px]"
    : "h-[88px]";

  const thumbDimClass = isMobileSim
    ? "w-[52px] h-[52px]"
    : cardSize === "compact"
    ? "w-[56px] h-[56px]"
    : cardSize === "large"
    ? "w-[80px] h-[80px]"
    : "w-[68px] h-[68px]";

  return (
    <div className={`grid ${gridColsClass} ${gapClass}`} data-category-model="pills">
      {categories.map((cat, idx) => {
        const IconComp = getLucideCategoryIcon(cat.iconName);
        const photoUrl = resolveCategoryPhoto(cat, idx);
        const { posClass, fitClass } = resolveCategoryImageClasses(cat, imagePosition, imageFit);
        const countText = getCountLabel(cat);
        const idxLabel = String(idx + 1).padStart(2, "0");
        const spanClass = "col-span-1";
        const isCardSelected =
          isEditable &&
          selectedSectionId === sectionId &&
          selectedSubElement === `category-items:${idx}`;

        const skinClasses = isDarkSkin
          ? "bg-slate-950 text-white border-white/15 hover:border-white/35 shadow-sm"
          : cardSkin === "soft-tint"
          ? "bg-[#F8FAFC] text-slate-900 border-slate-200/90 hover:bg-white shadow-2xs"
          : "bg-white text-slate-900 border-slate-200/95 hover:border-slate-300 shadow-[0_4px_14px_-4px_rgba(15,23,42,0.07)]";

        return (
          <article
            key={cat.id || idx}
            onClick={(e) => onCardClick(cat, idx, e)}
            style={{ borderRadius: "9999px" }}
            className={`group relative flex items-center justify-between gap-3 px-2 pr-3.5 ${pillHeightClass} border transition-all duration-200 ease-out cursor-pointer select-none ${skinClasses} ${spanClass} ${hoverCardClass} ${
              isCardSelected ? "ring-2 ring-[#2563EB] ring-offset-1" : ""
            }`}
          >
            {/* À gauche : miniature ronde (56px à 80px) */}
            <div className="flex items-center gap-3 min-w-0">
              {pillShowImage ? (
                <div className={`${thumbDimClass} rounded-full overflow-hidden shrink-0 relative bg-slate-100 ring-2 ring-slate-100`}>
                  <img
                    src={photoUrl}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => handleCategoryImageError(e, idx)}
                    className={`w-full h-full ${posClass} ${fitClass} transition-transform duration-300 group-hover:scale-105`}
                  />
                </div>
              ) : (
                <div
                  className={`${thumbDimClass} rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isDarkSkin
                      ? "bg-white/10 text-white group-hover:bg-white group-hover:text-slate-950"
                      : "bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white"
                  }`}
                >
                  <IconComp className="w-5 h-5" />
                </div>
              )}

              {/* Au centre : titre/compteur d'articles (ou capsule #01 en mode Sans titre) */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400 tabular-nums">
                    #{idxLabel}
                  </span>
                  {showBadge && cat.badge && (
                    <span
                      className="text-[9px] font-semibold px-2 py-0.5 rounded-full text-white shrink-0"
                      style={{ backgroundColor: cat.badgeColor || primaryColor }}
                    >
                      {cat.badge}
                    </span>
                  )}
                </div>
                {showTitle ? (
                  <>
                    <h3 className={`font-bold ${cardSize === "large" ? "text-sm @[768px]:text-base" : "text-xs @[768px]:text-sm"} tracking-tight truncate`}>
                      {cat.name}
                    </h3>
                    {showItemCount && countText && (
                      <span className={`text-[10px] @[768px]:text-[11px] font-medium block truncate ${isDarkSkin ? "text-slate-400" : "text-slate-500"}`}>
                        {countText}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs font-mono font-semibold text-slate-500 block truncate">
                    CAPSULE #{idxLabel}
                  </span>
                )}
              </div>
            </div>

            {/* À droite : bouton circulaire fléché */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                  isDarkSkin ? "bg-white text-slate-950" : "bg-slate-900 text-white"
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
              </span>

              {isEditable && (
                <button
                  type="button"
                  onClick={(e) => onEditItem(idx, e)}
                  className="w-6 h-6 rounded-full bg-[#023859] text-white flex items-center justify-center cursor-pointer shadow-xs"
                  title="Modifier cette capsule"
                >
                  <Camera className="w-3 h-3" />
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};
