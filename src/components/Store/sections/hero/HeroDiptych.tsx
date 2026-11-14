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
  resolveHeroBackgroundStyle,
  resolveHeroBorderRadiusCss,
  resolveHeroBoxShadowCss,
} from "./heroVisualEffectsHelper";

/**
 * STYLE 5 : "DIPTYQUE / PANORAMIQUE DOUBLE VISUEL" (HeroDiptych)
 */
export const HeroDiptych: React.FC<HeroArchitecturalStyleProps> = ({
  settings,
  theme,
  profile,
  isEditable,
  activeSubElement,
  isSubSelected,
  selectSub,
  getSubRing,
  handleTextPatch,
}) => {
  const isMobile = profile.viewport === "mobile";
  const safePad = Math.max(16, profile.innerPaddingPx);
  const gapPx = Math.min(40, Math.max(8, profile.diptychGapPx || 16));
  const isCenteredOverlay =
    profile.textPosition9 === "center" ||
    profile.textPosition9 === "top-center" ||
    profile.textPosition9 === "bottom-center";
  const posFlex = resolvePosition9FlexClasses(profile.textPosition9);
  const cleanTitle = sanitizeHeroTitle(settings.title, settings.spotlightProductTitle);
  const borderRadiusCss = resolveHeroBorderRadiusCss(settings, profile);
  const bgStyle = resolveHeroBackgroundStyle(settings, theme, theme.surfaceColor);
  const bannerShadowCss = resolveHeroBoxShadowCss(settings.bannerShadow, theme.primaryColor);
  const imageShadowCss = resolveHeroBoxShadowCss(settings.imageShadow, theme.primaryColor);

  return (
    <div
      data-testid="hero-model-bento-hero"
      data-hero-style="HeroDiptych"
      className="relative w-full overflow-hidden border border-black/8"
      style={{
        minHeight: `${profile.heightPx}px`,
        padding: `${safePad}px`,
        borderRadius: borderRadiusCss,
        boxShadow: bannerShadowCss,
        borderColor: settings.bannerBorderColor || undefined,
        ...bgStyle,
      }}
    >
      <HeroCompositionGuides
        isEditable={isEditable}
        showGuides={settings.showCompositionGuides}
        safePaddingPx={safePad}
      />

      <div
        className={`grid grid-cols-1 ${
          !isMobile ? (isCenteredOverlay ? "@2xl:grid-cols-2" : "@2xl:grid-cols-12") : ""
        } items-stretch w-full`}
        style={{ gap: `${gapPx}px` }}
      >
        {/* SI LE TEXTE EST LATÉRAL (GAUCHE OU DROITE) */}
        {!isCenteredOverlay && !settings.hideAllText && (
          <div
            className={`${
              !isMobile
                ? profile.textPosition9.endsWith("right")
                  ? "@2xl:col-span-4 @2xl:order-3"
                  : "@2xl:col-span-4 @2xl:order-1"
                : "order-1"
            } flex ${posFlex} p-2 sm:p-4`}
          >
            <HeroMinimalTextBlock
              settings={settings}
              theme={theme}
              profile={profile}
              activeSubElement={activeSubElement}
              isSubSelected={isSubSelected}
              selectSub={selectSub}
              getSubRing={getSubRing}
              handleTextPatch={handleTextPatch}
            />
          </div>
        )}

        {/* LES 2 PHOTOGRAPHIES COMPLÉMENTAIRES CÔTE À CÔTE */}
        <div
          data-testid="hero-diptych-pair"
          className={`${
            !isMobile
              ? isCenteredOverlay
                ? "@2xl:col-span-2"
                : "@2xl:col-span-8 @2xl:order-2"
              : "order-2"
          } relative grid grid-cols-2 w-full`}
          style={{ gap: `${gapPx}px` }}
        >
          <div
            data-testid="hero-diptych-photo-1"
            className={`relative overflow-hidden rounded-2xl border border-black/8 ${getSubRing("background")}`}
            style={{
              height: `${Math.max(200, profile.heightPx - safePad * 2)}px`,
              boxShadow: imageShadowCss,
            }}
          >
            <HeroPurePhoto
              src={profile.activeImageSrc}
              alt={settings.imageAlt || cleanTitle || "Visuel Diptyque 1"}
              fit={profile.imageFit}
              focalX={profile.focalX}
              focalY={profile.focalY}
              zoom={profile.zoom}
              studioBg={settings.imageStudioBg}
              settings={settings}
              onClick={(e) => selectSub(e, "background")}
            />
          </div>

          <div
            data-testid="hero-diptych-photo-2"
            className="relative overflow-hidden rounded-2xl border border-black/8"
            style={{
              height: `${Math.max(200, profile.heightPx - safePad * 2)}px`,
              boxShadow: imageShadowCss,
            }}
          >
            <HeroPurePhoto
              src={profile.secondaryImageSrc}
              alt={settings.bentoTopCardTitle || cleanTitle || "Visuel Diptyque 2"}
              fit={profile.imageFit}
              focalX={profile.focalX}
              focalY={profile.focalY}
              zoom={profile.zoom}
              studioBg={settings.imageStudioBg}
              settings={settings}
              onClick={(e) => selectSub(e, "background")}
            />
          </div>

          {/* SI LE TEXTE EST EN BLOC CENTRAL ÉPURÉ ENTRE LES 2 VISUELS */}
          {isCenteredOverlay && !settings.hideAllText && (
            <div className={`col-span-2 @2xl:absolute @2xl:inset-0 z-10 flex ${posFlex} p-4 pointer-events-none`}>
              <div
                className="pointer-events-auto rounded-2xl border border-black/10 shadow-md backdrop-blur-md px-6 py-5"
                style={{
                  backgroundColor: settings.bannerBgColor
                    ? `${settings.bannerBgColor}F2`
                    : theme.surfaceColor
                      ? `${theme.surfaceColor}F2`
                      : "rgba(255, 255, 255, 0.95)",
                }}
              >
                <HeroMinimalTextBlock
                  settings={settings}
                  theme={theme}
                  profile={profile}
                  activeSubElement={activeSubElement}
                  isSubSelected={isSubSelected}
                  selectSub={selectSub}
                  getSubRing={getSubRing}
                  handleTextPatch={handleTextPatch}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
