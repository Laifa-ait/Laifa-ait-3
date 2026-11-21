import { FieldValue } from "firebase-admin/firestore";
import { db } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";
import { ArtisanProfile } from "../../../types/artisan";
import {
  ArtisanAdCampaign,
  ArtisanAdStatus,
  ArtisanQualityBreakdown,
  ArtisanSponsoredFeedResponse,
  ArtisanSponsoredLsaItem,
  CreateArtisanBoostPayload,
  INDIVIDUAL_ARTISAN_AD_PACKS,
} from "../../../types/artisanAds";
import { ArtisanPublicService } from "./artisanPublic.service";

const ADS_COLLECTION = "artisan_ad_campaigns";
const CACHE_TTL_MS = 3 * 60 * 1000;

let activeCampaignsCache: { data: ArtisanAdCampaign[]; expiresAt: number } | null = null;

export function invalidateArtisanAdsCache(): void {
  activeCampaignsCache = null;
}

export function computeArtisanQualityBreakdown(profile: ArtisanProfile): ArtisanQualityBreakdown {
  const items = [
    {
      key: "approved",
      label: "Profil vérifié par l'équipe",
      points: profile.status === "approved" ? 25 : 0,
      maxPoints: 25,
      completed: profile.status === "approved",
    },
    {
      key: "available",
      label: "Statut « Disponible » activé",
      points: profile.isAvailable ? 15 : 0,
      maxPoints: 15,
      completed: Boolean(profile.isAvailable),
    },
    {
      key: "rating",
      label: "Note clients élevée (≥ 4.2★)",
      points: (profile.rating || 5) >= 4.2 ? 20 : 10,
      maxPoints: 20,
      completed: (profile.rating || 5) >= 4.2,
    },
    {
      key: "services",
      label: "Au moins 1 prestation tarifée",
      points: (profile.services?.length || 0) > 0 ? 15 : 0,
      maxPoints: 15,
      completed: (profile.services?.length || 0) > 0,
    },
    {
      key: "portfolio",
      label: "Photos de réalisations ajoutées",
      points: (profile.portfolio?.length || 0) > 0 ? 15 : 0,
      maxPoints: 15,
      completed: (profile.portfolio?.length || 0) > 0,
    },
    {
      key: "bio",
      label: "Présentation claire (> 25 caractères)",
      points: (profile.bio?.trim().length || 0) >= 25 ? 10 : 0,
      maxPoints: 10,
      completed: (profile.bio?.trim().length || 0) >= 25,
    },
  ];

  const score = Math.min(
    100,
    Math.max(20, items.reduce((sum, item) => sum + item.points, 0))
  );
  return { score, items };
}

function matchesTarget(targets: string[] | undefined, value?: string): boolean {
  if (!value) return true;
  if (!targets || targets.length === 0 || targets.includes("all")) return true;
  const normalized = value.trim().toLowerCase();
  return targets.some((t) => t.trim().toLowerCase() === normalized);
}

