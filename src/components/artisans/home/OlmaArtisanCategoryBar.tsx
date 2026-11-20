import React from "react";
import { Check, Clock, Star, SlidersHorizontal, RotateCcw } from "lucide-react";
import { ArtisanFilterOptions } from "../filters/OlmaArtisanFilterModal";

interface OlmaArtisanCategoryBarProps {
  filters: ArtisanFilterOptions;
  onToggleAvailable: () => void;
  onToggleTopRated: () => void;
  onChangeSort: (sort: "recent" | "rating" | "experience") => void;
  onResetAll: () => void;
}

export const OlmaArtisanCategoryBar: React.FC<OlmaArtisanCategoryBarProps> = ({
  filters,
  onToggleAvailable,
  onToggleTopRated,
  onChangeSort,
  onResetAll,
}) => {
  const isAvailable = Boolean(filters.availableOnly);
  const isTopRated = Boolean(filters.minRating && filters.minRating >= 4.5);
  const hasActiveFilters = Boolean(
    filters.q ||
      filters.tradeId ||
      filters.wilaya ||
      filters.commune ||
      filters.availableOnly ||
      filters.minRating
  );

  return (
    <div className="w-full overflow-x-auto scrollbar-none touch-pan-x">
      <div className="flex items-center gap-2 py-1">
        {/* Material 3 Filter Chip: Disponible maintenant */}
        <button
          type="button"
          onClick={onToggleAvailable}
          className={`h-8 px-3 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
            isAvailable
              ? "bg-amber-50 border-amber-500 text-slate-950 font-semibold"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {isAvailable ? (
            <Check className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span>Disponible aujourd&apos;hui</span>
        </button>

        {/* Material 3 Filter Chip: Mieux notés */}
        <button
          type="button"
          onClick={onToggleTopRated}
          className={`h-8 px-3 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
            isTopRated
              ? "bg-amber-50 border-amber-500 text-slate-950 font-semibold"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {isTopRated ? (
            <Check className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
          ) : (
            <Star className="w-3.5 h-3.5 text-amber-500" />
          )}
          <span>4.5★ et plus</span>
        </button>

        {/* Material 3 Sort Chip */}
        <div className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 shrink-0">
          <SlidersHorizontal className="w-3 h-3 text-slate-400" />
          <select
            value={filters.sort || "rating"}
            onChange={(e) =>
              onChangeSort(e.target.value as "recent" | "rating" | "experience")
            }
            aria-label="Trier les artisans"
            className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer pr-1"
          >
            <option value="rating">Mieux notés</option>
            <option value="experience">Plus expérimentés</option>
            <option value="recent">Plus récents</option>
          </select>
        </div>

        {/* Reset Chip */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetAll}
            className="h-8 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 inline-flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Réinitialiser</span>
          </button>
        )}
      </div>
    </div>
  );
};
