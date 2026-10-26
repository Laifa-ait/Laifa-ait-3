import { Router, Request, Response } from "express";
import { admin, db } from "../../config/firebase-admin";
import { safeLogger } from "../../utils/logger";
import { PublicShopDTO } from "./shop.types";
import { buildWhitelistedShopDTO } from "./shopPublic.projection";
import { StorePublicService } from "./services/storePublic.service";
import { USER_STATUSES } from "../user/user.status";

export { buildWhitelistedShopDTO };

const router = Router();

// GET explore top sellers
router.get("/api/v1/explore/sellers", async (_req: Request, res: Response) => {
  try {
    const [usersSnap, publicProfilesSnap] = await Promise.all([
      db.collection("users").where("role", "==", "seller").limit(100).get(),
      db.collection("publicProfiles").limit(100).get(),
    ]);

    const pubProfilesMap = new Map<string, Record<string, unknown>>();
    publicProfilesSnap.docs.forEach((d) => {
      pubProfilesMap.set(d.id, d.data() || {});
    });

    const sellers: PublicShopDTO[] = [];
    for (const userDoc of usersSnap.docs) {
      if (!userDoc.exists) continue;
      const userData = userDoc.data() || {};
      const userRole = typeof userData.role === "string" ? userData.role.trim() : "";
      if (userRole !== "seller") continue;
      const userStatus = typeof userData.status === "string" ? userData.status.trim().toLowerCase() : "";
      if (userStatus !== USER_STATUSES.ACTIVE) continue;

      const pubData = pubProfilesMap.get(userDoc.id) || {};
      sellers.push(buildWhitelistedShopDTO(userDoc.id, userData, pubData));
    }

    return res.json({ success: true, sellers });
  } catch (error: unknown) {
    safeLogger.error("Error fetching explore sellers", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: "Erreur lors de la récupération des vendeurs" });
  }
});

