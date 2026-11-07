import React from "react";
import {
  Trash2,
  ChevronDown,
  ChevronUp,
  Tag,
  ArrowUp,
  ArrowDown,
  Hash,
  Eye,
  EyeOff,
  Focus,
} from "lucide-react";
import { CATEGORY_ICON_CATALOG } from "../../../constants/categoryCanvaOptions";
import { CategoryItem } from "../../../constants/categoryPresets";
import { Product } from "../../../../../../domains/product/product.types";
import { CustomPageSection } from "../../../../../../domains/seller/customPage.types";
import { CategoryProductAssigner } from "./CategoryProductAssigner";
import { StudioImagePicker } from "../content/StudioImagePicker";
import { SmartLinkPicker } from "../controls/SmartLinkPicker";
import {
  countMatchingProductsForCategory,
  QUICK_CATEGORY_BADGES,
  slugifyCategoryName,
} from "../controls/CategorySmartSyncBar";
import {
  resolveCategoryPhoto,
  handleCategoryImageError,
} from "../../../../../../components/Store/sections/category/categoryImageHelper";

interface CategoryItemCardProps {
  cat: CategoryItem;
  index: number;
  total: number;
  isExpanded: boolean;
  inputClass: string;
  sections?: CustomPageSection[];
  products?: Product[];
  onToggleExpand: () => void;
  onUpdate: (patch: Partial<CategoryItem>) => void;
  onMove: (direction: "up" | "down") => void;
  onDelete: () => void;
}

const BADGE_COLORS = [
  { label: "Bleu Olmart", hex: "#023859" },
  { label: "Vert", hex: "#10B981" },
  { label: "Azurin", hex: "#2563EB" },
  { label: "Rouge", hex: "#E11D48" },
  { label: "Violet", hex: "#8B5CF6" },
  { label: "Or", hex: "#D97706" },
];

