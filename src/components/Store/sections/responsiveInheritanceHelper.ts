import type {
  CustomPageSection,
  CustomPageSectionStyles,
  CustomPageTheme,
} from "../../../domains/seller/customPage.types";

export type StudioViewportDevice = "desktop" | "tablet" | "mobile";

export interface DeviceResponsiveOverride {
  titleFontSizePx?: number;
  bodyFontSizePx?: number;
  paddingY?: number;
  paddingX?: number;
  textAlignment?: "left" | "center" | "right";
  columns?: 1 | 2 | 3 | 4;
  hidden?: boolean;
}

export interface SectionResponsiveConfig {
  tablet?: DeviceResponsiveOverride;
  mobile?: DeviceResponsiveOverride;
}

export interface ResolvedSectionResponsiveValues {
  titleFontSizePx: number;
  bodyFontSizePx: number;
  paddingY: number;
  paddingX: number;
  textAlignment: "left" | "center" | "right";
  columns: number;
  isHiddenOnViewport: boolean;
  inheritanceSource: {
    titleFontSizePx: StudioViewportDevice;
    bodyFontSizePx: StudioViewportDevice;
    paddingY: StudioViewportDevice;
    paddingX: StudioViewportDevice;
    textAlignment: StudioViewportDevice;
    columns: StudioViewportDevice;
  };
}

function resolveBasePaddingY(
  paddingY?: "sm" | "md" | "lg" | "xl" | number,
  themeSpacingYPx?: number
): number {
  if (typeof paddingY === "number") return paddingY;
  const base = typeof themeSpacingYPx === "number" ? themeSpacingYPx : 32;
  const map: Record<string, number> = {
    sm: Math.max(8, Math.round(base * 0.55)),
    md: base,
    lg: Math.round(base * 1.45),
    xl: Math.round(base * 1.9),
  };
  return map[paddingY || "md"] ?? base;
}

function resolveSource<T>(
  viewport: StudioViewportDevice,
  mobileVal: T | undefined,
  tabletVal: T | undefined
): StudioViewportDevice {
  if (viewport === "mobile") {
    if (mobileVal !== undefined) return "mobile";
    if (tabletVal !== undefined) return "tablet";
    return "desktop";
  }
  if (viewport === "tablet") {
    return tabletVal !== undefined ? "tablet" : "desktop";
  }
  return "desktop";
}

/**
 * Résout l'héritage Responsive à 3 niveaux :
 * Valeur globale (Desktop) -> Surcharge Tablette -> Surcharge Mobile.
 */
