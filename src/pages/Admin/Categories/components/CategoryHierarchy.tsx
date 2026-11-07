import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCategories } from "../../../../hooks/admin/useCategories";
import { useShop } from "../../../../context/ShopContext";
import { Network, GripVertical, Plus, RefreshCw, ArrowUp, ArrowDown, CheckCircle2, EyeOff } from "lucide-react";
import { apiPut } from "../../../../lib/api";
import { adminApi, CategoryItem } from "../../../../services/api/admin.api";
import { CategorySubtreeEditor } from "./CategorySubtreeEditor";
import toast from "react-hot-toast";

export const CategoryHierarchy: React.FC = () => {
  const { t } = useTranslation();
  const { categories, isLoading, mutate } = useCategories();
  const { refreshHierarchy } = useShop();
  const [localCategories, setLocalCategories] = useState<CategoryItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCommission, setNewCommission] = useState<number>(5);
  const [creating, setCreating] = useState(false);
  const [harmonizing, setHarmonizing] = useState(false);

  useEffect(() => {
    if (categories && categories.length > 0) {
      const sorted = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setLocalCategories(sorted);
      if (!selectedCategoryId || !sorted.some((c) => c.id === selectedCategoryId)) {
        setSelectedCategoryId(sorted[0].id);
      }
    }
  }, [categories, selectedCategoryId]);

  if (isLoading) {
    return <div className="p-8 text-sm text-zinc-500 font-medium">{t("Chargement des catégories...")}</div>;
  }

  const syncAll = async () => {
    await mutate();
    await refreshHierarchy();
  };

  const moveCategory = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= localCategories.length) return;
    const next = [...localCategories];
    const [item] = next.splice(index, 1);
    next.splice(targetIndex, 0, item);
    setLocalCategories(next);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    const draggedIdx = localCategories.findIndex((c) => c.id === draggedId);
    const targetIdx = localCategories.findIndex((c) => c.id === targetId);
    if (draggedIdx === -1 || targetIdx === -1) return;
    const next = [...localCategories];
    const [draggedItem] = next.splice(draggedIdx, 1);
    next.splice(targetIdx, 0, draggedItem);
    setLocalCategories(next);
  };

  const handleUpdateHierarchy = async () => {
    const toastId = toast.loading(t("Sauvegarde de l'ordre d'affichage..."));
    try {
      const hierarchy = localCategories.map((c, idx) => ({ id: c.id, order: idx }));
      await apiPut("/api/v1/admin/categories/hierarchy", { hierarchy });
      toast.success(t("Ordre des catégories synchronisé sur le Marketplace !"), { id: toastId });
      await syncAll();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("Erreur de sauvegarde"), { id: toastId });
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    setCreating(true);
    const toastId = toast.loading(t("Création du nouveau rayon..."));
    try {
      await adminApi.createAdminCategory({
        name: trimmed,
        commissionRate: Number(newCommission) || 5,
        isActive: true,
        order: localCategories.length,
        subcategories: {},
      });
      setNewCategoryName("");
      setSelectedCategoryId(trimmed);
      toast.success(t("Nouvelle catégorie ajoutée avec succès !"), { id: toastId });
      await syncAll();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("Erreur de création"), { id: toastId });
    } finally {
      setCreating(false);
    }
  };

  const handleHarmonizeCategories = async () => {
    setHarmonizing(true);
    const toastId = toast.loading(t("Harmonisation des 13 rayons officiels Olmart..."));
    try {
      await adminApi.harmonizeAdminCategories();
      toast.success(t("Catalogue harmonisé avec les 13 rayons officiels Olmart !"), { id: toastId });
      await syncAll();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("Erreur d'harmonisation"), { id: toastId });
    } finally {
      setHarmonizing(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const toastId = toast.loading(t("Suppression du rayon..."));
    try {
      await adminApi.deleteAdminCategory(id);
      toast.success(t("Rayon supprimé avec succès"), { id: toastId });
      await syncAll();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("Erreur de suppression"), { id: toastId });
    }
  };

  const selectedCategory = localCategories.find((c) => c.id === selectedCategoryId) || null;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <form onSubmit={handleCreateCategory} className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              {t("Ajouter une Nouvelle Catégorie")}
            </label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder={t("Ex: Animalerie & Jardin...")}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:outline-none focus:border-[#1A1836]"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              {t("Commission (%)")}
            </label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={newCommission}
              onChange={(e) => setNewCommission(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:outline-none focus:border-[#1A1836]"
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={creating || !newCategoryName.trim()}
              className="w-full px-4 py-2.5 bg-[#C75C1A] hover:bg-[#a84b12] disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {t("Créer Rayon")}
            </button>
          </div>
        </form>

        <button
          type="button"
          disabled={harmonizing}
          onClick={() => void handleHarmonizeCategories()}
          className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-700 ${harmonizing ? "animate-spin" : ""}`} />
          {t("Harmoniser les 13 Rayons Officiels")}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-[#C75C1A]" />
              <h2 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">
                {t("Rayons")} ({localCategories.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => void handleUpdateHierarchy()}
              className="px-3 py-1.5 bg-[#1A1836] hover:bg-[#42164B] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
            >
              {t("Sauvegarder l'ordre")}
            </button>
          </div>

          <div className="space-y-1.5 max-h-[540px] overflow-y-auto pr-1">
            {localCategories.map((c, idx) => {
              const isSelected = c.id === selectedCategoryId;
              const subCount = Object.keys(c.subcategories || {}).length;
              return (
                <div
                  key={c.id}
                  draggable
                  onDragStart={() => setDraggedId(c.id)}
                  onDragEnd={() => setDraggedId(null)}
                  onDragOver={(e) => handleDragOver(e, c.id)}
                  onClick={() => setSelectedCategoryId(c.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#1A1836] text-white border-[#1A1836] shadow-xs"
                      : "bg-zinc-50/70 hover:bg-zinc-100/80 text-zinc-800 border-zinc-200/70"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <GripVertical className={`w-4 h-4 shrink-0 cursor-grab ${isSelected ? "text-zinc-400" : "text-zinc-300"}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate flex items-center gap-1.5">
                        <span>{c.name || c.id}</span>
                        {c.isActive === false && <EyeOff className="w-3 h-3 text-rose-400 shrink-0" />}
                      </p>
                      <p className={`text-[10px] ${isSelected ? "text-zinc-300" : "text-zinc-500"}`}>
                        {subCount} {t("sous-catégories")} • {c.commissionRate ?? 5}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => moveCategory(idx, -1)}
                      disabled={idx === 0}
                      className={`p-1 rounded disabled:opacity-30 ${isSelected ? "hover:bg-white/10 text-white" : "hover:bg-zinc-200 text-zinc-600"}`}
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCategory(idx, 1)}
                      disabled={idx === localCategories.length - 1}
                      className={`p-1 rounded disabled:opacity-30 ${isSelected ? "hover:bg-white/10 text-white" : "hover:bg-zinc-200 text-zinc-600"}`}
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#E99856] ms-1" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-8">
          {selectedCategory ? (
            <CategorySubtreeEditor
              category={selectedCategory}
              onSaved={syncAll}
              onDeleteCategory={handleDeleteCategory}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};
