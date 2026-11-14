import React from "react";
import { Image as ImageIcon, Sliders } from "lucide-react";
import {
  CustomPageSectionStyles,
  HeroImageFilterPreset,
  HeroShadowToken,
} from "../../../../../../domains/seller/customPage.types";

interface SectionMediaAndButtonSubPanelProps {
  activeStep: "all" | 1 | 2 | 3 | 4;
  hasImages: boolean;
  hasButtons: boolean;
  styles: CustomPageSectionStyles;
  syncHeroAndStyles: (
    stylePatch: Partial<CustomPageSectionStyles>,
    heroPatch?: Record<string, unknown>
  ) => void;
}

const FILTER_PRESETS: Array<{ id: HeroImageFilterPreset; label: string }> = [
  { id: "none", label: "Naturel" },
  { id: "warm-editorial", label: "Éditorial Chaud" },
  { id: "vivid-contrast", label: "Contraste Vif" },
  { id: "bw-art", label: "Noir & Blanc" },
  { id: "soft-matte", label: "Mat Doux" },
  { id: "golden-film", label: "Film Doré" },
];

export const SectionMediaAndButtonSubPanel: React.FC<SectionMediaAndButtonSubPanelProps> = ({
  activeStep,
  hasImages,
  hasButtons,
  styles,
  syncHeroAndStyles,
}) => {
  return (
    <>
      {/* Étape 3 : Filtres d'Image (Uniquement si la section comporte des images) */}
      {(activeStep === "all" || activeStep === 3) && hasImages && (
        <div
          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
          data-testid="section-image-filters-box"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#011C40] flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#023859]" />
              <span>Filtre Photographique des Images</span>
            </span>
            <button
              type="button"
              onClick={() => {
                const resetPatch = {
                  imageFilterPreset: "none" as const,
                  imageBrightness: 100,
                  imageContrast: 100,
                  imageSaturation: 100,
                  imageSepia: 0,
                  imageBlurPx: 0,
                };
                syncHeroAndStyles(resetPatch, resetPatch);
              }}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-900 underline cursor-pointer"
            >
              Réinitialiser
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {FILTER_PRESETS.map((fp) => (
              <button
                key={fp.id}
                type="button"
                data-testid={`section-filter-preset-${fp.id}`}
                onClick={() =>
                  syncHeroAndStyles({ imageFilterPreset: fp.id }, { imageFilterPreset: fp.id })
                }
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border cursor-pointer ${
                  (styles.imageFilterPreset || "none") === fp.id
                    ? "bg-[#023859] text-white border-[#023859]"
                    : "bg-white text-slate-700 border-slate-200"
                }`}
              >
                {fp.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
            <label>
              Luminosité ({styles.imageBrightness ?? 100}%)
              <input
                type="range"
                min={50}
                max={150}
                step={5}
                value={styles.imageBrightness ?? 100}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  syncHeroAndStyles({ imageBrightness: v }, { imageBrightness: v });
                }}
                className="w-full accent-[#023859]"
              />
            </label>
            <label>
              Contraste ({styles.imageContrast ?? 100}%)
              <input
                type="range"
                min={50}
                max={150}
                step={5}
                value={styles.imageContrast ?? 100}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  syncHeroAndStyles({ imageContrast: v }, { imageContrast: v });
                }}
                className="w-full accent-[#023859]"
              />
            </label>
            <label>
              Saturation ({styles.imageSaturation ?? 100}%)
              <input
                type="range"
                min={0}
                max={200}
                step={5}
                value={styles.imageSaturation ?? 100}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  syncHeroAndStyles({ imageSaturation: v }, { imageSaturation: v });
                }}
                className="w-full accent-[#023859]"
              />
            </label>
          </div>
        </div>
      )}

      {/* Étape 4 : Contrôle des Boutons de la Section */}
      {(activeStep === "all" || activeStep === 4) && hasButtons && (
        <div
          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
          data-testid="section-button-controls-box"
        >
          <span className="text-[11px] font-bold text-[#011C40] flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#023859]" />
            <span>Contrôle des Boutons de la Section</span>
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <select
              data-testid="section-button-style-select"
              value={styles.buttonStyle || "solid"}
              onChange={(e) => {
                const v = e.target.value as CustomPageSectionStyles["buttonStyle"];
                syncHeroAndStyles(
                  { buttonStyle: v },
                  { ctaStyle: v === "outline" ? "outline" : v === "sharp" ? "sharp" : "pill" }
                );
              }}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[10.5px] font-bold text-slate-800"
            >
              <option value="solid">Plein Standard</option>
              <option value="pill">Pilule Arrondie</option>
              <option value="sharp">Rectangle Franc</option>
              <option value="outline">Contour</option>
            </select>
            <select
              data-testid="section-button-shadow-select"
              value={styles.buttonShadow || "none"}
              onChange={(e) => {
                const v = e.target.value as HeroShadowToken;
                syncHeroAndStyles({ buttonShadow: v }, { ctaShadow: v });
              }}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[10.5px] font-bold text-slate-800"
            >
              <option value="none">Sans Ombre</option>
              <option value="sm">Ombre Douce</option>
              <option value="floating">Flottante</option>
              <option value="glow">Halo Couleur</option>
              <option value="brutal">Brutale</option>
            </select>
            <label className="text-[10px] font-bold text-slate-700 flex items-center justify-between bg-white px-2 py-1 rounded-lg border border-slate-200">
              <span>Arrondi</span>
              <input
                type="number"
                data-testid="section-button-radius-input"
                min={0}
                max={40}
                value={styles.buttonBorderRadiusPx ?? 12}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  syncHeroAndStyles({ buttonBorderRadiusPx: v }, { ctaBorderRadiusPx: v });
                }}
                className="w-10 text-right font-mono text-[10.5px]"
              />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <label className="text-[10px] font-bold text-slate-700 flex items-center justify-between bg-white px-2 py-1 rounded-lg border border-slate-200">
              <span>Fond</span>
              <input
                type="color"
                data-testid="section-button-bg-color"
                value={styles.buttonBgColor || "#023859"}
                onChange={(e) =>
                  syncHeroAndStyles({ buttonBgColor: e.target.value }, { ctaBgColor: e.target.value })
                }
                className="w-5 h-5 rounded cursor-pointer"
              />
            </label>
            <label className="text-[10px] font-bold text-slate-700 flex items-center justify-between bg-white px-2 py-1 rounded-lg border border-slate-200">
              <span>Texte</span>
              <input
                type="color"
                data-testid="section-button-text-color"
                value={styles.buttonTextColor || "#FFFFFF"}
                onChange={(e) =>
                  syncHeroAndStyles({ buttonTextColor: e.target.value }, { ctaTextColor: e.target.value })
                }
                className="w-5 h-5 rounded cursor-pointer"
              />
            </label>
            <label className="text-[10px] font-bold text-slate-700 flex items-center justify-between bg-white px-2 py-1 rounded-lg border border-slate-200">
              <span>Bordure</span>
              <input
                type="color"
                data-testid="section-button-border-color"
                value={styles.buttonBorderColor || "#023859"}
                onChange={(e) =>
                  syncHeroAndStyles({ buttonBorderColor: e.target.value }, { ctaBorderColor: e.target.value })
                }
                className="w-5 h-5 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>
      )}
    </>
  );
};
