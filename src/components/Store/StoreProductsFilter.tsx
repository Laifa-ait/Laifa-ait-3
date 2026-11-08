import React from "react";
import { Search, X } from "lucide-react";

interface StoreProductsFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  storeCategories: string[];
  getCategoryCount: (cat: string) => number;
  filteredCount: number;
  isRTL: boolean;
}

export const StoreProductsFilter: React.FC<StoreProductsFilterProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  storeCategories,
  getCategoryCount,
  filteredCount,
  isRTL,
}) => {
  return (
    <div
      style={{
        backgroundColor: "var(--store-surface, #FFFFFF)",
        borderRadius: "var(--store-border-radius, 16px)",
        fontFamily: "var(--store-font-body, inherit)",
        color: "var(--store-secondary, #18181B)",
      }}
      className="border border-black/10 p-3.5 sm:p-4 shadow-2xs space-y-3"
    >
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--store-primary, #B45309)" }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isRTL
                ? "بحث في هذا المتجر..."
                : "Rechercher un article dans cette boutique..."
            }
            style={{
              backgroundColor: "var(--store-canvas, #FAF6F0)",
              color: "var(--store-secondary, #18181B)",
            }}
            className="w-full pl-10 pr-9 py-2.5 border border-black/10 rounded-xl text-xs sm:text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--store-primary,#B45309)] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-black/5 cursor-pointer"
              aria-label="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {storeCategories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 shrink-0 max-w-full lg:max-w-2xl xl:max-w-3xl">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              style={
                selectedCategory === null
                  ? {
                      backgroundColor: "var(--store-primary, #B45309)",
                      color: "#FFFFFF",
                      borderColor: "var(--store-primary, #B45309)",
                    }
                  : {
                      backgroundColor: "var(--store-canvas, #FAF6F0)",
                      color: "var(--store-secondary, #18181B)",
                    }
              }
              className="px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all border border-black/10 cursor-pointer"
            >
              {isRTL ? "الكل" : "Tous les rayons"}
            </button>
            {storeCategories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={
                    isActive
                      ? {
                          backgroundColor: "var(--store-primary, #B45309)",
                          color: "#FFFFFF",
                          borderColor: "var(--store-primary, #B45309)",
                        }
                      : {
                          backgroundColor: "var(--store-canvas, #FAF6F0)",
                          color: "var(--store-secondary, #18181B)",
                        }
                  }
                  className="px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all border border-black/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold tabular-nums ${
                      isActive ? "bg-white/25 text-white" : "bg-black/10"
                    }`}
                  >
                    {getCategoryCount(cat)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {(searchQuery || selectedCategory) && (
        <div
          style={{
            backgroundColor: "var(--store-canvas, #FAF6F0)",
            color: "var(--store-secondary, #18181B)",
          }}
          className="flex items-center justify-between text-xs font-medium p-2.5 px-3.5 rounded-xl border border-black/10"
        >
          <span className="tabular-nums">
            {isRTL
              ? `تم العثور على ${filteredCount} من المنتجات المطابقة`
              : `${filteredCount} ${filteredCount > 1 ? "articles correspondent" : "article correspond"} à votre sélection`}
          </span>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory(null);
            }}
            style={{ color: "var(--store-primary, #B45309)" }}
            className="font-bold text-xs cursor-pointer hover:underline whitespace-nowrap shrink-0"
          >
            {isRTL ? "إعادة تعيين" : "Réinitialiser"}
          </button>
        </div>
      )}
    </div>
  );
};
