import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import {
  shouldRecordSponsorshipEvent,
  clearSponsorshipDedupCacheForTests,
  getSponsorshipDedupCacheSizeForTests,
  SPONSORSHIP_DEDUP_TTL_MS,
  MAX_SPONSORSHIP_DEDUP_ENTRIES,
} from "../domains/marketing/analytics.routes";
import { isPublicShopCouponVisible } from "../domains/seller/shopPublic.routes";

describe("Audit Remediation — Étape 3 (M-03 & M-04)", () => {
  beforeEach(() => {
    clearSponsorshipDedupCacheForTests();
  });

  describe("M-03: Sponsorship Analytics Anti-Inflation Deduplication (60s TTL & Bounded Memory)", () => {
    it("autorise le premier événement et bloque les doublons (même IP + productId + action) pendant la fenêtre TTL de 60s", () => {
      const baseTime = 1_700_000_000_000;
      expect(shouldRecordSponsorshipEvent("197.200.10.1", "prod_101", "impression", baseTime)).toBe(true);
      expect(shouldRecordSponsorshipEvent("197.200.10.1", "prod_101", "impression", baseTime + 15_000)).toBe(false);
      expect(shouldRecordSponsorshipEvent("197.200.10.1", "prod_101", "impression", baseTime + 59_999)).toBe(false);
    });

    it("autorise un nouvel événement après expiration du TTL de 60s ou pour une action / produit / IP distincts", () => {
      const baseTime = 1_700_000_000_000;
      expect(shouldRecordSponsorshipEvent("197.200.10.1", "prod_101", "impression", baseTime)).toBe(true);
      expect(shouldRecordSponsorshipEvent("197.200.10.1", "prod_101", "click", baseTime + 500)).toBe(true);
      expect(shouldRecordSponsorshipEvent("197.200.10.1", "prod_202", "impression", baseTime + 500)).toBe(true);
      expect(shouldRecordSponsorshipEvent("197.200.10.2", "prod_101", "impression", baseTime + 500)).toBe(true);

      // Après expiration des 60s
      expect(
        shouldRecordSponsorshipEvent("197.200.10.1", "prod_101", "impression", baseTime + SPONSORSHIP_DEDUP_TTL_MS + 1)
      ).toBe(true);
    });

    it("maintient une taille mémoire strictement bornée (MAX_SPONSORSHIP_DEDUP_ENTRIES) sans fuite mémoire", () => {
      const baseTime = 1_700_000_000_000;
      for (let i = 0; i < MAX_SPONSORSHIP_DEDUP_ENTRIES + 120; i += 1) {
        shouldRecordSponsorshipEvent(`10.0.0.${i}`, `prod_${i}`, "impression", baseTime);
      }
      expect(getSponsorshipDedupCacheSizeForTests()).toBeLessThanOrEqual(MAX_SPONSORSHIP_DEDUP_ENTRIES);
    });
  });

  describe("M-04: Filtrage des coupons privés & Masquage des error.message sur HTTP 500", () => {
    it("exclut les coupons privés (isPrivate === true ou isPublic === false) de la vitrine publique", () => {
      expect(isPublicShopCouponVisible({ code: "PUBLIC10", isActive: true })).toBe(true);
      expect(isPublicShopCouponVisible({ code: "PUBLIC20", isActive: true, isPrivate: false, isPublic: true })).toBe(true);
      expect(isPublicShopCouponVisible({ code: "VIP_SECRET", isActive: true, isPrivate: true })).toBe(false);
      expect(isPublicShopCouponVisible({ code: "HIDDEN_PROMO", isActive: true, isPublic: false })).toBe(false);
    });

    it("garantit qu'aucune réponse HTTP 500 dans shopPublic.routes.ts et adminSystem.routes.ts n'expose error.message ou err.message au client", () => {
      const shopRoutesSrc = fs.readFileSync(
        path.join(process.cwd(), "src/domains/seller/shopPublic.routes.ts"),
        "utf8"
      );
      const adminRoutesSrc = fs.readFileSync(
        path.join(process.cwd(), "src/domains/admin/routes/adminSystem.routes.ts"),
        "utf8"
      );

      const status500WithErrorMessageRegex = /status\(500\)\.json\([^)]*(?:error|err)\.message/;
      expect(shopRoutesSrc).not.toMatch(status500WithErrorMessageRegex);
      expect(adminRoutesSrc).not.toMatch(status500WithErrorMessageRegex);
    });
  });
});
