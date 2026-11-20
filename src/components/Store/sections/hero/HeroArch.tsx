import React from "react";
import { HeroArchShapeId } from "../../../../domains/seller/customPage.types";
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

function resolveArchShapeClasses(shape: HeroArchShapeId): {
  className: string;
  style?: React.CSSProperties;
} {
  switch (shape) {
    case "capsule":
      return { className: "rounded-full shadow-sm border border-black/10" };
    case "asymmetric-leaf":
      return {
        className: "shadow-sm border border-black/10",
        style: { borderRadius: "80px 16px 80px 16px" },
      };
    case "floating-frame":
      return { className: "rounded-3xl shadow-md border border-black/10" };
    case "roman-arch":
    default:
      return {
        className: "shadow-sm border border-black/10",
        style: { borderRadius: "999px 999px 20px 20px" },
      };
  }
}

/**
 * STYLE 3 : "ARCHE & FORME ORGANIQUE" (HeroArch)
 */
export const HeroArch: React.FC<HeroArchitecturalStyleProps> = ({
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

  const shapeSpec = resolveArchShapeClasses(profile.archShape);
  const posFlex = resolvePosition9FlexClasses(profile.textPosition9);
  const safePad = Math.max(24, profile.innerPaddingPx);
  const cleanTitle = sanitizeHeroTitle(settings.title, settings.spotlightProductTitle);
  const borderRadiusCss = resolveHeroBorderRadiusCss(settings, profile);
  const bgStyle = resolveHeroBackgroundStyle(settings, theme, theme.canvasColor);
  const bannerShadowCss = resolveBannerEffectiveShadow(settings, theme);
  const imageShadowCss = resolveHeroBoxShadowCss(
    settings.imageShadow,
    resolveHeroShadowAccentColor(settings, theme, settings.imageShadow === "glow"),
    settings.imageShadowColor
  );

  return (
    <div
      data-testid="hero-model-arch-palace"
      data-hero-style="HeroArch"
      className={`relative grid grid-cols-1 ${!isMobile ? "@2xl:grid-cols-12" : ""} items-center gap-6 @2xl:gap-10 overflow-hidden`}
      style={{
        minHeight: `${profile.heightPx}px`,
        padding: `${safePad}px`,
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

      {/* BLOC D'ÉCRITURE STYLE GALERIE D'ART */}
      {!settings.hideAllText && (
        <div
          className={`${textColClass} ${textFirstOnMobile ? "order-1" : "order-2"} ${
            !isMobile ? (imageOnLeft ? "@2xl:order-2" : "@2xl:order-1") : ""
          } flex ${posFlex} w-full h-full`}
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

      {/* DÉCOUPE GÉOMÉTRIQUE ORGANIQUE DE LA PHOTOGRAPHIE */}
      <div
        className={`${settings.hideAllText ? "@2xl:col-span-12 max-w-2xl mx-auto" : imgColClass} ${textFirstOnMobile ? "order-2" : "order-1"} ${
          !isMobile ? (imageOnLeft ? "@2xl:order-1" : "@2xl:order-2") : ""
        } flex items-center justify-center w-full`}
      >
        <div
          data-testid={`hero-arch-shape-${profile.archShape}`}
          className={`w-full overflow-hidden ${shapeSpec.className} ${getSubRing("background")}`}
          style={{
            height: `${Math.max(220, profile.heightPx - safePad * 2)}px`,
            boxShadow: imageShadowCss,
            ...shapeSpec.style,
          }}
        >
          <HeroPurePhoto
            src={profile.activeImageSrc}
            alt={settings.imageAlt || cleanTitle || "Photographie Arche Organique"}
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
    </div>
  );
};
