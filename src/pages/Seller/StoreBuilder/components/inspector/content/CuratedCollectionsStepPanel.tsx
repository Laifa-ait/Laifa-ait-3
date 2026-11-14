import React from "react";
import { Plus, Trash2, Layers } from "lucide-react";
import { Product } from "../../../../../../domains/product/product.types";
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
}) => (
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
      const ids = Array.isArray(collection.productIds)
        ? (collection.productIds as string[])
        : [];
      const isHighlighted = selectedSubElement === `cat-${index}`;
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
          {products.length > 0 && (
            <div className="max-h-28 space-y-1 overflow-auto rounded-lg bg-slate-50 p-2 border border-slate-100">
              {products.map((product) => (
                <label
                  key={product.id}
                  className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={ids.includes(product.id)}
                    onChange={(e) =>
                      onUpdate(index, {
                        productIds: e.target.checked
                          ? [...ids, product.id]
                          : ids.filter((id) => id !== product.id),
                      })
                    }
                    className="accent-[#023859]"
                  />
                  <span className="truncate">{product.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      );
    })}
  </div>
);
