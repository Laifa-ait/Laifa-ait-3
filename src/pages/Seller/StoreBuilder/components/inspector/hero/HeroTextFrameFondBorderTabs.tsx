import React from "react";
import { RotateCcw } from "lucide-react";
import type {
  HeroBoxShadowPreset,
  HeroTextFrameConfig,
} from "../../../../../../domains/seller/customPage.types";
import type { ResolvedHeroTextFrame } from "../../../../../../components/Store/sections/hero/heroTextFrameHelper";

interface HeroTextFrameFondBorderTabsProps {
  activeTab: "fond" | "bordure";
  resolved: ResolvedHeroTextFrame;
  onPatchFrame: (patch: Partial<HeroTextFrameConfig>) => void;
}

const BORDER_STYLES: ReadonlyArray<{ id: NonNullable<HeroTextFrameConfig["borderStyle"]>; label: string }> = [
  { id: "solid", label: "Plein" },
  { id: "dashed", label: "Tirets" },
  { id: "dotted", label: "Pointillés" },
  { id: "double", label: "Double" },
];

const SHADOW_OPTIONS: ReadonlyArray<{ id: HeroBoxShadowPreset; label: string }> = [
  { id: "none", label: "Aucune" },
  { id: "sm", label: "Douce" },
  { id: "md", label: "Moyenne" },
  { id: "lg", label: "Forte" },
  { id: "floating", label: "Flottante" },
  { id: "glow", label: "Halo" },
  { id: "brutal", label: "Brutale" },
];

export const frameSegBtnClass = (active: boolean): string =>
  `h-7 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
    active
      ? "bg-slate-900 text-white border-slate-900"
      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
  }`;

export const FrameRangeField: React.FC<{
  label: string;
  valueLabel: string;
  testId: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (n: number) => void;
}> = ({ label, valueLabel, testId, min, max, step = 1, value, onChange }) => (
  <label className="block space-y-1">
    <div className="flex items-center justify-between text-[11px] text-slate-600">
      <span>{label}</span>
      <span className="font-mono tabular-nums font-semibold text-slate-800">{valueLabel}</span>
    </div>
    <input
      type="range" min={min} max={max} step={step} data-testid={testId} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-slate-900"
    />
  </label>
);

const FrameColorField: React.FC<{
  label: string;
  testId: string;
  value: string;
  showHex?: boolean;
  onChange: (hex: string) => void;
}> = ({ label, testId, value, showHex = true, onChange }) => (
  <label className="flex items-center justify-between gap-2 h-8 px-2.5 rounded-md border border-slate-200 bg-white">
    <span className="text-[11px] font-medium text-slate-600">{label}</span>
    <span className="flex items-center gap-1.5">
      {showHex && <span className="text-[10.5px] font-mono text-slate-500 uppercase">{value}</span>}
      <input
        type="color" data-testid={testId} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-5 h-5 rounded border border-slate-200 cursor-pointer bg-transparent p-0"
      />
    </span>
  </label>
);

