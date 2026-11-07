import React from "react";
import {
  CustomPageSection,
  HeroBannerSettings,
  CustomPageTheme,
  HeroSubElement,
} from "../../../domains/seller/customPage.types";
import {
  resolveBorderRadiusClass,
  resolveShadowClass,
  resolveContainerWidthClass,
  resolveAnimationClass,
  resolveSectionPaddingX,
  resolveSectionPaddingY,
  SectionDividerRenderer,
} from "./sectionStyleHelper";
import { useStudioStore } from "../../../pages/Seller/StoreBuilder/store/useStudioStore";
import { resolveBannerPosition } from "../../../pages/Seller/StoreBuilder/components/inspector/controls/AlignmentMatrix3x3";
import { EditorialHeading } from "../EditorialHeading";
import { RotatingSealBadge } from "../RotatingSealBadge";
import {
  ArtisticAtmosphereLayer,
  resolveCardMaterialClasses,
} from "../ArtisticAtmosphereLayer";
import { resolveEffectiveFrameShape } from "../ArtisticFrameWrapper";
import { HeroCanvasSubToolbar } from "./HeroCanvasSubToolbar";
import { HeroEditorialSplitView } from "./HeroEditorialSplitView";
import {
  getContrastingTextColor,
  resolveHeroBadgeVisuals,
  resolveHeroButtonVisuals,
  resolveHeroFrameShapeVisuals,
  resolveHeroImageShadow,
  resolveHeroTextShadowStyle,
  resolveHeroTitleSizeClasses,
} from "./heroBannerStyleHelpers";
import { handleSmartLinkClick } from "./safeNavigationHref";

interface SectionHeroBannerProps {
  section: CustomPageSection<"hero_banner">;
  theme: CustomPageTheme;
  isEditable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  previewViewport?: "mobile" | "tablet" | "desktop";
}

const DEFAULT_HERO_FALLBACK =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80";

function resolveHeroImageSource(
  settings: HeroBannerSettings,
  previewViewport: "mobile" | "tablet" | "desktop"
): string {
  const mobileSrc = settings.mobileImageUrl || settings.backgroundImageMobile || "";
  if (previewViewport === "mobile" && mobileSrc) return mobileSrc;
  const bgImg = settings.backgroundImage || "";
  const imgUrl = settings.imageUrl || "";
  if (bgImg && (!imgUrl || imgUrl.startsWith("data:image/svg+xml") || (imgUrl === DEFAULT_HERO_FALLBACK && bgImg !== DEFAULT_HERO_FALLBACK))) {
    return bgImg;
  }
  return imgUrl || bgImg || DEFAULT_HERO_FALLBACK;
}

const HEIGHT_DESKTOP_MAP: Record<string, number> = { sm: 340, md: 480, lg: 560, xl: 660 };
const HEIGHT_MOBILE_MAP: Record<string, number> = { sm: 260, md: 360, lg: 440 };

