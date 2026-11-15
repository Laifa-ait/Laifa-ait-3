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
 * STYLE 4 : "CADRE GALERIE MINIMALISTE / MULTI-VISUELS" (HeroGallery)
 * Supporte 1 à 3 visuels :
 * - 1 visuel : Cadre Passe-Partout plein format
 * - 2 à 3 visuels : Composition Galerie (visuel principal dominant + visuels secondaires),
 *   avec bascule verticale lisible sur Mobile.
 */
export const HeroGallery: React.FC<HeroArchitecturalStyleProps> = ({
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
  const passePartoutPx = Math.min(48, Math.max(16, profile.innerPaddingPx || 32));
  const innerRadiusPx = Math.max(0, profile.borderRadiusPx - Math.round(passePartoutPx * 0.35));
  const posFlex = resolvePosition9FlexClasses(profile.textPosition9);
  const cleanTitle = sanitizeHeroTitle(settings.title, settings.spotlightProductTitle);
  const borderRadiusCss = resolveHeroBorderRadiusCss(settings, profile);
  const bgStyle = resolveHeroBackgroundStyle(settings, theme, theme.canvasColor);
  const bannerShadowCss = resolveHeroBoxShadowCss(settings.bannerShadow, theme.primaryColor);
  const imageShadowCss = resolveHeroBoxShadowCss(settings.imageShadow, theme.primaryColor);
  const overlayAlpha = Math.min(60, Math.max(0, settings.overlayOpacity ?? 0)) / 100;
  const galleryGapPx = Math.min(32, Math.max(8, profile.diptychGapPx || 14));

  const secondaryImages = [profile.secondaryImageSrc, profile.tertiaryImageSrc].filter(
    (u): u is string => Boolean(u && u.trim())
  );
  const hasMultiGallery = secondaryImages.length > 0;
  const frameHeightPx = Math.max(220, profile.heightPx - passePartoutPx * 2);

  return (
    <div
      data-testid="hero-model-atelier-collage"
      data-hero-style="HeroGallery"
      data-gallery-count={1 + secondaryImages.length}
      className="relative w-full overflow-hidden border border-black/10"
      style={{
        padding: `${passePartoutPx}px`,
        borderRadius: borderRadiusCss,
        boxShadow: bannerShadowCss,
        borderColor: settings.bannerBorderColor || undefined,
        ...bgStyle,
      }}
    >
      <HeroCompositionGuides
        isEditable={isEditable}
        showGuides={settings.showCompositionGuides}
        safePaddingPx={passePartoutPx}
      />

      <div
        data-testid={hasMultiGallery ? "hero-gallery-multi" : "hero-gallery-single"}
        className="relative w-full"
      >
        <div
          className={
            hasMultiGallery
              ? `grid grid-cols-1 ${!isMobile ? "@2xl:grid-cols-12" : ""} w-full`
              : "w-full"
          }
          style={hasMultiGallery ? { gap: `${galleryGapPx}px` } : undefined}
        >
          {/* VISUEL PRINCIPAL DOMINANT */}
          <div
            data-testid="hero-gallery-primary-slot"
            className={`${hasMultiGallery && !isMobile ? "@2xl:col-span-8" : ""} relative w-full overflow-hidden shadow-xs ${getSubRing("background")}`}
            style={{
              height: `${isMobile && hasMultiGallery ? Math.max(200, Math.round(frameHeightPx * 0.68)) : frameHeightPx}px`,
              borderRadius: `${innerRadiusPx}px`,
              boxShadow: imageShadowCss,
            }}
          >
            <HeroPurePhoto
              src={profile.activeImageSrc}
              alt={settings.imageAlt || cleanTitle || "Cadre Galerie Principal"}
              fit={profile.imageFit}
              focalX={profile.focalX}
              focalY={profile.focalY}
              zoom={profile.zoom}
              studioBg={settings.imageStudioBg}
              settings={settings}
              onClick={(e) => selectSub(e, "background")}
            />

            {overlayAlpha > 0 && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[5]"
                style={{ backgroundColor: `rgba(12, 12, 14, ${overlayAlpha})` }}
              />
            )}
          </div>

          {/* VISUELS SECONDAIRES (1 OU 2) : COLONNE LATÉRALE DESKTOP / EMPILEMENT LISIBLE MOBILE */}
          {hasMultiGallery && (
            <div
              data-testid="hero-gallery-secondary-column"
              className={`${
                !isMobile
                  ? "@2xl:col-span-4 flex flex-col"
                  : secondaryImages.length === 2
                    ? "grid grid-cols-2"
                    : "flex flex-col"
              } w-full`}
              style={{ gap: `${galleryGapPx}px`, height: !isMobile ? `${frameHeightPx}px` : undefined }}
            >
              {secondaryImages.map((imgUrl, idx) => (
                <div
                  key={`${imgUrl}-${idx}`}
                  data-testid={`hero-gallery-secondary-slot-${idx + 1}`}
                  className="relative flex-1 w-full overflow-hidden border border-black/8"
                  style={{
                    minHeight: isMobile ? "140px" : `${Math.floor((frameHeightPx - (secondaryImages.length > 1 ? galleryGapPx : 0)) / secondaryImages.length)}px`,
                    borderRadius: `${Math.max(8, innerRadiusPx - 4)}px`,
                    boxShadow: imageShadowCss,
                  }}
                >
                  <HeroPurePhoto
                    src={imgUrl}
                    alt={`${cleanTitle || "Galerie"} — Visuel ${idx + 2}`}
                    fit={profile.imageFit}
                    focalX={profile.secondaryFocalX}
                    focalY={profile.secondaryFocalY}
                    zoom={1}
                    studioBg={settings.imageStudioBg}
                    settings={settings}
                    onClick={(e) => selectSub(e, "background")}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CARTOUCHE MINIMALISTE FLOTTANT POSITIONNÉ SELON LA GRILLE 9 POINTS */}
        {!settings.hideAllText && (
          <div className={`absolute inset-0 z-10 flex ${posFlex} p-4 sm:p-6 pointer-events-none`}>
            <div
              className="pointer-events-auto rounded-2xl border border-black/8 shadow-sm backdrop-blur-md px-5 py-4 sm:px-7 sm:py-5"
              style={{
                backgroundColor: settings.bannerBgColor
                  ? `${settings.bannerBgColor}F2`
                  : theme.surfaceColor
                    ? `${theme.surfaceColor}F2`
                    : "rgba(255, 255, 255, 0.94)",
              }}
            >
              <HeroMinimalTextBlock
                settings={settings}
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
          </div>
        )}
      </div>
    </div>
  );
};
