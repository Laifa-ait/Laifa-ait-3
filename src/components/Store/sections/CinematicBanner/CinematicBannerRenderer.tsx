import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { CustomPageSectionStyles, CustomPageTheme, HeroBannerSettings, HeroSubElement } from "../../../../domains/seller/customPage.types";
import { Product } from "../../../../domains/product/product.types";
import { EditorialHeading } from "../../EditorialHeading";
import { StudioViewportDevice } from "../responsiveInheritanceHelper";
import { handleSmartLinkClick } from "../safeNavigationHref";
import { ELEGANT_HERO_FALLBACK_IMG, HeroCompositionGuides, resolvePosition9FlexClasses } from "../hero/HeroMinimalTextAndGuides";
import { ResolvedHeroDeviceProfile, sanitizeHeroTitle } from "../hero/heroResponsiveHelper";
import {
  resolveBannerEffectiveShadow, resolveHeroBorderCss, resolveHeroBoxShadowCss, resolveHeroImageFilterCss, resolveHeroTextShadowCss,
} from "../hero/heroVisualEffectsHelper";
import { ensureHeroFontLoaded, resolveHeroFontCss, resolveHeroTypographyStyles } from "../hero/heroTypographyHelper";
import { resolveHeroTextFrame } from "../hero/heroTextFrameHelper";
import {
  buildCinematicOverlayCss, resolveCinematicBannerConfig, resolveCinematicDeviceState, validateCinematicDestination,
} from "./cinematicBanner.utils";

export interface CinematicBannerRendererProps {
  settings: HeroBannerSettings;
  sectionStyles?: CustomPageSectionStyles;
  theme: CustomPageTheme;
  profile: ResolvedHeroDeviceProfile;
  previewViewport?: StudioViewportDevice;
  products?: Product[];
  isEditable?: boolean;
  isEdgeToEdge?: boolean;
  activeSubElement?: HeroSubElement | null;
  isSubSelected: (sub: HeroSubElement) => boolean;
  selectSub: (e: React.MouseEvent, sub: HeroSubElement) => void;
  getSubRing: (sub: HeroSubElement) => string;
  handleTextPatch?: (field: keyof HeroBannerSettings, val: string) => void;
}

