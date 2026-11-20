import type { CustomPageTheme } from "../../../domains/seller/customPage.types";
import { DEFAULT_MODERN_THEME } from "../../../pages/Seller/StoreBuilder/constants/studioThemeDefaults";

function extractHexCandidate(rawColor?: string): string | null {
  if (!rawColor || typeof rawColor !== "string") return null;
  const trimmed = rawColor.trim();
  const varFallbackMatch = trimmed.match(/var\([^,]+,\s*(#[0-9a-fA-F]{3,6})\s*\)/);
  const candidate = varFallbackMatch ? varFallbackMatch[1] : trimmed;
  let hex = candidate.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((part) => part + part)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  return hex;
}

export function isValidThemeColor(color?: string): boolean {
  return extractHexCandidate(color) !== null;
}

export function getRelativeLuminance(color?: string): number | null {
  const hex = extractHexCandidate(color);
  if (!hex) return null;
  const channels = [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const linear = channels.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

export function isDarkColor(color?: string): boolean {
  const lum = getRelativeLuminance(color);
  return lum !== null ? lum < 0.179 : false;
}

export function readableTextColor(background?: string): string {
  const lum = getRelativeLuminance(background);
  if (lum === null) return "#0F172A";
  const contrastWithWhite = (0.955 + 0.05) / (lum + 0.05);
  const contrastWithDark = (lum + 0.05) / (0.015 + 0.05);
  return contrastWithDark >= contrastWithWhite ? "#0F172A" : "#F8FAFC";
}

export function getContrastRatio(foreground?: string, background?: string): number {
  const lumA = getRelativeLuminance(foreground);
  const lumB = getRelativeLuminance(background);
  if (lumA === null || lumB === null) return 0;
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

export interface ThemeContrastPairAudit {
  id: "canvas-text" | "surface-heading" | "button-cta" | "badge";
  label: string;
  foreground: string;
  background: string;
  ratio: number;
  minRatio: number;
  passes: boolean;
}

export function auditThemeContrastPairs(theme: CustomPageTheme): ThemeContrastPairAudit[] {
  const canvas = theme.canvasColor || DEFAULT_MODERN_THEME.canvasColor;
  const surface = theme.surfaceColor || DEFAULT_MODERN_THEME.surfaceColor;
  const primary = theme.primaryColor || DEFAULT_MODERN_THEME.primaryColor;
  const secondary = theme.secondaryColor || DEFAULT_MODERN_THEME.secondaryColor;
  const text = theme.textColor || secondary;
  const btnBg = theme.buttonColor || primary;
  const btnText = theme.buttonTextColor || readableTextColor(btnBg);
  const badgeBg = theme.accentBadgeColor || theme.accentColor || primary;
  const badgeText = theme.badgeTextColor || readableTextColor(badgeBg);

  const pairs: Array<Omit<ThemeContrastPairAudit, "ratio" | "passes">> = [
    { id: "canvas-text", label: "Texte / Fond de page", foreground: text, background: canvas, minRatio: 4.5 },
    { id: "surface-heading", label: "Titres / Cartes", foreground: secondary, background: surface, minRatio: 4.5 },
    { id: "button-cta", label: "Bouton CTA", foreground: btnText, background: btnBg, minRatio: 4.5 },
    { id: "badge", label: "Badge", foreground: badgeText, background: badgeBg, minRatio: 3.0 },
  ];

  return pairs.map((p) => {
    const valid = isValidThemeColor(p.foreground) && isValidThemeColor(p.background);
    const ratio = valid ? getContrastRatio(p.foreground, p.background) : 0;
    return { ...p, ratio, passes: valid && ratio >= p.minRatio };
  });
}

export function buildAutoFixedThemeColors(theme: CustomPageTheme): Partial<CustomPageTheme> {
  const audits = auditThemeContrastPairs(theme);
  const patch: Partial<CustomPageTheme> = {};
  for (const item of audits) {
    if (item.passes) continue;
    const safeBg = isValidThemeColor(item.background) ? item.background : DEFAULT_MODERN_THEME.canvasColor;
    const safeFg = readableTextColor(safeBg);
    if (item.id === "canvas-text") {
      if (!isValidThemeColor(item.background)) patch.canvasColor = safeBg;
      patch.textColor = safeFg;
    }
    if (item.id === "surface-heading") {
      if (!isValidThemeColor(item.background)) patch.surfaceColor = DEFAULT_MODERN_THEME.surfaceColor;
      patch.secondaryColor = safeFg;
    }
    if (item.id === "button-cta") {
      if (!isValidThemeColor(item.background)) patch.buttonColor = DEFAULT_MODERN_THEME.primaryColor;
      patch.buttonTextColor = readableTextColor(patch.buttonColor || safeBg);
    }
    if (item.id === "badge") {
      if (!isValidThemeColor(item.background)) patch.accentBadgeColor = DEFAULT_MODERN_THEME.primaryColor;
      patch.badgeTextColor = readableTextColor(patch.accentBadgeColor || safeBg);
    }
  }
  return patch;
}
