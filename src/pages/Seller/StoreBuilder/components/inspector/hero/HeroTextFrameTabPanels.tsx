import React from "react";
import type {
  HeroLayoutModelId,
  HeroTextFrameConfig,
} from "../../../../../../domains/seller/customPage.types";
import type { ResolvedHeroTextFrame } from "../../../../../../components/Store/sections/hero/heroTextFrameHelper";
import {
  FrameRangeField,
  frameSegBtnClass,
  HeroTextFrameFondBorderTabs,
} from "./HeroTextFrameFondBorderTabs";

export type HeroTextFrameTabId = "fond" | "bordure" | "taille";

interface HeroTextFrameTabPanelsProps {
  activeTab: HeroTextFrameTabId;
  activeModel: HeroLayoutModelId;
  resolved: ResolvedHeroTextFrame;
  onPatchFrame: (patch: Partial<HeroTextFrameConfig>) => void;
}

const PLACEMENT_OPTIONS: ReadonlyArray<{ id: NonNullable<HeroTextFrameConfig["placement"]>; label: string }> = [
  { id: "auto", label: "Auto" },
  { id: "overlay", label: "Sur photo" },
  { id: "docked-below", label: "Dessous" },
  { id: "docked-above", label: "Au-dessus" },
];

const WIDTH_MODES: ReadonlyArray<{ id: NonNullable<HeroTextFrameConfig["maxWidthMode"]>; label: string }> = [
  { id: "auto", label: "Auto" },
  { id: "custom", label: "Sur mesure" },
  { id: "full", label: "100 %" },
];

export const HeroTextFrameTabPanels: React.FC<HeroTextFrameTabPanelsProps> = ({
  activeTab,
  activeModel,
  resolved,
  onPatchFrame,
}) => {
  if (activeTab === "fond" || activeTab === "bordure") {
    return (
      <HeroTextFrameFondBorderTabs
        activeTab={activeTab}
        resolved={resolved}
        onPatchFrame={onPatchFrame}
      />
    );
  }

  const v = resolved.values;

  return (
    <div className="space-y-2.5" data-testid="hero-text-frame-panel-taille">
      {activeModel === "atelier-collage" && (
        <div className="space-y-1">
          <span className="text-[11px] text-slate-600 block">Placement du cadre</span>
          <div className="grid grid-cols-4 gap-1">
            {PLACEMENT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                data-testid={`hero-text-frame-placement-${opt.id}`}
                onClick={() => onPatchFrame({ placement: opt.id })}
                className={frameSegBtnClass(v.placement === opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <span className="text-[11px] text-slate-600 block">Largeur du cadre</span>
        <div className="grid grid-cols-3 gap-1">
          {WIDTH_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              data-testid={`hero-text-frame-width-mode-${m.id}`}
              onClick={() => onPatchFrame({ maxWidthMode: m.id })}
              className={frameSegBtnClass(v.maxWidthMode === m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
        {v.maxWidthMode === "custom" && (
          <FrameRangeField
            label="Largeur personnalisée"
            valueLabel={`${v.maxWidthPx}px`}
            testId="hero-text-frame-max-width"
            min={240}
            max={800}
            step={10}
            value={v.maxWidthPx}
            onChange={(n) => onPatchFrame({ maxWidthPx: n })}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <FrameRangeField
          label="Marge interne X"
          valueLabel={`${v.paddingXPx}px`}
          testId="hero-text-frame-padding-x"
          min={0}
          max={64}
          value={v.paddingXPx}
          onChange={(n) => onPatchFrame({ enabled: true, paddingXPx: n })}
        />
        <FrameRangeField
          label="Marge interne Y"
          valueLabel={`${v.paddingYPx}px`}
          testId="hero-text-frame-padding-y"
          min={0}
          max={64}
          value={v.paddingYPx}
          onChange={(n) => onPatchFrame({ enabled: true, paddingYPx: n })}
        />
      </div>

      <div className="space-y-1.5 pt-1 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-600">Décalage fin (X / Y)</span>
          {(v.offsetXPx !== 0 || v.offsetYPx !== 0) && (
            <button
              type="button"
              data-testid="hero-text-frame-center-offset"
              onClick={() => onPatchFrame({ offsetXPx: 0, offsetYPx: 0 })}
              className="text-[10.5px] font-medium text-slate-600 hover:text-slate-900 underline cursor-pointer"
            >
              Centrer (0, 0)
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <FrameRangeField
            label="Décalage X"
            valueLabel={`${v.offsetXPx}px`}
            testId="hero-text-frame-offset-x"
            min={-60}
            max={60}
            value={v.offsetXPx}
            onChange={(n) => onPatchFrame({ offsetXPx: n })}
          />
          <FrameRangeField
            label="Décalage Y"
            valueLabel={`${v.offsetYPx}px`}
            testId="hero-text-frame-offset-y"
            min={-60}
            max={60}
            value={v.offsetYPx}
            onChange={(n) => onPatchFrame({ offsetYPx: n })}
          />
        </div>
      </div>
    </div>
  );
};
