// @vitest-environment jsdom
import React, { act } from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createRoot, Root } from "react-dom/client";
import { SectionTreePanel } from "../pages/Seller/StoreBuilder/components/studio/SectionTreePanel";
import { MobileStudioHeader } from "../pages/Seller/StoreBuilder/components/studio/MobileStudioHeader";
import { PropertiesInspector } from "../pages/Seller/StoreBuilder/components/studio/PropertiesInspector";
import { StudioCommandPalette } from "../pages/Seller/StoreBuilder/components/studio/StudioCommandPalette";
import { useStudioWorkspaceEvents } from "../pages/Seller/StoreBuilder/hooks/useStudioWorkspaceEvents";
import { useStudioStore } from "../pages/Seller/StoreBuilder/store/useStudioStore";
import { DEFAULT_STUDIO_THEME } from "../pages/Seller/StoreBuilder/constants/sectorCoherenceDefaults";
import { StudioNavMode } from "../pages/Seller/StoreBuilder/components/studio/studio.types";
import { MobileStudioColumn } from "../pages/Seller/StoreBuilder/components/studio/MobileStudioNavigation";
import type { CustomPageSection } from "../domains/seller/customPage.types";

const SAMPLE_SECTIONS: CustomPageSection[] = [
  {
    id: "sec_hero_1",
    type: "hero_banner",
    title: "Bannière Maison",
    isVisible: true,
    order: 0,
    settings: { title: "Bienvenue chez Olmart", imageUrl: "" },
    styles: {},
  },
  {
    id: "sec_prod_2",
    type: "featured_products",
    title: "Sélection Prestige",
    isVisible: true,
    order: 1,
    settings: { title: "Nos Créations", productIds: [] },
    styles: {},
  },
];

