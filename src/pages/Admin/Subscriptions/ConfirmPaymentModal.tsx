import React, { useState } from "react";
import { X, CheckCircle, AlertCircle, ExternalLink, FileText } from "lucide-react";
import { SubscriptionRequest } from "../../../domains/seller/subscription.types";

interface Props {
  request: SubscriptionRequest;
  onClose: () => void;
  onSubmit: (confirmedAmount: number, notes?: string) => Promise<void>;
  isLoading: boolean;
}

export const ConfirmPaymentModal: React.FC<Props> = ({ request, onClose, onSubmit, isLoading }) => {
  const expectedAmount = request.paymentInstructions?.amount || request.planSnapshot.price;
  const [confirmedAmount, setConfirmedAmount] = useState<number>(expectedAmount);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const proof = request.paymentProof;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (confirmedAmount <= 0) {
      setError("Le montant confirmé doit être supérieur à 0 DZD.");
      return;
    }
    try {
      await onSubmit(Number(confirmedAmount), notes);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la confirmation.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-zinc-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <div>
            <h3 className="text-base font-bold text-zinc-900">Étape E : Confirmer la réception des fonds</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Vérification sur relevé bancaire BNA / virement réel</p>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Justificatif fourni par le vendeur */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
              <span>Déclaration vendeur :</span>
              <span className="font-mono text-zinc-900">{proof?.transactionReference || "Non précisée"}</span>
            </div>
            <div className="text-xs text-zinc-500">
              Date déclarée : <span className="text-zinc-700 font-medium">{proof?.paymentDate || "Non précisée"}</span>
            </div>
            {proof?.receiptNote && (
              <p className="text-xs italic text-zinc-600 bg-white p-2 rounded border border-zinc-100">
                « {proof.receiptNote} »
              </p>
            )}
            {proof?.proofFileUrl ? (
              <div className="pt-1">
                <a
                  href={proof.proofFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Examiner le reçu bancaire</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
            ) : (
              <p className="text-[11px] text-amber-600 font-medium">⚠️ Aucun reçu téléversé (virement direct déclaré).</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Montant réellement reçu sur le compte bancaire (DZD)
            </label>
            <input
              type="number"
              value={confirmedAmount}
              onChange={(e) => setConfirmedAmount(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold"
              required
            />
            <p className="text-[11px] text-zinc-400 mt-1">Montant attendu : {expectedAmount.toLocaleString("fr-FR")} DZD</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Notes d'audit & rapprochement comptable
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex : Virement vérifié sur relevé BNA #4519, référence OLM-SUB validée."
              className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
            <strong>Règle de séparation des pouvoirs :</strong> Cette action passe le statut à{" "}
            <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">payment_confirmed</code>. L'abonnement ne
            sera pas activé automatiquement : un second bouton explicite « Accorder l'abonnement » sera requis.
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {isLoading ? "Confirmation..." : "Confirmer le paiement reçu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
