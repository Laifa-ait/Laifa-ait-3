import React, { useState } from "react";
import { CustomPageTheme, StoreConfig, StoreThemeSector } from "../../../../../domains/seller/customPage.types";
import { Type, Check, RefreshCw } from "lucide-react";
import { ThemePresets, PRESET_PALETTES } from "./ThemePresets";

interface ThemeInspectorPanelProps {
  storeConfig: StoreConfig | null;
  onSaveTheme: (theme: CustomPageTheme) => Promise<void>;
  onThemeChangeLive?: (theme: CustomPageTheme) => void;
}

export const ThemeInspectorPanel: React.FC<ThemeInspectorPanelProps> = ({
  storeConfig,
  onSaveTheme,
  onThemeChangeLive,
}) => {
  const currentTheme = storeConfig?.theme;
  const [sector, setSector] = useState<StoreThemeSector>(currentTheme?.sector || "mode");
  const [primaryColor, setPrimaryColor] = useState(currentTheme?.primaryColor || "#F97316");
  const [secondaryColor] = useState(currentTheme?.secondaryColor || "#EA580C");
  const [accentColor] = useState(currentTheme?.accentColor || "#F97316");
  const [canvasColor, setCanvasColor] = useState(currentTheme?.canvasColor || "#F5F6F8");
  const [surfaceColor] = useState(currentTheme?.surfaceColor || "#FFFFFF");
  const [fontFamily, setFontFamily] = useState(currentTheme?.fontFamily || "'Plus Jakarta Sans', sans-serif");
  const [borderRadiusPx, setBorderRadiusPx] = useState(currentTheme?.borderRadiusPx ?? 8);
  const [spacingYPx] = useState(currentTheme?.spacingYPx ?? 24);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const applyLive = (newTheme: CustomPageTheme) => {
    if (onThemeChangeLive) {
      onThemeChangeLive(newTheme);
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_PALETTES[0]) => {
    setPrimaryColor(preset.primary);
    setCanvasColor(preset.canvas);

    const updated: CustomPageTheme = {
      sector,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
      canvasColor: preset.canvas,
      surfaceColor: preset.surface,
      fontFamily,
      borderRadiusPx,
      spacingYPx,
    };
    applyLive(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      const themePayload: CustomPageTheme = {
        sector,
        primaryColor,
        secondaryColor,
        accentColor,
        canvasColor,
        surfaceColor,
        fontFamily,
        borderRadiusPx,
        spacingYPx,
      };
      await onSaveTheme(themePayload);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF]">
      {/* Header */}
      <div className="p-4 border-b border-[#E4E7EC] flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-[#17191C]">Thème & Design</h2>
          <p className="text-[13px] text-[#667085]">Charte graphique de la boutique</p>
        </div>
        {savedSuccess && (
          <span className="flex items-center gap-1 text-[13px] text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded-lg border border-[#15803D]/20">
            <Check className="w-3.5 h-3.5" /> Enregistré
          </span>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 space-y-5 text-[14px]">
        {/* Secteur d'activité */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-[#17191C] block">
            Secteur d'activité
          </label>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value as StoreThemeSector)}
            className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg text-[#17191C] text-[14px] focus:outline-none focus:border-[#F97316]"
          >
            <option value="mode">Mode & Vêtements</option>
            <option value="beaute">Beauté & Cosmétique</option>
            <option value="artisanat">Artisanat & Tradition</option>
            <option value="tech">Tech & Électronique</option>
            <option value="maison">Maison & Décoration</option>
          </select>
        </div>

        {/* Palettes Prédéfinies */}
        <ThemePresets onApplyPreset={handleApplyPreset} />

        {/* Couleurs directes */}
        <div className="space-y-3 pt-2 border-t border-[#E4E7EC]">
          <h3 className="text-[13px] font-medium text-[#17191C]">Couleurs personnalisées</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[13px] text-[#667085] block">Couleur principale</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => {
                    setPrimaryColor(e.target.value);
                    applyLive({ sector, primaryColor: e.target.value, secondaryColor, accentColor, canvasColor, surfaceColor, fontFamily, borderRadiusPx, spacingYPx });
                  }}
                  className="w-9 h-[44px] p-0.5 rounded-lg border border-[#E4E7EC] cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 h-[44px] px-2 text-[13px] font-mono border border-[#E4E7EC] rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[13px] text-[#667085] block">Fond du Canvas</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={canvasColor}
                  onChange={(e) => {
                    setCanvasColor(e.target.value);
                    applyLive({ sector, primaryColor, secondaryColor, accentColor, canvasColor: e.target.value, surfaceColor, fontFamily, borderRadiusPx, spacingYPx });
                  }}
                  className="w-9 h-[44px] p-0.5 rounded-lg border border-[#E4E7EC] cursor-pointer"
                />
                <input
                  type="text"
                  value={canvasColor}
                  onChange={(e) => setCanvasColor(e.target.value)}
                  className="flex-1 h-[44px] px-2 text-[13px] font-mono border border-[#E4E7EC] rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Typographie */}
        <div className="space-y-2 pt-2 border-t border-[#E4E7EC]">
          <label className="text-[13px] font-medium text-[#17191C] flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Police d'écriture</span>
          </label>
          <select
            value={fontFamily}
            onChange={(e) => {
              setFontFamily(e.target.value);
              applyLive({ sector, primaryColor, secondaryColor, accentColor, canvasColor, surfaceColor, fontFamily: e.target.value, borderRadiusPx, spacingYPx });
            }}
            className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg text-[#17191C] text-[14px] focus:outline-none focus:border-[#F97316]"
          >
            <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Moderne)</option>
            <option value="'Playfair Display', serif">Playfair Display (Prestige / Luxe)</option>
            <option value="'Outfit', sans-serif">Outfit (Contemporain)</option>
            <option value="'DM Sans', sans-serif">DM Sans (Minimal)</option>
            <option value="'Cairo', sans-serif">Cairo (Arabe & Latin)</option>
          </select>
        </div>

        {/* Arrondi des coins */}
        <div className="space-y-2 pt-2 border-t border-[#E4E7EC]">
          <div className="flex justify-between items-center text-[13px]">
            <span className="font-medium text-[#17191C]">Rayon des coins</span>
            <span className="text-[#667085]">{borderRadiusPx} px</span>
          </div>
          <input
            type="range"
            min="0"
            max="24"
            step="2"
            value={borderRadiusPx}
            onChange={(e) => {
              const val = Number(e.target.value);
              setBorderRadiusPx(val);
              applyLive({ sector, primaryColor, secondaryColor, accentColor, canvasColor, surfaceColor, fontFamily, borderRadiusPx: val, spacingYPx });
            }}
            className="w-full accent-[#F97316]"
          />
        </div>

        {/* Bouton de sauvegarde */}
        <div className="pt-4 border-t border-[#E4E7EC]">
          <button
            type="submit"
            disabled={saving}
            className="w-full h-[40px] bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg text-[14px] font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Enregistrement…</span>
              </>
            ) : (
              <span>Enregistrer le thème</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
