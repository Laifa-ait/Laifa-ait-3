import React, { RefObject } from "react";
import { ArrowUpRight, Camera } from "lucide-react";
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
      ? "h-[112px] @[560px]:h-[124px] @[900px]:h-[130px]"
      : cardSize === "large"
      ? "h-[136px] @[560px]:h-[154px] @[900px]:h-[168px]"
      : "h-[122px] @[560px]:h-[138px] @[900px]:h-[148px]";

  const thumbWidthClass =
    cardSize === "compact"
      ? "w-[40%] max-w-[125px] @[560px]:w-[42%]"
      : cardSize === "large"
      ? "w-[44%] max-w-[165px] @[560px]:w-[46%]"
      : "w-[42%] max-w-[145px] @[560px]:w-[44%]";

  const gridColsClass =
    categories.length === 1
      ? "grid-cols-1 max-w-md"
      : categories.length === 2
      ? "grid-cols-1 @[560px]:grid-cols-2"
      : "grid-cols-1 @[560px]:grid-cols-2 @[900px]:grid-cols-3";

  const isDarkSkin = cardSkin === "dark-glass";

  return (
    <div ref={carouselRef} className={`grid ${gridColsClass} gap-2.5 @[560px]:gap-3.5 @[900px]:gap-4 w-full`}>
      {categories.map((cat, idx) => {
        const photoUrl = resolveCategoryPhoto(cat, idx);
        const idxLabel = String(idx + 1).padStart(2, "0");
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
          ? "bg-slate-950 border border-white/15 text-white shadow-sm hover:border-white/30"
          : cardSkin === "soft-tint"
          ? "bg-[#F8FAFC] border border-slate-200/90 text-slate-900 hover:bg-white hover:border-slate-300 shadow-[0_2px_10px_-3px_rgba(15,23,42,0.05)]"
          : "bg-white border border-slate-200/90 text-slate-900 shadow-[0_3px_14px_-4px_rgba(15,23,42,0.06)] hover:border-slate-300";

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
            className={`group relative flex items-stretch justify-between overflow-hidden transition-all duration-200 ease-out cursor-pointer select-none p-1.5 @[560px]:p-2 ${heightClass} ${safeRadiusClass} ${skinClass} ${hoverCardClass} ${
              isCardSelected ? "ring-2 ring-[#2563EB] ring-offset-1" : ""
            }`}
          >
            {/* Subtle Editorial Watermark Number to eliminate middle empty space */}
            <span
              aria-hidden="true"
              className={`pointer-events-none select-none absolute left-[36%] bottom-1 font-mono font-black text-4xl @[560px]:text-5xl leading-none tracking-tighter ${
                isDarkSkin ? "text-white/[0.04]" : "text-slate-900/[0.04]"
              }`}
            >
              {idxLabel}
            </span>

            {showTitle ? (
              <div className="flex-1 min-w-0 px-2.5 py-1.5 @[560px]:px-3 @[560px]:py-2 flex flex-col justify-between z-10">
                <div className="space-y-0.5 @[560px]:space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] @[560px]:text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                      N° {idxLabel}
                    </span>
                    {showBadge && cat.badge && (
                      <span
                        className="inline-block text-[9px] font-semibold tracking-wide px-2 py-0.5 rounded-full text-white leading-none truncate max-w-[90px]"
                        style={{ backgroundColor: cat.badgeColor || primaryColor }}
                      >
                        {cat.badge}
                      </span>
                    )}
                  </div>

                  <h3
                    className={`font-bold tracking-tight leading-snug line-clamp-2 ${
                      cardSize === "compact"
                        ? "text-xs @[560px]:text-sm"
                        : "text-xs @[560px]:text-sm @[900px]:text-base"
                    }`}
                    style={{
                      color: isDarkSkin ? "#FFFFFF" : textColor,
                    }}
                  >
                    {cat.name}
                  </h3>

                  <p
                    className={`text-[10px] @[560px]:text-[11px] font-medium line-clamp-1 ${
                      isDarkSkin ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {showItemCount && countText ? countText : "Sélection Boutique"}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 @[560px]:py-1 rounded-full text-[10px] @[560px]:text-[11px] font-semibold transition-all duration-200 ${
                      isDarkSkin
                        ? "bg-white/10 text-white group-hover:bg-white group-hover:text-slate-950"
                        : "bg-slate-100 text-slate-800 group-hover:bg-slate-900 group-hover:text-white"
                    }`}
                  >
                    <span>Explorer</span>
                    <ArrowUpRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </div>
            ) : null}

            {/* Sculpted Right Studio Frame */}
            <div
              className={`relative ${
                showTitle ? thumbWidthClass : "w-full"
              } shrink-0 h-full overflow-hidden rounded-xl bg-slate-100 ring-1 ring-inset ring-black/[0.06]`}
            >
              <img
                src={photoUrl}
                alt={cat.name}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-transform duration-300 ease-out ${hoverImgClass}`}
              />

              {isEditable && (
                <div className="absolute top-1.5 right-1.5 z-20 flex items-center gap-1 opacity-95 @[560px]:opacity-0 @[560px]:group-hover:opacity-100 transition-opacity duration-150">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditItem?.(idx, e);
                    }}
                    className="bg-[#023859] hover:bg-[#011C40] text-white text-[9px] font-bold px-1.5 py-1 rounded-md shadow-xs flex items-center gap-1 cursor-pointer border border-white/20"
                  >
                    <Camera className="w-2.5 h-2.5" />
                    <span className="hidden @[560px]:inline">Photo</span>
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
