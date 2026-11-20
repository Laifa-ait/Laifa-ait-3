import React from "react";
import { RotateCcw } from "lucide-react";
import {
  CustomPageTheme,
  HeroBannerSettings,
  HeroDeviceMeasureConfig,
  HeroLayoutModelId,
} from "../../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../../domains/product/product.types";
import { ResolvedHeroDeviceProfile } from "../../../../../../components/Store/sections/hero/heroResponsiveHelper";
import {
  HERO_COLOR_PALETTES,
  buildThemeHeroPalette,
  getHeroModelCapabilities,
} from "../../../constants/heroBannerModels";
import {
  CINEMATIC_OVERLAY_DIRECTIONS,
  CINEMATIC_OVERLAY_PRESETS,
  CINEMATIC_OVERLAY_ZONES,
} from "../../../../../../components/Store/sections/CinematicBanner/cinematicBanner.defaults";
import {
  CinematicOverlayDirection,
  CinematicOverlayZone,
} from "../../../../../../components/Store/sections/CinematicBanner/cinematicBanner.types";
import { resolveCinematicBannerConfig } from "../../../../../../components/Store/sections/CinematicBanner/cinematicBanner.utils";
import { HeroPhotoAndCtaStepPanels } from "./HeroPhotoAndCtaStepPanels";
import { HeroColorElementPickers } from "./HeroColorElementPickers";
import { DEFAULT_MODERN_THEME } from "../../../constants/studioThemeDefaults";

interface HeroModelSpecificConfigPanelProps {
  activeStep?: "all" | 1 | 2 | 3 | 4;
  activeModel: HeroLayoutModelId;
  deviceTab: "desktop" | "tablet" | "mobile";
  profile: ResolvedHeroDeviceProfile;
  settings: Record<string, unknown>;
  products: Product[];
  storeTheme?: CustomPageTheme;
  inputClass: string;
  labelClass: string;
  onSettingsChange: (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => void;
  onDeviceConfigChange: (patch: Partial<HeroDeviceMeasureConfig>, rootSettingsPatch?: Record<string, unknown>) => void;
}

export const HeroModelSpecificConfigPanel: React.FC<HeroModelSpecificConfigPanelProps> = ({
  activeStep = 1, activeModel, deviceTab, profile, settings, products, storeTheme,
  inputClass, labelClass, onSettingsChange, onDeviceConfigChange,
}) => {
  const s = settings as Partial<HeroBannerSettings>;
  const theme = storeTheme || DEFAULT_MODERN_THEME;
  const caps = getHeroModelCapabilities(activeModel);
  const showStep2 = activeStep === "all" || activeStep === 2;
  const cinematicCfg = caps.supportsOverlayDirection ? resolveCinematicBannerConfig(s, theme) : null;

  const isOverlayActive = s.overlayEnabled !== false && (s.overlayOpacity ?? 0) > 0;
  const resolvedOverlayColor = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s.overlayColor || "")
    ? (s.overlayColor as string)
    : "#0A0C10";

  const applyPalette = (p: (typeof HERO_COLOR_PALETTES)[number]): void => {
    const isLightPalette = p.id === "pure-white" || p.id === "cream-earth" || p.id === "sage-linen";
    onSettingsChange({
      paletteId: p.id, bannerBgColor: p.bannerBgColor, bannerBgGradient: p.bannerBgGradient,
      titleColor: p.titleColor, subtitleColor: p.subtitleColor, ctaBgColor: p.ctaBgColor,
      ctaTextColor: p.ctaTextColor, useCornerColors: false,
      ...(activeModel === "cinema-full"
        ? {
            overlayEnabled: true,
            overlayColor: isLightPalette ? p.bannerBgColor : "#0A0C10",
            overlayOpacity: Math.max(45, s.overlayOpacity ?? 45),
          }
        : {}),
    });
  };

  const resetToTheme = (): void => {
    const tp = buildThemeHeroPalette(theme);
    onSettingsChange({
      paletteId: undefined, bannerBgColor: undefined, bannerBgGradient: "", bannerBorderColor: undefined,
      bannerBorderWidthPx: undefined, bannerShadowColor: undefined, overlayColor: undefined,
      titleColor: undefined, subtitleColor: undefined, badgeBgColor: undefined, badgeTextColor: undefined,
      ctaBgColor: undefined, ctaTextColor: undefined, ctaBorderColor: undefined, useCornerColors: false,
      ...(activeModel === "cinema-full"
        ? { titleColor: "#FFFFFF", subtitleColor: "#F4F4F5", ctaBgColor: tp.ctaBgColor, ctaTextColor: tp.ctaTextColor }
        : {}),
    });
  };

  const updateOverlay = (patch: {
    intensity?: number;
    preset?: "none" | "soft" | "medium" | "strong";
    direction?: CinematicOverlayDirection;
    zone?: CinematicOverlayZone;
    color?: string;
    enabled?: boolean;
  }) => {
    const nextIntensity = patch.intensity ?? s.overlayOpacity ?? 0;
    const nextEnabled = patch.enabled !== undefined ? patch.enabled : nextIntensity > 0;
    const prevOverlay = cinematicCfg?.overlay || {
      preset: "soft" as const, intensity: nextIntensity, direction: "radial" as const, zone: "text-only" as const,
    };
    // Si l'utilisateur choisit une direction alors que la zone est "text-only", on bascule automatiquement sur "directional-edge" pour que l'effet soit immédiatement visible
    const effectiveZone =
      patch.zone ??
      (patch.direction && prevOverlay.zone === "text-only" ? "directional-edge" : prevOverlay.zone);

    onSettingsChange({
      overlayOpacity: nextIntensity,
      overlayEnabled: nextEnabled,
      ...(patch.color !== undefined ? { overlayColor: patch.color || undefined } : {}),
      ...(cinematicCfg
        ? {
            cinematicConfig: {
              ...cinematicCfg,
              overlay: { ...prevOverlay, ...patch, zone: effectiveZone, intensity: nextIntensity },
            },
          }
        : {}),
    });
  };

