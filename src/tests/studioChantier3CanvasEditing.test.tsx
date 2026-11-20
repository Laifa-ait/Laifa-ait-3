// @vitest-environment jsdom
import React, { act, useState } from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createRoot, Root } from "react-dom/client";
import { LiveCanvasPreview } from "../pages/Seller/StoreBuilder/components/LiveCanvasPreview";
import { SectionTreePanel } from "../pages/Seller/StoreBuilder/components/studio/SectionTreePanel";
import { SectionInspectorPanel } from "../pages/Seller/StoreBuilder/components/inspector/SectionInspectorPanel";
import { buildSectionMutationHandlers } from "../pages/Seller/StoreBuilder/hooks/studioSectionMutations";
import { DEFAULT_STUDIO_THEME } from "../pages/Seller/StoreBuilder/constants/sectorCoherenceDefaults";
import { useStudioStore } from "../pages/Seller/StoreBuilder/store/useStudioStore";
import type { CustomPageSection } from "../domains/seller/customPage.types";

const INITIAL_SECTIONS: CustomPageSection[] = [
  {
    id: "sec_hero_0",
    type: "hero_banner",
    title: "Bannière Principale",
    isVisible: true,
    order: 0,
    settings: {
      heroLayout: "editorial-split",
      title: "Collection Automne",
      subtitle: "Créations artisanales",
      ctaText: "Commander maintenant",
      showCta: true,
      imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800",
    },
    styles: {},
  },
  {
    id: "sec_prod_1",
    type: "featured_products",
    title: "Articles Phares",
    isVisible: true,
    order: 1,
    settings: { title: "Nos Articles", productIds: [] },
    styles: {},
  },
];

