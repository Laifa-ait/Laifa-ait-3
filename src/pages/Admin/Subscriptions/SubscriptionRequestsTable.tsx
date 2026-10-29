import React from "react";
import { Send, CheckCircle, ShieldCheck, XCircle, FileText, ExternalLink } from "lucide-react";
import { SubscriptionRequest, SubscriptionRequestStatus } from "../../../domains/seller/subscription.types";

interface Props {
  requests: SubscriptionRequest[];
  onOpenInstructions: (req: SubscriptionRequest) => void;
  onOpenConfirm: (req: SubscriptionRequest) => void;
  onGrant: (req: SubscriptionRequest) => void;
  onReject: (req: SubscriptionRequest) => void;
  isLoadingAction: boolean;
}

const STATUS_LABELS: Record<SubscriptionRequestStatus, { label: string; color: string }> = {
  pending: { label: "1. En attente d'instructions", color: "text-amber-700 bg-amber-50" },
  payment_requested: { label: "2. Instructions transmises", color: "text-sky-700 bg-sky-50" },
  payment_declared: { label: "3. Reçu soumis par vendeur", color: "text-indigo-700 bg-indigo-50" },
  payment_confirmed: { label: "4. Fonds reçus (Prêt à accorder)", color: "text-emerald-700 bg-emerald-50" },
  granted: { label: "5. Abonnement Accordé (Actif)", color: "text-zinc-900 bg-zinc-100" },
  rejected: { label: "Rejeté", color: "text-rose-700 bg-rose-50" },
  cancelled: { label: "Annulé", color: "text-zinc-500 bg-zinc-100" },
};

export const SubscriptionRequestsTable: React.FC<Props> = ({
  requests,
  onOpenInstructions,
  onOpenConfirm,
  onGrant,
  onReject,
  isLoadingAction,
}) => {
  if (requests.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200">
        <p className="text-sm text-zinc-500">Aucune demande d'abonnement correspondant aux filtres.</p>
      </div>
    );
  }

  const renderActions = (req: SubscriptionRequest, isMobile = false) => {
    const canInstruct = req.status === "pending";
    const canConfirmPayment = req.status === "payment_declared";
    const canGrant = req.status === "payment_confirmed";
    const isFinished = req.status === "granted" || req.status === "rejected";
    const btnBase = isMobile
      ? "flex-1 min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
      : "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer";

    return (
      <div className={isMobile ? "flex flex-wrap items-center gap-2 pt-1" : "inline-flex items-center gap-2"}>
        {canInstruct && (
          <button onClick={() => onOpenInstructions(req)} disabled={isLoadingAction} className={`${btnBase} bg-[#A54055] hover:bg-[#622347] text-white`}>
            <Send className="w-3.5 h-3.5" />
            <span>Envoyer RIB</span>
          </button>
        )}
        {canConfirmPayment && (
          <button onClick={() => onOpenConfirm(req)} disabled={isLoadingAction} className={`${btnBase} bg-emerald-600 hover:bg-emerald-700 text-white`}>
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Confirmer fonds</span>
          </button>
        )}
        {canGrant && (
          <button onClick={() => onGrant(req)} disabled={isLoadingAction} className={`${btnBase} bg-[#1A1836] hover:bg-[#42164B] text-white`}>
            <ShieldCheck className="w-3.5 h-3.5 text-[#E99856]" />
            <span>Accorder l'abonnement</span>
          </button>
        )}
        {!isFinished && (
          <button
            onClick={() => onReject(req)}
            disabled={isLoadingAction}
            className={isMobile ? "min-h-[40px] px-3 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer" : "p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"}
            title="Rejeter la demande"
          >
            <XCircle className="w-4 h-4" />
            {isMobile && <span>Rejeter</span>}
          </button>
        )}
        {req.status === "granted" && <span className="text-[11px] font-semibold text-emerald-700">Studio Actif</span>}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
      <div className="md:hidden divide-y divide-zinc-100">
        {requests.map((req) => {
          const statusCfg = STATUS_LABELS[req.status] || { label: req.status, color: "text-zinc-600 bg-zinc-50" };
          return (
            <div key={req.id} className="p-4 space-y-3 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-sm text-[#1A1836]">{req.shopName}</div>
                  <div className="text-[11px] text-zinc-400 font-mono">{req.sellerEmail}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold shrink-0 ${statusCfg.color}`}>
                  {statusCfg.label}
                </span>
              </div>
              <div className="flex items-center justify-between bg-zinc-50 p-3 rounded-xl border border-zinc-100 tabular-nums">
                <div>
                  <div className="font-bold text-zinc-900">{req.planSnapshot.name}</div>
                  <div className="text-[10px] text-zinc-400">{req.planSnapshot.durationDays} jours</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-[#A54055]">{req.planSnapshot.price.toLocaleString("fr-FR")} DZD</div>
                  <div className="text-[10px] text-zinc-400">{new Date(req.createdAt).toLocaleDateString("fr-FR")}</div>
                </div>
              </div>
              {req.paymentProof && (
                <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-100 space-y-1">
                  <div className="text-[11px] font-mono font-semibold text-zinc-800">Réf: {req.paymentProof.transactionReference}</div>
                  {req.paymentProof.proofFileUrl && (
                    <a href={req.paymentProof.proofFileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#A54055]">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Voir le reçu bancaire</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
              {renderActions(req, true)}
            </div>
          );
        })}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/75 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              <th className="py-3 px-4">Boutique & Vendeur</th>
              <th className="py-3 px-4">Forfait & Montant</th>
              <th className="py-3 px-4">Statut Administratif</th>
              <th className="py-3 px-4">Preuve & Rapprochement</th>
              <th className="py-3 px-4 text-right">Actions Manuelles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700 tabular-nums">
            {requests.map((req) => {
              const statusCfg = STATUS_LABELS[req.status] || { label: req.status, color: "text-zinc-600 bg-zinc-50" };
              return (
                <tr key={req.id} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-zinc-900">{req.shopName}</div>
                    <div className="text-[11px] text-zinc-400 font-mono">{req.sellerEmail}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <a href={`/store/${req.sellerId}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-[#A54055] bg-[#A54055]/10 px-2 py-0.5 rounded-md">
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span>Inspecter la vitrine</span>
                      </a>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-zinc-900">{req.planSnapshot.name}</div>
                    <div className="text-[#A54055] font-bold">{req.planSnapshot.price.toLocaleString("fr-FR")} DZD</div>
                    <div className="text-[10px] text-zinc-400">{req.planSnapshot.durationDays} jours</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${statusCfg.color}`}>{statusCfg.label}</span>
                    <div className="text-[10px] text-zinc-400 mt-1">Créé le : {new Date(req.createdAt).toLocaleDateString("fr-FR")}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {req.paymentProof ? (
                      <div className="space-y-1">
                        <div className="text-[11px] font-mono font-medium text-zinc-800">Réf: {req.paymentProof.transactionReference}</div>
                        {req.paymentProof.proofFileUrl && (
                          <a href={req.paymentProof.proofFileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A54055]">
                            <FileText className="w-3 h-3" />
                            <span>Voir le reçu</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                        {req.paymentConfirmation && (
                          <div className="text-[10px] text-emerald-700 font-medium">✓ {req.paymentConfirmation.confirmedAmount} DZD reçus</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-400 text-[11px]">En attente de paiement</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">{renderActions(req, false)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

