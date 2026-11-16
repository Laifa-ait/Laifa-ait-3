import {
  HeroArchShapeId,
  HeroBannerSettings,
  HeroDeviceMeasureConfig,
  HeroLayoutModelId,
  HeroSplitProportion,
  HeroTextPosition9,
} from "../../../../domains/seller/customPage.types";
import { StudioViewportDevice } from "../responsiveInheritanceHelper";
import { safeNavigationHref } from "../safeNavigationHref";
import { getWcagContrastRatio } from "../../../../pages/Seller/StoreBuilder/utils/storeQualityAuditor";

export interface ResolvedHeroDeviceProfile {
  viewport: StudioViewportDevice;
  heroLayout: HeroLayoutModelId;
  hasCustomLayout: boolean;
  heightPx: number;
  focalX: number;
  focalY: number;
  zoom: number;
  activeFocalPoint: string;
  titleScaleClass: string;
  titleSizeToken: "sm" | "md" | "lg" | "xl";
  activeImageSrc: string;
  imageSrc: string;
  secondaryImageSrc: string;
  tertiaryImageSrc: string;
  hasSecondaryImage: boolean;
  secondaryFocalX: number;
  secondaryFocalY: number;
  imageFit: "cover" | "contain";
  imageStudioBg?: string;
  textPosition9: HeroTextPosition9;
  textAlign: "left" | "center" | "right";
  textBoxMaxWidth: 360 | 480 | 620;
  textVerticalGap: 8 | 16 | 24;
  borderRadiusPx: number;
  innerPaddingPx: number;
  splitProportion: HeroSplitProportion;
  archShape: HeroArchShapeId;
  diptychGapPx: number;
  overlayOpacity: number;
}

export interface HeroContrastDiagnostics {
  level: "HIGH" | "MEDIUM" | "LOW";
  ratio: number;
  warningMessage: string | null;
  suggestedPatch: Partial<HeroBannerSettings>;
}

export interface HeroTextDensityDiagnostics {
  isDense: boolean;
  warnings: string[];
}

const VALID_MODELS: HeroLayoutModelId[] = [
  "cinema-full",
  "editorial-split",
  "arch-palace",
  "atelier-collage",
  "bento-hero",
];

function isValidHeroModel(val: unknown): val is HeroLayoutModelId {
  return typeof val === "string" && VALID_MODELS.includes(val as HeroLayoutModelId);
}

export function normalizeHeroLayoutModelId(val?: unknown): HeroLayoutModelId {
  return isValidHeroModel(val) ? val : "editorial-split";
}

export function clampFocalCoord(val: unknown, fallback = 50): number {
  const num = Number(val);
  if (Number.isNaN(num)) return fallback;
  return Math.min(100, Math.max(0, Math.round(num)));
}

export function clampHeroZoom(val: unknown, fallback = 1): number {
  const num = Number(val);
  if (Number.isNaN(num)) return fallback;
  return Math.min(1.6, Math.max(1, Number(num.toFixed(2))));
}

export function clampNumber(val: unknown, min: number, max: number, fallback: number): number {
  const num = Number(val);
  if (Number.isNaN(num)) return fallback;
  return Math.min(max, Math.max(min, Math.round(num)));
}

