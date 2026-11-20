import React from "react";
import { ImagePlus } from "lucide-react";
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
 * STYLE 5 : "DIPTYQUE / PANORAMIQUE DOUBLE VISUEL" (HeroDiptych)
 * Inclut un repli mono-panneau déterministe lorsque la 2ème image est absente (Section 6.6).
 */
export const HeroDiptych: React.FC<HeroArchitecturalStyleProps> = ({
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
  const safePad = Math.max(16, profile.innerPaddingPx);
  const gapPx = Math.min(40, Math.max(8, profile.diptychGapPx || 16));
  const hasSecondPhoto = profile.hasSecondaryImage;
  const swapPanels = settings.imageSide === "left";
  const textFirstOnMobile = settings.mobileStackOrder === "text-first";
  const prop = profile.splitProportion;

  const isCenteredOverlay =
    profile.textPosition9 === "center" ||
    profile.textPosition9 === "top-center" ||
    profile.textPosition9 === "bottom-center";
  const posFlex = resolvePosition9FlexClasses(profile.textPosition9);
  const cleanTitle = sanitizeHeroTitle(settings.title, settings.spotlightProductTitle);
  const borderRadiusCss = resolveHeroBorderRadiusCss(settings, profile);
  const bgStyle = resolveHeroBackgroundStyle(settings, theme, theme.surfaceColor);
  const bannerShadowCss = resolveBannerEffectiveShadow(settings, theme);
  const imageShadowCss = resolveHeroBoxShadowCss(
    settings.imageShadow,
    resolveHeroShadowAccentColor(settings, theme, settings.imageShadow === "glow"),
    settings.imageShadowColor
  );
  const panelHeightPx = Math.max(200, profile.heightPx - safePad * 2);

  const col1Span =
    prop === "70-30" ? "@2xl:col-span-8" : prop === "60-40" ? "@2xl:col-span-7" : "@2xl:col-span-6";
  const col2Span =
    prop === "70-30" ? "@2xl:col-span-4" : prop === "60-40" ? "@2xl:col-span-5" : "@2xl:col-span-6";

  return (
    <div
      data-testid="hero-model-bento-hero"
      data-hero-style="HeroDiptych"
      data-diptych-mode={hasSecondPhoto ? "dual" : "single-fallback"}
      className="relative w-full overflow-hidden"
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

      {isEditable && !hasSecondPhoto && (
        <div
          data-testid="hero-diptych-missing-secondary-notice"
          className="mb-3 px-3 py-2 rounded-xl bg-amber-50/95 border border-amber-200 text-amber-900 text-[11px] font-medium flex items-center justify-between gap-2"
        >
          <span className="flex items-center gap-1.5">
            <ImagePlus className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>2ème visuel non défini : affichage adapté en panneau unique cohérent.</span>
          </span>
          <button
            type="button"
            onClick={(e) => selectSub(e, "background")}
            className="px-2 py-0.5 rounded-md bg-amber-900 text-white text-[10px] font-semibold shrink-0 cursor-pointer"
          >
            Ajouter 2ème photo
          </button>
        </div>
      )}

      <div
        className={`grid grid-cols-1 ${
          !isMobile ? (isCenteredOverlay ? "@2xl:grid-cols-2" : "@2xl:grid-cols-12") : ""
        } items-stretch w-full`}
        style={{ gap: `${gapPx}px` }}
      >
        {/* TEXTE LATÉRAL (GAUCHE OU DROITE) */}
        {!isCenteredOverlay && !settings.hideAllText && (
          <div
            className={`${
              !isMobile
                ? profile.textPosition9.endsWith("right")
                  ? "@2xl:col-span-4 @2xl:order-3"
                  : "@2xl:col-span-4 @2xl:order-1"
                : textFirstOnMobile
                  ? "order-1"
                  : "order-2"
            } flex ${posFlex} p-2 sm:p-4`}
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

        {/* ZONE VISUELLE : SOIT COUPLE DIPTYQUE, SOIT REPLI MONO-PANNEAU DÉTERMINISTE */}
        <div
          data-testid={hasSecondPhoto ? "hero-diptych-pair" : "hero-diptych-single-fallback"}
          className={`${
            !isMobile
              ? isCenteredOverlay
                ? "@2xl:col-span-2"
                : "@2xl:col-span-8 @2xl:order-2"
              : textFirstOnMobile
                ? "order-2"
                : "order-1"
          } relative ${
            hasSecondPhoto
              ? isMobile
                ? "grid grid-cols-1 sm:grid-cols-2"
                : "grid grid-cols-2 @2xl:grid-cols-12"
              : "grid grid-cols-1"
          } w-full`}
          style={{ gap: `${gapPx}px` }}
        >
          <div
            data-testid="hero-diptych-photo-1"
            className={`${hasSecondPhoto && !isMobile ? col1Span : ""} ${swapPanels ? "order-2" : "order-1"} relative overflow-hidden border border-black/8 ${getSubRing("background")}`}
            style={{
              height: `${isMobile && hasSecondPhoto ? Math.max(180, Math.round(panelHeightPx * 0.65)) : panelHeightPx}px`,
              borderRadius: `${profile.borderRadiusPx === 0 ? 0 : Math.max(4, profile.borderRadiusPx - 4)}px`,
              boxShadow: imageShadowCss,
            }}
          >
            <HeroPurePhoto
              src={profile.activeImageSrc}
              alt={settings.imageAlt || cleanTitle || "Image principale"}
              fit={profile.imageFit}
              focalX={profile.focalX}
              focalY={profile.focalY}
              zoom={profile.zoom}
              studioBg={settings.imageStudioBg}
              settings={settings}
              onClick={(e) => selectSub(e, "background")}
            />
          </div>

          {hasSecondPhoto && (
            <div
              data-testid="hero-diptych-photo-2"
              className={`${!isMobile ? col2Span : ""} ${swapPanels ? "order-1" : "order-2"} relative overflow-hidden border border-black/8`}
              style={{
                height: `${isMobile ? Math.max(180, Math.round(panelHeightPx * 0.65)) : panelHeightPx}px`,
                borderRadius: `${profile.borderRadiusPx === 0 ? 0 : Math.max(4, profile.borderRadiusPx - 4)}px`,
                boxShadow: imageShadowCss,
              }}
            >
              <HeroPurePhoto
                src={profile.secondaryImageSrc}
                alt={settings.bentoTopCardTitle || cleanTitle || "Visuel Diptyque 2"}
                fit={profile.imageFit}
                focalX={profile.secondaryFocalX}
                focalY={profile.secondaryFocalY}
                zoom={1}
                studioBg={settings.imageStudioBg}
                settings={settings}
                onClick={(e) => selectSub(e, "background")}
              />
            </div>
          )}

          {/* CARTOUCHE CENTRAL ENTRE LES VISUELS */}
          {isCenteredOverlay && !settings.hideAllText && (
            <div className={`${hasSecondPhoto ? "sm:col-span-2 @2xl:col-span-12" : "col-span-1"} @2xl:absolute @2xl:inset-0 z-10 flex ${posFlex} p-4 pointer-events-none`}>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
