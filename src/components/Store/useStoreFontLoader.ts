import React, { useEffect } from "react";
import type { CustomPageTheme } from "../../domains/seller/customPage.types";

const GOOGLE_FONT_SPEC_MAP: Record<string, string> = {
  "Plus Jakarta Sans": "Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400",
  "Playfair Display": "Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,400;1,600",
  "Cormorant Garamond": "Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400;1,600",
  Outfit: "Outfit:wght@400;500;600;700;800",
  "DM Sans": "DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400",
  Cairo: "Cairo:wght@400;500;600;700;800",
  Amiri: "Amiri:ital,wght@0,400;0,700;1,400",
  Lora: "Lora:ital,wght@0,400;0,600;0,700;1,400",
  "Space Grotesk": "Space+Grotesk:wght@400;500;600;700",
  Fraunces: "Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,400",
};

export function extractGoogleFontFamilies(theme?: CustomPageTheme | null): string[] {
  if (!theme) return [];
  const rawSources = [
    theme.headingFontFamily,
    theme.bodyFontFamily,
    theme.fontFamily,
  ].filter((v): v is string => typeof v === "string" && v.trim().length > 0);

  const matched = new Set<string>();
  for (const raw of rawSources) {
    for (const fontName of Object.keys(GOOGLE_FONT_SPEC_MAP)) {
      if (raw.toLowerCase().includes(fontName.toLowerCase())) {
        matched.add(fontName);
      }
    }
  }
  return Array.from(matched);
}

/**
 * Charge dynamiquement par boutique uniquement les polices Google Fonts
 * sélectionnées pour le duo Titre (headingFontFamily) et Corps (bodyFontFamily).
 */
export function useStoreFontLoader(theme?: CustomPageTheme | null, scopeId = "storefront"): void {
  const headingFont = theme?.headingFontFamily || "";
  const bodyFont = theme?.bodyFontFamily || "";
  const baseFont = theme?.fontFamily || "";

  useEffect(() => {
    if (typeof document === "undefined") return;
    const families = extractGoogleFontFamilies(theme);
    if (families.length === 0) return;

    const queryFamilies = families
      .map((name) => GOOGLE_FONT_SPEC_MAP[name])
      .filter(Boolean)
      .map((spec) => `family=${spec}`)
      .join("&");

    if (!queryFamilies) return;

    const linkId = `olmart-dynamic-store-fonts-${scopeId}`;
    const href = `https://fonts.googleapis.com/css2?${queryFamilies}&display=swap`;

    let linkEl = document.getElementById(linkId) as HTMLLinkElement | null;
    if (!linkEl) {
      linkEl = document.createElement("link");
      linkEl.id = linkId;
      linkEl.rel = "stylesheet";
      document.head.appendChild(linkEl);
    }
    if (linkEl.href !== href) {
      linkEl.href = href;
    }
  }, [headingFont, bodyFont, baseFont, scopeId, theme]);
}

export function resolveHeadingFontStack(theme?: CustomPageTheme | null): string {
  return (
    theme?.headingFontFamily ||
    theme?.fontFamily ||
    "'Cormorant Garamond', 'Plus Jakarta Sans', system-ui, sans-serif"
  );
}

export function resolveBodyFontStack(theme?: CustomPageTheme | null): string {
  return (
    theme?.bodyFontFamily ||
    theme?.fontFamily ||
    "'Plus Jakarta Sans', system-ui, sans-serif"
  );
}

export function buildStoreThemeCssVariables(
  theme: CustomPageTheme,
  isDarkMode = false
): React.CSSProperties & Record<`--${string}`, string> {
  const primary = theme.primaryColor || "#B45309";
  const secondary = isDarkMode ? "#F8FAFC" : theme.secondaryColor || "#18181B";
  const accent = theme.accentColor || primary;
  const canvas = isDarkMode ? "#0F172A" : theme.canvasColor || "#FAF6F0";
  const surface = isDarkMode ? "#1E293B" : theme.surfaceColor || "#FFFFFF";
  const headingFont = resolveHeadingFontStack(theme);
  const bodyFont = resolveBodyFontStack(theme);
  const radiusPx = typeof theme.borderRadiusPx === "number" ? theme.borderRadiusPx : 16;
  const spacingYPx = typeof theme.spacingYPx === "number" ? theme.spacingYPx : 28;
  const titleSizePx = typeof theme.titleFontSizePx === "number" ? theme.titleFontSizePx : 36;
  const bodySizePx = typeof theme.bodyFontSizePx === "number" ? theme.bodyFontSizePx : 15;

  return {
    backgroundColor: canvas,
    color: secondary,
    fontFamily: bodyFont,
    fontSize: `${bodySizePx}px`,
    "--store-bg-60": canvas,
    "--store-surface-30": surface,
    "--store-accent-10": accent,
    "--store-primary": primary,
    "--store-secondary": secondary,
    "--store-accent": accent,
    "--store-canvas": canvas,
    "--store-surface": surface,
    "--store-border-radius": `${radiusPx}px`,
    "--store-spacing-y": `${spacingYPx}px`,
    "--store-title-size": `${titleSizePx}px`,
    "--store-body-size": `${bodySizePx}px`,
    "--store-font": bodyFont,
    "--store-font-heading": headingFont,
    "--store-font-body": bodyFont,
  };
}
