import { useState, useEffect, useCallback } from "react";
import { Product } from "../../domains/product/product.types";
import { SearchStoreResult, SearchApiResponse } from "../../types/search";

const clientSearchCache = new Map<string, SearchApiResponse>();
const MAX_CACHE_ENTRIES = 50;

export function useSearchOverlayState(debouncedQuery: string) {
  const [results, setResults] = useState<Product[]>([]);
  const [matchedStores, setMatchedStores] = useState<SearchStoreResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [fallbackProducts, setFallbackProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("olma_recent_searches");
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch {
      setRecentSearches([]);
    }

    // Fetch real marketplace featured products for zero-state (Zero-Mock Rule)
    fetch("/api/v1/search?limit=6")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: SearchApiResponse | null) => {
        if (data && Array.isArray(data.products) && data.products.length > 0) {
          setFallbackProducts(data.products.slice(0, 6));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const query = debouncedQuery.trim();
    if (!query) {
      setResults([]);
      setMatchedStores([]);
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    if (clientSearchCache.has(query)) {
      const cached = clientSearchCache.get(query)!;
      setResults(cached.products || []);
      setMatchedStores(cached.stores || []);
      setSuggestions(cached.suggestions || []);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    fetch(`/api/v1/search?q=${encodeURIComponent(query)}&limit=12`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("API Error"))))
      .then((data: SearchApiResponse) => {
        if (clientSearchCache.size >= MAX_CACHE_ENTRIES) {
          const firstKey = clientSearchCache.keys().next().value;
          if (firstKey) clientSearchCache.delete(firstKey);
        }
        clientSearchCache.set(query, data);
        setResults(data.products || []);
        setMatchedStores(data.stores || []);
        setSuggestions(data.suggestions || []);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setResults([]);
          setMatchedStores([]);
          setSuggestions([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsSearching(false);
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  const saveSearchTerm = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const updated = [trimmed, ...prev.filter((s) => s !== trimmed)].slice(0, 5);
      try {
        localStorage.setItem("olma_recent_searches", JSON.stringify(updated));
      } catch {
        // safe fallback
      }
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("olma_recent_searches");
    } catch {
      // safe fallback
    }
  }, []);

  return {
    results,
    setResults,
    matchedStores,
    suggestions,
    isSearching,
    recentSearches,
    fallbackProducts,
    saveSearchTerm,
    clearRecentSearches,
  };
}
