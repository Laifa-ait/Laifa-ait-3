import React from "react";
import { Sparkles } from "lucide-react";
import { CustomPageSectionStyles } from "../../../../../../domains/seller/customPage.types";

interface SectionCornerColorsSubBoxProps {
  styles: CustomPageSectionStyles;
  onSync: (
    stylePatch: Partial<CustomPageSectionStyles>,
    heroPatch?: Record<string, unknown>
  ) => void;
}

export const SectionCornerColorsSubBox: React.FC<SectionCornerColorsSubBoxProps> = ({
  styles,
  onSync,
}) => {
  return (
    <div
      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
      data-testid="section-corner-colors-box"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#011C40] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Couleur de Chaque Coin (4 Coins)</span>
        </span>
        <button
          type="button"
          data-testid="section-toggle-corner-colors"
          onClick={() => {
            const next = !styles.useCornerColors;
            const patch = {
              useCornerColors: next,
              cornerColorTl: styles.cornerColorTl || styles.backgroundColor || "#FAF6F0",
              cornerColorTr: styles.cornerColorTr || "#F3E8D6",
              cornerColorBr: styles.cornerColorBr || "#EFE2CC",
              cornerColorBl: styles.cornerColorBl || "#FFFFFF",
            };
            onSync(patch, patch);
          }}
          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border cursor-pointer ${
            styles.useCornerColors
              ? "bg-[#023859] text-white border-[#023859]"
              : "bg-white text-slate-600 border-slate-200"
          }`}
        >
          {styles.useCornerColors ? "✓ 4 Coins Actifs" : "Activer 4 Coins"}
        </button>
      </div>

      {styles.useCornerColors && (
        <div className="grid grid-cols-2 gap-1.5">
          {(
            [
              { key: "cornerColorTl" as const, label: "↖ Haut-Gauche", def: "#FAF6F0" },
              { key: "cornerColorTr" as const, label: "↗ Haut-Droit", def: "#F3E8D6" },
              { key: "cornerColorBl" as const, label: "↙ Bas-Gauche", def: "#FFFFFF" },
              { key: "cornerColorBr" as const, label: "↘ Bas-Droit", def: "#EFE2CC" },
            ]
          ).map((c) => (
            <label
              key={c.key}
              className="text-[10px] font-bold text-slate-700 flex items-center justify-between bg-white px-2 py-1 rounded-lg border border-slate-200"
            >
              <span>{c.label}</span>
              <input
                type="color"
                data-testid={`section-${c.key}`}
                value={styles[c.key] || c.def}
                onChange={(e) =>
                  onSync({ [c.key]: e.target.value }, { [c.key]: e.target.value })
                }
                className="w-5 h-5 rounded cursor-pointer"
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
