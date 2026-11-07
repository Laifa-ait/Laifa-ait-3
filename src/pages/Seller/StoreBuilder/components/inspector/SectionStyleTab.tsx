import React from "react";
import { Sparkles, Gem } from "lucide-react";
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
  theme?: CustomPageTheme;
  onStylesChange: (
    fieldOrPatch: keyof CustomPageSectionStyles | Partial<CustomPageSectionStyles>,
    value?: unknown
  ) => void;
}

export const SectionStyleTab: React.FC<SectionStyleTabProps> = ({
  styles,
  theme,
  onStylesChange,
}) => {
  const paddingValue =
    typeof styles.paddingY === "number"
      ? styles.paddingY
      : { sm: 16, md: 32, lg: 48, xl: 64 }[styles.paddingY || "md"] ?? 32;

  const activeTexture = styles.surfaceTexture || theme?.surfaceTexture || "none";
  const activeMaterial = styles.cardMaterial || theme?.cardMaterial || "solid-matte";
  const activeFrameShape = styles.frameShape || theme?.frameShape || "soft-modern";

  return (
    <div className="space-y-4 select-none">
      {/* Standardized WCAG Color Schemes Picker */}
      <ColorSchemePicker
        styles={styles}
        theme={theme}
        onStylesChange={onStylesChange}
      />

      {/* Pilier 3: Contrôles Typographiques Avancés (letterSpacing, lineHeight, *...*, {...}) */}
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

      {/* Pilier 2: Silhouette des Images & Cartes (Par section ou global) */}
      <div className="pt-2 border-t border-[#E4E7EC]">
        <FrameShapeSelectorGrid
          activeShape={activeFrameShape}
          onSelectShape={(shape) => onStylesChange("frameShape", shape)}
          compact
          labelFr="Silhouette des Images & Cartes"
        />
      </div>

      {/* Section Surface Texture (Pilier 1) */}
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

      {/* Section Card Material & Refraction (Pilier 1) */}
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

      {/* Marges internes Y & X */}
      <div className="space-y-2 pt-2 border-t border-[#E4E7EC]">
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-[#011C40]">Espacement haut/bas</span>
            <span className="font-mono text-[#023859] font-bold">{paddingValue}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={120}
            step={8}
            value={paddingValue}
            onChange={(e) => onStylesChange("paddingY", parseInt(e.target.value, 10))}
            className="w-full accent-[#023859] cursor-pointer"
          />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-[#011C40]">Marges latérales</span>
            <span className="font-mono text-[#023859] font-bold">{styles.paddingX ?? 20}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={64}
            step={4}
            value={styles.paddingX ?? 20}
            onChange={(e) => onStylesChange("paddingX", parseInt(e.target.value, 10))}
            className="w-full accent-[#023859] cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
