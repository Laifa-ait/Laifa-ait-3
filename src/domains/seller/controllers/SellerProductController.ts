import { Router, Response } from "express";
import { db, admin } from "../../../config/firebase-admin";
import { authenticateToken, authorizeSeller, AuthenticatedRequest } from "../../../middlewares/auth";
import { clearProductCatalogCache } from "../../product/controllers/productCatalog.controller";
import { clearProductStoreCache } from "../../product/controllers/productStore.controller";
import { clearProductSearchCache } from "../../../services/ProductSearchService";

interface TimedDocument {
  createdAt?: { toDate?: () => Date } | string | number | Date;
  [key: string]: unknown;
}

const getTimestamp = (doc: TimedDocument): number => {
  if (doc.createdAt && typeof (doc.createdAt as { toDate?: () => Date }).toDate === "function") {
    return (doc.createdAt as { toDate: () => Date }).toDate().getTime();
  }
  return new Date((doc.createdAt as string | number | Date) || 0).getTime();
};

const router = Router();

// POST seller product (create)
router.post("/api/v1/seller/products", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const uid = req.user.uid;
    const body = req.body as Record<string, unknown>;
    const requestedDraft = body.status === "draft";

    // Fetch seller profile metadata to ensure full linkage
    const [userDoc, pubDoc] = await Promise.all([
      db.collection("users").doc(uid).get().catch(() => null),
      db.collection("publicProfiles").doc(uid).get().catch(() => null)
    ]);

    const uData = userDoc && userDoc.exists ? userDoc.data() : {};
    const pData = pubDoc && pubDoc.exists ? pubDoc.data() : {};

    // Sanitize protected fields - Never trust client
    const protectedFields = new Set([
      "rating",
      "sellerTrustScore",
      "reviewsCount",
      "commissionRate",
      "isSponsored",
      "salesCount",
      "sellerId",
      "role",
      "status",
      "isApproved",
      "approvedAt",
      "approvedBy",
      "rejectedAt",
      "rejectedBy",
      "rejectionReasons",
      "rejectionComment",
      "moderationType",
      "sellerName",
      "storeName",
      "sellerShopName",
      "sellerLogo",
      "sellerPhone",
      "sellerWilaya",
    ]);

    const safeProductData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (!protectedFields.has(key)) {
        safeProductData[key] = value;
      }
    }

    const shopName = (pData?.shopName || uData?.shopName || uData?.storeName || uData?.displayName || "Boutique Olmart") as string;
    const logoUrl = (pData?.logoUrl || uData?.logoUrl || uData?.photoURL || "") as string;
    const phone = (pData?.phone || uData?.phone || uData?.phoneNumber || pData?.supportPhone || body.sellerPhone || "") as string;
    const wilaya = (safeProductData.wilaya || pData?.wilaya || uData?.wilaya || "16 - Alger") as string;

    const initialVariants = (Array.isArray(safeProductData.variants) ? safeProductData.variants : []) as Array<Record<string, unknown>>;
    let initialColors = Array.isArray(safeProductData.colors) ? (safeProductData.colors as string[]).filter(Boolean) : [];
    let initialSizes = Array.isArray(safeProductData.sizes) ? (safeProductData.sizes as string[]).filter(Boolean) : [];

    if (initialColors.length === 0 && initialVariants.length > 0) {
      const derived = new Set<string>();
      initialVariants.forEach((v) => {
        if (v.isActive === false) return;
        if (typeof v.color === "string" && v.color.trim()) derived.add(v.color.trim());
        else if (typeof v.name === "string" && v.name.includes(" - ")) {
          const c = v.name.split(" - ")[0]?.trim();
          if (c) derived.add(c);
        }
      });
      initialColors = Array.from(derived);
    }
    if (initialSizes.length === 0 && initialVariants.length > 0) {
      const derived = new Set<string>();
      initialVariants.forEach((v) => {
        if (v.isActive === false) return;
        if (typeof v.size === "string" && v.size.trim()) derived.add(v.size.trim());
        else if (typeof v.name === "string" && v.name.includes(" - ")) {
          const s = v.name.split(" - ")[1]?.trim();
          if (s) derived.add(s);
        }
      });
      initialSizes = Array.from(derived);
    }

    const productName = (safeProductData.name || safeProductData.title || "Produit") as string;
    const subSubValue = (safeProductData.subSubCategory || safeProductData.subsubcategory || "") as string;
    const productData: Record<string, unknown> = {
      ...safeProductData,
      subSubCategory: subSubValue || undefined,
      subsubcategory: subSubValue || undefined,
      name: productName,
      title: productName,
      colors: initialColors,
      sizes: initialSizes,
      sellerId: uid,
      sellerName: safeProductData.sellerName || shopName,
      storeName: safeProductData.storeName || shopName,
      sellerShopName: safeProductData.storeName || safeProductData.sellerShopName || shopName,
      sellerLogo: safeProductData.sellerLogo || logoUrl,
      sellerPhone: phone || (safeProductData.sellerPhone as string) || "",
      wilaya: safeProductData.wilaya || wilaya,
      sellerWilaya: safeProductData.wilaya || wilaya,
      status: requestedDraft ? "draft" : "pending",
      isApproved: false,
      moderationType: requestedDraft ? undefined : "new",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection("products").add(productData);

    clearProductCatalogCache();
    clearProductStoreCache();
    clearProductSearchCache();

    await Promise.all([
      db.collection("users").doc(uid).set({
        productsCount: admin.firestore.FieldValue.increment(1)
      }, { merge: true }).catch(() => null),
      db.collection("publicProfiles").doc(uid).set({
        productsCount: admin.firestore.FieldValue.increment(1)
      }, { merge: true }).catch(() => null),
      db.collection("internal_notifications").add({
        type: "NEW_PRODUCT_SUBMITTED",
        title: "Nouveau produit soumis",
        message: `Le vendeur "${shopName}" a soumis un nouveau produit "${String(productData.name || 'Produit')}".`,
        productId: docRef.id,
        sellerId: uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false
      }).catch(() => null)
    ]);

    return res.json({ id: docRef.id, success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});

// PUT seller product (update)
router.put("/api/v1/seller/products/:id", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const uid = req.user.uid;
    const { id } = req.params;
    const body = req.body as Record<string, unknown>;

    // Fetch existing product and verify ownership
    const docSnap = await db.collection("products").doc(id).get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }
    const existing = docSnap.data();
    if (existing?.sellerId !== uid && req.user.role !== "admin") {
      return res.status(403).json({ error: "Accès refusé : vous n'êtes pas propriétaire de ce produit" });
    }

    // Strip protected fields from update payload
    const protectedUpdateFields = new Set([
      "sellerId",
      "rating",
      "sellerTrustScore",
      "reviewsCount",
      "commissionRate",
      "isSponsored",
      "salesCount",
      "role",
      "owner",
      "userId",
      "status",
      "isApproved",
      "approvedAt",
      "approvedBy",
      "rejectedAt",
      "rejectedBy",
      "rejectionReasons",
      "rejectionComment",
      "moderationType",
    ]);

    const isAdminUser = req.user.role === "admin" || req.user.role === "superadmin";
    const safeUpdate: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (!protectedUpdateFields.has(key)) {
        safeUpdate[key] = value;
      }
    }

    if (isAdminUser) {
      safeUpdate.status = existing?.status || "pending";
    } else {
      const keepDraft = existing?.status === "draft" && body.status === "draft";
      safeUpdate.status = keepDraft ? "draft" : "pending";
      safeUpdate.isApproved = false;
      safeUpdate.moderationType = keepDraft ? existing?.moderationType : "update";
    }

    const nameVal = ((safeUpdate.name || safeUpdate.title || existing?.name || existing?.title || "") as string).trim();
    const descVal = ((safeUpdate.description || existing?.description || "") as string).trim();
    if (nameVal) {
      safeUpdate.name = nameVal;
      safeUpdate.title = nameVal;
    }

    // Always synchronize translations.fr with the updated name and description
    const existingTranslations = (existing?.translations as Record<string, Record<string, string>>) || {};
    const payloadTranslations = (safeUpdate.translations as Record<string, Record<string, string>>) || {};
    const mergedTranslations: Record<string, Record<string, string>> = {
      ...existingTranslations,
      ...payloadTranslations,
    };
    if (nameVal || descVal) {
      mergedTranslations.fr = {
        name: nameVal,
        description: descVal,
      };
      safeUpdate.translations = mergedTranslations;
    }

    // Ensure colors and sizes are preserved and synchronized with variants
    const activeVariantsList = (Array.isArray(safeUpdate.variants)
      ? safeUpdate.variants
      : (Array.isArray(existing?.variants) ? existing.variants : [])) as Array<Record<string, unknown>>;

    let finalColors: string[] = Array.isArray(safeUpdate.colors) && (safeUpdate.colors as string[]).length > 0
      ? (safeUpdate.colors as string[]).map((c) => String(c).trim()).filter(Boolean)
      : (Array.isArray(existing?.colors) ? (existing.colors as string[]).map((c) => String(c).trim()).filter(Boolean) : []);

    let finalSizes: string[] = Array.isArray(safeUpdate.sizes) && (safeUpdate.sizes as string[]).length > 0
      ? (safeUpdate.sizes as string[]).map((s) => String(s).trim()).filter(Boolean)
      : (Array.isArray(existing?.sizes) ? (existing.sizes as string[]).map((s) => String(s).trim()).filter(Boolean) : []);

    if (finalColors.length === 0 && activeVariantsList.length > 0) {
      const derived = new Set<string>();
      activeVariantsList.forEach((v) => {
        if (v.isActive === false) return;
        if (typeof v.color === "string" && v.color.trim()) derived.add(v.color.trim());
        else if (typeof v.name === "string" && v.name.includes(" - ")) {
          const c = v.name.split(" - ")[0]?.trim();
          if (c) derived.add(c);
        }
      });
      finalColors = Array.from(derived);
    }

    if (finalSizes.length === 0 && activeVariantsList.length > 0) {
      const derived = new Set<string>();
      activeVariantsList.forEach((v) => {
        if (v.isActive === false) return;
        if (typeof v.size === "string" && v.size.trim()) derived.add(v.size.trim());
        else if (typeof v.name === "string" && v.name.includes(" - ")) {
          const s = v.name.split(" - ")[1]?.trim();
          if (s) derived.add(s);
        }
      });
      finalSizes = Array.from(derived);
    }

    if (finalColors.length > 0) {
      safeUpdate.colors = finalColors;
    }
    if (finalSizes.length > 0) {
      safeUpdate.sizes = finalSizes;
    }

    if (safeUpdate.subSubCategory !== undefined || safeUpdate.subsubcategory !== undefined) {
      const subSubValue = ((safeUpdate.subSubCategory || safeUpdate.subsubcategory || "") as string).trim();
      safeUpdate.subSubCategory = subSubValue || undefined;
      safeUpdate.subsubcategory = subSubValue || undefined;
    }

    const productDataToSave: Record<string, unknown> = {
      ...safeUpdate,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection("products").doc(id).set(productDataToSave, { merge: true });

    clearProductCatalogCache();
    clearProductStoreCache();
    clearProductSearchCache();

    await db.collection("product_history").add({
      productId: id,
      sellerId: uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      action: "edit",
      changes: productDataToSave
    }).catch(() => null);

    if (productDataToSave.status === "pending") {
      await db.collection("internal_notifications").add({
        type: "PRODUCT_MODIFICATION",
        title: "Produit modifié soumis à modération",
        message: `Un vendeur a modifié le produit "${String(productDataToSave.name || id)}".`,
        productId: id,
        sellerId: uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false
      }).catch(() => null);
    }

    return res.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});

// GET seller products
router.get("/api/v1/seller/products", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const uid = req.user.uid;
    const snap = await db.collection("products").where("sellerId", "==", uid).get();
    const products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    products.sort((a: TimedDocument, b: TimedDocument) => getTimestamp(b) - getTimestamp(a));
    return res.json({ products });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});

// DELETE seller product
router.delete("/api/v1/seller/products/:id", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const uid = req.user.uid;
    const { id } = req.params;

    const docSnap = await db.collection("products").doc(id).get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }
    if (docSnap.data()?.sellerId !== uid && req.user.role !== "admin") {
      return res.status(403).json({ error: "Accès refusé : vous n'êtes pas propriétaire de ce produit" });
    }

    await db.collection("products").doc(id).delete();

    clearProductCatalogCache();
    clearProductStoreCache();
    clearProductSearchCache();

    await db.collection("product_history").add({
      productId: id,
      sellerId: uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      action: "delete"
    }).catch(() => null);

    return res.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});

export default router;
