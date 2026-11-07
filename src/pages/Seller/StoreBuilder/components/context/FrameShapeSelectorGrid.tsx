import React from "react";
import { Check, Frame } from "lucide-react";
import type { ArtisticFrameShape } from "../../../../../types/studio.types";
import { FRAME_SHAPE_OPTIONS } from "../../constants/artisticAtmosphereOptions";
import { CHAMFERED_MEDIA_CLIP } from "../../../../../components/Store/ArtisticFrameWrapper";

interface FrameShapeSelectorGridProps {
  activeShape: ArtisticFrameShape;
  onSelectShape: (shape: ArtisticFrameShape) => void;
  isAr?: boolean;
  compact?: boolean;
  labelFr?: string;
  labelAr?: string;
}

function renderMiniSilhouettePreview(shape: ArtisticFrameShape, isSelected: boolean) {
  const accentBorder = isSelected ? "border-[#023859] bg-[#023859]/12" : "border-slate-300 bg-slate-100";

  if (shape === "sharp-couture") {
    return (
      <div className={`w-7 h-8 rounded-none border ${accentBorder} p-0.5 flex items-center justify-center shrink-0`}>
        <div className="w-full h-full border border-amber-500/60" />
      </div>
    );
  }
  if (shape === "casbah-arch") {
    return (
      <div className={`w-7 h-8 rounded-t-full rounded-b-md border ${accentBorder} p-0.5 flex items-center justify-center shrink-0`}>
        <div className="w-full h-full rounded-t-full rounded-b-xs border border-amber-500/50" />
      </div>
    );
  }
  if (shape === "medallion-oval") {
    return (
      <div className={`w-7 h-8 rounded-full border-2 ${accentBorder} flex items-center justify-center shrink-0`} />
    );
  }
  if (shape === "polaroid-atelier") {
    return (
      <div className="w-7 h-8 bg-white border border-slate-300 shadow-2xs p-0.5 pb-2 rotate-[-4deg] flex flex-col justify-between shrink-0">
        <div className={`w-full flex-1 ${isSelected ? "bg-[#023859]/20" : "bg-slate-200"}`} />
      </div>
    );
  }
  if (shape === "chamfered-tech") {
    return (
      <div
        className={`w-7 h-8 ${isSelected ? "bg-[#023859]" : "bg-slate-400"} p-[1px] shrink-0`}
        style={{ clipPath: CHAMFERED_MEDIA_CLIP }}
      >
        <div
          className={`w-full h-full ${isSelected ? "bg-[#E0F2FE]" : "bg-slate-100"}`}
          style={{ clipPath: CHAMFERED_MEDIA_CLIP }}
        />
      </div>
    );
  }
  return (
    <div className={`w-7 h-8 rounded-lg border ${accentBorder} shrink-0`} />
  );
}

export const FrameShapeSelectorGrid: React.FC<FrameShapeSelectorGridProps> = ({
  activeShape,
  onSelectShape,
  isAr = false,
  compact = false,
  labelFr = "4. Silhouettes Architecturales & Cadres (Pilier 2)",
  labelAr = "4. أشكال الإطارات والقصات المعمارية",
}) => {
  return (
    <div className="space-y-2">
      <span className="text-[11px] font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-1.5">
        <Frame className="w-3.5 h-3.5 text-[#023859]" />
        <span>{isAr ? labelAr : labelFr}</span>
      </span>

      <div className="grid grid-cols-2 gap-2">
        {FRAME_SHAPE_OPTIONS.map((opt) => {
          const isSel = activeShape === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectShape(opt.id)}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                isSel
                  ? "border-[#023859] bg-[#F0F7FA] ring-1 ring-[#023859]/30 shadow-2xs"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              {renderMiniSilhouettePreview(opt.id, isSel)}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[8.5px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-[#023859]">
                    {opt.badgeFr}
                  </span>
                  {isSel && (
                    <span className="w-3.5 h-3.5 rounded-full bg-[#023859] text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <span className="block text-[10.5px] font-extrabold text-slate-900 leading-tight mt-1 truncate">
                  {isAr ? opt.labelAr : opt.labelFr}
                </span>
                {!compact && (
                  <span className="block text-[9px] text-slate-500 leading-tight mt-0.5 line-clamp-2">
                    {isAr ? opt.sublabelAr : opt.sublabelFr}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
