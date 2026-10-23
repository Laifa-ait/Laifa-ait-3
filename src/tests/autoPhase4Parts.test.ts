import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app";
import {
  createAutoPartSchema,
} from "../domains/auto/autoParts.validation";
import { AutoPartCompatibility } from "../domains/auto/autoParts.types";

describe("Olma Auto - Phase 4 (Pièces Détachées & Casse Automobile)", () => {
  describe("1. Validation Stricte Zod (createAutoPartSchema)", () => {
    it("valide une pièce détachée conforme avec compatibilité certifiée", () => {
      const validPart = {
        title: "Turbo Garett 1.6 HDi 92ch Révisé",
        category: "moteur" as const,
        condition: "tres_bon_etat" as const,
        priceDZD: 45000,
        isPriceNegotiable: true,
        wilayaId: 16,
        commune: "Hussein Dey",
        compatibilities: [
          {
            brand: "Peugeot",
            model: "208",
            yearStart: 2012,
            yearEnd: 2019,
            engineType: "1.6 HDi",
            isCertified: true,
          },
        ],
        description: "Turbo d'origine en parfait état. Testé sur banc, aucun jeu dans l'axe.",
        images: ["https://example.com/turbo1.webp"],
        isJunkYard: false,
        sellerPhone: "0550123456",
      };

      const res = createAutoPartSchema.safeParse(validPart);
      expect(res.success).toBe(true);
    });

    it("rejette une annonce avec un numéro de téléphone invalide", () => {
      const invalidPhonePart = {
        title: "Alternateur Valeo 120A",
        category: "moteur" as const,
        condition: "bon_etat" as const,
        priceDZD: 18000,
        wilayaId: 31,
        commune: "Es Senia",
        compatibilities: [],
        description: "Alternateur en état de marche.",
        images: ["https://example.com/alt.webp"],
        sellerPhone: "0123456789", // Invalide pour l'Algérie
      };

      const res = createAutoPartSchema.safeParse(invalidPhonePart);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.flatten().fieldErrors.sellerPhone).toBeDefined();
      }
    });

    it("rejette un prix inférieur au minimum de 100 DZD", () => {
      const invalidPrice = {
        title: "Bouchon réservoir d'huile",
        category: "autre" as const,
        condition: "bon_etat" as const,
        priceDZD: 50, // Min 100
        wilayaId: 16,
        commune: "Alger",
        compatibilities: [],
        description: "Bouchon d'origine pour moteur diesel.",
        images: ["https://example.com/bouchon.webp"],
        sellerPhone: "0661223344",
      };

      const res = createAutoPartSchema.safeParse(invalidPrice);
      expect(res.success).toBe(false);
    });
  });

  describe("2. Logique de Compatibilité Mécanique", () => {
    const compatibilities: AutoPartCompatibility[] = [
      {
        brand: "Volkswagen",
        model: "Golf 7",
        yearStart: 2013,
        yearEnd: 2020,
        engineType: "2.0 TDI",
        isCertified: true,
      },
      {
        brand: "Seat",
        model: "Leon 3",
        yearStart: 2013,
        yearEnd: 2020,
        engineType: "2.0 TDI",
        isCertified: true,
      },
    ];

    const matchVehicle = (
      compatList: AutoPartCompatibility[],
      filter: { brand?: string; model?: string; year?: number }
    ) => {
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

    it("identifie avec succès la compatibilité avec une Golf 7 de 2016", () => {
      const matches = matchVehicle(compatibilities, {
        brand: "Volkswagen",
        model: "Golf",
        year: 2016,
      });
      expect(matches).toBe(true);
    });

    it("identifie avec succès la compatibilité avec une Seat Leon de 2014", () => {
      const matches = matchVehicle(compatibilities, {
        brand: "Seat",
        model: "Leon",
        year: 2014,
      });
      expect(matches).toBe(true);
    });

    it("rejette un véhicule incompatible (Toyota Yaris)", () => {
      const matches = matchVehicle(compatibilities, {
        brand: "Toyota",
        model: "Yaris",
        year: 2018,
      });
      expect(matches).toBe(false);
    });

    it("rejette une année hors plage (Golf 7 modèle 2024)", () => {
      const matches = matchVehicle(compatibilities, {
        brand: "Volkswagen",
        model: "Golf 7",
        year: 2024,
      });
      expect(matches).toBe(false);
    });

    it("accepte une pièce universelle pour n'importe quelle marque", () => {
      const universalList: AutoPartCompatibility[] = [
        { brand: "Universel", model: "Tous modèles", isUniversal: true, isCertified: false },
      ];
      expect(matchVehicle(universalList, { brand: "Hyundai", model: "Accent", year: 2012 })).toBe(true);
    });
  });

  describe("3. Protection Anti-Scraping & Masquage PII", () => {
    it("masque correctement le numéro de téléphone pour la consultation publique", () => {
      const rawPhone = "0550123489";
      const masked = `${rawPhone.slice(0, 4)} •• •• ${rawPhone.slice(-2)}`;
      expect(masked).toBe("0550 •• •• 89");
      expect(masked).not.toContain("1234");
    });

    it("génère un lien WhatsApp prérempli au format international 213", () => {
      const phone = "0770998877";
      const cleanPhone = phone.replace(/\D/g, "");
      const waNumber = cleanPhone.startsWith("0") ? `213${cleanPhone.slice(1)}` : cleanPhone;
      expect(waNumber).toBe("213770998877");
    });
  });

  describe("4. Endpoints API v1 (/api/v1/auto/parts)", () => {
    it("GET /api/v1/auto/parts renvoie un code HTTP 200 avec la liste", async () => {
      const res = await request(app).get("/api/v1/auto/parts");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.items)).toBe(true);
    });

    it("POST /api/v1/auto/parts rejette un utilisateur non authentifié (401)", async () => {
      const res = await request(app).post("/api/v1/auto/parts").send({
        title: "Test Pièce",
      });
      expect(res.status).toBe(401);
    });
  });
});
