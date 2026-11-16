import { apiGet } from "../../../../lib/api";
import { StudioDataResponse } from "../../../../domains/seller/customPage.types";
import { Product } from "../../../../domains/product/product.types";
import { parseProductTimestampMs } from "../../../../domains/seller/studioCatalogResolver";

export type CatalogLoadStatus = "idle" | "loading" | "loaded" | "error";

export interface CatalogFetchOutcome {
  ok: boolean;
  products: Product[];
  pagesLoaded: number;
  truncated: boolean;
  errorMessage: string | null;
}

export interface CatalogFetchPageResponse {
  success?: boolean;
  products?: Product[];
  nextCursor?: string | null;
  hasMore?: boolean;
  error?: string;
}

export interface FetchSellerCatalogOptions {
  limitPerPage?: number;
  maxPages?: number;
  fetchPage?: (url: string) => Promise<CatalogFetchPageResponse>;
}

export async function fetchSellerCatalogSafely(
  options: FetchSellerCatalogOptions = {}
): Promise<CatalogFetchOutcome> {
  const limitPerPage = Math.max(1, Math.min(options.limitPerPage ?? 100, 250));
  const maxPages = Math.max(1, Math.min(options.maxPages ?? 50, 100));
  const fetchPage = options.fetchPage || ((url: string) => apiGet<CatalogFetchPageResponse>(url));

  const seenIds = new Set<string>();
  const seenCursors = new Set<string>();
  const allProducts: Product[] = [];
  let cursor: string | null = null;
  let pagesLoaded = 0;
  let truncated = false;

  try {
    while (pagesLoaded < maxPages) {
      const qs = new URLSearchParams({ limit: String(limitPerPage) });
      if (cursor) qs.set("cursor", cursor);

      const res = await fetchPage(`/api/v1/seller/products?${qs.toString()}`);
      if (res?.success === false || !Array.isArray(res?.products)) {
        return {
          ok: false,
          products: [],
          pagesLoaded,
          truncated: false,
          errorMessage: res?.error || "Impossible de charger votre catalogue produits.",
        };
      }

      pagesLoaded += 1;
      for (const prod of res.products) {
        if (prod && typeof prod.id === "string" && !seenIds.has(prod.id)) {
          seenIds.add(prod.id);
          allProducts.push(prod);
        }
      }

      const nextCursor = typeof res.nextCursor === "string" && res.nextCursor.trim() ? res.nextCursor.trim() : null;
      if (!res.hasMore || !nextCursor || seenCursors.has(nextCursor)) {
        break;
      }
      seenCursors.add(nextCursor);
      cursor = nextCursor;

      if (pagesLoaded >= maxPages) {
        truncated = true;
        break;
      }
    }

    allProducts.sort((a, b) => {
      const diff = parseProductTimestampMs(b.createdAt) - parseProductTimestampMs(a.createdAt);
      return diff !== 0 ? diff : a.id.localeCompare(b.id);
    });

    return {
      ok: true,
      products: allProducts,
      pagesLoaded,
      truncated,
      errorMessage: null,
    };
  } catch (err: unknown) {
    return {
      ok: false,
      products: [],
      pagesLoaded,
      truncated: false,
      errorMessage:
        err instanceof Error && err.message.trim()
          ? err.message
          : "Erreur serveur lors du chargement du catalogue.",
    };
  }
}

export async function fetchStudioBundle(): Promise<{
  studioRes: { success: boolean; data: StudioDataResponse };
  catalog: CatalogFetchOutcome;
}> {
  const [studioRes, catalog] = await Promise.all([
    apiGet<{ success: boolean; data: StudioDataResponse }>("/api/v1/seller/studio"),
    fetchSellerCatalogSafely(),
  ]);
  return { studioRes, catalog };
}
