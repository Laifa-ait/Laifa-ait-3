import React, { useState, useMemo } from "react";
import { Check, Search, ShoppingBag, Eye, Sparkles, Filter } from "lucide-react";
import { Product } from "../../../../../../domains/product/product.types";
import { CategoryItem } from "../../../constants/categoryPresets";

interface CategoryProductAssignerProps {
  cat: CategoryItem;
  products: Product[];
  onUpdate: (patch: Partial<CategoryItem>) => void;
}

export const CategoryProductAssigner: React.FC<CategoryProductAssignerProps> = ({
  cat,
  products,
  onUpdate,
}) => {
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"manual" | "auto">(
    cat.categoryFilter && (!cat.productIds || cat.productIds.length === 0) ? "auto" : "manual"
  );

  const selectedIds = useMemo(
    () => new Set<string>(Array.isArray(cat.productIds) ? cat.productIds : []),
    [cat.productIds]
  );

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category && p.category.trim()) set.add(p.category.trim());
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
    );
  }, [products, search]);

  const toggleProduct = (productId: string) => {
    const next = new Set(selectedIds);
    if (next.has(productId)) next.delete(productId);
    else next.add(productId);
    const nextArray = Array.from(next);
    onUpdate({ productIds: nextArray, itemCount: nextArray.length });
  };

  const handleSelectAll = () => {
    const allIds = filteredProducts.map((p) => p.id);
    onUpdate({ productIds: allIds, itemCount: allIds.length });
  };

  const handleClearAll = () => onUpdate({ productIds: [], itemCount: 0 });

  const handleAutoFilterChange = (categoryName: string) => {
    const matchingCount = categoryName
      ? products.filter((p) => (p.category || "").toLowerCase() === categoryName.toLowerCase()).length
      : products.length;
    onUpdate({ categoryFilter: categoryName || undefined, itemCount: matchingCount });
  };

  const handlePreviewCategoryPage = () => {
    window.dispatchEvent(
      new CustomEvent("studio:navigate-page", {
        detail: { viewMode: "category", categorySlug: cat.slug, categoryItem: cat },
      })
    );
  };

  return (
    <div className="pt-3 border-t border-slate-200 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-900 flex items-center gap-1.5 tabular-nums">
          <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
          <span>Produits ({selectedIds.size})</span>
        </span>
        <button
          type="button"
          onClick={handlePreviewCategoryPage}
          className="px-2 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[10.5px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
          title="Voir la page dédiée à ce rayon"
        >
          <Eye className="w-3 h-3" />
          <span>Voir la page</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 rounded-lg text-[11px] font-medium">
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`py-1.5 px-2 rounded-md flex items-center justify-center gap-1 cursor-pointer transition-colors ${
            mode === "manual" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Manuel ({selectedIds.size})</span>
        </button>
        <button
          type="button"
          onClick={() => setMode("auto")}
          className={`py-1.5 px-2 rounded-md flex items-center justify-center gap-1 cursor-pointer transition-colors ${
            mode === "auto" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Filter className="w-3 h-3" />
          <span>Filtre auto</span>
        </button>
      </div>

      {mode === "auto" ? (
        <div className="space-y-2 bg-slate-50/70 p-2.5 rounded-lg border border-slate-200">
          <label className="text-[11px] font-medium text-slate-700 block">
            Associer aux produits de la catégorie :
          </label>
          <select
            value={cat.categoryFilter || ""}
            onChange={(e) => handleAutoFilterChange(e.target.value)}
            className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-slate-900 focus:outline-none"
          >
            <option value="">— Choisir une catégorie —</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>
                {c} ({products.filter((p) => p.category === c).length})
              </option>
            ))}
          </select>
          <p className="text-[10.5px] text-slate-500 leading-relaxed">
            Les produits de cette catégorie s&apos;afficheront automatiquement au clic sur <strong>{cat.name}</strong>.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.length === 0 ? (
            <p className="text-[11px] text-slate-400 text-center py-3 border border-slate-200 rounded-lg">
              Aucun produit dans votre catalogue.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Chercher un produit..."
                    className="w-full h-7.5 pl-7 pr-2 bg-slate-50/70 border border-slate-200 rounded-md text-[11px] text-slate-800 focus:bg-white focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2 h-7.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-[10.5px] font-medium text-slate-700 cursor-pointer shrink-0"
                >
                  Tout
                </button>
                {selectedIds.size > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-2 h-7.5 rounded-md border border-rose-200 bg-rose-50 hover:bg-rose-100 text-[10.5px] font-medium text-rose-700 cursor-pointer shrink-0"
                  >
                    Vider
                  </button>
                )}
              </div>

              <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg bg-white">
                {filteredProducts.map((prod) => {
                  const isChecked = selectedIds.has(prod.id);
                  return (
                    <div
                      key={prod.id}
                      onClick={() => toggleProduct(prod.id)}
                      className={`px-2.5 py-2 flex items-center gap-2 cursor-pointer transition-colors ${
                        isChecked ? "bg-slate-50" : "bg-white hover:bg-slate-50/60"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                          isChecked ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-300"
                        }`}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5" />}
                      </div>
                      {prod.image ? (
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-7 h-7 rounded object-cover shrink-0 bg-white border border-slate-200"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-slate-900 truncate">{prod.name}</p>
                        <p className="text-[10px] font-mono text-slate-500 tabular-nums">
                          {Number(prod.price || 0).toLocaleString("fr-DZ")} DA
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
