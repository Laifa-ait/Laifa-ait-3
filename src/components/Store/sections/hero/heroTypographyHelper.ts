import type React from "react";
import type { CustomPageTheme, HeroBannerSettings } from "../../../../domains/seller/customPage.types";
import type { StudioViewportDevice } from "../responsiveInheritanceHelper";
import type { ResolvedHeroDeviceProfile } from "./heroResponsiveHelper";

export interface HeroWordFontOption {
  id: string;
  label: string;
  category: string;
  cssFamily: string;
  googleSpec?: string;
}

export const HERO_WORD_FONT_OPTIONS: ReadonlyArray<HeroWordFontOption> = [
  { id: "theme", label: "Police du thème", category: "Défaut", cssFamily: "" },
  {
    id: "plus-jakarta",
    label: "Plus Jakarta Sans",
    category: "Moderne",
    cssFamily: "'Plus Jakarta Sans', sans-serif",
    googleSpec: "Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600",
  },
  {
    id: "playfair",
    label: "Playfair Display",
    category: "Classique",
    cssFamily: "'Playfair Display', Georgia, serif",
    googleSpec: "Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600;1,700",
  },
  {
    id: "cormorant",
    label: "Cormorant Garamond",
    category: "Luxe",
    cssFamily: "'Cormorant Garamond', Georgia, serif",
    googleSpec: "Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400;1,600",
  },
  {
    id: "archivo",
    label: "Archivo",
    category: "Épaisse",
    cssFamily: "'Archivo', 'Plus Jakarta Sans', sans-serif",
    googleSpec: "Archivo:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700",
  },
  {
    id: "outfit",
    label: "Outfit",
    category: "Géométrique",
    cssFamily: "'Outfit', sans-serif",
    googleSpec: "Outfit:wght@400;500;600;700;800",
  },
  {
    id: "dm-sans",
    label: "DM Sans",
    category: "Épurée",
    cssFamily: "'DM Sans', sans-serif",
    googleSpec: "DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400",
  },
  {
    id: "lora",
    label: "Lora",
    category: "Éditorial",
    cssFamily: "'Lora', Georgia, serif",
    googleSpec: "Lora:ital,wght@0,400;0,600;0,700;1,400;1,600",
  },
  {
    id: "cairo",
    label: "Cairo",
    category: "Arabe / FR",
    cssFamily: "'Cairo', sans-serif",
    googleSpec: "Cairo:wght@400;500;600;700;800",
  },
  {
    id: "amiri",
    label: "Amiri",
    category: "Calligraphie",
    cssFamily: "'Amiri', Georgia, serif",
    googleSpec: "Amiri:ital,wght@0,400;0,700;1,400;1,700",
  },
];

const LEGACY_FONT_MAP: Record<string, string> = {
  sans: "plus-jakarta",
  serif: "playfair",
  display: "archivo",
};

const LOADED_HERO_FONTS = new Set<string>();

export function normalizeHeroFontId(raw?: string): string {
  if (!raw || raw === "theme") return "theme";
  if (LEGACY_FONT_MAP[raw]) return LEGACY_FONT_MAP[raw];
  const exact = HERO_WORD_FONT_OPTIONS.find((opt) => opt.id === raw);
  if (exact) return exact.id;
  const byLabel = HERO_WORD_FONT_OPTIONS.find(
    (opt) => opt.id !== "theme" && raw.toLowerCase().includes(opt.label.toLowerCase())
  );
  return byLabel ? byLabel.id : "theme";
}

export function resolveHeroFontCss(fontId?: string, fallbackStack?: string): string {
  const normalized = normalizeHeroFontId(fontId);
  const found = HERO_WORD_FONT_OPTIONS.find((opt) => opt.id === normalized);
  if (found && found.cssFamily) return found.cssFamily;
  return fallbackStack || "'Plus Jakarta Sans', sans-serif";
}

