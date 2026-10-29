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
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-1.5 rounded-lg transition-all ${
            canUndo
              ? "text-[#011C40] hover:bg-white hover:shadow-2xs cursor-pointer"
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
              ? "text-[#011C40] hover:bg-white hover:shadow-2xs cursor-pointer"
              : "text-slate-300 cursor-not-allowed"
          }`}
          title="Rétablir (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Viewport Switcher (PC / Tablette / Mobile) */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
        <button
          type="button"
          onClick={() => handleSelectViewport("desktop")}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeViewport === "desktop"
              ? "bg-[#023859] text-white shadow-2xs"
              : "text-slate-600 hover:text-[#011C40]"
          }`}
          title="Aperçu Ordinateur"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">PC</span>
        </button>
        <button
          type="button"
          onClick={() => handleSelectViewport("tablet")}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeViewport === "tablet"
              ? "bg-[#023859] text-white shadow-2xs"
              : "text-slate-600 hover:text-[#011C40]"
          }`}
          title="Aperçu Tablette (768px)"
        >
          <Tablet className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Tablette</span>
        </button>
        <button
          type="button"
          onClick={() => handleSelectViewport("mobile")}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeViewport === "mobile"
              ? "bg-[#023859] text-white shadow-2xs"
              : "text-slate-600 hover:text-[#011C40]"
          }`}
          title="Aperçu Mobile (390px)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Mobile</span>
        </button>
      </div>
    </div>
  );
};

