import React from "react";
import { CustomPageSectionStyles } from "../../../../../domains/seller/customPage.types";
import { Sparkles, MoveVertical, AlignLeft, Layers, Wand2 } from "lucide-react";

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
  const paddingValue =
    typeof styles.paddingY === "number"
      ? styles.paddingY
      : { sm: 16, md: 32, lg: 48, xl: 64 }[styles.paddingY || "md"];

  return (
    <div className="space-y-4 select-none">
      {/* Largeur du conteneur */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold text-[#17191C] flex items-center justify-between">
          <span>Largeur du conteneur</span>
          <span className="text-[11px] font-normal text-[#667085]">Layout</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "contained", label: "Encadré", desc: "Max 1024px" },
            { id: "full", label: "Plein écran", desc: "100% large" },
            { id: "narrow", label: "Compact", desc: "Centré étroit" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onStylesChange("containerWidth", item.id)}
              className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                (styles.containerWidth || "contained") === item.id
                  ? "border-[#F97316] bg-[#FFF7ED] text-[#F97316] shadow-2xs font-bold"
                  : "border-[#E4E7EC] bg-white text-[#667085] hover:bg-[#F7F8FA]"
              }`}
            >
              <div className="text-[12px]">{item.label}</div>
              <div className="text-[10px] opacity-75">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Espacement Vertical (0-120px) */}
      <div className="space-y-1.5 pt-2 border-t border-[#E4E7EC]">
        <div className="flex justify-between items-center text-[13px]">
          <span className="font-semibold text-[#17191C] flex items-center gap-1.5">
            <MoveVertical className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Espacement vertical (padding)</span>
          </span>
          <span className="font-mono text-[#F97316] font-bold text-xs bg-[#FFF1E7] px-2 py-0.5 rounded">
            {paddingValue}px
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={120}
          step={8}
          value={paddingValue}
          onChange={(e) => onStylesChange("paddingY", parseInt(e.target.value, 10))}
          className="w-full accent-[#F97316] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[#98A2B3]">
          <span>0px (Compact)</span>
          <span>48px (Standard)</span>
          <span>120px (Aéré Luxe)</span>
        </div>
      </div>

      {/* Alignement Horizontal */}
      <div className="space-y-1.5 pt-2 border-t border-[#E4E7EC]">
        <label className="text-[13px] font-semibold text-[#17191C] flex items-center gap-1.5">
          <AlignLeft className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Alignement des titres & textes</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "left", label: "Gauche" },
            { id: "center", label: "Centre" },
            { id: "right", label: "Droite" },
          ].map((align) => (
            <button
              key={align.id}
              type="button"
              onClick={() => onSettingsChange("textAlignment", align.id)}
              className={`h-9 rounded-lg border text-[12px] font-semibold cursor-pointer transition-colors ${
                (settings.textAlignment || "left") === align.id
                  ? "border-[#F97316] bg-[#FFF7ED] text-[#F97316] font-bold"
                  : "border-[#E4E7EC] bg-white text-[#667085] hover:bg-[#F7F8FA]"
              }`}
            >
              {align.label}
            </button>
          ))}
        </div>
      </div>

      {/* Séparateurs Décoratifs de Transition (Shape Dividers Canva style) */}
      <div className="space-y-1.5 pt-2 border-t border-[#E4E7EC]">
        <label className="text-[13px] font-semibold text-[#17191C] flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Transition & Séparateur</span>
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: "none", label: "Droit" },
            { id: "wave", label: "Vague" },
            { id: "slant", label: "Biseau" },
            { id: "curve", label: "Courbe" },
          ].map((div) => (
            <button
              key={div.id}
              type="button"
              onClick={() => onStylesChange("divider", div.id)}
              className={`h-8 rounded-lg border text-[11px] font-semibold cursor-pointer transition-colors ${
                (styles.divider || "none") === div.id
                  ? "border-[#F97316] bg-[#FFF7ED] text-[#F97316]"
                  : "border-[#E4E7EC] bg-white text-[#667085] hover:bg-[#F7F8FA]"
              }`}
            >
              {div.label}
            </button>
          ))}
        </div>
      </div>

      {/* Animation d'Apparition au Scroll */}
      <div className="space-y-1.5 pt-2 border-t border-[#E4E7EC]">
        <label className="text-[13px] font-semibold text-[#17191C] flex items-center gap-1.5">
          <Wand2 className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Effet d'apparition au scroll</span>
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: "none", label: "Fixe" },
            { id: "fade", label: "Fondu" },
            { id: "slide-up", label: "Glissé" },
            { id: "zoom", label: "Zoom" },
          ].map((anim) => (
            <button
              key={anim.id}
              type="button"
              onClick={() => onStylesChange("animation", anim.id)}
              className={`h-8 rounded-lg border text-[11px] font-semibold cursor-pointer transition-colors ${
                (styles.animation || "none") === anim.id
                  ? "border-[#F97316] bg-[#FFF7ED] text-[#F97316]"
                  : "border-[#E4E7EC] bg-white text-[#667085] hover:bg-[#F7F8FA]"
              }`}
            >
              {anim.label}
            </button>
          ))}
        </div>
      </div>

      {/* Élévation & Ombre de Section */}
      <div className="space-y-1.5 pt-2 border-t border-[#E4E7EC]">
        <label className="text-[13px] font-semibold text-[#17191C] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Ombre & Profondeur</span>
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: "none", label: "Plat" },
            { id: "sm", label: "Douce" },
            { id: "floating", label: "Flottante" },
            { id: "brutal", label: "Brutale 3D" },
          ].map((sh) => (
            <button
              key={sh.id}
              type="button"
              onClick={() => onStylesChange("shadow", sh.id)}
              className={`h-8 rounded-lg border text-[11px] font-semibold cursor-pointer transition-colors ${
                (styles.shadow || "none") === sh.id
                  ? "border-[#F97316] bg-[#FFF7ED] text-[#F97316]"
                  : "border-[#E4E7EC] bg-white text-[#667085] hover:bg-[#F7F8FA]"
              }`}
            >
              {sh.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
