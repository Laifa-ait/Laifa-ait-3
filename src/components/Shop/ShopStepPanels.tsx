import React from "react";
import { ArrowLeft, ChevronRight, Check, LayoutGrid } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getCategoryTranslation } from "../../utils/translations";
import { getCategoryTheme } from "../Home/categoryThemes";

interface ShopStepPanelsProps {
  displayedStep: 1 | 2 | 3;
  realCategories: string[];
  activeCategory: string;
  currentSubcategories: string[];
  currentSubSubcategories: string[];
  urlSubcategory: string | null;
  urlSubsubcategory: string | null;
  categoryHierarchy: Record<string, Record<string, string[]>>;
  onSelectCategory: (cat: string) => void;
  onSelectSubcategory: (subcat: string | null) => void;
  onSelectSubSubcategory: (subsubcat: string | null) => void;
  onStepChange: (step: 1 | 2 | 3 | null) => void;
  onCollapse: () => void;
}

export const ShopStepPanels: React.FC<ShopStepPanelsProps> = ({
  displayedStep,
  realCategories,
  activeCategory,
  currentSubcategories,
  currentSubSubcategories,
  urlSubcategory,
  urlSubsubcategory,
  categoryHierarchy,
  onSelectCategory,
  onSelectSubcategory,
  onSelectSubSubcategory,
  onStepChange,
  onCollapse,
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-4 sm:p-5">
      {displayedStep === 1 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#A54055]">Étape 1 sur 3</p>
              <h3 className="text-sm font-sans font-bold text-[#1A1836]">
                {t("Choisissez votre rayon", "Choisissez votre rayon")}
              </h3>
            </div>
            {activeCategory !== "Tous" && (
              <button
                type="button"
                onClick={() => onSelectCategory("Tous")}
                className="px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
              >
                Tout le catalogue
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2">
            {realCategories.map((cat) => {
              const theme = getCategoryTheme(cat);
              const isSelected = activeCategory === cat;
              const subCount = Object.keys(categoryHierarchy[cat] || {}).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    onSelectCategory(cat);
                    onStepChange(null);
                  }}
                  className={`group flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#1A1836] bg-[#1A1836] text-white shadow-2xs"
                      : "border-zinc-200/90 bg-white hover:border-[#1A1836]/40 text-[#1A1836]"
                  }`}
                >
                  <img
                    src={theme.defaultImage}
                    alt={cat}
                    loading="lazy"
                    className="w-11 h-11 rounded-lg object-cover shrink-0 bg-zinc-100"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-sans font-semibold text-xs sm:text-sm leading-snug truncate">
                      {getCategoryTranslation(cat, t)}
                    </p>
                    <p className={`text-[11px] truncate mt-0.5 ${isSelected ? "text-white/75" : "text-zinc-500"}`}>
                      {subCount} {subCount > 1 ? "sous-catégories" : "sous-catégorie"}
                    </p>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                      isSelected ? "text-[#E99856]" : "text-zinc-400"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {displayedStep === 2 && activeCategory !== "Tous" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onStepChange(1)}
              className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-[#1A1836] flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Rayons</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectSubcategory(null);
                onCollapse();
              }}
              className="h-8 px-3 rounded-lg bg-[#1A1836] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#E99856]" />
              <span>Tout {getCategoryTranslation(activeCategory, t)}</span>
            </button>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#A54055]">
              Étape 2 sur 3 • {getCategoryTranslation(activeCategory, t)}
            </p>
            <h3 className="text-sm font-sans font-bold text-[#1A1836]">Choisissez une sous-catégorie</h3>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {currentSubcategories.map((subcat) => {
              const isSubSelected = urlSubcategory === subcat;
              const specialties = categoryHierarchy[activeCategory]?.[subcat] || [];
              return (
                <button
                  key={subcat}
                  type="button"
                  onClick={() => {
                    onSelectSubcategory(subcat);
                    onStepChange(null);
                  }}
                  className={`group flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSubSelected
                      ? "border-[#1A1836] bg-[#1A1836] text-white shadow-2xs"
                      : "border-zinc-200 bg-white hover:border-[#1A1836]/45 text-[#1A1836]"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-sans font-semibold text-xs sm:text-sm leading-snug truncate">
                      {getCategoryTranslation(subcat, t)}
                    </p>
                    {specialties.length > 0 && (
                      <p className={`text-[11px] truncate mt-0.5 ${isSubSelected ? "text-white/75" : "text-zinc-500"}`}>
                        {specialties.slice(0, 3).join(", ")}
                      </p>
                    )}
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                      isSubSelected ? "text-[#E99856]" : "text-zinc-400"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {displayedStep === 3 && activeCategory !== "Tous" && urlSubcategory && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                onSelectSubcategory(null);
                onStepChange(2);
              }}
              className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-[#1A1836] flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sous-catégories</span>
            </button>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#A54055]">
              Étape 3 sur 3 • {getCategoryTranslation(urlSubcategory, t)}
            </p>
            <h3 className="text-sm font-sans font-bold text-[#1A1836]">Affinez par type d&apos;article</h3>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => {
                onSelectSubSubcategory(null);
                onCollapse();
              }}
              className={`flex items-center justify-between gap-2 p-3 rounded-xl border text-left text-xs sm:text-sm font-sans font-semibold transition-all cursor-pointer ${
                !urlSubsubcategory
                  ? "border-[#1A1836] bg-[#1A1836] text-white"
                  : "border-zinc-200 bg-white hover:border-zinc-400 text-[#1A1836]"
              }`}
            >
              <span className="truncate">Tout voir dans {getCategoryTranslation(urlSubcategory, t)}</span>
              {!urlSubsubcategory && <Check className="w-4 h-4 text-[#E99856] shrink-0" />}
            </button>

            {currentSubSubcategories.map((subsubcat) => {
              const isSelected = urlSubsubcategory === subsubcat;
              return (
                <button
                  key={subsubcat}
                  type="button"
                  onClick={() => {
                    onSelectSubSubcategory(subsubcat);
                    onCollapse();
                  }}
                  className={`flex items-center justify-between gap-2 p-3 rounded-xl border text-left text-xs sm:text-sm font-sans font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#1A1836] bg-[#1A1836] text-white"
                      : "border-zinc-200 bg-white hover:border-[#1A1836]/45 text-[#1A1836]"
                  }`}
                >
                  <span className="truncate">{getCategoryTranslation(subsubcat, t)}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#E99856] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
