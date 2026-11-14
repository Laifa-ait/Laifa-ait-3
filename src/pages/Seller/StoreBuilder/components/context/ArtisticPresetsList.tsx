import React from "react";
import { Check } from "lucide-react";
import { CustomPageTheme } from "../../../../../domains/seller/customPage.types";
import { ARTISTIC_STUDIO_PRESETS, ArtisticStudioPreset } from "../../constants/fiveActsLayoutPreset";

interface ArtisticPresetsListProps {
  theme: CustomPageTheme;
  isAr: boolean;
  onSelectPreset: (preset: ArtisticStudioPreset) => void;
}

export const ArtisticPresetsList: React.FC<ArtisticPresetsListProps> = ({
  theme,
  isAr,
  onSelectPreset,
}) => (
  <div className="grid grid-cols-1 gap-2">
    {ARTISTIC_STUDIO_PRESETS.map((preset) => {
      const pt = preset.theme;
      const isMatched =
        theme.canvasColor?.toLowerCase() === (pt.canvasColor || "").toLowerCase() &&
        theme.primaryColor?.toLowerCase() === pt.primaryColor.toLowerCase() &&
        theme.sector === pt.sector;

      return (
        <button
          key={preset.id}
          type="button"
          data-testid={`artistic-preset-${preset.id}`}
          onClick={() => onSelectPreset(preset)}
          className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer space-y-2 ${
            isMatched
              ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900/15"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div
            className="w-full rounded-lg p-2.5 border flex items-center justify-between gap-2"
            style={{
              backgroundColor: pt.canvasColor,
              borderColor: pt.borderColor || "#E5E7EB",
            }}
          >
            <div className="min-w-0 space-y-0.5">
              <span
                className="text-[9px] font-semibold uppercase tracking-wider block"
                style={{ color: pt.primaryColor }}
              >
                {pt.sector}
              </span>
              <div
                className="text-[12px] font-bold leading-tight truncate"
                style={{
                  color: pt.secondaryColor,
                  fontFamily: pt.headingFontFamily || pt.fontFamily,
                }}
              >
                {isAr ? preset.nameAr : preset.nameFr}
              </div>
            </div>

            <div
              className="shrink-0 px-2 py-1 border flex items-center gap-2"
              style={{
                backgroundColor: pt.surfaceColor,
                borderColor: pt.borderColor || "#E5E7EB",
                borderRadius: `${Math.min(10, pt.borderRadiusPx ?? 8)}px`,
              }}
            >
              <span className="text-[10px] font-bold tabular-nums" style={{ color: pt.priceColor || pt.primaryColor }}>
                14 500 DA
              </span>
              <span
                className="px-1.5 py-0.5 text-[8.5px] font-semibold"
                style={{
                  backgroundColor: pt.buttonColor || pt.primaryColor,
                  color: pt.buttonTextColor || "#FFFFFF",
                  borderRadius: `${Math.min(6, pt.borderRadiusPx ?? 6)}px`,
                }}
              >
                {isMatched ? "Actif" : "Choisir"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 px-0.5">
            <span className="text-[10.5px] text-slate-500 truncate">
              {isAr ? preset.subtitleAr : preset.subtitleFr}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {[pt.canvasColor, pt.surfaceColor, pt.secondaryColor, pt.primaryColor, pt.accentColor].map((c, idx) => (
                <span key={idx} className="w-2.5 h-2.5 rounded-full border border-black/15" style={{ backgroundColor: c }} />
              ))}
              {isMatched && <Check className="w-3.5 h-3.5 text-slate-900 ml-0.5" />}
            </div>
          </div>
        </button>
      );
    })}
  </div>
);
