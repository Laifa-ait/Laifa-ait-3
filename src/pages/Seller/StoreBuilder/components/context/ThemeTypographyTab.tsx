import React from "react";
import { Type, Box, Sparkles, MousePointerClick } from "lucide-react";
import { CustomPageTheme } from "../../../../../domains/seller/customPage.types";

interface ThemeTypographyTabProps {
  theme: CustomPageTheme;
  onUpdateTheme: (patch: Partial<CustomPageTheme>) => void;
}

const FONT_OPTIONS = [
  { value: "'DM Sans', sans-serif", label: "DM Sans · Minimal & E-Commerce Nordique" },
  { value: "'Plus Jakarta Sans', sans-serif", label: "Plus Jakarta Sans · Moderne & Équilibré" },
  { value: "'Archivo', sans-serif", label: "Archivo · Graphique & Flagship Studio" },
  { value: "'Space Grotesk', sans-serif", label: "Space Grotesk · Architecture & Tech" },
  { value: "'Outfit', sans-serif", label: "Outfit · Contemporain & Géométrique" },
  { value: "'Playfair Display', serif", label: "Playfair Display · Éditorial & Luxe Serif" },
  { value: "'Cormorant Garamond', serif", label: "Cormorant Garamond · Haute Couture & Galeries" },
  { value: "'Lora', serif", label: "Lora · Éditorial Classique" },
  { value: "'Cairo', sans-serif", label: "Cairo · Bilingue Arabe / Français" },
];

const CURATED_FONT_DUOS = [
  { id: "nordic", label: "Flagship Nordique", subtitle: "Outfit + DM Sans", heading: "'Outfit', sans-serif", body: "'DM Sans', sans-serif" },
  { id: "couture", label: "Éditorial Luxe", subtitle: "Playfair + Jakarta", heading: "'Playfair Display', serif", body: "'Plus Jakarta Sans', sans-serif" },
  { id: "architectural", label: "Architecture Studio", subtitle: "Space Grotesk + DM Sans", heading: "'Space Grotesk', sans-serif", body: "'DM Sans', sans-serif" },
  { id: "bilingual", label: "Franco-Arabe", subtitle: "Cairo Titre & Corps", heading: "'Cairo', sans-serif", body: "'Cairo', sans-serif" },
];

const SPACING_SCALE = [4, 8, 12, 16, 24, 32, 48, 64];

