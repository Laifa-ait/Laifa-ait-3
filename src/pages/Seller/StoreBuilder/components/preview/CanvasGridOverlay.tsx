import React from "react";

interface CanvasGridOverlayProps {
  showGrid: boolean;
}

export const CanvasGridOverlay: React.FC<CanvasGridOverlayProps> = ({ showGrid }) => {
  if (!showGrid) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none overflow-hidden">
      {/* 12-Column Responsive Layout Grid */}
      <div className="h-full w-full max-w-5xl mx-auto px-4 grid grid-cols-12 gap-3 opacity-15">
        {Array.from({ length: 12 }).map((_, idx) => (
          <div
            key={idx}
            className="h-full bg-orange-500 border-x border-orange-600 flex items-start justify-center pt-2"
          >
            <span className="text-[9px] font-mono font-bold text-orange-700 bg-white/80 px-1 rounded">
              C{idx + 1}
            </span>
          </div>
        ))}
      </div>

      {/* Center axis guide */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-sky-500/40 border-r border-dashed border-sky-600/60" />
    </div>
  );
};
