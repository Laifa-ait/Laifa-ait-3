import { CustomPageTheme, HeroBannerSettings, HeroDeviceMeasureConfig, HeroTextPosition9 } from "../../../../domains/seller/customPage.types";
import { Product } from "../../../../domains/product/product.types";
import { isCatalogProductPubliclyActive } from "../../../../domains/seller/studioCatalogResolver";
import { StudioViewportDevice } from "../responsiveInheritanceHelper";
import { safeNavigationHref } from "../safeNavigationHref";
import { clampFocalCoord, clampNumber, parsePositionPercent, sanitizeHeroTitle } from "../hero/heroResponsiveHelper";
import { CINEMATIC_BUTTON_SHAPES, CINEMATIC_DEVICE_HEIGHT_PRESETS, DEFAULT_CINEMATIC_BANNER_CONFIG } from "./cinematicBanner.defaults";
import {
  CinematicBannerConfig, CinematicButtonConfig, CinematicButtonShape,
  CinematicCornerPreset, CinematicDestinationValidation, CinematicDeviceOverride,
  CinematicHeightPreset, CinematicOverlayPreset,
} from "./cinematicBanner.types";

export function clampCinematicZoom(val: unknown, fallback = 1): number {
  const num = Number(val);
  if (Number.isNaN(num)) return fallback;
  const normalized = num > 10 ? num / 100 : num;
  return Math.min(2, Math.max(1, Number(normalized.toFixed(2))));
}

export function clampCinematicPan(val: unknown, fallback = 0): number {
  return clampNumber(val, -50, 50, fallback);
}

function mapLegacyCtaStyleToShape(style?: string): CinematicButtonShape {
  if (style === "sharp" || style === "rectangle") return "rectangle";
  if (style === "rounded" || style === "solid") return "rounded";
  if (style === "outline") return "outline";
  if (style === "minimal") return "minimal";
  return "pill";
}

function resolveHeightPresetFromPx(px: number, device: StudioViewportDevice = "desktop"): CinematicHeightPreset {
  const map = CINEMATIC_DEVICE_HEIGHT_PRESETS[device];
  if (px === map.fine) return "fine";
  if (px === map.balanced) return "balanced";
  if (px === map.large) return "large";
  if (px === map.immersive) return "immersive";
  return "custom";
}

function resolveCornerPresetFromPx(px: number): CinematicCornerPreset {
  return px === 0 || px === 12 || px === 24 || px === 40 ? px : "custom";
}

function resolveOverlayPresetFromIntensity(intensity: number): CinematicOverlayPreset {
  return intensity <= 0 ? "none" : intensity <= 32 ? "soft" : intensity <= 50 ? "medium" : "strong";
}

function tokenToTitlePx(token: "sm" | "md" | "lg" | "xl", device: StudioViewportDevice): number {
  if (device === "mobile") return token === "sm" ? 20 : token === "md" ? 24 : token === "xl" ? 32 : 28;
  if (device === "tablet") return token === "sm" ? 24 : token === "md" ? 30 : token === "xl" ? 40 : 34;
  return token === "sm" ? 30 : token === "md" ? 36 : token === "xl" ? 52 : 42;
}

export function validateCinematicDestination(
  button: Partial<CinematicButtonConfig>,
  products: Product[] = []
): CinematicDestinationValidation {
  const targetType = button.targetType || "catalog";
  if (targetType === "category") {
    const cat = (button.targetCategory || "").trim();
    if (!cat) {
      return { isValid: false, resolvedHref: "#catalog", warningMessage: "Aucune catégorie sélectionnée : le bouton renverra vers tout le catalogue.", productExists: false };
    }
    return { isValid: true, resolvedHref: `#category=${encodeURIComponent(cat)}`, warningMessage: null, productExists: false };
  }
  if (targetType === "product") {
    const prodId = (button.targetProductId || "").trim();
    if (!prodId) {
      return { isValid: false, resolvedHref: "#catalog", warningMessage: "Aucun produit sélectionné : le bouton renverra vers tout le catalogue.", productExists: false };
    }
    if (products.length > 0) {
      const found = products.find((p) => p.id === prodId);
      const isPublic = found ? isCatalogProductPubliclyActive(found) : false;
      if (!found || !isPublic) {
        return { isValid: false, resolvedHref: "#catalog", warningMessage: "Ce produit est introuvable ou inactif : le bouton renverra vers tout le catalogue.", productExists: false };
      }
      return { isValid: true, resolvedHref: `#product-${prodId}`, warningMessage: null, productExists: true, matchedProductTitle: found.name };
    }
    return { isValid: true, resolvedHref: `#product-${prodId}`, warningMessage: null, productExists: true };
  }
  const safeCatalogHref = safeNavigationHref(button.href) || "#catalog";
  return {
    isValid: true,
    resolvedHref: safeCatalogHref.startsWith("#") || safeCatalogHref.startsWith("/") ? safeCatalogHref : "#catalog",
    warningMessage: null,
    productExists: false,
  };
}

