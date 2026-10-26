import { describe, it, expect, beforeEach } from "vitest";
import {
  syncCategoriesFromProducts,
  countMatchingProductsForCategory,
  QUICK_CATEGORY_BADGES,
} from "../pages/Seller/StoreBuilder/components/inspector/controls/CategorySmartSyncBar";
import {
  ALGERIA_DELIVERY_PRESETS,
  ALGERIA_FAQ_PRESET_ITEMS,
  ALGERIA_RETURN_POLICY_PRESETS,
  ALGERIA_BRAND_STORY_PRESET,
} from "../pages/Seller/StoreBuilder/components/inspector/controls/AlgeriaEcommercePresets";
import { useStudioStore } from "../pages/Seller/StoreBuilder/store/useStudioStore";
import { Product } from "../domains/product/product.types";
import { CategoryItem } from "../pages/Seller/StoreBuilder/constants/categoryPresets";

function makeMockProduct(overrides: Partial<Product> & { id: string; name: string; category: string }): Product {
  return {
    id: overrides.id,
    name: overrides.name,
    category: overrides.category,
    price: overrides.price ?? 4500,
    image: overrides.image ?? "https://example.com/default.jpg",
    images: overrides.images,
    rating: 4.8,
    description: "Produit test",
    stock: overrides.stock ?? 10,
    sellerId: "seller_1",
    wilaya: "Alger",
    status: overrides.status ?? ("active" as Product["status"]),
  };
}

describe("Studio Step 3 — CategorySmartSyncBar & Diagnostics", () => {
  const sampleProducts: Product[] = [
    makeMockProduct({
      id: "p1",
      name: "Karakou Algérois Brodé",
      category: "Tenues Traditionnelles",
      images: ["https://example.com/karakou-1.jpg"],
    }),
    makeMockProduct({
      id: "p2",
      name: "Caftan Oranais",
      category: "Tenues Traditionnelles",
      images: ["https://example.com/caftan-2.jpg"],
    }),
    makeMockProduct({
      id: "p3",
      name: "Parfum Oud Royal",
      category: "Parfumerie",
      image: "https://example.com/oud.jpg",
    }),
    makeMockProduct({
      id: "p4",
      name: "Produit Brouillon Ignoré",
      category: "Rayon Brouillon",
      status: "draft" as Product["status"],
    }),
  ];

  it("extracts distinct active product categories, counts items, and assigns first product image", () => {
    const synced = syncCategoriesFromProducts(sampleProducts, []);
    expect(synced).toHaveLength(2);

    const trad = synced.find((c) => c.name === "Tenues Traditionnelles");
    expect(trad).toBeDefined();
    expect(trad?.itemCount).toBe(2);
    expect(trad?.imageUrl).toBe("https://example.com/karakou-1.jpg");
    expect(trad?.productIds).toEqual(["p1", "p2"]);

    const parf = synced.find((c) => c.name === "Parfumerie");
    expect(parf).toBeDefined();
    expect(parf?.itemCount).toBe(1);
    expect(parf?.imageUrl).toBe("https://example.com/oud.jpg");
    expect(parf?.productIds).toEqual(["p3"]);
  });

  it("preserves existing custom badge and icon when re-syncing existing categories", () => {
    const existing: CategoryItem[] = [
      {
        id: "cat_custom_1",
        name: "Tenues Traditionnelles",
        slug: "tenues-traditionnelles",
        badge: "Édition limitée",
        badgeColor: "#8B5CF6",
        iconName: "Crown",
        imageUrl: "https://example.com/custom-cover.jpg",
      },
    ];

    const synced = syncCategoriesFromProducts(sampleProducts, existing);
    const updated = synced.find((c) => c.id === "cat_custom_1");
    expect(updated).toBeDefined();
    expect(updated?.badge).toBe("Édition limitée");
    expect(updated?.iconName).toBe("Crown");
    expect(updated?.imageUrl).toBe("https://example.com/custom-cover.jpg");
    expect(updated?.itemCount).toBe(2);
  });

  it("accurately counts matching active products and detects empty categories (0 produit)", () => {
    const activeCat: CategoryItem = {
      id: "c1",
      name: "Tenues Traditionnelles",
      slug: "tenues-traditionnelles",
    };
    const emptyCat: CategoryItem = {
      id: "c2",
      name: "Accessoires Introuvables",
      slug: "accessoires-introuvables",
    };

    expect(countMatchingProductsForCategory(activeCat, sampleProducts)).toBe(2);
    expect(countMatchingProductsForCategory(emptyCat, sampleProducts)).toBe(0);
    expect(QUICK_CATEGORY_BADGES).toContain("Best-seller");
    expect(QUICK_CATEGORY_BADGES).toContain("Aucun");
  });
});

describe("Studio Step 3 — Algeria E-Commerce Presets & Quick-Action Dock", () => {
  beforeEach(() => {
    useStudioStore.getState().clearPendingSectionAction();
  });

  it("provides 3 ready-to-use 58 Wilayas delivery presets in DZD", () => {
    expect(ALGERIA_DELIVERY_PRESETS).toHaveLength(3);
    const ids = ALGERIA_DELIVERY_PRESETS.map((p) => p.id);
    expect(ids).toEqual([
      "standard_58_wilayas",
      "express_nord_grandes_villes",
      "forfait_unique_national",
    ]);

    for (const preset of ALGERIA_DELIVERY_PRESETS) {
      expect(preset.patch.stopDeskPrice).toBeGreaterThan(0);
      expect(preset.patch.homeDeliveryPrice).toBeGreaterThan(0);
      expect(preset.patch.customTariffs.length).toBeGreaterThan(0);
    }
  });

  it("provides the 5 essential Algeria COD, parcel inspection, Wilaya, exchange, and Stop-Desk FAQs", () => {
    expect(ALGERIA_FAQ_PRESET_ITEMS).toHaveLength(5);
    expect(ALGERIA_FAQ_PRESET_ITEMS[0].question).toContain("paiement à la livraison");
    expect(ALGERIA_FAQ_PRESET_ITEMS[1].question).toContain("vérifier mon colis");
    expect(ALGERIA_FAQ_PRESET_ITEMS[4].question).toContain("Stop-Desk");
  });

  it("provides structured return policy (7j/14j) and brand story presets", () => {
    expect(ALGERIA_RETURN_POLICY_PRESETS.days7.delayDays).toBe(7);
    expect(ALGERIA_RETURN_POLICY_PRESETS.days14.delayDays).toBe(14);
    expect(ALGERIA_BRAND_STORY_PRESET.heading).toBeTruthy();
    expect(ALGERIA_BRAND_STORY_PRESET.yearsOfExperience).toBeGreaterThan(0);
  });

  it("dispatches cycle-color-scheme action from CanvasSectionFloatingDock via useStudioStore", () => {
    useStudioStore.getState().triggerSectionAction("sec_hero_1", "cycle-color-scheme");
    const pending = useStudioStore.getState().pendingSectionAction;
    expect(pending).not.toBeNull();
    expect(pending?.sectionId).toBe("sec_hero_1");
    expect(pending?.action).toBe("cycle-color-scheme");
  });
});
