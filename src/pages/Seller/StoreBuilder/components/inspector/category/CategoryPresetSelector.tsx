import React, { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp, Wand2 } from "lucide-react";
import { CATEGORY_PRESETS, CategoryPreset } from "../../../constants/categoryPresets";
import { DEFAULT_MODERN_THEME, STUDIO_MEDIA_ASSETS } from "../../../constants/studioThemeDefaults";
import { Product } from "../../../../../../domains/product/product.types";

interface CategoryPresetSelectorProps {
  currentLayout: string;
  activePresetId?: string;
  products: Product[];
  hasExistingCategories?: boolean;
  onApplyPreset: (preset: CategoryPreset, keepExistingItems: boolean) => void;
  onImportFromProducts: (categories: Array<Record<string, unknown>>) => void;
}

const DEFAULT_VISIBLE_COUNT = 5;

export const CategoryPresetSelector: React.FC<CategoryPresetSelectorProps> = ({
  currentLayout,
  activePresetId,
  products,
  hasExistingCategories = true,
  onApplyPreset,
  onImportFromProducts,
}) => {
  const [keepMyRayons, setKeepMyRayons] = useState<boolean>(hasExistingCategories);
  const [showAllPresets, setShowAllPresets] = useState<boolean>(false);

  const fallbackPresetId = CATEGORY_PRESETS.find((p) => p.settings.layout === currentLayout)?.id;
  const resolvedActivePresetId = activePresetId || fallbackPresetId;

  const visiblePresets = useMemo(() => {
    if (showAllPresets) return CATEGORY_PRESETS;
    const base = CATEGORY_PRESETS.slice(0, DEFAULT_VISIBLE_COUNT);
    if (resolvedActivePresetId && !base.some((p) => p.id === resolvedActivePresetId)) {
      const activePreset = CATEGORY_PRESETS.find((p) => p.id === resolvedActivePresetId);
      if (activePreset) return [activePreset, ...base.slice(0, DEFAULT_VISIBLE_COUNT - 1)];
    }
    return base;
  }, [showAllPresets, resolvedActivePresetId]);

  const hiddenCount = Math.max(0, CATEGORY_PRESETS.length - visiblePresets.length);

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
        imageUrl: item.imageUrl || STUDIO_MEDIA_ASSETS.fashion,
        iconName: "ShoppingBag",
        badge: idx === 0 ? "Populaire" : "",
        badgeColor: DEFAULT_MODERN_THEME.accentColor,
        itemCount: item.count,
        productIds: item.productIds,
        colSpan: idx === 0 ? 2 : 1,
      }));

    if (generated.length > 0) {
      onImportFromProducts(generated);
    }
  };

  return (
    <div className="space-y-3">
      {/* Slim catalog sync utility when products exist */}
      {products.length > 0 && (
        <button
          type="button"
          onClick={handleSmartExtractFromProducts}
          className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-left transition-colors flex items-center justify-between gap-2 cursor-pointer"
        >
          <span className="flex items-center gap-2 text-xs font-medium text-slate-900 truncate">
            <Wand2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">Générer les rayons depuis mes produits</span>
          </span>
          <span className="text-[11px] font-medium text-slate-500 tabular-nums shrink-0">
            {products.length}
          </span>
        </button>
      )}

      {/* Clean header with inline preservation toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 px-0.5">
          <span className="text-xs font-semibold text-slate-900">
            Packs de style
          </span>
          <label className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={keepMyRayons}
              onChange={(e) => setKeepMyRayons(e.target.checked)}
              className="w-3.5 h-3.5 accent-slate-900 rounded cursor-pointer"
            />
            <span>Conserver mes rayons</span>
          </label>
        </div>

        {/* Single unified list of click-to-apply style packs */}
        <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
          {visiblePresets.map((preset) => {
            const isSelected = resolvedActivePresetId === preset.id;
            return (
              <div
                key={preset.id}
                className={`transition-colors ${
                  isSelected ? "bg-slate-50/90" : "bg-white hover:bg-slate-50/60"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onApplyPreset(preset, keepMyRayons)}
                  className="w-full px-3 py-2.5 text-left flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {preset.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      <span>{preset.tag}</span>
                      <span aria-hidden="true" className="mx-1.5 opacity-50">·</span>
                      <span>{preset.description}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-slate-900 shrink-0" aria-label="Style actif" />
                  )}
                </button>

                {isSelected && keepMyRayons && (
                  <div className="px-3 pb-2.5 -mt-0.5">
                    <button
                      type="button"
                      onClick={() => onApplyPreset(preset, false)}
                      className="text-[11px] font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2 cursor-pointer transition-colors"
                    >
                      Charger les {preset.settings.categories.length} rayons d&apos;exemple
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {CATEGORY_PRESETS.length > DEFAULT_VISIBLE_COUNT && (
            <button
              type="button"
              onClick={() => setShowAllPresets((prev) => !prev)}
              className="w-full py-2 px-3 bg-slate-50/60 hover:bg-slate-100/80 text-[11px] font-medium text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {showAllPresets ? (
                <>
                  <span>Réduire la liste</span>
                  <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                </>
              ) : (
                <>
                  <span>Afficher les {hiddenCount} autres packs</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
