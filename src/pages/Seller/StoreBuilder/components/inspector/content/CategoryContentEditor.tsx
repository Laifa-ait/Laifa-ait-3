import React, { useState } from "react";
import { Sliders, Grid, Sparkles } from "lucide-react";
import { Product } from "../../../../../../domains/product/product.types";
import { CategoryCanvaStyleControls } from "../category/CategoryCanvaStyleControls";
import { CategoryItemListManager } from "../category/CategoryItemListManager";
import { CategoryPresetSelector } from "../category/CategoryPresetSelector";
import { CategoryPreset, CategoryItem } from "../../../constants/categoryPresets";

interface CategoryContentEditorProps {
  settings: Record<string, unknown>;
  products: Product[];
  onSettingsChange: (field: string, value: unknown) => void;
  inputClass: string;
}

export const CategoryContentEditor: React.FC<CategoryContentEditorProps> = ({
  settings,
  products,
  onSettingsChange,
  inputClass,
}) => {
  const [subTab, setSubTab] = useState<"style" | "items" | "presets">("style");

  const categories = Array.isArray(settings.categories)
    ? (settings.categories as CategoryItem[])
    : [];

  const handleApplyPreset = (preset: CategoryPreset) => {
    onSettingsChange("title", preset.settings.title);
    onSettingsChange("subtitle", preset.settings.subtitle || "");
    onSettingsChange("layout", preset.settings.layout);
    onSettingsChange("aspectRatio", preset.settings.aspectRatio);
    onSettingsChange("borderRadius", preset.settings.borderRadius);
    onSettingsChange("hoverEffect", preset.settings.hoverEffect);
    onSettingsChange("textPosition", preset.settings.textPosition);
    onSettingsChange("textTransform", preset.settings.textTransform);
    onSettingsChange("overlayOpacity", preset.settings.overlayOpacity);
    onSettingsChange("glassmorphism", preset.settings.glassmorphism);
    onSettingsChange("showBadge", preset.settings.showBadge);
    onSettingsChange("showItemCount", preset.settings.showItemCount);
    onSettingsChange("showIcon", preset.settings.showIcon);
    onSettingsChange("gapSize", preset.settings.gapSize);
    onSettingsChange("categories", preset.settings.categories);
  };

  const handleImportFromProducts = (imported: Array<Record<string, unknown>>) => {
    onSettingsChange("categories", imported);
    setSubTab("items");
  };

  return (
    <div className="space-y-4">
      {/* Global Section Heading Settings */}
      <div className="space-y-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
            Titre de la Section
          </label>
          <input
            value={String(settings.title || "")}
            onChange={(e) => onSettingsChange("title", e.target.value)}
            placeholder="Ex: Parcourir nos Rayons"
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
            Sous-titre d'accroche (Optionnel)
          </label>
          <input
            value={String(settings.subtitle || "")}
            onChange={(e) => onSettingsChange("subtitle", e.target.value)}
            placeholder="Ex: Les univers les plus demandés cette semaine"
            className={inputClass}
          />
        </div>
      </div>

      {/* Sub-tabs for Canva Experience */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setSubTab("style")}
          className={`py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
            subTab === "style" ? "bg-white text-orange-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Style Canva</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("items")}
          className={`py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
            subTab === "items" ? "bg-white text-orange-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Rayons ({categories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("presets")}
          className={`py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
            subTab === "presets" ? "bg-white text-orange-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Modèles</span>
        </button>
      </div>

      {/* Sub-tab Panes */}
      {subTab === "style" && (
        <CategoryCanvaStyleControls settings={settings} onSettingsChange={onSettingsChange} />
      )}

      {subTab === "items" && (
        <CategoryItemListManager
          categories={categories}
          onUpdateCategories={(newCats) => onSettingsChange("categories", newCats)}
          inputClass={inputClass}
        />
      )}

      {subTab === "presets" && (
        <CategoryPresetSelector
          currentLayout={String(settings.layout || "")}
          products={products}
          onApplyPreset={handleApplyPreset}
          onImportFromProducts={handleImportFromProducts}
        />
      )}
    </div>
  );
};
