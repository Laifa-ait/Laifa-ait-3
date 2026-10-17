import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { calculateArgusEstimate } from "../domains/auto/auto.argus";
import { AutoEstimationPage } from "../pages/Auto/AutoEstimationPage";
import { AutoComparePage } from "../pages/Auto/AutoComparePage";
import { CatalogHeader } from "../components/Auto/CatalogHeader";
import { VehicleCard } from "../components/Auto/VehicleCard";
import { VehicleCatalogItemDto } from "../domains/auto/auto.types";

vi.mock("react-router-dom", () => ({
  Link: ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) =>
    React.createElement("a", { href: to, className }, children),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/auto/estimation", search: "" }),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

describe("Audit Olma Auto & Nouvelles Pages / Boutons", () => {
  describe("1. Moteur Argus & Estimation Algérie (auto.argus.ts)", () => {
    it("calculates realistic deterministic bounds for popular vehicles in Algeria", () => {
      const estimate = calculateArgusEstimate({
        brand: "Renault",
        model: "Clio 4",
        year: 2019,
        mileage: 95000,
        fuel: "diesel",
        transmission: "manuelle",
        paperStatus: "safia",
        bodyCondition: "origine",
      });

      expect(estimate.minPrice).toBeLessThan(estimate.estimatedPrice);
      expect(estimate.estimatedPrice).toBeLessThan(estimate.maxPrice);
      expect(estimate.estimatedPriceMillions).toBeGreaterThan(150);
      expect(estimate.estimatedPriceMillions).toBeLessThan(400);
      expect(estimate.liquidity).toBe("tres_elevee");
      expect(estimate.averageSellingDays).toBeLessThanOrEqual(14);
    });

    it("applies Algerian market discount for non-safia papers and repainted body", () => {
      const safiaEstimate = calculateArgusEstimate({
        brand: "Volkswagen",
        model: "Golf 7",
        year: 2018,
        mileage: 120000,
        fuel: "diesel",
        transmission: "automatique",
        paperStatus: "safia",
        bodyCondition: "origine",
      });

      const moudjahidEstimate = calculateArgusEstimate({
        brand: "Volkswagen",
        model: "Golf 7",
        year: 2018,
        mileage: 120000,
        fuel: "diesel",
        transmission: "automatique",
        paperStatus: "moudjahid",
        bodyCondition: "repeinte",
      });

      expect(moudjahidEstimate.estimatedPrice).toBeLessThan(safiaEstimate.estimatedPrice);
      expect(moudjahidEstimate.liquidity).toBe("faible");
    });
  });

  describe("2. Page Estimation Argus (AutoEstimationPage)", () => {
    it("renders estimation page with car controls and direct CTAs", () => {
      const html = renderToString(React.createElement(AutoEstimationPage));
      expect(html).toContain("Cote Argus Automobile en Algérie");
      expect(html).toContain("Fourchette de prix estimée");
      expect(html).toContain("Caractéristiques du véhicule");
      expect(html).toContain("Déposer mon annonce à ce prix");
    });
  });

  describe("3. Page Comparateur de Véhicules (AutoComparePage)", () => {
    it("renders empty state when no vehicles are selected", () => {
      const html = renderToString(React.createElement(AutoComparePage));
      expect(html).toContain("Aucun véhicule à comparer");
      expect(html).toContain("Explorer le catalogue");
    });
  });

  describe("4. En-tête Catalogue & Onglets Favoris (CatalogHeader)", () => {
    it("renders catalog tabs and toggles favorites count", () => {
      const html = renderToString(
        React.createElement(CatalogHeader, {
          total: 42,
          favoritesCount: 3,
          isFavoritesMode: false,
          displayedCount: 42,
          onTabChange: () => {},
        })
      );

      expect(html).toContain("Toutes les annonces");
      expect(html).toContain("42");
      expect(html).toContain("Mes Favoris");
      expect(html).toContain("3");
      expect(html).toContain("Déposer une annonce");
    });
  });

  describe("5. Bouton Comparer & Carte Véhicule (VehicleCard)", () => {
    const mockVehicle: VehicleCatalogItemDto = {
      id: "v-test-100",
      title: "Toyota Hilux Double Cabine 2021",
      brand: "Toyota",
      model: "Hilux",
      year: 2021,
      mileage: 65000,
      fuel: "diesel",
      transmission: "manuelle",
      price: 5800000,
      priceType: "fixe",
      currency: "DZD",
      paperStatus: "safia",
      bodyCondition: "origine",
      wilayaId: 31,
      wilayaName: "Oran",
      primaryImageUrl: "https://example.com/hilux.jpg",
      isSellerVerified: true,
      isVehicleInspected: true,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    it("renders comparison and favorite buttons on the card", () => {
      const html = renderToString(
        React.createElement(VehicleCard, {
          vehicle: mockVehicle,
          isFavorite: false,
        })
      );

      expect(html).toContain("Toyota");
      expect(html).toContain("Hilux");
      expect(html).toContain("Comparer ce véhicule");
      expect(html).toContain("Ajouter aux favoris");
      expect(html).toContain("Contacter le vendeur");
    });
  });
});
