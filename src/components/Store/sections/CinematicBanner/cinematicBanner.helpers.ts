import { HeroBannerSettings, HeroDeviceMeasureConfig, HeroTextPosition9 } from "../../../../domains/seller/customPage.types";
import { getWcagContrastRatio } from "../../../../pages/Seller/StoreBuilder/utils/storeQualityAuditor";
import { StudioViewportDevice } from "../responsiveInheritanceHelper";
import { clampFocalCoord, clampNumber } from "../hero/heroResponsiveHelper";
import { hexToRgba } from "../hero/heroVisualEffectsHelper";
import { CINEMATIC_DEVICE_HEIGHT_PRESETS } from "./cinematicBanner.defaults";
import {
  CinematicBannerConfig, CinematicButtonShape, CinematicContrastAudit,
  CinematicDeviceOverride, CinematicHeightPreset, CinematicOverlayConfig, CinematicResolvedDeviceState,
} from "./cinematicBanner.types";
import { clampCinematicPan, clampCinematicZoom } from "./cinematicBanner.utils";

function resolvePresetFromPx(px: number, device: StudioViewportDevice): CinematicHeightPreset {
  const map = CINEMATIC_DEVICE_HEIGHT_PRESETS[device];
  return px === map.fine ? "fine" : px === map.balanced ? "balanced" : px === map.large ? "large" : px === map.immersive ? "immersive" : "custom";
}

function titlePxToToken(px: number): "sm" | "md" | "lg" | "xl" {
  return px <= 28 ? "sm" : px <= 36 ? "md" : px <= 46 ? "lg" : "xl";
}

function mapShapeToLegacyCtaStyle(shape: CinematicButtonShape): NonNullable<HeroBannerSettings["ctaStyle"]> {
  if (shape === "rectangle") return "sharp";
  if (shape === "outline") return "outline";
  if (shape === "rounded") return "rounded";
  if (shape === "minimal") return "minimal";
  return "pill";
}

