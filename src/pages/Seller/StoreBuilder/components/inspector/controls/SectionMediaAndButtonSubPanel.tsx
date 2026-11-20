import React from "react";
import { Image as ImageIcon, Sliders } from "lucide-react";
import {
  CustomPageSectionStyles,
  CustomPageTheme,
  HeroImageFilterPreset,
  HeroShadowToken,
} from "../../../../../../domains/seller/customPage.types";
import { DEFAULT_MODERN_THEME } from "../../../constants/studioThemeDefaults";
import { HERO_FILTER_PRESET_VALUES } from "../../../../../../components/Store/sections/hero/heroVisualEffectsHelper";

interface SectionMediaAndButtonSubPanelProps {
  activeStep: "all" | 1 | 2 | 3 | 4;
  hasImages: boolean;
  hasButtons: boolean;
  styles: CustomPageSectionStyles;
  theme?: CustomPageTheme;
  syncHeroAndStyles: (
    stylePatch: Partial<CustomPageSectionStyles>,
    heroPatch?: Record<string, unknown>
  ) => void;
}

const FILTER_PRESETS: Array<{ id: HeroImageFilterPreset; label: string }> = [
  { id: "none", label: "Originale" },
  { id: "warm-editorial", label: "Chaude" },
  { id: "vivid-contrast", label: "Contrastée" },
  { id: "bw-art", label: "Noir & Blanc" },
  { id: "soft-matte", label: "Douce" },
  { id: "golden-film", label: "Rétro" },
];

