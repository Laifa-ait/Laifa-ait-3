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
  resolveCategoryGridCols,
} from "./categoryResponsiveHelper";

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
  primaryColor = "#023859",
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

  // RÈGLE 2.10 : Diamètre du cercle : 110px (Compacte) / 145px (Équilibrée) / 180px (Grande) sur PC ; 100px en grille 2 col. sur Mobile
  const circleDiameterPx =
    previewViewport === "mobile"
      ? 100
      : previewViewport === "tablet"
      ? effectiveScale === "compact"
        ? 110
        : effectiveScale === "large"
        ? 155
        : 132
      : effectiveScale === "compact"
      ? 110
      : effectiveScale === "large"
      ? 180
      : 145;

  const overlapPx = Math.round(circleDiameterPx * 0.4);

  const ringStyleClass =
    bubbleRing === "none"
      ? "p-1 bg-white border border-amber-300/80 shadow-sm"
      : bubbleRing === "solid"
      ? "p-1 bg-white border-2 border-slate-900 shadow-sm"
      : "p-[3px] bg-gradient-to-tr from-[#023859] via-[#54ACBF] to-amber-300 shadow-md";

  const responsiveCols = resolveCategoryGridCols(
    columnsDesktop,
    columnsMobile,
    cardSize,
    previewViewport,
    columnsTablet,
    "bubbles",
    categories.length
  );

  const isDarkSkin = cardSkin === "dark-glass";

  return (
    <div className={`grid ${responsiveCols} ${gapClass} py-2`} data-category-model="bubbles">
      {categories.map((cat, idx) => {
        const photoUrl = resolveCategoryPhoto(cat, idx);
        const { posClass, fitClass } = resolveCategoryImageClasses(cat, imagePosition, imageFit);
        const countText = getCountLabel(cat);
        const idxLabel = String(idx + 1).padStart(2, "0");
        const spanClass = "col-span-1";
        const isCardSelected =
          isEditable &&
          selectedSectionId === sectionId &&
          selectedSubElement === `category-items:${idx}`;

        const podiumSurfaceClass = isDarkSkin
          ? "bg-slate-950 border border-white/20 text-white shadow-md"
          : cardSkin === "soft-tint"
          ? "bg-[#F8FAFC] border border-slate-200/90 text-slate-900 shadow-xs"
          : "bg-white border border-stone-200/95 text-slate-900 shadow-[0_8px_24px_-8px_rgba(15,23,42,0.1)]";

        return (
          <article
            key={cat.id || idx}
            onClick={(e) => onCardClick(cat, idx, e)}
            className={`group relative flex flex-col items-center text-center cursor-pointer select-none ${spanClass} ${hoverCardClass} ${
              isCardSelected ? "ring-2 ring-[#2563EB] rounded-2xl" : ""
            }`}
          >
            {/* Médaillon circulaire avec double anneau « bague luxe » chevauchant le socle de 40% */}
            <div
              style={{
                width: `${circleDiameterPx}px`,
                height: `${circleDiameterPx}px`,
                marginBottom: `-${overlapPx}px`,
              }}
              className="relative z-10 shrink-0"
            >
              <div
                className={`w-full h-full aspect-square rounded-full transition-transform duration-300 ease-out group-hover:scale-105 ${ringStyleClass}`}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 relative ring-2 ring-white">
                  <img
                    src={photoUrl}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => handleCategoryImageError(e, idx)}
                    className={`w-full h-full ${posClass} ${fitClass} transition-transform duration-500 ease-out ${hoverImgClass}`}
                  />
                </div>
              </div>

              {showBadge && cat.badge && (
                <span
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full text-[9px] font-semibold text-white shadow-xs whitespace-nowrap border border-white"
                  style={{ backgroundColor: cat.badgeColor || primaryColor }}
                >
                  {cat.badge}
                </span>
              )}

              {isEditable && (
                <button
                  type="button"
                  onClick={(e) => onEditItem(idx, e)}
                  className="absolute top-0 right-0 z-20 w-6 h-6 rounded-full bg-[#023859] text-white shadow-xs flex items-center justify-center cursor-pointer border-2 border-white"
                  title="Modifier ce médaillon"
                >
                  <Camera className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Socle rectangulaire arrondi en dessous (podium) — Toujours visible même en mode Sans titre */}
            <div
              style={{ paddingTop: `${overlapPx + 10}px` }}
              className={`w-full rounded-2xl px-3 pb-3 transition-colors ${podiumSurfaceClass}`}
            >
              {showTitle ? (
                <div className="w-full flex flex-col items-center">
                  <h3
                    className={`font-bold ${effectiveScale === "large" ? "text-sm @[768px]:text-base" : "text-xs @[768px]:text-sm"} tracking-tight leading-snug line-clamp-1`}
                    style={{ color: isDarkSkin ? "#FFFFFF" : textColor }}
                  >
                    {cat.name}
                  </h3>
                  <span className={`text-[10px] font-medium mt-0.5 line-clamp-1 ${isDarkSkin ? "text-slate-400" : "text-slate-500"}`}>
                    {showItemCount && countText ? countText : `PODIUM #${idxLabel}`}
                  </span>
                </div>
              ) : (
                <div className="w-full flex items-center justify-between px-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400">PODIUM #{idxLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};
