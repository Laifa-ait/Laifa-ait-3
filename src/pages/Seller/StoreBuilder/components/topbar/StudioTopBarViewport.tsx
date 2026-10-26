import React from "react";
import { Monitor, Tablet, Smartphone, Undo2, Redo2 } from "lucide-react";
import { useStudioStore, StudioViewport } from "../../store/useStudioStore";

interface StudioTopBarViewportProps {
  viewport?: StudioViewport;
  setViewport?: (vp: StudioViewport) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const StudioTopBarViewport: React.FC<StudioTopBarViewportProps> = ({
  viewport: propViewport,
  setViewport: propSetViewport,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const storeViewport = useStudioStore((s) => s.viewport);
  const storeSetViewport = useStudioStore((s) => s.setViewport);

  const activeViewport = propViewport ?? storeViewport;
  const handleSelectViewport = (vp: StudioViewport) => {
    storeSetViewport(vp);
    if (propSetViewport) propSetViewport(vp);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Undo / Redo Buttons */}
      <div className="flex items-center gap-1 bg-[#F1F3F5] p-1 rounded-xl border border-[#E4E7EC]">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-1.5 rounded-lg transition-all ${
            canUndo
              ? "text-[#17191C] hover:bg-white hover:shadow-2xs cursor-pointer"
              : "text-slate-300 cursor-not-allowed"
          }`}
          title="Annuler (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-1.5 rounded-lg transition-all ${
            canRedo
              ? "text-[#17191C] hover:bg-white hover:shadow-2xs cursor-pointer"
              : "text-slate-300 cursor-not-allowed"
          }`}
          title="Rétablir (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Viewport Switcher */}
      <div className="flex items-center gap-1 bg-[#F1F3F5] p-1 rounded-xl border border-[#E4E7EC]">
        <button
          type="button"
          onClick={() => handleSelectViewport("desktop")}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeViewport === "desktop"
              ? "bg-white text-[#17191C] shadow-2xs"
              : "text-[#667085] hover:text-[#17191C]"
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Bureau</span>
        </button>
        <button
          type="button"
          onClick={() => handleSelectViewport("tablet")}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeViewport === "tablet"
              ? "bg-white text-[#17191C] shadow-2xs"
              : "text-[#667085] hover:text-[#17191C]"
          }`}
        >
          <Tablet className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Tablette</span>
        </button>
        <button
          type="button"
          onClick={() => handleSelectViewport("mobile")}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeViewport === "mobile"
              ? "bg-white text-[#17191C] shadow-2xs"
              : "text-[#667085] hover:text-[#17191C]"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Mobile</span>
        </button>
      </div>
    </div>
  );
};

