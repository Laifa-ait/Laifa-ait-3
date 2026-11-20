import React from "react";
import { Check, Columns, Maximize2 } from "lucide-react";
import { getCategoryLayoutCapabilities } from "../../../constants/categoryCanvaOptions";
import { CategoryDeviceViewport } from "../../../constants/categoryPresetTypes";
import { renderLayoutSvg } from "./visualLayoutSvgIcons";

interface VisualLayoutPickerProps {
  mode: "category" | "product";
  activeLayout: string;
  activeDevice?: CategoryDeviceViewport;
  aspectRatio?: string;
  columnsDesktop?: number;
  onSelectLayout: (layout: string) => void;
  onChangeAspectRatio?: (ratio: string) => void;
  onChangeColumnsDesktop?: (cols: number) => void;
}

const CATEGORY_VISUAL_LAYOUTS = [
  { id: "bento", label: "Bento Studio", sublabel: "Mosaïque sans trou", badge: "PC & Mobile" },
  { id: "accordion", label: "Galerie Accordéon", sublabel: "Hover interactif", badge: "Idéal PC" },
  { id: "arch", label: "Arche Contemporaine", sublabel: "Cadre architectural", badge: "Tous écrans" },
  { id: "polaroid", label: "Cadre Galerie", sublabel: "Format éditorial", badge: "Tous écrans" },
  { id: "magazine", label: "Index Magazine", sublabel: "Répertoire éditorial", badge: "Idéal PC/Tab" },
  { id: "glass-dock", label: "Glass Dock 3D", sublabel: "Capsule givrée", badge: "Studio" },
  { id: "mesh-3d", label: "Split Studio", sublabel: "Photo à droite", badge: "Split" },
  { id: "grid", label: "Grille Éditoriale", sublabel: "Cadre net", badge: "Universel" },
  { id: "overlay", label: "Affiche Cinéma", sublabel: "Poster plein cadre", badge: "Poster" },
  { id: "bubbles", label: "Cercles Podium", sublabel: "Médaillons épurés", badge: "Top Mobile" },
  { id: "pills", label: "Dock Capsules", sublabel: "Bandeaux clairs", badge: "Top Mobile" },
  { id: "carousel", label: "Lookbook Slider", sublabel: "Glissement fluide", badge: "Top Mobile" },
];

const PRODUCT_VISUAL_LAYOUTS = [
  { id: "grid", label: "Grille", sublabel: "Multi-colonnes", badge: "Standard" },
  { id: "carousel", label: "Carrousel", sublabel: "Défilement horizontal", badge: "Slider" },
  { id: "vertical", label: "Liste", sublabel: "Bandeaux larges", badge: "Catalogue" },
];

const CATEGORY_ASPECT_STEPS = [
  { id: "1/1", label: "1:1 Carré" },
  { id: "4/5", label: "4:5 Portrait" },
  { id: "16/9", label: "16/9 Large" },
];

const PRODUCT_ASPECT_STEPS = [
  { id: "1/1", label: "1:1 Carré" },
  { id: "4/5", label: "4:5 Portrait" },
  { id: "4/3", label: "4:3 Standard" },
  { id: "16/9", label: "16/9 Large" },
];