export function resolveCinematicDeviceState(
  config: CinematicBannerConfig,
  viewport: StudioViewportDevice = "desktop"
): CinematicResolvedDeviceState {
  const ov: CinematicDeviceOverride = config.responsive?.[viewport] || {};
  const hasCustomOverride = viewport !== "desktop" && Object.values(ov).some((v) => v !== undefined && v !== "");

  const defaultHeightForDevice =
    viewport === "mobile" ? Math.max(260, Math.min(460, Math.round(config.layout.heightPx * 0.72)))
    : viewport === "tablet" ? Math.max(280, Math.min(560, Math.round(config.layout.heightPx * 0.85)))
    : config.layout.heightPx;

  const heightPx = clampNumber(
    ov.heightPx ?? (viewport === "desktop" ? config.layout.heightPx : defaultHeightForDevice),
    viewport === "mobile" ? 240 : 260, 760, defaultHeightForDevice
  );
  const defaultPadding =
    viewport === "mobile" ? Math.min(24, Math.max(16, Math.round(config.layout.innerPaddingPx * 0.65)))
    : viewport === "tablet" ? Math.min(36, Math.max(20, Math.round(config.layout.innerPaddingPx * 0.8)))
    : config.layout.innerPaddingPx;

  const defaultTitlePx =
    viewport === "mobile" ? Math.min(32, Math.max(20, Math.round(config.typography.titleSizePx * 0.65)))
    : viewport === "tablet" ? Math.min(44, Math.max(24, Math.round(config.typography.titleSizePx * 0.82)))
    : config.typography.titleSizePx;

  const titleSizePx = clampNumber(
    ov.titleSizePx ?? (viewport === "desktop" ? config.typography.titleSizePx : defaultTitlePx),
    viewport === "mobile" ? 18 : 22, viewport === "mobile" ? 36 : 68, defaultTitlePx
  );
  const defaultSubtitlePx = viewport === "mobile" ? Math.min(16, Math.max(12, config.typography.subtitleSizePx - 1)) : config.typography.subtitleSizePx;

  return {
    viewport,
    hasCustomOverride,
    imageSrc: (ov.imageSrc || config.image.src || "").trim(),
    imageFit: config.image.fit,
    zoom: clampCinematicZoom(ov.zoom ?? config.image.zoom, 1),
    focalX: clampFocalCoord(ov.focalX ?? config.image.focalX, 50),
    focalY: clampFocalCoord(ov.focalY ?? config.image.focalY, 50),
    panOffsetX: clampCinematicPan(ov.panOffsetX ?? config.image.panOffsetX, 0),
    panOffsetY: clampCinematicPan(ov.panOffsetY ?? config.image.panOffsetY, 0),
    heightPreset: ov.heightPreset || resolvePresetFromPx(heightPx, viewport),
    heightPx,
    borderRadiusPx: clampNumber(ov.borderRadiusPx ?? config.layout.borderRadiusPx, 0, 80, config.layout.borderRadiusPx),
    marginHorizontalPx: clampNumber(ov.marginHorizontalPx ?? (viewport === "mobile" ? Math.min(16, config.layout.marginHorizontalPx) : config.layout.marginHorizontalPx), 0, 64, 0),
    marginVerticalPx: clampNumber(ov.marginVerticalPx ?? config.layout.marginVerticalPx, 0, 64, 0),
    innerPaddingPx: clampNumber(ov.innerPaddingPx ?? defaultPadding, 14, 80, defaultPadding),
    textPosition9: ov.textPosition9 || config.layout.textPosition9,
    textAlign: ov.textAlign || config.layout.textAlign,
    textBlockMarginX: clampNumber(ov.textBlockMarginX ?? (viewport === "mobile" ? Math.min(12, config.layout.textBlockMarginX) : config.layout.textBlockMarginX), 0, 64, 0),
    textBlockMarginY: clampNumber(ov.textBlockMarginY ?? (viewport === "mobile" ? Math.min(12, config.layout.textBlockMarginY) : config.layout.textBlockMarginY), 0, 64, 0),
    titleSizePx,
    titleSizeToken: ov.titleSizeToken || titlePxToToken(titleSizePx),
    subtitleSizePx: clampNumber(ov.subtitleSizePx ?? defaultSubtitlePx, 12, 24, defaultSubtitlePx),
    buttonSize: ov.buttonSize || config.button.size,
    titleMaxWidthPx: viewport === "mobile" ? Math.min(340, config.typography.titleMaxWidthPx) : config.typography.titleMaxWidthPx,
    subtitleMaxWidthPx: viewport === "mobile" ? Math.min(320, config.typography.subtitleMaxWidthPx) : config.typography.subtitleMaxWidthPx,
    textVerticalGapPx: viewport === "mobile" ? Math.min(14, config.typography.textVerticalGapPx) : config.typography.textVerticalGapPx,
  };
}

export function buildCinematicOverlayCss(
  overlay: CinematicOverlayConfig,
  textPosition9: HeroTextPosition9,
  customOverlayColor?: string
): { bannerOverlayBackground?: string; textScrimBackground?: string } {
  const alpha = Number((clampNumber(overlay.intensity, 0, 80, 0) / 100).toFixed(2));
  if (overlay.preset === "none" || alpha <= 0) return {};

  const tint = (a: number) => hexToRgba(customOverlayColor, a, [10, 12, 16]);

  if (overlay.zone === "text-only") {
    const softAlpha = Number((alpha * 0.52).toFixed(2));
    return {
      textScrimBackground: `radial-gradient(125% 125% at 50% 50%, ${tint(alpha)} 0%, ${tint(softAlpha)} 68%, ${tint(0)} 100%)`,
    };
  }

  const dir = overlay.direction;
  const edgeStop = overlay.zone === "directional-edge" ? "58%" : "88%";
  const midAlpha = Number((alpha * 0.45).toFixed(2));
  if (dir === "radial") {
    const cx = textPosition9.endsWith("left") ? "22%" : textPosition9.endsWith("right") ? "78%" : "50%";
    const cy = textPosition9.startsWith("top") ? "22%" : textPosition9.startsWith("bottom") ? "78%" : "50%";
    return {
      bannerOverlayBackground: `radial-gradient(circle at ${cx} ${cy}, ${tint(alpha)} 0%, ${tint(midAlpha)} 42%, ${tint(0)} ${edgeStop})`,
    };
  }

  const angle = dir === "bottom-up" ? "to top" : dir === "top-down" ? "to bottom" : dir === "right-left" ? "to left" : "to right";
  return {
    bannerOverlayBackground: `linear-gradient(${angle}, ${tint(alpha)} 0%, ${tint(midAlpha)} 38%, ${tint(0)} ${edgeStop})`,
  };
}

