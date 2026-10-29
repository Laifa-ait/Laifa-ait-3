import React from "react";
import { ArrowUpRight, Camera } from "lucide-react";
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
      ? "w-16 h-16 @[560px]:w-20 @[560px]:h-20 @[900px]:w-22 @[900px]:h-22"
      : bubbleSize === "lg"
      ? "w-20 h-20 @[560px]:w-24 @[560px]:h-24 @[900px]:w-28 @[900px]:h-28"
      : "w-18 h-18 @[560px]:w-22 @[560px]:h-22 @[900px]:w-26 @[900px]:h-26";

  const ringStyleClass =
    bubbleRing === "none"
      ? "p-1 bg-white border border-slate-200/90 group-hover:border-slate-400 shadow-xs"
      : bubbleRing === "solid"
      ? "p-1 bg-white border-2 border-slate-900 shadow-xs"
      : "p-[2.5px] @[560px]:p-[3px] bg-gradient-to-tr from-[#023859] via-[#54ACBF] to-amber-300 shadow-sm";

  const mobileCols = columnsMobile === 1 ? "grid-cols-2" : columnsMobile === 2 ? "grid-cols-2" : "grid-cols-3";
  const responsiveCols =
    columnsDesktop <= 2
      ? `${mobileCols} @[560px]:grid-cols-2`
      : columnsDesktop === 3
      ? `${mobileCols} @[560px]:grid-cols-3`
      : `${mobileCols} @[560px]:grid-cols-3 @[900px]:grid-cols-4`;

  const isDarkSkin = cardSkin === "dark-glass";

  return (
    <div className={`grid ${responsiveCols} ${gapClass} py-1`}>
      {categories.map((cat, idx) => {
        const photoUrl = resolveCategoryPhoto(cat, idx);
        const countText = getCountLabel(cat);
        const idxLabel = String(idx + 1).padStart(2, "0");
        const isCardSelected =
          isEditable &&
          selectedSectionId === sectionId &&
          selectedSubElement === `category-items:${idx}`;

        return (
          <div
            key={cat.id || idx}
            onClick={(e) => onCardClick(cat, idx, e)}
            className={`group relative flex flex-col items-center text-center cursor-pointer select-none p-2.5 @[560px]:p-3.5 rounded-2xl border transition-all duration-200 ease-out ${
              isDarkSkin
                ? "bg-slate-950 border-white/15 text-white hover:border-white/30"
                : cardSkin === "soft-tint"
                ? "bg-[#F8FAFC] border-slate-200/85 hover:bg-white hover:border-slate-300 shadow-[0_2px_10px_-3px_rgba(15,23,42,0.04)]"
                : "bg-white border-slate-200/85 hover:border-slate-300 shadow-[0_3px_14px_-4px_rgba(15,23,42,0.06)]"
            } ${hoverCardClass} ${isCardSelected ? "ring-2 ring-[#2563EB]" : ""}`}
          >
            <span className="absolute top-2 left-2 @[560px]:top-2.5 @[560px]:left-2.5 text-[9px] @[560px]:text-[10px] font-mono font-bold text-slate-400 tabular-nums">
              {idxLabel}
            </span>

            {/* Sculpted Circular Medallion */}
            <div className={`relative ${showTitle ? "mb-2 @[560px]:mb-3 mt-1" : "my-1"}`}>
              <div
                className={`rounded-full transition-transform duration-200 ease-out group-hover:scale-[1.03] ${sizeDimClass} ${ringStyleClass}`}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 relative flex items-center justify-center ring-2 ring-white">
                  <img
                    src={photoUrl}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover transition-transform duration-300 ease-out ${hoverImgClass}`}
                  />
                </div>
              </div>

              {showBadge && cat.badge && (
                <span
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 z-10 px-2 py-0.5 rounded-full text-[9px] font-semibold text-white shadow-xs whitespace-nowrap border border-white"
                  style={{ backgroundColor: cat.badgeColor || primaryColor }}
                >
                  {cat.badge}
                </span>
              )}

              {isEditable && (
                <button
                  type="button"
                  onClick={(e) => onEditItem(idx, e)}
                  className="absolute -top-1 -right-1 z-20 w-5 h-5 @[560px]:w-6 @[560px]:h-6 rounded-full bg-[#023859] hover:bg-[#011C40] text-white shadow-xs flex items-center justify-center opacity-95 @[560px]:opacity-0 @[560px]:group-hover:opacity-100 transition-opacity duration-150 cursor-pointer border-2 border-white"
                  title="Modifier la photo et le nom de ce rayon"
                >
                  <Camera className="w-2.5 h-2.5 @[560px]:w-3 @[560px]:h-3" />
                </button>
              )}
            </div>

            {showTitle && (
              <div className="w-full flex flex-col items-center">
                <h3
                  className="font-bold text-xs @[560px]:text-sm tracking-tight leading-snug line-clamp-1 px-0.5"
                  style={{
                    color: isDarkSkin ? "#FFFFFF" : textColor,
                  }}
                >
                  {cat.name}
                </h3>

                {showItemCount && countText ? (
                  <span
                    className={`text-[10px] @[560px]:text-[11px] font-medium mt-0.5 line-clamp-1 ${
                      isDarkSkin ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {countText}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-400 group-hover:text-slate-900 mt-0.5 transition-colors">
                    <span>Découvrir</span>
                    <ArrowUpRight className="w-2.5 h-2.5 @[560px]:w-3 @[560px]:h-3" />
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
