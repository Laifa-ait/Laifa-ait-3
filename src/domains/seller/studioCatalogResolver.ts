import { Product } from "../product/product.types";
import { resolveCanonicalCategoryKey } from "../../utils/categoryCanonical";
import {
  classifyCatalogProductStatus,
  isCatalogProductPubliclyActive,
  parseProductTimestampMs,
  slugifyCategoryValue,
} from "./studioCatalogStatus";

export {
  PUBLIC_PRODUCT_STATUS_SET,
  classifyCatalogProductStatus,
  isCatalogProductPubliclyActive,
  parseProductTimestampMs,
  serializeTimestampIso,
  slugifyCategoryValue,
  type CatalogLifecycleGroup,
  type CatalogProductStatusMeta,
} from "./studioCatalogStatus";

export function doesProductMatchCategoryFilter(
  product: Pick<Product, "category" | "subcategory" | "subCategory" | "subSubCategory" | "subsubcategory">,
  rawFilter: string | undefined | null
): boolean {
  const target = (rawFilter || "").trim();
  if (!target) return true;
  const targetLower = target.toLowerCase();
  const targetSlug = slugifyCategoryValue(target);
  const targetCanonical = resolveCanonicalCategoryKey(target).toLowerCase();

  const candidates = [
    product.category,
    product.subcategory,
    product.subCategory,
    product.subSubCategory,
    product.subsubcategory,
  ]
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean);

  for (const val of candidates) {
    if (val.toLowerCase() === targetLower) return true;
    if (targetSlug && slugifyCategoryValue(val) === targetSlug) return true;
    if (targetCanonical && resolveCanonicalCategoryKey(val).toLowerCase() === targetCanonical) return true;
  }
  return false;
}

export interface ProductFeedResolutionResult {
  items: Product[];
  effectiveMode: "manual" | "auto";
  missingProductIds: string[];
  inactiveProductIds: string[];
  undatedProductIds: string[];
  hasRealSalesData: boolean;
  obsoleteCategoryFilter: boolean;
}

