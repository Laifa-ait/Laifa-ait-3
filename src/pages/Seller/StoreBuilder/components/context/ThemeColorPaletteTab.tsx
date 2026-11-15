import React from "react";
import { AlertTriangle, CheckCircle2, Sparkles, Wand2 } from "lucide-react";
import { CustomPageTheme, StoreThemeSector } from "../../../../../domains/seller/customPage.types";
import {
  auditThemeContrastPairs,
  buildAutoFixedThemeColors,
} from "../../../../../components/Store/sections/themeColorUtils";
import { ARTISTIC_STUDIO_PRESETS } from "../../constants/artisticStudioPresets";

interface ThemeColorPaletteTabProps {
  theme: CustomPageTheme;
  onUpdateTheme: (patch: Partial<CustomPageTheme>) => void;
  onErrorChange: (err: string | null) => void;
}

type ThemeColorKey =
  | "canvasColor"
  | "surfaceColor"
  | "borderColor"
  | "secondaryColor"
  | "textColor"
  | "mutedTextColor"
  | "priceColor"
  | "primaryColor"
  | "accentColor"
  | "buttonColor"
  | "buttonTextColor"
  | "accentBadgeColor"
  | "badgeTextColor";

export const ThemeColorPaletteTab: React.FC<ThemeColorPaletteTabProps> = ({
  theme,
  onUpdateTheme,
  onErrorChange,
}) => {
  const contrastPairs = auditThemeContrastPairs(theme);
  const failingPairs = contrastPairs.filter((p) => !p.passes);

  const colorControl = (label: string, field: ThemeColorKey, defaultVal: string) => {
    const color = theme[field] || defaultVal;
    const pickerColor = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color) ? color : defaultVal;

    return (
      <div key={field} className="space-y-1 bg-white p-2 rounded-xl border border-slate-200/90">
        <label className="text-[10.5px] font-bold text-[#344054] block truncate">{label}</label>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            data-testid={`global-color-${field}`}
            value={pickerColor}
            aria-label={label}
            onChange={(e) => onUpdateTheme({ [field]: e.target.value } as Partial<CustomPageTheme>)}
            className="h-7 w-8 shrink-0 rounded-lg border border-[#E4E7EC] bg-white p-0.5 cursor-pointer"
          />
          <input
            type="text"
            data-testid={`global-hex-${field}`}
            value={color}
            aria-label={`${label} hexadécimal`}
            onChange={(e) => {
              const val = e.target.value;
              onUpdateTheme({ [field]: val } as Partial<CustomPageTheme>);
              if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) {
                onErrorChange(null);
              }
            }}
            onBlur={(e) => {
              const val = e.target.value;
              if (!/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) {
                onErrorChange("Saisissez une couleur hexadécimale valide (#RRGGBB).");
              }
            }}
            className="h-7 min-w-0 flex-1 rounded-lg border border-[#E4E7EC] px-2 font-mono text-[11px] text-[#17191C] focus:border-[#023859] focus:outline-none uppercase"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4" data-testid="theme-color-palette-tab">
      <div
        data-testid="theme-contrast-checker"
        className={`rounded-2xl border p-3 space-y-2 ${
          failingPairs.length > 0 ? "border-amber-300 bg-amber-50/80" : "border-emerald-200 bg-emerald-50/60"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {failingPairs.length > 0 ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            )}
            <span className="text-[11px] font-bold text-slate-900">
              {failingPairs.length > 0
                ? `${failingPairs.length} contraste${failingPairs.length > 1 ? "s" : ""} faible${failingPairs.length > 1 ? "s" : ""} détecté${failingPairs.length > 1 ? "s" : ""}`
                : "Lisibilité WCAG vérifiée (4/4)"}
            </span>
          </div>
          {failingPairs.length > 0 && (
            <button
              type="button"
              data-testid="auto-fix-contrast-btn"
              onClick={() => onUpdateTheme(buildAutoFixedThemeColors(theme))}
              className="inline-flex items-center gap-1 h-6 px-2 rounded-lg bg-slate-900 text-white text-[10px] font-bold cursor-pointer"
            >
              <Wand2 className="w-3 h-3" />
              <span>Ajuster les contrastes</span>
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {contrastPairs.map((pair) => (
            <div
              key={pair.id}
              data-testid={`contrast-pair-${pair.id}`}
              className="flex items-center justify-between gap-1.5 rounded-lg border border-black/10 bg-white px-2 py-1 text-[10px]"
            >
              <span className="font-medium text-slate-700 truncate">{pair.label}</span>
              <span className={`font-mono font-bold shrink-0 ${pair.passes ? "text-emerald-700" : "text-rose-600"}`}>
                {pair.ratio}:1
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11.5px] font-extrabold text-zinc-800">Secteur d&apos;activité &amp; Univers</label>
        <select
          value={theme.sector}
          onChange={(e) => onUpdateTheme({ sector: e.target.value as StoreThemeSector })}
          className="h-9 w-full rounded-xl border border-[#E4E7EC] bg-white px-3 text-[12px] font-semibold text-[#17191C] focus:border-[#023859] focus:outline-none"
        >
          <option value="artisanat">Artisanat, Tradition &amp; Patrimoine</option>
          <option value="mode">Mode, Prêt-à-porter &amp; Haute Couture</option>
          <option value="beaute">Beauté, Parfums &amp; Soins</option>
          <option value="tech">High-Tech, Gaming &amp; Électronique</option>
          <option value="maison">Maison, Intérieur &amp; Décoration</option>
          <option value="alimentation">Alimentation, Terroir &amp; Épicerie Fine</option>
          <option value="sport">Sport, Fitness &amp; Performance</option>
          <option value="accessoires">Accessoires, Horlogerie &amp; Maroquinerie</option>
          <option value="enfants">Enfants, Bébé &amp; Éveil</option>
        </select>
      </div>

      <div className="p-2.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
        <span className="text-[10.5px] font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Harmonies Chromatiques (Application 1-Clic)
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {ARTISTIC_STUDIO_PRESETS.map((preset) => {
            const pt = preset.theme;
            return (
              <button
                key={preset.id}
                type="button"
                data-testid={`quick-harmony-${preset.id}`}
                onClick={() =>
                  onUpdateTheme({
                    presetId: preset.id,
                    canvasColor: pt.canvasColor,
                    surfaceColor: pt.surfaceColor,
                    borderColor: pt.borderColor,
                    primaryColor: pt.primaryColor,
                    secondaryColor: pt.secondaryColor,
                    textColor: pt.textColor,
                    mutedTextColor: pt.mutedTextColor,
                    accentColor: pt.accentColor,
                    accentBadgeColor: pt.accentBadgeColor,
                    badgeTextColor: pt.badgeTextColor,
                    buttonColor: pt.buttonColor,
                    buttonTextColor: pt.buttonTextColor,
                    priceColor: pt.priceColor,
                  })
                }
                className="p-1.5 rounded-xl border border-slate-200 bg-white hover:border-zinc-900 text-left transition-all cursor-pointer space-y-1"
              >
                <div className="flex items-center gap-0.5">
                  {[pt.canvasColor, pt.surfaceColor, pt.secondaryColor, pt.primaryColor, pt.accentColor].map((c, i) => (
                    <span key={i} className="h-3 flex-1 first:rounded-l last:rounded-r border border-black/10" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className="block text-[9.5px] font-extrabold text-zinc-800 truncate">
                  {preset.nameFr.split("(")[0].trim()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3">
        <h4 className="text-[10.5px] font-black uppercase tracking-wider text-zinc-800">
          1. Fonds, Cartes &amp; Bordures (60% / 30%)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {colorControl("Fond de Page (Canvas)", "canvasColor", "#F4ECE1")}
          {colorControl("Fond des Cartes (Surface)", "surfaceColor", "#FFFDF9")}
          {colorControl("Filets & Bordures", "borderColor", "#DFCBB2")}
        </div>
      </div>

      <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3">
        <h4 className="text-[10.5px] font-black uppercase tracking-wider text-zinc-800">
          2. Titres, Paragraphes &amp; Prix (DA)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {colorControl("Couleur des Titres", "secondaryColor", "#29170E")}
          {colorControl("Texte Principal", "textColor", theme.secondaryColor || "#3D2518")}
          {colorControl("Texte Secondaire (Muted)", "mutedTextColor", "#7C5A46")}
          {colorControl("Prix & Montants (DA)", "priceColor", theme.primaryColor || "#9A3412")}
        </div>
      </div>

      <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3">
        <h4 className="text-[10.5px] font-black uppercase tracking-wider text-zinc-800">
          3. Marque, Boutons CTA &amp; Badges (10%)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {colorControl("Couleur Principale", "primaryColor", "#B84A27")}
          {colorControl("Couleur d'Accent / Or", "accentColor", "#C88A2B")}
          {colorControl("Fond des Boutons CTA", "buttonColor", theme.primaryColor || "#29170E")}
          {colorControl("Texte des Boutons CTA", "buttonTextColor", "#FFFDF9")}
          {colorControl("Fond des Badges", "accentBadgeColor", theme.primaryColor || "#B84A27")}
          {colorControl("Texte des Badges", "badgeTextColor", "#FFFDF9")}
        </div>
      </div>
    </div>
  );
};
