import React from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Edit3, Tag } from "lucide-react";
import type { SubcategoryMap } from "../../../../types/category.types";

interface CategoryLevelColumnsProps {
  subcategories: SubcategoryMap;
  selectedSubCat: string;
  setSelectedSubCat: (val: string) => void;
  newSubCatName: string;
  setNewSubCatName: (val: string) => void;
  newSubSubCatName: string;
  setNewSubSubCatName: (val: string) => void;
  renamingSubCat: string | null;
  setRenamingSubCat: (val: string | null) => void;
  renameSubCatValue: string;
  setRenameSubCatValue: (val: string) => void;
  onAddSubCategory: () => void;
  onDeleteSubCategory: (subKey: string) => void;
  onConfirmRenameSubCategory: (oldKey: string) => void;
  onAddSubSubCategory: () => void;
  onRemoveSubSubCategory: (item: string) => void;
}

export const CategoryLevelColumns: React.FC<CategoryLevelColumnsProps> = ({
  subcategories,
  selectedSubCat,
  setSelectedSubCat,
  newSubCatName,
  setNewSubCatName,
  newSubSubCatName,
  setNewSubSubCatName,
  renamingSubCat,
  setRenamingSubCat,
  renameSubCatValue,
  setRenameSubCatValue,
  onAddSubCategory,
  onDeleteSubCategory,
  onConfirmRenameSubCategory,
  onAddSubSubCategory,
  onRemoveSubSubCategory,
}) => {
  const { t } = useTranslation();
  const subCatKeys = Object.keys(subcategories);
  const currentSubSubList = selectedSubCat ? subcategories[selectedSubCat] || [] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
      {/* Level 2: Subcategories */}
      <div className="bg-zinc-50/80 p-4 rounded-2xl border border-zinc-200/80 space-y-3">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-700">
          {t("2. Sous-catégories")} ({subCatKeys.length})
        </h4>

        <div className="flex gap-2">
          <input
            type="text"
            value={newSubCatName}
            onChange={(e) => setNewSubCatName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAddSubCategory())}
            placeholder={t("Nouvelle sous-catégorie...")}
            className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:outline-none focus:border-[#1A1836]"
          />
          <button
            type="button"
            onClick={onAddSubCategory}
            className="px-3.5 py-2 bg-[#1A1836] text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-[#42164B] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#E99856]" />
            {t("Ajouter")}
          </button>
        </div>

        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {subCatKeys.map((subKey) => {
            const isSelected = subKey === selectedSubCat;
            const isRenaming = renamingSubCat === subKey;
            return (
              <div
                key={subKey}
                onClick={() => !isRenaming && setSelectedSubCat(subKey)}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#1A1836] text-white border-[#1A1836] shadow-2xs"
                    : "bg-white text-zinc-800 border-zinc-200/80 hover:border-zinc-300"
                }`}
              >
                {isRenaming ? (
                  <input
                    type="text"
                    value={renameSubCatValue}
                    onChange={(e) => setRenameSubCatValue(e.target.value)}
                    onBlur={() => onConfirmRenameSubCategory(subKey)}
                    onKeyDown={(e) => e.key === "Enter" && onConfirmRenameSubCategory(subKey)}
                    autoFocus
                    className="flex-1 px-2 py-1 rounded bg-white text-zinc-900 text-xs font-bold outline-none"
                  />
                ) : (
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xs font-bold truncate">{subKey}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        isSelected ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {(subcategories[subKey] || []).length}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => {
                      setRenamingSubCat(subKey);
                      setRenameSubCatValue(subKey);
                    }}
                    className={`p-1 rounded hover:bg-black/10 ${
                      isSelected ? "text-zinc-200" : "text-zinc-400 hover:text-zinc-700"
                    }`}
                    title={t("Renommer")}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSubCategory(subKey)}
                    className={`p-1 rounded hover:bg-rose-500/20 ${isSelected ? "text-rose-300" : "text-rose-500"}`}
                    title={t("Supprimer")}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          {subCatKeys.length === 0 && (
            <p className="text-xs text-zinc-400 italic py-4 text-center">
              {t("Aucune sous-catégorie. Ajoutez-en une ci-dessus.")}
            </p>
          )}
        </div>
      </div>

      {/* Level 3: Sub-subcategories */}
      <div className="bg-zinc-50/80 p-4 rounded-2xl border border-zinc-200/80 space-y-3">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-700">
          {t("3. Sous-divisions de")} :{" "}
          <span className="text-[#C75C1A]">{selectedSubCat || t("Aucune sélection")}</span>
        </h4>

        <div className="flex gap-2">
          <input
            type="text"
            disabled={!selectedSubCat}
            value={newSubSubCatName}
            onChange={(e) => setNewSubSubCatName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAddSubSubCategory())}
            placeholder={
              selectedSubCat ? t("Nouvelle sous-division...") : t("Sélectionnez d'abord une sous-catégorie")
            }
            className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:outline-none focus:border-[#1A1836] disabled:bg-zinc-100"
          />
          <button
            type="button"
            disabled={!selectedSubCat}
            onClick={onAddSubSubCategory}
            className="px-3.5 py-2 bg-[#C75C1A] text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-[#a84b12] disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {t("Ajouter")}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto p-1">
          {currentSubSubList.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs font-semibold text-zinc-800 shadow-2xs"
            >
              <Tag className="w-3 h-3 text-[#C75C1A]" />
              {item}
              <button
                type="button"
                onClick={() => onRemoveSubSubCategory(item)}
                className="text-zinc-400 hover:text-rose-600 transition-colors ms-1 cursor-pointer"
                title={t("Retirer")}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
          {selectedSubCat && currentSubSubList.length === 0 && (
            <p className="text-xs text-zinc-400 italic py-4 w-full text-center">
              {t("Aucune sous-division dans cette sous-catégorie.")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
