import React from "react";
import {
  CustomPageSectionStyles,
  CustomPageTheme,
} from "../../../../../domains/seller/customPage.types";
import { ColorSchemePicker } from "./controls/ColorSchemePicker";

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

  return (
    <div className="space-y-4 select-none">
      {/* Standardized WCAG Color Schemes Picker */}
      <ColorSchemePicker
        styles={styles}
        theme={theme}
        onStylesChange={onStylesChange}
      />

      {/* Arrondi des coins */}
      <div className="space-y-1.5 pt-2 border-t border-[#E4E7EC]">
        <label className="text-[12px] font-semibold text-[#011C40] flex items-center justify-between">
          <span>Arrondi des cartes & blocs</span>
          <span className="font-mono text-[#023859] text-[11px] font-bold">
            {styles.borderRadius || "md"}
          </span>
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: "none", label: "Carré (0px)" },
            { id: "sm", label: "Léger (6px)" },
            { id: "md", label: "Doux (12px)" },
            { id: "lg", label: "Rond (20px)" },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onStylesChange("borderRadius", r.id)}
              className={`h-8 rounded-lg border text-[11px] font-semibold cursor-pointer transition-colors ${
                (styles.borderRadius || "md") === r.id
                  ? "border-[#023859] bg-[#F0F7FA] text-[#023859] font-bold"
                  : "border-[#E4E7EC] bg-white text-[#667085] hover:bg-[#F7F8FA]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Marges internes Y */}
      <div className="space-y-1.5 pt-2 border-t border-[#E4E7EC]">
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

      {/* Marges internes X */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-[#011C40]">Marges latérales (gauche/droite)</span>
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
  );
};