describe("Chantier 3 — Manipulation Directe sur le Canevas Central (+ Insérer une section ici & Clic Photo/Bouton)", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    useStudioStore.getState().resetStepProgress();
    useStudioStore.getState().selectSection("sec_hero_0", null);
    useStudioStore.getState().setIsInteractiveMode(false);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("1. Affiche '+ Insérer une section ici' entre chaque bloc sur l'aperçu central et insère la nouvelle section à la position exacte", async () => {
    let latestSections: CustomPageSection[] = INITIAL_SECTIONS;

    const StudioHarness: React.FC = () => {
      const [sections, setSections] = useState<CustomPageSection[]>(INITIAL_SECTIONS);
      const [selectedId, setSelectedId] = useState<string | null>("sec_hero_0");
      latestSections = sections;

      const mutations = buildSectionMutationHandlers({
        sections,
        selectedSectionId: selectedId,
        setSelectedSectionId: setSelectedId,
        pushState: (next) => setSections(next),
        activeSector: "mode",
        products: [],
      });

      return (
        <div>
          <SectionTreePanel
            sections={sections}
            selectedSectionId={selectedId}
            onSelectSection={setSelectedId}
            onReorder={mutations.reorderSections}
            onToggleVisibility={mutations.toggleVisibility}
            onDeleteSection={mutations.deleteSection}
            onAddSection={mutations.addSection}
          />
          <LiveCanvasPreview
            sections={sections}
            theme={DEFAULT_STUDIO_THEME}
            products={[]}
            selectedSectionId={selectedId}
            onSelectSection={setSelectedId}
          />
        </div>
      );
    };

    await act(async () => {
      root.render(<StudioHarness />);
    });

    const insertAfter0Btn = container.querySelector(
      '[data-testid="canvas-insert-section-btn-0"]'
    ) as HTMLButtonElement;
    const insertAfter1Btn = container.querySelector(
      '[data-testid="canvas-insert-section-btn-1"]'
    ) as HTMLButtonElement;
    expect(insertAfter0Btn).not.toBeNull();
    expect(insertAfter1Btn).not.toBeNull();
    expect(insertAfter0Btn.textContent).toContain("Insérer une section ici");

    // Clic sur "+ Insérer une section ici" entre la section 0 (Hero) et la section 1 (Produits) -> insertAtIndex = 1
    await act(async () => {
      insertAfter0Btn.click();
    });

    // Attendre le chargement lazy de AddSectionModal
    let posBadge: Element | null = null;
    for (let i = 0; i < 15 && !posBadge; i++) {
      await act(async () => { await new Promise((r) => setTimeout(r, 25)); });
      posBadge = document.body.querySelector('[data-testid="add-section-insert-position-badge"]');
    }
    expect(posBadge).not.toBeNull();
    expect(posBadge?.textContent).toContain("#2");

    const addCategoriesOption = document.body.querySelector(
      '[data-testid="add-section-option-featured_categories"]'
    ) as HTMLButtonElement;
    expect(addCategoriesOption).not.toBeNull();

    await act(async () => {
      addCategoriesOption.click();
    });

    expect(latestSections.length).toBe(3);
    expect(latestSections[0].type).toBe("hero_banner");
    expect(latestSections[1].type).toBe("featured_categories");
    expect(latestSections[2].type).toBe("featured_products");
    expect(latestSections.map((s) => s.order)).toEqual([0, 1, 2]);
  });

  it("2. Le clic direct sur une image ou un bouton du canevas ouvre instantanément le sélecteur de photo ou l'éditeur de bouton (même en mode Guidé)", async () => {
    const CanvasAndInspectorHarness: React.FC = () => {
      const [sections, setSections] = useState<CustomPageSection[]>(INITIAL_SECTIONS);
      const selectedSection = sections[0];

      return (
        <div>
          <LiveCanvasPreview
            sections={sections}
            theme={DEFAULT_STUDIO_THEME}
            products={[]}
            selectedSectionId={selectedSection.id}
            onSelectSection={(id) => useStudioStore.getState().selectSection(id)}
          />
          <SectionInspectorPanel
            section={selectedSection}
            sections={sections}
            products={[]}
            storeConfig={null}
            onSelectSection={() => undefined}
            onUpdateSection={(id, patch) =>
              setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
            }
          />
        </div>
      );
    };

    await act(async () => {
      root.render(<CanvasAndInspectorHarness />);
    });

    // Par défaut en mode Guidé, l'inspecteur est sur l'étape 1 (1. Format)
    expect(useStudioStore.getState().studioExperienceMode).toBe("guided");
    expect(container.querySelector('[data-testid="hero-step-panel-1"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="hero-step-panel-3"]')).toBeNull();

    // 1. Clic direct sur l'image de la bannière sur le canevas -> débloque et ouvre immédiatement l'étape 3 (Sélecteur de photo)
    const canvasPhoto = container.querySelector('[data-testid="hero-pure-photo"]') as HTMLElement;
    expect(canvasPhoto).not.toBeNull();
    await act(async () => {
      canvasPhoto.click();
    });

    expect(useStudioStore.getState().selectedSubElement).toBe("background");
    expect(container.querySelector('[data-testid="hero-step-panel-3"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="studio-image-picker-root"]')).not.toBeNull();

    // 2. Clic direct sur le bouton CTA sur le canevas -> débloque et ouvre immédiatement l'étape 4 (Éditeur de bouton)
    const canvasCtaBtn = container.querySelector('[data-testid="hero-single-cta-btn"]') as HTMLElement;
    expect(canvasCtaBtn).not.toBeNull();
    await act(async () => { canvasCtaBtn.click(); });

    expect(useStudioStore.getState().selectedSubElement).toBe("ctaPrimary");
    expect(container.querySelector('[data-testid="hero-step-panel-4"]')).not.toBeNull();
    const ctaBox = container.querySelector('[data-testid="hero-cta-editor-box"]');
    expect(ctaBox?.getAttribute("data-cta-focused")).toBe("true");
  });

  it("3. Chantier 4 : Affiche les maquettes visuelles réalistes des 5 modèles, l'aperçu couleurs en direct avec inversion 1-clic et les combinaisons en français simple", async () => {
    let latestSection: CustomPageSection = INITIAL_SECTIONS[0];
    const Chantier4Harness: React.FC = () => {
      const [section, setSection] = useState<CustomPageSection>(INITIAL_SECTIONS[0]);
      latestSection = section;
      return (
        <SectionInspectorPanel
          section={section}
          sections={[section]}
          products={[]}
          storeConfig={null}
          onSelectSection={() => undefined}
          onUpdateSection={(_id, patch) => setSection((prev) => ({ ...prev, ...patch }))}
        />
      );
    };

    await act(async () => { root.render(<Chantier4Harness />); });

    for (const modelId of ["cinema-full", "editorial-split", "arch-palace", "atelier-collage", "bento-hero"]) {
      const svg = container.querySelector(`[data-testid="hero-wireframe-${modelId}"]`);
      expect(svg?.querySelector("circle")).not.toBeNull();
      expect(svg?.querySelector("path")).not.toBeNull();
    }

    const saveStep1Btn = container.querySelector('[data-testid="hero-save-step-btn"]') as HTMLButtonElement;
    await act(async () => { saveStep1Btn.click(); });

    const liveColorPreview = container.querySelector('[data-testid="hero-color-live-mini-preview"]') as HTMLElement;
    expect(liveColorPreview).not.toBeNull();
    expect(liveColorPreview.textContent).toContain("Collection Automne");
    expect(liveColorPreview.textContent).toContain("Commander maintenant");

    const invertBtn = container.querySelector('[data-testid="hero-invert-colors-btn"]') as HTMLButtonElement;
    await act(async () => { invertBtn.click(); });
    expect((latestSection.settings as Record<string, unknown>).paletteId).toBe("custom");

    const designTabBtn = container.querySelector('[data-testid="inspector-tab-style"]') as HTMLButtonElement;
    await act(async () => { designTabBtn.click(); });

    const scheme1Btn = container.querySelector('[data-testid="section-color-scheme-scheme_1"]');
    expect(scheme1Btn?.textContent).toContain("1 • Fond Clair");
  });
});




