import React from "react";
import {
  HeroArchShapeId,
  HeroBannerSettings,
  HeroDeviceMeasureConfig,
  HeroLayoutModelId,
} from "../../../../../../domains/seller/customPage.types";
import { ResolvedHeroDeviceProfile } from "../../../../../../components/Store/sections/hero/heroResponsiveHelper";
import { HeroModelGridAndDeviceBar } from "./HeroModelGridAndDeviceBar";
import { HeroShadowControlsBox } from "./HeroShadowControlsBox";
import { useStudioStore } from "../../../store/useStudioStore";

interface HeroStep1ShapePanelProps {
  deviceTab: "desktop" | "tablet" | "mobile";
  profile: ResolvedHeroDeviceProfile;
  typedSettings: HeroBannerSettings;
  pendingAdaptation: HeroDeviceMeasureConfig | null;
  hasCustomDeviceProfile?: boolean;
  inputClass: string;
  onChangeDeviceTab: (dev: "desktop" | "tablet" | "mobile") => void;
  onRequestAdaptation: () => void;
  onConfirmAdaptation: () => void;
  onCancelAdaptation: () => void;
  onResetDeviceProfile?: () => void;
  onSelectModel: (id: HeroLayoutModelId) => void;
  onSettingsChange: (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => void;
  onDeviceConfigChange: (patch: Partial<HeroDeviceMeasureConfig>, rootSettingsPatch?: Record<string, unknown>) => void;
}

const HEIGHT_PRESETS = [
  { label: "Petite", px: 320 },
  { label: "Moyenne", px: 420 },
  { label: "Grande", px: 520 },
  { label: "Très grande", px: 640 },
];

export const HeroStep1ShapePanel: React.FC<HeroStep1ShapePanelProps> = ({
  deviceTab, profile, typedSettings, pendingAdaptation, hasCustomDeviceProfile = false, inputClass,
  onChangeDeviceTab, onRequestAdaptation, onConfirmAdaptation, onCancelAdaptation, onResetDeviceProfile,
  onSelectModel, onSettingsChange, onDeviceConfigChange,
}) => {
  const activeModel = profile.heroLayout;
  const isDesktop = deviceTab === "desktop";
  const deviceLabel = isDesktop ? "Ordinateur" : deviceTab === "tablet" ? "Tablette" : "Mobile";

  const isFloating = Boolean(typedSettings.bannerFloating);
  const isFullEdge =
    !isFloating &&
    (typedSettings.containerMode === "full" ||
      (Boolean(typedSettings.fullTopWidth) && typedSettings.containerMode !== "contained") ||
      (activeModel === "cinema-full" && typedSettings.containerMode !== "contained"));
  const presentationMode: "full" | "contained" | "floating" = isFloating ? "floating" : isFullEdge ? "full" : "contained";

  const handlePresentationPick = (mode: "full" | "contained" | "floating"): void => {
    if (mode === "full") {
      onSettingsChange({ containerMode: "full", fullTopWidth: true, bannerFloating: false });
    } else if (mode === "floating") {
      const nextShadow = typedSettings.bannerShadow && typedSettings.bannerShadow !== "none" ? typedSettings.bannerShadow : "floating";
      onSettingsChange({
        containerMode: "contained", fullTopWidth: false, bannerFloating: true,
        bannerShadow: nextShadow, bannerShadowEnabled: typedSettings.bannerShadowEnabled !== false,
        ...(profile.borderRadiusPx === 0 ? { borderRadiusPx: 24 } : {}),
      });
    } else {
      onSettingsChange({ containerMode: "contained", fullTopWidth: false, bannerFloating: false });
    }
  };

  return (
    <div className="space-y-4 select-none" data-testid="hero-step-panel-1">
      <HeroModelGridAndDeviceBar
        deviceTab={deviceTab} activeModel={activeModel} pendingAdaptation={pendingAdaptation}
        hasCustomDeviceProfile={hasCustomDeviceProfile} onChangeDeviceTab={onChangeDeviceTab}
        onRequestAdaptation={onRequestAdaptation} onConfirmAdaptation={onConfirmAdaptation}
        onCancelAdaptation={onCancelAdaptation} onResetDeviceProfile={onResetDeviceProfile} onSelectModel={onSelectModel}
      />

      <div className="space-y-3 pt-3 border-t border-slate-200 tabular-nums">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-semibold text-slate-900">Hauteur ({deviceLabel})</span>
            <span className="font-mono text-[11.5px] font-semibold text-slate-900">{profile.heightPx}px</span>
          </div>
          <input
            type="range" data-testid="hero-height-slider" min={260} max={680} step={10} value={profile.heightPx}
            onChange={(e) => onDeviceConfigChange({ heightPx: Number(e.target.value) }, isDesktop ? { heightPx: Number(e.target.value) } : undefined)}
            className="w-full accent-slate-900 cursor-pointer"
          />
          <div className="grid grid-cols-4 gap-1">
            {HEIGHT_PRESETS.map((preset) => (
              <button
                key={preset.px} type="button" data-testid={`hero-height-preset-${preset.px}`}
                onClick={() => onDeviceConfigChange({ heightPx: preset.px }, isDesktop ? { heightPx: preset.px } : undefined)}
                className={`h-7 rounded-md text-[11px] font-medium border cursor-pointer ${
                  profile.heightPx === preset.px ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="block text-[12px] font-semibold text-slate-900">Largeur &amp; style de pose</span>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
            {([
              { id: "full", testId: "hero-width-full-btn", label: "Plein bord" },
              { id: "contained", testId: "hero-width-contained-btn", label: "Largeur site" },
              { id: "floating", testId: "hero-width-floating-btn", label: "Flottante" },
            ] as const).map((opt) => (
              <button
                key={opt.id} type="button" data-testid={opt.testId}
                onClick={() => handlePresentationPick(opt.id)}
                className={`h-8 rounded-md text-[11px] cursor-pointer transition-colors ${
                  presentationMode === opt.id ? "bg-white text-slate-900 font-semibold shadow-2xs" : "text-slate-600 hover:text-slate-900 font-medium"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-[10.5px] text-slate-500">
            {presentationMode === "full"
              ? "Couvre 100 % de la largeur de gauche à droite, sans marge."
              : presentationMode === "floating"
                ? "Carte détachée avec relief flottant et marges tout autour."
                : "Alignée sur la largeur standard de votre boutique."}
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-slate-200 tabular-nums">
        <HeroShadowControlsBox
          typedSettings={typedSettings} isFloating={isFloating}
          inputClass={inputClass} onSettingsChange={onSettingsChange}
        />

        <button
          type="button"
          data-testid="hero-goto-design-tab-btn"
          onClick={() => useStudioStore.getState().setActiveInspectorTab("style")}
          className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 flex items-center justify-between cursor-pointer transition-colors"
        >
          <span>Coins arrondis, bordures &amp; marges</span>
          <span className="text-[10.5px] text-slate-900">Onglet Design →</span>
        </button>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11.5px] font-medium text-slate-700">
            <span>{activeModel === "atelier-collage" ? "Marge du cadre autour de l'image" : "Espace intérieur"}</span>
            <span className="font-mono font-semibold text-slate-900">{profile.innerPaddingPx}px</span>
          </div>
          <input
            type="range" data-testid="hero-inner-padding-slider" min={16} max={48} step={4} value={profile.innerPaddingPx}
            onChange={(e) => {
              const val = Number(e.target.value);
              onDeviceConfigChange({ innerPaddingPx: val }, isDesktop ? { innerPaddingPx: val } : undefined);
            }}
            className="w-full accent-slate-900"
          />
        </div>
      </div>

      {(activeModel === "editorial-split" || activeModel === "arch-palace" || activeModel === "bento-hero") && (
        <div className="space-y-2 pt-3 border-t border-slate-200">
          <span className="block text-[12px] font-semibold text-slate-900">
            {activeModel === "bento-hero" ? "Disposition des photos & mobile" : "Disposition texte & photo"}
          </span>
          {activeModel === "bento-hero" && !profile.hasSecondaryImage ? (
            <div className="space-y-1.5">
              <p className="text-[11px] text-slate-500">
                Ajoutez une 2e photo à l&apos;étape 3 pour répartir les deux visuels côte à côte.
              </p>
              <select data-testid="hero-mobile-stack-select" value={typedSettings.mobileStackOrder || "image-first"} onChange={(e) => onSettingsChange("mobileStackOrder", e.target.value)} className={inputClass}>
                <option value="image-first">Mobile : photo en haut</option>
                <option value="text-first">Mobile : texte en haut</option>
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              <select data-testid="hero-split-proportion-select" value={profile.splitProportion} onChange={(e) => onSettingsChange("splitProportion", e.target.value)} className={inputClass}>
                <option value="50-50">50% / 50%</option>
                <option value="60-40">{activeModel === "bento-hero" ? "Photo 1 : 60%" : "Photo 60%"}</option>
                <option value="70-30">{activeModel === "bento-hero" ? "Photo 1 : 70%" : "Photo 70%"}</option>
              </select>
              <select data-testid="hero-image-side-select" value={typedSettings.imageSide || "right"} onChange={(e) => onSettingsChange("imageSide", e.target.value)} className={inputClass}>
                <option value="right">{activeModel === "bento-hero" ? "Photo 1 à gauche" : "Photo à droite"}</option>
                <option value="left">{activeModel === "bento-hero" ? "Photo 2 à gauche" : "Photo à gauche"}</option>
              </select>
              <select data-testid="hero-mobile-stack-select" value={typedSettings.mobileStackOrder || "image-first"} onChange={(e) => onSettingsChange("mobileStackOrder", e.target.value)} className={inputClass}>
                <option value="image-first">Mobile : photo haut</option>
                <option value="text-first">Mobile : texte haut</option>
              </select>
            </div>
          )}
        </div>
      )}

      {activeModel === "arch-palace" && (
        <div className="space-y-1.5 pt-2">
          <label className="block text-[12px] font-semibold text-slate-900">Forme de la découpe photo</label>
          <select data-testid="hero-arch-shape-select" value={profile.archShape} onChange={(e) => onSettingsChange("archShape", e.target.value as HeroArchShapeId)} className={inputClass}>
            <option value="roman-arch">Arche</option>
            <option value="capsule">Rond / Ovale</option>
            <option value="asymmetric-leaf">Feuille arrondie</option>
            <option value="floating-frame">Cadre simple</option>
          </select>
        </div>
      )}

      {activeModel === "atelier-collage" && (
        <div className="space-y-1.5 pt-3 border-t border-slate-200">
          <label className="block text-[12px] font-semibold text-slate-900">Ordre sur téléphone (Mobile)</label>
          <select
            data-testid="hero-mobile-stack-select"
            value={typedSettings.mobileStackOrder || "image-first"}
            onChange={(e) => onSettingsChange("mobileStackOrder", e.target.value)}
            className={inputClass}
          >
            <option value="image-first">Mobile : photo en haut, texte dessous</option>
            <option value="text-first">Mobile : texte en haut, photo dessous</option>
          </select>
        </div>
      )}

      {(activeModel === "bento-hero" || activeModel === "atelier-collage") &&
        Boolean(profile.secondaryImageSrc || profile.tertiaryImageSrc) && (
        <div className="space-y-1 pt-2 tabular-nums">
          <div className="flex items-center justify-between text-[11.5px] font-medium text-slate-700">
            <span>Espace entre les photos</span>
            <span className="font-mono font-semibold text-slate-900">{profile.diptychGapPx}px</span>
          </div>
          <input type="range" data-testid="hero-diptych-gap-slider" min={8} max={40} step={4} value={profile.diptychGapPx} onChange={(e) => onSettingsChange("diptychGapPx", Number(e.target.value))} className="w-full accent-slate-900" />
        </div>
      )}
    </div>
  );
};
