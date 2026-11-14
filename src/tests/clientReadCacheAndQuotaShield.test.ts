// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  fetchWithClientCache,
  invalidateClientReadCache,
  clearClientMemoryCacheOnly,
  setClientCacheTestModeOverride,
} from "../utils/clientReadCache";
import {
  isFirestoreQuotaError,
  withFirestoreDeadline,
  isFirestoreAdminCircuitOpen,
  resetFirestoreAdminCircuit,
} from "../utils/firestoreTimeout";

describe("Enterprise Multi-Tier Read Shield & Quota Protection", () => {
  beforeEach(() => {
    setClientCacheTestModeOverride(true);
    invalidateClientReadCache();
    resetFirestoreAdminCircuit();
  });

  afterEach(() => {
    setClientCacheTestModeOverride(false);
    invalidateClientReadCache();
    resetFirestoreAdminCircuit();
  });

  it("serves repeated F5 page refreshes from L2 sessionStorage with 0 extra network/Firestore calls", async () => {
    const fetcher = vi.fn().mockResolvedValue({ products: [{ id: "p1", name: "Caftan" }] });

    // Initial load
    const first = await fetchWithClientCache<{ products: Array<{ id: string; name: string }> }>("home:data:v1", fetcher, 300_000);
    expect(first.products).toHaveLength(1);
    expect(fetcher).toHaveBeenCalledTimes(1);

    // Simulate 5 consecutive F5 page refreshes (clearing L1 RAM cache while keeping L2 sessionStorage)
    for (let i = 0; i < 5; i++) {
      clearClientMemoryCacheOnly();
      const refreshed = await fetchWithClientCache<{ products: Array<{ id: string; name: string }> }>("home:data:v1", fetcher, 300_000);
      expect(refreshed).toEqual(first);
    }

    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("coalesces concurrent in-flight requests (Singleflight pattern) into a single execution", async () => {
    let resolvePromise: (val: { count: number }) => void = () => {};
    const fetcher = vi.fn().mockImplementation(
      () =>
        new Promise<{ count: number }>((resolve) => {
          resolvePromise = resolve;
        })
    );

    const concurrentCalls = Array.from({ length: 8 }, () =>
      fetchWithClientCache("home:endless:page1:v1", fetcher, 300_000)
    );

    expect(fetcher).toHaveBeenCalledTimes(1);
    resolvePromise({ count: 24 });

    const results = await Promise.all(concurrentCalls);
    results.forEach((res) => expect(res).toEqual({ count: 24 }));
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("invalidates specific cache prefixes on Write-Through mutations without wiping unrelated keys", async () => {
    const cartFetcher = vi.fn().mockResolvedValueOnce({ items: ["a"] }).mockResolvedValueOnce({ items: ["a", "b"] });
    const homeFetcher = vi.fn().mockResolvedValue({ banners: [] });

    await fetchWithClientCache("auth:cart:u1", cartFetcher, 300_000);
    await fetchWithClientCache("home:data:v1", homeFetcher, 300_000);

    // Mutate cart -> invalidate only auth:cart:u1
    invalidateClientReadCache("auth:cart:u1");

    const updatedCart = await fetchWithClientCache("auth:cart:u1", cartFetcher, 300_000);
    const cachedHome = await fetchWithClientCache("home:data:v1", homeFetcher, 300_000);

    expect(updatedCart).toEqual({ items: ["a", "b"] });
    expect(cartFetcher).toHaveBeenCalledTimes(2);
    expect(cachedHome).toEqual({ banners: [] });
    expect(homeFetcher).toHaveBeenCalledTimes(1);
  });

  it("detects 8 RESOURCE_EXHAUSTED quota errors and immediately opens the Firestore circuit breaker", async () => {
    const quotaError = new Error(
      "8 RESOURCE_EXHAUSTED: Quota limit exceeded. Cause - Quota exceeded for quota metric 'Free daily read units per project'"
    );

    expect(isFirestoreQuotaError(quotaError)).toBe(true);
    expect(isFirestoreAdminCircuitOpen()).toBe(false);

    const fallback = await withFirestoreDeadline(
      () => Promise.reject(quotaError),
      [],
      1500,
      "SponsoredHomeQuery"
    );

    expect(fallback).toEqual([]);
    expect(isFirestoreAdminCircuitOpen()).toBe(true);
  });
});
