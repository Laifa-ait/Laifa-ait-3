import React, { useState, useEffect } from "react";
import { ChevronRight, Check, RotateCcw, SlidersHorizontal, Layers, X, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { getCategoryTranslation } from "../../utils/translations";
import { Breadcrumbs } from "../Layout/Breadcrumbs";
import { ShopStepPanels } from "./ShopStepPanels";

interface BreadcrumbItem {
  label: string;
  link: string;
}

interface ShopStepNavigatorProps {
  categories: string[];
  activeCategory: string;
  currentSubcategories: string[];
  currentSubSubcategories: string[];
  urlSubcategory: string | null;
  urlSubsubcategory: string | null;
  categoryHierarchy: Record<string, Record<string, string[]>>;
  breadcrumbItems: BreadcrumbItem[];
  showFilters: boolean;
  isFiltered: boolean;
  onToggleFilters: () => void;
  onSelectCategory: (cat: string) => void;
  onSelectSubcategory: (subcat: string | null) => void;
  onSelectSubSubcategory: (subsubcat: string | null) => void;
  onResetAll: () => void;
}

export const ShopStepNavigator: React.FC<ShopStepNavigatorProps> = ({
  categories,
  activeCategory,
  currentSubcategories,
  currentSubSubcategories,
  urlSubcategory,
  urlSubsubcategory,
  categoryHierarchy,
  breadcrumbItems,
  showFilters,
  isFiltered,
  onToggleFilters,
  onSelectCategory,
  onSelectSubcategory,
  onSelectSubSubcategory,
  onResetAll,
}) => {
  const { t } = useTranslation();
  const computedStep: 1 | 2 | 3 = activeCategory === "Tous" ? 1 : !urlSubcategory ? 2 : 3;
  const [manualStep, setManualStep] = useState<1 | 2 | 3 | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    setManualStep(null);
  }, [activeCategory, urlSubcategory, urlSubsubcategory]);

  const displayedStep: 1 | 2 | 3 = manualStep ?? computedStep;
  const realCategories = categories.filter((c) => c !== "Tous");

  const activeSummaryLabel = urlSubsubcategory
    ? `${getCategoryTranslation(activeCategory, t)} · ${getCategoryTranslation(urlSubcategory || "", t)} · ${getCategoryTranslation(urlSubsubcategory, t)}`
    : urlSubcategory
      ? `${getCategoryTranslation(activeCategory, t)} · ${getCategoryTranslation(urlSubcategory, t)}`
      : activeCategory !== "Tous"
        ? getCategoryTranslation(activeCategory, t)
        : t("Tous les rayons", "Tous les rayons");

  return (
    <>
      <div className="border-b border-[#e8e2da] bg-[#fbfaf8] text-zinc-900">
        <div className="mx-auto max-w-[90rem] px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 [&_nav]:p-0 [&_nav]:max-w-none [&_ol]:text-zinc-400 [&_a]:text-zinc-500 [&_a:hover]:text-zinc-950 [&_span]:text-zinc-900 [&_li]:text-zinc-400 text-xs">
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="group h-10 pl-3.5 pr-4 rounded-xl bg-[#1A1836] hover:bg-[#252249] text-white text-xs font-semibold flex items-center gap-2.5 shadow-2xs transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-[#E99856] shrink-0" />
              <span className="truncate max-w-[180px] sm:max-w-[260px]">{activeSummaryLabel}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/15 text-[10px] font-mono text-[#E99856]">
                {activeCategory === "Tous" ? "1/3" : !urlSubcategory ? "2/3" : "3/3"}
              </span>
            </button>

            {activeCategory !== "Tous" && (
              <button
                type="button"
                onClick={onResetAll}
                title={t("Réinitialiser", "Réinitialiser")}
                className="h-10 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{t("Tout voir", "Tout voir")}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onToggleFilters}
              className={`h-10 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                showFilters ? "bg-[#1A1836] text-white" : "bg-white hover:bg-zinc-50 text-[#1A1836] border border-zinc-200"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
              <span>{t("filter_filters", "Filtres")}</span>
              {isFiltered && (
                <span className="px-1.5 py-0.5 rounded-md bg-[#E99856] text-[#12111A] text-[10px] font-bold">
                  Actif
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs z-[130]"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 right-0 z-[140] w-full max-w-[430px] bg-[#fbfaf8] border-l border-[#e5dfd6] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="px-5 py-4 bg-white border-b border-[#ece6de] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#1A1836] text-[#E99856] flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-sans font-bold text-[#1A1836] truncate">Navigation par étapes</h2>
                    <p className="text-[11px] text-zinc-500 truncate">Choisissez votre rayon en 3 clics</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-600 cursor-pointer"
                  aria-label="Fermer le tiroir"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-5 py-3 bg-[#f4f1ea] border-b border-[#e8e1d7] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setManualStep(1)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
                    displayedStep === 1 ? "bg-[#1A1836] text-white" : "bg-white text-[#1A1836] border border-zinc-200"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-[#E99856] text-[#12111A] flex items-center justify-center text-[10px] font-bold">
                    {activeCategory !== "Tous" ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : "1"}
                  </span>
                  <span className="truncate max-w-[95px]">
                    {activeCategory === "Tous" ? "Rayon" : getCategoryTranslation(activeCategory, t)}
                  </span>
                </button>

                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />

                <button
                  type="button"
                  disabled={activeCategory === "Tous"}
                  onClick={() => setManualStep(2)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all shrink-0 ${
                    activeCategory === "Tous"
                      ? "opacity-40 cursor-not-allowed text-zinc-400"
                      : displayedStep === 2
                        ? "bg-[#1A1836] text-white cursor-pointer"
                        : "bg-white text-[#1A1836] border border-zinc-200 cursor-pointer"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center text-[10px] font-bold">
                    {urlSubcategory ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : "2"}
                  </span>
                  <span className="truncate max-w-[95px]">
                    {urlSubcategory ? getCategoryTranslation(urlSubcategory, t) : "Sous-cat."}
                  </span>
                </button>

                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />

                <button
                  type="button"
                  disabled={!urlSubcategory || currentSubSubcategories.length === 0}
                  onClick={() => setManualStep(3)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all shrink-0 ${
                    !urlSubcategory || currentSubSubcategories.length === 0
                      ? "opacity-40 cursor-not-allowed text-zinc-400"
                      : displayedStep === 3
                        ? "bg-[#1A1836] text-white cursor-pointer"
                        : "bg-white text-[#1A1836] border border-zinc-200 cursor-pointer"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center text-[10px] font-bold">
                    {urlSubsubcategory ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : "3"}
                  </span>
                  <span className="truncate max-w-[95px]">
                    {urlSubsubcategory ? getCategoryTranslation(urlSubsubcategory, t) : "Article"}
                  </span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <ShopStepPanels
                  displayedStep={displayedStep}
                  realCategories={realCategories}
                  activeCategory={activeCategory}
                  currentSubcategories={currentSubcategories}
                  currentSubSubcategories={currentSubSubcategories}
                  urlSubcategory={urlSubcategory}
                  urlSubsubcategory={urlSubsubcategory}
                  categoryHierarchy={categoryHierarchy}
                  onSelectCategory={(cat) => {
                    onSelectCategory(cat);
                    if (cat === "Tous") setIsDrawerOpen(false);
                  }}
                  onSelectSubcategory={(subcat) => {
                    onSelectSubcategory(subcat);
                    const subSubList = subcat ? categoryHierarchy[activeCategory]?.[subcat] || [] : [];
                    if (!subcat || subSubList.length === 0) setIsDrawerOpen(false);
                  }}
                  onSelectSubSubcategory={(subsubcat) => {
                    onSelectSubSubcategory(subsubcat);
                    setIsDrawerOpen(false);
                  }}
                  onStepChange={setManualStep}
                  onCollapse={() => setIsDrawerOpen(false)}
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
