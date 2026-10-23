import React, { useState } from "react";
import { X, Send, AlertCircle } from "lucide-react";
import { SubscriptionRequest, BankPaymentInstructions } from "../../../domains/seller/subscription.types";

interface Props {
  request: SubscriptionRequest;
  onClose: () => void;
  onSubmit: (instructions: Omit<BankPaymentInstructions, "requestedAt" | "requestedByAdminId">) => Promise<void>;
  isLoading: boolean;
}

export const PaymentInstructionsModal: React.FC<Props> = ({ request, onClose, onSubmit, isLoading }) => {
  const [accountHolder, setAccountHolder] = useState("Olmart E-Commerce SARL");
  const [bankName, setBankName] = useState("Banque Nationale d'Algérie (BNA)");
  const [accountNumber, setAccountNumber] = useState("00100 001234567890 12");
  const [rib, setRib] = useState("00100 0012345678901234 56");
  const [referenceCode, setReferenceCode] = useState(`OLM-SUB-${request.sellerId.substring(0, 5).toUpperCase()}-${Date.now().toString().slice(-4)}`);
  const [amount, setAmount] = useState(request.planSnapshot.price);
  const [instructions, setInstructions] = useState(
    "Veuillez effectuer le virement ou versement bancaire exact avec le code de référence en libellé, puis téléverser votre reçu."
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!accountHolder || !bankName || !referenceCode || amount <= 0) {
      setError("Veuillez remplir tous les champs bancaires obligatoires.");
      return;
    }
    try {
      await onSubmit({
        accountHolder,
        accountNumber,
        bankName,
        rib,
        referenceCode,
        amount: Number(amount),
        currency: "DZD",
        instructions
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-zinc-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <div>
            <h3 className="text-base font-bold text-zinc-900">Transmettre les instructions bancaires</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Demande pour le {request.planSnapshot.name} ({request.shopName})</p>
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

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Titulaire du compte bancaire</label>
            <input
              type="text"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Nom de la banque</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Montant à régler (DZD)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Numéro de compte / RIP</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">RIB Clé bancaire (20 chiffres)</label>
            <input
              type="text"
              value={rib}
              onChange={(e) => setRib(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Code de référence obligatoire</label>
            <input
              type="text"
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono font-bold text-orange-600"
              required
            />
            <p className="text-[11px] text-zinc-400 mt-1">Ce code doit être précisé par le vendeur sur son virement.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Consignes complémentaires</label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
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
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isLoading ? "Transmission..." : "Envoyer les instructions"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
