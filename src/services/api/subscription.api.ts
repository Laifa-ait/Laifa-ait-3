import { apiGet, apiPost, apiPut } from "../../lib/api";
import {
  SubscriptionPlan,
  SubscriptionRequest,
  SubscriptionStatusSummary,
  BankPaymentInstructions
} from "../../domains/seller/subscription.types";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export const subscriptionApi = {
  // --- SELLER ENDPOINTS ---
  getSellerStatus: async (): Promise<SubscriptionStatusSummary> => {
    const res = await apiGet<ApiResponse<SubscriptionStatusSummary>>("/api/v1/seller/subscription/status");
    return res.data;
  },

  getAvailablePlans: async (): Promise<SubscriptionPlan[]> => {
    const res = await apiGet<ApiResponse<SubscriptionPlan[]>>("/api/v1/seller/subscription/plans");
    return res.data;
  },

  requestSubscription: async (planId: string): Promise<SubscriptionRequest> => {
    const res = await apiPost<ApiResponse<SubscriptionRequest>>("/api/v1/seller/subscription/request", { planId });
    return res.data;
  },

  declarePayment: async (payload: {
    requestId: string;
    transactionReference: string;
    paymentDate: string;
    proofFileUrl?: string;
    receiptNote?: string;
  }): Promise<SubscriptionRequest> => {
    const res = await apiPost<ApiResponse<SubscriptionRequest>>("/api/v1/seller/subscription/declare-payment", payload);
    return res.data;
  },

  getSellerHistory: async (): Promise<SubscriptionRequest[]> => {
    const res = await apiGet<ApiResponse<SubscriptionRequest[]>>("/api/v1/seller/subscription/history");
    return res.data;
  },

  // --- ADMIN ENDPOINTS ---
  getAdminPlans: async (): Promise<SubscriptionPlan[]> => {
    const res = await apiGet<ApiResponse<SubscriptionPlan[]>>("/api/v1/admin/subscriptions/plans");
    return res.data;
  },

  upsertAdminPlan: async (planData: Partial<SubscriptionPlan> & { id?: string }): Promise<SubscriptionPlan> => {
    if (planData.id) {
      const res = await apiPut<ApiResponse<SubscriptionPlan>>(`/api/v1/admin/subscriptions/plans/${planData.id}`, planData);
      return res.data;
    }
    const res = await apiPost<ApiResponse<SubscriptionPlan>>("/api/v1/admin/subscriptions/plans", planData);
    return res.data;
  },

  getAdminRequests: async (statusFilter?: string): Promise<SubscriptionRequest[]> => {
    const query = statusFilter && statusFilter !== "all" ? `?status=${encodeURIComponent(statusFilter)}` : "";
    const res = await apiGet<ApiResponse<SubscriptionRequest[]>>(`/api/v1/admin/subscriptions/requests${query}`);
    return res.data;
  },

  sendPaymentInstructions: async (
    requestId: string,
    instructions: Omit<BankPaymentInstructions, "requestedAt" | "requestedByAdminId">
  ): Promise<SubscriptionRequest> => {
    const res = await apiPost<ApiResponse<SubscriptionRequest>>(
      `/api/v1/admin/subscriptions/requests/${requestId}/request-payment`,
      instructions
    );
    return res.data;
  },

  confirmPaymentReceived: async (
    requestId: string,
    confirmedAmount: number,
    notes?: string
  ): Promise<SubscriptionRequest> => {
    const res = await apiPost<ApiResponse<SubscriptionRequest>>(
      `/api/v1/admin/subscriptions/requests/${requestId}/confirm-payment`,
      { confirmedAmount, notes }
    );
    return res.data;
  },

  grantSubscription: async (
    requestId: string,
    notes?: string
  ): Promise<{ request: SubscriptionRequest; subscription: unknown }> => {
    const res = await apiPost<ApiResponse<{ request: SubscriptionRequest; subscription: unknown }>>(
      `/api/v1/admin/subscriptions/requests/${requestId}/grant`,
      { notes }
    );
    return res.data;
  },

  rejectRequest: async (requestId: string, reason: string): Promise<SubscriptionRequest> => {
    const res = await apiPost<ApiResponse<SubscriptionRequest>>(
      `/api/v1/admin/subscriptions/requests/${requestId}/reject`,
      { reason }
    );
    return res.data;
  }
};
