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
  cancelled: { label: "Annulé", color: "text-zinc-500 bg-zinc-100" }
};

export const SubscriptionRequestsTable: React.FC<Props> = ({
  requests,
  onOpenInstructions,
  onOpenConfirm,
  onGrant,
  onReject,
  isLoadingAction
}) => {
  if (requests.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200">
        <p className="text-sm text-zinc-500">Aucune demande d'abonnement correspondant aux filtres.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
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
          <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
            {requests.map((req) => {
              const statusCfg = STATUS_LABELS[req.status] || { label: req.status, color: "text-zinc-600 bg-zinc-50" };
              const canInstruct = req.status === "pending";
              const canConfirmPayment = req.status === "payment_declared";
              const canGrant = req.status === "payment_confirmed";
              const isFinished = req.status === "granted" || req.status === "rejected";

              return (
                <tr key={req.id} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-zinc-900">{req.shopName}</div>
                    <div className="text-[11px] text-zinc-400 font-mono">{req.sellerEmail}</div>
                    <div className="text-[10px] text-zinc-400">ID: {req.sellerId.substring(0, 8)}...</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-zinc-900">{req.planSnapshot.name}</div>
                    <div className="text-orange-600 font-bold">{req.planSnapshot.price.toLocaleString("fr-FR")} DZD</div>
                    <div className="text-[10px] text-zinc-400">{req.planSnapshot.durationDays} jours</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                    <div className="text-[10px] text-zinc-400 mt-1">
                      Créé le : {new Date(req.createdAt).toLocaleDateString("fr-FR")}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {req.paymentProof ? (
                      <div className="space-y-1">
                        <div className="text-[11px] font-mono font-medium text-zinc-800">
                          Réf: {req.paymentProof.transactionReference}
                        </div>
                        {req.paymentProof.proofFileUrl && (
                          <a
                            href={req.paymentProof.proofFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-600 hover:text-orange-700"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Voir le reçu</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                        {req.paymentConfirmation && (
                          <div className="text-[10px] text-emerald-700 font-medium">
                            ✓ {req.paymentConfirmation.confirmedAmount} DZD reçus
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-400 text-[11px]">En attente de paiement</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      {/* Action 1 : Envoyer instructions */}
                      {canInstruct && (
                        <button
                          onClick={() => onOpenInstructions(req)}
                          disabled={isLoadingAction}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Envoyer RIB</span>
                        </button>
                      )}

                      {/* Action 2 : Confirmer la réception des fonds */}
                      {canConfirmPayment && (
                        <button
                          onClick={() => onOpenConfirm(req)}
                          disabled={isLoadingAction}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Confirmer fonds</span>
                        </button>
                      )}

                      {/* Action 3 DISTINCTE : Accorder l'abonnement (Strictement après confirmation) */}
                      {canGrant && (
                        <button
                          onClick={() => onGrant(req)}
                          disabled={isLoadingAction}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                          <span>Accorder l'abonnement</span>
                        </button>
                      )}

                      {/* Rejeter si pas encore accordé */}
                      {!isFinished && (
                        <button
                          onClick={() => onReject(req)}
                          disabled={isLoadingAction}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Rejeter la demande"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}

                      {req.status === "granted" && (
                        <span className="text-[11px] font-semibold text-emerald-700">Studio Actif</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
