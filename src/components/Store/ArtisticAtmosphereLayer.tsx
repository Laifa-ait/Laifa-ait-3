import React, { useId } from "react";
import type {
  ArtisticAmbientLighting,
  ArtisticCardMaterial,
  ArtisticSurfaceTexture,
  CustomPageSectionStyles,
  CustomPageTheme,
} from "../../domains/seller/customPage.types";
import { DEFAULT_MODERN_THEME } from "../../pages/Seller/StoreBuilder/constants/studioThemeDefaults";

interface ArtisticAtmosphereLayerProps {
  theme?: CustomPageTheme | null;
  sectionStyles?: CustomPageSectionStyles;
  isDarkMode?: boolean;
  className?: string;
}

export function resolveCardMaterialClasses(
  themeMaterial?: ArtisticCardMaterial,
  sectionMaterial?: ArtisticCardMaterial,
  isDarkSection = false
): string {
  const active = sectionMaterial || themeMaterial || "solid-matte";
  if (active === "frosted-crystal") {
    return isDarkSection
      ? "backdrop-blur-xl bg-black/25 border border-white/20 shadow-[0_12px_32px_rgba(0,0,0,0.20)]"
      : "backdrop-blur-xl bg-white/80 border border-white/60 shadow-[0_8px_28px_rgba(15,23,42,0.05)]";
  }
  if (active === "velvet-shadow") {
    return isDarkSection
      ? "backdrop-blur-md bg-slate-900/60 border border-white/15 shadow-[0_16px_42px_-6px_rgba(0,0,0,0.35)]"
      : "bg-[var(--store-surface,#FFFFFF)] border border-slate-200/80 shadow-[0_14px_38px_-8px_rgba(15,23,42,0.10)]";
  }
  return "";
}

export const ArtisticAtmosphereLayer: React.FC<ArtisticAtmosphereLayerProps> = ({
  theme,
  sectionStyles,
  isDarkMode = false,
  className = "",
}) => {
  const uid = useId().replace(/:/g, "");
  const rawTexture: ArtisticSurfaceTexture =
    sectionStyles?.surfaceTexture || theme?.surfaceTexture || "none";
  // Map legacy zellige-watermark cleanly to architectural-grid
  const surfaceTexture: ArtisticSurfaceTexture =
    rawTexture === "zellige-watermark" ? "architectural-grid" : rawTexture;
  const ambientLighting: ArtisticAmbientLighting =
    sectionStyles?.ambientLighting || theme?.ambientLighting || "natural";

  if (surfaceTexture === "none" && ambientLighting === "natural") {
    return null;
  }

  const accentColor =
    theme?.accentColor || theme?.primaryColor || DEFAULT_MODERN_THEME.accentColor || "#2563EB";
  const primaryColor =
    theme?.primaryColor || DEFAULT_MODERN_THEME.primaryColor || "#0F172A";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden z-0 select-none ${className}`}
    >
      {ambientLighting === "golden-hour" && (
        <div
          className="absolute -top-24 inset-x-0 h-[420px] opacity-25 transition-opacity duration-700"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(251, 191, 36, 0.22) 0%, transparent 100%)",
          }}
        />
      )}

      {ambientLighting === "spotlight-atelier" && (
        <div
          className="absolute inset-0"
          style={{
            background: isDarkMode
              ? "radial-gradient(circle at 50% 34%, rgba(255,255,255,0.07) 0%, transparent 58%, rgba(2,6,23,0.35) 100%)"
              : "radial-gradient(circle at 50% 34%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 58%, rgba(15,23,42,0.04) 100%)",
          }}
        />
      )}

      {ambientLighting === "neon-aura" && (
        <>
          <div
            className="absolute top-12 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-15"
            style={{ backgroundColor: accentColor }}
          />
          <div
            className="absolute bottom-16 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
            style={{ backgroundColor: primaryColor }}
          />
        </>
      )}

      {surfaceTexture === "film-grain" && (
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] mix-blend-multiply">
          <filter id={`film-grain-${uid}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves={3} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#film-grain-${uid})`} />
        </svg>
      )}

      {surfaceTexture === "cotton-paper" && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(rgba(100, 116, 139, 0.08) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      )}

      {surfaceTexture === "silk-mesh" && (
        <div
          className="absolute inset-0 opacity-18"
          style={{
            backgroundImage: `
              radial-gradient(at 15% 15%, ${accentColor}1A 0px, transparent 50%),
              radial-gradient(at 85% 25%, ${primaryColor}12 0px, transparent 55%)
            `,
          }}
        />
      )}

      {surfaceTexture === "architectural-grid" && (
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]">
          <defs>
            <pattern id={`arch-grid-${uid}`} width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke={primaryColor} strokeWidth="0.75" strokeOpacity="0.4" />
              <path d="M -3 0 L 3 0 M 0 -3 L 0 3" stroke={accentColor} strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#arch-grid-${uid})`} />
        </svg>
      )}
    </div>
  );
};
