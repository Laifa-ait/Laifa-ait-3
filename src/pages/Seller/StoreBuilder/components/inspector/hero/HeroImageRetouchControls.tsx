import React from "react";
import {
  HeroBannerSettings,
  HeroImageFilterPreset,
  HeroShadowToken,
} from "../../../../../../domains/seller/customPage.types";
import { HERO_FILTER_PRESET_VALUES } from "../../../../../../components/Store/sections/hero/heroVisualEffectsHelper";

interface HeroImageRetouchControlsProps {
  settings: Partial<HeroBannerSettings>;
  supportsImageShadow: boolean;
  onSettingsChange: (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => void;
}

const IMAGE_FILTER_PRESETS: Array<{ id: HeroImageFilterPreset; label: string }> = [
  { id: "none", label: "Originale" },
  { id: "warm-editorial", label: "Chaude" },
  { id: "vivid-contrast", label: "Contrastée" },
  { id: "bw-art", label: "Noir & Blanc" },
  { id: "soft-matte", label: "Douce" },
  { id: "golden-film", label: "Rétro" },
];

export const HeroImageRetouchControls: React.FC<HeroImageRetouchControlsProps> = ({
  settings: s,
  supportsImageShadow,
  onSettingsChange,
}) => {
  const imgShadowActive = Boolean(s.imageShadow && s.imageShadow !== "none");

  const handleApplyFilterPreset = (presetId: HeroImageFilterPreset): void => {
    const spec = HERO_FILTER_PRESET_VALUES[presetId];
    onSettingsChange({
      imageFilterPreset: presetId,
      imageBrightness: spec.brightness,
      imageContrast: spec.contrast,
      imageSaturation: spec.saturation,
      imageSepia: spec.sepia,
      imageBlurPx: spec.blur,
    });
  };

  return (
    <div className="space-y-2.5 pt-3 border-t border-slate-200 tabular-nums">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-slate-900">Style &amp; retouche de la photo</span>
        <button
          type="button"
          data-testid="hero-reset-image-filters-btn"
          onClick={() =>
            onSettingsChange({
              imageFilterPreset: "none",
              imageBrightness: 100,
              imageContrast: 100,
              imageSaturation: 100,
              imageSepia: 0,
              imageBlurPx: 0,
              imageShadow: "none",
              imageShadowColor: undefined,
            })
          }
          className="text-[11px] font-medium text-slate-500 hover:text-slate-900 underline cursor-pointer"
        >
          Rétablir
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1">
        {IMAGE_FILTER_PRESETS.map((fp) => (
          <button
            key={fp.id}
            type="button"
            data-testid={`hero-filter-preset-${fp.id}`}
            onClick={() => handleApplyFilterPreset(fp.id)}
            className={`h-7 px-1.5 rounded-md text-[11px] font-medium border cursor-pointer ${
              (s.imageFilterPreset || "none") === fp.id
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {fp.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600">
        <label>
          Luminosité ({s.imageBrightness ?? 100}%)
          <input
            type="range"
            data-testid="hero-filter-brightness"
            min={50}
            max={150}
            step={5}
            value={s.imageBrightness ?? 100}
            onChange={(e) => onSettingsChange("imageBrightness", Number(e.target.value))}
            className="w-full accent-slate-900"
          />
        </label>
        <label>
          Contraste ({s.imageContrast ?? 100}%)
          <input
            type="range"
            data-testid="hero-filter-contrast"
            min={50}
            max={150}
            step={5}
            value={s.imageContrast ?? 100}
            onChange={(e) => onSettingsChange("imageContrast", Number(e.target.value))}
            className="w-full accent-slate-900"
          />
        </label>
        <label>
          Couleurs ({s.imageSaturation ?? 100}%)
          <input
            type="range"
            data-testid="hero-filter-saturation"
            min={0}
            max={200}
            step={5}
            value={s.imageSaturation ?? 100}
            onChange={(e) => onSettingsChange("imageSaturation", Number(e.target.value))}
            className="w-full accent-slate-900"
          />
        </label>
        <label>
          Ton chaud ({s.imageSepia ?? 0}%) / Flou ({s.imageBlurPx ?? 0}px)
          <div className="flex gap-1">
            <input
              type="range"
              data-testid="hero-filter-sepia"
              min={0}
              max={100}
              step={5}
              value={s.imageSepia ?? 0}
              onChange={(e) => onSettingsChange("imageSepia", Number(e.target.value))}
              className="w-1/2 accent-slate-900"
            />
            <input
              type="range"
              data-testid="hero-filter-blur"
              min={0}
              max={12}
              step={1}
              value={s.imageBlurPx ?? 0}
              onChange={(e) => onSettingsChange("imageBlurPx", Number(e.target.value))}
              className="w-1/2 accent-slate-900"
            />
          </div>
        </label>
      </div>

      {supportsImageShadow && (
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[11.5px] font-medium text-slate-700">Ombre autour de la photo</span>
          <div className="flex items-center gap-1.5">
            <select
              data-testid="hero-image-shadow-select"
              value={s.imageShadow || "none"}
              onChange={(e) => onSettingsChange("imageShadow", e.target.value as HeroShadowToken)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11.5px] font-medium text-slate-800"
            >
              <option value="none">Aucune</option>
              <option value="sm">Légère</option>
              <option value="md">Moyenne</option>
              <option value="lg">Forte</option>
              <option value="floating">Flottante</option>
              <option value="glow">Lumineuse</option>
            </select>
            {imgShadowActive && (
              <input
                type="color"
                data-testid="hero-image-shadow-color"
                value={s.imageShadowColor || "#0F172A"}
                onChange={(e) => onSettingsChange("imageShadowColor", e.target.value)}
                title="Couleur d'ombre photo"
                className="w-7 h-7 rounded border border-slate-200 bg-white p-0.5 cursor-pointer"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
