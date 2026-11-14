import { Router, Request, Response } from "express";
import { admin, db } from "../../config/firebase-admin";
import { safeLogger } from "../../utils/logger";
import { PublicShopDTO } from "./shop.types";
import { buildWhitelistedShopDTO } from "./shopPublic.projection";
import { StorePublicService } from "./services/storePublic.service";
import { USER_STATUSES } from "../user/user.status";
import { redactStoreConfigForPublic, verifyStorePrelaunchPassword, sanitizeTrackEventPayload } from "../../security/studioCyberSecurity";
import { checkAndRecordVipAttempt, isPubliclyVisibleProductStatus, issueStoreVipAccessToken, resetVipAttempts } from "../../security/storeVipAccessGuard";
import type { StoreConfig } from "./customPage.types";

export { buildWhitelistedShopDTO };

const router = Router();

function extractRequestVipToken(req: Request): string | undefined {
  const headerVal = req.headers["x-store-vip-token"];
  if (typeof headerVal === "string" && headerVal.trim()) return headerVal.trim();
  const queryVal = req.query?.vipToken;
  if (typeof queryVal === "string" && queryVal.trim()) return queryVal.trim();
  return undefined;
}

async function fetchActiveSellerDirectory(limitCount: number): Promise<PublicShopDTO[]> {
  const [usersSnap, publicProfilesSnap] = await Promise.all([
    db.collection("users").where("role", "==", "seller").limit(limitCount).get(),
    db.collection("publicProfiles").limit(limitCount).get(),
  ]);
  const pubProfilesMap = new Map<string, Record<string, unknown>>();
  publicProfilesSnap.docs.forEach((d) => { pubProfilesMap.set(d.id, d.data() || {}); });

  const shops: PublicShopDTO[] = [];
  for (const userDoc of usersSnap.docs) {
    if (!userDoc.exists) continue;
    const userData = userDoc.data() || {};
    if ((typeof userData.role === "string" ? userData.role.trim() : "") !== "seller") continue;
    if ((typeof userData.status === "string" ? userData.status.trim().toLowerCase() : "") !== USER_STATUSES.ACTIVE) continue;
    shops.push(buildWhitelistedShopDTO(userDoc.id, userData, pubProfilesMap.get(userDoc.id) || {}));
  }
  return shops;
}

router.get("/api/v1/explore/sellers", async (_req: Request, res: Response) => {
  try {
    return res.json({ success: true, sellers: await fetchActiveSellerDirectory(100) });
  } catch (error: unknown) {
    safeLogger.error("Error fetching explore sellers", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: "Erreur lors de la récupération des vendeurs" });
  }
});

router.get("/api/v1/public/shops", async (_req: Request, res: Response) => {
  try {
    const shops = await fetchActiveSellerDirectory(200);
    safeLogger.info("/api/v1/public/shops fetched public shop profiles", { count: shops.length });
    return res.json({ success: true, shops });
  } catch (error: unknown) {
    safeLogger.error("Error fetching public shops", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: "Erreur lors de la récupération des boutiques" });
  }
});

