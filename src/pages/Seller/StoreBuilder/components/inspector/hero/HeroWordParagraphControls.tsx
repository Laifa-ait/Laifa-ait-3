import React from "react";
import { AlignCenter, AlignLeft, AlignRight, ArrowUpDown, MoveHorizontal } from "lucide-react";
import type { HeroDeviceMeasureConfig } from "../../../../../../domains/seller/customPage.types";
import type { ResolvedHeroDeviceProfile } from "../../../../../../components/Store/sections/hero/heroResponsiveHelper";

interface HeroWordParagraphControlsProps {
  isTitle: boolean;
  isDesktop: boolean;
  profile: ResolvedHeroDeviceProfile;
  activeLineHeight: number;
  activeLetterSpacing: number;
  onSettingsChange: (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => void;
  onDeviceConfigChange: (patch: Partial<HeroDeviceMeasureConfig>, rootSettingsPatch?: Record<string, unknown>) => void;
}

const LINE_HEIGHT_PRESETS = [1.0, 1.1, 1.25, 1.4, 1.6] as const;
const LETTER_SPACING_PRESETS = [
  { value: -0.03, label: "Serré" },
  { value: 0, label: "Normal" },
  { value: 0.05, label: "Aéré" },
  { value: 0.1, label: "Large" },
] as const;

export const HeroWordParagraphControls: React.FC<HeroWordParagraphControlsProps> = ({
  isTitle, isDesktop, profile, activeLineHeight, activeLetterSpacing, onSettingsChange, onDeviceConfigChange,
}) => {
  return (
    <div className="space-y-2 pt-1.5 border-t border-slate-100">
      <div className="flex items-center gap-1.5">
        <div className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 p-0.5 shrink-0">
          {(
            [
              { id: "left", label: "Aligner à gauche", Icon: AlignLeft },
              { id: "center", label: "Centrer", Icon: AlignCenter },
              { id: "right", label: "Aligner à droite", Icon: AlignRight },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              aria-label={label}
              title={label}
              data-testid={`hero-word-align-${id}`}
              onClick={() => onDeviceConfigChange({ textAlign: id }, isDesktop ? { textAlignment: id } : undefined)}
              className={`h-6 w-7 rounded flex items-center justify-center cursor-pointer transition-colors ${
                profile.textAlign === id ? "bg-slate-900 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        <label
          title="Interligne"
          className="flex-1 min-w-0 h-7 px-1.5 rounded-md border border-slate-200 bg-white flex items-center gap-1 text-slate-600"
        >
          <ArrowUpDown className="w-3 h-3 shrink-0 text-slate-400" />
          <select
            aria-label="Interligne"
            data-testid="hero-word-lineheight-select"
            value={String(activeLineHeight)}
            onChange={(e) => onSettingsChange(isTitle ? "titleLineHeight" : "subtitleLineHeight", Number(e.target.value))}
            className="w-full min-w-0 bg-transparent text-[11px] font-semibold tabular-nums text-slate-800 focus:outline-none cursor-pointer"
          >
            {LINE_HEIGHT_PRESETS.map((lh) => (
              <option key={lh} value={String(lh)}>{lh.toFixed(2).replace(/0$/, "")}</option>
            ))}
          </select>
        </label>

        <label
          title="Espacement des lettres"
          className="flex-1 min-w-0 h-7 px-1.5 rounded-md border border-slate-200 bg-white flex items-center gap-1 text-slate-600"
        >
          <MoveHorizontal className="w-3 h-3 shrink-0 text-slate-400" />
          <select
            aria-label="Espacement des lettres"
            data-testid="hero-word-letterspacing-select"
            value={String(activeLetterSpacing)}
            onChange={(e) => onSettingsChange(isTitle ? "titleLetterSpacingEm" : "subtitleLetterSpacingEm", Number(e.target.value))}
            className="w-full min-w-0 bg-transparent text-[11px] font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            {LETTER_SPACING_PRESETS.map((sp) => (
              <option key={sp.value} value={String(sp.value)}>{sp.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <div className="space-y-1">
          <span className="block text-[10px] font-medium text-slate-500">Largeur du bloc</span>
          <div className="grid grid-cols-3 gap-0.5 bg-slate-100 p-0.5 rounded-md">
            {(
              [
                { v: 360 as const, label: "Étroit" },
                { v: 480 as const, label: "Moyen" },
                { v: 620 as const, label: "Large" },
              ]
            ).map((opt) => (
              <button
                key={opt.v}
                type="button"
                data-testid={`hero-word-width-${opt.v}`}
                onClick={() => onDeviceConfigChange({ textBoxMaxWidth: opt.v }, isDesktop ? { textBoxMaxWidth: opt.v } : undefined)}
                className={`h-6 rounded text-[10.5px] cursor-pointer transition-colors whitespace-nowrap ${
                  profile.textBoxMaxWidth === opt.v ? "bg-white text-slate-900 font-semibold shadow-2xs" : "text-slate-600 font-medium"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <span className="block text-[10px] font-medium text-slate-500">Écart vertical</span>
          <div className="grid grid-cols-3 gap-0.5 bg-slate-100 p-0.5 rounded-md">
            {(
              [
                { v: 8 as const, label: "Serré" },
                { v: 16 as const, label: "Normal" },
                { v: 24 as const, label: "Aéré" },
              ]
            ).map((opt) => (
              <button
                key={opt.v}
                type="button"
                data-testid={`hero-word-gap-${opt.v}`}
                onClick={() => onDeviceConfigChange({ textVerticalGap: opt.v }, isDesktop ? { textVerticalGap: opt.v } : undefined)}
                className={`h-6 rounded text-[10.5px] cursor-pointer transition-colors whitespace-nowrap ${
                  profile.textVerticalGap === opt.v ? "bg-white text-slate-900 font-semibold shadow-2xs" : "text-slate-600 font-medium"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
