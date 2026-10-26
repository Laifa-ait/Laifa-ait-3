import React from 'react';
import { Search, X } from 'lucide-react';

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
    <div className="bg-white border border-[#26658C]/15 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        {/* Live Search inside Store */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#26658C]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isRTL
                ? 'بحث في هذا المتجر...'
                : 'Rechercher un article dans cette boutique...'
            }
            className="w-full pl-10 pr-9 py-2.5 bg-[#F8FBFC] border border-[#26658C]/15 rounded-xl text-xs sm:text-sm font-medium text-[#011C40] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#023859] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer"
              aria-label="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Segmented Controls */}
        {storeCategories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 shrink-0 max-w-full lg:max-w-2xl xl:max-w-3xl">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-colors border cursor-pointer ${
                selectedCategory === null
                  ? 'bg-[#023859] text-white border-[#023859] shadow-2xs'
                  : 'bg-[#F8FBFC] text-[#023859] border-[#26658C]/15 hover:bg-[#A7EBF2]/25 hover:text-[#011C40]'
              }`}
            >
              {isRTL ? 'الكل' : 'Tous les rayons'}
            </button>
            {storeCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-colors border flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#023859] text-white border-[#023859] shadow-2xs'
                    : 'bg-[#F8FBFC] text-[#023859] border-[#26658C]/15 hover:bg-[#A7EBF2]/25 hover:border-[#54ACBF]'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold tabular-nums ${
                    selectedCategory === cat
                      ? 'bg-[#54ACBF]/30 text-[#A7EBF2]'
                      : 'bg-[#26658C]/10 text-[#023859]'
                  }`}
                >
                  {getCategoryCount(cat)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active Filter Summary */}
      {(searchQuery || selectedCategory) && (
        <div className="flex items-center justify-between text-xs font-medium text-[#023859] bg-[#F8FBFC] p-2.5 px-3.5 rounded-xl border border-[#26658C]/15">
          <span className="tabular-nums">
            {isRTL
              ? `تم العثور على ${filteredCount} من المنتجات المطابقة`
              : `${filteredCount} ${filteredCount > 1 ? 'articles correspondent' : 'article correspond'} à votre sélection`}
          </span>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory(null);
            }}
            className="text-[#26658C] hover:text-[#011C40] font-bold text-xs cursor-pointer hover:underline whitespace-nowrap shrink-0"
          >
            {isRTL ? 'إعادة تعيين' : 'Réinitialiser'}
          </button>
        </div>
      )}
    </div>
  );
};
