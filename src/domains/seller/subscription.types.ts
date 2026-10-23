export type SubscriptionPlanCurrency = "DZD";

export interface SubscriptionPlanLimits {
  maxPages: number;
  maxCustomSections: number;
  customDomainAllowed: boolean;
  tiktokAdsAllowed: boolean;
  analyticsAdvanced: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: SubscriptionPlanCurrency;
  durationDays: number;
  features: string[];
  limits: SubscriptionPlanLimits;
  badge?: string;
  isPopular?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionRequestStatus =
  | "pending"
  | "payment_requested"
  | "payment_declared"
  | "payment_confirmed"
  | "granted"
  | "rejected"
  | "cancelled";

export interface BankPaymentInstructions {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  rib: string;
  referenceCode: string;
  amount: number;
  currency: SubscriptionPlanCurrency;
  instructions: string;
  requestedAt: string;
  requestedByAdminId: string;
}

export interface PaymentProof {
  transactionReference: string;
  paymentDate: string;
  proofFileUrl?: string;
  receiptNote?: string;
  submittedAt: string;
}

export interface PaymentConfirmation {
  confirmedAt: string;
  confirmedByAdminId: string;
  confirmedAmount: number;
  verificationNotes?: string;
}

export interface GrantDetails {
  grantedAt: string;
  grantedByAdminId: string;
  subscriptionId: string;
  grantNotes?: string;
}

export interface SubscriptionRequest {
  id: string;
  sellerId: string;
  shopName: string;
  sellerEmail: string;
  planId: string;
  planSnapshot: {
    name: string;
    price: number;
    currency: SubscriptionPlanCurrency;
    durationDays: number;
    features: string[];
    limits: SubscriptionPlanLimits;
  };
  status: SubscriptionRequestStatus;
  paymentInstructions?: BankPaymentInstructions;
  paymentProof?: PaymentProof;
  paymentConfirmation?: PaymentConfirmation;
  grantDetails?: GrantDetails;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus = "active" | "expired" | "suspended";

export interface SellerSubscription {
  id: string;
  sellerId: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  permissions: string[];
  limits: SubscriptionPlanLimits;
  startDate: string;
  endDate: string;
  grantedByAdminId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionStatusSummary {
  hasActiveSubscription: boolean;
  subscription: SellerSubscription | null;
  daysRemaining: number;
  permissions: string[];
  limits: SubscriptionPlanLimits | null;
  pendingRequest: SubscriptionRequest | null;
}
