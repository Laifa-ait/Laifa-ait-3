import { Response, Router } from "express";
import { authenticateToken, require2FA, AuthenticatedRequest, getUserProfileFromCache, setUserProfileInCache, clearUserProfileCache } from "../../middlewares/auth";
import { SAFE_RESOURCE_ID_REGEX } from "../../middlewares/validation";
import { admin, db } from "../../config/firebase-admin";
import { CouponService } from "../marketing/coupon.service";
import { safeLogger } from "../../utils/logger";
import { profileUpdateSchema } from "../user/user.schema";

const authUserDataRouter = Router();

function stripSensitiveProfileFields(data: Record<string, unknown>): Record<string, unknown> {
  const cleaned = { ...data };
  delete cleaned.twoFactorSecret;
  delete cleaned.mfaSecret;
  delete cleaned.otpSecret;
  delete cleaned.internalNotes;
  return cleaned;
}

authUserDataRouter.get("/profile", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid || "";
  try {
    const cached = getUserProfileFromCache(uid);
    if (cached) {
      return res.json(stripSensitiveProfileFields({ uid, ...cached }));
    }
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) return res.status(404).json({ error: "User not found in Firestore" });
    const rawData = (userDoc.data() || {}) as Record<string, unknown>;
    setUserProfileInCache(uid, { uid: userDoc.id, ...rawData });
    return res.json(stripSensitiveProfileFields({ uid: userDoc.id, ...rawData }));
  } catch (error: unknown) {
    safeLogger.error("Error fetching profile", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur interne lors de la récupération du profil" });
  }
});

authUserDataRouter.post("/profile", authenticateToken, require2FA, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid || "";
    const parseResult = profileUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Données de profil invalides ou champ d'autorisation non autorisé.", details: parseResult.error.format() });
    }
    await db.collection("users").doc(uid).set({ ...parseResult.data, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    clearUserProfileCache(uid);
    return res.json({ success: true });
  } catch (error: unknown) {
    safeLogger.error("Error updating profile", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur interne lors de la mise à jour du profil" });
  }
});

authUserDataRouter.get("/cart", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid || "";
  try {
    const cartDoc = await db.collection("users").doc(uid).collection("cart").doc("active").get();
    return res.json({ items: cartDoc.exists ? cartDoc.data()?.items || [] : [] });
  } catch (error: unknown) {
    safeLogger.error("Get cart error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur interne lors de la récupération du panier" });
  }
});

authUserDataRouter.post("/cart", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid || "";
  const { items } = req.body || {};
  if (items !== undefined && (!Array.isArray(items) || items.length > 100)) {
    return res.status(400).json({ error: "Format du panier invalide ou nombre d'articles dépassé (max 100)" });
  }
  try {
    await db.collection("users").doc(uid).collection("cart").doc("active").set(
      { items: Array.isArray(items) ? items : [], updatedAt: Date.now() },
      { merge: true }
    );
    return res.json({ success: true });
  } catch (error: unknown) {
    safeLogger.error("Save cart error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur interne lors de la sauvegarde du panier" });
  }
});

authUserDataRouter.get("/wishlist", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid || "";
  try {
    const wishDoc = await db.collection("users").doc(uid).collection("wishlist").doc("active").get();
    return res.json({ items: wishDoc.exists ? wishDoc.data()?.items || [] : [] });
  } catch (error: unknown) {
    safeLogger.error("Get wishlist error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur interne lors de la récupération des favoris" });
  }
});

authUserDataRouter.post("/wishlist", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid || "";
  const { items } = req.body || {};
  if (items !== undefined && (!Array.isArray(items) || items.length > 200)) {
    return res.status(400).json({ error: "Format des favoris invalide ou limite dépassée (max 200)" });
  }
  try {
    await db.collection("users").doc(uid).collection("wishlist").doc("active").set(
      { items: Array.isArray(items) ? items : [], updatedAt: Date.now() },
      { merge: true }
    );
    return res.json({ success: true });
  } catch (error: unknown) {
    safeLogger.error("Save wishlist error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur interne lors de la sauvegarde des favoris" });
  }
});

authUserDataRouter.get("/notifications", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid || "";
  try {
    const [ordersSnap, directSnap, couponsSnap] = await Promise.all([
      db.collection("orders").where("userId", "==", uid).orderBy("updatedAt", "desc").limit(10).get(),
      db.collection("user_notifications").where("recipientId", "==", uid).orderBy("createdAt", "desc").limit(20).get(),
      db.collection("coupons").where("isActive", "==", true).orderBy("createdAt", "desc").limit(5).get(),
    ]);
    return res.json({
      orders: ordersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      direct: directSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      coupons: couponsSnap.docs.map((doc) => CouponService.formatPublicCouponDTO(doc.data(), doc.id)),
    });
  } catch (error: unknown) {
    safeLogger.error("Fetch notifications backend error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur interne lors de la récupération des notifications" });
  }
});