export function computeCinematicContrastAudit(config: CinematicBannerConfig): CinematicContrastAudit {
  const intensity = clampNumber(config.overlay.intensity, 0, 80, 0);
  const effectiveScrimHex = intensity >= 55 ? "#14161B" : intensity >= 35 ? "#2A2E37" : intensity >= 18 ? "#525866" : "#8A909E";
  const titleRatio = Number(getWcagContrastRatio(effectiveScrimHex, config.colors.titleColor || "#FFFFFF").toFixed(2));
  const btnBg = config.button.shape === "outline" || config.button.shape === "minimal" ? effectiveScrimHex : config.colors.buttonBgColor || "#FFFFFF";
  const buttonRatio = Number(getWcagContrastRatio(btnBg, config.colors.buttonTextColor || "#111827").toFixed(2));

  const isTitleAccessible = titleRatio >= 3.0 && (intensity >= 22 || config.colors.titleColor.toUpperCase() === "#111827");
  const isButtonAccessible = buttonRatio >= 4.5;

  if (!isTitleAccessible || !isButtonAccessible) {
    return {
      titleContrastRatio: titleRatio,
      buttonContrastRatio: buttonRatio,
      isTitleAccessible,
      isButtonAccessible,
      level: "LOW",
      warningMessage: !isTitleAccessible
        ? `Lisibilité du titre perfectible (${titleRatio}:1 sur photographie). Activez un voile localisé doux (≥ 35 %) ou ajustez la couleur du titre.`
        : `Contraste du bouton faible (${buttonRatio}:1). Ajustez le couple fond/texte du bouton (recommandé ≥ 4.5:1).`,
      suggestedPatch: {
        overlay: !isTitleAccessible ? { preset: "medium", intensity: Math.max(42, intensity), zone: "text-only" } : undefined,
        colors: {
          titleColor: "#FFFFFF",
          subtitleColor: "#F4F4F5",
          ...(!isButtonAccessible ? { buttonBgColor: "#FFFFFF", buttonTextColor: "#111827", buttonBorderColor: "#FFFFFF" } : {}),
        },
      },
    };
  }

  return {
    titleContrastRatio: titleRatio,
    buttonContrastRatio: buttonRatio,
    isTitleAccessible: true,
    isButtonAccessible: true,
    level: titleRatio >= 4.5 && buttonRatio >= 7 ? "AAA" : "AA",
    warningMessage: null,
    suggestedPatch: {},
  };
}

