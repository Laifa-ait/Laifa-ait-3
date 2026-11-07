import { admin, db } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";
import { withFirestoreDeadline } from "../../../utils/firestoreTimeout";

const settingsCache = new Map<string, { data: unknown; expiry: number }>();

export class SettingsService {
  static clearCache(): void {
    settingsCache.clear();
  }

  static async getCachedOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs = 300000 // 5 minute cache
  ): Promise<T | null> {
    const cached = settingsCache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data as T;
    }

    const fallbackValue = (cached?.data as T | undefined) ?? null;

    try {
      const data = await withFirestoreDeadline(fetcher, fallbackValue as T, 1500, `settings:${key}`);
      if (data !== undefined && data !== null) {
        settingsCache.set(key, { data, expiry: Date.now() + ttlMs });
      }
      return data;
    } catch (err: unknown) {
      if (cached?.data) {
        return cached.data as T;
      }
      safeLogger.warn("[Olmart Gateway] Settings fetch error", {
        settingKey: key,
        err: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  }

  static async getHomepageCategories(): Promise<Record<string, unknown>[]> {
    const data = await this.getCachedOrFetch("homepage-categories", async () => {
      const snap = await db.collection("homepage_categories_v2").limit(100).get();
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    });
    return data || [];
  }

  static async getSettingById(id: string): Promise<Record<string, unknown>> {
    const data = await this.getCachedOrFetch(`setting_${id}`, async () => {
      const docSnap = await db.collection("settings").doc(id).get();
      return docSnap.exists ? (docSnap.data() as Record<string, unknown>) || {} : {};
    });
    return data || {};
  }

  static async saveSettingById(id: string, data: Record<string, unknown>): Promise<void> {
    await db.collection("settings").doc(id).set(data, { merge: true });
    this.clearCache();
  }

  static async subscribeNewsletter(email: string): Promise<{ success: boolean; error?: string }> {
    const normEmail = email.trim();
    const existingSnap = await db.collection("newsletter_subscribers").where("email", "==", normEmail).get();
    if (!existingSnap.empty) {
      return { success: false, error: "ALREADY_SUBSCRIBED" };
    }
    await db.collection("newsletter_subscribers").add({
      email: normEmail,
      active: true,
      status: "active",
      source: "footer",
      subscribedAt: new Date().toISOString(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true };
  }

  static async getMetadataById(id: string): Promise<Record<string, unknown>> {
    const data = await this.getCachedOrFetch(`metadata_${id}`, async () => {
      const docSnap = await db.collection("metadata").doc(id).get();
      return docSnap.exists ? (docSnap.data() as Record<string, unknown>) || {} : {};
    });
    return data || {};
  }

  static async getSeasonalThemeById(id: string): Promise<Record<string, unknown>> {
    const data = await this.getCachedOrFetch(`theme_${id}`, async () => {
      const docSnap = await db.collection("seasonal_themes").doc(id).get();
      return docSnap.exists ? (docSnap.data() as Record<string, unknown>) || {} : {};
    });
    return data || {};
  }

  static async getUiElementById(id: string): Promise<Record<string, unknown>> {
    const data = await this.getCachedOrFetch(`ui_${id}`, async () => {
      const docSnap = await db.collection("ui_elements").doc(id).get();
      return docSnap.exists ? (docSnap.data() as Record<string, unknown>) || {} : { products: [] };
    });
    return data || { products: [] };
  }

  static async getHomepageCategoriesV2ById(id: string): Promise<Record<string, unknown>> {
    const data = await this.getCachedOrFetch(`hp_cat_${id}`, async () => {
      const docSnap = await db.collection("homepage_categories_v2").doc(id).get();
      return docSnap.exists ? (docSnap.data() as Record<string, unknown>) || {} : {};
    });
    return data || {};
  }

  static async saveHomepageCategoriesV2ById(id: string, payload: Record<string, unknown>): Promise<void> {
    await db.collection("homepage_categories_v2").doc(id).set(
      {
        ...payload,
        id,
        key: id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    this.clearCache();
  }

  static async getPlatformStatsById(id: string): Promise<Record<string, unknown>> {
    const data = await this.getCachedOrFetch(`stats_${id}`, async () => {
      const docSnap = await db.collection("platform_stats").doc(id).get();
      return docSnap.exists ? (docSnap.data() as Record<string, unknown>) || {} : {};
    });
    return data || {};
  }

  static async getMonthlyUpdates(): Promise<Record<string, unknown>[]> {
    const updates = await this.getCachedOrFetch("monthly-updates", async () => {
      const snap = await db.collection("site_content_monthly").limit(20).get();
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    });
    return updates || [];
  }

  static async getCategoriesHierarchy(): Promise<Record<string, unknown>> {
    const data = await this.getCachedOrFetch("categories-hierarchy", async () => {
      const { deduplicateCategoryHierarchy, deduplicateCategoryOrder, resolveCanonicalCategoryKey } = await import(
        "../../../utils/categoryCanonical"
      );
      const docSnap = await db.collection("settings").doc("categories").get();
      if (!docSnap.exists) return {};
      const raw = (docSnap.data() as Record<string, unknown>) || {};
      const disabled = Array.isArray(raw.disabledCategories)
        ? new Set(
            raw.disabledCategories
              .filter((x): x is string => typeof x === "string")
              .map((x) => resolveCanonicalCategoryKey(x))
          )
        : new Set<string>();
      const rawHierarchy = deduplicateCategoryHierarchy(
        (raw.hierarchy as Record<string, Record<string, string[]>> | undefined) || {}
      );
      const activeHierarchy: Record<string, Record<string, string[]>> = {};
      Object.entries(rawHierarchy).forEach(([k, v]) => {
        if (!disabled.has(k)) {
          activeHierarchy[k] = v;
        }
      });
      const availableKeys = Object.keys(activeHierarchy);
      const rawSortOrder = Array.isArray(raw.sortOrder)
        ? raw.sortOrder.filter((k): k is string => typeof k === "string")
        : availableKeys;
      const sortOrder = deduplicateCategoryOrder(rawSortOrder, availableKeys);

      return {
        ...raw,
        hierarchy: activeHierarchy,
        sortOrder,
      };
    });
    return data || {};
  }

  static async getTags(): Promise<Record<string, unknown>[]> {
    const tags = await this.getCachedOrFetch("tags", async () => {
      const snap = await db.collection("tags").get();
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    });
    return tags || [];
  }
}
