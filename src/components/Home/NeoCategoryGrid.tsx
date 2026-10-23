import React, { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useShop } from "../../context/ShopContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MobileSwipeIndicator } from "../ui/MobileSwipeIndicator";
import { CategoryCard, CategoryCardData } from "./CategoryCard";

export const NeoCategoryGrid: React.FC<{
  categories: CategoryCardData[];
  favoriteCategory: string | null;
}> = ({ categories, favoriteCategory: _favoriteCategory }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setActiveCategory } = useShop();
  const isRTL = i18n.dir() === "rtl";

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const lastScrollLeft = useRef(0);
  const velocityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Measure scroll/swipe dynamics to animate logos proportionally
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScroll = e.currentTarget.scrollLeft;
    const delta = currentScroll - lastScrollLeft.current;
    lastScrollLeft.current = currentScroll;

    // Clamp velocity to a safe spring range
    const clampedVelocity = Math.max(-20, Math.min(20, delta));
    setScrollVelocity(clampedVelocity);

    if (velocityTimeoutRef.current) {
      clearTimeout(velocityTimeoutRef.current);
    }
    velocityTimeoutRef.current = setTimeout(() => {
      setScrollVelocity(0);
    }, 110);
  };

  useEffect(() => {
    return () => {
      if (velocityTimeoutRef.current) {
        clearTimeout(velocityTimeoutRef.current);
      }
    };
  }, []);

  const handleManualScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350;
      const actualDirection = isRTL
        ? direction === "left"
          ? "right"
          : "left"
        : direction;

      // Give a tactile motion impulse to the moving logos
      setScrollVelocity(actualDirection === "left" ? -14 : 14);
      if (velocityTimeoutRef.current) clearTimeout(velocityTimeoutRef.current);
      velocityTimeoutRef.current = setTimeout(() => {
        setScrollVelocity(0);
      }, 350);

      scrollContainerRef.current.scrollBy({
        left: actualDirection === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleSelectCategory = useCallback(
    (categoryKey: string) => {
      setActiveCategory(categoryKey);
      navigate(`/shop?category=${encodeURIComponent(categoryKey)}`);
    },
    [setActiveCategory, navigate]
  );

  return (
    <section className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 mb-8 sm:mb-12 pt-2 relative z-20">
      {/* Title block matching reference screenshot */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            {t("home.categories.explore_by", "Un univers pour chaque envie")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {t("home.categories.swipe_hint", "Faites défiler horizontalement pour tout explorer")}
          </p>
        </div>

        {/* Desktop Slider Arrows */}
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleManualScroll("left")}
            className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-emerald-700 active:scale-95 transition-all shadow-2xs cursor-pointer"
            aria-label="Previous categories"
          >
            <ChevronLeft className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => handleManualScroll("right")}
            className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-emerald-700 active:scale-95 transition-all shadow-2xs cursor-pointer"
            aria-label="Next categories"
          >
            <ChevronRight className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Horizontal Swipe Container */}
      <div className="relative group/carousel">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-4 md:gap-5 pb-4 pt-1 px-0.5 scrollbar-hide scroll-smooth touch-pan-x"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((card, index) => (
            <CategoryCard
              key={card.key}
              card={card}
              index={index}
              scrollVelocity={scrollVelocity}
              onSelect={handleSelectCategory}
            />
          ))}
        </div>

        <MobileSwipeIndicator className="-mt-1" />
      </div>
    </section>
  );
};
