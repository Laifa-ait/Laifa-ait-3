import React, { useState } from "react";
import { ArrowUpRight, Camera, ChevronRight } from "lucide-react";
import {
  CategoryItem,
  CategoryCardSize,
  CategoryImagePosition,
  CategoryImageFit,
} from "../../../../pages/Seller/StoreBuilder/constants/categoryPresetTypes";
import {
  resolveCategoryPhoto,
  resolveCategoryImageClasses,
  handleCategoryImageError,
} from "./categoryImageHelper";
import { resolveOuterAndMediaRadius } from "./categoryResponsiveHelper";

interface CategoryEditorialModelsProps {
  categories: CategoryItem[];
  layout: "accordion" | "arch" | "polaroid" | "magazine";
  containerGridColsClass: string;
  gapClass: string;
  aspectRatioClass?: string;
  cardRadius?: string;
  hoverImgClass: string;
  hoverCardClass: string;
  textPosition?: string;
  overlayOpacity?: number;
  glassmorphism?: boolean;
  showTitle?: boolean;
  showBadge: boolean;
  showItemCount: boolean;
  cardSize?: CategoryCardSize;
  cardSkin?: string;
  imagePosition?: CategoryImagePosition;
  imageFit?: CategoryImageFit;
  textColor?: string;
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

export const CategoryEditorialModels: React.FC<CategoryEditorialModelsProps> = ({
  categories,
  layout,
  containerGridColsClass,
  gapClass,
  aspectRatioClass = "aspect-[4/5]",
  cardRadius = "md",
  hoverImgClass,
  hoverCardClass,
  textPosition = "below",
  overlayOpacity = 0.4,
  glassmorphism = false,
  showTitle = true,
  showBadge,
  showItemCount,
  cardSize = "balanced",
  cardSkin = "editorial",
  imagePosition = "center",
  imageFit = "cover",
  textColor = "#0F172A",
  primaryColor = "#023859",
  previewViewport = "desktop",
  isEditable,
  selectedSectionId,
  selectedSubElement,
  sectionId,
  getCountLabel,
  onCardClick,
  onEditItem,
}) => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const isDarkSkin = cardSkin === "dark-glass";
  const isMobileSim = previewViewport === "mobile";
  const { outerRadiusClass, mediaRadiusClass } = resolveOuterAndMediaRadius(cardRadius === "full" ? "lg" : cardRadius);