export function resolveResponsiveSectionValues(
  section: CustomPageSection,
  theme?: CustomPageTheme,
  viewport: StudioViewportDevice = "desktop"
): ResolvedSectionResponsiveValues {
  const settings = (section.settings || {}) as Record<string, unknown>;
  const styles: CustomPageSectionStyles = section.styles || {};
  const rawResponsive = (settings.responsive || {}) as SectionResponsiveConfig;
  const tablet: DeviceResponsiveOverride = rawResponsive.tablet || {};
  const mobile: DeviceResponsiveOverride = rawResponsive.mobile || {};

  const dTitle =
    typeof settings.titleFontSizePx === "number"
      ? settings.titleFontSizePx
      : typeof theme?.titleFontSizePx === "number"
      ? theme.titleFontSizePx
      : 36;
  const dBody =
    typeof settings.bodyFontSizePx === "number"
      ? settings.bodyFontSizePx
      : typeof theme?.bodyFontSizePx === "number"
      ? theme.bodyFontSizePx
      : 15;
  const dPadY = resolveBasePaddingY(styles.paddingY, theme?.spacingYPx);
  const dPadX = typeof styles.paddingX === "number" ? styles.paddingX : 20;
  const dAlign: "left" | "center" | "right" =
    settings.textAlignment === "center" || settings.textAlignment === "right"
      ? settings.textAlignment
      : "left";
  const dCols = typeof settings.columnsDesktop === "number" ? settings.columnsDesktop : 4;

  const hideOnDesktop = Boolean(settings.hideOnDesktop);
  const hideOnTablet = Boolean(tablet.hidden ?? settings.hideOnTablet ?? false);
  const hideOnMobile = Boolean(mobile.hidden ?? settings.hideOnMobile ?? false);

  const titleFontSizePx =
    viewport === "mobile"
      ? mobile.titleFontSizePx ?? tablet.titleFontSizePx ?? dTitle
      : viewport === "tablet"
      ? tablet.titleFontSizePx ?? dTitle
      : dTitle;

  const bodyFontSizePx =
    viewport === "mobile"
      ? mobile.bodyFontSizePx ?? tablet.bodyFontSizePx ?? dBody
      : viewport === "tablet"
      ? tablet.bodyFontSizePx ?? dBody
      : dBody;

  const paddingY =
    viewport === "mobile"
      ? mobile.paddingY ?? tablet.paddingY ?? dPadY
      : viewport === "tablet"
      ? tablet.paddingY ?? dPadY
      : dPadY;

  const paddingX =
    viewport === "mobile"
      ? mobile.paddingX ?? tablet.paddingX ?? dPadX
      : viewport === "tablet"
      ? tablet.paddingX ?? dPadX
      : dPadX;

  const textAlignment =
    viewport === "mobile"
      ? mobile.textAlignment ?? tablet.textAlignment ?? dAlign
      : viewport === "tablet"
      ? tablet.textAlignment ?? dAlign
      : dAlign;

  const columns =
    viewport === "mobile"
      ? mobile.columns ?? tablet.columns ?? Math.min(dCols, 2)
      : viewport === "tablet"
      ? tablet.columns ?? Math.min(dCols, 3)
      : dCols;

  const isHiddenOnViewport =
    viewport === "mobile"
      ? hideOnMobile
      : viewport === "tablet"
      ? hideOnTablet
      : hideOnDesktop;

  return {
    titleFontSizePx,
    bodyFontSizePx,
    paddingY,
    paddingX,
    textAlignment,
    columns,
    isHiddenOnViewport,
    inheritanceSource: {
      titleFontSizePx: resolveSource(viewport, mobile.titleFontSizePx, tablet.titleFontSizePx),
      bodyFontSizePx: resolveSource(viewport, mobile.bodyFontSizePx, tablet.bodyFontSizePx),
      paddingY: resolveSource(viewport, mobile.paddingY, tablet.paddingY),
      paddingX: resolveSource(viewport, mobile.paddingX, tablet.paddingX),
      textAlignment: resolveSource(viewport, mobile.textAlignment, tablet.textAlignment),
      columns: resolveSource(viewport, mobile.columns, tablet.columns),
    },
  };
}

const SAFE_CSS_TOKEN_REGEX = /^[a-zA-Z0-9_-]+$/;
const FORBIDDEN_CSS_PATTERNS = /javascript:|expression\(|url\(|<|>|;|{|}/i;

export function sanitizeControlledCssClasses(raw: string): string {
  if (!raw || typeof raw !== "string") return "";
  const cleaned = FORBIDDEN_CSS_PATTERNS.test(raw) ? raw.replace(FORBIDDEN_CSS_PATTERNS, "") : raw;
  return cleaned
    .split(/\s+/)
    .filter((tok) => SAFE_CSS_TOKEN_REGEX.test(tok))
    .slice(0, 12)
    .join(" ");
}

export function sanitizeAnchorId(raw: string): string {
  if (!raw || typeof raw !== "string") return "";
  return raw
    .trim()
    .replace(/^#+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function isSectionConditionallyVisible(
  settings: Record<string, unknown>,
  availableProductsCount: number,
  nowMs: number = Date.now()
): boolean {
  const rule = (settings.visibilityRule as string) || "always";
  if (rule === "in_stock_only") return availableProductsCount > 0;
  if (rule === "scheduled") {
    const fromStr = settings.visibleFrom as string | undefined;
    const untilStr = settings.visibleUntil as string | undefined;
    if (fromStr && !Number.isNaN(Date.parse(fromStr)) && nowMs < Date.parse(fromStr)) return false;
    if (untilStr && !Number.isNaN(Date.parse(untilStr)) && nowMs > Date.parse(untilStr)) return false;
  }
  return true;
}
