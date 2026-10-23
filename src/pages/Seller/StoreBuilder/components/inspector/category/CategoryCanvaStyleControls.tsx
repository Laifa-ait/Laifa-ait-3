import React from "react";
import {
  CATEGORY_LAYOUT_OPTIONS,
  CATEGORY_ASPECT_RATIOS,
  CATEGORY_HOVER_EFFECTS,
  CATEGORY_RADIUS_OPTIONS,
} from "../../../constants/categoryCanvaOptions";
import {
  CategoryLayoutType,
  CategoryAspectRatio,
  CategoryHoverEffect,
  CategoryCardRadius,
  CategoryTextPosition,
} from "../../../constants/categoryPresets";

interface CategoryCanvaStyleControlsProps {
  settings: Record<string, unknown>;
  onSettingsChange: (field: string, value: unknown) => void;
}

export const CategoryCanvaStyleControls: React.FC<CategoryCanvaStyleControlsProps> = ({
  settings,
  onSettingsChange,
}) => {
  const currentLayout = (settings.layout as CategoryLayoutType) || "grid";
  const currentRatio = (settings.aspectRatio as CategoryAspectRatio) || "1/1";
  const currentRadius = (settings.borderRadius as CategoryCardRadius) || "md";
  const currentHover = (settings.hoverEffect as CategoryHoverEffect) || "zoom";
  const currentTextPos = (settings.textPosition as CategoryTextPosition) || "below";
  const overlayOpacity = typeof settings.overlayOpacity === "number" ? settings.overlayOpacity : 30;

  return (
    <div className="space-y-4">
      {/* 1. Layout Mode */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-bold text-slate-800 uppercase tracking-wider block">
          Disposition & Structure Canva
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORY_LAYOUT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = currentLayout === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSettingsChange("layout", opt.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  active
                    ? "bg-orange-50 border-orange-500 text-orange-950 ring-1 ring-orange-400"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    active ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">{opt.label}</div>
                  <div className="text-[10px] text-slate-500 truncate">{opt.sublabel}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Aspect Ratio */}
      <div className="space-y-1.5 pt-3 border-t border-slate-100">
        <label className="text-[12px] font-bold text-slate-800 uppercase tracking-wider block">
          Format des Visuels
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {CATEGORY_ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio.id}
              type="button"
              onClick={() => onSettingsChange("aspectRatio", ratio.id)}
              className={`py-2 px-2 rounded-lg border text-xs font-semibold text-center transition-all cursor-pointer ${
                currentRatio === ratio.id
                  ? "bg-orange-50 border-orange-500 text-orange-600"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {ratio.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Corners & Radius */}
      <div className="space-y-1.5 pt-3 border-t border-slate-100">
        <label className="text-[12px] font-bold text-slate-800 uppercase tracking-wider block">
          Arrondi des Cartes
        </label>
        <div className="grid grid-cols-5 gap-1">
          {CATEGORY_RADIUS_OPTIONS.map((rad) => (
            <button
              key={rad.id}
              type="button"
              onClick={() => onSettingsChange("borderRadius", rad.id)}
              className={`py-1.5 px-1 rounded-lg border text-[11px] font-medium text-center transition-all cursor-pointer truncate ${
                currentRadius === rad.id
                  ? "bg-orange-500 border-orange-500 text-white font-bold"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {rad.label.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Hover Effects */}
      <div className="space-y-1.5 pt-3 border-t border-slate-100">
        <label className="text-[12px] font-bold text-slate-800 uppercase tracking-wider block">
          Animation au Survol
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {CATEGORY_HOVER_EFFECTS.map((eff) => (
            <button
              key={eff.id}
              type="button"
              onClick={() => onSettingsChange("hoverEffect", eff.id)}
              className={`py-1.5 px-2 rounded-lg border text-xs text-center transition-all cursor-pointer ${
                currentHover === eff.id
                  ? "bg-orange-50 border-orange-500 text-orange-600 font-bold"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {eff.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Typography & Position */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <label className="text-[12px] font-bold text-slate-800 uppercase tracking-wider block">
          Position du Titre
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: "below", label: "En dessous" },
            { id: "overlay-bottom", label: "Overlay Bas" },
            { id: "card-inside", label: "Sur la Carte" },
          ].map((pos) => (
            <button
              key={pos.id}
              type="button"
              onClick={() => onSettingsChange("textPosition", pos.id)}
              className={`py-1.5 px-2 rounded-lg border text-xs text-center transition-all cursor-pointer ${
                currentTextPos === pos.id
                  ? "bg-orange-50 border-orange-500 text-orange-600 font-bold"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {pos.label}
            </button>
          ))}
        </div>

        {/* Contrast overlay slider */}
        {currentTextPos !== "below" && (
          <div className="space-y-1 pt-2">
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>Opacité du filtre sombre</span>
              <span className="font-mono text-orange-600 font-bold">{overlayOpacity}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={90}
              step={5}
              value={overlayOpacity}
              onChange={(e) => onSettingsChange("overlayOpacity", parseInt(e.target.value, 10))}
              className="w-full accent-orange-500 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* 6. Smart Toggles (Badges, Counters, Glassmorphism) */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <label className="text-[12px] font-bold text-slate-800 uppercase tracking-wider block">
          Affichages & Badges
        </label>
        <div className="space-y-2">
          <label className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
            <span className="text-xs font-medium text-slate-800">Afficher les badges Promo/Tendance</span>
            <input
              type="checkbox"
              checked={Boolean(settings.showBadge !== false)}
              onChange={(e) => onSettingsChange("showBadge", e.target.checked)}
              className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
            <span className="text-xs font-medium text-slate-800">Compteur d'articles (ex: 24 articles)</span>
            <input
              type="checkbox"
              checked={Boolean(settings.showItemCount !== false)}
              onChange={(e) => onSettingsChange("showItemCount", e.target.checked)}
              className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
            <span className="text-xs font-medium text-slate-800">Effet Dépoli / Glassmorphism</span>
            <input
              type="checkbox"
              checked={Boolean(settings.glassmorphism)}
              onChange={(e) => onSettingsChange("glassmorphism", e.target.checked)}
              className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
