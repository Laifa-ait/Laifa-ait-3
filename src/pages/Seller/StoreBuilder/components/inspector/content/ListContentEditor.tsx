import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Product } from "../../../../../../domains/product/product.types";

interface ListContentEditorProps {
  settings: Record<string, unknown>;
  products: Product[];
  onSettingsChange: (field: string, value: unknown) => void;
  inputClass: string;
}

export const ListContentEditor: React.FC<ListContentEditorProps> = ({
  settings,
  products,
  onSettingsChange,
  inputClass,
}) => {
  const updateRecordList = <T extends Record<string, unknown>>(field: string, index: number, patch: Partial<T>) => {
    const items = Array.isArray(settings[field]) ? [...(settings[field] as T[])] : [];
    items[index] = { ...items[index], ...patch };
    onSettingsChange(field, items);
  };

  return (
    <div className="space-y-4">

      {"collections" in settings && (
        <div className="space-y-3 border-t border-[#E4E7EC] pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[12px] font-semibold text-[#17191C]">Collections</h3>
            <button
              type="button"
              disabled={(Array.isArray(settings.collections) ? settings.collections.length : 0) >= 6}
              onClick={() =>
                onSettingsChange("collections", [
                  ...(Array.isArray(settings.collections) ? settings.collections : []),
                  { id: `collection_${Date.now()}`, title: "Nouvelle collection", productIds: [] },
                ])
              }
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#F97316] disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter
            </button>
          </div>
          {(Array.isArray(settings.collections) ? (settings.collections as Array<Record<string, unknown>>) : []).map(
            (collection, index) => {
              const ids = Array.isArray(collection.productIds) ? (collection.productIds as string[]) : [];
              return (
                <div key={String(collection.id || index)} className="space-y-2 rounded-lg border border-[#E4E7EC] p-3">
                  <div className="flex gap-2">
                    <input
                      aria-label="Nom de la collection"
                      value={String(collection.title || "")}
                      onChange={(event) => updateRecordList("collections", index, { title: event.target.value })}
                      placeholder="Ex. Collection d'été"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      aria-label="Supprimer la collection"
                      onClick={() =>
                        onSettingsChange(
                          "collections",
                          (settings.collections as unknown[]).filter((_, itemIndex) => itemIndex !== index)
                        )
                      }
                      className="rounded-lg border border-red-100 px-2 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {products.length > 0 && (
                    <div className="max-h-32 space-y-1 overflow-auto rounded-md bg-[#F9FAFB] p-2">
                      {products.map((product) => (
                        <label key={product.id} className="flex items-center gap-2 text-[11px] text-[#475467]">
                          <input
                            type="checkbox"
                            checked={ids.includes(product.id)}
                            onChange={(event) =>
                              updateRecordList("collections", index, {
                                productIds: event.target.checked
                                  ? [...ids, product.id]
                                  : ids.filter((id) => id !== product.id),
                              })
                            }
                            className="accent-[#F97316]"
                          />
                          <span className="truncate">{product.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      )}

      {"items" in settings && (
        <div className="space-y-3 border-t border-[#E4E7EC] pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[12px] font-semibold text-[#17191C]">Questions et réponses</h3>
            <button
              type="button"
              disabled={(settings.items as unknown[]).length >= 10}
              onClick={() =>
                onSettingsChange("items", [
                  ...(settings.items as Array<Record<string, unknown>>),
                  { question: "Nouvelle question", answer: "Votre réponse" },
                ])
              }
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#F97316] disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter
            </button>
          </div>
          {(settings.items as Array<Record<string, unknown>>).map((item, index) => (
            <div key={index} className="space-y-2 rounded-lg border border-[#E4E7EC] p-3">
              <div className="flex gap-2">
                <input
                  aria-label="Question"
                  value={String(item.question || "")}
                  onChange={(event) => updateRecordList("items", index, { question: event.target.value })}
                  placeholder="Question"
                  className={inputClass}
                />
                <button
                  type="button"
                  aria-label="Supprimer la question"
                  onClick={() =>
                    onSettingsChange(
                      "items",
                      (settings.items as unknown[]).filter((_, itemIndex) => itemIndex !== index)
                    )
                  }
                  className="rounded-lg border border-red-100 px-2 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea
                aria-label="Réponse"
                rows={3}
                value={String(item.answer || "")}
                onChange={(event) => updateRecordList("items", index, { answer: event.target.value })}
                placeholder="Réponse"
                className="w-full rounded-lg border border-[#E4E7EC] p-3 text-[12px] focus:border-[#F97316] focus:outline-none"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
