import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { HeroBannerSettings } from "../../../../domains/seller/customPage.types";
import { useReducedMotion } from "motion/react";
import { resolveHeroImageFilterCss } from "./heroVisualEffectsHelper";

export function resolveHeroSwapImages(
  settings: HeroBannerSettings,
  activeImageSrc: string,
  fallbackImage: string
): string[] {
  const customList = Array.isArray(settings.heroSwapImages)
    ? settings.heroSwapImages.map((u) => u?.trim()).filter(Boolean)
    : [];

  const candidates = [
    activeImageSrc || settings.imageUrl,
    ...customList,
    settings.secondaryImageUrl,
    settings.tertiaryImageUrl,
  ]
    .map((u) => (typeof u === "string" ? u.trim() : ""))
    .filter(Boolean);

  const unique = Array.from(new Set(candidates));
  if (unique.length === 0 && fallbackImage) {
    unique.push(fallbackImage);
  }
  return unique;
}

interface HeroSwapImageFrameProps {
  settings: HeroBannerSettings;
  activeImageSrc: string;
  activeFocalPoint: string;
  focalX?: number;
  focalY?: number;
  zoom?: number;
  fallbackImage: string;
  altText: string;
  heightPx: number;
  className?: string;
  style?: React.CSSProperties;
  onClickFrame?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}

export const HeroSwapImageFrame: React.FC<HeroSwapImageFrameProps> = ({
  settings,
  activeImageSrc,
  activeFocalPoint,
  focalX = 50,
  focalY = 50,
  zoom = 1,
  fallbackImage,
  altText,
  heightPx,
  className = "",
  style,
  onClickFrame,
  children,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const slides = useMemo(
    () => resolveHeroSwapImages(settings, activeImageSrc, fallbackImage),
    [settings, activeImageSrc, fallbackImage]
  );

  const hasMultiSlides = slides.length > 1 && settings.enableImageSwap !== false;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const safeIndex = currentIndex < slides.length ? currentIndex : 0;
  const intervalSec = typeof settings.swapIntervalSec === "number" ? settings.swapIntervalSec : 4;

  useEffect(() => {
    if (!hasMultiSlides || isPaused || prefersReducedMotion || intervalSec <= 0) return;
    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, intervalSec * 1000);
    return () => window.clearInterval(timer);
  }, [hasMultiSlides, isPaused, prefersReducedMotion, intervalSec, slides.length]);

  const goPrev = (e: React.MouseEvent): void => {
    e.stopPropagation();
    e.preventDefault();
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goNext = (e: React.MouseEvent): void => {
    e.stopPropagation();
    e.preventDefault();
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const isContain = settings.imageFit === "contain";
  const studioBg = settings.imageStudioBg || "transparent";
  const currentSrc = slides[safeIndex] || fallbackImage;
  const filterCss = resolveHeroImageFilterCss(settings);
  const safeZoom = Math.min(1.6, Math.max(1, zoom || 1));

  return (
    <div
      data-testid="hero-swap-stage"
      onClick={onClickFrame}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`group/swap relative w-full overflow-hidden select-none ${className}`}
      style={{
        backgroundColor: studioBg,
        height: `${heightPx}px`,
        ...style,
      }}
    >
      {currentSrc && (
        <img
          key={currentSrc}
          src={currentSrc}
          referrerPolicy="no-referrer"
          alt={altText ? `${altText} (${safeIndex + 1}/${slides.length})` : `Slide ${safeIndex + 1}`}
          className={`w-full h-full transition-all duration-500 motion-reduce:transition-none ${
            isContain ? "object-contain p-2.5 sm:p-4" : "object-cover"
          }`}
          style={{
            objectPosition: activeFocalPoint,
            transform: safeZoom !== 1 ? `scale(${safeZoom})` : undefined,
            transformOrigin: `${focalX}% ${focalY}%`,
            filter: filterCss,
          }}
          onError={(e) => {
            if (fallbackImage && e.currentTarget.src !== fallbackImage) {
              e.currentTarget.src = fallbackImage;
            }
          }}
        />
      )}

      {children}

      {hasMultiSlides && (
        <>
          <button
            type="button"
            data-testid="hero-swap-prev"
            onClick={goPrev}
            aria-label="Image précédente"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-zinc-900 shadow-md border border-black/10 flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            data-testid="hero-swap-next"
            onClick={goNext}
            aria-label="Image suivante"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-zinc-900 shadow-md border border-black/10 flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/75 backdrop-blur-md text-white shadow-sm">
            <Images className="w-3 h-3 text-amber-300 shrink-0 mr-0.5" />
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                data-testid={`hero-swap-dot-${idx}`}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setCurrentIndex(idx);
                }}
                aria-label={`Aller à l'image ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === safeIndex ? "w-5 bg-amber-400" : "w-1.5 bg-white/55 hover:bg-white"
                }`}
              />
            ))}
            <span className="text-[9px] font-bold tracking-wider ml-1 opacity-90">
              {safeIndex + 1}/{slides.length}
            </span>
          </div>
        </>
      )}
    </div>
  );
};
