import { Product } from "../product/product.types";
import { CategoryItem } from "./customPage.types";
import { resolveCanonicalCategoryKey } from "../../utils/categoryCanonical";
import {
  doesProductMatchCategoryFilter,
  isCatalogProductPubliclyActive,
  resolveCategoryAssignedProducts,
  slugifyCategoryValue,
} from "./studioCatalogResolver";

export interface CategorySyncUpdatePreview {
  existing: CategoryItem;
  next: CategoryItem;
}

export interface UnmatchedCategoryPreview {
  category: CategoryItem;
  activeCount: number;
}

export interface CategorySyncPlan {
  toUpdate: CategorySyncUpdatePreview[];
  toAdd: CategoryItem[];
  unmatchedExisting: UnmatchedCategoryPreview[];
}

export interface ApplyCategorySyncOptions {
  preserveCustom?: boolean;
  removeCategoryIds?: string[];
}

export function slugifyCategoryName(raw: string, fallbackIndex = 1): string {
  return slugifyCategoryValue(raw) || `rayon-${fallbackIndex}`;
}

export function planCategorySyncFromProducts(
  products: Product[],
  existingCategories: CategoryItem[] = []
): CategorySyncPlan {
  const activeProducts = products.filter(isCatalogProductPubliclyActive);
  const grouped = new Map<string, { displayName: string; items: Product[]; firstImage: string }>();

  for (const prod of activeProducts) {
    const rawCat = (prod.category || "").trim();
    if (!rawCat) continue;
    const canonicalName = resolveCanonicalCategoryKey(rawCat) || rawCat;
    const key = canonicalName.toLowerCase();
    const firstImg = prod.images?.[0] || prod.image || "";
    const existingGroup = grouped.get(key);
    if (existingGroup) {
      existingGroup.items.push(prod);
      if (!existingGroup.firstImage && firstImg) existingGroup.firstImage = firstImg;
    } else {
      grouped.set(key, {
        displayName: canonicalName,
        items: [prod],
        firstImage: firstImg,
      });
    }
  }

  const matchedExistingIds = new Set<string>();
  const toUpdate: CategorySyncUpdatePreview[] = [];
  const toAdd: CategoryItem[] = [];
  let index = 0;

  for (const [, group] of grouped.entries()) {
    index += 1;
    const slug = slugifyCategoryName(group.displayName, index);
    const matchedExisting = existingCategories.find(
      (c) =>
        !matchedExistingIds.has(c.id) &&
        (c.slug === slug || doesProductMatchCategoryFilter(group.items[0], c.categoryFilter || c.name || ""))
    );

    const count = group.items.length;
    const productIds = group.items.map((p) => p.id);

    if (matchedExisting) {
      matchedExistingIds.add(matchedExisting.id);
      toUpdate.push({
        existing: matchedExisting,
        next: {
          ...matchedExisting,
          name: matchedExisting.name || group.displayName,
          slug: matchedExisting.slug || slug,
          categoryFilter: group.displayName,
          imageUrl: matchedExisting.imageUrl || group.firstImage,
          itemCount: count,
          productIds,
        },
      });
    } else {
      toAdd.push({
        id: `cat_sync_${slug}_${index}`,
        name: group.displayName,
        subtitle: `${count} produit${count > 1 ? "s" : ""} actif${count > 1 ? "s" : ""}`,
        slug,
        link: `#rayon:${slug}`,
        imageUrl: group.firstImage,
        iconName: "ShoppingBag",
        badge: "",
        badgeColor: "#0F172A",
        itemCount: count,
        productIds,
        categoryFilter: group.displayName,
        selectionMode: "auto",
        colSpan: 1,
      });
    }
  }

  const unmatchedExisting: UnmatchedCategoryPreview[] = existingCategories
    .filter((c) => !matchedExistingIds.has(c.id))
    .map((category) => ({
      category,
      activeCount: resolveCategoryAssignedProducts(category, products).items.length,
    }));

  return { toUpdate, toAdd, unmatchedExisting };
}

export function applyCategorySyncPlan(
  plan: CategorySyncPlan,
  options: ApplyCategorySyncOptions = {}
): CategoryItem[] {
  const preserveCustom = options.preserveCustom !== false;
  const removeSet = new Set(options.removeCategoryIds || []);

  const updated = plan.toUpdate.map((entry) => entry.next);
  const preservedCustom = preserveCustom
    ? plan.unmatchedExisting.filter((u) => !removeSet.has(u.category.id)).map((u) => u.category)
    : [];

  return [...updated, ...preservedCustom, ...plan.toAdd];
}

export function syncCategoriesFromProducts(
  products: Product[],
  existingCategories: CategoryItem[] = [],
  options: ApplyCategorySyncOptions = { preserveCustom: true }
): CategoryItem[] {
  const plan = planCategorySyncFromProducts(products, existingCategories);
  return applyCategorySyncPlan(plan, options);
}
