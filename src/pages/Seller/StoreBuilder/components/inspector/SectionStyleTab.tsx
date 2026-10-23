import React from "react";
import { CustomPageSectionStyles } from "../../../../../domains/seller/customPage.types";
import { Palette } from "lucide-react";

interface SectionStyleTabProps {
  styles: CustomPageSectionStyles;
  onStylesChange: (field: keyof CustomPageSectionStyles, value: unknown) => void;
}

export const SectionStyleTab: React.FC<SectionStyleTabProps> = ({
  styles,
  onStylesChange,
}) => {
  const paddingValue =
    typeof styles.paddingY === "number"
      ? styles.paddingY
      : { sm: 16, md: 32, lg: 48, xl: 64 }[styles.paddingY || "md"];

  const QUICK_PALETTES = [
    { label: "Hérité", bg: "", text: "" },
    { label: "Pur Blanc", bg: "#FFFFFF", text: "#17191C" },
    { label: "Sable Chaud", bg: "#FAF6F0", text: "#1C2A39" },
    { label: "Noir Obsidienne", bg: "#0F172A", text: "#F8FAFC" },
    { label: "Gris Studio", bg: "#F8FAFC", text: "#0F172A" },
  ];

  return (
    <div className="space-y-4 select-none">
      {/* Quick Color Presets */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-semibold text-[#17191C] flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Palettes d'ambiance rapide</span>
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {QUICK_PALETTES.map((pal) => (
            <button
              key={pal.label}
              type="button"
              onClick={() => {
                onStylesChange("backgroundColor", pal.bg || undefined);
                onStylesChange("textColor", pal.text || undefined);
              }}
              className="h-8 rounded-lg border border-[#E4E7EC] text-[10px] font-semibold hover:border-[#F97316] transition-colors cursor-pointer flex items-center justify-center text-[#475467] bg-white"
            >
              {pal.label}
            </button>
          ))}
        </div>
      </div>

      {/* Specific Background Color */}
      <div className="space-y-1.5 pt-2 border-t border-[#E4E7EC]">
        <label className="text-[12px] font-semibold text-[#17191C] block">
          Couleur de fond spécifique
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={styles.backgroundColor || "#ffffff"}
            onChange={(e) => onStylesChange("backgroundColor", e.target.value || undefined)}
            className="w-9 h-9 rounded-lg border border-[#E4E7EC] cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={styles.backgroundColor || ""}
            placeholder="Hérité du thème (#FAF6F0)"
            onChange={(e) => onStylesChange("backgroundColor", e.target.value || undefined)}
            className="flex-1 h-9 px-3 bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg text-[#17191C] font-mono text-xs focus:outline-none focus:border-[#F97316]"
          />
          {styles.backgroundColor && (
            <button
              type="button"
              onClick={() => onStylesChange("backgroundColor", undefined)}
              className="text-[11px] text-[#F97316] hover:underline"
            >
              Effacer
            </button>
          )}
        </div>
      </div>

      {/* Specific Text Color */}
      <div className="space-y-1.5 pt-2 border-t border-[#E4E7EC]">
        <label className="text-[12px] font-semibold text-[#17191C] block">
          Couleur du texte de la section
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={styles.textColor || "#0f172a"}
            onChange={(e) => onStylesChange("textColor", e.target.value || undefined)}
            className="w-9 h-9 rounded-lg border border-[#E4E7EC] cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={styles.textColor || ""}
            placeholder="Hérité du thème (#17191C)"
            onChange={(e) => onStylesChange("textColor", e.target.value || undefined)}
            className="flex-1 h-9 px-3 bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg text-[#17191C] font-mono text-xs focus:outline-none focus:border-[#F97316]"
          />
          {styles.textColor && (
            <button
              type="button"
              onClick={() => onStylesChange("textColor", undefined)}
              className="text-[11px] text-[#F97316] hover:underline"
            >
              Effacer
            </button>
          )}
        </div>
      </div>

      {/* Arrondi des coins */}
      <div className="space-y-1.5 pt-2 border-t border-[#E4E7EC]">
        <label className="text-[12px] font-semibold text-[#17191C] flex items-center justify-between">
          <span>Arrondi des cartes & blocs</span>
          <span className="font-mono text-[#F97316] text-[11px] font-bold">
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
                  ? "border-[#F97316] bg-[#FFF7ED] text-[#F97316]"
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
          <span className="font-semibold text-[#17191C]">Espacement haut/bas</span>
          <span className="font-mono text-[#F97316] font-bold">{paddingValue}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={96}
          step={8}
          value={paddingValue}
          onChange={(e) => onStylesChange("paddingY", parseInt(e.target.value, 10))}
          className="w-full accent-[#F97316] cursor-pointer"
        />
      </div>

      {/* Marges internes X */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-[#17191C]">Marges latérales (gauche/droite)</span>
          <span className="font-mono text-[#F97316] font-bold">{styles.paddingX ?? 16}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={48}
          step={4}
          value={styles.paddingX ?? 16}
          onChange={(e) => onStylesChange("paddingX", parseInt(e.target.value, 10))}
          className="w-full accent-[#F97316] cursor-pointer"
        />
      </div>
    </div>
  );
};