authUserDataRouter.post("/notifications/:id/read", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const uid = req.user?.uid;
  if (!uid) return res.status(401).json({ error: "Authentification requise" });
  if (!id || !SAFE_RESOURCE_ID_REGEX.test(id.trim())) {
    return res.status(400).json({ error: "Identifiant de notification invalide" });
  }

  try {
    const notifRef = db.collection("user_notifications").doc(id.trim());
    const notifSnap = await notifRef.get();
    if (!notifSnap.exists || notifSnap.data()?.recipientId !== uid) {
      return res.status(404).json({ error: "Notification introuvable" });
    }
    await notifRef.update({ read: true });
    return res.json({ success: true });
  } catch (error: unknown) {
    safeLogger.error("Mark notification read error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur interne lors de la mise à jour de la notification" });
  }
});

authUserDataRouter.post("/notifications/read-all", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid || "";
  try {
    const unreadSnap = await db.collection("user_notifications").where("recipientId", "==", uid).where("read", "==", false).get();
    const batch = db.batch();
    unreadSnap.docs.forEach((doc) => batch.update(doc.ref, { read: true }));
    await batch.commit();
    return res.json({ success: true });
  } catch (error: unknown) {
    safeLogger.error("Mark all notifications read error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur interne lors de la mise à jour des notifications" });
  }
});

authUserDataRouter.get("/user-habits", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid || "";
    const docSnap = await db.collection("user_habits").doc(uid).get();
    if (docSnap.exists) return res.json(docSnap.data() || {});
    return res.json({ historique_recherches: [], categories_visitees: {} });
  } catch (error: unknown) {
    safeLogger.error("Get user-habits error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur interne" });
  }
});

authUserDataRouter.post("/user-habits", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid || "";
    const body = (req.body || {}) as Record<string, unknown>;
    const safeHabits: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (Array.isArray(body.historique_recherches)) {
      safeHabits.historique_recherches = body.historique_recherches.filter((s): s is string => typeof s === "string").slice(0, 50).map((s) => s.slice(0, 120));
    }
    if (body.categories_visitees && typeof body.categories_visitees === "object" && !Array.isArray(body.categories_visitees)) {
      const safeCats: Record<string, number> = {};
      Object.entries(body.categories_visitees as Record<string, unknown>).slice(0, 50).forEach(([k, v]) => {
        if (typeof v === "number" && Number.isFinite(v) && k.length <= 80) safeCats[k] = v;
      });
      safeHabits.categories_visitees = safeCats;
    }
    await db.collection("user_habits").doc(uid).set(safeHabits, { merge: true });
    return res.json({ success: true });
  } catch (error: unknown) {
    safeLogger.error("Post user-habits error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur interne" });
  }
});

authUserDataRouter.get("/following/:shopId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shopId } = req.params;
    if (!shopId || !SAFE_RESOURCE_ID_REGEX.test(shopId.trim())) return res.status(400).json({ error: "Identifiant de boutique invalide" });
    const followDoc = await db.collection("users").doc(req.user?.uid || "").collection("following").doc(shopId.trim()).get();
    return res.json({ following: followDoc.exists });
  } catch (error: unknown) {
    safeLogger.error("Get following error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur interne" });
  }
});

authUserDataRouter.post("/following/:shopId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shopId } = req.params;
    if (!shopId || !SAFE_RESOURCE_ID_REGEX.test(shopId.trim())) return res.status(400).json({ error: "Identifiant de boutique invalide" });
    const body = (req.body || {}) as Record<string, unknown>;
    const safeFollowData: Record<string, unknown> = { followedAt: new Date().toISOString() };
    if (typeof body.shopName === "string") safeFollowData.shopName = body.shopName.slice(0, 120);
    if (typeof body.logoUrl === "string") safeFollowData.logoUrl = body.logoUrl.slice(0, 500);
    if (typeof body.category === "string") safeFollowData.category = body.category.slice(0, 100);
    if (typeof body.wilaya === "string") safeFollowData.wilaya = body.wilaya.slice(0, 80);
    await db.collection("users").doc(req.user?.uid || "").collection("following").doc(shopId.trim()).set(safeFollowData);
    return res.json({ success: true });
  } catch (error: unknown) {
    safeLogger.error("Post following error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur interne" });
  }
});

authUserDataRouter.delete("/following/:shopId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shopId } = req.params;
    if (!shopId || !SAFE_RESOURCE_ID_REGEX.test(shopId.trim())) return res.status(400).json({ error: "Identifiant de boutique invalide" });
    await db.collection("users").doc(req.user?.uid || "").collection("following").doc(shopId.trim()).delete();
    return res.json({ success: true });
  } catch (error: unknown) {
    safeLogger.error("Delete following error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur interne" });
  }
});

export default authUserDataRouter;
