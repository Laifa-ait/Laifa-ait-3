import { apiGet } from "../../../../lib/api";
import { StudioDataResponse } from "../../../../domains/seller/customPage.types";
import { Product } from "../../../../domains/product/product.types";

export type CatalogLoadStatus = "idle" | "loading" | "loaded" | "error";

export interface CatalogFetchOutcome {
  ok: boolean;
  products: Product[];
  errorMessage: string | null;
}

export async function fetchSellerCatalogSafely(): Promise<CatalogFetchOutcome> {
  try {
    const res = await apiGet<{ success?: boolean; products?: Product[]; error?: string }>(
      "/api/v1/seller/products"
    );
    if (res?.success === false || !Array.isArray(res?.products)) {
      return {
        ok: false,
        products: [],
        errorMessage: res?.error || "Impossible de charger votre catalogue produits.",
      };
    }
    return {
      ok: true,
      products: res.products,
      errorMessage: null,
    };
  } catch (err: unknown) {
    return {
      ok: false,
      products: [],
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
