// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeroCtaStep4Panel } from "../pages/Seller/StoreBuilder/components/inspector/hero/HeroCtaStep4Panel";
import { StoreSectionRenderer } from "../components/Store/sections/StoreSectionRenderer";
import { resolveHeroDeviceProfile } from "../components/Store/sections/hero/heroResponsiveHelper";
import { toggleInlineMarkupSelection } from "../components/Store/sections/hero/heroTypographyHelper";
import { DEFAULT_MODERN_THEME } from "../pages/Seller/StoreBuilder/constants/studioThemeDefaults";
import type { CustomPageSection, HeroBannerSettings } from "../domains/seller/customPage.types";

describe("HeroWordTypographyControl — Contrôle d'écriture façon Microsoft Word", () => {
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

  it("1. toggleInlineMarkupSelection enveloppe et désenveloppe proprement un mot sélectionné (*italique* et {souligné})", () => {
    const wrappedItalic = toggleInlineMarkupSelection("L'Art de Laifa Pièces", 9, 14, "italic");
    expect(wrappedItalic.nextText).toBe("L'Art de *Laifa* Pièces");
    const unwrappedItalic = toggleInlineMarkupSelection(wrappedItalic.nextText, wrappedItalic.nextStart, wrappedItalic.nextEnd, "italic");
    expect(unwrappedItalic.nextText).toBe("L'Art de Laifa Pièces");

    const wrappedUnderline = toggleInlineMarkupSelection("Pièces Authentiques", 7, 19, "underline");
    expect(wrappedUnderline.nextText).toBe("Pièces {Authentiques}");
    const unwrappedUnderline = toggleInlineMarkupSelection(wrappedUnderline.nextText, wrappedUnderline.nextStart, wrappedUnderline.nextEnd, "underline");
    expect(unwrappedUnderline.nextText).toBe("Pièces Authentiques");
  });

  it("2. Le ruban Word modifie police, taille numérique (A+/A-), G/I/S, casse Aa, ombre, alignement et interligne", async () => {
    const onSettingsChange = vi.fn();
    const onDeviceConfigChange = vi.fn();
    const settings: Partial<HeroBannerSettings> = {
      heroLayout: "atelier-collage",
      title: "Maison Authentique",
      subtitle: "Collection officielle Olmart",
      titleFontFamily: "plus-jakarta",
      titleFontWeight: "black",
      titleItalic: false,
      titleUnderline: false,
      titleTextTransform: "none",
      textShadow: "none",
      textBoxMaxWidth: 480,
      textVerticalGap: 16,
    };
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
          onDeviceConfigChange={onDeviceConfigChange}
        />
      );
    });

    expect(container.querySelector('[data-testid="hero-word-typography-ribbon"]')).not.toBeNull();

    // Font family change
    const fontSelect = container.querySelector('[data-testid="hero-word-font-select"]') as HTMLSelectElement;
    await act(async () => {
      fontSelect.value = "playfair";
      fontSelect.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(onSettingsChange).toHaveBeenCalledWith("titleFontFamily", "playfair");

    // Font size A+ stepper
    const incBtn = container.querySelector('[data-testid="hero-word-size-inc"]') as HTMLButtonElement;
    await act(async () => { incBtn.click(); });
    expect(onDeviceConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({ titleFontSizePx: 44 }),
      expect.objectContaining({ titleFontSizePx: 44 })
    );

    // Bold toggle (black -> normal)
    const boldBtn = container.querySelector('[data-testid="hero-word-bold-btn"]') as HTMLButtonElement;
    await act(async () => { boldBtn.click(); });
    expect(onSettingsChange).toHaveBeenCalledWith("titleFontWeight", "normal");

    // Global Italic & Underline toggles (no selection)
    await act(async () => { (container.querySelector('[data-testid="hero-word-italic-btn"]') as HTMLButtonElement).click(); });
    expect(onSettingsChange).toHaveBeenCalledWith("titleItalic", true);

    await act(async () => { (container.querySelector('[data-testid="hero-word-underline-btn"]') as HTMLButtonElement).click(); });
    expect(onSettingsChange).toHaveBeenCalledWith("titleUnderline", true);

    // Case cycle (none -> uppercase)
    await act(async () => { (container.querySelector('[data-testid="hero-word-case-btn"]') as HTMLButtonElement).click(); });
    expect(onSettingsChange).toHaveBeenCalledWith("titleTextTransform", "uppercase");

    // Shadow cycle (none -> soft)
    await act(async () => { (container.querySelector('[data-testid="hero-word-shadow-btn"]') as HTMLButtonElement).click(); });
    expect(onSettingsChange).toHaveBeenCalledWith("textShadow", "soft");

    // Alignment center
    await act(async () => { (container.querySelector('[data-testid="hero-word-align-center"]') as HTMLButtonElement).click(); });
    expect(onDeviceConfigChange).toHaveBeenCalledWith({ textAlign: "center" }, { textAlignment: "center" });

    // Switch target to Subtitle and toggle bold
    await act(async () => { (container.querySelector('[data-testid="hero-word-target-subtitle"]') as HTMLButtonElement).click(); });
    await act(async () => { (container.querySelector('[data-testid="hero-word-bold-btn"]') as HTMLButtonElement).click(); });
    expect(onSettingsChange).toHaveBeenCalledWith("subtitleFontWeight", "bold");
  });

  it("3. Les styles Word (police, taille px, italique, souligné, majuscules, interligne) s'appliquent sur le rendu réel (HeroGallery & Cinema-Full)", async () => {
    const wordSettings: HeroBannerSettings = {
      heroLayout: "atelier-collage",
      title: "Atelier Algérie",
      subtitle: "Pièces façonnées à la main",
      imageUrl: "https://example.com/hero.jpg",
      titleFontFamily: "cormorant",
      titleFontSizePx: 46,
      titleFontWeight: "normal",
      titleItalic: true,
      titleUnderline: true,
      titleTextTransform: "uppercase",
      titleLineHeight: 1.25,
      titleLetterSpacingEm: 0.05,
      subtitleFontFamily: "cairo",
      subtitleFontSizePx: 18,
      subtitleItalic: true,
    };

    const gallerySection: CustomPageSection<"hero_banner"> = {
      id: "hero_word_1", type: "hero_banner", title: "Hero", isVisible: true, order: 0,
      settings: wordSettings, styles: {},
    };

    await act(async () => {
      root.render(
        <StoreSectionRenderer section={gallerySection} theme={DEFAULT_MODERN_THEME} products={[]} previewViewport="desktop" />
      );
    });

    const h1 = container.querySelector("h1") as HTMLElement;
    expect(h1).not.toBeNull();
    expect(h1.style.fontFamily).toContain("Cormorant Garamond");
    expect(h1.style.fontSize).toBe("46px");
    expect(h1.style.fontWeight).toBe("400");
    expect(h1.style.fontStyle).toBe("italic");
    expect(h1.style.textDecoration).toContain("underline");
    expect(h1.style.textTransform).toBe("uppercase");

    const sub = container.querySelector('[data-sub-element="subtitle"]') as HTMLElement;
    expect(sub.style.fontFamily).toContain("Cairo");
    expect(sub.style.fontSize).toBe("18px");
    expect(sub.style.fontStyle).toBe("italic");

    // Same styles verified on cinema-full renderer
    const cinemaSection: CustomPageSection<"hero_banner"> = {
      ...gallerySection,
      settings: { ...wordSettings, heroLayout: "cinema-full" },
    };
    await act(async () => {
      root.render(
        <StoreSectionRenderer section={cinemaSection} theme={DEFAULT_MODERN_THEME} products={[]} previewViewport="desktop" />
      );
    });

    const cinemaH1 = container.querySelector("h1") as HTMLElement;
    expect(cinemaH1.style.fontFamily).toContain("Cormorant Garamond");
    expect(cinemaH1.style.fontStyle).toBe("italic");
    expect(cinemaH1.style.textTransform).toBe("uppercase");
  });
});
