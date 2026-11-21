/**
 * @vitest-environment jsdom
 */
import React, { act } from "react";
import { describe, it, expect } from "vitest";
import { createRoot } from "react-dom/client";
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
import { syncCategoriesFromProducts } from "../domains/seller/studioCategorySync";
import { buildPublicStorefrontProductDTO } from "../domains/seller/shopPublic.projection";
import { StoreSectionRenderer } from "../components/Store/sections/StoreSectionRenderer";
import { ProductPickerSubTab } from "../pages/Seller/StoreBuilder/components/inspector/content/ProductPickerSubTab";
import { CatalogProductsSubPanel } from "../pages/Seller/StoreBuilder/components/context/CatalogProductsSubPanel";
import { CategoryProductAssigner } from "../pages/Seller/StoreBuilder/components/inspector/category/CategoryProductAssigner";
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
  fontFamily: "Plus Jakarta Sans",
};

function makeProduct(overrides: Partial<Product> & { id: string; name: string }): Product {
  const { id, name, ...rest } = overrides;
  return {
    id,
    name,
    description: rest.description ?? "Description produit",
    wilaya: rest.wilaya ?? "Alger",
    price: rest.price ?? 3500,
    stock: rest.stock ?? 5,
    category: rest.category ?? "Mode",
    image: rest.image ?? "https://cdn.example.com/item.jpg",
    sellerId: "seller_p7",
    status: rest.status ?? ("active" as Product["status"]),
    createdAt: rest.createdAt,
    salesCount: rest.salesCount ?? 0,
    rating: rest.rating ?? 0,
    ...rest,
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
  it("classifie exactement le cycle de vie Product et exclut les produits sans createdAt de new_arrivals auto", () => {
    expect(classifyCatalogProductStatus({ status: "active", stock: 3 }).lifecycle).toBe("active");
    expect(classifyCatalogProductStatus({ status: "approved", stock: 0 }).label).toBe("Rupture");
    expect(classifyCatalogProductStatus({ status: "published", stock: 2 }).isPubliclyVisible).toBe(true);
    expect(classifyCatalogProductStatus({ status: "suspended" }).lifecycle).toBe("inactive");
    expect(classifyCatalogProductStatus({ status: "draft" }).label).toBe("Brouillon");
    expect(classifyCatalogProductStatus({ status: "archived" }).isPubliclyVisible).toBe(false);
    expect(classifyCatalogProductStatus({ status: "pending_deletion" }).lifecycle).toBe("deleted");
    expect(classifyCatalogProductStatus({ status: "active", deletedAt: "2026-01-01T00:00:00Z" }).lifecycle).toBe("deleted");

    const rawTs = { _seconds: 1775000000, _nanoseconds: 0 };
    expect(parseProductTimestampMs(rawTs)).toBe(1775000000 * 1000);
    const iso = serializeTimestampIso(rawTs);
    const dtoOlder = buildPublicStorefrontProductDTO("p_old", {
      name: "Vestige Cuir", price: 6500, category: "Mode", rating: 0, salesCount: 0,
    }, "seller_1", [], "", "2026-01-01T00:00:00.000Z") as unknown as Product;
    const dtoNewer = buildPublicStorefrontProductDTO("p_new", {
      name: "Veste Kabyle", price: 9500, category: "Mode & Élégance", subSubCategory: "Blazer kabyle", rating: 0, salesCount: 0,
    }, "seller_1", [], "", iso) as unknown as Product;
    expect(doesProductMatchCategoryFilter(dtoNewer, "Blazer kabyle")).toBe(true);
    const dtoUndated = buildPublicStorefrontProductDTO("p_nodate", {
      name: "Pièce Sans Date", price: 4500, category: "Mode", rating: 0, salesCount: 0,
    }, "seller_1", [], "") as unknown as Product;

    const newFeed: CustomPageSection<"new_arrivals"> = {
      id: "sec_new", type: "new_arrivals", title: "Nouveautés", isVisible: true, order: 0,
      styles: {},
      settings: { selectionMode: "auto", maxItems: 6 },
    };
    const { container, unmount } = renderInDom(
      <div id="new-zone">
        <StoreSectionRenderer section={newFeed} theme={THEME} products={[dtoOlder, dtoNewer, dtoUndated]} isEditable />
      </div>
    );
    const newHtml = container.querySelector("#new-zone")?.textContent || "";
    expect(newHtml.indexOf("Veste Kabyle")).toBeLessThan(newHtml.indexOf("Vestige Cuir"));
    expect(newHtml).not.toContain("Pièce Sans Date");
    expect(newHtml).not.toContain("5.0");
    expect(container.querySelector('[data-testid="new-arrivals-undated-warning"]')).not.toBeNull();
    unmount();

    // Si aucun produit n'est daté, un état vide honnête s'affiche (aucun remplissage par produit non daté)
    const emptyDated = resolveProductFeedItems("new_arrivals", { selectionMode: "auto", maxItems: 4 }, [dtoUndated]);
    expect(emptyDated.items).toHaveLength(0);
    expect(emptyDated.undatedProductIds).toEqual(["p_nodate"]);
  });

  it("unifie canoniquement les alias, supporte subSubCategory et supprime le faux badge Best-seller à 5 produits", () => {
    const items: Product[] = [
      makeProduct({ id: "a1", name: "Robe Chaoui", category: "Mode & Élégance", subSubCategory: "Soirée", status: "active" as Product["status"] }),
      makeProduct({ id: "a2", name: "Sac Brodé", category: "Vêtements", subsubcategory: "Cuir tressé", status: "published" as Product["status"] }),
      makeProduct({ id: "i1", name: "Manteau Suspendu", category: "Mode", status: "suspended" as Product["status"] }),
      makeProduct({ id: "d1", name: "Écharpe Supprimée", category: "Mode", deletedAt: "2026-02-01" }),
    ];

    expect(doesProductMatchCategoryFilter(items[0], "mode")).toBe(true);
    expect(doesProductMatchCategoryFilter(items[1], "Mode & Vêtements")).toBe(true);
    expect(doesProductMatchCategoryFilter(items[0], "soirée")).toBe(true);
    expect(doesProductMatchCategoryFilter(items[1], "cuir tressé")).toBe(true);

    // 6 produits actifs dans la même catégorie ne doivent JAMAIS recevoir "Best-seller" automatiquement
    const sixModeItems = Array.from({ length: 6 }, (_, i) =>
      makeProduct({ id: `m_${i}`, name: `Pièce ${i}`, category: i % 2 === 0 ? "Mode & Élégance" : "Vêtements", salesCount: 0 })
    );
    const syncedCanonical = syncCategoriesFromProducts(sixModeItems, []);
    expect(syncedCanonical).toHaveLength(1);
    expect(syncedCanonical[0].name).toBe("Mode");
    expect(syncedCanonical[0].itemCount).toBe(6);
    expect(syncedCanonical[0].badge).toBe("");

    const manualRes = resolveProductFeedItems("featured_products", {
      selectionMode: "manual", productIds: ["i1", "d1", "a2", "missing_99"],
    }, items);
    expect(manualRes.effectiveMode).toBe("manual");
    expect(manualRes.items.map((p) => p.id)).toEqual(["a2"]);
    expect(manualRes.inactiveProductIds).toEqual(["i1"]);
    expect(manualRes.missingProductIds).toEqual(["d1", "missing_99"]);
    expect(resolveCategoryAssignedProducts({ name: "Mode", selectionMode: "auto", productIds: ["i1"] }, items).items).toHaveLength(2);
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
          sectionType="new_arrivals"
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

    const undatedPickerView = renderInDom(
      <ProductPickerSubTab
        sectionType="new_arrivals"
        settings={{ selectionMode: "auto", filterCategoryId: "Parfums" }}
        products={catalog}
        onSettingsChange={() => {}}
        inputClass="input" labelClass="label"
      />
    );
    expect(undatedPickerView.container.querySelector('[data-testid="picker-undated-warning"]')).not.toBeNull();
    undatedPickerView.unmount();
  });

  it("gère l'erreur réseau avec bouton réessayer sans jamais afficher un faux catalogue vide", () => {
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
    expect(errView.container.querySelector('[data-testid="catalog-empty-state"]')).toBeNull();
    act(() => { (errView.container.querySelector('[data-testid="catalog-load-retry-btn"]') as HTMLButtonElement).click(); });
    expect(retried).toBe(true);
    errView.unmount();

    const emptyView = renderInDom(
      <CatalogProductsSubPanel
        products={[]} catalogStatus="loaded"
        productFeedSections={[]} selectedFeedId="" onSelectFeedId={() => {}}
        featuredProductIds={[]} onToggleFeaturedProduct={() => {}}
      />
    );
    expect(emptyView.container.querySelector('[data-testid="catalog-empty-state"]')).not.toBeNull();
    emptyView.unmount();

    const report = buildStoreQualityReport({
      sections: [
        { id: "h", type: "hero_banner", title: "Hero", isVisible: true, order: 0, styles: {}, settings: { title: "Hero", imageUrl: "https://cdn.example.com/h.jpg", ctaLink: "#cat" } },
        { id: "g", type: "product_grid", title: "Grille", isVisible: true, order: 1, styles: {}, settings: { selectionMode: "auto", filterCategoryId: "Inexistante" } },
      ],
      theme: THEME,
      products: [makeProduct({ id: "x1", name: "X1", category: "Bijoux", createdAt: "2026-01-01T00:00:00Z" })],
      shopSlug: "maison-atlas",
    });
    expect(report.checks.find((c) => c.id === "mobile")?.status).toBe("warn");
  });
});
