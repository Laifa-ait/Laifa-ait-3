import React from "react";
import { Check, Layers, Monitor, RotateCcw, Ruler, Smartphone, Tablet } from "lucide-react";
import {
  HeroArchShapeId, HeroBannerSettings, HeroDeviceMeasureConfig, HeroLayoutModelId, HeroShadowToken,
} from "../../../../../../domains/seller/customPage.types";
import { HERO_LAYOUT_MODELS, HERO_VISUAL_VARIANTS } from "../../../constants/heroBannerModels";
import { ResolvedHeroDeviceProfile } from "../../../../../../components/Store/sections/hero/heroResponsiveHelper";

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
  onDeviceConfigChange: (patch: Partial<HeroDeviceMeasureConfig>) => void;
}

export const HeroStep1ShapePanel: React.FC<HeroStep1ShapePanelProps> = ({
  deviceTab, profile, typedSettings, pendingAdaptation, hasCustomDeviceProfile = false, inputClass,
  onChangeDeviceTab, onRequestAdaptation, onConfirmAdaptation, onCancelAdaptation, onResetDeviceProfile,
  onSelectModel, onSettingsChange, onDeviceConfigChange,
}) => {
  const activeModel = profile.heroLayout;
  const isDesktop = deviceTab === "desktop";

  return (
    <div className="space-y-3.5 select-none" data-testid="hero-step-panel-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Ruler className="w-3.5 h-3.5 text-slate-500" /> Forme, Coins &amp; Ombre
        </span>
        {!isDesktop && (
          <span
            data-testid="hero-device-inheritance-badge"
            className={`px-2 py-0.5 rounded-md text-[9.5px] font-semibold border ${
              hasCustomDeviceProfile ? "bg-amber-50 text-amber-900 border-amber-200" : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            {hasCustomDeviceProfile ? `Profil ${deviceTab} personnalisé` : "Hérité du Desktop"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-lg">
        {([
          { id: "desktop" as const, label: "Desktop", icon: Monitor },
          { id: "tablet" as const, label: "Tablette", icon: Tablet },
          { id: "mobile" as const, label: "Mobile", icon: Smartphone },
        ]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            data-testid={`hero-device-tab-${id}`}
            onClick={() => onChangeDeviceTab(id)}
            className={`py-1.5 px-2 rounded-md text-[10.5px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer ${
              deviceTab === id ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Icon className="w-3 h-3" /> <span>{label}</span>
          </button>
        ))}
      </div>

      {!isDesktop && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-testid="hero-suggest-pc-adaptation-btn"
              onClick={onRequestAdaptation}
              className="flex-1 py-2 px-3 rounded-lg bg-white border border-slate-200 hover:border-slate-400 text-slate-800 text-[11px] font-medium flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Adapter automatiquement depuis PC
            </button>
            {hasCustomDeviceProfile && onResetDeviceProfile && (
              <button
                type="button"
                data-testid="hero-reset-device-profile-btn"
                onClick={onResetDeviceProfile}
                title="Réinitialiser ce profil appareil (hériter du Desktop)"
                className="py-2 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10.5px] font-medium flex items-center gap-1 cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3 h-3" /> <span>Hériter</span>
              </button>
            )}
          </div>
          {pendingAdaptation && (
            <div data-testid="hero-adaptation-preview-box" className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
              <p className="text-[11px] font-medium text-amber-900 tabular-nums">
                Proposition ({deviceTab}) : Hauteur {pendingAdaptation.heightPx}px · Padding {pendingAdaptation.innerPaddingPx}px
              </p>
              <div className="flex items-center gap-2">
                <button type="button" data-testid="hero-confirm-pc-adaptation-btn" onClick={onConfirmAdaptation} className="px-2.5 py-1 rounded-md bg-slate-900 text-white text-[10.5px] font-medium cursor-pointer">Confirmer</button>
                <button type="button" onClick={onCancelAdaptation} className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 text-[10.5px] font-medium cursor-pointer">Annuler</button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-1.5">
        {HERO_LAYOUT_MODELS.map((m) => {
          const isSelected = activeModel === m.id;
          return (
            <button
              key={m.id}
              type="button"
              data-testid={`hero-model-card-${m.id}`}
              onClick={() => onSelectModel(m.id)}
              className={`p-2.5 rounded-xl border text-left transition-colors flex flex-col justify-between cursor-pointer ${
                isSelected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between gap-1 w-full mb-1">
                <span className={`text-[9px] font-medium uppercase tracking-wider ${isSelected ? "text-white/75" : "text-slate-400"}`}>{m.badge}</span>
                {isSelected && <Check className="w-3 h-3 text-white shrink-0" />}
              </div>
              <div className="text-[11.5px] font-semibold leading-tight">{m.label}</div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-1">
        {HERO_VISUAL_VARIANTS.map((v) => (
          <button
            key={v.id}
            type="button"
            data-testid={`hero-variant-${v.id}`}
            onClick={() => onSettingsChange(v.patch as Record<string, unknown>)}
            className={`px-2 py-1 rounded-md text-[10px] font-medium border cursor-pointer ${
              typedSettings.heroVariant === v.id ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="space-y-1.5 pt-2.5 border-t border-slate-200 tabular-nums">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-700">
          <span>Hauteur ({deviceTab})</span>
          <span className="font-mono font-semibold text-slate-900">{profile.heightPx}px</span>
        </div>
        <input type="range" min={260} max={680} step={10} value={profile.heightPx} onChange={(e) => onDeviceConfigChange({ heightPx: Number(e.target.value) })} className="w-full accent-slate-900" />
        <div className="grid grid-cols-4 gap-1">
          {([{ label: "Compact", px: 320 }, { label: "Standard", px: 420 }, { label: "Grand", px: 520 }, { label: "Grand+", px: 640 }]).map((preset) => (
            <button key={preset.px} type="button" onClick={() => onDeviceConfigChange({ heightPx: preset.px })} className={`py-1 rounded-md text-[10px] font-medium border cursor-pointer ${profile.heightPx === preset.px ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1 bg-slate-100 p-0.5 rounded-lg">
        <button type="button" onClick={() => onSettingsChange("containerMode", "full")} className={`py-1.5 rounded-md text-[10.5px] font-medium cursor-pointer ${typedSettings.containerMode === "full" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600"}`}>Plein Écran</button>
        <button type="button" onClick={() => onSettingsChange("containerMode", "contained")} className={`py-1.5 rounded-md text-[10.5px] font-medium cursor-pointer ${typedSettings.containerMode !== "full" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600"}`}>Contenu Centré</button>
      </div>

      <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] font-semibold text-slate-900">Rayon des 4 coins ({deviceTab})</span>
          <button
            type="button"
            data-testid="hero-toggle-per-corner-radius"
            onClick={() => onSettingsChange("usePerCornerRadius", !typedSettings.usePerCornerRadius)}
            className={`px-2 py-0.5 rounded-md text-[10px] font-medium border cursor-pointer ${
              typedSettings.usePerCornerRadius ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            {typedSettings.usePerCornerRadius ? "Par coin" : "Uniforme"}
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {([{ label: "0px", r: 0 }, { label: "12px", r: 12 }, { label: "24px", r: 24 }, { label: "40px", r: 40 }]).map((b) => (
            <button key={b.r} type="button" onClick={() => { onDeviceConfigChange({ borderRadiusPx: b.r }); if (isDesktop) onSettingsChange({ borderRadiusPx: b.r, usePerCornerRadius: false }); }} className={`py-1 rounded-md text-[10px] font-medium border cursor-pointer ${!typedSettings.usePerCornerRadius && profile.borderRadiusPx === b.r ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"}`}>
              {b.label}
            </button>
          ))}
        </div>
        {typedSettings.usePerCornerRadius && (
          <div className="grid grid-cols-2 gap-2 text-[10px] font-medium text-slate-600 pt-1 tabular-nums">
            <label>↖ Haut-G ({typedSettings.borderRadiusTlPx ?? profile.borderRadiusPx}px)<input type="range" data-testid="hero-corner-radius-tl" min={0} max={80} step={4} value={typedSettings.borderRadiusTlPx ?? profile.borderRadiusPx} onChange={(e) => onSettingsChange("borderRadiusTlPx", Number(e.target.value))} className="w-full accent-slate-900" /></label>
            <label>↗ Haut-D ({typedSettings.borderRadiusTrPx ?? profile.borderRadiusPx}px)<input type="range" data-testid="hero-corner-radius-tr" min={0} max={80} step={4} value={typedSettings.borderRadiusTrPx ?? profile.borderRadiusPx} onChange={(e) => onSettingsChange("borderRadiusTrPx", Number(e.target.value))} className="w-full accent-slate-900" /></label>
            <label>↙ Bas-G ({typedSettings.borderRadiusBlPx ?? profile.borderRadiusPx}px)<input type="range" data-testid="hero-corner-radius-bl" min={0} max={80} step={4} value={typedSettings.borderRadiusBlPx ?? profile.borderRadiusPx} onChange={(e) => onSettingsChange("borderRadiusBlPx", Number(e.target.value))} className="w-full accent-slate-900" /></label>
            <label>↘ Bas-D ({typedSettings.borderRadiusBrPx ?? profile.borderRadiusPx}px)<input type="range" data-testid="hero-corner-radius-br" min={0} max={80} step={4} value={typedSettings.borderRadiusBrPx ?? profile.borderRadiusPx} onChange={(e) => onSettingsChange("borderRadiusBrPx", Number(e.target.value))} className="w-full accent-slate-900" /></label>
          </div>
        )}
        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100">
          <span className="text-[10.5px] font-medium text-slate-600 flex items-center gap-1"><Layers className="w-3 h-3" /> Ombre Bannière</span>
          <select data-testid="hero-banner-shadow-select" value={typedSettings.bannerShadow || "none"} onChange={(e) => onSettingsChange("bannerShadow", e.target.value as HeroShadowToken)} className="h-7 rounded-md border border-slate-200 bg-white px-2 text-[10.5px] font-medium text-slate-800">
            <option value="none">Aucune</option><option value="sm">Douce</option><option value="md">Moyenne</option><option value="lg">Profonde</option><option value="floating">Flottante</option><option value="glow">Halo</option><option value="brutal">Brutale</option>
          </select>
        </div>

        <div className="space-y-1 pt-1.5 border-t border-slate-100 tabular-nums">
          <div className="flex items-center justify-between text-[10.5px] font-medium text-slate-600">
            <span>{activeModel === "atelier-collage" ? `Marge Passe-Partout (${deviceTab})` : `Marge intérieure (${deviceTab})`}</span>
            <span className="font-mono font-semibold text-slate-900">{profile.innerPaddingPx}px</span>
          </div>
          <input type="range" data-testid="hero-inner-padding-slider" min={16} max={48} step={4} value={profile.innerPaddingPx} onChange={(e) => { const val = Number(e.target.value); onDeviceConfigChange({ innerPaddingPx: val }); if (isDesktop) onSettingsChange("innerPaddingPx", val); }} className="w-full accent-slate-900" />
        </div>
      </div>

      {(activeModel === "editorial-split" || activeModel === "arch-palace" || activeModel === "bento-hero") && (
        <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-200">
          <select data-testid="hero-split-proportion-select" value={profile.splitProportion} onChange={(e) => onSettingsChange("splitProportion", e.target.value)} className={inputClass}><option value="50-50">50 / 50</option><option value="60-40">60 / 40</option><option value="70-30">70 / 30</option></select>
          <select data-testid="hero-image-side-select" value={typedSettings.imageSide || "right"} onChange={(e) => onSettingsChange("imageSide", e.target.value)} className={inputClass}><option value="right">Photo Droite</option><option value="left">Photo Gauche</option></select>
          <select data-testid="hero-mobile-stack-select" value={typedSettings.mobileStackOrder || "image-first"} onChange={(e) => onSettingsChange("mobileStackOrder", e.target.value)} className={inputClass}><option value="image-first">Mob: Photo 1er</option><option value="text-first">Mob: Texte 1er</option></select>
        </div>
      )}
      {activeModel === "arch-palace" && (
        <select data-testid="hero-arch-shape-select" value={profile.archShape} onChange={(e) => onSettingsChange("archShape", e.target.value as HeroArchShapeId)} className={inputClass}><option value="roman-arch">Arche Romaine</option><option value="capsule">Capsule</option><option value="asymmetric-leaf">Feuille Asymétrique</option><option value="floating-frame">Cadre Flottant</option></select>
      )}
      {(activeModel === "bento-hero" || activeModel === "atelier-collage") && (
        <div className="space-y-1 pt-1 border-t border-slate-200 tabular-nums">
          <div className="flex items-center justify-between text-[10.5px] font-medium text-slate-700">
            <span>{activeModel === "bento-hero" ? "Espacement entre les 2 photos (Diptyque)" : "Espacement entre les visuels (Galerie)"}</span>
            <span className="font-mono font-semibold text-slate-900">{profile.diptychGapPx}px</span>
          </div>
          <input type="range" data-testid="hero-diptych-gap-slider" min={8} max={40} step={4} value={profile.diptychGapPx} onChange={(e) => onSettingsChange("diptychGapPx", Number(e.target.value))} className="w-full accent-slate-900" />
        </div>
      )}
    </div>
  );
};
