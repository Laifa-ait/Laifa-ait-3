// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { useSellerStudio } from "../pages/Seller/StoreBuilder/hooks/useSellerStudio";
import { useStudioStore } from "../pages/Seller/StoreBuilder/store/useStudioStore";
import * as apiModule from "../lib/api";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    currentUser: { uid: "seller_phase1_uid" },
  }),
}));

vi.mock("../lib/api", () => ({
  apiGet: vi.fn(),
  apiPut: vi.fn(),
  apiPost: vi.fn(),
  apiDelete: vi.fn(),
}));

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

describe("Phase 1 Engine Integration — useSellerStudio & useStudioStore", () => {
  const initialDraftSections = [
    {
      id: "sec_hero_1",
      type: "hero_banner" as const,
      title: "Hero Boutique",
      settings: { title: "Collection Automne" },
      styles: { containerWidth: "contained" as const, paddingY: "md" as const, borderRadius: "none" as const },
      isVisible: true,
      order: 0,
    },
    {
      id: "sec_prod_2",
      type: "featured_products" as const,
      title: "Sélection Vedette",
      settings: { productIds: [] },
      styles: { containerWidth: "contained" as const, paddingY: "md" as const, borderRadius: "none" as const },
      isVisible: true,
      order: 1,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    window.localStorage.clear();
    useStudioStore.setState({ selectedSectionId: null, selectedSubElement: null });

    vi.mocked(apiModule.apiGet).mockImplementation(async (url: string) => {
      if (url === "/api/v1/seller/studio") {
        return {
          success: true,
          data: {
            storeConfig: {
              sellerId: "seller_phase1_uid",
              shopName: "Atelier Alger",
              shopSlug: "atelier-alger",
              isPublished: true,
            },
            draftLayout: {
              versionNumber: 1,
              draftRevision: 4,
              sections: initialDraftSections,
              updatedAt: new Date().toISOString(),
            },
            publishedLayout: null,
            historyList: [],
            mediaGallery: [],
          },
        };
      }
      return { success: true, products: [] };
    });
  });

  it("should synchronize selection state with useStudioStore and support reorder, duplicate, and delete with undo/redo", async () => {
    const { result } = renderHook(() => useSellerStudio());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.sections).toHaveLength(2);
    expect(useStudioStore.getState().selectedSectionId).toBe("sec_hero_1");

    // 1. Reorder sections (0 -> 1)
    act(() => {
      result.current.reorderSections(0, 1);
    });
    expect(result.current.sections[0].id).toBe("sec_prod_2");
    expect(result.current.sections[1].id).toBe("sec_hero_1");

    // 2. Duplicate section
    act(() => {
      result.current.duplicateSection("sec_prod_2");
    });
    expect(result.current.sections).toHaveLength(3);
    expect(result.current.sections[1].title).toContain("(Copie)");

    // 3. Delete section
    const duplicatedId = result.current.sections[1].id;
    act(() => {
      result.current.deleteSection(duplicatedId);
    });
    expect(result.current.sections).toHaveLength(2);

    // 4. Undo deletion -> back to 3 sections
    act(() => {
      result.current.undo();
    });
    expect(result.current.sections).toHaveLength(3);
  });

  it("should pass the newly confirmed draftRevision from saveDraft directly to publishStudio (fixing stale closure)", async () => {
    // Draft starts at draftRevision: 4. Saving draft returns draftRevision: 5.
    vi.mocked(apiModule.apiPut).mockResolvedValue({
      success: true,
      data: { draftRevision: 5 },
    });
    vi.mocked(apiModule.apiPost).mockResolvedValue({
      success: true,
      data: { versionNumber: 2 },
    });

    const { result } = renderHook(() => useSellerStudio());
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.publishStudio("Publication Phase 1");
    });

    expect(apiModule.apiPut).toHaveBeenCalledWith(
      "/api/v1/seller/studio/layout/draft",
      expect.objectContaining({ expectedRevision: 4 })
    );
    // Critical check: publish must receive expectedRevision: 5 (the newly returned revision), NOT stale 4!
    expect(apiModule.apiPost).toHaveBeenCalledWith("/api/v1/seller/studio/layout/publish", {
      changeSummary: "Publication Phase 1",
      expectedRevision: 5,
    });
  });

  it("should abort publishStudio and never call /publish if saveDraft fails or conflicts", async () => {
    vi.mocked(apiModule.apiPut).mockRejectedValue(
      new Error("CONFLICT_NEWER_VERSION: Conflit de version détecté")
    );

    const { result } = renderHook(() => useSellerStudio());
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.publishStudio("Tentative de publication en conflit");
    });

    expect(apiModule.apiPost).not.toHaveBeenCalled();
    expect(result.current.saveStatus).toBe("conflict");
  });
});
