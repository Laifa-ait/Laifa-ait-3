// @vitest-environment jsdom
import React, { act } from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createRoot, Root } from "react-dom/client";
import { SectionHeroBanner } from "../components/Store/sections/SectionHeroBanner";
import { SectionContentAndTrust } from "../components/Store/sections/SectionContentAndTrust";
import { buildSectionContainerStyle } from "../components/Store/sections/sectionStyleHelper";
import { HeroContentEditor } from "../pages/Seller/StoreBuilder/components/inspector/content/HeroContentEditor";
import { SectionInspectorPanel } from "../pages/Seller/StoreBuilder/components/inspector/SectionInspectorPanel";
import { SectionStyleTab } from "../pages/Seller/StoreBuilder/components/inspector/SectionStyleTab";
import { ThemeColorPaletteTab } from "../pages/Seller/StoreBuilder/components/context/ThemeColorPaletteTab";
import { stripHardcodedSectionColors } from "../pages/Seller/StoreBuilder/components/context/ThemeInspectorPanel";
import { ARTISTIC_STUDIO_PRESETS } from "../pages/Seller/StoreBuilder/constants/artisticStudioPresets";
import { DEFAULT_STUDIO_THEME } from "../pages/Seller/StoreBuilder/constants/sectorCoherenceDefaults";
import { useStudioStore } from "../pages/Seller/StoreBuilder/store/useStudioStore";
import {
  resolveHeroBackgroundStyle,
  resolveHeroBorderRadiusCss,
  resolveHeroBoxShadowCss,
  resolveHeroImageFilterCss,
} from "../components/Store/sections/hero/heroVisualEffectsHelper";
import { resolveHeroDeviceProfile } from "../components/Store/sections/hero/heroResponsiveHelper";
import type { CustomPageSection, CustomPageSectionStyles, HeroBannerSettings } from "../domains/seller/customPage.types";

