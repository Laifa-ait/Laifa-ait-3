import React from "react";
import { CustomPageTheme, StoreThemeSector } from "../../../../../domains/seller/customPage.types";

interface ThemeColorPaletteTabProps {
  theme: CustomPageTheme;
  onUpdateTheme: (patch: Partial<CustomPageTheme>) => void;
  onErrorChange: (err: string | null) => void;
}

type ThemeColorKey =
  | "primaryColor"
  | "secondaryColor"
  | "accentColor"
  | "accentBadgeColor"
  | "canvasColor"
  | "surfaceColor"
  | "textColor"
  | "borderColor"
  | "buttonColor";

export const ThemeColorPaletteTab: React.FC<ThemeColorPaletteTabProps> = ({
  theme,
  onUpdateTheme,
  onErrorChange,
}) => {
  const rawTheme = theme as unknown as Record<string, string | undefined>;

  const colorControl = (label: string, field: ThemeColorKey, defaultVal: string) => {
    const color = rawTheme[field] || defaultVal;
    const pickerColor = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color) ? color : defaultVal;

    return (
      <div key={field} className="space-y-1">
        <label className="text-[11.5px] font-semibold text-[#475467]">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={pickerColor}
            aria-label={label}
            onChange={(e) => onUpdateTheme({ [field]: e.target.value } as Partial<CustomPageTheme>)}
            className="h-8 w-9 shrink-0 rounded-lg border border-[#E4E7EC] bg-white p-0.5 cursor-pointer"
          />
          <input
            type="text"
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
            className="h-8 min-w-0 flex-1 rounded-lg border border-[#E4E7EC] px-2 font-mono text-[11.5px] text-[#17191C] focus:border-[#023859] focus:outline-none"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4" data-testid="theme-color-palette-tab">
      <div className="space-y-1.5">
        <label className="text-[12px] font-bold text-[#475467]">Secteur d&apos;activité</label>
        <select
          value={theme.sector}
          onChange={(e) => onUpdateTheme({ sector: e.target.value as StoreThemeSector })}
          className="h-9 w-full rounded-xl border border-[#E4E7EC] bg-white px-3 text-[12.5px] text-[#17191C] focus:border-[#023859] focus:outline-none"
        >
          <option value="mode">Mode, Prêt-à-porter & Vêtements</option>
          <option value="beaute">Beauté, Soins & Cosmétique</option>
          <option value="artisanat">Artisanat, Tradition & Déco</option>
          <option value="tech">High-Tech, Gaming & Électronique</option>
          <option value="maison">Maison, Cuisine & Épicerie Fine</option>
        </select>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Tokens de Couleurs du Design System (8 Couleurs)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {colorControl("Couleur Principale", "primaryColor", "#B85B35")}
          {colorControl("Couleur Secondaire", "secondaryColor", "#1C2A39")}
          {colorControl("Couleur d'Accentuation", "accentColor", "#D4AF37")}
          {colorControl("Fond Principal (Canvas)", "canvasColor", "#FAF6F0")}
          {colorControl("Fond Secondaire (Cartes)", "surfaceColor", "#FFFFFF")}
          {colorControl("Couleur du Texte", "textColor", theme.secondaryColor || "#18181B")}
          {colorControl("Couleur des Bordures", "borderColor", "#E4E7EC")}
          {colorControl("Couleur des Boutons", "buttonColor", theme.primaryColor || "#B85B35")}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-[11px] text-slate-500">
        💡 <strong>Héritage Intelligent :</strong> Ces variables CSS (<code>--store-*</code>) mettent à jour toute la boutique automatiquement sans écraser les couleurs explicitement définies sur une section individuelle.
      </div>
    </div>
  );
};
