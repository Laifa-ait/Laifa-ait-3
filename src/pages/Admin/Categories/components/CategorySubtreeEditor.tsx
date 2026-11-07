import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FolderTree, Trash2, Save, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi, CategoryItem } from "../../../../services/api/admin.api";
import type { SubcategoryMap } from "../../../../types/category.types";
import { CategoryLevelColumns } from "./CategoryLevelColumns";

interface CategorySubtreeEditorProps {
  category: CategoryItem;
  onSaved: () => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export const CategorySubtreeEditor: React.FC<CategorySubtreeEditorProps> = ({
  category,
  onSaved,
  onDeleteCategory,
}) => {
  const { t } = useTranslation();
  const [editedName, setEditedName] = useState(category.name || category.id);
  const [isActive, setIsActive] = useState(category.isActive !== false);
  const [subcategories, setSubcategories] = useState<SubcategoryMap>(category.subcategories || {});
  const [selectedSubCat, setSelectedSubCat] = useState<string>("");
  const [newSubCatName, setNewSubCatName] = useState("");
  const [newSubSubCatName, setNewSubSubCatName] = useState("");
  const [renamingSubCat, setRenamingSubCat] = useState<string | null>(null);
  const [renameSubCatValue, setRenameSubCatValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEditedName(category.name || category.id);
    setIsActive(category.isActive !== false);
    const initialSubs = category.subcategories || {};
    setSubcategories(initialSubs);
    setSelectedSubCat(Object.keys(initialSubs)[0] || "");
    setRenamingSubCat(null);
  }, [category]);

  const subCatKeys = Object.keys(subcategories);

  const handleAddSubCategory = () => {
    const trimmed = newSubCatName.trim();
    if (!trimmed) return;
    if (subcategories[trimmed]) {
      toast.error(t("Cette sous-catégorie existe déjà."));
      return;
    }
    setSubcategories((prev) => ({ ...prev, [trimmed]: [] }));
    setSelectedSubCat(trimmed);
    setNewSubCatName("");
  };

  const handleDeleteSubCategory = (subKey: string) => {
    setSubcategories((prev) => {
      const next = { ...prev };
      delete next[subKey];
      return next;
    });
    if (selectedSubCat === subKey) {
      const remaining = subCatKeys.filter((k) => k !== subKey);
      setSelectedSubCat(remaining[0] || "");
    }
  };

  const handleConfirmRenameSubCategory = (oldKey: string) => {
    const nextKey = renameSubCatValue.trim();
    if (!nextKey || nextKey === oldKey) {
      setRenamingSubCat(null);
      return;
    }
    setSubcategories((prev) => {
      const next: SubcategoryMap = {};
      Object.entries(prev).forEach(([k, v]) => {
        if (k === oldKey) next[nextKey] = v;
        else next[k] = v;
      });
      return next;
    });
    if (selectedSubCat === oldKey) setSelectedSubCat(nextKey);
    setRenamingSubCat(null);
  };

  const handleAddSubSubCategory = () => {
    if (!selectedSubCat) return;
    const trimmed = newSubSubCatName.trim();
    if (!trimmed) return;
    const existing = subcategories[selectedSubCat] || [];
    if (existing.includes(trimmed)) {
      toast.error(t("Cette sous-division existe déjà."));
      return;
    }
    setSubcategories((prev) => ({
      ...prev,
      [selectedSubCat]: [...(prev[selectedSubCat] || []), trimmed],
    }));
    setNewSubSubCatName("");
  };

  const handleRemoveSubSubCategory = (itemToRemove: string) => {
    if (!selectedSubCat) return;
    setSubcategories((prev) => ({
      ...prev,
      [selectedSubCat]: (prev[selectedSubCat] || []).filter((item) => item !== itemToRemove),
    }));
  };

  const handleSaveCategoryChanges = async () => {
    const trimmedName = editedName.trim();
    if (!trimmedName) {
      toast.error(t("Le nom de la catégorie ne peut pas être vide."));
      return;
    }
    setSaving(true);
    const toastId = toast.loading(t("Enregistrement des modifications du rayon..."));
    try {
      await adminApi.updateAdminCategory(category.id, {
        id: category.id,
        name: trimmedName,
        isActive,
        subcategories,
      });
      toast.success(t("Catégorie et arborescence mises à jour !"), { id: toastId });
      await onSaved();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("Erreur lors de la sauvegarde"), { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#C75C1A] flex items-center justify-center shrink-0">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900">
              {t("Édition du Rayon")} : <span className="text-[#C75C1A]">{category.name || category.id}</span>
            </h3>
            <p className="text-xs text-zinc-500">
              {t("Modifiez le nom, la visibilité et l'arborescence à 3 niveaux (Sous-catégories & Sous-divisions).")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void onDeleteCategory(category.id)}
            className="px-3.5 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t("Supprimer ce rayon")}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSaveCategoryChanges()}
            className="px-5 py-2.5 rounded-xl bg-[#1A1836] hover:bg-[#42164B] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4 text-[#E99856]" />
            {saving ? t("Enregistrement...") : t("Enregistrer ce rayon")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1.5">
            {t("Nom de la Catégorie Principale (Niveau 1)")}
          </label>
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-900 focus:outline-none focus:border-[#1A1836]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1.5">
            {t("Visibilité Marketplace")}
          </label>
          <button
            type="button"
            onClick={() => setIsActive((prev) => !prev)}
            className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isActive
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-zinc-100 border-zinc-300 text-zinc-600"
            }`}
          >
            {isActive ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-zinc-500" />}
            {isActive ? t("Rayon Actif & Visible") : t("Rayon Masqué")}
          </button>
        </div>
      </div>

      <CategoryLevelColumns
        subcategories={subcategories}
        selectedSubCat={selectedSubCat}
        setSelectedSubCat={setSelectedSubCat}
        newSubCatName={newSubCatName}
        setNewSubCatName={setNewSubCatName}
        newSubSubCatName={newSubSubCatName}
        setNewSubSubCatName={setNewSubSubCatName}
        renamingSubCat={renamingSubCat}
        setRenamingSubCat={setRenamingSubCat}
        renameSubCatValue={renameSubCatValue}
        setRenameSubCatValue={setRenameSubCatValue}
        onAddSubCategory={handleAddSubCategory}
        onDeleteSubCategory={handleDeleteSubCategory}
        onConfirmRenameSubCategory={handleConfirmRenameSubCategory}
        onAddSubSubCategory={handleAddSubSubCategory}
        onRemoveSubSubCategory={handleRemoveSubSubCategory}
      />
    </div>
  );
};
