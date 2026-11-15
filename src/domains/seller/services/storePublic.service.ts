import { db } from "../../../config/firebase-admin";
import { StoreConfig, StoreLayoutVersion } from "../customPage.types";
import { PublicShopDTO, PublicStorefrontProductDTO } from "../shop.types";
import { buildPublicStorefrontProductDTO, buildWhitelistedShopDTO } from "../shopPublic.projection";
import { LegacyStoreAdapter } from "./legacyStore.adapter";
import { USER_STATUSES } from "../../user/user.status";
import { redactStoreConfigForPublic } from "../../../security/studioCyberSecurity";
import { serializeTimestampIso } from "../studioCatalogResolver";
import {
  evaluatePaidStudioSubscription, isPubliclyVisibleProductStatus, isStorePasswordLocked,
  resolveProductImagesList, resolveProductPrimaryImage, verifyStoreVipAccessToken,
} from "../../../security/storeVipAccessGuard";

export type { PublicStorefrontProductDTO };

export interface PublicStorefrontResponse {
  sellerId: string; canonicalSlug: string; redirectToSlug?: string;
  hasPaidStudioSubscription: boolean; isVipLocked?: boolean;
  whitelistedShopDto: PublicShopDTO; storeConfig: StoreConfig;
  publishedLayout: StoreLayoutVersion | null; products: PublicStorefrontProductDTO[];
  nextProductsCursor?: string | null; totalProductsCount?: number; activeCoupons: unknown[];
  trustMetrics: {
    activeProductsCount: number; ratingAverage: number; reviewsCount: number;
    avgPreparationTime: string; codAvailable: boolean; wilaya: string; followersCount: number;
  };
}

const publicStorefrontCache = new Map<string, { timestamp: number; data: PublicStorefrontResponse }>();
const CACHE_TTL_MS = 30 * 1000;

export function invalidatePublicStorefrontCache(sellerId?: string, slug?: string) {
  if (!sellerId && !slug) { publicStorefrontCache.clear(); return; }
  for (const [k, v] of publicStorefrontCache.entries()) {
    if ((sellerId && v.data.sellerId === sellerId) || (slug && (k === slug || v.data.canonicalSlug === slug))) publicStorefrontCache.delete(k);
  }
}

