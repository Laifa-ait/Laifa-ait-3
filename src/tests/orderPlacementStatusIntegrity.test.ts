import { describe, it, expect } from "vitest";
import { isPurchasable, PRODUCT_STATUSES } from "../domains/product/product.status";
import { isSellerSellable, USER_STATUSES } from "../domains/user/user.status";

describe("C-04 & C-05: Order Placement Product & Seller Status Verification", () => {
  describe("Product isPurchasable predicate", () => {
    it("allows purchase of active product with positive stock", () => {
      const activeProd = { status: PRODUCT_STATUSES.ACTIVE, stock: 10 };
      expect(isPurchasable(activeProd)).toBe(true);
    });

    it("rejects purchase when product is in draft status", () => {
      const draftProd = { status: PRODUCT_STATUSES.DRAFT, stock: 10 };
      expect(isPurchasable(draftProd)).toBe(false);
    });

    it("rejects purchase when product is in pending status", () => {
      const pendingProd = { status: PRODUCT_STATUSES.PENDING, stock: 10 };
      expect(isPurchasable(pendingProd)).toBe(false);
    });

    it("rejects purchase when product is suspended", () => {
      const suspendedProd = { status: PRODUCT_STATUSES.SUSPENDED, stock: 10 };
      expect(isPurchasable(suspendedProd)).toBe(false);
    });

    it("rejects purchase when product is rejected", () => {
      const rejectedProd = { status: PRODUCT_STATUSES.REJECTED, stock: 10 };
      expect(isPurchasable(rejectedProd)).toBe(false);
    });

    it("rejects purchase when product is archived", () => {
      const archivedProd = { status: PRODUCT_STATUSES.ARCHIVED, stock: 10 };
      expect(isPurchasable(archivedProd)).toBe(false);
    });

    it("rejects purchase when product stock is 0 or negative", () => {
      expect(isPurchasable({ status: PRODUCT_STATUSES.ACTIVE, stock: 0 })).toBe(false);
      expect(isPurchasable({ status: PRODUCT_STATUSES.ACTIVE, stock: -5 })).toBe(false);
    });

    it("rejects purchase when product is null or undefined", () => {
      expect(isPurchasable(null)).toBe(false);
      expect(isPurchasable(undefined)).toBe(false);
    });
  });

  describe("Seller isSellerSellable predicate", () => {
    it("allows orders when seller is active with no suspensions", () => {
      const activeSeller = { status: USER_STATUSES.ACTIVE, isActive: true };
      expect(isSellerSellable(activeSeller)).toBe(true);
    });

    it("rejects orders when seller is pending", () => {
      const pendingSeller = { status: USER_STATUSES.PENDING, isActive: true };
      expect(isSellerSellable(pendingSeller)).toBe(false);
    });

    it("rejects orders when seller is suspended", () => {
      const suspendedSeller = { status: USER_STATUSES.SUSPENDED, isActive: true };
      expect(isSellerSellable(suspendedSeller)).toBe(false);
    });

    it("rejects orders when seller is blocked", () => {
      const blockedSeller = { status: USER_STATUSES.BLOCKED, isActive: true };
      expect(isSellerSellable(blockedSeller)).toBe(false);
    });

    it("rejects orders when seller has isActive === false", () => {
      const disabledSeller = { status: USER_STATUSES.ACTIVE, isActive: false };
      expect(isSellerSellable(disabledSeller)).toBe(false);
    });

    it("rejects orders when seller has is_active === false (legacy compatibility)", () => {
      const disabledSellerLegacy = { status: USER_STATUSES.ACTIVE, is_active: false };
      expect(isSellerSellable(disabledSellerLegacy)).toBe(false);
    });

    it("rejects orders when seller is velocity suspended", () => {
      const velocitySuspendedSeller = { status: USER_STATUSES.ACTIVE, isActive: true, velocitySuspended: true };
      expect(isSellerSellable(velocitySuspendedSeller)).toBe(false);
    });

    it("rejects orders when seller is null or undefined", () => {
      expect(isSellerSellable(null)).toBe(false);
      expect(isSellerSellable(undefined)).toBe(false);
    });
  });
});
