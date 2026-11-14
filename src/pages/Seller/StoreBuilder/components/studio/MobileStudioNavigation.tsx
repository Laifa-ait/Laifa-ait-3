import React from "react";
import { Eye, Layers, SlidersHorizontal } from "lucide-react";

export type MobileStudioColumn = "canvas" | "tree" | "inspector";

interface MobileStudioNavigationProps {
  mobileColumn: MobileStudioColumn;
  setMobileColumn: (col: MobileStudioColumn) => void;
  sectionCount: number;
}

export const MobileStudioNavigation: React.FC<MobileStudioNavigationProps> = ({
  mobileColumn,
  setMobileColumn,
  sectionCount,
}) => {
  return (
    <nav className="md:hidden h-11 bg-white border-b border-slate-200 px-2 flex items-center z-10 shrink-0">
      <button
        type="button"
        onClick={() => setMobileColumn("canvas")}
        className={`flex-1 h-11 text-[12.5px] flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
          mobileColumn === "canvas"
            ? "border-slate-900 text-slate-900 font-semibold"
            : "border-transparent text-slate-500 hover:text-slate-900 font-medium"
        }`}
      >
        <Eye className="w-3.5 h-3.5" />
        <span>Aperçu</span>
      </button>

      <button
        type="button"
        onClick={() => setMobileColumn("tree")}
        className={`flex-1 h-11 text-[12.5px] flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
          mobileColumn === "tree"
            ? "border-slate-900 text-slate-900 font-semibold"
            : "border-transparent text-slate-500 hover:text-slate-900 font-medium"
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        <span>Structure ({sectionCount})</span>
      </button>

      <button
        type="button"
        onClick={() => setMobileColumn("inspector")}
        className={`flex-1 h-11 text-[12.5px] flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
          mobileColumn === "inspector"
            ? "border-slate-900 text-slate-900 font-semibold"
            : "border-transparent text-slate-500 hover:text-slate-900 font-medium"
        }`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>Réglages</span>
      </button>
    </nav>
  );
};
