import { useState, useEffect, useCallback } from "react";

const FAVORITES_KEY = "olmart_auto_favorites";
const FAVORITES_EVENT = "olmart:auto_favorites_changed";

export function useVehicleFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem(FAVORITES_KEY);
        setFavorites(stored ? (JSON.parse(stored) as string[]) : []);
      } catch {
        setFavorites([]);
      }
    };

    window.addEventListener(FAVORITES_EVENT, handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(FAVORITES_EVENT, handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const isFavorite = useCallback(
    (listingId: string): boolean => favorites.includes(listingId),
    [favorites]
  );

  const toggleFavorite = useCallback((listingId: string): void => {
    setFavorites((prev) => {
      const next = prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId];
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent(FAVORITES_EVENT));
      } catch {
        // quota exceeded or storage disabled
      }
      return next;
    });
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    count: favorites.length,
  };
}
