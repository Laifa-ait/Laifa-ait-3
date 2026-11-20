import React from "react";
import { Sparkles, Type, Layers } from "lucide-react";
import {
  CATEGORY_HOVER_EFFECTS,
  getCategoryLayoutCapabilities,
} from "../../../constants/categoryCanvaOptions";

interface CategoryOverlayAndFinishControlsProps {
  mode?: "title-only" | "finish-only" | "all";
  settings: Record<string, unknown>;
  currentLayout: string;
  currentTextPos: string;
  currentHover: string;
  overlayOpacity: number;
  isOverlayActive: boolean;
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
}

export const CategoryOverlayAndFinishControls: React.FC<
  CategoryOverlayAndFinishControlsProps
> = ({
  mode = "all",
  settings,
  currentLayout,
  currentTextPos,
  currentHover,
  overlayOpacity,
  onSettingsChange,
}) => {
  const showTitle = settings.showTitle !== false && currentTextPos !== "none";
  const glassmorphism = Boolean(settings.glassmorphism);
  const caps = getCategoryLayoutCapabilities(currentLayout, currentTextPos, showTitle);

  const harmoniousHoverEffects =
    currentLayout === "pills"
      ? CATEGORY_HOVER_EFFECTS.filter((h) => ["lift", "glow", "none"].includes(h.id))
      : CATEGORY_HOVER_EFFECTS;

  const positionChoices =
    currentLayout === "bento" || currentLayout === "glass-dock"
      ? [
          { id: "overlay-bottom", label: "Sur photo (Bas)" },
          { id: "overlay-center", label: "Sur photo (Centre)" },
        ]
      : [
          { id: "below", label: "Sous la photo" },
          { id: "overlay-bottom", label: "Sur photo (Bas)" },
          { id: "overlay-center", label: "Sur photo (Centre)" },
        ];

  const showTitlePanel = mode === "all" || mode === "title-only";
  const showFinishPanel = mode === "all" || mode === "finish-only";

  return (
    <div className="space-y-3.5 select-none">
      {showTitlePanel && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-[var(--studio-primary)]" />
              Affichage du Titre sur la Carte
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() =>
                onSettingsChange({
                  showTitle: true,
                  textPosition:
                    currentTextPos === "none"
                      ? currentLayout === "bento" ||
                        currentLayout === "overlay" ||
                        currentLayout === "glass-dock"
                        ? "overlay-bottom"
                        : "below"
                      : currentTextPos,
                })
              }
              className={`py-2 px-2.5 rounded-lg border text-[11px] font-extrabold cursor-pointer transition-all ${
                showTitle
                  ? "border-[var(--studio-primary)] bg-[var(--studio-primary)] text-white shadow-2xs"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              Avec Titre
            </button>
            <button
              type="button"
              onClick={() =>
                onSettingsChange({
                  showTitle: false,
                  textPosition: "none",
                })
              }
              className={`py-2 px-2.5 rounded-lg border text-[11px] font-extrabold cursor-pointer transition-all ${
                !showTitle
                  ? "border-slate-900 bg-slate-900 text-white shadow-2xs"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              Sans Titre (Photo seule)
            </button>
          </div>

          {showTitle && (
            <div className="space-y-2.5 pt-1.5 border-t border-slate-200/70">
              {caps.supportsTextPositionChoice && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-600 block">
                    Où écrire le titre de la catégorie ?
                  </span>
                  <div className={`grid ${positionChoices.length === 2 ? "grid-cols-2" : "grid-cols-3"} gap-1.5`}>
                    {positionChoices.map((pos) => (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() =>
                          onSettingsChange({
                            showTitle: true,
                            textPosition: pos.id,
                          })
                        }
                        className={`py-2 px-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${
                          currentTextPos === pos.id
                            ? "border-[var(--studio-primary)] bg-[var(--studio-highlight-soft)] text-[var(--studio-black)]"
                            : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {caps.supportsGlassDockToggle && currentLayout !== "glass-dock" && (
                <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 cursor-pointer">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[var(--studio-primary)]" />
                    Capsule verre givré sous le titre
                  </span>
                  <input
                    type="checkbox"
                    checked={glassmorphism}
                    onChange={(e) => onSettingsChange("glassmorphism", e.target.checked)}
                    className="w-4 h-4 accent-[var(--studio-primary)] rounded cursor-pointer"
                  />
                </label>
              )}

              {caps.supportsOverlayContrast && (
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-2">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[var(--studio-focus)]" />
                      Contraste sous le titre
                    </span>
                    <span className="text-[var(--studio-primary)] font-mono font-bold tabular-nums">{overlayOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={85}
                    step={5}
                    value={overlayOpacity}
                    onChange={(e) => onSettingsChange("overlayOpacity", Number(e.target.value))}
                    className="w-full accent-[var(--studio-primary)] cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showFinishPanel && (
        <div className="rounded-xl bg-white border border-slate-200 divide-y divide-slate-100 overflow-hidden">
          <div className="p-3 space-y-2">
            <span className="text-xs font-semibold text-slate-900 block">
              Effet au survol
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {harmoniousHoverEffects.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSettingsChange("hoverEffect", opt.id)}
                  className={`py-2 px-2.5 rounded-lg border text-[11px] font-medium cursor-pointer transition-colors truncate ${
                    currentHover === opt.id
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-3 py-1 divide-y divide-slate-100">
            <label className="flex items-center justify-between py-2.5 cursor-pointer text-xs text-slate-700">
              <span>Afficher le compteur d&apos;articles</span>
              <input
                type="checkbox"
                checked={Boolean(settings.showItemCount)}
                onChange={(e) => onSettingsChange("showItemCount", e.target.checked)}
                className="w-4 h-4 accent-slate-900 rounded cursor-pointer shrink-0"
              />
            </label>

            <label className="flex items-center justify-between py-2.5 cursor-pointer text-xs text-slate-700">
              <span>Afficher le badge du rayon</span>
              <input
                type="checkbox"
                checked={Boolean(settings.showBadge)}
                onChange={(e) => onSettingsChange("showBadge", e.target.checked)}
                className="w-4 h-4 accent-slate-900 rounded cursor-pointer shrink-0"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
