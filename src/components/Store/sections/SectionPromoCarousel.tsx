import React, { useState, useEffect } from "react";
import { CustomPageSection, PromoCarouselSettings, CustomPageTheme } from "../../../domains/seller/customPage.types";
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
  const styles = section.styles || {};
  const slides = Array.isArray(settings.slides) ? settings.slides : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const selectSection = useStudioStore((s) => s.selectSection);
  const selectedSectionId = useStudioStore((s) => s.selectedSectionId);
  const selectedSubElement = useStudioStore((s) => s.selectedSubElement);

  useEffect(() => {
    if (!settings.autoplay || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, (settings.intervalSec || 5) * 1000);
    return () => clearInterval(interval);
  }, [slides.length, settings.autoplay, settings.intervalSec]);

  // Automatically jump to the slide selected in the Studio left tree or inspector
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
  const isSlideFocused =
    isEditable &&
    selectedSectionId === section.id &&
    selectedSubElement === `slide-${safeIdx}`;

  const bannerPos = resolveBannerPosition(
    currentSlide?.contentPosition || settings.contentPosition,
    settings.textAlignment || "left",
    settings.verticalAlignment || "bottom"
  );

  return (
    <div
      onClick={isEditable ? onSelect : undefined}
      style={buildSectionContainerStyle(styles, "transparent", "#FFFFFF")}
      className={`relative overflow-hidden transition-all select-none ${resolveBorderRadiusClass(
        styles.borderRadius
      )} ${resolveShadowClass(styles.shadow)} ${resolveAnimationClass(styles.animation)} ${
        isEditable && isSelected
          ? "ring-2 ring-[#F97316] shadow-xl z-10"
          : isEditable
          ? "hover:ring-2 hover:ring-[#F97316]/50 cursor-pointer"
          : ""
      }`}
    >
      {isEditable && isSelected && (
        <div
          className="mb-3 flex items-center justify-between bg-[#111827] text-white px-3 py-2 rounded-xl text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="flex items-center gap-1.5 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Carrousel Promotionnel ({slides.length} diapositive{slides.length > 1 ? "s" : ""})</span>
          </span>
          <span className="text-[11px] text-[#FB923C] font-semibold">
            Gérez les diapositives dans l'onglet Contenu à droite →
          </span>
        </div>
      )}

      {slides.length === 0 ? (
        <div className="p-10 text-center bg-slate-100 rounded-2xl text-slate-500 text-xs font-medium">
          Carrousel promotionnel vide. Cliquez sur « + Ajouter une diapositive » dans le panneau de droite.
        </div>
      ) : (
        <div
          onClick={(e) => {
            if (!isEditable) return;
            e.stopPropagation();
            onSelect?.();
            selectSection(section.id, `slide-${safeIdx}`);
          }}
          className={`relative h-56 @sm:h-72 @md:h-96 w-full bg-slate-900 overflow-hidden ${resolveBorderRadiusClass(
            styles.borderRadius
          )} ${isSlideFocused ? "ring-2 ring-[#3B82F6]" : ""}`}
        >
          {currentSlide?.imageUrl && (
            <img
              src={currentSlide.imageUrl}
              alt={currentSlide.title || "Diapositive promotionnelle"}
              className="w-full h-full object-cover transition-all duration-500"
            />
          )}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col p-6 @sm:p-8 ${bannerPos.flexContainerClass}`}>
            {currentSlide?.title && (
              <h2
                onClick={(e) => {
                  if (!isEditable) return;
                  e.stopPropagation();
                  onSelect?.();
                  selectSection(section.id, `slide-${safeIdx}`);
                }}
                className="font-extrabold text-xl @sm:text-3xl max-w-2xl drop-shadow-sm rounded px-1.5 py-0.5 hover:ring-1 hover:ring-white/60"
                style={{ color: styles.textColor || "#FFFFFF" }}
              >
                {currentSlide.title}
              </h2>
            )}
            {currentSlide?.link && (
              <span
                className="mt-3 inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold shadow-md"
                style={{
                  backgroundColor: styles.buttonBgColor || theme.primaryColor || "#F97316",
                  color: styles.buttonTextColor || "#FFFFFF",
                }}
              >
                Découvrir l'offre →
              </span>
            )}
          </div>

          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((prev) => (prev + 1) % slides.length);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 right-5 flex items-center gap-1.5 z-10">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(idx);
                    }}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      idx === safeIdx ? "w-7 bg-[#F97316]" : "w-2.5 bg-white/60 hover:bg-white"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <SectionDividerRenderer divider={styles.divider} theme={theme} />
    </div>
  );
};
