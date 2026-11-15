/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, it, expect } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { MemoryRouter } from "react-router-dom";
import type { Product } from "../domains/product/product.types";
import type { CustomPageSection, CustomPageTheme } from "../domains/seller/customPage.types";
import {
  classifyCatalogProductStatus,
  doesProductMatchCategoryFilter,
  parseProductTimestampMs,
  resolveCategoryAssignedProducts,
  resolveProductFeedItems,
  serializeTimestampIso,
} from "../domains/seller/studioCatalogResolver";
import { buildPublicStorefrontProductDTO } from "../domains/seller/shopPublic.projection";
import { StoreSectionRenderer } from "../components/Store/sections/StoreSectionRenderer";
import { StoreCollectionPageView } from "../components/Store/StoreCollectionPageView";
import { ProductPickerSubTab } from "../pages/Seller/StoreBuilder/components/inspector/content/ProductPickerSubTab";
import { CatalogProductsSubPanel } from "../pages/Seller/StoreBuilder/components/context/CatalogProductsSubPanel";
import { CategoryProductAssigner } from "../pages/Seller/StoreBuilder/components/inspector/category/CategoryProductAssigner";
import { syncCategoriesFromProducts } from "../pages/Seller/StoreBuilder/components/inspector/controls/CategorySmartSyncBar";
import { buildStoreQualityReport } from "../pages/Seller/StoreBuilder/utils/storeQualityAuditor";

if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof globalThis.IntersectionObserver;
}

const THEME: CustomPageTheme = {
  sector: "mode", primaryColor: "#023859", secondaryColor: "#18181B",
  accentColor: "#B45309", canvasColor: "#FAF6F0", surfaceColor: "#FFFFFF",
};

function makeProduct(overrides: Partial<Product> & { id: string; name: string }): Product {
  return {
    id: overrides.id,
    name: overrides.name,
    price: overrides.price ?? 3500,
    stock: overrides.stock ?? 5,
    category: overrides.category ?? "Mode",
    image: overrides.image ?? "https://cdn.example.com/item.jpg",
    sellerId: "seller_p7",
    status: overrides.status ?? ("active" as Product["status"]),
    createdAt: overrides.createdAt,
    salesCount: overrides.salesCount ?? 0,
    rating: overrides.rating ?? 0,
    ...overrides,
  };
}

function renderInDom(ui: React.ReactElement): { container: HTMLDivElement; unmount: () => void } {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => { root.render(<MemoryRouter>{ui}</MemoryRouter>); });
  return { container, unmount: () => { act(() => root.unmount()); container.remove(); } };
}

