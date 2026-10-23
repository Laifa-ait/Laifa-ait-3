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
    <nav className="md:hidden h-[52px] bg-[#FFFFFF] border-b border-[#E5E7EB] px-2 flex items-center justify-around z-10 shrink-0">
      <button
        type="button"
        onClick={() => setMobileColumn("canvas")}
        className={`flex-1 h-[44px] min-h-[44px] mx-1 rounded-[10px] text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
          mobileColumn === "canvas"
            ? "bg-[#FFF1E7] text-[#F97316] font-semibold border border-[#FDBA74]"
            : "text-[#667085] hover:bg-[#F7F8FA] hover:text-[#17191C]"
        }`}
      >
        <Eye className="w-4 h-4" />
        <span>Aperçu</span>
      </button>

      <button
        type="button"
        onClick={() => setMobileColumn("tree")}
        className={`flex-1 h-[44px] min-h-[44px] mx-1 rounded-[10px] text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
          mobileColumn === "tree"
            ? "bg-[#FFF1E7] text-[#F97316] font-semibold border border-[#FDBA74]"
            : "text-[#667085] hover:bg-[#F7F8FA] hover:text-[#17191C]"
        }`}
      >
        <Layers className="w-4 h-4" />
        <span>Structure ({sectionCount})</span>
      </button>

      <button
        type="button"
        onClick={() => setMobileColumn("inspector")}
        className={`flex-1 h-[44px] min-h-[44px] mx-1 rounded-[10px] text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
          mobileColumn === "inspector"
            ? "bg-[#FFF1E7] text-[#F97316] font-semibold border border-[#FDBA74]"
            : "text-[#667085] hover:bg-[#F7F8FA] hover:text-[#17191C]"
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span>Réglages</span>
      </button>
    </nav>
  );
};

