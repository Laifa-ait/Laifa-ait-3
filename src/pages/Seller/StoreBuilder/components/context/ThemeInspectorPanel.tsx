import React, { useEffect, useState } from "react";
import { Check, RefreshCw, Type } from "lucide-react";
import {
  CustomPageTheme,
  SellerStoreConfig,
  StoreThemeSector,
} from "../../../../../domains/seller/customPage.types";
import { PRESET_THEMES, ThemePresets } from "./ThemePresets";

interface ThemeInspectorPanelProps {
  storeConfig?: SellerStoreConfig | null;
  currentTheme?: CustomPageTheme;
  onSaveTheme: (theme: CustomPageTheme) => Promise<void>;
  onThemeChangeLive?: (theme: CustomPageTheme) => void;
}

const DEFAULT_THEME: CustomPageTheme = {
  sector: "artisanat",
  primaryColor: "#B85B35",
  secondaryColor: "#1C2A39",
  accentColor: "#D4AF37",
  accentBadgeColor: "#D4AF37",
  canvasColor: "#FAF6F0",
  surfaceColor: "#FFFFFF",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  borderRadiusPx: 10,
  spacingYPx: 24,
  titleFontSizePx: 32,
  bodyFontSizePx: 16,
};

const normalizeTheme = (theme?: CustomPageTheme): CustomPageTheme => ({
  ...DEFAULT_THEME,
  ...theme,
});

