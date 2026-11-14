import React from "react";
import { Check, Flame, Sparkles } from "lucide-react";
import { CountdownBannerStyle } from "../../../../../../components/Store/sections/ProductFeedEcommerceWidgets";
import { COUNTDOWN_STYLES } from "./countdownStyles";

interface CountdownPreviewStylesGridProps {
  activeStyle: CountdownBannerStyle;
  onSelectStyle: (styleId: CountdownBannerStyle) => void;
}

const PREVIEW_UNITS = [
  { v: "02", u: "J", accent: false },
  { v: "14", u: "H", accent: false },
  { v: "36", u: "M", accent: false },
  { v: "48", u: "S", accent: true },
];

export const CountdownPreviewStylesGrid: React.FC<CountdownPreviewStylesGridProps> = ({
  activeStyle,
  onSelectStyle,
}) => (
  <div className="space-y-2.5 pt-3 border-t border-slate-200">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-semibold text-slate-900 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-slate-500" />
        <span>Direction artistique du chrono</span>
      </span>
      <span className="text-[10.5px] text-slate-400">6 modèles</span>
    </div>

    <div className="grid grid-cols-1 gap-2">
      {COUNTDOWN_STYLES.map((st) => {
        const isSelected = activeStyle === st.id;
        return (
          <button
            key={st.id}
            type="button"
            onClick={() => onSelectStyle(st.id)}
            className={`w-full p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
              isSelected
                ? "border-slate-900 ring-1 ring-slate-900/15 bg-slate-50/70"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-semibold text-slate-900 truncate">{st.name}</span>
                <span className="text-[10px] font-medium text-slate-500 shrink-0">· {st.tag}</span>
              </div>
              <span
                className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border ${
                  isSelected
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white text-transparent"
                }`}
              >
                <Check className="h-2.5 w-2.5 stroke-[2.5]" />
              </span>
            </div>

            <div
              className="w-full rounded-lg px-2.5 py-2 flex items-center justify-between gap-2 border"
              style={{
                background: st.previewBg,
                borderColor: st.previewBorder,
                color: st.previewText,
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-5.5 w-5.5 rounded-md flex items-center justify-center shrink-0 text-white"
                  style={{ backgroundColor: st.previewAccent }}
                >
                  <Flame className="h-3 w-3" />
                </span>
                <div className="min-w-0">
                  <span className="block text-[9px] font-bold uppercase tracking-wider truncate">
                    Offre Limitée
                  </span>
                  <span className="block text-[8px] opacity-75 truncate">Tarif privilège</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 font-mono tabular-nums">
                {PREVIEW_UNITS.map((item) => (
                  <span
                    key={item.u}
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold leading-none border flex items-baseline gap-0.5"
                    style={{
                      backgroundColor: st.previewSurface,
                      borderColor: item.accent ? st.previewAccent : st.previewBorder,
                      color: item.accent ? st.previewAccent : st.previewText,
                    }}
                  >
                    <span>{item.v}</span>
                    <span className="text-[7px] opacity-75">{item.u}</span>
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[10.5px] text-slate-500 mt-1.5 line-clamp-1">{st.desc}</p>
          </button>
        );
      })}
    </div>
  </div>
);
