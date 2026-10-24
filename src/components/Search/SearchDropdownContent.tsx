import React from "react";
import {
  Search,
  Clock,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Tag,
  Trash2,
  Flame,
  Store,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Product } from "../../domains/product/product.types";
import { SearchStoreResult } from "../../types/search";
import { SearchProductCard } from "./SearchProductCard";
import { SearchStoreCard } from "./SearchStoreCard";

export interface SearchDropdownContentProps {
  query?: string;
  localQuery?: string;
  loading?: boolean;
  isSearching?: boolean;
  matchedCategories?: Array<{ name: string; sub?: string }>;
  filteredStores?: SearchStoreResult[];
  suggestions?: string[];
  results?: Product[];
  filteredResults?: Product[];
  recentSearches?: string[];
  trendingSearches?: string[];
  trendingProducts?: Product[];
  fallbackProducts?: Product[];
  onCategoryClick?: (catName: string, subName?: string) => void;
  onSuggestionClick?: (term: string) => void;
  onSelectTerm?: (term: string) => void;
  onSelectStore?: (storeId: string) => void;
  onProductClick?: (productId: string, name: string) => void;
  onSelectProduct?: (productId: string, name: string) => void;
  onSearchSubmit?: (term?: string) => void;
  onSubmitSearch?: (term?: string) => void;
  onClearHistory?: (e: React.MouseEvent) => void;
  onClearRecent?: () => void;
}

export const SearchDropdownContent: React.FC<SearchDropdownContentProps> = (props) => {
  const { t } = useTranslation();
  const effectiveQuery = String(props.query ?? props.localQuery ?? "");
  const isBusy = Boolean(props.loading ?? props.isSearching);
  const productResults = Array.isArray(props.results) ? props.results : Array.isArray(props.filteredResults) ? props.filteredResults : [];
  const zeroStateProducts = Array.isArray(props.trendingProducts) ? props.trendingProducts : Array.isArray(props.fallbackProducts) ? props.fallbackProducts : [];
  const safeCategories = Array.isArray(props.matchedCategories) ? props.matchedCategories : [];
  const safeStores = Array.isArray(props.filteredStores) ? props.filteredStores : [];
  const safeSuggestions = Array.isArray(props.suggestions) ? props.suggestions : [];
  const safeRecent = Array.isArray(props.recentSearches) ? props.recentSearches : [];
  const safeTrending = Array.isArray(props.trendingSearches) ? props.trendingSearches : [];

  const handleTermClick = (term: string) => (props.onSuggestionClick ? props.onSuggestionClick(term) : props.onSelectTerm?.(term));
  const handleProdClick = (id: string, name: string) => (props.onProductClick ? props.onProductClick(id, name) : props.onSelectProduct?.(id, name));
  const handleSubmit = () => (props.onSearchSubmit ? props.onSearchSubmit(effectiveQuery) : props.onSubmitSearch?.(effectiveQuery));
  const handleClear = (e: React.MouseEvent) => (props.onClearHistory ? props.onClearHistory(e) : props.onClearRecent?.());
  const { onCategoryClick, onSelectStore } = props;

  if (effectiveQuery.trim().length > 0) {
    return (
      <div className="space-y-4 pt-1">
        {safeCategories.length > 0 && onCategoryClick && (
          <div>
            <p className="px-2 pb-1.5 text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-orange-500" />
              <span>{t("Rayons correspondants", "Rayons correspondants")}</span>
            </p>
            <div className="flex flex-wrap gap-1.5 px-1">
              {safeCategories.map((cat, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onCategoryClick(cat.name, cat.sub)}
                  className="px-3 py-1.5 bg-orange-50/70 hover:bg-orange-100 border border-orange-200/80 rounded-xl text-xs font-bold text-slate-800 hover:text-orange-700 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>{t(cat.name, cat.name)}</span>
                  {cat.sub && <span className="text-orange-600 font-extrabold">/ {t(cat.sub, cat.sub)}</span>}
                  <ArrowRight className="w-3 h-3 text-orange-500" />
                </button>
              ))}
            </div>
          </div>
        )}

        {safeStores.length > 0 && onSelectStore && (
          <div>
            <p className="px-2 pb-1.5 text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Store className="w-3 h-3 text-emerald-600" />
              <span>{t("Boutiques vérifiées", "Boutiques vérifiées")}</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {safeStores.map((st, idx) => (
                <SearchStoreCard key={st.id || st.uid || idx} store={st} onSelect={onSelectStore} />
              ))}
            </div>
          </div>
        )}

        {safeSuggestions.length > 0 && (
          <div>
            <p className="px-2 pb-1.5 text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{t("Suggestions", "Suggestions")}</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {safeSuggestions.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleTermClick(sug)}
                  className="w-full text-left px-3 py-2 hover:bg-orange-50/50 rounded-xl flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-600 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-slate-700 group-hover:text-slate-950 truncate">{sug}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-orange-600 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="px-2 pb-2 pt-1 flex items-center justify-between gap-2">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              {t("Produits trouvés", "Produits trouvés")} ({productResults.length})
            </span>
            {isBusy && (
              <span className="text-[11px] text-orange-600 font-bold animate-pulse">{t("Recherche...", "Recherche...")}</span>
            )}
          </div>

          {productResults.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-2">
                {productResults.map((prod) => (
                  <SearchProductCard key={prod.id} product={prod} query={effectiveQuery} onSelect={handleProdClick} />
                ))}
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-3 mt-2 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white text-xs sm:text-sm font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/20 cursor-pointer"
              >
                <span>{t("Voir tous les résultats pour", "Voir tous les résultats pour")} &ldquo;{effectiveQuery}&rdquo;</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : !isBusy ? (
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 text-center space-y-2">
              <p className="text-xs sm:text-sm font-bold text-slate-800">Aucun résultat exact pour &ldquo;{effectiveQuery}&rdquo;</p>
              <p className="text-xs text-slate-500">Essayez un autre mot-clé ou parcourez nos articles populaires ci-dessous.</p>
            </div>
          ) : (
            <div className="space-y-2 py-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-1">
      {safeRecent.length > 0 && (
        <div>
          <div className="flex items-center justify-between px-1 pb-2">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("Recherches récentes", "Recherches récentes")}</span>
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] text-slate-400 hover:text-rose-600 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>{t("Effacer", "Effacer")}</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {safeRecent.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleTermClick(s)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-transparent hover:border-orange-200/80"
              >
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{s}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {safeTrending.length > 0 && (
        <div>
          <span className="px-1 pb-2 text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
            <span>{t("Recherches populaires", "Recherches populaires")}</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {safeTrending.map((tItem, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleTermClick(tItem)}
                className="px-3 py-1.5 bg-orange-50/70 hover:bg-orange-100 border border-orange-200/70 text-orange-900 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <TrendingUp className="w-3 h-3 text-orange-500" />
                <span>{tItem}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {zeroStateProducts.length > 0 && (
        <div className="pt-1">
          <div className="flex items-center justify-between gap-2 px-1 pb-2.5">
            <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{t("Articles populaires du catalogue", "Articles populaires du catalogue")}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200/80 text-[10px] font-extrabold text-orange-600 shrink-0">
              <Flame className="w-3 h-3 text-orange-500" />
              <span>{t("Tendance en Algérie", "Tendance en Algérie")}</span>
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {zeroStateProducts.map((prod) => (
              <SearchProductCard key={prod.id} product={prod} query="" onSelect={handleProdClick} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
