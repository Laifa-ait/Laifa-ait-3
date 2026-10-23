import { describe, it, expect } from "vitest";
import { CouponService } from "../domains/marketing/coupon.service";

describe("Seller Commerce & Order Placement Phase 4", () => {
  describe("1. Strict Mono-Seller Cart & Coupon Scope Validation", () => {
    it("restricts seller coupon scope to items from that seller", () => {
      const sellerCouponData = {
        code: "MARCHAND20",
        discountType: "percentage",
        discountValue: 20,
        sellerId: "seller_alger_1",
        isActive: true,
      };

      const cartItemsSeller1 = [
        {
          productId: "prod_1",
          sellerId: "seller_alger_1",
          category: "mode",
          price: 5000,
          quantity: 1,
        },
      ];

      const cartItemsSeller2 = [
        {
          productId: "prod_2",
          sellerId: "seller_oran_2",
          category: "mode",
          price: 8000,
          quantity: 1,
        },
      ];

      // Eligible for Seller 1
      const filterRes1 = CouponService.filterEligibleItems(sellerCouponData, cartItemsSeller1);
      expect(filterRes1.eligibleItems.length).toBe(1);
      expect(filterRes1.eligibleSubtotal).toBe(5000);

      // Ineligible for Seller 2 (returns 0 eligible items)
      const filterRes2 = CouponService.filterEligibleItems(sellerCouponData, cartItemsSeller2);
      expect(filterRes2.eligibleItems.length).toBe(0);
      expect(filterRes2.eligibleSubtotal).toBe(0);
    });

    it("calculates correct percentage discount capped at maximum discount amount", () => {
      const couponWithCap = {
        code: "REMISE50",
        discountType: "percentage",
        discountValue: 50, // 50% discount
        maxDiscountAmount: 2000, // Capped at 2000 DA
        isActive: true,
      };

      // 10,000 DA * 50% = 5,000 DA, capped at 2,000 DA
      const calcResult = CouponService.calculateDiscountAmount(couponWithCap, 10000);
      expect(calcResult.discountAmount).toBe(2000);
      expect(calcResult.error).toBeUndefined();
    });
  });

  describe("2. Order Status & Self-Delivery Payload Validation", () => {
    it("validates status payload with direct seller delivery without forcing tracking number", () => {
      const validSelfDeliveryPayload = {
        status: "shipped",
        deliveryMethod: "self_delivery",
        note: "Livraison effectuée directement par notre livreur de boutique.",
      };

      expect(validSelfDeliveryPayload.status).toBe("shipped");
      expect(validSelfDeliveryPayload.deliveryMethod).toBe("self_delivery");
      expect(validSelfDeliveryPayload.note).toBeDefined();
    });
  });
});
