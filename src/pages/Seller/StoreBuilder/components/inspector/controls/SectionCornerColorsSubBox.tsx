import React from "react";
import { CustomPageSectionStyles, CustomPageTheme } from "../../../../../../domains/seller/customPage.types";
import { DEFAULT_MODERN_THEME } from "../../../constants/studioThemeDefaults";

interface SectionCornerColorsSubBoxProps {
  styles: CustomPageSectionStyles;
  theme?: CustomPageTheme;
  onSync: (
    stylePatch: Partial<CustomPageSectionStyles>,
    heroPatch?: Record<string, unknown>
  ) => void;
}

export const SectionCornerColorsSubBox: React.FC<SectionCornerColorsSubBoxProps> = ({
  styles,
  theme,
  onSync,
}) => {
  const baseSurface = theme?.surfaceColor || DEFAULT_MODERN_THEME.surfaceColor;
  const baseCanvas = theme?.canvasColor || DEFAULT_MODERN_THEME.canvasColor;

  return (
    <div
      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2"
      data-testid="section-corner-colors-box"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] font-medium text-slate-900">
          Dégradé doux aux 4 coins
        </span>
        <button
          type="button"
          data-testid="section-toggle-corner-colors"
          onClick={() => {
            const next = !styles.useCornerColors;
            const patch = next
              ? {
                  useCornerColors: true,
                  cornerColorTl: styles.cornerColorTl || styles.backgroundColor || baseCanvas,
                  cornerColorTr: styles.cornerColorTr || baseSurface,
                  cornerColorBr: styles.cornerColorBr || baseCanvas,
                  cornerColorBl: styles.cornerColorBl || baseSurface,
                }
              : { useCornerColors: false };
            onSync(patch, patch);
          }}
          className={`h-6 px-2 rounded-md text-[11px] font-medium border cursor-pointer ${
            styles.useCornerColors
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-600 border-slate-200"
          }`}
        >
          {styles.useCornerColors ? "Activé" : "Activer"}
        </button>
      </div>

      {styles.useCornerColors && (
        <div className="grid grid-cols-2 gap-1.5">
          {(
            [
              { key: "cornerColorTl" as const, label: "Haut gauche", def: baseCanvas },
              { key: "cornerColorTr" as const, label: "Haut droit", def: baseSurface },
              { key: "cornerColorBl" as const, label: "Bas gauche", def: baseSurface },
              { key: "cornerColorBr" as const, label: "Bas droit", def: baseCanvas },
            ]
          ).map((c) => (
            <label
              key={c.key}
              className="h-8 text-[11px] font-medium text-slate-700 flex items-center justify-between bg-white px-2 rounded-lg border border-slate-200"
            >
              <span>{c.label}</span>
              <input
                type="color"
                data-testid={`section-${c.key}`}
                value={styles[c.key] || c.def}
                onChange={(e) => onSync({ [c.key]: e.target.value }, { [c.key]: e.target.value })}
                className="w-5 h-5 rounded cursor-pointer"
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
