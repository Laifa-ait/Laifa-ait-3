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
  const primary = theme?.primaryColor || "#B85B35";
  const canvas = theme?.canvasColor || "#FFFFFF";
  const surface =
    theme?.surfaceColor && theme.surfaceColor.toUpperCase() !== "#FFFFFF"
      ? theme.surfaceColor
      : "#FAF6F0";
  const accent = theme?.accentColor || primary || "#F97316";
  const scheme3BtnBg = isDarkColor(primary) ? "#FFFFFF" : "#111827";

  return [
    {
      id: "scheme_1",
      name: "Scheme 1 • Clair",
      subtitle: "Fond pur & bouton primaire",
      backgroundColor: canvas,
      textColor: readableTextColor(canvas),
      buttonBgColor: primary,
      buttonTextColor: readableTextColor(primary),
    },
    {
      id: "scheme_2",
      name: "Scheme 2 • Doux",
      subtitle: "Surface crème subtile",
      backgroundColor: surface,
      textColor: readableTextColor(surface),
      buttonBgColor: primary,
      buttonTextColor: readableTextColor(primary),
    },
    {
      id: "scheme_3",
      name: "Scheme 3 • Marque",
      subtitle: "Fond primaire & contraste auto",
      backgroundColor: primary,
      textColor: readableTextColor(primary),
      buttonBgColor: scheme3BtnBg,
      buttonTextColor: readableTextColor(scheme3BtnBg),
    },
    {
      id: "scheme_4",
      name: "Scheme 4 • Sombre",
      subtitle: "Premium nuit & accent",
      backgroundColor: "#111827",
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
        <label className="text-[12px] font-bold text-[#011C40] flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-[#023859]" />
          <span>Palettes Harmoniques (WCAG AA)</span>
        </label>
        {styles.backgroundColor && (
          <button
            type="button"
            onClick={() =>
              onStylesChange({
                colorScheme: undefined,
                backgroundColor: undefined,
                textColor: undefined,
                buttonBgColor: undefined,
                buttonTextColor: undefined,
              })
            }
            className="text-[10px] font-semibold text-[#667085] hover:text-[#023859] cursor-pointer"
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
                  ? "border-[#023859] ring-2 ring-[#54ACBF]/35 shadow-xs bg-[#F0F7FA]/60"
                  : "border-[#E4E7EC] bg-white hover:border-[#54ACBF]"
              }`}
            >
              <div
                style={{ backgroundColor: scheme.backgroundColor, color: scheme.textColor }}
                className="h-12 w-full rounded-lg border border-black/10 px-2.5 py-1.5 flex items-center justify-between shadow-2xs mb-2"
              >
                <div className="flex flex-col leading-none">
                  <span className="text-sm font-extrabold tracking-tight">Aa</span>
                  <span className="text-[8px] opacity-75 font-medium mt-0.5">Titre & texte</span>
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
                  <span className="block text-[11px] font-bold text-[#011C40] truncate">{scheme.name}</span>
                  <span className="block text-[9px] text-[#667085] truncate">{scheme.subtitle}</span>
                </div>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-[#023859] text-white flex items-center justify-center shrink-0">
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
        onClick={() => setShowCustom((prev) => !prev)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-[#E4E7EC] bg-[#F8FBFC] hover:bg-[#F0F7FA] text-[11px] font-semibold text-[#023859] cursor-pointer transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Sliders className="w-3 h-3 text-[#023859]" />
          <span>Couleurs personnalisées (Avancé)</span>
        </span>
        <span className="text-[10px] text-[#26658C]">{showCustom ? "Masquer ▲" : "Déplier ▼"}</span>
      </button>

      {showCustom && (
        <div className="p-2.5 rounded-xl border border-[#E4E7EC] bg-white space-y-2">
          {(
            [
              { label: "Fond sur-mesure", field: "backgroundColor" as const, def: "#ffffff" },
              { label: "Texte sur-mesure", field: "textColor" as const, def: "#111827" },
            ] as const
          ).map((row) => (
            <div key={row.field} className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-[#17191C]">{row.label}</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={styles[row.field] || row.def}
                  onChange={(e) => onStylesChange({ colorScheme: "custom", [row.field]: e.target.value })}
                  className="w-7 h-7 rounded border border-[#E4E7EC] cursor-pointer"
                />
                <input
                  type="text"
                  value={styles[row.field] || ""}
                  placeholder={row.def.toUpperCase()}
                  onChange={(e) => onStylesChange({ colorScheme: "custom", [row.field]: e.target.value || undefined })}
                  className="w-24 h-7 px-2 border border-[#E4E7EC] rounded text-[11px] font-mono"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
