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
    <div className="space-y-4">
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-slate-700 shrink-0" />
        <div className="text-xs text-slate-700">
          <strong className="text-slate-900 font-semibold">Paiement après la création de boutique :</strong> Choisissez la formule qui convient pour soumettre la publication et obtenir vos coordonnées de paiement DZD.
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          Aucun abonnement n&apos;est disponible pour le moment. Vous pouvez continuer à préparer votre boutique et revenir plus tard.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedPlanId(plan.id);
                  }
                }}
                className={`p-4 rounded-xl border transition-colors cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Formule Officielle
                  </span>
                  <h4 className="font-semibold text-sm text-slate-900">{plan.name}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {plan.description}
                  </p>
                  <div className="pt-2">
                    <span className="text-xl font-bold text-slate-900 tabular-nums">
                      {plan.price.toLocaleString("fr-FR")}
                    </span>
                    <span className="text-xs text-slate-500 tabular-nums"> {plan.currency} / {plan.durationDays} jours</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 mt-4 space-y-2">
                  <ul className="space-y-1.5 text-[11px] text-slate-600">
                    {plan.features.slice(0, 3).map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2">
                    <div
                      className={`w-full py-2 rounded-lg text-xs font-medium text-center transition-colors ${
                        isSelected
                          ? "bg-slate-900 text-white"
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
      )}

      <div className="flex justify-between items-center pt-3 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          ← Retour à l&apos;aperçu
        </button>
        <button
          type="button"
          disabled={isLoading || !selectedPlanId || plans.length === 0}
          onClick={() => onSelectAndProceed(selectedPlanId)}
          className="flex items-center gap-2 h-9 px-5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
          <span>{isLoading ? "Enregistrement..." : "Continuer vers le Paiement DZD"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
