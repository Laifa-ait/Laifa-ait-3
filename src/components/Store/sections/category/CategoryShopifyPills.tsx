import React from "react";
import { ArrowUpRight, Camera } from "lucide-react";
import {
  CategoryItem,
  CategoryCardSize,
} from "../../../../pages/Seller/StoreBuilder/constants/categoryPresetTypes";
import { getLucideCategoryIcon } from "../../../../pages/Seller/StoreBuilder/constants/categoryCanvaOptions";
import { resolveCategoryPhoto } from "./categoryImageHelper";

interface CategoryShopifyPillsProps {
  categories: CategoryItem[];
  cardRadius: string;
  pillShowImage: boolean;
  showTitle?: boolean;
  showBadge: boolean;
  showItemCount: boolean;
  gapClass: string;
  hoverCardClass: string;
  cardSize?: CategoryCardSize;
  cardSkin?: string;
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
  cardRadius,
  pillShowImage,
  showTitle = true,
  showBadge,
  showItemCount,
  gapClass,
  hoverCardClass,
  cardSize = "balanced",
  cardSkin = "editorial",
  primaryColor = "#023859",
  isEditable,
  selectedSectionId,
  selectedSubElement,
  sectionId,
  getCountLabel,
  onCardClick,
  onEditItem,
}) => {
  const pillRadiusClass =
    cardRadius === "none"
      ? "rounded-none"
      : cardRadius === "sm"
      ? "rounded-xl"
      : cardRadius === "md" || cardRadius === "lg"
      ? "rounded-2xl"
      : "rounded-full";

  const avatarRadiusClass =
    cardRadius === "none"
      ? "rounded-none"
      : cardRadius === "sm" || cardRadius === "md" || cardRadius === "lg"
      ? "rounded-xl"
      : "rounded-full";

  const isDarkSkin = cardSkin === "dark-glass";
  const mobilePillCols = cardSize === "compact" ? "grid-cols-2" : "grid-cols-1";

  return (
    <div className={`grid ${mobilePillCols} @[560px]:grid-cols-2 @[900px]:grid-cols-3 ${gapClass}`}>
      {categories.map((cat, idx) => {
        const IconComp = getLucideCategoryIcon(cat.iconName);
        const photoUrl = resolveCategoryPhoto(cat, idx);
        const countText = getCountLabel(cat);
        const idxLabel = String(idx + 1).padStart(2, "0");
        const isCardSelected =
          isEditable &&
          selectedSectionId === sectionId &&
          selectedSubElement === `category-items:${idx}`;

        const skinClasses = isDarkSkin
          ? "bg-slate-950 text-white border-white/15 hover:border-white/35 shadow-sm"
          : cardSkin === "soft-tint"
          ? "bg-[#F8FAFC] text-slate-900 border-slate-200/90 hover:bg-white hover:border-slate-300 shadow-[0_2px_8px_-3px_rgba(15,23,42,0.04)]"
          : "bg-white text-slate-900 border-slate-200/90 hover:border-slate-300 shadow-[0_3px_12px_-4px_rgba(15,23,42,0.06)]";

        return (
          <div
            key={cat.id || idx}
            onClick={(e) => onCardClick(cat, idx, e)}
            className={`group relative flex items-center justify-between gap-2.5 p-2 pr-3 border transition-all duration-200 ease-out cursor-pointer select-none ${pillRadiusClass} ${skinClasses} ${hoverCardClass} ${
              isCardSelected ? "ring-2 ring-[#2563EB] ring-offset-1" : ""
            }`}
          >
            <div className="flex items-center gap-2.5 @[560px]:gap-3 min-w-0">
              {pillShowImage ? (
                <div
                  className={`w-11 h-11 @[560px]:w-12 @[560px]:h-12 ${avatarRadiusClass} overflow-hidden shrink-0 relative bg-slate-100 ring-1 ring-inset ring-black/[0.06]`}
                >
                  <img
                    src={photoUrl}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div
                  className={`w-10 h-10 @[560px]:w-11 @[560px]:h-11 ${avatarRadiusClass} flex items-center justify-center shrink-0 transition-colors duration-200 ${
                    isDarkSkin
                      ? "bg-white/10 text-white group-hover:bg-white group-hover:text-slate-950"
                      : "bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white"
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                </div>
              )}

              {showTitle && (
                <div className="min-w-0 py-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] @[560px]:text-[10px] font-mono font-bold text-slate-400 tabular-nums">
                      {idxLabel}
                    </span>
                    {showBadge && cat.badge && (
                      <span
                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full text-white shrink-0"
                        style={{ backgroundColor: cat.badgeColor || primaryColor }}
                      >
                        {cat.badge}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-xs @[560px]:text-sm tracking-tight leading-tight block truncate mt-0.5">
                    {cat.name}
                  </span>
                  {showItemCount && countText && (
                    <span
                      className={`text-[10px] @[560px]:text-[11px] font-medium block truncate mt-0.5 ${
                        isDarkSkin ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {countText}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className={`w-6 h-6 @[560px]:w-7 @[560px]:h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                  isDarkSkin
                    ? "bg-white/15 text-white group-hover:bg-white group-hover:text-slate-950"
                    : "bg-slate-900 text-white group-hover:scale-105"
                }`}
              >
                <ArrowUpRight className="w-3 h-3 @[560px]:w-3.5 @[560px]:h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>

              {isEditable && (
                <button
                  type="button"
                  onClick={(e) => onEditItem(idx, e)}
                  className="w-6 h-6 rounded-full bg-[#023859] text-white flex items-center justify-center opacity-95 @[560px]:opacity-0 @[560px]:group-hover:opacity-100 transition-opacity duration-150 cursor-pointer shadow-xs"
                  title="Modifier ce rayon"
                >
                  <Camera className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
