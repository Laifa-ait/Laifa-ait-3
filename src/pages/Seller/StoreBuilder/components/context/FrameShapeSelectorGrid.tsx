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
  const accentBorder = isSelected
    ? "border-[var(--studio-primary)] bg-[var(--studio-highlight-soft)]"
    : "border-[var(--studio-border-strong)] bg-[var(--studio-surface-subtle)]";

  if (shape === "sharp-couture") {
    return (
      <div className={`w-7 h-8 rounded-none border ${accentBorder} p-0.5 flex items-center justify-center shrink-0`}>
        <div className="w-full h-full border border-[var(--studio-focus)]/50" />
      </div>
    );
  }
  if (shape === "arch-minimal" || shape === "casbah-arch") {
    return (
      <div className={`w-7 h-8 rounded-t-full rounded-b-none border ${accentBorder} p-0.5 flex items-center justify-center shrink-0`}>
        <div className="w-full h-full rounded-t-full rounded-b-none border border-[var(--studio-focus)]/40" />
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
      <div className="w-7 h-8 bg-[var(--studio-white)] border border-[var(--studio-border-strong)] p-0.5 pb-2 flex flex-col justify-between shrink-0">
        <div className={`w-full flex-1 ${isSelected ? "bg-[var(--studio-primary)]/20" : "bg-[var(--studio-border)]"}`} />
      </div>
    );
  }
  if (shape === "chamfered-tech") {
    return (
      <div
        className={`w-7 h-8 ${isSelected ? "bg-[var(--studio-primary)]" : "bg-[var(--studio-muted)]"} p-[1px] shrink-0`}
        style={{ clipPath: CHAMFERED_MEDIA_CLIP }}
      >
        <div
          className={`w-full h-full ${isSelected ? "bg-[var(--studio-highlight-soft)]" : "bg-[var(--studio-surface-subtle)]"}`}
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
  labelFr = "4. Géométries & Cadres Architecturaux",
  labelAr = "4. الأشكال الهندسية والإطارات",
}) => {
  return (
    <div className="space-y-2">
      <span className="text-[11px] font-extrabold text-[var(--studio-black)] uppercase tracking-wider flex items-center gap-1.5">
        <Frame className="w-3.5 h-3.5 text-[var(--studio-primary)]" />
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
                  ? "border-[var(--studio-primary)] bg-[var(--studio-highlight-soft)] ring-1 ring-[var(--studio-focus)]/30 shadow-2xs"
                  : "border-[var(--studio-border)] bg-[var(--studio-white)] hover:border-[var(--studio-border-strong)]"
              }`}
            >
              {renderMiniSilhouettePreview(opt.id, isSel)}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[8.5px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--studio-surface-subtle)] text-[var(--studio-primary)]">
                    {opt.badgeFr}
                  </span>
                  {isSel && (
                    <span className="w-3.5 h-3.5 rounded-sm bg-[var(--studio-primary)] text-[var(--studio-white)] flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <span className="block text-[10.5px] font-extrabold text-[var(--studio-black)] leading-tight mt-1 truncate">
                  {isAr ? opt.labelAr : opt.labelFr}
                </span>
                {!compact && (
                  <span className="block text-[9px] text-[var(--studio-muted)] leading-tight mt-0.5 line-clamp-2">
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
