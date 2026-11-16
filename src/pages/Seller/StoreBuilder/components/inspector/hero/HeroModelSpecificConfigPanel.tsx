import React from "react";
import { Palette, Sparkles } from "lucide-react";
import {
  HeroBannerSettings,
  HeroDeviceMeasureConfig,
  HeroLayoutModelId,
} from "../../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../../domains/product/product.types";
import { ResolvedHeroDeviceProfile } from "../../../../../../components/Store/sections/hero/heroResponsiveHelper";
import { HERO_COLOR_PALETTES } from "../../../constants/heroBannerModels";
import { HeroPhotoAndCtaStepPanels } from "./HeroPhotoAndCtaStepPanels";

interface HeroModelSpecificConfigPanelProps {
  activeStep?: "all" | 1 | 2 | 3 | 4;
  activeModel: HeroLayoutModelId;
  deviceTab: "desktop" | "tablet" | "mobile";
  profile: ResolvedHeroDeviceProfile;
  settings: Record<string, unknown>;
  products: Product[];
  inputClass: string;
  labelClass: string;
  onSettingsChange: (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => void;
  onDeviceConfigChange: (patch: Partial<HeroDeviceMeasureConfig>, rootSettingsPatch?: Record<string, unknown>) => void;
}

export const HeroModelSpecificConfigPanel: React.FC<HeroModelSpecificConfigPanelProps> = ({
  activeStep = 1,
  activeModel,
  deviceTab,
  profile,
  settings,
  products,
  inputClass,
  labelClass,
  onSettingsChange,
  onDeviceConfigChange,
}) => {
  const s = settings as Partial<HeroBannerSettings>;
  const isTextOverImage = activeModel === "cinema-full" || activeModel === "atelier-collage";
  const showStep2 = activeStep === "all" || activeStep === 2;

  const applyPalette = (p: (typeof HERO_COLOR_PALETTES)[number]): void => {
    onSettingsChange({
      paletteId: p.id,
      bannerBgColor: p.bannerBgColor,
      bannerBgGradient: p.bannerBgGradient,
      titleColor: p.titleColor,
      subtitleColor: p.subtitleColor,
      ctaBgColor: p.ctaBgColor,
      ctaTextColor: p.ctaTextColor,
    });
  };

  return (
    <div className="space-y-4">
      {showStep2 && (
        <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3" data-testid="hero-step-panel-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-zinc-700" /> Étape 2 — Sélecteurs de Couleur par Élément &amp; 4 Coins
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {HERO_COLOR_PALETTES.map((pal) => (
              <button
                key={pal.id}
                type="button"
                data-testid={`hero-palette-${pal.id}`}
                onClick={() => applyPalette(pal)}
                className={`p-2 rounded-xl border text-start transition-all flex items-center gap-2 cursor-pointer ${
                  s.paletteId === pal.id
                    ? "border-zinc-900 ring-1 ring-zinc-900 bg-white"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                <span className="w-4 h-4 rounded-full border border-black/15 shrink-0" style={{ backgroundColor: pal.bannerBgColor }} />
                <span className="text-[10px] font-bold text-zinc-800 truncate">{pal.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <label className="text-[9.5px] font-bold text-zinc-600 flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-zinc-200">
              <span>Fond Bannière</span>
              <input type="color" data-testid="hero-bg-color" value={s.bannerBgColor || "#FAF6F0"} onChange={(e) => onSettingsChange({ bannerBgColor: e.target.value, bannerBgGradient: "", paletteId: "custom" })} className="w-6 h-5 rounded cursor-pointer" />
            </label>
            <label className="text-[9.5px] font-bold text-zinc-600 flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-zinc-200">
              <span>Bordure Cadre</span>
              <input type="color" data-testid="hero-banner-border-color" value={s.bannerBorderColor || "#E4E7EC"} onChange={(e) => onSettingsChange("bannerBorderColor", e.target.value)} className="w-6 h-5 rounded cursor-pointer" />
            </label>
            <label className="text-[9.5px] font-bold text-zinc-600 flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-zinc-200">
              <span>Couleur Titre</span>
              <input type="color" data-testid="hero-title-color" value={s.titleColor || "#111827"} onChange={(e) => onSettingsChange({ titleColor: e.target.value, paletteId: "custom" })} className="w-6 h-5 rounded cursor-pointer" />
            </label>
            <label className="text-[9.5px] font-bold text-zinc-600 flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-zinc-200">
              <span>Couleur Phrase</span>
              <input type="color" data-testid="hero-subtitle-color" value={s.subtitleColor || "#52525B"} onChange={(e) => onSettingsChange({ subtitleColor: e.target.value, paletteId: "custom" })} className="w-6 h-5 rounded cursor-pointer" />
            </label>
            <label className="text-[9.5px] font-bold text-zinc-600 flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-zinc-200">
              <span>Fond Badge</span>
              <input type="color" data-testid="hero-badge-bg-color" value={s.badgeBgColor || "#B45309"} onChange={(e) => onSettingsChange("badgeBgColor", e.target.value)} className="w-6 h-5 rounded cursor-pointer" />
            </label>
            <label className="text-[9.5px] font-bold text-zinc-600 flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-zinc-200">
              <span>Texte Badge</span>
              <input type="color" data-testid="hero-badge-text-color" value={s.badgeTextColor || "#FFFFFF"} onChange={(e) => onSettingsChange("badgeTextColor", e.target.value)} className="w-6 h-5 rounded cursor-pointer" />
            </label>
            <label className="text-[9.5px] font-bold text-zinc-600 flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-zinc-200">
              <span>Fond Bouton</span>
              <input type="color" data-testid="hero-step2-cta-bg-color" value={s.ctaBgColor || "#111827"} onChange={(e) => onSettingsChange("ctaBgColor", e.target.value)} className="w-6 h-5 rounded cursor-pointer" />
            </label>
            <label className="text-[9.5px] font-bold text-zinc-600 flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-zinc-200">
              <span>Texte Bouton</span>
              <input type="color" data-testid="hero-step2-cta-text-color" value={s.ctaTextColor || "#FFFFFF"} onChange={(e) => onSettingsChange("ctaTextColor", e.target.value)} className="w-6 h-5 rounded cursor-pointer" />
            </label>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-zinc-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-zinc-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" /> Couleur de Chaque Coin (Mesh 4 Coins)
              </span>
              <button
                type="button"
                data-testid="hero-toggle-corner-colors"
                onClick={() =>
                  onSettingsChange({
                    useCornerColors: !s.useCornerColors,
                    cornerColorTl: s.cornerColorTl || s.bannerBgColor || "#FAF6F0",
                    cornerColorTr: s.cornerColorTr || "#F3E8D6",
                    cornerColorBr: s.cornerColorBr || "#EFE2CC",
                    cornerColorBl: s.cornerColorBl || "#FFFFFF",
                  })
                }
                className={`px-2 py-0.5 rounded-lg text-[9.5px] font-bold border cursor-pointer ${
                  s.useCornerColors ? "bg-zinc-900 text-white border-zinc-900" : "bg-zinc-50 text-zinc-600 border-zinc-200"
                }`}
              >
                {s.useCornerColors ? "✓ 4 Coins Actifs" : "Activer 4 Coins"}
              </button>
            </div>

            {s.useCornerColors && (
              <div className="grid grid-cols-2 gap-1.5" data-testid="hero-corner-colors-grid">
                <label className="text-[9.5px] font-bold text-zinc-600 flex items-center justify-between bg-zinc-50 px-2 py-1 rounded-lg border border-zinc-200">
                  <span>↖ Haut-Gauche</span>
                  <input type="color" data-testid="hero-corner-color-tl" value={s.cornerColorTl || "#FAF6F0"} onChange={(e) => onSettingsChange("cornerColorTl", e.target.value)} className="w-5 h-5 rounded cursor-pointer" />
                </label>
                <label className="text-[9.5px] font-bold text-zinc-600 flex items-center justify-between bg-zinc-50 px-2 py-1 rounded-lg border border-zinc-200">
                  <span>↗ Haut-Droit</span>
                  <input type="color" data-testid="hero-corner-color-tr" value={s.cornerColorTr || "#F3E8D6"} onChange={(e) => onSettingsChange("cornerColorTr", e.target.value)} className="w-5 h-5 rounded cursor-pointer" />
                </label>
                <label className="text-[9.5px] font-bold text-zinc-600 flex items-center justify-between bg-zinc-50 px-2 py-1 rounded-lg border border-zinc-200">
                  <span>↙ Bas-Gauche</span>
                  <input type="color" data-testid="hero-corner-color-bl" value={s.cornerColorBl || "#FFFFFF"} onChange={(e) => onSettingsChange("cornerColorBl", e.target.value)} className="w-5 h-5 rounded cursor-pointer" />
                </label>
                <label className="text-[9.5px] font-bold text-zinc-600 flex items-center justify-between bg-zinc-50 px-2 py-1 rounded-lg border border-zinc-200">
                  <span>↘ Bas-Droit</span>
                  <input type="color" data-testid="hero-corner-color-br" value={s.cornerColorBr || "#EFE2CC"} onChange={(e) => onSettingsChange("cornerColorBr", e.target.value)} className="w-5 h-5 rounded cursor-pointer" />
                </label>
              </div>
            )}
          </div>

          {isTextOverImage && (
            <div className="pt-1 border-t border-zinc-200/70 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-700">
                <span>Voile de Contraste sous le texte</span>
                <span>{s.overlayOpacity ?? 0}% {(s.overlayOpacity ?? 0) === 0 ? "(Image 100% pure)" : ""}</span>
              </div>
              <input type="range" min={0} max={60} step={5} value={Math.min(60, s.overlayOpacity ?? 0)} onChange={(e) => onSettingsChange("overlayOpacity", Number(e.target.value))} className="w-full accent-zinc-900" />
            </div>
          )}
        </div>
      )}

      <HeroPhotoAndCtaStepPanels
        activeStep={activeStep}
        activeModel={activeModel}
        deviceTab={deviceTab}
        profile={profile}
        settings={settings}
        products={products}
        inputClass={inputClass}
        labelClass={labelClass}
        onSettingsChange={onSettingsChange}
        onDeviceConfigChange={onDeviceConfigChange}
      />
    </div>
  );
};
