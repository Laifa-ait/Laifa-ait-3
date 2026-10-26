import React from "react";
import { BannerContentPosition } from "../../../../../../domains/seller/customPage.types";
import { LayoutGrid } from "lucide-react";

interface AlignmentMatrix3x3Props {
  value?: BannerContentPosition;
  horizontalFallback?: "left" | "center" | "right";
  verticalFallback?: "top" | "center" | "bottom";
  label?: string;
  onChange: (
    position: BannerContentPosition,
    horizontal: "left" | "center" | "right",
    vertical: "top" | "center" | "bottom"
  ) => void;
}

interface MatrixCellMeta {
  id: BannerContentPosition;
  label: string;
  h: "left" | "center" | "right";
  v: "top" | "center" | "bottom";
}

const MATRIX_CELLS: MatrixCellMeta[] = [
  { id: "top-left", label: "Haut Gauche", h: "left", v: "top" },
  { id: "top-center", label: "Haut Centre", h: "center", v: "top" },
  { id: "top-right", label: "Haut Droite", h: "right", v: "top" },
  { id: "center-left", label: "Milieu Gauche", h: "left", v: "center" },
  { id: "center", label: "Centre Exact", h: "center", v: "center" },
  { id: "center-right", label: "Milieu Droite", h: "right", v: "center" },
  { id: "bottom-left", label: "Bas Gauche", h: "left", v: "bottom" },
  { id: "bottom-center", label: "Bas Centre", h: "center", v: "bottom" },
  { id: "bottom-right", label: "Bas Droite", h: "right", v: "bottom" },
];

export function resolveBannerPosition(
  position?: BannerContentPosition,
  horizontalFallback: "left" | "center" | "right" = "center",
  verticalFallback: "top" | "center" | "bottom" = "center"
): {
  position: BannerContentPosition;
  horizontal: "left" | "center" | "right";
  vertical: "top" | "center" | "bottom";
  flexContainerClass: string;
} {
  const matched =
    MATRIX_CELLS.find((c) => c.id === position) ||
    MATRIX_CELLS.find((c) => c.h === horizontalFallback && c.v === verticalFallback) ||
    MATRIX_CELLS[4];

  const vClass =
    matched.v === "top"
      ? "justify-start"
      : matched.v === "bottom"
      ? "justify-end"
      : "justify-center";

  const hClass =
    matched.h === "left"
      ? "items-start text-left"
      : matched.h === "right"
      ? "items-end text-right"
      : "items-center text-center";

  return {
    position: matched.id,
    horizontal: matched.h,
    vertical: matched.v,
    flexContainerClass: `${vClass} ${hClass}`,
  };
}

export const AlignmentMatrix3x3: React.FC<AlignmentMatrix3x3Props> = ({
  value,
  horizontalFallback = "center",
  verticalFallback = "center",
  label = "Position du bloc texte & boutons (9 points)",
  onChange,
}) => {
  const resolved = resolveBannerPosition(value, horizontalFallback, verticalFallback);
  const activeCell =
    MATRIX_CELLS.find((c) => c.id === resolved.position) || MATRIX_CELLS[4];

  return (
    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 select-none">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
          <LayoutGrid className="w-3.5 h-3.5 text-[#F97316]" />
          <span>{label}</span>
        </span>
        <span className="text-[10px] font-bold text-[#EA580C] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
          {activeCell.label}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Interactive 3x3 Visual Grid */}
        <div
          role="radiogroup"
          aria-label={label}
          className="grid grid-cols-3 gap-1.5 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs w-28 h-28 shrink-0"
        >
          {MATRIX_CELLS.map((cell) => {
            const isSelected = resolved.position === cell.id;
            return (
              <button
                key={cell.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                title={cell.label}
                onClick={() => onChange(cell.id, cell.h, cell.v)}
                className={`rounded-lg border transition-all flex flex-col justify-center p-1 cursor-pointer ${
                  cell.h === "left"
                    ? "items-start"
                    : cell.h === "right"
                    ? "items-end"
                    : "items-center"
                } ${
                  isSelected
                    ? "bg-[#F97316] border-[#EA580C] shadow-xs scale-105"
                    : "bg-slate-50 border-slate-200 hover:border-orange-300 hover:bg-orange-50/50"
                }`}
              >
                {isSelected ? (
                  <span className="flex flex-col gap-0.5 w-full">
                    <span
                      className={`h-1 rounded-full bg-white ${
                        cell.h === "center" ? "w-4/5 mx-auto" : "w-4/5"
                      }`}
                    />
                    <span
                      className={`h-1 rounded-full bg-white/75 ${
                        cell.h === "center" ? "w-1/2 mx-auto" : cell.h === "right" ? "w-1/2 ml-auto" : "w-1/2"
                      }`}
                    />
                  </span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </button>
            );
          })}
        </div>

        {/* Contextual Helper Description */}
        <div className="text-[11px] text-slate-600 space-y-1 leading-snug">
          <p className="font-semibold text-slate-800">
            Alignement : {activeCell.label}
          </p>
          <p className="text-[10px] text-slate-500">
            Positionne instantanément le titre, le sous-titre et les boutons d'action sur votre bannière comme dans Shopify OS 2.0.
          </p>
        </div>
      </div>
    </div>
  );
};
