import React, { useState } from "react";
import { Sparkles, Check, ArrowRight, ShieldCheck, Palette, Layers, BarChart3, AlertCircle } from "lucide-react";
import { SubscriptionPlan } from "../../../domains/seller/subscription.types";

interface Props {
  plans: SubscriptionPlan[];
  onRequestPlan: (planId: string) => Promise<void>;
  isLoading: boolean;
}

export const StoreBuilderLocked: React.FC<Props> = ({ plans, onRequestPlan, isLoading }) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (planId: string) => {
    setSelectedPlanId(planId);
    setError(null);
    try {
      await onRequestPlan(planId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la demande.");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Banner / Value Proposition */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Olmart Commerce Studio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Personnalisez votre boutique avec des pages modulaires d'exception
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Créez des pages promotionnelles, mettez en valeur vos créations algériennes avec des thèmes sur-mesure et
            débloquez les outils avancés de conversion.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-zinc-800 text-xs">
          <div className="flex items-center gap-2.5">
            <Palette className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="font-medium text-zinc-200">Thèmes sectoriels</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="font-medium text-zinc-200">Sections modulaires</span>
          </div>
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="font-medium text-zinc-200">Conversions COD</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="font-medium text-zinc-200">Sécurité garantie</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-2xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Plans Selection */}
      <div className="space-y-4">
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-bold text-zinc-900">Choisissez votre forfait d'accès au Studio</h3>
          <p className="text-xs text-zinc-500">Paiement manuel par virement bancaire ou versement BNA / Baridimob</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isSubmitting = isLoading && selectedPlanId === plan.id;
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl border transition-all p-6 flex flex-col justify-between ${
                  plan.isPopular
                    ? "border-orange-500 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500"
                    : "border-zinc-200 shadow-sm hover:border-zinc-300"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">{plan.currency}</span>
                    {plan.badge && (
                      <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-zinc-900">{plan.name}</h4>
                    <p className="text-xs text-zinc-500 mt-1">{plan.description}</p>
                  </div>

                  <div className="text-2xl font-black text-zinc-900">
                    {plan.price.toLocaleString("fr-FR")}{" "}
                    <span className="text-xs font-bold text-zinc-400">DZD / {plan.durationDays}j</span>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 space-y-2 text-xs text-zinc-600">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-zinc-100">
                  <button
                    onClick={() => handleSelect(plan.id)}
                    disabled={isLoading}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${
                      plan.isPopular
                        ? "bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/20"
                        : "bg-zinc-900 hover:bg-black text-white"
                    }`}
                  >
                    <span>{isSubmitting ? "Envoi..." : "Souscrire à ce forfait"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
