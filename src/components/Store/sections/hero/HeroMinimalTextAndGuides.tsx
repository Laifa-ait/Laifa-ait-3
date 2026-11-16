import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  CustomPageTheme,
  HeroBannerSettings,
  HeroSubElement,
  HeroTextPosition9,
} from "../../../../domains/seller/customPage.types";
import { EditorialHeading } from "../../EditorialHeading";
import {
  ResolvedHeroDeviceProfile,
  resolveSafeHeroCtaHref,
  sanitizeHeroTitle,
} from "./heroResponsiveHelper";
import {
  resolveHeroBoxShadowCss,
  resolveHeroImageFilterCss,
  resolveHeroTextShadowCss,
} from "./heroVisualEffectsHelper";

export const ELEGANT_HERO_FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FAF6F0"/><stop offset="100%" stop-color="#E7DEC8"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><rect x="80" y="80" width="1040" height="640" rx="24" fill="none" stroke="#B85B35" stroke-opacity="0.25" stroke-width="2"/></svg>'
  );

export interface HeroArchitecturalStyleProps {
  settings: HeroBannerSettings;
  theme: CustomPageTheme;
  profile: ResolvedHeroDeviceProfile;
  isEditable?: boolean;
  activeSubElement?: HeroSubElement | null;
  isSubSelected: (sub: HeroSubElement) => boolean;
  selectSub: (e: React.MouseEvent, sub: HeroSubElement) => void;
  getSubRing: (sub: HeroSubElement) => string;
  handleTextPatch: (field: keyof HeroBannerSettings, val: string) => void;
}

export function resolvePosition9FlexClasses(pos9: HeroTextPosition9): string {
  const vertical = pos9.startsWith("top")
    ? "items-start"
    : pos9.startsWith("bottom")
      ? "items-end"
      : "items-center";
  const horizontal = pos9.endsWith("right")
    ? "justify-end text-end"
    : pos9.endsWith("center") || pos9 === "center"
      ? "justify-center text-center"
      : "justify-start text-start";
  return `${vertical} ${horizontal}`;
}

export const HeroCompositionGuides: React.FC<{
  isEditable?: boolean;
  showGuides?: boolean;
  safePaddingPx?: number;
}> = ({ isEditable, showGuides, safePaddingPx = 24 }) => {
  if (!isEditable || !showGuides) return null;
  return (
    <div
      data-testid="hero-composition-guides"
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="absolute border border-dashed border-sky-400/70 rounded-xl"
        style={{ inset: `${Math.max(12, safePaddingPx)}px` }}
      >
        <span className="absolute top-1.5 start-1.5 px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-200 text-[9px] font-bold uppercase tracking-wider">
          Zone sûre
        </span>
      </div>
      <div className="absolute inset-y-0 start-1/3 w-px bg-white/30" />
      <div className="absolute inset-y-0 start-2/3 w-px bg-white/30" />
      <div className="absolute inset-x-0 top-1/3 h-px bg-white/30" />
      <div className="absolute inset-x-0 top-2/3 h-px bg-white/30" />
      <div className="absolute inset-y-0 start-1/2 w-px border-s border-dashed border-amber-300/60" />
      <div className="absolute inset-x-0 top-1/2 h-px border-t border-dashed border-amber-300/60" />
    </div>
  );
};

