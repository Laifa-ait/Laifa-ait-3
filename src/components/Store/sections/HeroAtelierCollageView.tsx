import React from "react";
import { Camera } from "lucide-react";
import {
  CustomPageSectionStyles,
  CustomPageTheme,
  HeroBannerSettings,
  HeroSubElement,
} from "../../../domains/seller/customPage.types";
import { EditorialHeading } from "../EditorialHeading";
import { RotatingSealBadge } from "../RotatingSealBadge";
import {
  ArtisticAtmosphereLayer,
  resolveCardMaterialClasses,
} from "../ArtisticAtmosphereLayer";
import { resolveEffectiveFrameShape } from "../ArtisticFrameWrapper";
import {
  SectionDividerRenderer,
  resolveAnimationClass,
  resolveBorderRadiusClass,
  resolveContainerWidthClass,
  resolveSectionPaddingX,
  resolveSectionPaddingY,
  resolveShadowClass,
} from "./sectionStyleHelper";
import {
  getContrastingTextColor,
  resolveHeroAspectClass,
  resolveHeroBadgeVisuals,
  resolveHeroButtonVisuals,
  resolveHeroFrameShapeVisuals,
  resolveHeroImageShadow,
  resolveHeroTextShadowStyle,
  resolveHeroTitleSizeClasses,
  resolveReadableHeroTextColor,
} from "./heroBannerStyleHelpers";
import { isDarkColor } from "./themeColorUtils";
import { resolveBannerPosition } from "../../../pages/Seller/StoreBuilder/components/inspector/controls/AlignmentMatrix3x3";
import { handleSmartLinkClick } from "./safeNavigationHref";

interface HeroAtelierCollageViewProps {
  settings: HeroBannerSettings;
  styles: CustomPageSectionStyles;
  theme: CustomPageTheme;
  activeImageSrc: string;
  activeObjectPosition: string;
  resolvedCtaBg: string;
  resolvedCtaText: string;
  isEditable?: boolean;
  activeSubElement: HeroSubElement | null;
  onTriggerSubElement: (el: HeroSubElement, e?: React.MouseEvent) => void;
}

