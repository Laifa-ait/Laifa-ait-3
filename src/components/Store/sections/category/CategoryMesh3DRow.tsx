import React, { RefObject } from "react";
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
  resolveOuterAndMediaRadius,
  resolveCategoryActiveCols,
} from "./categoryResponsiveHelper";

interface CategoryMesh3DRowProps {
  categories: CategoryItem[];
  carouselRef: RefObject<HTMLDivElement | null>;
  columnsDesktop?: number;
  columnsTablet?: number;
  columnsMobile?: number;
  previewViewport?: CategoryDeviceViewport;
  cardSize?: CategoryCardSize;
  cardSkin?: string;
  cardRadius?: string;
  cardRadiusClass?: string;
  hoverImgClass?: string;
  hoverCardClass?: string;
  showTitle?: boolean;
  showBadge?: boolean;
  showItemCount?: boolean;
  imagePosition?: CategoryImagePosition;
  imageFit?: CategoryImageFit;
  primaryColor?: string;
  textColor?: string;
  isEditable?: boolean;
  selectedSectionId?: string | null;
  selectedSubElement?: string | null;
  sectionId?: string;
  getCountLabel?: (cat: CategoryItem) => string;
  onEditItem?: (index: number, e?: React.MouseEvent) => void;
  onNavigate?: (category: CategoryItem, e?: React.MouseEvent) => void;
}

export const CategoryMesh3DRow: React.FC<CategoryMesh3DRowProps> = ({
  categories,
  carouselRef,
  columnsDesktop = 2,
  columnsTablet = 1,
  columnsMobile = 1,
  previewViewport = "desktop",
  cardSize = "balanced",
  cardSkin = "editorial",
  cardRadius = "md",
  hoverImgClass = "",
  hoverCardClass = "",
  showTitle = true,
  showBadge = false,
  showItemCount = false,
  imagePosition = "center",
  imageFit = "cover",
  primaryColor = "#0F172A",
  textColor = "#0F172A",
  isEditable,
  selectedSectionId,
  selectedSubElement,
  sectionId,
  getCountLabel,
  onEditItem,
  onNavigate,
}) => {
  const { outerRadiusClass } = resolveOuterAndMediaRadius(
    cardRadius === "full" ? "lg" : cardRadius
  );

  // RÈGLE 2.7 : Split Studio -> Desktop: 1 ou 2 col. (160/200/240px) ; Tablette & Mobile: 1 col. empilée (140px sur mobile)
  const activeCols = resolveCategoryActiveCols(
    columnsDesktop,
    columnsMobile,
    previewViewport,
    columnsTablet,
    "mesh-3d"
  );
  const gridColsClass = activeCols === 2 ? "grid-cols-2" : "grid-cols-1";

  const heightClass =
    previewViewport === "mobile"
      ? "h-[140px]"
      : previewViewport === "tablet"
      ? cardSize === "compact"
        ? "h-[150px]"
        : cardSize === "large"
        ? "h-[190px]"
        : "h-[168px]"
      : cardSize === "compact"
      ? "h-[160px]"
      : cardSize === "large"
      ? "h-[240px]"
      : "h-[200px]";

  const isDarkSkin = cardSkin === "dark-glass";

  return (
    <div ref={carouselRef} className={`grid ${gridColsClass} gap-3.5 w-full`} data-category-model="mesh-3d">
      {categories.map((cat, idx) => {
        const photoUrl = resolveCategoryPhoto(cat, idx);
        const { posClass, fitClass } = resolveCategoryImageClasses(cat, imagePosition, imageFit);
        const idxLabel = String(idx + 1).padStart(2, "0");
        const countText = getCountLabel
          ? getCountLabel(cat)
          : cat.itemCount !== undefined && cat.itemCount !== ""
          ? `${cat.itemCount} articles`
          : cat.subtitle || "";

        const spanClass = "col-span-1";
        const isCardSelected =
          isEditable &&
          Boolean(sectionId) &&
          selectedSectionId === sectionId &&
          selectedSubElement === `category-items:${idx}`;

        const skinClass = isDarkSkin
          ? "bg-slate-950 border border-white/15 text-white shadow-sm"
          : cardSkin === "soft-tint"
          ? "bg-[#F8FAFC] border border-slate-200/90 text-slate-900 shadow-2xs"
          : "bg-white border border-slate-200/95 text-slate-900 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.07)]";

        return (
          <article
            key={cat.id || idx}
            onClick={(e) => {
              if (isEditable) onEditItem?.(idx, e);
              else onNavigate?.(cat, e);
            }}
            className={`group relative grid grid-cols-12 items-stretch overflow-hidden transition-all duration-300 ease-out cursor-pointer select-none ${heightClass} ${outerRadiusClass} ${skinClass} ${spanClass} ${hoverCardClass} ${
              isCardSelected ? "ring-2 ring-[#2563EB] ring-offset-1" : ""
            }`}
          >
            {/* Panneau gauche éditorial uni (col-span-5) */}
            <div className={`col-span-5 min-w-0 p-3 @[768px]:p-4 flex flex-col justify-between z-10 border-r ${isDarkSkin ? "border-white/10 bg-slate-950" : "border-slate-100 bg-slate-50"}`}>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono font-extrabold tracking-wider uppercase text-slate-400">
                    SPLIT #{idxLabel}
                  </span>
                  {showBadge && cat.badge && (
                    <span
                      className="inline-block text-[9px] font-semibold tracking-wide px-2 py-0.5 rounded-sm text-white leading-none truncate max-w-[85px]"
                      style={{ backgroundColor: cat.badgeColor || primaryColor }}
                    >
                      {cat.badge}
                    </span>
                  )}
                </div>

                <h3
                  className={`font-bold tracking-tight leading-snug line-clamp-2 ${
                    cardSize === "large" ? "text-sm @[768px]:text-lg" : "text-xs @[768px]:text-base"
                  }`}
                  style={{ color: isDarkSkin ? "#FFFFFF" : textColor }}
                >
                  {showTitle ? cat.name : `Collection N° ${idxLabel}`}
                </h3>

                {showTitle && (
                  <p className={`text-[10px] @[768px]:text-[11px] font-medium line-clamp-1 ${isDarkSkin ? "text-slate-400" : "text-slate-500"}`}>
                    {showItemCount && countText ? countText : cat.subtitle || "Sélection Studio"}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                    isDarkSkin
                      ? "bg-white/15 text-white group-hover:bg-white group-hover:text-slate-950"
                      : "bg-slate-900 text-white group-hover:bg-slate-800"
                  }`}
                >
                  <span>Explorer</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* Image produit/collection à droite (col-span-7) */}
            <div className="col-span-7 relative h-full overflow-hidden bg-slate-100">
              <img
                src={photoUrl}
                alt={cat.name}
                referrerPolicy="no-referrer"
                onError={(e) => handleCategoryImageError(e, idx)}
                className={`w-full h-full ${posClass} ${fitClass} transition-transform duration-500 ease-out ${hoverImgClass}`}
              />
              {isEditable && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditItem?.(idx, e);
                  }}
                  className="absolute top-2 right-2 z-20 bg-slate-900/90 hover:bg-slate-950 text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-xs flex items-center gap-1 cursor-pointer border border-white/20"
                >
                  <Camera className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};