interface HeroMinimalTextBlockProps {
  settings: HeroBannerSettings;
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
  settings, theme, profile, isEditable,
  defaultTitleColor, defaultSubtitleColor, defaultCtaBg, defaultCtaText,
  selectSub, getSubRing,
}) => {
  if (settings.hideAllText) return null;

  const titleColor = settings.titleColor || defaultTitleColor || theme.secondaryColor || "#111827";
  const subtitleColor = settings.subtitleColor || defaultSubtitleColor || "#52525B";
  const accentColor = theme.accentColor || theme.primaryColor || "#B45309";
  const ctaBgColor = settings.ctaBgColor || defaultCtaBg || theme.primaryColor || "#111827";
  const ctaTextColor = settings.ctaTextColor || defaultCtaText || "#FFFFFF";
  const cleanTitle = sanitizeHeroTitle(settings.title, settings.spotlightProductTitle);

  const showBadge = settings.showBadge !== false && Boolean((settings.badgeText || "").trim());
  const showSubtitle = settings.showSubtitle !== false && Boolean((settings.subtitle || "").trim());
  const showCta = settings.showCta !== false && Boolean((settings.ctaText || "Découvrir").trim());
  const showSecondaryCta = Boolean(settings.showSecondaryCta && (settings.secondaryCtaText || "").trim());
  const safeHref = resolveSafeHeroCtaHref(settings);

  const resolvedFont =
    settings.titleFontFamily === "serif"
      ? "'Playfair Display', Georgia, serif"
      : settings.titleFontFamily === "display"
        ? "'Plus Jakarta Sans', 'Inter', sans-serif"
        : theme.headingFontFamily || theme.fontFamily || "'Plus Jakarta Sans', sans-serif";

  const textShadowCss = resolveHeroTextShadowCss(settings.textShadow);
  const ctaStyle = settings.ctaStyle || "pill";
  const ctaSize = settings.ctaButtonSize || "md";
  const ctaSizeClass =
    ctaSize === "sm" ? "px-4 py-2 text-[11px]" : ctaSize === "lg" ? "px-8 py-4 text-sm" : "px-6 py-3 text-xs sm:text-sm";
  const ctaRadiusPx =
    typeof settings.ctaBorderRadiusPx === "number" ? settings.ctaBorderRadiusPx : ctaStyle === "sharp" ? 0 : 999;
  const ctaBorderWidth =
    typeof settings.ctaBorderWidthPx === "number" ? settings.ctaBorderWidthPx : ctaStyle === "outline" ? 2 : 0;
  const ctaShadowCss = resolveHeroBoxShadowCss(settings.ctaShadow, ctaBgColor);
  const alignClass =
    profile.textAlign === "center"
      ? "items-center text-center"
      : profile.textAlign === "right"
        ? "items-end text-end"
        : "items-start text-start";

  return (
    <div
      data-testid="hero-minimal-text-cluster"
      style={{ maxWidth: `${profile.textBoxMaxWidth}px`, gap: `${profile.textVerticalGap}px`, textShadow: textShadowCss }}
      className={`flex flex-col w-full ${alignClass}`}
    >
      {showBadge && (
        <span
          data-sub-element="badge"
          onClick={(e) => selectSub(e, "badge")}
          style={{
            backgroundColor: settings.badgeBgColor || accentColor,
            color: settings.badgeTextColor || "#FFFFFF",
          }}
          className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.18em] w-fit ${getSubRing("badge")}`}
        >
          {settings.badgeText}
        </span>
      )}

      <div data-sub-element="title" onClick={(e) => selectSub(e, "title")} className={getSubRing("title")}>
        <EditorialHeading
          text={cleanTitle}
          as="h1"
          theme={theme}
          accentColorOverride={accentColor}
          style={{ fontFamily: resolvedFont, color: titleColor }}
          className={`${profile.titleScaleClass} font-black tracking-tight leading-[1.08] break-words`}
        />
      </div>

      {showSubtitle && (
        <p
          data-sub-element="subtitle"
          onClick={(e) => selectSub(e, "subtitle")}
          style={{ color: subtitleColor }}
          className={`text-xs sm:text-sm leading-relaxed font-medium opacity-90 break-words ${getSubRing("subtitle")}`}
        >
          {settings.subtitle}
        </p>
      )}

      {(showCta || showSecondaryCta) && (
        <div className="pt-1 flex flex-wrap items-center gap-2.5">
          {showCta && (
            <a
              href={isEditable ? undefined : safeHref}
              data-sub-element="ctaPrimary"
              onClick={(e) => {
                if (isEditable) e.preventDefault();
                selectSub(e, "ctaPrimary");
              }}
              style={{
                backgroundColor: ctaStyle === "outline" ? "transparent" : ctaBgColor,
                color: ctaStyle === "outline" ? titleColor : ctaTextColor,
                borderColor: settings.ctaBorderColor || titleColor,
                borderWidth: `${ctaBorderWidth}px`,
                borderStyle: ctaBorderWidth > 0 ? "solid" : "none",
                borderRadius: `${ctaRadiusPx}px`,
                boxShadow: ctaShadowCss,
              }}
              className={`inline-flex items-center justify-center gap-2 font-black tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${ctaSizeClass} ${getSubRing("ctaPrimary")}`}
            >
              <span>{settings.ctaText || "Découvrir"}</span>
              {settings.ctaShowArrow !== false && <ArrowRight className="w-3.5 h-3.5 shrink-0" />}
            </a>
          )}

          {showSecondaryCta && (
            <a
              href={isEditable ? undefined : settings.secondaryCtaLink || "#catalog"}
              data-sub-element="ctaSecondary"
              onClick={(e) => {
                if (isEditable) e.preventDefault();
                selectSub(e, "ctaSecondary");
              }}
              style={{
                backgroundColor: settings.secondaryCtaBgColor || "rgba(255,255,255,0.88)",
                color: settings.secondaryCtaTextColor || "#111827",
                borderRadius: `${ctaRadiusPx}px`,
              }}
              className={`inline-flex items-center justify-center gap-1.5 font-bold border border-black/15 backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 ${ctaSizeClass} ${getSubRing("ctaSecondary")}`}
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
  src: string;
  alt: string;
  fit?: "cover" | "contain";
  focalX: number;
  focalY: number;
  zoom: number;
  studioBg?: string;
  settings: HeroBannerSettings;
  onClick?: (e: React.MouseEvent) => void;
}> = ({ src, alt, fit = "cover", focalX, focalY, zoom, studioBg, settings, onClick }) => {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = !src || hasError ? ELEGANT_HERO_FALLBACK_IMG : src;
  const filterCss = resolveHeroImageFilterCss(settings);
  const safeZoom = Math.min(1.6, Math.max(1, zoom || 1));

  return (
    <div
      onClick={onClick}
      className="w-full h-full overflow-hidden"
      style={{ backgroundColor: studioBg || "transparent" }}
    >
      <img
        data-testid="hero-pure-photo"
        src={resolvedSrc}
        alt={alt || "Visuel principal de la boutique"}
        referrerPolicy="no-referrer"
        onError={() => {
          if (!hasError) setHasError(true);
        }}
        style={{
          objectPosition: `${focalX}% ${focalY}%`,
          transform: safeZoom > 1 ? `scale(${safeZoom})` : undefined,
          transformOrigin: `${focalX}% ${focalY}%`,
          filter: filterCss,
        }}
        className={`w-full h-full ${fit === "contain" ? "object-contain p-2.5 sm:p-4" : "object-cover"} transition-transform duration-500`}
      />
    </div>
  );
};
