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
import { HeroAtelierCollageView } from "./HeroAtelierCollageView";
import { handleSmartLinkClick } from "./safeNavigationHref";
import { CanvasInlineText } from "./CanvasInlineText";

interface HeroEditorialSplitViewProps {
  sectionId?: string;
  settings: HeroBannerSettings;
  styles: CustomPageSectionStyles;
  theme: CustomPageTheme;
  activeImageSrc: string;
  activeObjectPosition: string;
  resolvedCtaBg: string;
  resolvedCtaText: string;
  ctaShapeClass?: string;
  isEditable?: boolean;
  activeSubElement: HeroSubElement | null;
  onTriggerSubElement: (el: HeroSubElement, e?: React.MouseEvent) => void;
}

export const HeroEditorialSplitView: React.FC<HeroEditorialSplitViewProps> = (props) => {
  const {
    sectionId = "",
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
  } = props;

  if (settings.heroLayout === "atelier-collage") {
    return <HeroAtelierCollageView {...props} />;
  }

  const effectiveShape = resolveEffectiveFrameShape(theme, styles.frameShape);
  const accentColor = theme.accentColor || theme.primaryColor || "#B45309";
  const sectionBg = styles.backgroundColor || theme.canvasColor || "#FAF6F0";
  const isDarkSection = isDarkColor(sectionBg);
  const sectionText = styles.textColor || (isDarkSection ? "#F8FAFC" : theme.secondaryColor || "#18181B");
  const effectiveAccent = isDarkSection && accentColor.toLowerCase() === sectionBg.toLowerCase() ? "#FDE68A" : accentColor;
  const surfaceColor = isDarkSection ? "#18181B" : theme.surfaceColor || "#FFFFFF";
  const sealTextColor = isDarkSection ? "#F8FAFC" : sectionText;

  const showBadge = settings.showBadge !== false && Boolean(settings.badgeText);
  const showSubtitle = settings.showSubtitle !== false && Boolean(settings.subtitle);
  const showCta = settings.showCta !== false && Boolean(settings.ctaText);
  const showSecondaryCta = settings.showSecondaryCta !== false && Boolean(settings.secondaryCtaText);
  const showSeal = settings.showSocialProofBadge !== false;

  const badgeVis = resolveHeroBadgeVisuals(settings, effectiveAccent, "soft", isDarkSection);
  const titleSizeClass = resolveHeroTitleSizeClasses(settings.titleSizeDesktop, settings.titleSizeMobile);
  const titleShadowStyle = resolveHeroTextShadowStyle(settings.textShadow);
  const primaryBtnVis = resolveHeroButtonVisuals(settings.ctaStyle, resolvedCtaBg, resolvedCtaText, settings.ctaShadow, Boolean(settings.ctaTextColor), isDarkSection);
  const secBg = settings.secondaryCtaBgColor || sectionText;
  const secText = settings.secondaryCtaTextColor || getContrastingTextColor(secBg);
  const secondaryBtnVis = resolveHeroButtonVisuals(settings.secondaryCtaStyle || "outline", secBg, secText, settings.secondaryCtaShadow || "none", Boolean(settings.secondaryCtaTextColor), isDarkSection);

  const imgShadow = resolveHeroImageShadow(settings.imageShadow, effectiveAccent);
  const frameVis = resolveHeroFrameShapeVisuals(effectiveShape, styles.borderRadius);
  const aspectClass = resolveHeroAspectClass(settings.imageAspectRatio);
  const cardMatClass = resolveCardMaterialClasses(theme.cardMaterial, styles.cardMaterial, isDarkSection);
  const resolvedTitleColor = resolveReadableHeroTextColor(settings.titleColor, sectionText, isDarkSection);
  const resolvedSubtitleColor = resolveReadableHeroTextColor(settings.subtitleColor, sectionText, isDarkSection);

  const bannerPos = resolveBannerPosition(settings.contentPosition, settings.textAlignment || "left", settings.verticalAlignment || "center");
  const hAlignClass = bannerPos.horizontal === "center" ? "items-center text-center" : bannerPos.horizontal === "right" ? "items-end text-right" : "items-start text-left";
  const vAlignGridClass = bannerPos.vertical === "top" ? "items-start" : bannerPos.vertical === "bottom" ? "items-end" : "items-center";
  const btnJustifyClass = bannerPos.horizontal === "center" ? "justify-center" : bannerPos.horizontal === "right" ? "justify-end" : "justify-start";

  const padY = resolveSectionPaddingY(styles.paddingY);
  const padX = resolveSectionPaddingX(styles.paddingX);
  const imageMargin = typeof settings.imageMargin === "number" ? Math.max(0, settings.imageMargin) : 0;
  const overlayAlpha = Math.min(85, Math.max(0, Number(settings.overlayOpacity ?? 0))) / 100;
  const isImageLeft = settings.imageSide === "left";
  const isContain = settings.imageFit === "contain";
  const hasClip = Boolean(frameVis.clipStyle);
  const rawAlt = typeof (settings as unknown as Record<string, unknown>).imageAlt === "string" ? String((settings as unknown as Record<string, unknown>).imageAlt) : "";

  return (
    <div
      style={{ backgroundColor: sectionBg, color: sectionText, paddingTop: `${padY}px`, paddingBottom: `${padY}px`, paddingLeft: `${padX}px`, paddingRight: `${padX}px` }}
      className={`relative overflow-hidden transition-all ${resolveBorderRadiusClass(styles.borderRadius)} ${resolveShadowClass(styles.shadow)} ${resolveAnimationClass(styles.animation)}`}
    >
      <ArtisticAtmosphereLayer theme={theme} sectionStyles={styles} />

      <div className={`relative z-10 ${resolveContainerWidthClass(styles.containerWidth)} grid grid-cols-1 @3xl:grid-cols-12 gap-8 @3xl:gap-10 ${vAlignGridClass}`}>
        <div className={`@3xl:col-span-7 min-w-0 flex flex-col ${hAlignClass} z-10 ${isImageLeft ? "@3xl:order-2" : "@3xl:order-1"} ${cardMatClass ? `p-6 @md:p-8 rounded-3xl ${cardMatClass}` : ""}`}>
          {showBadge && (
            <span
              onClick={(e) => onTriggerSubElement("badge", e)}
              style={badgeVis.style}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-[10px] @md:text-[11px] font-bold uppercase tracking-[0.22em] mb-4 max-w-full ${badgeVis.className} ${isEditable ? "cursor-pointer hover:ring-2 hover:ring-amber-500/40" : ""}`}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: badgeVis.dotColor }} />
              <CanvasInlineText value={settings.badgeText || ""} isEditable={isEditable && Boolean(sectionId)} editConfig={sectionId ? { sectionId, settingKey: "badgeText", subElement: "badge" } : undefined} className="truncate" />
            </span>
          )}

          <EditorialHeading
            as="h1"
            text={settings.title || "L'Élégance *Intemporelle* — Façonnée avec {Passion}"}
            theme={theme}
            sectionStyles={styles}
            accentColorOverride={effectiveAccent}
            isEditable={isEditable && Boolean(sectionId)}
            editConfig={sectionId ? { sectionId, settingKey: "title", subElement: "title" } : undefined}
            onClick={(e) => onTriggerSubElement("title", e)}
            style={{ color: resolvedTitleColor, ...titleShadowStyle }}
            className={`w-full ${titleSizeClass} font-extrabold tracking-tight leading-[1.1] mb-4 max-w-2xl break-words transition-all rounded-lg ${isEditable ? `cursor-pointer ${activeSubElement === "title" ? "ring-2 ring-[#F97316] px-1" : "hover:opacity-85"}` : ""}`}
          />

          {showSubtitle && (
            <CanvasInlineText
              as="p"
              multiline
              value={settings.subtitle || ""}
              isEditable={isEditable && Boolean(sectionId)}
              editConfig={sectionId ? { sectionId, settingKey: "subtitle", subElement: "subtitle" } : undefined}
              onClick={(e) => onTriggerSubElement("subtitle", e)}
              style={{ color: resolvedSubtitleColor }}
              className={`text-xs @md:text-sm @3xl:text-base opacity-90 max-w-xl mb-6 leading-relaxed font-normal break-words ${isEditable ? "cursor-pointer hover:opacity-95" : ""}`}
            />
          )}

          <div className={`flex flex-wrap items-center gap-3 w-full ${btnJustifyClass}`}>
            {showCta && (
              <a
                href={settings.ctaLink || "#catalog"}
                onClick={(e) => {
                  if (isEditable) { e.preventDefault(); onTriggerSubElement("cta", e); }
                  else handleSmartLinkClick(settings.ctaLink || "#catalog", e, settings.ctaText || settings.title);
                }}
                style={primaryBtnVis.style}
                className={`inline-flex items-center justify-center px-6 @md:px-7 py-3 @md:py-3.5 text-xs @md:text-sm font-bold uppercase tracking-[0.14em] transition-all active:scale-95 ${primaryBtnVis.className}`}
              >
                <CanvasInlineText value={settings.ctaText || ""} isEditable={isEditable && Boolean(sectionId)} editConfig={sectionId ? { sectionId, settingKey: "ctaText", subElement: "cta" } : undefined} />
              </a>
            )}

            {showSecondaryCta && (
              <a
                href={settings.secondaryCtaLink || "#catalog"}
                onClick={(e) => {
                  if (isEditable) { e.preventDefault(); onTriggerSubElement("ctaSecondary", e); }
                  else handleSmartLinkClick(settings.secondaryCtaLink || "#catalog", e, settings.secondaryCtaText || settings.title);
                }}
                style={secondaryBtnVis.style}
                className={`inline-flex items-center justify-center px-6 py-3 @md:py-3.5 text-xs @md:text-sm font-semibold transition-all ${secondaryBtnVis.className}`}
              >
                <CanvasInlineText value={settings.secondaryCtaText || ""} isEditable={isEditable && Boolean(sectionId)} editConfig={sectionId ? { sectionId, settingKey: "secondaryCtaText", subElement: "ctaSecondary" } : undefined} />
              </a>
            )}
          </div>
        </div>

        <div style={{ padding: imageMargin > 0 ? `${imageMargin}px` : undefined, ...(hasClip ? imgShadow.dropShadowStyle : {}) }} className={`@3xl:col-span-5 min-w-0 relative mx-auto w-full ${isImageLeft ? "@3xl:order-1" : "@3xl:order-2"}`}>
          <div
            onClick={(e) => onTriggerSubElement("background", e)}
            style={{ ...(hasClip ? {} : imgShadow.style), ...frameVis.clipStyle }}
            className={`group/heroimg relative ${aspectClass} w-full overflow-hidden ${isDarkSection ? "bg-zinc-900" : "bg-zinc-100"} ${frameVis.frameClass} ${hasClip ? "" : imgShadow.className} ${isEditable ? `cursor-pointer ${activeSubElement === "background" ? "ring-3 ring-[#F97316]" : ""}` : ""}`}
          >
            {isContain && activeImageSrc && <img src={activeImageSrc} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-40" />}
            {activeImageSrc && <img src={activeImageSrc} alt={rawAlt || settings.title || "Pièce maîtresse"} style={{ objectPosition: activeObjectPosition, objectFit: settings.imageFit || "cover" }} className="relative z-10 w-full h-full transition-transform duration-700 group-hover/heroimg:scale-105" />}
            {overlayAlpha > 0 && <div className="pointer-events-none absolute inset-0 z-20" style={{ backgroundColor: `rgba(15, 23, 42, ${overlayAlpha * 0.65})` }} />}
            {isEditable && (
              <span className="absolute top-3 right-3 z-30 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/65 text-white text-[10px] font-bold backdrop-blur-sm opacity-90 group-hover/heroimg:bg-[#F97316] transition-colors">
                <Camera className="w-3 h-3" />
                <span>Photo</span>
              </span>
            )}
            {!frameVis.isPolaroid && <div className={`pointer-events-none absolute inset-2 border z-20 ${frameVis.innerBorderClass}`} style={{ borderColor: `${effectiveAccent}45` }} />}
          </div>

          {showSeal && (
            <RotatingSealBadge
              text={settings.socialProofBadge || "FAIT MAIN EN ALGÉRIE • ÉDITION LIMITÉE •"}
              accentColor={effectiveAccent}
              surfaceColor={surfaceColor}
              textColor={sealTextColor}
              className="absolute -bottom-3 -left-2 @md:-bottom-5 @md:-left-4 z-30"
            />
          )}
        </div>
      </div>

      <SectionDividerRenderer divider={styles.divider} color={effectiveAccent} theme={theme} />
    </div>
  );
};
