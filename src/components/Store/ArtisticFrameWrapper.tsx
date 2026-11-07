import React from "react";
import type { ArtisticFrameShape } from "../../types/studio.types";
import type { CustomPageTheme } from "../../domains/seller/customPage.types";

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
  showCasbahArchKeystone: boolean;
  showPolaroidCaptionBar: boolean;
  showChamferedHudCorners: boolean;
}

/**
 * Pour les cartes produits du catalogue : ZÉRO OVALE (`medallion-oval` / `rounded-full`).
 * Les photos produits occupent 100% de la largeur supérieure (Full-Bleed, p-0),
 * sans boîte blanche rectangulaire autour d'une arche ou d'un ovale.
 */
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
      showCasbahArchKeystone: false,
      showPolaroidCaptionBar: false,
      showChamferedHudCorners: false,
    };
  }

  if (effective === "casbah-arch") {
    return {
      outerClassName: "rounded-t-[999px] rounded-b-2xl bg-transparent",
      outerStyle: {},
      mediaClassName: "rounded-t-[999px] rounded-b-xl overflow-hidden",
      mediaStyle: {},
      showDoubleGalleryBorder: false,
      showCasbahArchKeystone: true,
      showPolaroidCaptionBar: false,
      showChamferedHudCorners: false,
    };
  }

  if (effective === "polaroid-atelier") {
    return {
      outerClassName:
        "p-2.5 pb-9 bg-white text-slate-900 border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 rounded-sm",
      outerStyle: {},
      mediaClassName: "rounded-none ring-1 ring-black/5",
      mediaStyle: {},
      showDoubleGalleryBorder: false,
      showCasbahArchKeystone: false,
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
      showCasbahArchKeystone: false,
      showPolaroidCaptionBar: false,
      showChamferedHudCorners: true,
    };
  }

  // soft-modern & medallion-oval fallback on product catalog cards -> Full-Bleed rounded-2xl (zero oval in catalog)
  return {
    outerClassName: "rounded-2xl",
    outerStyle:
      typeof borderRadiusPx === "number" ? { borderRadius: `${borderRadiusPx}px` } : {},
    mediaClassName: "rounded-2xl overflow-hidden",
    mediaStyle:
      typeof borderRadiusPx === "number" ? { borderRadius: `${borderRadiusPx}px` } : {},
    showDoubleGalleryBorder: false,
    showCasbahArchKeystone: false,
    showPolaroidCaptionBar: false,
    showChamferedHudCorners: false,
  };
}

export function resolveFrameShapeVisuals(
  shape: ArtisticFrameShape | undefined,
  fallbackRadiusClass = "rounded-2xl",
  fallbackMediaRadiusClass = "rounded-xl",
  borderRadiusPx?: number,
): FrameShapeCardVisuals {
  const effective: ArtisticFrameShape = shape || "soft-modern";

  if (effective === "medallion-oval") {
    return {
      outerClassName: "rounded-[999px]",
      outerStyle: {},
      mediaClassName: "rounded-[999px] ring-1 ring-[#C59B27]/35",
      mediaStyle: {},
      forcedAspectClass: "aspect-[3/4]",
      showDoubleGalleryBorder: false,
      showCasbahArchKeystone: false,
      showPolaroidCaptionBar: false,
      showChamferedHudCorners: false,
    };
  }

  if (
    effective === "sharp-couture" ||
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
    showCasbahArchKeystone: false,
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
  children: React.ReactNode;
}

export const ArtisticFrameWrapper: React.FC<ArtisticFrameWrapperProps> = ({
  shape,
  theme,
  caption,
  accentColor,
  fallbackRadiusClass = "rounded-2xl",
  className = "",
  children,
}) => {
  const effectiveShape = resolveEffectiveFrameShape(theme, shape);
  const visuals = resolveFrameShapeVisuals(
    effectiveShape,
    fallbackRadiusClass,
    fallbackRadiusClass,
    theme?.borderRadiusPx,
  );
  const resolvedAccent = accentColor || theme?.accentColor || theme?.primaryColor || "#B45309";

  return (
    <div
      className={`relative group/frame ${visuals.outerClassName} ${className}`}
      style={visuals.outerStyle}
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
            style={{ borderColor: `${resolvedAccent}55` }}
          />
        )}

        {visuals.showCasbahArchKeystone && (
          <div
            className="pointer-events-none absolute inset-1.5 rounded-t-[999px] rounded-b-xl border z-10"
            style={{ borderColor: `${resolvedAccent}40` }}
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
        <div className="pointer-events-none absolute inset-x-3 bottom-2 flex items-center justify-between gap-2 text-slate-700">
          <span
            className="text-xs italic font-serif tracking-wide truncate"
            style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}
          >
            {caption || theme?.sector || "Atelier d'Art Olmart"}
          </span>
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 shrink-0">
            N° 01
          </span>
        </div>
      )}
    </div>
  );
};
