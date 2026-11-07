import React from "react";
import type {
  CustomPageSectionStyles,
  HeroBannerSettings,
} from "../../../domains/seller/customPage.types";
import type { ArtisticFrameShape } from "../../../types/studio.types";
import { CHAMFERED_POLYGON_CLIP } from "../ArtisticFrameWrapper";

export function getContrastingTextColor(hex?: string): string {
  if (!hex || !hex.startsWith("#")) return "#FFFFFF";
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.slice(0, 6);
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return "#FFFFFF";
  const luminance =
    (0.299 * ((num >> 16) & 255) + 0.587 * ((num >> 8) & 255) + 0.114 * (num & 255)) / 255;
  return luminance > 0.62 ? "#111827" : "#FFFFFF";
}

export function resolveHeroImageShadow(
  shadow: HeroBannerSettings["imageShadow"],
  accentColor: string
): {
  className: string;
  style?: React.CSSProperties;
  dropShadowStyle?: React.CSSProperties;
} {
  switch (shadow) {
    case "none":
      return { className: "shadow-none" };
    case "sm":
      return {
        className: "shadow-md shadow-slate-900/10",
        dropShadowStyle: { filter: "drop-shadow(0 4px 8px rgba(15,23,42,0.12))" },
      };
    case "md":
      return {
        className: "shadow-xl shadow-slate-900/15",
        dropShadowStyle: { filter: "drop-shadow(0 12px 22px rgba(15,23,42,0.18))" },
      };
    case "xl":
      return {
        className: "shadow-[0_32px_70px_-10px_rgba(15,23,42,0.35)]",
        dropShadowStyle: { filter: "drop-shadow(0 24px 36px rgba(15,23,42,0.32))" },
      };
    case "glow":
      return {
        className: "",
        style: {
          boxShadow: `0 22px 55px -8px ${accentColor}55, 0 8px 20px -4px ${accentColor}30`,
        },
        dropShadowStyle: {
          filter: `drop-shadow(0 16px 28px ${accentColor}66)`,
        },
      };
    case "brutal":
      return {
        className: "border-2 border-[#17191C] shadow-[7px_7px_0px_0px_#17191C]",
        dropShadowStyle: {
          filter: "drop-shadow(6px 6px 0px #17191C)",
        },
      };
    case "lg":
    default:
      return {
        className: "shadow-[0_22px_55px_rgba(15,23,42,0.14)]",
        dropShadowStyle: { filter: "drop-shadow(0 18px 32px rgba(15,23,42,0.18))" },
      };
  }
}

export function resolveHeroTextShadowStyle(
  textShadow?: HeroBannerSettings["textShadow"]
): React.CSSProperties {
  switch (textShadow) {
    case "sm":
      return { textShadow: "0 1px 3px rgba(15, 23, 42, 0.22)" };
    case "md":
      return { textShadow: "0 3px 12px rgba(15, 23, 42, 0.35)" };
    case "lg":
      return {
        textShadow: "0 6px 24px rgba(0, 0, 0, 0.55), 0 2px 6px rgba(0, 0, 0, 0.35)",
      };
    case "none":
    default:
      return {};
  }
}

export function resolveHeroTitleSizeClasses(
  desktop?: HeroBannerSettings["titleSizeDesktop"],
  mobile?: HeroBannerSettings["titleSizeMobile"]
): string {
  const mobMap: Record<string, string> = {
    sm: "text-xl @md:text-2xl",
    md: "text-2xl @md:text-3xl",
    lg: "text-3xl @md:text-4xl",
    xl: "text-4xl @md:text-5xl",
  };
  const deskMap: Record<string, string> = {
    sm: "@3xl:text-3xl @5xl:text-4xl",
    md: "@3xl:text-4xl @5xl:text-4xl",
    lg: "@3xl:text-4xl @5xl:text-5xl",
    xl: "@3xl:text-5xl @5xl:text-6xl",
  };
  return `${mobMap[mobile || "md"] || mobMap.md} ${deskMap[desktop || "lg"] || deskMap.lg}`;
}

export function resolveReadableHeroTextColor(
  customColor: string | undefined,
  sectionText: string,
  isDarkSection: boolean
): string {
  if (!customColor) return sectionText;
  const customContrast = getContrastingTextColor(customColor);
  const isCustomDarkText = customContrast === "#FFFFFF";
  if (isDarkSection && isCustomDarkText) return sectionText;
  if (!isDarkSection && !isCustomDarkText && customColor.toUpperCase() === "#FFFFFF") {
    return sectionText;
  }
  return customColor;
}

