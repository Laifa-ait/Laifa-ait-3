import React, { RefObject, useState } from "react";
import { ArrowUpRight, Camera, ChevronLeft, ChevronRight, Film } from "lucide-react";
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
  resolveAntiHoleSpanClass,
  resolveCategoryActiveCols,
} from "./categoryResponsiveHelper";

interface CategoryShopifyCardsProps {
  categories: CategoryItem[];
  layout: string;
  carouselRef?: RefObject<HTMLDivElement | null>;
  containerGridColsClass: string;
  gapClass: string;
  aspectRatioClass: string;
  cardRadius?: string;
  cardRadiusClass: string;
  hoverImgClass: string;
  hoverCardClass: string;
  effectiveOverlay: boolean;
  textPosition: string;
  overlayOpacity: number;
  glassmorphism: boolean;
  showTitle?: boolean;
  showBadge: boolean;
  showItemCount: boolean;
  cardSize?: CategoryCardSize;
  cardSkin?: string;
  columnsDesktop?: number;
  columnsTablet?: number;
  columnsMobile?: number;
  previewViewport?: CategoryDeviceViewport;
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
  onOpenPage: (cat: CategoryItem, e: React.MouseEvent) => void;
}

export const CategoryShopifyCards: React.FC<CategoryShopifyCardsProps> = ({
  categories, layout, carouselRef, containerGridColsClass, gapClass,
  hoverImgClass, hoverCardClass, showTitle = true, showBadge, showItemCount,
  cardSize = "balanced", columnsDesktop = 3, columnsTablet = 2, columnsMobile = 2,
  previewViewport = "desktop", imagePosition = "center", imageFit = "cover",
  textColor = "#0F172A", primaryColor = "#023859", isEditable,
  selectedSectionId, selectedSubElement, sectionId, getCountLabel, onCardClick, onEditItem,
}) => {
  const [scrollProgress, setScrollProgress] = useState<number>(25);
  const activeCols = resolveCategoryActiveCols(
    columnsDesktop, columnsMobile, previewViewport, columnsTablet, layout, categories.length, cardSize
  );

  // 12. LOOKBOOK SLIDER (Carrousel horizontal gap-5 + flèches + barre de progression fine en bas)
  if (layout === "carousel") {
    const slideWidthClass =
      previewViewport === "mobile"
        ? "w-[78vw] max-w-[320px]"
        : previewViewport === "tablet" || cardSize === "compact"
        ? "w-[280px]"
        : cardSize === "large"
        ? "w-[420px]"
        : "w-[340px]";

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return setScrollProgress(100);
      setScrollProgress(Math.min(100, Math.max(15, Math.round((el.scrollLeft / max) * 85) + 15)));
    };

    const scrollByStep = (dir: number, e: React.MouseEvent) => {
      e.stopPropagation();
      carouselRef?.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
    };

    return (
      <div className="space-y-3" data-category-model="carousel">
        <div className="flex items-center justify-end gap-1.5">
          <button type="button" onClick={(e) => scrollByStep(-1, e)} className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-900 hover:text-white text-slate-800 flex items-center justify-center shadow-2xs transition-colors cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
          <button type="button" onClick={(e) => scrollByStep(1, e)} className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-900 hover:text-white text-slate-800 flex items-center justify-center shadow-2xs transition-colors cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
        </div>
        <div ref={carouselRef} onScroll={handleScroll} className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-2 scrollbar-none scroll-smooth">
          {categories.map((cat, idx) => {
            const photoUrl = resolveCategoryPhoto(cat, idx);
            const { posClass, fitClass } = resolveCategoryImageClasses(cat, imagePosition, imageFit);
            const countText = getCountLabel(cat);
            const idxLabel = String(idx + 1).padStart(2, "0");
            return (
              <article key={cat.id || idx} onClick={(e) => onCardClick(cat, idx, e)} className={`group relative snap-start shrink-0 ${slideWidthClass} aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-sm cursor-pointer select-none ${hoverCardClass}`}>
                <img src={photoUrl} alt={cat.name} referrerPolicy="no-referrer" onError={(e) => handleCategoryImageError(e, idx)} className={`w-full h-full ${posClass} ${fitClass} transition-transform duration-500 ${hoverImgClass}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 text-slate-900 text-[10px] font-mono font-bold">LOOK #{idxLabel}</span>
                <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 text-white">
                  <div className="min-w-0">
                    {showTitle && <h3 className="font-bold text-sm @[768px]:text-base tracking-tight truncate">{cat.name}</h3>}
                    {showItemCount && countText && <p className="text-[11px] text-white/80 truncate">{countText}</p>}
                  </div>
                  <span className="w-8 h-8 rounded-full bg-white text-slate-950 flex items-center justify-center shrink-0 shadow-xs"><ArrowUpRight className="w-4 h-4" /></span>
                </div>
              </article>
            );
          })}
        </div>
        <div className="w-full h-1 bg-slate-200/80 rounded-full overflow-hidden">
          <div className="h-full bg-slate-900 rounded-full transition-all duration-300" style={{ width: `${scrollProgress}%` }} />
        </div>
      </div>
    );
  }

  // 9. AFFICHE CINÉMA (overlay : modèle modulaire à hauteur fixe avec resolveAntiHoleSpanClass)
  if (layout === "overlay") {
    const isMobilePoster = previewViewport === "mobile";
    const posterGridClass = isMobilePoster ? "grid-cols-1" : containerGridColsClass;
    const hasRemainder = !isMobilePoster && categories.length % activeCols !== 0;
    const posterHeightOrAspect = isMobilePoster
      ? "aspect-video h-[200px]"
      : hasRemainder
      ? cardSize === "compact" ? "h-[240px]" : cardSize === "large" ? "h-[360px]" : "h-[300px]"
      : activeCols <= 2 ? "aspect-video" : "aspect-[2/3]";

    return (
      <div className={`grid ${posterGridClass} gap-2`} data-category-model="overlay">
        {categories.map((cat, idx) => {
          const photoUrl = resolveCategoryPhoto(cat, idx);
          const { posClass, fitClass } = resolveCategoryImageClasses(cat, imagePosition, imageFit);
          const countText = getCountLabel(cat);
          const idxLabel = String(idx + 1).padStart(2, "0");
          const spanClass = isMobilePoster ? "col-span-1" : resolveAntiHoleSpanClass(idx, categories.length, activeCols, "overlay");

          return (
            <article key={cat.id || idx} onClick={(e) => onCardClick(cat, idx, e)} style={{ borderRadius: "6px" }} className={`group relative overflow-hidden bg-black p-0 border-0 cursor-pointer select-none ${posterHeightOrAspect} ${spanClass} ${hoverCardClass}`}>
              <img src={photoUrl} alt={cat.name} referrerPolicy="no-referrer" onError={(e) => handleCategoryImageError(e, idx)} className={`w-full h-full ${posClass} ${fitClass} transition-transform duration-500 ${hoverImgClass}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/35 pointer-events-none" />
              <div className="absolute inset-x-2.5 top-2 z-10 flex items-center justify-between text-[9px] font-mono tracking-widest uppercase text-white/85 border-b border-white/20 pb-1">
                <span className="flex items-center gap-1"><Film className="w-3 h-3 text-amber-400" /> SCENE #{idxLabel}</span>
                <span>{cat.badge || "35MM RAW"}</span>
              </div>
              <div className="absolute inset-x-3 bottom-2.5 z-10 flex items-end justify-between gap-2 border-t border-white/20 pt-1.5 text-white">
                <div className="min-w-0">
                  {showTitle ? (
                    <h3 className="font-extrabold text-sm @[768px]:text-base uppercase tracking-wider truncate drop-shadow-xs">{cat.name}</h3>
                  ) : (
                    <span className="text-[10px] font-mono tracking-widest uppercase text-amber-300">AFFICHE #{idxLabel}</span>
                  )}
                  {showTitle && showItemCount && countText && <p className="text-[10px] font-mono text-white/75 truncate">{countText}</p>}
                </div>
                <span className="w-7 h-7 rounded-sm bg-white/15 backdrop-blur-xs border border-white/35 text-white flex items-center justify-center shrink-0"><ArrowUpRight className="w-3.5 h-3.5" /></span>
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  // 6. GLASS DOCK 3D (modulaire à hauteur fixe) & 8. GRILLE PRESTIGE (symétrique strict : toujours col-span-1)
  const glassDockHasRemainder = layout === "glass-dock" && categories.length % activeCols !== 0;
  const glassDockSizeClass = glassDockHasRemainder
    ? previewViewport === "mobile" ? "h-[230px]" : cardSize === "compact" ? "h-[260px]" : cardSize === "large" ? "h-[380px]" : "h-[320px]"
    : "aspect-[4/5]";

  return (
    <div className={`grid ${containerGridColsClass} ${gapClass}`} data-category-model={layout}>
      {categories.map((cat, idx) => {
        const photoUrl = resolveCategoryPhoto(cat, idx);
        const { posClass, fitClass } = resolveCategoryImageClasses(cat, imagePosition, imageFit);
        const countText = getCountLabel(cat);
        const idxLabel = String(idx + 1).padStart(2, "0");
        const spanClass = resolveAntiHoleSpanClass(idx, categories.length, activeCols, layout);
        const isCardSelected = isEditable && selectedSectionId === sectionId && selectedSubElement === `category-items:${idx}`;

        if (layout === "glass-dock") {
          return (
            <article key={cat.id || idx} onClick={(e) => onCardClick(cat, idx, e)} style={{ borderRadius: "24px" }} className={`group relative ${glassDockSizeClass} overflow-hidden bg-slate-900 cursor-pointer select-none shadow-sm ${spanClass} ${hoverCardClass} ${isCardSelected ? "ring-2 ring-[#2563EB]" : ""}`}>
              <img src={photoUrl} alt={cat.name} referrerPolicy="no-referrer" onError={(e) => handleCategoryImageError(e, idx)} className={`w-full h-full ${posClass} ${fitClass} transition-transform duration-500 ${hoverImgClass}`} />
              {isEditable && (
                <button type="button" onClick={(e) => onEditItem(idx, e)} className="absolute top-3 right-3 z-20 bg-[#023859]/90 text-white text-[9px] font-bold px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer border border-white/20"><Camera className="w-2.5 h-2.5" /></button>
              )}
              <div
                style={{
                  position: "absolute", bottom: "12px", left: "12px", right: "12px", height: "54px",
                  backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                  background: "rgba(255,255,255,0.72)", border: "1px solid rgba(255,255,255,0.5)", borderRadius: "16px",
                }}
                className="z-10 px-3.5 flex items-center justify-between gap-2 shadow-sm text-slate-900"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="px-2 py-0.5 rounded-md bg-slate-900/10 text-[10px] font-mono font-extrabold text-slate-900 shrink-0">#{idxLabel}</span>
                  {showTitle ? (
                    <div className="min-w-0">
                      <h3 className="font-bold text-xs @[768px]:text-sm tracking-tight truncate">{cat.name}</h3>
                      {showItemCount && countText && <p className="text-[10px] text-slate-600 truncate">{countText}</p>}
                    </div>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-800 truncate">{cat.badge || "Capsule Glass 3D"}</span>
                  )}
                </div>
                <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"><ArrowUpRight className="w-4 h-4" /></span>
              </div>
            </article>
          );
        }

        const prestigeAspect = cardSize === "large" ? "aspect-[3/4]" : "aspect-[4/5]";
        return (
          <article key={cat.id || idx} onClick={(e) => onCardClick(cat, idx, e)} className={`group relative flex flex-col rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] p-[8px] @[768px]:p-[14px] shadow-[0_4px_18px_-6px_rgba(15,23,42,0.07)] cursor-pointer select-none col-span-1 ${hoverCardClass} ${isCardSelected ? "ring-2 ring-[#2563EB]" : ""}`}>
            <div className={`relative w-full ${prestigeAspect} rounded-lg overflow-hidden bg-stone-200 border border-[#E5E0D8]`}>
              <img src={photoUrl} alt={cat.name} referrerPolicy="no-referrer" onError={(e) => handleCategoryImageError(e, idx)} className={`w-full h-full ${posClass} ${fitClass} transition-transform duration-500 ${hoverImgClass}`} />
              {showBadge && cat.badge && (
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-semibold text-white" style={{ backgroundColor: cat.badgeColor || primaryColor }}>{cat.badge}</span>
              )}
            </div>
            <div className="relative z-10 -mt-4 mx-auto px-3.5 py-1.5 rounded-full bg-white border border-[#E5E0D8] shadow-xs flex items-center gap-2 max-w-[92%]">
              <span className="text-[10px] font-mono font-bold text-stone-400 shrink-0">N°{idxLabel}</span>
              {showTitle && <h3 className="font-bold text-xs @[768px]:text-sm tracking-tight truncate" style={{ color: textColor }}>{cat.name}</h3>}
              <ArrowUpRight className="w-3.5 h-3.5 text-stone-700 shrink-0" />
            </div>
            {showTitle && showItemCount && countText && (
              <p className="text-[10px] text-center text-stone-500 mt-1.5 truncate">{countText}</p>
            )}
          </article>
        );
      })}
    </div>
  );
};
