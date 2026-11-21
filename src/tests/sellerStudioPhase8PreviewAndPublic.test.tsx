// @vitest-environment jsdom
import React, { act } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRoot, Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { StoreSectionRenderer } from "../components/Store/sections/StoreSectionRenderer";
import { StudioPreview } from "../pages/Seller/StoreBuilder/components/studio/StudioPreview";
import { SECTION_CATALOG, SectionOption } from "../pages/Seller/StoreBuilder/constants/sectionCatalog";
import { CustomPageSection, CustomPageSectionType, CustomPageTheme, SellerStoreConfig } from "../domains/seller/customPage.types";
import { Product } from "../domains/product/product.types";
import { useStudioStore } from "../pages/Seller/StoreBuilder/store/useStudioStore";
import { KNOWN_STUDIO_SECTION_TYPES } from "../components/Store/sections/responsiveInheritanceHelper";

function createSectionFromDefinition(def: SectionOption, order = 0): CustomPageSection {
  return {
    id: `sec-${def.type}-${order}`, type: def.type, title: def.title, isVisible: true, order,
    settings: { ...def.defaultSettings } as CustomPageSection["settings"],
    styles: { containerWidth: "contained", paddingY: "md", borderRadius: "lg" },
  };
}

const BASE_THEME: CustomPageTheme = {
  sector: "artisanat",
  primaryColor: "#B45309", secondaryColor: "#18181B", accentColor: "#D97706",
  canvasColor: "#FAF6F0", surfaceColor: "#FFFFFF", fontFamily: "Plus Jakarta Sans",
  headingFontFamily: "Cormorant Garamond", bodyFontFamily: "Plus Jakarta Sans", buttonStyle: "pill",
};

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "prod-1", name: "Caftan Brodé Karakou d'Alger Edition Royale", price: 24500, promoPrice: 21000,
    category: "Tenues Traditionnelles", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b",
    images: ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b"],
    description: "Pièce artisanale", stock: 6, rating: 5, sellerId: "seller-1", sellerName: "Maison Casbah", wilaya: "Alger", status: "active",
    createdAt: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "prod-2", name: "Parure Argent Kabyle Ath Yenni", price: 18500, category: "Bijoux",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338",
    images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338"],
    description: "Argent massif", stock: 3, rating: 4.9, sellerId: "seller-1", sellerName: "Maison Casbah", wilaya: "Alger", status: "active",
    createdAt: "2026-03-05T10:00:00.000Z",
  },
];

