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
 * STYLE 4 : "CADRE GALERIE MINIMALISTE / PASSE-PARTOUT" (HeroGallery)
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
  const passePartoutPx = Math.min(48, Math.max(16, profile.innerPaddingPx || 32));
  const innerRadiusPx = Math.max(0, profile.borderRadiusPx - Math.round(passePartoutPx * 0.35));
  const posFlex = resolvePosition9FlexClasses(profile.textPosition9);
  const cleanTitle = sanitizeHeroTitle(settings.title, settings.spotlightProductTitle);
  const borderRadiusCss = resolveHeroBorderRadiusCss(settings, profile);
  const bgStyle = resolveHeroBackgroundStyle(settings, theme, theme.canvasColor);
  const bannerShadowCss = resolveHeroBoxShadowCss(settings.bannerShadow, theme.primaryColor);
  const imageShadowCss = resolveHeroBoxShadowCss(settings.imageShadow, theme.primaryColor);
  const overlayAlpha = Math.min(60, Math.max(0, settings.overlayOpacity ?? 0)) / 100;

  return (
    <div
      data-testid="hero-model-atelier-collage"
      data-hero-style="HeroGallery"
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

      {/* CADRE PHOTOGRAPHIQUE INTÉRIEUR (PASSE-PARTOUT) */}
      <div
        className={`relative w-full overflow-hidden shadow-xs ${getSubRing("background")}`}
        style={{
          height: `${Math.max(220, profile.heightPx - passePartoutPx * 2)}px`,
          borderRadius: `${innerRadiusPx}px`,
          boxShadow: imageShadowCss,
        }}
      >
        <HeroPurePhoto
          src={profile.activeImageSrc}
          alt={settings.imageAlt || cleanTitle || "Cadre Galerie Passe-Partout"}
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
