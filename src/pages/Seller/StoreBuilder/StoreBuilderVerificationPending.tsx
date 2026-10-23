import React from "react";
import { ShieldCheck, Search, CheckCircle2, RefreshCw } from "lucide-react";
import { SubscriptionRequest } from "../../../domains/seller/subscription.types";

interface Props {
  request: SubscriptionRequest;
  onRefresh: () => void;
  isLoading: boolean;
}

export const StoreBuilderVerificationPending: React.FC<Props> = ({ request, onRefresh, isLoading }) => {
  const isConfirmed = request.status === "payment_confirmed";

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm text-center space-y-6">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-inner ${
        isConfirmed ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
      }`}>
        {isConfirmed ? (
          <CheckCircle2 className="w-8 h-8" />
        ) : (
          <Search className="w-8 h-8 animate-pulse" />
        )}
      </div>

      <div className="space-y-2">
        <span className={`text-xs font-bold uppercase tracking-wider ${
          isConfirmed ? "text-emerald-700" : "text-indigo-700"
        }`}>
          {isConfirmed ? "Étape 4 sur 4 : Fonds confirmés" : "Étape 3 sur 4 : Audit bancaire en cours"}
        </span>

        <h3 className="text-xl font-bold text-zinc-900">
          {isConfirmed ? "Paiement validé par la comptabilité !" : "Preuve de paiement reçue"}
        </h3>

        <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
          {isConfirmed
            ? "Les fonds ont été vérifiés avec succès sur le compte bancaire officiel. L'administrateur active votre forfait dans quelques instants."
            : "Votre déclaration de virement a bien été transmise. Notre service comptable rapproche actuellement l'opération avec les relevés bancaires."}
        </p>
      </div>

      {/* Recap block */}
      <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-2xl text-xs text-left space-y-2">
        <div className="flex justify-between text-zinc-600">
          <span>Forfait demandé :</span>
          <span className="font-bold text-zinc-900">{request.planSnapshot.name}</span>
        </div>
        <div className="flex justify-between text-zinc-600">
          <span>Montant à régler :</span>
          <span className="font-bold text-orange-600">{request.planSnapshot.price.toLocaleString("fr-FR")} DZD</span>
        </div>
        {request.paymentProof && (
          <div className="flex justify-between text-zinc-600">
            <span>Réf. déclarée :</span>
            <span className="font-mono text-zinc-900">{request.paymentProof.transactionReference}</span>
          </div>
        )}
        {request.paymentConfirmation && (
          <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-zinc-200">
            <span>Montant vérifié :</span>
            <span>{request.paymentConfirmation.confirmedAmount.toLocaleString("fr-FR")} DZD</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Vérifier l'activation</span>
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Garantie de non-activation automatique — Sécurité financière Olmart</span>
      </div>
    </div>
  );
};