export function ensureHeroFontLoaded(fontId?: string): void {
  if (typeof document === "undefined") return;
  const normalized = normalizeHeroFontId(fontId);
  if (normalized === "theme" || LOADED_HERO_FONTS.has(normalized)) return;
  const opt = HERO_WORD_FONT_OPTIONS.find((item) => item.id === normalized);
  if (!opt?.googleSpec) return;

  const linkId = `olmart-hero-word-font-${opt.id}`;
  if (document.getElementById(linkId)) {
    LOADED_HERO_FONTS.add(normalized);
    return;
  }
  const link = document.createElement("link");
  link.id = linkId;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${opt.googleSpec}&display=swap`;
  document.head.appendChild(link);
  LOADED_HERO_FONTS.add(normalized);
}

export function resolveHeroDefaultTitlePx(token: "sm" | "md" | "lg" | "xl", device: StudioViewportDevice): number {
  if (device === "mobile") return token === "sm" ? 20 : token === "md" ? 24 : token === "xl" ? 32 : 28;
  if (device === "tablet") return token === "sm" ? 24 : token === "md" ? 30 : token === "xl" ? 40 : 34;
  return token === "sm" ? 30 : token === "md" ? 36 : token === "xl" ? 52 : 42;
}

export function mapTitlePxToSizeToken(px: number, device: StudioViewportDevice): "sm" | "md" | "lg" | "xl" {
  if (device === "mobile") return px <= 21 ? "sm" : px <= 26 ? "md" : px <= 30 ? "lg" : "xl";
  if (device === "tablet") return px <= 26 ? "sm" : px <= 32 ? "md" : px <= 37 ? "lg" : "xl";
  return px <= 32 ? "sm" : px <= 38 ? "md" : px <= 46 ? "lg" : "xl";
}

const TITLE_WEIGHT_MAP: Record<NonNullable<HeroBannerSettings["titleFontWeight"]>, number> = {
  normal: 400,
  semibold: 600,
  bold: 700,
  black: 900,
};

const SUBTITLE_WEIGHT_MAP: Record<NonNullable<HeroBannerSettings["subtitleFontWeight"]>, number> = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

export interface ResolvedHeroTypographyStyles {
  titleStyle: React.CSSProperties;
  subtitleStyle: React.CSSProperties;
}

export function resolveHeroTypographyStyles(
  settings: Partial<HeroBannerSettings>,
  profile: ResolvedHeroDeviceProfile,
  theme?: CustomPageTheme
): ResolvedHeroTypographyStyles {
  const titleFont = resolveHeroFontCss(settings.titleFontFamily, theme?.headingFontFamily || theme?.fontFamily);
  const subtitleFont = settings.subtitleFontFamily && settings.subtitleFontFamily !== "theme"
    ? resolveHeroFontCss(settings.subtitleFontFamily, theme?.bodyFontFamily || theme?.fontFamily)
    : theme?.bodyFontFamily || theme?.fontFamily || undefined;

  const titleWeight = settings.titleFontWeight ? TITLE_WEIGHT_MAP[settings.titleFontWeight] : undefined;
  const subtitleWeight = settings.subtitleFontWeight ? SUBTITLE_WEIGHT_MAP[settings.subtitleFontWeight] : undefined;

  const titleStyle: React.CSSProperties = {
    fontFamily: titleFont,
    ...(typeof titleWeight === "number" ? { fontWeight: titleWeight } : {}),
    ...(settings.titleItalic ? { fontStyle: "italic" } : {}),
    ...(settings.titleUnderline ? { textDecoration: "underline", textUnderlineOffset: "0.14em" } : {}),
    ...(settings.titleTextTransform && settings.titleTextTransform !== "none" ? { textTransform: settings.titleTextTransform } : {}),
    ...(typeof settings.titleLineHeight === "number" ? { lineHeight: settings.titleLineHeight } : {}),
    ...(typeof settings.titleLetterSpacingEm === "number" ? { letterSpacing: `${settings.titleLetterSpacingEm}em` } : {}),
    ...(profile.customTitleFontSizePx ? { fontSize: `${profile.customTitleFontSizePx}px` } : {}),
  };

  const subtitleStyle: React.CSSProperties = {
    ...(subtitleFont ? { fontFamily: subtitleFont } : {}),
    ...(typeof subtitleWeight === "number" ? { fontWeight: subtitleWeight } : {}),
    ...(settings.subtitleItalic ? { fontStyle: "italic" } : {}),
    ...(settings.subtitleUnderline ? { textDecoration: "underline", textUnderlineOffset: "0.18em" } : {}),
    ...(settings.subtitleTextTransform && settings.subtitleTextTransform !== "none" ? { textTransform: settings.subtitleTextTransform } : {}),
    ...(typeof settings.subtitleLineHeight === "number" ? { lineHeight: settings.subtitleLineHeight } : {}),
    ...(typeof settings.subtitleLetterSpacingEm === "number" ? { letterSpacing: `${settings.subtitleLetterSpacingEm}em` } : {}),
    ...(profile.customSubtitleFontSizePx ? { fontSize: `${profile.customSubtitleFontSizePx}px` } : {}),
  };

  return { titleStyle, subtitleStyle };
}

/**
 * Wraps or unwraps the selected slice of a title string with EditorialHeading inline tokens
 * (*word* for italic editorial emphasis, {word} for editorial underline).
 */
export function toggleInlineMarkupSelection(
  rawText: string,
  selStart: number,
  selEnd: number,
  kind: "italic" | "underline"
): { nextText: string; nextStart: number; nextEnd: number } {
  const open = kind === "italic" ? "*" : "{";
  const close = kind === "italic" ? "*" : "}";
  const start = Math.max(0, Math.min(selStart, rawText.length));
  const end = Math.max(start, Math.min(selEnd, rawText.length));
  const selected = rawText.slice(start, end);
  if (!selected.trim()) return { nextText: rawText, nextStart: start, nextEnd: end };

  // Unwrap if markers are directly around the selection
  if (start >= 1 && rawText[start - 1] === open && rawText[end] === close) {
    const nextText = rawText.slice(0, start - 1) + selected + rawText.slice(end + 1);
    return { nextText, nextStart: start - 1, nextEnd: end - 1 };
  }
  // Unwrap if markers are inside the selection bounds
  if (selected.startsWith(open) && selected.endsWith(close) && selected.length > 2) {
    const inner = selected.slice(1, -1);
    const nextText = rawText.slice(0, start) + inner + rawText.slice(end);
    return { nextText, nextStart: start, nextEnd: start + inner.length };
  }
  // Wrap selection
  const wrapped = `${open}${selected}${close}`;
  const nextText = rawText.slice(0, start) + wrapped + rawText.slice(end);
  return { nextText, nextStart: start + 1, nextEnd: start + 1 + selected.length };
}
