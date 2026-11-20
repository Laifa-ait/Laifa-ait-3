import React from "react";
import type { ArtisticFrameShape } from "../../types/studio.types";
import type { CustomPageTheme } from "../../domains/seller/customPage.types";
import { DEFAULT_MODERN_THEME } from "../../pages/Seller/StoreBuilder/constants/studioThemeDefaults";

export const CHAMFERED_POLYGON_CLIP =
  "polygon(16px 0%, 100% 0%, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0% 100%, 0% 16px)";

export const CHAMFERED_MEDIA_CLIP =
  "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)";

export function resolveEffectiveFrameShape(
  theme?: CustomPageTheme,
  sectionOverride?: ArtisticFrameShape,
): ArtisticFrameShape {
  return sectionOverride || theme?.frameShape || "soft-modern";
}

export interface FrameShapeCardVisuals {
  outerClassName: string;
  outerStyle: React.CSSProperties;
  mediaClassName: string;
  mediaStyle: React.CSSProperties;
  forcedAspectClass?: string;
  showDoubleGalleryBorder: boolean;
  showArchKeystone: boolean;
  showPolaroidCaptionBar: boolean;
  showChamferedHudCorners: boolean;
}

export function resolveCatalogProductFrameVisuals(
  shape: ArtisticFrameShape | undefined,
  borderRadiusPx?: number,
): FrameShapeCardVisuals {
  const effective: ArtisticFrameShape = shape || "soft-modern";

  if (effective === "sharp-couture") {
    return {
      outerClassName: "rounded-none",
      outerStyle: { borderRadius: 0 },
      mediaClassName: "rounded-none",
      mediaStyle: { borderRadius: 0 },
      showDoubleGalleryBorder: true,
      showArchKeystone: false,
      showPolaroidCaptionBar: false,
      showChamferedHudCorners: false,
    };
  }

  if (effective === "arch-minimal" || effective === "casbah-arch") {
    return {
      outerClassName: "rounded-t-[999px] rounded-b-xl bg-transparent",
      outerStyle: {},
      mediaClassName: "rounded-t-[999px] rounded-b-lg overflow-hidden",
      mediaStyle: {},
      showDoubleGalleryBorder: false,
      showArchKeystone: true,
      showPolaroidCaptionBar: false,
      showChamferedHudCorners: false,
    };
  }

  if (effective === "polaroid-atelier") {
    return {
      outerClassName:
        "p-3 pb-10 bg-white text-slate-900 border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 rounded-sm",
      outerStyle: {},
      mediaClassName: "rounded-none ring-1 ring-black/5",
      mediaStyle: {},
      showDoubleGalleryBorder: false,
      showArchKeystone: false,
      showPolaroidCaptionBar: true,
      showChamferedHudCorners: false,
    };
  }

  if (effective === "chamfered-tech") {
    return {
      outerClassName: "rounded-none",
      outerStyle: { clipPath: CHAMFERED_POLYGON_CLIP },
      mediaClassName: "rounded-none",
      mediaStyle: { clipPath: CHAMFERED_MEDIA_CLIP },
      showDoubleGalleryBorder: false,
      showArchKeystone: false,
      showPolaroidCaptionBar: false,
      showChamferedHudCorners: true,
    };
  }

  return {
    outerClassName: "rounded-xl",
    outerStyle:
      typeof borderRadiusPx === "number" ? { borderRadius: `${borderRadiusPx}px` } : {},
    mediaClassName: "rounded-xl overflow-hidden",
    mediaStyle:
      typeof borderRadiusPx === "number" ? { borderRadius: `${borderRadiusPx}px` } : {},
    showDoubleGalleryBorder: false,
    showArchKeystone: false,
    showPolaroidCaptionBar: false,
    showChamferedHudCorners: false,
  };
}

