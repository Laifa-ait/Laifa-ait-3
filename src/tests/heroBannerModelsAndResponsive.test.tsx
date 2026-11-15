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
  computeHeroTextDensityDiagnostics,
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
    sellerId: "seller_01", sellerName: "Maison Casbah", wilaya: "Alger", status: "active",
  },
  {
    id: "prod_hero_2", name: "Parure Khit Errouh Artisanal", price: 12000,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800",
    images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800"],
    category: "Bijoux", description: "Argent doré", stock: 8, rating: 4.9,
    sellerId: "seller_01", sellerName: "Maison Casbah", wilaya: "Alger", status: "active",
  },
];

describe("Phase 5 — Hero Atelier Premium & Responsive Avancé (5 Compositions)", () => {
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

  it("1. Rend les 5 modèles (FullBleed, Split, Arch, Gallery, Diptych) de façon fidèle entre Aperçu et Public", async () => {
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
      expect(container.querySelector('[data-testid="hero-composition-guides"]')).not.toBeNull();

      await act(async () => {
        root.render(<SectionHeroBanner section={section} theme={DEFAULT_STUDIO_THEME} previewViewport="desktop" isEditable={false} />);
      });
      expect(container.querySelector('[data-testid="hero-composition-guides"]')).toBeNull();
    }
  });

  it("2. Normalise les anciens modèles, préserve les titres vendeurs, et borne strictement le point focal et le zoom", () => {
    const legacyNormalized = normalizeHeroSettingsAdapter({
      title: "L'Univers Casbah — Savoir-Faire Authentique",
      imageUrl: "https://example.com/old.jpg",
      heroLayout: "flash-offer",
    });
    expect(legacyNormalized.heroLayout).toBe("editorial-split");
    expect(legacyNormalized.title).toBe("L'Univers Casbah — Savoir-Faire Authentique");

    const settings: HeroBannerSettings = {
      title: "Boutique Multi-Écrans",
      imageUrl: "https://example.com/desktop.jpg",
      tabletImageUrl: "https://example.com/tablet.jpg",
      mobileImageUrl: "https://example.com/mobile.jpg",
      heroLayout: "bento-hero",
      heroLayoutTablet: "arch-palace",
      heroLayoutMobile: "cinema-full",
      heroDesktopConfig: { heightPx: 640, focalX: -25, focalY: 145, zoom: 3.2, textPosition9: "bottom-left" },
      heroMobileConfig: { heightPx: 320, focalX: 70, focalY: 60, zoom: 0.4, textPosition9: "center" },
    };

    const pcProfile = resolveHeroDeviceProfile(settings, "desktop");
    const tabProfile = resolveHeroDeviceProfile(settings, "tablet");
    const mobProfile = resolveHeroDeviceProfile(settings, "mobile");

    expect(pcProfile.heroLayout).toBe("bento-hero");
    expect(pcProfile.focalX).toBe(0);
    expect(pcProfile.focalY).toBe(100);
    expect(pcProfile.zoom).toBe(1.6);

    expect(tabProfile.heroLayout).toBe("arch-palace");
    expect(tabProfile.hasCustomLayout).toBe(true);

    expect(mobProfile.heroLayout).toBe("cinema-full");
    expect(mobProfile.zoom).toBe(1);
    expect(mobProfile.textPosition9).toBe("center");

    const adaptedForMobile = buildAdaptedDeviceConfigFromDesktop(settings, "mobile");
    expect(adaptedForMobile.heightPx).toBeLessThan(pcProfile.heightPx);
  });

  it("3. Gère le repli déterministe de HeroDiptych sans 2ème image et la composition multi-visuels de HeroGallery", async () => {
    const diptychMissingSecond: CustomPageSection<"hero_banner"> = {
      id: "sec_dip_single", type: "hero_banner", title: "Diptyque", isVisible: true, order: 0,
      settings: {
        title: "Diptyque 1 Seule Photo",
        imageUrl: "https://example.com/photo1.jpg",
        secondaryImageUrl: "",
        heroLayout: "bento-hero",
      },
    };

    await act(async () => {
      root.render(<SectionHeroBanner section={diptychMissingSecond} theme={DEFAULT_STUDIO_THEME} previewViewport="desktop" isEditable={true} />);
    });
    expect(container.querySelector('[data-testid="hero-diptych-single-fallback"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="hero-diptych-missing-secondary-notice"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="hero-diptych-photo-2"]')).toBeNull();

    const galleryMulti: CustomPageSection<"hero_banner"> = {
      id: "sec_gal_multi", type: "hero_banner", title: "Galerie", isVisible: true, order: 0,
      settings: {
        title: "Galerie 3 Visuels",
        imageUrl: "https://example.com/g1.jpg",
        secondaryImageUrl: "https://example.com/g2.jpg",
        tertiaryImageUrl: "https://example.com/g3.jpg",
        heroLayout: "atelier-collage",
      },
    };

    await act(async () => {
      root.render(<SectionHeroBanner section={galleryMulti} theme={DEFAULT_STUDIO_THEME} previewViewport="mobile" isEditable={true} />);
    });
    expect(container.querySelector('[data-testid="hero-gallery-multi"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="hero-gallery-secondary-slot-1"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="hero-gallery-secondary-slot-2"]')).not.toBeNull();
  });

  it("4. Calcule le vrai contraste WCAG, la densité de texte non destructive et sécurise les liens CTA", () => {
    expect(resolveSafeHeroCtaHref({ title: "T", imageUrl: "", ctaTargetType: "catalog", ctaLink: "javascript:alert(1)" })).toBe("#catalog");
    expect(resolveSafeHeroCtaHref({ title: "T", imageUrl: "", ctaTargetType: "category", ctaTargetCategory: "Haute Couture" })).toBe("#category=Haute%20Couture");
    expect(resolveSafeHeroCtaHref({ title: "T", imageUrl: "", ctaTargetType: "product", ctaTargetProductId: "prod_hero_1" })).toBe("#product-prod_hero_1");

    const generated = buildSmartHeroFromCatalog(SAMPLE_PRODUCTS, "mode", "Alger", "editorial-split");
    expect(generated.overlayOpacity).toBe(0);

    const lowContrastSplit = computeHeroContrastDiagnostics({
      title: "Illisible", imageUrl: "https://example.com/img.jpg", heroLayout: "editorial-split",
      bannerBgColor: "#FAF6F0", titleColor: "#F5F0E6",
    });
    expect(lowContrastSplit.level).toBe("LOW");
    expect(lowContrastSplit.suggestedPatch.titleColor).toBe("#111827");

    const denseText = computeHeroTextDensityDiagnostics({
      title: "A".repeat(80), subtitle: "B".repeat(160), badgeText: "C".repeat(35), imageUrl: "",
    });
    expect(denseText.isDense).toBe(true);
    expect(denseText.warnings).toHaveLength(3);
  });

  it("5. HeroContentEditor : préserve les couleurs lors du changement de modèle et isole les profils par appareil", async () => {
    let currentSettings: Record<string, unknown> = {
      title: "Atelier d'Alger", imageUrl: "https://example.com/hero.jpg", heroLayout: "editorial-split",
      titleColor: "#8C4A27", innerPaddingPx: 28,
      heroDesktopConfig: { heightPx: 640, innerPaddingPx: 28 },
    };
    const handleSettingsChange = (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => {
      currentSettings = typeof fieldOrPatch === "object" ? { ...currentSettings, ...fieldOrPatch } : { ...currentSettings, [fieldOrPatch]: value };
    };

    const rerenderEditor = async () => {
      await act(async () => {
        root.render(<HeroContentEditor sectionType="hero_banner" settings={currentSettings} products={SAMPLE_PRODUCTS} onSettingsChange={handleSettingsChange} inputClass="input" labelClass="label" />);
      });
    };

    await rerenderEditor();

    const cinemaBtn = container.querySelector('[data-testid="hero-model-card-cinema-full"]') as HTMLButtonElement;
    await act(async () => { cinemaBtn.click(); });
    expect(currentSettings.heroLayout).toBe("cinema-full");
    expect(currentSettings.titleColor).toBe("#8C4A27");

    const mobileTabBtn = container.querySelector('[data-testid="hero-device-tab-mobile"]') as HTMLButtonElement;
    await act(async () => { mobileTabBtn.click(); });
    await rerenderEditor();

    const suggestBtn = container.querySelector('[data-testid="hero-suggest-pc-adaptation-btn"]') as HTMLButtonElement;
    await act(async () => { suggestBtn.click(); });
    const confirmBtn = container.querySelector('[data-testid="hero-confirm-pc-adaptation-btn"]') as HTMLButtonElement;
    await act(async () => { confirmBtn.click(); });
    expect(currentSettings.heroMobileConfig).toBeDefined();
    expect(currentSettings.innerPaddingPx).toBe(28);

    await rerenderEditor();
    const resetProfileBtn = container.querySelector('[data-testid="hero-reset-device-profile-btn"]') as HTMLButtonElement;
    expect(resetProfileBtn).not.toBeNull();
    await act(async () => { resetProfileBtn.click(); });
    expect(currentSettings.heroMobileConfig).toBeUndefined();
  });
});