describe("Audit & Refonte Studio Vendeur : Sélecteur de Couleurs par Élément, Schéma 4 Étapes & 9 Thèmes Signatures", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    useStudioStore.getState().resetStepProgress();
    useStudioStore.getState().setActiveInspectorTab("content");
    useStudioStore.getState().selectSection(null, null);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("1. Contrôles Bannière (4 Coins Arrondis, Couleurs 4 Coins, Ombres, Filtres Photo, Badge & Bouton CTA) fonctionnent de bout en bout", async () => {
    const settings: HeroBannerSettings = {
      badgeText: "COLLECTION PRIVÉE",
      showBadge: true,
      badgeBgColor: "#D4AF37",
      badgeTextColor: "#0E1117",
      title: "Haute Horlogerie Alger",
      subtitle: "Savoir-faire artisanal",
      showSubtitle: true,
      imageUrl: "",
      heroLayout: "editorial-split",
      ctaText: "Explorer",
      showCta: true,
      usePerCornerRadius: true,
      borderRadiusTlPx: 40,
      borderRadiusTrPx: 8,
      borderRadiusBrPx: 40,
      borderRadiusBlPx: 0,
      useCornerColors: true,
      cornerColorTl: "#FAF6F0",
      cornerColorTr: "#F3E8D6",
      cornerColorBr: "#EFE2CC",
      cornerColorBl: "#FFFFFF",
      bannerShadow: "floating",
      imageShadow: "lg",
      imageFilterPreset: "warm-editorial",
      imageBrightness: 110,
      imageContrast: 115,
      ctaStyle: "outline",
      ctaButtonSize: "lg",
      ctaBgColor: "#111827",
      ctaTextColor: "#F9FAFB",
      ctaBorderColor: "#D97706",
      ctaBorderWidthPx: 3,
      ctaBorderRadiusPx: 14,
      ctaShadow: "glow",
      ctaShowArrow: false,
    };

    const profile = resolveHeroDeviceProfile(settings, "desktop");
    expect(resolveHeroBorderRadiusCss(settings, profile)).toBe("40px 8px 40px 0px");

    const bgStyle = resolveHeroBackgroundStyle(settings, DEFAULT_STUDIO_THEME, "#FFF");
    expect(bgStyle.backgroundImage).toContain("radial-gradient(circle at 0% 0%, #FAF6F0");
    expect(bgStyle.backgroundImage).toContain("radial-gradient(circle at 100% 100%, #EFE2CC");

    const filterCss = resolveHeroImageFilterCss(settings);
    expect(filterCss).toContain("brightness(110%)");
    expect(filterCss).toContain("contrast(115%)");
    expect(resolveHeroBoxShadowCss("floating")).toContain("rgba(15, 23, 42, 0.25)");

    const section: CustomPageSection<"hero_banner"> = {
      id: "sec_hero_fx",
      type: "hero_banner",
      title: "Bannière Prestige",
      isVisible: true,
      order: 0,
      settings,
      styles: {},
    };

    await act(async () => {
      root.render(<SectionHeroBanner section={section} theme={DEFAULT_STUDIO_THEME} previewViewport="desktop" />);
    });

    const heroNode = container.querySelector('[data-testid="hero-model-editorial-split"]') as HTMLElement;
    expect(heroNode.style.borderRadius).toBe("40px 8px 40px 0px");
    expect((container.querySelector('[data-testid="hero-badge-pill"]') as HTMLElement).textContent).toContain("COLLECTION PRIVÉE");
    expect((container.querySelector('[data-testid="hero-pure-photo-img"]') as HTMLImageElement).style.filter).toContain("brightness");
    expect((container.querySelector('[data-testid="hero-single-cta-btn"]') as HTMLAnchorElement).style.borderRadius).toBe("14px");

    // Vérifier les 4 autres modèles de bannière (cinema-full, arch-palace, atelier-collage, bento-hero) + 2ème bouton CTA
    const models = ["cinema-full", "arch-palace", "atelier-collage", "bento-hero"] as const;
    for (const modelId of models) {
      const modelSection: CustomPageSection<"hero_banner"> = {
        ...section,
        settings: {
          ...settings,
          heroLayout: modelId,
          imageZoomDesktop: 1.3,
          innerPaddingPx: 28,
          diptychGapPx: 24,
          showSecondaryCta: true,
          secondaryCtaText: "Voir Lookbook",
          secondaryCtaBgColor: "#FFFFFF",
          secondaryCtaTextColor: "#111827",
        },
      };
      await act(async () => {
        root.render(<SectionHeroBanner section={modelSection} theme={DEFAULT_STUDIO_THEME} previewViewport="desktop" />);
      });
      expect(container.querySelector(`[data-testid="hero-model-${modelId}"]`)).not.toBeNull();
      const secBtn = container.querySelector('[data-testid="hero-secondary-cta-btn"]') as HTMLAnchorElement;
      expect(secBtn).not.toBeNull();
      expect(secBtn.textContent).toContain("Voir Lookbook");
    }
  });

  it("2. Navigation par étape dans HeroContentEditor (1. Forme, 2. Couleurs, 3. Photo, 4. Bouton) isole les contrôles", async () => {
    let settings: Record<string, unknown> = { title: "Collection Automne", imageUrl: "", heroLayout: "editorial-split" };
    const handleSettingsChange = (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => {
      settings = typeof fieldOrPatch === "object" ? { ...settings, ...fieldOrPatch } : { ...settings, [fieldOrPatch]: value };
    };

    await act(async () => {
      root.render(<HeroContentEditor sectionType="hero_banner" settings={settings} products={[]} inputClass="input" labelClass="label" onSettingsChange={handleSettingsChange} />);
    });

    expect(container.querySelector('[data-testid="hero-step-panel-1"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="hero-step-panel-2"]')).toBeNull();
    expect(container.querySelector('[data-testid="hero-inner-padding-slider"]')).not.toBeNull();

    await act(async () => { (container.querySelector('[data-testid="hero-toggle-per-corner-radius"]') as HTMLButtonElement).click(); });
    expect(settings.usePerCornerRadius).toBe(true);

    expect((container.querySelector('[data-testid="hero-step-tab-2"]') as HTMLButtonElement).disabled).toBe(true);
    await act(async () => { (container.querySelector('[data-testid="hero-save-step-btn"]') as HTMLButtonElement).click(); });

    expect(container.querySelector('[data-testid="hero-badge-bg-color"]')).not.toBeNull();
    await act(async () => { (container.querySelector('[data-testid="hero-toggle-corner-colors"]') as HTMLButtonElement).click(); });
    expect(settings.useCornerColors).toBe(true);

    await act(async () => { (container.querySelector('[data-testid="hero-save-step-btn"]') as HTMLButtonElement).click(); });
    await act(async () => { (container.querySelector('[data-testid="hero-filter-preset-bw-art"]') as HTMLButtonElement).click(); });
    expect(settings.imageFilterPreset).toBe("bw-art");
  });

  it("3. Matrice de Sélecteurs de Couleur par Élément (SectionElementColorMatrix) & Schéma 4 Étapes sur toutes les sections", async () => {
    let styles: CustomPageSectionStyles = {};
    const handleStylesChange = (fieldOrPatch: keyof CustomPageSectionStyles | Partial<CustomPageSectionStyles>, val?: unknown) => {
      styles = typeof fieldOrPatch === "object" ? { ...styles, ...fieldOrPatch } : { ...styles, [fieldOrPatch]: val };
    };

    await act(async () => {
      root.render(<SectionStyleTab sectionType="featured_products" styles={styles} theme={DEFAULT_STUDIO_THEME} onStylesChange={handleStylesChange} />);
    });

    await act(async () => { (container.querySelector('[data-testid="style-step-tab-1"]') as HTMLButtonElement).click(); });
    expect(container.querySelector('[data-testid="section-element-color-matrix"]')).not.toBeNull();
    for (const key of ["backgroundColor", "headingColor", "subtitleColor", "cardBgColor", "cardBorderColor", "priceColor", "badgeBgColor", "iconColor", "buttonBgColor"]) {
      expect(container.querySelector(`[data-testid="section-color-${key}"]`)).not.toBeNull();
    }

    await act(async () => { (container.querySelector('[data-testid="section-toggle-corner-colors"]') as HTMLButtonElement).click(); });
    expect(styles.useCornerColors).toBe(true);

    styles = {
      ...styles,
      usePerCornerRadius: true, borderRadiusTlPx: 36, borderRadiusTrPx: 12, borderRadiusBrPx: 36, borderRadiusBlPx: 4,
      headingColor: "#7C2D12", subtitleColor: "#9A3412", cardBgColor: "#FFFBEB", cardBorderColor: "#F59E0B",
      priceColor: "#B45309", buttonBgColor: "#1E293B", buttonBorderRadiusPx: 18, imageFilterPreset: "warm-editorial",
    };
    const collectionSection: CustomPageSection<"curated_collections"> = {
      id: "sec_coll_1", type: "curated_collections", title: "Nos Collections", isVisible: true, order: 1,
      settings: { title: "Collections", subtitle: "Sélection", collections: [{ id: "c1", title: "Été", imageUrl: "", productIds: [] }] },
      styles,
    };
    const computedContainer = buildSectionContainerStyle(collectionSection.styles, "#FFFFFF", "#17191C", DEFAULT_STUDIO_THEME) as Record<string, string>;
    expect(computedContainer.borderRadius).toBe("36px 12px 36px 4px");
    expect(computedContainer["--section-heading-color"]).toBe("#7C2D12");
    expect(computedContainer["--section-card-bg"]).toBe("#FFFBEB");
    expect(computedContainer["--section-price-color"]).toBe("#B45309");

    await act(async () => { root.render(<SectionContentAndTrust section={collectionSection} products={[]} theme={DEFAULT_STUDIO_THEME} />); });
    const imgEl = container.querySelector("img") as HTMLImageElement;
    expect(imgEl.src.startsWith("data:image/svg+xml")).toBe(true);
    expect(imgEl.style.filter).toContain("sepia(14%)");
  });

  it("4. Les 9 Thèmes Signatures (incluant Obsidienne Luxe Sombre) et le Studio 13 Couleurs fonctionnent sans résidu hardcodé", async () => {
    expect(ARTISTIC_STUDIO_PRESETS).toHaveLength(9);
    const darkTheme = ARTISTIC_STUDIO_PRESETS.find((p) => p.id === "horlogerie_prestige");
    expect(darkTheme?.theme.canvasColor).toBe("#0E1117");
    expect(darkTheme?.theme.buttonColor).toBe("#D4AF37");

    const dirtySection: CustomPageSection = {
      id: "s1", type: "featured_products", isVisible: true, order: 0,
      settings: { title: "P", ctaBgColor: "#000" } as CustomPageSection["settings"],
      styles: { headingColor: "#FF0000", cardBgColor: "#123456", buttonBgColor: "#000" },
    };
    const cleaned = stripHardcodedSectionColors([dirtySection]);
    expect(cleaned[0].styles.headingColor).toBeUndefined();
    expect(cleaned[0].styles.cardBgColor).toBeUndefined();

    await act(async () => { root.render(<ThemeColorPaletteTab theme={DEFAULT_STUDIO_THEME} onUpdateTheme={() => undefined} onErrorChange={() => undefined} />); });
    expect(container.querySelector('[data-testid="global-color-canvasColor"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="global-color-priceColor"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="global-color-buttonTextColor"]')).not.toBeNull();

    const faqSection: CustomPageSection = {
      id: "sec_faq", type: "faq_accordion", title: "FAQ", isVisible: true, order: 1,
      settings: { title: "FAQ", items: [{ question: "Q?", answer: "R." }] }, styles: { containerWidth: "contained" },
    };
    await act(async () => { root.render(<SectionInspectorPanel section={faqSection} sections={[faqSection]} products={[]} currentTheme={DEFAULT_STUDIO_THEME} onUpdateSection={() => undefined} />); });
    expect(container.querySelector('[data-testid="list-content-stepper"]')).not.toBeNull();
  });
});
