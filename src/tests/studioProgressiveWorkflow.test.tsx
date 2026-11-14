// @vitest-environment jsdom
import React, { act } from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createRoot, Root } from "react-dom/client";
import { SectionTreePanel } from "../pages/Seller/StoreBuilder/components/studio/SectionTreePanel";
import { HeroContentEditor } from "../pages/Seller/StoreBuilder/components/inspector/content/HeroContentEditor";
import { CategoryContentEditor } from "../pages/Seller/StoreBuilder/components/inspector/content/CategoryContentEditor";
import { ProductSelectionEditor } from "../pages/Seller/StoreBuilder/components/inspector/content/ProductSelectionEditor";
import { SectionStyleTab } from "../pages/Seller/StoreBuilder/components/inspector/SectionStyleTab";
import { ListContentEditor } from "../pages/Seller/StoreBuilder/components/inspector/content/ListContentEditor";
import { InfoContentEditor } from "../pages/Seller/StoreBuilder/components/inspector/content/InfoContentEditor";
import { DEFAULT_STUDIO_THEME } from "../pages/Seller/StoreBuilder/constants/sectorCoherenceDefaults";
import { useStudioStore } from "../pages/Seller/StoreBuilder/store/useStudioStore";
import { StudioNavMode } from "../pages/Seller/StoreBuilder/components/studio/studio.types";
import type { CustomPageSection } from "../domains/seller/customPage.types";

