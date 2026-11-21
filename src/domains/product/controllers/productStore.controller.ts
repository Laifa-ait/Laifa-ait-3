import { Router } from "express";
import { admin, db } from "../../../config/firebase-admin";
import { Product } from "../product.types";
import { USER_STATUSES } from "../../user/user.status";
import { isPubliclyVisible } from "../product.status";
import NodeCache from "node-cache";
import { safeLogger } from "../../../utils/logger";
import { projectPublicStoreProfile } from "./publicStoreProjection";
import { resolveCollectionPagePayload } from "./productStoreCollectionHelper";

const cache = new NodeCache({ stdTTL: 300, maxKeys: 1000, useClones: true });

export function clearProductStoreCache(): void {
  cache.flushAll();
}

export const productStoreRouter = Router();

productStoreRouter.get("/api/v1/stores/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;
    if (!sellerId) return res.status(400).json({ error: "Missing sellerId" });

    const cacheKey = `store_page_${sellerId}`;
    if (process.env.NODE_ENV !== "test") {
      const cached = cache.get(cacheKey);
      if (cached) return res.json(cached);
    }

    const decodedId = decodeURIComponent(sellerId);
    let storeData: Record<string, unknown> | null = null;

    const [pubSnap, userSnap] = await Promise.all([
      db.collection("publicProfiles").doc(sellerId).get().catch(() => null),
      db.collection("users").doc(sellerId).get().catch(() => null),
    ]);

    if ((pubSnap && pubSnap.exists) || (userSnap && userSnap.exists)) {
      const pubData = pubSnap && pubSnap.exists ? pubSnap.data() || {} : {};
      const userData = userSnap && userSnap.exists ? userSnap.data() || {} : {};
      storeData = projectPublicStoreProfile(sellerId, { userData, pubData });
    }

    if (!storeData) {
      const slugQuery = await db.collection("users").where("shopSlug", "==", sellerId).limit(1).get().catch(() => null);
      if (slugQuery && !slugQuery.empty) {
        const docSnap = slugQuery.docs[0];
        storeData = projectPublicStoreProfile(docSnap.id, { userData: docSnap.data() });
      }
    }

    if (!storeData) {
      const nameQuery = await db.collection("users").where("shopName", "==", decodedId).limit(1).get().catch(() => null);
      if (nameQuery && !nameQuery.empty) {
        const docSnap = nameQuery.docs[0];
        storeData = projectPublicStoreProfile(docSnap.id, { userData: docSnap.data() });
      }
    }

    let products: Product[] = [];
    if (storeData) {
      const targetIds = Array.from(
        new Set(
          [storeData.id, storeData.sellerId, sellerId].filter(
            (v): v is string => typeof v === "string" && v.length > 0
          )
        )
      );
      const prodPromises = targetIds.map(async (tid) => {
        try {
          return await db.collection("products").where("sellerId", "==", tid).limit(50).get();
        } catch {
          return { docs: [] as admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>[] };
        }
      });
      const results = await Promise.all(prodPromises);
      const prodMap = new Map<string, Product>();
      results.forEach((snap) => {
        snap.docs.forEach((d) => {
          const prod = { id: d.id, ...d.data() } as Product;
          if (isPubliclyVisible(prod)) {
            prodMap.set(d.id, prod);
          }
        });
      });
      products = Array.from(prodMap.values());
    } else {
      let prodSnap = null;
      try {
        prodSnap = await db.collection("products").where("sellerId", "==", sellerId).limit(50).get();
      } catch {
        // Ignored
      }
      if (prodSnap && !prodSnap.empty) {
        const visibleProducts = prodSnap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Product))
          .filter((p) => isPubliclyVisible(p));
        if (visibleProducts.length > 0) {
          const sample = visibleProducts[0] as unknown as Record<string, unknown>;
          storeData = {
            id: sellerId,
            sellerId: sellerId,
            shopName: sample?.sellerName || sample?.storeName || sample?.brand || decodedId || "Boutique Vendeur",
            shopDescription: "Boutique partenaire sur Olmart.",
            logoUrl: sample?.sellerLogo || sample?.storeLogo || "",
            wilaya: sample?.wilaya || "16 - Alger",
            status: USER_STATUSES.ACTIVE,
          };
          products = visibleProducts;
        }
      }
    }

    if (!storeData) {
      return res.status(404).json({ error: "Store not found" });
    }

    const payload = {
      success: true,
      shop: storeData,
      ...storeData,
      products,
    };
    if (process.env.NODE_ENV !== "test") {
      cache.set(cacheKey, payload, 180);
    }
    return res.json(payload);
  } catch (error: unknown) {
    safeLogger.error("Store profile fetch error", {
      err: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
});

productStoreRouter.get("/api/v1/banners/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `banner_${id}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const docRef = db.collection("banners").doc(id);
    const snap = await docRef.get();
    if (!snap.exists) {
      return res.status(404).json({ error: "Banner not found" });
    }
    const bannerData = { id: snap.id, ...snap.data() } as {
      id: string;
      isActive?: boolean;
      linkedProductIds?: string[];
      products?: Product[];
      [key: string]: unknown;
    };
    if (bannerData.isActive === false) {
      return res.status(404).json({ error: "Banner not found" });
    }
    if (bannerData.linkedProductIds && bannerData.linkedProductIds.length > 0) {
      const productPromises = bannerData.linkedProductIds.slice(0, 50).map(async (pid: string) => {
        const d = await db.collection("products").doc(pid).get();
        if (!d.exists) return null;
        const prod = { id: d.id, ...d.data() } as Product;
        return isPubliclyVisible(prod) ? prod : null;
      });
      const productDocs = await Promise.all(productPromises);
      bannerData.products = productDocs.filter((p): p is Product => p !== null);
    } else {
      bannerData.products = [];
    }
    cache.set(cacheKey, bannerData, 900);
    return res.json(bannerData);
  } catch (error: unknown) {
    safeLogger.error("Banner fetch error", {
      err: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
});

productStoreRouter.get("/api/v1/collections/:collectionId", async (req, res) => {
  try {
    const { collectionId } = req.params;
    const cacheKey = `collection_${collectionId}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const responseData = await resolveCollectionPagePayload(collectionId);
    cache.set(cacheKey, responseData, 600);
    return res.json(responseData);
  } catch (error: unknown) {
    safeLogger.error("Collection fetch error", {
      err: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
});

productStoreRouter.get("/api/v1/settings/shipping", async (_req, res) => {
  try {
    const cacheKey = "settings_shipping";
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const docRef = db.collection("settings").doc("shipping");
    const snap = await docRef.get();
    if (!snap.exists) {
      return res.status(404).json({ error: "Shipping settings not found" });
    }
    const shippingData = { id: snap.id, ...snap.data() };
    cache.set(cacheKey, shippingData, 1800);
    return res.json(shippingData);
  } catch (error: unknown) {
    safeLogger.error("Shipping settings fetch error", {
      err: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
});
