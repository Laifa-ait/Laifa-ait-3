import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import { useDebounce } from "../../hooks/useDebounce";
import { SearchDropdownContent } from "./SearchDropdownContent";
import { useSearchOverlayState } from "./useSearchOverlayState";

const ROTATING_HINTS = [
  "Robe de soirée luxe & Caftan",
  "Sneakers en cuir DZ & Chaussures",
  "Smartphones & Accessoires Tech",
  "Électroménager & Maison",
  "Pack mariée traditionnel",
  "Outillage & Bricolage pro",
];

interface AdvancedSearchbarProps {
  className?: string;
  isMobile?: boolean;
  variant?: "default" | "glass" | "discreet" | "transparent";
}

export const AdvancedSearchbar: React.FC<AdvancedSearchbarProps> = ({
  className = "",
  variant: _variant = "default",
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setSearchQuery, searchQuery: globalSearchQuery } = useShop();

  const [localQuery, setLocalQuery] = useState("");
  const debouncedQuery = useDebounce(localQuery, 160);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isOverlayActive = isFocused || showDropdown;

  const {
    results,
    setResults,
    matchedStores,
    isSearching,
    recentSearches,
    fallbackProducts,
    saveSearchTerm,
    clearRecentSearches,
  } = useSearchOverlayState(debouncedQuery);

  useEffect(() => {
    if (localQuery) return;
    const interval = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % ROTATING_HINTS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [localQuery]);

  useEffect(() => {
    if (!globalSearchQuery) setLocalQuery("");
  }, [globalSearchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        setShowDropdown(false);
        inputRef.current?.blur();
      }
    };
    if (isOverlayActive) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOverlayActive]);

  const handleSearchSubmit = () => {
    if (localQuery.trim()) {
      saveSearchTerm(localQuery);
      setSearchQuery(localQuery);
      setShowDropdown(false);
      setIsFocused(false);
      navigate("/shop");
    }
  };

  return (
    <>
      {isOverlayActive && createPortal(
        <div
          onClick={() => {
            setIsFocused(false);
            setShowDropdown(false);
            inputRef.current?.blur();
          }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[90] transition-opacity duration-200"
        />,
        document.body
      )}

      <div ref={containerRef} className={`relative w-full ${isOverlayActive ? "z-[105]" : "z-[10]"} ${className}`}>
        <div className={`flex items-center w-full rounded-full transition-all duration-200 h-10 sm:h-11 p-1 bg-white ${
          isOverlayActive ? "border-2 border-emerald-600 shadow-lg ring-2 ring-emerald-500/20" : "border border-slate-200 hover:border-slate-300 shadow-xs"
        }`}>
          <div className="flex items-center justify-center shrink-0 text-slate-500 ps-3 pe-1.5">
            <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px] stroke-[2.2]" />
          </div>

          <div className="relative flex-1 h-full flex items-center overflow-hidden">
            <input
              ref={inputRef}
              type="text"
              value={localQuery}
              onChange={(e) => {
                setLocalQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => {
                setIsFocused(true);
                setShowDropdown(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchSubmit();
                } else if (e.key === "Escape") {
                  setShowDropdown(false);
                  setIsFocused(false);
                  inputRef.current?.blur();
                }
              }}
              placeholder={localQuery ? "" : t(ROTATING_HINTS[hintIndex], ROTATING_HINTS[hintIndex])}
              autoComplete="off"
              spellCheck="false"
              className="bg-transparent border-none focus:outline-none w-full h-full px-1 font-medium text-slate-900 placeholder:text-slate-400 text-[13px] sm:text-[14px]"
            />
          </div>

          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin mx-1 text-emerald-600 shrink-0" />
          ) : localQuery ? (
            <button
              type="button"
              onClick={() => { setLocalQuery(""); setResults([]); }}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 mx-1 cursor-pointer border-none bg-transparent"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleSearchSubmit}
            className="h-full px-4 sm:px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-[13px] rounded-full shadow-xs flex items-center justify-center gap-1 active:scale-95 transition-all shrink-0 cursor-pointer border-none"
          >
            <span>{t("Rechercher", "Rechercher")}</span>
          </button>
        </div>

        {isOverlayActive && (
          <div className="absolute left-0 right-0 top-full mt-2 w-full md:left-1/2 md:-translate-x-1/2 md:w-[760px] lg:w-[860px] bg-white border border-slate-200/90 shadow-2xl z-[150] rounded-2xl md:rounded-3xl overflow-hidden max-h-[75vh] md:max-h-[80vh] overflow-y-auto">
            <div className="p-3.5 sm:p-5 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {localQuery.trim()
                    ? t("search_direct_results", "Résultats directs")
                    : t("explore_catalog", "Articles recommandés")}
                </span>
                <button
                  type="button"
                  onClick={() => { setIsFocused(false); setShowDropdown(false); }}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer border-none bg-transparent shrink-0"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <SearchDropdownContent
                localQuery={localQuery}
                isSearching={isSearching}
                filteredStores={matchedStores}
                filteredResults={results}
                recentSearches={recentSearches}
                fallbackProducts={fallbackProducts}
                onSelectTerm={(term) => {
                  setLocalQuery(term);
                  setSearchQuery(term);
                  setShowDropdown(false);
                  navigate("/shop");
                }}
                onClearRecent={clearRecentSearches}
                onSelectStore={(storeId) => {
                  navigate(`/store/${storeId}`);
                  setShowDropdown(false);
                }}
                onSelectProduct={(productId, name) => {
                  saveSearchTerm(name);
                  setShowDropdown(false);
                  navigate(`/product/${productId}`);
                }}
                onSubmitSearch={handleSearchSubmit}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};
