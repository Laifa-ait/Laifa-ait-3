import {
  CustomPageSectionType,
  CustomPageTheme,
  StoreThemeSector,
} from "../../../../domains/seller/customPage.types";
import { Product } from "../../../../domains/product/product.types";
import { CategoryItem, CategoryPreset } from "./categoryPresetTypes";
import { CATEGORY_PRESETS_PART1 } from "./categoryPresetsPart1";
import { CATEGORY_PRESETS_PART2 } from "./categoryPresetsPart2";
import {
  SECTOR_EXTRA_CATEGORY_PRESETS,
  SECTOR_HERO_DEFAULTS,
} from "./sectorCoherenceData";
import {
  DEFAULT_MODERN_SECTOR,
  DEFAULT_MODERN_THEME,
  getSectorMediaAsset,
} from "./studioThemeDefaults";

export { SECTOR_EXTRA_CATEGORY_PRESETS } from "./sectorCoherenceData";

export const DEFAULT_STUDIO_SECTOR: StoreThemeSector = DEFAULT_MODERN_SECTOR;

export const DEFAULT_STUDIO_THEME: CustomPageTheme = DEFAULT_MODERN_THEME;

export function getSectorCategoryPreset(sector: StoreThemeSector = DEFAULT_STUDIO_SECTOR): CategoryPreset {
  if (sector === "tech") return CATEGORY_PRESETS_PART1[1];
  if (sector === "beaute") return CATEGORY_PRESETS_PART1[2];
  if (sector === "artisanat") return CATEGORY_PRESETS_PART2[0];
  if (sector === "alimentation") return CATEGORY_PRESETS_PART2[3];
  if (sector === "maison") return SECTOR_EXTRA_CATEGORY_PRESETS.maison;
  if (sector === "sport") return SECTOR_EXTRA_CATEGORY_PRESETS.sport;
  if (sector === "accessoires") return SECTOR_EXTRA_CATEGORY_PRESETS.accessoires;
  if (sector === "enfants") return SECTOR_EXTRA_CATEGORY_PRESETS.enfants;
  return CATEGORY_PRESETS_PART1[0];
}

export function buildSectorAwareSectionDefaults(
  type: CustomPageSectionType,
  baseSettings: Record<string, unknown> = {},
  sector: StoreThemeSector = DEFAULT_STUDIO_SECTOR,
  storeWilaya = "Alger",
  products: Product[] = []
): Record<string, unknown> {
  const preset = getSectorCategoryPreset(sector);
  const heroDef = SECTOR_HERO_DEFAULTS[sector] || {
    ...SECTOR_HERO_DEFAULTS[DEFAULT_STUDIO_SECTOR],
    imageUrl: getSectorMediaAsset(sector),
  };

  if (type === "hero_banner") {
    return {
      ...baseSettings,
      badgeText: heroDef.badgeText,
      title: heroDef.title,
      subtitle: heroDef.subtitle,
      imageUrl: (baseSettings.imageUrl as string) || heroDef.imageUrl,
      ctaText: (baseSettings.ctaText as string) || "Explorer la Collection",
      ctaLink: (baseSettings.ctaLink as string) || "#catalog",
    };
  }
  if (type === "featured_categories") {
    return {
      ...baseSettings,
      ...preset.settings,
      activePresetId: preset.id,
      categories: preset.settings.categories.map((c) => ({ ...c })),
    };
  }
  if (type === "curated_collections") {
    const sampleIds = products.slice(0, 3).map((p) => p.id);
    return {
      ...baseSettings,
      title: preset.settings.title || "Nos *Collections* {Signature}",
      collections: preset.settings.categories.slice(0, 3).map((cat, idx) => ({
        id: `col_${sector}_${idx + 1}`,
        title: cat.name,
        imageUrl: cat.imageUrl || products[idx]?.images?.[0] || products[idx]?.image || getSectorMediaAsset(sector),
        productIds: sampleIds,
      })),
    };
  }
  if (type === "featured_products" || type === "new_arrivals" || type === "best_sellers" || type === "product_grid") {
    const isSquare = sector === "tech" || sector === "beaute" || sector === "alimentation" || sector === "enfants";
    return {
      ...baseSettings,
      cardAspectRatio: isSquare ? "1/1" : "4/5",
      cardStyle: sector === "mode" || sector === "accessoires" ? "elevated" : "modern",
      columnsDesktop: 4,
      showStockBadge: true,
    };
  }
  if (type === "delivery_info") {
    return {
      ...baseSettings,
      title: "Livraison Rapide sur les {69 Wilayas}",
      defaultTimeframe: "24h à 72h selon la Wilaya",
      stopDeskPrice: 400,
      homeDeliveryPrice: 600,
      freeShippingAbove: 10000,
      customTariffs: [
        { wilayaName: "16 - Alger & Blida", estimatedDays: "24h", priceDZD: 400, homeDeliveryAvailable: true },
        { wilayaName: "Oran, Constantine, Sétif", estimatedDays: "24h - 48h", priceDZD: 500, homeDeliveryAvailable: true },
        { wilayaName: "Sud & Autres Wilayas (69)", estimatedDays: "48h - 72h", priceDZD: 650, homeDeliveryAvailable: true },
      ],
    };
  }
  if (type === "contact_footer") {
    const wilaya = (storeWilaya || "").trim();
    return {
      ...baseSettings,
      title: (baseSettings.title as string) || "Service Client & Contact",
      wilaya: (baseSettings.wilaya as string) ?? wilaya,
      address: (baseSettings.address as string) ?? (wilaya || "Centre-ville"),
      shopPhone: (baseSettings.shopPhone as string) ?? "",
      shopEmail: (baseSettings.shopEmail as string) ?? "",
      workingHours: (baseSettings.workingHours as string) || "Samedi au Jeudi de 09h00 à 18h00",
    };
  }
  return { ...baseSettings };
}

export function getSectorCategoriesForArchetype(sector: StoreThemeSector): CategoryItem[] {
  return getSectorCategoryPreset(sector).settings.categories.map((c) => ({ ...c }));
}

export const getSectorPresetCategories = getSectorCategoriesForArchetype;
