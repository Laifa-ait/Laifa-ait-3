import React from "react";
import { RotateCcw } from "lucide-react";
import { HeroBannerSettings, HeroShadowToken } from "../../../../../../domains/seller/customPage.types";

interface HeroShadowControlsBoxProps {
  typedSettings: HeroBannerSettings;
  isFloating: boolean;
  inputClass: string;
  onSettingsChange: (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => void;
}

export const HeroShadowControlsBox: React.FC<HeroShadowControlsBoxProps> = ({
  typedSettings,
  isFloating,
  inputClass,
  onSettingsChange,
}) => {
  const shadowToken: HeroShadowToken = typedSettings.bannerShadow || (isFloating ? "floating" : "none");
  const isShadowActive = typedSettings.bannerShadowEnabled !== false && shadowToken !== "none";
  const resolvedShadowHex = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(typedSettings.bannerShadowColor || "")
    ? (typedSettings.bannerShadowColor as string)
    : "#0F172A";

  return (
    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2" data-testid="hero-shadow-controls-box">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11.5px] font-semibold text-slate-900">Ombre de la bannière</span>
        <button
          type="button"
          data-testid="hero-shadow-enabled-toggle"
          onClick={() => {
            if (isShadowActive) {
              onSettingsChange({ bannerShadowEnabled: false, bannerShadow: "none" });
            } else {
              onSettingsChange({
                bannerShadowEnabled: true,
                bannerShadow: shadowToken !== "none" ? shadowToken : "floating",
              });
            }
          }}
          className={`h-6 px-2.5 rounded-md text-[10.5px] font-semibold border cursor-pointer transition-colors ${
            isShadowActive ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
          }`}
        >
          {isShadowActive ? "Activée" : "Désactivée"}
        </button>
      </div>

      {isShadowActive && (
        <div className="grid grid-cols-2 gap-1.5">
          <select
            data-testid="hero-banner-shadow-style-select"
            value={shadowToken}
            onChange={(e) => {
              const v = e.target.value as HeroShadowToken;
              onSettingsChange({ bannerShadow: v, bannerShadowEnabled: v !== "none" });
            }}
            className={inputClass}
          >
            <option value="sm">Légère</option>
            <option value="md">Moyenne</option>
            <option value="lg">Forte</option>
            <option value="floating">Flottante</option>
            <option value="glow">Halo lumineux</option>
            <option value="brutal">Nette décalée</option>
          </select>

          <div className="h-9 px-2 rounded-lg border border-slate-200 bg-white flex items-center justify-between gap-1.5">
            <span className="text-[11px] font-medium text-slate-700 truncate">Couleur</span>
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="color"
                data-testid="hero-shadow-color-input"
                value={resolvedShadowHex}
                onChange={(e) => onSettingsChange("bannerShadowColor", e.target.value)}
                className="w-5 h-5 rounded cursor-pointer"
              />
              {typedSettings.bannerShadowColor && (
                <button
                  type="button"
                  data-testid="hero-shadow-color-reset"
                  title="Réinitialiser la couleur d'ombre"
                  onClick={() => onSettingsChange("bannerShadowColor", undefined)}
                  className="p-0.5 text-slate-400 hover:text-slate-900 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
