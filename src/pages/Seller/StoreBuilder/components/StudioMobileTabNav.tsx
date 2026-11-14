import React from "react";
import { Layers, Eye, Sliders } from "lucide-react";

interface StudioMobileTabNavProps {
  mobileColumn: "tree" | "canvas" | "inspector";
  setMobileColumn: (col: "tree" | "canvas" | "inspector") => void;
  sectionCount: number;
}

export const StudioMobileTabNav: React.FC<StudioMobileTabNavProps> = ({
  mobileColumn,
  setMobileColumn,
  sectionCount,
}) => {
  return (
    <div className="lg:hidden flex border-b border-slate-200 bg-white text-[13px] font-medium shrink-0">
      <button
        onClick={() => setMobileColumn("tree")}
        className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
          mobileColumn === "tree"
            ? "bg-slate-50 text-slate-900 border-b-2 border-slate-900 font-semibold"
            : "text-slate-500 hover:text-slate-900"
        }`}
      >
        <Layers className="w-4 h-4" />
        <span>Structure ({sectionCount})</span>
      </button>
      <button
        onClick={() => setMobileColumn("canvas")}
        className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
          mobileColumn === "canvas"
            ? "bg-slate-50 text-slate-900 border-b-2 border-slate-900 font-semibold"
            : "text-slate-500 hover:text-slate-900"
        }`}
      >
        <Eye className="w-4 h-4" />
        <span>Aperçu en direct</span>
      </button>
      <button
        onClick={() => setMobileColumn("inspector")}
        className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
          mobileColumn === "inspector"
            ? "bg-slate-50 text-slate-900 border-b-2 border-slate-900 font-semibold"
            : "text-slate-500 hover:text-slate-900"
        }`}
      >
        <Sliders className="w-4 h-4" />
        <span>Propriétés</span>
      </button>
    </div>
  );
};
