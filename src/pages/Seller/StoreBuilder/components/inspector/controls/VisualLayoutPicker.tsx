import React from "react";
import { Check, Columns, Maximize2 } from "lucide-react";

interface VisualLayoutPickerProps {
  mode: "category" | "product";
  activeLayout: string;
  aspectRatio?: string;
  columnsDesktop?: number;
  onSelectLayout: (layout: string) => void;
  onChangeAspectRatio?: (ratio: string) => void;
  onChangeColumnsDesktop?: (cols: number) => void;
}

const CATEGORY_VISUAL_LAYOUTS = [
  { id: "bento", label: "Bento Apple", sublabel: "Mosaïque sans trou", badge: "Star" },
  { id: "accordion", label: "Galerie Accordéon", sublabel: "Hover interactif", badge: "Nouveau" },
  { id: "arch", label: "Arche Palace", sublabel: "Dôme architectural", badge: "Nouveau" },
  { id: "polaroid", label: "Polaroid Studio", sublabel: "Moodboard photo", badge: "Nouveau" },
  { id: "magazine", label: "Index Magazine", sublabel: "Répertoire SSENSE", badge: "Nouveau" },
  { id: "glass-dock", label: "Glass Dock 3D", sublabel: "Capsule givrée", badge: "Luxe" },
  { id: "mesh-3d", label: "Split Studio", sublabel: "Photo à droite", badge: "Split" },
  { id: "grid", label: "Grille Prestige", sublabel: "Cadre éditorial", badge: "Shopify" },
  { id: "overlay", label: "Affiche Cinéma", sublabel: "Poster plein cadre", badge: "Poster" },
  { id: "bubbles", label: "Médaillons Podium", sublabel: "Bague luxe & socle", badge: "Social" },
  { id: "pills", label: "Dock Capsules", sublabel: "Grille rapide 3 col.", badge: "Rapide" },
  { id: "carousel", label: "Lookbook Slider", sublabel: "Glissement fluide", badge: "Slider" },
];

const PRODUCT_VISUAL_LAYOUTS = [
  { id: "grid", label: "Grille", sublabel: "Multi-colonnes", badge: "Standard" },
  { id: "carousel", label: "Carrousel", sublabel: "Défilement horizontal", badge: "Slider" },
  { id: "vertical", label: "Liste", sublabel: "Bandeaux larges", badge: "Catalogue" },
];

const ASPECT_RATIO_STEPS = [
  { id: "1/1", label: "1:1 Carré" },
  { id: "4/5", label: "4:5 Portrait" },
  { id: "16/9", label: "16/9 Large" },
];

const renderLayoutSvg = (id: string, isSelected: boolean) => {
  const stroke = isSelected ? "#023859" : "#64748B";
  const fillPrimary = isSelected ? "#023859" : "#94A3B8";
  const fillSoft = isSelected ? "#D8EBF5" : "#E2E8F0";
  const fillAccent = isSelected ? "#26658C" : "#CBD5E1";

  if (id === "bento") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0">
        <rect x="2" y="2" width="27" height="32" rx="4" fill={fillSoft} stroke={stroke} strokeWidth="1.5" />
        <rect x="5" y="24" width="21" height="7" rx="2" fill={fillPrimary} />
        <rect x="32" y="2" width="22" height="14.5" rx="3.5" fill={fillSoft} stroke={stroke} strokeWidth="1.5" />
        <rect x="32" y="19.5" width="22" height="14.5" rx="3.5" fill={fillSoft} stroke={stroke} strokeWidth="1.5" />
      </svg>
    );
  }
  if (id === "accordion") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0">
        <rect x="2" y="2" width="28" height="32" rx="4" fill={fillPrimary} />
        <rect x="5" y="23" width="22" height="7" rx="2" fill="#FFFFFF" opacity="0.9" />
        <rect x="33" y="2" width="9" height="32" rx="3" fill={fillSoft} stroke={stroke} strokeWidth="1.3" />
        <rect x="45" y="2" width="9" height="32" rx="3" fill={fillSoft} stroke={stroke} strokeWidth="1.3" />
      </svg>
    );
  }
  if (id === "arch") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0">
        <path d="M4 32 V14 A10 10 0 0 1 24 14 V32 Z" fill={fillSoft} stroke={stroke} strokeWidth="1.5" />
        <path d="M32 32 V14 A10 10 0 0 1 52 14 V32 Z" fill={fillSoft} stroke={stroke} strokeWidth="1.5" />
        <rect x="8" y="26" width="12" height="2.5" rx="1" fill={fillPrimary} />
        <rect x="36" y="26" width="12" height="2.5" rx="1" fill={fillPrimary} />
      </svg>
    );
  }
  if (id === "polaroid") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0">
        <rect x="4" y="3" width="21" height="30" rx="2.5" fill="#FFFFFF" stroke={stroke} strokeWidth="1.5" />
        <rect x="7" y="6" width="15" height="18" rx="1.5" fill={fillSoft} />
        <rect x="8" y="27" width="11" height="2.5" rx="1" fill={fillPrimary} />
        <rect x="31" y="3" width="21" height="30" rx="2.5" fill="#FFFFFF" stroke={stroke} strokeWidth="1.5" />
        <rect x="34" y="6" width="15" height="18" rx="1.5" fill={fillSoft} />
        <rect x="35" y="27" width="11" height="2.5" rx="1" fill={fillPrimary} />
      </svg>
    );
  }
  if (id === "magazine") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0">
        <rect x="2" y="5" width="30" height="7" rx="2" fill={fillSoft} />
        <rect x="2" y="15" width="30" height="7" rx="2" fill={fillSoft} />
        <rect x="2" y="25" width="30" height="7" rx="2" fill={fillSoft} />
        <rect x="36" y="4" width="18" height="28" rx="3.5" fill={fillPrimary} />
      </svg>
    );
  }
  if (id === "bubbles") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0">
        {[12, 28, 44].map((cx, i) => (
          <g key={i}>
            <circle cx={cx} cy="13.5" r="7" fill={fillSoft} stroke={fillPrimary} strokeWidth="1.5" />
            <rect x={cx - 5} y="24.5" width="10" height="2.5" rx="1" fill={stroke} />
          </g>
        ))}
      </svg>
    );
  }
  if (id === "overlay" || id === "glass-dock") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0">
        <rect x="2" y="2" width="24" height="32" rx="4" fill={fillPrimary} />
        <rect x="5" y="22" width="18" height="8.5" rx="2.5" fill="#FFFFFF" opacity="0.92" />
        <rect x="30" y="2" width="24" height="32" rx="4" fill={fillAccent} />
        <rect x="33" y="22" width="18" height="8.5" rx="2.5" fill="#FFFFFF" opacity="0.92" />
      </svg>
    );
  }
  if (id === "pills" || id === "vertical" || id === "mesh-3d") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0">
        <rect x="2" y="4" width="52" height="12" rx="4" fill={fillSoft} stroke={stroke} strokeWidth="1.4" />
        <rect x="15" y="8.5" width="20" height="3" rx="1.2" fill={fillPrimary} />
        <rect x="2" y="20" width="52" height="12" rx="4" fill={fillSoft} stroke={stroke} strokeWidth="1.4" />
        <rect x="15" y="24.5" width="24" height="3" rx="1.2" fill={fillPrimary} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0">
      <rect x="2" y="2" width="24" height="21" rx="3.5" fill={fillSoft} stroke={stroke} strokeWidth="1.5" />
      <rect x="3" y="26" width="15" height="2.8" rx="1" fill={fillPrimary} />
      <rect x="30" y="2" width="24" height="21" rx="3.5" fill={fillSoft} stroke={stroke} strokeWidth="1.5" />
      <rect x="31" y="26" width="15" height="2.8" rx="1" fill={fillPrimary} />
    </svg>
  );
};

