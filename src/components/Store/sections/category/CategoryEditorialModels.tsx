import React, { useState } from "react";
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
import { resolveOuterAndMediaRadius } from "./categoryResponsiveHelper";
import { DEFAULT_MODERN_THEME } from "../../../../pages/Seller/StoreBuilder/constants/studioThemeDefaults";

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
  columnsDesktop?: number;
  columnsTablet?: number;
  columnsMobile?: number;
  imagePosition?: CategoryImagePosition;
  imageFit?: CategoryImageFit;
  textColor?: string;
  primaryColor?: string;
  previewViewport?: CategoryDeviceViewport;
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
  categories, layout, containerGridColsClass, gapClass, cardRadius = "md",
  hoverImgClass, hoverCardClass, textPosition = "below", overlayOpacity = 0.4,
  glassmorphism = false, showTitle = true, showBadge, showItemCount, cardSize = "balanced",
  cardSkin = "editorial",
  imagePosition = "center", imageFit = "cover", textColor = DEFAULT_MODERN_THEME.textColor || "#0F172A",
  primaryColor = DEFAULT_MODERN_THEME.primaryColor, previewViewport = "desktop", isEditable, selectedSectionId,
  selectedSubElement, sectionId, getCountLabel, onCardClick, onEditItem,
}) => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const isDarkSkin = cardSkin === "dark-glass";
  const isMobileSim = previewViewport === "mobile";
  const { outerRadiusClass, mediaRadiusClass } = resolveOuterAndMediaRadius(cardRadius === "full" ? "lg" : cardRadius);

  if (layout === "accordion") {
    const desktopRowH = cardSize === "compact" ? "h-[320px]" : cardSize === "large" ? "h-[520px]" : "h-[420px]";
    return (
      <div className={`flex ${isMobileSim ? "flex-col" : `flex-row ${desktopRowH}`} gap-3 w-full`} data-category-model="accordion">
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
              style={{ transition: "all 400ms cubic-bezier(0.16, 1, 0.3, 1)" }}
              className={`group relative overflow-hidden ${outerRadiusClass} cursor-pointer select-none border ${
                isDarkSkin ? "border-white/20 bg-slate-950" : "border-slate-200/80 bg-slate-900"
              } ${isMobileSim ? (isExpanded ? "h-[240px] shadow-md" : "h-[68px] opacity-90") : isExpanded ? "flex-[3.5] shadow-md" : "flex-1 opacity-90 hover:opacity-100"}`}
            >
              <img src={photoUrl} alt={cat.name} referrerPolicy="no-referrer" onError={(e) => handleCategoryImageError(e, idx)} className={`absolute inset-0 w-full h-full ${posClass} ${fitClass} transition-transform duration-500 ${isExpanded ? "scale-[1.03]" : "scale-100"}`} />
              <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(15,23,42,0.12) 10%, rgba(10,15,29,${Math.min(0.88, overlayOpacity + 0.35)}) 100%)` }} />
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2 text-[11px] font-mono font-semibold text-white/90">
                <span className="tabular-nums">{idxLabel}</span>
                {showBadge && cat.badge && isExpanded && (
                  <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold text-white" style={{ backgroundColor: cat.badgeColor || primaryColor }}>{cat.badge}</span>
                )}
              </div>
              {isEditable && (
                <button type="button" onClick={(e) => onEditItem(idx, e)} className="absolute top-3 right-3 z-20 bg-slate-900/90 text-white text-[10px] font-medium px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer border border-white/20"><Camera className="w-3 h-3" /></button>
              )}
              <div className="absolute inset-x-3 bottom-3 z-10">
                {isExpanded ? (
                  <div className={`rounded-lg backdrop-blur-md border p-3 shadow-xs flex items-center justify-between gap-2 ${isDarkSkin ? "bg-slate-950/90 border-white/20 text-white" : "bg-white/95 border-white/80 text-slate-900"}`}>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm @[768px]:text-base tracking-tight truncate">{showTitle ? cat.name : `Collection ${idxLabel}`}</h3>
                      {showTitle && <p className={`text-xs truncate mt-0.5 ${isDarkSkin ? "text-slate-300" : "text-slate-600"}`}>{showItemCount && countText ? countText : cat.subtitle || "Découvrir"}</p>}
                    </div>
                    <span className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${isDarkSkin ? "bg-white text-slate-950" : "bg-slate-900 text-white"}`}><ArrowUpRight className="w-3.5 h-3.5" /></span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 px-1">
                    {showTitle && <span className="font-semibold text-xs text-white truncate drop-shadow-xs">{cat.name}</span>}
                    <ArrowUpRight className="w-3.5 h-3.5 text-white shrink-0 ml-auto" />
                  </div>
                )}
              </div>
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
    const desktopMagH = cardSize === "compact" ? "h-[380px]" : cardSize === "large" ? "h-[540px]" : "h-[460px]";

    return (
      <div className={`flex ${isMobileSim ? "flex-col" : `flex-row ${desktopMagH}`} gap-4 w-full items-stretch`} data-category-model="magazine">
        {activeCat && (
          <div onClick={(e) => onCardClick(activeCat, activeIdx, e)} className={`${isMobileSim ? "w-full h-[220px] order-1" : "w-[55%] h-full order-2"} relative ${outerRadiusClass} overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs cursor-pointer group aspect-[4/3]`}>
            <img src={activePhoto} alt={activeCat.name} referrerPolicy="no-referrer" onError={(e) => handleCategoryImageError(e, activeIdx)} className={`absolute inset-0 w-full h-full ${activeImg.posClass} ${activeImg.fitClass} transition-transform duration-500 group-hover:scale-105`} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            <div className={`absolute inset-x-3 bottom-3 p-3 rounded-lg backdrop-blur-md border flex items-center justify-between gap-2 ${isDarkSkin ? "bg-slate-950/90 border-white/20 text-white" : "bg-white/95 border-white/80 text-slate-900"}`}>
              <div className="min-w-0">
                <span className={`text-[10px] font-mono tabular-nums uppercase tracking-wider block ${isDarkSkin ? "text-slate-400" : "text-slate-500"}`}>{String(activeIdx + 1).padStart(2, "0")} {activeCat.badge ? `· ${activeCat.badge}` : ""}</span>
                {showTitle && <h4 className="text-sm font-semibold truncate">{activeCat.name}</h4>}
              </div>
              <span className={`px-3 py-1.5 rounded-md text-xs font-semibold shrink-0 whitespace-nowrap ${isDarkSkin ? "bg-white text-slate-950" : "bg-slate-900 text-white"}`}>Explorer</span>
            </div>
          </div>
        )}
        <div className={`${isMobileSim ? "w-full order-2" : "w-[45%] h-full order-1 overflow-y-auto"} ${outerRadiusClass} border flex flex-col justify-between ${isDarkSkin ? "bg-slate-950 border-white/15 divide-y divide-white/10 text-white" : "bg-white border-slate-200/85 divide-y divide-slate-200/80 text-slate-900"}`}>
          {categories.map((cat, idx) => {
            const photoUrl = resolveCategoryPhoto(cat, idx);
            const { posClass, fitClass } = resolveCategoryImageClasses(cat, imagePosition, imageFit);
            const countText = getCountLabel(cat);
            return (
              <div key={cat.id || idx} onMouseEnter={() => setActiveIdx(idx)} onClick={(e) => { setActiveIdx(idx); onCardClick(cat, idx, e); }} className={`group flex-1 flex items-center justify-between gap-3 px-3.5 py-2.5 transition-colors cursor-pointer ${activeIdx === idx ? (isDarkSkin ? "bg-white/10" : "bg-slate-900/[0.04]") : isDarkSkin ? "hover:bg-white/5" : "hover:bg-slate-50"}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono font-bold text-slate-400 tabular-nums">{String(idx + 1).padStart(2, "0")}</span>
                  <div className={`w-11 h-11 ${mediaRadiusClass} overflow-hidden shrink-0 bg-slate-100 ring-1 ring-black/5`}><img src={photoUrl} alt={cat.name} referrerPolicy="no-referrer" onError={(e) => handleCategoryImageError(e, idx)} className={`w-full h-full ${posClass} ${fitClass}`} /></div>
                  <div className="min-w-0">
                    <h3 className="font-semibold tracking-tight truncate text-xs @[768px]:text-sm">{showTitle ? cat.name : `Collection ${String(idx + 1).padStart(2, "0")}`}</h3>
                    {showItemCount && countText && <p className={`text-[11px] truncate ${isDarkSkin ? "text-slate-400" : "text-slate-500"}`}>{countText}</p>}
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 shrink-0 transition-colors" />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const isOverlayTitle = textPosition === "overlay-bottom" || textPosition === "overlay-center";

  return (
    <div className={`grid ${containerGridColsClass} ${gapClass}`} data-category-model={layout}>
      {categories.map((cat, idx) => {
        const photoUrl = resolveCategoryPhoto(cat, idx);
        const { posClass, fitClass } = resolveCategoryImageClasses(cat, imagePosition, imageFit);
        const countText = getCountLabel(cat);
        const idxLabel = String(idx + 1).padStart(2, "0");
        const spanClass = "col-span-1";
        const isCardSelected = isEditable && selectedSectionId === sectionId && selectedSubElement === `category-items:${idx}`;

        if (layout === "arch") {
          const archRadiusStyle: React.CSSProperties = { borderRadius: "999px 999px 12px 12px" };
          return (
            <article key={cat.id || idx} onClick={(e) => onCardClick(cat, idx, e)} style={archRadiusStyle} className={`group flex flex-col overflow-hidden cursor-pointer select-none transition-all duration-200 p-2 border border-slate-200 bg-white shadow-2xs hover:shadow-md ${spanClass} ${hoverCardClass} ${isCardSelected ? "ring-2 ring-[var(--studio-focus,#2563EB)]" : ""}`}>
              <div style={archRadiusStyle} className="relative w-full aspect-[3/4] overflow-hidden bg-slate-100">
                <img src={photoUrl} alt={cat.name} referrerPolicy="no-referrer" onError={(e) => handleCategoryImageError(e, idx)} className={`w-full h-full ${posClass} ${fitClass} transition-transform duration-500 ${hoverImgClass}`} />
                <div style={{ borderRadius: "999px 999px 10px 10px" }} className="absolute inset-2 border border-white/40 pointer-events-none z-10" />
                {showTitle && isOverlayTitle && (
                  <div className={`absolute inset-x-0 bottom-0 p-3 flex flex-col ${textPosition === "overlay-center" ? "inset-0 items-center justify-center text-center" : "justify-end text-center"}`} style={{ background: `linear-gradient(180deg, rgba(15,23,42,0) 25%, rgba(10,15,29,${Math.min(0.85, overlayOpacity + 0.35)}) 100%)` }}>
                    <h3 className={`font-semibold text-xs @[768px]:text-sm tracking-tight line-clamp-1 ${glassmorphism ? "bg-white/95 text-slate-900 px-2.5 py-1 rounded-md" : "text-white drop-shadow-xs"}`}>{cat.name}</h3>
                  </div>
                )}
              </div>
              <div className="pt-2.5 pb-1 px-2 text-center flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono tabular-nums text-slate-400">{idxLabel}</span>
                {showTitle && !isOverlayTitle ? (
                  <h3 className="font-semibold text-xs @[768px]:text-sm tracking-tight truncate" style={{ color: textColor }}>{cat.name}</h3>
                ) : (
                  <span className="text-[11px] font-medium tracking-wide text-slate-500">Collection</span>
                )}
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              </div>
            </article>
          );
        }

        const galleryAspect = cardSize === "large" ? "aspect-[4/5]" : "aspect-square";
        return (
          <article
            key={cat.id || idx}
            onClick={(e) => onCardClick(cat, idx, e)}
            style={{ padding: "12px 12px 44px 12px", borderRadius: "8px" }}
            className={`group relative flex flex-col bg-white border border-slate-200 shadow-2xs transition-all duration-200 cursor-pointer select-none hover:-translate-y-0.5 hover:shadow-md ${spanClass} ${isCardSelected ? "ring-2 ring-[var(--studio-focus,#2563EB)]" : ""}`}
          >
            <div className={`relative w-full ${galleryAspect} rounded-sm overflow-hidden bg-slate-100 ring-1 ring-black/5`}>
              <img src={photoUrl} alt={cat.name} referrerPolicy="no-referrer" onError={(e) => handleCategoryImageError(e, idx)} className={`w-full h-full ${posClass} ${fitClass} transition-transform duration-500 ${hoverImgClass}`} />
            </div>
            <div className="absolute inset-x-3 bottom-0 h-[44px] flex items-center justify-between gap-2 text-slate-900">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[11px] font-mono tabular-nums text-slate-400 shrink-0">{idxLabel}</span>
                {showTitle ? (
                  <h3 className="font-semibold text-xs @[768px]:text-sm tracking-tight truncate" style={{ color: textColor }}>{cat.name}</h3>
                ) : (
                  <span className="text-[11px] font-medium tracking-wide text-slate-500 truncate">Collection</span>
                )}
              </div>
              {showItemCount && countText ? (
                <span className="text-[11px] font-mono tabular-nums text-slate-400 shrink-0">{countText}</span>
              ) : (
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};
