import React from "react";
import { Camera, ChevronRight } from "lucide-react";
import {
  CategoryItem,
  CategoryCardSize,
} from "../../../../pages/Seller/StoreBuilder/constants/categoryPresetTypes";
import { resolveCategoryPhoto } from "./categoryImageHelper";

interface CategoryShopifyBentoProps {
  categories: CategoryItem[];
  cardRadiusClass: string;
  hoverImgClass: string;
  hoverCardClass: string;
  overlayOpacity: number;
  glassmorphism: boolean;
  showTitle?: boolean;
  showBadge: boolean;
  showItemCount: boolean;
  gapClass: string;
  cardSize?: CategoryCardSize;
  cardSkin?: string;
  primaryColor?: string;
  previewViewport?: "mobile" | "tablet" | "desktop";
  isEditable?: boolean;
  selectedSectionId?: string | null;
  selectedSubElement?: string | null;
  sectionId: string;
  getCountLabel: (cat: CategoryItem) => string;
  onCardClick: (cat: CategoryItem, idx: number, e: React.MouseEvent) => void;
  onEditItem: (idx: number, e: React.MouseEvent) => void;
  onOpenPage: (cat: CategoryItem, e: React.MouseEvent) => void;
}

export const CategoryShopifyBento: React.FC<CategoryShopifyBentoProps> = ({
  categories,
  cardRadiusClass,
  hoverImgClass,
  hoverCardClass,
  overlayOpacity,
  glassmorphism,
  showTitle = true,
  showBadge,
  showItemCount,
  gapClass,
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
  onOpenPage,
}) => {
  const safeRadiusClass =
    cardRadiusClass === "rounded-full" || cardRadiusClass === "rounded-3xl"
      ? "rounded-2xl"
      : cardRadiusClass;

  const autoRowClass =
    cardSize === "compact"
      ? "@md:auto-rows-[165px]"
      : cardSize === "large"
      ? "@md:auto-rows-[235px]"
      : "@md:auto-rows-[195px]";

  const heroMinH =
    cardSize === "compact"
      ? "min-h-[160px] @sm:min-h-[195px] @md:min-h-full"
      : cardSize === "large"
      ? "min-h-[220px] @sm:min-h-[260px] @md:min-h-full"
      : "min-h-[185px] @sm:min-h-[220px] @md:min-h-full";

  const cellMinH =
    cardSize === "compact"
      ? "min-h-[135px] @sm:min-h-[160px] @md:min-h-full"
      : cardSize === "large"
      ? "min-h-[185px] @sm:min-h-[215px] @md:min-h-full"
      : "min-h-[155px] @sm:min-h-[185px] @md:min-h-full";

  return (
    <div className={`grid grid-cols-2 @md:grid-cols-4 ${autoRowClass} ${gapClass}`}>
      {categories.map((cat, idx) => {
        const photoUrl = resolveCategoryPhoto(cat, idx);
        const isHero = idx === 0 || cat.colSpan === 2;
        const isWideSecondary = idx > 0 && categories.length === 3 && idx === 2;
        const isCardSelected =
          isEditable &&
          selectedSectionId === sectionId &&
          selectedSubElement === `category-items:${idx}`;

        const spanClass = isHero
          ? `col-span-2 @md:col-span-2 @md:row-span-2 ${heroMinH}`
          : isWideSecondary
          ? `col-span-2 @md:col-span-2 ${cellMinH}`
          : `col-span-1 ${cellMinH}`;

        const countText = getCountLabel(cat);

        return (
          <article
            key={cat.id || idx}
            onClick={(e) => onCardClick(cat, idx, e)}
            className={`group relative overflow-hidden cursor-pointer select-none transition-all duration-200 ease-out border ${
              cardSkin === "dark-glass"
                ? "border-white/15 bg-slate-950 shadow-xs"
                : cardSkin === "framed"
                ? "border-slate-200/95 bg-white p-1.5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.05)]"
                : "border-slate-200/80 bg-slate-100 shadow-[0_1px_4px_rgba(15,23,42,0.04)]"
            } ${safeRadiusClass} ${spanClass} ${hoverCardClass} ${
              isCardSelected ? "ring-2 ring-[#2563EB] ring-offset-2" : ""
            }`}
          >
            <div
              className={`relative w-full h-full overflow-hidden ${
                cardSkin === "framed" ? "rounded-xl" : ""
              }`}
            >
              <img
                src={photoUrl}
                alt={cat.name}
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-200 ease-out ${hoverImgClass}`}
              />

              <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/[0.06]" />

              {showTitle && (
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                  style={{
                    background: `linear-gradient(180deg, rgba(15,23,42,0) 38%, rgba(10,15,29,${Math.min(
                      0.82,
                      overlayOpacity + 0.32
                    )}) 100%)`,
                  }}
                />
              )}

              {showBadge && cat.badge && (
                <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                  <span
                    className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold tracking-wide text-white shadow-2xs"
                    style={{ backgroundColor: cat.badgeColor || primaryColor }}
                  >
                    {cat.badge}
                  </span>
                </div>
              )}

              {isEditable && (
                <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-95 @sm:opacity-0 @sm:group-hover:opacity-100 transition-opacity duration-150">
                  <button
                    type="button"
                    onClick={(e) => onEditItem(idx, e)}
                    className="bg-[#023859] hover:bg-[#011C40] text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-xs flex items-center gap-1 cursor-pointer border border-white/20"
                  >
                    <Camera className="w-2.5 h-2.5" />
                    <span>Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => onOpenPage(cat, e)}
                    className="bg-slate-900/90 hover:bg-slate-950 text-white text-[9px] font-bold px-1.5 py-1 rounded-md shadow-xs cursor-pointer border border-white/15"
                  >
                    Page →
                  </button>
                </div>
              )}

              {showTitle && (
                <div className="absolute inset-x-0 bottom-0 p-3 @sm:p-4 z-10 flex flex-col justify-end">
                  <div
                    className={
                      glassmorphism
                        ? "bg-white/92 backdrop-blur-md text-slate-900 border border-white/70 rounded-xl px-3.5 py-2.5 shadow-xs flex items-center justify-between gap-2"
                        : "flex items-end justify-between gap-2"
                    }
                  >
                    <div className="min-w-0">
                      <h3
                        className={`font-semibold tracking-[-0.01em] leading-snug line-clamp-1 ${
                          glassmorphism ? "text-slate-900" : "text-white"
                        } ${
                          isHero
                            ? "text-sm @sm:text-base @md:text-lg"
                            : "text-[13px] @sm:text-sm @md:text-[15px]"
                        }`}
                      >
                        {cat.name}
                      </h3>
                      {showItemCount && countText && (
                        <p
                          className={`text-[11px] font-medium line-clamp-1 mt-0.5 ${
                            glassmorphism ? "text-slate-500" : "text-white/80"
                          }`}
                        >
                          {countText}
                        </p>
                      )}
                    </div>

                    <span
                      className={`w-6 h-6 @sm:w-7 @sm:h-7 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200 ${
                        glassmorphism
                          ? "bg-slate-900/8 text-slate-800 group-hover:bg-slate-900 group-hover:text-white"
                          : "bg-white/20 text-white border border-white/25 group-hover:bg-white group-hover:text-slate-900"
                      }`}
                    >
                      <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};
