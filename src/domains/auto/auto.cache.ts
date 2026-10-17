import { VehicleCatalogItemDto } from "./auto.types";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

const SHOWCASE_CACHE_KEY = "olma_auto_showcase_v2";
const SHOWCASE_TTL_MS = 2 * 60 * 1000; // 2 minutes max

const memoryCache = new Map<string, CacheEntry<unknown>>();

export const autoSearchCache = {
  getShowcase(): { data: VehicleCatalogItemDto[] | null; isStale: boolean } {
    const now = Date.now();
    const entry = memoryCache.get(SHOWCASE_CACHE_KEY) as CacheEntry<VehicleCatalogItemDto[]> | undefined;

    if (!entry) {
      try {
        const stored = sessionStorage.getItem(SHOWCASE_CACHE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as CacheEntry<VehicleCatalogItemDto[]>;
          const isStale = now - parsed.timestamp > parsed.ttlMs;
          memoryCache.set(SHOWCASE_CACHE_KEY, parsed);
          return { data: parsed.data, isStale };
        }
      } catch {
        // Fallback transparent en cas d'accès refusé au storage
      }
      return { data: null, isStale: false };
    }

    const isStale = now - entry.timestamp > entry.ttlMs;
    return { data: entry.data, isStale };
  },

  setShowcase(data: VehicleCatalogItemDto[]): void {
    const entry: CacheEntry<VehicleCatalogItemDto[]> = {
      data,
      timestamp: Date.now(),
      ttlMs: SHOWCASE_TTL_MS,
    };
    memoryCache.set(SHOWCASE_CACHE_KEY, entry);
    try {
      sessionStorage.setItem(SHOWCASE_CACHE_KEY, JSON.stringify(entry));
    } catch {
      // Ignorer si quota ou restriction iframe
    }
  },

  invalidateShowcase(): void {
    memoryCache.delete(SHOWCASE_CACHE_KEY);
    try {
      sessionStorage.removeItem(SHOWCASE_CACHE_KEY);
    } catch {
      // Ignorer
    }
  },
};
