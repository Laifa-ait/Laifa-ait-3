import React, { useState } from "react";
import { Building2, Copy, Check, Upload, AlertCircle, ShieldAlert } from "lucide-react";
import { SubscriptionRequest } from "../../../domains/seller/subscription.types";

interface Props {
  request: SubscriptionRequest;
  onSubmitProof: (payload: {
    requestId: string;
    transactionReference: string;
    paymentDate: string;
    proofFileUrl?: string;
    receiptNote?: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export const StoreBuilderPaymentRequested: React.FC<Props> = ({ request, onSubmitProof, isLoading }) => {
  const instructions = request.paymentInstructions;
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [transactionReference, setTransactionReference] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [proofFileUrl, setProofFileUrl] = useState("");
  const [receiptNote, setReceiptNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!transactionReference || !paymentDate) {
      setError("Veuillez renseigner le numéro de virement et la date.");
      return;
    }
    if (proofFileUrl && !proofFileUrl.startsWith("https://")) {
      setError("L'URL du reçu doit impérativement débuter par https:// (protocole sécurisé).");
      return;
    }
    try {
      await onSubmitProof({
        requestId: request.id,
        transactionReference,
        paymentDate,
        proofFileUrl: proofFileUrl.trim() || undefined,
        receiptNote: receiptNote.trim() || undefined
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la déclaration.");
    }
  };

  if (!instructions) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-zinc-200">
        <p className="text-sm text-zinc-500">Chargement des instructions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wider">
          <Building2 className="w-3.5 h-3.5" />
          <span>Étape 2 sur 4 : Instructions de paiement reçues</span>
        </div>
        <h3 className="text-xl font-bold text-zinc-900">Coordonnées bancaires pour activer votre Studio</h3>
        <p className="text-xs text-zinc-500">
          Effectuez votre versement ou virement bancaire du montant exact, puis déclarez votre reçu ci-dessous.
        </p>

        {/* Bank details card */}
        <div className="mt-4 p-5 bg-zinc-50 rounded-2xl border border-zinc-200/90 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400">Banque réceptrice</span>
              <p className="text-sm font-bold text-zinc-900">{instructions.bankName}</p>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Montant exact</span>
              <p className="text-lg font-black text-orange-600">{instructions.amount.toLocaleString("fr-FR")} DZD</p>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400">Titulaire du compte</span>
            <p className="text-xs font-semibold text-zinc-800">{instructions.accountHolder}</p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-zinc-400">RIB / Clé bancaire</span>
              <button
                type="button"
                onClick={() => handleCopy(instructions.rib, "rib")}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                {copiedField === "rib" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === "rib" ? "Copié !" : "Copier"}</span>
              </button>
            </div>
            <p className="text-xs font-mono font-bold text-zinc-900 bg-white p-2 rounded-lg border border-zinc-200 mt-1">
              {instructions.rib}
            </p>
          </div>

          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800">Code de référence obligatoire :</span>
              <button
                type="button"
                onClick={() => handleCopy(instructions.referenceCode, "ref")}
                className="text-[11px] font-bold text-amber-900 hover:underline flex items-center gap-1"
              >
                {copiedField === "ref" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === "ref" ? "Copié !" : "Copier"}</span>
              </button>
            </div>
            <p className="text-sm font-mono font-black text-amber-900 tracking-wider">
              {instructions.referenceCode}
            </p>
            <p className="text-[10px] text-amber-700">
              ⚠️ Indiquez impérativement cette référence dans le libellé de votre virement pour que l'audit soit instantané.
            </p>
          </div>
        </div>
      </div>

      {/* Proof Submission Form */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h4 className="text-base font-bold text-zinc-900">Déclarer mon paiement et soumettre mon justificatif</h4>
        <p className="text-xs text-zinc-500">
          Une fois votre virement effectué, remplissez ce formulaire. Les fonds seront contrôlés par l'administrateur.
        </p>

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Numéro ou référence du virement bancaire *
              </label>
              <input
                type="text"
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                placeholder="Ex : BNA-VIR-202610-891"
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Date de réalisation du virement *
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Lien sécurisé vers le reçu de virement (HTTPS optionnel)
            </label>
            <input
              type="url"
              value={proofFileUrl}
              onChange={(e) => setProofFileUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl"
            />
            <p className="text-[11px] text-zinc-400 mt-1">
              Lien HTTPS vers votre capture de reçu ou justificatif PDF.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Commentaire ou note à l'équipe comptable
            </label>
            <textarea
              rows={2}
              value={receiptNote}
              onChange={(e) => setReceiptNote(e.target.value)}
              placeholder="Précisions éventuelles sur votre virement..."
              className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl"
            />
          </div>

          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-start gap-2 text-xs text-zinc-600">
            <ShieldAlert className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <span>
              La soumission de ce formulaire passe votre dossier en <strong>audit financier</strong>. L'accès au Studio
              sera activé après confirmation officielle des fonds par l'administrateur.
            </span>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isLoading ? "Envoi en cours..." : "Transmettre ma preuve de virement"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
