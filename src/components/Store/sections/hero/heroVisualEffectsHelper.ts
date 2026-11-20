import React from "react";
import { CustomPageTheme, HeroBannerSettings, HeroImageFilterPreset } from "../../../../domains/seller/customPage.types";
import { ResolvedHeroDeviceProfile } from "./heroResponsiveHelper";

export const HERO_FILTER_PRESET_VALUES: Record<
  HeroImageFilterPreset,
  { brightness: number; contrast: number; saturation: number; sepia: number; blur: number }
> = {
  none: { brightness: 100, contrast: 100, saturation: 100, sepia: 0, blur: 0 },
  "warm-editorial": { brightness: 103, contrast: 104, saturation: 108, sepia: 14, blur: 0 },
  "vivid-contrast": { brightness: 102, contrast: 114, saturation: 118, sepia: 0, blur: 0 },
  "bw-art": { brightness: 104, contrast: 116, saturation: 0, sepia: 0, blur: 0 },
  "soft-matte": { brightness: 105, contrast: 92, saturation: 90, sepia: 6, blur: 0 },
  "golden-film": { brightness: 102, contrast: 106, saturation: 112, sepia: 24, blur: 0 },
};

export function resolveHeroBorderRadiusCss(settings: HeroBannerSettings, profile: ResolvedHeroDeviceProfile): string {
  const isFloating = Boolean(settings.bannerFloating);
  const rawBase = profile.borderRadiusPx ?? settings.borderRadiusPx ?? 16;
  const base = isFloating && rawBase === 0 && settings.borderRadiusPx === undefined ? 24 : rawBase;
  if (!settings.usePerCornerRadius) return `${base}px`;
  const tl = typeof settings.borderRadiusTlPx === "number" ? settings.borderRadiusTlPx : base;
  const tr = typeof settings.borderRadiusTrPx === "number" ? settings.borderRadiusTrPx : base;
  const br = typeof settings.borderRadiusBrPx === "number" ? settings.borderRadiusBrPx : base;
  const bl = typeof settings.borderRadiusBlPx === "number" ? settings.borderRadiusBlPx : base;
  return `${tl}px ${tr}px ${br}px ${bl}px`;
}

export function resolveHeroBorderCss(settings: HeroBannerSettings, isEdgeToEdge = false): string {
  if (typeof settings.bannerBorderWidthPx === "number") {
    if (settings.bannerBorderWidthPx <= 0) return "none";
    return `${settings.bannerBorderWidthPx}px solid ${settings.bannerBorderColor || "rgba(15, 23, 42, 0.14)"}`;
  }
  if (settings.bannerBorderColor) return `1px solid ${settings.bannerBorderColor}`;
  return isEdgeToEdge ? "none" : "1px solid rgba(15, 23, 42, 0.08)";
}

export function resolveHeroBackgroundStyle(
  settings: HeroBannerSettings,
  theme?: CustomPageTheme,
  defaultFallback?: string
): React.CSSProperties {
  const baseBg =
    settings.bannerBgColor || defaultFallback || theme?.surfaceColor || theme?.canvasColor || "var(--store-surface, #FFFFFF)";
  if (settings.useCornerColors) {
    const tl = settings.cornerColorTl || baseBg;
    const tr = settings.cornerColorTr || baseBg;
    const br = settings.cornerColorBr || baseBg;
    const bl = settings.cornerColorBl || baseBg;
    return {
      backgroundColor: baseBg,
      backgroundImage: [
        `radial-gradient(circle at 0% 0%, ${tl} 0%, transparent 62%)`,
        `radial-gradient(circle at 100% 0%, ${tr} 0%, transparent 62%)`,
        `radial-gradient(circle at 100% 100%, ${br} 0%, transparent 62%)`,
        `radial-gradient(circle at 0% 100%, ${bl} 0%, transparent 62%)`,
      ].join(", "),
    };
  }
  if (settings.bannerBgGradient) return { background: settings.bannerBgGradient, backgroundColor: baseBg };
  return { backgroundColor: baseBg };
}

function parseColorToRgbTuple(rawColor?: string): [number, number, number] | null {
  if (!rawColor || typeof rawColor !== "string") return null;
  const trimmed = rawColor.trim();
  const hexMatch = trimmed.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3) {
      return [parseInt(hex[0] + hex[0], 16), parseInt(hex[1] + hex[1], 16), parseInt(hex[2] + hex[2], 16)];
    }
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  }
  const rgbMatch = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  return rgbMatch ? [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])] : null;
}

