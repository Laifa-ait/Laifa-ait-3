import React from "react";
import { Camera } from "lucide-react";
import { CategoryItem } from "../../../../pages/Seller/StoreBuilder/constants/categoryPresetTypes";
import { resolveCategoryPhoto } from "./categoryImageHelper";

interface CategoryShopifyStoriesProps {
  categories: CategoryItem[];
  bubbleSize: string;
  bubbleRing: string;
  columnsDesktop: number;
  columnsMobile: number;
  gapClass: string;
  hoverImgClass?: string;
  hoverCardClass?: string;
  showTitle?: boolean;
  showBadge: boolean;
  showItemCount: boolean;
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
}

export const CategoryShopifyStories: React.FC<CategoryShopifyStoriesProps> = ({
  categories,
  bubbleSize,
  bubbleRing,
  columnsDesktop,
  columnsMobile,
  gapClass,
  hoverImgClass = "",
  hoverCardClass = "",
  showTitle = true,
  showBadge,
  showItemCount,
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
}) => {
  const sizeDimClass =
    bubbleSize === "sm"
      ? "w-16 h-16 @sm:w-20 @sm:h-20"
      : bubbleSize === "lg"
      ? "w-24 h-24 @sm:w-28 @sm:h-28"
      : "w-20 h-20 @sm:w-24 @sm:h-24";

  const ringStyleClass =
    bubbleRing === "none"
      ? "p-0.5 bg-white border border-slate-200/90 group-hover:border-slate-400"
      : bubbleRing === "solid"
      ? "p-1 bg-white border-2 border-slate-900 shadow-2xs"
      : cardSkin === "dark-glass"
      ? "p-1 bg-slate-900 border border-white/25 group-hover:border-white/50 shadow-xs"
      : "p-1 bg-white border border-slate-200/95 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.08)] group-hover:border-slate-400";

  const mobileCols = columnsMobile === 2 ? "grid-cols-2" : "grid-cols-3";
  const desktopCols =
    columnsDesktop === 4
      ? "@sm:grid-cols-4"
      : columnsDesktop === 5
      ? "@sm:grid-cols-5"
      : "@sm:grid-cols-4 @md:grid-cols-6";

  const isDarkSkin = cardSkin === "dark-glass";

  return (
    <div className={`grid ${mobileCols} ${desktopCols} ${gapClass} py-2`}>
      {categories.map((cat, idx) => {
        const photoUrl = resolveCategoryPhoto(cat, idx);
        const countText = getCountLabel(cat);
        const isCardSelected =
          isEditable &&
          selectedSectionId === sectionId &&
          selectedSubElement === `category-items:${idx}`;

        return (
          <div
            key={cat.id || idx}
            onClick={(e) => onCardClick(cat, idx, e)}
            className={`group flex flex-col items-center text-center cursor-pointer select-none p-2.5 rounded-2xl transition-all duration-200 ease-out ${
              cardSkin === "framed"
                ? "bg-white border border-slate-200/85 shadow-[0_1px_4px_rgba(15,23,42,0.04)] hover:border-slate-300 py-3.5"
                : isDarkSkin
                ? "bg-slate-950 border border-white/12 text-white py-3.5"
                : cardSkin === "soft-tint"
                ? "bg-[#F8FAFC] border border-slate-200/75 hover:bg-white py-3.5"
                : ""
            } ${hoverCardClass} ${isCardSelected ? "ring-2 ring-[#2563EB]" : ""}`}
          >
            {/* Circular Medallion */}
            <div className={`relative ${showTitle ? "mb-2.5" : ""}`}>
              <div
                className={`rounded-full transition-colors duration-200 ease-out ${sizeDimClass} ${ringStyleClass}`}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 relative flex items-center justify-center ring-1 ring-inset ring-black/[0.05]">
                  <img
                    src={photoUrl}
                    alt={cat.name}
                    className={`w-full h-full object-cover transition-transform duration-200 ease-out ${hoverImgClass}`}
                  />
                </div>
              </div>

              {showBadge && cat.badge && (
                <span
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-10 px-2 py-0.5 rounded-full text-[9px] font-semibold text-white shadow-2xs whitespace-nowrap border border-white"
                  style={{ backgroundColor: cat.badgeColor || primaryColor }}
                >
                  {cat.badge}
                </span>
              )}

              {isEditable && (
                <button
                  type="button"
                  onClick={(e) => onEditItem(idx, e)}
                  className="absolute -top-1 -right-1 z-20 w-6 h-6 rounded-full bg-[#023859] hover:bg-[#011C40] text-white shadow-xs flex items-center justify-center opacity-95 @sm:opacity-0 @sm:group-hover:opacity-100 transition-opacity duration-150 cursor-pointer border-2 border-white"
                  title="Modifier la photo et le nom de ce rayon"
                >
                  <Camera className="w-3 h-3" />
                </button>
              )}
            </div>

            {showTitle && (
              <>
                <h3
                  className="font-semibold text-xs @sm:text-[13px] tracking-[-0.01em] leading-snug line-clamp-2 px-1"
                  style={{
                    color: isDarkSkin ? "#FFFFFF" : textColor,
                  }}
                >
                  {cat.name}
                </h3>

                {showItemCount && countText && (
                  <span
                    className={`text-[11px] font-medium mt-0.5 line-clamp-1 ${
                      isDarkSkin ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {countText}
                  </span>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
