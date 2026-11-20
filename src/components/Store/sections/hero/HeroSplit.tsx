import React from "react";
import {
  HeroArchitecturalStyleProps,
  HeroCompositionGuides,
  HeroMinimalTextBlock,
  HeroPurePhoto,
  resolvePosition9FlexClasses,
} from "./HeroMinimalTextAndGuides";
import { sanitizeHeroTitle } from "./heroResponsiveHelper";
import {
  resolveBannerEffectiveShadow,
  resolveHeroBackgroundStyle,
  resolveHeroBorderCss,
  resolveHeroBorderRadiusCss,
  resolveHeroBoxShadowCss,
  resolveHeroShadowAccentColor,
} from "./heroVisualEffectsHelper";

/**
 * STYLE 2 : "SPLIT ÉDITORIAL CÔTE-À-CÔTE" (HeroSplit)
 */
export const HeroSplit: React.FC<HeroArchitecturalStyleProps> = ({
  settings,
  sectionStyles,
  theme,
  profile,
  isEditable,
  isEdgeToEdge = false,
  activeSubElement,
  isSubSelected,
  selectSub,
  getSubRing,
  handleTextPatch,
}) => {
  const isMobile = profile.viewport === "mobile";
  const imageOnLeft = settings.imageSide === "left";
  const textFirstOnMobile = settings.mobileStackOrder === "text-first";
  const prop = profile.splitProportion;

  const imgColClass =
    prop === "70-30"
      ? "@2xl:col-span-8"
      : prop === "60-40"
        ? "@2xl:col-span-7"
        : "@2xl:col-span-6";
  const textColClass =
    prop === "70-30"
      ? "@2xl:col-span-4"
      : prop === "60-40"
        ? "@2xl:col-span-5"
        : "@2xl:col-span-6";

  const posFlex = resolvePosition9FlexClasses(profile.textPosition9);
  const safePad = Math.max(20, profile.innerPaddingPx);
  const cleanTitle = sanitizeHeroTitle(settings.title, settings.spotlightProductTitle);
  const borderRadiusCss = resolveHeroBorderRadiusCss(settings, profile);
  const bgStyle = resolveHeroBackgroundStyle(settings, theme, theme.surfaceColor);
  const bannerShadowCss = resolveBannerEffectiveShadow(settings, theme);
  const imageShadowCss = resolveHeroBoxShadowCss(
    settings.imageShadow,
    resolveHeroShadowAccentColor(settings, theme, settings.imageShadow === "glow"),
    settings.imageShadowColor
  );

  return (
    <div
      data-testid="hero-model-editorial-split"
      data-hero-style="HeroSplit"
      className={`relative grid grid-cols-1 ${!isMobile ? "@2xl:grid-cols-12" : ""} overflow-hidden`}
      style={{
        minHeight: `${profile.heightPx}px`,
        borderRadius: borderRadiusCss,
        boxShadow: bannerShadowCss,
        border: resolveHeroBorderCss(settings, isEdgeToEdge),
        ...bgStyle,
      }}
    >
      <HeroCompositionGuides
        isEditable={isEditable}
        showGuides={settings.showCompositionGuides}
        safePaddingPx={safePad}
      />

      {/* BLOC COULEUR & ÉCRITURE */}
      {!settings.hideAllText && (
        <div
          className={`${textColClass} ${textFirstOnMobile ? "order-1" : "order-2"} ${
            !isMobile ? (imageOnLeft ? "@2xl:order-2" : "@2xl:order-1") : ""
          } flex ${posFlex} w-full`}
          style={{ padding: `${safePad}px` }}
        >
          <HeroMinimalTextBlock
            settings={settings}
            sectionStyles={sectionStyles}
            theme={theme}
            profile={profile}
            isEditable={isEditable}
            activeSubElement={activeSubElement}
            isSubSelected={isSubSelected}
            selectSub={selectSub}
            getSubRing={getSubRing}
            handleTextPatch={handleTextPatch}
          />
        </div>
      )}

      {/* BLOC IMAGE 100% NETTE ET DÉGAGÉE */}
      <div
        className={`${settings.hideAllText ? "@2xl:col-span-12" : imgColClass} ${textFirstOnMobile ? "order-2" : "order-1"} ${
          !isMobile ? (imageOnLeft ? "@2xl:order-1" : "@2xl:order-2") : ""
        } relative w-full overflow-hidden ${getSubRing("background")}`}
        style={{
          minHeight: isMobile ? `${Math.max(220, Math.round(profile.heightPx * 0.65))}px` : `${profile.heightPx}px`,
          boxShadow: imageShadowCss,
        }}
      >
        <HeroPurePhoto
          src={profile.activeImageSrc}
          alt={settings.imageAlt || cleanTitle || "Photographie Split Éditorial"}
          fit={profile.imageFit}
          focalX={profile.focalX}
          focalY={profile.focalY}
          zoom={profile.zoom}
          studioBg={settings.imageStudioBg}
          settings={settings}
          onClick={(e) => selectSub(e, "background")}
        />
      </div>
    </div>
  );
};
