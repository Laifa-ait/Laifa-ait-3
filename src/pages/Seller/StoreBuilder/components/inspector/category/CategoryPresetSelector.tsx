import React from "react";
import { Check, Wand2, PackageCheck } from "lucide-react";
import { CATEGORY_PRESETS, CategoryPreset } from "../../../constants/categoryPresets";
import { Product } from "../../../../../../domains/product/product.types";

interface CategoryPresetSelectorProps {
  currentLayout?: string;
  products: Product[];
  onApplyPreset: (preset: CategoryPreset) => void;
  onImportFromProducts: (importedCategories: Array<Record<string, unknown>>) => void;
}

export const CategoryPresetSelector: React.FC<CategoryPresetSelectorProps> = ({
  currentLayout,
  products,
  onApplyPreset,
  onImportFromProducts,
}) => {
  const handleAutoExtractProducts = () => {
    const categoryMap = new Map<string, number>();
    products.forEach((p) => {
      const cat = p.category?.trim();
      if (cat) {
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
      }
    });

    if (categoryMap.size === 0) {
      // Fallback sample categories
      categoryMap.set("Nouveautés", 12);
      categoryMap.set("Meilleures Ventes", 24);
      categoryMap.set("Promotions", 8);
    }

    const items = Array.from(categoryMap.entries()).map(([name, count], idx) => ({
      id: `cat_auto_${Date.now()}_${idx}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      subtitle: `${count} article${count > 1 ? "s" : ""}`,
      itemCount: count,
      badge: idx === 0 ? "Populaire" : undefined,
      badgeColor: "#F97316",
    }));

    onImportFromProducts(items);
  };

  return (
    <div className="space-y-4">
      {/* Magic button to import vendor products */}
      <div className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Synchronisation Boutique</h4>
            <p className="text-[11px] text-slate-600">
              {products.length} produit{products.length > 1 ? "s" : ""} détecté{products.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAutoExtractProducts}
          className="w-full py-2 px-3 bg-white hover:bg-orange-600 hover:text-white text-orange-600 border border-orange-300 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        >
          <PackageCheck className="w-3.5 h-3.5" />
          Importer les rayons de mes produits
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[12px] font-bold text-slate-800 uppercase tracking-wider">
            Modèles Prêts à l'Emploi
          </label>
          <span className="text-[11px] text-slate-500">8 thèmes pros</span>
        </div>

        <div className="space-y-2.5">
          {CATEGORY_PRESETS.map((preset) => {
            const isSelected = currentLayout === preset.settings.layout;
            return (
              <div
                key={preset.id}
                onClick={() => onApplyPreset(preset)}
                className={`p-3 rounded-xl border transition-all cursor-pointer relative group flex flex-col gap-2 ${
                  isSelected
                    ? "bg-orange-50/70 border-orange-400 ring-1 ring-orange-400"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{preset.name}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {preset.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Previews Thumbnails */}
                <div className="flex items-center gap-1.5 pt-1 overflow-hidden">
                  {preset.settings.categories.slice(0, 4).map((cat, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative"
                    >
                      {cat.imageUrl && (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                  <div className="text-[10px] text-slate-400 font-medium px-1">
                    +{preset.settings.categories.length} rayons
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