  return (
    <div className="space-y-4">
      {showStep2 && (
        <div className="space-y-4 select-none" data-testid="hero-step-panel-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-semibold text-slate-900">Harmonies rapides</span>
              <button type="button" data-testid="hero-reset-colors-theme-btn" onClick={resetToTheme} className="text-[11px] font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer">
                <RotateCcw className="w-3 h-3" /> Couleurs du site
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {HERO_COLOR_PALETTES.map((pal) => (
                <button
                  key={pal.id} type="button" data-testid={`hero-palette-${pal.id}`}
                  onClick={() => applyPalette(pal)}
                  className={`h-9 px-2 rounded-lg border text-start flex items-center gap-1.5 cursor-pointer transition-all ${
                    s.paletteId === pal.id ? "border-slate-900 bg-slate-900 text-white shadow-2xs" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span className="w-5 h-5 rounded-md border border-black/15 shrink-0 flex items-center justify-center relative overflow-hidden" style={{ background: pal.bannerBgGradient || pal.bannerBgColor }}>
                    <span className="w-2.5 h-1 rounded-full" style={{ backgroundColor: pal.titleColor }} />
                    <span className="w-2 h-2 rounded-full absolute bottom-0.5 right-0.5 border border-white/40" style={{ backgroundColor: pal.ctaBgColor }} />
                  </span>
                  <span className="text-[11px] font-medium truncate">{pal.label}</span>
                </button>
              ))}
            </div>
          </div>

          {caps.supportsOverlayControls && (
            <div className="space-y-2.5 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between text-[12px] tabular-nums gap-2">
                <span className="font-semibold text-slate-900">Voile de lisibilité sur photo</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px] font-semibold text-slate-700">
                    {isOverlayActive ? `${s.overlayOpacity ?? 0}%` : "Off"}
                  </span>
                  <button
                    type="button" data-testid="hero-veil-toggle"
                    onClick={() => updateOverlay({ enabled: !isOverlayActive, intensity: !isOverlayActive ? Math.max(35, s.overlayOpacity ?? 35) : s.overlayOpacity ?? 0 })}
                    className={`h-6 px-2 rounded-md text-[10.5px] font-semibold border cursor-pointer ${
                      isOverlayActive ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    {isOverlayActive ? "Activé" : "Désactivé"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1">
                {CINEMATIC_OVERLAY_PRESETS.map((ov) => (
                  <button
                    key={ov.id} type="button" data-testid={`hero-veil-preset-${ov.id}`}
                    onClick={() => updateOverlay({ preset: ov.id, intensity: ov.intensity, enabled: ov.intensity > 0 })}
                    className={`h-7 rounded-md text-[11px] font-medium border cursor-pointer ${
                      (isOverlayActive ? s.overlayOpacity ?? 0 : 0) === ov.intensity ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {ov.label}
                  </button>
                ))}
              </div>

              {isOverlayActive && (
                <>
                  <div className="flex items-center gap-2">
                    <input
                      type="range" min={5} max={80} step={5} value={s.overlayOpacity ?? 35}
                      onChange={(e) => updateOverlay({ intensity: Number(e.target.value), enabled: true })}
                      className="flex-1 accent-slate-900 cursor-pointer"
                    />
                    <label className="h-7 px-2 rounded-md border border-slate-200 bg-white flex items-center gap-1.5 text-[10.5px] font-medium text-slate-700 shrink-0 cursor-pointer">
                      <span>Teinte</span>
                      <input
                        type="color" data-testid="hero-veil-color-input"
                        value={resolvedOverlayColor}
                        onChange={(e) => updateOverlay({ color: e.target.value, enabled: true })}
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                    </label>
                  </div>
                  {caps.supportsOverlayDirection && cinematicCfg && (
                    <div className="grid grid-cols-2 gap-1.5">
                      <select data-testid="hero-veil-zone-select" value={cinematicCfg.overlay.zone} onChange={(e) => updateOverlay({ zone: e.target.value as CinematicOverlayZone })} className={inputClass}>
                        {CINEMATIC_OVERLAY_ZONES.map((z) => <option key={z.id} value={z.id}>{z.label}</option>)}
                      </select>
                      <select data-testid="hero-veil-direction-select" value={cinematicCfg.overlay.direction} onChange={(e) => updateOverlay({ direction: e.target.value as CinematicOverlayDirection })} className={inputClass}>
                        {CINEMATIC_OVERLAY_DIRECTIONS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                      </select>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <HeroColorElementPickers
            activeModel={activeModel} settings={s} theme={theme}
            supportsBadgeAndSecondaryCta={caps.supportsBadgeAndSecondaryCta}
            onSettingsChange={onSettingsChange}
          />
        </div>
      )}

      <HeroPhotoAndCtaStepPanels
        activeStep={activeStep} activeModel={activeModel} deviceTab={deviceTab}
        profile={profile} settings={settings} products={products} storeTheme={theme}
        inputClass={inputClass} labelClass={labelClass}
        onSettingsChange={onSettingsChange} onDeviceConfigChange={onDeviceConfigChange}
      />
    </div>
  );
};
