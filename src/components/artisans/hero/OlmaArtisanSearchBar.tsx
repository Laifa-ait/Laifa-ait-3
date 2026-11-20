import React from "react";
import { Search, SlidersHorizontal, X, LocateFixed, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  LocationSearchResult,
  searchAlgerianLocations,
} from "../../../data/algerianCommunesDatabase";
import { ALGERIA_WILAYAS } from "../../../constants/wilayas";

interface OlmaArtisanSearchBarProps {
  whatTerm: string;
  whereTerm: string;
  isLocating: boolean;
  activeFiltersCount?: number;
  onWhatChange: (val: string) => void;
  onWhatClear: () => void;
  onWhereChange: (val: string) => void;
  onWhereClear: () => void;
  onQuickLocate: () => void;
  onOpenFilters: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onWhereFocus: (results: LocationSearchResult[]) => void;
}

export const OlmaArtisanSearchBar: React.FC<OlmaArtisanSearchBarProps> = ({
  whatTerm,
  whereTerm,
  isLocating,
  activeFiltersCount = 0,
  onWhatChange,
  onWhatClear,
  onWhereChange,
  onWhereClear,
  onQuickLocate,
  onOpenFilters,
  onKeyDown,
  onWhereFocus,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-full pl-4 pr-2 py-2 border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.07),0_6px_18px_-6px_rgba(15,23,42,0.08)] flex items-center gap-2 transition-all duration-150 focus-within:border-slate-300 focus-within:shadow-[0_2px_6px_rgba(15,23,42,0.10),0_10px_24px_-6px_rgba(15,23,42,0.10)]">
      {/* Google-style Leading Search Icon */}
      <Search className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />

      {/* Left: Quoi ? Métier ou problème */}
      <div className="flex-1 min-w-0 flex items-center">
        <input
          type="text"
          placeholder={t("search_what_artisan_placeholder", "Plombier, fuite, peinture...")}
          value={whatTerm}
          onChange={(e) => onWhatChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="w-full text-xs sm:text-sm font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none bg-transparent"
          aria-label={t("search_what_artisan_placeholder", "Métier ou besoin recherché")}
        />
        {whatTerm && (
          <button
            type="button"
            onClick={onWhatClear}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer shrink-0"
            title={t("search_clear", "Effacer")}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="w-px h-5 bg-slate-200 shrink-0" aria-hidden="true" />

      {/* Right: Où ? Wilaya ou Commune */}
      <div className="flex-1 min-w-0 flex items-center relative">
        <input
          type="text"
          placeholder={t("search_where_placeholder", "Wilaya ou commune")}
          list="artisan-algeria-wilayas"
          value={whereTerm}
          onChange={(e) => onWhereChange(e.target.value)}
          onFocus={() => {
            if (whereTerm.trim().length >= 2) {
              const results = searchAlgerianLocations(whereTerm.trim(), 8);
              onWhereFocus(results);
            }
          }}
          onKeyDown={onKeyDown}
          className="w-full text-xs sm:text-sm font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none bg-transparent"
          aria-label={t("search_where_placeholder", "Localisation souhaitée")}
        />
        <datalist id="artisan-algeria-wilayas">
          {ALGERIA_WILAYAS.map((w) => (
            <option key={w.code} value={w.name}>
              {w.code} - {w.name} {w.name_ar ? `(${w.name_ar})` : ""}
            </option>
          ))}
        </datalist>

        {whereTerm ? (
          <button
            type="button"
            onClick={onWhereClear}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer shrink-0"
            title={t("search_clear", "Effacer la localisation")}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onQuickLocate}
            disabled={isLocating}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full cursor-pointer shrink-0 transition-colors"
            title={t("search_geolocate_title", "Détecter ma position")}
            aria-label={t("search_geolocate_title", "Détecter ma position")}
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            ) : (
              <LocateFixed className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Far Right: Material 3 Filter Trigger */}
      <button
        type="button"
        onClick={onOpenFilters}
        className="relative h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
        title={t("search_filters_button", "Filtres avancés")}
        aria-label={t("search_filters_button", "Ouvrir les filtres avancés")}
      >
        <SlidersHorizontal className="w-4 h-4" />
        {activeFiltersCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>
    </div>
  );
};
