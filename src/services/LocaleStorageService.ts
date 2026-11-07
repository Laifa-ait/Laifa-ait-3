import fs from "fs";
import path from "path";
import { safeLogger } from "../utils/logger";
import { db, admin } from "../config/firebase-admin";
import { withFirestoreDeadline } from "../utils/firestoreTimeout";

export interface LocaleCacheEntry {
  data: Record<string, string>;
  timestamp: number;
}

export class LocaleStorageService {
  private static memoryCache = new Map<string, LocaleCacheEntry>();
  private static refreshingLangs = new Set<string>();
  private static CACHE_TTL_MS = 60_000;

  static getCachedLocale(lang: string): Record<string, string> | null {
    const cached = this.memoryCache.get(lang);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }
    return null;
  }

  static setCachedLocale(lang: string, data: Record<string, string>): void {
    this.memoryCache.set(lang, { data, timestamp: Date.now() });
  }

  static clearCache(lang?: string): void {
    if (lang) {
      this.memoryCache.delete(lang);
    } else {
      this.memoryCache.clear();
    }
  }

  private static refreshFirestoreOverridesInBackground(
    lang: string,
    baseTranslations: Record<string, string>
  ): void {
    if (this.refreshingLangs.has(lang) || !db) return;
    this.refreshingLangs.add(lang);

    withFirestoreDeadline(
      async () => {
        const docSnap = await db.collection("translations").doc(lang).get();
        if (!docSnap.exists) return null;
        const rawData = docSnap.data() || {};
        const filtered: Record<string, string> = {};
        for (const [key, value] of Object.entries(rawData)) {
          if (typeof value === "string" && !["updatedAt", "updatedBy", "createdAt"].includes(key)) {
            filtered[key] = value;
          }
        }
        return filtered;
      },
      null,
      1200,
      `translations_${lang}`
    )
      .then((dynamicTranslations) => {
        if (dynamicTranslations && Object.keys(dynamicTranslations).length > 0) {
          this.setCachedLocale(lang, { ...baseTranslations, ...dynamicTranslations });
        }
      })
      .catch(() => {})
      .finally(() => {
        this.refreshingLangs.delete(lang);
      });
  }

  static async getMergedLocale(lang: string): Promise<Record<string, string>> {
    if (!["fr", "ar", "en"].includes(lang)) {
      return {};
    }

    const cached = this.getCachedLocale(lang);
    if (cached) {
      return cached;
    }

    const distPath = path.join(process.cwd(), "dist", "locales", `${lang}.json`);
    const publicPath = path.join(process.cwd(), "public", "locales", `${lang}.json`);
    const staticPath = fs.existsSync(distPath) ? distPath : publicPath;
    const baseTranslations = (this.safeReadJson(staticPath, {}) || {}) as Record<string, string>;

    if (process.env.NODE_ENV === "test" || process.env.VITEST) {
      let dynamicTranslations: Record<string, string> = {};
      try {
        if (db) {
          const docSnap = await db.collection("translations").doc(lang).get();
          if (docSnap.exists) {
            const rawData = docSnap.data() || {};
            for (const [key, value] of Object.entries(rawData)) {
              if (typeof value === "string" && !["updatedAt", "updatedBy", "createdAt"].includes(key)) {
                dynamicTranslations[key] = value;
              }
            }
          }
        }
      } catch {
        dynamicTranslations = {};
      }
      const merged = { ...baseTranslations, ...dynamicTranslations };
      this.setCachedLocale(lang, merged);
      return merged;
    }

    // Serve static dictionary immediately (<2ms) and refresh Firestore overrides non-blocking
    this.setCachedLocale(lang, baseTranslations);
    this.refreshFirestoreOverridesInBackground(lang, baseTranslations);
    return baseTranslations;
  }

  static async saveBatchTranslations(
    lang: string,
    content: Record<string, string>,
    adminUid?: string
  ): Promise<boolean> {
    if (!["fr", "ar", "en"].includes(lang)) {
      safeLogger.error("[LocaleStorageService] ❌ Invalid language in saveBatchTranslations", { lang });
      return false;
    }

    const sanitized: Record<string, string> = {};
    for (const [key, val] of Object.entries(content)) {
      if (typeof val === "string" && !["updatedAt", "updatedBy", "createdAt"].includes(key)) {
        sanitized[key] = val;
      }
    }

    try {
      if (db) {
        await db.collection("translations").doc(lang).set(
          {
            ...sanitized,
            updatedAt: admin?.firestore?.FieldValue?.serverTimestamp?.() || new Date().toISOString(),
            updatedBy: adminUid || "admin",
          },
          { merge: true }
        );
      }

      this.clearCache(lang);

      const publicPath = path.join(process.cwd(), "public", "locales", `${lang}.json`);
      const distPath = path.join(process.cwd(), "dist", "locales", `${lang}.json`);
      this.safeWriteJsonAtomic(publicPath, sanitized);
      if (fs.existsSync(path.join(process.cwd(), "dist", "locales"))) {
        this.safeWriteJsonAtomic(distPath, sanitized);
      }

      return true;
    } catch (err: unknown) {
      safeLogger.error("[LocaleStorageService] ❌ Failed to save translations to Firestore", {
        lang,
        err: err instanceof Error ? err.message : String(err),
      });
      return false;
    }
  }

  static async saveTranslation(
    key: string,
    values: { fr?: string; ar?: string; en?: string },
    adminUid?: string
  ): Promise<boolean> {
    if (!key || typeof key !== "string") return false;

    const langs: Array<"fr" | "ar" | "en"> = ["fr", "ar", "en"];
    for (const lang of langs) {
      const val = values[lang];
      if (val !== undefined && typeof val === "string") {
        try {
          if (db) {
            await db.collection("translations").doc(lang).set(
              {
                [key]: val,
                updatedAt: admin?.firestore?.FieldValue?.serverTimestamp?.() || new Date().toISOString(),
                updatedBy: adminUid || "admin",
              },
              { merge: true }
            );
          }
          this.clearCache(lang);

          const publicPath = path.join(process.cwd(), "public", "locales", `${lang}.json`);
          const existing = this.safeReadJson(publicPath, {}) as Record<string, string>;
          existing[key] = val;
          this.safeWriteJsonAtomic(publicPath, existing);
        } catch (err: unknown) {
          safeLogger.error("[LocaleStorageService] ❌ Failed to save single translation key", {
            lang,
            key,
            err: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }
    return true;
  }

  static safeReadJson(filePath: string, fallback: Record<string, unknown> = {}): Record<string, unknown> {
    try {
      if (!fs.existsSync(filePath)) {
        const bakPath = `${filePath}.bak`;
        if (fs.existsSync(bakPath)) {
          return JSON.parse(fs.readFileSync(bakPath, "utf8")) as Record<string, unknown>;
        }
        return fallback;
      }
      return JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<string, unknown>;
    } catch {
      try {
        const bakPath = `${filePath}.bak`;
        if (fs.existsSync(bakPath)) {
          return JSON.parse(fs.readFileSync(bakPath, "utf8")) as Record<string, unknown>;
        }
      } catch {
        // Safe fallback
      }
      return fallback;
    }
  }

  static safeWriteJsonAtomic(targetPath: string, content: Record<string, unknown>): boolean {
    try {
      const serialized = JSON.stringify(content, null, 2);
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const tempPath = `${targetPath}.tmp.${Date.now()}.${Math.random().toString(36).substring(2, 7)}`;
      fs.writeFileSync(tempPath, serialized, "utf8");
      try {
        if (fs.existsSync(targetPath)) fs.copyFileSync(targetPath, `${targetPath}.bak`);
      } catch { /* ignore */ }
      try {
        if (typeof fs.renameSync === "function") fs.renameSync(tempPath, targetPath);
        else fs.writeFileSync(targetPath, serialized, "utf8");
      } catch {
        fs.writeFileSync(targetPath, serialized, "utf8");
        try { if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); } catch { /* ignore */ }
      }
      return true;
    } catch (err: unknown) {
      safeLogger.error("[LocaleStorageService] ❌ Atomic write failed", {
        targetPath,
        err: err instanceof Error ? err.message : String(err),
      });
      return false;
    }
  }
}
