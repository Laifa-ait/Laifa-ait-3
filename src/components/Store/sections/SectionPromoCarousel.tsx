import React, { useState, useEffect } from "react";
import { CustomPageSection, PromoCarouselSettings, CustomPageTheme } from "../../../domains/seller/customPage.types";

interface SectionPromoCarouselProps {
  section: CustomPageSection<"promo_carousel">;
  theme: CustomPageTheme;
  isEditable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const SectionPromoCarousel: React.FC<SectionPromoCarouselProps> = ({
  section,
  theme,
  isEditable,
  isSelected,
  onSelect,
}) => {
  const settings: PromoCarouselSettings = section.settings;
  const slides = settings.slides || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!settings.autoplay || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, (settings.intervalSec || 5) * 1000);
    return () => clearInterval(interval);
  }, [slides.length, settings.autoplay, settings.intervalSec]);

  if (slides.length === 0) {
    return (
      <div
        onClick={isEditable ? onSelect : undefined}
        className="p-8 text-center bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500"
      >
        Carrousel promo vide (veuillez ajouter au moins une diapositive).
      </div>
    );
  }

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <div
      onClick={isEditable ? onSelect : undefined}
      className={`relative overflow-hidden rounded-2xl shadow-md transition-all cursor-pointer ${
        isEditable && isSelected ? "ring-4 ring-emerald-500 shadow-2xl z-10" : ""
      }`}
    >
      <div className="relative h-48 md:h-80 w-full bg-gray-900">
        <img
          src={currentSlide.imageUrl}
          alt={currentSlide.title || "Slide promo"}
          className="w-full h-full object-cover"
        />
        {currentSlide.title && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white font-bold text-lg md:text-2xl">
            {currentSlide.title}
          </div>
        )}
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-3 right-4 flex space-x-1.5 z-10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx === currentIndex ? "w-6 bg-white" : "bg-white/50"
              }`}
              style={{ backgroundColor: idx === currentIndex ? theme.primaryColor : undefined }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
