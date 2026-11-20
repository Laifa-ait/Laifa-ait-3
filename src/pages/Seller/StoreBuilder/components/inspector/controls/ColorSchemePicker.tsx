import React, { useState } from "react";
import { Palette, Check, Sliders } from "lucide-react";
import {
  CustomPageSectionStyles,
  CustomPageTheme,
  StudioColorSchemeId,
} from "../../../../../../domains/seller/customPage.types";
import {
  isDarkColor,
  readableTextColor,
} from "../../../../../../components/Store/sections/themeColorUtils";
import { DEFAULT_MODERN_THEME } from "../../../constants/studioThemeDefaults";

interface ColorSchemePickerProps {
  styles: CustomPageSectionStyles;
  theme?: CustomPageTheme;
  onStylesChange: (
    fieldOrPatch: keyof CustomPageSectionStyles | Partial<CustomPageSectionStyles>,
    value?: unknown
  ) => void;
}

export interface ComputedColorScheme {
  id: Exclude<StudioColorSchemeId, "custom">;
  name: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
}

export function buildHarmoniousColorSchemes(theme?: CustomPageTheme): ComputedColorScheme[] {
  const primary = theme?.primaryColor || DEFAULT_MODERN_THEME.primaryColor;
  const canvas = theme?.canvasColor || DEFAULT_MODERN_THEME.canvasColor || "#FFFFFF";
  const surface =
    theme?.surfaceColor && theme.surfaceColor.toUpperCase() !== "#FFFFFF"
      ? theme.surfaceColor
      : "#F8FAFC";
  const accent = theme?.accentColor || primary || DEFAULT_MODERN_THEME.accentColor;
  const isPrimaryDark = isDarkColor(primary);
  const scheme3BtnBg = isPrimaryDark ? "#FFFFFF" : "#0F172A";

  return [
    {
      id: "scheme_1",
      name: "1 • Fond Clair",
      subtitle: "Fond blanc & bouton coloré",
      backgroundColor: canvas,
      textColor: readableTextColor(canvas),
      buttonBgColor: primary,
      buttonTextColor: readableTextColor(primary),
    },
    {
      id: "scheme_2",
      name: "2 • Fond Doux",
      subtitle: "Gris léger & bouton coloré",
      backgroundColor: surface,
      textColor: readableTextColor(surface),
      buttonBgColor: primary,
      buttonTextColor: readableTextColor(primary),
    },
    {
      id: "scheme_3",
      name: "3 • Couleur Marque",
      subtitle: "Fond coloré & bouton contrasté",
      backgroundColor: primary,
      textColor: isPrimaryDark ? "#FFFFFF" : "#0F172A",
      buttonBgColor: scheme3BtnBg,
      buttonTextColor: isPrimaryDark ? "#0F172A" : "#FFFFFF",
    },
    {
      id: "scheme_4",
      name: "4 • Fond Sombre",
      subtitle: "Fond nuit & texte blanc",
      backgroundColor: "#0F172A",
      textColor: "#FFFFFF",
      buttonBgColor: accent,
      buttonTextColor: readableTextColor(accent),
    },
  ];
}