export const SectionHeroBanner: React.FC<SectionHeroBannerProps> = ({
  section,
  theme,
  isEditable,
  isSelected,
  onSelect,
  previewViewport = "desktop",
}) => {
  const settings: HeroBannerSettings = section.settings;
  const styles = section.styles || {};

  const selectSection = useStudioStore((s) => s.selectSection);
  const setActiveInspectorTab = useStudioStore((s) => s.setActiveInspectorTab);
  const hoverElement = useStudioStore((s) => s.hoverElement);
  const selectedSectionId = useStudioStore((s) => s.selectedSectionId);
  const selectedSubElement = useStudioStore((s) => s.selectedSubElement);
  const hoveredSectionId = useStudioStore((s) => s.hoveredSectionId);
  const hoveredSubElement = useStudioStore((s) => s.hoveredSubElement);

  const activeSubElement: HeroSubElement | null =
    selectedSectionId === section.id &&
    (selectedSubElement === "background" ||
      selectedSubElement === "badge" ||
      selectedSubElement === "title" ||
      selectedSubElement === "subtitle" ||
      selectedSubElement === "cta" ||
      selectedSubElement === "ctaPrimary" ||
      selectedSubElement === "ctaSecondary")
      ? selectedSubElement === "ctaPrimary"
        ? "cta"
        : selectedSubElement
      : null;

  const triggerSubElementFocus = (el: HeroSubElement, e?: React.MouseEvent) => {
    if (!isEditable) return;
    if (e) e.stopPropagation();
    onSelect?.();
    setActiveInspectorTab("content");
    selectSection(section.id, el);
  };

  const isSubHovered = (el: HeroSubElement) =>
    isEditable && hoveredSectionId === section.id && hoveredSubElement === el;

  const posDesktop = settings.imagePositionDesktop || settings.backgroundPosition || "50% 30%";
  const activeObjectPosition =
    previewViewport === "mobile"
      ? settings.imagePositionMobile || settings.backgroundPositionMobile || posDesktop
      : previewViewport === "tablet"
      ? settings.imagePositionTablet || settings.backgroundPositionTablet || posDesktop
      : posDesktop;

  const activeImageSrc = resolveHeroImageSource(settings, previewViewport);
  const accentColor = theme.accentColor || theme.primaryColor || "#B45309";
  const sectionBg = styles.backgroundColor || theme.canvasColor || "#FAF6F0";
  const rawCtaBg = settings.ctaBgColor || styles.buttonBgColor || accentColor;
  const resolvedCtaBg =
    rawCtaBg.toLowerCase() === sectionBg.toLowerCase()
      ? styles.buttonBgColor && styles.buttonBgColor.toLowerCase() !== sectionBg.toLowerCase()
        ? styles.buttonBgColor
        : getContrastingTextColor(sectionBg)
      : rawCtaBg;
  const resolvedCtaText =
    settings.ctaTextColor && resolvedCtaBg === rawCtaBg
      ? settings.ctaTextColor
      : styles.buttonTextColor && resolvedCtaBg === styles.buttonBgColor
      ? styles.buttonTextColor
      : getContrastingTextColor(resolvedCtaBg);

  const effectiveHeroLayout = settings.heroLayout || "editorial-split";

  if (effectiveHeroLayout === "editorial-split" || effectiveHeroLayout === "atelier-collage") {
    return (
      <div className="flex flex-col">
        {isEditable && isSelected && (
          <HeroCanvasSubToolbar
            activeSubElement={activeSubElement}
            activeObjectPosition={activeObjectPosition}
            onSelectSubElement={triggerSubElementFocus}
          />
        )}
        <HeroEditorialSplitView
          settings={settings}
          styles={styles}
          theme={theme}
          activeImageSrc={activeImageSrc}
          activeObjectPosition={activeObjectPosition}
          resolvedCtaBg={resolvedCtaBg}
          resolvedCtaText={resolvedCtaText}
          isEditable={isEditable}
          activeSubElement={activeSubElement}
          onTriggerSubElement={triggerSubElementFocus}
        />
      </div>
    );
  }

  const baseMinHeight =
    previewViewport === "mobile"
      ? HEIGHT_MOBILE_MAP[settings.bannerHeightMobile || "md"] || 360
      : HEIGHT_DESKTOP_MAP[settings.bannerHeightDesktop || "lg"] || 540;

  const effectiveShape = resolveEffectiveFrameShape(theme, styles.frameShape);
  const frameVis = resolveHeroFrameShapeVisuals(effectiveShape, styles.borderRadius);
  const cardMatClass = resolveCardMaterialClasses(theme.cardMaterial, styles.cardMaterial, true);
  const badgeVis = resolveHeroBadgeVisuals(settings, accentColor, "solid", true);
  const titleSizeClass = resolveHeroTitleSizeClasses(settings.titleSizeDesktop, settings.titleSizeMobile);
  const titleShadowStyle = resolveHeroTextShadowStyle(settings.textShadow || "md");
  const primaryBtnVis = resolveHeroButtonVisuals(
    settings.ctaStyle,
    resolvedCtaBg,
    resolvedCtaText,
    settings.ctaShadow,
    Boolean(settings.ctaTextColor),
    true
  );
  const secBg = settings.secondaryCtaBgColor || "#FFFFFF";
  const secText = settings.secondaryCtaTextColor || getContrastingTextColor(secBg);
  const secondaryBtnVis = resolveHeroButtonVisuals(
    settings.secondaryCtaStyle || "glass",
    secBg,
    secText,
    settings.secondaryCtaShadow || "none",
    Boolean(settings.secondaryCtaTextColor),
    true
  );
  const imgShadow = resolveHeroImageShadow(settings.imageShadow || "none", accentColor);

  const showBadge = settings.showBadge !== false && Boolean(settings.badgeText);
  const showSubtitle = settings.showSubtitle !== false && Boolean(settings.subtitle);
  const showCta = settings.showCta !== false && Boolean(settings.ctaText);
  const showSecondaryCta = settings.showSecondaryCta !== false && Boolean(settings.secondaryCtaText);
  const showSeal = settings.showSocialProofBadge === true;
  const overlayAlpha = Math.min(90, Math.max(0, Number(settings.overlayOpacity ?? 40))) / 100;
  const imageMargin = typeof settings.imageMargin === "number" ? Math.max(0, settings.imageMargin) : 0;
  const isContain = settings.imageFit === "contain";
  const hasClip = Boolean(frameVis.clipStyle);

  const bannerPos = resolveBannerPosition(
    settings.contentPosition,
    settings.textAlignment || "center",
    settings.verticalAlignment || "bottom"
  );
  const btnJustifyClass =
    bannerPos.horizontal === "left" ? "justify-start" : bannerPos.horizontal === "right" ? "justify-end" : "justify-center";
  const padY = resolveSectionPaddingY(styles.paddingY);
  const padX = resolveSectionPaddingX(styles.paddingX);

  return (
    <div
      className="flex flex-col relative"
      style={{
        backgroundColor: imageMargin > 0 ? sectionBg : undefined,
        padding: imageMargin > 0 ? `${imageMargin}px` : undefined,
        ...(hasClip ? imgShadow.dropShadowStyle : {}),
      }}
    >
      {isEditable && isSelected && (
        <HeroCanvasSubToolbar
          activeSubElement={activeSubElement}
          activeObjectPosition={activeObjectPosition}
          onSelectSubElement={triggerSubElementFocus}
        />
      )}

      <div
        onClick={isEditable ? (e) => triggerSubElementFocus("background", e) : undefined}
        style={{ ...(hasClip ? {} : imgShadow.style), ...frameVis.clipStyle }}
        className={`relative overflow-hidden transition-all select-none text-white bg-slate-950 ${frameVis.frameClass || resolveBorderRadiusClass(styles.borderRadius)} ${resolveShadowClass(styles.shadow)} ${hasClip ? "" : imgShadow.className} ${resolveAnimationClass(styles.animation)}${isEditable && !isSelected ? " cursor-pointer" : ""}`}
      >
        <div className="absolute inset-0 z-0">
          {isContain && activeImageSrc && (
            <img src={activeImageSrc} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-45" />
          )}
          <img
            src={activeImageSrc}
            alt={settings.title || "Bannière"}
            style={{ objectPosition: activeObjectPosition, objectFit: settings.imageFit || "cover" }}
            className="relative z-10 w-full h-full transition-all duration-300"
          />
          {styles.backgroundColor && (
            <div className="absolute inset-0 z-10 mix-blend-multiply opacity-35" style={{ backgroundColor: styles.backgroundColor }} />
          )}
          <div className="absolute inset-0 z-10" style={{ backgroundColor: `rgba(15, 23, 42, ${overlayAlpha})` }} />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        </div>

        <ArtisticAtmosphereLayer theme={theme} sectionStyles={styles} />

        <div
          style={{ minHeight: `${baseMinHeight}px`, paddingTop: `${padY}px`, paddingBottom: `${padY}px`, paddingLeft: `${padX}px`, paddingRight: `${padX}px` }}
          className={`relative z-20 flex flex-col ${resolveContainerWidthClass(styles.containerWidth)} ${bannerPos.flexContainerClass}`}
        >
          <div className={cardMatClass ? `p-6 @md:p-8 rounded-3xl flex flex-col ${bannerPos.flexContainerClass} ${cardMatClass}` : `flex flex-col ${bannerPos.flexContainerClass}`}>
            {showBadge && (
              <span
                onMouseEnter={isEditable ? () => hoverElement(section.id, "badge") : undefined}
                onMouseLeave={isEditable ? () => hoverElement(section.id, null) : undefined}
                onClick={(e) => triggerSubElementFocus("badge", e)}
                style={badgeVis.style}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] mb-4 ${badgeVis.className}`}
              >
                {settings.badgeText}
              </span>
            )}

            <EditorialHeading
              as="h1"
              text={settings.title || "Titre de votre boutique"}
              theme={theme}
              sectionStyles={styles}
              onClick={(e) => triggerSubElementFocus("title", e)}
              style={{ color: settings.titleColor || "#FFFFFF", ...titleShadowStyle }}
              className={`${titleSizeClass} font-extrabold tracking-tight mb-3 max-w-3xl break-words rounded-lg px-2 py-0.5 ${isEditable && (isSubHovered("title") || activeSubElement === "title") ? "bg-white/10 ring-1 ring-white/80" : ""}`}
            />

            {showSubtitle && (
              <p
                onClick={(e) => triggerSubElementFocus("subtitle", e)}
                style={{ color: settings.subtitleColor || "#F8FAFC" }}
                className="text-sm @3xl:text-base opacity-90 max-w-2xl mb-7 font-medium leading-relaxed break-words"
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
                      triggerSubElementFocus("cta", e);
                    } else {
                      handleSmartLinkClick(settings.ctaLink || "#catalog", e, settings.ctaText || settings.title);
                    }
                  }}
                  className={`inline-flex items-center justify-center px-7 py-3.5 text-xs @3xl:text-sm font-bold uppercase tracking-[0.15em] ${primaryBtnVis.className}`}
                  style={primaryBtnVis.style}
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
                      triggerSubElementFocus("ctaSecondary", e);
                    } else {
                      handleSmartLinkClick(settings.secondaryCtaLink || "#catalog", e, settings.secondaryCtaText || settings.title);
                    }
                  }}
                  className={`inline-flex items-center justify-center px-6 py-3.5 text-xs @3xl:text-sm font-semibold ${secondaryBtnVis.className}`}
                  style={secondaryBtnVis.style}
                >
                  {settings.secondaryCtaText}
                </a>
              )}
            </div>
          </div>
        </div>

        {showSeal && (
          <RotatingSealBadge
            text={settings.socialProofBadge || "FAIT MAIN EN ALGÉRIE • ÉDITION LIMITÉE •"}
            accentColor={accentColor}
            surfaceColor="#0F172A"
            textColor="#F8FAFC"
            className="absolute bottom-5 right-5 z-30"
          />
        )}

        <SectionDividerRenderer divider={styles.divider} color="#FFFFFF" theme={theme} />
      </div>
    </div>
  );
};