describe("Phase 8 — Aperçu, Rendu Public et Responsive Final", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    window.innerWidth = 1280;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    useStudioStore.setState({
      selectedSectionId: null, selectedSubElement: null,
      isInteractiveMode: false, viewport: "desktop", zoom: 1,
    });
  });

  afterEach(async () => {
    await act(async () => { root.unmount(); });
    container.remove();
  });

  it("1. Vérifie que les 16 types de CustomPageSectionType se rendent sans divergence en mode Studio et Public sur Desktop, Tablet et Mobile", async () => {
    expect(SECTION_CATALOG).toHaveLength(16);
    expect(KNOWN_STUDIO_SECTION_TYPES.size).toBe(16);

    for (const def of SECTION_CATALOG) {
      const section = createSectionFromDefinition(def, 0);
      for (const vp of ["desktop", "tablet", "mobile"] as const) {
        await act(async () => {
          root.render(
            <MemoryRouter>
              <StoreSectionRenderer section={section} theme={BASE_THEME} products={SAMPLE_PRODUCTS} isEditable={true} previewViewport={vp} />
            </MemoryRouter>
          );
        });
        const studioRoot = container.querySelector(`[data-studio-section-id="${section.id}"]`);
        expect(studioRoot?.getAttribute("data-resolved-viewport")).toBe(vp);

        await act(async () => {
          root.render(
            <MemoryRouter>
              <StoreSectionRenderer section={section} theme={BASE_THEME} products={SAMPLE_PRODUCTS} isEditable={false} previewViewport={vp} />
            </MemoryRouter>
          );
        });
        const publicRoot = container.querySelector(`[data-studio-section-id="${section.id}"]`);
        expect(publicRoot?.getAttribute("data-resolved-viewport")).toBe(vp);
      }
    }
  });

  it("2. Détecte automatiquement le viewport public (mobile / tablet / desktop) via useStorefrontViewport quand previewViewport est omis", async () => {
    const heroDef = SECTION_CATALOG.find((d) => d.type === "hero_banner")!;
    const section = createSectionFromDefinition(heroDef, 0);
    window.innerWidth = 390;

    await act(async () => {
      root.render(
        <MemoryRouter>
          <StoreSectionRenderer section={section} theme={BASE_THEME} products={SAMPLE_PRODUCTS} isEditable={false} />
        </MemoryRouter>
      );
    });
    const node = container.querySelector(`[data-studio-section-id="${section.id}"]`);
    expect(node?.getAttribute("data-resolved-viewport")).toBe("mobile");
  });

  it("3. Gère les sections masquées par appareil : masquage complet en public vs badge en mode édition Studio", async () => {
    const def = SECTION_CATALOG.find((d) => d.type === "brand_story")!;
    const section: CustomPageSection = {
      ...createSectionFromDefinition(def, 0),
      settings: { ...def.defaultSettings, hideOnMobile: true } as CustomPageSection["settings"],
    };

    await act(async () => {
      root.render(
        <MemoryRouter>
          <StoreSectionRenderer section={section} theme={BASE_THEME} products={SAMPLE_PRODUCTS} isEditable={false} previewViewport="mobile" />
        </MemoryRouter>
      );
    });
    expect(container.querySelector(`[data-studio-section-id="${section.id}"]`)).toBeNull();

    await act(async () => {
      root.render(
        <MemoryRouter>
          <StoreSectionRenderer section={section} theme={BASE_THEME} products={SAMPLE_PRODUCTS} isEditable={true} previewViewport="mobile" />
        </MemoryRouter>
      );
    });
    expect(container.querySelector('[data-testid="section-hidden-badge"]')).not.toBeNull();
  });

  it("4. Adapte le nombre de colonnes des flux produits (featured_products) selon le viewport et protège les titres longs", async () => {
    const def = SECTION_CATALOG.find((d) => d.type === "featured_products")!;
    const longTitle = "Collection Prestige Extrêmement Longue Pour Vérifier Absence De Débordement Horizontal Sur Mobile";
    const section: CustomPageSection = {
      ...createSectionFromDefinition(def, 0), title: longTitle,
      settings: {
        ...def.defaultSettings, title: longTitle, selectionMode: "manual",
        productIds: ["prod-1", "prod-2"], columnsDesktop: 4, columnsTablet: 2, columnsMobile: 1,
      } as CustomPageSection["settings"],
    };

    for (const [vp, expectedCols] of [["desktop", "4"], ["tablet", "2"], ["mobile", "1"]] as const) {
      await act(async () => {
        root.render(
          <MemoryRouter>
            <StoreSectionRenderer section={section} theme={BASE_THEME} products={SAMPLE_PRODUCTS} isEditable={false} previewViewport={vp} />
          </MemoryRouter>
        );
      });
      const grid = container.querySelector('[data-testid="product-feed-grid"]');
      expect(grid?.getAttribute("data-feed-columns")).toBe(expectedCols);
    }
  });

  it("5. Isole un type de section inconnu sans crash : carte de diagnostic en Studio et null en boutique publique", async () => {
    const unknownSection: CustomPageSection = {
      id: "sec-unknown-1", type: "legacy_corrupted_widget" as CustomPageSectionType,
      title: "Widget Inconnu", isVisible: true, order: 0, styles: {}, settings: {} as CustomPageSection["settings"],
    };

    await act(async () => {
      root.render(<MemoryRouter><StoreSectionRenderer section={unknownSection} theme={BASE_THEME} isEditable={true} /></MemoryRouter>);
    });
    expect(container.querySelector('[data-testid="unknown-section-fallback"]')).not.toBeNull();

    await act(async () => {
      root.render(<MemoryRouter><StoreSectionRenderer section={unknownSection} theme={BASE_THEME} isEditable={false} /></MemoryRouter>);
    });
    expect(container.querySelector('[data-testid="unknown-section-fallback"]')).toBeNull();
    expect(container.querySelector('[data-studio-section-id="sec-unknown-1"]')).toBeNull();
  });

  it("6. Sécurise les CTA (#rayon: actif) et simule l'ajout au panier en mode Interactif sans sélectionner la section", async () => {
    const selectSpy = vi.fn();
    const navigateEvents: CustomEvent[] = [];
    const handler = (e: Event) => navigateEvents.push(e as CustomEvent);
    window.addEventListener("studio:navigate-page", handler);

    const storyDef = SECTION_CATALOG.find((d) => d.type === "brand_story")!;
    const storySection: CustomPageSection = {
      ...createSectionFromDefinition(storyDef, 0),
      settings: { ...storyDef.defaultSettings, ctaText: "Voir le rayon Bijoux", ctaLink: "#rayon:bijoux" } as CustomPageSection["settings"],
    };

    await act(async () => {
      root.render(
        <MemoryRouter>
          <StoreSectionRenderer section={storySection} theme={BASE_THEME} products={SAMPLE_PRODUCTS} isEditable={false} onSelectSection={selectSpy} />
        </MemoryRouter>
      );
    });

    const cta = container.querySelector('[data-testid="brand-story-cta"]') as HTMLElement;
    await act(async () => { cta.click(); });
    expect(selectSpy).not.toHaveBeenCalled();
    expect(navigateEvents[0]?.detail.viewMode).toBe("category");
    expect(navigateEvents[0]?.detail.categorySlug).toBe("bijoux");
    window.removeEventListener("studio:navigate-page", handler);

    useStudioStore.setState({ isInteractiveMode: true });
    const feedDef = SECTION_CATALOG.find((d) => d.type === "featured_products")!;
    const feedSection: CustomPageSection = {
      ...createSectionFromDefinition(feedDef, 0),
      settings: { ...feedDef.defaultSettings, selectionMode: "manual", productIds: ["prod-1"] } as CustomPageSection["settings"],
    };
    const storeConfig: SellerStoreConfig = {
      sellerId: "seller-1",
      shopName: "Maison Casbah",
      shopSlug: "maison-casbah",
      theme: BASE_THEME,
      seo: { metaTitle: "Maison Casbah", metaDescription: "Artisanat" },
      customPages: [],
      updatedAt: "2026-03-01T10:00:00.000Z",
    };

    await act(async () => {
      root.render(
        <MemoryRouter>
          <StudioPreview
            storeConfig={storeConfig} sections={[feedSection]} theme={BASE_THEME}
            products={SAMPLE_PRODUCTS} viewport="desktop" shopName="Maison Casbah"
            selectedSectionId={null} onSelectSection={selectSpy}
          />
        </MemoryRouter>
      );
    });

    expect(container.querySelector('[data-testid="studio-preview-stage"]')).not.toBeNull();
    const card = container.querySelector('[data-testid="section-product-card"]') as HTMLElement;
    await act(async () => {
      card.click();
      await new Promise((resolve) => setTimeout(resolve, 25));
    });
    expect(selectSpy).not.toHaveBeenCalled();
    expect(container.querySelector('[data-testid="interactive-cart-simulator-btn"]')).not.toBeNull();
  });
});
