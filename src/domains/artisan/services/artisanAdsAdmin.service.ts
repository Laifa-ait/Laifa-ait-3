import { db } from "../../../config/firebase-admin";
import {
  ArtisanAdCampaign,
  ArtisanAdStatus,
  ArtisanAdsAdminSummary,
  AdminCreateSponsorAdPayload,
  INDIVIDUAL_ARTISAN_AD_PACKS,
} from "../../../types/artisanAds";
import { invalidateArtisanAdsCache } from "./artisanAds.service";

const ADS_COLLECTION = "artisan_ad_campaigns";

export class ArtisanAdsAdminService {
  static async listAll(): Promise<{
    campaigns: ArtisanAdCampaign[];
    summary: ArtisanAdsAdminSummary;
  }> {
    if (!db) {
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

    const snap = await db.collection(ADS_COLLECTION).limit(150).get();
    const campaigns = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<ArtisanAdCampaign, "id">) }))
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

    let totalRevenueDzd = 0;
    let pendingRevenueDzd = 0;
    let activeCampaignsCount = 0;
    let pendingPaymentCount = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalLeads = 0;

    for (const c of campaigns) {
      if (c.status === "active" || c.status === "ended" || c.status === "paused") {
        totalRevenueDzd += c.billingModel === "flat_pack" ? c.budgetDzd || 0 : c.spentDzd || 0;
      }
      if (c.status === "pending_payment") {
        pendingPaymentCount += 1;
        pendingRevenueDzd += c.budgetDzd || 0;
      }
      if (c.status === "active") activeCampaignsCount += 1;
      totalImpressions += c.impressions || 0;
      totalClicks += c.clicks || 0;
      totalLeads += c.leadsCount || 0;
    }

    const avgCtrPercent =
      totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;

    return {
      campaigns,
      summary: {
        totalRevenueDzd: Math.round(totalRevenueDzd),
        pendingRevenueDzd: Math.round(pendingRevenueDzd),
        activeCampaignsCount,
        pendingPaymentCount,
        totalImpressions,
        totalClicks,
        avgCtrPercent,
        totalLeads,
      },
    };
  }

  static async createSponsorAd(
    adminUid: string,
    payload: AdminCreateSponsorAdPayload
  ): Promise<{ success: boolean; data?: ArtisanAdCampaign; error?: string }> {
    if (!db) return { success: false, error: "Base de données indisponible" };

    const now = new Date();
    const days = Math.max(1, Math.min(365, Number(payload.durationDays) || 30));
    const ends = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const campaignData: Omit<ArtisanAdCampaign, "id"> = {
      ownerType: payload.ownerType,
      ownerUserId: adminUid,
      advertiserName: payload.advertiserName.trim(),
      format: payload.format,
      billingModel: payload.billingModel,
      status: "active",
      title: payload.title.trim(),
      description: payload.description.trim(),
      ctaLabel: payload.ctaLabel.trim() || "Découvrir",
      targetUrl: payload.targetUrl.trim(),
      imageUrl: payload.imageUrl?.trim() || "",
      targetTrades: payload.targetTrades.length > 0 ? payload.targetTrades : ["all"],
      targetWilayas: payload.targetWilayas.length > 0 ? payload.targetWilayas : ["all"],
      budgetDzd: Number(payload.budgetDzd) || 0,
      spentDzd: 0,
      unitPriceDzd: payload.unitPriceDzd ? Number(payload.unitPriceDzd) : undefined,
      tierWeight: 1.5,
      qualityScore: 90,
      adRankScore: 135,
      impressions: 0,
      clicks: 0,
      leadsCount: 0,
      startsAt: now.toISOString(),
      endsAt: ends.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const ref = await db.collection(ADS_COLLECTION).add(campaignData);
    invalidateArtisanAdsCache();
    return { success: true, data: { id: ref.id, ...campaignData } };
  }

  static async updateStatus(
    campaignId: string,
    status: ArtisanAdStatus
  ): Promise<{ success: boolean; error?: string }> {
    if (!db) return { success: false, error: "Base de données indisponible" };
    const docRef = db.collection(ADS_COLLECTION).doc(campaignId);
    const snap = await docRef.get();
    if (!snap.exists) return { success: false, error: "Campagne introuvable" };

    const existing = snap.data() as ArtisanAdCampaign;
    const updates: Record<string, unknown> = { status, updatedAt: new Date().toISOString() };

    if (status === "active" && existing.status === "pending_payment") {
      const pack = INDIVIDUAL_ARTISAN_AD_PACKS.find((p) => p.id === existing.packId);
      const days = pack?.durationDays || 7;
      const now = new Date();
      updates.startsAt = now.toISOString();
      updates.endsAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
    }

    await docRef.update(updates);
    invalidateArtisanAdsCache();
    return { success: true };
  }
}
