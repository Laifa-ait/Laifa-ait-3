import React from "react";
import { Sparkles, Gem } from "lucide-react";
import {
  CustomPageSectionStyles,
  CustomPageTheme,
} from "../../../../../../domains/seller/customPage.types";
import {
  CARD_MATERIAL_OPTIONS,
  SURFACE_TEXTURE_OPTIONS,
} from "../../../constants/artisticAtmosphereOptions";
import { FrameShapeSelectorGrid } from "../../context/FrameShapeSelectorGrid";

interface SectionMaterialSubPanelProps {
  sectionType?: string;
  styles: CustomPageSectionStyles;
  theme?: CustomPageTheme;
  onStylesChange: (
    fieldOrPatch: keyof CustomPageSectionStyles | Partial<CustomPageSectionStyles>,
    value?: unknown
  ) => void;
}

export const SectionMaterialSubPanel: React.FC<SectionMaterialSubPanelProps> = ({
  sectionType,
  styles,
  theme,
  onStylesChange,
}) => {
  const activeTexture = styles.surfaceTexture || theme?.surfaceTexture || "none";
  const activeMaterial = styles.cardMaterial || theme?.cardMaterial || "solid-matte";
  const activeFrameShape = styles.frameShape || theme?.frameShape || "soft-modern";

  return (
    <div className="space-y-3 pt-2 border-t border-[#E4E7EC]">
      {sectionType !== "kinetic_marquee" && (
        <FrameShapeSelectorGrid
          activeShape={activeFrameShape}
          onSelectShape={(shape) => onStylesChange("frameShape", shape)}
          compact
          labelFr="Silhouette des Images & Cartes"
        />
      )}

      <div className="space-y-1.5 pt-2 border-t border-[#E4E7EC]">
        <label className="text-[12px] font-semibold text-[#011C40] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#023859]" />
          <span>Texture de Surface</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {SURFACE_TEXTURE_OPTIONS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onStylesChange("surfaceTexture", t.id)}
              className={`p-2 rounded-lg border text-left text-[10.5px] font-semibold cursor-pointer transition-all ${
                activeTexture === t.id
                  ? "border-[#023859] bg-[#F0F7FA] text-[#011C40] font-bold"
                  : "border-[#E4E7EC] bg-white text-[#475467] hover:bg-[#F7F8FA]"
              }`}
            >
              <span className="block truncate">{t.labelFr}</span>
            </button>
          ))}
        </div>
      </div>

      {sectionType !== "kinetic_marquee" && sectionType !== "hero_banner" && (
        <div className="space-y-1.5 pt-2 border-t border-[#E4E7EC]">
          <label className="text-[12px] font-semibold text-[#011C40] flex items-center gap-1.5">
            <Gem className="w-3.5 h-3.5 text-[#023859]" />
            <span>Matière des Cartes</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {CARD_MATERIAL_OPTIONS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onStylesChange("cardMaterial", m.id)}
                className={`py-2 px-1.5 rounded-lg border text-center text-[10px] font-semibold cursor-pointer transition-all ${
                  activeMaterial === m.id
                    ? "border-[#023859] bg-[#F0F7FA] text-[#011C40] font-bold"
                    : "border-[#E4E7EC] bg-white text-[#475467] hover:bg-[#F7F8FA]"
                }`}
              >
                <span className="block truncate">{m.labelFr}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
