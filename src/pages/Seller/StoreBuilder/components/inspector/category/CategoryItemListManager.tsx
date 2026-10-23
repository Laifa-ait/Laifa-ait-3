import React, { useState } from "react";
import { Plus } from "lucide-react";
import { CategoryItem } from "../../../constants/categoryPresets";
import { CategoryItemCard } from "./CategoryItemCard";

interface CategoryItemListManagerProps {
  categories: CategoryItem[];
  onUpdateCategories: (newCategories: CategoryItem[]) => void;
  inputClass: string;
}

export const CategoryItemListManager: React.FC<CategoryItemListManagerProps> = ({
  categories,
  onUpdateCategories,
  inputClass,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

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
    const newItem: CategoryItem = {
      id: `cat_${Date.now()}`,
      name: "Nouveau Rayon",
      subtitle: "Sous-titre accrocheur",
      slug: `rayon-${Date.now()}`,
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
      iconName: "ShoppingBag",
      badge: "Nouveau",
      badgeColor: "#F97316",
      itemCount: 12,
      colSpan: 1,
    };
    onUpdateCategories([...categories, newItem]);
    setExpandedIndex(categories.length);
  };

  const handleDelete = (index: number) => {
    onUpdateCategories(categories.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[12px] font-bold text-slate-800 uppercase tracking-wider">
          Rayons Actifs ({categories.length}/12)
        </label>
        <button
          type="button"
          onClick={handleAdd}
          disabled={categories.length >= 12}
          className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 disabled:opacity-40 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Ajouter un rayon
        </button>
      </div>

      <div className="space-y-2">
        {categories.map((cat, index) => (
          <CategoryItemCard
            key={cat.id || index}
            cat={cat}
            index={index}
            total={categories.length}
            isExpanded={expandedIndex === index}
            inputClass={inputClass}
            onToggleExpand={() => setExpandedIndex(expandedIndex === index ? null : index)}
            onUpdate={(patch) => handleUpdateItem(index, patch)}
            onMove={(dir) => handleMove(index, dir)}
            onDelete={() => handleDelete(index)}
          />
        ))}
      </div>
    </div>
  );
};
