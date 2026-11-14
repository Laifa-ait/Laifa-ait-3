import React from "react";
import { Copy, Check, Upload, Building2 } from "lucide-react";

interface BankInstructions {
  bankName: string;
  accountHolder: string;
  rib: string;
  amount: number;
  referenceCode: string;
}

interface Props {
  instructions: BankInstructions;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  transactionReference: string;
  setTransactionReference: (v: string) => void;
  paymentDate: string;
  setPaymentDate: (v: string) => void;
  proofFileUrl: string;
  setProofFileUrl: (v: string) => void;
  receiptNote: string;
  setReceiptNote: (v: string) => void;
  isLoading: boolean;
  onBackToChoose: () => void;
  onSubmitPayment: (e: React.FormEvent) => void;
}

export const SubscriptionStepPayment: React.FC<Props> = ({
  instructions,
  copiedField,
  onCopy,
  transactionReference,
  setTransactionReference,
  paymentDate,
  setPaymentDate,
  proofFileUrl,
  setProofFileUrl,
  receiptNote,
  setReceiptNote,
  isLoading,
  onBackToChoose,
  onSubmitPayment,
}) => {
  return (
    <form onSubmit={onSubmitPayment} className="space-y-5">
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-700" />
            <span className="font-semibold text-slate-900 text-xs">Coordonnées Bancaires Officielles Olmart (DZD)</span>
          </div>
          <span className="tabular-nums font-semibold text-slate-900 text-sm">
            {instructions.amount.toLocaleString("fr-FR")} DZD
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Titulaire du Compte</span>
            <p className="font-semibold text-slate-900">{instructions.accountHolder}</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Banque &amp; Service</span>
            <p className="font-semibold text-slate-900">{instructions.bankName}</p>
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <span className="text-slate-600 text-[10px] uppercase font-semibold">
              RIP BaridiMob / Compte CCP
            </span>
            <button
              type="button"
              onClick={() => onCopy(instructions.rib, "rib")}
              className="text-[11px] font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              {copiedField === "rib" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedField === "rib" ? "Copié !" : "Copier"}</span>
            </button>
          </div>
          <div className="font-mono font-semibold bg-white p-2.5 rounded-lg border border-slate-200 text-slate-900 text-xs select-all">
            {instructions.rib}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-slate-600 text-[10px] uppercase font-semibold">
              Référence à mentionner lors du virement
            </span>
            <button
              type="button"
              onClick={() => onCopy(instructions.referenceCode, "ref")}
              className="text-[11px] font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              {copiedField === "ref" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedField === "ref" ? "Copié !" : "Copier"}</span>
            </button>
          </div>
          <div className="font-mono font-semibold bg-slate-100 p-2 rounded-lg border border-slate-200 text-slate-900 text-xs">
            {instructions.referenceCode}
          </div>
        </div>
      </div>

      <div className="space-y-3.5">
        <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
          Déclarer votre virement bancaire
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <label className="font-medium text-slate-700 block">N° de transaction BaridiMob ou CCP *</label>
            <input
              type="text"
              value={transactionReference}
              onChange={(e) => setTransactionReference(e.target.value)}
              placeholder="Ex: BNA-TX-849202"
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-slate-900 transition-colors"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="font-medium text-slate-700 block">Date du transfert *</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 transition-colors"
              required
            />
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <label className="font-medium text-slate-700 block">Lien du reçu / capture (HTTPS optionnel)</label>
          <input
            type="url"
            value={proofFileUrl}
            onChange={(e) => setProofFileUrl(e.target.value)}
            placeholder="https://..."
            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-[11px] focus:outline-none focus:border-slate-900 transition-colors"
          />
        </div>

        <div className="space-y-1 text-xs">
          <label className="font-medium text-slate-700 block">Note pour l&apos;administration Olmart</label>
          <textarea
            rows={2}
            value={receiptNote}
            onChange={(e) => setReceiptNote(e.target.value)}
            placeholder="Précisions sur votre paiement ou votre boutique..."
            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 text-xs transition-colors"
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-slate-200">
        <button
          type="button"
          onClick={onBackToChoose}
          className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          ← Changer de forfait
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 h-9 px-5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{isLoading ? "Envoi en cours..." : "Transmettre le Reçu à l'Admin"}</span>
        </button>
      </div>
    </form>
  );
};
