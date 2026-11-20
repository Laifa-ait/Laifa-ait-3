import React, { useState, useEffect } from "react";
import { ArrowUpRight, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Banner } from "../../domains/home/homepage.types";
import { getOptimizedImageUrl } from "../../utils/imageUtils";
import defaultHeroImg from "../../assets/images/olmart_hero_flagship_1795059554378.jpg";

interface BentoHeroSlideProps {
  banner: Banner;
  index: number;
  totalBanners: number;
  onBannerClick: (banner: Banner) => void;
  lang: string;
}

const SHADOW_MAP: Record<string, string> = {
  none: "",
  soft: "shadow-md",
  medium: "shadow-xl",
  strong: "shadow-[0_20px_50px_rgba(15,27,29,0.7)]",
  glow: "shadow-[0_0_40px_rgba(229,154,66,0.45)] ring-1 ring-[#E59A42]/40",
};

export const BentoHeroSlide: React.FC<BentoHeroSlideProps> = ({
  banner,
  index,
  totalBanners,
  onBannerClick,
  lang,
}) => {
  const { t } = useTranslation();

  const getTranslatedValue = (b: Banner, key: "title" | "subtitle" | "button_text"): string => {
    const cleanLang = (lang || "fr").split("-")[0] as "fr" | "ar" | "en";
    const langBlock = b.translations?.[cleanLang];
    if (langBlock?.[key]) return langBlock[key] || "";

    const flatKey = `${key}_${cleanLang}` as keyof Banner;
    const flatVal = b[flatKey];
    if (typeof flatVal === "string" && flatVal) return flatVal;

    const rawVal =
      (key === "title"
        ? b.title || b.name
        : key === "subtitle"
        ? b.subtitle
        : b.button_text || b.ctaText || b.buttonText) || "";
    return rawVal ? t(rawVal, rawVal) : "";
  };

  const title = getTranslatedValue(banner, "title");
  const subtitle = getTranslatedValue(banner, "subtitle");
  const buttonText = getTranslatedValue(banner, "button_text");

  const rawDesktop = banner.desktop_image || banner.desktopImage || banner.imageUrl;
  const desktopImageUrl = rawDesktop ? getOptimizedImageUrl(rawDesktop, 1400, title) : defaultHeroImg;
  const rawMobile = banner.mobile_image || banner.mobileImageUrl || rawDesktop;
  const mobileImageUrl = rawMobile ? getOptimizedImageUrl(rawMobile, 800, title) : defaultHeroImg;

  const [imgError, setImgError] = useState(false);
  useEffect(() => {
    setImgError(false);
  }, [desktopImageUrl, mobileImageUrl]);

  const hasCustomButtonColor = Boolean(banner.btn_bg_color);
  const hasContent = Boolean(title || subtitle || buttonText || banner.badge || banner.discount_label);

  const marginPx = banner.image_margin ?? 0;
  const bgColor = banner.bg_color || "#0F1B1D";
  const imageFit = banner.image_fit || "cover";
  const imagePosition = banner.image_position || "center";
  const overlayOpacity = banner.overlay_opacity ?? 70;
  const overlayColor = banner.overlay_color || "#0F1B1D";
  const shadowClass = SHADOW_MAP[banner.shadow_intensity || "none"] || "";

  const alignClass =
    banner.text_align === "center"
      ? "items-center text-center mx-auto"
      : banner.text_align === "right"
      ? "items-end text-right ms-auto"
      : "items-start text-start";

  const posClass =
    banner.content_position === "top"
      ? "justify-start"
      : banner.content_position === "center"
      ? "justify-center"
      : "justify-end";

  return (
    <div
      key={banner.id || index}
      onClick={() => onBannerClick(banner)}
      className="h-full flex-shrink-0 relative overflow-hidden flex items-center cursor-pointer select-none"
      style={{
        width: `${100 / totalBanners}%`,
        backgroundColor: bgColor,
        padding: marginPx > 0 ? `${marginPx}px` : undefined,
      }}
    >
      <div
        className={`relative w-full h-full overflow-hidden ${
          marginPx > 0 ? "rounded-2xl" : ""
        } ${shadowClass}`}
      >
        <picture className="absolute inset-0 w-full h-full">
          {!imgError && mobileImageUrl && mobileImageUrl !== desktopImageUrl && (
            <source media="(max-width: 640px)" srcSet={mobileImageUrl} />
          )}
          <img
            loading="eager"
            src={imgError ? defaultHeroImg : desktopImageUrl || defaultHeroImg}
            alt={title || t("home.hero.banner_alt")}
            style={{ objectFit: imageFit, objectPosition: imagePosition }}
            className="w-full h-full"
            referrerPolicy="no-referrer"
            onError={(e) => {
              if (!imgError) setImgError(true);
              if (e.currentTarget.src !== defaultHeroImg) {
                e.currentTarget.src = defaultHeroImg;
              }
            }}
          />
        </picture>

        {hasContent && overlayOpacity > 0 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(100deg, ${overlayColor}E6 0%, ${overlayColor}99 42%, transparent 82%), linear-gradient(to top, ${overlayColor}CC 0%, transparent 55%)`,
              opacity: overlayOpacity / 100,
            }}
          />
        )}

        {banner.discount_label && (
          <div className="absolute top-4 end-4 z-20 px-3 py-1 rounded-lg bg-[#C83E4D] text-white text-xs sm:text-sm font-bold tracking-wide shadow-md">
            {t(banner.discount_label, banner.discount_label)}
          </div>
        )}

        {banner.show_countdown && (
          <div className="absolute top-4 start-4 z-20 px-3 py-1.5 rounded-lg bg-[#0F1B1D]/85 backdrop-blur-md border border-white/15 text-white text-[11px] font-mono tabular-nums font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#E59A42]" />
            <span>{t("home.flash.badge")}</span>
          </div>
        )}

        {hasContent && (
          <div
            className={`absolute inset-0 p-6 sm:p-8 md:p-12 flex flex-col ${posClass} ${alignClass} z-10 max-w-[92%] sm:max-w-[72%] md:max-w-[58%]`}
          >
            {banner.badge && (
              <div
                style={{ color: banner.badge_color || "#E59A42" }}
                className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-[0.16em] uppercase mb-2.5"
              >
                <span>{t("home.hero.prestige_tag")}</span>
                <span aria-hidden="true" className="opacity-60">·</span>
                <span>{t(banner.badge, banner.badge)}</span>
              </div>
            )}

            {title && (
              <h2
                className="text-2xl sm:text-4xl md:text-[2.75rem] font-display font-bold tracking-tight mb-2.5 sm:mb-3 leading-[1.12] text-balance"
                style={{ color: banner.title_color || "#FFFFFF" }}
              >
                {title}
              </h2>
            )}

            {subtitle && (
              <p
                className="text-sm sm:text-[15px] font-normal mb-5 sm:mb-6 max-w-lg leading-relaxed text-[#E2ECE9]"
                style={{ color: banner.subtitle_color || undefined }}
              >
                {subtitle}
              </p>
            )}

            <div className="pt-0.5 flex flex-wrap items-center gap-3">
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
                className={`group relative inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm tracking-tight transition-all duration-200 cursor-pointer border-none shadow-md active:scale-[0.98] whitespace-nowrap ${
                  !hasCustomButtonColor
                    ? "bg-[#E59A42] hover:bg-[#ECA856] text-[#0F1B1D]"
                    : "hover:brightness-105"
                }`}
              >
                <span>{buttonText || t("home.hero.default_cta")}</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 stroke-[2.25]" />
              </button>

              {banner.secondary_button_text && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBannerClick({
                      ...banner,
                      cta_link: banner.secondary_cta_link || "/shop",
                      redirect_type: "custom_url",
                    });
                  }}
                  className="px-5 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm bg-white/12 hover:bg-white/22 backdrop-blur-md text-white border border-white/25 transition-colors duration-200 cursor-pointer whitespace-nowrap"
                >
                  {t(banner.secondary_button_text, banner.secondary_button_text)}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
