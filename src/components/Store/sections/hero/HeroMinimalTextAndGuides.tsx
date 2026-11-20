import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  CustomPageSectionStyles, CustomPageTheme, HeroBannerSettings, HeroSubElement, HeroTextPosition9,
} from "../../../../domains/seller/customPage.types";
import { EditorialHeading } from "../../EditorialHeading";
import { handleSmartLinkClick, safeNavigationHref } from "../safeNavigationHref";
import {
  ResolvedHeroDeviceProfile, resolveSafeHeroCtaHref, sanitizeHeroTitle,
} from "./heroResponsiveHelper";
import {
  resolveHeroBoxShadowCss, resolveHeroImageFilterCss, resolveHeroTextShadowCss,
} from "./heroVisualEffectsHelper";
import { ensureHeroFontLoaded, resolveHeroTypographyStyles } from "./heroTypographyHelper";
import { DEFAULT_MODERN_THEME } from "../../../../pages/Seller/StoreBuilder/constants/studioThemeDefaults";

export const ELEGANT_HERO_FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#F8FAFC"/><stop offset="100%" stop-color="#E2E8F0"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><rect x="80" y="80" width="1040" height="640" rx="16" fill="none" stroke="#0F172A" stroke-opacity="0.16" stroke-width="2"/></svg>'
  );

export interface HeroArchitecturalStyleProps {
  settings: HeroBannerSettings;
  sectionStyles?: CustomPageSectionStyles;
  theme: CustomPageTheme;
  profile: ResolvedHeroDeviceProfile;
  previewViewport?: "desktop" | "tablet" | "mobile";
  products?: import("../../../../domains/product/product.types").Product[];
  isEditable?: boolean;
  isEdgeToEdge?: boolean;
  activeSubElement?: HeroSubElement | null;
  isSubSelected: (sub: HeroSubElement) => boolean;
  selectSub: (e: React.MouseEvent, sub: HeroSubElement) => void;
  getSubRing: (sub: HeroSubElement) => string;
  handleTextPatch: (field: keyof HeroBannerSettings, val: string) => void;
}

export function resolvePosition9FlexClasses(pos9: HeroTextPosition9): string {
  const vertical = pos9.startsWith("top") ? "items-start" : pos9.startsWith("bottom") ? "items-end" : "items-center";
  const horizontal = pos9.endsWith("right")
    ? "justify-end text-end"
    : pos9.endsWith("center") || pos9 === "center" ? "justify-center text-center" : "justify-start text-start";
  return `${vertical} ${horizontal}`;
}

export const HeroCompositionGuides: React.FC<{
  isEditable?: boolean; showGuides?: boolean; safePaddingPx?: number;
}> = ({ isEditable, showGuides, safePaddingPx = 24 }) => {
  if (!isEditable || !showGuides) return null;
  return (
    <div data-testid="hero-composition-guides" className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden="true">
      <div className="absolute border border-dashed border-sky-400/70 rounded-xl" style={{ inset: `${Math.max(12, safePaddingPx)}px` }}>
        <span className="absolute top-1.5 start-1.5 px-1.5 py-0.5 rounded bg-slate-950/85 text-sky-200 text-[9px] font-semibold uppercase tracking-wider">Zone utile</span>
      </div>
      <div className="absolute inset-y-0 start-1/3 w-px bg-white/30" />
      <div className="absolute inset-y-0 start-2/3 w-px bg-white/30" />
      <div className="absolute inset-x-0 top-1/3 h-px bg-white/30" />
      <div className="absolute inset-x-0 top-2/3 h-px bg-white/30" />
      <div className="absolute inset-y-0 start-1/2 w-px border-s border-dashed border-sky-300/60" />
      <div className="absolute inset-x-0 top-1/2 h-px border-t border-dashed border-sky-300/60" />
    </div>
  );
};

interface HeroMinimalTextBlockProps {
  settings: HeroBannerSettings;
  sectionStyles?: CustomPageSectionStyles;
  theme: CustomPageTheme;
  profile: ResolvedHeroDeviceProfile;
  isEditable?: boolean;
  defaultTitleColor?: string;
  defaultSubtitleColor?: string;
  defaultCtaBg?: string;
  defaultCtaText?: string;
  activeSubElement?: HeroSubElement | null;
  isSubSelected: (sub: HeroSubElement) => boolean;
  selectSub: (e: React.MouseEvent, sub: HeroSubElement) => void;
  getSubRing: (sub: HeroSubElement) => string;
  handleTextPatch: (field: keyof HeroBannerSettings, val: string) => void;
}

