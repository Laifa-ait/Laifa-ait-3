import React from "react";
import { CustomPageTheme, StoreThemeSector } from "../../../../../domains/seller/customPage.types";

interface ThemeColorPaletteTabProps {
  theme: CustomPageTheme;
  onUpdateTheme: (patch: Partial<CustomPageTheme>) => void;
  onErrorChange: (err: string | null) => void;
}

export const ThemeColorPaletteTab: React.FC<ThemeColorPaletteTabProps> = ({
  theme,
  onUpdateTheme,
  onErrorChange,
}) => {
  const colorControl = (
    label: string,
    field: "primaryColor" | "secondaryColor" | "accentColor" | "accentBadgeColor" | "canvasColor" | "surfaceColor",
    defaultVal: string,
  ) => {
    const color = theme[field] || defaultVal;
    const pickerColor = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color) ? color : defaultVal;

    return (
      <div key={field} className="space-y-1.5">
        <label className="text-[12px] font-semibold text-[#475467]">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={pickerColor}
            aria-label={label}
            onChange={(e) => onUpdateTheme({ [field]: e.target.value })}
            className="h-9 w-10 shrink-0 rounded-lg border border-[#E4E7EC] bg-white p-1 cursor-pointer"
          />
          <input
            type="text"
            value={color}
            aria-label={`${label} hexadécimal`}
            onChange={(e) => {
              const val = e.target.value;
              onUpdateTheme({ [field]: val });
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
            className="h-9 min-w-0 flex-1 rounded-lg border border-[#E4E7EC] px-2 font-mono text-[12px] text-[#17191C] focus:border-[#F97316] focus:outline-none"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-[12px] font-bold text-[#475467]">Secteur d'activité</label>
        <select
          value={theme.sector}
          onChange={(e) => onUpdateTheme({ sector: e.target.value as StoreThemeSector })}
          className="h-10 w-full rounded-xl border border-[#E4E7EC] bg-white px-3 text-[13px] text-[#17191C] focus:border-[#F97316] focus:outline-none"
        >
          <option value="mode">Mode, Prêt-à-porter & Vêtements</option>
          <option value="beaute">Beauté, Soins & Cosmétique</option>
          <option value="artisanat">Artisanat, Tradition & Déco</option>
          <option value="tech">High-Tech, Gaming & Électronique</option>
          <option value="maison">Maison, Cuisine & Épicerie Fine</option>
        </select>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3.5">
        <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
          Nuancier Principal de la Vitrine
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {colorControl("Couleur Principale", "primaryColor", "#B85B35")}
          {colorControl("Couleur Secondaire", "secondaryColor", "#1C2A39")}
          {colorControl("Couleur Accent", "accentColor", "#D4AF37")}
          {colorControl("Badges & Tags", "accentBadgeColor", "#D4AF37")}
          {colorControl("Fond de Page (Canvas)", "canvasColor", "#FAF6F0")}
          {colorControl("Fond des Cartes", "surfaceColor", "#FFFFFF")}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 text-[11px] text-slate-500">
        💡 <strong>Harmonie Studio :</strong> Les couleurs choisies ici sont appliquées en temps réel sur les boutons CTA, les jauges de stock, les badges et le fond du canevas.
      </div>
    </div>
  );
};
