import { Response, Router } from "express";
import { admin, db } from "../../../config/firebase-admin";
import { authenticateToken, authorizeAdmin, AuthenticatedRequest } from "../../../middlewares/auth";
import { AdminCategoryService } from "../services/adminCategory.service";
import { PRODUCT_HIERARCHY } from "../../../constants";
import { SettingsService } from "../../home/services/settings.service";
import { clearHomepageCache } from "./adminHomepageCache";
import type { SubcategoryMap } from "../../../types/category.types";

const router = Router();

// GET /api/v1/admin/categories/list
router.get("/admin/categories/list", authenticateToken, authorizeAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = await AdminCategoryService.listCategoriesFull();
    res.json({
      success: true,
      categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(500).json({ error: message });
  }
});

// GET /api/v1/admin/categories
router.get("/admin/categories", authenticateToken, authorizeAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = await AdminCategoryService.listCategoriesFull();
    res.json({ success: true, categories });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(500).json({ error: message });
  }
});

// POST /api/v1/admin/categories (Create a new category or upsert full category)
router.post("/admin/categories", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = req.user?.uid || "admin";
    const { id, name, commissionRate, isActive, order, subcategories, title, subtitle, image, translations } = req.body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Le nom de la catégorie est requis" });
    }

    const categories = await AdminCategoryService.upsertCategory(
      {
        id: typeof id === "string" ? id : undefined,
        name: name.trim(),
        commissionRate: typeof commissionRate === "number" ? commissionRate : undefined,
        isActive: typeof isActive === "boolean" ? isActive : true,
        order: typeof order === "number" ? order : undefined,
        subcategories: subcategories && typeof subcategories === "object" ? (subcategories as SubcategoryMap) : {},
        title: typeof title === "string" ? title : undefined,
        subtitle: typeof subtitle === "string" ? subtitle : undefined,
        image: typeof image === "string" ? image : undefined,
        translations,
      },
      adminId
    );

    return res.json({ success: true, categories });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur lors de la création de la catégorie";
    return res.status(500).json({ error: message });
  }
});

// PUT /api/v1/admin/categories/hierarchy (Must be registered BEFORE /admin/categories/:id)
router.put("/admin/categories/hierarchy", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { hierarchy } = req.body || {};
    if (!Array.isArray(hierarchy)) {
      return res.status(400).json({ error: "Format de hiérarchie invalide" });
    }

    const sortedItems = [...hierarchy]
      .filter((item): item is { id: string; order: number } => Boolean(item && typeof item.id === "string"))
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

    const sortOrder = sortedItems.map((item) => item.id);
    const settingsDoc = await AdminCategoryService.getMergedSettingsDoc();
    const nextOrder = [
      ...sortOrder,
      ...Object.keys(settingsDoc.hierarchy).filter((k) => !sortOrder.includes(k)),
    ];

    const batch = db.batch();
    nextOrder.forEach((catId, idx) => {
      const ref = db.collection("categories").doc(catId);
      batch.set(ref, { name: catId, order: idx, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    });
    batch.set(
      db.collection("settings").doc("categories"),
      {
        sortOrder: nextOrder,
        hierarchy: settingsDoc.hierarchy,
        isCustomized: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await batch.commit();
    SettingsService.clearCache();
    await clearHomepageCache();

    const categories = await AdminCategoryService.listCategoriesFull();
    return res.json({ success: true, categories });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur lors de la sauvegarde de l'ordre";
    return res.status(500).json({ error: message });
  }
});

// POST /api/v1/admin/categories/harmonize (Synchronize / Restore canonical 13-category hierarchy & purge duplicates)
router.post("/admin/categories/harmonize", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = req.user?.uid || "admin";
    const { deduplicateCategoryHierarchy, resolveCanonicalCategoryKey } = await import(
      "../../../utils/categoryCanonical"
    );
    const settingsDoc = await AdminCategoryService.getMergedSettingsDoc();
    const mergedHierarchy = deduplicateCategoryHierarchy({
      ...PRODUCT_HIERARCHY,
      ...settingsDoc.hierarchy,
    });

    Object.entries(PRODUCT_HIERARCHY).forEach(([catKey, defaultSubMap]) => {
      mergedHierarchy[catKey] = {
        ...defaultSubMap,
        ...(mergedHierarchy[catKey] || {}),
      };
    });

    const canonicalOrder = Object.keys(PRODUCT_HIERARCHY);
    const customKeys = Object.keys(mergedHierarchy).filter((k) => !canonicalOrder.includes(k));
    const sortOrder = [...canonicalOrder, ...customKeys];

    // Remove duplicate legacy documents from categories & homepage_categories_v2 collections
    const [catSnap, hpSnap] = await Promise.all([
      db.collection("categories").get().catch(() => ({ docs: [] })),
      db.collection("homepage_categories_v2").get().catch(() => ({ docs: [] })),
    ]);

    const cleanupBatch = db.batch();
    catSnap.docs.forEach((doc) => {
      const canonical = resolveCanonicalCategoryKey(doc.id);
      if (canonical && canonical !== doc.id) {
        cleanupBatch.delete(doc.ref);
      }
    });
    hpSnap.docs.forEach((doc) => {
      const canonical = resolveCanonicalCategoryKey(doc.id);
      if (canonical && canonical !== doc.id) {
        cleanupBatch.delete(doc.ref);
      }
    });
    cleanupBatch.set(
      db.collection("settings").doc("categories"),
      {
        hierarchy: mergedHierarchy,
        sortOrder,
        disabledCategories: [],
        isCustomized: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }
    );

    await cleanupBatch.commit();

    await db.collection("audit_logs").add({
      type: "CATEGORY_MODERATION",
      action: "HARMONIZE_CATEGORIES",
      adminId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    SettingsService.clearCache();
    await clearHomepageCache();

    const categories = await AdminCategoryService.listCategoriesFull();
    return res.json({ success: true, categories });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur lors de l'harmonisation";
    return res.status(500).json({ error: message });
  }
});

// PUT /api/v1/admin/categories/:id
router.put("/admin/categories/:id", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = decodeURIComponent(req.params.id);
    const adminId = req.user?.uid || "admin";
    const { name, commissionRate, isActive, order, subcategories, title, subtitle, image, translations } = req.body || {};

    if (commissionRate !== undefined && (typeof commissionRate !== "number" || commissionRate < 0 || commissionRate > 100)) {
      return res.status(400).json({ error: "Commission rate valide requis (0 à 100%)" });
    }

    const categories = await AdminCategoryService.upsertCategory(
      {
        id,
        name: typeof name === "string" && name.trim() ? name.trim() : id,
        commissionRate,
        isActive,
        order,
        subcategories: subcategories && typeof subcategories === "object" ? (subcategories as SubcategoryMap) : undefined,
        title,
        subtitle,
        image,
        translations,
      },
      adminId
    );

    return res.json({ success: true, categories });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return res.status(500).json({ error: message });
  }
});

// DELETE /api/v1/admin/categories/:id
router.delete("/admin/categories/:id", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = decodeURIComponent(req.params.id);
    const adminId = req.user?.uid || "admin";
    const categories = await AdminCategoryService.deleteCategory(id, adminId);
    return res.json({ success: true, categories });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur lors de la suppression";
    return res.status(500).json({ error: message });
  }
});

export default router;