export function parsePositionPercent(posStr?: string): { x: number; y: number } {
  if (!posStr) return { x: 50, y: 50 };
  const match = posStr.match(/(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/);
  if (match) return { x: clampFocalCoord(match[1], 50), y: clampFocalCoord(match[2], 50) };
  if (posStr.includes("top")) return { x: 50, y: 20 };
  if (posStr.includes("bottom")) return { x: 50, y: 80 };
  return { x: 50, y: 50 };
}

export function sanitizeHeroTitle(rawTitle?: string, fallbackTitle?: string): string {
  const t = (rawTitle || fallbackTitle || "").trim();
  return t || "Collection Signature";
}

export function resolveSafeHeroCtaHref(settings: Partial<HeroBannerSettings>): string {
  if (settings.ctaTargetType === "category" && (settings.ctaTargetCategory || "").trim()) {
    return `#category=${encodeURIComponent((settings.ctaTargetCategory || "").trim())}`;
  }
  const prodId = (settings.ctaTargetProductId || settings.spotlightProductId || "").trim();
  if (settings.ctaTargetType === "product" && prodId) {
    return `#product-${prodId}`;
  }
  return safeNavigationHref(settings.ctaLink) || "#catalog";
}

export function normalizeHeroSettingsAdapter(raw?: Partial<HeroBannerSettings>): HeroBannerSettings {
  const s = (raw || {}) as Partial<HeroBannerSettings>;
  const normalizedLayout: HeroLayoutModelId = isValidHeroModel(s.heroLayout) ? s.heroLayout : "editorial-split";
  return {
    ...s,
    title: typeof s.title === "string" ? s.title : "",
    heroLayout: normalizedLayout,
    heroLayoutTablet: isValidHeroModel(s.heroLayoutTablet) ? s.heroLayoutTablet : undefined,
    heroLayoutMobile: isValidHeroModel(s.heroLayoutMobile) ? s.heroLayoutMobile : undefined,
    imageUrl: s.imageUrl || s.backgroundImage || "",
    ctaLink: resolveSafeHeroCtaHref(s),
    showCta: s.showCta !== false,
    showSubtitle: s.showSubtitle !== false,
    overlayOpacity: clampNumber(s.overlayOpacity, 0, 60, 0),
  };
}

const TITLE_SIZE_MAP: Record<StudioViewportDevice, Record<"sm" | "md" | "lg" | "xl", string>> = {
  desktop: {
    sm: "text-xl sm:text-2xl lg:text-3xl",
    md: "text-2xl sm:text-3xl lg:text-4xl",
    lg: "text-2xl sm:text-4xl lg:text-[2.65rem]",
    xl: "text-3xl sm:text-5xl lg:text-[3.15rem]",
  },
  tablet: { sm: "text-lg sm:text-xl", md: "text-xl sm:text-2xl", lg: "text-2xl sm:text-3xl", xl: "text-3xl sm:text-4xl" },
  mobile: { sm: "text-lg", md: "text-xl", lg: "text-2xl", xl: "text-3xl" },
};

export function resolveHeroDeviceProfile(
  rawSettings: Partial<HeroBannerSettings>,
  viewport: StudioViewportDevice = "desktop"
): ResolvedHeroDeviceProfile {
  const settings = normalizeHeroSettingsAdapter(rawSettings);
  const devCfg: HeroDeviceMeasureConfig =
    viewport === "mobile"
      ? settings.heroMobileConfig || {}
      : viewport === "tablet"
        ? settings.heroTabletConfig || {}
        : settings.heroDesktopConfig || {};

  const customDeviceLayout =
    devCfg.styleId ||
    (viewport === "mobile" ? settings.heroLayoutMobile : viewport === "tablet" ? settings.heroLayoutTablet : undefined);
  const heroLayout: HeroLayoutModelId = isValidHeroModel(customDeviceLayout)
    ? customDeviceLayout
    : isValidHeroModel(settings.heroLayout)
      ? settings.heroLayout
      : "editorial-split";

  const heightToken = settings.bannerHeight || "md";
  const baseTokenHeight: Record<StudioViewportDevice, number> = {
    desktop: heightToken === "sm" ? 320 : heightToken === "lg" ? 500 : heightToken === "xl" ? 600 : 400,
    tablet: heightToken === "sm" ? 280 : heightToken === "lg" ? 420 : heightToken === "xl" ? 500 : 350,
    mobile: heightToken === "sm" ? 260 : heightToken === "lg" ? 380 : heightToken === "xl" ? 440 : 320,
  };
  const fallbackHeight =
    viewport === "desktop" && typeof settings.heightPx === "number" ? settings.heightPx : baseTokenHeight[viewport];
  const heightPx = clampNumber(devCfg.heightPx ?? fallbackHeight, 240, 760, baseTokenHeight[viewport]);

  const rawPositionStr =
    viewport === "mobile"
      ? settings.imagePositionMobile || settings.imagePosition || "50% 50%"
      : viewport === "tablet"
        ? settings.imagePositionTablet || settings.imagePosition || "50% 50%"
        : settings.imagePositionDesktop || settings.imagePosition || "50% 50%";
  const parsedFocal = parsePositionPercent(rawPositionStr);
  const focalX = clampFocalCoord(devCfg.focalX, parsedFocal.x);
  const focalY = clampFocalCoord(devCfg.focalY, parsedFocal.y);

  const rawZoom =
    viewport === "mobile"
      ? settings.imageZoomMobile ?? settings.imageZoom ?? 1
      : viewport === "tablet"
        ? settings.imageZoomTablet ?? settings.imageZoom ?? 1
        : settings.imageZoomDesktop ?? settings.imageZoom ?? 1;
  const zoom = clampHeroZoom(devCfg.zoom ?? rawZoom, 1);

  const rawTitleToken =
    devCfg.titleSize ||
    (viewport === "mobile"
      ? settings.titleSizeMobile || "md"
      : viewport === "tablet"
        ? settings.titleSizeTablet || settings.titleSizeDesktop || "md"
        : settings.titleSizeDesktop || "lg");
  const titleSizeToken: "sm" | "md" | "lg" | "xl" =
    rawTitleToken === "sm" || rawTitleToken === "md" || rawTitleToken === "lg" || rawTitleToken === "xl" ? rawTitleToken : "lg";

  const activeImageSrc =
    viewport === "mobile" && settings.mobileImageUrl
      ? settings.mobileImageUrl
      : viewport === "tablet" && settings.tabletImageUrl
        ? settings.tabletImageUrl
        : settings.imageUrl || "";
  const secondaryImageSrc = (settings.secondaryImageUrl || "").trim();
  const tertiaryImageSrc = (settings.tertiaryImageUrl || "").trim();
  const fallbackPadding = viewport === "mobile" ? 20 : viewport === "tablet" ? 28 : 36;

  return {
    viewport,
    heroLayout,
    hasCustomLayout: viewport !== "desktop" && Boolean(customDeviceLayout),
    heightPx,
    focalX,
    focalY,
    zoom,
    activeFocalPoint: `${focalX}% ${focalY}%`,
    titleScaleClass: TITLE_SIZE_MAP[viewport][titleSizeToken],
    titleSizeToken,
    activeImageSrc,
    imageSrc: activeImageSrc,
    secondaryImageSrc,
    tertiaryImageSrc,
    hasSecondaryImage: Boolean(secondaryImageSrc),
    secondaryFocalX: clampFocalCoord(settings.secondaryFocalX, 50),
    secondaryFocalY: clampFocalCoord(settings.secondaryFocalY, 50),
    imageFit: settings.imageFit === "contain" ? "contain" : "cover",
    imageStudioBg: settings.imageStudioBg,
    textPosition9: devCfg.textPosition9 || settings.textPosition9 || (settings.textAlignment === "center" ? "center" : "center-left"),
    textAlign: devCfg.textAlign || settings.textAlignment || "left",
    textBoxMaxWidth: (devCfg.textBoxMaxWidth ?? settings.textBoxMaxWidth ?? (viewport === "mobile" ? 360 : 480)) as 360 | 480 | 620,
    textVerticalGap: (devCfg.textVerticalGap ?? settings.textVerticalGap ?? (viewport === "mobile" ? 8 : 16)) as 8 | 16 | 24,
    borderRadiusPx: clampNumber(devCfg.borderRadiusPx ?? settings.borderRadiusPx, 0, 80, viewport === "mobile" ? 16 : 24),
    innerPaddingPx: clampNumber(devCfg.innerPaddingPx ?? settings.innerPaddingPx, 12, 80, fallbackPadding),
    splitProportion: settings.splitProportion || "50-50",
    archShape: settings.archShape || "roman-arch",
    diptychGapPx: clampNumber(settings.diptychGapPx, 8, 40, 16),
    overlayOpacity: clampNumber(settings.overlayOpacity, 0, 60, 0),
  };
}

export function buildAdaptedDeviceConfigFromDesktop(
  rawSettings: Partial<HeroBannerSettings>,
  targetDevice: "tablet" | "mobile"
): HeroDeviceMeasureConfig {
  const pc = resolveHeroDeviceProfile(rawSettings, "desktop");
  const isMobile = targetDevice === "mobile";
  return {
    styleId: pc.heroLayout,
    heightPx: isMobile ? Math.max(260, Math.round(pc.heightPx * 0.62)) : Math.max(300, Math.round(pc.heightPx * 0.78)),
    innerPaddingPx: isMobile ? Math.max(16, Math.round(pc.innerPaddingPx * 0.65)) : Math.max(20, Math.round(pc.innerPaddingPx * 0.8)),
    borderRadiusPx: isMobile ? Math.min(24, pc.borderRadiusPx) : pc.borderRadiusPx,
    focalX: pc.focalX,
    focalY: pc.focalY,
    zoom: 1,
    titleSize: isMobile ? "md" : pc.titleSizeToken === "xl" ? "lg" : pc.titleSizeToken,
    textPosition9: isMobile ? "center" : pc.textPosition9,
    textAlign: isMobile ? "center" : pc.textAlign,
    textBoxMaxWidth: isMobile ? 360 : 480,
    textVerticalGap: isMobile ? 8 : 16,
  };
}

export function computeHeroContrastDiagnostics(raw: Partial<HeroBannerSettings>): HeroContrastDiagnostics {
  const bg = raw.bannerBgColor || "#FAF6F0";
  const fg = raw.titleColor || (raw.heroLayout === "cinema-full" ? "#FFFFFF" : "#111827");
  const ratio = getWcagContrastRatio(bg, fg);
  if (ratio < 3.5) {
    const darkRatio = getWcagContrastRatio(bg, "#111827");
    const lightRatio = getWcagContrastRatio(bg, "#FFFFFF");
    const bestTitle = darkRatio >= lightRatio ? "#111827" : "#FFFFFF";
    return {
      level: "LOW",
      ratio,
      warningMessage: `Contraste faible (${ratio.toFixed(1)}:1). Risque de titre difficile à lire.`,
      suggestedPatch: { titleColor: bestTitle, subtitleColor: bestTitle === "#111827" ? "#3F3F46" : "#F4F4F5" },
    };
  }
  return { level: ratio >= 4.5 ? "HIGH" : "MEDIUM", ratio, warningMessage: null, suggestedPatch: {} };
}

export function computeHeroTextDensityDiagnostics(raw: Partial<HeroBannerSettings>): HeroTextDensityDiagnostics {
  const warnings: string[] = [];
  if ((raw.title || "").trim().length > 65) warnings.push("Titre long (> 65 car.)");
  if ((raw.subtitle || "").trim().length > 140) warnings.push("Sous-titre dense (> 140 car.)");
  if ((raw.badgeText || "").trim().length > 28) warnings.push("Badge long (> 28 car.)");
  return { isDense: warnings.length > 0, warnings };
}