export function resolveHeroBadgeVisuals(
  settings: HeroBannerSettings,
  accentColor: string,
  defaultStyle: "solid" | "soft" | "outline" = "soft",
  isDarkSection = false
): { className: string; style: React.CSSProperties; dotColor: string } {
  const userBg = settings.badgeBgColor;
  const userText = settings.badgeTextColor;
  const effectiveStyle = settings.badgeStyle || (userBg ? "solid" : defaultStyle);
  const baseColor = userBg || accentColor;

  if (effectiveStyle === "solid") {
    const resolvedBg = !userBg && isDarkSection ? "#FFFFFF" : baseColor;
    const resolvedText = userText || getContrastingTextColor(resolvedBg);
    return {
      className: "rounded-full border border-transparent shadow-xs",
      style: { backgroundColor: resolvedBg, color: resolvedText },
      dotColor: resolvedText,
    };
  }

  if (effectiveStyle === "outline") {
    const resolvedStroke = !userBg && isDarkSection ? "#FFFFFF" : baseColor;
    const resolvedText = userText || (isDarkSection && !userBg ? "#FFFFFF" : baseColor);
    return {
      className: "rounded-full border-[1.5px] bg-transparent",
      style: { borderColor: resolvedStroke, color: resolvedText },
      dotColor: isDarkSection && !userBg ? "#FDE68A" : resolvedText,
    };
  }

  if (isDarkSection && !userBg) {
    return {
      className: "rounded-full border backdrop-blur-xs",
      style: {
        backgroundColor: "rgba(255, 255, 255, 0.16)",
        borderColor: "rgba(255, 255, 255, 0.38)",
        color: userText || "#FFFFFF",
      },
      dotColor: "#FDE68A",
    };
  }

  const resolvedText = userText || baseColor;
  return {
    className: "rounded-full border",
    style: {
      backgroundColor: `${baseColor}18`,
      borderColor: `${baseColor}45`,
      color: resolvedText,
    },
    dotColor: resolvedText,
  };
}

export function resolveHeroButtonVisuals(
  styleVariant: HeroBannerSettings["ctaStyle"],
  bgColor: string,
  textColor: string,
  shadowVariant?: HeroBannerSettings["ctaShadow"],
  hasCustomTextColor = false,
  isDarkSection = false
): { className: string; style: React.CSSProperties } {
  const effStyle = styleVariant || "pill";

  let shadowClass = "shadow-md hover:shadow-lg";
  let extraShadowStyle: React.CSSProperties = {};
  if (shadowVariant === "none") shadowClass = "shadow-none";
  else if (shadowVariant === "sm") shadowClass = "shadow-sm";
  else if (shadowVariant === "lg") shadowClass = "shadow-xl shadow-slate-900/20";
  else if (shadowVariant === "glow") {
    shadowClass = "";
    extraShadowStyle = {
      boxShadow: `0 12px 30px -4px ${bgColor}65, 0 4px 10px -2px ${bgColor}40`,
    };
  } else if (shadowVariant === "brutal") {
    shadowClass = "border-2 border-[#17191C] shadow-[4px_4px_0px_0px_#17191C]";
  }

  if (effStyle === "outline") {
    const outlineText = hasCustomTextColor && textColor ? textColor : bgColor;
    return {
      className: `rounded-full border-2 bg-transparent ${shadowClass}`,
      style: { borderColor: bgColor, color: outlineText, ...extraShadowStyle },
    };
  }

  if (effStyle === "glass") {
    const glassText =
      hasCustomTextColor && textColor ? textColor : isDarkSection ? "#FFFFFF" : bgColor;
    const glassBorder = isDarkSection ? "rgba(255,255,255,0.45)" : `${bgColor}55`;
    return {
      className: `rounded-full backdrop-blur-md border ${shadowClass}`,
      style: {
        backgroundColor: isDarkSection ? "rgba(255,255,255,0.16)" : `${bgColor}22`,
        borderColor: glassBorder,
        color: glassText,
        ...extraShadowStyle,
      },
    };
  }

  const shapeRadius =
    effStyle === "sharp" ? "rounded-none" : effStyle === "solid" ? "rounded-xl" : "rounded-full";
  return {
    className: `${shapeRadius} ${shadowClass}`,
    style: { backgroundColor: bgColor, color: textColor, ...extraShadowStyle },
  };
}

export function resolveHeroAspectClass(
  ratio?: HeroBannerSettings["imageAspectRatio"]
): string {
  if (ratio === "1/1") return "aspect-square";
  if (ratio === "3/4") return "aspect-[3/4]";
  if (ratio === "16/9") return "aspect-video";
  return "aspect-[4/5]";
}

export function resolveHeroFrameShapeVisuals(
  shape: ArtisticFrameShape,
  borderRadius?: CustomPageSectionStyles["borderRadius"]
): {
  frameClass: string;
  innerBorderClass: string;
  clipStyle?: React.CSSProperties;
  isPolaroid: boolean;
} {
  if (shape === "sharp-couture") {
    return { frameClass: "rounded-none border border-zinc-900/80", innerBorderClass: "rounded-none", isPolaroid: false };
  }
  if (shape === "chamfered-tech") {
    return { frameClass: "rounded-none", innerBorderClass: "rounded-none", clipStyle: { clipPath: CHAMFERED_POLYGON_CLIP }, isPolaroid: false };
  }
  if (shape === "medallion-oval") {
    return { frameClass: "rounded-[999px] ring-1 ring-[#C59B27]/40", innerBorderClass: "rounded-[999px]", isPolaroid: false };
  }
  if (shape === "polaroid-atelier") {
    return { frameClass: "p-3 pb-11 bg-white rounded-sm border border-slate-200/90", innerBorderClass: "rounded-none", isPolaroid: true };
  }
  if (shape === "soft-modern") {
    const radMap: Record<string, string> = { none: "rounded-none", sm: "rounded-xl", md: "rounded-3xl", lg: "rounded-[36px]" };
    return { frameClass: radMap[borderRadius || "md"] || "rounded-3xl", innerBorderClass: "rounded-2xl", isPolaroid: false };
  }
  return { frameClass: "rounded-t-[999px] rounded-b-2xl", innerBorderClass: "rounded-t-[999px] rounded-b-xl", isPolaroid: false };
}
