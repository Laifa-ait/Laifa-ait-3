import React, { useId } from "react";
import type {
  ArtisticAmbientLighting,
  ArtisticCardMaterial,
  ArtisticSurfaceTexture,
  CustomPageSectionStyles,
  CustomPageTheme,
} from "../../domains/seller/customPage.types";

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
      ? "backdrop-blur-xl bg-black/22 border border-white/25 shadow-[0_12px_36px_rgba(0,0,0,0.18)]"
      : "backdrop-blur-xl bg-white/75 border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)]";
  }
  if (active === "velvet-shadow") {
    return isDarkSection
      ? "backdrop-blur-md bg-black/20 border border-[#FDE68A]/40 shadow-[0_16px_42px_-6px_rgba(0,0,0,0.26),0_4px_14px_-2px_rgba(253,230,138,0.15)]"
      : "bg-[var(--store-surface,#FFFFFF)] border border-[#C59B27]/20 shadow-[0_14px_38px_-6px_rgba(1,28,64,0.10),0_4px_12px_-2px_rgba(197,155,39,0.08)]";
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
  const surfaceTexture: ArtisticSurfaceTexture =
    sectionStyles?.surfaceTexture || theme?.surfaceTexture || "none";
  const ambientLighting: ArtisticAmbientLighting =
    sectionStyles?.ambientLighting || theme?.ambientLighting || "natural";

  if (surfaceTexture === "none" && ambientLighting === "natural") {
    return null;
  }

  const accentColor = theme?.accentColor || theme?.primaryColor || "#B45309";
  const primaryColor = theme?.primaryColor || "#023859";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden z-0 select-none ${className}`}
    >
      {/* 1. AMBIENT LIGHTING SCENOGRAPHY */}
      {ambientLighting === "golden-hour" && (
        <>
          <div
            className="absolute -top-24 inset-x-0 h-[440px] opacity-30 transition-opacity duration-700"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245, 158, 11, 0.26) 0%, rgba(251, 191, 36, 0.10) 48%, transparent 100%)",
            }}
          />
          <div
            className="absolute bottom-0 inset-x-0 h-64 opacity-15"
            style={{
              background:
                "linear-gradient(to top, rgba(217, 119, 6, 0.10), transparent)",
            }}
          />
        </>
      )}

      {ambientLighting === "spotlight-atelier" && (
        <div
          className="absolute inset-0"
          style={{
            background: isDarkMode
              ? "radial-gradient(circle at 50% 34%, rgba(255,255,255,0.07) 0%, transparent 58%, rgba(2,6,23,0.35) 100%)"
              : "radial-gradient(circle at 50% 34%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 58%, rgba(15,23,42,0.05) 100%)",
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

      {/* 2. SUBTLE SURFACE TEXTURES (0.04 to 0.08 max opacity) */}
      {surfaceTexture === "film-grain" && (
        <svg className="absolute inset-0 w-full h-full opacity-[0.05] mix-blend-multiply">
          <filter id={`film-grain-${uid}`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.82"
              numOctaves={3}
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#film-grain-${uid})`} />
        </svg>
      )}

      {surfaceTexture === "cotton-paper" && (
        <>
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(rgba(180, 142, 92, 0.06) 1px, transparent 0), radial-gradient(rgba(120, 90, 50, 0.04) 1px, transparent 0)",
              backgroundSize: "24px 24px",
              backgroundPosition: "0 0, 12px 12px",
            }}
          />
          <svg className="absolute inset-0 w-full h-full opacity-[0.05] mix-blend-multiply">
            <filter id={`cotton-${uid}`}>
              <feTurbulence
                type="turbulence"
                baseFrequency="0.04 0.35"
                numOctaves={2}
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0.15" />
            </filter>
            <rect width="100%" height="100%" filter={`url(#cotton-${uid})`} />
          </svg>
        </>
      )}

      {surfaceTexture === "zellige-watermark" && (
        <svg className="absolute inset-0 w-full h-full opacity-[0.045]">
          <defs>
            <pattern
              id={`zellige-${uid}`}
              width="64"
              height="64"
              patternUnits="userSpaceOnUse"
            >
              <g fill="none" stroke={accentColor} strokeWidth="0.9">
                <polygon points="32,4 40,24 60,32 40,40 32,60 24,40 4,32 24,24" />
                <polygon points="32,12 46,18 52,32 46,46 32,52 18,46 12,32 18,18" />
                <circle cx="32" cy="32" r="5" />
                <path d="M0,0 L12,12 M64,0 L52,12 M0,64 L12,52 M64,64 L52,52" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#zellige-${uid})`} />
        </svg>
      )}

      {surfaceTexture === "silk-mesh" && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(at 15% 15%, ${accentColor}1E 0px, transparent 50%),
              radial-gradient(at 85% 25%, ${primaryColor}14 0px, transparent 55%),
              radial-gradient(at 50% 80%, ${accentColor}14 0px, transparent 55%)
            `,
          }}
        />
      )}

      {surfaceTexture === "architectural-grid" && (
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]">
          <defs>
            <pattern
              id={`arch-grid-${uid}`}
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke={primaryColor}
                strokeWidth="0.75"
                strokeOpacity="0.4"
              />
              <path
                d="M -3 0 L 3 0 M 0 -3 L 0 3 M 45 0 L 51 0 M 0 45 L 0 51"
                stroke={accentColor}
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#arch-grid-${uid})`} />
        </svg>
      )}
    </div>
  );
};
