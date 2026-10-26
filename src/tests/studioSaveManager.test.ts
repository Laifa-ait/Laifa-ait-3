// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { useStudioSaveManager } from "../pages/Seller/StoreBuilder/hooks/useStudioSaveManager";
import { CustomPageSection } from "../domains/seller/customPage.types";
import * as apiModule from "../lib/api";

function renderHook<T>(hookFn: () => T): { result: { current: T } } {
  const result = { current: undefined as unknown as T };
  function TestComponent() {
    result.current = hookFn();
    return null;
  }
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(React.createElement(TestComponent));
  });
  return { result };
}

vi.mock("../lib/api", () => ({
  apiPut: vi.fn(),
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

describe("useStudioSaveManager Real Production Hook Tests", () => {
  const section1: CustomPageSection<"hero_banner"> = {
    id: "sec_1",
    type: "hero_banner",
    title: "Bannière Hero",
    settings: {
      title: "Bienvenue",
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
    },
    styles: {},
    isVisible: true,
    order: 0,
  };

  const section2: CustomPageSection<"featured_products"> = {
    id: "sec_2",
    type: "featured_products",
    title: "Produits en Vedette",
    settings: {
      productIds: [],
    },
    styles: {},
    isVisible: true,
    order: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should mark as saved when saveDraft resolves successfully", async () => {
    vi.mocked(apiModule.apiPut).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useStudioSaveManager());

    expect(result.current.saveStatus).toBe("idle");
    expect(result.current.hasUnsavedChanges).toBe(false);

    // Call saveDraft directly
    await act(async () => {
      await result.current.saveDraft([section1]);
    });

    expect(apiModule.apiPut).toHaveBeenCalledTimes(1);
    expect(result.current.saveStatus).toBe("saved");
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it("should handle single write in-flight mutex and process newer revision after first save resolves", async () => {
    let resolveFirstApi: (val: unknown) => void = () => {};
    const firstPromise = new Promise((res) => { resolveFirstApi = res; });

    vi.mocked(apiModule.apiPut)
      .mockImplementationOnce(() => firstPromise as Promise<never>)
      .mockResolvedValue({ success: true });

    const { result } = renderHook(() => useStudioSaveManager());

    // Trigger first save
    let p1: Promise<void> | undefined;
    act(() => {
      p1 = result.current.saveDraft([section1]);
    });

    expect(result.current.saveStatus).toBe("saving");
    expect(apiModule.apiPut).toHaveBeenCalledTimes(1);

    // Try triggering second save while first is in flight
    let p2: Promise<void> | undefined;
    act(() => {
      p2 = result.current.saveDraft([section1, section2]);
    });

    // Resolve first HTTP request
    await act(async () => {
      resolveFirstApi({ success: true });
      await p1;
      await p2;
    });

    expect(apiModule.apiPut).toHaveBeenCalledTimes(1);
    expect(result.current.saveStatus).toBe("saved");
  });

  it("should retry up to 3 times on network failure", async () => {
    vi.mocked(apiModule.apiPut).mockRejectedValue(new Error("Network Failure"));

    const { result } = renderHook(() => useStudioSaveManager());

    await act(async () => {
      await result.current.saveDraft([section1]);
    });

    expect(apiModule.apiPut).toHaveBeenCalledTimes(1);

    // Advance retry timer 1 (1000ms)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(apiModule.apiPut).toHaveBeenCalledTimes(2);

    // Advance retry timer 2 (2000ms)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(apiModule.apiPut).toHaveBeenCalledTimes(3);

    // Advance retry timer 3 (3000ms)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(apiModule.apiPut).toHaveBeenCalledTimes(4);
    expect(result.current.saveStatus).toBe("error");
  });
});
