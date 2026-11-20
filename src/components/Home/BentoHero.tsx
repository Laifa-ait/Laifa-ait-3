import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Banner } from "../../domains/home/homepage.types";
import { BentoHeroSlide } from "./BentoHeroSlide";
import defaultHeroImg from "../../assets/images/olmart_hero_flagship_1795059554378.jpg";

export const BentoHero: React.FC<{ banners: Banner[] }> = ({ banners }) => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const lang = (i18n.language || "fr").split("-")[0];
  const isRTL = lang === "ar" || i18n.dir() === "rtl";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const DEFAULT_BANNERS: Banner[] = [
    {
      id: "default-hero-1",
      title: t("home.hero.default_title"),
      subtitle: t("home.hero.default_subtitle"),
      buttonText: t("home.hero.default_cta"),
      ctaLink: "/shop",
      imageUrl: defaultHeroImg,
      isActive: true,
    },
  ];

  const rawActiveBanners = (banners || []).filter(
    (b) => b.is_active !== false && b.isActive !== false
  );
  const activeBanners = rawActiveBanners.length > 0 ? rawActiveBanners : DEFAULT_BANNERS;

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    setDragOffset(e.touches[0].clientX - touchStartX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null) return;
    const width = containerRef.current?.offsetWidth || window.innerWidth;
    const threshold = width * 0.15;

    if (dragOffset > threshold) {
      if (isRTL) handleNext();
      else handlePrev();
    } else if (dragOffset < -threshold) {
      if (isRTL) handlePrev();
      else handleNext();
    }
    setTouchStartX(null);
    setDragOffset(0);
  };

  const handleBannerClick = (b: Banner) => {
    const rType = b.redirect_type;
    if (rType === "category" && b.target_category) {
      navigate(`/shop?category=${encodeURIComponent(b.target_category)}`);
      return;
    }
    if (rType === "campaign" && b.id) {
      navigate(`/campaign/${b.id}`);
      return;
    }
    if (rType === "custom_url" && (b.cta_link || b.ctaLink)) {
      const target = b.cta_link || b.ctaLink || "/shop";
      if (target.startsWith("http")) window.location.href = target;
      else navigate(target);
      return;
    }
    if (b.cta_link || b.ctaLink) {
      navigate(b.cta_link || b.ctaLink || "/shop");
    } else if (b.tag_id) {
      navigate(`/tags/${b.tag_id}`);
    } else if (b.target_category) {
      navigate(`/shop?category=${encodeURIComponent(b.target_category)}`);
    } else {
      navigate("/shop");
    }
  };

  const width = containerRef.current?.offsetWidth || window.innerWidth;
  const dragPercent = width > 0 ? (dragOffset / width) * 100 : 0;
  const basePercent = isRTL ? currentIndex * 100 : -currentIndex * 100;
  const totalPercent = (basePercent + dragPercent) / activeBanners.length;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="w-full min-h-[340px] sm:min-h-[420px] md:min-h-[470px] lg:min-h-[490px] relative rounded-3xl overflow-hidden group shadow-[0_24px_60px_-20px_rgba(15,27,29,0.28)] border border-[#0D5C4B]/20 select-none touch-pan-y bg-[#0F1B1D]"
    >
      <motion.div
        animate={{ x: `${totalPercent}%` }}
        transition={{ type: "spring", stiffness: 220, damping: 28, mass: 0.8 }}
        className="absolute inset-0 h-full flex flex-row"
        style={{ width: `${activeBanners.length * 100}%` }}
      >
        {activeBanners.map((banner, index) => (
          <BentoHeroSlide
            key={banner.id || index}
            banner={banner}
            index={index}
            totalBanners={activeBanners.length}
            onBannerClick={handleBannerClick}
            lang={lang}
          />
        ))}
      </motion.div>

      {activeBanners.length > 1 && (
        <>
          <button
            type="button"
            onClick={isRTL ? handleNext : handlePrev}
            aria-label={t("home.hero.prev_slide")}
            className={`absolute top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl bg-[#0F1B1D]/75 hover:bg-[#0D5C4B] backdrop-blur-md border border-white/15 text-white shadow-lg transition-all opacity-0 group-hover:opacity-100 duration-200 cursor-pointer ${
              isRTL ? "right-3 sm:right-6" : "left-3 sm:left-6"
            }`}
          >
            {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          <button
            type="button"
            onClick={isRTL ? handlePrev : handleNext}
            aria-label={t("home.hero.next_slide")}
            className={`absolute top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl bg-[#0F1B1D]/75 hover:bg-[#0D5C4B] backdrop-blur-md border border-white/15 text-white shadow-lg transition-all opacity-0 group-hover:opacity-100 duration-200 cursor-pointer ${
              isRTL ? "left-3 sm:left-6" : "right-3 sm:right-6"
            }`}
          >
            {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </>
      )}

      {activeBanners.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 end-4 sm:end-7 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F1B1D]/75 backdrop-blur-md border border-white/15 shadow-md">
          {activeBanners.map((_, idx) => {
            const isActive = currentIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer border-none p-0 ${
                  isActive
                    ? "w-6 h-1.5 bg-[#E59A42]"
                    : "w-1.5 h-1.5 bg-white/45 hover:bg-white/80"
                }`}
                aria-label={t("home.hero.go_to_slide", { number: idx + 1 })}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