export const HeroAtelierCollageView: React.FC<HeroAtelierCollageViewProps> = ({
  settings,
  styles,
  theme,
  activeImageSrc,
  activeObjectPosition,
  resolvedCtaBg,
  resolvedCtaText,
  isEditable,
  activeSubElement,
  onTriggerSubElement,
}) => {
  const effectiveShape = resolveEffectiveFrameShape(theme, styles.frameShape);
  const accentColor = theme.accentColor || theme.primaryColor || "#B45309";
  const sectionBg = styles.backgroundColor || theme.canvasColor || "#FAF6F0";
  const isDarkSection = isDarkColor(sectionBg);
  const sectionText =
    styles.textColor || (isDarkSection ? "#F8FAFC" : theme.secondaryColor || "#18181B");
  const effectiveAccent =
    isDarkSection && accentColor.toLowerCase() === sectionBg.toLowerCase()
      ? "#FDE68A"
      : accentColor;
  const surfaceColor = isDarkSection ? "#18181B" : theme.surfaceColor || "#FFFFFF";

  const showBadge = settings.showBadge !== false && Boolean(settings.badgeText);
  const showSubtitle = settings.showSubtitle !== false && Boolean(settings.subtitle);
  const showCta = settings.showCta !== false && Boolean(settings.ctaText);
  const showSecondaryCta =
    settings.showSecondaryCta !== false && Boolean(settings.secondaryCtaText);
  const showSeal = settings.showSocialProofBadge !== false;

  const badgeVis = resolveHeroBadgeVisuals(settings, effectiveAccent, "soft", isDarkSection);
  const titleSizeClass = resolveHeroTitleSizeClasses(
    settings.titleSizeDesktop,
    settings.titleSizeMobile
  );
  const titleShadowStyle = resolveHeroTextShadowStyle(settings.textShadow);
  const primaryBtnVis = resolveHeroButtonVisuals(
    settings.ctaStyle,
    resolvedCtaBg,
    resolvedCtaText,
    settings.ctaShadow,
    Boolean(settings.ctaTextColor),
    isDarkSection
  );
  const secBg = settings.secondaryCtaBgColor || sectionText;
  const secText = settings.secondaryCtaTextColor || getContrastingTextColor(secBg);
  const secondaryBtnVis = resolveHeroButtonVisuals(
    settings.secondaryCtaStyle || "outline",
    secBg,
    secText,
    settings.secondaryCtaShadow || "none",
    Boolean(settings.secondaryCtaTextColor),
    isDarkSection
  );

  const imgShadow = resolveHeroImageShadow(settings.imageShadow, effectiveAccent);
  const frameVis = resolveHeroFrameShapeVisuals(effectiveShape, styles.borderRadius);
  const aspectClass = resolveHeroAspectClass(settings.imageAspectRatio);
  const cardMatClass = resolveCardMaterialClasses(
    theme.cardMaterial,
    styles.cardMaterial,
    isDarkSection
  );
  const defaultCardSurfaceClass = isDarkSection
    ? "backdrop-blur-xl bg-black/22 border border-white/25 shadow-[0_20px_60px_rgba(0,0,0,0.22)]"
    : "backdrop-blur-xl bg-white/88 border border-white/60 shadow-[0_20px_60px_rgba(15,23,42,0.08)]";

  const resolvedTitleColor = resolveReadableHeroTextColor(
    settings.titleColor,
    sectionText,
    isDarkSection
  );
  const resolvedSubtitleColor = resolveReadableHeroTextColor(
    settings.subtitleColor,
    sectionText,
    isDarkSection
  );

  const bannerPos = resolveBannerPosition(
    settings.contentPosition,
    settings.textAlignment || "center",
    settings.verticalAlignment || "center"
  );
  const alignItemsClass =
    bannerPos.horizontal === "left"
      ? "items-start text-left"
      : bannerPos.horizontal === "right"
      ? "items-end text-right"
      : "items-center text-center";
  const vAlignGridClass =
    bannerPos.vertical === "top"
      ? "items-start"
      : bannerPos.vertical === "bottom"
      ? "items-end"
      : "items-center";
  const btnJustifyClass =
    bannerPos.horizontal === "left"
      ? "justify-start"
      : bannerPos.horizontal === "right"
      ? "justify-end"
      : "justify-center";

  const padY = resolveSectionPaddingY(styles.paddingY);
  const padX = resolveSectionPaddingX(styles.paddingX);
  const imageMargin =
    typeof settings.imageMargin === "number" ? Math.max(0, settings.imageMargin) : 0;
  const overlayAlpha = Math.min(85, Math.max(0, Number(settings.overlayOpacity ?? 0))) / 100;
  const isContain = settings.imageFit === "contain";
  const hasClip = Boolean(frameVis.clipStyle);

  const renderCollagePhoto = (rotateClass: string, showPhotoBadge: boolean) => (
    <div
      onClick={(e) => onTriggerSubElement("background", e)}
      style={{ ...(hasClip ? {} : imgShadow.style), ...frameVis.clipStyle }}
      className={`relative ${aspectClass} w-full overflow-hidden border border-black/5 ${rotateClass} cursor-pointer ${frameVis.frameClass} ${hasClip ? "" : imgShadow.className}`}
    >
      {isContain && activeImageSrc && (
        <img
          src={activeImageSrc}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-40"
        />
      )}
      <img
        src={activeImageSrc}
        alt={settings.title || "Atelier"}
        style={{
          objectPosition: activeObjectPosition,
          objectFit: settings.imageFit || "cover",
        }}
        className="relative z-10 w-full h-full"
      />
      {overlayAlpha > 0 && (
        <div
          className="pointer-events-none absolute inset-0 z-20"
          style={{ backgroundColor: `rgba(15, 23, 42, ${overlayAlpha * 0.6})` }}
        />
      )}
      {showPhotoBadge && isEditable && (
        <span className="absolute top-3 right-3 z-30 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/65 text-white text-[10px] font-bold backdrop-blur-sm">
          <Camera className="w-3 h-3" />
          <span>Photo</span>
        </span>
      )}
    </div>
  );

  return (
    <div
      style={{
        backgroundColor: sectionBg,
        color: sectionText,
        paddingTop: `${padY}px`,
        paddingBottom: `${padY}px`,
        paddingLeft: `${padX}px`,
        paddingRight: `${padX}px`,
      }}
      className={`relative overflow-hidden transition-all ${resolveBorderRadiusClass(
        styles.borderRadius
      )} ${resolveShadowClass(styles.shadow)} ${resolveAnimationClass(styles.animation)}`}
    >
      <ArtisticAtmosphereLayer theme={theme} sectionStyles={styles} />

      <div
        className={`relative z-10 ${resolveContainerWidthClass(
          styles.containerWidth
        )} grid grid-cols-1 @3xl:grid-cols-12 gap-6 ${vAlignGridClass}`}
      >
        <div
          style={{
            padding: imageMargin > 0 ? `${imageMargin}px` : undefined,
            ...(hasClip ? imgShadow.dropShadowStyle : {}),
          }}
          className="hidden @3xl:block @3xl:col-span-3 w-full"
        >
          {renderCollagePhoto("-rotate-2", false)}
        </div>

        <div
          className={`@3xl:col-span-6 min-w-0 relative z-10 p-6 @md:p-9 rounded-3xl flex flex-col ${alignItemsClass} ${
            cardMatClass || defaultCardSurfaceClass
          }`}
        >
          {showBadge && (
            <span
              onClick={(e) => onTriggerSubElement("badge", e)}
              style={badgeVis.style}
              className={`inline-flex items-center gap-2 px-3.5 py-1 text-[10px] @md:text-[11px] font-bold uppercase tracking-[0.24em] mb-3 ${badgeVis.className} ${
                isEditable ? "cursor-pointer" : ""
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: badgeVis.dotColor }} />
              <span>{settings.badgeText}</span>
            </span>
          )}

          <EditorialHeading
            as="h1"
            text={settings.title || "L'Art de *Notre Maison*"}
            theme={theme}
            sectionStyles={styles}
            accentColorOverride={effectiveAccent}
            onClick={(e) => onTriggerSubElement("title", e)}
            style={{ color: resolvedTitleColor, ...titleShadowStyle }}
            className={`${titleSizeClass} font-extrabold tracking-tight leading-tight break-words mb-4 ${
              isEditable && activeSubElement === "title" ? "ring-2 ring-[#F97316] rounded-lg px-1" : ""
            }`}
          />

          {showSubtitle && (
            <p
              onClick={(e) => onTriggerSubElement("subtitle", e)}
              style={{ color: resolvedSubtitleColor }}
              className="text-xs @md:text-sm opacity-90 max-w-lg mb-6 leading-relaxed break-words"
            >
              {settings.subtitle}
            </p>
          )}

          <div className={`flex flex-wrap items-center gap-3 w-full ${btnJustifyClass}`}>
            {showCta && (
              <a
                href={settings.ctaLink || "#catalog"}
                onClick={(e) => {
                  if (isEditable) {
                    e.preventDefault();
                    onTriggerSubElement("cta", e);
                  } else {
                    handleSmartLinkClick(settings.ctaLink || "#catalog", e, settings.ctaText || settings.title);
                  }
                }}
                style={primaryBtnVis.style}
                className={`inline-flex items-center justify-center px-7 py-3.5 text-xs @md:text-sm font-bold uppercase tracking-[0.16em] transition-all hover:opacity-95 ${primaryBtnVis.className}`}
              >
                {settings.ctaText}
              </a>
            )}

            {showSecondaryCta && (
              <a
                href={settings.secondaryCtaLink || "#catalog"}
                onClick={(e) => {
                  if (isEditable) {
                    e.preventDefault();
                    onTriggerSubElement("ctaSecondary", e);
                  } else {
                    handleSmartLinkClick(settings.secondaryCtaLink || "#catalog", e, settings.secondaryCtaText || settings.title);
                  }
                }}
                style={secondaryBtnVis.style}
                className={`inline-flex items-center justify-center px-6 py-3 text-xs @md:text-sm font-semibold transition-all ${secondaryBtnVis.className}`}
              >
                {settings.secondaryCtaText}
              </a>
            )}
          </div>
        </div>

        <div
          style={{
            padding: imageMargin > 0 ? `${imageMargin}px` : undefined,
            ...(hasClip ? imgShadow.dropShadowStyle : {}),
          }}
          className="@3xl:col-span-3 w-full relative"
        >
          {renderCollagePhoto("rotate-1", true)}
          {showSeal && (
            <RotatingSealBadge
              text={settings.socialProofBadge || "FAIT MAIN EN ALGÉRIE • ÉDITION LIMITÉE •"}
              accentColor={effectiveAccent}
              surfaceColor={surfaceColor}
              textColor={isDarkSection ? "#F8FAFC" : sectionText}
              className="absolute -bottom-3 -left-2 z-30"
            />
          )}
        </div>
      </div>

      <SectionDividerRenderer divider={styles.divider} color={effectiveAccent} theme={theme} />
    </div>
  );
};