export const CategoryItemCard: React.FC<CategoryItemCardProps> = ({
  cat,
  index,
  total,
  isExpanded,
  inputClass,
  sections = [],
  products = [],
  onToggleExpand,
  onUpdate,
  onMove,
  onDelete,
}) => {
  const matchingCount = countMatchingProductsForCategory(cat, products);
  const resolvedThumb = resolveCategoryPhoto(cat, index);
  const isVisible = !cat.hidden;
  const currentPos = cat.imagePosition || "center";
  const currentFit = cat.imageFit || "cover";

  return (
    <div
      className={`rounded-xl border transition-all ${
        !isVisible ? "border-slate-200 bg-slate-50/70 opacity-65" : isExpanded ? "border-[#023859] bg-white shadow-sm ring-1 ring-[#023859]/15" : "border-slate-200 bg-white"
      }`}
    >
      <div className="p-2.5 flex items-center justify-between gap-2 cursor-pointer select-none" onClick={onToggleExpand}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative">
            <img src={resolvedThumb} alt={cat.name} onError={(e) => handleCategoryImageError(e, index)} className="w-full h-full object-cover" />
            <span className="absolute bottom-0 right-0 bg-slate-900/80 text-white text-[9px] font-bold px-1 rounded-tl">#{index + 1}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-900 truncate">{cat.name || `Carte #${index + 1}`}</span>
              {cat.badge && (
                <span style={{ backgroundColor: cat.badgeColor || "#023859" }} className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white leading-none">
                  {cat.badge}
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border ${isVisible ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                {isVisible ? "Carte affichée" : "Masquée"}
              </span>
              {matchingCount > 0 && <span className="text-[10px] font-semibold text-slate-500">• {matchingCount} prod.</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onUpdate({ hidden: !cat.hidden })}
            className={`px-2 py-1 rounded-md text-[10px] font-bold border flex items-center gap-1 cursor-pointer transition-colors ${isVisible ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100" : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200"}`}
          >
            {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>
          <button type="button" disabled={index === 0} onClick={() => onMove("up")} className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"><ArrowUp className="w-3.5 h-3.5" /></button>
          <button type="button" disabled={index === total - 1} onClick={() => onMove("down")} className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"><ArrowDown className="w-3.5 h-3.5" /></button>
          <button type="button" onClick={onDelete} className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
          <div className="p-1 text-slate-500" onClick={onToggleExpand}>{isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 pt-2 border-t border-slate-100 space-y-3 bg-slate-50/60 rounded-b-xl">
          <StudioImagePicker label={`Photo de la Carte #${index + 1}`} value={cat.imageUrl || resolvedThumb} onChange={(newUrl) => onUpdate({ imageUrl: newUrl })} products={products} compact />

          <div className="p-2 rounded-lg bg-white border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1"><Focus className="w-3 h-3 text-[#023859]" />Cadrage de cette photo (Mobile / PC)</span>
              <div className="inline-flex rounded border border-slate-200 p-0.5 bg-slate-50">
                {(["cover", "contain"] as const).map((fit) => (
                  <button key={fit} type="button" onClick={() => onUpdate({ imageFit: fit })} className={`px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer ${currentFit === fit ? "bg-[#023859] text-white" : "text-slate-600"}`}>
                    {fit === "cover" ? "Remplir" : "Entier"}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {([{ id: "top", label: "Haut" }, { id: "center", label: "Centre" }, { id: "bottom", label: "Bas" }] as const).map((pos) => (
                <button key={pos.id} type="button" onClick={() => onUpdate({ imagePosition: pos.id })} className={`py-1 rounded border text-[10px] font-bold cursor-pointer ${currentPos === pos.id ? "bg-[#F0F7FA] border-[#023859] text-[#011C40]" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
                  Focus {pos.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-700 block">
              Nom du rayon
              <input value={cat.name || ""} onChange={(e) => onUpdate({ name: e.target.value, slug: slugifyCategoryName(e.target.value, index + 1) })} placeholder="Ex: Beauté & Santé, Smartphones..." className={`${inputClass} mt-1`} />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[11px] font-semibold text-slate-700 block">
                Sous-titre
                <input value={cat.subtitle || ""} onChange={(e) => onUpdate({ subtitle: e.target.value })} placeholder="Ex: Nouvelle collection" className={`${inputClass} mt-1`} />
              </label>
              <label className="text-[11px] font-semibold text-slate-700 block">
                <span className="flex items-center gap-1"><Hash className="w-3 h-3 text-[#023859]" /><span>Nb. articles</span></span>
                <input type="number" min={0} value={cat.itemCount ?? ""} onChange={(e) => onUpdate({ itemCount: e.target.value === "" ? undefined : Number(e.target.value) })} placeholder="Auto" className={`${inputClass} mt-1`} />
              </label>
            </div>
          </div>

          <SmartLinkPicker label={`Lien cible de la Carte #${index + 1}`} value={cat.link || `#rayon:${cat.slug || `rayon-${index + 1}`}`} onChange={(href) => onUpdate({ link: href })} products={products} sections={sections} />

          <div className="space-y-1.5 p-2.5 rounded-lg bg-white border border-slate-200">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1"><Tag className="w-3 h-3 text-[#023859]" /><span>Badge commercial</span></span>
            <div className="flex flex-wrap gap-1">
              {QUICK_CATEGORY_BADGES.map((presetBadge) => {
                const isNone = presetBadge === "Aucun";
                const isSelected = isNone ? !cat.badge : cat.badge === presetBadge;
                return (
                  <button key={presetBadge} type="button" onClick={() => onUpdate({ badge: isNone ? "" : presetBadge })} className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${isSelected ? "bg-[#023859] border-[#023859] text-white" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"}`}>
                    {presetBadge}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                {BADGE_COLORS.map((col) => (
                  <button key={col.hex} type="button" onClick={() => onUpdate({ badgeColor: col.hex })} style={{ backgroundColor: col.hex }} className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${cat.badgeColor === col.hex ? "scale-115 ring-2 ring-slate-900" : "opacity-80"}`} title={col.label} />
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {CATEGORY_ICON_CATALOG.slice(0, 5).map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <button key={item.name} type="button" onClick={() => onUpdate({ iconName: item.name })} className={`p-1 rounded cursor-pointer ${cat.iconName === item.name ? "bg-[#023859] text-white" : "text-slate-500 hover:bg-slate-100"}`} title={item.name}>
                      <ItemIcon className="w-3 h-3" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <CategoryProductAssigner cat={cat} products={products} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  );
};
