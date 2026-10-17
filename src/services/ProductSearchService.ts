import { db, admin } from "../config/firebase-admin";
import Fuse from "fuse.js";
import { safeLogger } from "../utils/logger";
import { PRODUCT_STATUSES } from "../domains/product/product.status";
import { TrendingSearchesService } from "./TrendingSearchesService";
import {
  ALGERIAN_SYNONYM_GROUPS,
  normalizeAlgerianSearchText,
  getAlgerianSoundex
} from "../utils/algerianSearchSynonyms";
import {
  SearchableProduct,
  StoreProfile,
  SearchStoresContainer,
  SearchRequestExpress
} from "../types/search";

export type {
  SearchableProduct,
  StoreProfile,
  SearchStoresContainer,
  SearchRequestExpress
};

let cachedProducts: SearchableProduct[] = [];
let cachedStores: SearchStoresContainer | null = null;
let cachedFuse: Fuse<SearchableProduct> | null = null;
let lastCacheUpdate = 0;
let isRefreshingCache = false;
const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes

function buildFuseIndex(pool: SearchableProduct[]): Fuse<SearchableProduct> {
  return new Fuse(pool, {
    keys: [
      { name: "name", weight: 0.55 },
      { name: "title", weight: 0.55 },
      { name: "translations.ar.name", weight: 0.55 },
      { name: "translations.en.name", weight: 0.55 },
      { name: "brand", weight: 0.2 },
      { name: "category", weight: 0.15 },
      { name: "subcategory", weight: 0.1 },
      { name: "tags", weight: 0.1 },
      { name: "shopName", weight: 0.05 }
    ],
    includeScore: true,
    threshold: 0.42,
    minMatchCharLength: 2,
    ignoreLocation: true
  });
}

export function clearProductSearchCache(): void {
  cachedProducts = [];
  cachedStores = null;
  cachedFuse = null;
  lastCacheUpdate = 0;
}

async function refreshMemoryIndex(): Promise<void> {
  if (isRefreshingCache) return;
  isRefreshingCache = true;
  try {
    const [prodSnap, profilesSnap] = await Promise.all([
      db.collection("products").where("status", "==", PRODUCT_STATUSES.ACTIVE).limit(1500).get(),
      db.collection("publicProfiles").limit(300).get().catch(() => null)
    ]);

    cachedProducts = prodSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as SearchableProduct[];
    cachedFuse = buildFuseIndex(cachedProducts);
    if (profilesSnap) {
      cachedStores = {
        stores: profilesSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as StoreProfile[]
      };
    }
    lastCacheUpdate = Date.now();
  } catch (err: unknown) {
    safeLogger.warn("[ProductSearchService] Cache refresh notice", {
      err: err instanceof Error ? err.message : String(err)
    });
  } finally {
    isRefreshingCache = false;
  }
}

export class ProductSearchService {
  static normalizeText(text?: string): string {
    return normalizeAlgerianSearchText(text);
  }

  static getSoundex(word: string): string {
    return getAlgerianSoundex(word);
  }

  static async warmupSearchEngine(): Promise<void> {
    await refreshMemoryIndex();
    safeLogger.info(`[ProductSearchService] ⚡ Search engine warm-up complete (${cachedProducts.length} items cached)`);
  }

