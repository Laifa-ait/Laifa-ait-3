import React, { useState, useEffect } from "react";
import {
  CustomPageSection,
  PromoCarouselSettings,
  CustomPageTheme,
  PromoCarouselStyleVariant,
} from "../../../domains/seller/customPage.types";
import {
  buildSectionContainerStyle,
  resolveBorderRadiusClass,
  resolveShadowClass,
  resolveAnimationClass,
  SectionDividerRenderer,
} from "./sectionStyleHelper";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useStudioStore } from "../../../pages/Seller/StoreBuilder/store/useStudioStore";
import { resolveBannerPosition } from "../../../pages/Seller/StoreBuilder/components/inspector/controls/AlignmentMatrix3x3";
import { PromoCarouselSlideRenderer } from "./PromoCarouselSlideRenderer";

interface SectionPromoCarouselProps {
  section: CustomPageSection<"promo_carousel">;
  theme: CustomPageTheme;
  isEditable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

const HEIGHT_CLASS_MAP: Record<string, string> = {
  sm: "h-56 @sm:h-64 @md:h-72",
  md: "h-64 @sm:h-80 @md:h-96",
  lg: "h-72 @sm:h-96 @md:h-[440px]",
  xl: "h-80 @sm:h-[420px] @md:h-[520px]",
};

export const SectionPromoCarousel: React.FC<SectionPromoCarouselProps> = ({
  section,
  theme,
  isEditable,
  isSelected,
  onSelect,
}) => {
  const settings: PromoCarouselSettings = section.settings;
  const styles = section.styles || {};
  const slides = Array.isArray(settings.slides) ? settings.slides : [];
  const [currentIndex, setCurrentIndex] = useState(0);

  const selectSection = useStudioStore((s) => s.selectSection);
  const selectedSectionId = useStudioStore((s) => s.selectedSectionId);
  const selectedSubElement = useStudioStore((s) => s.selectedSubElement);

  const isStudioSlideFocused =
    isEditable &&
    selectedSectionId === section.id &&
    Boolean(selectedSubElement?.startsWith("slide-"));

  useEffect(() => {
    if (!settings.autoplay || slides.length <= 1 || isStudioSlideFocused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, (settings.intervalSec || 5) * 1000);
    return () => clearInterval(interval);
  }, [slides.length, settings.autoplay, settings.intervalSec, isStudioSlideFocused]);

  // Synchronize live canvas carousel with slide selected in Inspector or Structure Tree
  useEffect(() => {
    if (selectedSectionId === section.id && selectedSubElement?.startsWith("slide-")) {
      const idx = parseInt(selectedSubElement.replace("slide-", ""), 10);
      if (!Number.isNaN(idx) && idx >= 0 && idx < slides.length) {
        setCurrentIndex(idx);
      }
    }
  }, [selectedSectionId, selectedSubElement, section.id, slides.length]);

  const safeIdx = currentIndex < slides.length ? currentIndex : 0;
  const currentSlide = slides[safeIdx];
  const nextSlide = slides.length > 1 ? slides[(safeIdx + 1) % slides.length] : undefined;

  const carouselStyle: PromoCarouselStyleVariant =
    settings.carouselStyle || "editorial_luxury";
  const heightClass = HEIGHT_CLASS_MAP[settings.bannerHeight || "md"] || HEIGHT_CLASS_MAP.md;
  const overlayOpacity =
    typeof currentSlide?.overlayOpacity === "number"
      ? currentSlide.overlayOpacity
      : typeof settings.overlayOpacity === "number"
      ? settings.overlayOpacity
      : 45;

  const bannerPos = resolveBannerPosition(
    currentSlide?.contentPosition || settings.contentPosition || "bottom-left",
    settings.textAlignment || "left",
    settings.verticalAlignment || "bottom"
  );

  const handleGoToSlide = (idx: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex(idx);
    if (isEditable) {
      onSelect?.();
      selectSection(section.id, `slide-${idx}`);
    }
  };

  return (
    <div
      onClick={isEditable ? onSelect : undefined}
      style={buildSectionContainerStyle(styles, "transparent", "#FFFFFF")}
      className={`relative overflow-hidden transition-all select-none ${resolveBorderRadiusClass(
        styles.borderRadius
      )} ${resolveShadowClass(styles.shadow)} ${resolveAnimationClass(styles.animation)} ${
        isEditable && isSelected
          ? "ring-2 ring-[#023859] shadow-xl z-10"
          : isEditable
          ? "hover:ring-2 hover:ring-[#023859]/50 cursor-pointer"
          : ""
      }`}
    >
      {slides.length === 0 ? (
        <div className="p-10 text-center bg-slate-100 rounded-2xl text-slate-600 text-xs font-semibold flex flex-col items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#023859]" />
          <span>Aucune diapositive configurée. Ouvrez l&apos;onglet Réglages pour ajouter vos offres.</span>
        </div>
      ) : (
        <div
          className={`relative w-full overflow-hidden ${resolveBorderRadiusClass(
            styles.borderRadius
          )}`}
        >
          {/* Subtle Studio Floating Slide Switcher Pill (Only visible when editing in Studio) */}
          {isEditable && isSelected && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-3 left-3 z-20 flex items-center gap-1 p-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/20 shadow-lg"
            >
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleGoToSlide(idx, e)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                    idx === safeIdx
                      ? "bg-[#F97316] text-white shadow-2xs"
                      : "text-white/75 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Slide {idx + 1}
                </button>
              ))}
            </div>
          )}

