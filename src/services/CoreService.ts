import { admin, db } from "../config/firebase-admin";
import { CouponService } from "../domains/marketing/coupon.service";
import { safeLogger } from "../utils/logger";
import { withFirestoreDeadline } from "../utils/firestoreTimeout";

interface FirestoreDocSnapshot {
  id: string;
  data: () => Record<string, unknown>;
}

interface BannerDoc {
  id: string;
  is_active?: boolean;
  isActive?: boolean;
  sort_order?: number;
  orderIndex?: number;
  [key: string]: unknown;
}

interface ProductDocItem {
  id: string;
  stock?: number;
  sellerTrustScore?: number;
  [key: string]: unknown;
}

export interface LogErrorBody {
  message?: string;
  stack?: string;
  componentStack?: string;
  type?: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  [key: string]: unknown;
}

export class CoreService {
  private static initialProductsChecked = false;
  private static cachedHomeData: Record<string, unknown> | null = null;
  private static cachedHomeDataAt = 0;
  private static readonly HOME_DATA_TTL_MS = 30 * 1000;

  static invalidateHomeDataCache(): void {
    CoreService.cachedHomeData = null;
    CoreService.cachedHomeDataAt = 0;
  }

  static async ensureInitialProductsSeeded(): Promise<void> {
    if (CoreService.initialProductsChecked) return;
    CoreService.initialProductsChecked = true;
    try {
      const snap = await withFirestoreDeadline(
        () => db.collection("products").limit(1).get(),
        null,
        1500,
        "seed_check"
      );
      if (!snap || !snap.empty) return;

      safeLogger.info("[CoreService] 🚀 Empty products collection detected. Auto-seeding initial marketplace products...");
      const sampleProducts = [
        {
          name: "Canapé Modular 'Atlas'",
          price: 145000,
          promoPrice: 125000,
          category: "Maison & Déco",
          description: "Un canapé moderne inspiré par les paysages de l'Atlas. Tissu premium et confort absolu.",
          image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
          images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"],
          wilaya: "Alger",
          stock: 15,
          rating: 4.8,
          tags: ["Premium", "Salon", "Moderne"],
          sellerId: "admin_seed",
          sellerName: "Boutique Officielle Olmart",
          status: "active",
          media: [{ url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80", type: "image" }],
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        {
          name: "Machine à Café Espresso DZ Pro",
          price: 45000,
          flashPrice: 38000,
          category: "Électroménager",
          description: "Performances professionnelles pour votre cuisine.",
          image: "https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?auto=format&fit=crop&w=800&q=80",
          images: ["https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?auto=format&fit=crop&w=800&q=80"],
          wilaya: "Oran",
          stock: 15,
          rating: 4.6,
          tags: ["Cuisine", "Tech", "Café"],
          sellerId: "admin_seed",
          sellerName: "Boutique Officielle Olmart",
          status: "active",
          media: [{ url: "https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?auto=format&fit=crop&w=800&q=80", type: "image" }],
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      ];

      const batch = db.batch();
      for (const prod of sampleProducts) {
        batch.set(db.collection("products").doc(), prod);
      }
      await withFirestoreDeadline(() => batch.commit(), undefined, 1500, "seed_commit");
    } catch (err: unknown) {
      safeLogger.warn("[CoreService] Could not auto-seed initial products", { err: err instanceof Error ? err.message : String(err) });
    }
  }

  static async getHomeData() {
    if (CoreService.cachedHomeData && Date.now() - CoreService.cachedHomeDataAt < CoreService.HOME_DATA_TTL_MS) {
      return CoreService.cachedHomeData;
    }

    const startTime = Date.now();
    const emptySnap = { docs: [] as FirestoreDocSnapshot[] };
    try {
      await CoreService.ensureInitialProductsSeeded();

      const [productsSnap, categoriesSnap, sectionsSnap, bannersSnap, tagsSnap, sellersSnap] = await Promise.all([
        withFirestoreDeadline(
          () =>
            db.collection("products").where("status", "in", ["active", "approved"]).limit(24).get().catch(() =>
              db.collection("products").limit(24).get()
            ),
          emptySnap,
          1600,
          "home_products"
        ),
        withFirestoreDeadline(() => db.collection("homepage_categories_v2").limit(100).get(), emptySnap, 1500, "home_cats"),
        withFirestoreDeadline(() => db.collection("homepage_sections").orderBy("orderIndex", "asc").limit(50).get(), emptySnap, 1500, "home_sections"),
        withFirestoreDeadline(() => db.collection("banners").limit(30).get(), emptySnap, 1500, "home_banners"),
        withFirestoreDeadline(() => db.collection("tags").limit(100).get(), emptySnap, 1500, "home_tags"),
        withFirestoreDeadline(() => db.collection("publicProfiles").limit(20).get(), emptySnap, 1500, "home_sellers"),
      ]);

      const categories = categoriesSnap.docs.map((doc: FirestoreDocSnapshot) => ({ id: doc.id, ...doc.data() }));
      const sections = sectionsSnap.docs.map((doc: FirestoreDocSnapshot) => ({ id: doc.id, ...doc.data() }));

      const banners = (bannersSnap.docs.map((doc: FirestoreDocSnapshot) => ({ id: doc.id, ...doc.data() })) as BannerDoc[])
        .filter((b) => b.is_active !== false && b.isActive !== false)
        .sort((a, b) => (a.sort_order ?? a.orderIndex ?? 0) - (b.sort_order ?? b.orderIndex ?? 0));
      const tags = tagsSnap.docs.map((doc: FirestoreDocSnapshot) => ({ id: doc.id, ...doc.data() }));
      let productsLoaded = (productsSnap.docs.map((doc: FirestoreDocSnapshot) => ({ id: doc.id, ...doc.data() })) as ProductDocItem[])
        .filter((d) => d && (d.stock === undefined || d.stock > 0));
      productsLoaded = productsLoaded.sort((a, b) => (b.sellerTrustScore ?? 50) - (a.sellerTrustScore ?? 50));
      const topTier = productsLoaded.filter((p) => (p.sellerTrustScore ?? 100) >= 75).slice(0, 8);
      const featuredProducts = topTier.length >= 4 ? topTier : productsLoaded.slice(0, 8);
      const sellers = sellersSnap.docs.map((doc: FirestoreDocSnapshot) => ({ id: doc.id, ...doc.data() }));
      safeLogger.info("/api/v1/public/home-data processed", { durationMs: Date.now() - startTime });
      const result = { categories, sections, banners, tags, featuredProducts, sellers };
      CoreService.cachedHomeData = result;
      CoreService.cachedHomeDataAt = Date.now();
      return result;
    } catch (err: unknown) {
      safeLogger.error("/api/v1/public/home-data failed", { durationMs: Date.now() - startTime, err: err instanceof Error ? err.message : String(err) });
      throw new Error("Failed to load homepage data", { cause: err });
    }
  }

  private static cachedSettings: Record<string, unknown> | null = null;
  private static cachedSettingsAt = 0;
  private static readonly SETTINGS_TTL_MS = 5 * 60 * 1000;

  static async getPublicSettings() {
    if (CoreService.cachedSettings && Date.now() - CoreService.cachedSettingsAt < CoreService.SETTINGS_TTL_MS) {
      return CoreService.cachedSettings;
    }
    const defaultSettings = {
      siteName: "Olmart",
      supportEmail: "support@olmart.dz",
      contactPhone: "+213 21 00 00 00",
      currency: "DZD",
      currencySymbol: "DA",
      shippingAvailable: true,
    };
    if (!db || typeof db.collection !== "function") return defaultSettings;
    const docSnap = await withFirestoreDeadline(
      () => db.collection("settings").doc("global").get(),
      null,
      1500,
      "public_settings"
    );
    const data = docSnap && docSnap.exists ? docSnap.data() || {} : {};
    CoreService.cachedSettings = { ...defaultSettings, ...data };
    CoreService.cachedSettingsAt = Date.now();
    return CoreService.cachedSettings;
  }

  static async logError(body: LogErrorBody) {
    const { message, stack, componentStack, type, url, userAgent, userId } = body;
    const safeMessage = typeof message === "string" ? message.slice(0, 2000) : "Unknown error";
    const isProd = process.env.NODE_ENV === "production";
    const safeStack = typeof stack === "string"
      ? isProd ? stack.split("\n").slice(0, 5).map((l) => l.trim()).join("\n").slice(0, 1000) : stack.slice(0, 2000)
      : "";

    await withFirestoreDeadline(
      () =>
        db.collection("site_errors").add({
          message: safeMessage,
          stack: safeStack,
          componentStack: typeof componentStack === "string" ? componentStack.slice(0, 1000) : "",
          type: typeof type === "string" ? type.slice(0, 100) : "window_error",
          url: typeof url === "string" ? url.slice(0, 500) : "",
          userAgent: typeof userAgent === "string" ? userAgent.slice(0, 300) : "",
          userId: typeof userId === "string" ? userId.slice(0, 128) : null,
          timestamp: new Date().toISOString(),
          resolved: false,
        }),
      null,
      1500,
      "log_error"
    );
    return true;
  }

  static async getPublicProfiles(ids: string[]) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) return {};
    const profiles: Record<string, Record<string, unknown>> = {};
    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));
    await Promise.all(
      chunks.map(async (chunk) => {
        const snap = await withFirestoreDeadline(
          () => db.collection("publicProfiles").where(admin.firestore.FieldPath.documentId(), "in", chunk).get(),
          null,
          1500,
          "public_profiles_batch"
        );
        (snap?.docs || []).forEach((doc) => {
          profiles[doc.id] = { id: doc.id, ...doc.data() };
        });
      })
    );
    return profiles;
  }

  static async validateCoupon(code: string, userId: string | undefined, items: unknown) {
    if (!code || typeof code !== "string" || !code.trim()) throw new Error("Code requis");
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Panier requis pour valider ce code promo.");
    }
    const reconstructed = await CouponService.reconstructVerifiedCartFromFirestore(items, db);
    if (!reconstructed.valid) throw new Error(reconstructed.error || "Panier invalide pour ce code promo.");
    const upperCode = code.trim().toUpperCase();
    const qSnap = await db.collection("coupons").where("code", "==", upperCode).get();
    const resolveResult = CouponService.resolveActiveCouponFromDocs(qSnap.docs);
    if (!resolveResult.couponDoc) throw new Error(resolveResult.error || "Coupon not found");
    const couponDoc = resolveResult.couponDoc;
    const validation = CouponService.validateCoupon({
      couponDocId: couponDoc.id,
      couponData: couponDoc.data() as Record<string, unknown>,
      subtotal: reconstructed.serverSubtotal,
      userId,
      isGuest: !userId || userId.startsWith("guest_"),
      items: reconstructed.verifiedItems,
    });
    if (!validation.valid) throw new Error(validation.error || "Coupon invalide");
    return validation.coupon;
  }
}
