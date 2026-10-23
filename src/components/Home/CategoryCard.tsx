import React, { useState } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import {
  CategoryCardData,
  getCategoryTheme,
} from "./categoryThemes";

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
  const num = (index + 1).toString().padStart(2, "0");

  const displayTitle = card.title ? t(card.title, card.title) : theme.defaultTitle;
  const displaySubtitle = card.subtitle ? t(card.subtitle, card.subtitle) : theme.defaultSubtitle;

  // Interactive 3D Glide & Magnetic Follow state
  const [isHovered, setIsHovered] = useState(false);
  const [glideCoords, setGlideCoords] = useState({ x: 0, y: 0, rotate: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Normalized coordinates from card center (-1 to 1)
    const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    setIsHovered(true);
    setGlideCoords({
      x: Math.max(-24, Math.min(24, normX * 20)),
      y: Math.max(-18, Math.min(18, normY * 16)),
      rotate: Math.max(-16, Math.min(16, normX * 16)),
    });
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setGlideCoords({ x: 0, y: 0, rotate: 0 });
  };

  // Combine local pointer glide with carousel scroll-swipe impulse
  const isInteracting = isHovered || Math.abs(scrollVelocity) > 0.4;
  const currentX = glideCoords.x - scrollVelocity * 1.5;
  const currentRotate = glideCoords.rotate + scrollVelocity * 1.1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.035 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      onClick={() => onSelect(card.key)}
      className={`relative flex flex-col justify-between w-[78vw] sm:w-[320px] md:w-[350px] h-[190px] sm:h-[205px] p-5 sm:p-6 rounded-3xl cursor-pointer shadow-xs hover:shadow-md transition-shadow duration-300 shrink-0 snap-start group border overflow-hidden select-none touch-pan-x ${theme.bgCard} ${theme.border}`}
    >
      {/* Top-Right Decorative Blob & Dynamic Moving Logo */}
      <div className="absolute -top-3 -end-3 w-32 h-32 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center pointer-events-none z-0">
        {/* Parallax accent circle background */}
        <motion.div
          animate={
            isInteracting
              ? { x: -glideCoords.x * 0.3, y: -glideCoords.y * 0.3, scale: 1.06 }
              : { x: 0, y: 0, scale: 1 }
          }
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className={`w-full h-full rounded-full ${theme.bgBlob} opacity-90`}
        />

        {/* Dynamic Animated Logo reacting to glide gestures, swipes, and idle levitation */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 pe-2">
          <motion.div
            animate={
              isInteracting
                ? {
                    x: currentX,
                    y: glideCoords.y,
                    rotate: currentRotate,
                    scale: 1.16,
                  }
                : {
                    x: 0,
                    y: [0, -5, 0],
                    rotate: 0,
                    scale: 1,
                  }
            }
            transition={
              isInteracting
                ? {
                    type: "spring",
                    stiffness: 340,
                    damping: 20,
                    mass: 0.5,
                  }
                : {
                    y: {
                      repeat: Infinity,
                      duration: 3,
                      ease: "easeInOut",
                    },
                    type: "spring",
                    stiffness: 240,
                    damping: 24,
                  }
            }
            className={`transition-colors duration-300 drop-shadow-xs ${theme.iconColor}`}
          >
            <IconComponent className="w-12 h-12 sm:w-13 sm:h-13 stroke-[1.9]" />
          </motion.div>

          {/* Editorial Index Number inside the accent circle */}
          <span
            className={`absolute bottom-6 end-8 text-[11px] font-mono font-bold tracking-wider select-none ${theme.numColor}`}
          >
            {num}
          </span>
        </div>
      </div>

      {/* Spacer pushing text to bottom */}
      <div className="flex-1" />

      {/* Bottom Content Row: Title, Subtitle, and Action Button */}
      <div className="flex items-end justify-between relative z-10 gap-3 pt-3">
        <div className="space-y-1 max-w-[76%]">
          <h3 className="font-serif font-bold text-slate-900 text-lg sm:text-xl tracking-tight leading-snug line-clamp-1">
            {displayTitle}
          </h3>
          <p className="font-sans font-medium text-slate-600 text-xs line-clamp-1 leading-normal">
            {displaySubtitle}
          </p>
        </div>

        {/* Circular Action Arrow Button */}
        <div
          className={`w-11 h-11 rounded-full text-white flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-108 active:scale-95 ${theme.btnBg}`}
        >
          <ArrowRight className="w-5 h-5 rtl:rotate-180 stroke-[2.2]" />
        </div>
      </div>
    </motion.div>
  );
};
