import React, { useState } from "react";
import { Check, Eye } from "lucide-react";
import { CustomPageTheme } from "../../../../../domains/seller/customPage.types";
import {
  ARTISTIC_STUDIO_PRESETS,
  ATELIER_PREMIUM_REFERENCE_PRESETS,
  ArtisticStudioPreset,
} from "../../constants/artisticStudioPresets";

interface ArtisticPresetsListProps {
  theme: CustomPageTheme;
  isAr: boolean;
  onSelectPreset: (preset: ArtisticStudioPreset) => void;
  onPreviewPreset?: (preset: ArtisticStudioPreset) => void;
}

type PresetCollectionFilter = "all" | "atelier_reference" | "patrimoine_secteur";

export const ArtisticPresetsList: React.FC<ArtisticPresetsListProps> = ({
  theme,
  isAr,
  onSelectPreset,
  onPreviewPreset,
}) => {
  const [filter, setFilter] = useState<PresetCollectionFilter>("all");
  const visiblePresets =
    filter === "atelier_reference"
      ? ATELIER_PREMIUM_REFERENCE_PRESETS
      : filter === "patrimoine_secteur"
        ? ARTISTIC_STUDIO_PRESETS.filter((p) => p.collection !== "atelier_premium")
        : ARTISTIC_STUDIO_PRESETS;

  return (
    <div className="space-y-2.5" data-testid="artistic-presets-list">
      <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
        {([
          { id: "all", labelFr: `Tous (${ARTISTIC_STUDIO_PRESETS.length})`, labelAr: "الكل" },
          { id: "atelier_reference", labelFr: `Studio (${ATELIER_PREMIUM_REFERENCE_PRESETS.length})`, labelAr: "الاستوديو (5)" },
          { id: "patrimoine_secteur", labelFr: "Secteurs (9)", labelAr: "القطاعات (9)" },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            type="button"
            data-testid={`preset-filter-${tab.id}`}
            onClick={() => setFilter(tab.id)}
            className={`flex-1 py-1 px-1.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
              filter === tab.id ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {isAr ? tab.labelAr : tab.labelFr}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2">
        {visiblePresets.map((preset) => {
          const pt = preset.theme;
          const isMatched =
            theme.presetId === preset.id ||
            (theme.canvasColor?.toLowerCase() === (pt.canvasColor || "").toLowerCase() &&
              theme.primaryColor?.toLowerCase() === pt.primaryColor.toLowerCase() &&
              theme.sector === pt.sector);

          return (
            <div
              key={preset.id}
              className={`p-2.5 rounded-xl border text-left transition-colors space-y-2 ${
                isMatched
                  ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900/15"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <button
                type="button"
                data-testid={`artistic-preset-${preset.id}`}
                onClick={() => onSelectPreset(preset)}
                className="w-full rounded-lg p-2.5 border flex items-center justify-between gap-2 text-left cursor-pointer"
                style={{
                  backgroundColor: pt.canvasColor,
                  borderColor: pt.borderColor || "var(--studio-border)",
                }}
              >
                <div className="min-w-0 space-y-0.5">
                  <span
                    className="text-[9px] font-semibold uppercase tracking-wider block"
                    style={{ color: pt.primaryColor }}
                  >
                    {preset.collection === "atelier_premium" ? "Direction Studio" : pt.sector}
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
                    borderColor: pt.borderColor || "var(--studio-border)",
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
                      color: pt.buttonTextColor || "var(--studio-white)",
                      borderRadius: `${Math.min(6, pt.borderRadiusPx ?? 6)}px`,
                    }}
                  >
                    {isMatched ? "Actif" : "Appliquer"}
                  </span>
                </div>
              </button>

              <div className="flex items-center justify-between gap-2 px-0.5">
                <span className="text-[10.5px] text-slate-500 truncate">
                  {isAr ? preset.subtitleAr : preset.subtitleFr}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {onPreviewPreset && !isMatched && (
                    <button
                      type="button"
                      data-testid={`preview-artistic-preset-${preset.id}`}
                      onClick={() => onPreviewPreset(preset)}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[9.5px] font-semibold text-slate-700 cursor-pointer"
                    >
                      <Eye className="w-2.5 h-2.5" />
                      <span>{isAr ? "معاينة" : "Aperçu"}</span>
                    </button>
                  )}
                  <div className="flex items-center gap-1">
                    {[pt.canvasColor, pt.surfaceColor, pt.secondaryColor, pt.primaryColor, pt.accentColor].map((c, idx) => (
                      <span key={idx} className="w-2.5 h-2.5 rounded-full border border-black/15" style={{ backgroundColor: c }} />
                    ))}
                    {isMatched && <Check className="w-3.5 h-3.5 text-slate-900 ml-0.5" />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
