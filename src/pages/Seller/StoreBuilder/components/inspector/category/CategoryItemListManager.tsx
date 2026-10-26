import React, { useState, useEffect } from "react";
import { Plus, Trash2, Sparkles, Check, Layers } from "lucide-react";
import { CategoryItem } from "../../../constants/categoryPresets";
import { Product } from "../../../../../../domains/product/product.types";
import { CustomPageSection } from "../../../../../../domains/seller/customPage.types";
import { CategoryItemCard } from "./CategoryItemCard";
import { QUICK_READY_CATEGORY_CARDS } from "../../../../../../components/Store/sections/category/categoryImageHelper";

interface CategoryItemListManagerProps {
  categories: CategoryItem[];
  sections?: CustomPageSection[];
  products?: Product[];
  focusedIndex?: number | null;
  onUpdateCategories: (newCategories: CategoryItem[]) => void;
  inputClass: string;
}

export const CategoryItemListManager: React.FC<CategoryItemListManagerProps> = ({
  categories,
  sections = [],
  products = [],
  focusedIndex = null,
  onUpdateCategories,
  inputClass,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  useEffect(() => {
    if (
      typeof focusedIndex === "number" &&
      focusedIndex >= 0 &&
      focusedIndex < categories.length
    ) {
      setExpandedIndex(focusedIndex);
    }
  }, [focusedIndex, categories.length]);

  const handleUpdateItem = (index: number, patch: Partial<CategoryItem>) => {
    const next = [...categories];
    next[index] = { ...next[index], ...patch };
    onUpdateCategories(next);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    onUpdateCategories(next);
    setExpandedIndex(target);
  };

  const handleAdd = () => {
    const nextNum = categories.length + 1;
    const defaultImg =
      products[nextNum - 1]?.images?.[0] || products[0]?.images?.[0] || "";
    const newItem: CategoryItem = {
      id: `cat_${Date.now()}`,
      name: `Mon Rayon #${nextNum}`,
      subtitle: "Découvrir la sélection",
      slug: `rayon-${nextNum}-${Date.now().toString().slice(-4)}`,
      imageUrl: defaultImg,
      iconName: "ShoppingBag",
      badge: "",
      badgeColor: "#023859",
      itemCount: undefined,
      productIds: [],
      colSpan: 1,
      hidden: false,
    };
    onUpdateCategories([...categories, newItem]);
    setExpandedIndex(categories.length);
  };

  const handleToggleQuickReadyCard = (
    readyCard: (typeof QUICK_READY_CATEGORY_CARDS)[number]
  ) => {
    const existingIdx = categories.findIndex(
      (c) =>
        c.slug === readyCard.slug ||
        (c.name || "").trim().toLowerCase() === readyCard.name.toLowerCase()
    );

    if (existingIdx >= 0) {
      const target = categories[existingIdx];
      handleUpdateItem(existingIdx, { hidden: !target.hidden });
      return;
    }

    if (categories.length >= 24) return;
    const newCard: CategoryItem = {
      id: `cat_ready_${readyCard.slug}_${Date.now().toString().slice(-4)}`,
      name: readyCard.name,
      subtitle: readyCard.subtitle,
      slug: readyCard.slug,
      link: `#rayon:${readyCard.slug}`,
      imageUrl: readyCard.imageUrl,
      iconName: readyCard.iconName,
      badge: readyCard.badge,
      badgeColor: readyCard.badgeColor,
      colSpan: 1,
      hidden: false,
    };
    onUpdateCategories([...categories, newCard]);
    setExpandedIndex(categories.length);
  };

  const handleClearAll = () => {
    onUpdateCategories([]);
    setExpandedIndex(null);
  };

  const handleDelete = (index: number) => {
    onUpdateCategories(categories.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const activeCount = categories.filter((c) => !c.hidden).length;

  return (
    <div className="space-y-3">
      {/* 1. Choisir quelles cartes prêtes à l'emploi utiliser */}
      <div className="p-3 bg-[#F8FBFC] border border-slate-200 rounded-xl space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#023859]" />
            <span>Choisir les cartes à utiliser</span>
          </span>
          <span className="text-[10px] font-bold text-[#023859] bg-white px-2 py-0.5 rounded-full border border-slate-200">
            {activeCount} affichée{activeCount > 1 ? "s" : ""}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 leading-snug">
          Cochez les cartes que vous souhaitez afficher dans votre vitrine ou créez les vôtres :
        </p>

        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          {QUICK_READY_CATEGORY_CARDS.map((ready) => {
            const matched = categories.find(
              (c) =>
                c.slug === ready.slug ||
                (c.name || "").trim().toLowerCase() === ready.name.toLowerCase()
            );
            const isSelected = Boolean(matched && !matched.hidden);
            return (
              <button
                key={ready.slug}
                type="button"
                onClick={() => handleToggleQuickReadyCard(ready)}
                className={`p-1.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#023859] border-[#023859] text-white shadow-2xs"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                <img
                  src={ready.imageUrl}
                  alt={ready.name}
                  className="w-7 h-7 rounded-md object-cover shrink-0 bg-slate-100"
                />
                <span className="text-[10px] font-bold leading-tight truncate flex-1">
                  {ready.name}
                </span>
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-emerald-400 text-slate-950"
                      : "bg-slate-100 text-transparent border border-slate-300"
                  }`}
                >
                  <Check className="w-2.5 h-2.5" />
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={handleAdd}
            disabled={categories.length >= 24}
            className="flex-1 h-8 rounded-lg bg-[#023859] hover:bg-[#011C40] text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs disabled:opacity-40 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Créer une carte sur-mesure</span>
          </button>
          {categories.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="h-8 px-2.5 rounded-lg bg-white hover:bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
              title="Vider toutes les cartes"
            >
              <Trash2 className="w-3 h-3" />
              <span>Vider</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Liste des cartes configurées (avec bouton Afficher / Masquer sur chaque carte) */}
      {categories.length === 0 ? (
        <div className="p-5 text-center bg-white rounded-xl border border-dashed border-slate-300 space-y-2">
          <Sparkles className="w-6 h-6 text-[#023859] mx-auto" />
          <p className="text-xs font-bold text-slate-800">Aucune carte sélectionnée</p>
          <p className="text-[11px] text-slate-500">
            Cochez l'une des cartes ci-dessus ou cliquez sur « + Créer une carte sur-mesure ».
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat, index) => (
            <CategoryItemCard
              key={cat.id || index}
              cat={cat}
              index={index}
              total={categories.length}
              isExpanded={expandedIndex === index}
              inputClass={inputClass}
              sections={sections}
              products={products}
              onToggleExpand={() =>
                setExpandedIndex(expandedIndex === index ? null : index)
              }
              onUpdate={(patch) => handleUpdateItem(index, patch)}
              onMove={(dir) => handleMove(index, dir)}
              onDelete={() => handleDelete(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
