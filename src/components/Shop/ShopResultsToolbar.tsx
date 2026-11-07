import React from "react";
import { Grid, List, ChevronDown, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ShopResultsToolbarProps {
  totalFound: number;
  activeWilaya: string;
  searchQuery: string;
  urlTag: string | null;
  sortOption: string;
  viewMode: "grid" | "list";
  onClearWilaya: () => void;
  onClearSearch: () => void;
  onClearTag: () => void;
  onSortChange: (value: string) => void;
  onViewModeChange: (mode: "grid" | "list") => void;
}

export const ShopResultsToolbar: React.FC<ShopResultsToolbarProps> = ({
  totalFound,
  activeWilaya,
  searchQuery,
  urlTag,
  sortOption,
  viewMode,
  onClearWilaya,
  onClearSearch,
  onClearTag,
  onSortChange,
  onViewModeChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="mb-6 rounded-2xl border border-[#e5dfd6] bg-white px-4 py-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
      {/* Left: Clean Tabular Article Count + Extra Context Filters */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-600">
        <span className="font-sans font-semibold text-[#1A1836] tabular-nums">
          {totalFound} {totalFound > 1 ? t("articles disponibles", "articles disponibles") : t("article disponible", "article disponible")}
        </span>

        {activeWilaya !== "Tous" && (
          <button
            type="button"
            onClick={onClearWilaya}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium transition-colors cursor-pointer"
          >
            <span>Wilaya : {activeWilaya}</span>
            <X className="w-3 h-3" />
          </button>
        )}

        {searchQuery && (
          <button
            type="button"
            onClick={onClearSearch}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium transition-colors cursor-pointer"
          >
            <span>Recherche : &ldquo;{searchQuery}&rdquo;</span>
            <X className="w-3 h-3" />
          </button>
        )}

        {urlTag && (
          <button
            type="button"
            onClick={onClearTag}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium transition-colors cursor-pointer"
          >
            <span>#{urlTag}</span>
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Right: Sort Select + Grid/List Switcher */}
      <div className="flex items-center gap-2.5 ml-auto">
        <div className="relative min-w-[165px]">
          <select
            aria-label={t("sort_products", "Trier les produits")}
            className="w-full pl-3.5 pr-9 py-2 bg-[#fbfaf8] border border-zinc-200 hover:border-zinc-400 rounded-xl outline-none font-sans font-semibold text-xs appearance-none cursor-pointer text-[#1A1836] transition-colors"
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="quality">{t("sort_relevance", "Pertinence")}</option>
            <option value="recent">{t("newest", "Nouveautés")}</option>
            <option value="sales-desc">Meilleures ventes</option>
            <option value="rating-desc">Mieux notés</option>
            <option value="price-asc">{t("price_asc", "Prix croissant")}</option>
            <option value="price-desc">{t("price_desc", "Prix décroissant")}</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#f7f5f0] rounded-xl border border-zinc-200">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            aria-label={t("grid_view", "Affichage en grille")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              viewMode === "grid"
                ? "bg-[#1A1836] text-white"
                : "text-zinc-500 hover:text-[#1A1836]"
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            aria-label={t("list_view", "Affichage en liste")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              viewMode === "list"
                ? "bg-[#1A1836] text-white"
                : "text-zinc-500 hover:text-[#1A1836]"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
