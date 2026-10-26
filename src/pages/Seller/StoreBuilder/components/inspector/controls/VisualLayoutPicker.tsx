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
  { id: "grid", label: "Grille Éditoriale", sublabel: "Prestige • Aligné", badge: "Shopify" },
  { id: "bento", label: "Bento Mosaic", sublabel: "Impact • Vedette 2x2", badge: "Tendance" },
  { id: "bubbles", label: "Bulles Stories", sublabel: "Impulse • Médaillons", badge: "Social" },
  { id: "carousel", label: "Lookbook Slider", sublabel: "Minimog • Glissement", badge: "Fluide" },
  { id: "overlay", label: "Overlay Cinéma", sublabel: "Impact • Plein cadre", badge: "Luxe" },
  { id: "pills", label: "Capsules Dock", sublabel: "Dawn • Navigation", badge: "Rapide" },
  { id: "mesh-3d", label: "Cartes Split Studio", sublabel: "Prestige • Photo à droite", badge: "Split" },
];

const PRODUCT_VISUAL_LAYOUTS = [
  { id: "grid", label: "Grille", sublabel: "Multi-colonnes", badge: "Standard" },
  { id: "carousel", label: "Carrousel", sublabel: "Défilement horizontal", badge: "Slider" },
  { id: "vertical", label: "Liste", sublabel: "Bandeaux larges", badge: "Catalogue" },
];

const ASPECT_RATIO_STEPS = [
  { id: "1/1", label: "1:1 Carré" },
  { id: "4/5", label: "4:5 Portrait" },
  { id: "16/9", label: "16:9 Large" },
];

