import React from "react";
import { Sparkles, Check, ArrowRight } from "lucide-react";
import { SubscriptionPlan } from "../../../../../domains/seller/subscription.types";

interface Props {
  plans: SubscriptionPlan[];
  selectedPlanId: string;
  setSelectedPlanId: (id: string) => void;
  isLoading: boolean;
  onSelectAndProceed: (planId: string) => void;
  onBack: () => void;
}

export const SubscriptionStepChoose: React.FC<Props> = ({
  plans,
  selectedPlanId,
  setSelectedPlanId,
  isLoading,
  onSelectAndProceed,
  onBack,
}) => {
  return (
    <div className="space-y-5">
      <div className="p-4 bg-orange-50/80 border border-orange-200/80 rounded-2xl flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-orange-500 shrink-0" />
        <div className="text-xs text-slate-700">
          <strong className="text-slate-900 font-bold">Paiement après la création de boutique :</strong> Vous avez déjà personnalisé votre vitrine. Choisissez la formule qui convient pour soumettre la publication et obtenir vos coordonnées de paiement DZD.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "border-orange-500 bg-orange-50/40 shadow-xs ring-1 ring-orange-400/50"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider font-mono">
                  Formule Officielle
                </span>
                <h4 className="font-extrabold text-sm text-slate-900">{plan.name}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {plan.description}
                </p>
                <div className="pt-2">
                  <span className="text-xl font-black text-slate-900 font-mono">
                    {plan.priceDZD.toLocaleString("fr-FR")}
                  </span>
                  <span className="text-xs text-slate-500 font-mono"> DZD / mois</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 mt-4 space-y-2">
                <ul className="space-y-1.5 text-[11px] text-slate-600">
                  {plan.features.slice(0, 3).map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span className="truncate">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2">
                  <div
                    className={`w-full py-2 rounded-xl text-xs font-bold text-center transition-all ${
                      isSelected
                        ? "bg-orange-500 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {isSelected ? "Formule Sélectionnée" : "Choisir ce forfait"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          ← Retour à l'aperçu
        </button>
        <button
          type="button"
          disabled={isLoading || !selectedPlanId}
          onClick={() => onSelectAndProceed(selectedPlanId)}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          <span>{isLoading ? "Enregistrement..." : "Continuer vers le Paiement DZD"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
