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
  const isRTL = i18n.dir() === "rtl" || i18n.language?.startsWith("ar");

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isGridMode, setIsGridMode] = useState(false);

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
    <section className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 mb-12 sm:mb-16 pt-1 relative z-20">
      {/* Editorial Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-[#E3E9E5]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-[#0D5C4B]">
            <span>{t("home.categories.official_catalog")}</span>
            <span aria-hidden="true" className="text-[#839497]">·</span>
            <span className="font-mono tabular-nums text-[#5F7073]">
              {uniqueCategories.length} {t("home.categories.departments_unit")}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0F1B1D] tracking-tight text-balance">
            {t("home.categories.explore_by")}
          </h2>
        </div>

        {/* View Mode Toggle + Carousel Arrows */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsGridMode((prev) => !prev)}
            className="px-4 py-2 rounded-xl border border-[#D4DFD9] hover:border-[#0D5C4B] bg-white hover:bg-[#0D5C4B] text-[#0F1B1D] hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors duration-200 shadow-2xs cursor-pointer whitespace-nowrap"
          >
            {isGridMode ? (
              <>
                <GalleryHorizontal className="w-3.5 h-3.5 text-[#E59A42]" />
                <span>{t("home.categories.gallery_view")}</span>
              </>
            ) : (
              <>
                <LayoutGrid className="w-3.5 h-3.5 text-[#0D5C4B] group-hover:text-white" />
                <span>
                  {t("home.categories.see_all")} ({uniqueCategories.length})
                </span>
              </>
            )}
          </button>

          {!isGridMode && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleManualScroll("left")}
                className="w-9 h-9 rounded-xl border border-[#D4DFD9] hover:border-[#0D5C4B] bg-white flex items-center justify-center text-[#0F1B1D] hover:bg-[#0D5C4B] hover:text-white active:scale-95 transition-colors duration-200 shadow-2xs cursor-pointer"
                aria-label={t("home.categories.prev_departments")}
              >
                <ChevronLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
              </button>
              <button
                type="button"
                onClick={() => handleManualScroll("right")}
                className="w-9 h-9 rounded-xl border border-[#D4DFD9] hover:border-[#0D5C4B] bg-white flex items-center justify-center text-[#0F1B1D] hover:bg-[#0D5C4B] hover:text-white active:scale-95 transition-colors duration-200 shadow-2xs cursor-pointer"
                aria-label={t("home.categories.next_departments")}
              >
                <ChevronRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
              </button>
            </div>
          )}
        </div>
      </div>

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
