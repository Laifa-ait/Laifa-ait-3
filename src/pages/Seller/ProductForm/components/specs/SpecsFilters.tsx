import React from "react";
import { useTranslation } from "react-i18next";
import { Tag, Sparkles } from "lucide-react";
import { ProductFormData } from "../../../../../types/seller";
import { CategoryStructure, DynamicFilterDef, FilterOption } from "../../../../../config/dynamicFilters";
import { getContextualAttributeGroups, ContextualAttribute } from "../../../../../config/categoryAttributes";

interface SpecsFiltersProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  DYNAMIC_CATEGORIES: Record<string, CategoryStructure>;
}

export const SpecsFilters: React.FC<SpecsFiltersProps> = ({
  formData,
  setFormData,
  DYNAMIC_CATEGORIES,
}) => {
  const { t } = useTranslation();

  const contextualGroups = getContextualAttributeGroups(
    formData.category,
    formData.subcategory,
    formData.subSubCategory,
    formData.name
  );

  const allowedFilters = DYNAMIC_CATEGORIES[formData.category]?.allowed_filters || [];

  const handleAttrChange = (id: string, value: string | number | boolean | string[]) => {
    setFormData((prev) => ({
      ...prev,
      attributes: { ...prev.attributes, [id]: value },
    }));
  };

  if (contextualGroups.length === 0 && allowedFilters.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* 1. Contextual Groups (e.g. Vestes, Manteaux, Pantalons, Chaussures, Tech, etc.) */}
      {contextualGroups.map((group) => (
        <div key={group.id} className="space-y-6 bg-[#FFFBF5] p-6 rounded-2xl border border-[#E5DED4] shadow-xs">
          <div className="border-b border-[#E5DED4]/60 pb-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C75C1A]" />
              {t(group.title)}
            </h4>
            {group.description && (
              <p className="text-xs text-slate-500 mt-0.5">{t(group.description)}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {group.attributes.map((attr: ContextualAttribute) => (
              <div key={attr.id} className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">{t(attr.label)}</label>

                {attr.type === "select" && (
                  <select
                    className="w-full px-4 py-2.5 bg-white border border-[#E5DED4] rounded-xl outline-none focus:border-[#C75C1A] transition-all font-medium text-slate-900 text-sm shadow-2xs"
                    value={String(formData.attributes?.[attr.id] || "")}
                    onChange={(e) => handleAttrChange(attr.id, e.target.value)}
                  >
                    <option value="">{t("Sélectionner...")}</option>
                    {attr.options?.map((opt) => {
                      const val = typeof opt === "string" ? opt : opt.value;
                      const lbl = typeof opt === "string" ? opt : opt.label;
                      return <option key={val} value={val}>{lbl}</option>;
                    })}
                  </select>
                )}

                {attr.type === "radio" && (
                  <div className="flex flex-wrap gap-2">
                    {attr.options?.map((opt) => {
                      const val = typeof opt === "string" ? opt : opt.value;
                      const lbl = typeof opt === "string" ? opt : opt.label;
                      const isSelected = formData.attributes?.[attr.id] === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleAttrChange(attr.id, val)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            isSelected
                              ? "bg-[#C75C1A] border-[#C75C1A] text-white shadow-xs"
                              : "bg-white border-[#E5DED4] text-slate-600 hover:border-slate-300 hover:bg-[#FFFBF5]"
                          }`}
                        >
                          {lbl}
                        </button>
                      );
                    })}
                  </div>
                )}

                {attr.type === "multiselect" && (
                  <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-1">
                    {attr.options?.map((opt) => {
                      const val = typeof opt === "string" ? opt : opt.value;
                      const lbl = typeof opt === "string" ? opt : opt.label;
                      const currentAttr = formData.attributes?.[attr.id];
                      const currentList: string[] = Array.isArray(currentAttr) ? currentAttr : [];
                      const isSelected = currentList.includes(val);
                      return (
                        <label
                          key={val}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all ${
                            isSelected ? "bg-[#C75C1A]/10 border-[#C75C1A]" : "bg-white border-[#E5DED4] hover:bg-[#FFFBF5]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="accent-[#C75C1A] w-3.5 h-3.5 cursor-pointer"
                            checked={isSelected}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...currentList, val]
                                : currentList.filter((x: string) => x !== val);
                              handleAttrChange(attr.id, updated);
                            }}
                          />
                          <span className={`text-xs font-semibold ${isSelected ? "text-[#C75C1A]" : "text-slate-700"}`}>
                            {lbl}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {attr.type === "text" && (
                  <input
                    type="text"
                    placeholder={attr.placeholder || t("Renseignez la valeur...")}
                    className="w-full px-4 py-2.5 bg-white border border-[#E5DED4] rounded-xl outline-none focus:border-[#C75C1A] transition-all font-medium text-slate-900 text-sm shadow-2xs"
                    value={String(formData.attributes?.[attr.id] || "")}
                    onChange={(e) => handleAttrChange(attr.id, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 2. Generic Allowed Filters for category (if not overridden by specific groups) */}
      {contextualGroups.length === 0 && allowedFilters.length > 0 && (
        <div className="space-y-6 bg-[#FFFBF5] p-6 rounded-2xl border border-[#E5DED4]">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-[#E5DED4]/60 pb-3">
            <Tag className="w-4 h-4 text-[#C75C1A]" />
            {t("Spécificités de la catégorie")}
          </h4>
          <div className="grid md:grid-cols-2 gap-6">
            {allowedFilters.map((filter: DynamicFilterDef) => (
              <div key={filter.id} className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">{filter.label}</label>
                {filter.type === "select" && (
                  <select
                    className="w-full px-4 py-2.5 bg-white border border-[#E5DED4] rounded-xl outline-none focus:border-[#C75C1A] transition-all font-medium text-slate-900 text-sm"
                    value={String(formData.attributes?.[filter.id] || "")}
                    onChange={(e) => handleAttrChange(filter.id, e.target.value)}
                  >
                    <option value="">{t("Sélectionner...")}</option>
                    {filter.options?.map((opt: FilterOption | string) => {
                      const val = typeof opt === "string" ? opt : opt.value;
                      const lbl = typeof opt === "string" ? opt : opt.label;
                      return <option key={val} value={val}>{lbl}</option>;
                    })}
                  </select>
                )}
                {filter.type === "text" && (
                  <input
                    type="text"
                    placeholder={filter.label}
                    className="w-full px-4 py-2.5 bg-white border border-[#E5DED4] rounded-xl outline-none focus:border-[#C75C1A] transition-all font-medium text-slate-900 text-sm"
                    value={String(formData.attributes?.[filter.id] || "")}
                    onChange={(e) => handleAttrChange(filter.id, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
