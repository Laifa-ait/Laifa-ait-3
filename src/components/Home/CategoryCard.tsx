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

  const displayTitle = card.title ? t(card.title, card.title) : theme.defaultTitle;

  const hasCustomPhoto =
    card.image &&
    card.image.trim().length > 0 &&
    !card.image.includes("placeholder");

  const resolvedImage = !imgError && hasCustomPhoto ? card.image : theme.defaultImage;

  const formattedIndex = String(index + 1).padStart(2, "0");

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.035, 0.28) }}
      onClick={() => onSelect(card.key)}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-[1.5rem] bg-[#12111A] p-1.5 cursor-pointer select-none shadow-[0_14px_34px_-12px_rgba(20,18,32,0.18)] hover:shadow-[0_24px_48px_-12px_rgba(26,24,54,0.32)] border border-[#1A1836]/15 hover:border-[#E99856]/60 transition-all duration-500 ${
        isGridMode
          ? "w-full h-[300px] sm:h-[320px]"
          : "w-[235px] sm:w-[260px] md:w-[276px] h-[310px] sm:h-[336px] shrink-0 snap-start touch-pan-x"
      }`}
    >
      {/* Inner Architectural Portrait Frame */}
      <div className="relative w-full h-full rounded-[1.15rem] overflow-hidden flex flex-col justify-between p-4 sm:p-5 bg-neutral-100">
        {/* Full-Bleed Natural Bright Photography (No Dark Filter) */}
        <img
          src={resolvedImage}
          alt={displayTitle}
          loading="lazy"
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover object-center scale-100 group-hover:scale-110 transition-transform duration-700 ease-out"
        />

        {/* Ultra-light bottom text contrast only — photo remains 100% bright & unfiltered */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent"
        />

        {/* Top Bar: Monospace Index + Edition Tag Only (Top-Right Icon Removed) */}
        <div className="relative z-10 flex items-center justify-start w-full">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/45 backdrop-blur-md border border-white/20">
            <span className="font-mono text-[10px] font-bold tracking-widest text-[#E99856]">
              /{formattedIndex}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/40" />
            <span className="font-sans text-[9px] font-bold uppercase tracking-[0.14em] text-white truncate max-w-[155px]">
              {theme.editionTag}
            </span>
          </div>
        </div>

        {/* Bottom Plinth: Simple Typography Title + Action Row Only */}
        <div className="relative z-10 mt-auto pt-4">
          {/* Kinetic Accent Line */}
          <div className="w-8 h-[2.5px] bg-[#E99856] rounded-full mb-2 group-hover:w-14 transition-all duration-300 shadow-2xs" />

          {/* Category Title in Simple Clean Sans-Serif Typography */}
          <h3 className="font-sans font-semibold text-white text-lg sm:text-xl tracking-normal leading-snug line-clamp-1 drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)]">
            {displayTitle}
          </h3>

          {/* Bottom Action Divider */}
          <div className="mt-3 pt-2.5 border-t border-white/25 flex items-center justify-between font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-[#E99856] group-hover:text-white transition-colors drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
            <span>{t("Explorer le rayon")}</span>
            <span className="w-6 h-6 rounded-full bg-black/35 backdrop-blur-xs border border-white/20 group-hover:bg-[#E99856] group-hover:text-[#12111A] group-hover:border-[#E99856] flex items-center justify-center transition-all duration-300">
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

