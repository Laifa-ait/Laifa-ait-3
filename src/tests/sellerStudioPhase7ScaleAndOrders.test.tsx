/**
 * @vitest-environment jsdom
 */
import React, { act } from "react";
import { describe, it, expect } from "vitest";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import type { firestore } from "firebase-admin";
import type { Product } from "../domains/product/product.types";
import type { CategoryItem, CustomPageSection, CustomPageTheme } from "../domains/seller/customPage.types";
import { querySellerProductsPaginated } from "../domains/seller/services/sellerCatalogQuery.service";
import { applyOrderSalesCountDelta, type ProductSalesUpdateTarget } from "../domains/order/services/orderSalesCount.service";
import { fetchSellerCatalogSafely } from "../pages/Seller/StoreBuilder/hooks/studioCatalogLoader";
import { StoreSectionRenderer } from "../components/Store/sections/StoreSectionRenderer";
import { StoreCollectionPageView } from "../components/Store/StoreCollectionPageView";
import { CategorySmartSyncBar } from "../pages/Seller/StoreBuilder/components/inspector/controls/CategorySmartSyncBar";
import { CatalogCategoriesSubPanel } from "../pages/Seller/StoreBuilder/components/context/CatalogCategoriesSubPanel";

const THEME: CustomPageTheme = {
  sector: "artisanat", primaryColor: "#023859", secondaryColor: "#18181B",
  accentColor: "#B45309", canvasColor: "#FAF6F0", surfaceColor: "#FFFFFF",
};

if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof globalThis.IntersectionObserver;
}

function makeProduct(overrides: Partial<Product> & { id: string; name: string }): Product {
  return {
    id: overrides.id, name: overrides.name, price: overrides.price ?? 4200, stock: overrides.stock ?? 5,
    category: overrides.category ?? "Artisanat & Tradition", image: overrides.image ?? "https://cdn.example.com/p.jpg",
    sellerId: "seller_scale", status: overrides.status ?? ("active" as Product["status"]),
    salesCount: overrides.salesCount ?? 0, rating: 0, ...overrides,
  };
}

function createMockFirestoreForPagination(docs: Array<{ id: string; data: Record<string, unknown> }>): firestore.Firestore {
  const buildQuery = (filters: { sellerId?: string; cursorId?: string | null; limitVal?: number }) => ({
    where: (field: string, _op: string, val: string) => buildQuery({ ...filters, sellerId: field === "sellerId" ? val : filters.sellerId }),
    orderBy: () => buildQuery(filters),
    startAfter: (cursorId: string) => buildQuery({ ...filters, cursorId }),
    limit: (limitVal: number) => buildQuery({ ...filters, limitVal }),
    async get() {
      const sorted = docs.filter((d) => !filters.sellerId || d.data.sellerId === filters.sellerId).sort((a, b) => a.id.localeCompare(b.id));
      const afterIdx = filters.cursorId ? sorted.findIndex((d) => d.id === filters.cursorId) + 1 : 0;
      const sliced = sorted.slice(afterIdx, afterIdx + (filters.limitVal ?? sorted.length));
      return { docs: sliced.map((entry) => ({ id: entry.id, data: () => entry.data })) };
    },
  });
  return { collection: () => buildQuery({}) } as unknown as firestore.Firestore;
}

function renderInDom(ui: React.ReactElement): { container: HTMLDivElement; unmount: () => void } {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => { root.render(<MemoryRouter>{ui}</MemoryRouter>); });
  return { container, unmount: () => { act(() => root.unmount()); container.remove(); } };
}

