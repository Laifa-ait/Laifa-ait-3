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
import { getHeroModelCapabilities } from "../../../constants/heroBannerModels";
import { FOCAL_PRESETS } from "../../../../../../components/Store/sections/CinematicBanner/cinematicBanner.defaults";
import { StudioImagePicker } from "../content/StudioImagePicker";
import { HeroImageRetouchControls } from "./HeroImageRetouchControls";
import { HeroCtaStep4Panel } from "./HeroCtaStep4Panel";

interface HeroPhotoAndCtaStepPanelsProps {
  activeStep: "all" | 1 | 2 | 3 | 4;
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

export const HeroPhotoAndCtaStepPanels: React.FC<HeroPhotoAndCtaStepPanelsProps> = ({
  activeStep, activeModel, deviceTab, profile, settings, products, storeTheme,
  inputClass, onSettingsChange, onDeviceConfigChange,
}) => {
  const s = settings as Partial<HeroBannerSettings>;
  const caps = getHeroModelCapabilities(activeModel);
  const imageFieldForDevice = deviceTab === "mobile" ? "mobileImageUrl" : deviceTab === "tablet" ? "tabletImageUrl" : "imageUrl";
  const deviceLabel = deviceTab === "desktop" ? "Ordinateur" : deviceTab === "tablet" ? "Tablette" : "Mobile";
  const hasSecondaryPhoto = caps.maxImages >= 2 && Boolean((s.secondaryImageUrl || "").trim());

  const handleFocalChange = (nextX: number, nextY: number): void => {
    const posField = deviceTab === "mobile" ? "imagePositionMobile" : deviceTab === "tablet" ? "imagePositionTablet" : "imagePositionDesktop";
    onDeviceConfigChange({ focalX: nextX, focalY: nextY }, { [posField]: `${nextX}% ${nextY}%` });
  };

  const handleZoomChange = (nextZoom: number): void => {
    const zoomField = deviceTab === "mobile" ? "imageZoomMobile" : deviceTab === "tablet" ? "imageZoomTablet" : "imageZoomDesktop";
    onDeviceConfigChange({ zoom: nextZoom }, { [zoomField]: nextZoom });
  };

  const showStep3 = activeStep === "all" || activeStep === 3;
  const showStep4 = activeStep === "all" || activeStep === 4;

  return (
    <div className="space-y-4">
      {showStep3 && (
        <div className="space-y-4 select-none" data-testid="hero-step-panel-3">
          <div className="space-y-2.5">
            <StudioImagePicker
              label={`Photo principale (${deviceLabel})`}
              value={(s[imageFieldForDevice] as string) || s.imageUrl || ""}
              onChange={(val) => onSettingsChange(imageFieldForDevice, val)}
              products={products}
            />

            {caps.maxImages >= 2 && (
              <StudioImagePicker
                label={activeModel === "bento-hero" ? "2e photo (recommandée pour le diptyque)" : "2e photo (optionnelle)"}
                value={s.secondaryImageUrl || ""}
                onChange={(val) => onSettingsChange("secondaryImageUrl", val)}
                products={products}
              />
            )}

            {caps.maxImages >= 3 && (
              <StudioImagePicker
                label="3e photo (optionnelle)"
                value={s.tertiaryImageUrl || ""}
                onChange={(val) => onSettingsChange("tertiaryImageUrl", val)}
                products={products}
              />
            )}
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-200">
            <span className="block text-[12px] font-semibold text-slate-900">Affichage dans le cadre</span>
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button" onClick={() => onSettingsChange("imageFit", "cover")}
                className={`h-7 rounded-md text-[11.5px] cursor-pointer ${(s.imageFit || "cover") === "cover" ? "bg-white text-slate-900 font-semibold shadow-2xs" : "text-slate-600 font-medium"}`}
              >
                Remplir tout le cadre
              </button>
              <button
                type="button" onClick={() => onSettingsChange("imageFit", "contain")}
                className={`h-7 rounded-md text-[11.5px] cursor-pointer ${s.imageFit === "contain" ? "bg-white text-slate-900 font-semibold shadow-2xs" : "text-slate-600 font-medium"}`}
              >
                Voir l&apos;image entière
              </button>
            </div>
            {s.imageFit === "contain" && (
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[11.5px] font-medium text-slate-700">Fond autour de la photo</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    data-testid="hero-image-studio-bg-color"
                    value={s.imageStudioBg || "#F4F4F5"}
                    onChange={(e) => onSettingsChange("imageStudioBg", e.target.value)}
                    className="w-7 h-7 rounded border border-slate-200 bg-white p-0.5 cursor-pointer"
                  />
                  {s.imageStudioBg && (
                    <button
                      type="button"
                      data-testid="hero-image-studio-bg-reset"
                      onClick={() => onSettingsChange("imageStudioBg", undefined)}
                      className="text-[11px] font-medium text-slate-500 hover:text-slate-900 underline cursor-pointer"
                    >
                      Transparent
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2.5 pt-3 border-t border-slate-200 tabular-nums">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-slate-900">Cadrage &amp; Zoom ({deviceLabel})</span>
              <button
                type="button"
                onClick={() => { handleFocalChange(50, 50); handleZoomChange(1); }}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Centrer
              </button>
            </div>

            <div className="grid grid-cols-5 gap-1">
              {FOCAL_PRESETS.map((fp) => (
                <button
                  key={fp.id} type="button" onClick={() => handleFocalChange(fp.x, fp.y)}
                  className={`h-7 rounded-md text-[11px] font-medium border cursor-pointer ${
                    profile.focalX === fp.x && profile.focalY === fp.y
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {fp.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] font-medium text-slate-600">
              <label>
                Gauche ↔ Droite ({profile.focalX}%)
                <input type="range" data-testid="hero-focal-x-slider" min={0} max={100} value={profile.focalX} onChange={(e) => handleFocalChange(Number(e.target.value), profile.focalY)} className="w-full accent-slate-900" />
              </label>
              <label>
                Haut ↕ Bas ({profile.focalY}%)
                <input type="range" data-testid="hero-focal-y-slider" min={0} max={100} value={profile.focalY} onChange={(e) => handleFocalChange(profile.focalX, Number(e.target.value))} className="w-full accent-slate-900" />
              </label>
              <label>
                Zoom ({Math.round(profile.zoom * 100)}%)
                <input type="range" data-testid="hero-zoom-slider" min={100} max={200} step={5} value={Math.round(profile.zoom * 100)} onChange={(e) => handleZoomChange(Number(e.target.value) / 100)} className="w-full accent-slate-900" />
              </label>
            </div>

            {hasSecondaryPhoto && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-semibold text-slate-800">Cadrage de la 2e photo</span>
                  <button
                    type="button"
                    onClick={() => onSettingsChange({ secondaryFocalX: 50, secondaryFocalY: 50 })}
                    className="text-[11px] font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Centrer
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600">
                  <label>
                    Gauche ↔ Droite ({profile.secondaryFocalX}%)
                    <input type="range" data-testid="hero-secondary-focal-x-slider" min={0} max={100} value={profile.secondaryFocalX} onChange={(e) => onSettingsChange("secondaryFocalX", Number(e.target.value))} className="w-full accent-slate-900" />
                  </label>
                  <label>
                    Haut ↕ Bas ({profile.secondaryFocalY}%)
                    <input type="range" data-testid="hero-secondary-focal-y-slider" min={0} max={100} value={profile.secondaryFocalY} onChange={(e) => onSettingsChange("secondaryFocalY", Number(e.target.value))} className="w-full accent-slate-900" />
                  </label>
                </div>
              </div>
            )}
          </div>

          <HeroImageRetouchControls
            settings={s}
            supportsImageShadow={caps.supportsImageShadow}
            onSettingsChange={onSettingsChange}
          />

          <div className="space-y-1.5 pt-3 border-t border-slate-200">
            <label className="block text-[11.5px] font-medium text-slate-700">
              Description de la photo (SEO &amp; accessibilité)
            </label>
            <input
              data-testid="hero-image-alt-input"
              value={s.imageAlt || ""}
              onChange={(e) => onSettingsChange("imageAlt", e.target.value)}
              placeholder="Ex : Nouvelle collection automne-hiver en vitrine"
              className={inputClass}
            />
          </div>
        </div>
      )}

      {showStep4 && (
        <HeroCtaStep4Panel
          activeModel={activeModel} deviceTab={deviceTab} profile={profile}
          settings={settings} products={products} storeTheme={storeTheme}
          inputClass={inputClass} onSettingsChange={onSettingsChange} onDeviceConfigChange={onDeviceConfigChange}
        />
      )}
    </div>
  );
};