export function buildHeroSettingsPatchFromCinematic(
  nextConfig: CinematicBannerConfig,
  currentSettings: Record<string, unknown> = {},
  resetDevice?: "tablet" | "mobile"
): Record<string, unknown> {
  const pcState = resolveCinematicDeviceState(nextConfig, "desktop");
  const tabOv = nextConfig.responsive.tablet || {};
  const mobOv = nextConfig.responsive.mobile || {};
  const hasTabOv = resetDevice !== "tablet" && Object.values(tabOv).some((v) => v !== undefined && v !== "");
  const hasMobOv = resetDevice !== "mobile" && Object.values(mobOv).some((v) => v !== undefined && v !== "");
  const tabState = resolveCinematicDeviceState(nextConfig, "tablet");
  const mobState = resolveCinematicDeviceState(nextConfig, "mobile");

  const toLegacyBoxWidth = (w: number): 360 | 480 | 620 => (w <= 390 ? 360 : w <= 540 ? 480 : 620);
  const toLegacyGap = (g: number): 8 | 16 | 24 => (g <= 11 ? 8 : g <= 19 ? 16 : 24);
  const toDevCfg = (st: CinematicResolvedDeviceState): HeroDeviceMeasureConfig => ({
    styleId: "cinema-full", heightPx: st.heightPx, innerPaddingPx: st.innerPaddingPx,
    borderRadiusPx: st.borderRadiusPx, textPosition9: st.textPosition9, textAlign: st.textAlign,
    titleSize: st.titleSizeToken, textBoxMaxWidth: toLegacyBoxWidth(st.titleMaxWidthPx),
    textVerticalGap: toLegacyGap(st.textVerticalGapPx), focalX: st.focalX, focalY: st.focalY,
    zoom: Math.min(1.6, st.zoom),
  });

  return {
    ...currentSettings,
    heroLayout: "cinema-full",
    title: nextConfig.title,
    subtitle: nextConfig.subtitle,
    showSubtitle: Boolean(nextConfig.subtitle.trim()),
    showBadge: false,
    badgeText: "",
    showSecondaryCta: false,
    secondaryCtaText: "",
    imageUrl: nextConfig.image.src,
    backgroundImage: nextConfig.image.src,
    imageAlt: nextConfig.image.alt,
    imageFit: nextConfig.image.fit,
    imagePositionDesktop: `${pcState.focalX}% ${pcState.focalY}%`,
    imageZoomDesktop: pcState.zoom,
    containerMode: nextConfig.layout.widthMode,
    heightPx: pcState.heightPx,
    borderRadiusPx: pcState.borderRadiusPx,
    innerPaddingPx: pcState.innerPaddingPx,
    textPosition9: pcState.textPosition9,
    textAlignment: pcState.textAlign,
    titleFontFamily: nextConfig.typography.titleFontFamily,
    titleSizeDesktop: pcState.titleSizeToken,
    textBoxMaxWidth: toLegacyBoxWidth(pcState.titleMaxWidthPx),
    textVerticalGap: toLegacyGap(pcState.textVerticalGapPx),
    showCompositionGuides: nextConfig.layout.showCompositionGuides,
    titleColor: nextConfig.colors.titleColor,
    subtitleColor: nextConfig.colors.subtitleColor,
    bannerBgColor: nextConfig.colors.backdropColor,
    overlayOpacity: Math.min(60, nextConfig.overlay.intensity),
    showCta: true,
    ctaText: nextConfig.button.text,
    ctaStyle: mapShapeToLegacyCtaStyle(nextConfig.button.shape),
    ctaButtonSize: nextConfig.button.size,
    ctaBgColor: nextConfig.colors.buttonBgColor,
    ctaTextColor: nextConfig.colors.buttonTextColor,
    ctaBorderColor: nextConfig.colors.buttonBorderColor,
    ctaBorderRadiusPx: nextConfig.button.borderRadiusPx,
    ctaBorderWidthPx: nextConfig.button.borderWidthPx,
    ctaShowArrow: nextConfig.button.showArrow,
    ctaTargetType: nextConfig.button.targetType,
    ctaTargetCategory: nextConfig.button.targetCategory,
    ctaTargetProductId: nextConfig.button.targetProductId,
    ctaLink: nextConfig.button.href,
    heroDesktopConfig: toDevCfg(pcState),
    heroTabletConfig: hasTabOv ? toDevCfg(tabState) : undefined,
    heroMobileConfig: hasMobOv ? toDevCfg(mobState) : undefined,
    cinematicConfig: {
      ...nextConfig,
      responsive: {
        desktop: nextConfig.responsive.desktop,
        tablet: resetDevice === "tablet" ? {} : nextConfig.responsive.tablet,
        mobile: resetDevice === "mobile" ? {} : nextConfig.responsive.mobile,
      },
    },
  };
}
