import { Router, Response } from "express";
import { optionalAuthenticateToken, AuthenticatedRequest, getUserProfileFromCache } from "../../middlewares/auth";
import { SettingsService } from "../home/services/settings.service";
import { db } from "../../config/firebase-admin";
import { safeLogger } from "../../utils/logger";

import { isPubliclyVisible, PRODUCT_STATUSES } from "../product/product.status";

const router = Router();
let cachedFeaturedProducts: { items: Array<Record<string, unknown>>; cachedAt: number } | null = null;
let inFlightFeaturedPromise: Promise<Array<Record<string, unknown>>> | null = null;
const FEATURED_BOOTSTRAP_TTL_MS = 5 * 60 * 1000;

async function getCachedFeaturedProducts(): Promise<Array<Record<string, unknown>>> {
  if (
    process.env.NODE_ENV !== "test" &&
    cachedFeaturedProducts &&
    Date.now() - cachedFeaturedProducts.cachedAt < FEATURED_BOOTSTRAP_TTL_MS
  ) {
    return cachedFeaturedProducts.items;
  }
  if (inFlightFeaturedPromise) return inFlightFeaturedPromise;

  inFlightFeaturedPromise = db
    .collection("products")
    .where("status", "==", PRODUCT_STATUSES.ACTIVE)
    .limit(20)
    .get()
    .then((snap) => {
      const items = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((p) => isPubliclyVisible(p as { status?: string }));
      cachedFeaturedProducts = { items, cachedAt: Date.now() };
      return items;
    })
    .finally(() => {
      inFlightFeaturedPromise = null;
    });

  return inFlightFeaturedPromise;
}

function projectUserProfile(data: Record<string, unknown> | undefined, uid: string) {
  if (!data) return null;
  return {
    uid,
    displayName: data.displayName || "",
    email: data.email || "",
    photoURL: data.photoURL || null,
    phone: data.phone || null,
    role: data.role || "buyer",
    wilaya: data.wilaya || null,
    commune: data.commune || null,
    address: data.address || null,
  };
}

/**
 * GET /api/v1/bootstrap
 * Single-pass consolidated initialization endpoint for ultra-fast mobile & desktop startup.
 * Aggregates mega menu, category hierarchy, featured products, user profile, active cart, and wishlist.
 */
router.get("/bootstrap", optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid;

  try {
    const cachedProfile = uid ? getUserProfileFromCache(uid) : null;
    const [megamenuRes, categoriesRes, featuredRes, profileRes, cartRes, wishlistRes] = await Promise.allSettled([
      SettingsService.getSettingById("megamenu"),
      SettingsService.getCategoriesHierarchy(),
      getCachedFeaturedProducts(),
      uid
        ? cachedProfile
          ? Promise.resolve(projectUserProfile(cachedProfile, uid))
          : db
              .collection("users")
              .doc(uid)
              .get()
              .then((doc) => (doc.exists ? projectUserProfile(doc.data(), doc.id) : null))
        : Promise.resolve(null),
      uid ? db.collection("users").doc(uid).collection("cart").doc("active").get().then((doc) => (doc.exists ? doc.data()?.items || [] : [])) : Promise.resolve([]),
      uid ? db.collection("users").doc(uid).collection("wishlist").doc("active").get().then((doc) => (doc.exists ? doc.data()?.items || [] : [])) : Promise.resolve([]),
    ]);

    const megamenu = megamenuRes.status === "fulfilled" ? megamenuRes.value : {};
    const categories = categoriesRes.status === "fulfilled" ? categoriesRes.value : {};
    const featuredProducts = featuredRes.status === "fulfilled" ? featuredRes.value : [];
    const profile = profileRes.status === "fulfilled" ? profileRes.value : null;
    const cart = cartRes.status === "fulfilled" ? cartRes.value : [];
    const wishlist = wishlistRes.status === "fulfilled" ? wishlistRes.value : [];

    return res.json({
      success: true,
      data: {
        megamenu,
        categories,
        featuredProducts,
        profile,
        cart,
        wishlist,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    safeLogger.error("[Bootstrap API] Error aggregating initial payload", { err: msg });
    return res.status(500).json({ error: "Erreur lors de l'initialisation de l'application." });
  }
});

export default router;
