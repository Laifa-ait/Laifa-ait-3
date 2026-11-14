// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  checkAndRecordVipAttempt, clearAllVipAttemptsForTesting, evaluatePaidStudioSubscription,
  extractAllReferencedProductIds, isPubliclyVisibleProductStatus, isStorePasswordLocked,
  issueStoreVipAccessToken, resolveProductImagesList, resolveProductPrimaryImage, verifyStoreVipAccessToken,
} from "../security/storeVipAccessGuard";
import { useStudioSaveManager, StudioSaveManagerOptions } from "../pages/Seller/StoreBuilder/hooks/useStudioSaveManager";
import { useStudioUndoRedo, StudioUndoRedoOptions } from "../pages/Seller/StoreBuilder/hooks/useStudioUndoRedo";
import { useStudioStore } from "../pages/Seller/StoreBuilder/store/useStudioStore";
import { DEFAULT_STUDIO_SECTOR, DEFAULT_STUDIO_THEME } from "../pages/Seller/StoreBuilder/constants/sectorCoherenceDefaults";
import { resolveCategoryActiveCols, resolveAntiHoleSpanClass } from "../components/Store/sections/category/categoryResponsiveHelper";
import type { CustomPageSection, StoreConfig } from "../domains/seller/customPage.types";

const mockApiPut = vi.fn();
vi.mock("../lib/api", () => ({
  apiPut: (...args: unknown[]) => mockApiPut(...args),
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

function buildSampleConfig(overrides?: Partial<StoreConfig>): StoreConfig {
  return {
    sellerId: "seller_01",
    shopName: "Maison Casbah",
    shopSlug: "maison-casbah",
    theme: { ...DEFAULT_STUDIO_THEME },
    seo: { metaTitle: "Maison Casbah", metaDescription: "Artisanat" },
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

const sampleSection: CustomPageSection = {
  id: "sec_1",
  type: "hero_banner",
  title: "Hero",
  settings: { title: "Bonjour", imageUrl: "/img.jpg" },
  styles: {},
  isVisible: true,
  order: 0,
};

describe("Audit Studio Vendeur Olmart — Phases 1 à 5 (A1..A18 & B1..B7)", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    clearAllVipAttemptsForTesting();
    window.localStorage.clear();
    window.sessionStorage.clear();
    useStudioStore.setState({ isInteractiveMode: false, viewport: "desktop" });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => { root.unmount(); });
    container.remove();
  });

  describe("Phase 1 — Sécurité & Protection de la vitrine publique (A11, A12, A13, A14, A16, B2)", () => {
    it("A12: verrouille la boutique en mode password, émet un jeton HMAC lié à sellerId, refuse la réutilisation inter-boutiques et invalide après changement de secret", () => {
      const lockedConfig = buildSampleConfig({
        storeStatus: { mode: "password", passwordProtectionCode: "VIP-2026" },
      });
      expect(isStorePasswordLocked(lockedConfig)).toBe(true);
      expect(verifyStoreVipAccessToken(undefined, "seller_01", lockedConfig)).toBe(false);

      const issued = issueStoreVipAccessToken("seller_01", lockedConfig, 60_000);
      expect(issued).not.toBeNull();
      expect(verifyStoreVipAccessToken(issued!.token, "seller_01", lockedConfig)).toBe(true);
      expect(verifyStoreVipAccessToken(issued!.token, "seller_02", lockedConfig)).toBe(false);
      expect(verifyStoreVipAccessToken(`${issued!.token}x`, "seller_01", lockedConfig)).toBe(false);

      const rotatedConfig = buildSampleConfig({
        storeStatus: { mode: "password", passwordProtectionCode: "NEW-SECRET" },
      });
      expect(verifyStoreVipAccessToken(issued!.token, "seller_01", rotatedConfig)).toBe(false);
    });

    it("A12: limite les tentatives de force brute sur le code VIP (max 5 essais)", () => {
      for (let i = 0; i < 5; i++) {
        expect(checkAndRecordVipAttempt("192.0.2.10", "seller_01").allowed).toBe(true);
      }
      const sixth = checkAndRecordVipAttempt("192.0.2.10", "seller_01");
      expect(sixth.allowed).toBe(false);
      expect(sixth.retryAfterSec).toBeGreaterThan(0);
    });

    it("A13: extrait tous les productIds référencés dans featured_products, curated_collections, featured_categories et customPages", () => {
      const sections: CustomPageSection[] = [
        { id: "s1", type: "featured_products", settings: { productIds: ["p_feat_1", "p_feat_2"] }, styles: {}, isVisible: true, order: 0 },
        { id: "s2", type: "curated_collections", settings: { collections: [{ id: "c1", title: "Col", productIds: ["p_col_1"] }] }, styles: {}, isVisible: true, order: 1 },
        { id: "s3", type: "featured_categories", settings: { categories: [{ id: "cat1", name: "Rayon", slug: "rayon", productIds: ["p_cat_1", "p_cat_2"] }] }, styles: {}, isVisible: true, order: 2 },
      ];
      const extracted = extractAllReferencedProductIds(sections, [
        { id: "cp1", title: "Page", slug: "page", productIds: ["p_page_1"], updatedAt: "" },
      ]);
      expect(extracted).toEqual(["p_feat_1", "p_feat_2", "p_col_1", "p_cat_1", "p_cat_2", "p_page_1"]);
    });

    it("A14: evaluatePaidStudioSubscription ne retourne jamais true par défaut et vérifie le statut et l'expiration", () => {
      expect(evaluatePaidStudioSubscription({}, [])).toBe(false);
      expect(evaluatePaidStudioSubscription({ subscriptionStatus: "expired", subscriptionExpiresAt: "2020-01-01T00:00:00Z" }, [])).toBe(false);
      expect(evaluatePaidStudioSubscription({}, [{ status: "payment_confirmed", planSnapshot: { price: 2500 } }])).toBe(true);
      expect(evaluatePaidStudioSubscription({}, [{ status: "payment_confirmed", planSnapshot: { price: 2500 }, expiresAt: "2020-01-01T00:00:00Z" }])).toBe(false);
    });

    it("A16 & B2: filtre positivement les statuts produits (rejette pending/draft/inconnu) et résout image + images[]", () => {
      expect(isPubliclyVisibleProductStatus("active")).toBe(true);
      expect(isPubliclyVisibleProductStatus("approved")).toBe(true);
      expect(isPubliclyVisibleProductStatus("pending")).toBe(false);
      expect(isPubliclyVisibleProductStatus("draft")).toBe(false);
      expect(isPubliclyVisibleProductStatus("rejected")).toBe(false);
      expect(isPubliclyVisibleProductStatus("suspended")).toBe(false);
      expect(isPubliclyVisibleProductStatus(undefined)).toBe(false);

      expect(resolveProductPrimaryImage({ images: ["/a.jpg", "/b.jpg"] })).toBe("/a.jpg");
      expect(resolveProductImagesList({ image: "/main.jpg", images: ["/main.jpg", "/alt.jpg"] })).toEqual(["/main.jpg", "/alt.jpg"]);
    });
  });

  describe("Phase 2 & 3 — Sauvegarde, Retries, Backup local et Undo/Redo (A1, A4, A5, A6, A9, A18)", () => {
    it("A1, A4 & A6: saveDraft attend la réussite d'une nouvelle tentative et checkRecoverableBackup valide les dates serveur", async () => {
      mockApiPut
        .mockRejectedValueOnce(new Error("Network timeout"))
        .mockResolvedValueOnce({ success: true, data: { draftRevision: 7 } });

      let hookRef: ReturnType<typeof useStudioSaveManager> | null = null;
      const Harness: React.FC<{ opts: StudioSaveManagerOptions }> = ({ opts }) => {
        hookRef = useStudioSaveManager(opts);
        return null;
      };

      await act(async () => {
        root.render(<Harness opts={{ maxRetries: 2, retryDelayBaseMs: 10, backupKey: "test_backup_retry" }} />);
      });

      let finalRev: number | null = null;
      await act(async () => {
        finalRev = await hookRef!.saveDraft([sampleSection]);
      });

      expect(mockApiPut).toHaveBeenCalledTimes(2);
      expect(finalRev).toBe(7);
      expect(hookRef!.saveStatus).toBe("saved");

      // A4: Test backup recovery
      window.localStorage.setItem(
        "test_backup_retry",
        JSON.stringify({
          sections: [sampleSection],
          localRevision: 3,
          updatedAt: new Date("2026-11-10T12:00:00Z").getTime(),
        })
      );

      await act(async () => {
        const rec = hookRef!.checkRecoverableBackup("2026-11-10T10:00:00Z", []);
        expect(rec).not.toBeNull();
      });
      expect(hookRef!.recoverableBackup?.localRevision).toBe(3);

      await act(async () => {
        const recOlder = hookRef!.checkRecoverableBackup("2026-11-10T14:00:00Z", [sampleSection]);
        expect(recOlder).toBeNull();
      });
      expect(hookRef!.recoverableBackup).toBeNull();
    });

    it("A5, A9 & A18: pushThemeState ne déclenche pas onThemeChange, les actions structurelles ne fusionnent pas, et setSectionsDirectly vide past/future", async () => {
      const onSectionsChange = vi.fn();
      const onThemeChange = vi.fn();

      let undoRef: ReturnType<typeof useStudioUndoRedo> | null = null;
      const UndoHarness: React.FC<{ opts: StudioUndoRedoOptions }> = ({ opts }) => {
        undoRef = useStudioUndoRedo([sampleSection], onSectionsChange, opts);
        return null;
      };

      await act(async () => {
        root.render(<UndoHarness opts={{ storageKey: "test_undo_key", initialTheme: DEFAULT_STUDIO_THEME, onThemeChange }} />);
      });

      await act(async () => {
        undoRef!.pushThemeState({ ...DEFAULT_STUDIO_THEME, primaryColor: "#112233" }, "Thème");
      });
      expect(onThemeChange).not.toHaveBeenCalled();

      await act(async () => {
        undoRef!.undo();
      });
      expect(onThemeChange).toHaveBeenCalledTimes(1);

      const sec2: CustomPageSection = { ...sampleSection, id: "sec_2", order: 1 };
      const sec3: CustomPageSection = { ...sampleSection, id: "sec_3", order: 2 };
      await act(async () => {
        undoRef!.pushState([sampleSection, sec2], undefined, "Ajout section: 2");
        undoRef!.pushState([sampleSection, sec2, sec3], undefined, "Ajout section: 3");
      });
      expect(undoRef!.historyDepth).toBe(2);

      await act(async () => {
        undoRef!.setSectionsDirectly([sampleSection], DEFAULT_STUDIO_THEME, false);
      });
      expect(undoRef!.historyDepth).toBe(0);
      expect(undoRef!.futureDepth).toBe(0);
    });
  });

  describe("Phase 4 & 5 — Cohérence Store Interactif, Secteur par défaut et Responsive 12 Modèles (A8, A10, A15, B5)", () => {
    it("A8, A10, A15 & B5: synchronise isInteractiveMode, unifie DEFAULT_STUDIO_SECTOR sur artisanat et garantit l'Anti-Trou symétrique", () => {
      expect(DEFAULT_STUDIO_SECTOR).toBe("artisanat");
      expect(DEFAULT_STUDIO_THEME.sector).toBe("artisanat");

      expect(useStudioStore.getState().isInteractiveMode).toBe(false);
      useStudioStore.getState().toggleInteractiveMode();
      expect(useStudioStore.getState().isInteractiveMode).toBe(true);

      expect(resolveCategoryActiveCols(3, 2, "desktop", 2, "arch", 4, "balanced")).toBe(4);
      expect(resolveCategoryActiveCols(3, 2, "desktop", 2, "polaroid", 4, "large")).toBe(2);
      expect(resolveAntiHoleSpanClass(0, 4, 3, "arch")).toBe("col-span-1");
      expect(resolveAntiHoleSpanClass(0, 4, 3, "bento")).toBe("col-span-2");
    });
  });
});
