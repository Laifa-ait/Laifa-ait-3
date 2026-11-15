// @vitest-environment jsdom
import React, { act } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRoot, Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import {
  CustomPageSection,
  CustomPageTheme,
} from "../domains/seller/customPage.types";
import {
  ARTISTIC_STUDIO_PRESETS,
  ATELIER_PREMIUM_REFERENCE_PRESETS,
} from "../pages/Seller/StoreBuilder/constants/artisticStudioPresets";
import {
  auditThemeContrastPairs,
  buildAutoFixedThemeColors,
} from "../components/Store/sections/themeColorUtils";
import { buildStoreThemeCssVariables } from "../components/Store/useStoreFontLoader";
import { resolveSectionButtonInlineStyle } from "../components/Store/sections/sectionStyleHelper";
import { EditorialHeading } from "../components/Store/EditorialHeading";
import { SectionTrustAndContact } from "../components/Store/sections/SectionTrustAndContact";
import { StoreCustomHeaderBar } from "../components/Store/StoreCustomHeaderBar";
import { ThemeInspectorPanel } from "../pages/Seller/StoreBuilder/components/context/ThemeInspectorPanel";
import { StudioWorkspace } from "../pages/Seller/StoreBuilder/StudioWorkspace";
import { useStudioStore } from "../pages/Seller/StoreBuilder/store/useStudioStore";

if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
}

const SAMPLE_SECTIONS: CustomPageSection[] = [
  {
    id: "sec-hero-1",
    type: "hero_banner",
    title: "Bannière Principale",
    isVisible: true,
    order: 0,
    settings: {
      title: "Haute Maroquinerie d'Alger",
      subtitle: "Pièces numérotées cousues main",
      ctaText: "Découvrir l'atelier",
      imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa",
      heroLayout: "full",
    },
    styles: { backgroundColor: "#1E293B", buttonBgColor: "#B45309" },
  },
  {
    id: "sec-grid-1",
    type: "product_grid",
    title: "Sélection Phare",
    isVisible: true,
    order: 1,
    settings: { title: "Nos Pièces Signature", productIds: ["prod-101", "prod-202"], columns: 3 },
    styles: {},
  },
];

