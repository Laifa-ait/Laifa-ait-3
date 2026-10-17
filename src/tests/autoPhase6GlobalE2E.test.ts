import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app";
import {
  canTransitionStatus,
  toCatalogItemDto,
  toPublicDetailDto,
} from "../domains/auto/auto.service";
import { AutoPartCompatibility } from "../domains/auto/autoParts.types";

describe("Olma Auto - Phase 6 (Validation Globale, E2E & Non-Régression)", () => {
  describe("1. Cycle de Vie Complet & FSM Véhicule (End-to-End)", () => {
    it("valide la séquence complète : draft -> pending_review -> active -> sold", () => {
      // 1. Soumission vendeur
      const t1 = canTransitionStatus("draft", "pending_review", false, true);
      expect(t1.allowed).toBe(true);

      // 2. Modération administrateur
      const t2 = canTransitionStatus("pending_review", "active", true, false);
      expect(t2.allowed).toBe(true);

      // 3. Clôture de vente par le vendeur
      const t3 = canTransitionStatus("active", "sold", false, true);
      expect(t3.allowed).toBe(true);

      // 4. Interdiction de réactiver directement une annonce vendue
      const t4 = canTransitionStatus("sold", "active", false, true);
      expect(t4.allowed).toBe(false);
    });

    it("vérifie que l'archivage est accessible depuis l'état active", () => {
      expect(canTransitionStatus("active", "archived", false, true).allowed).toBe(true);
      expect(canTransitionStatus("pending_review", "archived", false, true).allowed).toBe(false);
    });
  });

  describe("2. Confidentialité & Zéro Fuite PII (Zero-Trust Data Protection)", () => {
    const rawListingRecord = {
      title: "Golf 8 R-Line 2.0 TDI",
      brand: "Volkswagen",
      model: "Golf 8",
      year: 2022,
      mileage: 45000,
      fuel: "diesel",
      transmission: "automatique",
      paperStatus: "safia",
      bodyCondition: "origine",
      price: 5200000,
      priceType: "fixe",
      wilayaId: 16,
      wilayaName: "Alger",
      commune: "Bab Ezzouar",
      images: ["https://images.unsplash.com/golf8.jpg"],
      options: ["Toit ouvrant", "Phares LED"],
      description: "Véhicule première main en excellent état.",
      ownerUid: "seller_private_uid_xyz",
      sellerDisplayName: "Karim Motors",
      sellerPhoneNumber: "0550123456",
      sellerWhatsappNumber: "0550123456",
      sellerType: "professionnel",
      reviewedBy: "admin_super_01",
      reviewedAt: "2026-10-01T11:00:00.000Z",
      status: "active",
      createdAt: "2026-10-01T10:00:00.000Z",
    };

    it("toCatalogItemDto supprime les coordonnées téléphoniques et le ownerUid", () => {
      const catalogItem = toCatalogItemDto("v_001", rawListingRecord);

      expect((catalogItem as unknown as Record<string, unknown>).sellerPhoneNumber).toBeUndefined();
      expect((catalogItem as unknown as Record<string, unknown>).sellerWhatsappNumber).toBeUndefined();
      expect((catalogItem as unknown as Record<string, unknown>).ownerUid).toBeUndefined();
      expect((catalogItem as unknown as Record<string, unknown>).reviewedBy).toBeUndefined();
      expect(catalogItem.id).toBe("v_001");
      expect(catalogItem.brand).toBe("Volkswagen");
      expect(catalogItem.paperStatus).toBe("safia");
    });

    it("toPublicDetailDto garantit l'isolation PII pour la fiche détaillée", () => {
      const publicDetail = toPublicDetailDto("v_001", rawListingRecord);

      expect((publicDetail as unknown as Record<string, unknown>).sellerPhoneNumber).toBeUndefined();
      expect((publicDetail as unknown as Record<string, unknown>).sellerWhatsappNumber).toBeUndefined();
      expect((publicDetail as unknown as Record<string, unknown>).ownerUid).toBeUndefined();
      expect(publicDetail.sellerDisplayName).toBe("Karim Motors");
      expect(publicDetail.options).toContain("Toit ouvrant");
    });
  });

  describe("3. Matrice de Compatibilité Pièces Détachées (Auto Parts SLA)", () => {
    const isCompatible = (
      compatList: AutoPartCompatibility[],
      filter: { brand?: string; model?: string; year?: number }
    ): boolean => {
      return compatList.some((c) => {
        if (c.isUniversal) return true;
        const matchBrand = !filter.brand || c.brand.toLowerCase() === filter.brand.toLowerCase();
        const matchModel = !filter.model || c.model.toLowerCase().includes(filter.model.toLowerCase());
        const matchYear =
          !filter.year ||
          ((!c.yearStart || filter.year >= c.yearStart) && (!c.yearEnd || filter.year <= c.yearEnd));
        return matchBrand && matchModel && matchYear;
      });
    };

    const compatibilities: AutoPartCompatibility[] = [
      { brand: "Renault", model: "Clio 4", yearStart: 2012, yearEnd: 2019, engineType: "1.5 dCi", isCertified: true },
      { brand: "Dacia", model: "Sandero Stepway", yearStart: 2013, yearEnd: 2020, isCertified: true },
    ];

    it("détecte une compatibilité certifiée sur marque, modèle et plage d'années", () => {
      expect(isCompatible(compatibilities, { brand: "Renault", model: "Clio 4", year: 2016 })).toBe(true);
      expect(isCompatible(compatibilities, { brand: "Dacia", model: "Sandero", year: 2018 })).toBe(true);
      expect(isCompatible(compatibilities, { brand: "Renault", model: "Clio 4", year: 2023 })).toBe(false);
      expect(isCompatible(compatibilities, { brand: "Peugeot", model: "208", year: 2018 })).toBe(false);
    });

    it("déclare universelle toute pièce ayant le drapeau isUniversal", () => {
      const universalList: AutoPartCompatibility[] = [{ brand: "Toutes", model: "Universel", isUniversal: true, isCertified: true }];
      expect(isCompatible(universalList, { brand: "Hyundai", model: "Tucson", year: 2021 })).toBe(true);
    });
  });

  describe("4. Endpoints d'Ecosystème & Conformité API v1", () => {
    it("GET /api/v1/auto/listings répond avec succès et structure v1", async () => {
      const start = Date.now();
      const res = await request(app).get("/api/v1/auto/listings?limit=5");
      const duration = Date.now() - start;

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(duration).toBeLessThan(1000); // Benchmark performance < 1000ms
    });

    it("GET /api/v1/auto/parts répond avec succès et structure v1", async () => {
      const start = Date.now();
      const res = await request(app).get("/api/v1/auto/parts?limit=5");
      const duration = Date.now() - start;

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(duration).toBeLessThan(1000);
    });

    it("GET /api/v1/auto/admin/pending requiert une authentification (Fail-Closed)", async () => {
      const res = await request(app).get("/api/v1/auto/admin/pending");
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });
  });
});
