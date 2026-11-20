import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

const mockGet = vi.fn();
const mockDoc = vi.fn(() => ({ get: mockGet }));
const mockLimit = vi.fn(() => ({ get: mockGet }));
const mockWhere = vi.fn(() => ({ limit: mockLimit, get: mockGet, where: mockWhere, orderBy: mockOrderBy }));
const mockOrderBy = vi.fn(() => ({ limit: mockLimit, get: mockGet }));
const mockCollection = vi.fn(() => ({
  doc: mockDoc,
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
  get: mockGet,
}));

vi.mock("../config/firebase-admin", () => ({
  admin: {
    apps: [{}],
    firestore: {
      FieldValue: { serverTimestamp: () => "TS" },
    },
  },
  db: {
    collection: mockCollection,
  },
}));

describe("Firebase Quota & Token Optimization Guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({
      exists: true,
      empty: false,
      docs: [],
      data: () => ({ role: "admin", is2FAEnabled: false }),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("require2FA reuses authProfileCache without making extra Firestore reads", async () => {
    const { require2FA, setUserProfileInCache, clearUserProfileCache } = await import("../middlewares/auth");
    clearUserProfileCache();

    setUserProfileInCache("admin_uid_1", {
      uid: "admin_uid_1",
      role: "admin",
      status: "active",
      is2FAEnabled: false,
    });

    const req = {
      user: { uid: "admin_uid_1", role: "admin", auth_time: Math.floor(Date.now() / 1000) },
    } as unknown as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;
    const next = vi.fn() as unknown as NextFunction;

    await require2FA(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(mockCollection).not.toHaveBeenCalled();
  });

  it("SettingsService.getCachedOrFetch deduplicates concurrent cold fetches into a single Firestore call", async () => {
    const { SettingsService } = await import("../domains/home/services/settings.service");
    SettingsService.clearCache();

    let fetcherCalls = 0;
    const fetcher = async () => {
      fetcherCalls += 1;
      await new Promise((r) => setTimeout(r, 15));
      return { categories: ["Mode", "Tech"] };
    };

    const results = await Promise.all([
      SettingsService.getCachedOrFetch("test_dedupe_key", fetcher, 60_000),
      SettingsService.getCachedOrFetch("test_dedupe_key", fetcher, 60_000),
      SettingsService.getCachedOrFetch("test_dedupe_key", fetcher, 60_000),
      SettingsService.getCachedOrFetch("test_dedupe_key", fetcher, 60_000),
    ]);

    expect(fetcherCalls).toBe(1);
    expect(results[0]).toEqual({ categories: ["Mode", "Tech"] });
    expect(results[3]).toEqual({ categories: ["Mode", "Tech"] });

    // Subsequent call uses cache without calling fetcher again
    await SettingsService.getCachedOrFetch("test_dedupe_key", fetcher, 60_000);
    expect(fetcherCalls).toBe(1);
  });

  it("CoreService.getHomeData deduplicates concurrent cold requests and caches the result", async () => {
    const { CoreService } = await import("../services/CoreService");
    CoreService.invalidateHomeDataCache();

    mockGet.mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 10));
      return { empty: false, docs: [] };
    });

    await Promise.all([
      CoreService.getHomeData(),
      CoreService.getHomeData(),
      CoreService.getHomeData(),
    ]);

    const callsAfterColdBurst = mockCollection.mock.calls.length;
    expect(callsAfterColdBurst).toBeLessThanOrEqual(7); // 1 seed check + 6 home collections (once, not 3x!)

    // Repeat call hits in-memory L2 cache -> 0 new Firestore reads
    await CoreService.getHomeData();
    expect(mockCollection.mock.calls.length).toBe(callsAfterColdBurst);
  });

  it("SellerService.getOverviewStats deduplicates concurrent calls and caches per seller", async () => {
    const { SellerService } = await import("../services/SellerService");
    SellerService.clearOverviewCache();

    mockGet.mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 10));
      return { docs: [] };
    });

    await Promise.all([
      SellerService.getOverviewStats("seller_alpha"),
      SellerService.getOverviewStats("seller_alpha"),
      SellerService.getOverviewStats("seller_alpha"),
    ]);

    // Exactly 2 Firestore collections queried (products + orders), NOT financial_summary and NOT 3x!
    expect(mockCollection).toHaveBeenCalledTimes(2);

    // Repeat call for same seller -> 0 extra Firestore reads
    await SellerService.getOverviewStats("seller_alpha");
    expect(mockCollection).toHaveBeenCalledTimes(2);
  });

  it("startVisibilityAwarePolling skips polling ticks when tab is hidden", async () => {
    vi.useFakeTimers();
    const { startVisibilityAwarePolling } = await import("../utils/visibilityPolling");

    let isHidden = true;
    const originalDoc = globalThis.document;
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        get hidden() {
          return isHidden;
        },
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });

    const cb = vi.fn();
    const stop = startVisibilityAwarePolling(cb, 10_000);

    vi.advanceTimersByTime(35_000);
    expect(cb).not.toHaveBeenCalled();

    isHidden = false;
    vi.advanceTimersByTime(10_000);
    expect(cb).toHaveBeenCalledTimes(1);

    stop();
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: originalDoc,
    });
  });
});
