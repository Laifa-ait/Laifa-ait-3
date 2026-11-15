import React, { useMemo, useState } from "react";
import { AlertTriangle, Check, Eye, Filter, Search, ShoppingBag, Sparkles } from "lucide-react";
import { Product } from "../../../../../../domains/product/product.types";
import {
  classifyCatalogProductStatus,
  doesProductMatchCategoryFilter,
  isCatalogProductPubliclyActive,
  resolveCategoryAssignedProducts,
} from "../../../../../../domains/seller/studioCatalogResolver";
import { CategoryItem } from "../../../constants/categoryPresets";

interface CategoryProductAssignerProps {
  cat: CategoryItem;
  products: Product[];
  onUpdate: (patch: Partial<CategoryItem>) => void;
}

export const CategoryProductAssigner: React.FC<CategoryProductAssignerProps> = ({ cat, products, onUpdate }) => {
  const [search, setSearch] = useState("");
  const [visibleLimit, setVisibleLimit] = useState(40);
  const resolved = useMemo(() => resolveCategoryAssignedProducts(cat, products), [cat, products]);
  const [mode, setMode] = useState<"manual" | "auto">(resolved.mode);
  const catSyncKey = `${cat.id}:${cat.selectionMode || ""}`;
  const [prevCatSyncKey, setPrevCatSyncKey] = useState(catSyncKey);
  if (catSyncKey !== prevCatSyncKey) {
    setPrevCatSyncKey(catSyncKey);
    setMode(resolved.mode);
  }

  const selectedIds = useMemo(() => new Set<string>(Array.isArray(cat.productIds) ? cat.productIds : []), [cat.productIds]);
  const activeIdsSet = useMemo(() => new Set(products.filter(isCatalogProductPubliclyActive).map((p) => p.id)), [products]);
  const staleCount = resolved.missingIds.length + resolved.inactiveIds.length;

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => { if (isCatalogProductPubliclyActive(p) && p.category?.trim()) set.add(p.category.trim()); });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? products.filter((p) => p.name.toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q)) : products;
  }, [products, search]);

  const handleModeSwitch = (nextMode: "manual" | "auto") => {
    setMode(nextMode);
    if (nextMode === "auto") {
      const targetFilter = cat.categoryFilter || cat.name;
      const count = products.filter((p) => isCatalogProductPubliclyActive(p) && doesProductMatchCategoryFilter(p, targetFilter)).length;
      onUpdate({ selectionMode: "auto", categoryFilter: targetFilter, itemCount: count });
    } else {
      const validIds = Array.from(selectedIds).filter((id) => activeIdsSet.has(id));
      onUpdate({ selectionMode: "manual", itemCount: validIds.length });
    }
  };

  const toggleProduct = (productId: string) => {
    const next = new Set(selectedIds);
    if (next.has(productId)) next.delete(productId);
    else next.add(productId);
    const nextArray = Array.from(next);
    onUpdate({ selectionMode: "manual", productIds: nextArray, itemCount: nextArray.filter((id) => activeIdsSet.has(id)).length });
  };

  const handleSelectAll = () => {
    const ids = filteredProducts.filter(isCatalogProductPubliclyActive).map((p) => p.id);
    onUpdate({ selectionMode: "manual", productIds: ids, itemCount: ids.length });
  };

  const handlePurgeStale = () => {
    const valid = Array.from(selectedIds).filter((id) => activeIdsSet.has(id));
    onUpdate({ productIds: valid, itemCount: valid.length });
  };

  const handleAutoFilterChange = (categoryName: string) => {
    const matchingCount = categoryName
      ? products.filter((p) => isCatalogProductPubliclyActive(p) && doesProductMatchCategoryFilter(p, categoryName)).length
      : 0;
    onUpdate({ selectionMode: "auto", categoryFilter: categoryName || undefined, itemCount: matchingCount });
  };

  return (
    <div className="pt-3 border-t border-slate-200 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-900 flex items-center gap-1.5 tabular-nums">
          <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
          <span>Produits actifs ({resolved.items.length})</span>
        </span>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("studio:navigate-page", { detail: { viewMode: "category", categorySlug: cat.slug, categoryItem: cat } }))}
          className="px-2 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[10.5px] font-medium flex items-center gap-1 cursor-pointer"
        >
          <Eye className="w-3 h-3" /><span>Voir la page</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 rounded-lg text-[11px] font-medium">
        <button type="button" data-testid="category-mode-manual-btn" onClick={() => handleModeSwitch("manual")}
          className={`py-1.5 px-2 rounded-md flex items-center justify-center gap-1 cursor-pointer ${mode === "manual" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600"}`}>
          <Sparkles className="w-3 h-3" /><span>Manuel ({selectedIds.size})</span>
        </button>
        <button type="button" data-testid="category-mode-auto-btn" onClick={() => handleModeSwitch("auto")}
          className={`py-1.5 px-2 rounded-md flex items-center justify-center gap-1 cursor-pointer ${mode === "auto" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600"}`}>
          <Filter className="w-3 h-3" /><span>Règle auto</span>
        </button>
      </div>

      {mode === "auto" ? (
        <div className="space-y-2 bg-slate-50/70 p-2.5 rounded-lg border border-slate-200">
          <label className="text-[11px] font-medium text-slate-700 block">Associer aux produits actifs :</label>
          <select value={cat.categoryFilter || ""} onChange={(e) => handleAutoFilterChange(e.target.value)} className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800">
            <option value="">— Choisir une catégorie —</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>{c} ({products.filter((p) => isCatalogProductPubliclyActive(p) && doesProductMatchCategoryFilter(p, c)).length})</option>
            ))}
          </select>
          {cat.categoryFilter && resolved.items.length === 0 && (
            <p className="text-[10.5px] text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 shrink-0" /><span>Aucun produit actif pour « {cat.categoryFilter} ».</span>
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {staleCount > 0 && (
            <div data-testid="category-stale-ids-warning" className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[10.5px] text-amber-900 flex items-center justify-between gap-2">
              <span>{staleCount} ID supprimé(s)/inactif(s)</span>
              <button type="button" data-testid="category-purge-stale-btn" onClick={handlePurgeStale} className="px-2 py-0.5 rounded bg-amber-900 text-white text-[10px] font-bold cursor-pointer">Nettoyer</button>
            </div>
          )}
          {products.length === 0 ? (
            <p className="text-[11px] text-slate-400 text-center py-3 border border-slate-200 rounded-lg">Aucun produit dans votre catalogue.</p>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setVisibleLimit(40); }} placeholder="Chercher..." className="w-full h-7.5 pl-7 pr-2 bg-slate-50/70 border border-slate-200 rounded-md text-[11px]" />
                </div>
                <button type="button" onClick={handleSelectAll} className="px-2 h-7.5 rounded-md border border-slate-200 bg-white text-[10.5px] font-medium cursor-pointer shrink-0">Actifs</button>
                {selectedIds.size > 0 && (
                  <button type="button" onClick={() => onUpdate({ selectionMode: "manual", productIds: [], itemCount: 0 })} className="px-2 h-7.5 rounded-md border border-rose-200 bg-rose-50 text-[10.5px] font-medium text-rose-700 cursor-pointer shrink-0">Vider</button>
                )}
              </div>
              <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg bg-white">
                {filteredProducts.slice(0, visibleLimit).map((prod) => {
                  const isChecked = selectedIds.has(prod.id);
                  const meta = classifyCatalogProductStatus(prod);
                  return (
                    <div key={prod.id} onClick={() => toggleProduct(prod.id)} className={`px-2.5 py-2 flex items-center gap-2 cursor-pointer ${isChecked ? "bg-slate-50" : "bg-white hover:bg-slate-50/60"}`}>
                      <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${isChecked ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-300"}`}>
                        {isChecked && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-slate-900 truncate">{prod.name}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-slate-500 tabular-nums">{Number(prod.price || 0).toLocaleString("fr-DZ")} DA</span>
                          {!meta.isPubliclyVisible && <span className="text-[9.5px] font-semibold px-1 rounded bg-amber-100 text-amber-800">{meta.label}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredProducts.length > visibleLimit && (
                  <button type="button" onClick={() => setVisibleLimit((prev) => prev + 40)} className="w-full py-1.5 text-[10.5px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                    + Voir {Math.min(40, filteredProducts.length - visibleLimit)} autres
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
