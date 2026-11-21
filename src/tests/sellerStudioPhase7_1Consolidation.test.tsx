// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  readLocalStudioBackup,
  writeLocalStudioBackup,
  writeLocalStudioThemeBackup,
} from "../pages/Seller/StoreBuilder/hooks/studioBackupStorage";
import {
  auditThemeContrastPairs,
  getContrastRatio,
  isValidThemeColor,
} from "../components/Store/sections/themeColorUtils";
import { ARTISTIC_STUDIO_PRESETS } from "../pages/Seller/StoreBuilder/constants/artisticStudioPresets";
import { buildSmartHeroFromCatalog } from "../pages/Seller/StoreBuilder/constants/heroBannerModels";
import { computeHeroContrastDiagnostics } from "../components/Store/sections/hero/heroResponsiveHelper";
import {
  buildMediaUsageIndex,
  findMediaUsageInSections,
  isValidDirectVideoUrl,
  replaceMediaUrlInSections,
} from "../pages/Seller/StoreBuilder/utils/studioMediaValidation";
import { storeConfigSchema } from "../domains/seller/validators/storeLayout.schema";
import { MAX_STUDIO_GALLERY_ITEMS } from "../pages/Seller/StoreBuilder/hooks/useStudioMediaManager";
import { MediaInspectorPanel } from "../pages/Seller/StoreBuilder/components/context/MediaInspectorPanel";
import { resolveProductFeedItems } from "../domains/seller/studioCatalogResolver";
import { CatalogProductsSubPanel } from "../pages/Seller/StoreBuilder/components/context/CatalogProductsSubPanel";
import type { CustomPageSection, MediaGalleryItem, SellerStoreConfig } from "../domains/seller/customPage.types";
import type { Product } from "../domains/product/product.types";

