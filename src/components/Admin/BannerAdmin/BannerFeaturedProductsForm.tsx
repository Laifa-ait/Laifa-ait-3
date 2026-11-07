import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { X, Check, Search, CheckSquare, Trash2, Package } from "lucide-react";
import { Product } from "../../../domains/product/product.types";

export interface BannerFeaturedProductsFormProps {
  allProducts: Product[];
  bannerFeaturedProducts: string[];
  setBannerFeaturedProducts: React.Dispatch<React.SetStateAction<string[]>>;
  productSearchTerm: string;
  setProductSearchTerm: (v: string) => void;
}

export const BannerFeaturedProductsForm: React.FC<BannerFeaturedProductsFormProps> = ({
  allProducts,
  bannerFeaturedProducts,
  setBannerFeaturedProducts,
  productSearchTerm,
  setProductSearchTerm,
}) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const categories = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    const q = productSearchTerm.trim().toLowerCase();
    return allProducts.filter((p) => {
      const matchCat = !selectedCategory || p.category === selectedCategory;
      const matchQuery =
        !q ||
        (p.name || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.sellerName || "").toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [allProducts, selectedCategory, productSearchTerm]);

  const toggleProduct = (id: string) => {
    setBannerFeaturedProducts((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredProducts.map((p) => p.id);
    setBannerFeaturedProducts((prev) => Array.from(new Set([...prev, ...filteredIds])));
  };

  const handleClearAll = () => {
    setBannerFeaturedProducts([]);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header & Quick Bulk Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200/80">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-orange-600" />
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-900">
              {t("Sélection des Produits Mis en Avant")} ({bannerFeaturedProducts.length})
            </h4>
            <p className="text-[10px] font-medium text-zinc-500">
              {t("Sélectionnez autant de produits que vous le souhaitez pour cette campagne")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSelectAllFiltered}
            disabled={filteredProducts.length === 0}
            className="px-2.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-40 transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>
              {t("Tout sélectionner")} ({filteredProducts.length})
            </span>
          </button>
          {bannerFeaturedProducts.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t("Vider")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Selected Products Pills */}
      {bannerFeaturedProducts.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2.5 bg-orange-50/70 rounded-2xl border border-orange-200/80 max-h-28 overflow-y-auto">
          {bannerFeaturedProducts.map((prodId) => {
            const p = allProducts.find((x) => x.id === prodId);
            if (!p) return null;
            const thumb = p.image || p.images?.[0] || "/images/placeholders/product.svg";
            return (
              <div
                key={prodId}
                className="flex items-center gap-1.5 bg-white border border-orange-200 ps-1.5 pe-1 py-0.5 rounded-lg shadow-2xs text-xs"
              >
                <img
                  loading="lazy"
                  src={thumb}
                  className="w-4 h-4 rounded object-cover shrink-0"
                  alt=""
                  referrerPolicy="no-referrer"
                />
                <span className="font-bold text-zinc-800 max-w-[120px] truncate text-[11px]">{p.name}</span>
                <button
                  type="button"
                  onClick={() => toggleProduct(prodId)}
                  className="p-0.5 text-zinc-400 hover:text-red-600 rounded cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="sm:col-span-2 relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t("Rechercher par nom, boutique ou rayon...")}
            value={productSearchTerm}
            onChange={(e) => setProductSearchTerm(e.target.value)}
            className="w-full h-10 pl-8 pr-8 rounded-xl border border-zinc-200 text-xs bg-white focus:outline-none focus:border-orange-500"
          />
          {productSearchTerm && (
            <button
              type="button"
              onClick={() => setProductSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-10 px-3 rounded-xl border border-zinc-200 text-xs font-bold bg-white cursor-pointer focus:outline-none focus:border-orange-500"
        >
          <option value="">
            {t("Tous les rayons")} ({allProducts.length})
          </option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1 border border-zinc-200/80 rounded-2xl bg-zinc-50/50">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs font-bold text-zinc-400 uppercase">
            {t("Aucun produit trouvé pour ce filtre")}
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isSelected = bannerFeaturedProducts.includes(p.id);
            const thumb = p.image || p.images?.[0] || "/images/placeholders/product.svg";
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleProduct(p.id)}
                className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-orange-50/90 border-orange-500 ring-1 ring-orange-500/30"
                    : "bg-white border-zinc-200/80 hover:border-zinc-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                    isSelected
                      ? "bg-orange-600 border-orange-600 text-white"
                      : "border-zinc-300 bg-white"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <img
                  loading="lazy"
                  src={thumb}
                  alt={p.name}
                  className="w-9 h-9 rounded-lg object-cover border border-zinc-100 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-900 truncate">{p.name}</p>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <span className="text-[10px] text-zinc-500 truncate">{p.category}</span>
                    <span className="text-[10px] font-extrabold text-orange-600 shrink-0">
                      {Number(p.price || 0).toLocaleString()} DA
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
