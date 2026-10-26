import React, { useState } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import {
  CategoryCardData,
  getCategoryTheme,
} from "./categoryThemes";
import { Category3DIllustration } from "./Category3DIllustration";

export type { CategoryCardData };

interface CategoryCardProps {
  card: CategoryCardData;
  index: number;
  scrollVelocity: number;
  onSelect: (key: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  card,
  index,
  scrollVelocity,
  onSelect,
}) => {
  const { t } = useTranslation();
  const theme = getCategoryTheme(card.key, index);
  const IconComponent = theme.icon;

  const displayTitle = card.title ? t(card.title, card.title) : theme.defaultTitle;
  const displaySubtitle = card.subtitle ? t(card.subtitle, card.subtitle) : theme.defaultSubtitle;
  const itemCount = theme.defaultCount;

  // Interactive 3D Glide & Magnetic Follow state
  const [isHovered, setIsHovered] = useState(false);
  const [glideCoords, setGlideCoords] = useState({ x: 0, y: 0, rotate: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    setIsHovered(true);
    setGlideCoords({
      x: Math.max(-14, Math.min(14, normX * 12)),
      y: Math.max(-10, Math.min(10, normY * 10)),
      rotate: Math.max(-8, Math.min(8, normX * 8)),
    });
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setGlideCoords({ x: 0, y: 0, rotate: 0 });
  };

  const isInteracting = isHovered || Math.abs(scrollVelocity) > 0.4;
  const currentX = glideCoords.x - scrollVelocity * 1.2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={{ y: -5, transition: { duration: 0.22 } }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      onClick={() => onSelect(card.key)}
      className={`relative flex flex-col justify-between w-[80vw] sm:w-[310px] md:w-[340px] h-[170px] sm:h-[180px] p-4 sm:p-5 rounded-3xl cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 shrink-0 snap-start group border overflow-visible select-none touch-pan-x ${theme.bgCard} ${theme.border}`}
    >
      {/* Ambient Radial Mesh Glow */}
      <div
        className={`absolute inset-0 rounded-3xl pointer-events-none ${theme.radialGlow} transition-opacity duration-300 group-hover:opacity-100 opacity-70`}
      />

      {/* Top Section: 3D Floating Illustration (Left) & Frosted Glass Disc with Count Badge (Right) */}
      <div className="relative z-10 flex items-start justify-between w-full h-[85px] sm:h-[90px]">
        {/* 3D Floating Illustration Popping from Top-Left */}
        <motion.div
          animate={
            isInteracting
              ? {
                  x: currentX,
                  y: glideCoords.y - 3,
                  rotate: glideCoords.rotate,
                  scale: 1.08,
                }
              : {
                  x: 0,
                  y: [0, -4, 0],
                  rotate: 0,
                  scale: 1,
                }
          }
          transition={
            isInteracting
              ? { type: "spring", stiffness: 320, damping: 22 }
              : {
                  y: { repeat: Infinity, duration: 3.5, ease: "easeInOut" },
                  type: "spring",
                  stiffness: 240,
                  damping: 24,
                }
          }
          className="absolute -top-3.5 -left-1.5 sm:-left-1 pointer-events-none"
        >
          <Category3DIllustration categoryKey={card.key} className="w-36 h-28 sm:w-40 sm:h-30" />
        </motion.div>

        {/* Top-Right Frosted Glass Capsule / Disc & Count Badge */}
        <div className="ml-auto relative flex items-center justify-center">
          <div
            className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${theme.discBg} transition-transform duration-300 group-hover:scale-105`}
          >
            <IconComponent className={`w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2] ${theme.iconColor}`} />
          </div>

          {/* Small item count badge at bottom right of the disc */}
          <span
            className="absolute -bottom-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/60 text-[10px] font-mono font-bold flex items-center justify-center shadow-xs text-slate-800"
          >
            {itemCount}
          </span>
        </div>
      </div>

      {/* Bottom Content Row: Title, Subtitle, and Action Arrow Button */}
      <div className="relative z-10 flex items-end justify-between gap-3 pt-1">
        <div className="space-y-0.5 max-w-[76%]">
          <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight leading-snug line-clamp-1 font-sans">
            {displayTitle}
          </h3>
          <p className="font-medium text-slate-700/80 text-[11px] sm:text-xs line-clamp-1 leading-normal font-sans">
            {displaySubtitle}
          </p>
        </div>

        {/* Circular Action Arrow Button */}
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full text-white flex items-center justify-center shrink-0 shadow-md transition-all duration-200 group-hover:scale-110 active:scale-95 group-hover:shadow-lg cursor-pointer ${theme.btnBg}`}
        >
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 rtl:rotate-180 stroke-[2.4]" />
        </div>
      </div>
    </motion.div>
  );
};
