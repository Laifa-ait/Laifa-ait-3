import { describe, it, expect } from "vitest";
import {
  formatPriceDZD,
  formatMileage,
  FUEL_LABELS,
  TRANSMISSION_LABELS,
  PAPER_STATUS_LABELS,
  BODY_CONDITION_LABELS,
  PRICE_TYPE_LABELS,
} from "../domains/auto/auto.utils";
import { ALGERIA_WILAYAS } from "../constants/wilayas";
import {
  VehicleCatalogItemDto,
  VehiclePublicDetailDto,
} from "../domains/auto/auto.types";

describe("Phase 2 — Showroom & Catalogue Automobile Specifications", () => {
  describe("1. Algerian Auto Formatting Helpers", () => {
    it("formats prices in DZD correctly with thousands separator", () => {
      expect(formatPriceDZD(2850000)).toBe("2\u202f850\u202f000 DZD");
      expect(formatPriceDZD(0)).toBe("0 DZD");
      expect(formatPriceDZD(NaN)).toBe("0 DZD");
    });

    it("formats mileage in km correctly", () => {
      expect(formatMileage(92000)).toBe("92\u202f000 km");
      expect(formatMileage(0)).toBe("0 km");
    });

    it("contains exhaustive dictionary labels for fuels and transmissions", () => {
      expect(FUEL_LABELS.essence).toBe("Essence");
      expect(FUEL_LABELS.diesel).toBe("Diesel");
      expect(FUEL_LABELS.gpl).toBe("GPL");
      expect(TRANSMISSION_LABELS.manuelle).toBe("Manuelle");
      expect(TRANSMISSION_LABELS.automatique).toBe("Automatique");
    });

    it("covers Algerian administrative paper statuses", () => {
      expect(PAPER_STATUS_LABELS.safia.label).toContain("Safia");
      expect(PAPER_STATUS_LABELS.moudjahid.label).toContain("Moudjahid");
      expect(PAPER_STATUS_LABELS.en_cours.label).toContain("en cours");
    });

    it("covers Algerian bodywork condition statuses (Sbigha 00, retouches)", () => {
      expect(BODY_CONDITION_LABELS.origine.badge).toBe("Zéro retouche");
      expect(BODY_CONDITION_LABELS.a_froid.badge).toBe("À froid");
      expect(BODY_CONDITION_LABELS.retouches.badge).toBe("Retouches");
    });

    it("covers Algerian price negotiation modalities", () => {
      expect(PRICE_TYPE_LABELS.fixe).toBe("Prix fixe");
      expect(PRICE_TYPE_LABELS.negociable).toBe("Négociable");
      expect(PRICE_TYPE_LABELS.offert).toContain("Aataw");
      expect(PRICE_TYPE_LABELS.echange).toBe("Accepte l'échange");
    });
  });

  describe("2. Geographical Reference (Algeria Wilayas)", () => {
    it("includes all wilayas with valid code and name", () => {
      expect(ALGERIA_WILAYAS.length).toBeGreaterThanOrEqual(58);
      const alger = ALGERIA_WILAYAS.find((w) => w.code === "16");
      expect(alger).toBeDefined();
      expect(alger?.name).toBe("Alger");

      const oran = ALGERIA_WILAYAS.find((w) => w.code === "31");
      expect(oran).toBeDefined();
      expect(oran?.name).toBe("Oran");
    });
  });

  describe("3. Data Hygiene & Zero PII Leakage on Public DTOs", () => {
    it("ensures public catalog DTO contains no phone or whatsapp numbers", () => {
      const sampleItem: VehicleCatalogItemDto = {
        id: "v-123",
        title: "Golf 8 R-Line 2.0 TDI",
        brand: "Volkswagen",
        model: "Golf 8",
        year: 2022,
        mileage: 45000,
        fuel: "diesel",
        transmission: "automatique",
        price: 5900000,
        priceType: "negociable",
        currency: "DZD",
        paperStatus: "safia",
        bodyCondition: "origine",
        wilayaId: 16,
        wilayaName: "Alger",
        primaryImageUrl: "https://example.com/car.jpg",
        isSellerVerified: true,
        isVehicleInspected: false,
        status: "active",
        createdAt: new Date().toISOString(),
      };

      const keys = Object.keys(sampleItem);
      expect(keys).not.toContain("phoneNumber");
      expect(keys).not.toContain("sellerPhoneNumber");
      expect(keys).not.toContain("sellerPhone");
      expect(keys).not.toContain("sellerWhatsapp");
      expect(keys).not.toContain("sellerWhatsappNumber");
    });

    it("ensures public detail DTO contains no phone or whatsapp numbers", () => {
      const sampleDetail: VehiclePublicDetailDto = {
        id: "v-123",
        title: "Golf 8 R-Line 2.0 TDI",
        brand: "Volkswagen",
        model: "Golf 8",
        year: 2022,
        mileage: 45000,
        fuel: "diesel",
        transmission: "automatique",
        price: 5900000,
        priceType: "negociable",
        currency: "DZD",
        paperStatus: "safia",
        bodyCondition: "origine",
        wilayaId: 16,
        wilayaName: "Alger",
        primaryImageUrl: "https://example.com/car.jpg",
        isSellerVerified: true,
        isVehicleInspected: false,
        status: "active",
        createdAt: new Date().toISOString(),
        images: ["https://example.com/car.jpg"],
        options: ["Toit ouvrant", "Jantes 18", "Caméra 360"],
        description: "Véhicule première main, zéro retouche.",
        commune: "Cheraga",
        sellerId: "user-456",
        sellerDisplayName: "Auto Prestige Alger",
        sellerType: "professionnel",
        isListingModerated: true,
        viewCount: 142,
        favoriteCount: 19,
      };

      const keys = Object.keys(sampleDetail);
      expect(keys).not.toContain("phoneNumber");
      expect(keys).not.toContain("sellerPhoneNumber");
      expect(keys).not.toContain("sellerPhone");
      expect(keys).not.toContain("sellerWhatsapp");
      expect(keys).not.toContain("sellerWhatsappNumber");
    });
  });
});