/**
 * Résout la configuration Plein Cadre en donnant priorité aux réglages plats de la bannière (`s.*`)
 * pour éviter tout conflit ou blocage par d'anciennes valeurs stockées dans `cinematicConfig`.
 */
export function resolveCinematicBannerConfig(
  rawSettings?: Partial<HeroBannerSettings>,
  theme?: CustomPageTheme
): CinematicBannerConfig {
  const s = (rawSettings || {}) as Partial<HeroBannerSettings>;
  const existing = (s.cinematicConfig || {}) as Partial<CinematicBannerConfig>;
  const def = DEFAULT_CINEMATIC_BANNER_CONFIG;

  const parsedDesktopPos = parsePositionPercent(s.imagePositionDesktop || s.imagePosition);
  const focalX = clampFocalCoord(s.heroDesktopConfig?.focalX ?? parsedDesktopPos.x ?? existing.image?.focalX, 50);
  const focalY = clampFocalCoord(s.heroDesktopConfig?.focalY ?? parsedDesktopPos.y ?? existing.image?.focalY, 50);
  const zoom = clampCinematicZoom(s.heroDesktopConfig?.zoom ?? s.imageZoomDesktop ?? s.imageZoom ?? existing.image?.zoom, 1);

  const heightPx = clampNumber(s.heroDesktopConfig?.heightPx ?? s.heightPx ?? existing.layout?.heightPx, 240, 760, def.layout.heightPx);
  const borderRadiusPx = clampNumber(s.heroDesktopConfig?.borderRadiusPx ?? s.borderRadiusPx ?? existing.layout?.borderRadiusPx, 0, 80, def.layout.borderRadiusPx);
  const innerPaddingPx = clampNumber(s.heroDesktopConfig?.innerPaddingPx ?? s.innerPaddingPx ?? existing.layout?.innerPaddingPx, 16, 80, def.layout.innerPaddingPx);
  const textPosition9: HeroTextPosition9 =
    s.heroDesktopConfig?.textPosition9 || s.textPosition9 || existing.layout?.textPosition9 || (s.textAlignment === "center" ? "center" : def.layout.textPosition9);
  const textAlign = s.heroDesktopConfig?.textAlign || s.textAlignment || existing.layout?.textAlign || def.layout.textAlign;

  const overlayIntensity = clampNumber(s.overlayOpacity ?? existing.overlay?.intensity, 0, 80, def.overlay.intensity);
  const shape = s.ctaStyle ? mapLegacyCtaStyleToShape(s.ctaStyle) : existing.button?.shape || "pill";
  const shapePreset = CINEMATIC_BUTTON_SHAPES.find((b) => b.id === shape) || CINEMATIC_BUTTON_SHAPES[2];
  const explicitTitleToken = s.heroDesktopConfig?.titleSize || s.titleSizeDesktop;
  const titleToken = explicitTitleToken || existing.typography?.titleSizeToken || "lg";
  const respTitlePx = typeof (rawSettings as Record<string, unknown>)?.titleFontSizePx === "number" ? Number((rawSettings as Record<string, unknown>).titleFontSizePx) : undefined;
  const titleSizePx = clampNumber(
    respTitlePx ?? (explicitTitleToken ? tokenToTitlePx(explicitTitleToken, "desktop") : existing.typography?.titleSizePx),
    20,
    68,
    tokenToTitlePx(titleToken, "desktop")
  );

  const buttonCfg: CinematicButtonConfig = {
    text: s.ctaText !== undefined ? s.ctaText : existing.button?.text ?? def.button.text,
    shape,
    size: s.ctaButtonSize || existing.button?.size || def.button.size,
    paddingX: clampNumber(existing.button?.paddingX, 4, 56, shapePreset.paddingX),
    paddingY: clampNumber(existing.button?.paddingY, 4, 28, shapePreset.paddingY),
    borderRadiusPx: clampNumber(s.ctaBorderRadiusPx ?? existing.button?.borderRadiusPx, 0, 999, shapePreset.radiusPx),
    borderWidthPx: clampNumber(s.ctaBorderWidthPx ?? existing.button?.borderWidthPx, 0, 6, shapePreset.borderWidthPx),
    fontFamily: s.titleFontFamily || existing.button?.fontFamily || "sans",
    fontWeight: existing.button?.fontWeight || 700,
    letterSpacingEm: typeof existing.button?.letterSpacingEm === "number" ? existing.button.letterSpacingEm : 0.02,
    showArrow: s.ctaShowArrow !== undefined ? s.ctaShowArrow : existing.button?.showArrow !== false,
    targetType: s.ctaTargetType || existing.button?.targetType || "catalog",
    targetCategory: s.ctaTargetCategory !== undefined ? s.ctaTargetCategory : existing.button?.targetCategory || "",
    targetProductId: s.ctaTargetProductId || s.spotlightProductId || existing.button?.targetProductId || "",
    href: s.ctaLink || existing.button?.href || "#catalog",
  };

  const mapDeviceOverride = (
    dev: "desktop" | "tablet" | "mobile",
    legacyDevCfg?: HeroDeviceMeasureConfig,
    legacyImgUrl?: string,
    legacyPosStr?: string,
    legacyZoom?: number,
    legacyTitleSize?: string
  ): CinematicDeviceOverride => {
    const baseOv: CinematicDeviceOverride = { ...(existing.responsive?.[dev] || {}) };
    const parsedPos = legacyPosStr ? parsePositionPercent(legacyPosStr) : null;
    if (typeof legacyDevCfg?.heightPx === "number") baseOv.heightPx = clampNumber(legacyDevCfg.heightPx, 220, 760, 360);
    if (baseOv.heightPx !== undefined) baseOv.heightPreset = resolveHeightPresetFromPx(baseOv.heightPx, dev);
    if (typeof legacyDevCfg?.innerPaddingPx === "number") baseOv.innerPaddingPx = legacyDevCfg.innerPaddingPx;
    if (typeof legacyDevCfg?.borderRadiusPx === "number") baseOv.borderRadiusPx = legacyDevCfg.borderRadiusPx;
    if (legacyDevCfg?.textPosition9) baseOv.textPosition9 = legacyDevCfg.textPosition9;
    if (legacyDevCfg?.textAlign) baseOv.textAlign = legacyDevCfg.textAlign;
    if (legacyDevCfg?.focalX !== undefined || parsedPos) baseOv.focalX = clampFocalCoord(legacyDevCfg?.focalX ?? parsedPos?.x, focalX);
    if (legacyDevCfg?.focalY !== undefined || parsedPos) baseOv.focalY = clampFocalCoord(legacyDevCfg?.focalY ?? parsedPos?.y, focalY);
    if (legacyDevCfg?.zoom !== undefined || legacyZoom !== undefined) baseOv.zoom = clampCinematicZoom(legacyDevCfg?.zoom ?? legacyZoom, 1);
    const tok = legacyDevCfg?.titleSize || (legacyTitleSize === "sm" || legacyTitleSize === "md" || legacyTitleSize === "lg" || legacyTitleSize === "xl" ? legacyTitleSize : undefined) || baseOv.titleSizeToken;
    if (tok) {
      baseOv.titleSizeToken = tok;
      if (baseOv.titleSizePx === undefined || legacyDevCfg?.titleSize || legacyTitleSize) {
        baseOv.titleSizePx = tokenToTitlePx(tok, dev);
      }
    }
    const respMap = (rawSettings as Record<string, unknown>)?.responsive as Record<string, { titleFontSizePx?: number } | undefined> | undefined;
    if (typeof respMap?.[dev]?.titleFontSizePx === "number") {
      baseOv.titleSizePx = respMap[dev]?.titleFontSizePx;
    }
    if (legacyImgUrl) baseOv.imageSrc = legacyImgUrl;
    return baseOv;
  };

  const widthMode = s.containerMode === "contained" ? "contained" : s.containerMode === "full" ? "full" : existing.layout?.widthMode || "full";

  return {
    styleId: "cinema-full",
    image: {
      src: s.imageUrl ?? s.backgroundImage ?? existing.image?.src ?? "",
      alt: s.imageAlt ?? existing.image?.alt ?? (sanitizeHeroTitle(s.title, s.spotlightProductTitle) || def.image.alt),
      fit: (s.imageFit ?? existing.image?.fit) === "contain" ? "contain" : "cover",
      zoom, focalX, focalY,
      panOffsetX: clampCinematicPan(existing.image?.panOffsetX, 0),
      panOffsetY: clampCinematicPan(existing.image?.panOffsetY, 0),
    },
    title: typeof s.title === "string" ? s.title : existing.title ?? def.title,
    subtitle: typeof s.subtitle === "string" ? s.subtitle : existing.subtitle ?? "",
    button: buttonCfg,
    layout: {
      desktopHeightPreset: resolveHeightPresetFromPx(heightPx, "desktop"),
      heightPx,
      widthMode,
      cornerRadiusPreset: resolveCornerPresetFromPx(borderRadiusPx),
      borderRadiusPx,
      marginHorizontalPx: clampNumber(existing.layout?.marginHorizontalPx, 0, 64, 0),
      marginVerticalPx: clampNumber(existing.layout?.marginVerticalPx, 0, 64, 0),
      innerPaddingPx, textPosition9, textAlign,
      textBlockMarginX: clampNumber(existing.layout?.textBlockMarginX, 0, 64, 0),
      textBlockMarginY: clampNumber(existing.layout?.textBlockMarginY, 0, 64, 0),
      showCompositionGuides: Boolean(s.showCompositionGuides ?? existing.layout?.showCompositionGuides),
    },
    typography: {
      titleFontFamily: s.titleFontFamily || existing.typography?.titleFontFamily || def.typography.titleFontFamily,
      titleSizePx, titleSizeToken: titleToken,
      titleWeight: existing.typography?.titleWeight || 800,
      titleLineHeight: Number(Math.min(1.5, Math.max(0.95, existing.typography?.titleLineHeight ?? 1.08)).toFixed(2)),
      titleLetterSpacingEm: Number(Math.min(0.15, Math.max(-0.05, existing.typography?.titleLetterSpacingEm ?? -0.02)).toFixed(3)),
      titleMaxWidthPx: clampNumber(s.heroDesktopConfig?.textBoxMaxWidth ?? s.textBoxMaxWidth ?? existing.typography?.titleMaxWidthPx, 280, 840, 540),
      subtitleSizePx: clampNumber(existing.typography?.subtitleSizePx, 12, 24, 15),
      subtitleWeight: existing.typography?.subtitleWeight || 500,
      subtitleLineHeight: Number(Math.min(1.9, Math.max(1.2, existing.typography?.subtitleLineHeight ?? 1.55)).toFixed(2)),
      subtitleMaxWidthPx: clampNumber(s.heroDesktopConfig?.textBoxMaxWidth ?? s.textBoxMaxWidth ?? existing.typography?.subtitleMaxWidthPx, 240, 720, 480),
      textVerticalGapPx: clampNumber(s.heroDesktopConfig?.textVerticalGap ?? s.textVerticalGap ?? existing.typography?.textVerticalGapPx, 8, 32, 16),
    },
    colors: {
      titleColor: s.titleColor || existing.colors?.titleColor || "#FFFFFF",
      subtitleColor: s.subtitleColor || existing.colors?.subtitleColor || "#F4F4F5",
      buttonBgColor: s.ctaBgColor || existing.colors?.buttonBgColor || "#FFFFFF",
      buttonTextColor: s.ctaTextColor || existing.colors?.buttonTextColor || theme?.primaryColor || "#0F172A",
      buttonBorderColor: s.ctaBorderColor || existing.colors?.buttonBorderColor || "#FFFFFF",
      backdropColor: s.bannerBgColor || existing.colors?.backdropColor || theme?.secondaryColor || "#0F172A",
    },
    overlay: {
      preset: resolveOverlayPresetFromIntensity(overlayIntensity),
      intensity: overlayIntensity,
      direction: existing.overlay?.direction || "radial",
      zone: existing.overlay?.zone || "text-only",
    },
    responsive: {
      desktop: mapDeviceOverride("desktop", s.heroDesktopConfig, s.imageUrl, s.imagePositionDesktop, s.imageZoomDesktop, s.titleSizeDesktop),
      tablet: mapDeviceOverride("tablet", s.heroTabletConfig, s.tabletImageUrl, s.imagePositionTablet, s.imageZoomTablet, s.titleSizeTablet),
      mobile: mapDeviceOverride("mobile", s.heroMobileConfig, s.mobileImageUrl, s.imagePositionMobile, s.imageZoomMobile, s.titleSizeMobile),
    },
  };
}

export {
  buildCinematicOverlayCss,
  buildHeroSettingsPatchFromCinematic,
  computeCinematicContrastAudit,
  resolveCinematicDeviceState,
} from "./cinematicBanner.helpers";
