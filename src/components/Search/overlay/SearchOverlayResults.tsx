import React from "react";
import { Sparkles, Star, Search, ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Product } from "../../../domains/product/product.types";
import { formatPrice } from "../../../utils/format";
import { getOptimizedImageUrl } from "../../../utils/imageUtils";

export interface SearchStoreResult {
  id?: string;
  uid?: string;
  shopName?: string;
  displayName?: string;
  logoUrl?: string;
  wilaya?: string | number;
}

interface SearchOverlayResultsProps {
  localSearch: string;
  isSearching: boolean;
  results: Product[];
  matchedStores: SearchStoreResult[];
  recommendedProducts: Product[];
  visibleCount: number;
  apiError: boolean;
  onSelectStore: (id: string) => void;
  onSelectProduct: (id: string, name: string) => void;
  onLoadMore: () => void;
  onSubmitSearch: () => void;
  onRetry: () => void;
}

export const SearchOverlayResults: React.FC<SearchOverlayResultsProps> = ({
  localSearch,
  isSearching,
  results,
  matchedStores,
  recommendedProducts,
  visibleCount,
  apiError,
  onSelectStore,
  onSelectProduct,
  onLoadMore,
  onSubmitSearch,
  onRetry,
}) => {
  const { t } = useTranslation();

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.+*?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="text-emerald-900 bg-emerald-100 font-bold px-1 rounded">{part}</mark>
          ) : (<span key={i}>{part}</span>)
        )}
      </span>
    );
  };

  if (isSearching) {
    return (
      <div className="py-20 flex flex-col justify-center items-center gap-3">
        <Loader2 className="w-9 h-9 animate-spin text-emerald-600" />
        <span className="text-sm text-slate-500 font-medium">
          {t("Recherche fluide dans les 58 wilayas...")}
        </span>
      </div>
    );
  }

  if (results.length > 0 || matchedStores.length > 0) {
    return (
      <div className="space-y-8">
        {/* Stores Section */}
        {matchedStores.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-200">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{t("matching_stores", "Boutiques correspondantes")}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {matchedStores.map((store) => (
                <button
                  key={store.id || store.uid}
                  type="button"
                  onClick={() => onSelectStore(store.id || store.uid || "")}
                  className="w-full text-left p-3.5 hover:bg-emerald-50/50 bg-white border border-slate-200 hover:border-emerald-300 rounded-xl flex items-center gap-3 transition-all cursor-pointer shadow-2xs"
                >
                  <div className="w-11 h-11 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {store.logoUrl ? (
                      <img src={store.logoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-emerald-700 text-base">
                        {(store.shopName || store.displayName || "B").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate">{store.shopName || store.displayName}</p>
                    <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-0.5">Wilaya {store.wilaya || "Algérie"}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products Section */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{t("search_matching_title", "Créations correspondantes")}</span>
              </h4>
              <span className="text-xs font-semibold text-slate-500">
                {results.length} {t("articles", "articles")}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {results.slice(0, visibleCount).map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => onSelectProduct(product.id, product.name)}
                  className="w-full text-left p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-300 rounded-xl flex items-center gap-3.5 transition-all cursor-pointer shadow-2xs group"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <img
                      src={getOptimizedImageUrl(product.image, 200)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                      {highlightMatch(product.name, localSearch)}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mt-0.5 truncate">
                      {product.category} {product.wilaya ? `• W.${product.wilaya}` : ""}
                    </p>
                    <p className="text-xs font-bold text-emerald-700 mt-1">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>

            {results.length > visibleCount && (
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={onLoadMore}
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 border border-slate-300 hover:border-emerald-600 hover:text-emerald-700 rounded-full bg-white transition-all cursor-pointer"
                >
                  {t("load_more", "Charger plus")}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Global CTA */}
        <div className="pt-4 flex justify-center">
          <button
            type="button"
            onClick={onSubmitSearch}
            className="px-7 py-3 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition-all cursor-pointer shadow-sm active:scale-95 border-none flex items-center gap-2"
          >
            <span>{t("search_see_all", "Voir tous les résultats sur la boutique")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Zero matches state
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-2 max-w-xl mx-auto shadow-2xs">
        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
          <Search className="w-6 h-6" />
        </div>
        <p className="text-base font-bold text-slate-900">{t("search_no_results", "Aucun résultat pour")} &laquo;{localSearch}&raquo;</p>
        <p className="text-xs text-slate-500">{t("search_no_results_desc", "Vérifiez l'orthographe ou essayez un mot-clé plus générique.")}</p>
      </div>

      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center space-y-2 max-w-md mx-auto">
          <p className="text-xs font-semibold text-red-700">{t("service_unavailable", "Service de recherche temporairement ralenti")}</p>
          <button type="button" onClick={onRetry} className="px-4 py-1.5 text-xs bg-red-700 text-white rounded-full font-bold cursor-pointer border-none">
            {t("retry", "Réessayer")}
          </button>
        </div>
      )}

      {recommendedProducts.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 pb-2 border-b border-slate-200">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{t("search_recommended", "Sélections du marketplace")}</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recommendedProducts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectProduct(p.id, p.name)}
                className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all cursor-pointer flex flex-col text-left group shadow-2xs"
              >
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-100">
                  <img
                    src={getOptimizedImageUrl(p.image, 250)}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 truncate mt-2 w-full">
                  {p.name}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                  {p.category}
                </span>
                <span className="text-xs font-bold text-emerald-700 mt-1">
                  {formatPrice(p.price)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
