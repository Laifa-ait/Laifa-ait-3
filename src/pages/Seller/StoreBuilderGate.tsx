import React, { useEffect, useState, useCallback } from "react";
import { LayoutTemplate, RefreshCw, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { subscriptionApi } from "../../services/api/subscription.api";
import {
  SubscriptionStatusSummary,
  SubscriptionPlan
} from "../../domains/seller/subscription.types";

import { StoreBuilderLocked } from "./StoreBuilder/StoreBuilderLocked";
import { StoreBuilderPending } from "./StoreBuilder/StoreBuilderPending";
import { StoreBuilderPaymentRequested } from "./StoreBuilder/StoreBuilderPaymentRequested";
import { StoreBuilderVerificationPending } from "./StoreBuilder/StoreBuilderVerificationPending";
import { StoreBuilderActive } from "./StoreBuilder/StoreBuilderActive";

export const StoreBuilderGate: React.FC = () => {
  const { currentUser } = useAuth();
  const [statusSummary, setStatusSummary] = useState<SubscriptionStatusSummary | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleRequestPlan = async (planId: string) => {
    setActionLoading(true);
    try {
      await subscriptionApi.requestSubscription(planId);
      await loadStatus();
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitProof = async (payload: {
    requestId: string;
    transactionReference: string;
    paymentDate: string;
    proofFileUrl?: string;
    receiptNote?: string;
  }) => {
    setActionLoading(true);
    try {
      await subscriptionApi.declarePayment(payload);
      await loadStatus();
    } finally {
      setActionLoading(false);
    }
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
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900">Construction de ma page</h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Studio de personnalisation visuelle avancée, sections modulaires et bannières promotionnelles.
          </p>
        </div>

        <button
          onClick={loadStatus}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Dispatch based on real subscription lifecycle */}
      {statusSummary?.hasActiveSubscription && activeSub ? (
        <StoreBuilderActive
          subscription={activeSub}
          daysRemaining={statusSummary.daysRemaining}
          sellerId={currentUser?.uid}
        />
      ) : pendingReq?.status === "pending" ? (
        <StoreBuilderPending request={pendingReq} onRefresh={loadStatus} />
      ) : pendingReq?.status === "payment_requested" ? (
        <StoreBuilderPaymentRequested
          request={pendingReq}
          onSubmitProof={handleSubmitProof}
          isLoading={actionLoading}
        />
      ) : pendingReq?.status === "payment_declared" || pendingReq?.status === "payment_confirmed" ? (
        <StoreBuilderVerificationPending
          request={pendingReq}
          onRefresh={loadStatus}
          isLoading={actionLoading}
        />
      ) : (
        <StoreBuilderLocked
          plans={plans}
          onRequestPlan={handleRequestPlan}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
};
