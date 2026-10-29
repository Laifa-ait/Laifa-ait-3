import React from "react";
import { Check, Grid, Sliders, Wand2, Maximize2, Layers, Type, Smartphone } from "lucide-react";
import {
  CategoryItem,
  CategoryLayoutType,
  CategoryCardSize,
  CategoryTextPosition,
} from "../../../../pages/Seller/StoreBuilder/constants/categoryPresetTypes";

interface CategoryCanvasQuickBarProps {
  sectionId: string;
  categories: CategoryItem[];
  activeLayout: CategoryLayoutType;
  cardSize: CategoryCardSize;
  columnsMobile?: number;
  showTitle: boolean;
  textPosition: CategoryTextPosition;
  onTriggerSubTab: (
    subTab: "style" | "items" | "presets",
    e?: React.MouseEvent,
    categoryIndex?: number
  ) => void;
}

const QUICK_CARD_MODELS: Array<{ id: CategoryLayoutType; label: string }> = [
  { id: "bento", label: "Bento Apple" },
  { id: "accordion", label: "Accordéon" },
  { id: "arch", label: "Arche Palace" },
  { id: "polaroid", label: "Polaroid" },
  { id: "magazine", label: "Index Magazine" },
  { id: "glass-dock", label: "Glass Dock" },
  { id: "mesh-3d", label: "Split Studio" },
  { id: "grid", label: "Grille Prestige" },
  { id: "overlay", label: "Affiche Cinéma" },
  { id: "bubbles", label: "Médaillons" },
  { id: "pills", label: "Capsules Pro" },
  { id: "carousel", label: "Slider" },
];

const QUICK_CARD_SIZES: Array<{ id: CategoryCardSize; label: string }> = [
  { id: "compact", label: "Compacte" },
  { id: "balanced", label: "Équilibrée" },
  { id: "large", label: "Grande" },
];

