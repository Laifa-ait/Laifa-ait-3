import React from "react";
import { Home, Layers, FolderOpen, FileText } from "lucide-react";
import {
  CategoryItem,
  StoreCustomPageItem,
} from "../../../../../domains/seller/customPage.types";

interface CanvasPageSwitcherBarProps {
  canvasViewMode: "home" | "category" | "collection" | "custom-page";
  activeCategorySlug: string | null;
  allCategories: CategoryItem[];
  customPages?: StoreCustomPageItem[];
  activeCustomPage?: StoreCustomPageItem | null;
  onSelectHome: () => void;
  onSelectCollection: () => void;
  onSelectCategorySlug: (slug: string | null) => void;
  onSelectCustomPage?: (page: StoreCustomPageItem) => void;
}

export const CanvasPageSwitcherBar: React.FC<CanvasPageSwitcherBarProps> = ({
  canvasViewMode,
  activeCategorySlug,
  allCategories,
  customPages = [],
  activeCustomPage,
  onSelectHome,
  onSelectCollection,
  onSelectCategorySlug,
  onSelectCustomPage,
}) => {
  return (
    <div
      data-testid="canvas-page-switcher-bar"
      className="flex items-center gap-1.5 min-w-0"
    >
      <div className="flex items-center bg-[#F1F2F4] p-0.5 rounded-lg shrink-0">
        <button
          type="button"
          onClick={onSelectHome}
          className={`h-6.5 px-2.5 rounded-md text-[11.5px] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            canvasViewMode === "home"
              ? "bg-white text-slate-900 font-semibold shadow-2xs"
              : "text-slate-600 hover:text-slate-900 font-medium"
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Accueil</span>
        </button>

        <button
          type="button"
          onClick={onSelectCollection}
          className={`h-6.5 px-2.5 rounded-md text-[11.5px] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            canvasViewMode === "collection" && !activeCategorySlug
              ? "bg-white text-slate-900 font-semibold shadow-2xs"
              : "text-slate-600 hover:text-slate-900 font-medium"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Catalogue</span>
        </button>
      </div>

      {customPages.length > 0 && onSelectCustomPage && (
        <div className="flex items-center gap-1 min-w-0">
          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden lg:block" />
          <select
            aria-label="Sélectionner une page personnalisée"
            value={canvasViewMode === "custom-page" && activeCustomPage ? activeCustomPage.id : ""}
            onChange={(e) => {
              const found = customPages.find((p) => p.id === e.target.value);
              if (found) onSelectCustomPage(found);
              else onSelectHome();
            }}
            className={`h-7 pl-2 pr-5 rounded-md text-[11.5px] font-medium border transition-colors cursor-pointer outline-none max-w-[130px] truncate ${
              canvasViewMode === "custom-page" && activeCustomPage
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-[#E3E5E8] hover:border-slate-300"
            }`}
          >
            <option value="" className="bg-white text-slate-700">
              Pages ({customPages.length})
            </option>
            {customPages.map((cp) => (
              <option key={cp.id} value={cp.id} className="bg-white text-slate-800">
                {cp.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {allCategories.length > 0 && (
        <div className="flex items-center gap-1 min-w-0">
          <FolderOpen className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden lg:block" />
          <select
            aria-label="Sélectionner un rayon à prévisualiser"
            value={canvasViewMode === "category" && activeCategorySlug ? activeCategorySlug : ""}
            onChange={(e) => onSelectCategorySlug(e.target.value || null)}
            className={`h-7 pl-2 pr-5 rounded-md text-[11.5px] font-medium border transition-colors cursor-pointer outline-none max-w-[130px] sm:max-w-[160px] truncate ${
              canvasViewMode === "category" && activeCategorySlug
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-[#E3E5E8] hover:border-slate-300"
            }`}
          >
            <option value="" className="bg-white text-slate-700">
              Rayons ({allCategories.length})
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