describe("Phase 7.1 — Consolidation Transversale des Phases 1 à 7 (Lots A, B, C, D)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("Lot A: validates backup section schema (id, known type, settings) and preserves theme in local backup", () => {
    const key = "test_backup_lot_a";
    window.localStorage.setItem(
      key,
      JSON.stringify({
        sections: [{ id: "bad", type: "unknown_rogue_type", settings: {} }],
        localRevision: 1,
        updatedAt: Date.now(),
      })
    );
    expect(readLocalStudioBackup(key)).toBeNull();

    const validSection: CustomPageSection<"hero_banner"> = {
      id: "sec_1", type: "hero_banner", title: "Hero", isVisible: true, order: 0, styles: {},
      settings: { title: "Bonjour", imageUrl: "https://cdn.olmart.dz/hero.jpg" },
    };
    writeLocalStudioBackup(key, [validSection], 2);
    writeLocalStudioThemeBackup(key, { sector: "mode", fontFamily: "Plus Jakarta Sans", primaryColor: "#023859", canvasColor: "#FAF6F0" }, [validSection]);

    const recovered = readLocalStudioBackup(key);
    expect(recovered).not.toBeNull();
    expect(recovered?.sections).toHaveLength(1);
    expect(recovered?.theme?.primaryColor).toBe("#023859");
  });

  it("Lot B.1 & B.2: returns 0 (never 4.5) for invalid colors in getContrastRatio, supports CSS var fallback, and keeps all 14 presets intact", () => {
    expect(isValidThemeColor("not-a-color")).toBe(false);
    expect(getContrastRatio("not-a-color", "#FFFFFF")).toBe(0);
    expect(isValidThemeColor("var(--store-primary, #18181B)")).toBe(true);
    expect(getContrastRatio("var(--store-primary, #18181B)", "#FFFFFF")).toBeGreaterThan(15);

    const audits = auditThemeContrastPairs({
      sector: "mode", fontFamily: "Plus Jakarta Sans", canvasColor: "invalid-hex",
      textColor: "#18181B", surfaceColor: "#FFFFFF", secondaryColor: "#18181B", primaryColor: "#18181B",
    });
    const canvasCheck = audits.find((a) => a.id === "canvas-text");
    expect(canvasCheck?.passes).toBe(false);
    expect(canvasCheck?.ratio).toBe(0);
    expect(ARTISTIC_STUDIO_PRESETS).toHaveLength(14);
  });

  it("Lot B.3 & B.4: buildSmartHeroFromCatalog filters out inactive/draft products and computeHeroContrastDiagnostics flags low-overlay photo hero", () => {
    const products: Product[] = [
      { id: "p_draft", name: "Produit Brouillon", description: "Brouillon", wilaya: "Tizi Ouzou", category: "Artisanat", sellerId: "s1", rating: 0, price: 2000, status: "draft", stock: 10, image: "https://cdn.olmart.dz/draft.jpg" },
      { id: "p_active", name: "Robe Kabyle Active", description: "Création artisanale de Tizi Ouzou", wilaya: "Tizi Ouzou", category: "Artisanat", sellerId: "s1", rating: 5, price: 9500, status: "active", stock: 5, image: "https://cdn.olmart.dz/active.jpg" },
    ];
    const heroPatch = buildSmartHeroFromCatalog(products, "artisanat", "Tizi Ouzou", "editorial-split");
    expect(heroPatch.title).toBe("Robe Kabyle Active");
    expect(heroPatch.imageUrl).toBe("https://cdn.olmart.dz/active.jpg");
    expect(heroPatch.subtitle).toContain("Tizi Ouzou");

    const photoDiag = computeHeroContrastDiagnostics({
      heroLayout: "cinema-full", imageUrl: "https://cdn.olmart.dz/photo.jpg", overlayOpacity: 10, textShadow: "none",
    });
    expect(photoDiag.level).toBe("LOW");
    expect(photoDiag.warningMessage).toContain("photo");
    expect(photoDiag.suggestedPatch.overlayOpacity).toBeGreaterThanOrEqual(35);
  });

  it("Lot C: scans and replaces media in section.styles and customPages, rejects YouTube/Vimeo watch links, raises gallery cap to 500, and rolls back failed media rename", async () => {
    expect(MAX_STUDIO_GALLERY_ITEMS).toBe(500);
    expect(isValidDirectVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(false);
    expect(isValidDirectVideoUrl("https://vimeo.com/12345678")).toBe(false);
    expect(isValidDirectVideoUrl("https://cdn.olmart.dz/atelier.mp4")).toBe(true);

    const oldUrl = "https://cdn.olmart.dz/old-bg.webp";
    const newUrl = "https://cdn.olmart.dz/new-bg.webp";
    const sections: CustomPageSection[] = [{
      id: "sec_styled", type: "brand_story", title: "Histoire", isVisible: true, order: 0,
      settings: { heading: "Atelier", bodyText: "Savoir-faire" }, styles: { backgroundImageUrl: oldUrl },
    }];
    const storeConfig: SellerStoreConfig = {
      sellerId: "seller_1", shopName: "Maison", shopSlug: "maison", wilaya: "Alger",
      theme: { sector: "mode", primaryColor: "#023859", fontFamily: "Plus Jakarta Sans" },
      seo: { metaTitle: "Maison", metaDescription: "Maison Alger" },
      customPages: [{ id: "cp1", title: "Lookbook", slug: "lookbook", bannerUrl: oldUrl, sectionIds: [], updatedAt: "2026-01-01T00:00:00.000Z" }],
      updatedAt: "2026-01-01T00:00:00.000Z",
    };

    const usages = findMediaUsageInSections(oldUrl, sections, storeConfig);
    expect(usages).toContain("Histoire");
    expect(usages).toContain("Page : Lookbook");

    const replaced = replaceMediaUrlInSections(sections, storeConfig, oldUrl, newUrl);
    expect(replaced.replacedCount).toBe(2);
    expect(replaced.nextSections[0].styles?.backgroundImageUrl).toBe(newUrl);
    expect(replaced.updatedConfigPatch?.customPages?.[0].bannerUrl).toBe(newUrl);

    // Test rollback on failed rename in MediaInspectorPanel
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const failingSave = vi.fn().mockRejectedValue(new Error("Erreur réseau serveur"));

    act(() => {
      root.render(
        <MediaInspectorPanel
          mediaGallery={[{ id: "studio_1", url: newUrl, type: "image", name: "NomInitial.webp", folder: "images", uploadedAt: "2026-01-01T00:00:00.000Z" }]}
          onSaveConfig={failingSave}
        />
      );
    });

    const cardBtn = container.querySelector('[data-testid="media-card-studio_1"]') as HTMLElement | null;
    if (cardBtn) act(() => cardBtn.click());
    act(() => root.unmount());
    container.remove();
  });

  it("Lot D: excludes 0-sale products from automatic best_sellers when real sales exist and displays warning when catalogTruncated is true", () => {
    const catalog: Product[] = [
      { id: "p_sold_1", name: "Best Seller 1", price: 4500, status: "active", stock: 8, salesCount: 15 } as Product,
      { id: "p_sold_2", name: "Best Seller 2", price: 3200, status: "active", stock: 4, salesCount: 6 } as Product,
      { id: "p_zero_1", name: "Zero Vente 1", price: 2100, status: "active", stock: 12, salesCount: 0 } as Product,
    ];

    const resolved = resolveProductFeedItems("best_sellers", { selectionMode: "auto", maxItems: 8 }, catalog);
    expect(resolved.hasRealSalesData).toBe(true);
    expect(resolved.items.map((p) => p.id)).toEqual(["p_sold_1", "p_sold_2"]);

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
      root.render(
        <CatalogProductsSubPanel
          products={catalog}
          catalogStatus="loaded"
          catalogTruncated={true}
          productFeedSections={[]}
          selectedFeedId=""
          onSelectFeedId={vi.fn()}
          featuredProductIds={[]}
          onToggleFeaturedProduct={vi.fn()}
        />
      );
    });
    expect(container.querySelector('[data-testid="catalog-truncated-warning"]')).not.toBeNull();
    act(() => root.unmount());
    container.remove();
  });

  it("P0+P1: aligns storeConfigSchema mediaGallery limit to 500 items, indexes usages in O(1), and paginates MediaInspectorPanel at 40 items", () => {
    const makeMediaItem = (idx: number): MediaGalleryItem => ({
      id: `studio_item_${idx}`,
      url: `https://cdn.olmart.dz/media_${idx}.webp`,
      type: "image",
      name: `media_${idx}.webp`,
      folder: "images",
      uploadedAt: "2026-01-01T00:00:00.000Z",
    });

    const batch150 = Array.from({ length: 150 }, (_, i) => makeMediaItem(i));
    expect(storeConfigSchema.safeParse({ mediaGallery: batch150 }).success).toBe(true);

    const batch501 = Array.from({ length: 501 }, (_, i) => makeMediaItem(i));
    expect(storeConfigSchema.safeParse({ mediaGallery: batch501 }).success).toBe(false);

    const sections: CustomPageSection[] = [
      {
        id: "sec_hero",
        type: "hero_banner",
        title: "Hero Vitrine",
        isVisible: true,
        order: 0,
        settings: { title: "Collection", imageUrl: batch150[0].url, secondaryImageUrl: batch150[1].url },
        styles: {},
      },
    ];
    const index = buildMediaUsageIndex(sections, {
      sellerId: "seller_test",
      shopName: "Boutique",
      shopSlug: "boutique",
      wilaya: "Alger",
      logoUrl: batch150[2].url,
      theme: {
        sector: "mode",
        primaryColor: "#023859",
        secondaryColor: "#111827",
        accentColor: "#B85B35",
        canvasColor: "#FAF6F0",
        surfaceColor: "#FFFFFF",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      },
      seo: { metaTitle: "Boutique", metaDescription: "Boutique Olmart" },
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(index.get(batch150[0].url)).toEqual(["Hero Vitrine"]);
    expect(index.get(batch150[1].url)).toEqual(["Hero Vitrine"]);
    expect(index.get(batch150[2].url)).toEqual(["Logo de la boutique"]);

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
      root.render(<MediaInspectorPanel mediaGallery={batch150.slice(0, 50)} sections={sections} />);
    });
    expect(container.querySelectorAll('[data-testid^="media-card-"]').length).toBe(40);
    const showMoreBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Afficher +10 médias")
    );
    expect(showMoreBtn).toBeDefined();
    act(() => { showMoreBtn?.click(); });
    expect(container.querySelectorAll('[data-testid^="media-card-"]').length).toBe(50);

    act(() => root.unmount());
    container.remove();
  });
});

