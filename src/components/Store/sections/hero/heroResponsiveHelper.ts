import {
  CustomPageTheme, HeroArchShapeId, HeroBannerSettings, HeroDeviceMeasureConfig, HeroLayoutModelId, HeroTextPosition9,
} from "../../../../domains/seller/customPage.types";

export interface ResolvedHeroDeviceProfile {
  viewport: "desktop" | "tablet" | "mobile";
  heroLayout: HeroLayoutModelId;
  hasCustomLayout: boolean;
  activeImageSrc: string;
  secondaryImageSrc: string;
  tertiaryImageSrc: string;
  hasSecondaryImage: boolean;
  activeFocalPoint: string;
  focalX: number;
  focalY: number;
  secondaryFocalX: number;
  secondaryFocalY: number;
  zoom: number;
  minHeightPx: number;
  compactVisualHeightPx: number;
  heightPx: number;
  innerPaddingPx: number;
  borderRadiusPx: number;
  textPosition9: HeroTextPosition9;
  textAlign: "left" | "center" | "right";
  titleSizeToken: "sm" | "md" | "lg" | "xl";
  textBoxMaxWidth: 360 | 480 | 620;
  textVerticalGap: 8 | 16 | 24;
  imageAspectRatio: "4/5" | "1/1" | "3/4" | "16/9";
  imageFit: "cover" | "contain";
  imageStudioBg: string;
  mobileStackOrder: "image-first" | "text-first";
  archShape: HeroArchShapeId;
  splitProportion: "50-50" | "60-40" | "70-30";
  diptychGapPx: number;
}

export interface HeroContrastDiagnostics {
  ratio: number;
  level: "AAA" | "AA" | "LOW";
  warningMessage: string | null;
  suggestedPatch: Partial<HeroBannerSettings>;
}

export interface HeroTextDensityDiagnostics {
  isDense: boolean;
  titleLength: number;
  subtitleLength: number;
  badgeLength: number;
  warnings: string[];
}

const STYLE_MAP: Record<string, HeroLayoutModelId> = {
  "cinema-full": "cinema-full", "full-bleed": "cinema-full", "glass-dock": "cinema-full",
  "editorial-split": "editorial-split", "split": "editorial-split", "product-spotlight": "editorial-split", "flash-offer": "editorial-split",
  "arch-palace": "arch-palace", "arch": "arch-palace",
  "atelier-collage": "atelier-collage", "gallery": "atelier-collage", "magazine-ssense": "atelier-collage", "lookbook-hotspots": "atelier-collage",
  "bento-hero": "bento-hero", "diptych": "bento-hero",
};

export function clampFocalCoord(val: unknown, fallback = 50): number {
  const num = typeof val === "number" && Number.isFinite(val) ? val : fallback;
  return Math.min(100, Math.max(0, Math.round(num)));
}

export function clampHeroZoom(val: unknown, fallback = 1): number {
  const num = typeof val === "number" && Number.isFinite(val) ? val : fallback;
  return Math.min(1.6, Math.max(1, Number(num.toFixed(2))));
}

export function normalizeHeroLayoutModelId(val: unknown): HeroLayoutModelId | null {
  return typeof val === "string" && val && val !== "inherit" ? STYLE_MAP[val] || null : null;
}

export function parseFocalString(pos?: string): { x: number; y: number } {
  const matches = pos ? pos.match(/(-?\d+(?:\.\d+)?)%/g) : null;
  return matches && matches.length >= 2
    ? { x: clampFocalCoord(Number.parseFloat(matches[0]), 50), y: clampFocalCoord(Number.parseFloat(matches[1]), 50) }
    : { x: 50, y: 50 };
}

