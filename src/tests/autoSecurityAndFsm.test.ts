import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../app";
import {
  canTransitionStatus,
  toCatalogItemDto,
  toPublicDetailDto,
  toSellerPrivateDto,
} from "../domains/auto/auto.service";
import { createVehicleListingSchema } from "../domains/auto/auto.validation";

describe("Olma Auto — FSM State Machine & Authorization Security", () => {
  it("allows owner to submit draft for review (draft -> pending_review)", () => {
    const check = canTransitionStatus("draft", "pending_review", false, true);
    expect(check.allowed).toBe(true);
  });

  it("prohibits non-admin from approving an announcement (pending_review -> active)", () => {
    const check = canTransitionStatus("pending_review", "active", false, true);
    expect(check.allowed).toBe(false);
    expect(check.reason).toContain("Seul un administrateur");
  });

  it("allows admin to approve an announcement (pending_review -> active)", () => {
    const check = canTransitionStatus("pending_review", "active", true, false);
    expect(check.allowed).toBe(true);
  });

  it("allows admin to reject an announcement (pending_review -> rejected)", () => {
    const check = canTransitionStatus("pending_review", "rejected", true, false);
    expect(check.allowed).toBe(true);
  });

  it("allows owner to reset rejected announcement to draft for editing (rejected -> draft)", () => {
    const check = canTransitionStatus("rejected", "draft", false, true);
    expect(check.allowed).toBe(true);
  });

  it("allows owner to mark active announcement as sold (active -> sold)", () => {
    const check = canTransitionStatus("active", "sold", false, true);
    expect(check.allowed).toBe(true);
  });

  it("blocks non-owner from marking active announcement as sold (active -> sold)", () => {
    const check = canTransitionStatus("active", "sold", false, false);
    expect(check.allowed).toBe(false);
  });

  it("strictly rejects illegal transitions (e.g. draft directly to active)", () => {
    const check = canTransitionStatus("draft", "active", false, true);
    expect(check.allowed).toBe(false);
    expect(check.reason).toContain("Transition non autorisée");
  });

  it("strictly rejects illegal transitions from terminal states (e.g. sold directly to active)", () => {
    const check = canTransitionStatus("sold", "active", false, true);
    expect(check.allowed).toBe(false);
  });
});

describe("Olma Auto — DTO Whitelist & Anti-PII Cloaking", () => {
  const sensitiveRecord = {
    title: "Golf 7 R-Line 2.0 TDI",
    brand: "Volkswagen",
    model: "Golf 7",
    year: 2018,
    mileage: 120000,
    fuel: "diesel",
    transmission: "automatique",
    price: 3800000,
    priceType: "negociable",
    paperStatus: "safia",
    bodyCondition: "origine",
    wilayaId: 16,
    wilayaName: "Alger",
    commune: "Hydra",
    images: ["https://example.com/golf1.jpg", "https://example.com/golf2.jpg"],
    options: ["Toit ouvrant", "Cockpit digital"],
    description: "Véhicule première main en excellent état.",
    ownerUid: "seller_uid_999",
    sellerDisplayName: "Karim Auto",
    sellerPhoneNumber: "0550123456",
    sellerWhatsappNumber: "0550123456",
    sellerType: "professionnel",
    rejectionReason: "Aucun motif",
    isSellerVerified: true,
    isListingModerated: true,
    isVehicleInspected: true,
    status: "active",
    createdAt: "2026-10-09T10:00:00.000Z",
    expiresAt: "2026-11-09T10:00:00.000Z",
  };

  it("toCatalogItemDto strictly excludes phone number and WhatsApp number", () => {
    const catalogItem = toCatalogItemDto("vehicle_123", sensitiveRecord);
    expect((catalogItem as unknown as Record<string, unknown>).sellerPhoneNumber).toBeUndefined();
    expect((catalogItem as unknown as Record<string, unknown>).sellerWhatsappNumber).toBeUndefined();
    expect((catalogItem as unknown as Record<string, unknown>).ownerUid).toBeUndefined();
    expect(catalogItem.title).toBe("Golf 7 R-Line 2.0 TDI");
    expect(catalogItem.price).toBe(3800000);
    expect(catalogItem.paperStatus).toBe("safia");
  });

  it("toPublicDetailDto strictly excludes phone and WhatsApp from public view", () => {
    const publicDetail = toPublicDetailDto("vehicle_123", sensitiveRecord);
    expect((publicDetail as unknown as Record<string, unknown>).sellerPhoneNumber).toBeUndefined();
    expect((publicDetail as unknown as Record<string, unknown>).sellerWhatsappNumber).toBeUndefined();
    expect(publicDetail.sellerDisplayName).toBe("Karim Auto");
    expect(publicDetail.options).toContain("Toit ouvrant");
  });

  it("toSellerPrivateDto contains private fields exclusively for owner", () => {
    const privateDto = toSellerPrivateDto("vehicle_123", sensitiveRecord);
    expect(privateDto.ownerUid).toBe("seller_uid_999");
    expect(privateDto.sellerPhoneNumber).toBe("0550123456");
    expect(privateDto.sellerWhatsappNumber).toBe("0550123456");
  });
});

describe("Olma Auto — Zod Validation Rules for Algerian Market", () => {
  it("validates Algerian mobile phone formats (05/06/07/02)", () => {
    const validData = {
      title: "Toyota Hilux Double Cabine",
      brand: "Toyota",
      model: "Hilux",
      year: 2021,
      mileage: 65000,
      fuel: "diesel" as const,
      transmission: "manuelle" as const,
      paperStatus: "safia" as const,
      bodyCondition: "origine" as const,
      price: 5200000,
      priceType: "fixe" as const,
      wilayaId: 31,
      wilayaName: "Oran",
      commune: "Es Senia",
      images: ["https://example.com/hilux.jpg"],
      description: "Véhicule utilitaire très propre, entretien concessionnaire.",
      sellerPhoneNumber: "0770998877",
      sellerWhatsappNumber: "0770998877",
      submitForReview: true,
    };

    const parsed = createVehicleListingSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid foreign or malformed phone numbers", () => {
    const invalidData = {
      title: "Clio 4 GT Line",
      brand: "Renault",
      model: "Clio 4",
      year: 2019,
      mileage: 95000,
      fuel: "essence" as const,
      transmission: "manuelle" as const,
      paperStatus: "safia" as const,
      bodyCondition: "a_froid" as const,
      price: 2400000,
      priceType: "negociable" as const,
      wilayaId: 16,
      wilayaName: "Alger",
      commune: "Bab Ezzouar",
      images: ["https://example.com/clio.jpg"],
      description: "Peinture à froid aile droite, moteur impeccable.",
      sellerPhoneNumber: "12345678", // Invalide
      sellerWhatsappNumber: "0550123456",
    };

    const parsed = createVehicleListingSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });
});

describe("Olma Auto — HTTP Gateway & Access Control", () => {
  it("GET /api/v1/auto/listings returns HTTP 200 with public data", async () => {
    const res = await request(app).get("/api/v1/auto/listings");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it("POST /api/v1/auto/listings fails with 401 when unauthenticated", async () => {
    const res = await request(app).post("/api/v1/auto/listings").send({
      title: "Tentative non authentifiée",
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });
});

