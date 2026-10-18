import React from "react";
import { CustomPageSectionStyles } from "../../../../../domains/seller/customPage.types";

interface SectionStyleTabProps {
  styles: CustomPageSectionStyles;
  onStylesChange: (field: keyof CustomPageSectionStyles, value: unknown) => void;
}

export const SectionStyleTab: React.FC<SectionStyleTabProps> = ({
  styles,
  onStylesChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Background Color */}
      <div className="space-y-1">
        <label className="font-semibold text-slate-700 block text-[11px]">Couleur de fond spécifique</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={styles.backgroundColor || "#ffffff"}
            onChange={(e) => onStylesChange("backgroundColor", e.target.value)}
            className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={styles.backgroundColor || ""}
            placeholder="Hérité du thème"
            onChange={(e) => onStylesChange("backgroundColor", e.target.value)}
            className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Text Color */}
      <div className="space-y-1">
        <label className="font-semibold text-slate-700 block text-[11px]">Couleur du texte</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={styles.textColor || "#0f172a"}
            onChange={(e) => onStylesChange("textColor", e.target.value)}
            className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={styles.textColor || ""}
            placeholder="Hérité du thème"
            onChange={(e) => onStylesChange("textColor", e.target.value)}
            className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Padding Y Slider */}
      <div className="space-y-1.5 pt-2 border-t border-slate-200">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-700 text-[11px]">Espacement vertical</span>
          <span className="font-mono text-orange-600 font-bold">{styles.paddingY ?? 32}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={96}
          step={8}
          value={styles.paddingY ?? 32}
          onChange={(e) => onStylesChange("paddingY", parseInt(e.target.value, 10))}
          className="w-full accent-orange-500 cursor-pointer"
        />
      </div>

      {/* Padding X Slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-700 text-[11px]">Espacement horizontal</span>
          <span className="font-mono text-orange-600 font-bold">{styles.paddingX ?? 16}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={48}
          step={4}
          value={styles.paddingX ?? 16}
          onChange={(e) => onStylesChange("paddingX", parseInt(e.target.value, 10))}
          className="w-full accent-orange-500 cursor-pointer"
        />
      </div>
    </div>
  );
};
