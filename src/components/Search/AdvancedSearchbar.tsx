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
    suggestions,
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
    const safeQuery = String(localQuery || "").trim();
    if (safeQuery) {
      saveSearchTerm(safeQuery);
      setSearchQuery(safeQuery);
      setShowDropdown(false);
      setIsFocused(false);
      navigate("/shop");
    }
  };

  return (
    <>
      {isOverlayActive &&
        createPortal(
          <div
            onClick={() => {
              setIsFocused(false);
              setShowDropdown(false);
              inputRef.current?.blur();
            }}
            className="fixed inset-0 bg-[#1A1836]/45 backdrop-blur-xs z-[90] transition-opacity duration-200"
          />,
          document.body
        )}

      <div
        ref={containerRef}
        className={`relative w-full ${isOverlayActive ? "z-[105]" : "z-[10]"} ${className}`}
      >
        <div
          className={`flex items-center w-full rounded-2xl transition-all duration-200 h-11 sm:h-12 p-1.5 ${
            isOverlayActive
              ? "bg-white border-2 border-[#622347] shadow-lg ring-4 ring-[#A54055]/15"
              : "bg-[#FAF7F6] hover:bg-white border border-[#EFE6E6] hover:border-[#E0B4B2] shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-center shrink-0 text-[#A54055] ps-3 pe-2">
            <Search className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2.3]" />
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
              placeholder={
                localQuery ? "" : t(ROTATING_HINTS[hintIndex], ROTATING_HINTS[hintIndex])
              }
              autoComplete="off"
              spellCheck="false"
              className="bg-transparent border-none focus:outline-none w-full h-full px-1 font-semibold text-[#1A1836] placeholder:text-[#6E5A6F]/75 text-[13px] sm:text-[14px]"
            />
          </div>

          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin mx-2 text-[#A54055] shrink-0" />
          ) : localQuery ? (
            <button
              type="button"
              onClick={() => {
                setLocalQuery("");
                setResults([]);
              }}
              className="p-1.5 rounded-full hover:bg-[#F4EDED] text-[#6E5A6F] hover:text-[#1A1836] mx-1 cursor-pointer border-none bg-transparent"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleSearchSubmit}
            className="h-full px-4 sm:px-6 bg-gradient-to-r from-[#42164B] via-[#622347] to-[#A54055] hover:from-[#622347] hover:via-[#A54055] hover:to-[#E99856] text-white font-bold text-xs sm:text-[13px] rounded-xl shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all duration-200 shrink-0 cursor-pointer border-none whitespace-nowrap"
          >
            <span>{t("Rechercher", "Rechercher")}</span>
          </button>
        </div>

        {isOverlayActive && (
          <div className="absolute left-0 right-0 top-full mt-2 w-full md:left-1/2 md:-translate-x-1/2 md:w-[760px] lg:w-[860px] bg-white border border-[#EFE6E6] shadow-2xl z-[150] rounded-2xl md:rounded-3xl overflow-hidden max-h-[75vh] md:max-h-[80vh] overflow-y-auto">
            <div className="p-3.5 sm:p-5 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#EFE6E6]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#42164B]">
                  {String(localQuery || "").trim()
                    ? t("search_direct_results", "Résultats directs")
                    : t("explore_catalog", "Articles recommandés")}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsFocused(false);
                    setShowDropdown(false);
                  }}
                  className="p-1 rounded-full hover:bg-[#FAF7F6] text-[#6E5A6F] hover:text-[#1A1836] cursor-pointer border-none bg-transparent shrink-0"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <SearchDropdownContent
                query={localQuery}
                localQuery={localQuery}
                loading={isSearching}
                isSearching={isSearching}
                filteredStores={matchedStores}
                suggestions={suggestions}
                results={results}
                filteredResults={results}
                recentSearches={recentSearches}
                trendingProducts={fallbackProducts}
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
