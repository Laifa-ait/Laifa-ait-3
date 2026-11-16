/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { MemoryRouter } from "react-router-dom";
import type { CustomPageSection, CustomPageSectionType, CustomPageTheme } from "../domains/seller/customPage.types";
import type { Product } from "../domains/product/product.types";
import { SECTION_CATALOG } from "../pages/Seller/StoreBuilder/constants/sectionCatalog";
import { SECTION_TYPE_LABELS } from "../pages/Seller/StoreBuilder/components/inspector/inspectorSectionLabels";
import {
  createNewStudioSection, createDuplicatedStudioSection, buildSectionMutationHandlers, getSectionCompletenessStatus,
} from "../pages/Seller/StoreBuilder/hooks/studioSectionMutations";
import { StoreSectionRenderer } from "../components/Store/sections/StoreSectionRenderer";
import { SectionInspectorPanel } from "../pages/Seller/StoreBuilder/components/inspector/SectionInspectorPanel";
import { SectionCard } from "../pages/Seller/StoreBuilder/components/studio/SectionCard";
import { CategorySmartSyncBar } from "../pages/Seller/StoreBuilder/components/inspector/controls/CategorySmartSyncBar";
import { useStudioStore } from "../pages/Seller/StoreBuilder/store/useStudioStore";

if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof globalThis.IntersectionObserver;
}

const ALL_16_TYPES: CustomPageSectionType[] = [
  "hero_banner", "promo_carousel", "kinetic_marquee",
  "featured_categories", "curated_collections", "new_arrivals",
  "featured_products", "best_sellers", "product_grid",
  "brand_story", "showcase_video",
  "verified_reviews", "delivery_info", "return_policy",
  "faq_accordion", "contact_footer",
];

const BASE_THEME: CustomPageTheme = {
  sector: "artisanat", primaryColor: "#B85B35", secondaryColor: "#1C2A39", accentColor: "#D4AF37",
  canvasColor: "#FAF6F0", surfaceColor: "#FFFFFF", fontFamily: "'Plus Jakarta Sans', sans-serif",
};

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "p_old_top", name: "Tapis Berbère Tradition", price: 18500, stock: 4, category: "Tapis",
    image: "https://images.unsplash.com/photo-1600166898405-da9535204843?w=500",
    sellerId: "s1", salesCount: 42, createdAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: "p_new_low", name: "Poterie de Kabylie", price: 4500, stock: 9, category: "Céramique",
    image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500",
    sellerId: "s1", salesCount: 3, createdAt: "2026-11-01T10:00:00.000Z",
  },
];

function renderInDom(ui: React.ReactElement): { container: HTMLDivElement; unmount: () => void } {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => { root.render(<MemoryRouter>{ui}</MemoryRouter>); });
  return { container, unmount: () => { act(() => root.unmount()); container.remove(); } };
}