export const SectionMediaAndButtonSubPanel: React.FC<SectionMediaAndButtonSubPanelProps> = ({
  activeStep,
  hasImages,
  hasButtons,
  styles,
  theme,
  syncHeroAndStyles,
}) => {
  const activeTheme = theme || DEFAULT_MODERN_THEME;

  const applyFilterPreset = (presetId: HeroImageFilterPreset) => {
    const spec = HERO_FILTER_PRESET_VALUES[presetId];
    const patch = {
      imageFilterPreset: presetId,
      imageBrightness: spec.brightness,
      imageContrast: spec.contrast,
      imageSaturation: spec.saturation,
      imageSepia: spec.sepia,
      imageBlurPx: spec.blur,
    };
    syncHeroAndStyles(patch, patch);
  };

  return (
    <>
      {(activeStep === "all" || activeStep === 3) && hasImages && (
        <div
          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
          data-testid="section-image-filters-box"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-semibold text-slate-900 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
              <span>Retouche des photos</span>
            </span>
            <button
              type="button"
              onClick={() => applyFilterPreset("none")}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-900 underline cursor-pointer"
            >
              Rétablir
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {FILTER_PRESETS.map((fp) => (
              <button
                key={fp.id}
                type="button"
                data-testid={`section-filter-preset-${fp.id}`}
                onClick={() => applyFilterPreset(fp.id)}
                className={`h-7 px-1.5 rounded-md text-[11px] font-medium border cursor-pointer ${
                  (styles.imageFilterPreset || "none") === fp.id
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {fp.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10.5px] font-medium text-slate-700 bg-white p-2 rounded-lg border border-slate-200 tabular-nums">
            <label>
              Luminosité ({styles.imageBrightness ?? 100}%)
              <input type="range" min={50} max={150} step={5} value={styles.imageBrightness ?? 100} onChange={(e) => { const v = Number(e.target.value); syncHeroAndStyles({ imageBrightness: v }, { imageBrightness: v }); }} className="w-full accent-slate-900" />
            </label>
            <label>
              Contraste ({styles.imageContrast ?? 100}%)
              <input type="range" min={50} max={150} step={5} value={styles.imageContrast ?? 100} onChange={(e) => { const v = Number(e.target.value); syncHeroAndStyles({ imageContrast: v }, { imageContrast: v }); }} className="w-full accent-slate-900" />
            </label>
            <label>
              Couleurs ({styles.imageSaturation ?? 100}%)
              <input type="range" min={0} max={200} step={5} value={styles.imageSaturation ?? 100} onChange={(e) => { const v = Number(e.target.value); syncHeroAndStyles({ imageSaturation: v }, { imageSaturation: v }); }} className="w-full accent-slate-900" />
            </label>
          </div>
        </div>
      )}

      {(activeStep === "all" || activeStep === 4) && hasButtons && (
        <div
          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
          data-testid="section-button-controls-box"
        >
          <span className="text-[11.5px] font-semibold text-slate-900 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-600" />
            <span>Boutons de la section</span>
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <select
              data-testid="section-button-style-select"
              value={styles.buttonStyle || "solid"}
              onChange={(e) => {
                const v = e.target.value as CustomPageSectionStyles["buttonStyle"];
                const mappedCta = v === "outline" ? "outline" : v === "sharp" ? "sharp" : v === "pill" ? "pill" : "solid";
                const nextRad = v === "pill" ? 999 : v === "sharp" ? 0 : 8;
                const nextBorderW = v === "outline" ? 2 : 0;
                syncHeroAndStyles(
                  { buttonStyle: v, buttonBorderRadiusPx: nextRad, buttonBorderWidthPx: nextBorderW },
                  { ctaStyle: mappedCta, ctaBorderRadiusPx: nextRad, ctaBorderWidthPx: nextBorderW }
                );
              }}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-800"
            >
              <option value="solid">Normal</option>
              <option value="pill">Arrondi</option>
              <option value="sharp">Carré</option>
              <option value="outline">Contour</option>
            </select>
            <select
              data-testid="section-button-shadow-select"
              value={styles.buttonShadow || "none"}
              onChange={(e) => {
                const v = e.target.value as HeroShadowToken;
                syncHeroAndStyles({ buttonShadow: v }, { ctaShadow: v });
              }}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-800"
            >
              <option value="none">Sans ombre</option>
              <option value="sm">Ombre légère</option>
              <option value="floating">Flottante</option>
              <option value="glow">Lumineuse</option>
              <option value="brutal">Nette</option>
            </select>
            <label className="text-[11px] font-medium text-slate-700 flex items-center justify-between bg-white px-2 py-1 rounded-lg border border-slate-200">
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
                className="w-10 text-right font-mono text-[11px]"
              />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <label className="text-[11px] font-medium text-slate-700 flex items-center justify-between bg-white px-2 py-1 rounded-lg border border-slate-200">
              <span>Fond</span>
              <input type="color" data-testid="section-button-bg-color" value={styles.buttonBgColor || activeTheme.buttonColor} onChange={(e) => syncHeroAndStyles({ buttonBgColor: e.target.value }, { ctaBgColor: e.target.value })} className="w-5 h-5 rounded cursor-pointer" />
            </label>
            <label className="text-[11px] font-medium text-slate-700 flex items-center justify-between bg-white px-2 py-1 rounded-lg border border-slate-200">
              <span>Texte</span>
              <input type="color" data-testid="section-button-text-color" value={styles.buttonTextColor || activeTheme.buttonTextColor} onChange={(e) => syncHeroAndStyles({ buttonTextColor: e.target.value }, { ctaTextColor: e.target.value })} className="w-5 h-5 rounded cursor-pointer" />
            </label>
            <label className="text-[11px] font-medium text-slate-700 flex items-center justify-between bg-white px-2 py-1 rounded-lg border border-slate-200">
              <span>Bordure</span>
              <input type="color" data-testid="section-button-border-color" value={styles.buttonBorderColor || activeTheme.primaryColor} onChange={(e) => syncHeroAndStyles({ buttonBorderColor: e.target.value }, { ctaBorderColor: e.target.value })} className="w-5 h-5 rounded cursor-pointer" />
            </label>
          </div>
        </div>
      )}
    </>
  );
};