describe("Studio Vendeur Progressif : 1 Étape à la Fois & Déblocage après Enregistrement", () => {
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

  const clickByTestId = async (testId: string) => {
    await act(async () => {
      (container.querySelector(`[data-testid="${testId}"]`) as HTMLButtonElement).click();
    });
  };

  const isDisabled = (testId: string) =>
    (container.querySelector(`[data-testid="${testId}"]`) as HTMLButtonElement).disabled;

  it("1. Parcours Gauche Guidé : masque la liste de sections hors étape 3 et débloque 1->2->3->4 uniquement après enregistrement", async () => {
    const saveDraftMock = vi.fn();
    let currentNav: StudioNavMode = "identity";
    const sampleSections: CustomPageSection[] = [
      {
        id: "sec_hero_1", type: "hero_banner", title: "Bannière Principale", isVisible: true, order: 0,
        settings: { title: "Bienvenue", imageUrl: "" }, styles: {},
      },
      {
        id: "sec_cat_1", type: "featured_categories", title: "Catégories", isVisible: true, order: 1,
        settings: { title: "Rayons", categories: [{ id: "c1", name: "Mode", slug: "mode", title: "Mode", imageUrl: "" }] }, styles: {},
      },
    ];

    const renderTree = async () => {
      await act(async () => {
        root.render(
          <SectionTreePanel
            sections={sampleSections}
            selectedSectionId="sec_hero_1"
            navMode={currentNav}
            onSelectNavMode={(mode) => { currentNav = mode as StudioNavMode; }}
            onSelectSection={() => undefined}
            onReorder={() => undefined}
            onToggleVisibility={() => undefined}
            onDeleteSection={() => undefined}
            onAddSection={() => undefined}
            onSaveDraft={saveDraftMock}
          />
        );
      });
    };

    await renderTree();
    expect(container.querySelector('[data-testid="studio-guided-sidebar"]')).not.toBeNull();
    expect(isDisabled("studio-journey-step-2")).toBe(true);
    expect(isDisabled("studio-journey-step-3")).toBe(true);
    expect(isDisabled("studio-journey-step-4")).toBe(true);
    expect(container.textContent).not.toContain("Vitrine (2)");

    await clickByTestId("studio-save-and-advance-btn");
    expect(saveDraftMock).toHaveBeenCalledTimes(1);
    expect(currentNav).toBe("theme");
    await renderTree();
    expect(isDisabled("studio-journey-step-2")).toBe(false);
    expect(isDisabled("studio-journey-step-3")).toBe(true);
    expect(container.textContent).not.toContain("Vitrine (2)");

    await clickByTestId("studio-save-and-advance-btn");
    expect(saveDraftMock).toHaveBeenCalledTimes(2);
    expect(currentNav).toBe("sections");
    await renderTree();
    expect(container.textContent).toContain("Vitrine (2)");
    expect(isDisabled("studio-journey-step-4")).toBe(true);

    await clickByTestId("studio-save-and-advance-btn");
    expect(currentNav).toBe("settings");
    await renderTree();
    expect(isDisabled("studio-journey-step-4")).toBe(false);

    await clickByTestId("studio-experience-mode-toggle");
    expect(container.textContent).toContain("Accès Libre");
    expect(container.textContent).toContain("Vitrine (2)");

    await clickByTestId("studio-experience-mode-toggle");
    expect(container.querySelector('[data-testid="studio-guided-sidebar"]')).not.toBeNull();
  });

  it("2. Inspecteur Bannière (Hero) & Rayons (Catégories) : n'affichent qu'1 étape active et débloquent la suivante au clic Enregistrer", async () => {
    const saveStepMock = vi.fn();

    await act(async () => {
      root.render(
        <HeroContentEditor
          sectionId="hero_s1" sectionType="hero_banner"
          settings={{ title: "Maison d'Alger", imageUrl: "", heroLayout: "editorial-split" }}
          products={[]} onSettingsChange={() => undefined} onSaveStep={saveStepMock}
          inputClass="input" labelClass="label"
        />
      );
    });

    expect(container.querySelector('[data-testid="hero-step-panel-1"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="hero-step-panel-2"]')).toBeNull();
    expect(isDisabled("hero-step-tab-2")).toBe(true);

    await clickByTestId("hero-save-step-btn");
    expect(saveStepMock).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[data-testid="hero-step-panel-1"]')).toBeNull();
    expect(container.querySelector('[data-testid="hero-step-panel-2"]')).not.toBeNull();
    expect(isDisabled("hero-step-tab-3")).toBe(true);

    await clickByTestId("step-prev-btn");
    expect(container.querySelector('[data-testid="hero-step-panel-1"]')).not.toBeNull();

    const catSaveMock = vi.fn();
    await act(async () => {
      root.render(
        <CategoryContentEditor
          sectionId="cat_s1"
          settings={{ title: "Rayons", categories: [{ id: "c1", title: "Chaussures", imageUrl: "" }] }}
          products={[]} onSettingsChange={() => undefined} onSaveStep={catSaveMock}
          inputClass="input"
        />
      );
    });

    expect(container.querySelector('[data-testid="category-step-panel-1"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="category-step-panel-2"]')).toBeNull();
    expect(isDisabled("category-step-tab-2")).toBe(true);

    await clickByTestId("category-save-step-btn");
    expect(catSaveMock).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[data-testid="category-step-panel-2"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="category-step-panel-3"]')).toBeNull();

    await clickByTestId("category-save-step-btn");
    expect(container.querySelector('[data-testid="category-step-panel-3"]')).not.toBeNull();

    await clickByTestId("category-save-step-btn");
    expect(container.querySelector('[data-testid="category-step-panel-4"]')).not.toBeNull();
  });

  it("3. Produits, Style, Listes (FAQ/Collections) & Infos : aucune étape future accessible sans enregistrer", async () => {
    const prodSave = vi.fn();
    await act(async () => {
      root.render(
        <ProductSelectionEditor
          sectionId="prod_s1" sectionType="featured_products"
          settings={{ title: "Vedettes", productIds: [] }}
          products={[]} onSettingsChange={() => undefined} onSaveStep={prodSave}
          inputClass="input" labelClass="label"
        />
      );
    });
    expect(container.querySelector('[data-testid="product-step-panel-1"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="product-step-panel-2"]')).toBeNull();
    expect(isDisabled("product-step-tab-2")).toBe(true);
    await clickByTestId("product-save-step-btn");
    expect(prodSave).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[data-testid="product-step-panel-2"]')).not.toBeNull();

    const styleSave = vi.fn();
    await act(async () => {
      root.render(
        <SectionStyleTab
          sectionId="style_s1" sectionType="featured_products"
          styles={{}} theme={DEFAULT_STUDIO_THEME}
          onStylesChange={() => undefined} onSaveStep={styleSave}
        />
      );
    });
    expect(container.querySelector('[data-testid="section-element-color-matrix"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="section-corners-shadows-box"]')).toBeNull();
    expect(isDisabled("style-step-tab-2")).toBe(true);
    await clickByTestId("style-save-step-btn");
    expect(styleSave).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[data-testid="section-corners-shadows-box"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="section-element-color-matrix"]')).toBeNull();

    const listSave = vi.fn();
    await act(async () => {
      root.render(
        <ListContentEditor
          sectionId="faq_s1" sectionType="faq_accordion"
          settings={{ title: "FAQ", items: [{ question: "Q1?", answer: "R1" }] }}
          products={[]} onSettingsChange={() => undefined} onSaveStep={listSave}
          inputClass="input"
        />
      );
    });
    expect(isDisabled("list-step-tab-2")).toBe(true);
    await clickByTestId("list-save-step-btn");
    expect(listSave).toHaveBeenCalledTimes(1);
    expect(isDisabled("list-step-tab-2")).toBe(false);

    const infoSave = vi.fn();
    await act(async () => {
      root.render(
        <InfoContentEditor
          sectionId="story_s1" sectionType="brand_story"
          settings={{ heading: "Notre Histoire", bodyText: "Atelier fondé à Alger" }}
          products={[]} onSettingsChange={() => undefined} onSaveStep={infoSave}
          inputClass="input" labelClass="label"
        />
      );
    });
    expect(isDisabled("info-step-tab-2")).toBe(true);
    await clickByTestId("info-save-step-btn");
    expect(infoSave).toHaveBeenCalledTimes(1);
    expect(isDisabled("info-step-tab-2")).toBe(false);
  });
});
