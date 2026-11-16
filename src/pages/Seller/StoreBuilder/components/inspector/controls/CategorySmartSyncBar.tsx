import React, { useMemo, useState } from "react";
import { RefreshCw, AlertTriangle, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";
import { Product } from "../../../../../../domains/product/product.types";
import {
  isCatalogProductPubliclyActive,
  resolveCategoryAssignedProducts,
} from "../../../../../../domains/seller/studioCatalogResolver";
import {
  applyCategorySyncPlan,
  planCategorySyncFromProducts,
  slugifyCategoryName,
  syncCategoriesFromProducts,
} from "../../../../../../domains/seller/studioCategorySync";
import { CategoryItem } from "../../../constants/categoryPresets";

export { slugifyCategoryName, syncCategoriesFromProducts, planCategorySyncFromProducts, applyCategorySyncPlan };

export const QUICK_CATEGORY_BADGES = [
  "Nouveau",
  "Promo",
  "Best-seller",
  "Édition limitée",
  "Aucun",
] as const;

export type QuickCategoryBadge = (typeof QUICK_CATEGORY_BADGES)[number];

export function isProductActiveForStore(product: Product): boolean {
  return isCatalogProductPubliclyActive(product);
}

export function countMatchingProductsForCategory(
  cat: CategoryItem,
  products: Product[]
): number {
  return resolveCategoryAssignedProducts(cat, products).items.length;
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
  const [confirmingSync, setConfirmingSync] = useState(false);
  const [preserveCustom, setPreserveCustom] = useState(true);
  const [removeIds, setRemoveIds] = useState<string[]>([]);

  const activeProducts = useMemo(() => products.filter(isCatalogProductPubliclyActive), [products]);
  const syncPlan = useMemo(
    () => planCategorySyncFromProducts(products, categories),
    [products, categories]
  );

  const detectedCount = syncPlan.toUpdate.length + syncPlan.toAdd.length;
  const emptyCategoriesCount = categories.filter(
    (cat) => countMatchingProductsForCategory(cat, products) === 0
  ).length;

  const toggleRemoveId = (catId: string) => {
    setRemoveIds((prev) => (prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]));
  };

  const executeSync = () => {
    onSyncCategories(
      applyCategorySyncPlan(syncPlan, {
        preserveCustom,
        removeCategoryIds: removeIds,
      })
    );
    setConfirmingSync(false);
    setRemoveIds([]);
  };

  const handleSyncClick = () => {
    if (categories.length > 0) {
      setPreserveCustom(true);
      setRemoveIds([]);
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
            {detectedCount > 0
              ? `${detectedCount} rayon(s) canonique(s) détecté(s) dans vos ${activeProducts.length} produit(s) actif(s).`
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
                <span>{emptyCategoriesCount} sans produit</span>
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
          <div className="text-[11px] text-amber-950 space-y-1">
            <p className="font-bold">Aperçu de la synchronisation :</p>
            <p>• {syncPlan.toUpdate.length} rayon(s) correspondant(s) mis à jour</p>
            <p>• {syncPlan.toAdd.length} nouveau(x) rayon(s) ajouté(s)</p>
            {syncPlan.unmatchedExisting.length > 0 && (
              <div className="pt-1 space-y-1">
                <label className="flex items-center gap-1.5 font-semibold text-emerald-900 cursor-pointer">
                  <input
                    type="checkbox"
                    data-testid="category-sync-preserve-custom-checkbox"
                    checked={preserveCustom}
                    onChange={(e) => setPreserveCustom(e.target.checked)}
                    className="accent-emerald-700"
                  />
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Conserver les rayons personnalisés ({syncPlan.unmatchedExisting.length})</span>
                </label>
                {preserveCustom && (
                  <div className="pl-4 space-y-1 max-h-24 overflow-y-auto">
                    {syncPlan.unmatchedExisting.map(({ category, activeCount }) => {
                      const markedRemove = removeIds.includes(category.id);
                      return (
                        <label key={category.id} className="flex items-center justify-between gap-2 text-[10.5px] text-slate-700 cursor-pointer">
                          <span className="truncate">
                            {category.name} ({activeCount} actif{activeCount > 1 ? "s" : ""})
                          </span>
                          <span className="flex items-center gap-1 shrink-0 text-rose-700 font-medium">
                            <input
                              type="checkbox"
                              data-testid={`sync-remove-cat-${category.id}`}
                              checked={markedRemove}
                              onChange={() => toggleRemoveId(category.id)}
                              className="accent-rose-600"
                            />
                            <span>Supprimer</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="category-sync-confirm-btn"
              onClick={executeSync}
              className="flex-1 h-7 rounded bg-slate-900 text-white text-[11px] font-bold cursor-pointer"
            >
              Appliquer la synchronisation
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
          disabled={detectedCount === 0}
          className="w-full h-9 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Synchroniser depuis mes produits ({detectedCount})</span>
        </button>
      )}
    </div>
  );
};
