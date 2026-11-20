import React, { useState } from "react";
import { ChevronDown, ChevronUp, Frame, RotateCcw } from "lucide-react";
import type {
  CustomPageTheme,
  HeroBannerSettings,
  HeroLayoutModelId,
  HeroTextFrameConfig,
} from "../../../../../../domains/seller/customPage.types";
import type { ResolvedHeroDeviceProfile } from "../../../../../../components/Store/sections/hero/heroResponsiveHelper";
import {
  HERO_TEXT_FRAME_PRESETS,
  resolveHeroTextFrame,
} from "../../../../../../components/Store/sections/hero/heroTextFrameHelper";
import {
  HeroTextFrameTabId,
  HeroTextFrameTabPanels,
} from "./HeroTextFrameTabPanels";
import { HeroTextFrameTransparencyBar } from "./HeroTextFrameTransparencyBar";

interface HeroTextFrameControlsProps {
  activeModel: HeroLayoutModelId;
  settings: Partial<HeroBannerSettings>;
  theme: CustomPageTheme;
  profile: ResolvedHeroDeviceProfile;
  onSettingsChange: (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => void;
}

const FRAME_TABS: ReadonlyArray<{ id: HeroTextFrameTabId; label: string }> = [
  { id: "fond", label: "Fond & Verre" },
  { id: "bordure", label: "Bordure" },
  { id: "taille", label: "Taille & Place" },
];

export const HeroTextFrameControls: React.FC<HeroTextFrameControlsProps> = ({
  activeModel,
  settings,
  theme,
  profile,
  onSettingsChange,
}) => {
  const defaultEnabled = activeModel === "atelier-collage";
  const resolved = resolveHeroTextFrame(settings, theme, profile, defaultEnabled);
  const [isOpen, setIsOpen] = useState<boolean>(defaultEnabled || resolved.enabled);
  const [activeTab, setActiveTab] = useState<HeroTextFrameTabId>("fond");

  const patchFrame = (patch: Partial<HeroTextFrameConfig>): void => {
    const next: HeroTextFrameConfig = {
      ...(settings.textFrame || {}),
      ...patch,
    };
    onSettingsChange("textFrame", next);
  };

  const applyPreset = (presetConfig: HeroTextFrameConfig): void => {
    const currentPlacement = settings.textFrame?.placement;
    onSettingsChange("textFrame", {
      ...(currentPlacement ? { placement: currentPlacement } : {}),
      ...presetConfig,
    });
  };

  const handleToggleEnabled = (checked: boolean): void => {
    patchFrame({ enabled: checked });
    if (checked && !isOpen) setIsOpen(true);
  };

  const handleReset = (): void => {
    onSettingsChange("textFrame", undefined);
  };

  return (
    <div
      data-testid="hero-text-frame-panel"
      className="rounded-lg border border-slate-200 bg-slate-50/70 overflow-hidden"
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white border-b border-slate-200">
        <button
          type="button"
          data-testid="hero-text-frame-expand"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-1.5 text-left text-[12px] font-semibold text-slate-900 cursor-pointer"
        >
          <Frame className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span>Cadre du texte</span>
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        <div className="flex items-center gap-2">
          {Boolean(settings.textFrame) && (
            <button
              type="button"
              data-testid="hero-text-frame-reset"
              title="Réinitialiser le cadre par défaut"
              onClick={handleReset}
              className="h-6 px-1.5 rounded text-[10.5px] font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Défaut</span>
            </button>
          )}
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700 cursor-pointer shrink-0">
            <input
              type="checkbox"
              data-testid="hero-text-frame-toggle"
              checked={resolved.enabled}
              onChange={(e) => handleToggleEnabled(e.target.checked)}
              className="accent-slate-900"
            />
            <span>{resolved.enabled ? "Activé" : "Masqué"}</span>
          </label>
        </div>
      </div>

      {isOpen && (
        <div className="p-3 space-y-3">
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-600 block">Styles rapides du cadre</span>
            <div className="grid grid-cols-3 gap-1">
              {HERO_TEXT_FRAME_PRESETS.map((preset) => {
                const isNone = preset.config.enabled === false;
                const swatchStyle: React.CSSProperties = isNone
                  ? { background: "transparent", border: "1px dashed #94A3B8" }
                  : preset.config.fillMode === "gradient"
                    ? {
                        background: `linear-gradient(${preset.config.gradientAngle ?? 135}deg, ${preset.config.bgColor}, ${preset.config.gradientColor2})`,
                        border: `1px solid ${preset.config.borderColor || "#CBD5E1"}`,
                      }
                    : {
                        backgroundColor: preset.config.opacity === 0 ? "transparent" : preset.config.bgColor,
                        border: `1px solid ${preset.config.borderColor || "#CBD5E1"}`,
                      };

                return (
                  <button
                    key={preset.id}
                    type="button"
                    data-testid={`hero-text-frame-preset-${preset.id}`}
                    onClick={() => applyPreset(preset.config)}
                    className="h-7 px-2 rounded-md border border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50 flex items-center gap-1.5 text-[10.5px] font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    <span className="w-3 h-3 rounded-[3px] shrink-0" style={swatchStyle} />
                    <span className="truncate">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <HeroTextFrameTransparencyBar resolved={resolved} onPatchFrame={patchFrame} />

          <div className="grid grid-cols-3 gap-1 p-0.5 rounded-md bg-slate-200/70">
            {FRAME_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                data-testid={`hero-text-frame-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`h-7 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {!resolved.enabled && activeTab !== "taille" && (
            <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-md border border-slate-200 bg-white text-[11px] text-slate-600">
              <span>Cadre masqué : ajuster un réglage le réactivera.</span>
              <button
                type="button"
                onClick={() => patchFrame({ enabled: true })}
                className="px-2 py-0.5 rounded bg-slate-900 text-white font-medium shrink-0 cursor-pointer"
              >
                Activer
              </button>
            </div>
          )}

          <HeroTextFrameTabPanels
            activeTab={activeTab}
            activeModel={activeModel}
            resolved={resolved}
            onPatchFrame={patchFrame}
          />
        </div>
      )}
    </div>
  );
};
