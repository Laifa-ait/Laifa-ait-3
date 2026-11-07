import { admin, db } from "../../../config/firebase-admin";
import { PRODUCT_HIERARCHY } from "../../../constants";
import { CATEGORY_KEYS } from "../../../pages/Admin/CategoryPhotos/types";
import { SettingsService } from "../../home/services/settings.service";
import { clearHomepageCache } from "../routes/adminHomepageCache";
import {
  deduplicateCategoryHierarchy,
  deduplicateCategoryOrder,
  resolveCanonicalCategoryKey,
} from "../../../utils/categoryCanonical";
import type {
  CategoriesSettingsDoc,
  CategoryHierarchyMap,
  MarketplaceCategoryDTO,
  SubcategoryMap,
  UpsertCategoryPayload,
} from "../../../types/category.types";

function slugifyCategory(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export class AdminCategoryService {
  static async getMergedSettingsDoc(): Promise<CategoriesSettingsDoc> {
    const docSnap = await db.collection("settings").doc("categories").get();
    const raw = docSnap.exists ? (docSnap.data() as Partial<CategoriesSettingsDoc>) : {};
    const isCustomized = Boolean(raw.isCustomized);

    const combinedRaw: CategoryHierarchyMap = isCustomized
      ? { ...(raw.hierarchy || {}) }
      : { ...PRODUCT_HIERARCHY, ...(raw.hierarchy || {}) };

    if (!isCustomized) {
      Object.entries(PRODUCT_HIERARCHY).forEach(([catKey, defaultSubMap]) => {
        combinedRaw[catKey] = {
          ...defaultSubMap,
          ...(combinedRaw[catKey] || {}),
        };
      });
    }

    const deduplicatedHierarchy = deduplicateCategoryHierarchy(combinedRaw);
    const allKeys = Object.keys(deduplicatedHierarchy);
    const savedOrder = Array.isArray(raw.sortOrder) ? raw.sortOrder : [];
    const sortOrder = deduplicateCategoryOrder(savedOrder, allKeys);

    const disabledCategories = Array.from(
      new Set(
        (Array.isArray(raw.disabledCategories) ? raw.disabledCategories : [])
          .map((k) => resolveCanonicalCategoryKey(k))
          .filter(Boolean)
      )
    );

    const commissions: Record<string, number> = {};
    if (raw.commissions && typeof raw.commissions === "object") {
      Object.entries(raw.commissions).forEach(([k, rate]) => {
        const canonical = resolveCanonicalCategoryKey(k);
        if (canonical && typeof rate === "number") {
          commissions[canonical] = rate;
        }
      });
    }

    return {
      hierarchy: deduplicatedHierarchy,
      sortOrder,
      disabledCategories,
      commissions,
      isCustomized,
    };
  }

  static async listCategoriesFull(): Promise<MarketplaceCategoryDTO[]> {
    const [settingsDoc, categoriesSnap, hpSnap] = await Promise.all([
      this.getMergedSettingsDoc(),
      db.collection("categories").get().catch(() => ({ docs: [] })),
      db.collection("homepage_categories_v2").get().catch(() => ({ docs: [] })),
    ]);

    const catDocsMap = new Map<string, Record<string, unknown>>();
    categoriesSnap.docs.forEach((d) => {
      const data = d.data() as Record<string, unknown>;
      const canonical = resolveCanonicalCategoryKey(typeof data.name === "string" ? data.name : d.id);
      if (canonical && !catDocsMap.has(canonical)) {
        catDocsMap.set(canonical, data);
      }
      catDocsMap.set(d.id, data);
    });

    const hpDocsMap = new Map<string, Record<string, unknown>>();
    hpSnap.docs.forEach((d) => {
      const data = d.data() as Record<string, unknown>;
      const canonical = resolveCanonicalCategoryKey(d.id);
      if (canonical && !hpDocsMap.has(canonical)) {
        hpDocsMap.set(canonical, data);
      }
      hpDocsMap.set(d.id, data);
    });

    const disabledSet = new Set(settingsDoc.disabledCategories || []);

    return settingsDoc.sortOrder.map((catName, idx) => {
      const catDoc = catDocsMap.get(catName) || {};
      const hpDoc = hpDocsMap.get(catName) || {};
      const defaultMeta = CATEGORY_KEYS.find((k) => k.key === catName);

      const commissionFromSettings = settingsDoc.commissions?.[catName];
      const commissionFromDoc = typeof catDoc.commissionRate === "number" ? catDoc.commissionRate : undefined;
      const commissionRate = commissionFromSettings ?? commissionFromDoc ?? 5;

      const subcategories: SubcategoryMap =
        settingsDoc.hierarchy[catName] ||
        (catDoc.subcategories as SubcategoryMap | undefined) ||
        {};

      return {
        id: catName,
        name: catName,
        slug: (catDoc.slug as string) || slugifyCategory(catName),
        order: idx,
        commissionRate,
        isActive: !disabledSet.has(catName) && catDoc.isActive !== false,
        image: (hpDoc.image as string) || (catDoc.image as string) || defaultMeta?.defaultImage || "/images/placeholders/product.svg",
        title: (hpDoc.title as string) || (catDoc.title as string) || defaultMeta?.defaultTitle || catName,
        subtitle: (hpDoc.subtitle as string) || (catDoc.subtitle as string) || defaultMeta?.defaultSubtitle || "Découvrez notre sélection",
        subcategories,
        translations: catDoc.translations as MarketplaceCategoryDTO["translations"],
      };
    });
  }

  static async upsertCategory(payload: UpsertCategoryPayload, adminId: string): Promise<MarketplaceCategoryDTO[]> {
    const targetName = payload.name.trim();
    if (!targetName) {
      throw new Error("Le nom de la catégorie est obligatoire.");
    }

    const previousId = payload.id ? payload.id.trim() : targetName;
    const settingsDoc = await this.getMergedSettingsDoc();
    const hierarchy: CategoryHierarchyMap = { ...settingsDoc.hierarchy };
    let sortOrder = [...settingsDoc.sortOrder];
    const commissions: Record<string, number> = { ...(settingsDoc.commissions || {}) };
    const disabledSet = new Set(settingsDoc.disabledCategories || []);

    const existingSubcategories = hierarchy[previousId] || hierarchy[targetName] || {};
    const nextSubcategories: SubcategoryMap = payload.subcategories !== undefined ? payload.subcategories : existingSubcategories;

    if (previousId !== targetName && hierarchy[previousId]) {
      delete hierarchy[previousId];
      const oldIdx = sortOrder.indexOf(previousId);
      if (oldIdx !== -1) {
        sortOrder[oldIdx] = targetName;
      }
      if (commissions[previousId] !== undefined) {
        commissions[targetName] = commissions[previousId];
        delete commissions[previousId];
      }
      if (disabledSet.has(previousId)) {
        disabledSet.delete(previousId);
        disabledSet.add(targetName);
      }
      await db.collection("categories").doc(previousId).delete().catch(() => undefined);
    }

    hierarchy[targetName] = nextSubcategories;
    if (!sortOrder.includes(targetName)) {
      sortOrder.push(targetName);
    }
    sortOrder = Array.from(new Set(sortOrder));

    if (typeof payload.commissionRate === "number" && payload.commissionRate >= 0 && payload.commissionRate <= 100) {
      commissions[targetName] = payload.commissionRate;
    } else if (commissions[targetName] === undefined) {
      commissions[targetName] = 5;
    }

    if (typeof payload.isActive === "boolean") {
      if (payload.isActive) disabledSet.delete(targetName);
      else disabledSet.add(targetName);
    }

    const orderIndex = typeof payload.order === "number" ? payload.order : sortOrder.indexOf(targetName);

    await Promise.all([
      db.collection("settings").doc("categories").set(
        {
          hierarchy,
          sortOrder,
          commissions,
          disabledCategories: Array.from(disabledSet),
          isCustomized: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      ),
      db.collection("categories").doc(targetName).set(
        {
          name: targetName,
          slug: slugifyCategory(targetName),
          order: orderIndex,
          commissionRate: commissions[targetName],
          isActive: !disabledSet.has(targetName),
          subcategories: nextSubcategories,
          ...(payload.title ? { title: payload.title } : {}),
          ...(payload.subtitle ? { subtitle: payload.subtitle } : {}),
          ...(payload.image ? { image: payload.image } : {}),
          ...(payload.translations ? { translations: payload.translations } : {}),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      ),
      db.collection("audit_logs").add({
        type: "CATEGORY_MODERATION",
        action: previousId !== targetName ? "RENAME_OR_UPDATE_CATEGORY" : "UPSERT_CATEGORY",
        categoryId: targetName,
        adminId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      }),
    ]);

    SettingsService.clearCache();
    await clearHomepageCache();
    return this.listCategoriesFull();
  }

  static async deleteCategory(categoryId: string, adminId: string): Promise<MarketplaceCategoryDTO[]> {
    const target = categoryId.trim();
    const settingsDoc = await this.getMergedSettingsDoc();
    const hierarchy: CategoryHierarchyMap = { ...settingsDoc.hierarchy };
    delete hierarchy[target];

    const sortOrder = settingsDoc.sortOrder.filter((k) => k !== target);
    const disabledCategories = (settingsDoc.disabledCategories || []).filter((k) => k !== target);
    const commissions = { ...(settingsDoc.commissions || {}) };
    delete commissions[target];

    await Promise.all([
      db.collection("settings").doc("categories").set({
        hierarchy,
        sortOrder,
        commissions,
        disabledCategories,
        isCustomized: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }),
      db.collection("categories").doc(target).delete().catch(() => undefined),
      db.collection("audit_logs").add({
        type: "CATEGORY_MODERATION",
        action: "DELETE_CATEGORY",
        categoryId: target,
        adminId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      }),
    ]);

    SettingsService.clearCache();
    await clearHomepageCache();
    return this.listCategoriesFull();
  }
}
