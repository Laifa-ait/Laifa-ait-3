import { describe, it, expect, vi, beforeEach } from "vitest";
import { TwoFactorService } from "../domains/auth/services/twoFactor.service";
import { FirebaseNewsletterRepository } from "../domains/newsletter/newsletter.repository";
import { calculateCarrierShippingRates } from "../domains/shipping/services/shippingCalculatorService";
import { db } from "../config/firebase-admin";

describe("Remediation Audit Verification Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("2FA Backup Codes & Rate Limiting", () => {
    it("handles backup code verification when backup document is not found", async () => {
      vi.spyOn(db, "collection").mockReturnValue({
        doc: vi.fn().mockReturnValue({
          get: vi.fn().mockResolvedValue({
            exists: false,
            data: () => null,
          }),
        }),
      } as unknown as ReturnType<typeof db.collection>);

      const result = await TwoFactorService.verifyCode("user_no_backups", "OLM-123456");
      expect(result.success).toBe(false);
      expect(result.status).toBe(403);
    });

    it("handles invalid OTP codes securely when OTP document does not exist", async () => {
      vi.spyOn(db, "collection").mockReturnValue({
        doc: vi.fn().mockReturnValue({
          get: vi.fn().mockResolvedValue({
            exists: false,
            data: () => null,
          }),
        }),
      } as unknown as ReturnType<typeof db.collection>);

      const result = await TwoFactorService.verifyCode("user_test_otp", "000000");
      expect(result.success).toBe(false);
      expect(result.status).toBe(403);
    });
  });

  describe("Newsletter Settings Repository", () => {
    it("instantiates newsletter repository and reads settings with fallback", async () => {
      vi.spyOn(db, "collection").mockReturnValue({
        doc: vi.fn().mockReturnValue({
          get: vi.fn().mockResolvedValue({
            exists: true,
            data: () => ({ senderName: "Olmart", senderEmail: "newsletter@olmart.dz" }),
          }),
        }),
      } as unknown as ReturnType<typeof db.collection>);

      const repo = new FirebaseNewsletterRepository();
      const settings = await repo.getSettings();
      expect(settings).toEqual({ senderName: "Olmart", senderEmail: "newsletter@olmart.dz" });
    });
  });

  describe("Volumetric Shipping Engine", () => {
    it("calculates volumetric weight (L x l x h) / 5000 accurately", () => {
      const result = calculateCarrierShippingRates({
        carrierId: "yalidine",
        originWilaya: "16 - Alger",
        destWilaya: "31 - Oran",
        weightKg: 2.0,
        dimensions: "100x50x50",
        deliveryMethod: "domicile"
      });

      expect(result.weightDetails.isVolumetricApplied).toBe(true);
      expect(result.weightDetails.volumetricWeightKg).toBe(50);
      expect(result.weightDetails.chargeableWeightKg).toBe(50);
      expect(result.homeDelivery.fee).toBe(3000);
    });
  });
});
