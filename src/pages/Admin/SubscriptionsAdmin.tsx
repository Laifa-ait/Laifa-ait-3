import React, { useEffect, useState, useCallback } from "react";
import { CreditCard, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { subscriptionApi } from "@/src/services/api/subscription.api";
import { SubscriptionPlan, SubscriptionRequest, BankPaymentInstructions } from "@/src/domains/seller/subscription.types";
import { SubscriptionRequestsTable } from "./Subscriptions/SubscriptionRequestsTable";
import { PaymentInstructionsModal } from "./Subscriptions/PaymentInstructionsModal";
import { ConfirmPaymentModal } from "./Subscriptions/ConfirmPaymentModal";
import { SubscriptionPlansManager } from "./Subscriptions/SubscriptionPlansManager";
import { useConfirm } from "../../hooks/useConfirm";

export const SubscriptionsAdmin: React.FC = () => {
  const { confirm, ConfirmationDialog } = useConfirm();
  const [activeTab, setActiveTab] = useState<"requests" | "plans">("requests");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [instructTarget, setInstructTarget] = useState<SubscriptionRequest | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<SubscriptionRequest | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [reqsData, plansData] = await Promise.all([
        subscriptionApi.getAdminRequests(statusFilter),
        subscriptionApi.getAdminPlans(),
      ]);
      setRequests(reqsData);
      setPlans(plansData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des abonnements.");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSendInstructions = async (
    instructions: Omit<BankPaymentInstructions, "requestedAt" | "requestedByAdminId">
  ) => {
    if (!instructTarget) return;
    setActionLoading(true);
    try {
      await subscriptionApi.sendPaymentInstructions(instructTarget.id, instructions);
      showToast("✓ Instructions bancaires transmises au vendeur.");
      setInstructTarget(null);
      await loadData();
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPayment = async (amount: number, notes?: string) => {
    if (!confirmTarget) return;
    setActionLoading(true);
    try {
      await subscriptionApi.confirmPaymentReceived(confirmTarget.id, amount, notes);
      showToast("✓ Paiement confirmé sur compte bancaire. Prêt pour l'attribution.");
      setConfirmTarget(null);
      await loadData();
    } finally {
      setActionLoading(false);
    }
  };

  const handleGrantSubscription = async (req: SubscriptionRequest) => {
    const ok = await confirm(
      `Confirmez-vous l'accord officiel du forfait ${req.planSnapshot.name} pour la boutique ${req.shopName} ?`
    );
    if (!ok) return;
    setActionLoading(true);
    try {
      await subscriptionApi.grantSubscription(req.id, "Validation administrative Olmart");
      showToast(`Abonnement ${req.planSnapshot.name} accordé avec succès !`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'attribution.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (req: SubscriptionRequest) => {
    const ok = await confirm(
      `Rejeter officiellement la demande d'abonnement de la boutique "${req.shopName}" (Dossier bancaire non conforme) ?`
    );
    if (!ok) return;
    setActionLoading(true);
    try {
      await subscriptionApi.rejectRequest(req.id, "Dossier bancaire ou justificatif de virement non conforme");
      showToast("Demande rejetée.");
      await loadData();
    } finally {
      setActionLoading(false);
    }
  };

  const handleSavePlan = async (plan: Partial<SubscriptionPlan> & { id?: string }) => {
    setActionLoading(true);
    try {
      await subscriptionApi.upsertAdminPlan(plan);
      showToast("✓ Forfait enregistré.");
      await loadData();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmationDialog />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#A54055]/10 rounded-xl text-[#A54055]">
              <CreditCard className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-[#1A1836]">Abonnements & Forfaits Studio</h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Validation manuelle des virements bancaires réels et attribution des accès au Commerce Studio.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-[#1A1836] hover:bg-[#42164B] rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#E99856] ${isLoading ? "animate-spin" : ""}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {toastMsg && (
        <div className="flex items-center gap-2 p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-3 overflow-x-auto scrollbar-hide flex-nowrap">
        <button
          onClick={() => setActiveTab("requests")}
          className={`min-h-[40px] px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap shrink-0 transition-colors cursor-pointer tabular-nums ${
            activeTab === "requests" ? "bg-[#1A1836] text-white" : "text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          Demandes d'abonnement ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab("plans")}
          className={`min-h-[40px] px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap shrink-0 transition-colors cursor-pointer tabular-nums ${
            activeTab === "plans" ? "bg-[#1A1836] text-white" : "text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          Gestion des forfaits ({plans.length})
        </button>
      </div>

      {activeTab === "requests" && (
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 p-1.5 bg-zinc-100/80 rounded-xl w-full sm:w-fit overflow-x-auto scrollbar-hide flex-nowrap">
            {[
              { id: "all", label: "Toutes" },
              { id: "pending", label: "1. En attente RIB" },
              { id: "payment_requested", label: "2. RIB envoyé" },
              { id: "payment_declared", label: "3. Reçu soumis" },
              { id: "payment_confirmed", label: "4. Fonds confirmés" },
              { id: "granted", label: "5. Accordées" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`min-h-[36px] px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  statusFilter === f.id ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <SubscriptionRequestsTable
            requests={requests}
            onOpenInstructions={(req) => setInstructTarget(req)}
            onOpenConfirm={(req) => setConfirmTarget(req)}
            onGrant={handleGrantSubscription}
            onReject={handleReject}
            isLoadingAction={actionLoading}
          />
        </div>
      )}

      {activeTab === "plans" && (
        <SubscriptionPlansManager plans={plans} onSavePlan={handleSavePlan} isLoading={actionLoading} />
      )}

      {instructTarget && (
        <PaymentInstructionsModal
          request={instructTarget}
          onClose={() => setInstructTarget(null)}
          onSubmit={handleSendInstructions}
          isLoading={actionLoading}
        />
      )}

      {confirmTarget && (
        <ConfirmPaymentModal
          request={confirmTarget}
          onClose={() => setConfirmTarget(null)}
          onSubmit={handleConfirmPayment}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
};