describe("Phase 7 — Catalogue, Catégories & Contenus Dynamiques", () => {
  it("classifie exactement le cycle de vie Product (actifs, inactifs, supprimés, rupture) sans statuts inventés", () => {
    expect(classifyCatalogProductStatus({ status: "active", stock: 3 }).lifecycle).toBe("active");
    expect(classifyCatalogProductStatus({ status: "approved", stock: 0 }).label).toBe("Rupture");
    expect(classifyCatalogProductStatus({ status: "published", stock: 2 }).isPubliclyVisible).toBe(true);
    expect(classifyCatalogProductStatus({ status: "suspended" }).lifecycle).toBe("inactive");
    expect(classifyCatalogProductStatus({ status: "draft" }).label).toBe("Brouillon");
    expect(classifyCatalogProductStatus({ status: "archived" }).isPubliclyVisible).toBe(false);
    expect(classifyCatalogProductStatus({ status: "pending_deletion" }).lifecycle).toBe("deleted");
    expect(classifyCatalogProductStatus({ status: "active", deletedAt: "2026-01-01T00:00:00Z" }).lifecycle).toBe("deleted");
  });

  it("préserve createdAt Firestore Admin (_seconds) jusqu'à la projection boutique publique et trie new_arrivals / best_sellers sans note factice", () => {
    const rawTs = { _seconds: 1775000000, _nanoseconds: 0 };
    expect(parseProductTimestampMs(rawTs)).toBe(1775000000 * 1000);
    const iso = serializeTimestampIso(rawTs);
    const dtoOlder = buildPublicStorefrontProductDTO("p_old", {
      name: "Vestige Cuir", price: 6500, category: "Mode", rating: 0, salesCount: 0,
    }, "seller_1", [], "", "2026-01-01T00:00:00.000Z") as unknown as Product;
    const dtoNewer = buildPublicStorefrontProductDTO("p_new", {
      name: "Veste Kabyle", price: 9500, category: "Mode & Élégance", rating: 0, salesCount: 0,
    }, "seller_1", [], "", iso) as unknown as Product;

    const newFeed: CustomPageSection<"new_arrivals"> = {
      id: "sec_new", type: "new_arrivals", title: "Nouveautés", isVisible: true, order: 0,
      settings: { selectionMode: "auto", maxItems: 4 },
    };
    const bestNoSalesFeed: CustomPageSection<"best_sellers"> = {
      id: "sec_best", type: "best_sellers", title: "Meilleures Ventes", isVisible: true, order: 1,
      settings: { selectionMode: "auto", maxItems: 4 },
    };

    const { container, unmount } = renderInDom(
      <div>
        <div id="new-zone"><StoreSectionRenderer section={newFeed} theme={THEME} products={[dtoOlder, dtoNewer]} /></div>
        <div id="best-zone"><StoreSectionRenderer section={bestNoSalesFeed} theme={THEME} products={[dtoOlder, dtoNewer]} isEditable /></div>
      </div>
    );

    const newHtml = container.querySelector("#new-zone")?.textContent || "";
    expect(newHtml.indexOf("Veste Kabyle")).toBeLessThan(newHtml.indexOf("Vestige Cuir"));
    expect(container.querySelector("#best-zone [data-testid='best-sellers-no-sales-notice']")).not.toBeNull();
    // Aucune fausse note 5/5 inventée quand rating === 0 et 0 avis
    expect(container.querySelector("#new-zone")?.textContent).not.toContain("5.0");
    unmount();
  });

  it("différencie sélection manuelle vs règle dynamique et filtre canoniquement les alias de catégories", () => {
    const items: Product[] = [
      makeProduct({ id: "a1", name: "Robe Chaoui", category: "Mode & Élégance", status: "active" as Product["status"] }),
      makeProduct({ id: "a2", name: "Sac Brodé", category: "Vêtements", status: "published" as Product["status"] }),
      makeProduct({ id: "i1", name: "Manteau Suspendu", category: "Mode", status: "suspended" as Product["status"] }),
      makeProduct({ id: "d1", name: "Écharpe Supprimée", category: "Mode", deletedAt: "2026-02-01" }),
    ];

    expect(doesProductMatchCategoryFilter(items[0], "mode")).toBe(true);
    expect(doesProductMatchCategoryFilter(items[1], "Mode & Vêtements")).toBe(true);

    const autoRes = resolveProductFeedItems("product_grid", {
      selectionMode: "auto", filterCategoryId: "mode", productIds: ["a1"], maxItems: 8,
    }, items);
    expect(autoRes.effectiveMode).toBe("auto");
    expect(autoRes.items.map((p) => p.id)).toEqual(["a1", "a2"]);

    const manualRes = resolveProductFeedItems("featured_products", {
      selectionMode: "manual", productIds: ["i1", "d1", "a2", "missing_99"],
    }, items);
    expect(manualRes.effectiveMode).toBe("manual");
    expect(manualRes.items.map((p) => p.id)).toEqual(["a2"]);
    expect(manualRes.inactiveProductIds).toEqual(["i1"]);
    expect(manualRes.missingProductIds).toEqual(["d1", "missing_99"]);

    const syncedCats = syncCategoriesFromProducts(items, []);
    expect(syncedCats).toHaveLength(2);
    expect(resolveCategoryAssignedProducts({ id: "c1", name: "Mode", selectionMode: "auto", productIds: ["i1"] }, items).items).toHaveLength(2);
  });

  it("détecte et nettoie les références obsolètes dans ProductPickerSubTab et CategoryProductAssigner", () => {
    const catalog: Product[] = [
      makeProduct({ id: "valid_1", name: "Coffret Ambre", category: "Parfums" }),
      makeProduct({ id: "draft_2", name: "Brume Brouillon", category: "Parfums", status: "draft" as Product["status"] }),
    ];
    let updatedField: Record<string, unknown> = {};
    const { container, unmount } = renderInDom(
      <div>
        <ProductPickerSubTab
          sectionType="product_grid"
          settings={{ selectionMode: "auto", filterCategoryId: "Catégorie Disparue", productIds: ["valid_1", "draft_2", "ghost_9"] }}
          products={catalog}
          onSettingsChange={(f, v) => { updatedField = { ...updatedField, [f]: v }; }}
          inputClass="input" labelClass="label"
        />
        <CategoryProductAssigner
          cat={{ id: "c_p", name: "Parfums", slug: "parfums", selectionMode: "manual", productIds: ["valid_1", "ghost_9"] }}
          products={catalog}
          onUpdate={(patch) => { updatedField = { ...updatedField, ...patch }; }}
        />
      </div>
    );

    expect(container.querySelector('[data-testid="picker-obsolete-category-warning"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="product-picker-missing-ids-warning"]')).not.toBeNull();
    act(() => { (container.querySelector('[data-testid="product-picker-purge-missing-btn"]') as HTMLButtonElement).click(); });
    expect(updatedField.productIds).toEqual(["valid_1"]);

    act(() => { (container.querySelector('[data-testid="category-purge-stale-btn"]') as HTMLButtonElement).click(); });
    expect(updatedField.productIds).toEqual(["valid_1"]);
    unmount();
  });

  it("gère l'état vide, l'erreur réseau avec réessai et la pagination sur grand catalogue (300+ produits)", () => {
    let retried = false;
    const errView = renderInDom(
      <CatalogProductsSubPanel
        products={[]} catalogStatus="error" catalogError="Réseau indisponible"
        onReloadCatalog={() => { retried = true; }}
        productFeedSections={[]} selectedFeedId="" onSelectFeedId={() => {}}
        featuredProductIds={[]} onToggleFeaturedProduct={() => {}}
      />
    );
    expect(errView.container.querySelector('[data-testid="catalog-load-error"]')).not.toBeNull();
    act(() => { (errView.container.querySelector('[data-testid="catalog-load-retry-btn"]') as HTMLButtonElement).click(); });
    expect(retried).toBe(true);
    errView.unmount();

    const largeCatalog: Product[] = Array.from({ length: 160 }, (_, idx) =>
      makeProduct({
        id: `big_${idx}`, name: `Pièce ${idx}`, category: idx % 2 === 0 ? "Tapis" : "Bijoux",
        createdAt: new Date(1700000000000 + idx * 1000).toISOString(),
        price: 1000 + idx * 10,
      })
    );
    const colView = renderInDom(
      <StoreCollectionPageView
        activeCategory={null}
        allCategories={[{ id: "c_tapis", name: "Tapis", slug: "tapis", selectionMode: "auto", categoryFilter: "Tapis" }]}
        products={largeCatalog}
        theme={THEME}
        onSelectCategory={() => {}}
        onBackToHome={() => {}}
      />
    );
    // Pagination active à 48 cartes initiales sur 160 produits
    expect(colView.container.querySelectorAll('[data-testid="section-product-card"]')).toHaveLength(48);
    const qualityReport = buildStoreQualityReport({
      sections: [
        { id: "h", type: "hero_banner", title: "Hero", isVisible: true, order: 0, settings: { imageUrl: "https://cdn.example.com/h.jpg", ctaLink: "#cat" } },
        { id: "g", type: "product_grid", title: "Grille", isVisible: true, order: 1, settings: { selectionMode: "auto", filterCategoryId: "Inexistante" } },
      ],
      theme: THEME,
      products: largeCatalog,
      shopSlug: "maison-atlas",
    });
    const mobileCheck = qualityReport.checks.find((c) => c.id === "mobile");
    expect(mobileCheck?.status).toBe("warn");
    colView.unmount();
  });
});
