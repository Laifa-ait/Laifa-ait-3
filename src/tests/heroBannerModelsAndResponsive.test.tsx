// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createRoot, Root } from "react-dom/client";
import { act } from "react";
import { SectionHeroBanner } from "../components/Store/sections/SectionHeroBanner";
import { HeroContentEditor } from "../pages/Seller/StoreBuilder/components/inspector/content/HeroContentEditor";
import {
  HERO_COLOR_PALETTES,
  HERO_LAYOUT_MODELS,
  buildSmartHeroFromCatalog,
  getHeroModelCapabilities,
} from "../pages/Seller/StoreBuilder/constants/heroBannerModels";
import {
  buildAdaptedDeviceConfigFromDesktop,
  computeHeroContrastDiagnostics,
  normalizeHeroSettingsAdapter,
  resolveHeroDeviceProfile,
  resolveSafeHeroCtaHref,
} from "../components/Store/sections/hero/heroResponsiveHelper";
import { DEFAULT_STUDIO_THEME } from "../pages/Seller/StoreBuilder/constants/sectorCoherenceDefaults";
import { useStudioStore } from "../pages/Seller/StoreBuilder/store/useStudioStore";
import type { CustomPageSection, HeroBannerSettings } from "../domains/seller/customPage.types";
import type { Product } from "../domains/product/product.types";

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "prod_hero_1", name: "Karakou Algérois Brodé Or", price: 24500, promoPrice: 19900,
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800",
    images: ["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800"],
    category: "Haute Couture", description: "Fait main à Alger", stock: 5, rating: 5,
    sellerId: "seller_01", sellerName: "Maison Casbah", status: "active",
  },
  {
    id: "prod_hero_2", name: "Parure Khit Errouh Artisanal", price: 12000,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800",
    images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800"],
    category: "Bijoux", description: "Argent doré", stock: 8, rating: 4.9,
    sellerId: "seller_01", sellerName: "Maison Casbah", status: "active",
  },
];