export class StorePublicService {
  static async resolveSellerIdentity(slugOrId: string): Promise<{
    targetSellerId: string; canonicalSlug: string | null; shouldRedirectSlug: string | null;
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
        if (role !== "seller" || status !== USER_STATUSES.ACTIVE) throw new Error("Boutique non disponible");
        targetSellerId = slugOrId;
      }
    }
    if (!targetSellerId) {
      const configBySlug = await db.collection("store_configs").where("shopSlug", "==", slugOrId).limit(1).get();
      if (configBySlug.docs && configBySlug.docs.length > 0) {
        const cfg = configBySlug.docs[0].data() as StoreConfig;
        targetSellerId = cfg.sellerId;
        canonicalSlug = cfg.shopSlug;
      } else {
        const configByPrev = await db.collection("store_configs").where("previousSlugs", "array-contains", slugOrId).limit(1).get();
        if (configByPrev.docs && configByPrev.docs.length > 0) {
          const cfg = configByPrev.docs[0].data() as StoreConfig;
          targetSellerId = cfg.sellerId;
          canonicalSlug = cfg.shopSlug;
          shouldRedirectSlug = cfg.shopSlug;
        }
      }
    }
    if (!targetSellerId) throw new Error("Boutique introuvable");
    return { targetSellerId, canonicalSlug, shouldRedirectSlug };
  }

  static async fetchSellerPublicProductsPaginated(
    sellerIdOrSlug: string,
    options?: { limit?: number; cursorId?: string; vipAccessToken?: string }
  ): Promise<{ products: PublicStorefrontProductDTO[]; nextCursor: string | null; totalCount: number }> {
    let resolvedId = sellerIdOrSlug;
    try { resolvedId = (await this.resolveSellerIdentity(sellerIdOrSlug)).targetSellerId; } catch { resolvedId = sellerIdOrSlug; }

    const configSnap = await db.collection("store_configs").doc(resolvedId).get().catch(() => null);
    if (configSnap?.exists) {
      const cfg = configSnap.data() as StoreConfig;
      if (isStorePasswordLocked(cfg) && !verifyStoreVipAccessToken(options?.vipAccessToken, resolvedId, cfg)) {
        return { products: [], nextCursor: null, totalCount: 0 };
      }
    }

    const batchLimit = Math.min(500, Math.max(20, (options?.limit ?? 100) * 3));
    const snaps = await Promise.all(
      ["sellerId", "sellerUid", "userId", "storeId", "shopId"].map((field) =>
        db.collection("products").where(field, "==", resolvedId).limit(batchLimit).get().catch(() => null)
      )
    );

    const productMap = new Map<string, PublicStorefrontProductDTO>();
    for (const snap of snaps) {
      if (!snap || !Array.isArray(snap.docs)) continue;
      for (const doc of snap.docs) {
        const d = (doc.data() || {}) as Record<string, unknown>;
        if (d.deletedAt || !isPubliclyVisibleProductStatus(d.status)) continue;
        productMap.set(
          doc.id,
          buildPublicStorefrontProductDTO(
            doc.id, d, resolvedId, resolveProductImagesList(d), resolveProductPrimaryImage(d, ""),
            serializeTimestampIso(d.createdAt), serializeTimestampIso(d.updatedAt)
          )
        );
      }
    }

    const sortedAll = Array.from(productMap.values()).sort((a, b) => a.id.localeCompare(b.id));
    const totalCount = sortedAll.length;
    const pageSize = options?.limit && options.limit > 0 ? Math.min(200, options.limit) : totalCount || 100;
    let startIndex = 0;
    if (options?.cursorId) {
      const idx = sortedAll.findIndex((p) => p.id === options.cursorId);
      if (idx !== -1) startIndex = idx + 1;
    }
    const pageItems = sortedAll.slice(startIndex, startIndex + pageSize);
    const nextCursor = startIndex + pageSize < totalCount ? pageItems[pageItems.length - 1]?.id ?? null : null;
    return { products: pageItems, nextCursor, totalCount };
  }

  static async fetchSellerPublicProducts(
    sellerIdOrSlug: string,
    options?: { limit?: number; cursorId?: string; vipAccessToken?: string }
  ): Promise<PublicStorefrontProductDTO[]> {
    return (await this.fetchSellerPublicProductsPaginated(sellerIdOrSlug, options)).products;
  }

  static async resolveAndGetStorefront(
    slugOrId: string,
    vipAccessToken?: string,
    options?: { previewDraft?: boolean }
  ): Promise<PublicStorefrontResponse> {
    const isPreviewDraft = Boolean(options?.previewDraft);
    if (process.env.NODE_ENV !== "test" && !vipAccessToken && !isPreviewDraft) {
      const cached = publicStorefrontCache.get(slugOrId);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) return cached.data;
    }

    const { targetSellerId, canonicalSlug: initialSlug, shouldRedirectSlug } = await this.resolveSellerIdentity(slugOrId);
    const couponsBase = db.collection("coupons").where("sellerId", "==", targetSellerId);
    const couponsQuery = typeof (couponsBase as { where?: unknown }).where === "function" ? couponsBase.where("isActive", "==", true) : couponsBase;
    const paidReqBase = db.collection("subscription_requests").where("sellerId", "==", targetSellerId);
    const paidReqQuery = typeof (paidReqBase as { where?: unknown }).where === "function" ? paidReqBase.where("status", "in", ["payment_confirmed", "granted"]) : paidReqBase;

    const [configDoc, userDoc, pubDoc, layoutDoc, couponsSnap, reviewsSnap, paidReqSnap] = await Promise.all([
      db.collection("store_configs").doc(targetSellerId).get(),
      db.collection("users").doc(targetSellerId).get(),
      db.collection("publicProfiles").doc(targetSellerId).get(),
      db.collection("store_layouts").doc(targetSellerId).get(),
      couponsQuery.limit(10).get().catch(() => ({ empty: true, docs: [] })),
      db.collection("reviews").where("sellerId", "==", targetSellerId).limit(50).get().catch(() => ({ empty: true, docs: [] })),
      paidReqQuery.limit(10).get().catch(() => ({ empty: true, docs: [] })),
    ]);

    const userData = userDoc.data() || {};
    const pubData = pubDoc.data() || {};
    const userRole = typeof userData.role === "string" ? userData.role.trim() : "";
    const userStatus = typeof userData.status === "string" ? userData.status.trim().toLowerCase() : "";
    if (!userDoc.exists) throw new Error("Boutique introuvable");
    if (userRole !== "seller" || userStatus !== USER_STATUSES.ACTIVE) throw new Error("Boutique non disponible");

    const whitelistedShopDto = buildWhitelistedShopDTO(targetSellerId, userData, pubData);
    const baseConfig = LegacyStoreAdapter.buildStoreConfig(targetSellerId, userData, pubData);
    const savedConfig = configDoc.exists ? (configDoc.data() as StoreConfig) : null;
    const rawBanner = savedConfig?.bannerUrl || baseConfig.bannerUrl;
    const cleanBanner = rawBanner && !rawBanner.includes("images.unsplash.com") ? rawBanner : baseConfig.bannerUrl;
    const rawStoreConfig: StoreConfig = savedConfig
      ? { ...baseConfig, ...savedConfig, bannerUrl: cleanBanner, logoUrl: savedConfig.logoUrl || baseConfig.logoUrl, theme: savedConfig.theme ? { ...baseConfig.theme, ...savedConfig.theme } : baseConfig.theme }
      : baseConfig;

    const storeConfig = redactStoreConfigForPublic(rawStoreConfig);
    const canonicalSlug = initialSlug || storeConfig.shopSlug;
    const hasPaidStudioSubscription = evaluatePaidStudioSubscription(userData, (paidReqSnap.docs || []).map((d) => d.data() || {}));

    const validReviews = (reviewsSnap.docs || []).filter((d) => {
      const r = d.data() || {};
      const status = typeof r.status === "string" ? r.status.toLowerCase() : "";
      const isModeratedApproved = ["approved", "replied", "active"].includes(status);
      const hasValidRating = typeof r.rating === "number" && Number.isFinite(r.rating) && r.rating >= 1 && r.rating <= 5;
      return isModeratedApproved && hasValidRating && Boolean(r.productId || r.buyerId || r.userId || r.orderId);
    });
    const ratingSum = validReviews.reduce((acc, d) => acc + Number(d.data().rating), 0);
    const reviewsCount = validReviews.length > 0 ? validReviews.length : whitelistedShopDto.reviewsCount;
    const ratingAverage =
      validReviews.length > 0
        ? Number((ratingSum / validReviews.length).toFixed(1))
        : whitelistedShopDto.reviewsCount > 0 && typeof whitelistedShopDto.rating === "number"
        ? whitelistedShopDto.rating
        : 0;
    const baseMetrics = {
      ratingAverage, reviewsCount,
      avgPreparationTime: storeConfig.avgPreparationTime || whitelistedShopDto.avgPreparationTime || "24h - 48h",
      codAvailable: storeConfig.commerceConfig?.codEnabled ?? true, wilaya: storeConfig.wilaya || "Alger",
      followersCount: whitelistedShopDto.followersCount,
    };

    if (isStorePasswordLocked(rawStoreConfig) && !verifyStoreVipAccessToken(vipAccessToken, targetSellerId, rawStoreConfig)) {
      return {
        sellerId: targetSellerId, canonicalSlug, ...(shouldRedirectSlug ? { redirectToSlug: shouldRedirectSlug } : {}),
        hasPaidStudioSubscription, isVipLocked: true, whitelistedShopDto, storeConfig: { ...storeConfig, customPages: [] },
        publishedLayout: null, products: [], nextProductsCursor: null, totalProductsCount: 0, activeCoupons: [],
        trustMetrics: { ...baseMetrics, activeProductsCount: 0 },
      };
    }

    const { products, nextCursor, totalCount } = await this.fetchSellerPublicProductsPaginated(targetSellerId, { vipAccessToken });
    const layoutData = layoutDoc.exists ? layoutDoc.data() : null;
    const pubSecs = Array.isArray(layoutData?.published?.sections) ? layoutData.published.sections : [];
    const draftSecs = Array.isArray(layoutData?.draft?.sections) ? layoutData.draft.sections : [];
    const activeLayoutSource = isPreviewDraft && draftSecs.length > 0 ? layoutData!.draft : pubSecs.length > 0 ? layoutData!.published : draftSecs.length > 0 ? layoutData!.draft : { ...LegacyStoreAdapter.buildInitialLayoutVersion(storeConfig, products.map((p) => p.id)), status: "published" as const };
    const activeRawSections = Array.isArray(activeLayoutSource?.sections) ? activeLayoutSource.sections : [];
    const publishedLayout: StoreLayoutVersion = {
      ...activeLayoutSource, status: isPreviewDraft ? "draft" : "published",
      sections: activeRawSections.filter((sec: { isVisible?: boolean }) => sec.isVisible !== false).sort((a: { order?: number }, b: { order?: number }) => (a.order || 0) - (b.order || 0)),
    };

    const activeCoupons = (couponsSnap.docs || [])
      .map((d) => ({ id: d.id, ...(d.data() || {}) } as Record<string, unknown>))
      .filter((c) => typeof c.code === "string" && c.code.trim().length > 0)
      .map((c) => ({ id: String(c.id), code: String(c.code), discountType: c.discountType, discountValue: Number(c.discountValue) || 0 }));

    const responseData: PublicStorefrontResponse = {
      sellerId: targetSellerId, canonicalSlug, ...(shouldRedirectSlug ? { redirectToSlug: shouldRedirectSlug } : {}),
      hasPaidStudioSubscription, isVipLocked: false, whitelistedShopDto, storeConfig, publishedLayout, products,
      nextProductsCursor: nextCursor, totalProductsCount: totalCount, activeCoupons,
      trustMetrics: { ...baseMetrics, activeProductsCount: totalCount || whitelistedShopDto.productsCount },
    };

    if (process.env.NODE_ENV !== "test" && !isStorePasswordLocked(rawStoreConfig) && !isPreviewDraft) {
      publicStorefrontCache.set(slugOrId, { timestamp: Date.now(), data: responseData });
      publicStorefrontCache.set(canonicalSlug, { timestamp: Date.now(), data: responseData });
      publicStorefrontCache.set(targetSellerId, { timestamp: Date.now(), data: responseData });
    }
    return responseData;
  }
}