describe("Phase 4 — Outils de Construction & Inspecteur des 16 Sections", () => {
  beforeEach(() => {
    useStudioStore.setState({
      selectedSectionId: "sec_1", selectedSubElement: null, activeInspectorTab: "content", studioExperienceMode: "expert",
    });
  });

  it("maintient une cohérence 16/16 entre le catalogue, les labels, le moteur de rendu et l'inspecteur", () => {
    expect(SECTION_CATALOG).toHaveLength(16);
    const catalogTypes = SECTION_CATALOG.map((item) => item.type);
    expect(new Set(catalogTypes).size).toBe(16);

    for (const type of ALL_16_TYPES) {
      expect(catalogTypes).toContain(type);
      expect(SECTION_TYPE_LABELS[type]).toBeTruthy();

      const catEntry = SECTION_CATALOG.find((c) => c.type === type)!;
      const sec = createNewStudioSection({
        type, defaultSettings: catEntry.defaultSettings, defaultTitle: catEntry.title,
        activeSector: "tech", storeWilaya: "Oran", products: SAMPLE_PRODUCTS, order: 0,
      });

      const { container, unmount } = renderInDom(
        <div>
          <StoreSectionRenderer section={sec} theme={BASE_THEME} products={SAMPLE_PRODUCTS} isEditable />
          <SectionInspectorPanel section={sec} sections={[sec]} products={SAMPLE_PRODUCTS} theme={BASE_THEME} onUpdateSection={() => {}} />
        </div>
      );
      expect(container.querySelector(`[data-section-type="${type}"]`)).not.toBeNull();
      unmount();
    }
  });

  it("gère l'ajout avec respect du secteur choisi, la duplication profonde, le verrouillage et le badge de section vide", () => {
    const added = createNewStudioSection({
      type: "hero_banner", defaultSettings: { _sector: "sport" }, activeSector: "mode", products: SAMPLE_PRODUCTS, order: 0,
    });
    expect(String((added.settings as Record<string, unknown>).badgeText)).toContain("SPORT");
    expect("_sector" in (added.settings as Record<string, unknown>)).toBe(false);

    const copy = createDuplicatedStudioSection(added);
    expect(copy.id).not.toBe(added.id);
    expect(copy.title).toContain("(Copie)");

    let state: CustomPageSection[] = [
      { ...added, id: "sec_locked", settings: { ...added.settings, isLocked: true } },
      { ...copy, id: "sec_unlocked" },
    ];
    const handlers = buildSectionMutationHandlers({
      sections: state, selectedSectionId: "sec_locked", setSelectedSectionId: () => {},
      pushState: (next) => { state = next; }, products: SAMPLE_PRODUCTS,
    });
    handlers.deleteSection("sec_locked");
    expect(state).toHaveLength(2);
    handlers.deleteSection("sec_unlocked");
    expect(state).toHaveLength(1);

    const emptyReviewsSec: CustomPageSection = {
      id: "sec_empty_rev", type: "verified_reviews", title: "Avis", isVisible: true, order: 0,
      settings: { title: "Avis", customReviews: [] },
    };
    expect(getSectionCompletenessStatus(emptyReviewsSec).isEmpty).toBe(true);
    const { container, unmount } = renderInDom(
      <SectionCard
        sec={emptyReviewsSec} idx={0} totalSections={1} isSelected={false}
        onSelectSection={() => {}} onReorder={() => {}} onToggleVisibility={() => {}} onRequestDelete={() => {}}
      />
    );
    expect(container.querySelector('[data-testid="section-empty-badge-sec_empty_rev"]')?.textContent).toContain("Aucun avis");
    unmount();
  });

  it("différencie new_arrivals (date) et best_sellers (ventes) et détecte les productIds supprimés", () => {
    const newArrivalsSec: CustomPageSection<"new_arrivals"> = {
      id: "sec_new", type: "new_arrivals", title: "Nouveautés", isVisible: true, order: 0, settings: { maxItems: 2 },
    };
    const bestSellersSec: CustomPageSection<"best_sellers"> = {
      id: "sec_best", type: "best_sellers", title: "Top Ventes", isVisible: true, order: 1, settings: { maxItems: 2 },
    };
    const brokenFeaturedSec: CustomPageSection<"featured_products"> = {
      id: "sec_broken", type: "featured_products", title: "Vedettes", isVisible: true, order: 2, settings: { productIds: ["deleted_id_999"] },
    };

    const { container, unmount } = renderInDom(
      <div>
        <div id="feed-new"><StoreSectionRenderer section={newArrivalsSec} theme={BASE_THEME} products={SAMPLE_PRODUCTS} /></div>
        <div id="feed-best"><StoreSectionRenderer section={bestSellersSec} theme={BASE_THEME} products={SAMPLE_PRODUCTS} /></div>
        <div id="feed-broken"><StoreSectionRenderer section={brokenFeaturedSec} theme={BASE_THEME} products={SAMPLE_PRODUCTS} isEditable /></div>
      </div>
    );

    const newText = container.querySelector("#feed-new")?.textContent || "";
    const bestText = container.querySelector("#feed-best")?.textContent || "";
    expect(newText.indexOf("Poterie de Kabylie")).toBeLessThan(newText.indexOf("Tapis Berbère Tradition"));
    expect(bestText.indexOf("Tapis Berbère Tradition")).toBeLessThan(bestText.indexOf("Poterie de Kabylie"));
    expect(container.querySelector('[data-testid="product-feed-missing-ids-notice"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="product-feed-empty-state"]')).not.toBeNull();
    unmount();
  });

  it("n'affiche aucun avis fictif dans verified_reviews et exige une confirmation avant d'écraser featured_categories", () => {
    const emptyReviews: CustomPageSection<"verified_reviews"> = {
      id: "sec_rev", type: "verified_reviews", title: "Avis", isVisible: true, order: 0,
      settings: { title: "Avis Clients", customReviews: [] },
    };
    let syncedCalled = false;
    const { container, unmount } = renderInDom(
      <div>
        <StoreSectionRenderer section={emptyReviews} theme={BASE_THEME} products={SAMPLE_PRODUCTS} />
        <CategorySmartSyncBar
          categories={[{ id: "c1", name: "Rayon Manuel", slug: "rayon-manuel", imageUrl: "" }]}
          products={SAMPLE_PRODUCTS}
          onSyncCategories={() => { syncedCalled = true; }}
        />
      </div>
    );

    expect(container.querySelector('[data-testid="verified-reviews-empty-state"]')).not.toBeNull();
    expect(container.textContent).not.toContain("Amina K.");
    expect(container.textContent).not.toContain("Karim B.");

    const syncTrigger = container.querySelector('[data-testid="category-sync-trigger-btn"]') as HTMLButtonElement;
    act(() => { syncTrigger.click(); });
    expect(syncedCalled).toBe(false);
    expect(container.querySelector('[data-testid="category-sync-confirm-bar"]')).not.toBeNull();

    const confirmBtn = container.querySelector('[data-testid="category-sync-confirm-btn"]') as HTMLButtonElement;
    act(() => { confirmBtn.click(); });
    expect(syncedCalled).toBe(true);
    unmount();
  });

  it("filtre les contrôles non pertinents dans SectionLayoutTab et applique la politique Olmart (zéro contact externe sur contact_footer)", () => {
    useStudioStore.setState({ activeInspectorTab: "layout" });
    const marqueeSec: CustomPageSection<"kinetic_marquee"> = {
      id: "sec_mq", type: "kinetic_marquee", title: "Marquee", isVisible: true, order: 0, settings: { textFr: "" },
    };
    const footerSec: CustomPageSection<"contact_footer"> = {
      id: "sec_cf", type: "contact_footer", title: "Assistance", isVisible: true, order: 1,
      settings: { workingHours: "09h-18h", wilaya: "Alger", shopPhone: "+213550000000", shopEmail: "externe@test.dz" },
    };
    const { container, unmount } = renderInDom(
      <div>
        <StoreSectionRenderer section={marqueeSec} theme={BASE_THEME} products={SAMPLE_PRODUCTS} isEditable />
        <StoreSectionRenderer section={footerSec} theme={BASE_THEME} products={SAMPLE_PRODUCTS} isEditable />
        <SectionInspectorPanel section={marqueeSec} products={SAMPLE_PRODUCTS} theme={BASE_THEME} onUpdateSection={() => {}} />
      </div>
    );
    expect(container.querySelector('[data-testid="kinetic-marquee-empty-state"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="layout-columns-control"]')).toBeNull();
    expect(container.querySelector('[data-testid="layout-alignment-control"]')).toBeNull();
    expect(container.querySelector('[data-testid="contact-footer-internal-channel"]')).not.toBeNull();
    expect(container.textContent).not.toContain("+213550000000");
    expect(container.textContent).not.toContain("externe@test.dz");
    unmount();
  });
});
