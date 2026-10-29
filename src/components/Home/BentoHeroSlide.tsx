import React from "react";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Banner } from "../../domains/home/homepage.types";
import { getOptimizedImageUrl } from "../../utils/imageUtils";

interface BentoHeroSlideProps {
  banner: Banner;
  index: number;
  totalBanners: number;
  onBannerClick: (banner: Banner) => void;
  lang: string;
}

export const BentoHeroSlide: React.FC<BentoHeroSlideProps> = ({
  banner,
  index,
  totalBanners,
  onBannerClick,
  lang,
}) => {
  const { t } = useTranslation();

  const getTranslatedValue = (b: Banner, key: "title" | "subtitle" | "button_text"): string => {
    if (b.translations?.[lang]?.[key]) {
      return b.translations[lang][key];
    }
    const flatKey = `${key}_${lang}` as keyof Banner;
    const flatVal = b[flatKey];
    if (typeof flatVal === "string" && flatVal) {
      return flatVal;
    }
    const rawVal =
      (key === "title"
        ? b.title || b.name
        : key === "subtitle"
        ? b.subtitle
        : b.button_text || b.ctaText || b.buttonText) || "";
    if (rawVal) {
      return t(rawVal, rawVal);
    }
    return "";
  };

  const title = getTranslatedValue(banner, "title");
  const subtitle = getTranslatedValue(banner, "subtitle");
  const buttonText = getTranslatedValue(banner, "button_text");

  const rawDesktop = banner.desktop_image || banner.desktopImage || banner.imageUrl;
  const desktopImageUrl = getOptimizedImageUrl(rawDesktop, 1400);
  const rawMobile = banner.mobile_image || banner.mobileImageUrl || rawDesktop;
  const mobileImageUrl = getOptimizedImageUrl(rawMobile, 800);

  const hasCustomButtonColor = Boolean(banner.btn_bg_color);
  const hasContent = Boolean(title || subtitle || buttonText);

  return (
    <div
      key={banner.id || index}
      onClick={() => onBannerClick(banner)}
      className="h-full flex-shrink-0 relative overflow-hidden flex items-center cursor-pointer select-none"
      style={{ width: `${100 / totalBanners}%` }}
    >
      {/* Responsive Background Imagery */}
      <picture className="absolute inset-0 w-full h-full">
        {mobileImageUrl && mobileImageUrl !== desktopImageUrl && (
          <source media="(max-width: 640px)" srcSet={mobileImageUrl} />
        )}
        <img
          loading="eager"
          src={desktopImageUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200"}
          alt={title || "Bannière Olmart"}
          className="w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
      </picture>

      {/* Subtle Legibility Gradient strictly at the bottom */}
      {hasContent && (
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#1A1836]/95 via-[#42164B]/50 to-transparent pointer-events-none" />
      )}

      {/* Structured Content Container docked at the bottom */}
      {hasContent && (
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-8 flex flex-col justify-end items-start z-10 max-w-[85%] sm:max-w-[72%] md:max-w-[58%]">
          {/* Optional Kicker (clean unboxed text with typographic separator) */}
          {banner.badge && (
            <div className="inline-flex items-center gap-2 text-[#E99856] text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1.5 sm:mb-2 drop-shadow-xs">
              <span>Olmart Prestige</span>
              <span aria-hidden="true" className="text-[#E0B4B2]">·</span>
              <span className="text-[#E0B4B2]">{banner.badge}</span>
            </div>
          )}

          {/* Title */}
          {title && (
            <h2
              className="text-xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight mb-1.5 sm:mb-2 leading-tight text-start drop-shadow-md text-balance"
              style={{ color: banner.title_color || "#FFFFFF" }}
            >
              {title}
            </h2>
          )}

          {/* Subtitle */}
          {subtitle && (
            <p
              className="text-xs sm:text-sm font-medium mb-3 sm:mb-4 max-w-md text-start leading-relaxed drop-shadow-sm text-[#E0B4B2]/95"
              style={{ color: banner.subtitle_color || undefined }}
            >
              {subtitle}
            </p>
          )}

          {/* Clean Primary CTA Button */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBannerClick(banner);
              }}
              style={
                hasCustomButtonColor
                  ? {
                      backgroundColor: banner.btn_bg_color,
                      color: banner.btn_text_color || "#FFFFFF",
                    }
                  : undefined
              }
              className={`group relative inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-extrabold text-xs sm:text-sm tracking-tight transition-all duration-200 cursor-pointer border-none shadow-md active:scale-95 whitespace-nowrap ${
                !hasCustomButtonColor
                  ? "bg-gradient-to-r from-[#E99856] to-[#f0aa6e] text-[#1A1836] hover:from-[#f3ab6e] hover:to-[#E99856] shadow-[#1A1836]/30"
                  : "hover:brightness-105"
              }`}
            >
              <span>{buttonText || t("Découvrir la sélection", "Découvrir la sélection")}</span>
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
