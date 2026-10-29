import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Percent, Save, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { useCategories } from "../../../../hooks/admin/useCategories";
import { apiPut } from "../../../../lib/api";

export const CategoryVisuals: React.FC = () => {
  const { t } = useTranslation();
  const { categories, isLoading, mutate } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [commissionRate, setCommissionRate] = useState<number>(5);
  const [saving, setSaving] = useState(false);

  if (isLoading) {
    return (
      <div className="p-8 text-sm text-zinc-500 font-medium">
        {t("Chargement des catégories et commissions...")}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="p-8 text-sm text-zinc-500 font-medium">
        {t("Aucune catégorie trouvée.")}
      </div>
    );
  }

  const handleSelect = (id: string) => {
    setSelectedCategoryId(id);
    const cat = categories.find((c) => c.id === id);
    if (cat) {
      const rate = typeof cat.commissionRate === "number" ? cat.commissionRate : 5;
      setCommissionRate(rate);
    }
  };

  const handleSaveCommission = async () => {
    if (!selectedCategoryId) return;
    if (Number.isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
      toast.error(t("Le taux de commission doit être compris entre 0% et 100%."));
      return;
    }

    setSaving(true);
    try {
      await apiPut(`/api/v1/admin/categories/${encodeURIComponent(selectedCategoryId)}`, {
        commissionRate: Number(commissionRate),
      });
      toast.success(t("Taux de commission mis à jour avec succès"));
      await mutate();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : t("Erreur lors de la mise à jour de la commission")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200/80 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
        <div>
          <h2 className="text-lg font-sans font-bold text-zinc-950 uppercase tracking-tight">
            {t("Taux de Commission par Catégorie")}
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            {t("Définissez le pourcentage de commission prélevé par la plateforme sur chaque rayon (0 à 100%).")}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#A54055] flex items-center justify-center">
          <Percent className="w-5 h-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
            {t("Sélectionner un rayon")}
          </label>
          <select
            className="w-full p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-semibold text-zinc-900 outline-none focus:border-[#A54055]"
            value={selectedCategoryId}
            onChange={(e) => handleSelect(e.target.value)}
          >
            <option value="">{t("Choisir une catégorie...")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || c.id} — ({typeof c.commissionRate === "number" ? `${c.commissionRate}%` : "5%"})
              </option>
            ))}
          </select>
        </div>

        {selectedCategoryId && (
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                {t("Commission Plateforme (%)")}
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={commissionRate}
                onChange={(e) => setCommissionRate( Number(e.target.value) )}
                className="w-full p-3.5 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-900 outline-none focus:border-[#A54055]"
              />
            </div>
            <button
              onClick={() => void handleSaveCommission()}
              disabled={saving}
              className="px-6 py-3.5 bg-[#1A1836] hover:bg-[#42164B] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#E99856]" />
              {saving ? t("Enregistrement...") : t("Appliquer")}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleSelect(cat.id)}
            className={`p-4 rounded-xl border text-start transition-all flex items-center justify-between cursor-pointer ${
              selectedCategoryId === cat.id
                ? "border-[#A54055] bg-rose-50/40"
                : "border-zinc-100 bg-zinc-50/60 hover:border-zinc-200"
            }`}
          >
            <span className="text-xs font-bold text-zinc-800 truncate pe-2">
              {cat.name || cat.id}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-[11px] font-bold text-[#1A1836] shrink-0">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {typeof cat.commissionRate === "number" ? `${cat.commissionRate}%` : "5%"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
