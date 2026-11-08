import React from "react";
import { Type, Box, Sparkles } from "lucide-react";
import { CustomPageTheme } from "../../../../../domains/seller/customPage.types";

interface ThemeTypographyTabProps {
  theme: CustomPageTheme;
  onUpdateTheme: (patch: Partial<CustomPageTheme>) => void;
}

const FONT_OPTIONS = [
  { value: "'Plus Jakarta Sans', sans-serif", label: "Plus Jakarta Sans · Moderne & Équilibré" },
  { value: "'Playfair Display', serif", label: "Playfair Display · Éditorial & Luxe Serif" },
  { value: "'Cormorant Garamond', serif", label: "Cormorant Garamond · Haute Couture & Atelier" },
  { value: "'Outfit', sans-serif", label: "Outfit · Contemporain & Géométrique" },
  { value: "'DM Sans', sans-serif", label: "DM Sans · Minimal & E-Commerce Nordique" },
  { value: "'Lora', serif", label: "Lora · Littéraire & Artisanat Authentique" },
  { value: "'Space Grotesk', sans-serif", label: "Space Grotesk · Architecture & Tech" },
  { value: "'Cairo', sans-serif", label: "Cairo · Bilingue Arabe / Français" },
];

const CURATED_FONT_DUOS = [
  {
    id: "couture",
    label: "Haute Couture",
    subtitle: "Playfair + Jakarta",
    heading: "'Playfair Display', serif",
    body: "'Plus Jakarta Sans', sans-serif",
  },
  {
    id: "nordic",
    label: "Atelier Nordique",
    subtitle: "Outfit + DM Sans",
    heading: "'Outfit', sans-serif",
    body: "'DM Sans', sans-serif",
  },
  {
    id: "casbah",
    label: "Patrimoine Casbah",
    subtitle: "Cormorant + DM Sans",
    heading: "'Cormorant Garamond', serif",
    body: "'DM Sans', sans-serif",
  },
  {
    id: "bilingual",
    label: "Franco-Arabe",
    subtitle: "Cairo Titre & Corps",
    heading: "'Cairo', sans-serif",
    body: "'Cairo', sans-serif",
  },
];

export const ThemeTypographyTab: React.FC<ThemeTypographyTabProps> = ({
  theme,
  onUpdateTheme,
}) => {
  const headingFont = theme.headingFontFamily || theme.fontFamily || "'Playfair Display', serif";
  const bodyFont = theme.bodyFontFamily || theme.fontFamily || "'Plus Jakarta Sans', sans-serif";

  const sliderControl = (
    label: string,
    field: "borderRadiusPx" | "spacingYPx" | "titleFontSizePx" | "bodyFontSizePx",
    min: number,
    max: number,
    defaultVal: number,
    unit = "px"
  ) => {
    const value = typeof theme[field] === "number" ? theme[field]! : defaultVal;
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
    <div className="space-y-5">
      <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3.5">
        <h4 className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-slate-500">
          <Sparkles className="h-3.5 w-3.5 text-[#F97316]" />
          <span>Duos Typographiques (Titre + Texte)</span>
        </h4>
        <div className="grid grid-cols-2 gap-1.5">
          {CURATED_FONT_DUOS.map((duo) => {
            const isSelected = headingFont === duo.heading && bodyFont === duo.body;
            return (
              <button
                key={duo.id}
                type="button"
                onClick={() =>
                  onUpdateTheme({
                    headingFontFamily: duo.heading,
                    bodyFontFamily: duo.body,
                    fontFamily: duo.body,
                  })
                }
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white border-[#F97316] ring-1 ring-[#F97316]/30 shadow-2xs"
                    : "bg-white/70 border-slate-200 hover:border-slate-300"
                }`}
              >
                <span className="block text-[11px] font-bold text-slate-900">{duo.label}</span>
                <span className="block text-[10px] text-slate-500">{duo.subtitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3.5">
        <h4 className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-slate-500">
          <Type className="h-3.5 w-3.5 text-[#F97316]" />
          <span>Polices & Échelle de Texte</span>
        </h4>

        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-[#475467]">Police des Titres (H1 / H2 / H3)</label>
          <select
            value={headingFont}
            onChange={(e) => onUpdateTheme({ headingFontFamily: e.target.value })}
            className="h-10 w-full rounded-xl border border-[#E4E7EC] bg-white px-3 text-[12.5px] text-[#17191C] focus:border-[#F97316] focus:outline-none"
          >
            {FONT_OPTIONS.map((opt) => (
              <option key={`h-${opt.value}`} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-[#475467]">Police du Texte Courant & UI</label>
          <select
            value={bodyFont}
            onChange={(e) => onUpdateTheme({ bodyFontFamily: e.target.value, fontFamily: e.target.value })}
            className="h-10 w-full rounded-xl border border-[#E4E7EC] bg-white px-3 text-[12.5px] text-[#17191C] focus:border-[#F97316] focus:outline-none"
          >
            {FONT_OPTIONS.map((opt) => (
              <option key={`b-${opt.value}`} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {sliderControl("Taille des Titres H1 / H2", "titleFontSizePx", 20, 56, 36)}
        {sliderControl("Taille du Texte Courant", "bodyFontSizePx", 12, 22, 15)}
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3.5">
        <h4 className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-slate-500">
          <Box className="h-3.5 w-3.5 text-[#F97316]" />
          <span>Formes & Respiration Spatiale</span>
        </h4>

        {sliderControl("Rayon d'arrondi des cartes & boutons", "borderRadiusPx", 0, 24, 16)}
        {sliderControl("Espacement vertical entre les sections", "spacingYPx", 8, 64, 28)}
      </div>
    </div>
  );
};
