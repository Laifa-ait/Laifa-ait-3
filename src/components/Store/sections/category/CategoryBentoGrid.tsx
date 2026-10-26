import React from "react";
import { CategoryItem } from "../../../../pages/Seller/StoreBuilder/constants/categoryPresets";

interface CategoryBentoGridProps {
  categories: CategoryItem[];
  radiusClass: string;
  hoverClass: string;
  surfaceColor?: string;
  overlayOpacity: number;
  showBadge: boolean;
  showCount: boolean;
}

export const CategoryBentoGrid: React.FC<CategoryBentoGridProps> = ({
  categories,
  radiusClass,
  hoverClass,
  surfaceColor,
  overlayOpacity,
  showBadge,
  showCount,
}) => {
  return (
    <div className="grid grid-cols-2 @md:grid-cols-4 gap-3 @sm:gap-4">
      {categories.map((cat, i) => {
        const isHero = i === 0 || cat.colSpan === 2;
        return (
          <div
            key={cat.id || i}
            className={`relative overflow-hidden group cursor-pointer ${radiusClass} ${hoverClass} ${
              isHero ? "col-span-2 row-span-2 min-h-[260px] @md:min-h-[340px]" : "col-span-1 min-h-[140px] @md:min-h-[160px]"
            }`}
            style={{ backgroundColor: surfaceColor || "#FFFFFF" }}
          >
            {cat.imageUrl ? (
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-600" />
            )}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
              style={{ opacity: (overlayOpacity + 20) / 100 }}
            />
            <div className="absolute inset-0 p-4 flex flex-col justify-between text-white z-10">
              <div className="flex justify-between items-start">
                {showBadge && Boolean(cat.badge) && (
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-xs"
                    style={{ backgroundColor: cat.badgeColor || "#F97316" }}
                  >
                    {cat.badge}
                  </span>
                )}
              </div>
              <div>
                <h3 className={`font-bold drop-shadow-sm ${isHero ? "text-lg @sm:text-2xl" : "text-sm @sm:text-base"}`}>
                  {cat.name}
                </h3>
                {Boolean(cat.subtitle) && (
                  <p className="text-xs text-slate-200 mt-0.5 line-clamp-1 drop-shadow-xs">{cat.subtitle}</p>
                )}
                {showCount && Boolean(cat.itemCount) && (
                  <span className="text-[11px] text-orange-300 font-medium mt-1 inline-block">
                    {cat.itemCount} articles répertoriés
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
