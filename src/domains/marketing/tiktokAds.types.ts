export type CampaignChannel = "internal_olmart" | "tiktok_ads";
export type CampaignStatus = "draft" | "pending_approval" | "active" | "completed" | "paused";

export interface TikTokAdConnectorConfig {
  sellerId: string;
  pixelId?: string;
  advertiserId?: string;
  accessTokenConfigured: boolean;
  status: "connected" | "disconnected" | "pending_review";
  eventsTracked: Array<"PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "CompletePaymentCOD">;
  updatedAt: string;
}

export interface MarketingCampaignMetrics {
  impressions: number;
  clicks: number;
  conversionsCOD: number;
  spendDZD: number;
  roasEstimate: number;
}

export interface MarketingCampaign {
  id: string;
  sellerId: string;
  channel: CampaignChannel;
  title: string;
  budgetDZD: number;
  dailyBudgetDZD?: number;
  status: CampaignStatus;
  targetLandingPageId?: string;
  targetLandingPageSlug?: string;
  startDate: string;
  endDate?: string;
  tiktokCampaignId?: string;
  tiktokAdGroupId?: string;
  metrics: MarketingCampaignMetrics;
  createdAt: string;
  updatedAt: string;
}
