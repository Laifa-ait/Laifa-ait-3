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
    <div className="lg:hidden flex border-b border-[#E4E7EC] bg-[#FFFFFF] text-[13px] font-medium shrink-0">
      <button
        onClick={() => setMobileColumn("tree")}
        className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
          mobileColumn === "tree"
            ? "bg-[#FFF7ED] text-[#F97316] border-b-2 border-[#F97316] font-semibold"
            : "text-[#667085] hover:text-[#17191C]"
        }`}
      >
        <Layers className="w-4 h-4" />
        <span>Structure ({sectionCount})</span>
      </button>
      <button
        onClick={() => setMobileColumn("canvas")}
        className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
          mobileColumn === "canvas"
            ? "bg-[#FFF7ED] text-[#F97316] border-b-2 border-[#F97316] font-semibold"
            : "text-[#667085] hover:text-[#17191C]"
        }`}
      >
        <Eye className="w-4 h-4" />
        <span>Aperçu en direct</span>
      </button>
      <button
        onClick={() => setMobileColumn("inspector")}
        className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
          mobileColumn === "inspector"
            ? "bg-[#FFF7ED] text-[#F97316] border-b-2 border-[#F97316] font-semibold"
            : "text-[#667085] hover:text-[#17191C]"
        }`}
      >
        <Sliders className="w-4 h-4" />
        <span>Propriétés</span>
      </button>
    </div>
  );
};
