import React, { useEffect, useState, useCallback } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { subscriptionApi } from "../../services/api/subscription.api";
import {
  SubscriptionStatusSummary,
  SubscriptionPlan
} from "../../domains/seller/subscription.types";

import { StoreBuilderActive } from "./StoreBuilder/StoreBuilderActive";

export const StoreBuilderGate: React.FC = () => {
  const { currentUser } = useAuth();
  const [statusSummary, setStatusSummary] = useState<SubscriptionStatusSummary | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      setError(null);
      const [summary, availablePlans] = await Promise.all([
        subscriptionApi.getSellerStatus(),
        subscriptionApi.getAvailablePlans()
      ]);
      setStatusSummary(summary);
      setPlans(availablePlans);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement du statut.");
    } finally {
      if (showLoader) setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="p-12 text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-orange-600 mx-auto" />
        <p className="text-xs text-zinc-500">Chargement de votre espace Studio...</p>
      </div>
    );
  }

  const activeSub = statusSummary?.subscription;
  const pendingReq = statusSummary?.pendingRequest;

  return (
    <div className="h-full">
      {error && (
        <div className="flex items-center gap-2 p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl mb-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Creation First: Store Builder is immediately accessible to all sellers */}
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