export const ColorSchemePicker: React.FC<ColorSchemePickerProps> = ({
  styles,
  theme,
  onStylesChange,
}) => {
  const schemes = buildHarmoniousColorSchemes(theme);
  const [showCustom, setShowCustom] = useState<boolean>(styles.colorScheme === "custom");

  const activeSchemeId: StudioColorSchemeId | null =
    styles.colorScheme ||
    schemes.find(
      (s) =>
        s.backgroundColor.toLowerCase() === (styles.backgroundColor || "").toLowerCase() &&
        s.textColor.toLowerCase() === (styles.textColor || "").toLowerCase()
    )?.id ||
    null;

  return (
    <div className="space-y-3 select-none">
      <div className="flex items-center justify-between">
        <label className="text-[12px] font-bold text-[var(--studio-black)] flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-[var(--studio-primary)]" />
          <span>Combinaisons de couleurs prêtes à l&apos;emploi</span>
        </label>
        {styles.backgroundColor && (
          <button
            type="button"
            data-testid="section-color-scheme-reset"
            onClick={() =>
              onStylesChange({
                colorScheme: undefined,
                backgroundColor: undefined,
                textColor: undefined,
                buttonBgColor: undefined,
                buttonTextColor: undefined,
              })
            }
            className="text-[10px] font-semibold text-[var(--studio-muted)] hover:text-[var(--studio-primary)] cursor-pointer"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {schemes.map((scheme) => {
          const isSelected = activeSchemeId === scheme.id;
          return (
            <button
              key={scheme.id}
              type="button"
              data-testid={`section-color-scheme-${scheme.id}`}
              onClick={() =>
                onStylesChange({
                  colorScheme: scheme.id,
                  backgroundColor: scheme.backgroundColor,
                  textColor: scheme.textColor,
                  buttonBgColor: scheme.buttonBgColor,
                  buttonTextColor: scheme.buttonTextColor,
                })
              }
              className={`rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                isSelected
                  ? "border-[var(--studio-primary)] ring-2 ring-[var(--studio-focus)]/25 shadow-xs bg-[var(--studio-highlight-soft)]"
                  : "border-[var(--studio-border)] bg-[var(--studio-white)] hover:border-[var(--studio-border-strong)]"
              }`}
            >
              <div
                style={{ backgroundColor: scheme.backgroundColor, color: scheme.textColor }}
                className="h-12 w-full rounded-lg border border-black/10 px-2.5 py-1.5 flex items-center justify-between shadow-2xs mb-2"
              >
                <div className="flex flex-col leading-none">
                  <span style={{ color: scheme.textColor }} className="text-sm font-extrabold tracking-tight">
                    Aa
                  </span>
                  <span style={{ color: scheme.textColor }} className="text-[8px] opacity-90 font-medium mt-0.5">
                    Titre &amp; texte
                  </span>
                </div>
                <span
                  style={{ backgroundColor: scheme.buttonBgColor, color: scheme.buttonTextColor }}
                  className="px-2 py-1 rounded-md text-[9px] font-bold shadow-2xs"
                >
                  Bouton
                </span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <div className="min-w-0">
                  <span className="block text-[11px] font-bold text-[var(--studio-black)] truncate">{scheme.name}</span>
                  <span className="block text-[9px] text-[var(--studio-muted)] truncate">{scheme.subtitle}</span>
                </div>
                {isSelected && (
                  <span className="w-4 h-4 rounded-sm bg-[var(--studio-primary)] text-[var(--studio-white)] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        data-testid="section-color-custom-toggle"
        onClick={() => setShowCustom((prev) => !prev)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-[var(--studio-border)] bg-[var(--studio-background)] hover:bg-[var(--studio-highlight-soft)] text-[11px] font-semibold text-[var(--studio-primary)] cursor-pointer transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Sliders className="w-3 h-3 text-[var(--studio-primary)]" />
          <span>Choisir mes propres couleurs</span>
        </span>
        <span className="text-[10px] text-[var(--studio-muted)]">{showCustom ? "Masquer ▲" : "Déplier ▼"}</span>
      </button>

      {showCustom && (
        <div className="p-2.5 rounded-xl border border-[var(--studio-border)] bg-[var(--studio-white)] space-y-2">
          {(
            [
              { label: "Couleur de fond", field: "backgroundColor" as const, def: "#ffffff" },
              { label: "Couleur du texte", field: "textColor" as const, def: "#0f172a" },
              { label: "Fond du bouton", field: "buttonBgColor" as const, def: "#0f172a" },
              { label: "Texte du bouton", field: "buttonTextColor" as const, def: "#ffffff" },
            ] as const
          ).map((row) => (
            <div key={row.field} className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-[var(--studio-black)]">{row.label}</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={styles[row.field] || row.def}
                  onChange={(e) => onStylesChange({ colorScheme: "custom", [row.field]: e.target.value })}
                  className="w-7 h-7 rounded border border-[var(--studio-border)] cursor-pointer"
                />
                <input
                  type="text"
                  value={styles[row.field] || ""}
                  placeholder={row.def.toUpperCase()}
                  onChange={(e) => onStylesChange({ colorScheme: "custom", [row.field]: e.target.value || undefined })}
                  className="w-24 h-7 px-2 border border-[var(--studio-border)] rounded text-[11px] font-mono"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