router.get(["/api/v1/public/stores/:slugOrId", "/api/v1/public/shops/:slugOrId"], async (req: Request, res: Response) => {
  const { slugOrId } = req.params;
  try {
    if (!slugOrId || typeof slugOrId !== "string" || !slugOrId.trim()) {
      return res.status(400).json({ success: false, error: "Identifiant ou slug manquant" });
    }
    const vipToken = extractRequestVipToken(req);
    const previewDraft = req.query?.preview === "draft";
    const storefrontData = await StorePublicService.resolveAndGetStorefront(slugOrId, vipToken, { previewDraft });
    const cfg = redactStoreConfigForPublic(storefrontData.storeConfig);
    return res.json({
      success: true,
      isVipLocked: Boolean(storefrontData.isVipLocked),
      shop: {
        id: storefrontData.sellerId, sellerId: storefrontData.sellerId, canonicalSlug: storefrontData.canonicalSlug,
        redirectToSlug: storefrontData.redirectToSlug, hasPaidStudioSubscription: storefrontData.hasPaidStudioSubscription,
        isVipLocked: Boolean(storefrontData.isVipLocked), shopName: cfg.shopName, shopSlug: cfg.shopSlug,
        shopDescription: cfg.shopDescription, wilaya: cfg.wilaya, commune: cfg.commune, logoUrl: cfg.logoUrl,
        bannerUrl: cfg.bannerUrl, brandStory: cfg.brandStory, returnPolicy: cfg.returnPolicy,
        avgPreparationTime: cfg.avgPreparationTime, legalStatus: cfg.legalStatus,
        followersCount: storefrontData.trustMetrics.followersCount, rating: storefrontData.trustMetrics.ratingAverage,
        theme: cfg.theme, seo: cfg.seo, collectionPageConfig: cfg.collectionPageConfig, customPages: cfg.customPages,
        announcementBar: cfg.announcementBar, headerConfig: cfg.headerConfig, commerceConfig: cfg.commerceConfig,
        storeStatus: cfg.storeStatus, pixelsConfig: cfg.pixelsConfig, publishedLayout: storefrontData.publishedLayout,
        trustMetrics: storefrontData.trustMetrics,
      },
      products: storefrontData.products,
      nextProductsCursor: storefrontData.nextProductsCursor ?? null,
      totalProductsCount: storefrontData.totalProductsCount ?? storefrontData.products.length,
      storefront: storefrontData,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur lors de la récupération de la boutique";
    safeLogger.error("Error fetching single public shop", { slugOrId, err: msg });
    return res.status(404).json({ success: false, error: msg });
  }
});

router.get(["/api/v1/public/shops/:sellerId/products", "/api/v1/public/stores/:sellerId/products"], async (req: Request, res: Response) => {
  const { sellerId } = req.params;
  try {
    if (!sellerId) return res.status(400).json({ success: false, error: "Missing sellerId parameter" });
    const vipAccessToken = extractRequestVipToken(req);
    const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
    const cursorId = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
    const { products, nextCursor, totalCount } = await StorePublicService.fetchSellerPublicProductsPaginated(sellerId, { limit, cursorId, vipAccessToken });
    return res.json({ success: true, products, count: totalCount, nextCursor });
  } catch (error: unknown) {
    safeLogger.error("Error fetching shop products", { sellerId, err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Erreur interne", products: [] });
  }
});

router.get("/api/v1/public/shops/:sellerId/coupons", async (req: Request, res: Response) => {
  const { sellerId } = req.params;
  try {
    if (!sellerId) return res.status(400).json({ success: false, error: "Missing sellerId parameter" });
    const snap = await db.collection("coupons").where("sellerId", "==", sellerId).where("isActive", "==", true).get();
    const now = new Date();
    const activeCoupons = snap.docs
      .map((doc) => {
        const d = doc.data();
        const maxUses = typeof d.maxUses === "number" ? d.maxUses : typeof d.usageLimit === "number" ? d.usageLimit : null;
        const currentUses = Number(d.usedCount ?? d.usageCount) || 0;
        if (maxUses !== null && maxUses > 0 && currentUses >= maxUses) return null;
        const expiresAtIso = d.expiresAt?.toDate ? d.expiresAt.toDate().toISOString() : d.expiryDate?.toDate ? d.expiryDate.toDate().toISOString() : typeof d.expiresAt === "string" ? d.expiresAt : null;
        if (expiresAtIso && new Date(expiresAtIso) <= now) return null;
        const createdAtMs = d.createdAt?.toDate ? d.createdAt.toDate().getTime() : d.createdAt?.seconds ? d.createdAt.seconds * 1000 : d.createdAt ? new Date(d.createdAt).getTime() || 0 : 0;
        return {
          id: doc.id, code: d.code, discountType: d.discountType, discountValue: Number(d.discountValue) || 0,
          minOrderAmount: Number(d.minOrderAmount ?? d.minOrderValue) || 0, expiresAt: expiresAtIso, sellerId: d.sellerId, createdAtMs,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .sort((a, b) => (b.createdAtMs !== a.createdAtMs ? b.createdAtMs - a.createdAtMs : a.id.localeCompare(b.id)))
      .map(({ createdAtMs: _ignored, ...dto }) => dto);
    return res.json({ success: true, coupons: activeCoupons });
  } catch (error: unknown) {
    safeLogger.error("Error fetching shop public coupons", { sellerId, err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Erreur interne", coupons: [] });
  }
});

router.get("/api/v1/explore/products", async (_req: Request, res: Response) => {
  try {
    const snap = await db.collection("products").where("status", "==", "active").limit(120).get();
    const products = snap.docs
      .filter((doc) => isPubliclyVisibleProductStatus(doc.data()?.status))
      .map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json({ products });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.post(
  ["/api/v1/public/stores/:slugOrId/verify-access", "/api/v1/public/shops/:slugOrId/verify-access"],
  async (req: Request, res: Response) => {
    const { slugOrId } = req.params;
    const candidatePassword = typeof req.body?.password === "string" ? req.body.password : "";
    try {
      if (!slugOrId || !candidatePassword.trim()) return res.status(400).json({ success: false, error: "Code d'accès requis." });
      const { targetSellerId } = await StorePublicService.resolveSellerIdentity(slugOrId);
      const clientKey = String(req.headers["x-forwarded-for"] || req.ip || "anon").split(",")[0].trim();
      const rateLimit = checkAndRecordVipAttempt(clientKey, targetSellerId);
      if (!rateLimit.allowed) {
        return res.status(429).json({ success: false, error: `Trop de tentatives. Réessayez dans ${rateLimit.retryAfterSec} secondes.` });
      }
      const configSnap = await db.collection("store_configs").doc(targetSellerId).get();
      if (!configSnap.exists) return res.status(404).json({ success: false, error: "Boutique introuvable." });
      const storedConfig = configSnap.data() as StoreConfig;
      if (!verifyStorePrelaunchPassword(storedConfig, candidatePassword)) {
        safeLogger.warn("[VIP Access] Échec de validation du code VIP", { sellerId: targetSellerId });
        return res.status(403).json({ success: false, error: "Code d'accès VIP invalide." });
      }
      resetVipAttempts(clientKey, targetSellerId);
      const issued = issueStoreVipAccessToken(targetSellerId, storedConfig);
      return res.json({ success: true, data: { granted: true, vipToken: issued?.token, expiresAt: issued?.expiresAt } });
    } catch (err: unknown) {
      return res.status(400).json({ success: false, error: err instanceof Error ? err.message : "Erreur lors de la vérification du code d'accès." });
    }
  }
);

router.post(["/api/v1/public/stores/:sellerId/follow", "/api/v1/public/shops/:sellerId/follow"], async (req: Request, res: Response) => {
  const { sellerId } = req.params;
  try {
    let followerUid = (req as unknown as { user?: { uid: string } }).user?.uid;
    if (!followerUid && req.headers.authorization?.startsWith("Bearer ")) {
      try {
        followerUid = (await admin.auth().verifyIdToken(req.headers.authorization.split("Bearer ")[1])).uid;
      } catch { /* Invalid token */ }
    }
    if (!followerUid) return res.status(401).json({ success: false, error: "Veuillez vous connecter pour vous abonner à cette boutique." });
    if (followerUid === sellerId) return res.status(400).json({ success: false, error: "Vous ne pouvez pas vous abonner à votre propre boutique." });
    const { SellerAnalyticsService } = await import("./services/sellerAnalytics.service");
    const result = await SellerAnalyticsService.toggleFollowStore(sellerId, followerUid);
    return res.json({ success: true, ...result });
  } catch (err: unknown) {
    return res.status(500).json({ success: false, error: err instanceof Error ? err.message : "Erreur interne" });
  }
});

router.post(["/api/v1/public/stores/:sellerId/track", "/api/v1/public/shops/:sellerId/track"], async (req: Request, res: Response) => {
  const { sellerId } = req.params;
  try {
    const validated = sanitizeTrackEventPayload((req.body || {}) as Record<string, unknown>);
    if (validated.valid && sellerId && /^[a-zA-Z0-9_-]{1,100}$/.test(sellerId)) {
      const { SellerAnalyticsService } = await import("./services/sellerAnalytics.service");
      await SellerAnalyticsService.trackStoreEvent(sellerId, { eventType: validated.eventType, productId: validated.productId, source: validated.source });
    }
    return res.json({ success: true });
  } catch {
    return res.json({ success: true });
  }
});

export default router;
