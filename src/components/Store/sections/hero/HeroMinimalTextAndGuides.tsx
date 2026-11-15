import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  CustomPageTheme,
  HeroBannerSettings,
  HeroSubElement,
  HeroTextPosition9,
} from "../../../../domains/seller/customPage.types";
import { CanvasInlineText } from "../CanvasInlineText";
import {
  ResolvedHeroDeviceProfile,
  resolveHeroTitleClasses,
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
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F5F0E6"/><stop offset="50%" stop-color="#E6DEC8"/><stop offset="100%" stop-color="#D5C7AD"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><circle cx="600" cy="400" r="240" fill="none" stroke="#8C6D46" stroke-opacity="0.25" stroke-width="2"/><path d="M460 520 C460 360, 740 360, 740 520" fill="none" stroke="#8C6D46" stroke-opacity="0.35" stroke-width="2"/></svg>`
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

export function resolvePosition9FlexClasses(pos: HeroTextPosition9): string {
  const map: Record<HeroTextPosition9, string> = {
    "top-left": "items-start justify-start",
    "top-center": "items-start justify-center",
    "top-right": "items-start justify-end",
    "center-left": "items-center justify-start",
    "center": "items-center justify-center",
    "center-right": "items-center justify-end",
    "bottom-left": "items-end justify-start",
    "bottom-center": "items-end justify-center",
    "bottom-right": "items-end justify-end",
  };
  return map[pos] || "items-center justify-start";
}

export const HeroCompositionGuides: React.FC<{
  isEditable?: boolean;
  showGuides?: boolean;
  safePaddingPx: number;
}> = ({ isEditable, showGuides, safePaddingPx }) => {
  if (!isEditable || !showGuides) return null;
  const pad = Math.max(16, safePaddingPx);
  return (
    <div data-testid="hero-composition-guides" aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      <div className="absolute border border-dashed border-sky-400/75 rounded-lg" style={{ top: `${pad}px`, right: `${pad}px`, bottom: `${pad}px`, left: `${pad}px` }}>
        <span className="absolute top-1 left-1.5 px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-200 text-[9px] font-mono tracking-wider uppercase">
          Safe Area ({pad}px)
        </span>
      </div>
      <div className="absolute inset-y-0 left-1/3 border-l border-dotted border-sky-400/45" />
      <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-sky-400/65" />
      <div className="absolute inset-y-0 left-2/3 border-l border-dotted border-sky-400/45" />
      <div className="absolute inset-x-0 top-1/3 border-t border-dotted border-sky-400/45" />
      <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-sky-400/65" />
      <div className="absolute inset-x-0 top-2/3 border-t border-dotted border-sky-400/45" />
    </div>
  );
};

export const HeroPurePhoto: React.FC<{
  src: string;
  alt: string;
  fit: "cover" | "contain";
  focalX: number;
  focalY: number;
  zoom: number;
  studioBg?: string;
  settings?: HeroBannerSettings;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}> = ({ src, alt, fit, focalX, focalY, zoom, studioBg, settings, className = "", style, onClick }) => {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = !hasError && src && src.trim() ? src.trim() : ELEGANT_HERO_FALLBACK_IMG;
  const safeZoom = Math.min(1.6, Math.max(1, zoom || 1));
  const filterCss = settings ? resolveHeroImageFilterCss(settings) : undefined;
  const shadowCss = settings?.imageShadow ? resolveHeroBoxShadowCss(settings.imageShadow) : undefined;

  return (
    <div
      onClick={onClick}
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
      style={{
        backgroundColor: studioBg || "transparent",
        boxShadow: shadowCss,
        ...style,
      }}
    >
      <img
        src={resolvedSrc}
        alt={alt || "Visuel de collection"}
        referrerPolicy="no-referrer"
        data-testid="hero-pure-photo-img"
        onError={() => { if (!hasError) setHasError(true); }}
        className={`w-full h-full transition-transform duration-500 motion-reduce:transition-none ${fit === "contain" ? "object-contain p-3 sm:p-5" : "object-cover"}`}
        style={{
          objectPosition: `${focalX}% ${focalY}%`,
          transform: safeZoom !== 1 ? `scale(${safeZoom})` : undefined,
          transformOrigin: `${focalX}% ${focalY}%`,
          filter: filterCss,
        }}
      />
    </div>
  );
};

export const HeroMinimalTextBlock: React.FC<{
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
  className?: string;
  style?: React.CSSProperties;
}> = ({
  settings, theme, profile, isEditable = false, defaultTitleColor, defaultSubtitleColor, defaultCtaBg, defaultCtaText,
  activeSubElement, isSubSelected, selectSub, getSubRing, handleTextPatch, className = "", style,
}) => {
  if (settings.hideAllText || settings.bannerLayoutMode === "image-only") return null;

  const badgeLabel = settings.showBadge !== false ? (settings.badgeText || "").trim() : "";
  const cleanTitle = sanitizeHeroTitle(settings.title, settings.spotlightProductTitle);
  const subtitleText = settings.showSubtitle !== false ? (settings.subtitle || "").trim() : "";
  const ctaLabel = settings.showCta !== false ? (settings.ctaText || "").trim() : "";
  const secondaryCtaRaw = (settings.secondaryCtaText || "").trim();
  const showSecondary = Boolean(settings.showSecondaryCta) || secondaryCtaRaw.length > 0 || activeSubElement === "ctaSecondary";
  const secondaryCtaLabel = secondaryCtaRaw || (showSecondary ? "En savoir plus" : "");
  if (!cleanTitle && !subtitleText && !ctaLabel && !badgeLabel && !secondaryCtaLabel) return null;

  const titleClasses = resolveHeroTitleClasses(settings, profile.titleSizeToken);
  const alignFlex = profile.textAlign === "center" ? "items-center text-center" : profile.textAlign === "right" ? "items-end text-right" : "items-start text-left";
  const titleColor = settings.titleColor || defaultTitleColor || theme.secondaryColor || "var(--store-text, #111827)";
  const subtitleColor = settings.subtitleColor || defaultSubtitleColor || theme.mutedTextColor || "var(--store-muted-text, #52525B)";
  const badgeBg = settings.badgeBgColor || theme.accentBadgeColor || theme.primaryColor || "#B45309";
  const badgeText = settings.badgeTextColor || theme.badgeTextColor || "#FFFFFF";
  const badgeStyleMode = settings.badgeStyle || "solid";
  const ctaBg = settings.ctaBgColor || defaultCtaBg || theme.buttonColor || theme.primaryColor || "#111827";
  const ctaText = settings.ctaTextColor || defaultCtaText || theme.buttonTextColor || "#FFFFFF";
  const secCtaBg = settings.secondaryCtaBgColor || "transparent";
  const secCtaText = settings.secondaryCtaTextColor || titleColor;
  const secCtaStyle = settings.secondaryCtaStyle || "outline";
  const isOutlineCta = settings.ctaStyle === "outline";
  const isGlassCta = settings.ctaStyle === "glass";
  const ctaRadiusClass = typeof settings.ctaBorderRadiusPx === "number" ? "" : settings.ctaStyle === "pill" ? "rounded-full" : settings.ctaStyle === "sharp" ? "rounded-none" : "rounded-xl";
  const secRadiusClass = secCtaStyle === "pill" ? "rounded-full" : secCtaStyle === "sharp" ? "rounded-none" : "rounded-xl";
  const ctaSizeClass = settings.ctaButtonSize === "lg" ? "px-7 py-3.5 text-sm font-semibold tracking-wide" : settings.ctaButtonSize === "sm" ? "px-4 py-2 text-xs font-semibold tracking-wide" : "px-5 py-2.5 text-xs sm:text-sm font-semibold tracking-wide";
  const safeHref = resolveSafeHeroCtaHref(settings);
  const safeSecondaryHref = /^(javascript|data|vbscript):/i.test((settings.secondaryCtaLink || "").trim()) ? "#catalog" : (settings.secondaryCtaLink || "#catalog").trim() || "#catalog";
  const textShadowCss = resolveHeroTextShadowCss(settings.textShadow);
  const ctaShadowCss = resolveHeroBoxShadowCss(settings.ctaShadow, ctaBg);
  const secShadowCss = resolveHeroBoxShadowCss(settings.secondaryCtaShadow, secCtaText);
  const borderWidth = typeof settings.ctaBorderWidthPx === "number" ? settings.ctaBorderWidthPx : isOutlineCta ? 1.5 : isGlassCta ? 1 : 0;
  const borderColor = settings.ctaBorderColor || (isOutlineCta ? ctaBg : "rgba(255,255,255,0.35)");
  const customBtnRadius = typeof settings.ctaBorderRadiusPx === "number" ? `${settings.ctaBorderRadiusPx}px` : undefined;

  return (
    <div
      data-testid="hero-minimal-text-block"
      className={`flex flex-col ${alignFlex} w-full ${className}`}
      style={{ maxWidth: `${profile.textBoxMaxWidth}px`, gap: `${profile.textVerticalGap}px`, ...style }}
    >
      {badgeLabel && (
        <span
          onClick={(e) => selectSub(e, "badge")}
          data-testid="hero-badge-pill"
          className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest cursor-pointer ${getSubRing("badge")}`}
          style={{
            backgroundColor: badgeStyleMode === "outline" ? "transparent" : badgeStyleMode === "soft" ? `${badgeBg}20` : badgeBg,
            color: badgeStyleMode === "outline" || badgeStyleMode === "soft" ? badgeBg : badgeText,
            border: badgeStyleMode === "outline" ? `1.5px solid ${badgeBg}` : badgeStyleMode === "soft" ? `1px solid ${badgeBg}45` : undefined,
          }}
        >
          <CanvasInlineText value={badgeLabel} isSelected={isSubSelected("badge")} onChange={(val) => handleTextPatch("badgeText", val)} />
        </span>
      )}
      {cleanTitle && (
        <h1 onClick={(e) => selectSub(e, "title")} className={`${titleClasses} cursor-pointer break-words ${getSubRing("title")}`} style={{ color: titleColor, textShadow: textShadowCss }}>
          <CanvasInlineText value={cleanTitle} isSelected={isSubSelected("title")} onChange={(val) => handleTextPatch("title", val)} />
        </h1>
      )}
      {subtitleText && (
        <p onClick={(e) => selectSub(e, "subtitle")} className={`text-sm sm:text-base leading-relaxed font-normal cursor-pointer break-words ${getSubRing("subtitle")}`} style={{ color: subtitleColor, textShadow: textShadowCss }}>
          <CanvasInlineText value={subtitleText} isSelected={isSubSelected("subtitle")} onChange={(val) => handleTextPatch("subtitle", val)} multiline />
        </p>
      )}
      {(ctaLabel || secondaryCtaLabel) && (
        <div className="pt-1 flex flex-wrap items-center gap-2.5">
          {ctaLabel && (
            <a
              href={safeHref}
              data-testid="hero-single-cta-btn"
              aria-label={ctaLabel}
              onClick={(e) => { if (isEditable || activeSubElement !== undefined) { e.preventDefault(); selectSub(e, "ctaPrimary"); } }}
              className={`inline-flex items-center justify-center gap-2 transition-transform duration-200 hover:scale-[1.01] focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none ${isGlassCta ? "backdrop-blur-md" : ""} ${ctaRadiusClass} ${ctaSizeClass} ${getSubRing("ctaPrimary")}`}
              style={{
                backgroundColor: isOutlineCta ? "transparent" : isGlassCta ? `${ctaBg}CC` : ctaBg,
                color: isOutlineCta ? ctaBg : ctaText,
                border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : "none",
                borderRadius: customBtnRadius,
                boxShadow: ctaShadowCss,
              }}
            >
              <CanvasInlineText value={ctaLabel} isSelected={isSubSelected("ctaPrimary") || isSubSelected("cta")} onChange={(val) => handleTextPatch("ctaText", val)} />
              {settings.ctaShowArrow !== false && <ArrowRight className="w-4 h-4 shrink-0" />}
            </a>
          )}
          {secondaryCtaLabel && (
            <a
              href={safeSecondaryHref}
              data-testid="hero-secondary-cta-btn"
              aria-label={secondaryCtaLabel}
              onClick={(e) => { if (isEditable || activeSubElement !== undefined) { e.preventDefault(); selectSub(e, "ctaSecondary"); } }}
              className={`inline-flex items-center justify-center gap-1.5 transition-transform duration-200 hover:scale-[1.01] ${secCtaStyle === "glass" ? "backdrop-blur-md" : ""} ${secRadiusClass} ${ctaSizeClass} ${getSubRing("ctaSecondary")}`}
              style={{
                backgroundColor: secCtaStyle === "outline" ? "transparent" : secCtaBg,
                color: secCtaText,
                border: secCtaStyle === "outline" ? `1.5px solid ${secCtaText}` : "none",
                borderRadius: customBtnRadius,
                boxShadow: secShadowCss,
              }}
            >
              <CanvasInlineText value={secondaryCtaLabel} isSelected={isSubSelected("ctaSecondary")} onChange={(val) => handleTextPatch("secondaryCtaText", val)} />
            </a>
          )}
        </div>
      )}
    </div>
  );
};
