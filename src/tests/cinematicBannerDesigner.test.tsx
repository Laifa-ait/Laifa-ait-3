// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { StoreSectionRenderer } from "../components/Store/sections/StoreSectionRenderer";
import { HeroContentEditor } from "../pages/Seller/StoreBuilder/components/inspector/content/HeroContentEditor";
import { DEFAULT_STUDIO_THEME } from "../pages/Seller/StoreBuilder/constants/sectorCoherenceDefaults";
import { CustomPageSection, HeroBannerSettings } from "../domains/seller/customPage.types";
import { Product } from "../domains/product/product.types";
import { saveDraftLayoutSchema } from "../domains/seller/validators/storeLayout.schema";
import { useStudioStore } from "../pages/Seller/StoreBuilder/store/useStudioStore";
import {
  computeCinematicContrastAudit,
  resolveCinematicBannerConfig,
  resolveCinematicDeviceState,
  validateCinematicDestination,
} from "../components/Store/sections/CinematicBanner/cinematicBanner.utils";

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "prod_cashmere_01",
    name: "Manteau Cachemire Structuré",
    price: 42000,
    category: "Haute Couture",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80",
    images: ["https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80"],
    description: "Coupe droite et laine double face.",
    sellerId: "seller_01",
    stock: 8,
    status: "active",
  } as Product,
  {
    id: "prod_archived_02",
    name: "Pièce Archivée",
    price: 15000,
    category: "Archives",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    sellerId: "seller_01",
    stock: 0,
    status: "archived",
  } as Product,
];

