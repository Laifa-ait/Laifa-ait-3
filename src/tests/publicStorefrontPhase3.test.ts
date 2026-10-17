import { describe, it, expect } from "vitest";
import { invalidatePublicStorefrontCache } from "../domains/seller/services/storePublic.service";
import { LegacyStoreAdapter } from "../domains/seller/services/legacyStore.adapter";

describe("Public Storefront & Resolution Phase 3", () => {
  it("invalidates public storefront cache deterministically", () => {
    expect(() => invalidatePublicStorefrontCache("seller_123", "shop-slug")).not.toThrow();
    expect(() => invalidatePublicStorefrontCache()).not.toThrow();
  });

  it("builds canonical default config and initial layout via LegacyStoreAdapter for unpublished sellers", () => {
    const config = LegacyStoreAdapter.buildStoreConfig("seller_999", {
      shopName: "Boutique Tlemcen Officiel",
      wilaya: "Tlemcen",
      description: "Artisanat et costumes traditionnels.",
    });

    expect(config.sellerId).toBe("seller_999");
    expect(config.shopName).toBe("Boutique Tlemcen Officiel");
    expect(config.shopSlug).toContain("boutique-tlemcen");

    const layout = LegacyStoreAdapter.buildInitialLayoutVersion(config, ["prod_1", "prod_2"]);
    expect(layout.versionNumber).toBe(1);
    expect(layout.status).toBe("draft");
    expect(layout.sections.length).toBeGreaterThanOrEqual(5);
  });
});