export const ThemeInspectorPanel: React.FC<ThemeInspectorPanelProps> = ({
  storeConfig,
  currentTheme,
  onSaveTheme,
  onThemeChangeLive,
}) => {
  const [theme, setTheme] = useState<CustomPageTheme>(() =>
    normalizeTheme(currentTheme || storeConfig?.theme),
  );
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTheme(normalizeTheme(currentTheme || storeConfig?.theme));
  }, [currentTheme, storeConfig?.theme]);

  const updateTheme = (patch: Partial<CustomPageTheme>) => {
    setSavedSuccess(false);
    setError(null);
    const next = { ...theme, ...patch };
    setTheme(next);
    onThemeChangeLive?.(next);
  };

  const applyPreset = (preset: (typeof PRESET_THEMES)[number]) => {
    updateTheme({
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
      accentBadgeColor: preset.accent,
      canvasColor: preset.canvas,
      surfaceColor: preset.surface,
    });
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    setError(null);
    try {
      await onSaveTheme(theme);
      setSavedSuccess(true);
      window.setTimeout(() => setSavedSuccess(false), 2500);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "L'enregistrement du thème a échoué.");
    } finally {
      setSaving(false);
    }
  };

  const colorControl = (
    label: string,
    field: "primaryColor" | "secondaryColor" | "accentColor" | "accentBadgeColor" | "canvasColor" | "surfaceColor",
  ) => {
    const color: string = theme[field] || DEFAULT_THEME[field] || "#B85B35";
    const pickerColor = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color) ? color : (DEFAULT_THEME[field] || "#B85B35");
    return (
      <label key={field} className="space-y-1.5">
        <span className="text-[12px] font-medium text-[#475467]">{label}</span>
        <span className="flex items-center gap-2">
          <input
            type="color"
            value={pickerColor}
            aria-label={label}
            onChange={(event) => updateTheme({ [field]: event.target.value })}
            className="h-10 w-11 rounded-lg border border-[#E4E7EC] bg-white p-1 cursor-pointer"
          />
          <input
            type="text"
            value={color}
            aria-label={`${label} en hexadécimal`}
            onChange={(event) => {
              const value = event.target.value;
              setTheme((previous) => ({ ...previous, [field]: value }));
              if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) {
                setError(null);
                onThemeChangeLive?.({ ...theme, [field]: value });
              }
            }}
            onBlur={(event) => {
              const value = event.target.value;
              if (!/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) {
                setError("Saisissez une couleur hexadécimale valide, par exemple #F97316.");
              }
            }}
            className="h-10 min-w-0 flex-1 rounded-lg border border-[#E4E7EC] px-2 font-mono text-[12px] text-[#17191C] focus:border-[#F97316] focus:outline-none"
          />
        </span>
      </label>
    );
  };

  const sliderControl = (
    label: string,
    field: "borderRadiusPx" | "spacingYPx" | "titleFontSizePx" | "bodyFontSizePx",
    min: number,
    max: number,
    unit = "px",
  ) => {
    const value = theme[field] ?? DEFAULT_THEME[field] ?? min;
    return (
      <label key={field} className="block space-y-2">
        <span className="flex items-center justify-between gap-2 text-[12px]">
          <span className="font-medium text-[#475467]">{label}</span>
          <span className="font-mono text-[#F97316]">{value}{unit}</span>
        </span>
        <input
          type="range"
          min={min}
          max={max}
          step={field === "borderRadiusPx" ? 2 : 1}
          value={value}
          onChange={(event) => updateTheme({ [field]: Number(event.target.value) })}
          className="w-full accent-[#F97316]"
        />
      </label>
    );
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-[#E4E7EC] p-4">
        <div>
          <h2 className="text-[14px] font-semibold text-[#17191C]">Thème & identité visuelle</h2>
          <p className="text-[12px] text-[#667085]">Personnalisez l'apparence de votre boutique</p>
        </div>
        {savedSuccess && (
          <span className="flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-2 py-1 text-[12px] text-green-700">
            <Check className="h-3.5 w-3.5" /> Enregistré
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="flex-1 space-y-5 overflow-y-auto p-4">
        <label className="block space-y-1.5">
          <span className="text-[12px] font-medium text-[#475467]">Univers de la boutique</span>
          <select
            value={theme.sector}
            onChange={(event) => updateTheme({ sector: event.target.value as StoreThemeSector })}
            className="h-10 w-full rounded-lg border border-[#E4E7EC] bg-white px-3 text-[13px] text-[#17191C] focus:border-[#F97316] focus:outline-none"
          >
            <option value="mode">Mode & vêtements</option>
            <option value="beaute">Beauté & cosmétique</option>
            <option value="artisanat">Artisanat & tradition</option>
            <option value="tech">Tech & électronique</option>
            <option value="maison">Maison & décoration</option>
          </select>
        </label>

        <div className="border-t border-[#E4E7EC] pt-4">
          <ThemePresets
            currentPrimaryColor={theme.primaryColor}
            onApplyTheme={applyPreset}
          />
        </div>

        <section className="space-y-3 border-t border-[#E4E7EC] pt-4">
          <h3 className="text-[13px] font-semibold text-[#17191C]">Palette de couleurs</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {colorControl("Principale", "primaryColor")}
            {colorControl("Secondaire", "secondaryColor")}
            {colorControl("Accent", "accentColor")}
            {colorControl("Badges", "accentBadgeColor")}
            {colorControl("Fond de page", "canvasColor")}
            {colorControl("Fond des cartes", "surfaceColor")}
          </div>
        </section>

        <section className="space-y-3 border-t border-[#E4E7EC] pt-4">
          <h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-[#17191C]">
            <Type className="h-4 w-4 text-[#F97316]" /> Typographie
          </h3>
          <label className="block space-y-1.5">
            <span className="text-[12px] font-medium text-[#475467]">Police d'écriture</span>
            <select
              value={theme.fontFamily}
              onChange={(event) => updateTheme({ fontFamily: event.target.value })}
              className="h-10 w-full rounded-lg border border-[#E4E7EC] bg-white px-3 text-[13px] text-[#17191C] focus:border-[#F97316] focus:outline-none"
            >
              <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans · moderne</option>
              <option value="'Playfair Display', serif">Playfair Display · élégant</option>
              <option value="'Outfit', sans-serif">Outfit · contemporain</option>
              <option value="'DM Sans', sans-serif">DM Sans · minimal</option>
              <option value="'Cairo', sans-serif">Cairo · arabe & latin</option>
            </select>
          </label>
          {sliderControl("Taille des titres", "titleFontSizePx", 20, 56)}
          {sliderControl("Taille du texte", "bodyFontSizePx", 12, 24)}
        </section>

        <section className="space-y-4 border-t border-[#E4E7EC] pt-4">
          <h3 className="text-[13px] font-semibold text-[#17191C]">Formes et respiration</h3>
          {sliderControl("Arrondi des cartes", "borderRadiusPx", 0, 24)}
          {sliderControl("Espacement entre les sections", "spacingYPx", 0, 64)}
        </section>

        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-[12px] text-red-700">{error}</p>}
        <div className="sticky bottom-0 border-t border-[#E4E7EC] bg-white pt-3">
          <button
            type="submit"
            disabled={saving || Boolean(error)}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#F97316] text-[13px] font-semibold text-white transition-colors hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <><RefreshCw className="h-4 w-4 animate-spin" /> Enregistrement…</> : "Enregistrer le thème"}
          </button>
        </div>
      </form>
    </div>
  );
};
