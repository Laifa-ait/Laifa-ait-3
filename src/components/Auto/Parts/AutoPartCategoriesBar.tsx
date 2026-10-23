import React from "react";
import { AutoPartCategory } from "../../../domains/auto/autoParts.types";
import { Wrench, Shield, Lightbulb, Disc, Layers, Sofa, Car, Flame } from "lucide-react";

interface AutoPartCategoriesBarProps {
  selectedCategory?: AutoPartCategory;
  isJunkYardOnly: boolean;
  onSelectCategory: (cat?: AutoPartCategory) => void;
  onToggleJunkYard: (enabled: boolean) => void;
}

const CATEGORIES: { id: AutoPartCategory | "all"; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "all", label: "Toutes les Pièces", icon: Layers },
  { id: "moteur", label: "Moteur & Boîte", icon: Flame },
  { id: "optique", label: "Optiques & Phares", icon: Lightbulb },
  { id: "carrosserie", label: "Carrosserie", icon: Shield },
  { id: "freinage", label: "Freinage", icon: Disc },
  { id: "suspension", label: "Suspension", icon: Wrench },
  { id: "habitacle", label: "Habitacle", icon: Sofa },
  { id: "casse_depecage", label: "Casse / Dépeçage", icon: Car },
];

export const AutoPartCategoriesBar: React.FC<AutoPartCategoriesBarProps> = ({
  selectedCategory,
  isJunkYardOnly,
  onSelectCategory,
  onToggleJunkYard,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-2.5">
      {/* Scrollable categories */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = (!selectedCategory && cat.id === "all") || selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id === "all" ? undefined : (cat.id as AutoPartCategory))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? "bg-orange-600 text-white border-orange-500 shadow-sm shadow-orange-600/30"
                  : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Casse auto toggle */}
      <div className="shrink-0 flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 pl-2">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isJunkYardOnly}
            onChange={(e) => onToggleJunkYard(e.target.checked)}
            className="w-4 h-4 rounded text-orange-600 bg-slate-950 border-slate-700 focus:ring-orange-500 focus:ring-offset-slate-900 cursor-pointer"
          />
          <span className="text-xs font-bold text-slate-300">
            Casse Auto / Dépeçage DZ
          </span>
        </label>
      </div>
    </div>
  );
};
