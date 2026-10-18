import React from "react";
import { CustomPageSectionStyles } from "../../../../../domains/seller/customPage.types";

interface SectionLayoutTabProps {
  styles: CustomPageSectionStyles;
  settings: Record<string, unknown>;
  onStylesChange: (field: keyof CustomPageSectionStyles, value: unknown) => void;
  onSettingsChange: (field: string, value: unknown) => void;
}

export const SectionLayoutTab: React.FC<SectionLayoutTabProps> = ({
  styles,
  settings,
  onStylesChange,
  onSettingsChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-[#17191C] block">
          Largeur du conteneur
        </label>
        <select
          value={styles.containerWidth || "contained"}
          onChange={(e) => onStylesChange("containerWidth", e.target.value)}
          className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg text-[#17191C] text-[14px] focus:outline-none focus:border-[#F97316]"
        >
          <option value="contained">Encadré (Contained)</option>
          <option value="full">Plein écran (Full Width)</option>
        </select>
      </div>

      {/* Espacement Vertical (0-120px) */}
      <div className="space-y-1.5 pt-2 border-t border-[#E4E7EC]">
        <div className="flex justify-between items-center text-[13px]">
          <span className="font-medium text-[#17191C]">Espacement vertical (0 à 120px)</span>
          <span className="font-mono text-[#F97316] font-bold">{styles.paddingY ?? 32}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={120}
          step={8}
          value={styles.paddingY ?? 32}
          onChange={(e) => onStylesChange("paddingY", parseInt(e.target.value, 10))}
          className="w-full accent-[#F97316] cursor-pointer"
        />
      </div>

      {/* Alignement Horizontal */}
      <div className="space-y-1.5 pt-2 border-t border-[#E4E7EC]">
        <label className="text-[13px] font-medium text-[#17191C] block">
          Alignement du contenu
        </label>
        <div className="grid grid-cols-3 gap-2">
          {["left", "center", "right"].map((align) => (
            <button
              key={align}
              type="button"
              onClick={() => onSettingsChange("textAlignment", align)}
              className={`h-10 rounded-lg border text-[13px] font-medium capitalize cursor-pointer transition-colors ${
                settings.textAlignment === align
                  ? "border-[#F97316] bg-[#FFF7ED] text-[#F97316] font-bold"
                  : "border-[#E4E7EC] bg-white text-[#667085] hover:bg-[#F7F8FA]"
              }`}
            >
              {align === "left" ? "Gauche" : align === "center" ? "Centre" : "Droite"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
