import React, { useState, useEffect } from "react";
import { Sliders, Grid, Sparkles } from "lucide-react";
import { CustomPageSection } from "../../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../../domains/product/product.types";
import { CategoryCanvaStyleControls } from "../category/CategoryCanvaStyleControls";
import { CategoryItemListManager } from "../category/CategoryItemListManager";
import { CategoryPresetSelector } from "../category/CategoryPresetSelector";
import { CategoryPreset, CategoryItem } from "../../../constants/categoryPresets";
import { CategorySmartSyncBar } from "../controls/CategorySmartSyncBar";
import { useStudioStore } from "../../../store/useStudioStore";

interface CategoryContentEditorProps {
  settings: Record<string, unknown>;
  sections?: CustomPageSection[];
  products: Product[];
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  inputClass: string;
}

export const CategoryContentEditor: React.FC<CategoryContentEditorProps> = ({
  settings,
  sections = [],
  products,
  onSettingsChange,
  inputClass,
}) => {
  const selectedSubElement = useStudioStore((s) => s.selectedSubElement);
  const [subTab, setSubTab] = useState<"style" | "items" | "presets">("items");
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);

  useEffect(() => {
    if (!selectedSubElement) return;
    if (selectedSubElement === "category-style") {
      setSubTab("style");
    } else if (selectedSubElement === "category-presets") {
      setSubTab("presets");
    } else if (
      selectedSubElement.startsWith("category-items") ||
      selectedSubElement.startsWith("cat-")
    ) {
      setSubTab("items");
      const rawIdx = selectedSubElement.includes(":")
        ? selectedSubElement.split(":")[1]
        : selectedSubElement.replace("cat-", "");
      const parsedIdx = parseInt(rawIdx, 10);
      if (!Number.isNaN(parsedIdx)) {
        setFocusedIndex(parsedIdx);
      }
    }
  }, [selectedSubElement]);

  const categories = Array.isArray(settings.categories)
    ? (settings.categories as CategoryItem[])
    : [];

  const handleApplyPreset = (preset: CategoryPreset, keepExistingItems: boolean) => {
    const patch: Record<string, unknown> = {
      layout: preset.settings.layout,
      aspectRatio: preset.settings.aspectRatio,
      borderRadius: preset.settings.borderRadius,
      hoverEffect: preset.settings.hoverEffect,
      textPosition: preset.settings.textPosition,
      textTransform: preset.settings.textTransform,
      overlayOpacity: preset.settings.overlayOpacity,
      glassmorphism: preset.settings.glassmorphism,
      showBadge: preset.settings.showBadge,
      showItemCount: preset.settings.showItemCount,
      showIcon: preset.settings.showIcon,
      gapSize: preset.settings.gapSize,
    };

    if (!keepExistingItems || categories.length === 0) {
      patch.title = preset.settings.title;
      patch.subtitle = preset.settings.subtitle || "";
      patch.categories = preset.settings.categories;
    }

    onSettingsChange(patch);
  };

  const handleImportFromProducts = (imported: Array<Record<string, unknown>>) => {
    onSettingsChange("categories", imported);
    setSubTab("items");
    setFocusedIndex(0);
  };

  return (
    <div className="space-y-4 select-none">
      {/* Smart Sync & Diagnostics Bar */}
      <CategorySmartSyncBar
        categories={categories}
        products={products}
        onSyncCategories={(synced) => {
          onSettingsChange("categories", synced);
          setSubTab("items");
          setFocusedIndex(0);
        }}
      />

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

      {/* Sub-tabs: 1. Mes Rayons (Default), 2. Style & Grille, 3. Modèles */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setSubTab("items")}
          className={`py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
            subTab === "items"
              ? "bg-[#023859] text-white shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Mes Rayons ({categories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("style")}
          className={`py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
            subTab === "style"
              ? "bg-[#023859] text-white shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Style & Grille</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("presets")}
          className={`py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
            subTab === "presets"
              ? "bg-[#023859] text-white shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Modèles</span>
        </button>
      </div>

      {/* Sub-tab Panes */}
      {subTab === "items" && (
        <CategoryItemListManager
          categories={categories}
          sections={sections}
          products={products}
          focusedIndex={focusedIndex}
          onUpdateCategories={(newCats) => onSettingsChange("categories", newCats)}
          inputClass={inputClass}
        />
      )}

      {subTab === "style" && (
        <CategoryCanvaStyleControls
          settings={settings}
          onSettingsChange={(f, v) => onSettingsChange(f, v)}
        />
      )}

      {subTab === "presets" && (
        <CategoryPresetSelector
          currentLayout={String(settings.layout || "")}
          products={products}
          hasExistingCategories={categories.length > 0}
          onApplyPreset={handleApplyPreset}
          onImportFromProducts={handleImportFromProducts}
        />
      )}
    </div>
  );
};
