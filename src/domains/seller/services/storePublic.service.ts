import { db } from "../../../config/firebase-admin";
import { StoreConfig, StoreLayoutVersion } from "../customPage.types";
import { LegacyStoreAdapter } from "./legacyStore.adapter";
import { USER_STATUSES } from "../../user/user.status";

export interface PublicStorefrontResponse {
  sellerId: string;
  canonicalSlug: string;
  redirectToSlug?: string;
  storeConfig: StoreConfig;
  publishedLayout: StoreLayoutVersion;
  activeCoupons: unknown[];
  trustMetrics: {
    activeProductsCount: number;
    ratingAverage: number;
    reviewsCount: number;
    avgPreparationTime: string;
    codAvailable: boolean;
    wilaya: string;
  };
}

// In-memory cache for public storefronts (60s TTL)
const publicStorefrontCache = new Map<string, { timestamp: number; data: PublicStorefrontResponse }>();
const CACHE_TTL_MS = 60 * 1000;

export function invalidatePublicStorefrontCache(sellerId?: string, slug?: string) {
  if (!sellerId && !slug) {
    publicStorefrontCache.clear();
    return;
  }
  for (const [key, value] of publicStorefrontCache.entries()) {
    if (sellerId && value.data.sellerId === sellerId) {
      publicStorefrontCache.delete(key);
    } else if (slug && (key === slug || value.data.canonicalSlug === slug)) {
      publicStorefrontCache.delete(key);
    }
  }
}

export class StorePublicService {
  static async resolveAndGetStorefront(slugOrId: string): Promise<PublicStorefrontResponse> {
    const cached = publicStorefrontCache.get(slugOrId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    let targetSellerId: string | null = null;
    let canonicalSlug: string | null = null;
    let shouldRedirectSlug: string | null = null;

    // 1. Check if slugOrId is in store_slugs
    const slugSnap = await db.collection("store_slugs").doc(slugOrId).get();
    if (slugSnap.exists) {
      const slugData = slugSnap.data();
      targetSellerId = slugData?.sellerId || null;
      canonicalSlug = slugOrId;
    }

    // 2. If not found, check if slugOrId is a seller UID
    if (!targetSellerId) {
      const userSnap = await db.collection("users").doc(slugOrId).get();
      if (userSnap.exists) {
        const userData = userSnap.data() || {};
        const role = typeof userData.role === "string" ? userData.role.trim() : "";
        const status = typeof userData.status === "string" ? userData.status.trim().toLowerCase() : "";
        if (role === "seller" && status === USER_STATUSES.ACTIVE) {
          targetSellerId = slugOrId;
        }
      }
    }

    // 3. If not found, search in store_configs by shopSlug or previousSlugs
    if (!targetSellerId) {
      const configBySlug = await db.collection("store_configs").where("shopSlug", "==", slugOrId).limit(1).get();
      if (!configBySlug.empty) {
        const cfg = configBySlug.docs[0].data() as StoreConfig;
        targetSellerId = cfg.sellerId;
        canonicalSlug = cfg.shopSlug;
      } else {
        const configByPrev = await db.collection("store_configs").where("previousSlugs", "array-contains", slugOrId).limit(1).get();
        if (!configByPrev.empty) {
          const cfg = configByPrev.docs[0].data() as StoreConfig;
          targetSellerId = cfg.sellerId;
          canonicalSlug = cfg.shopSlug;
          shouldRedirectSlug = cfg.shopSlug;
        }
      }
    }

    if (!targetSellerId) {
      throw new Error("Boutique introuvable ou non disponible.");
    }

    // Load storeConfig, userDoc, publicProfileDoc, products, coupons, and store_layouts
    const [configDoc, userDoc, pubDoc, layoutDoc, productsSnap, couponsSnap, reviewsSnap] = await Promise.all([
      db.collection("store_configs").doc(targetSellerId).get(),
      db.collection("users").doc(targetSellerId).get(),
      db.collection("publicProfiles").doc(targetSellerId).get(),
      db.collection("store_layouts").doc(targetSellerId).get(),
      db.collection("products").where("sellerId", "==", targetSellerId).where("status", "==", "active").limit(100).get(),
      db.collection("coupons").where("sellerId", "==", targetSellerId).where("isActive", "==", true).limit(10).get(),
      db.collection("reviews").where("sellerId", "==", targetSellerId).limit(50).get().catch(() => ({ empty: true, docs: [] })),
    ]);

    const userData = userDoc.data() || {};
    const pubData = pubDoc.data() || {};

    let storeConfig: StoreConfig;
    if (configDoc.exists) {
      storeConfig = configDoc.data() as StoreConfig;
    } else {
      storeConfig = LegacyStoreAdapter.buildStoreConfig(targetSellerId, userData, pubData);
    }

    if (!canonicalSlug) {
      canonicalSlug = storeConfig.shopSlug;
    }

    const activeProductIds = productsSnap.docs.map((d) => d.id);
    let publishedLayout: StoreLayoutVersion;

    if (layoutDoc.exists) {
      const layoutData = layoutDoc.data();
      if (layoutData?.published && Array.isArray(layoutData.published.sections)) {
        publishedLayout = {
          ...layoutData.published,
          sections: layoutData.published.sections
            .filter((sec: { isVisible?: boolean }) => sec.isVisible !== false)
            .sort((a: { order?: number }, b: { order?: number }) => (a.order || 0) - (b.order || 0)),
        };
      } else {
        publishedLayout = LegacyStoreAdapter.buildInitialLayoutVersion(storeConfig, activeProductIds);
      }
    } else {
      publishedLayout = LegacyStoreAdapter.buildInitialLayoutVersion(storeConfig, activeProductIds);
    }

    const activeCoupons = couponsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    let ratingSum = 0;
    reviewsSnap.docs.forEach((d) => {
      const r = d.data();
      ratingSum += Number(r.rating) || 5;
    });
    const reviewsCount = reviewsSnap.docs.length;
    const ratingAverage = reviewsCount > 0 ? Number((ratingSum / reviewsCount).toFixed(1)) : 5.0;

    const responseData: PublicStorefrontResponse = {
      sellerId: targetSellerId,
      canonicalSlug,
      ...(shouldRedirectSlug ? { redirectToSlug: shouldRedirectSlug } : {}),
      storeConfig,
      publishedLayout,
      activeCoupons,
      trustMetrics: {
        activeProductsCount: productsSnap.docs.length,
        ratingAverage,
        reviewsCount,
        avgPreparationTime: storeConfig.avgPreparationTime || "24h - 48h",
        codAvailable: true,
        wilaya: storeConfig.wilaya || "Alger",
      },
    };

    publicStorefrontCache.set(slugOrId, { timestamp: Date.now(), data: responseData });
    publicStorefrontCache.set(canonicalSlug, { timestamp: Date.now(), data: responseData });
    publicStorefrontCache.set(targetSellerId, { timestamp: Date.now(), data: responseData });

    return responseData;
  }
}
