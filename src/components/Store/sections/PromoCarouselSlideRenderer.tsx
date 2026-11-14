import React from "react";
import { ArrowRight, Sparkles, Tag } from "lucide-react";
import {
  CustomPageSectionStyles,
  CustomPageTheme,
  PromoCarouselStyleVariant,
  PromoSlide,
} from "../../../domains/seller/customPage.types";
import { resolveBannerPosition } from "../../../pages/Seller/StoreBuilder/components/inspector/controls/AlignmentMatrix3x3";
import { safeNavigationHref } from "./safeNavigationHref";
import { EditorialHeading } from "../EditorialHeading";
import {
  resolveSectionButtonInlineStyle,
  resolveSectionImageFilterCss,
} from "./sectionStyleHelper";

interface PromoCarouselSlideRendererProps {
  slide: PromoSlide;
  nextSlide?: PromoSlide;
  slideIndex: number;
  totalSlides: number;
  carouselStyle: PromoCarouselStyleVariant;
  heightClass: string;
  overlayOpacity: number;
  globalPosition: ReturnType<typeof resolveBannerPosition>;
  styles: CustomPageSectionStyles;
  theme: CustomPageTheme;
  isEditable?: boolean;
  onFocusSlide?: () => void;
  onNextSlide?: () => void;
}

