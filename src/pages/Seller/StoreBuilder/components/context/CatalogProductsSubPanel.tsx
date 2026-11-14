import React, { useState } from "react";
import { Package, Search, Check, Sparkles } from "lucide-react";
import { Product } from "../../../../../domains/product/product.types";
import { CustomPageSection } from "../../../../../domains/seller/customPage.types";

interface CatalogProductsSubPanelProps {
  products: Product[];
  productFeedSections: CustomPageSection[];
  activeFeedSection?: CustomPageSection;
  selectedFeedId: string;
  onSelectFeedId: (id: string) => void;
  featuredProductIds: string[];
  onToggleFeaturedProduct: (productId: string) => void;
}

export const CatalogProductsSubPanel: React.FC<CatalogProductsSubPanelProps> = ({
  products,
  productFeedSections,
  activeFeedSection,
  selectedFeedId,
  onSelectFeedId,
  featuredProductIds,
  onToggleFeaturedProduct,
}) => {
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (p.title || p.name || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 space-y-3">
      {productFeedSections.length > 1 && (
        <div className="space-y-1">
          <label className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 block">
            Section cible
          </label>
          <select
            value={activeFeedSection?.id || selectedFeedId}
            onChange={(e) => onSelectFeedId(e.target.value)}
            className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
          >
            {productFeedSections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.title || sec.type} ({sec.type})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Chercher un produit..."
          className="w-full h-8.5 pl-8 pr-3 rounded-lg bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
        />
      </div>

      {products.length === 0 ? (
        <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-1.5">
          <Package className="w-6 h-6 text-slate-400 mx-auto" />
          <p className="text-xs font-medium text-slate-900">Aucun produit en stock</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
          {filteredProducts.map((p) => {
            const isFeatured = featuredProductIds.includes(p.id);
            const thumb = p.images?.[0] || p.image || "";
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onToggleFeaturedProduct(p.id)}
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 text-left transition-colors cursor-pointer ${
                  isFeatured ? "bg-slate-50" : "bg-white hover:bg-slate-50/60"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={p.title || p.name}
                      className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {p.title || p.name}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500 tabular-nums">
                      {Number(p.price || 0).toLocaleString("fr-DZ")} DA
                    </p>
                  </div>
                </div>
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                    isFeatured
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "bg-white border-slate-200 text-transparent"
                  }`}
                >
                  <Check className="w-3 h-3" />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