  if (layout === "accordion") {
    const heightScaleClass =
      cardSize === "compact"
        ? "@[560px]:h-[230px] @[900px]:h-[275px]"
        : cardSize === "large"
        ? "@[560px]:h-[310px] @[900px]:h-[380px]"
        : "@[560px]:h-[270px] @[900px]:h-[330px]";
    const rowModeClass = isMobileSim ? "flex-col" : `flex-col @[560px]:flex-row ${heightScaleClass}`;

    return (
      <div className={`flex ${rowModeClass} gap-2.5 @[560px]:gap-3 w-full`}>
        {categories.map((cat, idx) => {
          const photoUrl = resolveCategoryPhoto(cat, idx);
          const { posClass, fitClass } = resolveCategoryImageClasses(cat, imagePosition, imageFit);
          const countText = getCountLabel(cat);
          const isExpanded = activeIdx === idx;
          const idxLabel = String(idx + 1).padStart(2, "0");

          return (
            <article
              key={cat.id || idx}
              onMouseEnter={() => setActiveIdx(idx)}
              onClick={(e) => {
                if (!isExpanded) { e.stopPropagation(); setActiveIdx(idx); return; }
                onCardClick(cat, idx, e);
              }}
              className={`group relative overflow-hidden ${outerRadiusClass} cursor-pointer select-none border ${
                isDarkSkin ? "border-white/20 bg-slate-950" : "border-slate-200/80 bg-slate-900"
              } transition-all duration-300 ease-out ${
                isExpanded ? "h-[205px] @[560px]:h-auto @[560px]:flex-[3.4] shadow-md" : "h-[112px] @[560px]:h-auto @[560px]:flex-[0.95] opacity-95 hover:opacity-100"
              }`}
            >
              <img src={photoUrl} alt={cat.name} referrerPolicy="no-referrer" onError={(e) => handleCategoryImageError(e, idx)} className={`absolute inset-0 w-full h-full ${posClass} ${fitClass} transition-transform duration-500 ease-out ${isExpanded ? "scale-[1.03]" : "scale-100"}`} />
              <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(15,23,42,0.1) 15%, rgba(10,15,29,${Math.min(0.88, overlayOpacity + 0.35)}) 100%)` }} />
              <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/30 text-[10px] font-mono font-bold text-white">{idxLabel}</span>
                {showBadge && cat.badge && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white" style={{ backgroundColor: cat.badgeColor || primaryColor }}>{cat.badge}</span>}
              </div>
              {isEditable && (
                <button type="button" onClick={(e) => onEditItem(idx, e)} className="absolute top-2.5 right-2.5 z-20 bg-[#023859]/90 text-white text-[9px] font-bold px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer border border-white/20">
                  <Camera className="w-2.5 h-2.5" /><span className="hidden @[560px]:inline">Photo</span>
                </button>
              )}
              {showTitle && (
                <div className="absolute inset-x-2.5 bottom-2.5 z-10">
                  {isExpanded ? (
                    <div className={`rounded-xl backdrop-blur-md border p-2.5 @[560px]:p-3 shadow-xs flex items-center justify-between gap-2 ${isDarkSkin ? "bg-slate-950/88 border-white/20 text-white" : "bg-white/92 border-white/80 text-slate-900"}`}>
                      <div className="min-w-0">
                        <h3 className="font-bold text-xs @[560px]:text-sm @[900px]:text-base tracking-tight truncate">{cat.name}</h3>
                        <p className={`text-[10px] @[560px]:text-[11px] truncate mt-0.5 ${isDarkSkin ? "text-slate-300" : "text-slate-600"}`}>{showItemCount && countText ? countText : cat.subtitle || "Découvrir la sélection"}</p>
                      </div>
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isDarkSkin ? "bg-white text-slate-950" : "bg-slate-900 text-white"}`}><ArrowUpRight className="w-3.5 h-3.5" /></span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 px-1.5 pb-0.5">
                      <span className="font-bold text-xs text-white truncate drop-shadow-xs">{cat.name}</span>
                      <span className="w-6 h-6 rounded-full bg-white/20 border border-white/30 text-white flex items-center justify-center shrink-0 ml-auto"><ArrowUpRight className="w-3 h-3" /></span>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    );
  }

  if (layout === "magazine") {
    const activeCat = categories[activeIdx] || categories[0];
    const activePhoto = activeCat ? resolveCategoryPhoto(activeCat, activeIdx) : "";
    const activeImg = activeCat ? resolveCategoryImageClasses(activeCat, imagePosition, imageFit) : { posClass: "object-center", fitClass: "object-cover" };
    const splitGridClass = isMobileSim ? "grid-cols-1" : "grid-cols-1 @[560px]:grid-cols-12";

    return (
      <div className={`grid ${splitGridClass} gap-3.5 @[560px]:gap-5 items-stretch`}>
        {activeCat && (
          <div onClick={(e) => onCardClick(activeCat, activeIdx, e)} className={`${isMobileSim ? "block h-[195px]" : "h-[195px] @[560px]:h-auto @[560px]:min-h-[260px] @[560px]:col-span-5 @[560px]:order-2"} relative ${outerRadiusClass} overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs cursor-pointer group`}>
            <img src={activePhoto} alt={activeCat.name} referrerPolicy="no-referrer" onError={(e) => handleCategoryImageError(e, activeIdx)} className={`absolute inset-0 w-full h-full ${activeImg.posClass} ${activeImg.fitClass} transition-transform duration-500 group-hover:scale-105`} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            <div className={`absolute inset-x-3 bottom-3 p-2.5 @[560px]:p-3 rounded-xl backdrop-blur-md border flex items-center justify-between gap-2 ${isDarkSkin ? "bg-slate-950/90 border-white/20 text-white" : "bg-white/92 border-white/80 text-slate-900"}`}>
              <div className="min-w-0">
                <span className={`text-[9px] @[560px]:text-[10px] font-mono uppercase tracking-wider block ${isDarkSkin ? "text-slate-400" : "text-slate-500"}`}>Sélection N° {String(activeIdx + 1).padStart(2, "0")}</span>
                {showTitle && <h4 className="text-xs @[560px]:text-sm font-bold truncate">{activeCat.name}</h4>}
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] @[560px]:text-xs font-semibold shrink-0 ${isDarkSkin ? "bg-white text-slate-950" : "bg-slate-900 text-white"}`}>Explorer →</span>
            </div>
          </div>
        )}
        <div className={`${isMobileSim ? "" : "@[560px]:col-span-7 @[560px]:order-1"} ${outerRadiusClass} overflow-hidden border ${isDarkSkin ? "bg-slate-950 border-white/15 divide-y divide-white/10 text-white" : "bg-white border-slate-200/85 divide-y divide-slate-200/80 text-slate-900"}`}>
          {categories.map((cat, idx) => {
            const photoUrl = resolveCategoryPhoto(cat, idx);
            const { posClass, fitClass } = resolveCategoryImageClasses(cat, imagePosition, imageFit);
            const countText = getCountLabel(cat);
            return (
              <div key={cat.id || idx} onMouseEnter={() => setActiveIdx(idx)} onClick={(e) => { setActiveIdx(idx); onCardClick(cat, idx, e); }} className={`group flex items-center justify-between gap-2.5 py-2.5 @[560px]:py-3 px-2.5 @[560px]:px-3.5 transition-colors cursor-pointer ${activeIdx === idx ? (isDarkSkin ? "bg-white/10" : "bg-slate-900/[0.04]") : isDarkSkin ? "hover:bg-white/5" : "hover:bg-slate-50"}`}>
                <div className="flex items-center gap-2.5 @[560px]:gap-3.5 min-w-0">
                  <span className="text-[11px] font-mono font-bold text-slate-400 tabular-nums">{String(idx + 1).padStart(2, "0")}</span>
                  <div className={`w-11 h-11 @[560px]:w-12 @[560px]:h-12 ${mediaRadiusClass} overflow-hidden shrink-0 bg-slate-100 ring-1 ring-black/5`}>
                    <img src={photoUrl} alt={cat.name} referrerPolicy="no-referrer" onError={(e) => handleCategoryImageError(e, idx)} className={`w-full h-full ${posClass} ${fitClass}`} />
                  </div>
                  <div className="min-w-0">
                    {showTitle && <h3 className="text-xs @[560px]:text-sm font-bold tracking-tight truncate">{cat.name}</h3>}
                    {showItemCount && countText && <p className={`text-[10px] @[560px]:text-[11px] truncate ${isDarkSkin ? "text-slate-400" : "text-slate-500"}`}>{countText}</p>}
                  </div>
                </div>
                <span className={`w-7 h-7 @[560px]:w-8 @[560px]:h-8 rounded-full border flex items-center justify-center shrink-0 transition-colors ${isDarkSkin ? "border-white/20 bg-white/10 text-white group-hover:bg-white group-hover:text-slate-950" : "border-slate-200 bg-white group-hover:bg-slate-900 group-hover:text-white"}`}>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const isOverlayTitle = textPosition === "overlay-bottom" || textPosition === "overlay-center";
  return (
    <div className={`grid ${containerGridColsClass} ${gapClass}`}>
      {categories.map((cat, idx) => {
        const photoUrl = resolveCategoryPhoto(cat, idx);
        const { posClass, fitClass } = resolveCategoryImageClasses(cat, imagePosition, imageFit);
        const countText = getCountLabel(cat);
        const idxLabel = String(idx + 1).padStart(2, "0");
        const isCardSelected = isEditable && selectedSectionId === sectionId && selectedSubElement === `category-items:${idx}`;

        if (layout === "arch") {
          return (
            <article key={cat.id || idx} onClick={(e) => onCardClick(cat, idx, e)} className={`group flex flex-col overflow-hidden cursor-pointer select-none transition-all duration-200 rounded-t-[999px] rounded-b-2xl p-1.5 @[560px]:p-2 ${isDarkSkin ? "bg-slate-950 border border-white/15 text-white" : cardSkin === "soft-tint" ? "bg-[#F8FAFC] border border-slate-200/90 text-slate-900" : "bg-[#FAF8F5] border border-stone-200/90 text-slate-900 shadow-[0_4px_20px_-6px_rgba(15,23,42,0.06)]"} ${hoverCardClass} ${isCardSelected ? "ring-2 ring-[#2563EB]" : ""}`}>
              <div className={`relative w-full ${aspectRatioClass} rounded-t-[999px] rounded-b-xl overflow-hidden bg-stone-200`}>
                <img src={photoUrl} alt={cat.name} referrerPolicy="no-referrer" onError={(e) => handleCategoryImageError(e, idx)} className={`w-full h-full ${posClass} ${fitClass} transition-transform duration-300 ${hoverImgClass}`} />
                <div className="absolute inset-1.5 @[560px]:inset-2 rounded-t-[999px] rounded-b-lg border border-white/35 pointer-events-none" />
                {showTitle && isOverlayTitle && (
                  <div className={`absolute inset-x-0 bottom-0 p-2 @[560px]:p-2.5 flex flex-col ${textPosition === "overlay-center" ? "inset-0 items-center justify-center text-center" : "justify-end text-center"}`} style={{ background: `linear-gradient(180deg, rgba(15,23,42,0) 20%, rgba(10,15,29,${Math.min(0.88, overlayOpacity + 0.35)}) 100%)` }}>
                    <h3 className={`font-bold text-xs @[560px]:text-sm tracking-tight line-clamp-1 ${glassmorphism ? "bg-white/90 text-slate-900 px-2.5 py-1 rounded-lg" : "text-white drop-shadow-xs"}`}>{cat.name}</h3>
                    {showItemCount && countText && <p className="text-[10px] text-white/85 line-clamp-1 mt-0.5">{countText}</p>}
                  </div>
                )}
              </div>
              {showTitle && !isOverlayTitle && (
                <div className="pt-2 pb-1 px-1.5 text-center">
                  <span className="text-[9px] @[560px]:text-[10px] font-mono tracking-widest uppercase text-stone-400 block">N° {idxLabel}</span>
                  <h3 className="font-bold text-xs @[560px]:text-sm tracking-tight line-clamp-1 mt-0.5" style={{ color: isDarkSkin ? "#FFFFFF" : textColor }}>{cat.name}</h3>
                  {showItemCount && countText && <p className="text-[10px] @[560px]:text-[11px] text-stone-500 line-clamp-1 mt-0.5">{countText}</p>}
                </div>
              )}
            </article>
          );
        }

        return (
          <article key={cat.id || idx} onClick={(e) => onCardClick(cat, idx, e)} className={`group relative flex flex-col p-2 @[560px]:p-2.5 pb-2.5 @[560px]:pb-3.5 ${outerRadiusClass} border transition-all duration-200 cursor-pointer select-none @[560px]:even:rotate-[0.5deg] @[560px]:odd:-rotate-[0.5deg] hover:rotate-0 ${isDarkSkin ? "bg-slate-950 border-white/15 text-white shadow-md" : cardSkin === "soft-tint" ? "bg-[#FAF8F5] border-stone-200/90 text-slate-900 shadow-sm" : "bg-white border-slate-200/90 text-slate-900 shadow-[0_8px_24px_-8px_rgba(15,23,42,0.1)]"} ${hoverCardClass} ${isCardSelected ? "ring-2 ring-[#2563EB]" : ""}`}>
            <div className="w-8 @[560px]:w-10 h-2 bg-amber-100/80 border border-amber-200/60 rounded-xs mx-auto -mt-3 mb-1.5 shadow-2xs pointer-events-none" />
            <div className={`relative w-full ${aspectRatioClass} ${mediaRadiusClass} overflow-hidden bg-slate-100 ring-1 ring-black/5`}>
              <img src={photoUrl} alt={cat.name} referrerPolicy="no-referrer" onError={(e) => handleCategoryImageError(e, idx)} className={`w-full h-full ${posClass} ${fitClass} transition-transform duration-300 ${hoverImgClass}`} />
            </div>
            {showTitle && (
              <div className="pt-2 @[560px]:pt-2.5 px-0.5 flex items-center justify-between gap-1.5">
                <div className="min-w-0">
                  <h3 className="font-bold text-xs @[560px]:text-sm tracking-tight truncate" style={{ color: isDarkSkin ? "#FFFFFF" : textColor }}>{cat.name}</h3>
                  {showItemCount && countText && <p className={`text-[10px] @[560px]:text-[11px] font-mono truncate ${isDarkSkin ? "text-slate-400" : "text-slate-500"}`}>{countText}</p>}
                </div>
                <span className={`w-5 h-5 @[560px]:w-6 @[560px]:h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${isDarkSkin ? "bg-white/15 text-white group-hover:bg-white group-hover:text-slate-950" : "bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white"}`}>
                  <ChevronRight className="w-3 h-3 @[560px]:w-3.5 @[560px]:h-3.5" />
                </span>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};