export const PromoCarouselSlideRenderer: React.FC<PromoCarouselSlideRendererProps> = ({
  slide, nextSlide, slideIndex, totalSlides, carouselStyle, heightClass,
  overlayOpacity, globalPosition, styles, theme, isEditable, onFocusSlide, onNextSlide,
}) => {
  const accentColor = styles.iconColor || styles.buttonBgColor || theme.primaryColor || "var(--store-primary, #B45309)";
  const headingColor = styles.headingColor || styles.textColor || "#FFFFFF";
  const subtitleColor = styles.subtitleColor || styles.textColor || "rgba(255,255,255,0.9)";
  const badgeBgColor = styles.badgeBgColor || `${accentColor}40`;
  const badgeTextColor = styles.badgeTextColor || "#FFFFFF";
  const priceColor = styles.priceColor || "#FCD34D";
  const ctaLabel = slide.ctaText?.trim() || "Découvrir l'offre";
  const safeHref = safeNavigationHref(slide.link || "#catalog") || "#catalog";
  const alpha = Math.min(0.9, Math.max(0, overlayOpacity / 100));
  const imgFilter = resolveSectionImageFilterCss(styles);
  const btnStyle = resolveSectionButtonInlineStyle(styles, theme);

  const renderActionCta = () => {
    const commonClass =
      "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs @sm:text-sm font-extrabold shadow-lg transition-transform active:scale-95 cursor-pointer";
    if (isEditable) {
      return (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onFocusSlide?.(); }}
          style={btnStyle}
          className={commonClass}
        >
          <span>{ctaLabel}</span>
          {styles.buttonShowArrow !== false && <ArrowRight className="w-4 h-4" />}
        </button>
      );
    }
    return (
      <a href={safeHref} style={btnStyle} className={commonClass}>
        <span>{ctaLabel}</span>
        {styles.buttonShowArrow !== false && <ArrowRight className="w-4 h-4" />}
      </a>
    );
  };

  if (carouselStyle === "split_magazine") {
    return (
      <div
        onClick={isEditable ? onFocusSlide : undefined}
        style={{ backgroundColor: styles.cardBgColor || "#0B132B" }}
        className="grid grid-cols-1 @md:grid-cols-12 w-full text-white overflow-hidden"
      >
        <div
          style={{ backgroundColor: styles.cardBgColor || undefined, borderColor: styles.cardBorderColor || "rgba(255,255,255,0.1)" }}
          className="@md:col-span-5 p-6 @sm:p-8 @md:p-10 flex flex-col justify-between gap-5 bg-gradient-to-br from-[#0F172A] to-[#022C43] border-b @md:border-b-0 @md:border-r"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-white/60">
                {String(slideIndex + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
              </span>
              {slide.badge && (
                <span
                  className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                  style={{ backgroundColor: badgeBgColor, color: badgeTextColor, border: `1px solid ${accentColor}` }}
                >
                  {slide.badge}
                </span>
              )}
            </div>
            {slide.title && (
              <EditorialHeading
                as="h2"
                text={slide.title}
                theme={theme}
                sectionStyles={styles}
                accentColorOverride={styles.kickerColor || accentColor}
                className="text-xl @sm:text-2xl @md:text-3xl font-black tracking-tight leading-tight"
                style={{ color: headingColor }}
              />
            )}
            {slide.subtitle && (
              <p className="text-xs @sm:text-sm leading-relaxed line-clamp-3" style={{ color: subtitleColor }}>{slide.subtitle}</p>
            )}
          </div>
          <div className="space-y-3 pt-2 pb-10 @md:pb-8">
            {slide.highlightPrice && (
              <div style={{ color: priceColor }} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 border border-white/15 text-xs font-extrabold">
                <Tag className="w-3.5 h-3.5" />
                <span>{slide.highlightPrice}</span>
              </div>
            )}
            <div>{renderActionCta()}</div>
          </div>
        </div>
        <div className={`@md:col-span-7 relative ${heightClass} bg-slate-900 overflow-hidden`}>
          {slide.imageUrl && (
            <img src={slide.imageUrl} alt={slide.title || "Offre"} style={{ filter: imgFilter }} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
          )}
        </div>
      </div>
    );
  }

  if (carouselStyle === "lookbook_peek") {
    return (
      <div onClick={isEditable ? onFocusSlide : undefined} className={`grid grid-cols-1 @md:grid-cols-12 gap-3 p-3 bg-slate-950 ${heightClass}`}>
        <div className="@md:col-span-9 relative rounded-2xl overflow-hidden bg-slate-900 h-full">
          {slide.imageUrl && <img src={slide.imageUrl} alt={slide.title || "Lookbook"} style={{ filter: imgFilter }} className="w-full h-full object-cover" />}
          <div
            className={`absolute inset-0 p-6 @sm:p-8 pb-16 flex flex-col ${globalPosition.flexContainerClass}`}
            style={{ background: `linear-gradient(to top, rgba(2,6,23,${Math.max(0.75, alpha)}), rgba(2,6,23,${alpha * 0.35}), transparent)` }}
          >
            <div className="max-w-xl space-y-2.5">
              {slide.badge && (
                <span style={{ backgroundColor: badgeBgColor, color: badgeTextColor }} className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md border border-white/25">
                  {slide.badge}
                </span>
              )}
              {slide.title && (
                <EditorialHeading
                  as="h2"
                  text={slide.title}
                  theme={theme}
                  sectionStyles={styles}
                  accentColorOverride={styles.kickerColor || accentColor}
                  style={{ color: headingColor }}
                  className="text-xl @sm:text-3xl font-black leading-tight drop-shadow-xs"
                />
              )}
              {slide.subtitle && <p className="text-xs @sm:text-sm line-clamp-2" style={{ color: subtitleColor }}>{slide.subtitle}</p>}
              <div className="pt-1 flex flex-wrap items-center gap-2.5">
                {renderActionCta()}
                {slide.highlightPrice && (
                  <span style={{ color: priceColor }} className="px-3 py-1.5 rounded-xl bg-black/55 backdrop-blur-md border border-white/20 text-xs font-extrabold">
                    {slide.highlightPrice}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation();
            onNextSlide?.();
          }}
          className="hidden @md:flex @md:col-span-3 relative rounded-2xl overflow-hidden bg-slate-900 h-full cursor-pointer group border border-white/10"
        >
          {(nextSlide?.imageUrl || slide.imageUrl) && (
            <img src={nextSlide?.imageUrl || slide.imageUrl} alt="" style={{ filter: imgFilter }} className="w-full h-full object-cover opacity-65 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4 flex flex-col justify-end">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">Suivant →</span>
            <span className="text-xs font-bold text-white line-clamp-2 mt-0.5">{nextSlide?.title || "Diapositive suivante"}</span>
          </div>
        </div>
      </div>
    );
  }

  const isGlass = carouselStyle === "floating_glass";
  const isSpotlight = carouselStyle === "offer_spotlight";

  return (
    <div onClick={isEditable ? onFocusSlide : undefined} className={`relative ${heightClass} w-full bg-slate-950 overflow-hidden`}>
      {slide.imageUrl && <img src={slide.imageUrl} alt={slide.title || "Promotion"} style={{ filter: imgFilter }} className="w-full h-full object-cover transition-all duration-700" />}
      {isSpotlight && (slide.highlightPrice || slide.badge) && (
        <div style={{ backgroundColor: styles.badgeBgColor || "#FBBF24", color: styles.badgeTextColor || "#020617" }} className="absolute top-4 right-4 z-10 px-3.5 py-2 rounded-2xl font-black text-xs @sm:text-sm shadow-xl flex items-center gap-1.5 border-2 border-white">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{slide.highlightPrice || slide.badge}</span>
        </div>
      )}
      <div
        className={`absolute inset-0 p-5 @sm:p-8 @md:p-10 pb-16 @sm:pb-16 flex flex-col ${globalPosition.flexContainerClass}`}
        style={{
          background: isGlass
            ? `rgba(2, 6, 23, ${alpha * 0.45})`
            : `linear-gradient(to top, rgba(2, 6, 23, ${Math.max(0.78, alpha + 0.25)}) 0%, rgba(2, 6, 23, ${alpha}) 55%, rgba(2, 6, 23, ${alpha * 0.25}) 100%)`,
        }}
      >
        <div
          style={isGlass ? { backgroundColor: styles.cardBgColor || "rgba(2,6,23,0.7)", borderColor: styles.cardBorderColor || "rgba(255,255,255,0.2)" } : undefined}
          className={isGlass ? "max-w-lg w-full p-5 @sm:p-6 rounded-2xl backdrop-blur-xl border shadow-2xl space-y-2.5" : "max-w-2xl space-y-2.5"}
        >
          {slide.badge && (
            <div>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] @sm:text-[11px] font-extrabold uppercase tracking-wider shadow-xs"
                style={{
                  backgroundColor: styles.badgeBgColor || (isSpotlight ? accentColor : "rgba(255,255,255,0.16)"),
                  color: badgeTextColor,
                  border: "1px solid rgba(255,255,255,0.28)",
                }}
              >
                <Sparkles className="w-3 h-3" />
                <span>{slide.badge}</span>
              </span>
            </div>
          )}
          {slide.title && (
            <EditorialHeading
              as="h2"
              text={slide.title}
              theme={theme}
              sectionStyles={styles}
              accentColorOverride={styles.kickerColor || accentColor}
              className="font-black text-xl @sm:text-3xl @md:text-4xl tracking-tight leading-tight drop-shadow-sm"
              style={{ color: headingColor }}
            />
          )}
          {slide.subtitle && (
            <p className="text-xs @sm:text-sm @md:text-base leading-relaxed max-w-xl line-clamp-2 @sm:line-clamp-3" style={{ color: subtitleColor }}>
              {slide.subtitle}
            </p>
          )}
          <div className="pt-1.5 flex flex-wrap items-center gap-2.5">
            {renderActionCta()}
            {!isSpotlight && slide.highlightPrice && (
              <span style={{ color: priceColor }} className="px-3.5 py-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 text-xs font-extrabold">
                {slide.highlightPrice}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
