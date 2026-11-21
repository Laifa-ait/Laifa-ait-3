// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildStoreQualityReport } from "../pages/Seller/StoreBuilder/utils/storeQualityAuditor";
import { evaluatePublishReadiness } from "../pages/Seller/StoreBuilder/utils/publishReadinessChecks";
import { PreviewAuditModal } from "../pages/Seller/StoreBuilder/components/preview/PreviewAuditModal";
import { StudioDirectPublishModal } from "../pages/Seller/StoreBuilder/components/topbar/StudioDirectPublishModal";
import { StudioHistoryModal } from "../pages/Seller/StoreBuilder/components/topbar/StudioHistoryModal";
import type { CustomPageSection, CustomPageTheme, SellerStoreConfig, StoreHistoryEntry } from "../domains/seller/customPage.types";

const BASE_THEME: CustomPageTheme = {
  sector: "artisanat",
  primaryColor: "#023859",
  secondaryColor: "#18181B",
  canvasColor: "#FAF6F0",
  surfaceColor: "#FFFFFF",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

const BASE_CONFIG: SellerStoreConfig = {
  sellerId: "seller_dz_1",
  shopName: "Maison Casbah",
  shopSlug: "maison-casbah",
  logoUrl: "https://cdn.olmart.dz/logo.png",
  wilaya: "16 - Alger",
  contacts: { phone: "0550123456", whatsapp: "213550123456" },
  commerceConfig: { codEnabled: true, freeShippingThresholdDZD: 8000, returnPolicyDays: 7 },
  seo: { metaTitle: "Maison Casbah Alger • Haute Maroquinerie", metaDescription: "Haute maroquinerie et artisanat algérien d'exception livré dans les 69 wilayas." },
  theme: BASE_THEME,
  updatedAt: "2026-03-01T10:00:00.000Z",
};

const HERO_SECTION: CustomPageSection<"hero_banner"> = {
  id: "sec_hero_1",
  type: "hero_banner",
  isVisible: true,
  order: 0,
  title: "Collection Automne",
  subtitle: "Savoir-faire algérien",
  styles: {},
  settings: {
    title: "Collection Automne",
    imageUrl: "https://cdn.olmart.dz/hero.jpg",
    bannerModel: "full-bleed-immersive",
    cinematicConfig: {
      image: { src: "https://cdn.olmart.dz/hero.jpg", alt: "Hero", zoom: 100, posX: 50, posY: 50, fit: "cover" },
      button: { label: "Découvrir", shape: "pill", size: "md", targetType: "catalog" },
    },
  },
};

const FEED_SECTION: CustomPageSection = {
  id: "sec_feed_1",
  type: "featured_products",
  isVisible: true,
  order: 1,
  title: "Nos Pièces Phares",
  styles: {},
  settings: { productIds: ["prod_1"], maxItems: 4 },
};

describe("Phase 9 — Qualité, Prépublication, Publication et Historique", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
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

  it("1. signale explicitement un catalogue en erreur comme 'Catalogue non vérifié' sans faux positif de stock vide", () => {
    const report = buildStoreQualityReport({
      sections: [HERO_SECTION, FEED_SECTION],
      theme: BASE_THEME,
      products: [],
      catalogStatus: "error",
      storeConfig: BASE_CONFIG,
    });
    const archCheck = report.checks.find((c) => c.id === "architecture");
    expect(archCheck).toBeDefined();
    expect(archCheck?.status).toBe("warn");
    expect(archCheck?.badgeText).toBe("Catalogue non vérifié");
    expect(archCheck?.summary).toContain("n'a pas pu être vérifié");
    expect(archCheck?.targetNav).toBe("catalog");
  });

  it("2. associe chaque contrôle qualité à un panneau ou une section cliquable dans PreviewAuditModal", async () => {
    const onClose = vi.fn();
    const navEvents: Array<{ mode?: string; sectionId?: string }> = [];
    const onNavEvent = (e: Event) => navEvents.push((e as CustomEvent).detail);
    window.addEventListener("studio:select-nav-mode", onNavEvent);
    window.addEventListener("studio:open-inspector-tab", onNavEvent);

    await act(async () => {
      root.render(
        <PreviewAuditModal
          isOpen={true}
          onClose={onClose}
          sections={[{ ...HERO_SECTION, settings: { title: "Collection Automne", imageUrl: "" } }, FEED_SECTION]}
          theme={BASE_THEME}
          products={[]}
          catalogStatus="error"
          storeConfig={{ ...BASE_CONFIG, shopSlug: "", seo: { metaTitle: "", metaDescription: "" } }}
        />
      );
    });

    expect(container.textContent).toContain("Catalogue non vérifié");

    const seoNavBtn = container.querySelector('[data-testid="audit-nav-seo"]') as HTMLButtonElement;
    expect(seoNavBtn).toBeTruthy();
    await act(async () => { seoNavBtn.click(); });
    expect(navEvents.some((d) => d.mode === "identity")).toBe(true);
    expect(onClose).toHaveBeenCalled();

    const mediaNavBtn = container.querySelector('[data-testid="audit-nav-alt-media"]') as HTMLButtonElement;
    expect(mediaNavBtn).toBeTruthy();
    await act(async () => { mediaNavBtn.click(); });
    expect(navEvents.some((d) => d.sectionId === "sec_hero_1")).toBe(true);

    window.removeEventListener("studio:select-nav-mode", onNavEvent);
    window.removeEventListener("studio:open-inspector-tab", onNavEvent);
  });

  it("3. distingue les problèmes bloquants (canPublish=false) des recommandations (canPublish=true) et génère le résumé", () => {
    const blockedReport = evaluatePublishReadiness({
      storeConfig: { ...BASE_CONFIG, shopName: "" },
      sections: [{ ...HERO_SECTION, isVisible: false }],
      products: [],
      catalogStatus: "error",
      draftRevision: 7,
      currentVersionNumber: 3,
      hasUnsavedChanges: true,
    });

    expect(blockedReport.canPublish).toBe(false);
    expect(blockedReport.blockers.map((b) => b.id)).toContain("no-visible-sections");
    expect(blockedReport.blockers.map((b) => b.id)).toContain("missing-identity");
    expect(blockedReport.warnings.map((w) => w.id)).toContain("catalog-load-error");
    expect(blockedReport.warnings.map((w) => w.id)).not.toContain("empty-catalog");
    expect(blockedReport.summary.catalogVerified).toBe(false);
    expect(blockedReport.summary.draftRevision).toBe(7);
    expect(blockedReport.summary.nextVersionNumber).toBe(4);
    expect(blockedReport.summary.hasUnsavedChanges).toBe(true);

    const readyWithWarnings = evaluatePublishReadiness({
      storeConfig: BASE_CONFIG,
      sections: [{ ...HERO_SECTION, settings: { title: "Collection Automne", imageUrl: "" } }, FEED_SECTION],
      products: [],
      catalogStatus: "loaded",
      draftRevision: 8,
      currentVersionNumber: 4,
    });

    expect(readyWithWarnings.canPublish).toBe(true);
    expect(readyWithWarnings.blockers).toHaveLength(0);
    expect(readyWithWarnings.warnings.map((w) => w.id)).toContain("empty-catalog");
    expect(readyWithWarnings.warnings.map((w) => w.id)).toContain("hero-missing-image-sec_hero_1");
  });

  it("4. conserve la note de version et affiche l'erreur si la publication échoue dans StudioDirectPublishModal", async () => {
    const onConfirm = vi.fn();
    const onNavigateToFix = vi.fn();
    const readiness = evaluatePublishReadiness({
      storeConfig: { ...BASE_CONFIG, shopDescription: "", seo: { metaTitle: "", metaDescription: "" } },
      sections: [HERO_SECTION, FEED_SECTION],
      products: [],
      catalogStatus: "loaded",
      draftRevision: 12,
      currentVersionNumber: 2,
      hasUnsavedChanges: true,
    });

    await act(async () => {
      root.render(
        <StudioDirectPublishModal
          isOpen={true}
          onClose={vi.fn()}
          changeSummary="Nouvelle bannière Plein Cadre Cinéma"
          setChangeSummary={vi.fn()}
          onConfirm={onConfirm}
          isPublishing={false}
          publishError="Conflit de révision (CONFLICT_NEWER_VERSION) lors de la publication : rév. serveur #13 vs soumise #12."
          readinessReport={readiness}
          onNavigateToFix={onNavigateToFix}
        />
      );
    });

    expect(container.querySelector('[data-testid="publish-summary-card"]')?.textContent).toContain("Cible v3 • rév. #12");
    expect(container.querySelector('[data-testid="publish-modal-error"]')?.textContent).toContain("CONFLICT_NEWER_VERSION");
    const textarea = container.querySelector("#publish-note-input") as HTMLTextAreaElement;
    expect(textarea.value).toBe("Nouvelle bannière Plein Cadre Cinéma");

    const seoFixBtn = container.querySelector('[data-testid="publish-warn-fix-missing-seo-meta"]') as HTMLButtonElement;
    await act(async () => { seoFixBtn.click(); });
    expect(onNavigateToFix).toHaveBeenCalledWith("settings");

    const confirmBtn = container.querySelector('[data-testid="confirm-publish-btn"]') as HTMLButtonElement;
    await act(async () => { confirmBtn.click(); });
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("5. trie l'historique du plus récent au plus ancien, affiche l'aperçu des sections et exige 2 étapes avant rollback", async () => {
    const onRollback = vi.fn().mockResolvedValue(false);
    const entries: StoreHistoryEntry[] = [
      {
        versionId: "1", versionNumber: 1, sellerId: "seller_dz_1", publishedAt: "2026-03-01T09:00:00.000Z",
        changeSummary: "Version initiale", snapshot: { versionNumber: 1, status: "published", updatedAt: "2026-03-01T09:00:00.000Z", sections: [HERO_SECTION] },
      },
      {
        versionId: "3", versionNumber: 3, sellerId: "seller_dz_1", publishedAt: "2026-03-03T14:00:00.000Z",
        changeSummary: "Ajout vitrine produits", snapshot: { versionNumber: 3, status: "published", updatedAt: "2026-03-03T14:00:00.000Z", sections: [HERO_SECTION, FEED_SECTION] },
      },
    ];

    await act(async () => {
      root.render(
        <StudioHistoryModal
          isOpen={true}
          onClose={vi.fn()}
          historyList={entries}
          currentPublishedVersion={3}
          draftSectionCount={3}
          hasUnsavedChanges={true}
          onRollback={onRollback}
        />
      );
    });

    expect(container.querySelector('[data-testid="history-draft-vs-published-banner"]')?.textContent).toContain("Brouillon actuel : 3 section(s) • Modifications locales en cours");
    expect(container.querySelector('[data-testid="history-version-card-3"]')?.textContent).toContain("En ligne");

    const cards = Array.from(container.querySelectorAll('[data-testid^="history-version-card-"]'));
    expect(cards[0].getAttribute("data-testid")).toBe("history-version-card-3");
    expect(cards[1].getAttribute("data-testid")).toBe("history-version-card-1");

    const previewToggle = container.querySelector('[data-testid="history-preview-toggle-1"]') as HTMLButtonElement;
    await act(async () => { previewToggle.click(); });
    expect(container.querySelector('[data-testid="history-sections-preview-1"]')?.textContent).toContain("Collection Automne");

    const restoreBtn = container.querySelector('[data-testid="history-restore-btn-1"]') as HTMLButtonElement;
    await act(async () => { restoreBtn.click(); });
    expect(onRollback).not.toHaveBeenCalled();

    const confirmBtn = container.querySelector('[data-testid="history-confirm-restore-1"]') as HTMLButtonElement;
    expect(confirmBtn).toBeTruthy();
    await act(async () => { confirmBtn.click(); });
    expect(onRollback).toHaveBeenCalledWith(1);
    expect(container.querySelector('[data-testid="history-rollback-error"]')).toBeTruthy();
  });
});
