import { admin, db } from "../config/firebase-admin";
import { CouponService } from "../domains/marketing/coupon.service";
import { safeLogger } from "../utils/logger";

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

  static async ensureInitialProductsSeeded(): Promise<void> {
    if (CoreService.initialProductsChecked) return;
    try {
      const snap = await db.collection("products").limit(1).get();
      CoreService.initialProductsChecked = true;
      if (snap.empty) {
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
            name: "Jus d'Orange Pressé Bio",
            price: 350,
            promoPrice: 280,
            category: "Supermarché",
            description: "Jus d'orange 100% naturel sans sucre ajouté.",
            image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
            images: ["https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80"],
            wilaya: "Alger",
            stock: 120,
            rating: 4.9,
            tags: ["Supermarché", "Jus", "Boisson"],
            sellerId: "admin_seed",
            sellerName: "Boutique Officielle Olmart",
            status: "active",
            media: [{ url: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80", type: "image" }],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          {
            name: "Lampe 'Sahara Glow'",
            price: 32000,
            flashPrice: 24900,
            category: "Luminaires",
            description: "Une lumière d'ambiance qui rappelle les couchers de soleil du Sahara.",
            image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
            images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80"],
            wilaya: "Ghardaïa",
            stock: 8,
            rating: 4.7,
            tags: ["Lumière", "Ambiance", "Design"],
            sellerId: "admin_seed",
            sellerName: "Boutique Officielle Olmart",
            status: "active",
            media: [{ url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80", type: "image" }],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          {
            name: "Tapis Zindkh de Constantine",
            price: 85000,
            promoPrice: 69000,
            category: "Tapis",
            description: "Tapis tissé main selon la tradition séculaire de l'Est Algérien.",
            image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
            images: ["https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80"],
            wilaya: "Constantine",
            stock: 5,
            rating: 5.0,
            tags: ["Tapis", "Handmade", "Constantine"],
            sellerId: "admin_seed",
            sellerName: "Boutique Officielle Olmart",
            status: "active",
            media: [{ url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80", type: "image" }],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          {
            name: "Machine à Café Espresso DZ Pro",
            price: 45000,
            flashPrice: 38000,
            category: "Électronique & Électroménager",
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
          {
            name: "Vase Artisanal d'Aït Yenni",
            price: 18000,
            promoPrice: 14500,
            category: "Artisanat",
            description: "Vase céramique fait main sculpté par des artisans de Kabylie.",
            image: "https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?auto=format&fit=crop&w=800&q=80",
            images: ["https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?auto=format&fit=crop&w=800&q=80"],
            wilaya: "Tizi Ouzou",
            stock: 10,
            rating: 4.9,
            tags: ["Artisanat", "Kabylie", "Céramique"],
            sellerId: "admin_seed",
            sellerName: "Boutique Officielle Olmart",
            status: "active",
            media: [{ url: "https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?auto=format&fit=crop&w=800&q=80", type: "image" }],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }
        ];

        const batch = db.batch();
        for (const prod of sampleProducts) {
          const ref = db.collection("products").doc();
          batch.set(ref, prod);
        }
        await batch.commit();
        safeLogger.info("[CoreService] ✅ Initial catalog seeded successfully.");
      }
    } catch (err: unknown) {
      safeLogger.warn("[CoreService] Could not auto-seed initial products", { err: err instanceof Error ? err.message : String(err) });
    }
  }

  static async getHomeData() {
    if (CoreService.cachedHomeData && (Date.now() - CoreService.cachedHomeDataAt) < CoreService.HOME_DATA_TTL_MS) {
      return CoreService.cachedHomeData;
    }

    const startTime = Date.now();
    try {
      await CoreService.ensureInitialProductsSeeded();

      const [productsSnap, categoriesSnap, sectionsSnap, bannersSnap, tagsSnap, sellersSnap] = await Promise.all([
        db.collection("products").where("status", "in", ["active", "approved"]).limit(24).get().catch(async () => {
          return db.collection("products").limit(24).get().catch(() => ({ docs: [] }));
        }),
        db.collection("homepage_categories_v2").limit(100).get().catch(() => ({ docs: [] })),
        db.collection("homepage_sections").orderBy("orderIndex", "asc").limit(50).get().catch(() => ({ docs: [] })),
        db.collection("banners").limit(30).get().catch(() => ({ docs: [] })),
        db.collection("tags").limit(100).get().catch(() => ({ docs: [] })),
        db.collection("publicProfiles").limit(20).get().catch(() => ({ docs: [] })),
      ]);

      const categories = categoriesSnap.docs.map((doc: FirestoreDocSnapshot) => ({ id: doc.id, ...doc.data() }));
      const sections = sectionsSnap.docs.map((doc: FirestoreDocSnapshot) => ({ id: doc.id, ...doc.data() }));
          
      const banners = (bannersSnap.docs
        .map((doc: FirestoreDocSnapshot) => ({ id: doc.id, ...doc.data() })) as BannerDoc[])
        .filter((b) => b.is_active !== false && b.isActive !== false)
        .sort((a, b) => (a.sort_order ?? a.orderIndex ?? 0) - (b.sort_order ?? b.orderIndex ?? 0));
      const tags = tagsSnap.docs.map((doc: FirestoreDocSnapshot) => ({ id: doc.id, ...doc.data() }));
      let productsLoaded = (productsSnap.docs
        .map((doc: FirestoreDocSnapshot) => ({ id: doc.id, ...doc.data() })) as ProductDocItem[])
        .filter((d) => d && (d.stock === undefined || d.stock > 0));
      productsLoaded = productsLoaded.sort((a, b) => {
        const scoreA = a.sellerTrustScore ?? 50;
        const scoreB = b.sellerTrustScore ?? 50;
        return scoreB - scoreA;
      });
      const topTier = productsLoaded.filter((p) => (p.sellerTrustScore ?? 100) >= 75).slice(0, 8);
      const featuredProducts = topTier.length >= 4 ? topTier : productsLoaded.slice(0, 8);
      const sellers = sellersSnap.docs.map((doc: FirestoreDocSnapshot) => ({ id: doc.id, ...doc.data() }));
      const duration = Date.now() - startTime;
      safeLogger.info("/api/v1/public/home-data processed", { durationMs: duration });
      const result = {
        categories,
        sections,
        banners,
        tags,
        featuredProducts,
        sellers,
      };
      CoreService.cachedHomeData = result;
      CoreService.cachedHomeDataAt = Date.now();
      return result;
    } catch (err: unknown) {
      const duration = Date.now() - startTime;
      safeLogger.error("/api/v1/public/home-data failed", { durationMs: duration, err: err instanceof Error ? err.message : String(err) });
      throw new Error("Failed to load homepage data", { cause: err });
    }
  }

  private static cachedSettings: Record<string, unknown> | null = null;
  private static cachedSettingsAt = 0;
  private static readonly SETTINGS_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

  static async getPublicSettings() {
    if (CoreService.cachedSettings && (Date.now() - CoreService.cachedSettingsAt) < CoreService.SETTINGS_TTL_MS) {
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
    try {
      if (!db || typeof db.collection !== "function") {
        return defaultSettings;
      }
      const docSnap = await Promise.race([
        db.collection("settings").doc("global").get(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Firestore settings timeout (1500ms)")), 1500)),
      ]);
      const data = docSnap.exists ? (docSnap.data() || {}) : {};
      CoreService.cachedSettings = { ...defaultSettings, ...data };
      CoreService.cachedSettingsAt = Date.now();
      return CoreService.cachedSettings;
    } catch (err: unknown) {
      safeLogger.warn("[CoreService] Failed to read public settings from DB, returning resilient default", {
        err: err instanceof Error ? err.message : String(err),
      });
      return CoreService.cachedSettings || defaultSettings;
    }
  }

  static async logError(body: LogErrorBody) {
    const { message, stack, componentStack, type, url, userAgent, userId } = body;
    const safeMessage = typeof message === "string" ? message.slice(0, 2000) : "Unknown error";
    // In production, strip deep internal stack paths and PII
    const isProd = process.env.NODE_ENV === "production";
    const safeStack = typeof stack === "string"
      ? (isProd ? stack.split("\n").slice(0, 5).map(l => l.trim()).join("\n").slice(0, 1000) : stack.slice(0, 2000))
      : "";

    await db.collection("site_errors").add({
      message: safeMessage,
      stack: safeStack,
      componentStack: typeof componentStack === "string" ? componentStack.slice(0, 1000) : "",
      type: typeof type === "string" ? type.slice(0, 100) : "window_error",
      url: typeof url === "string" ? url.slice(0, 500) : "",
      userAgent: typeof userAgent === "string" ? userAgent.slice(0, 300) : "",
      userId: typeof userId === "string" ? userId.slice(0, 128) : null,
      timestamp: new Date().toISOString(),
      resolved: false,
    });
    return true;
  }

  static async getPublicProfiles(ids: string[]) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) return {};
    
    const profiles: Record<string, Record<string, unknown>> = {};
    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += 10) {
      chunks.push(ids.slice(i, i + 10));
    }
        
    const fetchPromises = chunks.map(async (chunk) => {
      const snap = await db.collection("publicProfiles").where(admin.firestore.FieldPath.documentId(), "in", chunk).get();
      snap.docs.forEach((doc) => {
        profiles[doc.id] = { id: doc.id, ...doc.data() };
      });
    });
    await Promise.all(fetchPromises);
    return profiles;
  }

  static async validateCoupon(code: string, userId: string | undefined, items: unknown) {
    if (!code || typeof code !== "string" || !code.trim()) throw new Error("Code requis");
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Panier requis pour valider ce code promo.");
    }

    const reconstructed = await CouponService.reconstructVerifiedCartFromFirestore(items, db);
    if (!reconstructed.valid) {
      throw new Error(reconstructed.error || "Panier invalide pour ce code promo.");
    }

    const upperCode = code.trim().toUpperCase();
    const qSnap = await db.collection("coupons").where("code", "==", upperCode).get();
    
    const resolveResult = CouponService.resolveActiveCouponFromDocs(qSnap.docs);
    if (!resolveResult.couponDoc) {
      throw new Error(resolveResult.error || "Coupon not found");
    }
        
    const couponDoc = resolveResult.couponDoc;
    const couponData = couponDoc.data() as Record<string, unknown>;

    const validation = CouponService.validateCoupon({
      couponDocId: couponDoc.id,
      couponData,
      subtotal: reconstructed.serverSubtotal,
      userId,
      isGuest: !userId || userId.startsWith("guest_"),
      items: reconstructed.verifiedItems,
    });

    if (!validation.valid) {
      throw new Error(validation.error || "Coupon invalide");
    }

    return validation.coupon;
  }
}

