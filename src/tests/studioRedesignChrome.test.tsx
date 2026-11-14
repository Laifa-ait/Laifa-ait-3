// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { StudioTopBar } from "../pages/Seller/StoreBuilder/components/studio/StudioTopBar";
import { SectionTreePanel } from "../pages/Seller/StoreBuilder/components/studio/SectionTreePanel";
import { CatalogInspectorPanel } from "../pages/Seller/StoreBuilder/components/context/CatalogInspectorPanel";
import {
  CustomPageSection,
  SellerStoreConfig,
  StoreHistoryEntry,
} from "../domains/seller/customPage.types";

function mount(node: React.ReactElement): { container: HTMLDivElement; unmount: () => void } {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root: Root = createRoot(container);
  act(() => { root.render(node); });
  return {
    container,
    unmount: () => { act(() => { root.unmount(); }); container.remove(); },
  };
}

function setInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

describe("Studio Redesign Chrome, Section Filter & Catalog Page Wiring", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => { document.body.innerHTML = ""; });

  it("renders unboxed StudioTopBar metadata, handles History rollback, Direct Publish summary & Audit/Cmd triggers", () => {
    const onPublish = vi.fn();
    const onRollback = vi.fn();
    const onOpenAudit = vi.fn();
    const onOpenCommandPalette = vi.fn();
    const historyList: StoreHistoryEntry[] = [
      {
        versionId: "v4",
        versionNumber: 4,
        sellerId: "seller_1",
        snapshot: { versionNumber: 4, sections: [], status: "published", updatedAt: "2026-11-12T10:00:00.000Z" },
        publishedAt: "2026-11-12T10:00:00.000Z",
        changeSummary: "Refonte bannière d'automne",
        sectionsCount: 5,
      },
    ];

    const { container, unmount } = mount(
      <MemoryRouter>
        <StudioTopBar
          shopName="Atelier Casbah"
          shopSlug="atelier-casbah"
          isPublished={true}
          versionNumber={4}
          sectionCount={6}
          productCount={14}
          historyList={historyList}
          saveStatus="saved"
          viewport="desktop"
          onOpenAudit={onOpenAudit}
          onOpenCommandPalette={onOpenCommandPalette}
          onPublish={onPublish}
          onRollback={onRollback}
        />
      </MemoryRouter>
    );

    expect(container.textContent).toContain("Atelier Casbah");
    expect(container.textContent).toContain("En ligne v4");
    expect(container.textContent).toContain("6 sections");
    expect(container.textContent).toContain("14 produits");
    expect(container.textContent).not.toContain("Studio 3.0");
    expect(container.textContent).not.toContain("OS 2.0");

    act(() => {
      container.querySelector<HTMLButtonElement>('[data-testid="topbar-audit-btn"]')?.click();
      container.querySelector<HTMLButtonElement>('[data-testid="topbar-cmd-btn"]')?.click();
    });
    expect(onOpenAudit).toHaveBeenCalledTimes(1);
    expect(onOpenCommandPalette).toHaveBeenCalledTimes(1);

    act(() => { container.querySelector<HTMLButtonElement>('[data-testid="topbar-history-btn"]')?.click(); });
    expect(container.textContent).toContain("Refonte bannière d'automne");

    const rollbackBtn = Array.from(container.querySelectorAll("button")).find((btn) => btn.textContent?.includes("Restaurer"));
    act(() => { rollbackBtn?.click(); });
    expect(onRollback).toHaveBeenCalledWith(4);

    act(() => { container.querySelector<HTMLButtonElement>('[data-testid="topbar-publish-btn"]')?.click(); });
    const noteInput = container.querySelector<HTMLTextAreaElement>("#publish-note-input");
    act(() => { if (noteInput) setInputValue(noteInput, "Nouvelle collection hiver"); });
    act(() => { container.querySelector<HTMLButtonElement>('[data-testid="confirm-publish-btn"]')?.click(); });
    expect(onPublish).toHaveBeenCalledWith("Nouvelle collection hiver");
    unmount();
  });

  it("displays SectionTreePanel search input only above 5 body sections and filters matching sections", () => {
    const sixSections: CustomPageSection[] = [
      { id: "s1", type: "hero_banner", title: "Bannière Hero", settings: {}, styles: {}, isVisible: true, order: 0 },
      { id: "s2", type: "kinetic_marquee", title: "Ruban Promo", settings: {}, styles: {}, isVisible: true, order: 1 },
      { id: "s3", type: "featured_categories", title: "Rayons Saison", settings: {}, styles: {}, isVisible: true, order: 2 },
      { id: "s4", type: "featured_products", title: "Coups de Cœur", settings: { productIds: [] }, styles: {}, isVisible: true, order: 3 },
      { id: "s5", type: "brand_story", title: "Notre Savoir-Faire", settings: {}, styles: {}, isVisible: true, order: 4 },
      { id: "s6", type: "faq_accordion", title: "Questions Fréquentes", settings: {}, styles: {}, isVisible: true, order: 5 },
    ];

    const { container, unmount } = mount(
      <SectionTreePanel
        sections={sixSections}
        selectedSectionId="s1"
        onSelectSection={vi.fn()}
        onReorder={vi.fn()}
        onToggleVisibility={vi.fn()}
        onDeleteSection={vi.fn()}
        onAddSection={vi.fn()}
      />
    );

    const searchInput = container.querySelector<HTMLInputElement>('input[placeholder="Filtrer les sections..."]');
    expect(searchInput).not.toBeNull();
    act(() => { if (searchInput) setInputValue(searchInput, "Savoir"); });
    expect(container.textContent).toContain("Notre Savoir-Faire");
    expect(container.textContent).not.toContain("Bannière Hero");
    expect(container.textContent).toContain("Activer le pied de page");
    unmount();
  });

  it("wires CatalogInspectorPanel Design page tab properly into CollectionPageCustomizer config & preview", async () => {
    const onSaveConfig = vi.fn().mockResolvedValue(undefined);
    const navEvents: Array<string> = [];
    const handleNavigate = (event: Event) => {
      const detail = (event as CustomEvent<{ viewMode?: string }>).detail;
      if (detail?.viewMode) navEvents.push(detail.viewMode);
    };
    window.addEventListener("studio:navigate-page", handleNavigate);

    const storeConfig: SellerStoreConfig = {
      sellerId: "seller_1",
      shopName: "Atelier Casbah",
      shopSlug: "atelier-casbah",
      theme: { sector: "mode", primaryColor: "#111827", secondaryColor: "#374151", accentColor: "#D97706", fontFamily: "Inter" },
      seo: { metaTitle: "Atelier Casbah", metaDescription: "Haute couture" },
      collectionPageConfig: { headerStyle: "hero-image", columnsDesktop: 3, showCategoryPills: true, showSearch: true, showSortDropdown: true },
    };

    const { container, unmount } = mount(
      <MemoryRouter>
        <CatalogInspectorPanel products={[]} sections={[]} storeConfig={storeConfig} onUpdateSection={vi.fn()} onAddSection={vi.fn()} onSaveConfig={onSaveConfig} />
      </MemoryRouter>
    );

    const designPageTab = Array.from(container.querySelectorAll("button")).find((btn) => btn.textContent?.includes("Design page"));
    act(() => { designPageTab?.click(); });

    const twoColBtn = Array.from(container.querySelectorAll("button")).find((btn) => btn.textContent?.includes("2 colonnes"));
    act(() => { twoColBtn?.click(); });
    expect(onSaveConfig).toHaveBeenCalledWith({
      collectionPageConfig: expect.objectContaining({ columnsDesktop: 2, headerStyle: "hero-image" }),
    });

    const previewBtn = Array.from(container.querySelectorAll("button")).find((btn) => btn.textContent?.includes("Simuler"));
    act(() => { previewBtn?.click(); });
    expect(navEvents).toContain("collection");
    window.removeEventListener("studio:navigate-page", handleNavigate);
    unmount();
  });

  it("synchronizes Hero settings and styles bidirectionally without conflict and wires header quick-select in SectionTreePanel", async () => {
    const { syncHeroStylesFromSettingsPatch, syncHeroSettingsFromStylesPatch } = await import(
      "../pages/Seller/StoreBuilder/components/inspector/inspectorSectionLabels"
    );

    const stylePatchFromSettings = syncHeroStylesFromSettingsPatch({}, {
      ctaBgColor: "#E99856", ctaTextColor: "#111827", useCornerColors: true, cornerColorTl: "#FF0000", imageBrightness: 115,
    });
    expect(stylePatchFromSettings).toEqual(expect.objectContaining({
      buttonBgColor: "#E99856", buttonTextColor: "#111827", useCornerColors: true, cornerColorTl: "#FF0000", imageBrightness: 115,
    }));

    const settingsPatchFromStyles = syncHeroSettingsFromStylesPatch({}, {
      buttonBgColor: "#0F172A", buttonTextColor: "#FFFFFF", useCornerColors: true, cornerColorBr: "#10B981", shadow: "xl",
    });
    expect(settingsPatchFromStyles).toEqual(expect.objectContaining({
      ctaBgColor: "#0F172A", ctaTextColor: "#FFFFFF", useCornerColors: true, cornerColorBr: "#10B981", bannerShadow: "xl",
    }));

    const onSelectNavMode = vi.fn();
    const { container, unmount } = mount(
      <SectionTreePanel
        sections={[{ id: "s1", type: "hero_banner", title: "Bannière Hero", settings: {}, styles: {}, isVisible: true, order: 0 }]}
        selectedSectionId="s1"
        onSelectSection={vi.fn()}
        onReorder={vi.fn()}
        onToggleVisibility={vi.fn()}
        onDeleteSection={vi.fn()}
        onAddSection={vi.fn()}
        onSelectNavMode={onSelectNavMode}
      />
    );

    const headerBtn = container.querySelector<HTMLButtonElement>('[data-testid="tree-header-quick-btn"]');
    expect(headerBtn).not.toBeNull();
    act(() => { headerBtn?.click(); });
    expect(onSelectNavMode).toHaveBeenCalledWith("header");
    unmount();
  });
});

