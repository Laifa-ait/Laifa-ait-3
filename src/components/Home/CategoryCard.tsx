import React, { useState } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import { CategoryCardData, getCategoryTheme } from "./categoryThemes";

export type { CategoryCardData };

interface CategoryCardProps {
  card: CategoryCardData;
  index: number;
  isGridMode?: boolean;
  onSelect: (key: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  card,
  index,
  isGridMode = false,
  onSelect,
}) => {
  const { t } = useTranslation();
  const theme = getCategoryTheme(card.key, index);
  const [imgError, setImgError] = useState(false);

  const displayTitle = card.title
    ? t(card.title, card.title)
    : t(theme.titleKey, theme.defaultTitle);
  const displayEditionTag = t(theme.editionTagKey, theme.editionTag);

  const hasCustomPhoto =
    card.image &&
    card.image.trim().length > 0 &&
    !card.image.includes("placeholder");

  const resolvedImage = !imgError && hasCustomPhoto ? card.image : theme.defaultImage;
  const formattedIndex = String(index + 1).padStart(2, "0");
  const CategoryIcon = theme.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.24) }}
      onClick={() => onSelect(card.key)}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[#0F1B1D] cursor-pointer select-none border border-[#E3E9E5] hover:border-[#0D5C4B]/50 shadow-[0_8px_24px_-12px_rgba(15,27,29,0.16)] hover:shadow-[0_20px_40px_-14px_rgba(15,27,29,0.28)] hover:-translate-y-0.5 transition-all duration-300 ${
        isGridMode
          ? "w-full h-[290px] sm:h-[310px]"
          : "w-[228px] sm:w-[252px] md:w-[268px] h-[300px] sm:h-[324px] shrink-0 snap-start touch-pan-x"
      }`}
    >
      {/* Styled fallback surface if image fails to load */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-[#0D5C4B] via-[#0F1B1D] to-[#084236] flex items-center justify-center"
      >
        <CategoryIcon className="w-12 h-12 text-white/20" />
      </div>

      {/* Full-bleed photography */}
      {!imgError && (
        <img
          src={resolvedImage}
          alt={displayTitle}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-500 ease-out"
        />
      )}

      {/* Measured top & bottom legibility scrims */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#0F1B1D]/60 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#0F1B1D]/85 via-[#0F1B1D]/45 to-transparent"
      />

      {/* Quiet unboxed top metadata (zero pill enclosure) */}
      <div className="relative z-10 p-4 sm:p-5 flex items-center gap-2 text-[11px] font-medium text-white/90">
        <span className="font-mono tabular-nums font-bold text-[#E59A42]">
          {formattedIndex}
        </span>
        <span aria-hidden="true" className="text-white/45">·</span>
        <span className="truncate max-w-[165px] tracking-wide text-white/90">
          {displayEditionTag}
        </span>
      </div>

      {/* Bottom Editorial Plinth */}
      <div className="relative z-10 mt-auto p-4 sm:p-5">
        <div className="w-7 h-[2px] bg-[#E59A42] mb-2.5 group-hover:w-12 transition-all duration-300" />

        <h3 className="font-sans font-semibold text-white text-lg sm:text-[19px] tracking-tight leading-snug line-clamp-1">
          {displayTitle}
        </h3>

        <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-xs font-semibold text-[#E59A42] group-hover:text-white transition-colors duration-200">
          <span>{t("home.categories.explore_department")}</span>
          <span className="w-7 h-7 rounded-lg bg-white/12 backdrop-blur-xs border border-white/20 group-hover:bg-[#E59A42] group-hover:text-[#0F1B1D] group-hover:border-[#E59A42] flex items-center justify-center transition-colors duration-200">
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100" />
          </span>
        </div>
      </div>
    </motion.article>
  );
};
