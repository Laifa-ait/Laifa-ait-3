// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { PagesInspectorPanel } from "../pages/Seller/StoreBuilder/components/context/PagesInspectorPanel";
import { ThemeArchetypesTab, ALL_ARCHETYPES } from "../pages/Seller/StoreBuilder/components/context/ThemeArchetypesTab";
import { resolveCoherentSectionIdsForPage } from "../pages/Seller/StoreBuilder/components/context/PageEditorDrawer";
import { buildSectorAwareSectionDefaults } from "../pages/Seller/StoreBuilder/constants/sectorCoherenceDefaults";
import { MediaInspectorPanel, findMediaUsageInSections } from "../pages/Seller/StoreBuilder/components/context/MediaInspectorPanel";
import { HeroContentEditor } from "../pages/Seller/StoreBuilder/components/inspector/content/HeroContentEditor";
import { buildStoreQualityReport } from "../pages/Seller/StoreBuilder/utils/storeQualityAuditor";
import { CustomPageSection, CustomPageTheme, SellerStoreConfig } from "../domains/seller/customPage.types";

const BASE_THEME: CustomPageTheme = {
  sector: "artisanat",
  primaryColor: "#023859",
  secondaryColor: "#18181B",
  canvasColor: "#FAF6F0",
  surfaceColor: "#FFFFFF",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

const SAMPLE_SECTIONS: CustomPageSection[] = [
  {
    id: "sec_hero_1",
    type: "hero_banner",
    title: "Bannière Principale",
    isVisible: true,
    order: 0,
    styles: {},
    settings: {
      title: "Créations Authentiques",
      subtitle: "Livraison 69 Wilayas",
      imageUrl: "https://cdn.olmart.dz/hero-main.webp",
      imageAlt: "Bannière artisanat algérien",
      ctaText: "Découvrir",
      ctaLink: "#catalog",
    },
  },
];

describe("Phase 4 — Outils de Construction (Pages, Templates, Médias, Variantes, Audit SEO)", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("1. PagesInspectorPanel affiche les 8 pages système et exige une confirmation avant suppression d'une page publiée", async () => {
    const onSaveConfig = vi.fn().mockResolvedValue(undefined);
    const storeConfig: SellerStoreConfig = {
      sellerId: "seller_1",
      shopName: "Maison Casbah",
      shopSlug: "maison-casbah",
      theme: BASE_THEME,
      seo: { metaTitle: "Maison Casbah Officiel", metaDescription: "Artisanat algérien livré dans les 69 Wilayas." },
      customPages: [
        {
          id: "page_lookbook",
          title: "Lookbook Printemps",
          slug: "lookbook-printemps",
          pageType: "custom",
          templateId: "editorial",
          isPublished: true,
          sectionIds: ["sec_hero_1"],
          seoTitle: "Lookbook Printemps | Maison Casbah",
          updatedAt: "2026-11-08T00:00:00Z",
        },
      ],
      updatedAt: "2026-11-08T00:00:00Z",
    };

    await act(async () => {
      root.render(
        <PagesInspectorPanel
          storeConfig={storeConfig}
          sections={SAMPLE_SECTIONS}
          onSaveConfig={onSaveConfig}
        />
      );
    });

    const sysGrid = container.querySelector('[data-testid="system-pages-grid"]');
    for (const label of ["Accueil", "Catalogue", "Collections", "À propos", "Contact", "FAQ", "Livraison", "Retours"]) {
      expect(sysGrid?.textContent).toContain(label);
    }

    const reqDeleteBtn = container.querySelector('[data-testid="request-delete-page-page_lookbook"]') as HTMLButtonElement;
    await act(async () => {
      reqDeleteBtn.click();
    });

    expect(onSaveConfig).not.toHaveBeenCalled();
    expect(container.querySelector('[data-testid="confirm-delete-page-banner-page_lookbook"]')?.textContent).toContain(
      "actuellement publiée"
    );

    const confirmBtn = container.querySelector('[data-testid="confirm-delete-page-btn-page_lookbook"]') as HTMLButtonElement;
    await act(async () => {
      confirmBtn.click();
    });
    expect(onSaveConfig).toHaveBeenCalledWith({ customPages: [] });
  });

  it("2. ThemeArchetypesTab propose les 9 univers métiers et bloque l'écrasement direct sans confirmation", async () => {
    const onSelectArchetype = vi.fn();
    const onApplyFullArchetype = vi.fn().mockResolvedValue(undefined);

    await act(async () => {
      root.render(
        <ThemeArchetypesTab
          theme={BASE_THEME}
          activeArchetypeId={null}
          sections={SAMPLE_SECTIONS}
          onSelectArchetype={onSelectArchetype}
          onApplyFullArchetype={onApplyFullArchetype}
        />
      );
    });

    const filterBar = container.querySelector('[data-testid="universe-filter-bar"]');
    for (const u of ["Mode Élégance", "Technologie", "Beauté", "Artisanat algérien", "Maison & Décoration", "Alimentation", "Sport", "Accessoires", "Produits Enfants"]) {
      expect(filterBar?.textContent).toContain(u);
    }

    const applyBtn = container.querySelector('[data-testid="apply-full-archetype-azur-prestige"]') as HTMLButtonElement;
    await act(async () => {
      applyBtn.click();
    });

    expect(onApplyFullArchetype).not.toHaveBeenCalled();
    expect(container.querySelector('[data-testid="confirm-apply-archetype-banner"]')).not.toBeNull();

    const confirmBtn = container.querySelector('[data-testid="confirm-apply-archetype-btn"]') as HTMLButtonElement;
    await act(async () => {
      confirmBtn.click();
    });

    expect(onApplyFullArchetype).toHaveBeenCalledTimes(1);
  });

  it("3. MediaInspectorPanel détecte une image utilisée dans une section et avertit le vendeur avant suppression", async () => {
    const onDeleteMedia = vi.fn().mockResolvedValue(undefined);
    expect(findMediaUsageInSections("https://cdn.olmart.dz/hero-main.webp", SAMPLE_SECTIONS)).toEqual([
      "Bannière Principale",
    ]);

    await act(async () => {
      root.render(
        <MediaInspectorPanel
          mediaGallery={[
            {
              id: "med_1",
              url: "https://cdn.olmart.dz/hero-main.webp",
              type: "image",
              name: "hero-main.webp",
              sizeBytes: 120 * 1024,
              uploadedAt: "2026-11-08T00:00:00Z",
            },
          ]}
          sections={SAMPLE_SECTIONS}
          onDeleteMedia={onDeleteMedia}
        />
      );
    });

    expect(container.querySelector('[data-testid="media-in-use-badge-med_1"]')?.textContent).toContain("Utilisé (1)");

    const card = container.querySelector('[data-testid="media-card-med_1"]') as HTMLDivElement;
    await act(async () => {
      card.click();
    });

    const reqDelete = container.querySelector('[data-testid="media-request-delete-btn"]') as HTMLButtonElement;
    await act(async () => {
      reqDelete.click();
    });

    expect(onDeleteMedia).not.toHaveBeenCalled();
    expect(container.querySelector('[data-testid="media-delete-confirm-banner"]')?.textContent).toContain(
      "Bannière Principale"
    );
  });

  it("4. HeroContentEditor bascule entre les 7 variantes compatibles et l'audit SEO valide les critères réels", async () => {
    const patches: Array<Record<string, unknown>> = [];

    await act(async () => {
      root.render(
        <HeroContentEditor
          sectionType="hero_banner"
          settings={SAMPLE_SECTIONS[0].settings as Record<string, unknown>}
          onSettingsChange={(fieldOrPatch, val) => {
            if (typeof fieldOrPatch === "object") patches.push(fieldOrPatch);
            else patches.push({ [fieldOrPatch]: val });
          }}
          inputClass="input"
          labelClass="label"
        />
      );
    });

    const techBtn = container.querySelector('[data-testid="hero-variant-tech-precision"]') as HTMLButtonElement;
    await act(async () => {
      techBtn.click();
    });

    expect(patches[0]).toMatchObject({ heroVariant: "tech-precision", heroLayout: "editorial-split" });

    const report = buildStoreQualityReport({
      sections: SAMPLE_SECTIONS,
      theme: BASE_THEME,
      products: [],
      shopName: "Maison Casbah",
      shopSlug: "maison-casbah",
    });
    expect(report.overallScore).toBeGreaterThan(40);
    expect(report.checks.find((c) => c.id === "contrast")?.status).toBe("pass");
    expect(report.checks.find((c) => c.id === "alt-media")?.status).toBe("pass");

    for (const arch of ALL_ARCHETYPES) {
      const generated = arch.generateSections();
      expect(generated.some((s) => s.type === "hero_banner")).toBe(true);
      expect(generated.some((s) => s.type === "featured_categories")).toBe(true);
    }
    const techCats = buildSectorAwareSectionDefaults("featured_categories", {}, "tech");
    expect((techCats.categories as Array<{ name: string }>)[0].name).toContain("PC Portables");
    const maisonCats = buildSectorAwareSectionDefaults("featured_categories", {}, "maison");
    expect((maisonCats.categories as Array<{ name: string }>)[0].name).toContain("Salon");
    expect(resolveCoherentSectionIdsForPage("editorial", SAMPLE_SECTIONS)).toEqual(["sec_hero_1"]);
  });
});

