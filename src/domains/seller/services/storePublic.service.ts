import { db } from "../../../config/firebase-admin";
import { StoreConfig, StoreLayoutVersion } from "../customPage.types";
import { LegacyStoreAdapter } from "./legacyStore.adapter";
import { USER_STATUSES } from "../../user/user.status";

export interface PublicStorefrontProductDTO {
  id: string;
  name: string;
  title: string;
  description: string;
  price: number;
  promoPrice?: number;
  originalPrice?: number;
  flashPrice?: number;
  flashSaleActive: boolean;
  category: string;
  subcategory: string;
  image: string;
  images: string[];
  stock: number;
  rating: number;
  salesCount: number;
  colors: string[];
  sizes: string[];
  variants: unknown[];
  sellerId: string;
  sellerName: string;
  storeName: string;
  wilaya: string;
  status: string;
}

export interface PublicStorefrontResponse {
  sellerId: string;
  canonicalSlug: string;
  redirectToSlug?: string;
  hasPaidStudioSubscription: boolean;
  storeConfig: StoreConfig;
  publishedLayout: StoreLayoutVersion | null;
  products: PublicStorefrontProductDTO[];
  activeCoupons: unknown[];
  trustMetrics: {
    activeProductsCount: number;
    ratingAverage: number;
    reviewsCount: number;
    avgPreparationTime: string;
    codAvailable: boolean;
    wilaya: string;
    followersCount: number;
  };
}

const HIDDEN_PRODUCT_STATUSES = new Set([
  "draft",
  "rejected",
  "suspended",
  "archived",
  "pending_deletion",
]);

