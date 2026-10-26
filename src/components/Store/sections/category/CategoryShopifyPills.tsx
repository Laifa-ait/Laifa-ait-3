import React from "react";
import { ChevronRight, Camera } from "lucide-react";
import { CategoryItem } from "../../../../pages/Seller/StoreBuilder/constants/categoryPresetTypes";
import { getLucideCategoryIcon } from "../../../../pages/Seller/StoreBuilder/constants/categoryCanvaOptions";
import { resolveCategoryPhoto } from "./categoryImageHelper";

interface CategoryShopifyPillsProps {
  categories: CategoryItem[];
  cardRadius: string;
  pillShowImage: boolean;
  showBadge: boolean;
  showItemCount: boolean;
  gapClass: string;
  hoverCardClass: string;
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
  showBadge,
  showItemCount,
  gapClass,
  hoverCardClass,
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

  return (
    <div className={`grid grid-cols-1 @xs:grid-cols-2 @md:flex @md:flex-wrap items-center ${gapClass}`}>
      {categories.map((cat, idx) => {
        const IconComp = getLucideCategoryIcon(cat.iconName);
        const photoUrl = resolveCategoryPhoto(cat, idx);
        const countText = getCountLabel(cat);
        const isCardSelected =
          isEditable &&
          selectedSectionId === sectionId &&
          selectedSubElement === `category-items:${idx}`;

        const skinClasses = isDarkSkin
          ? "bg-slate-950 text-white border-white/15 hover:border-white/35 shadow-xs"
          : cardSkin === "soft-tint"
          ? "bg-[#F8FAFC] text-slate-900 border-slate-200/85 hover:bg-white hover:border-slate-300"
          : "bg-white text-slate-900 border border-slate-200/85 hover:border-slate-300 shadow-[0_1px_3px_rgba(15,23,42,0.04)]";

        return (
          <div
            key={cat.id || idx}
            onClick={(e) => onCardClick(cat, idx, e)}
            className={`group relative flex @md:inline-flex items-center justify-between gap-2.5 p-1.5 pr-3 border transition-all duration-200 ease-out cursor-pointer select-none ${pillRadiusClass} ${skinClasses} ${hoverCardClass} ${
              isCardSelected ? "ring-2 ring-[#2563EB] ring-offset-1" : ""
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {pillShowImage ? (
                <div
                  className={`w-10 h-10 @sm:w-11 @sm:h-11 ${avatarRadiusClass} overflow-hidden shrink-0 relative bg-slate-100 ring-1 ring-inset ring-black/[0.06]`}
                >
                  <img
                    src={photoUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className={`w-9 h-9 ${avatarRadiusClass} flex items-center justify-center shrink-0 transition-colors duration-200 ${
                    isDarkSkin
                      ? "bg-white/10 text-white group-hover:bg-white group-hover:text-slate-950"
                      : "bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white"
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                </div>
              )}

              <div className="min-w-0 py-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-xs @sm:text-[13px] tracking-[-0.01em] leading-tight truncate">
                    {cat.name}
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
                {showItemCount && countText && (
                  <span
                    className={`text-[11px] font-medium block truncate mt-0.5 ${
                      isDarkSkin ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {countText}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200 ${
                  isDarkSkin
                    ? "bg-white/10 text-white group-hover:bg-white group-hover:text-slate-950"
                    : "bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white"
                }`}
              >
                <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </div>

              {isEditable && (
                <button
                  type="button"
                  onClick={(e) => onEditItem(idx, e)}
                  className="w-6 h-6 rounded-full bg-[#023859] text-white flex items-center justify-center opacity-95 @sm:opacity-0 @sm:group-hover:opacity-100 transition-opacity duration-150 cursor-pointer shadow-xs"
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