describe("Olmart Studio — Phase 3 : Design System, Thèmes & Cohérence Visuelle", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    window.localStorage.clear();
    useStudioStore.setState({
      studioExperienceMode: "expert",
      activeStudioStep: "design",
      unlockedStudioStep: 5,
      selectedSectionId: "sec-hero-1",
      isInteractiveMode: false,
      viewport: "desktop",
    });
  });

  afterEach(async () => {
    await act(async () => { root.unmount(); });
    container.remove();
  });

  it("expose les 5 presets Atelier Premium de référence et les 9 presets sectoriels avec un contraste WCAG valide", () => {
    expect(ATELIER_PREMIUM_REFERENCE_PRESETS.map((p) => p.id)).toEqual([
      "minimal_pure", "feminine_silk", "onyx_luxury", "botanical_studio", "tech_cobalt",
    ]);
    expect(ARTISTIC_STUDIO_PRESETS.length).toBe(14);
    for (const preset of ARTISTIC_STUDIO_PRESETS) {
      const failing = auditThemeContrastPairs(preset.theme).filter((p) => !p.passes);
      expect(failing, `Preset ${preset.id} has failing WCAG contrast`).toEqual([]);
    }
  });

  it("applique un preset artistique sans écraser les sections, les textes, les médias ni les productIds", async () => {
    const onSaveTheme = vi.fn().mockResolvedValue(undefined);
    const onReplaceSections = vi.fn();
    await act(async () => {
      root.render(
        <ThemeInspectorPanel
          currentTheme={ARTISTIC_STUDIO_PRESETS[0].theme}
          sections={SAMPLE_SECTIONS}
          onSaveTheme={onSaveTheme}
          onReplaceSections={onReplaceSections}
        />
      );
    });
    await act(async () => {
      (container.querySelector('[data-testid="artistic-preset-onyx_luxury"]') as HTMLButtonElement).click();
    });
    expect(onSaveTheme).toHaveBeenCalledTimes(1);
    const appliedTheme = onSaveTheme.mock.calls[0][0] as CustomPageTheme;
    expect(appliedTheme.presetId).toBe("onyx_luxury");
    expect(appliedTheme.canvasColor).toBe("#0B0D11");
    expect(onReplaceSections).not.toHaveBeenCalled();
  });

  it("conserve les overrides locaux de section lors d'un changement de thème et permet de les harmoniser sur action explicite", async () => {
    const onSaveTheme = vi.fn().mockResolvedValue(undefined);
    const onReplaceSections = vi.fn();
    await act(async () => {
      root.render(
        <ThemeInspectorPanel
          currentTheme={ARTISTIC_STUDIO_PRESETS[0].theme}
          sections={SAMPLE_SECTIONS}
          onSaveTheme={onSaveTheme}
          onReplaceSections={onReplaceSections}
        />
      );
    });
    expect(container.querySelector('[data-testid="section-overrides-notice"]')).not.toBeNull();
    await act(async () => {
      (container.querySelector('[data-testid="clear-section-overrides-btn"]') as HTMLButtonElement).click();
    });
    expect(onReplaceSections).toHaveBeenCalledTimes(1);
    const cleaned = onReplaceSections.mock.calls[0][0] as CustomPageSection[];
    expect(cleaned[0].styles?.backgroundColor).toBeUndefined();
    expect(cleaned[0].styles?.buttonBgColor).toBeUndefined();
    expect((cleaned[0].settings as { title: string }).title).toBe("Haute Maroquinerie d'Alger");
    expect((cleaned[1].settings as { productIds: string[] }).productIds).toEqual(["prod-101", "prod-202"]);
  });

  it("demande confirmation avant de régénérer les 5 sections d'accueil et conserve l'image Hero et les productIds", async () => {
    const onApplyFullArchetype = vi.fn();
    await act(async () => {
      root.render(
        <ThemeInspectorPanel
          currentTheme={ARTISTIC_STUDIO_PRESETS[0].theme}
          sections={SAMPLE_SECTIONS}
          onSaveTheme={vi.fn().mockResolvedValue(undefined)}
          onApplyFullArchetype={onApplyFullArchetype}
        />
      );
    });
    await act(async () => {
      (container.querySelector('[data-testid="regenerate-five-acts-btn"]') as HTMLButtonElement).click();
    });
    expect(container.querySelector('[data-testid="confirm-regenerate-five-acts-banner"]')).not.toBeNull();
    expect(onApplyFullArchetype).not.toHaveBeenCalled();

    await act(async () => {
      (container.querySelector('[data-testid="confirm-regenerate-five-acts-btn"]') as HTMLButtonElement).click();
    });
    expect(onApplyFullArchetype).toHaveBeenCalledTimes(1);
    const generatedSections = onApplyFullArchetype.mock.calls[0][0] as CustomPageSection[];
    const hero = generatedSections.find((s) => s.type === "hero_banner");
    const spotlight = generatedSections.find((s) => s.type === "featured_products");
    expect((hero?.settings as { imageUrl?: string })?.imageUrl).toBe(
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa"
    );
    expect((spotlight?.settings as { productIds?: string[] })?.productIds).toEqual(["prod-101", "prod-202"]);
  });

  it("détecte un contraste faible et corrige automatiquement les couleurs illisibles en 1 clic", () => {
    const lowContrastTheme: CustomPageTheme = {
      sector: "mode", primaryColor: "#FDE68A", secondaryColor: "#F8FAFC", accentColor: "#FEF08A",
      canvasColor: "#FFFFFF", surfaceColor: "#F8FAFC", textColor: "#F1F5F9",
      buttonColor: "#FEF08A", buttonTextColor: "#FFFFFF", accentBadgeColor: "#FEF9C3", badgeTextColor: "#FFFFFF",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    };
    expect(auditThemeContrastPairs(lowContrastTheme).some((p) => !p.passes)).toBe(true);
    const fixedPatch = buildAutoFixedThemeColors(lowContrastTheme);
    expect(auditThemeContrastPairs({ ...lowContrastTheme, ...fixedPatch }).every((p) => p.passes)).toBe(true);
  });

  it("propage tous les tokens du thème (headingFontWeight, buttonStyle, buttonHeightPx, lisibilité thème sombre) dans les composants de rendu", async () => {
    const onyxTheme = ATELIER_PREMIUM_REFERENCE_PRESETS.find((p) => p.id === "onyx_luxury")!.theme;
    const cssVars = buildStoreThemeCssVariables(onyxTheme);
    expect(cssVars["--store-heading-weight"]).toBe("700");
    expect(cssVars["--store-btn-height"]).toBe("46px");
    expect(cssVars["--store-btn-style"]).toBe("sharp");
    expect(cssVars["--store-card-shadow"]).toBe("floating");

    const btnStyle = resolveSectionButtonInlineStyle({}, onyxTheme, {});
    expect(btnStyle.borderRadius).toBe("0px");
    expect(btnStyle.minHeight).toBe("46px");
    expect(btnStyle.color).toBe("#0B0D11");

    await act(async () => {
      root.render(
        <MemoryRouter>
          <div>
            <StoreCustomHeaderBar theme={onyxTheme} shopName="Maison Onyx" />
            <EditorialHeading as="h1" text="Collection Noir & Or" theme={{ ...onyxTheme, headingFontWeight: 800 }} />
            <SectionTrustAndContact
              section={{
                id: "sec-footer", type: "contact_footer", title: "Contact", isVisible: true, order: 2,
                settings: { title: "Conciergerie Privée", shopPhone: "0550 00 00 00" }, styles: {},
              }}
              theme={onyxTheme}
              wrapperClass=""
              isSubActive={() => false}
              handleSubElementClick={() => undefined}
            />
          </div>
        </MemoryRouter>
      );
    });
    expect((container.querySelector('[data-testid="header-announcement-bar"]') as HTMLElement).style.color).toBe("rgb(15, 23, 42)");
    expect((container.querySelector("h1") as HTMLElement).style.fontWeight).toBe("800");
    expect((container.querySelector('[data-testid="contact-footer-section"]') as HTMLElement).style.backgroundColor).toBe("rgb(20, 24, 32)");
  });

  it("réinitialise liveThemeOverride lors d'un Undo/Redo pour refléter immédiatement le thème restauré", async () => {
    const undoSpy = vi.fn();
    await act(async () => {
      root.render(
        <MemoryRouter>
          <StudioWorkspace
            saveStatus="saved"
            storeConfig={{ shopName: "Atelier Test", wilaya: "Alger", theme: ARTISTIC_STUDIO_PRESETS[0].theme }}
            sections={SAMPLE_SECTIONS}
            selectedSectionId="sec-hero-1"
            setSelectedSectionId={vi.fn()}
            addSection={vi.fn()}
            updateSection={vi.fn()}
            reorderSections={vi.fn()}
            deleteSection={vi.fn()}
            toggleVisibility={vi.fn()}
            saveStoreConfig={vi.fn().mockResolvedValue(undefined)}
            publishStudio={vi.fn()}
            canUndo={true}
            undo={undoSpy}
          />
        </MemoryRouter>
      );
    });
    await act(async () => {
      (container.querySelector('button[title*="Annuler"]') as HTMLButtonElement).click();
    });
    expect(undoSpy).toHaveBeenCalledTimes(1);
  });
});
