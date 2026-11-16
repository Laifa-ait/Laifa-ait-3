// @vitest-environment jsdom
import React, { act } from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createRoot, Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { StoreSectionRenderer } from "../components/Store/sections/StoreSectionRenderer";
import {
  normalizeHeroSettingsAdapter,
  resolveHeroDeviceProfile,
} from "../components/Store/sections/hero/heroResponsiveHelper";
import { ELEGANT_HERO_FALLBACK_IMG } from "../components/Store/sections/hero/HeroMinimalTextAndGuides";
import { HERO_LAYOUT_MODELS } from "../pages/Seller/StoreBuilder/constants/heroBannerModels";
import { DEFAULT_STUDIO_THEME } from "../pages/Seller/StoreBuilder/constants/sectorCoherenceDefaults";
import type { CustomPageSection, HeroBannerSettings } from "../domains/seller/customPage.types";

if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof globalThis.IntersectionObserver;
}

describe("Phase 5 — Verrouillage Hero Atelier Premium (5 Modèles, Isolation Responsive, Médias & Parité Aperçu/Public)", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("1. Garantit la parité stricte entre l'aperçu Studio (isEditable=true) et la boutique publique (isEditable=false) sur les 5 modèles", async () => {
    for (const model of HERO_LAYOUT_MODELS) {
      const section: CustomPageSection<"hero_banner"> = {
        id: `hero_${model.id}`,
        type: "hero_banner",
        title: model.label,
        isVisible: true,
        order: 0,
        settings: {
          heroLayout: model.id,
          title: `Maison ${model.label}`,
          subtitle: "Artisanat d'exception livré dans les 69 Wilayas",
          badgeText: "ATELIER VÉRIFIÉ",
          showBadge: true,
          showSubtitle: true,
          showCta: true,
          ctaText: "Explorer",
          ctaLink: "#catalog",
          imageUrl: "https://cdn.olmart.dz/hero-primary.webp",
          secondaryImageUrl: "https://cdn.olmart.dz/hero-secondary.webp",
          showCompositionGuides: true,
        },
        styles: {},
      };

      await act(async () => {
        root.render(
          <MemoryRouter>
            <div id="studio-preview">
              <StoreSectionRenderer section={section} theme={DEFAULT_STUDIO_THEME} products={[]} isEditable={true} previewViewport="desktop" />
            </div>
            <div id="public-storefront">
              <StoreSectionRenderer section={section} theme={DEFAULT_STUDIO_THEME} products={[]} isEditable={false} previewViewport="desktop" />
            </div>
          </MemoryRouter>
        );
      });

      const studioModel = container.querySelector(`#studio-preview [data-testid="hero-model-${model.id}"]`);
      const publicModel = container.querySelector(`#public-storefront [data-testid="hero-model-${model.id}"]`);
      expect(studioModel).not.toBeNull();
      expect(publicModel).not.toBeNull();
      expect(studioModel?.getAttribute("data-hero-style")).toBe(publicModel?.getAttribute("data-hero-style"));
      expect(studioModel?.textContent).toContain(`Maison ${model.label}`);
      expect(publicModel?.textContent).toContain(`Maison ${model.label}`);

      // Les guides de composition ne s'affichent que dans le Studio, jamais sur la boutique publique
      expect(container.querySelector('#studio-preview [data-testid="hero-composition-guides"]')).not.toBeNull();
      expect(container.querySelector('#public-storefront [data-testid="hero-composition-guides"]')).toBeNull();
    }
  });

  it("2. Isole strictement les profils desktop, tablet et mobile : modifier Desktop n'écrase jamais Mobile", () => {
    const initialSettings: HeroBannerSettings = {
      title: "Isolation Multi-Appareils",
      imageUrl: "https://cdn.olmart.dz/pc.webp",
      tabletImageUrl: "https://cdn.olmart.dz/tablet.webp",
      mobileImageUrl: "https://cdn.olmart.dz/mobile.webp",
      heroLayout: "editorial-split",
      heroLayoutTablet: "arch-palace",
      heroLayoutMobile: "cinema-full",
      heroDesktopConfig: {
        styleId: "editorial-split",
        heightPx: 540,
        focalX: 20,
        focalY: 30,
        zoom: 1.25,
        innerPaddingPx: 40,
        borderRadiusPx: 28,
        textAlign: "left",
      },
      heroTabletConfig: {
        styleId: "arch-palace",
        heightPx: 400,
        focalX: 45,
        focalY: 55,
        zoom: 1.1,
        innerPaddingPx: 28,
        borderRadiusPx: 20,
        textAlign: "center",
      },
      heroMobileConfig: {
        styleId: "cinema-full",
        heightPx: 310,
        focalX: 65,
        focalY: 75,
        zoom: 1.05,
        innerPaddingPx: 18,
        borderRadiusPx: 14,
        textAlign: "center",
      },
    };

    // Modification du profil Desktop (changement de modèle, hauteur, point focal et zoom sur PC)
    const afterDesktopMutation: HeroBannerSettings = {
      ...initialSettings,
      heroLayout: "bento-hero",
      imagePositionDesktop: "10% 90%",
      imageZoomDesktop: 1.5,
      heroDesktopConfig: {
        ...initialSettings.heroDesktopConfig,
        styleId: "bento-hero",
        heightPx: 660,
        focalX: 10,
        focalY: 90,
        zoom: 1.5,
      },
    };

    const desktopResolved = resolveHeroDeviceProfile(afterDesktopMutation, "desktop");
    const tabletResolved = resolveHeroDeviceProfile(afterDesktopMutation, "tablet");
    const mobileResolved = resolveHeroDeviceProfile(afterDesktopMutation, "mobile");

    expect(desktopResolved.heroLayout).toBe("bento-hero");
    expect(desktopResolved.heightPx).toBe(660);
    expect(desktopResolved.focalX).toBe(10);
    expect(desktopResolved.focalY).toBe(90);
    expect(desktopResolved.zoom).toBe(1.5);

    // Le profil Mobile reste 100% intact
    expect(mobileResolved.heroLayout).toBe("cinema-full");
    expect(mobileResolved.heightPx).toBe(310);
    expect(mobileResolved.focalX).toBe(65);
    expect(mobileResolved.focalY).toBe(75);
    expect(mobileResolved.zoom).toBe(1.05);
    expect(mobileResolved.innerPaddingPx).toBe(18);
    expect(mobileResolved.borderRadiusPx).toBe(14);
    expect(mobileResolved.activeImageSrc).toBe("https://cdn.olmart.dz/mobile.webp");

    // Le profil Tablette reste 100% intact
    expect(tabletResolved.heroLayout).toBe("arch-palace");
    expect(tabletResolved.heightPx).toBe(400);
    expect(tabletResolved.focalX).toBe(45);
    expect(tabletResolved.focalY).toBe(55);
    expect(tabletResolved.zoom).toBe(1.1);
    expect(tabletResolved.activeImageSrc).toBe("https://cdn.olmart.dz/tablet.webp");
  });

  it("3. Borne le point focal [0..100] et le zoom [1..1.6], et assure un fallback visuel déterministe en cas de média manquant ou cassé", async () => {
    const outOfBounds = normalizeHeroSettingsAdapter({
      title: "Bornes Sécurisées",
      imageUrl: "",
      secondaryImageUrl: "",
      overlayOpacity: 999,
      secondaryFocalX: -80,
      secondaryFocalY: 250,
      heroDesktopConfig: {
        focalX: -500,
        focalY: 900,
        zoom: 9.5,
        heightPx: 2000,
      },
    });
    expect(outOfBounds.overlayOpacity).toBe(60);

    const profile = resolveHeroDeviceProfile(outOfBounds, "desktop");
    expect(profile.focalX).toBe(0);
    expect(profile.focalY).toBe(100);
    expect(profile.zoom).toBe(1.6);
    expect(profile.heightPx).toBe(760);
    expect(profile.secondaryFocalX).toBe(0);
    expect(profile.secondaryFocalY).toBe(100);

    const brokenImageSection: CustomPageSection<"hero_banner"> = {
      id: "hero_broken_media",
      type: "hero_banner",
      title: "Média Cassé",
      isVisible: true,
      order: 0,
      settings: {
        heroLayout: "arch-palace",
        title: "Arche Sans Image",
        imageUrl: "https://broken.invalid/404.jpg",
      },
    };

    await act(async () => {
      root.render(
        <MemoryRouter>
          <StoreSectionRenderer section={brokenImageSection} theme={DEFAULT_STUDIO_THEME} products={[]} isEditable={false} />
        </MemoryRouter>
      );
    });

    const img = container.querySelector('[data-testid="hero-pure-photo"]') as HTMLImageElement;
    expect(img).not.toBeNull();
    await act(async () => {
      img.dispatchEvent(new Event("error"));
    });
    expect(img.getAttribute("src")).toBe(ELEGANT_HERO_FALLBACK_IMG);
  });
});
