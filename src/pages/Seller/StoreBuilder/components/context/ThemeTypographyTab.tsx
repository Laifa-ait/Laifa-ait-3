import React from "react";
import { Type, Box, Sparkles, MousePointerClick } from "lucide-react";
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
  { id: "couture", label: "Haute Couture", subtitle: "Playfair + Jakarta", heading: "'Playfair Display', serif", body: "'Plus Jakarta Sans', sans-serif" },
  { id: "nordic", label: "Atelier Nordique", subtitle: "Outfit + DM Sans", heading: "'Outfit', sans-serif", body: "'DM Sans', sans-serif" },
  { id: "casbah", label: "Patrimoine Casbah", subtitle: "Cormorant + DM Sans", heading: "'Cormorant Garamond', serif", body: "'DM Sans', sans-serif" },
  { id: "bilingual", label: "Franco-Arabe", subtitle: "Cairo Titre & Corps", heading: "'Cairo', sans-serif", body: "'Cairo', sans-serif" },
];

const SPACING_SCALE = [4, 8, 12, 16, 24, 32, 48, 64];

export const ThemeTypographyTab: React.FC<ThemeTypographyTabProps> = ({ theme, onUpdateTheme }) => {
  const headingFont = theme.headingFontFamily || theme.fontFamily || "'Playfair Display', serif";
  const bodyFont = theme.bodyFontFamily || theme.fontFamily || "'Plus Jakarta Sans', sans-serif";
  const rawTheme = theme as unknown as Record<string, unknown>;
  const headingWeight = typeof rawTheme.headingFontWeight === "number" ? rawTheme.headingFontWeight : 700;
  const lineHeight = typeof theme.lineHeight === "number" ? theme.lineHeight : 1.2;
  const buttonStyle = (rawTheme.buttonStyle as string) || "solid";
  const buttonHeightPx = typeof rawTheme.buttonHeightPx === "number" ? rawTheme.buttonHeightPx : 44;
  const cardShadow = (rawTheme.cardShadow as string) || "sm";
  const spacingYPx = typeof theme.spacingYPx === "number" ? theme.spacingYPx : 28;
  const borderRadiusPx = typeof theme.borderRadiusPx === "number" ? theme.borderRadiusPx : 16;

  return (
    <div className="space-y-4" data-testid="theme-typography-tab">
      {/* Duos Typographiques */}
      <div className="space-y-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3">
        <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <Sparkles className="h-3.5 w-3.5 text-[#023859]" />
          <span>Duos Typographiques (Titre + Contenu)</span>
        </h4>
        <div className="grid grid-cols-2 gap-1.5">
          {CURATED_FONT_DUOS.map((duo) => {
            const isSelected = headingFont === duo.heading && bodyFont === duo.body;
            return (
              <button
                key={duo.id}
                type="button"
                onClick={() => onUpdateTheme({ headingFontFamily: duo.heading, bodyFontFamily: duo.body, fontFamily: duo.body })}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected ? "bg-white border-[#023859] ring-1 ring-[#023859]/25 shadow-2xs" : "bg-white/70 border-slate-200 hover:border-slate-300"
                }`}
              >
                <span className="block text-[11px] font-bold text-slate-900">{duo.label}</span>
                <span className="block text-[10px] text-slate-500">{duo.subtitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Polices, Tailles, Graisses & Hauteurs de ligne */}
      <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3">
        <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <Type className="h-3.5 w-3.5 text-[#023859]" />
          <span>Typographies (Polices, Tailles, Graisses, Interligne)</span>
        </h4>

        <div className="space-y-1">
          <label className="text-[11.5px] font-semibold text-[#475467]">Police des Titres</label>
          <select value={headingFont} onChange={(e) => onUpdateTheme({ headingFontFamily: e.target.value })} className="h-9 w-full rounded-xl border border-[#E4E7EC] bg-white px-2.5 text-[12px] text-[#17191C]">
            {FONT_OPTIONS.map((opt) => <option key={`h-${opt.value}`} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11.5px] font-semibold text-[#475467]">Police du Contenu</label>
          <select value={bodyFont} onChange={(e) => onUpdateTheme({ bodyFontFamily: e.target.value, fontFamily: e.target.value })} className="h-9 w-full rounded-xl border border-[#E4E7EC] bg-white px-2.5 text-[12px] text-[#17191C]">
            {FONT_OPTIONS.map((opt) => <option key={`b-${opt.value}`} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-[#475467]">
              <span>Taille Titres</span>
              <span className="font-mono text-[#023859] font-bold">{theme.titleFontSizePx ?? 36}px</span>
            </div>
            <input type="range" min={20} max={56} value={theme.titleFontSizePx ?? 36} onChange={(e) => onUpdateTheme({ titleFontSizePx: Number(e.target.value) })} className="w-full accent-[#023859] cursor-pointer" />
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-[#475467]">
              <span>Taille Contenu</span>
              <span className="font-mono text-[#023859] font-bold">{theme.bodyFontSizePx ?? 15}px</span>
            </div>
            <input type="range" min={12} max={22} value={theme.bodyFontSizePx ?? 15} onChange={(e) => onUpdateTheme({ bodyFontSizePx: Number(e.target.value) })} className="w-full accent-[#023859] cursor-pointer" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <span className="text-[11px] font-semibold text-[#475467] block mb-1">Graisse des Titres</span>
            <div className="grid grid-cols-3 gap-1">
              {[600, 700, 800].map((w) => (
                <button key={w} type="button" onClick={() => onUpdateTheme({ headingFontWeight: w } as Partial<CustomPageTheme>)} className={`h-7 rounded border text-[10.5px] font-bold cursor-pointer ${headingWeight === w ? "bg-[#023859] text-white border-[#023859]" : "bg-white text-slate-600 border-slate-200"}`}>{w}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-[#475467] mb-1">
              <span>Hauteur de ligne</span>
              <span className="font-mono text-[#023859] font-bold">{lineHeight.toFixed(2)}</span>
            </div>
            <input type="range" min={1.0} max={1.6} step={0.05} value={lineHeight} onChange={(e) => onUpdateTheme({ lineHeight: Number(e.target.value) })} className="w-full accent-[#023859] cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Système de Boutons & Cartes */}
      <div className="space-y-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3">
        <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <MousePointerClick className="h-3.5 w-3.5 text-[#023859]" />
          <span>Boutons & Cartes Globaux</span>
        </h4>
        <div className="grid grid-cols-3 gap-1.5">
          {([{ id: "solid", label: "Plein" }, { id: "outline", label: "Contour" }, { id: "pill", label: "Pilule" }] as const).map((st) => (
            <button key={st.id} type="button" onClick={() => onUpdateTheme({ buttonStyle: st.id } as Partial<CustomPageTheme>)} className={`h-7 rounded-lg border text-[11px] font-bold cursor-pointer ${buttonStyle === st.id ? "bg-[#023859] text-white border-[#023859]" : "bg-white text-slate-600 border-slate-200"}`}>{st.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-[#475467]">
              <span>Hauteur Boutons</span>
              <span className="font-mono text-[#023859] font-bold">{buttonHeightPx}px</span>
            </div>
            <input type="range" min={36} max={56} step={2} value={buttonHeightPx} onChange={(e) => onUpdateTheme({ buttonHeightPx: Number(e.target.value) } as Partial<CustomPageTheme>)} className="w-full accent-[#023859] cursor-pointer" />
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-[#475467]">
              <span>Rayon Cartes/Boutons</span>
              <span className="font-mono text-[#023859] font-bold">{borderRadiusPx}px</span>
            </div>
            <input type="range" min={0} max={28} step={2} value={borderRadiusPx} onChange={(e) => onUpdateTheme({ borderRadiusPx: Number(e.target.value) })} className="w-full accent-[#023859] cursor-pointer" />
          </div>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-[#475467] block mb-1">Ombre des Cartes</span>
          <div className="grid grid-cols-4 gap-1">
            {([{ id: "none", label: "Aucune" }, { id: "sm", label: "Douce" }, { id: "floating", label: "Flottante" }, { id: "brutal", label: "Brutale" }] as const).map((sh) => (
              <button key={sh.id} type="button" onClick={() => onUpdateTheme({ cardShadow: sh.id } as Partial<CustomPageTheme>)} className={`h-7 rounded border text-[10px] font-bold cursor-pointer ${cardShadow === sh.id ? "bg-[#023859] text-white border-[#023859]" : "bg-white text-slate-600 border-slate-200"}`}>{sh.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Échelle d'espacement cohérente (4, 8, 12, 16, 24, 32, 48, 64) */}
      <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3">
        <div className="flex items-center justify-between">
          <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <Box className="h-3.5 w-3.5 text-[#023859]" />
            <span>Échelle d&apos;Espacement</span>
          </h4>
          <span className="font-mono text-xs font-bold text-[#023859]">{spacingYPx}px</span>
        </div>
        <div className="grid grid-cols-8 gap-1">
          {SPACING_SCALE.map((val) => (
            <button
              key={val}
              type="button"
              data-testid={`theme-spacing-scale-${val}`}
              onClick={() => onUpdateTheme({ spacingYPx: val })}
              className={`h-7 rounded border text-[10px] font-mono font-bold cursor-pointer ${
                spacingYPx === val ? "bg-[#023859] text-white border-[#023859]" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
