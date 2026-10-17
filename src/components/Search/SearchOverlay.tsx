import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUI } from "../../context/UIContext";
import { useShop } from "../../context/ShopContext";
import { useTranslation } from "react-i18next";
import { useTrendingSearches } from "../../hooks/useTrendingSearches";
import { Product } from "../../domains/product/product.types";
import { SearchOverlayHeader } from "./overlay/SearchOverlayHeader";
import { SearchOverlayZeroState } from "./overlay/SearchOverlayZeroState";
import { SearchOverlayResults, SearchStoreResult } from "./overlay/SearchOverlayResults";

export const SearchOverlay: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen } = useUI();
  const { setSearchQuery } = useShop();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [localSearch, setLocalSearch] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [matchedStores, setMatchedStores] = useState<SearchStoreResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [visibleCount, setVisibleCount] = useState(9);
  const [apiError, setApiError] = useState(false);
  const trendingSearches = useTrendingSearches();

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isRtl = i18n.language === "ar";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        const activeEl = document.activeElement;
        const isInput = activeEl && (
          activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          (activeEl as HTMLElement).isContentEditable
        );
        if (!isInput) {
          e.preventDefault();
          setIsSearchOpen(true);
        }
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 120);
      try {
        const saved = localStorage.getItem("olma_recent_searches");
        if (saved) setRecentSearches(JSON.parse(saved));
      } catch {
        setRecentSearches([]);
      }
      fetch("/api/v1/search?limit=4")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.products)) setRecommendedProducts(data.products);
        })
        .catch(() => {});
    } else {
      document.body.style.overflow = "";
      setLocalSearch("");
      setResults([]);
      setApiError(false);
    }
    return () => { document.body.style.overflow = ""; };
  }, [isSearchOpen]);

  useEffect(() => {
    if (!localSearch.trim()) {
      setResults([]);
      setMatchedStores([]);
      setApiError(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsSearching(true);
      setApiError(false);
      try {
        const res = await fetch(`/api/v1/search?q=${encodeURIComponent(localSearch)}&limit=15`, {
          signal: controller.signal
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data.products || []);
          setMatchedStores(data.stores || []);
          setVisibleCount(9);
        } else {
          setApiError(true);
        }
      } catch (err: unknown) {
        if ((err as Error)?.name !== "AbortError") setApiError(true);
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [localSearch]);

  const saveSearchTerm = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter((s) => s !== trimmed)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem("olma_recent_searches", JSON.stringify(updated));
    } catch {
      // safe fallback
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (localSearch.trim()) {
      saveSearchTerm(localSearch);
      setSearchQuery(localSearch.trim());
      setIsSearchOpen(false);
      navigate("/shop");
    }
  };

  const handleSelectTerm = (term: string) => {
    setLocalSearch(term);
    saveSearchTerm(term);
    setSearchQuery(term);
    setIsSearchOpen(false);
    navigate("/shop");
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md overflow-y-auto flex flex-col justify-start min-h-screen text-slate-900 pb-16"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <SearchOverlayHeader onClose={() => setIsSearchOpen(false)} />

          <div className="w-full max-w-5xl mx-auto px-4 md:px-8 mt-6 md:mt-10 flex-grow space-y-6">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <div className={`absolute inset-y-0 ${isRtl ? "right-4 sm:right-6" : "left-4 sm:left-6"} flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors`}>
                {isSearching ? <Loader2 className="w-6 h-6 animate-spin text-emerald-600" /> : <Search className="w-6 h-6" />}
              </div>

              <input
                ref={inputRef}
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder={t("search_today_prompt", "Que recherchez-vous sur Olmart ? (ex: Robe, Smartphone, Babouche...)")}
                className={`w-full bg-white border-2 border-emerald-600/30 focus:border-emerald-600 text-slate-900 placeholder-slate-400 rounded-2xl py-4 ${isRtl ? "pr-14 pl-28" : "pl-14 pr-28"} text-base sm:text-xl font-medium outline-none shadow-lg transition-all`}
              />

              <div className={`absolute inset-y-2 ${isRtl ? "left-2" : "right-2"} flex items-center gap-1`}>
                {localSearch && (
                  <button
                    type="button"
                    onClick={() => setLocalSearch("")}
                    className="p-1.5 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="h-full px-4 sm:px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs border-none"
                >
                  {t("search", "Rechercher")}
                </button>
              </div>
            </form>

            <div className="w-full bg-white/95 rounded-2xl p-5 md:p-7 shadow-xl border border-slate-200">
              {!localSearch.trim() ? (
                <SearchOverlayZeroState
                  recentSearches={recentSearches}
                  trendingSearches={trendingSearches}
                  onSelectTerm={handleSelectTerm}
                  onDeleteRecent={(term, e) => {
                    e.stopPropagation();
                    const updated = recentSearches.filter((s) => s !== term);
                    setRecentSearches(updated);
                    try {
                      localStorage.setItem("olma_recent_searches", JSON.stringify(updated));
                    } catch {
                      /* safe fallback */
                    }
                  }}
                />
              ) : (
                <SearchOverlayResults
                  localSearch={localSearch}
                  isSearching={isSearching}
                  results={results}
                  matchedStores={matchedStores}
                  recommendedProducts={recommendedProducts}
                  visibleCount={visibleCount}
                  apiError={apiError}
                  onSelectStore={(id) => {
                    setIsSearchOpen(false);
                    navigate(`/store/${id}`);
                  }}
                  onSelectProduct={(id, name) => {
                    saveSearchTerm(name);
                    setIsSearchOpen(false);
                    navigate(`/product/${id}`);
                  }}
                  onLoadMore={() => setVisibleCount((prev) => prev + 9)}
                  onSubmitSearch={handleSearchSubmit}
                  onRetry={() => {
                    const q = localSearch;
                    setLocalSearch("");
                    setTimeout(() => setLocalSearch(q), 50);
                  }}
                />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
