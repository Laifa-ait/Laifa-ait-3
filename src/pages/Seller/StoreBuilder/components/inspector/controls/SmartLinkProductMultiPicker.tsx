import React, { useState, useMemo } from "react";
import { Search, CheckSquare, Square, X } from "lucide-react";
import { Product } from "../../../../../../domains/product/product.types";
import { parseSmartLinkProductIds } from "../../../../../../components/Store/sections/safeNavigationHref";

interface SmartLinkProductMultiPickerProps {
  products: Product[];
  value: string;
  onChange: (newHref: string) => void;
}

export const SmartLinkProductMultiPicker: React.FC<SmartLinkProductMultiPickerProps> = ({
  products,
  value,
  onChange,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const selectedIds = useMemo(() => parseSmartLinkProductIds(value), [value]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const allFilteredSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedIds.includes(p.id));

  const applySelectedIds = (nextIds: string[]) => {
    if (nextIds.length === 0) {
      onChange("#catalog");
    } else {
      onChange(`#products:${nextIds.join(",")}`);
    }
  };

  const handleToggleProduct = (productId: string) => {
    const exists = selectedIds.includes(productId);
    const next = exists
      ? selectedIds.filter((id) => id !== productId)
      : [...selectedIds, productId];
    applySelectedIds(next);
  };

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      const filteredSet = new Set(filteredProducts.map((p) => p.id));
      const next = selectedIds.filter((id) => !filteredSet.has(id));
      applySelectedIds(next);
    } else {
      const next = [...selectedIds];
      for (const p of filteredProducts) {
        if (!next.includes(p.id)) next.push(p.id);
      }
      applySelectedIds(next);
    }
  };

  if (products.length === 0) {
    return (
      <p className="text-[11px] text-slate-500 p-2.5 bg-white rounded-lg border border-slate-200">
        Aucun produit actif dans votre catalogue vendeur.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {/* Search + Select All Toolbar */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1 min-w-0">
          <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrer vos produits..."
            className="h-7 w-full rounded-lg border border-slate-200 bg-white pl-7 pr-6 text-[11px] text-[#011C40] focus:border-[#023859] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleToggleSelectAll}
          disabled={filteredProducts.length === 0}
          className="h-7 px-2 rounded-lg bg-white border border-slate-200 hover:border-[#023859] text-[10px] font-bold text-[#011C40] inline-flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-40"
        >
          {allFilteredSelected ? (
            <>
              <Square className="w-3 h-3 text-[#023859]" />
              <span>Tout décocher</span>
            </>
          ) : (
            <>
              <CheckSquare className="w-3 h-3 text-[#023859]" />
              <span>Tout sélectionner</span>
            </>
          )}
        </button>
      </div>

      {/* Counter bar */}
      <div className="flex items-center justify-between px-1 text-[10px] text-slate-500">
        <span>Cochez tous les produits à afficher au clic :</span>
        <span className="font-bold text-[#023859]">
          {selectedIds.length} / {products.length} sélectionné{selectedIds.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Multi-select product list */}
      <div className="max-h-44 overflow-y-auto space-y-1 pr-0.5">
        {filteredProducts.length === 0 ? (
          <p className="text-[11px] text-slate-500 p-2 text-center bg-white rounded-lg border border-slate-200">
            Aucun produit trouvé pour « {searchQuery} ».
          </p>
        ) : (
          filteredProducts.map((prod) => {
            const isSel = selectedIds.includes(prod.id);
            const thumb =
              (Array.isArray(prod.images) && prod.images[0]) ||
              prod.image ||
              "";
            return (
              <label
                key={prod.id}
                onClick={(e) => {
                  e.preventDefault();
                  handleToggleProduct(prod.id);
                }}
                className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border text-left text-[11px] cursor-pointer transition-colors ${
                  isSel
                    ? "border-[#023859] bg-[#F0F7FA] text-[#011C40] font-bold"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <input
                    type="checkbox"
                    checked={isSel}
                    readOnly
                    className="rounded accent-[#023859] shrink-0 pointer-events-none"
                  />
                  {thumb && (
                    <img
                      src={thumb}
                      alt={prod.name}
                      className="w-6 h-6 rounded object-cover border border-slate-200 shrink-0"
                    />
                  )}
                  <span className="truncate font-semibold">{prod.name}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                  {Number(prod.price || 0).toLocaleString("fr-DZ")} DA
                </span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
};
