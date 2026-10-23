import { describe, it, expect } from "vitest";
import { checkImageMagicBytes } from "../domains/auto/auto.imageOptimizer";
import { createVehicleListingSchema } from "../domains/auto/auto.validation";
import { canTransitionStatus, toSellerPrivateDto } from "../domains/auto/auto.service";

describe("Phase 3 - Olma Auto Vendeur & Tunnel de Dépôt", () => {
  describe("1. Contrôle Anti-Spoofing & Magic Bytes", () => {
    it("valide les en-têtes binaires JPEG réels", () => {
      const buffer = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]).buffer;
      const res = checkImageMagicBytes(buffer);
      expect(res.valid).toBe(true);
      expect(res.format).toBe("jpeg");
    });

    it("valide les en-têtes binaires PNG réels", () => {
      const buffer = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]).buffer;
      const res = checkImageMagicBytes(buffer);
      expect(res.valid).toBe(true);
      expect(res.format).toBe("png");
    });

    it("valide les en-têtes binaires WebP réels", () => {
      const buffer = new Uint8Array([
        0x52, 0x49, 0x46, 0x46, // RIFF
        0x00, 0x00, 0x00, 0x00,
        0x57, 0x45, 0x42, 0x50, // WEBP
      ]).buffer;
      const res = checkImageMagicBytes(buffer);
      expect(res.valid).toBe(true);
      expect(res.format).toBe("webp");
    });

    it("rejette les faux fichiers renommés en image (scripts HTML, PHP, TXT)", () => {
      // Ex: "<script>alert(1)</script>" en UTF-8
      const fakeHeader = new Uint8Array([0x3c, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74, 0x3e, 0x61, 0x6c, 0x65, 0x72]).buffer;
      const res = checkImageMagicBytes(fakeHeader);
      expect(res.valid).toBe(false);
      expect(res.error).toBeDefined();
    });

    it("rejette les tampons tronqués de moins de 12 octets", () => {
      const tinyBuffer = new Uint8Array([0xff, 0xd8]).buffer;
      const res = checkImageMagicBytes(tinyBuffer);
      expect(res.valid).toBe(false);
    });
  });

  describe("2. Validation Stricte des Numéros Algériens & Données de Dépôt", () => {
    const validListingBase = {
      title: "Volkswagen Golf 7 R-Line 2018",
      brand: "Volkswagen",
      model: "Golf 7",
      version: "R-Line",
      year: 2018,
      mileage: 95000,
      fuel: "diesel" as const,
      transmission: "automatique" as const,
      paperStatus: "safia" as const,
      bodyCondition: "origine" as const,
      price: 3600000,
      priceType: "fixe" as const,
      wilayaId: 16,
      wilayaName: "Alger",
      commune: "Hydra",
      images: ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341"],
      options: ["Climatisation", "Toit ouvrant"],
      description: "Véhicule première main avec carnet d'entretien complet chez concessionnaire.",
      sellerPhoneNumber: "0550123456",
      sellerWhatsappNumber: "0550123456",
      sellerType: "particulier" as const,
      submitForReview: true,
    };

    it("accepte un numéro algérien valide commençant par 05, 06, 07 ou 02", () => {
      const validNumbers = ["0550123456", "0661987654", "0770334455", "0212345678"];
      for (const phone of validNumbers) {
        const parsed = createVehicleListingSchema.safeParse({
          ...validListingBase,
          sellerPhoneNumber: phone,
          sellerWhatsappNumber: phone,
        });
        expect(parsed.success).toBe(true);
      }
    });

    it("rejette les numéros non conformes aux indicatifs algériens", () => {
      const invalidNumbers = ["0123456789", "0999999999", "123456", "055012345A"];
      for (const phone of invalidNumbers) {
        const parsed = createVehicleListingSchema.safeParse({
          ...validListingBase,
          sellerPhoneNumber: phone,
        });
        expect(parsed.success).toBe(false);
      }
    });

    it("exige au moins une image et une description substantielle", () => {
      const noImages = createVehicleListingSchema.safeParse({
        ...validListingBase,
        images: [],
      });
      expect(noImages.success).toBe(false);

      const shortDesc = createVehicleListingSchema.safeParse({
        ...validListingBase,
        description: "Court",
      });
      expect(shortDesc.success).toBe(false);
    });
  });

  describe("3. FSM Mon Garage & Transitions Autorisées Vendeur", () => {
    it("permet au propriétaire de soumettre son brouillon pour révision (draft -> pending_review)", () => {
      const check = canTransitionStatus("draft", "pending_review", false, true);
      expect(check.allowed).toBe(true);
    });

    it("interdit au propriétaire de s'auto-valider en ligne sans passer par un admin", () => {
      const check = canTransitionStatus("pending_review", "active", false, true);
      expect(check.allowed).toBe(false);
      expect(check.reason).toContain("administrateur");
    });

    it("permet au propriétaire de marquer sa voiture vendue lorsqu'elle est active (active -> sold)", () => {
      const check = canTransitionStatus("active", "sold", false, true);
      expect(check.allowed).toBe(true);
    });

    it("permet au propriétaire d'archiver son annonce active (active -> archived)", () => {
      const check = canTransitionStatus("active", "archived", false, true);
      expect(check.allowed).toBe(true);
    });

    it("permet au propriétaire de repasser un refus en brouillon pour correction (rejected -> draft)", () => {
      const check = canTransitionStatus("rejected", "draft", false, true);
      expect(check.allowed).toBe(true);
    });
  });

  describe("4. Intégrité des Données Mon Garage (Private DTO)", () => {
    it("préserve le motif de refus et les numéros du vendeur dans toSellerPrivateDto", () => {
      const rawData = {
        title: "Dacia Duster 2020",
        brand: "Dacia",
        model: "Duster",
        year: 2020,
        mileage: 70000,
        price: 2800000,
        ownerUid: "seller_uid_99",
        status: "rejected",
        rejectionReason: "Photos floues, veuillez importer des clichés nets de la carrosserie",
        sellerPhoneNumber: "0550112233",
        sellerWhatsappNumber: "0550112233",
        images: ["https://example.com/duster.jpg"],
        expiresAt: "2026-11-01T00:00:00.000Z",
      };

      const dto = toSellerPrivateDto("auto_doc_99", rawData);
      expect(dto.id).toBe("auto_doc_99");
      expect(dto.ownerUid).toBe("seller_uid_99");
      expect(dto.status).toBe("rejected");
      expect(dto.rejectionReason).toBe("Photos floues, veuillez importer des clichés nets de la carrosserie");
      expect(dto.sellerPhoneNumber).toBe("0550112233");
      expect(dto.publicData.brand).toBe("Dacia");
    });
  });
});