export const VisualLayoutPicker: React.FC<VisualLayoutPickerProps> = ({
  mode,
  activeLayout,
  aspectRatio = "4/5",
  columnsDesktop = 4,
  onSelectLayout,
  onChangeAspectRatio,
  onChangeColumnsDesktop,
}) => {
  const options = mode === "category" ? CATEGORY_VISUAL_LAYOUTS : PRODUCT_VISUAL_LAYOUTS;
  const normalizedRatio = aspectRatio === "4/3" ? "16/9" : aspectRatio;

  return (
    <div className="space-y-3 select-none">
      <div className={`grid ${mode === "category" ? "grid-cols-2" : "grid-cols-3"} gap-2`}>
        {options.map((opt) => {
          const isSelected = activeLayout === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectLayout(opt.id)}
              className={`relative p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                isSelected
                  ? "border-[#023859] bg-[#F0F7FA] text-[#011C40] ring-1 ring-[#023859]/25 shadow-xs"
                  : "border-slate-200 bg-white hover:border-[#54ACBF] hover:bg-slate-50/60 text-slate-700"
              }`}
            >
              <div className="flex items-center justify-between w-full gap-1.5">
                {renderLayoutSvg(opt.id, isSelected)}
                {isSelected ? (
                  <span className="w-4 h-4 rounded-full bg-[#023859] text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                ) : (
                  <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0">
                    {opt.badge}
                  </span>
                )}
              </div>
              <div className="w-full pt-0.5">
                <span className="block text-[11px] font-extrabold leading-tight text-slate-900">
                  {opt.label}
                </span>
                <span className="block text-[9.5px] font-medium text-slate-500 leading-tight mt-0.5">
                  {opt.sublabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {(onChangeAspectRatio || onChangeColumnsDesktop) &&
        !["bubbles", "pills", "vertical", "mesh-3d", "accordion", "magazine", "arch", "polaroid"].includes(
          activeLayout
        ) && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            {onChangeAspectRatio && activeLayout !== "bento" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <Maximize2 className="w-3 h-3 text-[#26658C]" />
                    <span>Ratio d'image</span>
                  </span>
                  <span className="font-mono font-bold text-[#023859]">
                    {normalizedRatio.replace("/", ":")}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {ASPECT_RATIO_STEPS.map((step) => {
                    const isAct = normalizedRatio === step.id;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() =>
                          onChangeAspectRatio(
                            mode === "product" && step.id === "16/9" ? "4/3" : step.id
                          )
                        }
                        className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${
                          isAct
                            ? "border-[#023859] bg-[#023859] text-white shadow-2xs"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {step.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {onChangeColumnsDesktop && activeLayout !== "carousel" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <Columns className="w-3 h-3 text-[#26658C]" />
                    <span>Colonnes (Desktop)</span>
                  </span>
                  <span className="font-mono font-bold text-[#023859]">{columnsDesktop} col.</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[2, 3, 4].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => onChangeColumnsDesktop(col)}
                      className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${
                        columnsDesktop === col
                          ? "border-[#023859] bg-[#023859] text-white shadow-2xs"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {col} Colonnes
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
