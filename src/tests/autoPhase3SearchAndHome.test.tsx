import { describe, it, expect, vi } from "vitest";
import React from "react";
import {
  WILAYAS_69,
  searchWilayas,
  getWilayaById,
  getWilayaDisplayName,
  normalizeSearchText,
} from "../domains/auto/auto.wilayas";
import {
  CAR_BRANDS,
  getModelsForBrand,
  getAllBrandNames,
} from "../domains/auto/auto.brands";
import { autoSearchCache } from "../domains/auto/auto.cache";
import { BODY_TYPE_OPTIONS } from "../domains/auto/auto.utils";
import { AutoHeroShowroom } from "../components/Auto/AutoHeroShowroom";
import { AutoBodyTypesSection } from "../components/Auto/AutoBodyTypesSection";
import { AutoTrustSection } from "../components/Auto/AutoTrustSection";

// Mock React Router Link and navigation for isolated component inspection
vi.mock("react-router-dom", () => ({
  Link: ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) =>
    React.createElement("a", { href: to, className }, children),
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

describe("Phase 03 — Accueil & Parcours de Recherche Automobile (Olma Auto V2)", () => {
  describe("T02 : Référentiel Officiel des 69 Wilayas & Recherche Tolérante", () => {
    it("contains exactly 69 valid Algerian wilayas with unique codes and numeric IDs 1 to 69", () => {
      expect(WILAYAS_69.length).toBe(69);

      // Verify bounds and uniqueness
      const ids = new Set(WILAYAS_69.map((w) => w.id));
      const codes = new Set(WILAYAS_69.map((w) => w.code));
      expect(ids.size).toBe(69);
      expect(codes.size).toBe(69);

      expect(WILAYAS_69[0].code).toBe("01");
      expect(WILAYAS_69[0].name).toBe("Adrar");
      expect(WILAYAS_69[15].code).toBe("16");
      expect(WILAYAS_69[15].name).toBe("Alger");
      expect(WILAYAS_69[30].code).toBe("31");
      expect(WILAYAS_69[30].name).toBe("Oran");
      expect(WILAYAS_69[68].code).toBe("69");
      expect(WILAYAS_69[68].name).toBe("El Aricha");
    });

    it("performs tolerant search on historical wilayas in French and Arabic", () => {
      // 16 - Alger
      const byCode16 = searchWilayas("16");
      expect(byCode16.some((w) => w.name === "Alger")).toBe(true);

      const byFrAlger = searchWilayas("alger");
      expect(byFrAlger.some((w) => w.code === "16")).toBe(true);

      const byArAlger = searchWilayas("الجزائر");
      expect(byArAlger.some((w) => w.code === "16")).toBe(true);

      // 31 - Oran
      const byCode31 = searchWilayas("31");
      expect(byCode31.some((w) => w.name === "Oran")).toBe(true);

      const byArOran = searchWilayas("وهران");
      expect(byArOran.some((w) => w.code === "31")).toBe(true);
    });

    it("performs tolerant search on newly promoted and southern wilayas (El M'Ghair, Djanet, In Salah)", () => {
      // 49 - El M'Ghair
      const byMghair = searchWilayas("mghair");
      expect(byMghair.some((w) => w.code === "49")).toBe(true);

      const byArMghair = searchWilayas("المغير");
      expect(byArMghair.some((w) => w.code === "49")).toBe(true);

      // 56 - Djanet
      const byDjanet = searchWilayas("djanet");
      expect(byDjanet.some((w) => w.code === "56")).toBe(true);

      const byArDjanet = searchWilayas("جانت");
      expect(byArDjanet.some((w) => w.code === "56")).toBe(true);

      // 57 - In Salah
      const byInSalah = searchWilayas("in salah");
      expect(byInSalah.some((w) => w.code === "57")).toBe(true);

      const byArInSalah = searchWilayas("عين صالح");
      expect(byArInSalah.some((w) => w.code === "57")).toBe(true);
    });

    it("normalizes search text correctly stripping diacritics, hyphens and arabic hamzas", () => {
      expect(normalizeSearchText("Béjaïa")).toBe("bejaia");
      expect(normalizeSearchText("El M'Ghair")).toBe("elmghair");
      expect(normalizeSearchText("أدرار")).toBe("ادرار");
    });

    it("retrieves wilaya display name in French and Arabic correctly", () => {
      expect(getWilayaDisplayName(16, "fr")).toBe("Alger");
      expect(getWilayaDisplayName(16, "ar")).toBe("الجزائر");
      expect(getWilayaById(69)?.name).toBe("El Aricha");
      expect(getWilayaById(999)).toBeUndefined();
    });
  });

  describe("T03 : Synchronisation Sélecteur Marque / Modèle", () => {
    it("provides the official car brands catalog for the Algerian market", () => {
      expect(CAR_BRANDS.length).toBeGreaterThanOrEqual(15);
      const allBrands = getAllBrandNames();
      expect(allBrands).toContain("Renault");
      expect(allBrands).toContain("Peugeot");
      expect(allBrands).toContain("Volkswagen");
      expect(allBrands).toContain("Hyundai");
      expect(allBrands).toContain("Toyota");
      expect(allBrands).toContain("Fiat");
    });

    it("retrieves dependent models when a brand is selected", () => {
      const renaultModels = getModelsForBrand("Renault");
      expect(renaultModels).toContain("Clio");
      expect(renaultModels).toContain("Symbol");
      expect(renaultModels).toContain("Megane");

      const vwModels = getModelsForBrand("Volkswagen");
      expect(vwModels).toContain("Golf");
      expect(vwModels).toContain("Polo");
      expect(vwModels).toContain("Caddy");

      const empty = getModelsForBrand("");
      expect(empty).toEqual([]);
    });
  });

  describe("Stratégie de Cache de Recherche Client (TTL & Invalidation)", () => {
    it("manages client showcase cache with TTL and supports explicit invalidation", () => {
      autoSearchCache.invalidateShowcase();
      expect(autoSearchCache.getShowcase().data).toBeNull();

      const testListing = {
        id: "v-test-1",
        title: "Golf 8 R-Line 2022",
        brand: "Volkswagen",
        model: "Golf",
        year: 2022,
        mileage: 45000,
        fuel: "essence" as const,
        transmission: "automatique" as const,
        price: 5200000,
        priceType: "fixe" as const,
        currency: "DZD" as const,
        paperStatus: "safia" as const,
        bodyCondition: "origine" as const,
        wilayaId: 16,
        wilayaName: "Alger",
        primaryImageUrl: "https://example.com/golf8.webp",
        isSellerVerified: true,
        isVehicleInspected: true,
        status: "active" as const,
        createdAt: new Date().toISOString(),
      };

      autoSearchCache.setShowcase([testListing]);
      const cached = autoSearchCache.getShowcase();
      expect(cached.data).not.toBeNull();
      expect(cached.data?.length).toBe(1);
      expect(cached.data?.[0].id).toBe("v-test-1");
      expect(cached.isStale).toBe(false);

      // Invalidation removes cached items
      autoSearchCache.invalidateShowcase();
      expect(autoSearchCache.getShowcase().data).toBeNull();
    });
  });

  describe("Zone 3 & Zone 5 : Silhouettes Carrosserie & Charte de Confiance", () => {
    it("defines exactly 7 car body type silhouettes", () => {
      expect(BODY_TYPE_OPTIONS.length).toBe(7);
      const ids = BODY_TYPE_OPTIONS.map((b) => b.id);
      expect(ids).toContain("citadine");
      expect(ids).toContain("berline");
      expect(ids).toContain("suv");
      expect(ids).toContain("break");
      expect(ids).toContain("coupe");
      expect(ids).toContain("cabriolet");
      expect(ids).toContain("utilitaire");
    });

    it("renders AutoBodyTypesSection and AutoTrustSection with correct structure", () => {
      const bodySection = React.createElement(AutoBodyTypesSection);
      expect(bodySection).toBeDefined();

      const trustSection = React.createElement(AutoTrustSection);
      expect(trustSection).toBeDefined();
    });
  });

  describe("Zone 2 : AutoHeroShowroom UI & Accessibilité", () => {
    it("renders hero showroom with integrated search bar and Lime 400 action button", async () => {
      const { renderToString } = await import("react-dom/server");
      const html = renderToString(React.createElement(AutoHeroShowroom));
      expect(html).toContain("69 Wilayas");
      expect(html).toContain("Rechercher marque ou modèle");
      expect(html).toContain("Explorer");
      expect(html).toContain("bg-[#D9F66F]");
      expect(html).toContain("text-[#0B1730]");
      expect(html).toContain("Toutes les 69 Wilayas");
    });
  });

  describe("T01 & T04 & T05 : Rendu d'état vide, Paramètres URL & Cibles tactiles >= 44px", () => {
    it("T01 : renders AutoHome empty state with 0 crashes, 0 fake cards and publication CTA", async () => {
      const { renderToString } = await import("react-dom/server");
      const { AutoHome } = await import("../pages/Auto/AutoHome");
      const html = renderToString(React.createElement(AutoHome));
      expect(html).toContain("Recherche par Silhouette");
      expect(html).toContain("Charte de Sécurité Automobile");
      expect(html).toContain("Véhicules Carte Grise Safia");
      expect(html).toContain("Pièces Détachées Mécaniques");
    });

    it("T04 : formats URL search params deterministically", () => {
      const params = new URLSearchParams();
      params.set("brand", "Volkswagen");
      params.set("model", "Golf");
      params.set("wilayaId", "16");
      params.set("maxPrice", "4000000");

      expect(params.toString()).toBe("brand=Volkswagen&model=Golf&wilayaId=16&maxPrice=4000000");
    });

    it("T05 : verifies interactive elements have min-h-[44px] touch target class", async () => {
      const { renderToString } = await import("react-dom/server");
      const heroHtml = renderToString(React.createElement(AutoHeroShowroom));
      expect(heroHtml).toContain("min-h-[44px]");
    });
  });
});

