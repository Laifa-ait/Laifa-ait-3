import type { firestore } from "firebase-admin";
import { admin, db } from "../../../config/firebase-admin";

export interface SellerCatalogProductRecord {
  id: string;
  [key: string]: unknown;
}

export interface SellerCatalogPageParams {
  sellerId: string;
  limit?: number;
  cursor?: string;
  firestoreDb?: firestore.Firestore;
  documentIdField?: firestore.FieldPath | string;
}

export interface SellerCatalogPageResult {
  products: SellerCatalogProductRecord[];
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}

export const DEFAULT_SELLER_CATALOG_PAGE_LIMIT = 100;
export const MAX_SELLER_CATALOG_PAGE_LIMIT = 250;

export function parseCatalogPageLimit(rawLimit: unknown): number {
  const parsed = typeof rawLimit === "string" ? parseInt(rawLimit, 10) : typeof rawLimit === "number" ? rawLimit : NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_SELLER_CATALOG_PAGE_LIMIT;
  }
  return Math.min(Math.floor(parsed), MAX_SELLER_CATALOG_PAGE_LIMIT);
}

/**
 * Paginates seller products deterministically by Firestore document ID so
 * documents lacking `createdAt` are never silently dropped by Firestore `orderBy("createdAt")`.
 */
export async function querySellerProductsPaginated(
  params: SellerCatalogPageParams
): Promise<SellerCatalogPageResult> {
  const targetDb = params.firestoreDb || db;
  const orderField = params.documentIdField ?? admin.firestore.FieldPath.documentId();
  const safeLimit = parseCatalogPageLimit(params.limit);
  const cleanCursor = typeof params.cursor === "string" && params.cursor.trim() ? params.cursor.trim() : null;

  let query = targetDb
    .collection("products")
    .where("sellerId", "==", params.sellerId)
    .orderBy(orderField);

  if (cleanCursor) {
    query = query.startAfter(cleanCursor);
  }

  const snap = await query.limit(safeLimit + 1).get();
  const hasMore = snap.docs.length > safeLimit;
  const pageDocs = hasMore ? snap.docs.slice(0, safeLimit) : snap.docs;
  const products: SellerCatalogProductRecord[] = pageDocs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  const nextCursor = hasMore && pageDocs.length > 0 ? pageDocs[pageDocs.length - 1].id : null;

  return {
    products,
    nextCursor,
    hasMore,
    limit: safeLimit,
  };
}