export function resolveProductFeedItems(
  sectionType: "featured_products" | "new_arrivals" | "best_sellers" | "product_grid",
  settings: { selectionMode?: "manual" | "auto"; productIds?: string[]; filterCategoryId?: string; maxItems?: number },
  allProducts: Product[]
): ProductFeedResolutionResult {
  const activeProducts = allProducts.filter(isCatalogProductPubliclyActive);
  const allById = new Map(allProducts.map((p) => [p.id, p]));
  const activeById = new Map(activeProducts.map((p) => [p.id, p]));

  const manualIds = Array.isArray(settings.productIds)
    ? settings.productIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
    : [];

  const missingProductIds: string[] = [];
  const inactiveProductIds: string[] = [];
  for (const id of manualIds) {
    const found = allById.get(id);
    if (!found || classifyCatalogProductStatus(found).lifecycle === "deleted") missingProductIds.push(id);
    else if (!activeById.has(id)) inactiveProductIds.push(id);
  }

  const maxItems =
    typeof settings.maxItems === "number" && Number.isFinite(settings.maxItems) && settings.maxItems > 0
      ? settings.maxItems
      : 8;
  const isManual =
    settings.selectionMode === "manual" ||
    (settings.selectionMode !== "auto" && (manualIds.length > 0 || (sectionType === "featured_products" && !settings.filterCategoryId)));

  if (isManual) {
    const picked = manualIds.map((id) => activeById.get(id)).filter((p): p is Product => Boolean(p));
    const items = sectionType === "featured_products" && typeof settings.maxItems !== "number" ? picked : picked.slice(0, maxItems);
    const undatedProductIds =
      sectionType === "new_arrivals" ? items.filter((p) => parseProductTimestampMs(p.createdAt) <= 0).map((p) => p.id) : [];
    return {
      items,
      effectiveMode: "manual",
      missingProductIds,
      inactiveProductIds,
      undatedProductIds,
      hasRealSalesData: items.some((p) => Number(p.salesCount || 0) > 0),
      obsoleteCategoryFilter: false,
    };
  }

  const filterCat = (settings.filterCategoryId || "").trim();
  const pool = filterCat ? activeProducts.filter((p) => doesProductMatchCategoryFilter(p, filterCat)) : [...activeProducts];
  const obsoleteCategoryFilter = Boolean(filterCat && activeProducts.length > 0 && pool.length === 0);

  if (sectionType === "new_arrivals") {
    const datedPool: Product[] = [];
    const undatedProductIds: string[] = [];
    for (const p of pool) {
      if (parseProductTimestampMs(p.createdAt) > 0) datedPool.push(p);
      else undatedProductIds.push(p.id);
    }
    datedPool.sort((a, b) => {
      const diff = parseProductTimestampMs(b.createdAt) - parseProductTimestampMs(a.createdAt);
      return diff !== 0 ? diff : a.id.localeCompare(b.id);
    });
    return {
      items: datedPool.slice(0, maxItems),
      effectiveMode: "auto",
      missingProductIds,
      inactiveProductIds,
      undatedProductIds,
      hasRealSalesData: datedPool.some((p) => Number(p.salesCount || 0) > 0),
      obsoleteCategoryFilter,
    };
  }

  const hasSalesInPool = pool.some((p) => Number(p.salesCount || 0) > 0);
  if (sectionType === "best_sellers" && hasSalesInPool) {
    const salesOnlyPool = pool.filter((p) => Number(p.salesCount || 0) > 0);
    salesOnlyPool.sort((a, b) => {
      const salesDiff = Number(b.salesCount || 0) - Number(a.salesCount || 0);
      return salesDiff !== 0 ? salesDiff : parseProductTimestampMs(b.createdAt) - parseProductTimestampMs(a.createdAt);
    });
    return {
      items: salesOnlyPool.slice(0, maxItems),
      effectiveMode: "auto",
      missingProductIds,
      inactiveProductIds,
      undatedProductIds: [],
      hasRealSalesData: true,
      obsoleteCategoryFilter,
    };
  }

  return {
    items: pool.slice(0, maxItems),
    effectiveMode: "auto",
    missingProductIds,
    inactiveProductIds,
    undatedProductIds: [],
    hasRealSalesData: hasSalesInPool,
    obsoleteCategoryFilter,
  };
}

export function resolveCategoryAssignedProducts(
  category: { selectionMode?: "manual" | "auto"; productIds?: string[]; categoryFilter?: string; name?: string; slug?: string },
  allProducts: Product[]
): { items: Product[]; missingIds: string[]; inactiveIds: string[]; mode: "manual" | "auto" } {
  const activeProducts = allProducts.filter(isCatalogProductPubliclyActive);
  const allById = new Map(allProducts.map((p) => [p.id, p]));
  const activeById = new Map(activeProducts.map((p) => [p.id, p]));
  const ids = Array.isArray(category.productIds) ? category.productIds : [];

  const missingIds: string[] = [];
  const inactiveIds: string[] = [];
  for (const id of ids) {
    const raw = allById.get(id);
    if (!raw || classifyCatalogProductStatus(raw).lifecycle === "deleted") missingIds.push(id);
    else if (!activeById.has(id)) inactiveIds.push(id);
  }

  const preferAuto = category.selectionMode === "auto" || (ids.length === 0 && Boolean(category.categoryFilter));
  if (!preferAuto && ids.length > 0) {
    return {
      items: ids.map((id) => activeById.get(id)).filter((p): p is Product => Boolean(p)),
      missingIds,
      inactiveIds,
      mode: "manual",
    };
  }

  const filterTarget = (category.categoryFilter || category.name || category.slug || "").trim();
  return {
    items: filterTarget ? activeProducts.filter((p) => doesProductMatchCategoryFilter(p, filterTarget)) : [],
    missingIds,
    inactiveIds,
    mode: "auto",
  };
}
