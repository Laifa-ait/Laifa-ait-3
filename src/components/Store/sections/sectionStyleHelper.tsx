import React from "react";
import { CustomPageSectionStyles, CustomPageTheme, HeroBannerSettings } from "../../../domains/seller/customPage.types";
import {
  resolveHeroBoxShadowCss,
  resolveHeroImageFilterCss,
} from "./hero/heroVisualEffectsHelper";
import { readableTextColor } from "./themeColorUtils";
import { DEFAULT_MODERN_THEME } from "../../../pages/Seller/StoreBuilder/constants/studioThemeDefaults";

export function resolveSectionPaddingY(
  paddingY?: "sm" | "md" | "lg" | "xl" | number,
  themeSpacingYPx?: number
): number {
  if (typeof paddingY === "number") return paddingY;
  const baseSpacing = typeof themeSpacingYPx === "number" ? themeSpacingYPx : 32;
  const scaleMap: Record<string, number> = {
    sm: Math.max(8, Math.round(baseSpacing * 0.55)),
    md: baseSpacing,
    lg: Math.round(baseSpacing * 1.45),
    xl: Math.round(baseSpacing * 1.9),
  };
  return scaleMap[paddingY || "md"] ?? baseSpacing;
}

export function resolveSectionPaddingX(paddingX?: number): number {
  return typeof paddingX === "number" ? paddingX : 20;
}

export function resolveBorderRadiusClass(radius?: "none" | "sm" | "md" | "lg" | "full"): string {
  if (radius === "none") return "rounded-none";
  if (radius === "sm") return "rounded-lg";
  if (radius === "lg") return "rounded-3xl";
  if (radius === "full") return "rounded-full";
  return "rounded-[var(--store-border-radius,16px)]";
}

export function resolveSectionBorderRadiusCss(
  styles: CustomPageSectionStyles = {},
  fallbackRadiusPx?: number
): string | undefined {
  const tokenPx =
    styles.borderRadius === "none" ? 0 : styles.borderRadius === "sm" ? 12 : styles.borderRadius === "md" ? 24 : styles.borderRadius === "lg" || styles.borderRadius === "full" ? 40 : undefined;
  if (styles.usePerCornerRadius) {
    const base = fallbackRadiusPx ?? tokenPx ?? 16;
    const [tl, tr, br, bl] = [styles.borderRadiusTlPx, styles.borderRadiusTrPx, styles.borderRadiusBrPx, styles.borderRadiusBlPx].map((v) => Math.max(0, Math.min(80, v ?? base)));
    return `${tl}px ${tr}px ${br}px ${bl}px`;
  }
  return tokenPx !== undefined ? `${tokenPx}px` : undefined;
}

export function resolveShadowClass(
  shadow?: "none" | "sm" | "md" | "lg" | "xl" | "floating" | "glow" | "brutal"
): string {
  switch (shadow) {
    case "sm": return "shadow-sm";
    case "md": return "shadow-md";
    case "lg":
    case "xl": return "shadow-lg";
    case "floating": return "shadow-xl shadow-slate-900/10";
    case "glow": return "shadow-lg ring-1 ring-[var(--store-primary,#0F172A)]/30";
    case "brutal": return "border-2 border-[var(--store-secondary,#1E293B)] shadow-[5px_5px_0px_0px_var(--store-secondary,#1E293B)]";
    case "none":
    default: return "";
  }
}

export function resolveSectionImageFilterCss(
  styles: CustomPageSectionStyles = {},
  settings: Record<string, unknown> = {}
): string | undefined {
  const filterSettings: Partial<HeroBannerSettings> = {
    imageFilterPreset:
      (settings.imageFilterPreset as HeroBannerSettings["imageFilterPreset"]) ||
      styles.imageFilterPreset ||
      "none",
    imageBrightness: typeof settings.imageBrightness === "number" ? settings.imageBrightness : styles.imageBrightness,
    imageContrast: typeof settings.imageContrast === "number" ? settings.imageContrast : styles.imageContrast,
    imageSaturation: typeof settings.imageSaturation === "number" ? settings.imageSaturation : styles.imageSaturation,
    imageSepia: typeof settings.imageSepia === "number" ? settings.imageSepia : styles.imageSepia,
    imageBlurPx: typeof settings.imageBlurPx === "number" ? settings.imageBlurPx : styles.imageBlurPx,
  };
  return resolveHeroImageFilterCss(filterSettings as HeroBannerSettings);
}

