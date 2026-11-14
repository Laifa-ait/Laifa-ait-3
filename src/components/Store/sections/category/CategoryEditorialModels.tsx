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
import {
  resolveOuterAndMediaRadius,
} from "./categoryResponsiveHelper";

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
  imagePosition = "center", imageFit = "cover", textColor = "#0F172A",
  primaryColor = "#023859", previewViewport = "desktop", isEditable, selectedSectionId,
  selectedSubElement, sectionId, getCountLabel, onCardClick, onEditItem,
}) => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const isDarkSkin = cardSkin === "dark-glass";
  const isMobileSim = previewViewport === "mobile";
  const { outerRadiusClass, mediaRadiusClass } = resolveOuterAndMediaRadius(cardRadius === "full" ? "lg" : cardRadius);

  // 2. GALERIE ACCORDÉON (Desktop/Tablette: flex ligne unique 3.5 / 1, 320/420/520px ; Mobile: flex-col 240px / 68px)
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
              style={{ transition: "all 500ms cubic-bezier(0.22, 1, 0.36, 1)" }}
              className={`group relative overflow-hidden ${outerRadiusClass} cursor-pointer select-none border ${
                isDarkSkin ? "border-white/20 bg-slate-950" : "border-slate-200/80 bg-slate-900"
              } ${isMobileSim ? (isExpanded ? "h-[240px] shadow-md" : "h-[68px] opacity-90") : isExpanded ? "flex-[3.5] shadow-md" : "flex-1 opacity-90 hover:opacity-100"}`}
            >
              <img src={photoUrl} alt={cat.name} referrerPolicy="no-referrer" onError={(e) => handleCategoryImageError(e, idx)} className={`absolute inset-0 w-full h-full ${posClass} ${fitClass} transition-transform duration-500 ${isExpanded ? "scale-[1.03]" : "scale-100"}`} />
              <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(15,23,42,0.12) 10%, rgba(10,15,29,${Math.min(0.88, overlayOpacity + 0.35)}) 100%)` }} />
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-black/45 backdrop-blur-md border border-white/30 text-[10px] font-mono font-bold text-white">#{idxLabel}</span>
                {showBadge && cat.badge && isExpanded && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white" style={{ backgroundColor: cat.badgeColor || primaryColor }}>{cat.badge}</span>}
              </div>
              {isEditable && (
                <button type="button" onClick={(e) => onEditItem(idx, e)} className="absolute top-3 right-3 z-20 bg-[#023859]/90 text-white text-[9px] font-bold px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer border border-white/20"><Camera className="w-2.5 h-2.5" /></button>
              )}
              <div className="absolute inset-x-3 bottom-3 z-10">
                {isExpanded ? (
                  <div className={`rounded-xl backdrop-blur-md border p-3 shadow-xs flex items-center justify-between gap-2 ${isDarkSkin ? "bg-slate-950/88 border-white/20 text-white" : "bg-white/92 border-white/80 text-slate-900"}`}>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm @[768px]:text-base tracking-tight truncate">{showTitle ? cat.name : `Volet #${idxLabel}`}</h3>
                      {showTitle && <p className={`text-[11px] truncate mt-0.5 ${isDarkSkin ? "text-slate-300" : "text-slate-600"}`}>{showItemCount && countText ? countText : cat.subtitle || "Découvrir la sélection"}</p>}
                    </div>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isDarkSkin ? "bg-white text-slate-950" : "bg-slate-900 text-white"}`}><ArrowUpRight className="w-3.5 h-3.5" /></span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 px-1">
                    {showTitle && <span className="font-bold text-xs text-white truncate drop-shadow-xs">{cat.name}</span>}
                    <span className="w-6 h-6 rounded-full bg-white/20 border border-white/30 text-white flex items-center justify-center shrink-0 ml-auto"><ArrowUpRight className="w-3 h-3" /></span>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  // 5. INDEX MAGAZINE (Desktop/Tablette: 45% liste à gauche / 55% aperçu 4:3 à droite, 380/460/540px ; Mobile: 220px haut + liste bas)
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
            <div className={`absolute inset-x-3 bottom-3 p-3 rounded-xl backdrop-blur-md border flex items-center justify-between gap-2 ${isDarkSkin ? "bg-slate-950/90 border-white/20 text-white" : "bg-white/92 border-white/80 text-slate-900"}`}>
              <div className="min-w-0">
                <span className={`text-[10px] font-mono uppercase tracking-wider block ${isDarkSkin ? "text-slate-400" : "text-slate-500"}`}>INDEX N° {String(activeIdx + 1).padStart(2, "0")} {activeCat.badge ? `• ${activeCat.badge}` : ""}</span>
                {showTitle && <h4 className="text-sm font-bold truncate">{activeCat.name}</h4>}
              </div>
              <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${isDarkSkin ? "bg-white text-slate-950" : "bg-slate-900 text-white"}`}>Explorer →</span>
            </div>
          </div>
        )}
        <div className={`${isMobileSim ? "w-full order-2" : "w-[45%] h-full order-1 overflow-y-auto"} ${outerRadiusClass} border flex flex-col justify-between ${isDarkSkin ? "bg-slate-950 border-white/15 divide-y divide-white/10 text-white" : "bg-white border-slate-200/85 divide-y divide-slate-200/80 text-slate-900"}`}>
          {categories.map((cat, idx) => {
            const photoUrl = resolveCategoryPhoto(cat, idx);
            const { posClass, fitClass } = resolveCategoryImageClasses(cat, imagePosition, imageFit);
            const countText = getCountLabel(cat);
            return (
              <div key={cat.id || idx} onMouseEnter={() => setActiveIdx(idx)} onClick={(e) => { setActiveIdx(idx); onCardClick(cat, idx, e); }} className={`group flex-1 flex items-center justify-between gap-3 px-3.5 py-2.5 transition-colors cursor-pointer ${activeIdx === idx ? (isDarkSkin ? "bg-white/10" : "bg-slate-900/[0.05]") : isDarkSkin ? "hover:bg-white/5" : "hover:bg-slate-50"}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono font-bold text-slate-400 tabular-nums">#{String(idx + 1).padStart(2, "0")}</span>
                  <div className={`w-11 h-11 ${mediaRadiusClass} overflow-hidden shrink-0 bg-slate-100 ring-1 ring-black/5`}><img src={photoUrl} alt={cat.name} referrerPolicy="no-referrer" onError={(e) => handleCategoryImageError(e, idx)} className={`w-full h-full ${posClass} ${fitClass}`} /></div>
                  <div className="min-w-0">
                    <h3 className="font-bold tracking-tight truncate text-xs @[768px]:text-sm">{showTitle ? cat.name : `Répertoire #${String(idx + 1).padStart(2, "0")}`}</h3>
                    {showItemCount && countText && <p className={`text-[11px] truncate ${isDarkSkin ? "text-slate-400" : "text-slate-500"}`}>{countText}</p>}
                  </div>
                </div>
                <span className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition-colors ${activeIdx === idx ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 bg-white group-hover:bg-slate-900 group-hover:text-white"}`}><ArrowUpRight className="w-3.5 h-3.5" /></span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. ARCHE PALACE & 4. POLAROID STUDIO (Modèles symétriques stricts : toujours col-span-1)
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
          const archRadiusStyle: React.CSSProperties = { borderRadius: "999px 999px 16px 16px" };
          return (
            <article key={cat.id || idx} onClick={(e) => onCardClick(cat, idx, e)} style={archRadiusStyle} className={`group flex flex-col overflow-hidden cursor-pointer select-none transition-all duration-300 p-2 border border-[#E5DEC9] bg-[#FAF7F2] shadow-[0_6px_22px_-6px_rgba(15,23,42,0.08)] ${spanClass} ${hoverCardClass} ${isCardSelected ? "ring-2 ring-[#2563EB]" : ""}`}>
              <div style={archRadiusStyle} className="relative w-full aspect-[3/4] overflow-hidden bg-stone-200">
                <img src={photoUrl} alt={cat.name} referrerPolicy="no-referrer" onError={(e) => handleCategoryImageError(e, idx)} className={`w-full h-full ${posClass} ${fitClass} transition-transform duration-500 ${hoverImgClass}`} />
                <div style={{ borderRadius: "999px 999px 12px 12px", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.45)" }} className="absolute inset-2 border border-[#EAE0C8]/75 pointer-events-none z-10" />
                <span className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-2.5 py-0.5 rounded-full bg-black/45 backdrop-blur-md border border-white/35 text-[9px] font-mono font-bold tracking-widest text-amber-100">ARCHE #{idxLabel}</span>
                {showTitle && isOverlayTitle && (
                  <div className={`absolute inset-x-0 bottom-0 p-3 flex flex-col ${textPosition === "overlay-center" ? "inset-0 items-center justify-center text-center" : "justify-end text-center"}`} style={{ background: `linear-gradient(180deg, rgba(15,23,42,0) 20%, rgba(10,15,29,${Math.min(0.88, overlayOpacity + 0.35)}) 100%)` }}>
                    <h3 className={`font-bold text-xs @[768px]:text-sm tracking-tight line-clamp-1 ${glassmorphism ? "bg-white/90 text-slate-900 px-2.5 py-1 rounded-lg" : "text-white drop-shadow-xs"}`}>{cat.name}</h3>
                  </div>
                )}
              </div>
              <div className="pt-2.5 pb-1 px-2 text-center flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-stone-500">N° {idxLabel}</span>
                {showTitle && !isOverlayTitle ? (
                  <h3 className="font-bold text-xs @[768px]:text-sm tracking-tight truncate" style={{ color: textColor }}>{cat.name}</h3>
                ) : (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">Dôme Palace</span>
                )}
                <ArrowUpRight className="w-3.5 h-3.5 text-stone-600 shrink-0" />
              </div>
            </article>
          );
        }

        // 4. POLAROID STUDIO : padding: 12px 12px 48px 12px, border-radius: 6px, shadow-md, odd:-rotate-1 even:rotate-1
        const polaroidAspect = cardSize === "large" ? "aspect-[4/5]" : "aspect-square";
        return (
          <article
            key={cat.id || idx}
            onClick={(e) => onCardClick(cat, idx, e)}
            style={{ padding: "12px 12px 48px 12px", borderRadius: "6px" }}
            className={`group relative flex flex-col bg-white border border-stone-200/90 shadow-md transition-all duration-300 cursor-pointer select-none odd:-rotate-1 even:rotate-1 hover:rotate-0 hover:scale-105 ${spanClass} ${isCardSelected ? "ring-2 ring-[#2563EB]" : ""}`}
          >
            <div className="w-10 h-2.5 bg-amber-100/85 border border-amber-200/70 rounded-xs mx-auto -mt-4 mb-2 shadow-2xs pointer-events-none" />
            <div className={`relative w-full ${polaroidAspect} rounded-[3px] overflow-hidden bg-slate-100 ring-1 ring-black/10`}>
              <img src={photoUrl} alt={cat.name} referrerPolicy="no-referrer" onError={(e) => handleCategoryImageError(e, idx)} className={`w-full h-full ${posClass} ${fitClass} transition-transform duration-500 ${hoverImgClass}`} />
            </div>
            <div className="absolute inset-x-3 bottom-0 h-[48px] flex items-center justify-between gap-2 text-slate-900">
              <div className="flex items-center gap-1.5 min-w-0">
                <Camera className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="text-[11px] font-mono font-bold text-stone-500 shrink-0">#{idxLabel}</span>
                {showTitle ? (
                  <h3 className="font-bold text-xs @[768px]:text-sm tracking-tight truncate" style={{ color: textColor }}>{cat.name}</h3>
                ) : (
                  <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 truncate">STUDIO FILM</span>
                )}
              </div>
              {showItemCount && countText ? (
                <span className="text-[10px] font-mono text-stone-500 shrink-0">{countText}</span>
              ) : (
                <ArrowUpRight className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};