export function hexToRgba(
  color: string | undefined,
  alpha: number,
  fallbackRgb: [number, number, number] = [15, 23, 42]
): string {
  const rgb = parseColorToRgbTuple(color) || fallbackRgb;
  const clampedAlpha = Math.min(1, Math.max(0, alpha)).toFixed(2);
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${clampedAlpha})`;
}

function isNearMonochromeExtreme(rgb: [number, number, number]): boolean {
  const [r, g, b] = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max < 42 || (min > 235 && max - min < 16);
}

export function resolveHeroShadowAccentColor(
  settings: HeroBannerSettings,
  theme?: CustomPageTheme,
  isGlow = false
): string {
  if (settings.bannerShadowColor && parseColorToRgbTuple(settings.bannerShadowColor)) {
    return settings.bannerShadowColor;
  }
  const candidates = [
    settings.ctaBgColor, settings.badgeBgColor, settings.bannerBorderColor,
    theme?.accentColor, theme?.primaryColor, settings.bannerBgColor,
  ];
  if (isGlow) {
    for (const c of candidates) {
      const rgb = parseColorToRgbTuple(c);
      if (rgb && !isNearMonochromeExtreme(rgb)) return c as string;
    }
    return theme?.accentColor && parseColorToRgbTuple(theme.accentColor) ? theme.accentColor : "#6366F1";
  }
  for (const c of candidates) {
    if (c && parseColorToRgbTuple(c)) return c;
  }
  return theme?.primaryColor || "#0F172A";
}

export function resolveHeroBoxShadowCss(
  shadowToken?: string,
  accentColor = "#0F172A",
  customShadowColor?: string,
  shadowEnabled = true
): string | undefined {
  if (!shadowEnabled || !shadowToken || shadowToken === "none") return undefined;
  const hasCustom = Boolean(customShadowColor && parseColorToRgbTuple(customShadowColor));
  const baseColor = hasCustom ? (customShadowColor as string) : "#0F172A";
  const boost = hasCustom ? 1.45 : 1;

  switch (shadowToken) {
    case "sm":
      return `0 4px 12px -2px ${hexToRgba(baseColor, 0.14 * boost)}, 0 2px 6px -1px ${hexToRgba(baseColor, 0.08 * boost)}`;
    case "md":
      return `0 10px 26px -4px ${hexToRgba(baseColor, 0.18 * boost)}, 0 4px 10px -2px ${hexToRgba(baseColor, 0.10 * boost)}`;
    case "lg":
      return `0 20px 40px -8px ${hexToRgba(baseColor, 0.24 * boost)}, 0 8px 16px -4px ${hexToRgba(baseColor, 0.12 * boost)}`;
    case "xl":
    case "floating":
      return `0 28px 56px -12px ${hexToRgba(baseColor, 0.30 * boost)}, 0 12px 24px -6px ${hexToRgba(baseColor, 0.16 * boost)}`;
    case "glow": {
      const source = hasCustom ? (customShadowColor as string) : accentColor;
      const rgb = parseColorToRgbTuple(source);
      const glowColor = hasCustom ? source : rgb && !isNearMonochromeExtreme(rgb) ? source : "#6366F1";
      return `0 0 0 3px ${hexToRgba(glowColor, 0.32)}, 0 14px 36px -4px ${hexToRgba(glowColor, 0.48)}, 0 4px 16px 0px ${hexToRgba(glowColor, 0.28)}`;
    }
    case "brutal": {
      const brutalColor = hasCustom ? (customShadowColor as string) : parseColorToRgbTuple(accentColor) ? accentColor : "#0F172A";
      return `6px 6px 0px 0px ${brutalColor}`;
    }
    default:
      return undefined;
  }
}

export function resolveBannerEffectiveShadow(settings: HeroBannerSettings, theme?: CustomPageTheme): string | undefined {
  if (settings.bannerShadowEnabled === false) return undefined;
  const token =
    settings.bannerShadow && settings.bannerShadow !== "none"
      ? settings.bannerShadow
      : settings.bannerFloating && settings.bannerShadow !== "none" ? "floating" : undefined;
  if (!token) return undefined;
  return resolveHeroBoxShadowCss(token, resolveHeroShadowAccentColor(settings, theme, token === "glow"), settings.bannerShadowColor, true);
}

export function resolveHeroTextShadowCss(textShadow?: HeroBannerSettings["textShadow"] | "soft" | "strong"): string | undefined {
  if (textShadow === "sm" || textShadow === "soft") return "0 1px 4px rgba(0, 0, 0, 0.32)";
  if (textShadow === "md") return "0 2px 8px rgba(0, 0, 0, 0.42)";
  if (textShadow === "lg" || textShadow === "strong") return "0 4px 16px rgba(0, 0, 0, 0.62)";
  return undefined;
}

export function resolveHeroImageFilterCss(settings: HeroBannerSettings): string | undefined {
  const preset = settings.imageFilterPreset || "none";
  const isNeutralSliders =
    (settings.imageBrightness === undefined || settings.imageBrightness === 100) &&
    (settings.imageContrast === undefined || settings.imageContrast === 100) &&
    (settings.imageSaturation === undefined || settings.imageSaturation === 100) &&
    (settings.imageSepia === undefined || settings.imageSepia === 0);

  const spec = HERO_FILTER_PRESET_VALUES[preset] || HERO_FILTER_PRESET_VALUES.none;
  const usePreset = preset !== "none" && isNeutralSliders;
  const brightness = usePreset ? spec.brightness : (settings.imageBrightness ?? 100);
  const contrast = usePreset ? spec.contrast : (settings.imageContrast ?? 100);
  const saturation = usePreset ? spec.saturation : (settings.imageSaturation ?? 100);
  const sepia = usePreset ? spec.sepia : (settings.imageSepia ?? 0);
  const blur = typeof settings.imageBlurPx === "number" ? settings.imageBlurPx : 0;

  const parts: string[] = [];
  if (brightness !== 100) parts.push(`brightness(${brightness}%)`);
  if (contrast !== 100) parts.push(`contrast(${contrast}%)`);
  if (saturation !== 100) parts.push(`saturate(${saturation}%)`);
  if (sepia > 0) parts.push(`sepia(${sepia}%)`);
  if (blur > 0) parts.push(`blur(${blur}px)`);
  return parts.length > 0 ? parts.join(" ") : undefined;
}