export class ArtisanAdsService {
  static async getActiveCampaignsCached(): Promise<ArtisanAdCampaign[]> {
    if (!db) return [];
    const nowMs = Date.now();
    if (activeCampaignsCache && activeCampaignsCache.expiresAt > nowMs) {
      return activeCampaignsCache.data;
    }

    try {
      const snap = await db
        .collection(ADS_COLLECTION)
        .where("status", "==", "active")
        .limit(100)
        .get();

      const nowIso = new Date().toISOString();
      const campaigns = snap.docs
        .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<ArtisanAdCampaign, "id">) }))
        .filter((c) => (!c.endsAt || c.endsAt >= nowIso) && (!c.startsAt || c.startsAt <= nowIso));

      activeCampaignsCache = { data: campaigns, expiresAt: nowMs + CACHE_TTL_MS };
      return campaigns;
    } catch (error) {
      safeLogger.error("[ArtisanAdsService] getActiveCampaignsCached error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  static async getSponsoredFeed(filters: {
    tradeId?: string;
    wilaya?: string;
    urgencyOnly?: boolean;
  }): Promise<ArtisanSponsoredFeedResponse> {
    const active = await this.getActiveCampaignsCached();
    const matched = active.filter(
      (c) => matchesTarget(c.targetTrades, filters.tradeId) && matchesTarget(c.targetWilayas, filters.wilaya)
    );

    const lsaCandidates = matched
      .filter((c) => c.ownerType === "artisan" && c.artisanId && (
        filters.urgencyOnly
          ? c.format === "urgency_spotlight" || c.format === "lsa_top_rank"
          : c.format === "lsa_top_rank" || c.format === "urgency_spotlight"
      ))
      .sort((a, b) => {
        const aBoost = filters.urgencyOnly && a.format === "urgency_spotlight" ? 1.5 : 1;
        const bBoost = filters.urgencyOnly && b.format === "urgency_spotlight" ? 1.5 : 1;
        return b.adRankScore * bBoost - a.adRankScore * aBoost;
      });

    const lsaArtisans: ArtisanSponsoredLsaItem[] = [];
    const boostedArtisanIds: ArtisanSponsoredFeedResponse["boostedArtisanIds"] = {};

    if (lsaCandidates.length > 0) {
      const approved = await ArtisanPublicService.listApprovedArtisans({
        tradeId: filters.tradeId,
        wilaya: filters.wilaya,
        limit: 60,
      });
      const byId = new Map(approved.map((a) => [a.id, a]));

      for (const campaign of lsaCandidates) {
        if (!campaign.artisanId) continue;
        const artisan = byId.get(campaign.artisanId);
        if (!artisan) continue;
        if (!boostedArtisanIds[artisan.id]) {
          boostedArtisanIds[artisan.id] = {
            campaignId: campaign.id,
            format: campaign.format,
            label: campaign.format === "urgency_spotlight" ? "Dispo aujourd'hui" : "Sponsorisé",
          };
        }
        if (lsaArtisans.length < 3 && !lsaArtisans.some((item) => item.artisan.id === artisan.id)) {
          lsaArtisans.push({ campaign, artisan });
        }
      }
    }

    const contextualAds = matched
      .filter((c) => c.format === "contextual_material_ad")
      .sort((a, b) => b.adRankScore - a.adRankScore)
      .slice(0, 4);

    const inFeedBanners = matched
      .filter((c) => c.format === "in_feed_native_banner")
      .sort((a, b) => b.adRankScore - a.adRankScore)
      .slice(0, 2);

    return { lsaArtisans, contextualAds, inFeedBanners, boostedArtisanIds };
  }

  static async createArtisanBoostCampaign(
    userId: string,
    profile: ArtisanProfile,
    payload: CreateArtisanBoostPayload
  ): Promise<{ success: boolean; data?: ArtisanAdCampaign; error?: string }> {
    if (!db) return { success: false, error: "Base de données indisponible" };

    const pack = INDIVIDUAL_ARTISAN_AD_PACKS.find((p) => p.id === payload.packId);
    if (!pack) return { success: false, error: "Pack publicitaire invalide" };

    const quality = computeArtisanQualityBreakdown(profile);
    const now = new Date();
    const ends = new Date(now.getTime() + pack.durationDays * 24 * 60 * 60 * 1000);
    const cleanWilayas =
      payload.targetWilayas.length > 0 ? payload.targetWilayas.slice(0, 3) : [profile.wilaya];

    const campaignData: Omit<ArtisanAdCampaign, "id"> = {
      ownerType: "artisan",
      ownerUserId: userId,
      artisanId: profile.id,
      advertiserName: profile.fullName,
      format: pack.format,
      billingModel: "flat_pack",
      status: "pending_payment",
      packId: pack.id,
      title: payload.headline?.trim() || `${profile.tradeName} — ${profile.fullName}`,
      description: profile.bio?.trim() || `Interventions ${profile.tradeName} à ${profile.commune}, ${profile.wilaya}.`,
      ctaLabel: "Demander un devis",
      targetTrades: [profile.tradeId],
      targetWilayas: cleanWilayas,
      budgetDzd: pack.priceDzd,
      spentDzd: 0,
      tierWeight: pack.tierWeight,
      qualityScore: quality.score,
      adRankScore: Number((pack.tierWeight * (quality.score / 100) * 100).toFixed(2)),
      impressions: 0,
      clicks: 0,
      leadsCount: 0,
      paymentReference: payload.paymentReference?.trim() || "",
      startsAt: now.toISOString(),
      endsAt: ends.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const ref = await db.collection(ADS_COLLECTION).add(campaignData);
    invalidateArtisanAdsCache();
    return { success: true, data: { id: ref.id, ...campaignData } };
  }

  static async listMyCampaigns(userId: string): Promise<ArtisanAdCampaign[]> {
    if (!db) return [];
    const snap = await db
      .collection(ADS_COLLECTION)
      .where("ownerUserId", "==", userId)
      .limit(30)
      .get();
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<ArtisanAdCampaign, "id">) }))
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }

  static async toggleOwnCampaign(
    userId: string,
    campaignId: string
  ): Promise<{ success: boolean; status?: ArtisanAdStatus; error?: string }> {
    if (!db) return { success: false, error: "Base de données indisponible" };
    const docRef = db.collection(ADS_COLLECTION).doc(campaignId);
    const snap = await docRef.get();
    if (!snap.exists) return { success: false, error: "Campagne introuvable" };

    const data = snap.data() as ArtisanAdCampaign;
    if (data.ownerUserId !== userId) {
      return { success: false, error: "Accès refusé à cette campagne" };
    }
    if (data.status !== "active" && data.status !== "paused") {
      return { success: false, error: "Seule une campagne active ou en pause peut être basculée" };
    }

    const nextStatus: ArtisanAdStatus = data.status === "active" ? "paused" : "active";
    await docRef.update({ status: nextStatus, updatedAt: new Date().toISOString() });
    invalidateArtisanAdsCache();
    return { success: true, status: nextStatus };
  }

  static async recordEvent(
    campaignId: string,
    eventType: "impression" | "click" | "lead"
  ): Promise<boolean> {
    if (!db || !campaignId) return false;
    const docRef = db.collection(ADS_COLLECTION).doc(campaignId);

    try {
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(docRef);
        if (!snap.exists) return;
        const c = snap.data() as ArtisanAdCampaign;
        if (c.status !== "active") return;

        const updates: Record<string, FieldValue | string | number> = { updatedAt: new Date().toISOString() };
        let costDelta = 0;

        if (eventType === "impression") {
          updates.impressions = FieldValue.increment(1);
          if (c.billingModel === "cpm" && c.unitPriceDzd) costDelta = c.unitPriceDzd / 1000;
        } else if (eventType === "click") {
          updates.clicks = FieldValue.increment(1);
          if (c.billingModel === "cpc" && c.unitPriceDzd) costDelta = c.unitPriceDzd;
        } else if (eventType === "lead") {
          updates.leadsCount = FieldValue.increment(1);
          if (c.billingModel === "cpl" && c.unitPriceDzd) costDelta = c.unitPriceDzd;
        }

        if (costDelta > 0) {
          const nextSpent = Number(((c.spentDzd || 0) + costDelta).toFixed(2));
          updates.spentDzd = nextSpent;
          if (c.budgetDzd > 0 && nextSpent >= c.budgetDzd) {
            updates.status = "ended";
          }
        }

        tx.update(docRef, updates);
      });
      return true;
    } catch (error) {
      safeLogger.warn("[ArtisanAdsService] recordEvent failed", {
        campaignId,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }
}
