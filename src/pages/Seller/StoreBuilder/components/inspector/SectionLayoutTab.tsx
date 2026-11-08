import React from "react";
import {
  BannerContentPosition,
  CustomPageSectionStyles,
} from "../../../../../domains/seller/customPage.types";
import { MoveVertical, AlignLeft, Layers, Grid } from "lucide-react";
import { resolveBannerPosition } from "./controls/AlignmentMatrix3x3";

interface SectionLayoutTabProps {
  styles: CustomPageSectionStyles;
  settings: Record<string, unknown>;
  onStylesChange: (field: keyof CustomPageSectionStyles, value: unknown) => void;
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
}

const SPACING_SCALE = [4, 8, 12, 16, 24, 32, 48, 64];

function buildContentPosition(
  h: "left" | "center" | "right",
  v: "top" | "center" | "bottom"
): BannerContentPosition {
  if (v === "center" && h === "center") return "center";
  return `${v}-${h}` as BannerContentPosition;
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
      : { sm: 16, md: 32, lg: 48, xl: 64 }[styles.paddingY || "md"] ?? 32;
  const paddingXValue = typeof styles.paddingX === "number" ? styles.paddingX : 20;
  const columnsDesktop = typeof settings.columnsDesktop === "number" ? settings.columnsDesktop : 4;

  const resolvedPos = resolveBannerPosition(
    settings.contentPosition as BannerContentPosition | undefined,
    (settings.textAlignment as "left" | "center" | "right") || "left",
    (settings.verticalAlignment as "top" | "center" | "bottom") || "center"
  );

  return (
    <div className="space-y-4 select-none" data-testid="section-layout-tab">
      {/* Largeur maximale du conteneur */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-semibold text-[#011C40] flex items-center justify-between">
          <span>Largeur du conteneur</span>
          <span className="text-[10.5px] font-normal text-[#667085]">Disposition</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: "contained", label: "Encadré", desc: "Max 1152px" },
            { id: "full", label: "Plein écran", desc: "100% large" },
            { id: "narrow", label: "Compact", desc: "Max 768px" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onStylesChange("containerWidth", item.id)}
              className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                (styles.containerWidth || "contained") === item.id
                  ? "border-[#023859] bg-[#F0F7FA] text-[#023859] shadow-2xs font-bold"
                  : "border-[#E4E7EC] bg-white text-[#667085] hover:bg-[#F7F8FA]"
              }`}
            >
              <div className="text-[11.5px]">{item.label}</div>
              <div className="text-[9.5px] opacity-75">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Échelle d'espacement vertical (4, 8, 12, 16, 24, 32, 48, 64) + Slider */}
      <div className="space-y-2 pt-2 border-t border-[#E4E7EC]">
        <div className="flex justify-between items-center text-[12px]">
          <span className="font-semibold text-[#011C40] flex items-center gap-1.5">
            <MoveVertical className="w-3.5 h-3.5 text-[#023859]" />
            <span>Padding vertical (Haut / Bas)</span>
          </span>
          <span className="font-mono text-[#023859] font-bold text-xs bg-[#F0F7FA] px-2 py-0.5 rounded">
            {paddingValue}px
          </span>
        </div>
        <div className="grid grid-cols-8 gap-1">
          {SPACING_SCALE.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => onStylesChange("paddingY", val)}
              className={`h-6 rounded border text-[10px] font-mono font-bold cursor-pointer ${
                paddingValue === val
                  ? "bg-[#023859] text-white border-[#023859]"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {val}
            </button>
          ))}
        </div>
        <input
          type="range"
          min={0}
          max={120}
          step={4}
          value={paddingValue}
          onChange={(e) => onStylesChange("paddingY", parseInt(e.target.value, 10))}
          className="w-full accent-[#023859] cursor-pointer"
        />

        <div className="flex justify-between items-center text-[12px] pt-1">
          <span className="font-semibold text-[#011C40]">Marges latérales (Gauche / Droite)</span>
          <span className="font-mono text-[#023859] font-bold text-xs">{paddingXValue}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={64}
          step={4}
          value={paddingXValue}
          onChange={(e) => onStylesChange("paddingX", parseInt(e.target.value, 10))}
          className="w-full accent-[#023859] cursor-pointer"
        />
      </div>

      {/* Nombre de colonnes (Grille) */}
      <div className="space-y-1.5 pt-2 border-t border-[#E4E7EC]">
        <label className="text-[12px] font-semibold text-[#011C40] flex items-center gap-1.5">
          <Grid className="w-3.5 h-3.5 text-[#023859]" />
          <span>Colonnes de grille (Ordinateur)</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {([2, 3, 4] as const).map((cols) => (
            <button
              key={cols}
              type="button"
              onClick={() => onSettingsChange("columnsDesktop", cols)}
              className={`h-8 rounded-lg border text-[11px] font-semibold cursor-pointer ${
                columnsDesktop === cols
                  ? "border-[#023859] bg-[#F0F7FA] text-[#023859] font-bold"
                  : "border-[#E4E7EC] bg-white text-[#667085] hover:bg-[#F7F8FA]"
              }`}
            >
              {cols} colonnes
            </button>
          ))}
        </div>
      </div>

      {/* Alignement Horizontal & Vertical (Matrice 3x3) */}
      <div className="space-y-2 pt-2 border-t border-[#E4E7EC]">
        <label className="text-[12px] font-semibold text-[#011C40] flex items-center gap-1.5">
          <AlignLeft className="w-3.5 h-3.5 text-[#023859]" />
          <span>Position & Alignement du contenu</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {([{ id: "left", label: "Gauche" }, { id: "center", label: "Centre" }, { id: "right", label: "Droite" }] as const).map((align) => (
            <button
              key={align.id}
              type="button"
              onClick={() =>
                onSettingsChange({
                  textAlignment: align.id,
                  contentPosition: buildContentPosition(align.id, resolvedPos.vertical),
                })
              }
              className={`h-8 rounded-lg border text-[11px] font-semibold cursor-pointer ${
                resolvedPos.horizontal === align.id
                  ? "border-[#023859] bg-[#F0F7FA] text-[#023859] font-bold"
                  : "border-[#E4E7EC] bg-white text-[#667085]"
              }`}
            >
              {align.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {([{ id: "top", label: "Haut" }, { id: "center", label: "Milieu" }, { id: "bottom", label: "Bas" }] as const).map((vAlign) => (
            <button
              key={vAlign.id}
              type="button"
              onClick={() =>
                onSettingsChange({
                  verticalAlignment: vAlign.id,
                  contentPosition: buildContentPosition(resolvedPos.horizontal, vAlign.id),
                })
              }
              className={`h-8 rounded-lg border text-[11px] font-semibold cursor-pointer ${
                resolvedPos.vertical === vAlign.id
                  ? "border-[#023859] bg-[#F0F7FA] text-[#023859] font-bold"
                  : "border-[#E4E7EC] bg-white text-[#667085]"
              }`}
            >
              {vAlign.label}
            </button>
          ))}
        </div>
      </div>

      {/* Séparateurs Décoratifs de Transition */}
      <div className="space-y-1.5 pt-2 border-t border-[#E4E7EC]">
        <label className="text-[12px] font-semibold text-[#011C40] flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#023859]" />
          <span>Séparateur de section</span>
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
              className={`h-8 rounded-lg border text-[11px] font-semibold cursor-pointer ${
                (styles.divider || "none") === div.id
                  ? "border-[#023859] bg-[#F0F7FA] text-[#023859] font-bold"
                  : "border-[#E4E7EC] bg-white text-[#667085]"
              }`}
            >
              {div.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
