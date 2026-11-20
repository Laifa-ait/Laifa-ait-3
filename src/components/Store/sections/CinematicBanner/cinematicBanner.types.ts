import {
  HeroLayoutModelId,
  HeroTextPosition9,
} from "../../../../domains/seller/customPage.types";
import { StudioViewportDevice } from "../responsiveInheritanceHelper";

export type CinematicEditorTabId =
  | "image"
  | "dimensions"
  | "typography"
  | "colors"
  | "button";

export type CinematicHeightPreset =
  | "fine"
  | "balanced"
  | "large"
  | "immersive"
  | "custom";

export type CinematicCornerPreset = 0 | 12 | 24 | 40 | "custom";

export type CinematicButtonShape =
  | "rectangle"
  | "rounded"
  | "pill"
  | "outline"
  | "minimal";

export type CinematicOverlayPreset = "none" | "soft" | "medium" | "strong";

export type CinematicOverlayDirection =
  | "bottom-up"
  | "left-right"
  | "right-left"
  | "top-down"
  | "radial";

export type CinematicOverlayZone =
  | "text-only"
  | "directional-edge"
  | "banner-soft";

export type CinematicDestinationType = "catalog" | "category" | "product";

export interface CinematicImageConfig {
  src: string;
  alt: string;
  fit: "cover" | "contain";
  zoom: number; // 1.0 (100%) to 2.0 (200%)
  focalX: number; // 0 to 100 (%)
  focalY: number; // 0 to 100 (%)
  panOffsetX: number; // -50 to 50 (px)
  panOffsetY: number; // -50 to 50 (px)
}

export interface CinematicLayoutConfig {
  desktopHeightPreset: CinematicHeightPreset;
  heightPx: number;
  widthMode: "full" | "contained";
  cornerRadiusPreset: CinematicCornerPreset;
  borderRadiusPx: number;
  marginHorizontalPx: number;
  marginVerticalPx: number;
  innerPaddingPx: number;
  textPosition9: HeroTextPosition9;
  textAlign: "left" | "center" | "right";
  textBlockMarginX: number;
  textBlockMarginY: number;
  showCompositionGuides: boolean;
}

export interface CinematicTypographyConfig {
  titleFontFamily: string;
  titleSizePx: number;
  titleSizeToken: "sm" | "md" | "lg" | "xl";
  titleWeight: 400 | 500 | 600 | 700 | 800 | 900;
  titleLineHeight: number;
  titleLetterSpacingEm: number;
  titleMaxWidthPx: number;
  subtitleSizePx: number;
  subtitleWeight: 400 | 500 | 600 | 700;
  subtitleLineHeight: number;
  subtitleMaxWidthPx: number;
  textVerticalGapPx: number;
}

export interface CinematicColorsConfig {
  titleColor: string;
  subtitleColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  buttonBorderColor: string;
  backdropColor: string;
}

export interface CinematicOverlayConfig {
  preset: CinematicOverlayPreset;
  intensity: number; // 0 to 80 (%)
  direction: CinematicOverlayDirection;
  zone: CinematicOverlayZone;
}

export interface CinematicButtonConfig {
  text: string;
  shape: CinematicButtonShape;
  size: "sm" | "md" | "lg";
  paddingX: number;
  paddingY: number;
  borderRadiusPx: number;
  borderWidthPx: number;
  fontFamily: string;
  fontWeight: 500 | 600 | 700 | 800;
  letterSpacingEm: number;
  showArrow: boolean;
  targetType: CinematicDestinationType;
  targetCategory: string;
  targetProductId: string;
  href: string;
}

export interface CinematicDeviceOverride {
  heightPreset?: CinematicHeightPreset;
  heightPx?: number;
  textPosition9?: HeroTextPosition9;
  textAlign?: "left" | "center" | "right";
  titleSizePx?: number;
  titleSizeToken?: "sm" | "md" | "lg" | "xl";
  subtitleSizePx?: number;
  buttonSize?: "sm" | "md" | "lg";
  zoom?: number;
  focalX?: number;
  focalY?: number;
  panOffsetX?: number;
  panOffsetY?: number;
  marginHorizontalPx?: number;
  marginVerticalPx?: number;
  innerPaddingPx?: number;
  textBlockMarginX?: number;
  textBlockMarginY?: number;
  borderRadiusPx?: number;
  imageSrc?: string;
}

export interface CinematicResponsiveMap {
  desktop: CinematicDeviceOverride;
  tablet: CinematicDeviceOverride;
  mobile: CinematicDeviceOverride;
}

export interface CinematicBannerConfig {
  styleId: HeroLayoutModelId;
  image: CinematicImageConfig;
  title: string;
  subtitle: string;
  button: CinematicButtonConfig;
  layout: CinematicLayoutConfig;
  typography: CinematicTypographyConfig;
  colors: CinematicColorsConfig;
  overlay: CinematicOverlayConfig;
  responsive: CinematicResponsiveMap;
}

export interface CinematicResolvedDeviceState {
  viewport: StudioViewportDevice;
  hasCustomOverride: boolean;
  imageSrc: string;
  imageFit: "cover" | "contain";
  zoom: number;
  focalX: number;
  focalY: number;
  panOffsetX: number;
  panOffsetY: number;
  heightPreset: CinematicHeightPreset;
  heightPx: number;
  borderRadiusPx: number;
  marginHorizontalPx: number;
  marginVerticalPx: number;
  innerPaddingPx: number;
  textPosition9: HeroTextPosition9;
  textAlign: "left" | "center" | "right";
  textBlockMarginX: number;
  textBlockMarginY: number;
  titleSizePx: number;
  titleSizeToken: "sm" | "md" | "lg" | "xl";
  subtitleSizePx: number;
  buttonSize: "sm" | "md" | "lg";
  titleMaxWidthPx: number;
  subtitleMaxWidthPx: number;
  textVerticalGapPx: number;
}

export interface CinematicContrastAudit {
  titleContrastRatio: number;
  buttonContrastRatio: number;
  isTitleAccessible: boolean;
  isButtonAccessible: boolean;
  level: "AAA" | "AA" | "LOW";
  warningMessage: string | null;
  suggestedPatch: {
    colors?: Partial<CinematicColorsConfig>;
    overlay?: Partial<CinematicOverlayConfig>;
  };
}

export interface CinematicDestinationValidation {
  isValid: boolean;
  resolvedHref: string;
  warningMessage: string | null;
  productExists: boolean;
  matchedProductTitle?: string;
}
