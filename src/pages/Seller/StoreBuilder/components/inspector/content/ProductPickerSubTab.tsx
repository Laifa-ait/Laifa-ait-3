import React, { useState, useMemo } from "react";
import { Search, ArrowUp, ArrowDown, CheckSquare, Square, X } from "lucide-react";
import { Product } from "../../../../../../domains/product/product.types";

interface ProductPickerSubTabProps {
  sectionType?: string;
  settings: Record<string, unknown>;
  products: Product[];
  onSettingsChange: (field: string, value: unknown) => void;
  inputClass: string;
  labelClass: string;
}

type ProductStatusFilter = "all" | "in_stock" | "on_sale";

function isProductOnSale(product: Product): boolean {
  return Boolean(
    product.onSale ||
      product.flashSaleActive ||
      (product.promoPrice && product.promoPrice < product.price) ||
      (product.originalPrice && product.originalPrice > product.price)
  );
}

const STATUS_FILTERS: { id: ProductStatusFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "in_stock", label: "En stock" },
  { id: "on_sale", label: "En promo" },
];

export const ProductPickerSubTab: React.FC<ProductPickerSubTabProps> = ({
  sectionType, settings, products, onSettingsChange, inputClass, labelClass,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>("all");

  const productIds = useMemo(
    () => (Array.isArray(settings.productIds) ? (settings.productIds as string[]) : []),
    [settings.productIds]
  );

  const distinctCategories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) if (p.category?.trim()) set.add(p.category.trim());
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((prod) => {
      if (q && !(prod.name || "").toLowerCase().includes(q) && !(prod.category || "").toLowerCase().includes(q)) return false;
      if (statusFilter === "in_stock") return Number(prod.stock ?? 1) > 0;
      if (statusFilter === "on_sale") return isProductOnSale(prod);
      return true;
    });
  }, [products, searchQuery, statusFilter]);

  const selectedProductsOrdered = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    return productIds.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));
  }, [products, productIds]);

  const allFilteredSelected =
    filteredProducts.length > 0 && filteredProducts.every((p) => productIds.includes(p.id));

  const handleToggleSelectAllFiltered = () => {
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

  const isManualSelectionMode = sectionType === "featured_products" || "productIds" in settings;

  return (
    <div className="space-y-3 select-none">
      {!isManualSelectionMode && (
        <div className="space-y-2.5 pb-3 border-b border-slate-200">
          <label className={labelClass}>
            <span>Nombre maximum d&apos;articles affichés</span>
            <input
              type="number" min={2} max={24}
              value={typeof settings.maxItems === "number" ? settings.maxItems : 8}
              onChange={(e) => onSettingsChange("maxItems", Number(e.target.value) || 8)}
              className={inputClass}
            />
          </label>
          {distinctCategories.length > 0 && (
            <label className={labelClass}>
              <span>Filtrer par catégorie (Optionnel)</span>
              <select
                value={typeof settings.filterCategoryId === "string" ? settings.filterCategoryId : ""}
                onChange={(e) => onSettingsChange("filterCategoryId", e.target.value || undefined)}
                className={inputClass}
              >
                <option value="">Toutes les catégories</option>
                {distinctCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </label>
          )}
        </div>
      )}

      <div className="space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre ou catégorie..."
            className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-8 pr-7 text-xs text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id} type="button" onClick={() => setStatusFilter(f.id)}
                className={`px-2 py-1 rounded-md text-[10.5px] font-medium transition-colors cursor-pointer ${
                  statusFilter === f.id ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            type="button" onClick={handleToggleSelectAllFiltered} disabled={filteredProducts.length === 0}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 hover:border-slate-400 text-[10.5px] font-medium text-slate-700 disabled:opacity-40 cursor-pointer"
          >
            {allFilteredSelected ? (
              <><Square className="w-3 h-3 text-slate-700" /><span>Désélectionner</span></>
            ) : (
              <><CheckSquare className="w-3 h-3 text-slate-700" /><span>Tout cocher</span></>
            )}
          </button>
        </div>
      </div>

      <div className="max-h-48 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 bg-white">
        {filteredProducts.length === 0 ? (
          <p className="p-4 text-center text-xs text-slate-400">Aucun produit ne correspond aux filtres.</p>
        ) : (
          filteredProducts.map((product) => {
            const isChecked = productIds.includes(product.id);
            const onSale = isProductOnSale(product);
            return (
              <label
                key={product.id}
                className={`flex cursor-pointer items-center justify-between gap-2 px-2.5 py-2 text-xs transition-colors ${
                  isChecked ? "bg-slate-50 text-slate-900 font-medium" : "text-slate-700 hover:bg-slate-50/70"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <input
                    type="checkbox" checked={isChecked}
                    onChange={(e) => onSettingsChange("productIds", e.target.checked ? [...productIds, product.id] : productIds.filter((id) => id !== product.id))}
                    className="accent-slate-900 shrink-0"
                  />
                  <span className="truncate">{product.name}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
                  {onSale && <span className="text-[10px] font-medium text-rose-700">Promo</span>}
                  <span className="text-[10.5px] font-medium text-slate-500">{Number(product.price || 0).toLocaleString("fr-DZ")} DA</span>
                </div>
              </label>
            );
          })
        )}
      </div>

      {selectedProductsOrdered.length > 1 && (
        <div className="space-y-1.5 pt-2 border-t border-slate-200">
          <span className="text-[11px] font-semibold text-slate-900 block tabular-nums">
            Ordre d&apos;affichage ({selectedProductsOrdered.length})
          </span>
          <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg bg-white">
            {selectedProductsOrdered.map((prod, idx) => (
              <div key={prod.id} className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-[11px]">
                <span className="truncate font-medium text-slate-800">{idx + 1}. {prod.name}</span>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button type="button" disabled={idx === 0} onClick={() => handleMoveSelected(idx, "up")} className="p-1 rounded hover:bg-slate-100 disabled:opacity-25 cursor-pointer" title="Monter"><ArrowUp className="w-3 h-3" /></button>
                  <button type="button" disabled={idx === selectedProductsOrdered.length - 1} onClick={() => handleMoveSelected(idx, "down")} className="p-1 rounded hover:bg-slate-100 disabled:opacity-25 cursor-pointer" title="Descendre"><ArrowDown className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
