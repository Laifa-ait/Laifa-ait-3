import type { CustomPageTheme, StoreThemeSector } from "../../../../domains/seller/customPage.types";

export const STUDIO_MEDIA_ASSETS = {
  fashion: "/images/studio/fashion.jpg",
  tech: "/images/studio/tech.jpg",
  beauty: "/images/studio/beauty.jpg",
  interior: "/images/studio/interior.jpg",
  sport: "/images/studio/sport.jpg",
} as const;

export const SECTOR_STUDIO_IMAGE_MAP: Record<StoreThemeSector, string> = {
  mode: STUDIO_MEDIA_ASSETS.fashion,
  beaute: STUDIO_MEDIA_ASSETS.beauty,
  artisanat: STUDIO_MEDIA_ASSETS.interior,
  tech: STUDIO_MEDIA_ASSETS.tech,
  maison: STUDIO_MEDIA_ASSETS.interior,
  alimentation: STUDIO_MEDIA_ASSETS.interior,
  sport: STUDIO_MEDIA_ASSETS.sport,
  accessoires: STUDIO_MEDIA_ASSETS.fashion,
  enfants: STUDIO_MEDIA_ASSETS.fashion,
};

export const DEFAULT_MODERN_SECTOR: StoreThemeSector = "mode";

export const DEFAULT_MODERN_THEME = {
  presetId: "minimal_pure",
  sector: DEFAULT_MODERN_SECTOR,
  primaryColor: "#0F172A",
  secondaryColor: "#1E293B",
  accentColor: "#2563EB",
  canvasColor: "#F8FAFC",
  surfaceColor: "#FFFFFF",
  textColor: "#0F172A",
  mutedTextColor: "#475569",
  borderColor: "#E2E8F0",
  buttonColor: "#0F172A",
  buttonTextColor: "#FFFFFF",
  buttonStyle: "solid",
  buttonHeightPx: 44,
  priceColor: "#0F172A",
  accentBadgeColor: "#0F172A",
  badgeTextColor: "#FFFFFF",
  fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
  headingFontFamily: "'Plus Jakarta Sans', sans-serif",
  bodyFontFamily: "'DM Sans', sans-serif",
  headingFontWeight: 700,
  borderRadiusPx: 12,
  spacingYPx: 32,
  titleFontSizePx: 36,
  bodyFontSizePx: 15,
  cardShadow: "sm",
  surfaceTexture: "none",
  ambientLighting: "natural",
  cardMaterial: "solid-matte",
  frameShape: "soft-modern",
  letterSpacing: -0.02,
  lineHeight: 1.15,
  headingAccentStyle: "accent-color",
  headingUnderlineStyle: "hairline",
} satisfies CustomPageTheme;

export const DEFAULT_EDITORIAL_SAMPLE_TITLE = "Design *Contemporain* {Architectural}";

export const STUDIO_FALLBACK_SVG_COLORS = {
  bg: "#F8FAFC",
  accent: "#E2E8F0",
  fg: "#0F172A",
} as const;

export function getSectorMediaAsset(sector?: StoreThemeSector | string): string {
  if (sector && sector in SECTOR_STUDIO_IMAGE_MAP) {
    return SECTOR_STUDIO_IMAGE_MAP[sector as StoreThemeSector];
  }
  return STUDIO_MEDIA_ASSETS.fashion;
}