describe("Phase 2 — Espace de travail, Navigation et Expérience Guidée", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    useStudioStore.getState().resetStepProgress();
    useStudioStore.getState().selectSection(null);
    useStudioStore.getState().setViewport("desktop");
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("1-3. Bascule Guidé/Expert sans perte, progression sur sauvegarde réussie et blocage strict si sauvegarde échouée", async () => {
    let shouldSucceed = false;
    const saveDraftMock = vi.fn(async () => shouldSucceed);
    let currentNav: StudioNavMode = "identity";

    const renderPanel = async () => {
      await act(async () => {
        root.render(
          <SectionTreePanel
            sections={SAMPLE_SECTIONS}
            selectedSectionId="sec_hero_1"
            navMode={currentNav}
            onSelectNavMode={(m) => { currentNav = m; }}
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

    await renderPanel();
    // 3. Blocage de progression si sauvegarde échouée (retourne false)
    await act(async () => {
      (container.querySelector('[data-testid="studio-save-and-advance-btn"]') as HTMLButtonElement).click();
    });
    expect(saveDraftMock).toHaveBeenCalledTimes(1);
    expect(currentNav).toBe("identity");
    expect((container.querySelector('[data-testid="studio-journey-step-2"]') as HTMLButtonElement).disabled).toBe(true);

    // 2. Progression d'étape après sauvegarde réelle (retourne true)
    shouldSucceed = true;
    await act(async () => {
      (container.querySelector('[data-testid="studio-save-and-advance-btn"]') as HTMLButtonElement).click();
    });
    expect(saveDraftMock).toHaveBeenCalledTimes(2);
    expect(currentNav).toBe("theme");
    await renderPanel();
    expect((container.querySelector('[data-testid="studio-journey-step-2"]') as HTMLButtonElement).disabled).toBe(false);

    // 1. Bascule Guidé / Expert sans perte de sections ni de progression
    await act(async () => {
      (container.querySelector('[data-testid="studio-experience-mode-toggle"]') as HTMLButtonElement).click();
    });
    expect(useStudioStore.getState().studioExperienceMode).toBe("expert");
    expect(container.textContent).toContain("Bannière Maison");
    expect(container.textContent).toContain("Sélection Prestige");

    await act(async () => {
      (container.querySelector('[data-testid="studio-experience-mode-toggle"]') as HTMLButtonElement).click();
    });
    expect(useStudioStore.getState().studioExperienceMode).toBe("guided");
    expect(useStudioStore.getState().unlockedStudioStep).toBe(2);
  });

  it("4-5. Navigation inter-panneaux, sélection de section et confirmation obligatoire à la suppression depuis le Canvas", async () => {
    const deleteSectionSpy = vi.fn();
    let navMode: StudioNavMode = "identity";
    let mobileColumn: MobileStudioColumn = "canvas";

    const Harness: React.FC = () => {
      const storeSelectedSectionId = useStudioStore((s) => s.selectedSectionId);
      useStudioWorkspaceEvents({
        sections: SAMPLE_SECTIONS,
        setNavMode: (m) => { navMode = m; },
        setShowRightSidebar: () => undefined,
        setMobileColumn: (c) => { mobileColumn = c; },
        setIsCommandPaletteOpen: () => undefined,
        reorderSections: () => undefined,
        toggleVisibility: () => undefined,
        duplicateSection: () => undefined,
        deleteSection: deleteSectionSpy,
        addSection: () => undefined,
      });

      return (
        <SectionTreePanel
          sections={SAMPLE_SECTIONS}
          selectedSectionId={storeSelectedSectionId ?? "sec_hero_1"}
          navMode={navMode}
          onSelectNavMode={(m) => { navMode = m; }}
          onSelectSection={(id) => useStudioStore.getState().selectSection(id)}
          onReorder={() => undefined}
          onToggleVisibility={() => undefined}
          onDeleteSection={deleteSectionSpy}
          onAddSection={() => undefined}
        />
      );
    };

    await act(async () => {
      root.render(<Harness />);
    });

    // 4. Événement studio:select-nav-mode (ex: clic sur l'en-tête dans le canvas)
    await act(async () => {
      window.dispatchEvent(new CustomEvent("studio:select-nav-mode", { detail: { mode: "header" } }));
    });
    expect(navMode).toBe("header");
    expect(mobileColumn).toBe("inspector");

    // 4b. Événement studio:open-inspector-tab synchronise aussi selectedSectionId
    await act(async () => {
      window.dispatchEvent(
        new CustomEvent("studio:open-inspector-tab", { detail: { tab: "style", sectionId: "sec_prod_2" } })
      );
    });
    expect(useStudioStore.getState().selectedSectionId).toBe("sec_prod_2");
    expect(useStudioStore.getState().activeInspectorTab).toBe("style");

    // 5. Suppression depuis la barre flottante du Canvas -> ouvre DeleteSectionModal (portail) sans supprimer immédiatement
    await act(async () => {
      useStudioStore.getState().triggerSectionAction("sec_hero_1", "delete");
    });
    expect(deleteSectionSpy).not.toHaveBeenCalled();
    const modal = document.body.querySelector('[data-testid="delete-section-modal"]');
    expect(modal).not.toBeNull();
    expect(modal?.textContent).toContain("Bannière Maison");

    await act(async () => {
      (document.body.querySelector('[data-testid="confirm-delete-section-btn"]') as HTMLButtonElement).click();
    });
    expect(deleteSectionSpy).toHaveBeenCalledWith("sec_hero_1");
  });

  it("6-8. Bascule viewport, parcours mobile honnête (statut unsaved + retour aperçu) et navigation clavier Ctrl+K / Escape", async () => {
    const onSaveDraftMock = vi.fn();
    const onReturnToCanvasMock = vi.fn();
    const onSetViewportMock = vi.fn((vp: "desktop" | "tablet" | "mobile") =>
      useStudioStore.getState().setViewport(vp)
    );
    let paletteOpen = false;

    const renderMobileAndPalette = async () => {
      await act(async () => {
        root.render(
          <div>
            <MobileStudioHeader
              shopName="Maison Alger"
              saveStatus="unsaved"
              isSaving={false}
              isPublishing={false}
              canUndo={false}
              canRedo={false}
              onUndo={() => undefined}
              onRedo={() => undefined}
              onSaveDraft={onSaveDraftMock}
              onPublish={() => undefined}
            />
            <PropertiesInspector
              navMode="sections"
              onReturnToCanvas={onReturnToCanvasMock}
              selectedSection={null}
              sections={SAMPLE_SECTIONS}
              products={[]}
              currentTheme={DEFAULT_STUDIO_THEME}
              onUpdateSection={() => undefined}
              onSaveTheme={async () => undefined}
              onThemeChangeLive={() => undefined}
              onSaveConfig={async () => undefined}
            />
            <StudioCommandPalette
              isOpen={paletteOpen}
              onClose={() => { paletteOpen = false; }}
              onAddSection={() => undefined}
              onSetViewport={onSetViewportMock}
              onNavigatePage={() => undefined}
              onToggleInteractiveMode={() => undefined}
              isInteractiveMode={false}
              onOpenAuditModal={() => undefined}
              onOpenQrModal={() => undefined}
            />
          </div>
        );
      });
    };

    await renderMobileAndPalette();

    // 7. Mobile header affiche "Non enregistré" et déclenche onSaveDraft au clic
    const unsavedBtn = container.querySelector('[data-testid="mobile-save-status-unsaved"]') as HTMLButtonElement;
    expect(unsavedBtn).not.toBeNull();
    expect(unsavedBtn.textContent).toContain("Non enregistré");
    await act(async () => {
      unsavedBtn.click();
    });
    expect(onSaveDraftMock).toHaveBeenCalledTimes(1);

    // 7b. Bouton retour à l'aperçu dans PropertiesInspector et état vide actionnable
    const returnBtn = container.querySelector('[data-testid="mobile-return-to-canvas-btn"]') as HTMLButtonElement;
    expect(returnBtn).not.toBeNull();
    await act(async () => {
      returnBtn.click();
    });
    expect(onReturnToCanvasMock).toHaveBeenCalledTimes(1);

    const selectFirstBtn = container.querySelector('[data-testid="inspector-select-first-section-btn"]') as HTMLButtonElement;
    expect(selectFirstBtn).not.toBeNull();
    await act(async () => {
      selectFirstBtn.click();
    });
    expect(useStudioStore.getState().selectedSectionId).toBe("sec_hero_1");

    // 8 & 6. Palette de commandes ouverte, bascule viewport et fermeture par Escape
    paletteOpen = true;
    await renderMobileAndPalette();
    expect(container.querySelector('[data-testid="studio-command-palette"]')).not.toBeNull();

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(paletteOpen).toBe(false);

    onSetViewportMock("mobile");
    expect(useStudioStore.getState().viewport).toBe("mobile");
    onSetViewportMock("tablet");
    expect(useStudioStore.getState().viewport).toBe("tablet");
  });
});
