import React, { useRef, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useShop } from "../../context/ShopContext";
import { ChevronLeft, ChevronRight, LayoutGrid, GalleryHorizontal } from "lucide-react";
import { MobileSwipeIndicator } from "../ui/MobileSwipeIndicator";
import { CategoryCard, CategoryCardData } from "./CategoryCard";
import { resolveCanonicalCategoryKey } from "../../utils/categoryCanonical";

export const NeoCategoryGrid: React.FC<{
  categories: CategoryCardData[];
  favoriteCategory: string | null;
}> = ({ categories }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setActiveCategory } = useShop();
  const isRTL = i18n.dir() === "rtl";

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isGridMode, setIsGridMode] = useState(false);

  // Strict final deduplication guard so no two cards ever share the same canonical category
  const uniqueCategories = useMemo<CategoryCardData[]>(() => {
    const seen = new Set<string>();
    const result: CategoryCardData[] = [];
    for (const item of categories) {
      const canonicalKey = resolveCanonicalCategoryKey(item.key);
      if (!canonicalKey || seen.has(canonicalKey)) continue;
      seen.add(canonicalKey);
      result.push({
        ...item,
        key: canonicalKey,
      });
    }
    return result;
  }, [categories]);

  const handleManualScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 540;
      const actualDirection = isRTL
        ? direction === "left"
          ? "right"
          : "left"
        : direction;

      scrollContainerRef.current.scrollBy({
        left: actualDirection === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleSelectCategory = useCallback(
    (categoryKey: string) => {
      const canonical = resolveCanonicalCategoryKey(categoryKey);
      setActiveCategory(canonical);
      navigate(`/shop?category=${encodeURIComponent(canonical)}`);
    },
    [setActiveCategory, navigate]
  );

  return (
    <section className="w-full max-w-[96rem] mx-auto px-4 sm:px-6 md:px-8 mb-10 sm:mb-14 pt-2 relative z-20">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 sm:mb-6 pb-3 border-b border-[#1A1836]/10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.22em] text-[#A54055]">
            <span className="w-2 h-2 rounded-full bg-[#E99856]" />
            <span>{t("CATALOGUE OFFICIEL OLMART")} • {uniqueCategories.length} {t("RAYONS")}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-sans font-bold text-[#1A1836] tracking-tight">
            {t("home.categories.explore_by", "Explorer par départements")}
          </h2>
        </div>

        {/* Controls: View Mode Toggle (Galerie / Grille Bento) + Scroll Arrows */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsGridMode((prev) => !prev)}
            className="px-3.5 py-2 rounded-xl border border-[#1A1836]/15 bg-white hover:bg-[#1A1836] text-[#1A1836] hover:text-white text-xs font-bold flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
          >
            {isGridMode ? (
              <>
                <GalleryHorizontal className="w-3.5 h-3.5 text-[#E99856]" />
                <span>{t("Vue Galerie")}</span>
              </>
            ) : (
              <>
                <LayoutGrid className="w-3.5 h-3.5 text-[#E99856]" />
                <span>{t("Tout voir")} ({uniqueCategories.length})</span>
              </>
            )}
          </button>

          {!isGridMode && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleManualScroll("left")}
                className="w-9 h-9 rounded-xl border border-[#1A1836]/15 hover:border-[#1A1836] bg-white flex items-center justify-center text-[#1A1836] hover:bg-[#1A1836] hover:text-white active:scale-95 transition-all shadow-2xs cursor-pointer"
                aria-label="Rayons précédents"
              >
                <ChevronLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
              </button>
              <button
                type="button"
                onClick={() => handleManualScroll("right")}
                className="w-9 h-9 rounded-xl border border-[#1A1836]/15 hover:border-[#1A1836] bg-white flex items-center justify-center text-[#1A1836] hover:bg-[#1A1836] hover:text-white active:scale-95 transition-all shadow-2xs cursor-pointer"
                aria-label="Rayons suivants"
              >
                <ChevronRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Cards Showcase: Grid Mode or Horizontal Editorial Gallery */}
      {isGridMode ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {uniqueCategories.map((card, index) => (
            <CategoryCard
              key={card.key}
              card={card}
              index={index}
              isGridMode={true}
              onSelect={handleSelectCategory}
            />
          ))}
        </div>
      ) : (
        <div className="relative group/carousel">
          <div
            ref={scrollContainerRef}
            className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-5 pb-4 pt-1 px-0.5 scrollbar-hide scroll-smooth touch-pan-x"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {uniqueCategories.map((card, index) => (
              <CategoryCard
                key={card.key}
                card={card}
                index={index}
                isGridMode={false}
                onSelect={handleSelectCategory}
              />
            ))}
          </div>

          <MobileSwipeIndicator className="-mt-1" />
        </div>
      )}
    </section>
  );
};
