import brandsRaw from "./data/carBrandsModels.json";

export interface CarBrandItem {
  brandId: string;
  brandName: string;
  models: string[];
}

export interface BrandModelSearchResult {
  brand: string;
  brandId: string;
  model: string;
  matchedOn: "brand" | "model";
}

export const CAR_BRANDS: readonly CarBrandItem[] = Object.freeze(
  brandsRaw as CarBrandItem[]
);

export function getModelsForBrand(brandNameOrId: string): string[] {
  if (!brandNameOrId) return [];
  const query = brandNameOrId.trim().toLowerCase();
  const brand = CAR_BRANDS.find(
    (b) =>
      b.brandId.toLowerCase() === query ||
      b.brandName.toLowerCase() === query
  );
  return brand ? [...brand.models] : [];
}

export function getAllBrandNames(): string[] {
  return CAR_BRANDS.map((b) => b.brandName);
}

export function findBrandByModel(modelName: string): CarBrandItem | undefined {
  if (!modelName) return undefined;
  const q = modelName.trim().toLowerCase();
  return CAR_BRANDS.find((b) =>
    b.models.some((m) => m.toLowerCase() === q || m.toLowerCase().includes(q))
  );
}

export function searchBrandsAndModels(query: string, limit = 10): BrandModelSearchResult[] {
  if (!query) return [];
  const q = query.trim().toLowerCase();
  const results: BrandModelSearchResult[] = [];

  for (const b of CAR_BRANDS) {
    if (b.brandName.toLowerCase().includes(q)) {
      results.push({
        brand: b.brandName,
        brandId: b.brandId,
        model: b.models[0] || "",
        matchedOn: "brand",
      });
    }

    for (const m of b.models) {
      if (m.toLowerCase().includes(q)) {
        results.push({
          brand: b.brandName,
          brandId: b.brandId,
          model: m,
          matchedOn: "model",
        });
      }
      if (results.length >= limit * 2) break;
    }
  }

  // Deduplicate and limit
  const seen = new Set<string>();
  const unique: BrandModelSearchResult[] = [];
  for (const r of results) {
    const key = `${r.brand}-${r.model}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(r);
    }
    if (unique.length >= limit) break;
  }

  return unique;
}
