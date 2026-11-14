/**
 * Enterprise Multi-Tier Client Read Cache (L1 Memory + L2 SessionStorage + Singleflight Coalescing)
 *
 * Designed to protect Firestore quotas from page refresh storms (F5 spam),
 * hot-reload cycles in AI Studio, and duplicate concurrent component mounts.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const STORAGE_PREFIX = "olmart_rcache_v1:";
const memoryCache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();

function readFromSessionStorage<T>(key: string): CacheEntry<T> | null {
  if (typeof window === "undefined" || typeof window.sessionStorage === "undefined") {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.expiresAt === "number" &&
      "data" in parsed
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function writeToSessionStorage<T>(key: string, entry: CacheEntry<T>): void {
  if (typeof window === "undefined" || typeof window.sessionStorage === "undefined") {
    return;
  }
  try {
    window.sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(entry));
  } catch {
    // Ignore storage quota errors on mobile private browsing
  }
}

export function getCachedClientData<T>(key: string): T | null {
  const now = Date.now();
  const mem = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (mem && mem.expiresAt > now) {
    return mem.data;
  }

  const stored = readFromSessionStorage<T>(key);
  if (stored && stored.expiresAt > now) {
    memoryCache.set(key, stored);
    return stored.data;
  }

  return null;
}

export function setCachedClientData<T>(key: string, data: T, ttlMs: number): void {
  const now = Date.now();
  const entry: CacheEntry<T> = {
    data,
    timestamp: now,
    expiresAt: now + ttlMs,
  };
  memoryCache.set(key, entry);
  writeToSessionStorage(key, entry);
}

let forceEnableCacheInTests = false;

export function setClientCacheTestModeOverride(enabled: boolean): void {
  forceEnableCacheInTests = enabled;
}

export function clearClientMemoryCacheOnly(): void {
  memoryCache.clear();
  inFlightRequests.clear();
}

/**
 * Executes `fetcher` with L1/L2 cache lookup (survives F5 page refreshes via sessionStorage)
 * and Singleflight in-flight promise deduplication.
 * If `fetcher` fails and stale data exists in sessionStorage, returns the stale data gracefully.
 */
export async function fetchWithClientCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 300_000,
  shouldCache: (data: T) => boolean = () => true
): Promise<T> {
  const isTestEnv =
    !forceEnableCacheInTests &&
    ((typeof process !== "undefined" && (process.env?.NODE_ENV === "test" || Boolean(process.env?.VITEST))) ||
      (typeof import.meta !== "undefined" && import.meta.env?.MODE === "test"));

  if (isTestEnv) {
    return fetcher();
  }

  const fresh = getCachedClientData<T>(key);
  if (fresh !== null) {
    return fresh;
  }

  const existingPromise = inFlightRequests.get(key) as Promise<T> | undefined;
  if (existingPromise) {
    return existingPromise;
  }

  const requestPromise = (async () => {
    try {
      const result = await fetcher();
      if (shouldCache(result)) {
        setCachedClientData(key, result, ttlMs);
      }
      return result;
    } catch (error) {
      // Stale-if-error fallback from sessionStorage if available
      const stale = readFromSessionStorage<T>(key);
      if (stale) {
        return stale.data;
      }
      throw error;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, requestPromise);
  return requestPromise;
}

/**
 * Invalidates all client cache entries matching the given prefix (Write-Through Invalidation).
 */
export function invalidateClientReadCache(prefix?: string): void {
  if (!prefix) {
    memoryCache.clear();
  } else {
    for (const k of memoryCache.keys()) {
      if (k.startsWith(prefix)) {
        memoryCache.delete(k);
      }
    }
  }

  if (typeof window !== "undefined" && typeof window.sessionStorage !== "undefined") {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const storageKey = window.sessionStorage.key(i);
        if (!storageKey || !storageKey.startsWith(STORAGE_PREFIX)) continue;
        const cleanKey = storageKey.slice(STORAGE_PREFIX.length);
        if (!prefix || cleanKey.startsWith(prefix)) {
          keysToRemove.push(storageKey);
        }
      }
      keysToRemove.forEach((k) => window.sessionStorage.removeItem(k));
    } catch {
      // Ignore storage access errors
    }
  }
}
