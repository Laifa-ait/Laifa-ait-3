import React from "react";
import { Type, Box } from "lucide-react";
import { CustomPageTheme } from "../../../../../domains/seller/customPage.types";

interface ThemeTypographyTabProps {
  theme: CustomPageTheme;
  onUpdateTheme: (patch: Partial<CustomPageTheme>) => void;
}

export const ThemeTypographyTab: React.FC<ThemeTypographyTabProps> = ({
  theme,
  onUpdateTheme,
}) => {
  const sliderControl = (
    label: string,
    field: "borderRadiusPx" | "spacingYPx" | "titleFontSizePx" | "bodyFontSizePx",
    min: number,
    max: number,
    unit = "px",
  ) => {
    const value = theme[field] ?? min;
    return (
      <div key={field} className="space-y-1.5">
        <div className="flex items-center justify-between text-[12px]">
          <span className="font-semibold text-[#475467]">{label}</span>
          <span className="font-mono text-[#F97316] font-bold">
            {value}
            {unit}
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={field === "borderRadiusPx" ? 2 : 1}
          value={value}
          onChange={(e) => onUpdateTheme({ [field]: Number(e.target.value) })}
          className="w-full accent-[#F97316] cursor-pointer"
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Typography Section */}
      <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3.5">
        <h4 className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-slate-500">
          <Type className="h-3.5 w-3.5 text-[#F97316]" />
          <span>Typographie & Échelle de Texte</span>
        </h4>

        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-[#475467]">Police d'écriture</label>
          <select
            value={theme.fontFamily}
            onChange={(e) => onUpdateTheme({ fontFamily: e.target.value })}
            className="h-10 w-full rounded-xl border border-[#E4E7EC] bg-white px-3 text-[13px] text-[#17191C] focus:border-[#F97316] focus:outline-none"
          >
            <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans · Moderne & Équilibré</option>
            <option value="'Playfair Display', serif">Playfair Display · Éditorial & Luxe Serif</option>
            <option value="'Outfit', sans-serif">Outfit · Contemporain & Géométrique</option>
            <option value="'DM Sans', sans-serif">DM Sans · Minimal & E-Commerce Nordique</option>
            <option value="'Cairo', sans-serif">Cairo · Adapté Bilingue Arabe / Français</option>
          </select>
        </div>

        {sliderControl("Taille des Titres H1 / H2", "titleFontSizePx", 20, 56)}
        {sliderControl("Taille du Texte Courant", "bodyFontSizePx", 12, 22)}
      </div>

      {/* Geometry and Spacing */}
      <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3.5">
        <h4 className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-slate-500">
          <Box className="h-3.5 w-3.5 text-[#F97316]" />
          <span>Formes & Respiration Spatiale</span>
        </h4>

        {sliderControl("Rayon d'arrondi des cartes & boutons", "borderRadiusPx", 0, 24)}
        {sliderControl("Espacement vertical entre les sections", "spacingYPx", 8, 64)}
      </div>
    </div>
  );
};