export function normalizeHeroSettingsAdapter(raw?: Partial<HeroBannerSettings>): HeroBannerSettings {
  const s = raw || {};
  const layout = normalizeHeroLayoutModelId(s.heroLayout) || "editorial-split";
  const ratioRaw = s.splitProportion || (s.splitRatio === "60-40" ? "60-40" : s.splitRatio === "70-30" ? "70-30" : "50-50");
  return {
    ...s,
    title: sanitizeHeroTitle(s.title, s.spotlightProductTitle),
    subtitle: s.subtitle !== undefined ? s.subtitle : "",
    imageUrl: (s.imageUrl || s.backgroundImage || "").trim(),
    secondaryImageUrl: (s.secondaryImageUrl || s.bentoTopCardImage || "").trim(),
    tertiaryImageUrl: (s.tertiaryImageUrl || s.bentoBottomCardImage || "").trim(),
    ctaText: s.ctaText !== undefined ? s.ctaText : "Découvrir la collection",
    ctaLink: s.ctaLink || "#catalog",
    heroLayout: layout,
    containerMode: s.containerMode || (layout === "cinema-full" || s.fullTopWidth ? "full" : "contained"),
    splitProportion: ratioRaw === "70-30" || ratioRaw === "60-40" ? ratioRaw : "50-50",
    archShape: s.archShape || "roman-arch",
    diptychGapPx: typeof s.diptychGapPx === "number" ? Math.min(48, Math.max(8, s.diptychGapPx)) : 16,
    innerPaddingPx: typeof s.innerPaddingPx === "number" ? Math.min(64, Math.max(12, s.innerPaddingPx)) : layout === "atelier-collage" ? 28 : 24,
    borderRadiusPx: typeof s.borderRadiusPx === "number" ? Math.min(80, Math.max(0, s.borderRadiusPx)) : layout === "cinema-full" ? 0 : 24,
    textPosition9: s.textPosition9 || "center-left",
    textAlignment: s.textAlignment || "left",
    textBoxMaxWidth: s.textBoxMaxWidth || 480,
    textVerticalGap: s.textVerticalGap || 16,
    overlayOpacity: typeof s.overlayOpacity === "number" ? Math.min(80, Math.max(0, s.overlayOpacity)) : 0,
    ctaButtonSize: s.ctaButtonSize || "md",
    ctaTargetType: s.ctaTargetType || "catalog",
  };
}

export function sanitizeHeroTitle(rawTitle?: string, fallbackProductTitle?: string): string {
  const source = rawTitle !== undefined ? rawTitle : fallbackProductTitle || "";
  return source && source.trim() ? source.replace(/[*_{}]/g, "").replace(/\s+/g, " ").trim() : "";
}

export function sanitizeHeroBadge(rawBadge?: string, fallbackCategory?: string): string {
  const source = rawBadge !== undefined ? rawBadge : fallbackCategory || "";
  return source ? source.replace(/[*_{}]/g, "").trim() : "";
}

export function resolveSafeHeroCtaHref(settings: HeroBannerSettings): string {
  const targetType = settings.ctaTargetType || "catalog";
  if (targetType === "category" && settings.ctaTargetCategory) return `#category=${encodeURIComponent(settings.ctaTargetCategory.trim())}`;
  if (targetType === "product" && (settings.ctaTargetProductId || settings.spotlightProductId)) {
    return `#product-${encodeURIComponent((settings.ctaTargetProductId || settings.spotlightProductId || "").trim())}`;
  }
  const raw = (settings.ctaLink || "#catalog").trim();
  return /^(javascript|data|vbscript):/i.test(raw) ? "#catalog" : raw || "#catalog";
}

export function buildAdaptedDeviceConfigFromDesktop(settings: HeroBannerSettings, targetDevice: "tablet" | "mobile"): HeroDeviceMeasureConfig {
  const dp = resolveHeroDeviceProfile(settings, "desktop");
  const isMob = targetDevice === "mobile";
  return {
    styleId: dp.heroLayout,
    heightPx: isMob ? Math.max(280, Math.round(dp.heightPx * 0.72)) : Math.max(340, Math.round(dp.heightPx * 0.85)),
    innerPaddingPx: isMob ? Math.max(16, Math.round(dp.innerPaddingPx * 0.65)) : Math.max(20, Math.round(dp.innerPaddingPx * 0.8)),
    borderRadiusPx: isMob ? Math.min(24, dp.borderRadiusPx) : dp.borderRadiusPx,
    textPosition9: isMob ? "bottom-center" : dp.textPosition9,
    textAlign: isMob ? "center" : dp.textAlign,
    titleSize: isMob ? "md" : dp.titleSizeToken === "xl" ? "lg" : dp.titleSizeToken,
    textBoxMaxWidth: isMob ? 360 : 480,
    textVerticalGap: isMob ? 8 : 16,
    focalX: dp.focalX,
    focalY: dp.focalY,
    zoom: 1,
  };
}