export const ThemeTypographyTab: React.FC<ThemeTypographyTabProps> = ({ theme, onUpdateTheme }) => {
  const headingFont = theme.headingFontFamily || theme.fontFamily || "'Archivo', sans-serif";
  const bodyFont = theme.bodyFontFamily || theme.fontFamily || "'DM Sans', sans-serif";
  const headingWeight = typeof theme.headingFontWeight === "number" ? theme.headingFontWeight : 700;
  const lineHeight = typeof theme.lineHeight === "number" ? theme.lineHeight : 1.2;
  const buttonStyle = theme.buttonStyle || "solid";
  const buttonHeightPx = typeof theme.buttonHeightPx === "number" ? theme.buttonHeightPx : 44;
  const cardShadow = theme.cardShadow || "sm";
  const spacingYPx = typeof theme.spacingYPx === "number" ? theme.spacingYPx : 28;
  const borderRadiusPx = typeof theme.borderRadiusPx === "number" ? theme.borderRadiusPx : 8;

  return (
    <div className="space-y-4" data-testid="theme-typography-tab">
      {/* Duos Typographiques */}
      <div className="space-y-2.5 rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-background)] p-3">
        <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--studio-muted)]">
          <Sparkles className="h-3.5 w-3.5 text-[var(--studio-primary)]" />
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
                  isSelected ? "bg-[var(--studio-white)] border-[var(--studio-primary)] ring-1 ring-[var(--studio-focus)]/25 shadow-2xs" : "bg-[var(--studio-white)]/80 border-[var(--studio-border)] hover:border-[var(--studio-border-strong)]"
                }`}
              >
                <span className="block text-[11px] font-bold text-[var(--studio-black)]">{duo.label}</span>
                <span className="block text-[10px] text-[var(--studio-muted)]">{duo.subtitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Polices, Tailles, Graisses & Hauteurs de ligne */}
      <div className="space-y-3 rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-background)] p-3">
        <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--studio-muted)]">
          <Type className="h-3.5 w-3.5 text-[var(--studio-primary)]" />
          <span>Typographies (Polices, Tailles, Graisses, Interligne)</span>
        </h4>

        <div className="space-y-1">
          <label className="text-[11.5px] font-semibold text-[var(--studio-text)]">Police des Titres</label>
          <select value={headingFont} onChange={(e) => onUpdateTheme({ headingFontFamily: e.target.value })} className="h-9 w-full rounded-xl border border-[var(--studio-border)] bg-[var(--studio-white)] px-2.5 text-[12px] text-[var(--studio-black)]">
            {FONT_OPTIONS.map((opt) => <option key={`h-${opt.value}`} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11.5px] font-semibold text-[var(--studio-text)]">Police du Contenu</label>
          <select value={bodyFont} onChange={(e) => onUpdateTheme({ bodyFontFamily: e.target.value, fontFamily: e.target.value })} className="h-9 w-full rounded-xl border border-[var(--studio-border)] bg-[var(--studio-white)] px-2.5 text-[12px] text-[var(--studio-black)]">
            {FONT_OPTIONS.map((opt) => <option key={`b-${opt.value}`} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-[var(--studio-text)] tabular-nums">
              <span>Taille Titres</span>
              <span className="font-mono text-[var(--studio-primary)] font-bold">{theme.titleFontSizePx ?? 36}px</span>
            </div>
            <input type="range" min={20} max={56} value={theme.titleFontSizePx ?? 36} onChange={(e) => onUpdateTheme({ titleFontSizePx: Number(e.target.value) })} className="w-full accent-[var(--studio-primary)] cursor-pointer" />
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-[var(--studio-text)] tabular-nums">
              <span>Taille Contenu</span>
              <span className="font-mono text-[var(--studio-primary)] font-bold">{theme.bodyFontSizePx ?? 15}px</span>
            </div>
            <input type="range" min={12} max={22} value={theme.bodyFontSizePx ?? 15} onChange={(e) => onUpdateTheme({ bodyFontSizePx: Number(e.target.value) })} className="w-full accent-[var(--studio-primary)] cursor-pointer" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <span className="text-[11px] font-semibold text-[var(--studio-text)] block mb-1">Graisse des Titres</span>
            <div className="grid grid-cols-3 gap-1">
              {[600, 700, 800].map((w) => (
                <button key={w} type="button" data-testid={`theme-heading-weight-${w}`} onClick={() => onUpdateTheme({ headingFontWeight: w })} className={`h-7 rounded border text-[10.5px] font-bold cursor-pointer ${headingWeight === w ? "bg-[var(--studio-primary)] text-[var(--studio-white)] border-[var(--studio-primary)]" : "bg-[var(--studio-white)] text-[var(--studio-text)] border-[var(--studio-border)]"}`}>{w}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-[var(--studio-text)] mb-1 tabular-nums">
              <span>Hauteur de ligne</span>
              <span className="font-mono text-[var(--studio-primary)] font-bold">{lineHeight.toFixed(2)}</span>
            </div>
            <input type="range" min={1.0} max={1.6} step={0.05} value={lineHeight} onChange={(e) => onUpdateTheme({ lineHeight: Number(e.target.value) })} className="w-full accent-[var(--studio-primary)] cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Système de Boutons & Cartes */}
      <div className="space-y-2.5 rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-background)] p-3">
        <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--studio-muted)]">
          <MousePointerClick className="h-3.5 w-3.5 text-[var(--studio-primary)]" />
          <span>Boutons &amp; Cartes Globaux</span>
        </h4>
        <div className="grid grid-cols-4 gap-1.5">
          {([{ id: "solid", label: "Plein" }, { id: "outline", label: "Contour" }, { id: "pill", label: "Pilule" }, { id: "sharp", label: "Carré" }] as const).map((st) => (
            <button key={st.id} type="button" data-testid={`theme-button-style-${st.id}`} onClick={() => onUpdateTheme({ buttonStyle: st.id })} className={`h-7 rounded-lg border text-[10.5px] font-bold cursor-pointer ${buttonStyle === st.id ? "bg-[var(--studio-primary)] text-[var(--studio-white)] border-[var(--studio-primary)]" : "bg-[var(--studio-white)] text-[var(--studio-text)] border-[var(--studio-border)]"}`}>{st.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-[var(--studio-text)] tabular-nums">
              <span>Hauteur Boutons</span>
              <span className="font-mono text-[var(--studio-primary)] font-bold">{buttonHeightPx}px</span>
            </div>
            <input type="range" min={36} max={56} step={2} value={buttonHeightPx} onChange={(e) => onUpdateTheme({ buttonHeightPx: Number(e.target.value) })} className="w-full accent-[var(--studio-primary)] cursor-pointer" />
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-[var(--studio-text)] tabular-nums">
              <span>Rayon Cartes/Boutons</span>
              <span className="font-mono text-[var(--studio-primary)] font-bold">{borderRadiusPx}px</span>
            </div>
            <input type="range" min={0} max={28} step={2} value={borderRadiusPx} onChange={(e) => onUpdateTheme({ borderRadiusPx: Number(e.target.value) })} className="w-full accent-[var(--studio-primary)] cursor-pointer" />
          </div>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-[var(--studio-text)] block mb-1">Ombre des Cartes</span>
          <div className="grid grid-cols-4 gap-1">
            {([{ id: "none", label: "Aucune" }, { id: "sm", label: "Douce" }, { id: "floating", label: "Flottante" }, { id: "brutal", label: "Brutale" }] as const).map((sh) => (
              <button key={sh.id} type="button" data-testid={`theme-card-shadow-${sh.id}`} onClick={() => onUpdateTheme({ cardShadow: sh.id })} className={`h-7 rounded border text-[10px] font-bold cursor-pointer ${cardShadow === sh.id ? "bg-[var(--studio-primary)] text-[var(--studio-white)] border-[var(--studio-primary)]" : "bg-[var(--studio-white)] text-[var(--studio-text)] border-[var(--studio-border)]"}`}>{sh.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Échelle d'espacement cohérente (4, 8, 12, 16, 24, 32, 48, 64) */}
      <div className="space-y-2 rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-background)] p-3">
        <div className="flex items-center justify-between">
          <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--studio-muted)]">
            <Box className="h-3.5 w-3.5 text-[var(--studio-primary)]" />
            <span>Échelle d&apos;Espacement</span>
          </h4>
          <span className="font-mono text-xs font-bold text-[var(--studio-primary)] tabular-nums">{spacingYPx}px</span>
        </div>
        <div className="grid grid-cols-8 gap-1">
          {SPACING_SCALE.map((val) => (
            <button
              key={val}
              type="button"
              data-testid={`theme-spacing-scale-${val}`}
              onClick={() => onUpdateTheme({ spacingYPx: val })}
              className={`h-7 rounded border text-[10px] font-mono font-bold cursor-pointer ${
                spacingYPx === val ? "bg-[var(--studio-primary)] text-[var(--studio-white)] border-[var(--studio-primary)]" : "bg-[var(--studio-white)] text-[var(--studio-text)] border-[var(--studio-border)] hover:bg-[var(--studio-surface-subtle)]"
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
