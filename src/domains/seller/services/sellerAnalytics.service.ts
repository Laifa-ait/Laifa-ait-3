import { db } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";

export interface OrderStatusBreakdown {
  created: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  returned: number;
}

export interface TrafficSources {
  direct: number;
  search: number;
  social: number;
  sponsored: number;
}

export interface AnalyticsTopProduct {
  id: string;
  name: string;
  salesCount: number;
  revenue: number;
  viewsCount: number;
  image?: string;
}

export interface SellerAnalyticsData {
  orderedRevenue: number;
  deliveredRevenue: number;
  totalOrders: number;
  aov: number;
  conversionRate: number;
  trackingAvailable: boolean;
  storeViews: number;
  productViews: number;
  cartAdds: number;
  statusBreakdown: OrderStatusBreakdown;
  trafficSources: TrafficSources;
  topProducts: AnalyticsTopProduct[];
  chartData: Array<{ name: string; ordered: number; delivered: number; orders: number }>;
  followersCount: number;
  reviewsCount: number;
  averageRating: number;
}

export class SellerAnalyticsService {
  /**
   * Calcul déterministe et pur des métriques de revenus COD
   */
  static calculateRevenueBreakdown(orders: Array<{ total?: unknown; totalPrice?: unknown; status?: unknown }>): {
    orderedRevenue: number;
    deliveredRevenue: number;
    statusBreakdown: OrderStatusBreakdown;
  } {
    let orderedRevenue = 0;
    let deliveredRevenue = 0;

    const statusBreakdown: OrderStatusBreakdown = {
      created: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
    };

    orders.forEach((o) => {
      const amount = Number(o.total ?? o.totalPrice) || 0;
      const status = (typeof o.status === "string" ? o.status : "created").toLowerCase();

      if (status === "delivered") {
        deliveredRevenue += amount;
        statusBreakdown.delivered += 1;
        orderedRevenue += amount;
      } else if (status === "cancelled") {
        statusBreakdown.cancelled += 1;
      } else if (status === "returned") {
        statusBreakdown.returned += 1;
      } else if (status === "confirmed" || status === "processing") {
        orderedRevenue += amount;
        statusBreakdown.confirmed += 1;
      } else if (status === "shipped") {
        orderedRevenue += amount;
        statusBreakdown.shipped += 1;
      } else {
        // created / pending
        orderedRevenue += amount;
        statusBreakdown.created += 1;
      }
    });

    return { orderedRevenue, deliveredRevenue, statusBreakdown };
  }

  /**
   * Calcul du taux de conversion sécurisé sans division par zéro
   */
  static calculateConversionRate(ordersCount: number, storeViews: number): number {
    if (!storeViews || storeViews <= 0) return 0;
    const rate = (ordersCount / storeViews) * 100;
    return Number(Math.min(100, Math.max(0, rate)).toFixed(2));
  }

  /**
   * Contrôle d'accès IDOR strict
   */
  static verifySellerAccess(authenticatedUid: string, targetSellerId: string): void {
    if (authenticatedUid !== targetSellerId) {
      const err = new Error("Accès refusé : vous ne pouvez consulter que vos propres analyses.");
      (err as Error & { statusCode?: number }).statusCode = 403;
      throw err;
    }
  }

