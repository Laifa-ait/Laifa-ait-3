import React from "react";
import { RefreshCw, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { Product } from "../../../../../../domains/product/product.types";
import {
  doesProductMatchCategoryFilter,
  isCatalogProductPubliclyActive,
  resolveCategoryAssignedProducts,
  slugifyCategoryValue,
} from "../../../../../../domains/seller/studioCatalogResolver";
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
  return slugifyCategoryValue(raw) || `rayon-${fallbackIndex}`;
}

export function isProductActiveForStore(product: Product): boolean {
  return isCatalogProductPubliclyActive(product);
}

export function countMatchingProductsForCategory(
  cat: CategoryItem,
  products: Product[]
): number {
  return resolveCategoryAssignedProducts(cat, products).items.length;
}

export function syncCategoriesFromProducts(
  products: Product[],
  existingCategories: CategoryItem[] = []
): CategoryItem[] {
  const activeProducts = products.filter(isCatalogProductPubliclyActive);
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
      if (!existingGroup.firstImage && firstImg) existingGroup.firstImage = firstImg;
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

  for (const [, group] of grouped.entries()) {
    index += 1;
    const slug = slugifyCategoryName(group.displayName, index);
    const matchedExisting = existingCategories.find(
      (c) =>
        c.slug === slug ||
        doesProductMatchCategoryFilter(group.items[0], c.categoryFilter || c.name || "")
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
  const [confirmingSync, setConfirmingSync] = React.useState(false);
  const activeProducts = products.filter(isCatalogProductPubliclyActive);
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

  const executeSync = () => {
    onSyncCategories(syncCategoriesFromProducts(products, categories));
    setConfirmingSync(false);
  };

  const handleSyncClick = () => {
    if (categories.length > 0) {
      setConfirmingSync(true);
      return;
    }
    executeSync();
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
              : "Ajoutez des produits actifs avec une catégorie pour synchroniser automatiquement."}
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
                <span>{emptyCategoriesCount} vide{emptyCategoriesCount > 1 ? "s" : ""}</span>
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

      {confirmingSync ? (
        <div data-testid="category-sync-confirm-bar" className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
          <p className="text-[11px] font-medium text-amber-900">
            Synchroniser avec vos produits ? Vos rayons existants ({categories.length}) seront mis à jour avec les catégories actives du catalogue.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="category-sync-confirm-btn"
              onClick={executeSync}
              className="flex-1 h-7 rounded bg-slate-900 text-white text-[11px] font-bold cursor-pointer"
            >
              Confirmer la synchronisation
            </button>
            <button
              type="button"
              data-testid="category-sync-cancel-btn"
              onClick={() => setConfirmingSync(false)}
              className="h-7 px-2.5 rounded border border-slate-300 bg-white text-slate-700 text-[11px] font-semibold cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          data-testid="category-sync-trigger-btn"
          onClick={handleSyncClick}
          disabled={distinctProductCategories.length === 0}
          className="w-full h-9 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Synchroniser depuis mes produits ({distinctProductCategories.length})</span>
        </button>
      )}
    </div>
  );
};
