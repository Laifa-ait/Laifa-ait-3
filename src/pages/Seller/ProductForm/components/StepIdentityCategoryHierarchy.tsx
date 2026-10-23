import React from "react";
import { useTranslation } from "react-i18next";
import { FolderTree, ChevronRight, CheckCircle2 } from "lucide-react";
import { ProductFormData } from "../../../../types/seller";
import { CategoryStructure } from "../../../../config/dynamicFilters";
import { FieldHelp } from "./FieldHelp";

interface StepIdentityCategoryHierarchyProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  categories: string[];
  DYNAMIC_CATEGORIES: Record<string, CategoryStructure>;
  subCategories: string[];
  subSubCategories: string[];
}

export const StepIdentityCategoryHierarchy: React.FC<StepIdentityCategoryHierarchyProps> = ({
  formData,
  setFormData,
  categories,
  DYNAMIC_CATEGORIES,
  subCategories,
  subSubCategories,
}) => {
  const { t } = useTranslation();

  const availableCategories = categories.length > 0 ? categories : Object.keys(DYNAMIC_CATEGORIES);
  const hasSubCategories = subCategories.length > 0;
  const hasSubSubCategories = subSubCategories.length > 0;

  return (
    <div className="bg-[#FFFBF5] p-5 rounded-2xl border border-[#E5DED4] shadow-xs space-y-4">
      {/* Header with Title and Help */}
      <div className="flex items-center justify-between border-b border-[#E5DED4]/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#C75C1A]/10 flex items-center justify-center text-[#C75C1A]">
            <FolderTree className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              {t("Classification & Arborescence (3 Niveaux)")}
              <FieldHelp text={t("product.help.category_hierarchy") || "Classez précisément votre article avec ses sous et sous-sous catégories pour maximiser sa visibilité."} />
            </h5>
            <p className="text-[11px] text-slate-500">
              {t("Sélectionnez la catégorie, la sous-catégorie et la sous-division.")}
            </p>
          </div>
        </div>

        {/* Status indicator */}
        {formData.category && (
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#C75C1A]/10 text-[#C75C1A]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {formData.subSubCategory ? t("Arborescence complète") : formData.subcategory ? t("Étape 2/3") : t("Étape 1/3")}
          </span>
        )}
      </div>

      {/* 3 Selectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Level 1: Main Category */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            {t("1. Catégorie Principale *")}
          </label>
          <select
            className="w-full px-3.5 py-2.5 bg-white border border-[#E5DED4] rounded-xl outline-none focus:border-[#C75C1A] transition-all font-medium text-xs sm:text-sm text-slate-900 shadow-2xs"
            value={formData.category || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                category: e.target.value,
                subcategory: "",
                subSubCategory: "",
              }))
            }
          >
            <option value="">{t("Sélectionner...")}</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Level 2: Subcategory */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            {t("2. Sous-catégorie")} {hasSubCategories && "*"}
          </label>
          <select
            disabled={!formData.category || !hasSubCategories}
            className="w-full px-3.5 py-2.5 bg-white border border-[#E5DED4] rounded-xl outline-none focus:border-[#C75C1A] transition-all font-medium text-xs sm:text-sm text-slate-900 shadow-2xs disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            value={formData.subcategory || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                subcategory: e.target.value,
                subSubCategory: "",
              }))
            }
          >
            <option value="">
              {!formData.category
                ? t("Choisissez d'abord une catégorie")
                : hasSubCategories
                ? t("Choisir une sous-catégorie...")
                : t("Aucune sous-catégorie")}
            </option>
            {subCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Level 3: Sub-subcategory */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            {t("3. Sous-sous-catégorie")} {hasSubSubCategories && "*"}
          </label>
          <select
            disabled={!formData.subcategory || !hasSubSubCategories}
            className="w-full px-3.5 py-2.5 bg-white border border-[#E5DED4] rounded-xl outline-none focus:border-[#C75C1A] transition-all font-medium text-xs sm:text-sm text-slate-900 shadow-2xs disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            value={formData.subSubCategory || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                subSubCategory: e.target.value,
              }))
            }
          >
            <option value="">
              {!formData.subcategory
                ? t("Choisissez d'abord une sous-catégorie")
                : hasSubSubCategories
                ? t("Choisir une sous-division...")
                : t("Aucune sous-division")}
            </option>
            {subSubCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Breadcrumb Hierarchy Badge */}
      {formData.category && (
        <div className="pt-2 border-t border-[#E5DED4]/60 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-semibold">{t("Chemin d'accès :")}</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-[#E5DED4] font-bold text-slate-800">
            {formData.category}
          </span>
          {formData.subcategory ? (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-[#E5DED4] font-bold text-[#C75C1A]">
                {formData.subcategory}
              </span>
            </>
          ) : hasSubCategories ? (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-amber-600 font-medium italic text-[11px]">
                {t("(Sélectionnez la sous-catégorie requise)")}
              </span>
            </>
          ) : null}

          {formData.subSubCategory ? (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#C75C1A] text-white font-bold shadow-2xs">
                {formData.subSubCategory}
              </span>
            </>
          ) : hasSubSubCategories && formData.subcategory ? (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-amber-600 font-medium italic text-[11px]">
                {t("(Sélectionnez la sous-sous-catégorie requise)")}
              </span>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};
