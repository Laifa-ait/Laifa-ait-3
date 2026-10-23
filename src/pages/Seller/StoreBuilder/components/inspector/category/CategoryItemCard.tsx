import React from "react";
import {
  Trash2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Tag,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { CATEGORY_ICON_CATALOG, getLucideCategoryIcon } from "../../../constants/categoryCanvaOptions";
import { CategoryItem } from "../../../constants/categoryPresets";

interface CategoryItemCardProps {
  cat: CategoryItem;
  index: number;
  total: number;
  isExpanded: boolean;
  inputClass: string;
  onToggleExpand: () => void;
  onUpdate: (patch: Partial<CategoryItem>) => void;
  onMove: (direction: "up" | "down") => void;
  onDelete: () => void;
}

const BADGE_COLORS = [
  { label: "Orange", hex: "#F97316" },
  { label: "Vert", hex: "#10B981" },
  { label: "Bleu", hex: "#3B82F6" },
  { label: "Rouge", hex: "#EF4444" },
  { label: "Violet", hex: "#8B5CF6" },
  { label: "Ambre", hex: "#F59E0B" },
];

export const CategoryItemCard: React.FC<CategoryItemCardProps> = ({
  cat,
  index,
  total,
  isExpanded,
  inputClass,
  onToggleExpand,
  onUpdate,
  onMove,
  onDelete,
}) => {
  const IconComp = getLucideCategoryIcon(cat.iconName);

  return (
    <div
      className={`rounded-xl border transition-all ${
        isExpanded ? "border-orange-400 bg-white shadow-sm ring-1 ring-orange-200" : "border-slate-200 bg-white"
      }`}
    >
      {/* Header Bar */}
      <div
        className="p-2.5 flex items-center justify-between gap-2 cursor-pointer select-none"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
            {cat.imageUrl ? (
              <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
            ) : (
              <IconComp className="w-4 h-4 text-slate-500" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 block truncate">{cat.name || "Sans nom"}</span>
            <span className="text-[10px] text-slate-500 truncate block">
              {cat.subtitle || `${cat.itemCount ?? 0} articles`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove("up")}
            className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
            title="Monter"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => onMove("down")}
            className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
            title="Descendre"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded text-red-400 hover:text-red-600 cursor-pointer"
            title="Supprimer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div className="p-1 text-slate-400">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Edit Form */}
      {isExpanded && (
        <div className="p-3 pt-0 border-t border-slate-100 space-y-3 mt-1 bg-slate-50/50 rounded-b-xl">
          <div className="space-y-1 pt-2">
            <label className="text-[11px] font-semibold text-slate-700 block">Nom du rayon</label>
            <input
              value={cat.name || ""}
              onChange={(e) =>
                onUpdate({
                  name: e.target.value,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                })
              }
              placeholder="Ex: Robes & Caftans"
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 block">Sous-titre / Accroche</label>
            <input
              value={cat.subtitle || ""}
              onChange={(e) => onUpdate({ subtitle: e.target.value })}
              placeholder="Ex: Nouvelle collection 2026"
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-orange-500" />
              <span>URL de la photo</span>
            </label>
            <input
              type="url"
              value={cat.imageUrl || ""}
              onChange={(e) => onUpdate({ imageUrl: e.target.value })}
              placeholder="https://..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                <Tag className="w-3 h-3 text-orange-500" />
                <span>Badge promo</span>
              </label>
              <input
                value={cat.badge || ""}
                onChange={(e) => onUpdate({ badge: e.target.value })}
                placeholder="Ex: Tendance, -30%"
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 block">Couleur du badge</label>
              <div className="flex items-center gap-1.5 pt-1.5">
                {BADGE_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => onUpdate({ badgeColor: col.hex })}
                    style={{ backgroundColor: col.hex }}
                    className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                      cat.badgeColor === col.hex ? "scale-110 ring-2 ring-slate-900 shadow-xs" : "opacity-80"
                    }`}
                    title={col.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 block">Icône associée</label>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-white border border-slate-200 rounded-lg">
              {CATEGORY_ICON_CATALOG.map((item) => {
                const ItemIcon = item.icon;
                const isIconActive = cat.iconName === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => onUpdate({ iconName: item.name })}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      isIconActive
                        ? "bg-orange-500 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                    title={item.name}
                  >
                    <ItemIcon className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-700 font-medium">Largeur Hero (Bento 2 colonnes)</span>
            <button
              type="button"
              onClick={() => onUpdate({ colSpan: cat.colSpan === 2 ? 1 : 2 })}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                cat.colSpan === 2
                  ? "bg-orange-500 border-orange-500 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat.colSpan === 2 ? "Grand Format (2 col)" : "Normal (1 col)"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
