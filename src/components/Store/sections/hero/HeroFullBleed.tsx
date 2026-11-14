import React from "react";
import {
  ELEGANT_HERO_FALLBACK_IMG,
  HeroArchitecturalStyleProps,
  HeroCompositionGuides,
  HeroMinimalTextBlock,
  HeroPurePhoto,
  resolvePosition9FlexClasses,
} from "./HeroMinimalTextAndGuides";
import { HeroSwapImageFrame } from "./HeroSwapImageFrame";
import { sanitizeHeroTitle } from "./heroResponsiveHelper";
import {
  resolveHeroBackgroundStyle,
  resolveHeroBorderRadiusCss,
  resolveHeroBoxShadowCss,
} from "./heroVisualEffectsHelper";

/**
 * STYLE 1 : "PLEIN CADRE CINÉMA" (HeroFullBleed)
 */
export const HeroFullBleed: React.FC<HeroArchitecturalStyleProps> = ({
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
  const cleanTitle = sanitizeHeroTitle(settings.title, settings.spotlightProductTitle);
  const posFlex = resolvePosition9FlexClasses(profile.textPosition9);
  const overlayAlpha = Math.min(60, Math.max(0, settings.overlayOpacity ?? 25)) / 100;
  const safePad = Math.max(20, profile.innerPaddingPx);
  const useSwap = settings.enableImageSwap !== false;
  const borderRadiusCss = resolveHeroBorderRadiusCss(settings, profile);
  const bgStyle = resolveHeroBackgroundStyle(settings, theme, profile.imageStudioBg);
  const bannerShadowCss = resolveHeroBoxShadowCss(
    settings.bannerShadow || settings.imageShadow,
    theme.primaryColor
  );
  const hasCornerMesh = Boolean(settings.useCornerColors && bgStyle.backgroundImage);

  return (
    <div
      data-testid="hero-model-cinema-full"
      data-hero-style="HeroFullBleed"
      className="relative w-full overflow-hidden select-none"
      style={{
        height: `${profile.heightPx}px`,
        borderRadius: borderRadiusCss,
        boxShadow: bannerShadowCss,
        border: settings.bannerBorderColor ? `1px solid ${settings.bannerBorderColor}` : undefined,
        ...bgStyle,
      }}
    >
      {/* Photographie 100% de la surface */}
      <div className={`absolute inset-0 w-full h-full ${getSubRing("background")}`}>
        {useSwap ? (
          <HeroSwapImageFrame
            settings={settings}
            activeImageSrc={profile.activeImageSrc}
            activeFocalPoint={profile.activeFocalPoint}
            focalX={profile.focalX}
            focalY={profile.focalY}
            zoom={profile.zoom}
            fallbackImage={ELEGANT_HERO_FALLBACK_IMG}
            altText={settings.imageAlt || cleanTitle || "Bannière Plein Cadre"}
            heightPx={profile.heightPx}
            onClickFrame={(e) => selectSub(e, "background")}
          />
        ) : (
          <HeroPurePhoto
            src={profile.activeImageSrc}
            alt={settings.imageAlt || cleanTitle || "Bannière Plein Cadre"}
            fit={profile.imageFit}
            focalX={profile.focalX}
            focalY={profile.focalY}
            zoom={profile.zoom}
            studioBg={settings.imageStudioBg}
            settings={settings}
            onClick={(e) => selectSub(e, "background")}
          />
        )}
      </div>

      {/* Halo atmosphérique des 4 coins lorsqu'activé sur Plein Cadre */}
      {hasCornerMesh && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[5] opacity-45"
          style={{ backgroundImage: bgStyle.backgroundImage }}
        />
      )}

      {/* Repères d'alignement et Safe Area (visibles uniquement en mode Édition) */}
      <HeroCompositionGuides
        isEditable={isEditable}
        showGuides={settings.showCompositionGuides}
        safePaddingPx={safePad}
      />

      {/* Zone de composition 9 positions avec voile dégradé localisé derrière l'écriture */}
      <div
        className={`relative z-10 w-full h-full flex ${posFlex} pointer-events-none`}
        style={{ padding: `${safePad}px` }}
      >
        <div
          className="pointer-events-auto rounded-2xl transition-all"
          style={{
            padding: overlayAlpha > 0 ? "20px 24px" : "0px",
            background:
              overlayAlpha > 0
                ? `radial-gradient(120% 120% at 50% 50%, rgba(12,12,14,${overlayAlpha}) 0%, rgba(12,12,14,${(overlayAlpha * 0.45).toFixed(2)}) 70%, rgba(12,12,14,0) 100%)`
                : "transparent",
          }}
        >
          <HeroMinimalTextBlock
            settings={settings}
            theme={theme}
            profile={profile}
            defaultTitleColor="#FFFFFF"
            defaultSubtitleColor="#F4F4F5"
            defaultCtaBg="#FFFFFF"
            defaultCtaText="#111827"
            activeSubElement={activeSubElement}
            isSubSelected={isSubSelected}
            selectSub={selectSub}
            getSubRing={getSubRing}
            handleTextPatch={handleTextPatch}
          />
        </div>
      </div>
    </div>
  );
};
