import { PRODUCT_STATUSES } from "../product/product.status";
import { Product } from "../product/product.types";
import { resolveCanonicalCategoryKey } from "../../utils/categoryCanonical";

export type CatalogLifecycleGroup = "active" | "inactive" | "deleted";

export interface CatalogProductStatusMeta {
  lifecycle: CatalogLifecycleGroup;
  rawStatus: string;
  label: string;
  isPubliclyVisible: boolean;
  isPurchasable: boolean;
}

export const PUBLIC_PRODUCT_STATUS_SET = new Set<string>([PRODUCT_STATUSES.ACTIVE, "approved", "published"]);
const DELETED_PRODUCT_STATUS_SET = new Set<string>(["deleted", "pending_deletion"]);

export function slugifyCategoryValue(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseProductTimestampMs(raw: unknown): number {
  if (!raw) return 0;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : 0;
  if (raw instanceof Date) return Number.isFinite(raw.getTime()) ? raw.getTime() : 0;
  if (typeof raw === "string") {
    const parsed = new Date(raw).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof raw === "object") {
    const obj = raw as {
      toMillis?: () => number;
      toDate?: () => Date;
      seconds?: unknown;
      _seconds?: unknown;
      nanoseconds?: unknown;
      _nanoseconds?: unknown;
    };
    if (typeof obj.toMillis === "function") {
      const ms = obj.toMillis();
      return Number.isFinite(ms) ? ms : 0;
    }
    if (typeof obj.toDate === "function") {
      const ms = obj.toDate().getTime();
      return Number.isFinite(ms) ? ms : 0;
    }
    const sec = typeof obj.seconds === "number" ? obj.seconds : typeof obj._seconds === "number" ? obj._seconds : NaN;
    if (Number.isFinite(sec)) {
      const ns = typeof obj.nanoseconds === "number" ? obj.nanoseconds : typeof obj._nanoseconds === "number" ? obj._nanoseconds : 0;
      return sec * 1000 + Math.floor(ns / 1_000_000);
    }
  }
  return 0;
}

export function serializeTimestampIso(raw: unknown): string | undefined {
  const ms = parseProductTimestampMs(raw);
  return ms > 0 ? new Date(ms).toISOString() : undefined;
}

export function classifyCatalogProductStatus(product: { status?: unknown; stock?: unknown; deletedAt?: unknown }): CatalogProductStatusMeta {
  const rawStatus =
    typeof product.status === "string" && product.status.trim() ? product.status.trim().toLowerCase() : PRODUCT_STATUSES.ACTIVE;
  const stockNum = typeof product.stock === "number" ? product.stock : 1;

  if (product.deletedAt || DELETED_PRODUCT_STATUS_SET.has(rawStatus)) {
    return {
      lifecycle: "deleted",
      rawStatus,
      label: rawStatus === "pending_deletion" ? "Suppression" : "Supprimé",
      isPubliclyVisible: false,
      isPurchasable: false,
    };
  }
  if (PUBLIC_PRODUCT_STATUS_SET.has(rawStatus)) {
    return {
      lifecycle: "active",
      rawStatus,
      label: stockNum <= 0 ? "Rupture" : "Actif",
      isPubliclyVisible: true,
      isPurchasable: stockNum > 0,
    };
  }
  const labelMap: Record<string, string> = {
    draft: "Brouillon",
    pending: "En attente",
    suspended: "Suspendu",
    rejected: "Rejeté",
    archived: "Archivé",
  };
  return {
    lifecycle: "inactive",
    rawStatus,
    label: labelMap[rawStatus] || "Inactif",
    isPubliclyVisible: false,
    isPurchasable: false,
  };
}

export function isCatalogProductPubliclyActive(
  product: { status?: unknown; stock?: unknown; deletedAt?: unknown } | null | undefined
): boolean {
  return Boolean(product && classifyCatalogProductStatus(product).isPubliclyVisible);
}

export function doesProductMatchCategoryFilter(
  product: Pick<Product, "category" | "subcategory" | "subCategory">,
  rawFilter: string | undefined | null
): boolean {
  const target = (rawFilter || "").trim();
  if (!target) return true;
  const targetLower = target.toLowerCase();
  const targetSlug = slugifyCategoryValue(target);
  const targetCanonical = resolveCanonicalCategoryKey(target).toLowerCase();

  const candidates = [product.category, product.subcategory, product.subCategory]
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

  const maxItems = typeof settings.maxItems === "number" && Number.isFinite(settings.maxItems) && settings.maxItems > 0 ? settings.maxItems : 8;
  const isManual =
    settings.selectionMode === "manual" ||
    (settings.selectionMode !== "auto" && (manualIds.length > 0 || (sectionType === "featured_products" && !settings.filterCategoryId)));

  if (isManual) {
    const picked = manualIds.map((id) => activeById.get(id)).filter((p): p is Product => Boolean(p));
    const items = sectionType === "featured_products" && typeof settings.maxItems !== "number" ? picked : picked.slice(0, maxItems);
    return {
      items,
      effectiveMode: "manual",
      missingProductIds,
      inactiveProductIds,
      hasRealSalesData: items.some((p) => Number(p.salesCount || 0) > 0),
      obsoleteCategoryFilter: false,
    };
  }

  const filterCat = (settings.filterCategoryId || "").trim();
  const pool = filterCat ? activeProducts.filter((p) => doesProductMatchCategoryFilter(p, filterCat)) : [...activeProducts];
  const obsoleteCategoryFilter = Boolean(filterCat && activeProducts.length > 0 && pool.length === 0);

  if (sectionType === "new_arrivals") {
    pool.sort((a, b) => {
      const diff = parseProductTimestampMs(b.createdAt) - parseProductTimestampMs(a.createdAt);
      return diff !== 0 ? diff : a.id.localeCompare(b.id);
    });
  } else if (sectionType === "best_sellers" && pool.some((p) => Number(p.salesCount || 0) > 0)) {
    pool.sort((a, b) => {
      const salesDiff = Number(b.salesCount || 0) - Number(a.salesCount || 0);
      return salesDiff !== 0 ? salesDiff : parseProductTimestampMs(b.createdAt) - parseProductTimestampMs(a.createdAt);
    });
  }

  return {
    items: pool.slice(0, maxItems),
    effectiveMode: "auto",
    missingProductIds,
    inactiveProductIds,
    hasRealSalesData: pool.some((p) => Number(p.salesCount || 0) > 0),
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
