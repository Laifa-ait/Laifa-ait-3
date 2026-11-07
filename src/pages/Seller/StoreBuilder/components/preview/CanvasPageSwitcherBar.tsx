import React from "react";
import { Home, Layers, FolderOpen } from "lucide-react";
import { CategoryItem } from "../../../../../domains/seller/customPage.types";

interface CanvasPageSwitcherBarProps {
  canvasViewMode: "home" | "category" | "collection" | "custom-page";
  activeCategorySlug: string | null;
  allCategories: CategoryItem[];
  onSelectHome: () => void;
  onSelectCollection: () => void;
  onSelectCategorySlug: (slug: string | null) => void;
}

export const CanvasPageSwitcherBar: React.FC<CanvasPageSwitcherBarProps> = ({
  canvasViewMode,
  activeCategorySlug,
  allCategories,
  onSelectHome,
  onSelectCollection,
  onSelectCategorySlug,
}) => {
  return (
    <div className="bg-[#F8FBFC] text-[#011C40] px-3 py-2 flex items-center justify-between gap-2 border-b border-slate-200/90">
      <div className="inline-flex items-center bg-slate-200/70 p-0.5 rounded-lg border border-slate-200/80 shrink-0">
        <button
          type="button"
          onClick={onSelectHome}
          className={`h-7 px-2.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
            canvasViewMode === "home"
              ? "bg-[#023859] text-white shadow-2xs"
              : "text-slate-600 hover:text-[#011C40]"
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Accueil</span>
        </button>

        <button
          type="button"
          onClick={onSelectCollection}
          className={`h-7 px-2.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
            canvasViewMode === "collection" && !activeCategorySlug
              ? "bg-[#023859] text-white shadow-2xs"
              : "text-slate-600 hover:text-[#011C40]"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Catalogue</span>
        </button>
      </div>

      {allCategories.length > 0 && (
        <div className="flex items-center gap-1.5 min-w-0">
          <FolderOpen className="w-3.5 h-3.5 text-[#26658C] shrink-0 hidden sm:block" />
          <select
            aria-label="Sélectionner un rayon à prévisualiser"
            value={canvasViewMode === "category" && activeCategorySlug ? activeCategorySlug : ""}
            onChange={(e) => onSelectCategorySlug(e.target.value || null)}
            className={`h-7 pl-2.5 pr-6 rounded-lg text-[11px] font-bold border transition-all cursor-pointer outline-none max-w-[175px] sm:max-w-[220px] truncate ${
              canvasViewMode === "category" && activeCategorySlug
                ? "bg-[#023859] text-white border-[#023859]"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
            }`}
          >
            <option value="" className="bg-white text-slate-700">
              Rayon ({allCategories.length})...
            </option>
            {allCategories.map((cat) => (
              <option key={cat.id} value={cat.slug} className="bg-white text-slate-800">
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
