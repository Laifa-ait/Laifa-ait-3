import React, { useEffect, useState, useCallback } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { subscriptionApi } from "../../services/api/subscription.api";
import {
  SubscriptionStatusSummary,
  SubscriptionPlan,
} from "../../domains/seller/subscription.types";

import { StoreBuilderActive } from "./StoreBuilder/StoreBuilderActive";

export const StoreBuilderGate: React.FC = () => {
  const { currentUser } = useAuth();
  const [statusSummary, setStatusSummary] = useState<SubscriptionStatusSummary | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isSyncingStatus, setIsSyncingStatus] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async (showSyncIndicator = true) => {
    try {
      if (showSyncIndicator) setIsSyncingStatus(true);
      setError(null);
      const [summary, availablePlans] = await Promise.all([
        subscriptionApi.getSellerStatus(),
        subscriptionApi.getAvailablePlans(),
      ]);
      setStatusSummary(summary);
      setPlans(availablePlans);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement du statut.");
    } finally {
      if (showSyncIndicator) setIsSyncingStatus(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleRequestPlan = async (planId: string) => {
    await subscriptionApi.requestSubscription(planId);
    await loadStatus(false);
  };

  const handleSubmitProof = async (payload: {
    requestId: string;
    transactionReference: string;
    paymentDate: string;
    proofFileUrl?: string;
    receiptNote?: string;
  }) => {
    await subscriptionApi.declarePayment(payload);
    await loadStatus(false);
  };

  const activeSub = statusSummary?.subscription;
  const pendingReq = statusSummary?.pendingRequest;

  return (
    <div className="h-full">
      {isSyncingStatus && (
        <div className="flex items-center justify-end gap-1.5 px-3 py-1 text-[11px] text-zinc-500 bg-zinc-50/80 border-b border-zinc-100">
          <RefreshCw className="w-3 h-3 animate-spin text-orange-500" />
          <span>Synchronisation de votre abonnement en arrière-plan...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl mb-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Creation First: Store Builder mounts immediately without blocking on subscription API calls */}
      <StoreBuilderActive
        subscription={activeSub || undefined}
        hasActiveSubscription={Boolean(activeSub)}
        daysRemaining={statusSummary?.daysRemaining ?? 0}
        sellerId={currentUser?.uid}
        plans={plans}
        pendingRequest={pendingReq}
        onRequestPlan={handleRequestPlan}
        onSubmitProof={handleSubmitProof}
        onRefreshStatus={() => loadStatus(false)}
      />
    </div>
  );
};