          <PromoCarouselSlideRenderer
            slide={currentSlide}
            nextSlide={nextSlide}
            slideIndex={safeIdx}
            totalSlides={slides.length}
            carouselStyle={carouselStyle}
            heightClass={heightClass}
            overlayOpacity={overlayOpacity}
            globalPosition={bannerPos}
            styles={styles}
            theme={theme}
            isEditable={isEditable}
            onFocusSlide={() => {
              if (!isEditable) return;
              onSelect?.();
              selectSection(section.id, `slide-${safeIdx}`);
            }}
            onNextSlide={() => handleGoToSlide((safeIdx + 1) % slides.length)}
          />

          {/* Non-overlapping Bottom Architectural Control Bar */}
          {slides.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between gap-3 pointer-events-none"
            >
              {/* Dots & Counter Pill */}
              <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/65 backdrop-blur-md border border-white/15">
                {settings.showSlideCounter !== false && (
                  <span className="text-[10px] font-mono font-extrabold text-white/90 pr-1 border-r border-white/20">
                    {String(safeIdx + 1).padStart(2, "0")}/{String(slides.length).padStart(2, "0")}
                  </span>
                )}
                {settings.showDots !== false && (
                  <div className="flex items-center gap-1.5">
                    {slides.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        aria-label={`Aller à la diapositive ${idx + 1}`}
                        onClick={(e) => handleGoToSlide(idx, e)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          idx === safeIdx
                            ? "w-6 bg-[#F97316]"
                            : "w-2 bg-white/55 hover:bg-white"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Safe Navigation Arrows (Bottom-Right Dock - Never overlaps title!) */}
              {settings.showArrows !== false && (
                <div className="pointer-events-auto flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="Diapositive précédente"
                    onClick={(e) =>
                      handleGoToSlide((safeIdx - 1 + slides.length) % slides.length, e)
                    }
                    className="w-8 h-8 @sm:w-9 @sm:h-9 rounded-full bg-slate-950/75 hover:bg-slate-950 text-white border border-white/20 flex items-center justify-center shadow-md cursor-pointer transition-transform active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4 @sm:w-5 @sm:h-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Diapositive suivante"
                    onClick={(e) => handleGoToSlide((safeIdx + 1) % slides.length, e)}
                    className="w-8 h-8 @sm:w-9 @sm:h-9 rounded-full bg-slate-950/75 hover:bg-slate-950 text-white border border-white/20 flex items-center justify-center shadow-md cursor-pointer transition-transform active:scale-95"
                  >
                    <ChevronRight className="w-4 h-4 @sm:w-5 @sm:h-5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <SectionDividerRenderer divider={styles.divider} theme={theme} />
    </div>
  );
};
