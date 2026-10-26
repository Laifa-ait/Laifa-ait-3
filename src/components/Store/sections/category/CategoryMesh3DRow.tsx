import React, { RefObject } from "react";
import { ChevronRight, Camera } from "lucide-react";
import {
  CategoryItem,
  CategoryCardSize,
} from "../../../../pages/Seller/StoreBuilder/constants/categoryPresetTypes";
import { resolveCategoryPhoto } from "./categoryImageHelper";

interface CategoryMesh3DRowProps {
  categories: CategoryItem[];
  carouselRef: RefObject<HTMLDivElement | null>;
  cardSize?: CategoryCardSize;
  cardSkin?: string;
  cardRadiusClass?: string;
  hoverImgClass?: string;
  hoverCardClass?: string;
  showTitle?: boolean;
  showBadge?: boolean;
  showItemCount?: boolean;
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
  cardSize = "balanced",
  cardSkin = "editorial",
  cardRadiusClass = "rounded-2xl",
  hoverImgClass = "",
  hoverCardClass = "",
  showTitle = true,
  showBadge = false,
  showItemCount = false,
  primaryColor = "#023859",
  textColor = "#0F172A",
  isEditable,
  selectedSectionId,
  selectedSubElement,
  sectionId,
  getCountLabel,
  onEditItem,
  onNavigate,
}) => {
  const safeRadiusClass =
    cardRadiusClass === "rounded-full" || cardRadiusClass === "rounded-3xl"
      ? "rounded-2xl"
      : cardRadiusClass;

  const heightClass =
    cardSize === "compact"
      ? "h-[104px] @sm:h-[114px]"
      : cardSize === "large"
      ? "h-[138px] @sm:h-[152px]"
      : "h-[118px] @sm:h-[130px]";

  const thumbWidthClass =
    cardSize === "compact"
      ? "w-[92px] @sm:w-[106px]"
      : cardSize === "large"
      ? "w-[126px] @sm:w-[148px]"
      : "w-[108px] @sm:w-[124px]";

  const gridColsClass =
    categories.length === 1
      ? "grid-cols-1 max-w-md"
      : categories.length === 2
      ? "grid-cols-1 @sm:grid-cols-2"
      : "grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3";

  const isDarkSkin = cardSkin === "dark-glass";

  return (
    <div ref={carouselRef} className={`grid ${gridColsClass} gap-3 @sm:gap-4 w-full`}>
      {categories.map((cat, idx) => {
        const photoUrl = resolveCategoryPhoto(cat, idx);
        const countText = getCountLabel
          ? getCountLabel(cat)
          : cat.itemCount !== undefined && cat.itemCount !== ""
          ? `${cat.itemCount} articles`
          : cat.subtitle || "";

        const isCardSelected =
          isEditable &&
          Boolean(sectionId) &&
          selectedSectionId === sectionId &&
          selectedSubElement === `category-items:${idx}`;

        const skinClass = isDarkSkin
          ? "bg-slate-950 border border-white/12 text-white shadow-xs hover:border-white/25"
          : cardSkin === "soft-tint"
          ? "bg-[#F8FAFC] border border-slate-200/85 text-slate-900 hover:bg-white hover:border-slate-300"
          : "bg-white border border-slate-200/85 text-slate-900 shadow-[0_1px_4px_rgba(15,23,42,0.04)] hover:border-slate-300";

        return (
          <article
            key={cat.id || idx}
            onClick={(e) => {
              if (isEditable) {
                onEditItem?.(idx, e);
              } else {
                onNavigate?.(cat, e);
              }
            }}
            className={`group relative flex items-stretch justify-between overflow-hidden transition-all duration-200 ease-out cursor-pointer select-none p-1.5 ${heightClass} ${safeRadiusClass} ${skinClass} ${hoverCardClass} ${
              isCardSelected ? "ring-2 ring-[#2563EB] ring-offset-1" : ""
            }`}
          >
            {showTitle ? (
              <div className="flex-1 min-w-0 px-2.5 py-2 @sm:px-3 @sm:py-2.5 flex flex-col justify-between z-10">
                <div className="space-y-1 min-w-0">
                  {showBadge && cat.badge && (
                    <span
                      className="inline-block text-[9px] font-semibold tracking-wide px-2 py-0.5 rounded-md text-white leading-none"
                      style={{ backgroundColor: cat.badgeColor || primaryColor }}
                    >
                      {cat.badge}
                    </span>
                  )}

                  <h3
                    className={`font-semibold tracking-[-0.01em] leading-snug line-clamp-2 ${
                      cardSize === "compact"
                        ? "text-xs @sm:text-[13px]"
                        : "text-[13px] @sm:text-[15px]"
                    }`}
                    style={{
                      color: isDarkSkin ? "#FFFFFF" : textColor,
                    }}
                  >
                    {cat.name}
                  </h3>

                  {showItemCount && countText && (
                    <p
                      className={`text-[11px] font-medium line-clamp-1 ${
                        isDarkSkin ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {countText}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200 ${
                      isDarkSkin
                        ? "bg-white/10 text-white group-hover:bg-white group-hover:text-slate-950"
                        : "bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white"
                    }`}
                  >
                    <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                  <span
                    className={`text-[11px] font-medium ${
                      isDarkSkin ? "text-slate-300" : "text-slate-500 group-hover:text-slate-900"
                    } transition-colors duration-200`}
                  >
                    Explorer
                  </span>
                </div>
              </div>
            ) : null}

            {/* Framed Right Studio Thumbnail */}
            <div
              className={`relative ${
                showTitle ? thumbWidthClass : "w-full"
              } shrink-0 h-full overflow-hidden rounded-xl bg-slate-100 ring-1 ring-inset ring-black/[0.05]`}
            >
              <img
                src={photoUrl}
                alt={cat.name}
                className={`w-full h-full object-cover transition-transform duration-200 ease-out ${hoverImgClass}`}
              />

              {isEditable && (
                <div className="absolute top-1.5 right-1.5 z-20 flex items-center gap-1 opacity-95 @sm:opacity-0 @sm:group-hover:opacity-100 transition-opacity duration-150">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditItem?.(idx, e);
                    }}
                    className="bg-[#023859] hover:bg-[#011C40] text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-xs flex items-center gap-1 cursor-pointer border border-white/20"
                  >
                    <Camera className="w-2.5 h-2.5" />
                    <span>Photo</span>
                  </button>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};
