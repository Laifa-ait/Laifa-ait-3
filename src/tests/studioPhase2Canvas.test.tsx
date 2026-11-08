// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CanvasInlineText } from "../components/Store/sections/CanvasInlineText";
import { HeroCanvasSubToolbar } from "../components/Store/sections/HeroCanvasSubToolbar";
import {
  SectionSubBlocksTree,
  hasExpandableSubBlocks,
} from "../pages/Seller/StoreBuilder/components/studio/SectionSubBlocksTree";
import { SectionCard } from "../pages/Seller/StoreBuilder/components/studio/SectionCard";
import { PreviewControlToolbar } from "../pages/Seller/StoreBuilder/components/preview/PreviewControlToolbar";
import { useStudioStore } from "../pages/Seller/StoreBuilder/store/useStudioStore";
import type { CustomPageSection, CustomPageSectionType } from "../domains/seller/customPage.types";

const ALL_16_SECTION_TYPES: CustomPageSectionType[] = [
  "hero_banner", "promo_carousel", "featured_categories", "curated_collections",
  "featured_products", "new_arrivals", "best_sellers", "product_grid",
  "brand_story", "showcase_video", "verified_reviews", "delivery_info",
  "return_policy", "faq_accordion", "contact_footer", "kinetic_marquee",
];

function createSampleSection(
  id: string,
  type: CustomPageSectionType,
  settings: Record<string, unknown> = {},
): CustomPageSection {
  return {
    id,
    type,
    title: `Titre ${type}`,
    isVisible: true,
    order: 0,
    settings: settings as CustomPageSection["settings"],
    styles: {},
  };
}

let container: HTMLDivElement;
let root: Root;

function renderElement(ui: React.ReactElement) {
  act(() => {
    root.render(ui);
  });
}