export const CategoryCanvasQuickBar: React.FC<CategoryCanvasQuickBarProps> = ({
  sectionId,
  categories,
  activeLayout,
  cardSize,
  columnsMobile = 2,
  showTitle,
  textPosition,
  onTriggerSubTab,
}) => {
  const dispatchPatch = (patch: Record<string, unknown>) => {
    window.dispatchEvent(
      new CustomEvent("studio:patch-section-settings", {
        detail: { sectionId, patch },
      })
    );
  };

  const handleSelectModel = (modelId: CategoryLayoutType) => {
    const patch: Record<string, unknown> = { layout: modelId };
    if (modelId === "bubbles") {
      patch.aspectRatio = "circle";
      patch.borderRadius = "full";
      if (textPosition !== "none") patch.textPosition = "below";
    } else if (modelId === "pills") {
      patch.borderRadius = "lg";
      if (textPosition !== "none") patch.textPosition = "card-inside";
    } else if (
      modelId === "overlay" ||
      modelId === "bento" ||
      modelId === "glass-dock" ||
      modelId === "accordion"
    ) {
      patch.aspectRatio = "4/5";
      patch.borderRadius = "md";
      if (textPosition === "below") patch.textPosition = "overlay-bottom";
    } else {
      patch.aspectRatio = "4/5";
      patch.borderRadius = "md";
      if (textPosition !== "none") patch.textPosition = "below";
    }
    dispatchPatch(patch);
  };

  const handleToggleCategoryCard = (idx: number) => {
    const next = categories.map((cat, i) =>
      i === idx ? { ...cat, hidden: !cat.hidden } : cat
    );
    dispatchPatch({ categories: next });
  };

  const visibleCount = categories.filter((c) => !c.hidden).length;
  const activeTitleMode =
    !showTitle || textPosition === "none"
      ? "none"
      : activeLayout === "overlay" ||
        activeLayout === "bento" ||
        activeLayout === "glass-dock" ||
        textPosition.startsWith("overlay")
      ? "overlay"
      : "below";

  return (
    <div
      className="mb-3.5 p-2 @[560px]:p-2.5 bg-[#F8FBFC] border border-slate-200/90 rounded-2xl shadow-2xs space-y-2 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Row 1: Action Buttons & Title Mode Switcher */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] @[560px]:text-[11px] font-extrabold text-[#011C40] flex items-center gap-1 mr-0.5">
            <Layers className="w-3.5 h-3.5 text-[#023859]" />
            <span>Cartes ({visibleCount}/{categories.length})</span>
          </span>

          <div className="inline-flex items-center bg-white border border-slate-200 rounded-lg p-0.5 gap-0.5">
            <span className="text-[9px] @[560px]:text-[10px] font-bold text-slate-500 px-1 hidden @[560px]:flex items-center gap-1">
              <Type className="w-3 h-3 text-[#023859]" />
              Titre :
            </span>
            <button
              type="button"
              onClick={() =>
                dispatchPatch({
                  showTitle: true,
                  textPosition:
                    activeLayout === "bento" || activeLayout === "overlay"
                      ? "overlay-bottom"
                      : "below",
                })
              }
              className={`h-6 px-1.5 @[560px]:px-2 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                activeTitleMode === "below"
                  ? "bg-[#023859] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Sous carte
            </button>
            <button
              type="button"
              onClick={() =>
                dispatchPatch({
                  showTitle: true,
                  textPosition: "overlay-bottom",
                })
              }
              className={`h-6 px-1.5 @[560px]:px-2 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                activeTitleMode === "overlay"
                  ? "bg-[#023859] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Sur image
            </button>
            <button
              type="button"
              onClick={() =>
                dispatchPatch({
                  showTitle: false,
                  textPosition: "none",
                })
              }
              className={`h-6 px-1.5 @[560px]:px-2 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                activeTitleMode === "none"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Sans titre
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={(e) => onTriggerSubTab("items", e, 0)}
            className="h-6 @[560px]:h-7 px-2 rounded-lg bg-[#023859] hover:bg-[#011C40] text-white text-[10px] @[560px]:text-[11px] font-bold flex items-center gap-1 cursor-pointer"
          >
            <Grid className="w-3 h-3" />
            <span>Rayons</span>
          </button>
          <button
            type="button"
            onClick={(e) => onTriggerSubTab("style", e)}
            className="h-6 @[560px]:h-7 px-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] @[560px]:text-[11px] font-bold flex items-center gap-1 cursor-pointer"
          >
            <Sliders className="w-3 h-3 text-[#26658C]" />
            <span>Style</span>
          </button>
          <button
            type="button"
            onClick={(e) => onTriggerSubTab("presets", e)}
            className="h-6 @[560px]:h-7 px-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] @[560px]:text-[11px] font-bold flex items-center gap-1 cursor-pointer"
          >
            <Wand2 className="w-3 h-3 text-[#26658C]" />
            <span>Packs</span>
          </button>
        </div>
      </div>

      {/* Row 2: Direct Card Design Switcher + Mobile Columns & Dimension */}
      <div className="flex flex-col @[900px]:flex-row items-stretch @[900px]:items-center justify-between gap-2 pt-1.5 border-t border-slate-200/70">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-0.5 shrink-0">
            Modèle :
          </span>
          {QUICK_CARD_MODELS.map((m) => {
            const isSel = activeLayout === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelectModel(m.id)}
                className={`h-6 px-2 rounded-md text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isSel
                    ? "bg-[#023859] text-white shadow-2xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between @[560px]:justify-end gap-2 shrink-0 flex-wrap">
          <div className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
            <Smartphone className="w-3 h-3 text-[#26658C] ml-1" />
            {[1, 2].map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => dispatchPatch({ columnsMobile: col })}
                className={`h-5 px-1.5 rounded text-[9px] font-bold cursor-pointer ${
                  columnsMobile === col
                    ? "bg-[#023859] text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {col} col.
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Maximize2 className="w-3 h-3 text-slate-400 shrink-0 hidden @[560px]:block" />
            {QUICK_CARD_SIZES.map((sz) => {
              const isSel = cardSize === sz.id;
              return (
                <button
                  key={sz.id}
                  type="button"
                  onClick={() => dispatchPatch({ cardSize: sz.id })}
                  className={`h-6 px-1.5 @[560px]:px-2 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    isSel
                      ? "bg-[#011C40] text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {sz.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Choose which category cards to display */}
      {categories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1.5 border-t border-slate-200/70">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Afficher :
          </span>
          {categories.map((cat, idx) => {
            const isVisible = !cat.hidden;
            return (
              <button
                key={cat.id || idx}
                type="button"
                onClick={() => handleToggleCategoryCard(idx)}
                className={`h-6 px-2 rounded-full text-[10px] font-bold flex items-center gap-1 whitespace-nowrap border transition-all cursor-pointer shrink-0 ${
                  isVisible
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                    : "bg-slate-100 border-slate-200 text-slate-400 line-through"
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                    isVisible ? "bg-emerald-600 text-white" : "bg-slate-300 text-transparent"
                  }`}
                >
                  <Check className="w-2.5 h-2.5" />
                </span>
                <span>{cat.name || `Carte #${idx + 1}`}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
