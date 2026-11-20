import React from "react";
import type { HeroTextFrameConfig } from "../../../../../../domains/seller/customPage.types";
import type { ResolvedHeroTextFrame } from "../../../../../../components/Store/sections/hero/heroTextFrameHelper";

interface HeroTextFrameTransparencyBarProps {
  resolved: ResolvedHeroTextFrame;
  onPatchFrame: (patch: Partial<HeroTextFrameConfig>) => void;
}

const TRANSPARENCY_PRESETS: ReadonlyArray<number> = [0, 25, 50, 75, 100];

export const HeroTextFrameTransparencyBar: React.FC<HeroTextFrameTransparencyBarProps> = ({
  resolved,
  onPatchFrame,
}) => {
  const transparency = resolved.enabled ? 100 - resolved.values.opacity : 100;
  const previewBg = resolved.enabled ? resolved.frameStyle.background : "transparent";
  const statusLabel =
    transparency === 0 ? "Opaque" : transparency === 100 ? "Transparent" : `Opacité ${100 - transparency}%`;

  const applyTransparency = (nextTransparency: number): void => {
    const clamped = Math.min(100, Math.max(0, Math.round(nextTransparency)));
    onPatchFrame({ enabled: true, opacity: 100 - clamped });
  };

  return (
    <div
      data-testid="hero-text-frame-transparency-section"
      className="p-2.5 rounded-md border border-slate-200 bg-white space-y-2"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-800">Transparence du cadre</span>
        <span className="flex items-center gap-1.5 text-[11px]">
          <span className="text-[10.5px] text-slate-500">{statusLabel}</span>
          <span
            data-testid="hero-text-frame-transparency-value"
            className="font-mono tabular-nums font-bold text-slate-900"
          >
            {transparency}%
          </span>
        </span>
      </div>

      <div
        aria-hidden="true"
        className="relative h-3 w-full rounded overflow-hidden border border-slate-200"
        style={{
          backgroundImage: "repeating-conic-gradient(#CBD5E1 0% 25%, #FFFFFF 0% 50%)",
          backgroundSize: "10px 10px",
        }}
      >
        <div
          className="absolute inset-0 transition-all"
          style={{ background: typeof previewBg === "string" ? previewBg : undefined }}
        />
      </div>

      <input
        type="range"
        min={0}
        max={100}
        step={1}
        aria-label="Niveau de transparence du cadre"
        data-testid="hero-text-frame-transparency"
        value={transparency}
        onChange={(e) => applyTransparency(Number(e.target.value))}
        className="w-full accent-slate-900"
      />

      <div className="grid grid-cols-5 gap-1">
        {TRANSPARENCY_PRESETS.map((pct) => {
          const isActive = resolved.enabled && transparency === pct;
          return (
            <button
              key={pct}
              type="button"
              data-testid={`hero-text-frame-transparency-preset-${pct}`}
              onClick={() => applyTransparency(pct)}
              className={`h-6 rounded text-[10.5px] font-mono tabular-nums font-semibold border transition-colors cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {pct}%
            </button>
          );
        })}
      </div>
    </div>
  );
};