describe("Phase 2 — Canvas Professionnel & Architecture des Blocs", () => {
  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    useStudioStore.setState({
      selectedSectionId: null,
      selectedSubElement: null,
      activeInspectorTab: "content",
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("1. Direct inline text editing emits studio:patch-section-settings on change & Enter", () => {
    const events: CustomEvent[] = [];
    const handler = (e: Event) => events.push(e as CustomEvent);
    window.addEventListener("studio:patch-section-settings", handler);

    renderElement(
      <CanvasInlineText
        value="Bienvenue chez Olmart"
        placeholder="Titre..."
        isEditable={true}
        as="h2"
        editConfig={{ sectionId: "sec-hero-1", settingKey: "title", alsoUpdateSectionTitle: true }}
      />,
    );

    const textEl = container.querySelector('[data-testid="canvas-inline-text-title"]') as HTMLElement;
    expect(textEl).toBeTruthy();
    act(() => textEl.click());

    const input = container.querySelector('[data-testid="canvas-inline-input-title"]') as HTMLInputElement;
    expect(input).toBeTruthy();

    act(() => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      setter?.call(input, "Nouvelle Collection 2026");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });

    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[events.length - 1].detail).toEqual({
      sectionId: "sec-hero-1",
      patch: { title: "Nouvelle Collection 2026", __sectionTitle: "Nouvelle Collection 2026" },
    });

    window.removeEventListener("studio:patch-section-settings", handler);
  });

  it("2. HeroCanvasSubToolbar allows direct Image fit/alt editing and Button style editing", () => {
    const events: CustomEvent[] = [];
    const handler = (e: Event) => events.push(e as CustomEvent);
    window.addEventListener("studio:patch-section-settings", handler);

    renderElement(
      <HeroCanvasSubToolbar
        sectionId="sec-hero-1"
        settings={{ title: "Titre Hero", imageUrl: "https://example.com/banner.jpg", imageFit: "cover", ctaText: "Découvrir", ctaLink: "#catalog", ctaStyle: "solid" }}
        activeSubElement="background"
        activeObjectPosition="50% 50%"
        onSelectSubElement={vi.fn()}
      />,
    );

    const containBtn = Array.from(container.querySelectorAll("button")).find((b) => b.textContent?.includes("Entière"));
    expect(containBtn).toBeTruthy();
    act(() => containBtn?.click());

    expect(events[0].detail).toEqual({ sectionId: "sec-hero-1", patch: { imageFit: "contain" } });

    renderElement(
      <HeroCanvasSubToolbar
        sectionId="sec-hero-1"
        settings={{ title: "Titre Hero", imageUrl: "https://example.com/banner.jpg", ctaText: "Découvrir", ctaLink: "#catalog", ctaStyle: "solid" }}
        activeSubElement="ctaPrimary"
        activeObjectPosition="50% 50%"
        onSelectSubElement={vi.fn()}
      />,
    );

    const outlineBtn = Array.from(container.querySelectorAll("button")).find((b) => b.textContent?.trim() === "outline");
    expect(outlineBtn).toBeTruthy();
    act(() => outlineBtn?.click());

    expect(events[1].detail.patch).toEqual({ ctaStyle: "outline" });
    window.removeEventListener("studio:patch-section-settings", handler);
  });

  it("3. Sub-Blocks hierarchy supports all 16 section types and renders interactive sub-elements", () => {
    for (const type of ALL_16_SECTION_TYPES) {
      expect(hasExpandableSubBlocks(type)).toBe(true);
    }

    const productSection = createSampleSection("sec-prod-1", "featured_products", {
      subtitle: "Sélection du mois", productIds: ["p1", "p2", "p3"], columnsDesktop: 4,
    });

    renderElement(<SectionSubBlocksTree sec={productSection} onSelectSection={vi.fn()} onUpdateSection={vi.fn()} />);

    expect(container.textContent).toContain("Titre de section");
    expect(container.textContent).toContain("Grille & Sélection produits");
    expect(container.textContent).toContain("Carte produit (Image, Nom, Prix, Achat)");
  });

  it("4. SectionCard supports Lock toggle and disables deletion & movement when section is locked", () => {
    const onUpdateSection = vi.fn();
    const lockedSection = createSampleSection("sec-locked", "brand_story", { isLocked: true });

    renderElement(
      <SectionCard
        sec={lockedSection}
        idx={0}
        totalSections={2}
        isSelected={true}
        onSelectSection={vi.fn()}
        onUpdateSection={onUpdateSection}
        onReorder={vi.fn()}
        onToggleVisibility={vi.fn()}
        onRequestDelete={vi.fn()}
      />,
    );

    expect(container.textContent).toContain("Verrouillé");
    const deleteBtn = container.querySelector('[data-testid="delete-section-sec-locked"]') as HTMLButtonElement;
    expect(deleteBtn.disabled).toBe(true);

    const lockBtn = container.querySelector('[data-testid="lock-section-sec-locked"]') as HTMLButtonElement;
    act(() => lockBtn.click());
    expect(onUpdateSection).toHaveBeenCalledWith("sec-locked", { settings: { isLocked: false } });
  });

  it("5. PreviewControlToolbar exposes 50%, 75%, 100%, 125% zoom presets and Ajuster à la fenêtre", () => {
    const setZoom = vi.fn();
    renderElement(
      <PreviewControlToolbar
        device="desktop" setDevice={vi.fn()} orientation="portrait" toggleOrientation={vi.fn()}
        zoom={1} setZoom={setZoom} isInteractiveMode={false} setIsInteractiveMode={vi.fn()}
        isDarkMode={false} setIsDarkMode={vi.fn()} showGrid={false} setShowGrid={vi.fn()}
        isFullscreen={false} toggleFullscreen={vi.fn()} onOpenQrModal={vi.fn()} onOpenAuditModal={vi.fn()}
      />,
    );

    const zoomSelect = container.querySelector('[data-testid="canvas-zoom-select"]') as HTMLSelectElement;
    expect(zoomSelect).toBeTruthy();

    act(() => { zoomSelect.value = "0.5"; zoomSelect.dispatchEvent(new Event("change", { bubbles: true })); });
    expect(setZoom).toHaveBeenCalledWith(0.5);

    act(() => { zoomSelect.value = "1.25"; zoomSelect.dispatchEvent(new Event("change", { bubbles: true })); });
    expect(setZoom).toHaveBeenCalledWith(1.25);

    act(() => { zoomSelect.value = "fit"; zoomSelect.dispatchEvent(new Event("change", { bubbles: true })); });
    expect(setZoom).toHaveBeenCalled();
  });
});
