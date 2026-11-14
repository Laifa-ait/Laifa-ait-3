import {
  HeroArchShapeId,
  HeroBannerSettings,
  HeroDeviceMeasureConfig,
  HeroLayoutModelId,
  HeroTextPosition9,
} from "../../../../domains/seller/customPage.types";

export interface ResolvedHeroDeviceProfile {
  viewport: "desktop" | "tablet" | "mobile";
  heroLayout: HeroLayoutModelId;
  hasCustomLayout: boolean;
  activeImageSrc: string;
  secondaryImageSrc: string;
  activeFocalPoint: string;
  focalX: number;
  focalY: number;
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

const STYLE_MAP: Record<string, HeroLayoutModelId> = {
  "cinema-full": "cinema-full", "full-bleed": "cinema-full", "glass-dock": "cinema-full",
  "editorial-split": "editorial-split", "split": "editorial-split", "product-spotlight": "editorial-split", "flash-offer": "editorial-split",
  "arch-palace": "arch-palace", "arch": "arch-palace",
  "atelier-collage": "atelier-collage", "gallery": "atelier-collage", "magazine-ssense": "atelier-collage", "lookbook-hotspots": "atelier-collage",
  "bento-hero": "bento-hero", "diptych": "bento-hero",
};

export function normalizeHeroLayoutModelId(val: unknown): HeroLayoutModelId | null {
  if (typeof val !== "string" || !val || val === "inherit") return null;
  return STYLE_MAP[val] || null;
}

export function parseFocalString(pos?: string): { x: number; y: number } {
  if (!pos) return { x: 50, y: 50 };
  const matches = pos.match(/(\d+(?:\.\d+)?)%/g);
  if (matches && matches.length >= 2) {
    return { x: Math.min(100, Math.max(0, Number.parseFloat(matches[0]))), y: Math.min(100, Math.max(0, Number.parseFloat(matches[1]))) };
  }
  return { x: 50, y: 50 };
}

export function normalizeHeroSettingsAdapter(raw?: Partial<HeroBannerSettings>): HeroBannerSettings {
  const s = raw || {};
  const layout = normalizeHeroLayoutModelId(s.heroLayout) || "editorial-split";
  const ratioRaw = s.splitProportion || (s.splitRatio === "60-40" ? "60-40" : "50-50");
  return {
    ...s,
    title: sanitizeHeroTitle(s.title, s.spotlightProductTitle),
    subtitle: s.subtitle !== undefined ? s.subtitle : "",
    imageUrl: s.imageUrl || s.backgroundImage || "",
    secondaryImageUrl: s.secondaryImageUrl || s.bentoTopCardImage || "",
    ctaText: s.ctaText !== undefined ? s.ctaText : "Découvrir la collection",
    ctaLink: s.ctaLink || "#catalog",
    heroLayout: layout,
    containerMode: s.containerMode || (layout === "cinema-full" || s.fullTopWidth ? "full" : "contained"),
    splitProportion: ratioRaw === "70-30" || ratioRaw === "60-40" ? ratioRaw : "50-50",
    archShape: s.archShape || "roman-arch",
    diptychGapPx: typeof s.diptychGapPx === "number" ? s.diptychGapPx : 16,
    innerPaddingPx: typeof s.innerPaddingPx === "number" ? s.innerPaddingPx : layout === "atelier-collage" ? 28 : 24,
    borderRadiusPx: typeof s.borderRadiusPx === "number" ? s.borderRadiusPx : layout === "cinema-full" ? 0 : 24,
    textPosition9: s.textPosition9 || "center-left",
    textAlignment: s.textAlignment || "left",
    textBoxMaxWidth: s.textBoxMaxWidth || 480,
    textVerticalGap: s.textVerticalGap || 16,
    overlayOpacity: typeof s.overlayOpacity === "number" ? s.overlayOpacity : 0,
    ctaButtonSize: s.ctaButtonSize || "md",
    ctaTargetType: s.ctaTargetType || "catalog",
  };
}

export function sanitizeHeroTitle(rawTitle?: string, fallbackProductTitle?: string): string {
  const source = rawTitle !== undefined ? rawTitle : fallbackProductTitle || "";
  if (!source || !source.trim()) return "";
  const stripped = source.replace(/[*_{}]/g, "").replace(/\s+/g, " ").trim();
  if (/Savoir-Faire\s+Authentique/i.test(stripped) || /Patrimoine\s*&\s*Métiers/i.test(stripped)) {
    const matchStore = stripped.match(/^L'Univers\s+(.+?)\s*[—-]\s*Savoir-Faire/i);
    if (matchStore && matchStore[1]) return fallbackProductTitle ? `${matchStore[1].trim()} — ${fallbackProductTitle}` : matchStore[1].trim();
    return fallbackProductTitle || "";
  }
  return stripped;
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
  const secondaryImageSrc = settings.secondaryImageUrl || settings.bentoTopCardImage || activeImageSrc;

  const rawFocalStr = previewViewport === "mobile"
    ? settings.imagePositionMobile || settings.backgroundPositionMobile || "50% 50%"
    : previewViewport === "tablet"
      ? settings.imagePositionTablet || settings.backgroundPositionTablet || settings.imagePositionDesktop || "50% 50%"
      : settings.imagePositionDesktop || settings.backgroundPosition || "50% 50%";

  const parsedFocal = parseFocalString(rawFocalStr);
  const focalX = typeof devCfg.focalX === "number" ? devCfg.focalX : parsedFocal.x;
  const focalY = typeof devCfg.focalY === "number" ? devCfg.focalY : parsedFocal.y;
  const rawZoom = previewViewport === "mobile" ? settings.imageZoomMobile : previewViewport === "tablet" ? settings.imageZoomTablet : settings.imageZoomDesktop;
  const zoom = typeof devCfg.zoom === "number" ? devCfg.zoom : typeof rawZoom === "number" ? rawZoom : 1;

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
    viewport: previewViewport, heroLayout, hasCustomLayout, activeImageSrc, secondaryImageSrc,
    activeFocalPoint: `${focalX}% ${focalY}%`, focalX, focalY, zoom, minHeightPx, compactVisualHeightPx,
    heightPx: typeof devCfg.heightPx === "number" ? devCfg.heightPx : minHeightPx,
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

export function computeHeroContrastDiagnostics(settings: HeroBannerSettings): HeroContrastDiagnostics {
  const overlayOpacity = typeof settings.overlayOpacity === "number" ? settings.overlayOpacity : 0;
  if (overlayOpacity > 45) {
    return { ratio: 2.5, level: "LOW", warningMessage: `Le voile (${overlayOpacity}%) assombrit la photographie. Réduisez-le pour préserver la pureté visuelle.`, suggestedPatch: { overlayOpacity: 0, textShadow: "none" } };
  }
  return { ratio: 9.5, level: "AAA", warningMessage: null, suggestedPatch: {} };
}
