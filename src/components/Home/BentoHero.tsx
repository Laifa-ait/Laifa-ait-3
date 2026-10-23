import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Banner } from "../../domains/home/homepage.types";
import { BentoHeroSlide } from "./BentoHeroSlide";

export const BentoHero: React.FC<{ banners: Banner[] }> = ({ banners }) => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language || "fr";
  const isRTL = lang === "ar";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const DEFAULT_BANNERS: Banner[] = [
    {
      id: "default-hero-1",
      title: t("hero_default_title", "Le Premier Marketplace Algérien"),
      subtitle: t("hero_default_subtitle", "Découvrez les meilleures offres et artisans certifiés à travers 58 Wilayas"),
      buttonText: t("hero_default_btn", "Explorer la boutique"),
      ctaLink: "/shop",
      imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200",
      isActive: true,
    },
  ];

  const rawActiveBanners = (banners || []).filter(
    (b) => b.is_active !== false && b.isActive !== false
  );
  const activeBanners = rawActiveBanners.length > 0 ? rawActiveBanners : DEFAULT_BANNERS;

  // Auto-advance banner every 6.5s if multi-slide
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
    const currentX = e.touches[0].clientX;
    setDragOffset(currentX - touchStartX);
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
    if (b.ctaLink) {
      navigate(b.ctaLink);
    } else if (b.tag_id) {
      navigate(`/tags/${b.tag_id}`);
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
      className="w-full min-h-[340px] sm:min-h-[420px] md:min-h-[480px] lg:min-h-[500px] relative rounded-3xl overflow-hidden group shadow-lg border border-slate-200/80 dark:border-slate-800 select-none touch-pan-y bg-slate-950"
    >
      {/* Sliding Strip */}
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

      {/* Nav Chevrons */}
      {activeBanners.length > 1 && (
        <>
          <button
            type="button"
            onClick={isRTL ? handleNext : handlePrev}
            aria-label="Previous Slide"
            className={`absolute top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl bg-slate-900/75 hover:bg-slate-900 backdrop-blur-md border border-slate-700/60 text-white shadow-lg transition-all opacity-0 group-hover:opacity-100 duration-200 cursor-pointer ${
              isRTL ? "right-3 sm:right-6" : "left-3 sm:left-6"
            }`}
          >
            {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          <button
            type="button"
            onClick={isRTL ? handlePrev : handleNext}
            aria-label="Next Slide"
            className={`absolute top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl bg-slate-900/75 hover:bg-slate-900 backdrop-blur-md border border-slate-700/60 text-white shadow-lg transition-all opacity-0 group-hover:opacity-100 duration-200 cursor-pointer ${
              isRTL ? "left-3 sm:left-6" : "right-3 sm:right-6"
            }`}
          >
            {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </>
      )}

      {/* Slide Indicators with Active Progress Pill (placed at bottom-end corner) */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-3.5 sm:bottom-5 end-3.5 sm:end-6 z-30 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-800 shadow-md">
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
                    ? "w-5 h-1.5 bg-amber-400 shadow-xs"
                    : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
