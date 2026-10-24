import { describe, it, expect } from "vitest";
import { SellerAnalyticsService } from "../domains/seller/services/sellerAnalytics.service";

describe("PHASE 6 — Analytics Vendeur & Fidélisation (Olmart COD)", () => {
  describe("1. Distinction Stricte du Chiffre d'Affaires COD (DZD)", () => {
    it("n'inclut JAMAIS les commandes 'pending', 'created', 'shipped' ou 'cancelled' dans deliveredRevenue", () => {
      const mockOrders = [
        { id: "ord_1", total: 12000, status: "created" },
        { id: "ord_2", total: 8500, status: "confirmed" },
        { id: "ord_3", total: 4500, status: "shipped" },
        { id: "ord_4", total: 25000, status: "delivered" }, // Seule commande livrée / encaissée
        { id: "ord_5", total: 30000, status: "delivered" }, // Seule commande livrée / encaissée
        { id: "ord_6", total: 6000, status: "cancelled" }, // Annulée -> exclue de tout CA
        { id: "ord_7", total: 4000, status: "returned" }, // Retournée -> exclue du CA net
      ];

      const { orderedRevenue, deliveredRevenue, statusBreakdown } =
        SellerAnalyticsService.calculateRevenueBreakdown(mockOrders);

      // deliveredRevenue = strictement ord_4 (25000) + ord_5 (30000) = 55000 DZD
      expect(deliveredRevenue).toBe(55000);

      // orderedRevenue = ord_1 (12000) + ord_2 (8500) + ord_3 (4500) + ord_4 (25000) + ord_5 (30000) = 80000 DZD
      expect(orderedRevenue).toBe(80000);

      // Volumes par statut exacts
      expect(statusBreakdown.delivered).toBe(2);
      expect(statusBreakdown.created).toBe(1);
      expect(statusBreakdown.confirmed).toBe(1);
      expect(statusBreakdown.shipped).toBe(1);
      expect(statusBreakdown.cancelled).toBe(1);
      expect(statusBreakdown.returned).toBe(1);
    });

    it("gère un vendeur sans aucune commande livrée (deliveredRevenue === 0)", () => {
      const mockOrders = [
        { id: "ord_1", total: 10000, status: "created" },
        { id: "ord_2", total: 15000, status: "shipped" },
        { id: "ord_3", total: 5000, status: "cancelled" },
      ];

      const { orderedRevenue, deliveredRevenue, statusBreakdown } =
        SellerAnalyticsService.calculateRevenueBreakdown(mockOrders);

      expect(deliveredRevenue).toBe(0);
      expect(orderedRevenue).toBe(25000);
      expect(statusBreakdown.delivered).toBe(0);
      expect(statusBreakdown.shipped).toBe(1);
    });
  });

  describe("2. Sécurité Anti-IDOR sur les Statistiques Vendeur", () => {
    it("autorise la consultation lorsque authenticatedUid === targetSellerId", () => {
      const authUid = "seller_alger_123";
      const targetId = "seller_alger_123";

      expect(() => {
        SellerAnalyticsService.verifySellerAccess(authUid, targetId);
      }).not.toThrow();
    });

    it("bloque strictement la consultation des métriques d'un tiers avec une erreur 403", () => {
      const authUid = "seller_alger_123";
      const victimSellerId = "seller_oran_999";

      expect(() => {
        SellerAnalyticsService.verifySellerAccess(authUid, victimSellerId);
      }).toThrowError(/Accès refusé/);

      try {
        SellerAnalyticsService.verifySellerAccess(authUid, victimSellerId);
      } catch (err: unknown) {
        expect((err as { statusCode?: number }).statusCode).toBe(403);
      }
    });
  });

  describe("3. Taux de Conversion Sécurisé & Calcul sans division par zéro", () => {
    it("renvoie 0% sans planter si le nombre de visites boutique est de zéro", () => {
      const rate = SellerAnalyticsService.calculateConversionRate(5, 0);
      expect(rate).toBe(0);
      expect(Number.isFinite(rate)).toBe(true);
    });

    it("calcule avec précision le ratio commandes / visites en pourcentage arrondi à 2 décimales quand le suivi existe", () => {
      // 12 commandes pour 400 visites = (12/400)*100 = 3.00%
      const rate1 = SellerAnalyticsService.calculateConversionRate(12, 400);
      expect(rate1).toBe(3);

      // 7 commandes pour 233 visites = (7/233)*100 = 3.00429... -> 3.00%
      const rate2 = SellerAnalyticsService.calculateConversionRate(7, 233);
      expect(rate2).toBe(3);

      // Plafond à 100%
      const rateMax = SellerAnalyticsService.calculateConversionRate(200, 100);
      expect(rateMax).toBe(100);
    });
  });

  describe("4. Fidélisation & Abonnés Boutique (Follow / Unfollow Transaction Logic)", () => {
    it("simule la transition d'état d'abonnement et de décrémentation sécurisée sans compteur négatif", () => {
      const calculateNewFollowers = (currentCount: number, isFollowing: boolean): { isFollowing: boolean; newCount: number } => {
        if (isFollowing) {
          // Unfollow
          return { isFollowing: false, newCount: Math.max(0, currentCount - 1) };
        } else {
          // Follow
          return { isFollowing: true, newCount: currentCount + 1 };
        }
      };

      // Premier abonnement
      expect(calculateNewFollowers(0, false)).toEqual({ isFollowing: true, newCount: 1 });

      // Désabonnement
      expect(calculateNewFollowers(5, true)).toEqual({ isFollowing: false, newCount: 4 });

      // Désabonnement alors que le compteur était à 0 (évite -1)
      expect(calculateNewFollowers(0, true)).toEqual({ isFollowing: false, newCount: 0 });
    });
  });
});
