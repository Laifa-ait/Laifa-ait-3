import { apiGet, apiPost, apiPut } from "../lib/api";
import { fetchWithClientCache, invalidateClientReadCache } from "../utils/clientReadCache";
import {
  ArtisanAdCampaign,
  ArtisanAdPack,
  ArtisanAdStatus,
  ArtisanAdsAdminSummary,
  ArtisanQualityBreakdown,
  ArtisanSponsoredFeedResponse,
  AdminCreateSponsorAdPayload,
  CreateArtisanBoostPayload,
  INDIVIDUAL_ARTISAN_AD_PACKS,
} from "../types/artisanAds";

const EMPTY_FEED: ArtisanSponsoredFeedResponse = {
  lsaArtisans: [],
  contextualAds: [],
  inFeedBanners: [],
  boostedArtisanIds: {},
};

const trackedImpressions = new Set<string>();

export async function fetchArtisanSponsoredFeed(filters: {
  tradeId?: string;
  wilaya?: string;
  urgencyOnly?: boolean;
}): Promise<ArtisanSponsoredFeedResponse> {
  const params = new URLSearchParams();
  if (filters.tradeId) params.set("tradeId", filters.tradeId);
  if (filters.wilaya) params.set("wilaya", filters.wilaya);
  if (filters.urgencyOnly) params.set("urgency", "true");

  const qs = params.toString();
  const cacheKey = `artisans:ads:feed:${qs || "all"}`;

  try {
    return await fetchWithClientCache<ArtisanSponsoredFeedResponse>(
      cacheKey,
      async () => {
        const res = await apiGet<{ success: boolean; data: ArtisanSponsoredFeedResponse }>(
          `/api/v1/artisans/ads/feed${qs ? `?${qs}` : ""}`
        );
        return res?.data || EMPTY_FEED;
      },
      3 * 60 * 1000
    );
  } catch {
    return EMPTY_FEED;
  }
}

export function trackArtisanAdEvent(
  campaignId: string,
  eventType: "impression" | "click" | "lead"
): void {
  if (!campaignId) return;
  if (eventType === "impression") {
    if (trackedImpressions.has(campaignId)) return;
    trackedImpressions.add(campaignId);
  }

  fetch("/api/v1/artisans/ads/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ campaignId, eventType }),
  }).catch(() => {
    // Non-blocking ad telemetry
  });
}

export async function fetchMyArtisanAdDashboard(): Promise<{
  campaigns: ArtisanAdCampaign[];
  quality: ArtisanQualityBreakdown;
  packs: ArtisanAdPack[];
} | null> {
  try {
    const res = await apiGet<{
      success: boolean;
      data: {
        campaigns: ArtisanAdCampaign[];
        quality: ArtisanQualityBreakdown;
        packs: ArtisanAdPack[];
      };
    }>("/api/v1/artisans/ads/my-campaigns");
    return (
      res?.data || {
        campaigns: [],
        quality: { score: 50, items: [] },
        packs: INDIVIDUAL_ARTISAN_AD_PACKS,
      }
    );
  } catch {
    return null;
  }
}

export async function createMyArtisanBoost(
  payload: CreateArtisanBoostPayload
): Promise<{ success: boolean; data?: ArtisanAdCampaign; error?: string }> {
  const res = await apiPost<{ success: boolean; data?: ArtisanAdCampaign; error?: string }>(
    "/api/v1/artisans/ads/campaigns",
    payload
  );
  if (res?.success) {
    invalidateClientReadCache("artisans:ads:");
  }
  return res;
}

export async function toggleMyArtisanBoost(
  campaignId: string
): Promise<{ success: boolean; data?: { status: ArtisanAdStatus }; error?: string }> {
  const res = await apiPut<{
    success: boolean;
    data?: { status: ArtisanAdStatus };
    error?: string;
  }>(`/api/v1/artisans/ads/campaigns/${encodeURIComponent(campaignId)}/toggle`, {});
  if (res?.success) {
    invalidateClientReadCache("artisans:ads:");
  }
  return res;
}

export async function adminFetchArtisanAds(): Promise<{
  campaigns: ArtisanAdCampaign[];
  summary: ArtisanAdsAdminSummary;
}> {
  try {
    const res = await apiGet<{
      success: boolean;
      data: { campaigns: ArtisanAdCampaign[]; summary: ArtisanAdsAdminSummary };
    }>("/api/v1/artisans/admin/ads");
    return (
      res?.data || {
        campaigns: [],
        summary: {
          totalRevenueDzd: 0,
          pendingRevenueDzd: 0,
          activeCampaignsCount: 0,
          pendingPaymentCount: 0,
          totalImpressions: 0,
          totalClicks: 0,
          avgCtrPercent: 0,
          totalLeads: 0,
        },
      }
    );
  } catch {
    return {
      campaigns: [],
      summary: {
        totalRevenueDzd: 0,
        pendingRevenueDzd: 0,
        activeCampaignsCount: 0,
        pendingPaymentCount: 0,
        totalImpressions: 0,
        totalClicks: 0,
        avgCtrPercent: 0,
        totalLeads: 0,
      },
    };
  }
}

export async function adminCreateArtisanSponsorAd(
  payload: AdminCreateSponsorAdPayload
): Promise<{ success: boolean; data?: ArtisanAdCampaign; error?: string }> {
  const res = await apiPost<{ success: boolean; data?: ArtisanAdCampaign; error?: string }>(
    "/api/v1/artisans/admin/ads",
    payload
  );
  if (res?.success) {
    invalidateClientReadCache("artisans:ads:");
  }
  return res;
}

export async function adminUpdateArtisanAdStatus(
  campaignId: string,
  status: ArtisanAdStatus
): Promise<{ success: boolean; error?: string }> {
  const res = await apiPut<{ success: boolean; error?: string }>(
    `/api/v1/artisans/admin/ads/${encodeURIComponent(campaignId)}/status`,
    { status }
  );
  if (res?.success) {
    invalidateClientReadCache("artisans:ads:");
  }
  return res;
}
