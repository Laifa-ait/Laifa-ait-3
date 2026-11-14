import React from "react";
import { RefreshCw, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { Product } from "../../../../../../domains/product/product.types";
import { CategoryItem } from "../../../constants/categoryPresets";

export const QUICK_CATEGORY_BADGES = [
  "Nouveau",
  "Promo",
  "Best-seller",
  "Édition limitée",
  "Aucun",
] as const;

export type QuickCategoryBadge = (typeof QUICK_CATEGORY_BADGES)[number];

export function slugifyCategoryName(raw: string, fallbackIndex = 1): string {
  const cleaned = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || `rayon-${fallbackIndex}`;
}

export function isProductActiveForStore(product: Product): boolean {
  const status = String(product.status || "active").toLowerCase();
  return status !== "archived" && status !== "draft" && status !== "rejected";
}

export function countMatchingProductsForCategory(
  cat: CategoryItem,
  products: Product[]
): number {
  const activeProducts = products.filter(isProductActiveForStore);
  if (Array.isArray(cat.productIds) && cat.productIds.length > 0) {
    const selectedSet = new Set(cat.productIds);
    return activeProducts.filter((p) => selectedSet.has(p.id)).length;
  }

  const targetName = (cat.categoryFilter || cat.name || "").trim().toLowerCase();
  if (!targetName) return 0;

  return activeProducts.filter(
    (p) => (p.category || "").trim().toLowerCase() === targetName
  ).length;
}

export function syncCategoriesFromProducts(
  products: Product[],
  existingCategories: CategoryItem[] = []
): CategoryItem[] {
  const activeProducts = products.filter(isProductActiveForStore);
  const grouped = new Map<
    string,
    { displayName: string; items: Product[]; firstImage: string }
  >();

  for (const prod of activeProducts) {
    const rawCat = (prod.category || "").trim();
    if (!rawCat) continue;
    const key = rawCat.toLowerCase();
    const firstImg = prod.images?.[0] || prod.image || "";
    const existingGroup = grouped.get(key);
    if (existingGroup) {
      existingGroup.items.push(prod);
      if (!existingGroup.firstImage && firstImg) {
        existingGroup.firstImage = firstImg;
      }
    } else {
      grouped.set(key, {
        displayName: rawCat,
        items: [prod],
        firstImage: firstImg,
      });
    }
  }

  const synced: CategoryItem[] = [];
  let index = 0;

  for (const [key, group] of grouped.entries()) {
    index += 1;
    const slug = slugifyCategoryName(group.displayName, index);
    const matchedExisting = existingCategories.find(
      (c) =>
        (c.categoryFilter || c.name || "").trim().toLowerCase() === key ||
        c.slug === slug
    );

    const count = group.items.length;
    const productIds = group.items.map((p) => p.id);

    if (matchedExisting) {
      synced.push({
        ...matchedExisting,
        name: matchedExisting.name || group.displayName,
        slug: matchedExisting.slug || slug,
        categoryFilter: group.displayName,
        imageUrl: matchedExisting.imageUrl || group.firstImage,
        itemCount: count,
        productIds,
      });
    } else {
      synced.push({
        id: `cat_sync_${slug}_${index}`,
        name: group.displayName,
        subtitle: `${count} produit${count > 1 ? "s" : ""} disponible${count > 1 ? "s" : ""}`,
        slug,
        link: `#rayon:${slug}`,
        imageUrl: group.firstImage,
        iconName: "ShoppingBag",
        badge: count >= 5 ? "Best-seller" : "",
        badgeColor: "#F97316",
        itemCount: count,
        productIds,
        categoryFilter: group.displayName,
        colSpan: 1,
      });
    }
  }

  return synced;
}

interface CategorySmartSyncBarProps {
  categories: CategoryItem[];
  products: Product[];
  onSyncCategories: (synced: CategoryItem[]) => void;
}

export const CategorySmartSyncBar: React.FC<CategorySmartSyncBarProps> = ({
  categories,
  products,
  onSyncCategories,
}) => {
  const activeProducts = products.filter(isProductActiveForStore);
  const distinctProductCategories = Array.from(
    new Set(
      activeProducts
        .map((p) => (p.category || "").trim())
        .filter((c) => c.length > 0)
    )
  );

  const emptyCategoriesCount = categories.filter(
    (cat) => countMatchingProductsForCategory(cat, products) === 0
  ).length;

  const handleSyncClick = () => {
    const nextCategories = syncCategoriesFromProducts(products, categories);
    onSyncCategories(nextCategories);
  };

  return (
    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5 select-none">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[11px] font-semibold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-slate-700 shrink-0" />
            <span>Auto-Sync &amp; Diagnostic Rayons</span>
          </span>
          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
            {distinctProductCategories.length > 0
              ? `${distinctProductCategories.length} rayon(s) détecté(s) dans vos ${activeProducts.length} produit(s) actif(s).`
              : "Ajoutez des produits avec une catégorie pour synchroniser automatiquement."}
          </p>
        </div>

        {categories.length > 0 && (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium shrink-0 ${
              emptyCategoriesCount > 0 ? "text-amber-700" : "text-emerald-700"
            }`}
          >
            {emptyCategoriesCount > 0 ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {emptyCategoriesCount} vide{emptyCategoriesCount > 1 ? "s" : ""}
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Actifs</span>
              </>
            )}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={handleSyncClick}
        disabled={distinctProductCategories.length === 0}
        className="w-full h-9 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Synchroniser depuis mes produits ({distinctProductCategories.length})</span>
      </button>
    </div>
  );
};
