import { db } from "../../../config/firebase-admin";
import { Product } from "../../product/product.types";
import { SponsoredCampaign, SponsoredPlacement } from "../../../types/sponsoredCampaign";

export interface SellerPromoCampaign {
  id: string;
  sellerId: string;
  title: string;
  description?: string;
  discountType: "percentage" | "fixed_dzd";
  discountValue: number; // e.g. 15% or 500 DZD
  bannerUrl?: string;
  productIds: string[];
  startDate: string; // ISO string
  endDate: string; // ISO string
  status: "scheduled" | "active" | "ended" | "paused";
  eventsLog: Array<{
    timestamp: string;
    status: string;
    actor: string;
    details: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AdSpotConfig {
  id: SponsoredPlacement | "featured_store_card" | "homepage_spotlight" | "shop_top_bar" | "category_boost";
  title: string;
  description: string;
  pricePerDayDZD: number;
  packBronzeDZD: number; // 7 days
  packSilverDZD: number; // 14 days
  packGoldDZD: number; // 30 days
  estimatedDailyImpressions: string;
}

export const OLMART_AD_SPOTS: AdSpotConfig[] = [
  {
    id: "homepage_spotlight",
    title: "Vitrine En Vedette (Page d'Accueil)",
    description: "Emplacement premium tout en haut de la page d'accueil d'Olmart pour une visibilité maximale.",
    pricePerDayDZD: 1500,
    packBronzeDZD: 9500,
    packSilverDZD: 18000,
    packGoldDZD: 35000,
    estimatedDailyImpressions: "15 000+ vues/jour",
  },
  {
    id: "shop_top_bar",
    title: "Bannière Haute de Boutique",
    description: "Bannière sponsorisée affichée en haut des boutiques partenaires et du catalogue.",
    pricePerDayDZD: 1000,
    packBronzeDZD: 6500,
    packSilverDZD: 12000,
    packGoldDZD: 24000,
    estimatedDailyImpressions: "8 000+ vues/jour",
  },
  {
    id: "category_boost",
    title: "Boost de Catégorie & Recherche",
    description: "Positionne vos produits en tête de liste dans les résultats de recherche et catégories ciblé.",
    pricePerDayDZD: 800,
    packBronzeDZD: 5000,
    packSilverDZD: 9500,
    packGoldDZD: 18000,
    estimatedDailyImpressions: "6 000+ vues/jour",
  },
  {
    id: "featured_store_card",
    title: "Carte Boutique Recommandée",
    description: "Mise en avant de votre boutique dans la section 'Boutiques Vedettes' de l'annuaire Olmart.",
    pricePerDayDZD: 1200,
    packBronzeDZD: 7500,
    packSilverDZD: 14000,
    packGoldDZD: 28000,
    estimatedDailyImpressions: "10 000+ vues/jour",
  },
];

export class SellerMarketingService {
  /**
   * Helper to verify that all referenced products belong strictly to the seller (Anti-IDOR guard)
   */
  private static async verifyProductOwnership(sellerId: string, productIds: string[]): Promise<void> {
    if (!productIds || productIds.length === 0) return;

    const refs = productIds.map((id) => db.collection("products").doc(id));
    const snaps = await db.getAll(...refs);

    for (let i = 0; i < snaps.length; i++) {
      const snap = snaps[i];
      const pId = productIds[i];
      if (!snap.exists) {
        throw new Error(`Produit introuvable: ${pId}`);
      }
      const data = snap.data() as Product;
      if (data.sellerId !== sellerId) {
        const err = new Error(`Réfusé : le produit ${pId} ("${data.name}") appartient à un autre vendeur.`) as Error & { statusCode?: number };
        err.statusCode = 403;
        throw err;
      }
    }
  }

  // --- SELLER PROMO CAMPAIGNS ---

  public static async createPromoCampaign(
    sellerId: string,
    payload: {
      title: string;
      description?: string;
      discountType: "percentage" | "fixed_dzd";
      discountValue: number;
      bannerUrl?: string;
      productIds: string[];
      startDate: string;
      endDate: string;
    }
  ): Promise<SellerPromoCampaign> {
    // 1. Anti-IDOR check
    await this.verifyProductOwnership(sellerId, payload.productIds);

    const nowIso = new Date().toISOString();
    const nowMs = Date.now();
    const startMs = new Date(payload.startDate).getTime();
    const endMs = new Date(payload.endDate).getTime();

    if (isNaN(startMs) || isNaN(endMs) || endMs <= startMs) {
      throw new Error("Période promotionnelle invalide (la date de fin doit être supérieure à la date de début).");
    }

    let calculatedStatus: SellerPromoCampaign["status"] = "scheduled";
    if (startMs <= nowMs && endMs > nowMs) {
      calculatedStatus = "active";
    } else if (nowMs >= endMs) {
      calculatedStatus = "ended";
    }

    const docRef = db.collection("seller_promo_campaigns").doc();
    const campaign: SellerPromoCampaign = {
      id: docRef.id,
      sellerId,
      title: payload.title.trim(),
      description: payload.description?.trim() || "",
      discountType: payload.discountType,
      discountValue: Number(payload.discountValue),
      bannerUrl: payload.bannerUrl || "",
      productIds: payload.productIds,
      startDate: payload.startDate,
      endDate: payload.endDate,
      status: calculatedStatus,
      eventsLog: [
        {
          timestamp: nowIso,
          status: calculatedStatus,
          actor: "seller",
          details: `Création de la campagne promo par le vendeur ${sellerId}`,
        },
      ],
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await docRef.set(campaign);
    return campaign;
  }

  public static async listPromoCampaigns(sellerId: string): Promise<SellerPromoCampaign[]> {
    const snap = await db
      .collection("seller_promo_campaigns")
      .where("sellerId", "==", sellerId)
      .get();

    const nowMs = Date.now();
    const results: SellerPromoCampaign[] = [];

    for (const doc of snap.docs) {
      const c = doc.data() as SellerPromoCampaign;
      const startMs = new Date(c.startDate).getTime();
      const endMs = new Date(c.endDate).getTime();

      // Recalculate status dynamically
      let currentStatus = c.status;
      if (c.status !== "paused") {
        if (startMs <= nowMs && endMs > nowMs) {
          currentStatus = "active";
        } else if (nowMs >= endMs) {
          currentStatus = "ended";
        } else if (startMs > nowMs) {
          currentStatus = "scheduled";
        }
      }

      results.push({ ...c, status: currentStatus });
    }

    return results;
  }

  public static async deletePromoCampaign(sellerId: string, campaignId: string): Promise<void> {
    const ref = db.collection("seller_promo_campaigns").doc(campaignId);
    const snap = await ref.get();
    if (!snap.exists) {
      throw new Error("Campagne promotionnelle introuvable");
    }
    const data = snap.data() as SellerPromoCampaign;
    if (data.sellerId !== sellerId) {
      const err = new Error("Accès non autorisé") as Error & { statusCode?: number };
      err.statusCode = 403;
      throw err;
    }
    await ref.delete();
  }

  // --- OVERVIEW & ANALYTICS SUMMARY ---

  public static async getSellerMarketingOverview(sellerId: string) {
    const promos = await this.listPromoCampaigns(sellerId);
    const sponsoSnap = await db
      .collection("sponsored_campaigns")
      .where("sellerId", "==", sellerId)
      .get();

    const sponsoredCampaigns = sponsoSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as SponsoredCampaign[];

    let totalImpressions = 0;
    let totalClicks = 0;
    let totalSpentDZD = 0;
    let activeCount = 0;

    sponsoredCampaigns.forEach((c) => {
      totalImpressions += Number(c.impressions || 0);
      totalClicks += Number(c.clicks || 0);
      if (c.paymentStatus === "paid") {
        totalSpentDZD += Number(c.priceAmount || 0);
      }
      if (c.status === "active") {
        activeCount++;
      }
    });

    const activePromos = promos.filter((p) => p.status === "active");
    activeCount += activePromos.length;

    const ctrPct = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;

    // Collect all audit events
    const allEvents: Array<{ timestamp: string; campaignTitle: string; status: string; actor: string; details: string }> = [];

    promos.forEach((p) => {
      p.eventsLog?.forEach((e) => {
        allEvents.push({
          timestamp: e.timestamp,
          campaignTitle: p.title,
          status: e.status,
          actor: e.actor,
          details: e.details,
        });
      });
    });

    sponsoredCampaigns.forEach((sc) => {
      if (sc.createdAt) {
        allEvents.push({
          timestamp: typeof sc.createdAt === "string" ? sc.createdAt : new Date().toISOString(),
          campaignTitle: sc.productName ? `Sponsoring: ${sc.productName}` : `Campagne #${sc.id.substring(0, 6)}`,
          status: sc.status,
          actor: "system",
          details: `Créée le ${sc.startAt} pour ${sc.durationDays} jours (${sc.priceAmount} DZD)`,
        });
      }
    });

    allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      kpis: {
        activeCampaignsCount: activeCount,
        totalSpentDZD,
        totalImpressions,
        totalClicks,
        ctrPct,
        conversionsCount: Math.round(totalClicks * 0.08), // Estimated conversions
      },
      eventsLog: allEvents.slice(0, 20),
      adSpots: OLMART_AD_SPOTS,
    };
  }
}
