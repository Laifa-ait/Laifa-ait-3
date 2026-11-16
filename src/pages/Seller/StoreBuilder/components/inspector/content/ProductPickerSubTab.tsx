import React, { useState, useMemo } from "react";
import { Search, ArrowUp, ArrowDown, CheckSquare, Square, X, AlertTriangle } from "lucide-react";
import { Product } from "../../../../../../domains/product/product.types";
import { classifyCatalogProductStatus, resolveProductFeedItems } from "../../../../../../domains/seller/studioCatalogResolver";

interface ProductPickerSubTabProps {
  sectionType?: string;
  settings: Record<string, unknown>;
  products: Product[];
  onSettingsChange: (field: string, value: unknown) => void;
  inputClass: string;
  labelClass: string;
}

type ProductStatusFilter = "all" | "active" | "inactive" | "in_stock" | "on_sale";

function isProductOnSale(product: Product): boolean {
  return Boolean(
    product.onSale || product.flashSaleActive ||
    (product.promoPrice && product.promoPrice < product.price) ||
    (product.originalPrice && product.originalPrice > product.price)
  );
}

const STATUS_FILTERS: { id: ProductStatusFilter; label: string }[] = [
  { id: "all", label: "Tous" }, { id: "active", label: "Actifs" },
  { id: "inactive", label: "Inactifs" }, { id: "in_stock", label: "En stock" }, { id: "on_sale", label: "Promo" },
];