export function resolveHeroDeviceProfile(rawSettings: HeroBannerSettings, previewViewport: "desktop" | "tablet" | "mobile" = "desktop"): ResolvedHeroDeviceProfile {
  const settings = normalizeHeroSettingsAdapter(rawSettings);
  const devCfg: HeroDeviceMeasureConfig = (previewViewport === "mobile" ? settings.heroMobileConfig : previewViewport === "tablet" ? settings.heroTabletConfig : settings.heroDesktopConfig) || {};
  const baseLayout: HeroLayoutModelId = normalizeHeroLayoutModelId(settings.heroLayout) || "editorial-split";
  let heroLayout: HeroLayoutModelId = normalizeHeroLayoutModelId(devCfg.styleId) || baseLayout;
  let hasCustomLayout = Boolean(devCfg.styleId && devCfg.styleId !== baseLayout);
  if (previewViewport === "tablet" && !devCfg.styleId) {
    const tabLayout = normalizeHeroLayoutModelId(settings.heroLayoutTablet);
    if (tabLayout) { heroLayout = tabLayout; hasCustomLayout = tabLayout !== baseLayout; }
  } else if (previewViewport === "mobile" && !devCfg.styleId) {
    const mobLayout = normalizeHeroLayoutModelId(settings.heroLayoutMobile);
    if (mobLayout) { heroLayout = mobLayout; hasCustomLayout = mobLayout !== baseLayout; }
  }
  const desktopImg = settings.imageUrl || settings.backgroundImage || "";
  const tabletImg = settings.tabletImageUrl || desktopImg;
  const mobileImg = settings.mobileImageUrl || settings.backgroundImageMobile || tabletImg;
  const activeImageSrc = previewViewport === "mobile" ? mobileImg : previewViewport === "tablet" ? tabletImg : desktopImg;
  const secondaryImageSrc = (settings.secondaryImageUrl || settings.bentoTopCardImage || "").trim();
  const tertiaryImageSrc = (settings.tertiaryImageUrl || settings.bentoBottomCardImage || "").trim();
  const rawFocalStr = previewViewport === "mobile"
    ? settings.imagePositionMobile || settings.backgroundPositionMobile || "50% 50%"
    : previewViewport === "tablet"
      ? settings.imagePositionTablet || settings.backgroundPositionTablet || settings.imagePositionDesktop || "50% 50%"
      : settings.imagePositionDesktop || settings.backgroundPosition || "50% 50%";
  const parsedFocal = parseFocalString(rawFocalStr);
  const focalX = clampFocalCoord(devCfg.focalX, parsedFocal.x);
  const focalY = clampFocalCoord(devCfg.focalY, parsedFocal.y);
  const rawZoom = previewViewport === "mobile" ? settings.imageZoomMobile : previewViewport === "tablet" ? settings.imageZoomTablet : settings.imageZoomDesktop;
  const zoom = clampHeroZoom(devCfg.zoom ?? rawZoom, 1);
  const dToken = settings.bannerHeightDesktop || "md";
  let minHeightPx = ({ sm: 380, md: 480, lg: 560, xl: 660 } as Record<string, number>)[dToken] || 480;
  let compactVisualHeightPx = ({ sm: 220, md: 260, lg: 300, xl: 320 } as Record<string, number>)[dToken] || 260;
  if (previewViewport === "tablet") {
    const tToken = settings.bannerHeightTablet && settings.bannerHeightTablet !== "inherit" ? settings.bannerHeightTablet : "md";
    minHeightPx = ({ sm: 320, md: 400, lg: 480 } as Record<string, number>)[tToken] || 400;
    compactVisualHeightPx = ({ sm: 190, md: 220, lg: 240 } as Record<string, number>)[tToken] || 220;
  } else if (previewViewport === "mobile") {
    const mToken = settings.bannerHeightMobile || "md";
    minHeightPx = ({ sm: 260, md: 320, lg: 400 } as Record<string, number>)[mToken] || 320;
    compactVisualHeightPx = ({ sm: 170, md: 195, lg: 215 } as Record<string, number>)[mToken] || 195;
  }
  let titleSizeToken: "sm" | "md" | "lg" | "xl" = devCfg.titleSize || settings.titleSizeDesktop || "lg";
  if (!devCfg.titleSize) {
    if (previewViewport === "tablet" && settings.titleSizeTablet && settings.titleSizeTablet !== "inherit") titleSizeToken = settings.titleSizeTablet;
    else if (previewViewport === "mobile") titleSizeToken = settings.titleSizeMobile || "md";
  }
  return {
    viewport: previewViewport, heroLayout, hasCustomLayout, activeImageSrc, secondaryImageSrc, tertiaryImageSrc,
    hasSecondaryImage: Boolean(secondaryImageSrc),
    activeFocalPoint: `${focalX}% ${focalY}%`, focalX, focalY, secondaryFocalX: 50, secondaryFocalY: 50, zoom,
    minHeightPx, compactVisualHeightPx,
    heightPx: typeof devCfg.heightPx === "number" ? Math.min(820, Math.max(240, devCfg.heightPx)) : minHeightPx,
    innerPaddingPx: typeof devCfg.innerPaddingPx === "number" ? devCfg.innerPaddingPx : (settings.innerPaddingPx ?? 24),
    borderRadiusPx: typeof devCfg.borderRadiusPx === "number" ? devCfg.borderRadiusPx : (settings.borderRadiusPx ?? (heroLayout === "cinema-full" ? 0 : 24)),
    textPosition9: devCfg.textPosition9 || settings.textPosition9 || "center-left",
    textAlign: devCfg.textAlign || settings.textAlignment || "left",
    titleSizeToken,
    textBoxMaxWidth: devCfg.textBoxMaxWidth || settings.textBoxMaxWidth || 480,
    textVerticalGap: devCfg.textVerticalGap || settings.textVerticalGap || 16,
    imageAspectRatio: settings.imageAspectRatio || "16/9",
    imageFit: settings.imageFit || "cover",
    imageStudioBg: settings.imageStudioBg || "#F8FAFC",
    mobileStackOrder: settings.mobileStackOrder || "image-first",
    archShape: settings.archShape || "roman-arch",
    splitProportion: settings.splitProportion || "50-50",
    diptychGapPx: settings.diptychGapPx ?? 16,
  };
}

