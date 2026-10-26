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
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
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
    if (next.has(productId)) {
      next.delete(productId);
    } else {
      next.add(productId);
    }
    const nextArray = Array.from(next);
    onUpdate({
      productIds: nextArray,
      itemCount: nextArray.length,
    });
  };

  const handleSelectAll = () => {
    const allIds = filteredProducts.map((p) => p.id);
    onUpdate({
      productIds: allIds,
      itemCount: allIds.length,
    });
  };

  const handleClearAll = () => {
    onUpdate({
      productIds: [],
      itemCount: 0,
    });
  };

  const handleAutoFilterChange = (categoryName: string) => {
    const matchingCount = categoryName
      ? products.filter(
          (p) => (p.category || "").toLowerCase() === categoryName.toLowerCase()
        ).length
      : products.length;
    onUpdate({
      categoryFilter: categoryName || undefined,
      itemCount: matchingCount,
    });
  };

  const handlePreviewCategoryPage = () => {
    window.dispatchEvent(
      new CustomEvent("studio:navigate-page", {
        detail: {
          viewMode: "category",
          categorySlug: cat.slug,
          categoryItem: cat,
        },
      })
    );
  };

  return (
    <div className="pt-2.5 border-t border-slate-200 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
          <ShoppingBag className="w-3.5 h-3.5 text-orange-500" />
          <span>Produits de ce Rayon ({selectedIds.size})</span>
        </span>
        <button
          type="button"
          onClick={handlePreviewCategoryPage}
          className="px-2 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
          title="Voir et customiser la page qui s'ouvre quand on clique sur ce rayon"
        >
          <Eye className="w-3 h-3" />
          <span>Voir la page du rayon</span>
        </button>
      </div>

      {/* Mode Switcher: Manual vs Auto Category */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg text-[11px] font-semibold">
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`py-1 px-2 rounded-md flex items-center justify-center gap-1 cursor-pointer transition-all ${
            mode === "manual"
              ? "bg-white text-orange-600 shadow-2xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Choix Manuel ({selectedIds.size})</span>
        </button>
        <button
          type="button"
          onClick={() => setMode("auto")}
          className={`py-1 px-2 rounded-md flex items-center justify-center gap-1 cursor-pointer transition-all ${
            mode === "auto"
              ? "bg-white text-orange-600 shadow-2xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Filter className="w-3 h-3" />
          <span>Filtre Auto</span>
        </button>
      </div>

      {mode === "auto" ? (
        <div className="space-y-2 bg-white p-2.5 rounded-lg border border-slate-200">
          <label className="text-[11px] font-medium text-slate-600 block">
            Associer automatiquement aux produits de la catégorie :
          </label>
          <select
            value={cat.categoryFilter || ""}
            onChange={(e) => handleAutoFilterChange(e.target.value)}
            className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-orange-500 focus:outline-none"
          >
            <option value="">— Choisir une catégorie du catalogue —</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>
                {c} ({products.filter((p) => p.category === c).length} produits)
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Tous les produits portant cette catégorie s'afficheront automatiquement quand un client cliquera sur <strong>{cat.name}</strong>.
          </p>
        </div>
      ) : (
        <div className="space-y-2 bg-white p-2.5 rounded-lg border border-slate-200">
          {products.length === 0 ? (
            <p className="text-[11px] text-slate-500 text-center py-2">
              Aucun produit dans votre catalogue. Ajoutez des produits depuis l'onglet Catalogue.
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
                    placeholder="Chercher un produit à inclure..."
                    className="w-full h-7 pl-7 pr-2 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-800 focus:bg-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-semibold text-slate-700 cursor-pointer shrink-0"
                >
                  Tout
                </button>
                {selectedIds.size > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-2 h-7 rounded-md bg-red-50 hover:bg-red-100 text-[10px] font-semibold text-red-600 cursor-pointer shrink-0"
                  >
                    Vider
                  </button>
                )}
              </div>

              <div className="max-h-44 overflow-y-auto space-y-1 pr-0.5">
                {filteredProducts.map((prod) => {
                  const isChecked = selectedIds.has(prod.id);
                  return (
                    <div
                      key={prod.id}
                      onClick={() => toggleProduct(prod.id)}
                      className={`p-1.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-all ${
                        isChecked
                          ? "bg-orange-50/80 border-orange-300"
                          : "bg-slate-50/60 border-slate-200/70 hover:bg-slate-100"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                          isChecked
                            ? "bg-orange-500 border-orange-500 text-white"
                            : "bg-white border-slate-300"
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
                        <div className="w-7 h-7 rounded bg-slate-200 flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-slate-800 truncate">
                          {prod.name}
                        </p>
                        <p className="text-[10px] font-mono text-orange-600 font-bold">
                          {Number(prod.price || 0).toLocaleString("fr-DZ")} DZD
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