const publicStorefrontCache = new Map<string, { timestamp: number; data: PublicStorefrontResponse }>();
const CACHE_TTL_MS = 30 * 1000;

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
  static async resolveSellerIdentity(slugOrId: string): Promise<{
    targetSellerId: string;
    canonicalSlug: string | null;
    shouldRedirectSlug: string | null;
  }> {
    let targetSellerId: string | null = null;
    let canonicalSlug: string | null = null;
    let shouldRedirectSlug: string | null = null;

    const slugSnap = await db.collection("store_slugs").doc(slugOrId).get();
    if (slugSnap.exists) {
      targetSellerId = slugSnap.data()?.sellerId || null;
      canonicalSlug = slugOrId;
    }

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

    return { targetSellerId, canonicalSlug, shouldRedirectSlug };
  }

  static async fetchSellerPublicProducts(sellerIdOrSlug: string): Promise<PublicStorefrontProductDTO[]> {
    let resolvedId = sellerIdOrSlug;
    try {
      const resolved = await this.resolveSellerIdentity(sellerIdOrSlug);
      resolvedId = resolved.targetSellerId;
    } catch {
      resolvedId = sellerIdOrSlug;
    }

    const candidateFields = ["sellerId", "sellerUid", "userId", "storeId", "shopId"];
    const snaps = await Promise.all(
      candidateFields.map((field) =>
        db
          .collection("products")
          .where(field, "==", resolvedId)
          .limit(100)
          .get()
          .catch(() => null)
      )
    );

    const productMap = new Map<string, PublicStorefrontProductDTO>();
    for (const snap of snaps) {
      if (!snap) continue;
      for (const doc of snap.docs) {
        const d = doc.data() || {};
        const rawStatus = typeof d.status === "string" ? d.status.trim().toLowerCase() : "active";
        if (HIDDEN_PRODUCT_STATUSES.has(rawStatus)) continue;

        const imagesList = Array.isArray(d.images) ? (d.images as string[]).filter(Boolean) : [];
        const primaryImage = typeof d.image === "string" && d.image.trim() ? d.image : imagesList[0] || "";
        const prodName = String(d.name || d.title || "Article");

        productMap.set(doc.id, {
          id: doc.id,
          name: prodName,
          title: prodName,
          description: String(d.description || ""),
          price: Number(d.price) || 0,
          promoPrice: typeof d.promoPrice === "number" ? d.promoPrice : undefined,
          originalPrice: typeof d.originalPrice === "number" ? d.originalPrice : undefined,
          flashPrice: typeof d.flashPrice === "number" ? d.flashPrice : undefined,
          flashSaleActive: Boolean(d.flashSaleActive),
          category: String(d.category || "Général"),
          subcategory: String(d.subcategory || d.subCategory || ""),
          image: primaryImage,
          images: imagesList.length > 0 ? imagesList : primaryImage ? [primaryImage] : [],
          stock: typeof d.stock === "number" ? d.stock : 10,
          rating: typeof d.rating === "number" ? d.rating : 5,
          salesCount: typeof d.salesCount === "number" ? d.salesCount : 0,
          colors: Array.isArray(d.colors) ? (d.colors as string[]) : [],
          sizes: Array.isArray(d.sizes) ? (d.sizes as string[]) : [],
          variants: Array.isArray(d.variants) ? d.variants : [],
          sellerId: resolvedId,
          sellerName: String(d.sellerName || d.storeName || ""),
          storeName: String(d.storeName || d.sellerName || ""),
          wilaya: String(d.wilaya || ""),
          status: "active",
        });
      }
    }

    return Array.from(productMap.values());
  }

  static async resolveAndGetStorefront(slugOrId: string): Promise<PublicStorefrontResponse> {
    const cached = publicStorefrontCache.get(slugOrId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    const { targetSellerId, canonicalSlug: initialSlug, shouldRedirectSlug } =
      await this.resolveSellerIdentity(slugOrId);

    const [configDoc, userDoc, pubDoc, layoutDoc, products, couponsSnap, reviewsSnap, paidReqSnap] =
      await Promise.all([
        db.collection("store_configs").doc(targetSellerId).get(),
        db.collection("users").doc(targetSellerId).get(),
        db.collection("publicProfiles").doc(targetSellerId).get(),
        db.collection("store_layouts").doc(targetSellerId).get(),
        this.fetchSellerPublicProducts(targetSellerId),
        db.collection("coupons").where("sellerId", "==", targetSellerId).where("isActive", "==", true).limit(10).get(),
        db.collection("reviews").where("sellerId", "==", targetSellerId).limit(50).get().catch(() => ({ empty: true, docs: [] })),
        db.collection("subscription_requests").where("sellerId", "==", targetSellerId).where("status", "in", ["payment_confirmed", "granted"]).limit(10).get().catch(() => ({ empty: true, docs: [] })),
      ]);

    const userData = userDoc.data() || {};
    const pubData = pubDoc.data() || {};

    const userStatus = typeof userData.status === "string" ? userData.status.trim().toLowerCase() : "";
    if (!userDoc.exists || userStatus !== USER_STATUSES.ACTIVE) {
      throw new Error("Cette boutique est temporairement indisponible ou suspendue.");
    }

    // Check if the seller actually has a paid Studio subscription
    const hasPaidStudioSubscription = paidReqSnap.docs.some((d) => {
      const reqData = d.data();
      return Number(reqData?.planSnapshot?.price) > 0;
    });

    const baseConfig = LegacyStoreAdapter.buildStoreConfig(targetSellerId, userData, pubData);
    const savedConfig = configDoc.exists ? (configDoc.data() as StoreConfig) : null;

    // Strip stock Unsplash placeholder banners so only genuine seller-uploaded banners appear
    const rawBanner = savedConfig?.bannerUrl || baseConfig.bannerUrl;
    const cleanBanner =
      rawBanner && !rawBanner.includes("images.unsplash.com") ? rawBanner : baseConfig.bannerUrl;

    const storeConfig: StoreConfig = savedConfig
      ? {
          ...baseConfig,
          ...savedConfig,
          bannerUrl: cleanBanner,
          logoUrl: savedConfig.logoUrl || baseConfig.logoUrl,
          theme: hasPaidStudioSubscription && savedConfig.theme ? savedConfig.theme : baseConfig.theme,
        }
      : baseConfig;

    const canonicalSlug = initialSlug || storeConfig.shopSlug;

    // Only connect to Studio publishedLayout if seller has a PAID Studio subscription AND published sections
    let publishedLayout: StoreLayoutVersion | null = null;
    if (hasPaidStudioSubscription && layoutDoc.exists) {
      const layoutData = layoutDoc.data();
      if (layoutData?.published && Array.isArray(layoutData.published.sections) && layoutData.published.sections.length > 0) {
        publishedLayout = {
          ...layoutData.published,
          sections: layoutData.published.sections
            .filter((sec: { isVisible?: boolean }) => sec.isVisible !== false)
            .sort((a: { order?: number }, b: { order?: number }) => (a.order || 0) - (b.order || 0)),
        };
      }
    }

    let ratingSum = 0;
    reviewsSnap.docs.forEach((d) => {
      ratingSum += Number(d.data().rating) || 5;
    });
    const reviewsCount = reviewsSnap.docs.length;
    const ratingAverage = reviewsCount > 0 ? Number((ratingSum / reviewsCount).toFixed(1)) : 5.0;
    const followersCount = Number(pubData.followersCount ?? userData.followersCount ?? 0);

    const responseData: PublicStorefrontResponse = {
      sellerId: targetSellerId,
      canonicalSlug,
      ...(shouldRedirectSlug ? { redirectToSlug: shouldRedirectSlug } : {}),
      hasPaidStudioSubscription,
      storeConfig,
      publishedLayout,
      products,
      activeCoupons: couponsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      trustMetrics: {
        activeProductsCount: products.length,
        ratingAverage,
        reviewsCount,
        avgPreparationTime: storeConfig.avgPreparationTime || "24h - 48h",
        codAvailable: true,
        wilaya: storeConfig.wilaya || "Alger",
        followersCount,
      },
    };

    publicStorefrontCache.set(slugOrId, { timestamp: Date.now(), data: responseData });
    publicStorefrontCache.set(canonicalSlug, { timestamp: Date.now(), data: responseData });
    publicStorefrontCache.set(targetSellerId, { timestamp: Date.now(), data: responseData });

    return responseData;
  }
}
