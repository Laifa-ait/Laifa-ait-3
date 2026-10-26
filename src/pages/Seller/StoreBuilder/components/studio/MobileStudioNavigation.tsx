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
    <nav className="md:hidden h-[52px] bg-white border-b border-slate-200 px-2 flex items-center justify-around z-10 shrink-0">
      <button
        type="button"
        onClick={() => setMobileColumn("canvas")}
        className={`flex-1 h-[40px] mx-1 rounded-xl text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
          mobileColumn === "canvas"
            ? "bg-[#F8FBFC] text-[#023859] font-bold border border-[#26658C]/30"
            : "text-slate-500 hover:bg-slate-50 hover:text-[#011C40]"
        }`}
      >
        <Eye className="w-4 h-4" />
        <span>Aperçu</span>
      </button>

      <button
        type="button"
        onClick={() => setMobileColumn("tree")}
        className={`flex-1 h-[40px] mx-1 rounded-xl text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
          mobileColumn === "tree"
            ? "bg-[#F8FBFC] text-[#023859] font-bold border border-[#26658C]/30"
            : "text-slate-500 hover:bg-slate-50 hover:text-[#011C40]"
        }`}
      >
        <Layers className="w-4 h-4" />
        <span>Structure ({sectionCount})</span>
      </button>

      <button
        type="button"
        onClick={() => setMobileColumn("inspector")}
        className={`flex-1 h-[40px] mx-1 rounded-xl text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
          mobileColumn === "inspector"
            ? "bg-[#F8FBFC] text-[#023859] font-bold border border-[#26658C]/30"
            : "text-slate-500 hover:bg-slate-50 hover:text-[#011C40]"
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span>Réglages</span>
      </button>
    </nav>
  );
};