export const HeroMinimalTextBlock: React.FC<HeroMinimalTextBlockProps> = ({
  settings, sectionStyles, theme, profile, isEditable,
  defaultTitleColor, defaultSubtitleColor, defaultCtaBg, defaultCtaText,
  selectSub, getSubRing,
}) => {
  useEffect(() => {
    ensureHeroFontLoaded(settings.titleFontFamily);
    ensureHeroFontLoaded(settings.subtitleFontFamily);
  }, [settings.titleFontFamily, settings.subtitleFontFamily]);

  if (settings.hideAllText) return null;

  const titleColor = settings.titleColor || defaultTitleColor || theme.secondaryColor || DEFAULT_MODERN_THEME.secondaryColor;
  const subtitleColor = settings.subtitleColor || defaultSubtitleColor || theme.mutedTextColor || DEFAULT_MODERN_THEME.mutedTextColor;
  const accentColor = theme.accentColor || theme.primaryColor || DEFAULT_MODERN_THEME.primaryColor;
  const ctaBgColor = settings.ctaBgColor || defaultCtaBg || theme.buttonColor || theme.primaryColor || DEFAULT_MODERN_THEME.buttonColor;
  const ctaTextColor = settings.ctaTextColor || defaultCtaText || theme.buttonTextColor || "#FFFFFF";
  const cleanTitle = sanitizeHeroTitle(settings.title, settings.spotlightProductTitle);

  const showBadge = settings.showBadge !== false && Boolean((settings.badgeText || "").trim());
  const showSubtitle = settings.showSubtitle !== false && Boolean((settings.subtitle || "").trim());
  const resolvedCtaLabel = settings.ctaText !== undefined ? settings.ctaText : "Découvrir";
  const showCta = settings.showCta !== false && Boolean(resolvedCtaLabel.trim());
  const showSecondaryCta = Boolean(settings.showSecondaryCta && (settings.secondaryCtaText || "").trim());
  const safeHref = resolveSafeHeroCtaHref(settings);
  const safeSecondaryHref = safeNavigationHref(settings.secondaryCtaLink || "#catalog") || "#catalog";

  const { titleStyle, subtitleStyle } = resolveHeroTypographyStyles(settings, profile, theme);
  const textShadowCss = resolveHeroTextShadowCss(settings.textShadow);
  const ctaStyle = settings.ctaStyle || "solid";
  const isOutline = ctaStyle === "outline";
  const isMinimal = ctaStyle === "minimal";
  const ctaSize = settings.ctaButtonSize || "md";
  const ctaSizeClass = ctaSize === "sm" ? "px-4 py-2 text-[11px]" : ctaSize === "lg" ? "px-8 py-4 text-sm" : "px-6 py-3 text-xs sm:text-sm";
  const ctaRadiusPx =
    isMinimal ? 0
    : typeof settings.ctaBorderRadiusPx === "number"
      ? settings.ctaBorderRadiusPx
      : ctaStyle === "sharp" ? 0 : ctaStyle === "pill" ? 999 : 8;
  const ctaBorderWidth = isMinimal ? 0 : typeof settings.ctaBorderWidthPx === "number" ? settings.ctaBorderWidthPx : isOutline ? 2 : 0;
  const ctaShadowCss = isMinimal ? undefined : resolveHeroBoxShadowCss(settings.ctaShadow, ctaBgColor, settings.ctaShadowColor);
  const alignClass =
    profile.textAlign === "center" ? "items-center text-center" : profile.textAlign === "right" ? "items-end text-end" : "items-start text-start";

  return (
    <div
      data-testid="hero-minimal-text-cluster"
      style={{ maxWidth: `${profile.textBoxMaxWidth}px`, gap: `${profile.textVerticalGap}px`, textShadow: textShadowCss }}
      className={`flex flex-col w-full ${alignClass}`}
    >
      {showBadge && (
        <span
          data-testid="hero-badge-pill" data-sub-element="badge" onClick={(e) => selectSub(e, "badge")}
          style={{ backgroundColor: settings.badgeBgColor || accentColor, color: settings.badgeTextColor || theme.badgeTextColor || "#FFFFFF" }}
          className={`inline-flex items-center px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] w-fit ${getSubRing("badge")}`}
        >
          {settings.badgeText}
        </span>
      )}

      <div data-sub-element="title" onClick={(e) => selectSub(e, "title")} className={getSubRing("title")}>
        <EditorialHeading
          text={cleanTitle} as="h1" theme={theme} sectionStyles={sectionStyles} accentColorOverride={accentColor}
          style={{ ...titleStyle, color: titleColor }}
          className={`${profile.customTitleFontSizePx ? "" : profile.titleScaleClass} ${settings.titleFontWeight ? "" : "font-black"} tracking-tight leading-[1.08] break-words`}
        />
      </div>

      {showSubtitle && (
        <p
          data-sub-element="subtitle"
          onClick={(e) => selectSub(e, "subtitle")}
          style={{ ...subtitleStyle, color: subtitleColor }}
          className={`${profile.customSubtitleFontSizePx ? "" : "text-xs sm:text-sm"} ${settings.subtitleFontWeight ? "" : "font-medium"} leading-relaxed opacity-90 break-words ${getSubRing("subtitle")}`}
        >
          {settings.subtitle}
        </p>
      )}

      {(showCta || showSecondaryCta) && (
        <div className="pt-1 flex flex-wrap items-center gap-2.5">
          {showCta && (
            <a
              data-testid="hero-single-cta-btn" href={isEditable ? undefined : safeHref} data-sub-element="ctaPrimary"
              title={isEditable ? "Cliquer pour modifier ce bouton" : undefined}
              onClick={(e) => {
                if (isEditable) { e.preventDefault(); selectSub(e, "ctaPrimary"); return; }
                handleSmartLinkClick(safeHref, e, cleanTitle);
              }}
              style={{
                backgroundColor: isOutline || isMinimal ? "transparent" : ctaBgColor,
                color: isOutline || isMinimal ? settings.ctaTextColor || titleColor : ctaTextColor,
                borderColor: settings.ctaBorderColor || titleColor,
                borderWidth: `${ctaBorderWidth}px`,
                borderStyle: ctaBorderWidth > 0 ? "solid" : "none",
                borderBottom: isMinimal ? `2px solid ${settings.ctaBorderColor || titleColor}` : undefined,
                borderRadius: `${ctaRadiusPx}px`,
                boxShadow: ctaShadowCss,
                ...(isMinimal ? { paddingLeft: "4px", paddingRight: "4px" } : {}),
              }}
              className={`inline-flex items-center justify-center gap-2 font-bold tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer ${ctaSizeClass} ${getSubRing("ctaPrimary")}`}
            >
              <span>{settings.ctaText || "Découvrir"}</span>
              {settings.ctaShowArrow !== false && <ArrowRight className="w-3.5 h-3.5 shrink-0" />}
            </a>
          )}

          {showSecondaryCta && (
            <a
              data-testid="hero-secondary-cta-btn" href={isEditable ? undefined : safeSecondaryHref} data-sub-element="ctaSecondary"
              title={isEditable ? "Cliquer pour modifier ce bouton" : undefined}
              onClick={(e) => {
                if (isEditable) { e.preventDefault(); selectSub(e, "ctaSecondary"); return; }
                handleSmartLinkClick(safeSecondaryHref, e, cleanTitle);
              }}
              style={{
                backgroundColor: settings.secondaryCtaBgColor || theme.surfaceColor || "rgba(255,255,255,0.92)",
                color: settings.secondaryCtaTextColor || theme.textColor || "#0F172A",
                borderRadius: `${ctaRadiusPx}px`,
              }}
              className={`inline-flex items-center justify-center gap-1.5 font-semibold border border-black/15 backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${ctaSizeClass} ${getSubRing("ctaSecondary")}`}
            >
              <span>{settings.secondaryCtaText}</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export const HeroPurePhoto: React.FC<{
  src: string; alt: string; fit?: "cover" | "contain";
  focalX: number; focalY: number; zoom: number; studioBg?: string;
  settings: HeroBannerSettings; onClick?: (e: React.MouseEvent) => void;
}> = ({ src, alt, fit = "cover", focalX, focalY, zoom, studioBg, settings, onClick }) => {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = !src || hasError ? ELEGANT_HERO_FALLBACK_IMG : src;
  const filterCss = resolveHeroImageFilterCss(settings);
  const safeZoom = Math.min(2, Math.max(1, zoom || 1));

  return (
    <div
      onClick={onClick}
      data-sub-element="background"
      title={onClick ? "Cliquer pour changer la photo" : undefined}
      className={`w-full h-full overflow-hidden ${onClick ? "cursor-pointer" : ""}`}
      style={{ backgroundColor: studioBg || "transparent" }}
    >
      <img
        data-testid="hero-pure-photo" src={resolvedSrc} alt={alt || "Image principale de la bannière"}
        referrerPolicy="no-referrer" onError={() => { if (!hasError) setHasError(true); }}
        style={{
          objectPosition: `${focalX}% ${focalY}%`,
          transform: safeZoom > 1 ? `scale(${safeZoom})` : undefined,
          transformOrigin: `${focalX}% ${focalY}%`, filter: filterCss,
        }}
        className={`w-full h-full ${fit === "contain" ? "object-contain p-2.5 sm:p-4" : "object-cover"} transition-transform duration-500`}
      />
    </div>
  );
};
