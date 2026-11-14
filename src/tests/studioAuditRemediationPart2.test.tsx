// @vitest-environment jsdom
import React, { act } from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createRoot, Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { MobileStudioBar } from "../pages/Seller/StoreBuilder/components/studio/MobileStudioBar";
import { SectionTreePanel } from "../pages/Seller/StoreBuilder/components/studio/SectionTreePanel";
import { ContactFooterContentEditor } from "../pages/Seller/StoreBuilder/components/inspector/content/ContactFooterContentEditor";
import { CatalogInspectorPanel } from "../pages/Seller/StoreBuilder/components/context/CatalogInspectorPanel";
import { buildSectorAwareSectionDefaults } from "../pages/Seller/StoreBuilder/constants/sectorCoherenceDefaults";
import { useStudioStore } from "../pages/Seller/StoreBuilder/store/useStudioStore";
import type { SellerStoreConfig } from "../domains/seller/customPage.types";

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
  socialLinks: {
    instagram: "@atelier.casbah",
  },
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

describe("Audit Remédiation P0/P1 — Coordonnées Footer, Erreur Catalogue & Parité Mobile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useStudioStore.getState().resetStepProgress();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("4. Pied de page contact_footer : zéro fausse coordonnée par défaut, alerte vide & import profil en 1 clic", () => {
    const sectorFooterDefaults = buildSectorAwareSectionDefaults("contact_footer", {}, "mode", "", []);
    expect(sectorFooterDefaults.shopPhone).toBe("");
    expect(sectorFooterDefaults.shopEmail).toBe("");
    expect(JSON.stringify(sectorFooterDefaults)).not.toMatch(/550 00 00 00|boutique\.dz/i);

    const onAddSection = vi.fn();
    const tree = mount(
      <SectionTreePanel
        sections={[]}
        selectedSectionId={null}
        navMode="sections"
        onSelectSection={vi.fn()}
        onReorder={vi.fn()}
        onToggleVisibility={vi.fn()}
        onDeleteSection={vi.fn()}
        onAddSection={onAddSection}
      />
    );
    const addFooterBtn = Array.from(tree.container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Activer le pied de page")
    );
    act(() => {
      addFooterBtn?.click();
    });
    expect(onAddSection).toHaveBeenCalledWith(
      "contact_footer",
      expect.objectContaining({ shopPhone: "", shopEmail: "", socialInstagram: "" }),
      "Pied de boutique & Contact"
    );
    tree.unmount();

    const onSettingsChange = vi.fn();
    const editor = mount(
      <ContactFooterContentEditor
        settings={{ shopPhone: "", shopEmail: "" }}
        storeConfig={SAMPLE_STORE_CONFIG}
        onSettingsChange={onSettingsChange}
        justSavedStep={null}
        isSavingStep={false}
        saveStepError={null}
        onPrev={vi.fn()}
        onSaveAndNext={vi.fn()}
        inputClass="input"
        labelClass="label"
      />
    );
    expect(editor.container.querySelector('[data-testid="contact-footer-missing-warning"]')).not.toBeNull();
    act(() => {
      editor.container.querySelector<HTMLButtonElement>('[data-testid="contact-footer-import-profile-btn"]')?.click();
    });
    expect(onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        shopPhone: "+213 551 23 45 67",
        shopEmail: "contact@atelier-casbah.dz",
        socialInstagram: "@atelier.casbah",
        wilaya: "Alger",
      })
    );
    editor.unmount();
  });

  it("5. Catalogue error/retry distinct de stock vide & parité MobileStudioBar Undo/Redo/Publish", () => {
    const onReloadCatalog = vi.fn();
    const catalogView = mount(
      <MemoryRouter>
        <CatalogInspectorPanel
          products={[]}
          catalogStatus="error"
          catalogError="Timeout serveur catalogue"
          onReloadCatalog={onReloadCatalog}
          sections={[]}
          storeConfig={SAMPLE_STORE_CONFIG}
          onUpdateSection={vi.fn()}
          onAddSection={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(catalogView.container.querySelector('[data-testid="catalog-load-error"]')?.textContent).toContain(
      "Timeout serveur catalogue"
    );
    expect(catalogView.container.textContent).not.toContain("Aucun produit en stock");
    act(() => {
      catalogView.container.querySelector<HTMLButtonElement>('[data-testid="catalog-load-retry-btn"]')?.click();
    });
    expect(onReloadCatalog).toHaveBeenCalledTimes(1);
    catalogView.unmount();

    const onUndo = vi.fn();
    const onRedo = vi.fn();
    const onPublish = vi.fn().mockResolvedValue(true);
    const mobileBar = mount(
      <MemoryRouter>
        <MobileStudioBar
          shopName="Atelier Casbah"
          isPublished={false}
          saveStatus="saved"
          canUndo={true}
          canRedo={true}
          onUndo={onUndo}
          onRedo={onRedo}
          mobileColumn="canvas"
          setMobileColumn={vi.fn()}
          navMode="identity"
          onSelectNavMode={vi.fn()}
          sections={[
            {
              id: "s1",
              type: "hero_banner",
              title: "Hero",
              isVisible: true,
              order: 0,
              settings: { title: "Hero", imageUrl: "" },
              styles: {},
            },
          ]}
          products={[]}
          catalogStatus="loaded"
          storeConfig={SAMPLE_STORE_CONFIG}
          onPublish={onPublish}
        />
      </MemoryRouter>
    );

    act(() => {
      mobileBar.container.querySelector<HTMLButtonElement>('[data-testid="mobile-undo-btn"]')?.click();
      mobileBar.container.querySelector<HTMLButtonElement>('[data-testid="mobile-redo-btn"]')?.click();
    });
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(onRedo).toHaveBeenCalledTimes(1);

    act(() => {
      mobileBar.container.querySelector<HTMLButtonElement>('[data-testid="mobile-publish-btn"]')?.click();
    });
    expect(mobileBar.container.querySelector('[data-testid="studio-publish-modal"]')).not.toBeNull();
    mobileBar.unmount();
  });
});
