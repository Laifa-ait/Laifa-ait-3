import { Router, Request, Response } from "express";
import { admin, db } from "../../config/firebase-admin";
import { safeLogger } from "../../utils/logger";
import { PublicShopDTO } from "./shop.types";
import { buildWhitelistedShopDTO } from "./shopPublic.projection";
import { StorePublicService } from "./services/storePublic.service";
import { USER_STATUSES } from "../user/user.status";

export { buildWhitelistedShopDTO };

const router = Router();

async function fetchActiveSellerDirectory(limitCount: number): Promise<PublicShopDTO[]> {
  const [usersSnap, publicProfilesSnap] = await Promise.all([
    db.collection("users").where("role", "==", "seller").limit(limitCount).get(),
    db.collection("publicProfiles").limit(limitCount).get(),
  ]);

  const pubProfilesMap = new Map<string, Record<string, unknown>>();
  publicProfilesSnap.docs.forEach((d) => {
    pubProfilesMap.set(d.id, d.data() || {});
  });

  const shops: PublicShopDTO[] = [];
  for (const userDoc of usersSnap.docs) {
    if (!userDoc.exists) continue;
    const userData = userDoc.data() || {};
    const userRole = typeof userData.role === "string" ? userData.role.trim() : "";
    if (userRole !== "seller") continue;
    const userStatus = typeof userData.status === "string" ? userData.status.trim().toLowerCase() : "";
    if (userStatus !== USER_STATUSES.ACTIVE) continue;

    const pubData = pubProfilesMap.get(userDoc.id) || {};
    shops.push(buildWhitelistedShopDTO(userDoc.id, userData, pubData));
  }
  return shops;
}

router.get("/api/v1/explore/sellers", async (_req: Request, res: Response) => {
  try {
    const sellers = await fetchActiveSellerDirectory(100);
    return res.json({ success: true, sellers });
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

    const storefrontData = await StorePublicService.resolveAndGetStorefront(slugOrId);
    const cfg = storefrontData.storeConfig;
    return res.json({
      success: true,
      shop: {
        id: storefrontData.sellerId,
        sellerId: storefrontData.sellerId,
        canonicalSlug: storefrontData.canonicalSlug,
        redirectToSlug: storefrontData.redirectToSlug,
        hasPaidStudioSubscription: storefrontData.hasPaidStudioSubscription,
        shopName: cfg.shopName,
        shopSlug: cfg.shopSlug,
        shopDescription: cfg.shopDescription,
        wilaya: cfg.wilaya,
        commune: cfg.commune,
        logoUrl: cfg.logoUrl,
        bannerUrl: cfg.bannerUrl,
        brandStory: cfg.brandStory,
        returnPolicy: cfg.returnPolicy,
        avgPreparationTime: cfg.avgPreparationTime,
        legalStatus: cfg.legalStatus,
        followersCount: storefrontData.trustMetrics.followersCount,
        rating: storefrontData.trustMetrics.ratingAverage,
        theme: cfg.theme,
        seo: cfg.seo,
        collectionPageConfig: cfg.collectionPageConfig,
        customPages: cfg.customPages,
        announcementBar: cfg.announcementBar,
        headerConfig: cfg.headerConfig,
        commerceConfig: cfg.commerceConfig,
        storeStatus: cfg.storeStatus,
        pixelsConfig: cfg.pixelsConfig,
        publishedLayout: storefrontData.publishedLayout,
        trustMetrics: storefrontData.trustMetrics,
      },
      products: storefrontData.products,
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
    const products = await StorePublicService.fetchSellerPublicProducts(sellerId);
    return res.json({ success: true, products, count: products.length });
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

        const expiresAtIso = d.expiresAt?.toDate
          ? d.expiresAt.toDate().toISOString()
          : d.expiryDate?.toDate
            ? d.expiryDate.toDate().toISOString()
            : typeof d.expiresAt === "string"
              ? d.expiresAt
              : null;

        if (expiresAtIso && new Date(expiresAtIso) <= now) return null;

        const createdAtMs = d.createdAt?.toDate
          ? d.createdAt.toDate().getTime()
          : d.createdAt?.seconds
            ? d.createdAt.seconds * 1000
            : d.createdAt
              ? new Date(d.createdAt).getTime() || 0
              : 0;

        return {
          id: doc.id,
          code: d.code,
          discountType: d.discountType,
          discountValue: Number(d.discountValue) || 0,
          minOrderAmount: Number(d.minOrderAmount ?? d.minOrderValue) || 0,
          expiresAt: expiresAtIso,
          sellerId: d.sellerId,
          createdAtMs,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);

    activeCoupons.sort((a, b) => {
      if (b.createdAtMs !== a.createdAtMs) return b.createdAtMs - a.createdAtMs;
      if (a.expiresAt && b.expiresAt) {
        const cmp = new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
        if (cmp !== 0) return cmp;
      }
      return a.id.localeCompare(b.id);
    });

    const publicCoupons = activeCoupons.map(({ createdAtMs: _ignored, ...dto }) => dto);
    return res.json({ success: true, coupons: publicCoupons });
  } catch (error: unknown) {
    safeLogger.error("Error fetching shop public coupons", { sellerId, err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Erreur interne", coupons: [] });
  }
});

router.get("/api/v1/explore/products", async (_req: Request, res: Response) => {
  try {
    const snap = await db.collection("products").where("status", "==", "active").limit(120).get();
    const products = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json({ products });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.post(["/api/v1/public/stores/:sellerId/follow", "/api/v1/public/shops/:sellerId/follow"], async (req: Request, res: Response) => {
  const { sellerId } = req.params;
  try {
    let followerUid = (req as unknown as { user?: { uid: string } }).user?.uid;
    if (!followerUid && req.headers.authorization?.startsWith("Bearer ")) {
      try {
        const token = req.headers.authorization.split("Bearer ")[1];
        const decoded = await admin.auth().verifyIdToken(token);
        followerUid = decoded.uid;
      } catch {
        // ignore invalid token
      }
    }
    if (!followerUid && req.body?.followerId && typeof req.body.followerId === "string") {
      followerUid = req.body.followerId;
    }
    if (!followerUid) {
      return res.status(401).json({ success: false, error: "Veuillez vous connecter pour vous abonner à cette boutique." });
    }

    const { SellerAnalyticsService } = await import("./services/sellerAnalytics.service");
    const result = await SellerAnalyticsService.toggleFollowStore(sellerId, followerUid);
    return res.json({ success: true, ...result });
  } catch (err: unknown) {
    return res.status(500).json({ success: false, error: err instanceof Error ? err.message : "Erreur interne" });
  }
});

router.post(["/api/v1/public/stores/:sellerId/track", "/api/v1/public/shops/:sellerId/track"], async (req: Request, res: Response) => {
  const { sellerId } = req.params;
  const { eventType, productId, source } = req.body || {};
  try {
    if (eventType && typeof eventType === "string") {
      const { SellerAnalyticsService } = await import("./services/sellerAnalytics.service");
      await SellerAnalyticsService.trackStoreEvent(sellerId, { eventType, productId, source });
    }
    return res.json({ success: true });
  } catch {
    return res.json({ success: true });
  }
});

export default router;
