// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { useStudioUndoRedo } from "../pages/Seller/StoreBuilder/hooks/useStudioUndoRedo";
import { CustomPageSection, CustomPageTheme } from "../domains/seller/customPage.types";

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

  const baseTheme: CustomPageTheme = {
    sector: "mode",
    primaryColor: "#023859",
    secondaryColor: "#011C40",
    accentColor: "#26658C",
    canvasColor: "#F8FBFC",
    surfaceColor: "#FFFFFF",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
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
      result.current.pushState([section1, section2], undefined, "Ajout section");
    });

    expect(result.current.sections).toEqual([section1, section2]);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
    expect(onSectionsChange).toHaveBeenCalledWith([section1, section2]);

    act(() => {
      result.current.undo();
    });

    expect(result.current.sections).toEqual([section1]);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
    expect(onSectionsChange).toHaveBeenLastCalledWith([section1]);

    act(() => {
      result.current.redo();
    });

    expect(result.current.sections).toEqual([section1, section2]);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
    expect(onSectionsChange).toHaveBeenLastCalledWith([section1, section2]);
  });

  it("should support Undo and Redo for theme changes via pushThemeState", () => {
    const onSectionsChange = vi.fn();
    const onThemeChange = vi.fn();
    const { result } = renderHook(() =>
      useStudioUndoRedo([section1], onSectionsChange, {
        initialTheme: baseTheme,
        onThemeChange,
      })
    );

    const updatedTheme: CustomPageTheme = { ...baseTheme, primaryColor: "#E11D48" };
    act(() => {
      result.current.pushThemeState(updatedTheme);
    });

    expect(result.current.theme?.primaryColor).toBe("#E11D48");
    expect(result.current.canUndo).toBe(true);

    act(() => {
      result.current.undo();
    });

    expect(result.current.theme?.primaryColor).toBe("#023859");
    expect(onThemeChange).toHaveBeenLastCalledWith(expect.objectContaining({ primaryColor: "#023859" }));
  });

  it("should cleanly reset history on rollback via resetHistory", () => {
    const onSectionsChange = vi.fn();
    const { result } = renderHook(() => useStudioUndoRedo([section1], onSectionsChange));

    act(() => {
      result.current.pushState([section1, section2], undefined, "Ajout");
    });
    expect(result.current.canUndo).toBe(true);

    act(() => {
      result.current.resetHistory([section2], baseTheme, "Version #1 restaurée");
    });

    expect(result.current.sections).toEqual([section2]);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.currentActionLabel).toBe("Version #1 restaurée");
  });

  it("should guarantee deep clone immutability so mutating present does not mutate history", () => {
    const onSectionsChange = vi.fn();
    const { result } = renderHook(() => useStudioUndoRedo([section1], onSectionsChange));

    const updatedSection1 = { ...section1, title: "Titre Modifié" };
    act(() => {
      result.current.pushState([updatedSection1]);
    });

    updatedSection1.title = "Titre Hacké";

    act(() => {
      result.current.undo();
    });

    expect(result.current.sections[0].title).toBe("Bannière Principale");
  });

  it("should handle keyboard shortcuts Ctrl+Z and Ctrl+Y when not focusing text inputs", () => {
    const onSectionsChange = vi.fn();
    const { result } = renderHook(() => useStudioUndoRedo([section1], onSectionsChange));

    act(() => {
      result.current.pushState([section1, section2]);
    });

    expect(result.current.canUndo).toBe(true);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "z", ctrlKey: true, bubbles: true }));
    });

    expect(result.current.sections).toEqual([section1]);
    expect(result.current.canRedo).toBe(true);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "y", ctrlKey: true, bubbles: true }));
    });

    expect(result.current.sections).toEqual([section1, section2]);
  });

  it("should preserve referential stability of setSectionsDirectly across renders", () => {
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