export function resolveSectionButtonInlineStyle(
  styles: CustomPageSectionStyles = {},
  theme?: CustomPageTheme,
  settings: Record<string, unknown> = {}
): React.CSSProperties {
  const accent =
    (settings.buttonBgColor as string) ||
    styles.buttonBgColor ||
    theme?.buttonColor ||
    theme?.primaryColor ||
    "#18181B";
  const textColor =
    (settings.buttonTextColor as string) ||
    styles.buttonTextColor ||
    theme?.buttonTextColor ||
    readableTextColor(accent);
  const btnStyle = (settings.buttonStyle as string) || styles.buttonStyle || theme?.buttonStyle || "solid";
  const isOutline = btnStyle === "outline";
  const borderWidth =
    typeof settings.buttonBorderWidthPx === "number"
      ? settings.buttonBorderWidthPx
      : typeof styles.buttonBorderWidthPx === "number"
        ? styles.buttonBorderWidthPx
        : isOutline
          ? 2
          : 0;
  const borderColor = (settings.buttonBorderColor as string) || styles.buttonBorderColor || accent;
  const radiusPx =
    typeof settings.buttonBorderRadiusPx === "number"
      ? settings.buttonBorderRadiusPx
      : typeof styles.buttonBorderRadiusPx === "number"
        ? styles.buttonBorderRadiusPx
        : btnStyle === "pill"
          ? 999
          : btnStyle === "sharp"
            ? 0
            : typeof theme?.borderRadiusPx === "number"
              ? Math.min(20, theme.borderRadiusPx)
              : undefined;
  const shadowCss = resolveHeroBoxShadowCss(
    ((settings.buttonShadow as HeroBannerSettings["ctaShadow"]) || styles.buttonShadow) ?? "none",
    accent
  );

  return {
    backgroundColor: isOutline ? "transparent" : accent,
    color: isOutline ? accent : textColor,
    border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : undefined,
    borderRadius: typeof radiusPx === "number" ? `${radiusPx}px` : undefined,
    minHeight: typeof theme?.buttonHeightPx === "number" ? `${theme.buttonHeightPx}px` : undefined,
    boxShadow: shadowCss,
  };
}

export function resolveContainerWidthClass(width?: "contained" | "full" | "narrow"): string {
  if (width === "full") return "w-full";
  if (width === "narrow") return "max-w-3xl mx-auto";
  return "max-w-6xl mx-auto";
}

export function resolveAnimationClass(animation?: "none" | "fade" | "slide-up" | "zoom"): string {
  switch (animation) {
    case "fade": return "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500";
    case "slide-up": return "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500";
    case "zoom": return "motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-500";
    default: return "";
  }
}

