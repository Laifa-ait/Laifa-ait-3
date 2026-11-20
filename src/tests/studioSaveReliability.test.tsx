// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { storeConfigSchema } from "../domains/seller/validators/storeLayout.schema";
import { StoreIdentityEditor } from "../pages/Seller/StoreBuilder/components/identity/StoreIdentityEditor";
import { StoreSettingsInspectorPanel } from "../pages/Seller/StoreBuilder/components/context/StoreSettingsInspectorPanel";
import { HeaderNavigationInspectorPanel } from "../pages/Seller/StoreBuilder/components/context/HeaderNavigationInspectorPanel";
import { ThemeInspectorPanel } from "../pages/Seller/StoreBuilder/components/context/ThemeInspectorPanel";
import { StudioTopBar } from "../pages/Seller/StoreBuilder/components/studio/StudioTopBar";
import { MobileStudioHeader } from "../pages/Seller/StoreBuilder/components/studio/MobileStudioHeader";
import { StudioRecoveryAndConflictBar } from "../pages/Seller/StoreBuilder/components/studio/StudioRecoveryAndConflictBar";
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

function setInputValue(input: HTMLInputElement, value: string) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

const baseStoreConfig: SellerStoreConfig = {
  sellerId: "seller_1",
  shopName: "Atelier Moderne",
  shopSlug: "atelier-moderne",
  wilaya: "Alger",
  commune: "Hydra",
  theme: {
    sector: "mode",
    primaryColor: "#0F172A",
    secondaryColor: "#334155",
    accentColor: "#2563EB",
    canvasColor: "#F8FAFC",
    surfaceColor: "#FFFFFF",
    textColor: "#0F172A",
    fontFamily: "Inter",
  },
  updatedAt: "2026-11-12T10:00:00.000Z",
};

