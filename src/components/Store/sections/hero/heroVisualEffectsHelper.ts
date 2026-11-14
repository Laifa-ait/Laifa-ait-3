import React from "react";
import {
  CustomPageTheme,
  HeroBannerSettings,
} from "../../../../domains/seller/customPage.types";
import { ResolvedHeroDeviceProfile } from "./heroResponsiveHelper";

/**
 * Calcule le rayon des 4 coins (uniforme ou indépendant par coin : Haut-Gauche, Haut-Droite, Bas-Droite, Bas-Gauche).
 */
export function resolveHeroBorderRadiusCss(
  settings: HeroBannerSettings,
  profile: ResolvedHeroDeviceProfile
): string {
  const base = profile.borderRadiusPx ?? settings.borderRadiusPx ?? 24;
  const hasPerCorner =
    Boolean(settings.usePerCornerRadius) ||
    typeof settings.borderRadiusTlPx === "number" ||
    typeof settings.borderRadiusTrPx === "number" ||
    typeof settings.borderRadiusBrPx === "number" ||
    typeof settings.borderRadiusBlPx === "number";

  if (!hasPerCorner) {
    return `${base}px`;
  }

  const tl = typeof settings.borderRadiusTlPx === "number" ? settings.borderRadiusTlPx : base;
  const tr = typeof settings.borderRadiusTrPx === "number" ? settings.borderRadiusTrPx : base;
  const br = typeof settings.borderRadiusBrPx === "number" ? settings.borderRadiusBrPx : base;
  const bl = typeof settings.borderRadiusBlPx === "number" ? settings.borderRadiusBlPx : base;
  return `${tl}px ${tr}px ${br}px ${bl}px`;
}

/**
 * Calcule le fond de la bannière :
 * - Mesh 4 Coins (si activé ou si des couleurs de coins sont définies)
 * - Dégradé de palette (si bannerBgGradient est défini)
 * - Couleur unie héritée du thème global sans code en dur
 */
export function resolveHeroBackgroundStyle(
  settings: HeroBannerSettings,
  theme?: CustomPageTheme,
  defaultFallback?: string
): React.CSSProperties {
  const baseBg =
    settings.bannerBgColor ||
    defaultFallback ||
    theme?.surfaceColor ||
    theme?.canvasColor ||
    "var(--store-surface, #FFFFFF)";

  const hasCornerColors =
    Boolean(settings.useCornerColors) ||
    Boolean(settings.cornerColorTl) ||
    Boolean(settings.cornerColorTr) ||
    Boolean(settings.cornerColorBr) ||
    Boolean(settings.cornerColorBl);

  if (hasCornerColors) {
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

  if (settings.bannerBgGradient) {
    return {
      background: settings.bannerBgGradient,
      backgroundColor: baseBg,
    };
  }

  return { backgroundColor: baseBg };
}

/**
 * Calcule l'ombre portée CSS (Bannière, Cadre Photo ou Bouton CTA).
 */
export function resolveHeroBoxShadowCss(
  shadowToken?: string,
  accentColor = "#111827"
): string | undefined {
  switch (shadowToken) {
    case "sm":
      return "0 2px 8px -2px rgba(15, 23, 42, 0.08)";
    case "md":
      return "0 8px 20px -4px rgba(15, 23, 42, 0.12)";
    case "lg":
      return "0 16px 32px -8px rgba(15, 23, 42, 0.18)";
    case "xl":
    case "floating":
      return "0 24px 48px -12px rgba(15, 23, 42, 0.25)";
    case "glow":
      return `0 10px 28px -4px ${accentColor}55`;
    case "brutal":
      return `5px 5px 0px 0px ${accentColor}`;
    case "none":
    default:
      return undefined;
  }
}

/**
 * Calcule l'ombre du texte (Titre / Phrase).
 */
export function resolveHeroTextShadowCss(
  textShadow?: HeroBannerSettings["textShadow"] | "soft" | "strong"
): string | undefined {
  switch (textShadow) {
    case "sm":
    case "soft":
      return "0 1px 4px rgba(0, 0, 0, 0.32)";
    case "md":
      return "0 2px 8px rgba(0, 0, 0, 0.42)";
    case "lg":
    case "strong":
      return "0 4px 16px rgba(0, 0, 0, 0.62)";
    case "none":
    default:
      return undefined;
  }
}

/**
 * Calcule la chaîne CSS `filter` appliquée à la photographie de la bannière.
 */
export function resolveHeroImageFilterCss(settings: HeroBannerSettings): string | undefined {
  const preset = settings.imageFilterPreset || "none";
  let brightness = typeof settings.imageBrightness === "number" ? settings.imageBrightness : 100;
  let contrast = typeof settings.imageContrast === "number" ? settings.imageContrast : 100;
  let saturation = typeof settings.imageSaturation === "number" ? settings.imageSaturation : 100;
  let sepia = typeof settings.imageSepia === "number" ? settings.imageSepia : 0;
  const blur = typeof settings.imageBlurPx === "number" ? settings.imageBlurPx : 0;

  if (
    preset !== "none" &&
    settings.imageBrightness === undefined &&
    settings.imageContrast === undefined &&
    settings.imageSaturation === undefined &&
    settings.imageSepia === undefined
  ) {
    if (preset === "warm-editorial") {
      brightness = 103;
      contrast = 104;
      saturation = 108;
      sepia = 14;
    } else if (preset === "vivid-contrast") {
      brightness = 102;
      contrast = 114;
      saturation = 118;
      sepia = 0;
    } else if (preset === "bw-art") {
      brightness = 104;
      contrast = 116;
      saturation = 0;
      sepia = 0;
    } else if (preset === "soft-matte") {
      brightness = 105;
      contrast = 92;
      saturation = 90;
      sepia = 6;
    } else if (preset === "golden-film") {
      brightness = 102;
      contrast = 106;
      saturation = 112;
      sepia = 24;
    }
  }

  const parts: string[] = [];
  if (brightness !== 100) parts.push(`brightness(${brightness}%)`);
  if (contrast !== 100) parts.push(`contrast(${contrast}%)`);
  if (saturation !== 100) parts.push(`saturate(${saturation}%)`);
  if (sepia > 0) parts.push(`sepia(${sepia}%)`);
  if (blur > 0) parts.push(`blur(${blur}px)`);

  return parts.length > 0 ? parts.join(" ") : undefined;
}
