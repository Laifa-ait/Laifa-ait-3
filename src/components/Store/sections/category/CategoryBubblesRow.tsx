import React from "react";
import { getLucideCategoryIcon } from "../../../../pages/Seller/StoreBuilder/constants/categoryCanvaOptions";
import { CategoryItem } from "../../../../pages/Seller/StoreBuilder/constants/categoryPresets";

interface CategoryBubblesRowProps {
  categories: CategoryItem[];
}

export const CategoryBubblesRow: React.FC<CategoryBubblesRowProps> = ({ categories }) => {
  return (
    <div className="flex gap-4 @sm:gap-6 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none items-center justify-start @sm:justify-center">
      {categories.map((cat, i) => {
        const IconComp = getLucideCategoryIcon(cat.iconName);
        return (
          <div key={cat.id || i} className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer w-20 @sm:w-24">
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 shadow-sm group-hover:scale-105 transition-transform duration-200">
              <div className="w-16 h-16 @sm:w-20 @sm:h-20 rounded-full border-2 border-white overflow-hidden bg-slate-100 flex items-center justify-center relative">
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <IconComp className="w-6 h-6 text-slate-500" />
                )}
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-800 text-center line-clamp-1 group-hover:text-orange-600 transition-colors">
              {cat.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};
