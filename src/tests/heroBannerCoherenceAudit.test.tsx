// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { StoreSectionRenderer } from "../components/Store/sections/StoreSectionRenderer";
import { HeroContentEditor } from "../pages/Seller/StoreBuilder/components/inspector/content/HeroContentEditor";
import { DEFAULT_STUDIO_THEME } from "../pages/Seller/StoreBuilder/constants/sectorCoherenceDefaults";
import { CustomPageSection, HeroBannerSettings } from "../domains/seller/customPage.types";
import {
  resolveBannerEffectiveShadow,
  resolveHeroBorderCss,
  resolveHeroBoxShadowCss,
  resolveHeroImageFilterCss,
} from "../components/Store/sections/hero/heroVisualEffectsHelper";
import { buildCinematicOverlayCss } from "../components/Store/sections/CinematicBanner/cinematicBanner.helpers";
import { useStudioStore } from "../pages/Seller/StoreBuilder/store/useStudioStore";

const makeHeroSection = (
  settings: Partial<HeroBannerSettings>,
  styles: Record<string, unknown> = {}
): CustomPageSection<"hero_banner"> => ({
  id: "hero_audit_01",
  type: "hero_banner",
  title: "Bannière Audit",
  isVisible: true,
  order: 0,
  settings: {
    heroLayout: "cinema-full",
    title: "Collection Automne",
    subtitle: "Édition limitée",
    ctaText: "Découvrir",
    imageUrl: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200",
    ...settings,
  },
  styles,
});