describe("Studio Save Reliability & Controls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("1. storeConfigSchema accepts numeric preparationTimeHours and trims hex colors", () => {
    const parsed = storeConfigSchema.safeParse({
      shopName: "Atelier Moderne",
      theme: {
        sector: "mode",
        primaryColor: " #0F172A ",
        secondaryColor: "#334155",
        accentColor: "#2563EB",
        fontFamily: "Inter",
      },
      commerceConfig: {
        codEnabled: true,
        preparationTimeHours: 24,
      },
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.theme?.primaryColor).toBe("#0F172A");
      expect(parsed.data.commerceConfig?.preparationTimeHours).toBe("24");
    }
  });

  it("2. StoreIdentityEditor skips mount onLiveChange, guards empty slug, displays save error and recovers on retry", async () => {
    const onLiveChange = vi.fn();
    const onSave = vi
      .fn()
      .mockRejectedValueOnce(new Error("Slug déjà utilisé"))
      .mockResolvedValueOnce(undefined);

    const { container, unmount } = mount(
      <StoreIdentityEditor storeConfig={baseStoreConfig} onLiveChange={onLiveChange} onSave={onSave} />
    );

    expect(onLiveChange).not.toHaveBeenCalled();

    const slugInput = container.querySelector<HTMLInputElement>('input[placeholder="ma-boutique"]');
    expect(slugInput).not.toBeNull();
    act(() => {
      if (slugInput) setInputValue(slugInput, " ");
    });
    expect(onLiveChange).toHaveBeenCalled();
    const lastLiveCall = onLiveChange.mock.calls[onLiveChange.mock.calls.length - 1]?.[0] as Partial<SellerStoreConfig>;
    expect(lastLiveCall.shopSlug).toBe("atelier-moderne");

    const form = container.querySelector("form");
    await act(async () => {
      form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    expect(container.querySelector('[data-testid="identity-save-error"]')?.textContent).toContain("Slug déjà utilisé");

    await act(async () => {
      form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    expect(onSave).toHaveBeenCalledTimes(2);
    expect(container.querySelector('[data-testid="identity-save-error"]')).toBeNull();
    unmount();
  });

  it("3. StoreSettingsInspectorPanel & HeaderNavigationInspectorPanel show inline errors and recover on retry", async () => {
    const onSaveSettings = vi
      .fn()
      .mockRejectedValueOnce(new Error("Erreur validation paramètres"))
      .mockResolvedValueOnce(undefined);
    const settingsMount = mount(
      <StoreSettingsInspectorPanel storeConfig={baseStoreConfig} onSaveConfig={onSaveSettings} />
    );

    await act(async () => {
      settingsMount.container.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    expect(settingsMount.container.querySelector('[data-testid="settings-save-error"]')?.textContent).toContain(
      "Erreur validation paramètres"
    );
    await act(async () => {
      settingsMount.container.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    expect(settingsMount.container.querySelector('[data-testid="settings-save-error"]')).toBeNull();
    settingsMount.unmount();

    const onSaveHeader = vi
      .fn()
      .mockRejectedValueOnce(new Error("Erreur en-tête"))
      .mockResolvedValueOnce(undefined);
    const headerMount = mount(
      <HeaderNavigationInspectorPanel storeConfig={baseStoreConfig} onSaveConfig={onSaveHeader} />
    );
    await act(async () => {
      headerMount.container.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    expect(headerMount.container.querySelector('[data-testid="header-save-error"]')?.textContent).toContain("Erreur en-tête");
    await act(async () => {
      headerMount.container.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    expect(headerMount.container.querySelector('[data-testid="header-save-error"]')).toBeNull();
    headerMount.unmount();
  });

  it("4. ThemeInspectorPanel never locks theme-save-btn after error and succeeds on retry", async () => {
    const onSaveTheme = vi
      .fn()
      .mockRejectedValueOnce(new Error("Thème refusé"))
      .mockResolvedValueOnce(undefined);
    const { container, unmount } = mount(
      <ThemeInspectorPanel storeConfig={baseStoreConfig} currentTheme={baseStoreConfig.theme} onSaveTheme={onSaveTheme} />
    );

    const saveBtn = container.querySelector<HTMLButtonElement>('[data-testid="theme-save-btn"]');
    expect(saveBtn).not.toBeNull();
    await act(async () => {
      saveBtn?.click();
    });
    expect(container.textContent).toContain("Thème refusé");
    expect(saveBtn?.disabled).toBe(false);

    await act(async () => {
      saveBtn?.click();
    });
    expect(onSaveTheme).toHaveBeenCalledTimes(2);
    expect(container.textContent).not.toContain("Thème refusé");
    unmount();
  });

  it("5. StudioTopBar, MobileStudioHeader & StudioRecoveryAndConflictBar expose clickable Enregistrer & Retry controls", async () => {
    const onSaveDraft = vi.fn().mockResolvedValue(true);
    const onRetrySave = vi.fn().mockResolvedValue(true);

    const topBarMount = mount(
      <MemoryRouter>
        <StudioTopBar
          shopName="Atelier Moderne"
          saveStatus="unsaved"
          viewport="desktop"
          onSaveDraft={onSaveDraft}
          onPublish={vi.fn()}
        />
      </MemoryRouter>
    );
    const topSaveBtn = topBarMount.container.querySelector<HTMLButtonElement>('[data-testid="topbar-save-btn"]');
    expect(topSaveBtn).not.toBeNull();
    act(() => {
      topSaveBtn?.click();
    });
    expect(onSaveDraft).toHaveBeenCalledTimes(1);
    topBarMount.unmount();

    const mobileMount = mount(
      <MobileStudioHeader shopName="Atelier Moderne" saveStatus="unsaved" onSaveDraft={onSaveDraft} onPublish={vi.fn()} />
    );
    const mobileSaveBtn = mobileMount.container.querySelector<HTMLButtonElement>('[data-testid="mobile-save-btn"]');
    expect(mobileSaveBtn).not.toBeNull();
    act(() => {
      mobileSaveBtn?.click();
    });
    expect(onSaveDraft).toHaveBeenCalledTimes(2);
    mobileMount.unmount();

    const errMount = mount(
      <StudioRecoveryAndConflictBar
        saveStatus="error"
        lastSaveError="Validation Zod: slug invalide"
        onRetrySave={onRetrySave}
      />
    );
    expect(errMount.container.querySelector('[data-testid="studio-save-error-banner"]')?.textContent).toContain(
      "Validation Zod: slug invalide"
    );
    await act(async () => {
      errMount.container.querySelector<HTMLButtonElement>('[data-testid="studio-retry-save-btn"]')?.click();
    });
    expect(onRetrySave).toHaveBeenCalledTimes(1);
    errMount.unmount();
  });
});
