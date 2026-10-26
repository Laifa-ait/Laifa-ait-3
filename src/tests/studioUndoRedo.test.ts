// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { useStudioUndoRedo } from "../pages/Seller/StoreBuilder/hooks/useStudioUndoRedo";
import { CustomPageSection } from "../domains/seller/customPage.types";

function renderHook<T>(hookFn: () => T): { result: { current: T }; rerender: () => void } {
  const result = { current: undefined as unknown as T };
  function TestComponent() {
    result.current = hookFn();
    return null;
  }
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const render = () => {
    act(() => {
      root.render(React.createElement(TestComponent));
    });
  };
  render();
  return { result, rerender: render };
}

describe("useStudioUndoRedo Real Production Hook Tests", () => {
  const section1: CustomPageSection<"hero_banner"> = {
    id: "sec_1",
    type: "hero_banner",
    title: "Bannière Principale",
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
  });

  it("should initialize with empty past and future", () => {
    const onSectionsChange = vi.fn();
    const { result } = renderHook(() => useStudioUndoRedo([section1], onSectionsChange));

    expect(result.current.sections).toEqual([section1]);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("should push state and allow Undo and Redo operations", () => {
    const onSectionsChange = vi.fn();
    const { result } = renderHook(() => useStudioUndoRedo([section1], onSectionsChange));

    act(() => {
      result.current.pushState([section1, section2]);
    });

    expect(result.current.sections).toEqual([section1, section2]);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
    expect(onSectionsChange).toHaveBeenCalledWith([section1, section2]);

    // Perform Undo
    act(() => {
      result.current.undo();
    });

    expect(result.current.sections).toEqual([section1]);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
    expect(onSectionsChange).toHaveBeenLastCalledWith([section1]);

    // Perform Redo
    act(() => {
      result.current.redo();
    });

    expect(result.current.sections).toEqual([section1, section2]);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
    expect(onSectionsChange).toHaveBeenLastCalledWith([section1, section2]);
  });

  it("should guarantee deep clone immutability so mutating present does not mutate history", () => {
    const onSectionsChange = vi.fn();
    const { result } = renderHook(() => useStudioUndoRedo([section1], onSectionsChange));

    const updatedSection1 = { ...section1, title: "Titre Modifié" };
    act(() => {
      result.current.pushState([updatedSection1]);
    });

    // Attempt to mutate active section object in place
    updatedSection1.title = "Titre Hacké";

    // Perform Undo
    act(() => {
      result.current.undo();
    });

    // History snapshot remains pristine "Bannière Principale", untouched by external mutation!
    expect(result.current.sections[0].title).toBe("Bannière Principale");
  });

  it("should handle keyboard shortcuts Ctrl+Z and Ctrl+Y when not focusing text inputs", () => {
    const onSectionsChange = vi.fn();
    const { result } = renderHook(() => useStudioUndoRedo([section1], onSectionsChange));

    act(() => {
      result.current.pushState([section1, section2]);
    });

    expect(result.current.canUndo).toBe(true);

    // Simulate Ctrl+Z keydown
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "z", ctrlKey: true, bubbles: true }));
    });

    expect(result.current.sections).toEqual([section1]);
    expect(result.current.canRedo).toBe(true);

    // Simulate Ctrl+Y keydown
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "y", ctrlKey: true, bubbles: true }));
    });

    expect(result.current.sections).toEqual([section1, section2]);
  });

  it("should preserve referential stability of setSectionsDirectly across renders to prevent infinite fetch loops", () => {
    const onSectionsChange = vi.fn();
    const { result, rerender } = renderHook(() => useStudioUndoRedo([section1], onSectionsChange));

    const initialSetDirectlyRef = result.current.setSectionsDirectly;

    act(() => {
      result.current.setSectionsDirectly([section1, section2]);
    });
    rerender();

    expect(result.current.setSectionsDirectly).toBe(initialSetDirectlyRef);
  });
});