describe("Audit & Refonte Complète du Système de Création de Bannière", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    useStudioStore.getState().resetStepProgress();
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("1. Mode Plein bord (0px marge) fonctionne sur cinema-full ET editorial-split même avec ombre/arrondi/ancien paddingX, et mode Flottante détache la carte", async () => {
    const cinemaFull = makeHeroSection(
      { heroLayout: "cinema-full", containerMode: "full", bannerShadow: "floating", borderRadiusPx: 0 },
      { paddingX: 32, containerWidth: "full" }
    );
    await act(async () => {
      root.render(<StoreSectionRenderer section={cinemaFull} theme={DEFAULT_STUDIO_THEME} isEditable={false} />);
    });
    const sectionEl = container.querySelector('[data-banner-presentation="full-bleed"]') as HTMLElement;
    expect(sectionEl).not.toBeNull();
    expect(sectionEl.style.paddingLeft).toBe("");
    expect(sectionEl.style.paddingRight).toBe("");
    expect(sectionEl.firstElementChild?.className).toContain("w-full px-0");

    const splitFull = makeHeroSection(
      { heroLayout: "editorial-split", containerMode: "full", fullTopWidth: true, bannerShadow: "lg" },
      { paddingX: 24 }
    );
    await act(async () => {
      root.render(<StoreSectionRenderer section={splitFull} theme={DEFAULT_STUDIO_THEME} isEditable={false} />);
    });
    const splitEl = container.querySelector('[data-banner-presentation="full-bleed"]') as HTMLElement;
    expect(splitEl).not.toBeNull();
    expect(splitEl.style.paddingLeft).toBe("");
    expect(splitEl.firstElementChild?.className).toContain("w-full px-0");

    const floatingHero = makeHeroSection({
      heroLayout: "editorial-split",
      bannerFloating: true,
      containerMode: "contained",
      bannerShadow: "floating",
      bannerShadowColor: "#2563EB",
    });
    await act(async () => {
      root.render(<StoreSectionRenderer section={floatingHero} theme={DEFAULT_STUDIO_THEME} isEditable={false} />);
    });
    const floatWrapper = container.querySelector('[data-banner-presentation="floating"]') as HTMLElement;
    expect(floatWrapper).not.toBeNull();
    const splitCard = container.querySelector('[data-testid="hero-model-editorial-split"]') as HTMLElement;
    expect(splitCard.style.boxShadow).toContain("37, 99, 235");
  });

  it("2. Couleur d'ombre personnalisée + désactivation ON/OFF + bordure désactivable + filtres photo après Rétablir", () => {
    const coloredShadow = resolveHeroBoxShadowCss("lg", "#0F172A", "#E11D48", true);
    expect(coloredShadow).toContain("rgba(225, 29, 72");
    expect(resolveHeroBoxShadowCss("lg", "#0F172A", "#E11D48", false)).toBeUndefined();

    expect(
      resolveBannerEffectiveShadow(
        { heroLayout: "cinema-full", bannerShadow: "floating", bannerShadowEnabled: false, bannerShadowColor: "#E11D48" },
        DEFAULT_STUDIO_THEME
      )
    ).toBeUndefined();

    expect(resolveHeroBorderCss({ heroLayout: "editorial-split", bannerBorderWidthPx: 0 }, false)).toBe("none");
    expect(resolveHeroBorderCss({ heroLayout: "editorial-split", bannerBorderWidthPx: 2, bannerBorderColor: "#10B981" }, false)).toBe(
      "2px solid #10B981"
    );

    // Après "Rétablir", les sliders sont à 100/100/100/0 -> les presets doivent continuer à s'appliquer !
    const bwAfterReset = resolveHeroImageFilterCss({
      heroLayout: "cinema-full",
      imageFilterPreset: "bw-art",
      imageBrightness: 100,
      imageContrast: 100,
      imageSaturation: 100,
      imageSepia: 0,
    });
    expect(bwAfterReset).toContain("saturate(0%)");
    expect(bwAfterReset).toContain("contrast(116%)");

    // Voile de lisibilité teinté avec couleur personnalisée
    const tintedVeil = buildCinematicOverlayCss(
      { preset: "medium", intensity: 50, direction: "left-right", zone: "directional-edge" },
      "center-left",
      "#1E3A8A"
    );
    expect(tintedVeil.bannerOverlayBackground).toContain("rgba(30, 58, 138");
  });

  it("3. Contrôles Inspecteur Bannière : 3 modes largeur, ombre ON/OFF, voile teinte + auto-zone, inverser contraste cinema-full, grille 9 positions", async () => {
    let settings: Record<string, unknown> = {
      heroLayout: "cinema-full",
      title: "Atelier",
      subtitle: "Édition",
      ctaText: "Voir",
      containerMode: "full",
      fullTopWidth: true,
      overlayOpacity: 40,
      overlayEnabled: true,
    };
    const onSettingsChange = (patchOrField: string | Record<string, unknown>, val?: unknown) => {
      settings = typeof patchOrField === "object" ? { ...settings, ...patchOrField } : { ...settings, [patchOrField]: val };
    };
    const renderEditor = async () => {
      await act(async () => {
        root.render(
          <HeroContentEditor
            sectionType="hero_banner"
            settings={settings}
            products={[]}
            storeTheme={DEFAULT_STUDIO_THEME}
            inputClass="input"
            labelClass="label"
            onSettingsChange={onSettingsChange}
          />
        );
      });
    };

    await renderEditor();
    // Bascule Plein bord -> Largeur site (doit désactiver fullTopWidth !)
    await act(async () => {
      (container.querySelector('[data-testid="hero-width-contained-btn"]') as HTMLButtonElement).click();
    });
    expect(settings.containerMode).toBe("contained");
    expect(settings.fullTopWidth).toBe(false);
    expect(settings.bannerFloating).toBe(false);

    // Bascule Flottante
    await renderEditor();
    await act(async () => {
      (container.querySelector('[data-testid="hero-width-floating-btn"]') as HTMLButtonElement).click();
    });
    expect(settings.bannerFloating).toBe(true);
    expect(settings.bannerShadow).toBe("floating");

    // Désactivation ombre via le bouton ON/OFF
    await renderEditor();
    await act(async () => {
      (container.querySelector('[data-testid="hero-shadow-enabled-toggle"]') as HTMLButtonElement).click();
    });
    expect(settings.bannerShadowEnabled).toBe(false);

    // Passer à l'étape 2 (Couleurs & Voile)
    await act(async () => {
      (container.querySelector('[data-testid="hero-save-step-btn"]') as HTMLButtonElement).click();
    });
    await renderEditor();

    // Choisir une direction de voile doit basculer zone "text-only" -> "directional-edge"
    const dirSelect = container.querySelector('[data-testid="hero-veil-direction-select"]') as HTMLSelectElement;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")?.set?.call(dirSelect, "left-right");
      dirSelect.dispatchEvent(new Event("change", { bubbles: true }));
    });
    const cfg = settings.cinematicConfig as { overlay: { zone: string; direction: string } };
    expect(cfg.overlay.direction).toBe("left-right");
    expect(cfg.overlay.zone).toBe("directional-edge");

    // Inverser contraste sur cinema-full -> passe en voile clair givré + texte foncé
    await renderEditor();
    await act(async () => {
      (container.querySelector('[data-testid="hero-invert-colors-btn"]') as HTMLButtonElement).click();
    });
    expect(settings.overlayColor).toBe("#FFFFFF");
    expect(settings.titleColor).toBe("#0F172A");

    // Étape 3 -> Étape 4 : clic sur Milieu D synchronise textAlignment = "right"
    await act(async () => {
      (container.querySelector('[data-testid="hero-save-step-btn"]') as HTMLButtonElement).click();
    });
    await renderEditor();
    await act(async () => {
      (container.querySelector('[data-testid="hero-save-step-btn"]') as HTMLButtonElement).click();
    });
    await renderEditor();
    await act(async () => {
      (container.querySelector('[data-testid="hero-pos9-center-right"]') as HTMLButtonElement).click();
    });
    expect(settings.textPosition9).toBe("center-right");
    expect(settings.textAlignment).toBe("right");
  });

  it("4. HeroArch respecte archShape sans écrasement par frameShape et répartit 50-50 de façon symétrique (col-span-6)", async () => {
    const archSection = makeHeroSection(
      { heroLayout: "arch-palace", archShape: "capsule", splitProportion: "50-50", ctaText: "" },
      { frameShape: "rounded" }
    );
    await act(async () => {
      root.render(<StoreSectionRenderer section={archSection} theme={DEFAULT_STUDIO_THEME} isEditable={false} />);
    });
    const archEl = container.querySelector('[data-testid="hero-model-arch-palace"]') as HTMLElement;
    expect(archEl).not.toBeNull();
    // 50-50 doit utiliser @2xl:col-span-6 sur les deux colonnes
    const symmetricCols = Array.from(archEl.querySelectorAll("div")).filter((el) =>
      el.className.includes("@2xl:col-span-6")
    );
    expect(symmetricCols.length).toBe(2);
    // CTA vidé -> aucun bouton affiché (pas de fallback "Découvrir")
    expect(container.querySelector('[data-testid="hero-single-cta-btn"]')).toBeNull();
  });
});