  static async performSearch(req: SearchRequestExpress) {
    const queryStr = ((req.query.q as string) || "").trim();
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : null;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : null;
    const wilayaFilter = req.query.wilaya as string;
    const categoryFilter = req.query.category as string;
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const limitVal = Math.min(parseInt((req.query.limit as string) || "24", 10), 100);

    const now = Date.now();
    if (cachedProducts.length === 0) {
      await refreshMemoryIndex();
    } else if (now - lastCacheUpdate > CACHE_TTL_MS) {
      refreshMemoryIndex().catch(() => {});
    }

    const productPool = cachedProducts;
    const allStores = cachedStores;

    if (!queryStr) {
      let filtered = productPool;
      if (minPrice !== null) filtered = filtered.filter((p) => (p.price ?? 0) >= minPrice);
      if (maxPrice !== null) filtered = filtered.filter((p) => (p.price ?? 0) <= maxPrice);
      if (wilayaFilter) filtered = filtered.filter((p) => p.wilaya === wilayaFilter);
      if (categoryFilter && categoryFilter !== "Tous") {
        filtered = filtered.filter((p) => p.category === categoryFilter);
      }

      const offset = (page - 1) * limitVal;
      return {
        products: filtered.slice(offset, offset + limitVal),
        stores: [],
        total: filtered.length,
        page,
        limit: limitVal,
        hasMore: offset + limitVal < filtered.length
      };
    }

    const fuse = cachedFuse || buildFuseIndex(productPool);
    if (!cachedFuse) cachedFuse = fuse;

    const searchResults = fuse.search(queryStr);
    const normQuery = this.normalizeText(queryStr);
    const queryTokens = normQuery.split(/\s+/).filter(Boolean);

    if (queryTokens.length > 0 && searchResults.length < 20) {
      const existingIds = new Set(searchResults.map((r) => r.item.id));
      for (const p of productPool) {
        if (existingIds.has(p.id)) continue;
        const text = this.normalizeText([
          p.name, p.title, p.category, p.brand,
          p.translations?.ar?.name, p.translations?.en?.name,
          ...(p.tags || [])
        ].join(" "));
        let matchScore = 0;

        for (const term of queryTokens) {
          if (text.includes(term)) {
            matchScore += 1.0;
            break;
          }
          for (const group of ALGERIAN_SYNONYM_GROUPS) {
            if (group.some((syn) => syn.includes(term) || term.includes(syn))) {
              if (group.some((syn) => text.includes(syn))) {
                matchScore += 0.8;
                break;
              }
            }
          }
          if (term.length >= 3 && this.getSoundex(term) && text.split(/\s+/).some((w) => this.getSoundex(w) === this.getSoundex(term))) {
            matchScore += 0.6;
          }
        }

        if (matchScore >= 0.6) {
          searchResults.push({ item: p, refIndex: 0, score: 0.5 });
          existingIds.add(p.id);
        }
      }
    }

    const ranked = searchResults.map((r) => {
      const p = r.item;
      let textScore = 1 - (r.score ?? 0.5);
      const pNameNorm = this.normalizeText(p.name || p.title || "");
      if (pNameNorm.startsWith(normQuery)) textScore += 0.4;
      const salesScore = Math.min((p.salesCount ?? 0) / 100, 1.0);
      const ratingScore = p.rating ? Math.min(p.rating / 5, 1.0) : 0.5;
      const ranking = textScore * 0.7 + salesScore * 0.15 + ratingScore * 0.15;
      return { item: p, ranking };
    });

    ranked.sort((a, b) => b.ranking - a.ranking);
    let finalProducts = ranked.map((r) => r.item);

    if (minPrice !== null) finalProducts = finalProducts.filter((p) => (p.price ?? 0) >= minPrice);
    if (maxPrice !== null) finalProducts = finalProducts.filter((p) => (p.price ?? 0) <= maxPrice);
    if (wilayaFilter) finalProducts = finalProducts.filter((p) => p.wilaya === wilayaFilter);
    if (categoryFilter && categoryFilter !== "Tous") {
      finalProducts = finalProducts.filter((p) => p.category === categoryFilter);
    }

    let matchedStores: StoreProfile[] = [];
    if (allStores?.stores && queryStr) {
      matchedStores = allStores.stores.filter((store) => {
        const text = this.normalizeText([store.shopName, store.displayName, store.shopDescription].join(" "));
        return queryTokens.every((term) => text.includes(term));
      });
    }

    TrendingSearchesService.recordSearch(queryStr);
    try {
      if (admin && admin.apps && admin.apps.length > 0) {
        admin.firestore().collection("search_logs").add({
          query: queryStr,
          resultsCount: finalProducts.length,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          userId: req.user?.uid || "anonymous",
          filters: { minPrice, maxPrice, wilaya: wilayaFilter, category: categoryFilter }
        }).catch(() => {});
      }
    } catch {
      // Non-fatal
    }

    const suggestions: string[] = [];
    const seen = new Set<string>();
    for (const p of finalProducts) {
      const title = p.name || p.title || "";
      if (title && !seen.has(title)) {
        seen.add(title);
        suggestions.push(title);
        if (suggestions.length >= 5) break;
      }
    }

    const totalCount = finalProducts.length;
    const offset = (page - 1) * limitVal;
    return {
      products: finalProducts.slice(offset, offset + limitVal),
      stores: matchedStores.slice(0, 5),
      total: totalCount,
      page,
      limit: limitVal,
      hasMore: offset + limitVal < totalCount,
      suggestions
    };
  }
}