export const ProductPickerSubTab: React.FC<ProductPickerSubTabProps> = ({
  sectionType, settings, products, onSettingsChange, inputClass, labelClass,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>("all");
  const [visibleLimit, setVisibleLimit] = useState(50);

  const productIds = useMemo(() => (Array.isArray(settings.productIds) ? (settings.productIds as string[]) : []), [settings.productIds]);
  const filterCategoryId = typeof settings.filterCategoryId === "string" ? settings.filterCategoryId : "";
  const feedType = (sectionType === "new_arrivals" || sectionType === "best_sellers" || sectionType === "product_grid"
    ? sectionType : "featured_products") as "featured_products" | "new_arrivals" | "best_sellers" | "product_grid";

  const resolution = useMemo(() => resolveProductFeedItems(feedType, {
    selectionMode: settings.selectionMode === "manual" || settings.selectionMode === "auto" ? settings.selectionMode : undefined,
    productIds, filterCategoryId, maxItems: typeof settings.maxItems === "number" ? settings.maxItems : 8,
  }, products), [feedType, settings.selectionMode, productIds, filterCategoryId, settings.maxItems, products]);

  const distinctCategories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) if (classifyCatalogProductStatus(p).isPubliclyVisible && p.category?.trim()) set.add(p.category.trim());
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((prod) => {
      if (q) {
        const hay = `${prod.name || ""} ${prod.category || ""} ${prod.subcategory || prod.subCategory || ""} ${prod.subSubCategory || prod.subsubcategory || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const meta = classifyCatalogProductStatus(prod);
      if (statusFilter === "active") return meta.isPubliclyVisible;
      if (statusFilter === "inactive") return !meta.isPubliclyVisible;
      if (statusFilter === "in_stock") return meta.isPubliclyVisible && meta.isPurchasable;
      if (statusFilter === "on_sale") return isProductOnSale(prod);
      return true;
    });
  }, [products, searchQuery, statusFilter]);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const selectedProductsOrdered = useMemo(() => productIds.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p)), [byId, productIds]);
  const staleIds = useMemo(() => [...resolution.missingProductIds, ...resolution.inactiveProductIds], [resolution.missingProductIds, resolution.inactiveProductIds]);
  const allFilteredSelected = filteredProducts.length > 0 && filteredProducts.every((p) => productIds.includes(p.id));

  const handleToggleSelectAllFiltered = () => {
    onSettingsChange("selectionMode", "manual");
    if (allFilteredSelected) {
      const filteredSet = new Set(filteredProducts.map((p) => p.id));
      onSettingsChange("productIds", productIds.filter((id) => !filteredSet.has(id)));
    } else {
      const next = [...productIds];
      for (const p of filteredProducts) if (!next.includes(p.id)) next.push(p.id);
      onSettingsChange("productIds", next);
    }
  };

  const handleMoveSelected = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= productIds.length) return;
    const next = [...productIds];
    [next[index], next[target]] = [next[target], next[index]];
    onSettingsChange("productIds", next);
  };

  return (
    <div className="space-y-3 select-none">
      <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 rounded-lg text-[11px] font-medium">
        <button type="button" data-testid="picker-mode-auto-btn" onClick={() => onSettingsChange("selectionMode", "auto")}
          className={`py-1.5 px-2 rounded-md cursor-pointer ${resolution.effectiveMode === "auto" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600"}`}>
          Règle dynamique
        </button>
        <button type="button" data-testid="picker-mode-manual-btn" onClick={() => onSettingsChange("selectionMode", "manual")}
          className={`py-1.5 px-2 rounded-md cursor-pointer ${resolution.effectiveMode === "manual" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600"}`}>
          Manuel ({productIds.length})
        </button>
      </div>

      {staleIds.length > 0 && (
        <div data-testid="product-picker-missing-ids-warning" className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between gap-2">
          <span>
            {resolution.missingProductIds.length > 0 && `${resolution.missingProductIds.length} supprimé(s)`}
            {resolution.missingProductIds.length > 0 && resolution.inactiveProductIds.length > 0 && " • "}
            {resolution.inactiveProductIds.length > 0 && `${resolution.inactiveProductIds.length} inactif(s)`}
          </span>
          <button type="button" data-testid="product-picker-purge-missing-btn" onClick={() => {
            const staleSet = new Set(staleIds);
            onSettingsChange("productIds", productIds.filter((id) => !staleSet.has(id)));
          }} className="px-2 py-1 rounded bg-amber-900 text-white text-[10.5px] font-bold shrink-0 cursor-pointer">Nettoyer</button>
        </div>
      )}

      {feedType === "new_arrivals" && resolution.undatedProductIds.length > 0 && (
        <div data-testid="picker-undated-warning" className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[10.5px] text-amber-900">
          {resolution.undatedProductIds.length} produit(s) sans date de création fiable exclu(s) des nouveautés automatiques.
        </div>
      )}

      {resolution.effectiveMode === "auto" && (
        <div className="space-y-2.5 pb-3 border-b border-slate-200">
          <label className={labelClass}>
            <span>Nombre maximum d&apos;articles affichés</span>
            <input type="number" min={2} max={24} value={typeof settings.maxItems === "number" ? settings.maxItems : 8} onChange={(e) => onSettingsChange("maxItems", Number(e.target.value) || 8)} className={inputClass} />
          </label>
          <label className={labelClass}>
            <span>Filtrer par catégorie (Optionnel)</span>
            <select value={filterCategoryId} onChange={(e) => onSettingsChange("filterCategoryId", e.target.value || undefined)} className={inputClass}>
              <option value="">Toutes les catégories</option>
              {distinctCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              {filterCategoryId && !distinctCategories.includes(filterCategoryId) && <option value={filterCategoryId}>{filterCategoryId} (Obsolète)</option>}
            </select>
          </label>
          {resolution.obsoleteCategoryFilter && (
            <div data-testid="picker-obsolete-category-warning" className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[10.5px] text-amber-900 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 shrink-0" />Filtre obsolète</span>
              <button type="button" onClick={() => onSettingsChange("filterCategoryId", undefined)} className="px-2 py-0.5 rounded bg-amber-900 text-white font-bold cursor-pointer">Réinitialiser</button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setVisibleLimit(50); }} placeholder="Rechercher par titre ou catégorie..." className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-8 pr-7 text-xs" />
          {searchQuery && <button type="button" onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-3.5 h-3.5" /></button>}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-1">
          <div className="flex flex-wrap items-center gap-1">
            {STATUS_FILTERS.map((f) => (
              <button key={f.id} type="button" onClick={() => { setStatusFilter(f.id); setVisibleLimit(50); }}
                className={`px-2 py-1 rounded-md text-[10px] font-medium cursor-pointer ${statusFilter === f.id ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600"}`}>{f.label}</button>
            ))}
          </div>
          <button type="button" onClick={handleToggleSelectAllFiltered} disabled={filteredProducts.length === 0}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-medium text-slate-700 disabled:opacity-40 cursor-pointer">
            {allFilteredSelected ? <><Square className="w-3 h-3" /><span>Aucun</span></> : <><CheckSquare className="w-3 h-3" /><span>Tout</span></>}
          </button>
        </div>
      </div>

      <div className="max-h-48 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 bg-white">
        {filteredProducts.length === 0 ? (
          <p className="p-4 text-center text-xs text-slate-400">Aucun produit ne correspond aux filtres.</p>
        ) : (
          <>
            {filteredProducts.slice(0, visibleLimit).map((product) => {
              const isChecked = productIds.includes(product.id);
              const meta = classifyCatalogProductStatus(product);
              return (
                <label key={product.id} className={`flex cursor-pointer items-center justify-between gap-2 px-2.5 py-2 text-xs ${isChecked ? "bg-slate-50 font-medium" : "hover:bg-slate-50/70"}`}>
                  <span className="flex items-center gap-2 min-w-0">
                    <input type="checkbox" checked={isChecked} onChange={(e) => {
                      onSettingsChange("selectionMode", "manual");
                      onSettingsChange("productIds", e.target.checked ? [...productIds, product.id] : productIds.filter((id) => id !== product.id));
                    }} className="accent-slate-900 shrink-0" />
                    <span className="truncate">{product.name}</span>
                  </span>
                  <span className="flex items-center gap-1.5 shrink-0 tabular-nums">
                    {!meta.isPubliclyVisible && <span className="text-[9.5px] font-semibold px-1 rounded bg-amber-100 text-amber-800">{meta.label}</span>}
                    {isProductOnSale(product) && <span className="text-[10px] font-medium text-rose-700">Promo</span>}
                    <span className="text-[10.5px] font-medium text-slate-500">{Number(product.price || 0).toLocaleString("fr-DZ")} DA</span>
                  </span>
                </label>
              );
            })}
            {filteredProducts.length > visibleLimit && (
              <button type="button" onClick={() => setVisibleLimit((prev) => prev + 50)} className="w-full py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                Afficher +{Math.min(50, filteredProducts.length - visibleLimit)} produits
              </button>
            )}
          </>
        )}
      </div>

      {selectedProductsOrdered.length > 1 && resolution.effectiveMode === "manual" && (
        <div className="space-y-1.5 pt-2 border-t border-slate-200">
          <span className="text-[11px] font-semibold text-slate-900 block tabular-nums">Ordre manuel ({selectedProductsOrdered.length})</span>
          <div className="max-h-32 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg bg-white">
            {selectedProductsOrdered.map((prod, idx) => (
              <div key={prod.id} className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-[11px]">
                <span className="truncate font-medium text-slate-800">{idx + 1}. {prod.name}</span>
                <span className="flex items-center gap-0.5 shrink-0">
                  <button type="button" disabled={idx === 0} onClick={() => handleMoveSelected(idx, "up")} className="p-1 rounded hover:bg-slate-100 disabled:opacity-25 cursor-pointer"><ArrowUp className="w-3 h-3" /></button>
                  <button type="button" disabled={idx === selectedProductsOrdered.length - 1} onClick={() => handleMoveSelected(idx, "down")} className="p-1 rounded hover:bg-slate-100 disabled:opacity-25 cursor-pointer"><ArrowDown className="w-3 h-3" /></button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
