import React, { useMemo, useState } from "react";
import { AlertTriangle, Plus, Trash2, Layers } from "lucide-react";
import { Product } from "../../../../../../domains/product/product.types";
import {
  classifyCatalogProductStatus,
  doesProductMatchCategoryFilter,
  isCatalogProductPubliclyActive,
} from "../../../../../../domains/seller/studioCatalogResolver";
import { StudioImagePicker } from "./StudioImagePicker";

interface CuratedCollectionsStepPanelProps {
  collections: Array<Record<string, unknown>>;
  products: Product[];
  selectedSubElement: string | null;
  inputClass: string;
  onAdd: () => void;
  onUpdate: (index: number, patch: Record<string, unknown>) => void;
  onDelete: (index: number) => void;
}

export const CuratedCollectionsStepPanel: React.FC<CuratedCollectionsStepPanelProps> = ({
  collections,
  products,
  selectedSubElement,
  inputClass,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [visibleLimit, setVisibleLimit] = useState(40);
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .filter(isCatalogProductPubliclyActive)
            .map((p) => (p.category || "").trim())
            .filter(Boolean)
        )
      ),
    [products]
  );

  const activeIdsSet = useMemo(
    () => new Set(products.filter(isCatalogProductPubliclyActive).map((p) => p.id)),
    [products]
  );

  return (
    <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-bold text-[#011C40] flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#023859]" />
          <span>Collections ({collections.length}/16)</span>
        </h3>
        <button
          type="button"
          disabled={collections.length >= 16}
          onClick={onAdd}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#023859] hover:bg-[#011C40] text-white text-[11px] font-bold cursor-pointer disabled:opacity-40 whitespace-nowrap shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Ajouter</span>
        </button>
      </div>

      {collections.map((collection, index) => {
        const ids = Array.isArray(collection.productIds) ? (collection.productIds as string[]) : [];
        const categoryFilter = typeof collection.categoryFilter === "string" ? collection.categoryFilter : "";
        const staleIds = ids.filter((id) => !activeIdsSet.has(id));
        const autoMatchesCount = categoryFilter
          ? products.filter((p) => isCatalogProductPubliclyActive(p) && doesProductMatchCategoryFilter(p, categoryFilter)).length
          : 0;
        const isHighlighted = selectedSubElement === `cat-${index}` || selectedSubElement === `collection-${index}`;

        return (
          <div
            key={String(collection.id || index)}
            className={`space-y-2.5 rounded-xl border p-3 transition-all ${
              isHighlighted ? "border-[#023859] bg-[#F0F7FA]/60" : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex gap-2">
              <input
                value={String(collection.title || "")}
                onChange={(e) => onUpdate(index, { title: e.target.value })}
                placeholder="Nom de la collection"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => onDelete(index)}
                className="rounded-lg border border-rose-200 px-2 text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <StudioImagePicker
              label={`Photo Collection #${index + 1}`}
              value={String(collection.imageUrl || "")}
              onChange={(newUrl) => onUpdate(index, { imageUrl: newUrl })}
              products={products}
              compact
            />
            <label className="block space-y-1 text-[11px] font-medium text-slate-700">
              <span>Mode d&apos;association</span>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  onUpdate(index, {
                    selectionMode: val ? "auto" : "manual",
                    categoryFilter: val || undefined,
                  });
                }}
                className={inputClass}
              >
                <option value="">Sélection manuelle ({ids.filter((id) => activeIdsSet.has(id)).length} actif(s))</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>Règle dynamique : rayon « {cat} »</option>
                ))}
                {categoryFilter && !categories.includes(categoryFilter) && (
                  <option value={categoryFilter}>Rayon obsolète : {categoryFilter} (0 actif)</option>
                )}
              </select>
            </label>

            {categoryFilter && autoMatchesCount === 0 && (
              <div className="px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[10.5px] text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>Aucun produit actif dans « {categoryFilter} ».</span>
              </div>
            )}

            {!categoryFilter && staleIds.length > 0 && (
              <div className="px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[10.5px] text-amber-900 flex items-center justify-between gap-2">
                <span>{staleIds.length} référence(s) supprimée(s) ou inactive(s)</span>
                <button
                  type="button"
                  onClick={() => onUpdate(index, { productIds: ids.filter((id) => activeIdsSet.has(id)) })}
                  className="px-2 py-0.5 rounded bg-amber-900 text-white text-[10px] font-bold cursor-pointer"
                >
                  Nettoyer
                </button>
              </div>
            )}

            {!categoryFilter && products.length > 0 && (
              <div className="max-h-32 space-y-1 overflow-auto rounded-lg bg-slate-50 p-2 border border-slate-100">
                {products.slice(0, visibleLimit).map((product) => {
                  const meta = classifyCatalogProductStatus(product);
                  return (
                    <label
                      key={product.id}
                      className="flex items-center justify-between gap-2 text-[11px] text-slate-700 cursor-pointer"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={ids.includes(product.id)}
                          onChange={(e) =>
                            onUpdate(index, {
                              selectionMode: "manual",
                              productIds: e.target.checked
                                ? [...ids, product.id]
                                : ids.filter((id) => id !== product.id),
                            })
                          }
                          className="accent-[#023859] shrink-0"
                        />
                        <span className="truncate">{product.name}</span>
                      </span>
                      {!meta.isPubliclyVisible && (
                        <span className="text-[9.5px] font-semibold px-1 rounded bg-amber-100 text-amber-800 shrink-0">
                          {meta.label}
                        </span>
                      )}
                    </label>
                  );
                })}
                {products.length > visibleLimit && (
                  <button
                    type="button"
                    onClick={() => setVisibleLimit((prev) => prev + 40)}
                    className="w-full py-1 text-[10.5px] font-semibold text-[#023859] cursor-pointer"
                  >
                    + Voir {Math.min(40, products.length - visibleLimit)} autres
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
