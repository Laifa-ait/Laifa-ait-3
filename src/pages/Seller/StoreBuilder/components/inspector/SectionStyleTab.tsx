import React from "react";
import { Sparkles, Gem, RotateCcw, Box, Layers } from "lucide-react";
import {
  CustomPageSectionStyles,
  CustomPageTheme,
} from "../../../../../domains/seller/customPage.types";
import { ColorSchemePicker } from "./controls/ColorSchemePicker";
import {
  CARD_MATERIAL_OPTIONS,
  SURFACE_TEXTURE_OPTIONS,
} from "../../constants/artisticAtmosphereOptions";
import { FrameShapeSelectorGrid } from "../context/FrameShapeSelectorGrid";
import { EditorialTypographyControlBox } from "./controls/EditorialTypographyControlBox";

interface SectionStyleTabProps {
  styles: CustomPageSectionStyles;
  settings?: Record<string, unknown>;
  theme?: CustomPageTheme;
  onStylesChange: (
    fieldOrPatch: keyof CustomPageSectionStyles | Partial<CustomPageSectionStyles>,
    value?: unknown
  ) => void;
  onSettingsChange?: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
}

export const SectionStyleTab: React.FC<SectionStyleTabProps> = ({
  styles,
  settings = {},
  theme,
  onStylesChange,
  onSettingsChange,
}) => {
  const activeTexture = styles.surfaceTexture || theme?.surfaceTexture || "none";
  const activeMaterial = styles.cardMaterial || theme?.cardMaterial || "solid-matte";
  const activeFrameShape = styles.frameShape || theme?.frameShape || "soft-modern";
  const currentRadius = styles.borderRadius || "md";
  const currentShadow = styles.shadow || "none";
  const sectionOpacity = typeof settings.sectionOpacity === "number" ? settings.sectionOpacity : 100;

  const handleResetSectionStyles = () => {
    onStylesChange({
      backgroundColor: undefined,
      textColor: undefined,
      colorScheme: undefined,
      borderRadius: undefined,
      shadow: undefined,
      surfaceTexture: undefined,
      cardMaterial: undefined,
      frameShape: undefined,
      letterSpacing: undefined,
      lineHeight: undefined,
    });
    if (onSettingsChange) {
      onSettingsChange({ sectionOpacity: 100, backgroundGradient: undefined });
    }
  };

  return (
    <div className="space-y-4 select-none" data-testid="section-style-tab">
      {/* Standardized WCAG Color Schemes Picker + Couleurs Texte/Fond */}
      <ColorSchemePicker
        styles={styles}
        theme={theme}
        onStylesChange={onStylesChange}
      />

      {/* Rayon des coins & Ombre de la section */}
      <div className="space-y-2.5 pt-2 border-t border-[#E4E7EC]">
        <label className="text-[12px] font-semibold text-[#011C40] flex items-center gap-1.5">
          <Box className="w-3.5 h-3.5 text-[#023859]" />
          <span>Rayon des coins (Bordures)</span>
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {(
            [
              { id: "none", label: "Carré" },
              { id: "sm", label: "Léger" },
              { id: "md", label: "Standard" },
              { id: "lg", label: "Arrondi" },
            ] as const
          ).map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onStylesChange("borderRadius", r.id)}
              className={`h-8 rounded-lg border text-[11px] font-semibold cursor-pointer transition-colors ${
                currentRadius === r.id
                  ? "border-[#023859] bg-[#F0F7FA] text-[#023859] font-bold"
                  : "border-[#E4E7EC] bg-white text-[#667085] hover:bg-[#F7F8FA]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <label className="text-[12px] font-semibold text-[#011C40] flex items-center gap-1.5 pt-1">
          <Layers className="w-3.5 h-3.5 text-[#023859]" />
          <span>Ombre & Élévation</span>
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {(
            [
              { id: "none", label: "Aucune" },
              { id: "sm", label: "Douce" },
              { id: "floating", label: "Flottante" },
              { id: "brutal", label: "Brutale" },
            ] as const
          ).map((sh) => (
            <button
              key={sh.id}
              type="button"
              onClick={() => onStylesChange("shadow", sh.id)}
              className={`h-8 rounded-lg border text-[11px] font-semibold cursor-pointer transition-colors ${
                currentShadow === sh.id
                  ? "border-[#023859] bg-[#F0F7FA] text-[#023859] font-bold"
                  : "border-[#E4E7EC] bg-white text-[#667085] hover:bg-[#F7F8FA]"
              }`}
            >
              {sh.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contrôles Typographiques Avancés (letterSpacing, lineHeight, accents) */}
      <div className="pt-2 border-t border-[#E4E7EC]">
        <EditorialTypographyControlBox
          letterSpacing={styles.letterSpacing ?? theme?.letterSpacing ?? 0}
          lineHeight={styles.lineHeight ?? theme?.lineHeight ?? 1.15}
          headingAccentStyle={
            styles.headingAccentStyle || theme?.headingAccentStyle || "metallic-gold"
          }
          headingUnderlineStyle={
            styles.headingUnderlineStyle || theme?.headingUnderlineStyle || "brush-stroke"
          }
          accentColor={theme?.accentColor || theme?.primaryColor}
          onChange={(patch) => onStylesChange(patch)}
        />
      </div>

      {/* Silhouette des Images & Cartes */}
      <div className="pt-2 border-t border-[#E4E7EC]">
        <FrameShapeSelectorGrid
          activeShape={activeFrameShape}
          onSelectShape={(shape) => onStylesChange("frameShape", shape)}
          compact
          labelFr="Silhouette des Images & Cartes"
        />
      </div>

      {/* Texture de Surface & Matière des Cartes */}
      <div className="space-y-1.5 pt-2 border-t border-[#E4E7EC]">
        <label className="text-[12px] font-semibold text-[#011C40] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#023859]" />
          <span>Texture de Surface (Section)</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {SURFACE_TEXTURE_OPTIONS.map((t) => {
            const isAct = activeTexture === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onStylesChange("surfaceTexture", t.id)}
                className={`p-2 rounded-lg border text-left text-[10.5px] font-semibold cursor-pointer transition-all ${
                  isAct
                    ? "border-[#023859] bg-[#F0F7FA] text-[#011C40] font-bold"
                    : "border-[#E4E7EC] bg-white text-[#475467] hover:bg-[#F7F8FA]"
                }`}
              >
                <span className="block truncate">{t.labelFr}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5 pt-2 border-t border-[#E4E7EC]">
        <label className="text-[12px] font-semibold text-[#011C40] flex items-center gap-1.5">
          <Gem className="w-3.5 h-3.5 text-[#023859]" />
          <span>Matière & Réfraction des Cartes</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {CARD_MATERIAL_OPTIONS.map((m) => {
            const isAct = activeMaterial === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onStylesChange("cardMaterial", m.id)}
                className={`py-2 px-1.5 rounded-lg border text-center text-[10px] font-semibold cursor-pointer transition-all ${
                  isAct
                    ? "border-[#023859] bg-[#F0F7FA] text-[#011C40] font-bold"
                    : "border-[#E4E7EC] bg-white text-[#475467] hover:bg-[#F7F8FA]"
                }`}
              >
                <span className="block truncate">{m.labelFr}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Opacité & Réinitialisation du style de la section */}
      {onSettingsChange && (
        <div className="space-y-1.5 pt-2 border-t border-[#E4E7EC]">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-[#011C40]">Opacité de la section</span>
            <span className="font-mono text-[#023859] font-bold">{sectionOpacity}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={100}
            step={5}
            value={sectionOpacity}
            onChange={(e) => onSettingsChange("sectionOpacity", Number(e.target.value))}
            className="w-full accent-[#023859] cursor-pointer"
          />
        </div>
      )}

      <div className="pt-2 border-t border-[#E4E7EC]">
        <button
          type="button"
          data-testid="reset-section-styles-btn"
          onClick={handleResetSectionStyles}
          className="w-full h-8 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Réinitialiser le style (Hériter du Thème Global)</span>
        </button>
      </div>
    </div>
  );
};