describe("Phase 7 — Scalabilité (300–500 Produits), Synchro Catégories, Honnêteté Ventes & Cycle salesCount", () => {
  it("pagine fidèlement 300 et 500 produits côté serveur (cursor Firestore) et côté Studio sans omission ni doublon", async () => {
    const dataset500 = Array.from({ length: 500 }, (_, i) => {
      const padded = String(i + 1).padStart(4, "0");
      return {
        id: `prod_${padded}`,
        data: {
          sellerId: "seller_scale",
          name: `Création ${padded}`,
          category: i % 2 === 0 ? "Tapis" : "Poterie",
          price: 2500 + i,
          stock: 4,
          status: "active",
          ...(i % 5 === 0 ? {} : { createdAt: new Date(1750000000000 + i * 60000).toISOString() }),
        },
      };
    });
    const mockDb = createMockFirestoreForPagination(dataset500);

    const loadAllViaEndpointLogic = async (totalTarget: number, limitPerPage: number) => {
      const subsetDb = createMockFirestoreForPagination(dataset500.slice(0, totalTarget));
      return fetchSellerCatalogSafely({
        limitPerPage,
        fetchPage: async (url) => {
          const parsed = new URL(`http://localhost${url}`);
          const res = await querySellerProductsPaginated({
            sellerId: "seller_scale",
            limit: Number(parsed.searchParams.get("limit") || limitPerPage),
            cursor: parsed.searchParams.get("cursor") || undefined,
            firestoreDb: subsetDb,
            documentIdField: "__name__",
          });
          return { success: true, products: res.products as unknown as Product[], nextCursor: res.nextCursor, hasMore: res.hasMore };
        },
      });
    };

    const res300 = await loadAllViaEndpointLogic(300, 100);
    expect(res300.ok).toBe(true);
    expect(res300.pagesLoaded).toBe(3);
    expect(res300.products).toHaveLength(300);

    const res500 = await loadAllViaEndpointLogic(500, 100);
    expect(res500.ok).toBe(true);
    expect(res500.pagesLoaded).toBe(5);
    expect(new Set(res500.products.map((p) => p.id)).size).toBe(500);
    // Vérifie qu'un produit sans createdAt est bien inclus dans la pagination serveur
    expect(res500.products.some((p) => p.id === "prod_0001")).toBe(true);
    expect(mockDb).toBeDefined();

    // Vitrine publique affiche 48 cartes au premier lot sur 300 produits et charge la suite via pagination
    const colView = renderInDom(
      <StoreCollectionPageView
        activeCategory={null}
        allCategories={[]}
        products={res300.products}
        theme={THEME}
        onSelectCategory={() => {}}
        onBackToHome={() => {}}
      />
    );
    expect(colView.container.querySelectorAll('[data-testid="section-product-card"]')).toHaveLength(48);
    colView.unmount();
  });

  it("préserve les catégories personnalisées lors de la synchro et protège le bouton Générer contre l'écrasement", () => {
    const existingCats: CategoryItem[] = [
      { id: "c_ramadan", name: "Collection Ramadan", slug: "collection-ramadan" },
      { id: "c_promos", name: "Promotions", slug: "promotions" },
      { id: "c_tapis", name: "Tapis", slug: "tapis" },
    ];
    const catalog: Product[] = Array.from({ length: 6 }, (_, i) =>
      makeProduct({ id: `t_${i}`, name: `Tapis ${i}`, category: "Tapis" })
    ).concat([makeProduct({ id: "c_new", name: "Théière Cuivre", category: "Dinanderie" })]);

    let syncedResult: CategoryItem[] = [];
    const syncView = renderInDom(
      <CategorySmartSyncBar categories={existingCats} products={catalog} onSyncCategories={(next) => { syncedResult = next; }} />
    );

    act(() => { (syncView.container.querySelector('[data-testid="category-sync-trigger-btn"]') as HTMLButtonElement).click(); });
    expect(syncView.container.querySelector('[data-testid="category-sync-confirm-bar"]')?.textContent).toContain("Collection Ramadan");
    expect(syncView.container.querySelector('[data-testid="category-sync-confirm-bar"]')?.textContent).toContain("Promotions");

    // Suppression explicite d'une seule catégorie personnalisée ("Promotions"), conservation de "Collection Ramadan"
    act(() => { (syncView.container.querySelector('[data-testid="sync-remove-cat-c_promos"]') as HTMLInputElement).click(); });
    act(() => { (syncView.container.querySelector('[data-testid="category-sync-confirm-btn"]') as HTMLButtonElement).click(); });

    const syncedNames = syncedResult.map((c) => c.name);
    expect(syncedNames).toContain("Collection Ramadan");
    expect(syncedNames).toContain("Dinanderie");
    expect(syncedNames).toContain("Tapis");
    expect(syncedNames).not.toContain("Promotions");
    syncView.unmount();

    // Protection du bouton "Générer" dans CatalogCategoriesSubPanel (Fusion vs Remplacement)
    let panelUpdated: CategoryItem[] = [];
    const catSec: CustomPageSection<"featured_categories"> = {
      id: "sec_cat", type: "featured_categories", title: "Rayons", isVisible: true, order: 0,
      settings: { categories: existingCats },
    };
    const panelView = renderInDom(
      <CatalogCategoriesSubPanel
        categoriesSection={catSec}
        products={catalog}
        activeSector="artisanat"
        onUpdateSection={(_id, patch) => {
          panelUpdated = ((patch.settings as { categories?: CategoryItem[] })?.categories) || [];
        }}
        onAddSection={() => {}}
      />
    );
    act(() => { (panelView.container.querySelector('[data-testid="inject-sector-categories-btn"]') as HTMLButtonElement).click(); });
    expect(panelView.container.querySelector('[data-testid="preset-categories-confirm-bar"]')).not.toBeNull();
    act(() => { (panelView.container.querySelector('[data-testid="preset-categories-merge-btn"]') as HTMLButtonElement).click(); });
    expect(panelUpdated.some((c) => c.name === "Collection Ramadan")).toBe(true);
    expect(panelUpdated.length).toBeGreaterThan(existingCats.length);
    panelView.unmount();
  });

  it("empêche les allégations best_sellers sans ventes en public, gère suspension/réactivation et valide salesCount sur commande livrée/retournée", () => {
    const productsNoSales = [
      makeProduct({ id: "p_a", name: "Collier Argent", salesCount: 0, status: "active" as Product["status"] }),
      makeProduct({ id: "p_susp", name: "Bague Suspendue", salesCount: 15, status: "suspended" as Product["status"] }),
    ];
    const bestAutoSec: CustomPageSection<"best_sellers"> = {
      id: "sec_best_auto", type: "best_sellers", title: "Top Ventes", isVisible: true, order: 0,
      settings: { selectionMode: "auto", maxItems: 4 },
    };

    const publicView = renderInDom(<StoreSectionRenderer section={bestAutoSec} theme={THEME} products={[productsNoSales[0]]} />);
    expect(publicView.container.textContent).not.toContain("MEILLEURES VENTES");
    expect(publicView.container.textContent).toContain("SÉLECTION DE LA BOUTIQUE");
    expect(publicView.container.querySelector('[data-testid="best-sellers-public-no-sales-state"]')).not.toBeNull();
    publicView.unmount();

    // Réactivation produit suspendu -> réapparaît immédiatement avec ses ventes réelles
    const reactivated = [{ ...productsNoSales[1], status: "active" as Product["status"] }];
    const publicActiveView = renderInDom(<StoreSectionRenderer section={bestAutoSec} theme={THEME} products={reactivated} />);
    expect(publicActiveView.container.textContent).toContain("MEILLEURES VENTES");
    expect(publicActiveView.container.textContent).toContain("Bague Suspendue");
    publicActiveView.unmount();

    // Cycle réel salesCount : livraison incrémente, répétition idempotente, retour décrémente proprement (>= 0)
    const txProducts = new Map<string, ProductSalesUpdateTarget>([
      ["p_a", { salesCount: 0 }],
    ]);
    const onDeliver = applyOrderSalesCountDelta({
      targetStatus: "delivered",
      currentStatus: "in_transit",
      salesCountRecorded: false,
      items: [{ id: "p_a", quantity: 3 }],
      productUpdates: txProducts,
    });
    expect(onDeliver).toEqual({ nextSalesCountRecorded: true, changed: true });
    expect(txProducts.get("p_a")?.salesCount).toBe(3);

    const onDuplicateDeliver = applyOrderSalesCountDelta({
      targetStatus: "delivered",
      currentStatus: "delivered",
      salesCountRecorded: true,
      items: [{ id: "p_a", quantity: 3 }],
      productUpdates: txProducts,
    });
    expect(onDuplicateDeliver.changed).toBe(false);
    expect(txProducts.get("p_a")?.salesCount).toBe(3);

    const onReturn = applyOrderSalesCountDelta({
      targetStatus: "returned",
      currentStatus: "delivered",
      salesCountRecorded: true,
      items: [{ id: "p_a", quantity: 3 }],
      productUpdates: txProducts,
    });
    expect(onReturn).toEqual({ nextSalesCountRecorded: false, changed: true });
    expect(txProducts.get("p_a")?.salesCount).toBe(0);
  });
});
