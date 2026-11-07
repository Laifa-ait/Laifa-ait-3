import { db } from "../config/firebase-admin";
import { safeLogger } from "../utils/logger";
import { withFirestoreDeadline } from "../utils/firestoreTimeout";

interface ProductTrendDoc {
  id: string;
  name?: string;
  category?: string;
  subcategory?: string;
  salesCount?: number;
  rating?: number;
  viewsCount?: number;
  status?: string;
  [key: string]: unknown;
}

export interface PurchasedItemTrend {
  name?: string;
  category?: string;
  subcategory?: string;
  quantity?: number;
}

const DEFAULT_TRENDS = [
  "Smartphones & Accessoires",
  "Mode & Vêtements",
  "Chaussures & Baskets",
  "Électroménager",
  "Bricolage & Outillage",
  "Informatique & PC",
  "Maison & Décoration",
  "Beauté & Soins",
];

export class TrendingSearchesService {
  private static inMemorySearchCounts: Map<string, number> = new Map();
  private static inMemoryPurchaseCounts: Map<string, number> = new Map();
  private static cachedTrends: string[] = [];
  private static cachedTimestamp = 0;
  private static readonly CACHE_TTL_MS = 30 * 60 * 1000;

  private static cleanTerm(raw: string): string | null {
    if (!raw) return null;
    const clean = raw
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, " ");

    if (clean.length < 2 || clean.length > 40) return null;

    const stopWords = new Set([
      "le", "la", "les", "un", "une", "des", "du", "de", "pour", "and", "the", "in", "on", "avec", "sans", "sur", "sous", "par",
    ]);
    if (stopWords.has(clean)) return null;
    return clean;
  }

  private static formatDisplayTerm(term: string): string {
    return term
      .split(" ")
      .map((word) => (word.length > 2 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
      .join(" ");
  }

  public static recordSearch(query: string): void {
    const clean = this.cleanTerm(query);
    if (!clean) return;
    const current = this.inMemorySearchCounts.get(clean) || 0;
    this.inMemorySearchCounts.set(clean, current + 1);
    if (this.inMemorySearchCounts.size > 500) {
      const oldestKey = this.inMemorySearchCounts.keys().next().value;
      if (oldestKey) this.inMemorySearchCounts.delete(oldestKey);
    }
  }

  public static recordPurchase(items: PurchasedItemTrend[]): void {
    if (!items || !Array.isArray(items)) return;
    for (const item of items) {
      const qty = Math.max(1, Number(item.quantity) || 1);
      if (item.category) {
        const cleanCat = this.cleanTerm(item.category);
        if (cleanCat) {
          this.inMemoryPurchaseCounts.set(cleanCat, (this.inMemoryPurchaseCounts.get(cleanCat) || 0) + qty * 2);
        }
      }
      if (item.subcategory) {
        const cleanSub = this.cleanTerm(item.subcategory);
        if (cleanSub) {
          this.inMemoryPurchaseCounts.set(cleanSub, (this.inMemoryPurchaseCounts.get(cleanSub) || 0) + qty * 2);
        }
      }
      if (item.name) {
        const shortName = item.name.trim().split(/\s+/).slice(0, 3).join(" ");
        const cleanName = this.cleanTerm(shortName);
        if (cleanName) {
          this.inMemoryPurchaseCounts.set(cleanName, (this.inMemoryPurchaseCounts.get(cleanName) || 0) + qty * 3);
        }
      }
    }
    if (this.inMemoryPurchaseCounts.size > 500) {
      const oldestKey = this.inMemoryPurchaseCounts.keys().next().value;
      if (oldestKey) this.inMemoryPurchaseCounts.delete(oldestKey);
    }
  }

  public static async getTrendingSearches(): Promise<string[]> {
    const now = Date.now();
    if (this.cachedTrends.length > 0 && now - this.cachedTimestamp < this.CACHE_TTL_MS) {
      return this.cachedTrends;
    }

    try {
      const scoreMap: Map<string, { term: string; score: number }> = new Map();
      const addScore = (term: string, points: number) => {
        const clean = this.cleanTerm(term);
        if (!clean) return;
        const existing = scoreMap.get(clean);
        if (existing) existing.score += points;
        else scoreMap.set(clean, { term: this.formatDisplayTerm(clean), score: points });
      };

      for (const [term, count] of this.inMemoryPurchaseCounts.entries()) addScore(term, count * 10);
      for (const [term, count] of this.inMemorySearchCounts.entries()) addScore(term, count * 3);

      try {
        const topProductsSnap = await withFirestoreDeadline(
          () =>
            db
              .collection("products")
              .where("status", "==", "active")
              .orderBy("salesCount", "desc")
              .limit(25)
              .get()
              .catch(() => db.collection("products").where("status", "==", "active").limit(25).get()),
          null,
          1500,
          "trending_products"
        );

        if (topProductsSnap) {
          topProductsSnap.docs.forEach((doc) => {
            const p = doc.data() as ProductTrendDoc;
            const points = 5 + (Number(p.salesCount) || 0) * 5 + (Number(p.rating) || 0) * 2;
            if (p.category) addScore(p.category, points * 1.5);
            if (p.subcategory) addScore(p.subcategory, points * 1.2);
            if (p.name) addScore(p.name.trim().split(/\s+/).slice(0, 3).join(" "), points);
          });
        }
      } catch {
        // Fallback to defaults below
      }

      if (scoreMap.size < 5) {
        DEFAULT_TRENDS.forEach((def, index) => addScore(def, 20 - index * 2));
      }

      const sortedTrends = Array.from(scoreMap.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map((item) => item.term);

      this.cachedTrends = sortedTrends;
      this.cachedTimestamp = now;
      return sortedTrends;
    } catch {
      return this.cachedTrends.length > 0 ? this.cachedTrends : DEFAULT_TRENDS;
    }
  }

  public static async warmupTrendingSearches(): Promise<void> {
    try {
      const trends = await this.getTrendingSearches();
      safeLogger.info("[TrendingSearches] ✅ Cache warm-up completed", { count: trends.length });
    } catch {
      // Non-fatal
    }
  }

  public static resetCacheForTesting(): void {
    this.cachedTrends = [];
    this.cachedTimestamp = 0;
    this.inMemorySearchCounts.clear();
    this.inMemoryPurchaseCounts.clear();
  }
}
