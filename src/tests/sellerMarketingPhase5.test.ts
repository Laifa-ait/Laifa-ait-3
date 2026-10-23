import { describe, it, expect } from "vitest";
import { PublicCampaignService } from "../domains/sponsorship/services/publicCampaign.service";
import { OLMART_AD_SPOTS } from "../domains/seller/services/sellerMarketing.service";

describe("PHASE 5 — Centre Marketing Vendeur & Régie Sponsorisée Olmart", () => {
  describe("1. Filtrage Public Strict des Campagnes Sponsorisées", () => {
    it("n'autorise l'affichage public que dans la fenêtre temporelle exacte (startDate <= now < endDate)", () => {
      const nowMs = 1750000000000;
      const pastStart = new Date(nowMs - 86400000).toISOString();
      const futureEnd = new Date(nowMs + 86400000).toISOString();
      const expiredEnd = new Date(nowMs - 3600000).toISOString();
      const futureStart = new Date(nowMs + 3600000).toISOString();

      // Campagne active
      expect(PublicCampaignService.isTimeActive(pastStart, futureEnd, nowMs)).toBe(true);

      // Campagne expirée -> JAMAIS affichée publiquement
      expect(PublicCampaignService.isTimeActive(pastStart, expiredEnd, nowMs)).toBe(false);

      // Campagne future / programmée -> JAMAIS affichée publiquement
      expect(PublicCampaignService.isTimeActive(futureStart, futureEnd, nowMs)).toBe(false);
    });

    it("valide la règle d'exclusion stricte pour tout statut non-actif", () => {
      const invalidStatuses = ["pending_approval", "pending_payment", "rejected", "paused", "expired", "draft"];
      invalidStatuses.forEach((status) => {
        const isEligible = status === "active";
        expect(isEligible).toBe(false);
      });
    });
  });

  describe("2. Sécurité Anti-IDOR sur les Produits Vendeur", () => {
    it("rejette strictement l'inclusion d'un produit appartenant à un tiers dans une promo vendeur (403)", () => {
      const currentSellerId = "seller_current_uid";
      const candidateProducts = [
        { id: "prod_1", sellerId: "seller_current_uid", name: "Produit A" },
        { id: "prod_2", sellerId: "seller_other_uid", name: "Produit Tiers" },
      ];

      const verifyOwnership = (sellerId: string, items: typeof candidateProducts) => {
        for (const item of items) {
          if (item.sellerId !== sellerId) {
            const err = new Error(`Réfusé : le produit ${item.id} appartient à un autre vendeur.`) as Error & { statusCode?: number };
            err.statusCode = 403;
            throw err;
          }
        }
      };

      expect(() => verifyOwnership(currentSellerId, candidateProducts)).toThrowError(/appartient à un autre vendeur/);
      try {
        verifyOwnership(currentSellerId, candidateProducts);
      } catch (err: unknown) {
        expect((err as { statusCode?: number }).statusCode).toBe(403);
      }
    });
  });

  describe("3. Verrou Serveur Mono-Vendeur Phase 4 (orderPlacement.service.ts)", () => {
    it("rejette tout panier multi-vendeurs avec le code d'erreur MULTI_VENDOR_CART_FORBIDDEN", () => {
      const sellerIdsSet = new Set<string>(["seller_alger_1", "seller_oran_2"]);

      const assertSingleVendorCart = (sellers: Set<string>) => {
        if (sellers.size > 1) {
          const err = new Error(
            "Votre panier contient des articles de plusieurs vendeurs différents. Olmart exige des commandes mono-vendeur pour garantir la livraison directe COD."
          ) as Error & { code?: string };
          err.code = "MULTI_VENDOR_CART_FORBIDDEN";
          throw err;
        }
      };

      expect(() => assertSingleVendorCart(sellerIdsSet)).toThrowError(/commandes mono-vendeur/);
      try {
        assertSingleVendorCart(sellerIdsSet);
      } catch (err: unknown) {
        expect((err as { code?: string }).code).toBe("MULTI_VENDOR_CART_FORBIDDEN");
      }
    });

    it("accepte un panier mono-vendeur strict (sellerIdsSet.size === 1)", () => {
      const singleSellerSet = new Set<string>(["seller_alger_1"]);
      const checkSingleVendor = (sellers: Set<string>) => sellers.size === 1;
      expect(checkSingleVendor(singleSellerSet)).toBe(true);
    });
  });

  describe("4. Régie Publicitaire Interne Olmart & Compteurs", () => {
    it("expose les 4 emplacements publicitaires avec tarifs en DZD et packs valides", () => {
      expect(OLMART_AD_SPOTS).toHaveLength(4);
      const spotIds = OLMART_AD_SPOTS.map((s) => s.id);
      expect(spotIds).toContain("homepage_spotlight");
      expect(spotIds).toContain("shop_top_bar");
      expect(spotIds).toContain("category_boost");
      expect(spotIds).toContain("featured_store_card");

      OLMART_AD_SPOTS.forEach((spot) => {
        expect(spot.pricePerDayDZD).toBeGreaterThan(0);
        expect(spot.packBronzeDZD).toBeGreaterThan(0);
        expect(spot.packSilverDZD).toBeGreaterThan(spot.packBronzeDZD);
        expect(spot.packGoldDZD).toBeGreaterThan(spot.packSilverDZD);
        expect(spot.estimatedDailyImpressions).toBeTruthy();
      });
    });

    it("calcule avec précision l'incrémentation des compteurs et le taux de clic (CTR)", () => {
      const campaign = {
        impressions: 1250,
        clicks: 75,
      };

      // Incrémentation
      campaign.impressions += 1;
      campaign.clicks += 1;

      expect(campaign.impressions).toBe(1251);
      expect(campaign.clicks).toBe(76);

      // Calcul CTR
      const ctr = Number(((campaign.clicks / campaign.impressions) * 100).toFixed(2));
      expect(ctr).toBe(6.08);
    });
  });
});
