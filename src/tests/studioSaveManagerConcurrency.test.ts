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

describe("Phase 1 - useStudioSaveManager Atomic Revisions & FIFO Queue", () => {
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

  const section3: CustomPageSection<"delivery_info"> = {
    id: "sec_3",
    type: "delivery_info",
    title: "Livraison 69 Wilayas",
    settings: {
      title: "Expédition Rapide",
    },
    styles: {},
    isVisible: true,
    order: 2,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should send expectedRevision and update confirmedServerRevision upon success", async () => {
    vi.mocked(apiModule.apiPut).mockResolvedValue({
      success: true,
      data: { draftRevision: 5 },
    });

    const { result } = renderHook(() => useStudioSaveManager());

    await act(async () => {
      result.current.syncServerDraftRevision(4);
      await result.current.saveDraft([section1]);
    });

    expect(apiModule.apiPut).toHaveBeenCalledWith("/api/v1/seller/studio/layout/draft", {
      sections: [section1],
      expectedRevision: 4,
    });
    expect(result.current.confirmedServerRevision).toBe(5);
    expect(result.current.saveStatus).toBe("saved");
  });

  it("should queue rapid sequential modifications while in-flight and execute the latest state immediately upon resolve", async () => {
    let resolveFirst: (val: unknown) => void = () => {};
    const firstCallPromise = new Promise((res) => {
      resolveFirst = res;
    });

    vi.mocked(apiModule.apiPut)
      .mockImplementationOnce(() => firstCallPromise as Promise<never>)
      .mockResolvedValue({ success: true, data: { draftRevision: 2 } });

    const { result } = renderHook(() => useStudioSaveManager());

    // 1. Déclenchement du premier enregistrement
    let p1: Promise<void> | undefined;
    act(() => {
      p1 = result.current.saveDraft([section1]);
    });

    expect(result.current.saveStatus).toBe("saving");
    expect(apiModule.apiPut).toHaveBeenCalledTimes(1);

    // 2. Frappes successives rapides pendant que la requête 1 est en vol
    act(() => {
      result.current.triggerAutoSave([section1, section2]);
      result.current.triggerAutoSave([section1, section2, section3]);
    });

    // 3. Résolution de la première requête
    await act(async () => {
      resolveFirst({ success: true, data: { draftRevision: 1 } });
      await p1;
    });

    // La deuxième sauvegarde doit être déclenchée avec la dernière révision (section3)
    expect(apiModule.apiPut).toHaveBeenCalledTimes(2);
    expect(apiModule.apiPut).toHaveBeenLastCalledWith("/api/v1/seller/studio/layout/draft", {
      sections: [section1, section2, section3],
      expectedRevision: 1,
    });
    expect(result.current.saveStatus).toBe("saved");
  });

  it("should halt auto-retries immediately and trigger conflict state on CONFLICT_NEWER_VERSION", async () => {
    vi.mocked(apiModule.apiPut).mockRejectedValue(
      new Error("Conflit de version (CONFLICT_NEWER_VERSION) : Le brouillon serveur est plus récent")
    );
    const onConflict = vi.fn();

    const { result } = renderHook(() => useStudioSaveManager({ onConflict }));

    await act(async () => {
      result.current.syncServerDraftRevision(2);
      await result.current.saveDraft([section1]);
    });

    expect(apiModule.apiPut).toHaveBeenCalledTimes(1);
    expect(result.current.saveStatus).toBe("conflict");
    expect(onConflict).toHaveBeenCalledTimes(1);
  });
});
