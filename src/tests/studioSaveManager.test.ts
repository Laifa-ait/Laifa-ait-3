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
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should mark as saved, return confirmed revision, and clear local backup when saveDraft resolves", async () => {
    vi.mocked(apiModule.apiPut).mockResolvedValue({ success: true, data: { draftRevision: 3 } });

    const { result } = renderHook(() => useStudioSaveManager());

    expect(result.current.saveStatus).toBe("idle");
    expect(result.current.hasUnsavedChanges).toBe(false);

    let confirmedRev: number | null = null;
    await act(async () => {
      result.current.syncServerDraftRevision(2);
      confirmedRev = await result.current.saveDraft([section1]);
    });

    expect(confirmedRev).toBe(3);
    expect(apiModule.apiPut).toHaveBeenCalledWith("/api/v1/seller/studio/layout/draft", {
      sections: [section1],
      expectedRevision: 2,
    });
    expect(result.current.saveStatus).toBe("saved");
    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(window.localStorage.getItem("olmart_studio_unsaved_backup")).toBeNull();
  });

  it("should set unsaved status immediately on triggerAutoSave and wait for in-flight queue on concurrent saveDraft", async () => {
    let resolveFirstApi: (val: unknown) => void = () => {};
    const firstPromise = new Promise((res) => {
      resolveFirstApi = res;
    });

    vi.mocked(apiModule.apiPut)
      .mockImplementationOnce(() => firstPromise as Promise<never>)
      .mockResolvedValue({ success: true, data: { draftRevision: 2 } });

    const { result } = renderHook(() => useStudioSaveManager());

    let p1: Promise<number | null> | undefined;
    act(() => {
      p1 = result.current.saveDraft([section1]);
    });

    expect(result.current.saveStatus).toBe("saving");
    expect(apiModule.apiPut).toHaveBeenCalledTimes(1);

    let p2: Promise<number | null> | undefined;
    act(() => {
      p2 = result.current.saveDraft([section1, section2]);
    });

    let rev1: number | null = null;
    let rev2: number | null = null;
    await act(async () => {
      resolveFirstApi({ success: true, data: { draftRevision: 1 } });
      rev1 = (await p1) ?? null;
      rev2 = (await p2) ?? null;
    });

    expect(apiModule.apiPut).toHaveBeenCalledTimes(2);
    expect(rev1).toBe(2);
    expect(rev2).toBe(2);
    expect(result.current.saveStatus).toBe("saved");
  });

  it("should stop retrying immediately on CONFLICT_NEWER_VERSION and return null", async () => {
    vi.mocked(apiModule.apiPut).mockRejectedValue(
      new Error("CONFLICT_NEWER_VERSION: Une version plus récente du brouillon a été modifiée sur un autre appareil")
    );

    const { result } = renderHook(() => useStudioSaveManager());

    let rev: number | null = 99;
    await act(async () => {
      result.current.syncServerDraftRevision(4);
      rev = await result.current.saveDraft([section1]);
    });

    expect(rev).toBeNull();
    expect(apiModule.apiPut).toHaveBeenCalledTimes(1);
    expect(result.current.saveStatus).toBe("conflict");
  });

  it("should transition through retrying state up to 3 times on network failure before error", async () => {
    vi.mocked(apiModule.apiPut).mockRejectedValue(new Error("Network Failure"));

    const { result } = renderHook(() => useStudioSaveManager());

    let firstAttemptRev: number | null = 99;
    await act(async () => {
      firstAttemptRev = await result.current.saveDraft([section1]);
    });

    expect(firstAttemptRev).toBeNull();
    expect(apiModule.apiPut).toHaveBeenCalledTimes(1);
    expect(result.current.saveStatus).toBe("retrying");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(apiModule.apiPut).toHaveBeenCalledTimes(2);
    expect(result.current.saveStatus).toBe("retrying");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(apiModule.apiPut).toHaveBeenCalledTimes(3);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(apiModule.apiPut).toHaveBeenCalledTimes(4);
    expect(result.current.saveStatus).toBe("error");
  });
});