export const HeroTextFrameFondBorderTabs: React.FC<HeroTextFrameFondBorderTabsProps> = ({
  activeTab,
  resolved,
  onPatchFrame,
}) => {
  const v = resolved.values;

  if (activeTab === "fond") {
    return (
      <div className="space-y-2.5" data-testid="hero-text-frame-panel-fond">
        <div className="grid grid-cols-2 gap-1">
          <button type="button" data-testid="hero-text-frame-fill-solid" onClick={() => onPatchFrame({ enabled: true, fillMode: "solid" })} className={frameSegBtnClass(v.fillMode === "solid")}>
            Couleur unie
          </button>
          <button type="button" data-testid="hero-text-frame-fill-gradient" onClick={() => onPatchFrame({ enabled: true, fillMode: "gradient" })} className={frameSegBtnClass(v.fillMode === "gradient")}>
            Dégradé
          </button>
        </div>

        <div className={`grid gap-2 ${v.fillMode === "gradient" ? "grid-cols-2" : "grid-cols-1"}`}>
          <FrameColorField
            label={v.fillMode === "gradient" ? "Couleur 1" : "Fond"}
            testId="hero-text-frame-bg-color"
            value={v.bgColor}
            onChange={(hex) => onPatchFrame({ enabled: true, bgColor: hex })}
          />
          {v.fillMode === "gradient" && (
            <FrameColorField
              label="Couleur 2"
              testId="hero-text-frame-gradient-color2"
              value={v.gradientColor2}
              onChange={(hex) => onPatchFrame({ enabled: true, gradientColor2: hex })}
            />
          )}
        </div>

        {v.fillMode === "gradient" && (
          <FrameRangeField
            label="Angle du dégradé" valueLabel={`${v.gradientAngle}°`} testId="hero-text-frame-gradient-angle"
            min={0} max={360} step={5} value={v.gradientAngle}
            onChange={(n) => onPatchFrame({ enabled: true, gradientAngle: n })}
          />
        )}

        <FrameRangeField
          label="Flou de verre (Glassmorphism)"
          valueLabel={v.blurPx === 0 ? "Aucun (0px)" : `${v.blurPx}px`}
          testId="hero-text-frame-blur"
          min={0}
          max={24}
          value={v.blurPx}
          onChange={(n) => onPatchFrame({ enabled: true, blurPx: n })}
        />

        <div className="grid grid-cols-2 gap-2 items-center">
          <label className="block space-y-1">
            <span className="text-[11px] text-slate-600">Ombre du cadre</span>
            <select
              data-testid="hero-text-frame-shadow" value={v.shadow}
              onChange={(e) => onPatchFrame({ enabled: true, shadow: e.target.value as HeroBoxShadowPreset })}
              className="w-full h-8 px-2 rounded-md border border-slate-200 bg-white text-[11.5px] text-slate-800 focus:border-slate-900 focus:outline-none"
            >
              {SHADOW_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </label>

          <div className="space-y-1">
            <span className="text-[11px] text-slate-600 block">Couleur d'ombre</span>
            <div className="flex items-center justify-between h-8 px-2 rounded-md border border-slate-200 bg-white">
              <span className="text-[10.5px] font-mono text-slate-500">{v.shadowColor ? v.shadowColor.toUpperCase() : "Auto"}</span>
              <div className="flex items-center gap-1">
                {v.shadowColor && (
                  <button type="button" title="Couleur d'ombre automatique" onClick={() => onPatchFrame({ shadowColor: "" })} className="p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer">
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
                <input
                  type="color" data-testid="hero-text-frame-shadow-color" value={v.shadowColor || "#0F172A"}
                  onChange={(e) => onPatchFrame({ enabled: true, shadowColor: e.target.value })}
                  className="w-5 h-5 rounded border border-slate-200 cursor-pointer bg-transparent p-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5" data-testid="hero-text-frame-panel-bordure">
      <div className="grid grid-cols-2 gap-2.5">
        <FrameRangeField label="Épaisseur" valueLabel={`${v.borderWidthPx}px`} testId="hero-text-frame-border-width" min={0} max={6} value={v.borderWidthPx} onChange={(n) => onPatchFrame({ enabled: true, borderWidthPx: n })} />
        <FrameRangeField label="Arrondi coins" valueLabel={`${v.borderRadiusPx}px`} testId="hero-text-frame-radius" min={0} max={48} value={v.borderRadiusPx} onChange={(n) => onPatchFrame({ enabled: true, borderRadiusPx: n })} />
      </div>

      <div className="space-y-1">
        <span className="text-[11px] text-slate-600 block">Style de bordure</span>
        <div className="grid grid-cols-4 gap-1">
          {BORDER_STYLES.map((st) => (
            <button key={st.id} type="button" data-testid={`hero-text-frame-border-style-${st.id}`} onClick={() => onPatchFrame({ enabled: true, borderStyle: st.id })} className={frameSegBtnClass(v.borderStyle === st.id)}>
              {st.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 items-end">
        <FrameColorField label="Couleur" testId="hero-text-frame-border-color" value={v.borderColor} showHex={false} onChange={(hex) => onPatchFrame({ enabled: true, borderColor: hex })} />
        <FrameRangeField label="Transparence bord" valueLabel={`${100 - v.borderOpacity}%`} testId="hero-text-frame-border-opacity" min={0} max={100} value={100 - v.borderOpacity} onChange={(n) => onPatchFrame({ enabled: true, borderOpacity: 100 - n })} />
      </div>
    </div>
  );
};