export const VisualLayoutPicker: React.FC<VisualLayoutPickerProps> = ({
  mode,
  activeLayout,
  activeDevice = "desktop",
  aspectRatio = "4/5",
  columnsDesktop = 4,
  onSelectLayout,
  onChangeAspectRatio,
  onChangeColumnsDesktop,
}) => {
  const options = mode === "category" ? CATEGORY_VISUAL_LAYOUTS : PRODUCT_VISUAL_LAYOUTS;
  const aspectSteps = mode === "category" ? CATEGORY_ASPECT_STEPS : PRODUCT_ASPECT_STEPS;
  const normalizedRatio =
    mode === "category" && aspectRatio === "4/3" ? "16/9" : aspectRatio === "circle" ? "4/5" : aspectRatio;
  const caps = getCategoryLayoutCapabilities(activeLayout);

  const showAspectRatio = Boolean(onChangeAspectRatio) && (mode === "product" ? true : caps.supportsAspectRatio);
  const supportsColsOnDevice =
    mode === "product"
      ? activeLayout !== "carousel"
      : activeDevice === "mobile"
      ? caps.supportsColumnsMobile
      : activeDevice === "tablet"
      ? caps.supportsColumnsTablet
      : caps.supportsColumnsDesktop;

  const showColsControl = Boolean(onChangeColumnsDesktop) && supportsColsOnDevice;

  const colChoices =
    mode === "product"
      ? activeLayout === "vertical"
        ? [1, 2]
        : [2, 3, 4]
      : activeDevice === "mobile"
      ? caps.recommendedMobileCols
      : activeDevice === "tablet"
      ? caps.recommendedTabletCols
      : caps.recommendedDesktopCols;

  const deviceColLabel =
    activeDevice === "mobile"
      ? "Colonnes (Téléphone)"
      : activeDevice === "tablet"
      ? "Colonnes (Tablette)"
      : "Colonnes (PC / Desktop)";

  return (
    <div className="space-y-3 select-none">
      <div className={`grid ${mode === "category" ? "grid-cols-2" : "grid-cols-3"} gap-2`}>
        {options.map((opt) => {
          const isSelected = activeLayout === opt.id || (opt.id === "vertical" && activeLayout === "list");
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectLayout(opt.id)}
              className={`relative p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                isSelected ? "border-[var(--studio-primary)] bg-[var(--studio-highlight-soft)] text-[var(--studio-black)] ring-1 ring-[var(--studio-primary)]/25 shadow-xs" : "border-[var(--studio-border)] bg-white hover:border-[var(--studio-focus)] hover:bg-slate-50/60 text-slate-700"
              }`}
            >
              <div className="flex items-center justify-between w-full gap-1.5">
                {renderLayoutSvg(opt.id, isSelected)}
                {isSelected ? (
                  <span className="w-4 h-4 rounded-full bg-[var(--studio-primary)] text-white flex items-center justify-center shrink-0"><Check className="w-2.5 h-2.5" /></span>
                ) : (
                  <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0">{opt.badge}</span>
                )}
              </div>
              <div className="w-full pt-0.5">
                <span className="block text-[11px] font-extrabold leading-tight text-slate-900">{opt.label}</span>
                <span className="block text-[9.5px] font-medium text-slate-500 leading-tight mt-0.5">{opt.sublabel}</span>
              </div>
            </button>
          );
        })}
      </div>

      {(showAspectRatio || showColsControl) && (
        <div className="p-2.5 rounded-xl bg-slate-50 border border-[var(--studio-border)] space-y-2.5">
          {showAspectRatio && onChangeAspectRatio && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-700 flex items-center gap-1"><Maximize2 className="w-3 h-3 text-[var(--studio-muted)]" /><span>Ratio d&apos;image ({activeDevice === "desktop" ? "PC" : activeDevice === "tablet" ? "Tablette" : "Mobile"})</span></span>
                <span className="font-mono font-bold text-[var(--studio-primary)] tabular-nums">{normalizedRatio.replace("/", ":")}</span>
              </div>
              <div className={`grid ${mode === "product" ? "grid-cols-2" : "grid-cols-3"} gap-1.5`}>
                {aspectSteps.map((step) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => onChangeAspectRatio(step.id)}
                    className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${normalizedRatio === step.id ? "border-[var(--studio-primary)] bg-[var(--studio-primary)] text-white shadow-2xs" : "border-[var(--studio-border)] bg-white text-slate-700 hover:border-slate-300"}`}
                  >
                    {step.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showColsControl && onChangeColumnsDesktop && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-700 flex items-center gap-1"><Columns className="w-3 h-3 text-[var(--studio-muted)]" /><span>{deviceColLabel}</span></span>
                <span className="font-mono font-bold text-[var(--studio-primary)] tabular-nums">{columnsDesktop} col.</span>
              </div>
              <div className={`grid grid-cols-${colChoices.length} gap-1.5`}>
                {colChoices.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => onChangeColumnsDesktop(col)}
                    className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${columnsDesktop === col ? "border-[var(--studio-primary)] bg-[var(--studio-primary)] text-white shadow-2xs" : "border-[var(--studio-border)] bg-white text-slate-700 hover:border-slate-300"}`}
                  >
                    {col === 1 ? "1 Bandeau Large" : `${col} Colonnes`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