const renderLayoutSvg = (id: string, isSelected: boolean) => {
  const stroke = isSelected ? "#023859" : "#64748B";
  const fillPrimary = isSelected ? "#023859" : "#94A3B8";
  const fillSoft = isSelected ? "#D8EBF5" : "#E2E8F0";
  const fillAccent = isSelected ? "#26658C" : "#CBD5E1";

  if (id === "bento") {
    return (
      <svg viewBox="0 0 56 36" className="w-13 h-8.5 shrink-0">
        <rect x="2" y="2" width="29" height="32" rx="4" fill={fillSoft} stroke={stroke} strokeWidth="1.5" />
        <rect x="5" y="5" width="8" height="3.5" rx="1.5" fill={fillPrimary} />
        <circle cx="26" cy="7" r="2.2" fill={fillPrimary} />
        <rect x="5" y="24" width="18" height="3" rx="1" fill={fillPrimary} />
        <rect x="5" y="28.5" width="11" height="2" rx="1" fill={fillAccent} />
        <rect x="34" y="2" width="20" height="14.5" rx="3.5" fill={fillSoft} stroke={stroke} strokeWidth="1.5" />
        <rect x="37" y="11" width="11" height="2.5" rx="1" fill={fillPrimary} />
        <rect x="34" y="19.5" width="20" height="14.5" rx="3.5" fill={fillSoft} stroke={stroke} strokeWidth="1.5" />
        <rect x="37" y="28.5" width="11" height="2.5" rx="1" fill={fillPrimary} />
      </svg>
    );
  }
  if (id === "bubbles") {
    return (
      <svg viewBox="0 0 56 36" className="w-13 h-8.5 shrink-0">
        {[11, 28, 45].map((cx, i) => (
          <g key={i}>
            <circle cx={cx} cy="13.5" r="7.5" fill="none" stroke={fillPrimary} strokeWidth="1.5" strokeDasharray="3 1" />
            <circle cx={cx} cy="13.5" r="5.5" fill={fillSoft} />
            <rect x={cx - 5} y="24.5" width="10" height="2.5" rx="1" fill={stroke} />
            <rect x={cx - 3.5} y="28.5" width="7" height="1.8" rx="0.9" fill={fillAccent} />
          </g>
        ))}
      </svg>
    );
  }
  if (id === "carousel" || id === "mesh-3d") {
    return (
      <svg viewBox="0 0 56 36" className="w-13 h-8.5 shrink-0">
        <rect x="2" y="3" width="20" height="30" rx="4" fill={fillSoft} stroke={stroke} strokeWidth="1.5" />
        <rect x="5" y="25" width="13" height="2.5" rx="1" fill={fillPrimary} />
        <rect x="25" y="3" width="20" height="30" rx="4" fill={fillSoft} stroke={stroke} strokeWidth="1.5" />
        <rect x="28" y="25" width="13" height="2.5" rx="1" fill={fillPrimary} />
        <rect x="48" y="5" width="6" height="26" rx="2.5" fill={fillAccent} opacity="0.6" />
      </svg>
    );
  }
  if (id === "overlay") {
    return (
      <svg viewBox="0 0 56 36" className="w-13 h-8.5 shrink-0">
        <rect x="2" y="2" width="24" height="32" rx="4" fill={fillPrimary} />
        <circle cx="21" cy="7" r="2.2" fill="#FFFFFF" opacity="0.85" />
        <rect x="5" y="22" width="18" height="8.5" rx="2.5" fill="#FFFFFF" opacity="0.9" />
        <rect x="7" y="24.5" width="11" height="2.2" rx="1" fill={fillPrimary} />
        <rect x="30" y="2" width="24" height="32" rx="4" fill={fillAccent} />
        <circle cx="49" cy="7" r="2.2" fill="#FFFFFF" opacity="0.85" />
        <rect x="33" y="22" width="18" height="8.5" rx="2.5" fill="#FFFFFF" opacity="0.9" />
        <rect x="35" y="24.5" width="11" height="2.2" rx="1" fill={fillPrimary} />
      </svg>
    );
  }
  if (id === "pills" || id === "vertical") {
    return (
      <svg viewBox="0 0 56 36" className="w-13 h-8.5 shrink-0">
        <rect x="2" y="4" width="52" height="12" rx="6" fill={fillSoft} stroke={stroke} strokeWidth="1.4" />
        <circle cx="8.5" cy="10" r="4" fill={fillPrimary} />
        <rect x="15" y="8.5" width="20" height="3" rx="1.2" fill={fillPrimary} />
        <circle cx="48" cy="10" r="2.5" fill={fillAccent} />
        <rect x="2" y="20" width="52" height="12" rx="6" fill={fillSoft} stroke={stroke} strokeWidth="1.4" />
        <circle cx="8.5" cy="26" r="4" fill={fillPrimary} />
        <rect x="15" y="24.5" width="24" height="3" rx="1.2" fill={fillPrimary} />
        <circle cx="48" cy="26" r="2.5" fill={fillAccent} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 56 36" className="w-13 h-8.5 shrink-0">
      <rect x="2" y="2" width="24" height="21" rx="3.5" fill={fillSoft} stroke={stroke} strokeWidth="1.5" />
      <circle cx="21.5" cy="6.5" r="2" fill={fillPrimary} />
      <rect x="3" y="26" width="15" height="2.8" rx="1" fill={fillPrimary} />
      <rect x="3" y="30.5" width="9" height="2" rx="1" fill={fillAccent} />
      <rect x="30" y="2" width="24" height="21" rx="3.5" fill={fillSoft} stroke={stroke} strokeWidth="1.5" />
      <circle cx="49.5" cy="6.5" r="2" fill={fillPrimary} />
      <rect x="31" y="26" width="15" height="2.8" rx="1" fill={fillPrimary} />
      <rect x="31" y="30.5" width="9" height="2" rx="1" fill={fillAccent} />
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
              className={`relative p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                opt.id === "mesh-3d" ? "col-span-2" : ""
              } ${
                isSelected
                  ? "border-[#023859] bg-[#F0F7FA] text-[#011C40] ring-1 ring-[#023859]/25 shadow-xs"
                  : "border-slate-200 bg-white hover:border-[#54ACBF] hover:bg-slate-50/60 text-slate-700"
              }`}
            >
              {renderLayoutSvg(opt.id, isSelected)}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="block text-[11px] font-extrabold leading-tight truncate">
                    {opt.label}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-[#023859] text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <span className="block text-[9px] font-medium text-slate-500 leading-tight truncate mt-0.5">
                  {opt.sublabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {(onChangeAspectRatio || onChangeColumnsDesktop) &&
        !["bubbles", "pills", "vertical", "mesh-3d"].includes(activeLayout) && (
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
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <Columns className="w-3 h-3 text-[#26658C]" />
                    <span>Colonnes (Desktop)</span>
                  </span>
                  <span className="font-mono font-bold text-[#023859]">{columnsDesktop} col.</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={4}
                  step={1}
                  value={Math.min(4, Math.max(2, columnsDesktop))}
                  onChange={(e) => onChangeColumnsDesktop(Number(e.target.value))}
                  className="w-full accent-[#023859] cursor-pointer"
                />
              </div>
            )}
          </div>
        )}
    </div>
  );
};