export function resolveFrameShapeVisuals(
  shape: ArtisticFrameShape | undefined,
  fallbackRadiusClass = "rounded-xl",
  fallbackMediaRadiusClass = "rounded-xl",
  borderRadiusPx?: number,
): FrameShapeCardVisuals {
  const effective: ArtisticFrameShape = shape || "soft-modern";

  if (effective === "medallion-oval") {
    return {
      outerClassName: "rounded-[999px]",
      outerStyle: {},
      mediaClassName: "rounded-[999px] ring-1 ring-black/10",
      mediaStyle: {},
      forcedAspectClass: "aspect-[3/4]",
      showDoubleGalleryBorder: false,
      showArchKeystone: false,
      showPolaroidCaptionBar: false,
      showChamferedHudCorners: false,
    };
  }

  if (
    effective === "sharp-couture" ||
    effective === "arch-minimal" ||
    effective === "casbah-arch" ||
    effective === "polaroid-atelier" ||
    effective === "chamfered-tech"
  ) {
    return resolveCatalogProductFrameVisuals(effective, borderRadiusPx);
  }

  return {
    outerClassName: fallbackRadiusClass,
    outerStyle:
      typeof borderRadiusPx === "number" ? { borderRadius: `${borderRadiusPx}px` } : {},
    mediaClassName: fallbackMediaRadiusClass,
    mediaStyle:
      typeof borderRadiusPx === "number"
        ? { borderRadius: `${Math.max(0, borderRadiusPx - 4)}px` }
        : {},
    showDoubleGalleryBorder: false,
    showArchKeystone: false,
    showPolaroidCaptionBar: false,
    showChamferedHudCorners: false,
  };
}

interface ArtisticFrameWrapperProps {
  shape?: ArtisticFrameShape;
  theme?: CustomPageTheme;
  caption?: string;
  accentColor?: string;
  fallbackRadiusClass?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const ArtisticFrameWrapper: React.FC<ArtisticFrameWrapperProps> = ({
  shape,
  theme,
  caption,
  accentColor,
  fallbackRadiusClass = "rounded-xl",
  className = "",
  style,
  children,
}) => {
  const effectiveShape = resolveEffectiveFrameShape(theme, shape);
  const visuals = resolveFrameShapeVisuals(
    effectiveShape,
    fallbackRadiusClass,
    fallbackRadiusClass,
    theme?.borderRadiusPx,
  );
  const resolvedAccent =
    accentColor || theme?.accentColor || theme?.primaryColor || DEFAULT_MODERN_THEME.accentColor || "#2563EB";

  return (
    <div
      className={`relative group/frame ${visuals.outerClassName} ${className}`}
      style={{ ...visuals.outerStyle, ...style }}
      data-artistic-frame={effectiveShape}
    >
      <div
        className={`relative w-full h-full overflow-hidden ${visuals.mediaClassName} ${
          visuals.forcedAspectClass || ""
        }`}
        style={visuals.mediaStyle}
      >
        {children}

        {visuals.showDoubleGalleryBorder && (
          <div
            className="pointer-events-none absolute inset-2 border z-10"
            style={{ borderColor: `${resolvedAccent}40` }}
          />
        )}

        {visuals.showArchKeystone && (
          <div
            className="pointer-events-none absolute inset-1.5 rounded-t-[999px] rounded-b-lg border z-10"
            style={{ borderColor: `${resolvedAccent}30` }}
          />
        )}

        {visuals.showChamferedHudCorners && (
          <div className="pointer-events-none absolute inset-0 z-10">
            <span
              className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2"
              style={{ borderColor: resolvedAccent }}
            />
            <span
              className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2"
              style={{ borderColor: resolvedAccent }}
            />
          </div>
        )}
      </div>

      {visuals.showPolaroidCaptionBar && (
        <div className="pointer-events-none absolute inset-x-3 bottom-2.5 flex items-center justify-between gap-2 text-slate-700">
          <span className="text-xs font-medium tracking-tight truncate">
            {caption || "Collection Studio"}
          </span>
          <span className="text-[10px] font-mono tabular-nums tracking-wider text-slate-400 shrink-0">
            01
          </span>
        </div>
      )}
    </div>
  );
};