  /**
   * Récupère l'ensemble des analyses consolidées pour un vendeur
   */
  static async getSellerAnalytics(sellerId: string, period: string = "7d"): Promise<SellerAnalyticsData> {
    try {
      // 1. Récupération des commandes
      const ordersSnap = await db
        .collection("orders")
        .where("sellerIds", "array-contains", sellerId)
        .limit(500)
        .get();

      const allOrders = ordersSnap.docs.map((doc) => {
        const data = doc.data();
        return { total: data.total, totalPrice: data.totalPrice, status: data.status, createdAt: data.createdAt };
      });
      const periodDays: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
      const days = periodDays[period];
      const cutoff = days ? Date.now() - days * 24 * 60 * 60 * 1000 : 0;
      const orders = allOrders.filter((order) => {
        if (!days) return true;
        const value = order.createdAt as { toDate?: () => Date } | string | number | undefined;
        const timestamp = value && typeof value === "object" && typeof value.toDate === "function" ? value.toDate().getTime() : value ? new Date(value as string | number).getTime() : 0;
        return timestamp >= cutoff;
      });
      const { orderedRevenue, deliveredRevenue, statusBreakdown } = this.calculateRevenueBreakdown(orders);
      const totalOrders = orders.length;
      const deliveredCount = statusBreakdown.delivered;
      const aov = deliveredCount > 0 ? Math.round(deliveredRevenue / deliveredCount) : 0;

      // 2. Compteurs réels du profil vendeur
      let followersCount = 0;
      let reviewsCount = 0;
      let averageRating = 0;

      const userDoc = await db.collection("users").doc(sellerId).get();
      if (userDoc.exists) {
        const uData = userDoc.data() || {};
        followersCount = Number(uData.followersCount) || 0;
        reviewsCount = Number(uData.reviewsCount) || 0;
        averageRating = Number(uData.rating) || 0;
      }

      // Les événements de consultation et d'ajout au panier ne sont pas encore enregistrés.
      // Signaler leur absence au lieu de présenter des chiffres ou une conversion inventés.
      const trackingAvailable = false;
      const storeViews = 0;
      const productViews = 0;
      const cartAdds = 0;
      const conversionRate = 0;
      const trafficSources: TrafficSources = { direct: 0, search: 0, social: 0, sponsored: 0 };

      // 4. Top Produits
      const productsSnap = await db
        .collection("products")
        .where("sellerId", "==", sellerId)
        .where("status", "==", "active")
        .limit(20)
        .get();

      const topProducts: AnalyticsTopProduct[] = productsSnap.docs.map((d) => {
        const p = d.data();
        return {
          id: d.id,
          name: p.name || "Produit",
          salesCount: Number(p.salesCount) || 0,
          revenue: Number(p.salesCount || 0) * Number(p.price || 0),
          viewsCount: Number(p.viewsCount) || 0,
          image: Array.isArray(p.images) && p.images[0] ? p.images[0] : p.imageUrl || undefined,
        };
      });

      topProducts.sort((a, b) => b.salesCount - a.salesCount);

      // Pas de série temporelle exacte disponible tant que la date des commandes n'est pas agrégée ici.
      const chartData: SellerAnalyticsData["chartData"] = [];

      return {
        orderedRevenue,
        deliveredRevenue,
        totalOrders,
        aov,
        conversionRate,
        trackingAvailable,
        storeViews,
        productViews,
        cartAdds,
        statusBreakdown,
        trafficSources,
        topProducts: topProducts.slice(0, 5),
        chartData,
        followersCount,
        reviewsCount,
        averageRating,
      };
    } catch (err: unknown) {
      safeLogger.error("[SellerAnalyticsService] Erreur d'agrégation analytics", {
        sellerId,
        err: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }

  /**
   * Suivre ou ne plus suivre une boutique
   */
  static async toggleFollowStore(sellerId: string, followerUid: string): Promise<{ isFollowing: boolean; followersCount: number }> {
    const followDocRef = db.collection("user_store_follows").doc(`${followerUid}_${sellerId}`);
    const sellerDocRef = db.collection("users").doc(sellerId);
    const storeConfigRef = db.collection("store_configs").doc(sellerId);

    return db.runTransaction(async (t) => {
      const followDoc = await t.get(followDocRef);
      const isFollowing = followDoc.exists;

      const sellerDoc = await t.get(sellerDocRef);
      let currentCount = 0;
      if (sellerDoc.exists) {
        currentCount = Number(sellerDoc.data()?.followersCount) || 0;
      }

      if (isFollowing) {
        t.delete(followDocRef);
        const newCount = Math.max(0, currentCount - 1);
        t.set(sellerDocRef, { followersCount: newCount }, { merge: true });
        t.set(storeConfigRef, { followersCount: newCount }, { merge: true });
        return { isFollowing: false, followersCount: newCount };
      } else {
        t.set(followDocRef, {
          followerId: followerUid,
          sellerId,
          createdAt: new Date().toISOString(),
        });
        const newCount = currentCount + 1;
        t.set(sellerDocRef, { followersCount: newCount }, { merge: true });
        t.set(storeConfigRef, { followersCount: newCount }, { merge: true });
        return { isFollowing: true, followersCount: newCount };
      }
    });
  }

  /**
   * Enregistre un événement analytique léger non-bloquant
   */
  static async trackStoreEvent(sellerId: string, event: { eventType: string; productId?: string; source?: string }): Promise<void> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const analyticsDocRef = db.collection("seller_analytics").doc(sellerId);
      const fieldToIncrement =
        event.eventType === "store_view"
          ? "storeViews"
          : event.eventType === "product_view"
          ? "productViews"
          : event.eventType === "cart_add"
          ? "cartAdds"
          : "otherEvents";

      await analyticsDocRef.set(
        {
          lastUpdated: new Date().toISOString(),
          lastDate: today,
          [fieldToIncrement]: db.constructor ? (db as unknown as { FieldValue: { increment: (n: number) => unknown } }).FieldValue?.increment(1) ?? 1 : 1,
        },
        { merge: true }
      );
    } catch (e) {
      safeLogger.warn("[SellerAnalytics] Non-fatal tracking event error", { sellerId, event, err: String(e) });
    }
  }
}
