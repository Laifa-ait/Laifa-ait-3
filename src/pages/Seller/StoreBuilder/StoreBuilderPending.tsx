import React from "react";
import { Clock, ShieldCheck, Mail, ArrowLeft } from "lucide-react";
import { SubscriptionRequest } from "../../../domains/seller/subscription.types";

interface Props {
  request: SubscriptionRequest;
  onRefresh: () => void;
}

export const StoreBuilderPending: React.FC<Props> = ({ request, onRefresh }) => {
  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm text-center space-y-6">
      <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
        <Clock className="w-8 h-8 animate-pulse" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Étape 1 sur 4 : Demande enregistrée</span>
        <h3 className="text-xl font-bold text-zinc-900">Demande en cours de traitement</h3>
        <p className="text-xs text-zinc-500 max-w-md mx-auto">
          Vous avez sollicité l'accès au Studio avec le forfait{" "}
          <strong className="text-zinc-900">{request.planSnapshot.name}</strong> ({request.planSnapshot.price.toLocaleString("fr-FR")} DZD).
        </p>
      </div>

      <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-2xl text-xs text-left text-zinc-700 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-zinc-900">
          <Mail className="w-4 h-4 text-orange-600" />
          <span>Prochaine étape :</span>
        </div>
        <p className="text-zinc-600 text-[11px] leading-relaxed">
          L'équipe administrative Olmart va vérifier votre boutique et vous transmettre les coordonnées bancaires
          officielles (RIB BNA ou BaridiMob) et votre code de référence de virement unique.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Vérifier les mises à jour</span>
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Transaction sécurisée sous contrôle financier Olmart</span>
      </div>
    </div>
  );
};
