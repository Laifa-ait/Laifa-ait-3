import React from "react";
import { Plus, Trash2, Layers, HelpCircle } from "lucide-react";
import { CustomPageSection } from "../../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../../domains/product/product.types";
import { StudioImagePicker } from "./StudioImagePicker";
import { PromoSlidesListEditor } from "./PromoSlidesListEditor";
import { AlgeriaEcommercePresets } from "../controls/AlgeriaEcommercePresets";
import { useStudioStore } from "../../../store/useStudioStore";

interface ListContentEditorProps {
  sectionType?: string;
  settings: Record<string, unknown>;
  sections?: CustomPageSection[];
  products: Product[];
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  inputClass: string;
}

export const ListContentEditor: React.FC<ListContentEditorProps> = ({
  sectionType,
  settings,
  sections = [],
  products,
  onSettingsChange,
  inputClass,
}) => {
  const selectedSubElement = useStudioStore((s) => s.selectedSubElement);

  const updateRecordList = <T extends Record<string, unknown>>(
    field: string,
    index: number,
    patch: Partial<T>
  ) => {
    const items = Array.isArray(settings[field]) ? [...(settings[field] as T[])] : [];
    items[index] = { ...items[index], ...patch };
    onSettingsChange(field, items);
  };

  if (sectionType === "promo_carousel" || "slides" in settings) {
    return (
      <PromoSlidesListEditor
        settings={settings}
        sections={sections}
        products={products}
        onSettingsChange={onSettingsChange}
        updateRecordList={updateRecordList}
        inputClass={inputClass}
      />
    );
  }

  if (sectionType === "curated_collections" || "collections" in settings) {
    const collections = Array.isArray(settings.collections)
      ? (settings.collections as Array<Record<string, unknown>>)
      : [];
    return (
      <div className="space-y-3 select-none">
        <label className="block space-y-1 text-xs font-semibold text-slate-700">
          <span>Titre de la section Collections</span>
          <input
            value={String(settings.title || "")}
            onChange={(e) => onSettingsChange("title", e.target.value)}
            placeholder="Nos Collections Éditoriales"
            className={inputClass}
          />
        </label>

        <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Collections ({collections.length}/16)</span>
            </h3>
            <button
              type="button"
              disabled={collections.length >= 16}
              onClick={() =>
                onSettingsChange("collections", [
                  ...collections,
                  {
                    id: `collection_${Date.now()}`,
                    title: `Collection #${collections.length + 1}`,
                    imageUrl: products[0]?.images?.[0] || products[0]?.image || "",
                    productIds: [],
                  },
                ])
              }
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F97316] text-white text-[11px] font-bold cursor-pointer disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Ajouter une catégorie</span>
            </button>
          </div>

          {collections.map((collection, index) => {
            const ids = Array.isArray(collection.productIds) ? (collection.productIds as string[]) : [];
            const isHighlighted = selectedSubElement === `cat-${index}`;
            return (
              <div
                key={String(collection.id || index)}
                className={`space-y-2.5 rounded-xl border p-3 transition-all ${
                  isHighlighted
                    ? "border-[#F97316] bg-[#FFF7ED]/50 ring-2 ring-[#F97316]/30"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex gap-2">
                  <input
                    value={String(collection.title || "")}
                    onChange={(e) => updateRecordList("collections", index, { title: e.target.value })}
                    placeholder="Nom de la collection"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => onSettingsChange("collections", collections.filter((_, itemIndex) => itemIndex !== index))}
                    className="rounded-lg border border-rose-200 px-2 text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <StudioImagePicker
                  label={`Photo Collection #${index + 1}`}
                  value={String(collection.imageUrl || "")}
                  onChange={(newUrl) => updateRecordList("collections", index, { imageUrl: newUrl })}
                  products={products}
                  compact
                />

                {products.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 block">
                      Produits ({ids.length} sélectionnés)
                    </span>
                    <div className="max-h-28 space-y-1 overflow-auto rounded-lg bg-slate-50 p-2 border border-slate-100">
                      {products.map((product) => (
                        <label key={product.id} className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ids.includes(product.id)}
                            onChange={(e) =>
                              updateRecordList("collections", index, {
                                productIds: e.target.checked ? [...ids, product.id] : ids.filter((id) => id !== product.id),
                              })
                            }
                            className="accent-[#F97316]"
                          />
                          <span className="truncate">{product.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (sectionType === "faq_accordion" || "items" in settings) {
    const items = Array.isArray(settings.items) ? (settings.items as Array<Record<string, unknown>>) : [];
    return (
      <div className="space-y-3 select-none">
        <AlgeriaEcommercePresets
          sectionType="faq_accordion"
          onApplyPreset={(patch) => onSettingsChange(patch)}
        />

        <label className="block space-y-1 text-xs font-semibold text-slate-700">
          <span>Titre de la Foire Aux Questions</span>
          <input
            value={String(settings.title || "")}
            onChange={(e) => onSettingsChange("title", e.target.value)}
            placeholder="Questions Fréquentes"
            className={inputClass}
          />
        </label>

        <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Questions / Réponses ({items.length}/24)</span>
            </h3>
            <button
              type="button"
              disabled={items.length >= 24}
              onClick={() =>
                onSettingsChange("items", [
                  ...items,
                  { question: "Nouvelle question fréquente ?", answer: "Votre réponse détaillée ici." },
                ])
              }
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F97316] text-white text-[11px] font-bold cursor-pointer disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Ajouter une question</span>
            </button>
          </div>
          {items.map((item, index) => {
            const isHighlighted = selectedSubElement === `faq-${index}`;
            return (
              <div
                key={index}
                className={`space-y-2 rounded-xl border p-3 transition-all ${
                  isHighlighted
                    ? "border-[#F97316] bg-[#FFF7ED]/50 ring-2 ring-[#F97316]/30"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex gap-2">
                  <input
                    value={String(item.question || "")}
                    onChange={(e) => updateRecordList("items", index, { question: e.target.value })}
                    placeholder="Question"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => onSettingsChange("items", items.filter((_, itemIndex) => itemIndex !== index))}
                    className="rounded-lg border border-rose-200 px-2 text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={String(item.answer || "")}
                  onChange={(e) => updateRecordList("items", index, { answer: e.target.value })}
                  placeholder="Réponse"
                  className="w-full rounded-lg border border-[#E4E7EC] p-2.5 text-xs focus:border-[#F97316] focus:outline-none"
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};
