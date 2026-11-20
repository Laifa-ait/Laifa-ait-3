// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeroCtaStep4Panel } from "../pages/Seller/StoreBuilder/components/inspector/hero/HeroCtaStep4Panel";
import { StoreSectionRenderer } from "../components/Store/sections/StoreSectionRenderer";
import { resolveHeroDeviceProfile } from "../components/Store/sections/hero/heroResponsiveHelper";
import { resolveHeroTextFrame } from "../components/Store/sections/hero/heroTextFrameHelper";
import { DEFAULT_MODERN_THEME } from "../pages/Seller/StoreBuilder/constants/studioThemeDefaults";
import { saveDraftLayoutSchema } from "../domains/seller/validators/storeLayout.schema";
import type { CustomPageSection, HeroBannerSettings } from "../domains/seller/customPage.types";

describe("HeroTextFrameControls — Contrôle 100% du cadre du texte", () => {
  let container: HTMLDivElement;
  let root: Root;

  const clickByTestId = async (testId: string): Promise<void> => {
    await act(async () => {
      (container.querySelector(`[data-testid="${testId}"]`) as HTMLElement).click();
    });
  };

  const renderStep4 = async (
    settings: Partial<HeroBannerSettings>,
    onSettingsChange: ReturnType<typeof vi.fn>
  ): Promise<void> => {
    const profile = resolveHeroDeviceProfile(settings, "desktop");
    await act(async () => {
      root.render(
        <HeroCtaStep4Panel
          activeModel="atelier-collage"
          deviceTab="desktop"
          profile={profile}
          settings={settings as Record<string, unknown>}
          products={[]}
          storeTheme={DEFAULT_MODERN_THEME}
          inputClass="input"
          onSettingsChange={onSettingsChange}
          onDeviceConfigChange={vi.fn()}
        />
      );
    });
  };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => { root.unmount(); });
    container.remove();
  });

  it("1. Presets (Verre sombre, Dégradé luxe, Sans cadre), toggle et réinitialisation", async () => {
    const onSettingsChange = vi.fn();
    await renderStep4(
      { heroLayout: "atelier-collage", title: "Maison d'Excellence", textFrame: { enabled: true, bgColor: "#FFFFFF", opacity: 90 } },
      onSettingsChange
    );

    expect(container.querySelector('[data-testid="hero-text-frame-panel"]')).not.toBeNull();

    await clickByTestId("hero-text-frame-preset-glass-dark");
    expect(onSettingsChange).toHaveBeenCalledWith(
      "textFrame",
      expect.objectContaining({ enabled: true, bgColor: "#0F172A", opacity: 78, blurPx: 14 })
    );

    await clickByTestId("hero-text-frame-preset-luxury-gradient");
    expect(onSettingsChange).toHaveBeenCalledWith(
      "textFrame",
      expect.objectContaining({ fillMode: "gradient", borderStyle: "double", borderWidthPx: 2 })
    );

    await clickByTestId("hero-text-frame-preset-none");
    expect(onSettingsChange).toHaveBeenCalledWith("textFrame", expect.objectContaining({ enabled: false }));

    await clickByTestId("hero-text-frame-reset");
    expect(onSettingsChange).toHaveBeenCalledWith("textFrame", undefined);
  });

  it("2. Les 3 onglets (Fond & Verre, Bordure, Taille & Place) pilotent toutes les options", async () => {
    const onSettingsChange = vi.fn();
    await renderStep4(
      { heroLayout: "atelier-collage", title: "Collection Royale", textFrame: { enabled: true, fillMode: "solid", bgColor: "#FFFFFF", opacity: 88, blurPx: 10 } },
      onSettingsChange
    );

    expect(container.querySelector('[data-testid="hero-text-frame-transparency-value"]')?.textContent).toBe("12%");

    await clickByTestId("hero-text-frame-transparency-preset-50");
    expect(onSettingsChange).toHaveBeenCalledWith("textFrame", expect.objectContaining({ enabled: true, opacity: 50 }));

    await clickByTestId("hero-text-frame-transparency-preset-100");
    expect(onSettingsChange).toHaveBeenCalledWith("textFrame", expect.objectContaining({ enabled: true, opacity: 0 }));

    await clickByTestId("hero-text-frame-transparency-preset-0");
    expect(onSettingsChange).toHaveBeenCalledWith("textFrame", expect.objectContaining({ enabled: true, opacity: 100 }));

    await clickByTestId("hero-text-frame-fill-gradient");
    expect(onSettingsChange).toHaveBeenCalledWith("textFrame", expect.objectContaining({ enabled: true, fillMode: "gradient" }));

    await clickByTestId("hero-text-frame-tab-bordure");
    await clickByTestId("hero-text-frame-border-style-dashed");
    expect(onSettingsChange).toHaveBeenCalledWith("textFrame", expect.objectContaining({ enabled: true, borderStyle: "dashed" }));

    await clickByTestId("hero-text-frame-tab-taille");
    await clickByTestId("hero-text-frame-placement-overlay");
    expect(onSettingsChange).toHaveBeenCalledWith("textFrame", expect.objectContaining({ placement: "overlay" }));

    await clickByTestId("hero-text-frame-width-mode-full");
    expect(onSettingsChange).toHaveBeenCalledWith("textFrame", expect.objectContaining({ maxWidthMode: "full" }));
  });

  it("3. HeroGallery applique les styles, Sans cadre et overrides de placement (Mobile Sur photo / PC Dessous)", async () => {
    const baseSettings: HeroBannerSettings = {
      heroLayout: "atelier-collage",
      title: "L'Art Authentique",
      subtitle: "Boutique officielle Olmart",
      imageUrl: "https://example.com/photo.jpg",
      textFrame: {
        enabled: true, fillMode: "gradient", bgColor: "#111827", gradientColor2: "#334155", gradientAngle: 120,
        opacity: 85, blurPx: 16, borderWidthPx: 2, borderStyle: "dashed", borderColor: "#F59E0B", borderOpacity: 80,
        borderRadiusPx: 28, paddingXPx: 32, paddingYPx: 24, maxWidthMode: "custom", maxWidthPx: 620,
        shadow: "brutal", offsetXPx: 12, offsetYPx: -8, placement: "overlay",
      },
    };
    const section: CustomPageSection<"hero_banner"> = {
      id: "hero_frame_1", type: "hero_banner", title: "Hero", isVisible: true, order: 0, settings: baseSettings, styles: {},
    };

    await act(async () => {
      root.render(<StoreSectionRenderer section={section} theme={DEFAULT_MODERN_THEME} products={[]} previewViewport="mobile" />);
    });
    expect(container.querySelector('[data-testid="hero-gallery-floating-plaque"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="hero-gallery-docked-caption"]')).toBeNull();

    const card = container.querySelector('[data-testid="hero-text-frame-card"]') as HTMLElement;
    expect(card.style.background).toContain("linear-gradient(120deg");
    expect(card.style.borderRadius).toBe("28px");
    expect(card.style.borderStyle).toBe("dashed");
    expect(card.style.borderWidth).toBe("2px");
    expect(card.style.padding).toBe("24px 32px");
    expect(card.style.transform).toBe("translate(12px, -8px)");

    const dockedSection: CustomPageSection<"hero_banner"> = {
      ...section,
      settings: { ...baseSettings, textFrame: { ...baseSettings.textFrame, placement: "docked-below" } },
    };
    await act(async () => {
      root.render(<StoreSectionRenderer section={dockedSection} theme={DEFAULT_MODERN_THEME} products={[]} previewViewport="desktop" />);
    });
    expect(container.querySelector('[data-testid="hero-gallery-docked-caption"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="hero-gallery-floating-plaque"]')).toBeNull();
    expect(container.querySelector('[data-testid="hero-text-frame-card"]')).not.toBeNull();

    const bareSection: CustomPageSection<"hero_banner"> = {
      ...section,
      settings: { ...baseSettings, textFrame: { enabled: false } },
    };
    await act(async () => {
      root.render(<StoreSectionRenderer section={bareSection} theme={DEFAULT_MODERN_THEME} products={[]} previewViewport="desktop" />);
    });
    const bareCard = container.querySelector('[data-testid="hero-text-frame-card"]') as HTMLElement;
    expect(bareCard.getAttribute("data-text-frame-enabled")).toBe("false");
    expect(bareCard.style.background).toBe("transparent");
  });

  it("4. CinematicBannerRenderer supporte le cadre optionnel et Zod valide textFrame", async () => {
    const cinemaSection: CustomPageSection<"hero_banner"> = {
      id: "hero_cinema_frame", type: "hero_banner", title: "Hero", isVisible: true, order: 0, styles: {},
      settings: {
        heroLayout: "cinema-full", title: "Édition Limitée", subtitle: "Disponible sur Olmart",
        imageUrl: "https://example.com/cinema.jpg",
        textFrame: {
          enabled: true, fillMode: "solid", bgColor: "#0F172A", opacity: 75, blurPx: 14,
          borderWidthPx: 1, borderStyle: "solid", borderColor: "#FFFFFF", borderOpacity: 25,
          borderRadiusPx: 20, paddingXPx: 28, paddingYPx: 22, shadow: "lg",
        },
      },
    };

    await act(async () => {
      root.render(<StoreSectionRenderer section={cinemaSection} theme={DEFAULT_MODERN_THEME} products={[]} previewViewport="desktop" />);
    });

    const veil = container.querySelector('[data-testid="cinematic-localized-veil"]') as HTMLElement;
    expect(veil.getAttribute("data-text-frame-enabled")).toBe("true");
    expect(veil.style.borderRadius).toBe("20px");
    expect(veil.style.padding).toBe("22px 28px");

    const clamped = resolveHeroTextFrame(
      { textFrame: { enabled: true, opacity: 999, blurPx: 100, borderWidthPx: 99, borderRadiusPx: 999 } },
      DEFAULT_MODERN_THEME,
      resolveHeroDeviceProfile({}, "desktop"),
      true
    );
    expect(clamped.values.opacity).toBe(100);
    expect(clamped.values.blurPx).toBe(24);
    expect(clamped.values.borderWidthPx).toBe(6);
    expect(clamped.values.borderRadiusPx).toBe(48);

    expect(saveDraftLayoutSchema.safeParse({ sections: [cinemaSection] }).success).toBe(true);
  });
});
