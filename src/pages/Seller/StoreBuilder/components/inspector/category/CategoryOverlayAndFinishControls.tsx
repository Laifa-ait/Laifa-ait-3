import React from "react";
import { Sparkles, Eye, Move, Type, CheckCircle2, Layers } from "lucide-react";
import {
  CATEGORY_HOVER_EFFECTS,
  getCategoryLayoutCapabilities,
} from "../../../constants/categoryCanvaOptions";

interface CategoryOverlayAndFinishControlsProps {
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

  return (
    <div className="space-y-3.5 select-none">
      {/* ÉTAPE 3 : AFFICHAGE DU TITRE (AVEC TITRE / SANS TITRE) */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#011C40] text-white text-[10px] font-black flex items-center justify-center">
              3
            </span>
            Affichage du Titre sur la Carte
          </span>
          <Type className="w-3.5 h-3.5 text-[#26658C]" />
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
                ? "border-[#023859] bg-[#023859] text-white shadow-2xs"
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
                          ? "border-[#023859] bg-[#F0F7FA] text-[#011C40]"
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
                  <Layers className="w-3.5 h-3.5 text-[#26658C]" />
                  Capsule verre givré sous le titre
                </span>
                <input
                  type="checkbox"
                  checked={glassmorphism}
                  onChange={(e) => onSettingsChange("glassmorphism", e.target.checked)}
                  className="w-4 h-4 accent-[#023859] rounded cursor-pointer"
                />
              </label>
            )}

            {caps.supportsOverlayContrast && (
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-2">
                <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#54ACBF]" />
                    Contraste sous le titre
                  </span>
                  <span className="text-[#023859] font-mono font-bold">{overlayOpacity}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={85}
                  step={5}
                  value={overlayOpacity}
                  onChange={(e) => onSettingsChange("overlayOpacity", Number(e.target.value))}
                  className="w-full accent-[#023859] cursor-pointer"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ÉTAPE 4 : OPTIONS SECONDAIRES */}
      <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center">
              4
            </span>
            Animation & Détails Optionnels
          </span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <Move className="w-3 h-3 text-[#26658C]" />
            <span>Effet au survol</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {harmoniousHoverEffects.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSettingsChange("hoverEffect", opt.id)}
                className={`py-1.5 px-2 rounded-lg border text-[10px] font-semibold cursor-pointer transition-all ${
                  currentHover === opt.id
                    ? "border-[#023859] bg-[#F0F7FA] text-[#011C40] font-bold"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <label className="flex items-center justify-between py-1 cursor-pointer text-xs text-slate-700">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              Afficher un sous-titre / compteur (optionnel)
            </span>
            <input
              type="checkbox"
              checked={Boolean(settings.showItemCount)}
              onChange={(e) => onSettingsChange("showItemCount", e.target.checked)}
              className="w-4 h-4 accent-[#023859] rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between py-1 cursor-pointer text-xs text-slate-700">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              Afficher un badge sur la photo (optionnel)
            </span>
            <input
              type="checkbox"
              checked={Boolean(settings.showBadge)}
              onChange={(e) => onSettingsChange("showBadge", e.target.checked)}
              className="w-4 h-4 accent-[#023859] rounded cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
