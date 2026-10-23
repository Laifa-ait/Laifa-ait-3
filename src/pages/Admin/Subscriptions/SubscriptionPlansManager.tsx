import React, { useState } from "react";
import { Plus, Edit2, Check, AlertCircle } from "lucide-react";
import { SubscriptionPlan } from "../../../domains/seller/subscription.types";

interface Props {
  plans: SubscriptionPlan[];
  onSavePlan: (plan: Partial<SubscriptionPlan> & { id?: string }) => Promise<void>;
  isLoading: boolean;
}

export const SubscriptionPlansManager: React.FC<Props> = ({ plans, onSavePlan, isLoading }) => {
  const [editingPlan, setEditingPlan] = useState<Partial<SubscriptionPlan> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan({ ...plan });
  };

  const handleCreateNew = () => {
    setEditingPlan({
      id: `plan_${Date.now()}`,
      name: "Nouveau Forfait Studio",
      description: "Description du forfait pour vendeurs Olmart.",
      price: 4900,
      currency: "DZD",
      durationDays: 30,
      features: ["Constructeur de pages", "Support prioritaire"],
      limits: {
        maxPages: 5,
        maxCustomSections: 20,
        customDomainAllowed: false,
        tiktokAdsAllowed: false,
        analyticsAdvanced: true
      },
      isActive: true
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !editingPlan.name || editingPlan.price === undefined) return;
    try {
      setError(null);
      await onSavePlan(editingPlan);
      setEditingPlan(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-900">Catalogue des Forfaits Studio</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Tarifs officiels en Dinar Algérien (DZD) et quotas de pages</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ajouter un forfait</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">{p.currency}</span>
                <h4 className="text-base font-bold text-zinc-900 mt-0.5">{p.name}</h4>
                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{p.description}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.isActive ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                {p.isActive ? "Actif" : "Inactif"}
              </span>
            </div>

            <div className="pt-2 border-t border-zinc-100">
              <div className="text-2xl font-black text-zinc-900">
                {p.price.toLocaleString("fr-FR")} <span className="text-xs font-bold text-zinc-500">DZD / {p.durationDays}j</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-zinc-600">
              <div className="font-semibold text-zinc-900 text-[11px] uppercase tracking-wider">Limites Studio :</div>
              <div>• {p.limits?.maxPages || 0} pages personnalisées</div>
              <div>• {p.limits?.maxCustomSections || 0} sections modulaires</div>
              <div>• {p.limits?.customDomainAllowed ? "✓ Domaine personnalisé inclus" : "✕ Sans domaine personnalisé"}</div>
              <div>• {p.limits?.tiktokAdsAllowed ? "✓ Connecteur TikTok Ads inclus" : "✕ Sans TikTok Ads"}</div>
            </div>

            <button
              onClick={() => handleEdit(p)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-zinc-700 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-colors border border-zinc-200"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Modifier ce forfait</span>
            </button>
          </div>
        ))}
      </div>

      {/* Edit/Create Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-zinc-200 p-6 space-y-4">
            <h4 className="text-base font-bold text-zinc-900">Édition du Forfait Studio</h4>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Nom du forfait</label>
                <input
                  type="text"
                  value={editingPlan.name || ""}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Tarif (DZD)</label>
                  <input
                    type="number"
                    value={editingPlan.price || 0}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Durée (jours)</label>
                  <input
                    type="number"
                    value={editingPlan.durationDays || 30}
                    onChange={(e) => setEditingPlan({ ...editingPlan, durationDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activePlanCheck"
                  checked={editingPlan.isActive ?? true}
                  onChange={(e) => setEditingPlan({ ...editingPlan, isActive: e.target.checked })}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="activePlanCheck" className="text-xs font-medium text-zinc-700">Forfait actif et disponible aux vendeurs</label>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