export function resolveHeroTitleClasses(settings: HeroBannerSettings, titleSizeToken: "sm" | "md" | "lg" | "xl"): string {
  const fontClass = settings.titleFontFamily === "serif" ? "font-serif" : settings.titleFontFamily === "display" ? "font-sans uppercase tracking-wider" : "font-sans tracking-tight";
  const weightClass = settings.titleFontWeight === "normal" ? "font-medium" : settings.titleFontWeight === "semibold" ? "font-semibold" : settings.titleFontWeight === "black" ? "font-black" : "font-bold";
  const sizeClass = titleSizeToken === "sm" ? "text-lg sm:text-xl @2xl:text-2xl leading-snug" : titleSizeToken === "md" ? "text-xl sm:text-2xl @2xl:text-3xl leading-tight" : titleSizeToken === "xl" ? "text-2xl sm:text-4xl @2xl:text-5xl leading-[1.06]" : "text-xl sm:text-3xl @2xl:text-4xl leading-[1.1]";
  return `${fontClass} ${weightClass} ${sizeClass}`;
}

function relLuminance(hex: string): number {
  const clean = hex.replace("#", "").trim();
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean.slice(0, 6);
  const num = Number.parseInt(full, 16);
  if (Number.isNaN(num)) return 0.5;
  const chan = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  return 0.2126 * chan((num >> 16) & 255) + 0.7152 * chan((num >> 8) & 255) + 0.0722 * chan(num & 255);
}

export function computeHeroContrastDiagnostics(settings: HeroBannerSettings, theme?: CustomPageTheme): HeroContrastDiagnostics {
  const overlayOpacity = typeof settings.overlayOpacity === "number" ? settings.overlayOpacity : 0;
  if (overlayOpacity > 45) {
    return { ratio: 2.5, level: "LOW", warningMessage: `Le voile (${overlayOpacity}%) assombrit la photographie. Réduisez-le pour préserver la pureté visuelle.`, suggestedPatch: { overlayOpacity: 0, textShadow: "none" } };
  }
  const layout = normalizeHeroLayoutModelId(settings.heroLayout) || "editorial-split";
  const bgHex = settings.bannerBgColor || theme?.surfaceColor || theme?.canvasColor || "#FAF6F0";
  const titleHex = settings.titleColor || (layout === "cinema-full" ? "#FFFFFF" : theme?.secondaryColor || "#111827");
  if (layout !== "cinema-full" && bgHex.startsWith("#") && titleHex.startsWith("#")) {
    const l1 = relLuminance(bgHex);
    const l2 = relLuminance(titleHex);
    const ratio = Number(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2));
    if (ratio < 4.5) {
      const safeColor = l1 > 0.5 ? "#111827" : "#FFFFFF";
      return { ratio, level: "LOW", warningMessage: `Contraste texte/fond faible (${ratio}:1 < 4.5:1 WCAG AA).`, suggestedPatch: { titleColor: safeColor, subtitleColor: l1 > 0.5 ? "#3F3F46" : "#E4E4E7" } };
    }
    return { ratio, level: ratio >= 7 ? "AAA" : "AA", warningMessage: null, suggestedPatch: {} };
  }
  return { ratio: 9.5, level: "AAA", warningMessage: null, suggestedPatch: {} };
}

export function computeHeroTextDensityDiagnostics(settings: HeroBannerSettings): HeroTextDensityDiagnostics {
  const titleLength = (settings.title || "").trim().length;
  const subtitleLength = (settings.subtitle || "").trim().length;
  const badgeLength = (settings.badgeText || "").trim().length;
  const warnings: string[] = [];
  if (titleLength > 65) warnings.push(`Titre long (${titleLength}/65 car. recommandés)`);
  if (subtitleLength > 140) warnings.push(`Phrase longue (${subtitleLength}/140 car. recommandés)`);
  if (badgeLength > 28) warnings.push(`Badge long (${badgeLength}/28 car. recommandés)`);
  return { isDense: warnings.length > 0, titleLength, subtitleLength, badgeLength, warnings };
}
