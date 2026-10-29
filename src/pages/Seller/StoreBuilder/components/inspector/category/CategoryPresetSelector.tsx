import React, { useState } from "react";
import { Sparkles, Check, Wand2, ShieldCheck } from "lucide-react";
import { CATEGORY_PRESETS, CategoryPreset } from "../../../constants/categoryPresets";
import { Product } from "../../../../../../domains/product/product.types";

interface CategoryPresetSelectorProps {
  currentLayout: string;
  activePresetId?: string;
  products: Product[];
  hasExistingCategories?: boolean;
  onApplyPreset: (preset: CategoryPreset, keepExistingItems: boolean) => void;
  onImportFromProducts: (categories: Array<Record<string, unknown>>) => void;
}

export const CategoryPresetSelector: React.FC<CategoryPresetSelectorProps> = ({
  currentLayout,
  activePresetId,
  products,
  hasExistingCategories = true,
  onApplyPreset,
  onImportFromProducts,
}) => {
  const [keepMyRayons, setKeepMyRayons] = useState<boolean>(hasExistingCategories);
  const fallbackPresetId = CATEGORY_PRESETS.find((p) => p.settings.layout === currentLayout)?.id;
  const resolvedActivePresetId = activePresetId || fallbackPresetId;

  const handleSmartExtractFromProducts = () => {
    const map = new Map<string, { name: string; imageUrl: string; count: number; productIds: string[] }>();
    for (const p of products) {
      const catName = (p.category || "Collection").trim();
      if (!catName) continue;
      const existing = map.get(catName);
      const firstImage = Array.isArray(p.images) && p.images[0] ? p.images[0] : "";
      if (!existing) {
        map.set(catName, {
          name: catName,
          imageUrl: firstImage,
          count: 1,
          productIds: [p.id],
        });
      } else {
        existing.count += 1;
        existing.productIds.push(p.id);
        if (!existing.imageUrl && firstImage) existing.imageUrl = firstImage;
      }
    }

    const generated = Array.from(map.values())
      .slice(0, 12)
      .map((item, idx) => ({
        id: `auto_cat_${idx}_${Date.now()}`,
        name: item.name,
        subtitle: `${item.count} produit${item.count > 1 ? "s" : ""}`,
        slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        imageUrl:
          item.imageUrl ||
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
        iconName: "ShoppingBag",
        badge: idx === 0 ? "Populaire" : "",
        badgeColor: "#F97316",
        itemCount: item.count,
        productIds: item.productIds,
        colSpan: idx === 0 ? 2 : 1,
      }));

    if (generated.length > 0) {
      onImportFromProducts(generated);
    }
  };

  return (
    <div className="space-y-4">
      {/* Protection Toggle: Keep user's custom Rayons, photos & names when changing visual preset */}
      <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2">
        <label className="flex items-start justify-between gap-2.5 cursor-pointer">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-emerald-950 block">
                Garder mes propres rayons, photos et noms
              </span>
              <span className="text-[10px] text-emerald-800 block leading-relaxed">
                Activé : cliquer sur un modèle ci-dessous change uniquement le design visuel sans écraser vos rayons créés.
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={keepMyRayons}
            onChange={(e) => setKeepMyRayons(e.target.checked)}
            className="mt-1 accent-emerald-600 w-4 h-4 cursor-pointer shrink-0"
          />
        </label>
      </div>

      {/* Smart Product Category Extractor */}
      <div className="p-3 rounded-xl bg-gradient-to-br from-[#F0F7FA] via-white to-slate-50 border border-[#B8D8E8] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#011C40] flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-[#26658C]" />
            Génération automatique depuis votre catalogue
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#023859]/10 text-[#023859]">
            1-Clic
          </span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Crée automatiquement vos rayons avec les photos et catégories réelles de vos{" "}
          <strong>{products.length} produits</strong>.
        </p>
        <button
          type="button"
          onClick={handleSmartExtractFromProducts}
          disabled={products.length === 0}
          className="w-full py-2 px-3 rounded-lg bg-[#023859] hover:bg-[#011C40] disabled:opacity-40 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Générer mes rayons depuis mes produits</span>
        </button>
      </div>

      {/* Shopify OS 2.0 Ready Templates */}
      <div className="space-y-2">
        <label className="text-[12px] font-bold text-slate-800 uppercase tracking-wider block">
          Styles & Modèles Visuels (Shopify Studio)
        </label>
        <div className="grid grid-cols-1 gap-2.5">
          {CATEGORY_PRESETS.map((preset) => {
            const isSelected = resolvedActivePresetId === preset.id;
            return (
              <div
                key={preset.id}
                className={`group text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? "border-[#023859] bg-[#F0F7FA]/60 ring-1 ring-[#023859]/25"
                    : "border-slate-200 bg-white hover:border-[#54ACBF]"
                }`}
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{preset.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {preset.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{preset.description}</p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => onApplyPreset(preset, keepMyRayons)}
                      className="px-2.5 py-1 rounded-lg bg-[#023859] hover:bg-[#011C40] text-white text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      {keepMyRayons ? "Appliquer le style (garder mes rayons)" : "Appliquer style + exemples"}
                    </button>
                    {keepMyRayons && (
                      <button
                        type="button"
                        onClick={() => onApplyPreset(preset, false)}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold cursor-pointer transition-colors"
                      >
                        Charger les {preset.settings.categories.length} rayons d'exemple
                      </button>
                    )}
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected
                      ? "bg-[#023859] text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