export const CinematicBannerRenderer: React.FC<CinematicBannerRendererProps> = ({
  settings, sectionStyles, theme, profile, previewViewport = "desktop", products = [], isEditable = false, isEdgeToEdge = false, selectSub, getSubRing,
}) => {
  const config = resolveCinematicBannerConfig(settings, theme);
  const deviceState = resolveCinematicDeviceState(config, previewViewport);
  const [imgError, setImgError] = useState(false);

  const rawSrc = deviceState.imageSrc || profile.activeImageSrc || "";
  useEffect(() => { setImgError(false); }, [rawSrc]);

  const resolvedSrc = !rawSrc || imgError ? ELEGANT_HERO_FALLBACK_IMG : rawSrc;
  const cleanTitle = sanitizeHeroTitle(config.title, settings.spotlightProductTitle);
  const showTitle = !settings.hideAllText && Boolean(cleanTitle.trim());
  const showSubtitle = !settings.hideAllText && settings.showSubtitle !== false && Boolean(config.subtitle.trim());
  const ctaLabel = (config.button.text || "").trim();
  const showCta = !settings.hideAllText && settings.showCta !== false && Boolean(ctaLabel);

  const posFlex = resolvePosition9FlexClasses(deviceState.textPosition9);
  const alignClass = deviceState.textAlign === "center" ? "items-center text-center" : deviceState.textAlign === "right" ? "items-end text-end" : "items-start text-start";
  const overlayCss = settings.overlayEnabled === false ? {} : buildCinematicOverlayCss(config.overlay, deviceState.textPosition9, settings.overlayColor || sectionStyles?.overlayColor);
  const filterCss = resolveHeroImageFilterCss(settings);
  const textShadowCss = resolveHeroTextShadowCss(settings.textShadow);
  const bannerShadowCss = resolveBannerEffectiveShadow(settings, theme);

  useEffect(() => {
    ensureHeroFontLoaded(settings.titleFontFamily || config.typography.titleFontFamily);
    ensureHeroFontLoaded(settings.subtitleFontFamily);
  }, [settings.titleFontFamily, settings.subtitleFontFamily, config.typography.titleFontFamily]);

  const { titleStyle: wordTitleStyle, subtitleStyle: wordSubtitleStyle } = resolveHeroTypographyStyles(settings, profile, theme);
  const textFrame = resolveHeroTextFrame(settings, theme, profile, false);
  const resolvedTitleFont = resolveHeroFontCss(settings.titleFontFamily || config.typography.titleFontFamily, theme.headingFontFamily || theme.fontFamily);
  const resolvedButtonFont = resolveHeroFontCss(config.button.fontFamily, theme.fontFamily);

  const destination = validateCinematicDestination(config.button, products);
  const shape = config.button.shape;
  const isOutline = shape === "outline";
  const isMinimal = shape === "minimal";
  const btnFontSizePx = deviceState.buttonSize === "sm" ? 12 : deviceState.buttonSize === "lg" ? 15 : 13;
  const btnPadX = isMinimal ? 4 : deviceState.viewport === "mobile" ? Math.min(24, config.button.paddingX) : config.button.paddingX;
  const btnPadY = isMinimal ? 6 : deviceState.viewport === "mobile" ? Math.min(12, config.button.paddingY) : config.button.paddingY;
  const btnRadiusPx = isMinimal ? 0 : typeof settings.ctaBorderRadiusPx === "number" ? settings.ctaBorderRadiusPx : shape === "pill" ? 999 : shape === "rectangle" ? 0 : config.button.borderRadiusPx;

  const hasPan = deviceState.panOffsetX !== 0 || deviceState.panOffsetY !== 0;
  const imgTransform = deviceState.zoom > 1 || hasPan ? (hasPan ? `scale(${deviceState.zoom}) translate(${deviceState.panOffsetX}%, ${deviceState.panOffsetY}%)` : `scale(${deviceState.zoom})`) : undefined;

  const baseRadiusPx = settings.bannerFloating && deviceState.borderRadiusPx === 0 && settings.borderRadiusPx === undefined ? 24 : deviceState.borderRadiusPx;
  const borderRadiusCss = settings.usePerCornerRadius
    ? `${settings.borderRadiusTlPx ?? baseRadiusPx}px ${settings.borderRadiusTrPx ?? baseRadiusPx}px ${settings.borderRadiusBrPx ?? baseRadiusPx}px ${settings.borderRadiusBlPx ?? baseRadiusPx}px`
    : `${baseRadiusPx}px`;
  const effectiveTitlePx = profile.customTitleFontSizePx ?? deviceState.titleSizePx;
  const effectiveSubtitlePx = profile.customSubtitleFontSizePx ?? deviceState.subtitleSizePx;
  const ctaShadowCss = isMinimal ? undefined : resolveHeroBoxShadowCss(settings.ctaShadow, config.colors.buttonBgColor, settings.ctaShadowColor);

  return (
    <div
      style={{
        paddingLeft: isEdgeToEdge ? "0px" : `${deviceState.marginHorizontalPx}px`,
        paddingRight: isEdgeToEdge ? "0px" : `${deviceState.marginHorizontalPx}px`,
        paddingTop: `${deviceState.marginVerticalPx}px`, paddingBottom: `${deviceState.marginVerticalPx}px`,
      }}
      className="w-full max-w-full overflow-visible"
    >
      <div
        data-testid="hero-model-cinema-full" data-hero-style="HeroFullBleed"
        data-cinematic-viewport={deviceState.viewport} data-cinematic-width={isEdgeToEdge ? "full" : config.layout.widthMode}
        className="relative w-full max-w-full overflow-hidden select-none"
        style={{
          height: `${deviceState.heightPx}px`, borderRadius: borderRadiusCss,
          backgroundColor: config.colors.backdropColor, boxShadow: bannerShadowCss,
          border: resolveHeroBorderCss(settings, isEdgeToEdge),
        }}
      >
        <div
          data-sub-element="background" title={isEditable ? "Cliquer pour changer la photo" : undefined}
          onClick={(e) => selectSub(e, "background")}
          className={`absolute inset-0 w-full h-full overflow-hidden ${isEditable ? "cursor-pointer" : ""} ${getSubRing("background")}`}
          style={{ backgroundColor: settings.imageStudioBg || config.colors.backdropColor }}
        >
          <img
            data-testid="hero-pure-photo" src={resolvedSrc} alt={config.image.alt || cleanTitle || "Image principale de la bannière"}
            referrerPolicy="no-referrer" onError={() => { if (!imgError) setImgError(true); }}
            style={{ objectPosition: `${deviceState.focalX}% ${deviceState.focalY}%`, transform: imgTransform, transformOrigin: `${deviceState.focalX}% ${deviceState.focalY}%`, filter: filterCss }}
            className={`w-full h-full ${deviceState.imageFit === "contain" ? "object-contain p-2.5 sm:p-4" : "object-cover"} transition-transform duration-500`}
          />
        </div>

        {overlayCss.bannerOverlayBackground && (
          <div data-testid="cinematic-directional-veil" aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5] transition-all duration-300" style={{ background: overlayCss.bannerOverlayBackground }} />
        )}

        <HeroCompositionGuides isEditable={isEditable} showGuides={config.layout.showCompositionGuides} safePaddingPx={deviceState.innerPaddingPx} />

        <div className={`relative z-10 w-full h-full flex ${posFlex} pointer-events-none overflow-hidden`} style={{ padding: `${deviceState.innerPaddingPx}px` }}>
          <div
            data-testid="cinematic-localized-veil"
            data-text-frame-enabled={String(textFrame.enabled)}
            className="pointer-events-auto rounded-2xl transition-all max-w-full"
            style={{
              marginLeft: `${deviceState.textBlockMarginX}px`, marginRight: `${deviceState.textBlockMarginX}px`,
              marginTop: `${deviceState.textBlockMarginY}px`, marginBottom: `${deviceState.textBlockMarginY}px`,
              padding: overlayCss.textScrimBackground ? "20px 24px" : "0px", background: overlayCss.textScrimBackground || "transparent",
              ...(textFrame.enabled ? textFrame.frameStyle : {}),
            }}
          >
            <div data-testid="hero-minimal-text-cluster" style={{ maxWidth: `${deviceState.titleMaxWidthPx}px`, gap: `${deviceState.textVerticalGapPx}px`, textShadow: textShadowCss }} className={`flex flex-col w-full max-w-full ${alignClass}`}>
              {showTitle && (
                <div data-sub-element="title" onClick={(e) => selectSub(e, "title")} className={`max-w-full ${getSubRing("title")}`}>
                  <EditorialHeading
                    text={cleanTitle} as="h1" theme={theme} sectionStyles={sectionStyles} accentColorOverride={theme.accentColor || theme.primaryColor}
                    style={{
                      fontFamily: resolvedTitleFont, fontSize: `${effectiveTitlePx}px`, fontWeight: config.typography.titleWeight,
                      lineHeight: config.typography.titleLineHeight, letterSpacing: `${config.typography.titleLetterSpacingEm}em`,
                      color: config.colors.titleColor, maxWidth: `${deviceState.titleMaxWidthPx}px`,
                      ...wordTitleStyle,
                    }}
                    className="line-clamp-2 text-balance break-words"
                  />
                </div>
              )}

              {showSubtitle && (
                <p
                  data-testid="cinematic-subtitle" data-sub-element="subtitle" onClick={(e) => selectSub(e, "subtitle")}
                  style={{
                    color: config.colors.subtitleColor, fontSize: `${effectiveSubtitlePx}px`, fontWeight: config.typography.subtitleWeight,
                    lineHeight: config.typography.subtitleLineHeight, maxWidth: `${deviceState.subtitleMaxWidthPx}px`,
                    ...wordSubtitleStyle,
                  }}
                  className={`opacity-95 break-words ${getSubRing("subtitle")}`}
                >
                  {config.subtitle}
                </p>
              )}

              {showCta && (
                <div className="pt-1 flex flex-wrap items-center gap-2.5 max-w-full">
                  <a
                    data-testid="hero-single-cta-btn" data-button-shape={shape} data-destination-type={config.button.targetType} data-destination-valid={String(destination.isValid)}
                    href={isEditable ? undefined : destination.resolvedHref} data-sub-element="ctaPrimary" title={isEditable ? "Cliquer pour modifier ce bouton" : undefined}
                    onClick={(e) => { if (isEditable) { e.preventDefault(); selectSub(e, "ctaPrimary"); return; } handleSmartLinkClick(destination.resolvedHref, e, cleanTitle); }}
                    style={{
                      fontFamily: resolvedButtonFont, fontSize: `${btnFontSizePx}px`, fontWeight: config.button.fontWeight, letterSpacing: `${config.button.letterSpacingEm}em`,
                      paddingLeft: `${btnPadX}px`, paddingRight: `${btnPadX}px`, paddingTop: `${btnPadY}px`, paddingBottom: `${btnPadY}px`,
                      backgroundColor: isOutline || isMinimal ? "transparent" : config.colors.buttonBgColor,
                      color: isOutline || isMinimal ? config.colors.buttonTextColor || config.colors.titleColor : config.colors.buttonTextColor,
                      borderColor: config.colors.buttonBorderColor || config.colors.titleColor,
                      borderWidth: isMinimal ? "0px" : `${isOutline ? Math.max(1, config.button.borderWidthPx || 2) : config.button.borderWidthPx}px`,
                      borderStyle: isMinimal ? "none" : isOutline || config.button.borderWidthPx > 0 ? "solid" : "none",
                      borderBottom: isMinimal ? `2px solid ${config.colors.buttonBorderColor || config.colors.titleColor}` : undefined,
                      borderRadius: `${btnRadiusPx}px`, boxShadow: ctaShadowCss,
                    }}
                    className={`inline-flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 max-w-full truncate cursor-pointer ${getSubRing("ctaPrimary")}`}
                  >
                    <span className="truncate">{ctaLabel}</span>
                    {config.button.showArrow !== false && <ArrowRight className="w-3.5 h-3.5 shrink-0" />}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