describe("Acte 1 — Hero Scénographique : 5 Styles Architecturaux Isolés & Minimalisme Pur", () => {
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

  it("1. Expose les 5 styles architecturaux isolés (HeroFullBleed, HeroSplit, HeroArch, HeroGallery, HeroDiptych) avec contenu minimaliste strict", async () => {
    expect(HERO_LAYOUT_MODELS).toHaveLength(5);
    expect(HERO_COLOR_PALETTES).toHaveLength(5);
    expect(HERO_LAYOUT_MODELS.map((m) => m.componentName)).toEqual([
      "HeroFullBleed", "HeroSplit", "HeroArch", "HeroGallery", "HeroDiptych",
    ]);

    for (const model of HERO_LAYOUT_MODELS) {
      const caps = getHeroModelCapabilities(model.id);
      expect(Boolean(caps.roleSummary)).toBe(true);

      const section: CustomPageSection<"hero_banner"> = {
        id: `sec_${model.id}`, type: "hero_banner", title: model.label, isVisible: true, order: 0,
        settings: {
          title: `Titre ${model.label}`, subtitle: "Petite phrase explicative sous le titre", showSubtitle: true,
          imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
          secondaryImageUrl: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=1200",
          ctaText: "Découvrir la collection", ctaLink: "#catalog", showCta: true,
          heroLayout: model.id, showCompositionGuides: true,
        },
        styles: { containerWidth: "contained", paddingY: "md", borderRadius: "lg" },
      };

      await act(async () => {
        root.render(<SectionHeroBanner section={section} theme={DEFAULT_STUDIO_THEME} previewViewport="desktop" isEditable={true} />);
      });

      const renderedModelNode = container.querySelector(`[data-testid="hero-model-${model.id}"]`);
      expect(renderedModelNode).not.toBeNull();
      expect(renderedModelNode?.getAttribute("data-hero-style")).toBe(model.componentName);
      expect(renderedModelNode?.textContent).toContain(`Titre ${model.label}`);
      expect(renderedModelNode?.textContent).toContain("Petite phrase explicative sous le titre");
      expect(renderedModelNode?.textContent).toContain("Découvrir la collection");
      expect(container.querySelector('[data-testid="hero-composition-guides"]')).not.toBeNull();

      await act(async () => {
        root.render(<SectionHeroBanner section={section} theme={DEFAULT_STUDIO_THEME} previewViewport="desktop" isEditable={false} />);
      });
      expect(container.querySelector('[data-testid="hero-composition-guides"]')).toBeNull();
    }
  });

  it("2. Garantit la rétrocompatibilité des anciennes boutiques (Adaptateur) et l'isolation des états Desktop / Tablette / Mobile", () => {
    const legacyNormalized = normalizeHeroSettingsAdapter({
      title: "Boutique Historique", imageUrl: "https://example.com/old.jpg", heroLayout: "flash-offer",
    });
    expect(legacyNormalized.heroLayout).toBe("editorial-split");
    expect(legacyNormalized.splitProportion).toBe("50-50");
    expect(legacyNormalized.archShape).toBe("roman-arch");

    const settings: HeroBannerSettings = {
      title: "Boutique Multi-Écrans", imageUrl: "https://example.com/desktop.jpg",
      tabletImageUrl: "https://example.com/tablet.jpg", mobileImageUrl: "https://example.com/mobile.jpg",
      heroLayout: "bento-hero", heroLayoutTablet: "arch-palace", heroLayoutMobile: "cinema-full",
      bannerHeightDesktop: "xl", bannerHeightTablet: "md", bannerHeightMobile: "sm",
      heroDesktopConfig: { heightPx: 640, focalX: 30, focalY: 40, textPosition9: "bottom-left" },
      heroMobileConfig: { heightPx: 320, focalX: 70, focalY: 60, textPosition9: "center" },
    };

    const pcProfile = resolveHeroDeviceProfile(settings, "desktop");
    const tabProfile = resolveHeroDeviceProfile(settings, "tablet");
    const mobProfile = resolveHeroDeviceProfile(settings, "mobile");

    expect(pcProfile.heroLayout).toBe("bento-hero");
    expect(pcProfile.heightPx).toBe(640);
    expect(pcProfile.focalX).toBe(30);
    expect(pcProfile.textPosition9).toBe("bottom-left");

    expect(tabProfile.heroLayout).toBe("arch-palace");
    expect(tabProfile.hasCustomLayout).toBe(true);
    expect(tabProfile.minHeightPx).toBe(400);

    expect(mobProfile.heroLayout).toBe("cinema-full");
    expect(mobProfile.heightPx).toBe(320);
    expect(mobProfile.focalX).toBe(70);
    expect(mobProfile.textPosition9).toBe("center");

    const adaptedForMobile = buildAdaptedDeviceConfigFromDesktop(settings, "mobile");
    expect(adaptedForMobile.heightPx).toBeLessThan(pcProfile.heightPx);
    expect(adaptedForMobile.textPosition9).toBe("bottom-center");
  });

  it("3. Valide les 3 destinations sécurisées du bouton d'action et le diagnostic de pureté photographique", () => {
    expect(resolveSafeHeroCtaHref({ title: "T", imageUrl: "", ctaTargetType: "catalog", ctaLink: "javascript:alert(1)" })).toBe("#catalog");
    expect(resolveSafeHeroCtaHref({ title: "T", imageUrl: "", ctaTargetType: "category", ctaTargetCategory: "Haute Couture" })).toBe("#category=Haute%20Couture");
    expect(resolveSafeHeroCtaHref({ title: "T", imageUrl: "", ctaTargetType: "product", ctaTargetProductId: "prod_hero_1" })).toBe("#product-prod_hero_1");

    const generated = buildSmartHeroFromCatalog(SAMPLE_PRODUCTS, "mode", "Alger", "editorial-split");
    expect(generated.overlayOpacity).toBe(0);
    expect(generated.spotlightProductId).toBe("prod_hero_1");

    const overDarkened = computeHeroContrastDiagnostics({
      title: "Produit caché", imageUrl: "https://example.com/img.jpg", heroLayout: "cinema-full", overlayOpacity: 60,
    });
    expect(overDarkened.level).toBe("LOW");
    expect(overDarkened.suggestedPatch.overlayOpacity).toBe(0);
  });

  it("4. HeroContentEditor : sélection des 5 styles, palettes 1-clic et proposition d'adaptation PC avec confirmation manuelle", async () => {
    let currentSettings: Record<string, unknown> = {
      title: "Atelier d'Alger", imageUrl: "https://example.com/hero.jpg", heroLayout: "editorial-split",
      heroDesktopConfig: { heightPx: 640, innerPaddingPx: 32 },
    };
    const handleSettingsChange = (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => {
      currentSettings = typeof fieldOrPatch === "object" ? { ...currentSettings, ...fieldOrPatch } : { ...currentSettings, [fieldOrPatch]: value };
    };

    await act(async () => {
      root.render(<HeroContentEditor sectionType="hero_banner" settings={currentSettings} products={SAMPLE_PRODUCTS} onSettingsChange={handleSettingsChange} inputClass="input" labelClass="label" />);
    });

    const archBtn = container.querySelector('[data-testid="hero-model-card-arch-palace"]') as HTMLButtonElement;
    expect(archBtn).not.toBeNull();
    await act(async () => { archBtn.click(); });
    expect(currentSettings.heroLayout).toBe("arch-palace");

    const mobileTabBtn = container.querySelector('[data-testid="hero-device-tab-mobile"]') as HTMLButtonElement;
    await act(async () => { mobileTabBtn.click(); });

    const suggestBtn = container.querySelector('[data-testid="hero-suggest-pc-adaptation-btn"]') as HTMLButtonElement;
    expect(suggestBtn).not.toBeNull();
    await act(async () => { suggestBtn.click(); });

    expect(currentSettings.heroMobileConfig).toBeUndefined();
    const confirmBtn = container.querySelector('[data-testid="hero-confirm-pc-adaptation-btn"]') as HTMLButtonElement;
    expect(confirmBtn).not.toBeNull();
    await act(async () => { confirmBtn.click(); });
    expect(currentSettings.heroMobileConfig).toBeDefined();

    await act(async () => { (container.querySelector('[data-testid="hero-save-step-btn"]') as HTMLButtonElement).click(); });

    const paletteBtn = container.querySelector('[data-testid="hero-palette-cream-earth"]') as HTMLButtonElement;
    expect(paletteBtn).not.toBeNull();
    await act(async () => { paletteBtn.click(); });
    expect(currentSettings.paletteId).toBe("cream-earth");
  });
});