export function buildSectionContainerStyle(
  styles: CustomPageSectionStyles = {},
  defaultBg = "transparent",
  defaultText = "var(--store-text, #17191C)",
  theme?: CustomPageTheme
): React.CSSProperties {
  const padY = resolveSectionPaddingY(styles.paddingY, theme?.spacingYPx);
  const bodySize = theme?.bodyFontSizePx;
  const bodyFont = theme?.bodyFontFamily || theme?.fontFamily;
  const baseBg = styles.backgroundColor || defaultBg;
  const perCornerRadius = resolveSectionBorderRadiusCss(styles, theme?.borderRadiusPx);
  const boxShadowCss = resolveHeroBoxShadowCss(styles.shadow, theme?.accentColor || theme?.primaryColor);
  const filterCss = resolveSectionImageFilterCss(styles);

  const cornerMeshBg =
    styles.useCornerColors &&
    (styles.cornerColorTl || styles.cornerColorTr || styles.cornerColorBr || styles.cornerColorBl)
      ? [
          `radial-gradient(circle at 0% 0%, ${styles.cornerColorTl || baseBg || "#F8FAFC"} 0%, transparent 62%)`,
          `radial-gradient(circle at 100% 0%, ${styles.cornerColorTr || baseBg || "#F1F5F9"} 0%, transparent 62%)`,
          `radial-gradient(circle at 100% 100%, ${styles.cornerColorBr || baseBg || "#E2E8F0"} 0%, transparent 62%)`,
          `radial-gradient(circle at 0% 100%, ${styles.cornerColorBl || baseBg || "#FFFFFF"} 0%, transparent 62%)`,
        ].join(", ")
      : undefined;

  const borderWidthPx =
    typeof styles.sectionBorderWidthPx === "number"
      ? Math.max(0, Math.min(8, styles.sectionBorderWidthPx))
      : styles.sectionBorderColor
        ? 1.5
        : 0;

  return {
    backgroundColor: baseBg,
    backgroundImage: cornerMeshBg,
    color: styles.textColor || theme?.textColor || defaultText,
    paddingTop: `${padY}px`,
    paddingBottom: `${padY}px`,
    paddingLeft: `${resolveSectionPaddingX(styles.paddingX)}px`,
    paddingRight: `${resolveSectionPaddingX(styles.paddingX)}px`,
    borderRadius: perCornerRadius,
    borderColor: borderWidthPx > 0 ? styles.sectionBorderColor || theme?.borderColor || "#E2E8F0" : undefined,
    borderWidth: borderWidthPx > 0 ? `${borderWidthPx}px` : undefined,
    borderStyle: borderWidthPx > 0 ? "solid" : undefined,
    boxShadow: boxShadowCss,
    fontSize: typeof bodySize === "number" ? `${bodySize}px` : "var(--store-body-size, 15px)",
    fontFamily: bodyFont || "var(--store-font-body, inherit)",
    "--section-heading-color": styles.headingColor || styles.textColor || theme?.secondaryColor || DEFAULT_MODERN_THEME.secondaryColor,
    "--section-subtitle-color": styles.subtitleColor || styles.textColor || theme?.mutedTextColor || "#64748B",
    "--section-kicker-color": styles.kickerColor || styles.iconColor || theme?.accentColor || theme?.primaryColor || DEFAULT_MODERN_THEME.accentColor,
    "--section-card-bg": styles.cardBgColor || theme?.surfaceColor || DEFAULT_MODERN_THEME.surfaceColor,
    "--section-card-text": styles.cardTextColor || styles.textColor || theme?.secondaryColor || DEFAULT_MODERN_THEME.secondaryColor,
    "--section-card-border": styles.cardBorderColor || theme?.borderColor || DEFAULT_MODERN_THEME.borderColor || "#E2E8F0",
    "--section-price-color": styles.priceColor || styles.cardTextColor || theme?.priceColor || theme?.secondaryColor || DEFAULT_MODERN_THEME.primaryColor,
    "--section-badge-bg": styles.badgeBgColor || theme?.accentBadgeColor || theme?.primaryColor || DEFAULT_MODERN_THEME.primaryColor,
    "--section-badge-text": styles.badgeTextColor || theme?.badgeTextColor || "#FFFFFF",
    "--section-icon-color": styles.iconColor || theme?.accentColor || theme?.primaryColor || DEFAULT_MODERN_THEME.accentColor,
    "--section-overlay-color": styles.overlayColor || "#000000",
    ...(filterCss ? ({ "--section-image-filter": filterCss } as React.CSSProperties) : {}),
  } as React.CSSProperties;
}

export const SectionDividerRenderer: React.FC<{
  divider?: "none" | "wave" | "slant" | "curve";
  color?: string;
  theme?: CustomPageTheme;
}> = ({ divider, color, theme }) => {
  if (!divider || divider === "none") return null;
  const fillColor = color || theme?.primaryColor || "var(--store-primary, #0F172A)";
  if (divider === "wave") {
    return (
      <div className="w-full overflow-hidden leading-none pointer-events-none pt-2 opacity-30">
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-5">
          <path d="M0,30 C300,60 600,0 900,30 C1050,45 1150,20 1200,30 L1200,60 L0,60 Z" fill={fillColor} />
        </svg>
      </div>
    );
  }
  if (divider === "slant") {
    return (
      <div className="w-full overflow-hidden leading-none pointer-events-none pt-2 opacity-30">
        <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="w-full h-4"><polygon points="0,40 1200,0 1200,40" fill={fillColor} /></svg>
      </div>
    );
  }
  if (divider === "curve") {
    return (
      <div className="w-full overflow-hidden leading-none pointer-events-none pt-2 opacity-30">
        <svg viewBox="0 0 1200 50" preserveAspectRatio="none" className="w-full h-5"><path d="M0,0 Q600,50 1200,0 L1200,50 L0,50 Z" fill={fillColor} /></svg>
      </div>
    );
  }
  return null;
};