describe("Olmart Studio — Éditeur Unifié Bannière Grande Photo Fond Entier", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    useStudioStore.getState().resetStepProgress();
  });

  afterEach(async () => {
    await act(async () => { root.unmount(); });
    container.remove();
  });

  it("1. Éditeur unifié 4 étapes sur cinema-full : sélection modèle, hauteur, arrondi, voile & palette, photo (URL/Produits/Fonds/Zoom/Focal), texte & bouton", async () => {
    let currentSettings: Record<string, unknown> = {
      heroLayout: "editorial-split", title: "Collection Studio", subtitle: "Savoir-faire moderne", ctaText: "Découvrir",
    };
    const onSettingsChange = (patchOrField: string | Record<string, unknown>, val?: unknown) => {
      currentSettings = typeof patchOrField === "object" ? { ...currentSettings, ...patchOrField } : { ...currentSettings, [patchOrField]: val };
    };
    const renderEditor = async () => {
      await act(async () => {
        root.render(
          <HeroContentEditor
            sectionType="hero_banner"
            settings={currentSettings}
            products={SAMPLE_PRODUCTS}
            storeTheme={DEFAULT_STUDIO_THEME}
            inputClass="input"
            labelClass="label"
            onSettingsChange={onSettingsChange}
          />
        );
      });
    };

    await renderEditor();
    // Étape 1 : Sélection du modèle cinema-full, hauteur 640px, arrondi 24px
    const cinemaCard = container.querySelector('[data-testid="hero-model-card-cinema-full"]') as HTMLButtonElement;
    expect(cinemaCard).not.toBeNull();
    await act(async () => { cinemaCard.click(); });
    expect(currentSettings.heroLayout).toBe("cinema-full");

    await renderEditor();
    await act(async () => { (container.querySelector('[data-testid="hero-height-preset-640"]') as HTMLButtonElement).click(); });
    await renderEditor();
    expect(container.querySelector('[data-testid="hero-goto-design-tab-btn"]')).not.toBeNull();
    expect(currentSettings.heightPx).toBe(640);

    // Enregistrer étape 1 -> passe à l'étape 2 (Couleurs & voile)
    await act(async () => { (container.querySelector('[data-testid="hero-save-step-btn"]') as HTMLButtonElement).click(); });
    await renderEditor();
    expect(container.querySelector('[data-testid="hero-step-panel-2"]')).not.toBeNull();
    // Pas de champs morts (badge & 4 coins cachés sur cinema-full)
    expect(container.querySelector('[data-testid="hero-badge-bg-color"]')).toBeNull();
    expect(container.querySelector('[data-testid="hero-toggle-corner-colors"]')).toBeNull();

    await act(async () => { (container.querySelector('[data-testid="hero-veil-preset-strong"]') as HTMLButtonElement).click(); });
    const cfgAfterVeil = resolveCinematicBannerConfig(currentSettings as Partial<HeroBannerSettings>, DEFAULT_STUDIO_THEME);
    expect(cfgAfterVeil.overlay.preset).toBe("strong");
    expect(computeCinematicContrastAudit(cfgAfterVeil).isTitleAccessible).toBe(true);

    // Enregistrer étape 2 -> passe à l'étape 3 (Photos & cadrage)
    await act(async () => { (container.querySelector('[data-testid="hero-save-step-btn"]') as HTMLButtonElement).click(); });
    await renderEditor();
    expect(container.querySelector('[data-testid="hero-step-panel-3"]')).not.toBeNull();

    await act(async () => { (container.querySelector('[data-testid="image-picker-url-btn"]') as HTMLButtonElement).click(); });
    const urlInput = container.querySelector('[data-testid="image-picker-url-input"]') as HTMLInputElement;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(urlInput, "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400");
      urlInput.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(currentSettings.imageUrl).toContain("photo-1490481651871");

    await renderEditor();
    await act(async () => { (container.querySelector('[data-testid="image-picker-products-btn"]') as HTMLButtonElement).click(); });
    await act(async () => { (container.querySelector('[data-testid="image-picker-product-item-prod_cashmere_01"]') as HTMLButtonElement).click(); });
    expect(currentSettings.imageUrl).toContain("photo-1539109136881");

    await renderEditor();
    await act(async () => { (container.querySelector('[data-testid="image-picker-stock-btn"]') as HTMLButtonElement).click(); });
    await act(async () => { (container.querySelector('[data-testid="image-picker-stock-item-0"]') as HTMLButtonElement).click(); });
    expect(Boolean(currentSettings.imageUrl)).toBe(true);

    await renderEditor();
    const zoomSlider = container.querySelector('[data-testid="hero-zoom-slider"]') as HTMLInputElement;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(zoomSlider, "185");
      zoomSlider.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await renderEditor();
    const focalXSlider = container.querySelector('[data-testid="hero-focal-x-slider"]') as HTMLInputElement;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(focalXSlider, "30");
      focalXSlider.dispatchEvent(new Event("change", { bubbles: true }));
    });
    const resolvedAfterZoom = resolveCinematicBannerConfig(currentSettings as Partial<HeroBannerSettings>, DEFAULT_STUDIO_THEME);
    expect(resolvedAfterZoom.image.zoom).toBe(1.85);
    expect(resolvedAfterZoom.image.focalX).toBe(30);

    // Enregistrer étape 3 -> passe à l'étape 4 (Texte & bouton)
    await act(async () => { (container.querySelector('[data-testid="hero-save-step-btn"]') as HTMLButtonElement).click(); });
    await renderEditor();
    expect(container.querySelector('[data-testid="hero-step-panel-4"]')).not.toBeNull();
    // Sur cinema-full, 2e bouton & badge masqués (contrat mono-CTA)
    expect(container.querySelector('[data-testid="hero-badge-input"]')).toBeNull();
    expect(container.querySelector('[data-testid="hero-secondary-cta-toggle"]')).toBeNull();

    const titleInput = container.querySelector('[data-testid="hero-title-input"]') as HTMLInputElement;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(titleInput, "Nouvelle Saison");
      titleInput.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await renderEditor();
    await act(async () => { (container.querySelector('[data-testid="hero-pos9-center"]') as HTMLButtonElement).click(); });
    await renderEditor();
    await act(async () => { (container.querySelector('[data-testid="hero-cta-shape-minimal"]') as HTMLButtonElement).click(); });
    expect(currentSettings.title).toBe("Nouvelle Saison");
    expect(currentSettings.textPosition9).toBe("center");
    expect(currentSettings.ctaStyle).toBe("minimal");
  });

  it("2. Vérifie que les réglages plats (heightPx, overlayOpacity, ctaStyle) écrasent toujours les anciens champs imbriqués", () => {
    const staleNested = resolveCinematicBannerConfig({ heroLayout: "cinema-full" }, DEFAULT_STUDIO_THEME);
    staleNested.layout.heightPx = 320;
    staleNested.overlay.intensity = 10;

    const merged = resolveCinematicBannerConfig(
      { heroLayout: "cinema-full", heightPx: 640, overlayOpacity: 60, ctaStyle: "outline", cinematicConfig: staleNested },
      DEFAULT_STUDIO_THEME
    );
    expect(merged.layout.heightPx).toBe(640);
    expect(merged.overlay.intensity).toBe(60);
    expect(merged.button.shape).toBe("outline");
  });

  it("3. Destinations, Responsive indépendant, Sauvegarde Zod & Rendu Public Pur", async () => {
    expect(validateCinematicDestination({ targetType: "catalog", href: "#catalog" }, SAMPLE_PRODUCTS).resolvedHref).toBe("#catalog");
    expect(validateCinematicDestination({ targetType: "category", targetCategory: "Haute Couture" }, SAMPLE_PRODUCTS).resolvedHref).toBe("#category=Haute%20Couture");
    const validProd = validateCinematicDestination({ targetType: "product", targetProductId: "prod_cashmere_01" }, SAMPLE_PRODUCTS);
    expect(validProd.isValid).toBe(true);
    expect(validProd.resolvedHref).toBe("#product-prod_cashmere_01");
    const deletedProd = validateCinematicDestination({ targetType: "product", targetProductId: "prod_archived_02" }, SAMPLE_PRODUCTS);
    expect(deletedProd.isValid).toBe(false);
    expect(deletedProd.resolvedHref).toBe("#catalog");

    const baseCfg = resolveCinematicBannerConfig({
      heroLayout: "cinema-full", heightPx: 520,
      cinematicConfig: {
        ...resolveCinematicBannerConfig({ heroLayout: "cinema-full" }),
        responsive: {
          desktop: { heightPx: 520, titleSizePx: 44, zoom: 1.2 },
          tablet: { heightPx: 420, titleSizePx: 34, zoom: 1.1 },
          mobile: { heightPx: 340, titleSizePx: 24, zoom: 1.05, textPosition9: "bottom-center", textAlign: "center" },
        },
      },
    });
    expect(resolveCinematicDeviceState(baseCfg, "desktop").heightPx).toBe(520);
    expect(resolveCinematicDeviceState(baseCfg, "tablet").heightPx).toBe(420);
    expect(resolveCinematicDeviceState(baseCfg, "mobile").heightPx).toBe(340);
    expect(resolveCinematicDeviceState(baseCfg, "mobile").textPosition9).toBe("bottom-center");

    const sectionPayload: CustomPageSection<"hero_banner"> = {
      id: "hero_cinema_01", type: "hero_banner", title: "Grande photo fond entier", isVisible: true, order: 0,
      settings: {
        heroLayout: "cinema-full", title: "Silence & Matière", subtitle: "Nouvelle collection capsule.",
        imageUrl: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200",
        ctaText: "Découvrir la collection", ctaStyle: "minimal", ctaTargetType: "product", ctaTargetProductId: "prod_cashmere_01",
        showBadge: true, badgeText: "MASQUÉ", showSecondaryCta: true, secondaryCtaText: "MASQUÉ",
        cinematicConfig: baseCfg,
      },
      styles: {},
    };
    expect(saveDraftLayoutSchema.safeParse({ sections: [sectionPayload] }).success).toBe(true);

    await act(async () => {
      root.render(<StoreSectionRenderer section={sectionPayload} theme={DEFAULT_STUDIO_THEME} products={SAMPLE_PRODUCTS} isEditable={false} previewViewport="mobile" />);
    });
    const bannerEl = container.querySelector('[data-testid="hero-model-cinema-full"]') as HTMLElement;
    expect(bannerEl).not.toBeNull();
    expect(bannerEl.style.height).toBe("340px");
    expect(container.querySelector('[data-testid="hero-pure-photo"]')).not.toBeNull();
    expect(container.querySelector("h1")?.textContent).toContain("Silence & Matière");
    expect(container.querySelector('[data-testid="cinematic-subtitle"]')?.textContent).toContain("Nouvelle collection capsule.");
    const ctaBtn = container.querySelector('[data-testid="hero-single-cta-btn"]') as HTMLAnchorElement;
    expect(ctaBtn).not.toBeNull();
    expect(ctaBtn.getAttribute("href")).toBe("#product-prod_cashmere_01");
    expect(container.querySelector('[data-testid="hero-badge-pill"]')).toBeNull();
    expect(container.querySelector('[data-testid="hero-secondary-cta-btn"]')).toBeNull();
    expect(container.querySelector('[data-testid="cinematic-localized-veil"]')).not.toBeNull();
  });
});
