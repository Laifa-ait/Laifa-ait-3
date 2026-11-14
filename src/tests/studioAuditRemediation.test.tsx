// @vitest-environment jsdom
import React, { act } from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createRoot, Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { StudioSidebar } from "../pages/Seller/StoreBuilder/components/studio/StudioSidebar";
import { MobileGuidedJourneyBar } from "../pages/Seller/StoreBuilder/components/studio/MobileGuidedJourneyBar";
import { HeroContentEditor } from "../pages/Seller/StoreBuilder/components/inspector/content/HeroContentEditor";
import { StudioTopBar } from "../pages/Seller/StoreBuilder/components/studio/StudioTopBar";
import { useStudioStore } from "../pages/Seller/StoreBuilder/store/useStudioStore";
import type { CustomPageSection, SellerStoreConfig } from "../domains/seller/customPage.types";

function mount(node: React.ReactElement): { container: HTMLDivElement; unmount: () => void } {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root: Root = createRoot(container);
  act(() => {
    root.render(node);
  });
  return {
    container,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

function setInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

const SAMPLE_STORE_CONFIG: SellerStoreConfig = {
  sellerId: "seller_audit_1",
  shopName: "Atelier Casbah",
  shopSlug: "atelier-casbah",
  wilaya: "Alger",
  commune: "Hydra",
  contacts: {
    phone: "+213 551 23 45 67",
    email: "contact@atelier-casbah.dz",
  },
  socialLinks: { instagram: "@atelier.casbah" },
  theme: {
    sector: "artisanat",
    primaryColor: "#B85B35",
    secondaryColor: "#1C2A39",
    accentColor: "#D4AF37",
    fontFamily: "Inter",
  },
  seo: { metaTitle: "Atelier Casbah", metaDescription: "Artisanat algérois" },
  updatedAt: "2026-11-12T10:00:00.000Z",
};

describe("Audit Remédiation P0/P1 — Parcours Guidé & Publication Asynchrone", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useStudioStore.getState().resetStepProgress();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("1. Parcours guidé Desktop & Mobile : bloque l'avance sur échec/rejet et débloque après succès", async () => {
    let navMode: "identity" | "theme" | "sections" | "settings" = "identity";
    const onSelectNavMode = vi.fn((mode: string) => {
      navMode = mode as typeof navMode;
    });
    const onSaveDraft = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockRejectedValueOnce(new Error("Erreur réseau brouillon"))
      .mockResolvedValueOnce(2);

    const desktop = mount(
      <StudioSidebar navMode={navMode} onSelectNavMode={onSelectNavMode} onSaveDraft={onSaveDraft} />
    );

    const step2Desktop = desktop.container.querySelector<HTMLButtonElement>('[data-testid="studio-journey-step-2"]');
    expect(step2Desktop?.disabled).toBe(true);

    await act(async () => {
      desktop.container.querySelector<HTMLButtonElement>('[data-testid="studio-save-and-advance-btn"]')?.click();
    });
    expect(useStudioStore.getState().activeStudioStep).toBe(1);
    expect(useStudioStore.getState().unlockedStudioStep).toBe(1);
    expect(desktop.container.querySelector('[data-testid="studio-step-save-error"]')).not.toBeNull();
    expect(step2Desktop?.disabled).toBe(true);
    desktop.unmount();

    const mobile = mount(
      <MobileGuidedJourneyBar navMode={navMode} onSelectNavMode={onSelectNavMode} onSaveDraft={onSaveDraft} />
    );
    await act(async () => {
      mobile.container.querySelector<HTMLButtonElement>('[data-testid="mobile-save-and-advance-btn"]')?.click();
    });
    expect(useStudioStore.getState().activeStudioStep).toBe(1);
    expect(mobile.container.querySelector('[data-testid="mobile-step-save-error"]')?.textContent).toContain(
      "Erreur réseau brouillon"
    );

    await act(async () => {
      mobile.container.querySelector<HTMLButtonElement>('[data-testid="mobile-save-and-advance-btn"]')?.click();
    });
    expect(useStudioStore.getState().activeStudioStep).toBe(2);
    expect(useStudioStore.getState().unlockedStudioStep).toBe(2);
    expect(onSelectNavMode).toHaveBeenCalledWith("theme");
    expect(mobile.container.querySelector('[data-testid="mobile-step-save-error"]')).toBeNull();
    mobile.unmount();
  });

  it("2. HeroContentEditor (StepWizardFooter) : garde l'étape 1 ouverte et affiche step-save-error si onSaveStep échoue", async () => {
    const onSaveStep = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockRejectedValueOnce(new Error("Conflit révision serveur"))
      .mockResolvedValueOnce(5);

    const { container, unmount } = mount(
      <HeroContentEditor
        sectionId="hero_audit_1"
        sectionType="hero_banner"
        settings={{ title: "Maison d'Alger", imageUrl: "", heroLayout: "editorial-split" }}
        products={[]}
        onSettingsChange={vi.fn()}
        onSaveStep={onSaveStep}
        inputClass="input"
        labelClass="label"
      />
    );

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="hero-save-step-btn"]')?.click();
    });
    expect(container.querySelector('[data-testid="hero-step-panel-1"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="step-save-error"]')).not.toBeNull();
    expect(container.querySelector<HTMLButtonElement>('[data-testid="hero-step-tab-2"]')?.disabled).toBe(true);

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="hero-save-step-btn"]')?.click();
    });
    expect(container.querySelector('[data-testid="hero-step-panel-1"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="step-save-error"]')?.textContent).toContain(
      "Conflit révision serveur"
    );

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="hero-save-step-btn"]')?.click();
    });
    expect(container.querySelector('[data-testid="hero-step-panel-2"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="step-save-error"]')).toBeNull();
    unmount();
  });

  it("3. Modale de publication : verrouille pendant l'envoi, conserve erreur/note si échec, bloque sans section et ferme sur true", async () => {
    let resolvePendingPublish: ((val: boolean) => void) | undefined;
    const onPublish = vi
      .fn()
      .mockImplementationOnce(() => new Promise<boolean>((resolve) => { resolvePendingPublish = resolve; }))
      .mockRejectedValueOnce(new Error("Erreur 500 serveur publication"))
      .mockResolvedValueOnce(true);

    const validSections: CustomPageSection[] = [
      {
        id: "sec_1",
        type: "hero_banner",
        title: "Hero",
        isVisible: true,
        order: 0,
        settings: { title: "Atelier Casbah", imageUrl: "https://example.com/hero.jpg" },
        styles: {},
      },
    ];

    const blocked = mount(
      <MemoryRouter>
        <StudioTopBar
          shopName="Atelier Casbah"
          sections={[]}
          products={[]}
          catalogStatus="loaded"
          storeConfig={SAMPLE_STORE_CONFIG}
          saveStatus="saved"
          viewport="desktop"
          onPublish={onPublish}
        />
      </MemoryRouter>
    );
    act(() => {
      blocked.container.querySelector<HTMLButtonElement>('[data-testid="topbar-publish-btn"]')?.click();
    });
    expect(blocked.container.querySelector('[data-testid="publish-blockers-list"]')).not.toBeNull();
    expect(blocked.container.querySelector<HTMLButtonElement>('[data-testid="confirm-publish-btn"]')?.disabled).toBe(true);
    blocked.unmount();

    const { container, unmount } = mount(
      <MemoryRouter>
        <StudioTopBar
          shopName="Atelier Casbah"
          sections={validSections}
          products={[]}
          catalogStatus="loaded"
          storeConfig={SAMPLE_STORE_CONFIG}
          saveStatus="saved"
          viewport="desktop"
          onPublish={onPublish}
        />
      </MemoryRouter>
    );

    act(() => {
      container.querySelector<HTMLButtonElement>('[data-testid="topbar-publish-btn"]')?.click();
    });
    const noteInput = container.querySelector<HTMLTextAreaElement>("#publish-note-input");
    act(() => {
      if (noteInput) setInputValue(noteInput, "Collection Automne 2026");
    });

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="confirm-publish-btn"]')?.click();
    });
    const confirmBtn = container.querySelector<HTMLButtonElement>('[data-testid="confirm-publish-btn"]');
    expect(confirmBtn?.disabled).toBe(true);
    expect(confirmBtn?.textContent).toContain("Publication en cours...");
    await act(async () => {
      confirmBtn?.click();
    });
    expect(onPublish).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolvePendingPublish?.(false);
    });
    expect(container.querySelector('[data-testid="studio-publish-modal"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="publish-modal-error"]')).not.toBeNull();
    expect(container.querySelector<HTMLTextAreaElement>("#publish-note-input")?.value).toBe("Collection Automne 2026");

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="confirm-publish-btn"]')?.click();
    });
    expect(container.querySelector('[data-testid="studio-publish-modal"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="publish-modal-error"]')?.textContent).toContain(
      "Erreur 500 serveur publication"
    );

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="confirm-publish-btn"]')?.click();
    });
    expect(container.querySelector('[data-testid="studio-publish-modal"]')).toBeNull();
    unmount();
  });
});