// GET public shops directory
router.get("/api/v1/public/shops", async (_req: Request, res: Response) => {
  try {
    const [usersSnap, publicProfilesSnap] = await Promise.all([
      db.collection("users").where("role", "==", "seller").limit(200).get(),
      db.collection("publicProfiles").limit(200).get(),
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

    safeLogger.info("/api/v1/public/shops fetched public shop profiles", { count: shops.length });
    return res.json({ success: true, shops });
  } catch (error: unknown) {
    safeLogger.error("Error fetching public shops", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: "Erreur lors de la récupération des boutiques" });
  }
});

// GET single public store profile with slug/UID resolution and published layout projection
router.get(["/api/v1/public/stores/:slugOrId", "/api/v1/public/shops/:slugOrId"], async (req: Request, res: Response) => {
  const { slugOrId } = req.params;
  try {
    if (!slugOrId || typeof slugOrId !== "string" || !slugOrId.trim()) {
      return res.status(400).json({ success: false, error: "Identifiant ou slug manquant" });
    }

    const storefrontData = await StorePublicService.resolveAndGetStorefront(slugOrId);
    return res.json({
      success: true,
      shop: {
        id: storefrontData.sellerId,
        sellerId: storefrontData.sellerId,
        canonicalSlug: storefrontData.canonicalSlug,
        redirectToSlug: storefrontData.redirectToSlug,
        hasPaidStudioSubscription: storefrontData.hasPaidStudioSubscription,
        shopName: storefrontData.storeConfig.shopName,
        shopSlug: storefrontData.storeConfig.shopSlug,
        shopDescription: storefrontData.storeConfig.shopDescription,
        wilaya: storefrontData.storeConfig.wilaya,
        commune: storefrontData.storeConfig.commune,
        logoUrl: storefrontData.storeConfig.logoUrl,
        bannerUrl: storefrontData.storeConfig.bannerUrl,
        brandStory: storefrontData.storeConfig.brandStory,
        returnPolicy: storefrontData.storeConfig.returnPolicy,
        avgPreparationTime: storefrontData.storeConfig.avgPreparationTime,
        legalStatus: storefrontData.storeConfig.legalStatus,
        followersCount: storefrontData.trustMetrics.followersCount,
        rating: storefrontData.trustMetrics.ratingAverage,
        theme: storefrontData.storeConfig.theme,
        seo: storefrontData.storeConfig.seo,
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

// GET public products for shop (supports both seller UID and shopSlug)
router.get(["/api/v1/public/shops/:sellerId/products", "/api/v1/public/stores/:sellerId/products"], async (req: Request, res: Response) => {
  const { sellerId } = req.params;
  try {
    if (!sellerId) {
      return res.status(400).json({ success: false, error: "Missing sellerId parameter" });
    }

    const products = await StorePublicService.fetchSellerPublicProducts(sellerId);
    return res.json({ success: true, products, count: products.length });
  } catch (error: unknown) {
    safeLogger.error("Error fetching shop products", { sellerId, err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Erreur interne", products: [] });
  }
});

// GET public active coupons for a shop
router.get("/api/v1/public/shops/:sellerId/coupons", async (req: Request, res: Response) => {
  const { sellerId } = req.params;
  try {
    if (!sellerId) {
      return res.status(400).json({ success: false, error: "Missing sellerId parameter" });
    }

    const snap = await db
      .collection("coupons")
      .where("sellerId", "==", sellerId)
      .where("isActive", "==", true)
      .get();

    const now = new Date();
    const activeCoupons = snap.docs
      .map((doc) => {
        const d = doc.data();

        // Check if usage limit reached
        const maxUses = typeof d.maxUses === "number" ? d.maxUses : (typeof d.usageLimit === "number" ? d.usageLimit : null);
        const currentUses = Number(d.usedCount ?? d.usageCount) || 0;
        if (maxUses !== null && maxUses > 0 && currentUses >= maxUses) {
          return null;
        }

        let expiresAtIso: string | null = null;
        if (d.expiresAt?.toDate) {
          expiresAtIso = d.expiresAt.toDate().toISOString();
        } else if (d.expiryDate?.toDate) {
          expiresAtIso = d.expiryDate.toDate().toISOString();
        } else if (typeof d.expiresAt === "string") {
          expiresAtIso = d.expiresAt;
        }

        const isExpired = expiresAtIso ? new Date(expiresAtIso) <= now : false;
        if (isExpired) return null;

        let createdAtMs = 0;
        if (d.createdAt?.toDate) {
          createdAtMs = d.createdAt.toDate().getTime();
        } else if (d.createdAt?.seconds) {
          createdAtMs = d.createdAt.seconds * 1000;
        } else if (d.createdAt) {
          createdAtMs = new Date(d.createdAt).getTime() || 0;
        }

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

    // Deterministic sort: creation descending, then expiration, then id ascending
    activeCoupons.sort((a, b) => {
      if (b.createdAtMs !== a.createdAtMs) {
        return b.createdAtMs - a.createdAtMs;
      }
      if (a.expiresAt && b.expiresAt) {
        const cmp = new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
        if (cmp !== 0) return cmp;
      }
      return a.id.localeCompare(b.id);
    });

    const publicCoupons = activeCoupons.map(({ createdAtMs: _ignored, ...dto }) => dto);

    return res.json({ success: true, coupons: publicCoupons });
  } catch (error: unknown) {
    safeLogger.error("Error fetching shop public coupons", {
      sellerId,
      err: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Erreur interne",
      coupons: [],
    });
  }
});

// GET explore top products
router.get("/api/v1/explore/products", async (_req: Request, res: Response) => {
  try {
    const snap = await db.collection("products").where("status", "==", "active").limit(120).get();
    const products = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json({ products });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

// POST follow or unfollow store
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
        // ignore
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
    const msg = err instanceof Error ? err.message : "Erreur interne";
    return res.status(500).json({ success: false, error: msg });
  }
});

// POST non-blocking store event tracking (store_view, product_view, cart_add)
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
