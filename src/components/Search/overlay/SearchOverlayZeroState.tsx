import React from "react";
import { History, TrendingUp, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";

interface SearchOverlayZeroStateProps {
  recentSearches: string[];
  trendingSearches: string[];
  onSelectTerm: (term: string) => void;
  onDeleteRecent: (term: string, e: React.MouseEvent) => void;
}

export const SearchOverlayZeroState: React.FC<SearchOverlayZeroStateProps> = ({
  recentSearches,
  trendingSearches,
  onSelectTerm,
  onDeleteRecent
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pt-2"
    >
      {/* Recent Searches */}
      <div className="space-y-4">
        <h4 className="text-xs sm:text-sm font-bold uppercase text-slate-800 tracking-wider flex items-center gap-2 pb-2.5 border-b-2 border-b-emerald-600/30">
          <History className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>{t("search_recent", "Vos Recherches Récentes")}</span>
        </h4>
        {recentSearches.length > 0 ? (
          <ul className="space-y-1.5">
            {recentSearches.map((term, i) => (
              <li
                key={i}
                onClick={() => onSelectTerm(term)}
                className="flex items-center justify-between py-2.5 px-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 bg-white text-[13.5px] font-semibold text-slate-700 hover:text-emerald-900 transition-all cursor-pointer group shadow-2xs"
              >
                <span className="truncate">{term}</span>
                <button
                  type="button"
                  onClick={(e) => onDeleteRecent(term, e)}
                  className="text-slate-400 hover:text-red-500 p-1 bg-transparent border-none cursor-pointer transition-colors opacity-80 md:opacity-0 group-hover:opacity-100"
                  aria-label={t("delete", "Supprimer")}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-400 text-xs px-2 py-4 italic">
            {t("Aucun historique de recherche.")}
          </p>
        )}
      </div>

      {/* Trending Tags */}
      <div className="space-y-4">
        <h4 className="text-xs sm:text-sm font-bold uppercase text-amber-950 tracking-wider flex items-center gap-2 pb-2.5 border-b-2 border-b-amber-500/30">
          <TrendingUp className="w-4 h-4 text-amber-600" />
          <span>{t("search_trending", "Tendances en Algérie")}</span>
        </h4>
        <div className="flex flex-wrap gap-2 pt-1">
          {trendingSearches.map((tag, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelectTerm(tag)}
              className="px-3.5 py-2 text-xs font-bold border border-amber-200 bg-amber-50/70 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 active:scale-95 text-amber-900 rounded-full transition-all shadow-2xs cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
