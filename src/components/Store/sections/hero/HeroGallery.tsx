import React from "react";
import {
  HeroArchitecturalStyleProps,
  HeroCompositionGuides,
  HeroMinimalTextBlock,
  HeroPurePhoto,
  resolvePosition9FlexClasses,
} from "./HeroMinimalTextAndGuides";
import { sanitizeHeroTitle } from "./heroResponsiveHelper";
import { resolveHeroGalleryLayout } from "./heroGalleryLayoutHelper";
import { resolveHeroTextFrame } from "./heroTextFrameHelper";
import {
  hexToRgba,
  resolveBannerEffectiveShadow,
  resolveHeroBackgroundStyle,
  resolveHeroBorderCss,
  resolveHeroBorderRadiusCss,
  resolveHeroBoxShadowCss,
  resolveHeroShadowAccentColor,
} from "./heroVisualEffectsHelper";

/**
 * STYLE 4 : "PHOTO ENCADRÉE — PASSE-PARTOUT GALERIE" (HeroGallery)
 * Architecture responsive 3 niveaux (PC / Tablette / Téléphone), 1 à 3 visuels.
 */
export const HeroGallery: React.FC<HeroArchitecturalStyleProps> = ({
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
  const layout = resolveHeroGalleryLayout(settings, theme, profile);
  const textFrame = resolveHeroTextFrame(settings, theme, profile, true);
  const hasCustomDockedFrame = Boolean(settings.textFrame) && textFrame.enabled;
  const posFlex = resolvePosition9FlexClasses(profile.textPosition9);
  const cleanTitle = sanitizeHeroTitle(settings.title, settings.spotlightProductTitle);
  const borderRadiusCss = resolveHeroBorderRadiusCss(settings, profile);
  const bgStyle = resolveHeroBackgroundStyle(settings, theme, theme.canvasColor);
  const bannerShadowCss = resolveBannerEffectiveShadow(settings, theme);
  const imageShadowCss = resolveHeroBoxShadowCss(
    settings.imageShadow,
    resolveHeroShadowAccentColor(settings, theme, settings.imageShadow === "glow"),
    settings.imageShadowColor
  );
  const overlayAlpha =
    settings.overlayEnabled === false ? 0 : Math.min(80, Math.max(0, settings.overlayOpacity ?? 0)) / 100;

  const textBlockNode = (
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
  );

  const dockedCaptionBlock = !settings.hideAllText && layout.useDockedCaption && (
    <div
      data-testid="hero-gallery-docked-caption"
      className={`flex flex-col w-full ${layout.dockedAlignClass} ${
        hasCustomDockedFrame ? "" : layout.isMobile ? "px-1.5 py-2.5" : "px-2 py-3"
      }`}
    >
      {hasCustomDockedFrame ? (
        <div
          data-testid="hero-text-frame-card"
          data-text-frame-enabled="true"
          className="w-full transition-all"
          style={textFrame.frameStyle}
        >
          {textBlockNode}
        </div>
      ) : (
        textBlockNode
      )}
    </div>
  );

  return (
    <div
      data-testid="hero-model-atelier-collage"
      data-hero-style="HeroGallery"
      data-gallery-count={1 + layout.secondaryImages.length}
      data-gallery-viewport={profile.viewport}
      className="relative w-full overflow-hidden"
      style={{
        padding: `${layout.passePartoutPx}px`,
        borderRadius: borderRadiusCss,
        boxShadow: bannerShadowCss,
        border: resolveHeroBorderCss(settings, isEdgeToEdge),
        ...bgStyle,
      }}
    >
      <HeroCompositionGuides
        isEditable={isEditable}
        showGuides={settings.showCompositionGuides}
        safePaddingPx={layout.passePartoutPx}
      />

      <div
        data-testid={layout.hasMultiGallery ? "hero-gallery-multi" : "hero-gallery-single"}
        className="relative w-full flex flex-col"
        style={{ gap: `${Math.max(10, Math.round(layout.galleryGapPx * 0.9))}px` }}
      >
        {layout.dockCaptionFirst && dockedCaptionBlock}

        <div
          className={
            layout.hasMultiGallery
              ? layout.isMobile
                ? "grid grid-cols-1 w-full"
                : "grid grid-cols-12 w-full items-stretch"
              : "w-full"
          }
          style={layout.hasMultiGallery ? { gap: `${layout.galleryGapPx}px` } : undefined}
        >
          {/* VISUEL PRINCIPAL DOMINANT */}
          <div
            data-testid="hero-gallery-primary-slot"
            className={`${
              layout.hasMultiGallery && !layout.isMobile ? (layout.isTablet ? "col-span-7" : "col-span-8") : ""
            } relative w-full overflow-hidden flex ${posFlex} ${layout.innerRingClass} ${getSubRing("background")}`}
            style={{
              minHeight: `${layout.frameMinHeightPx}px`,
              borderRadius: `${layout.innerRadiusPx}px`,
              boxShadow: imageShadowCss,
            }}
          >
            <div className="absolute inset-0">
              <HeroPurePhoto
                src={profile.activeImageSrc}
                alt={settings.imageAlt || cleanTitle || "Photo encadrée principale"}
                fit={profile.imageFit}
                focalX={profile.focalX}
                focalY={profile.focalY}
                zoom={profile.zoom}
                studioBg={settings.imageStudioBg}
                settings={settings}
                onClick={(e) => selectSub(e, "background")}
              />
            </div>

            {overlayAlpha > 0 && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[5]"
                style={{
                  backgroundColor: hexToRgba(
                    settings.overlayColor || sectionStyles?.overlayColor,
                    overlayAlpha,
                    [12, 12, 14]
                  ),
                }}
              />
            )}

            {/* PLAQUE ÉDITORIALE FLOTTANTE (100% CONTRÔLABLE VIA textFrame) */}
            {!settings.hideAllText && !layout.useDockedCaption && (
              <div
                data-testid="hero-gallery-floating-plaque"
                className={`relative z-10 w-full flex ${posFlex} ${
                  layout.isTablet ? "p-4 sm:p-5" : "p-5 sm:p-7"
                } pointer-events-none`}
              >
                <div
                  data-testid="hero-text-frame-card"
                  data-text-frame-enabled={String(textFrame.enabled)}
                  className="pointer-events-auto transition-all"
                  style={textFrame.frameStyle}
                >
                  {textBlockNode}
                </div>
              </div>
            )}
          </div>

          {/* VISUELS SECONDAIRES (1 OU 2) : COLONNE COMPAGNON PC/TABLETTE OU RANGÉE MOBILE */}
          {layout.hasMultiGallery && (
            <div
              data-testid="hero-gallery-secondary-column"
              className={`${
                !layout.isMobile
                  ? `${layout.isTablet ? "col-span-5" : "col-span-4"} grid ${
                      layout.secondaryImages.length === 2 ? "grid-rows-2" : "grid-rows-1"
                    }`
                  : layout.secondaryImages.length === 2
                    ? "grid grid-cols-2"
                    : "grid grid-cols-1"
              } w-full`}
              style={{ gap: `${layout.galleryGapPx}px` }}
            >
              {layout.secondaryImages.map((imgUrl, idx) => (
                <div
                  key={`${imgUrl}-${idx}`}
                  data-testid={`hero-gallery-secondary-slot-${idx + 1}`}
                  className={`relative w-full h-full overflow-hidden ${layout.innerRingClass}`}
                  style={{
                    minHeight: `${layout.secondarySlotMinHeightPx}px`,
                    borderRadius: `${layout.secondaryRadiusPx}px`,
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

        {!layout.dockCaptionFirst && dockedCaptionBlock}
      </div>
    </div>
  );
};
