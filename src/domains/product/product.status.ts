/**
 * OLMART Product State Machine & Status Predicates
 * Canonical statuses: draft -> pending -> active -> (suspended | rejected | archived)
 */

export type ProductStatus =
  | "draft"
  | "pending"
  | "active"
  | "suspended"
  | "rejected"
  | "archived";

export const PRODUCT_STATUSES = {
  DRAFT: "draft",
  PENDING: "pending",
  ACTIVE: "active",
  SUSPENDED: "suspended",
  REJECTED: "rejected",
  ARCHIVED: "archived",
} as const;

export const ALL_PRODUCT_STATUSES: readonly ProductStatus[] = [
  PRODUCT_STATUSES.DRAFT,
  PRODUCT_STATUSES.PENDING,
  PRODUCT_STATUSES.ACTIVE,
  PRODUCT_STATUSES.SUSPENDED,
  PRODUCT_STATUSES.REJECTED,
  PRODUCT_STATUSES.ARCHIVED,
] as const;

export const ALLOWED_PRODUCT_TRANSITIONS: Record<ProductStatus, readonly ProductStatus[]> = {
  draft: ["pending", "archived"],
  pending: ["active", "rejected", "archived"],
  active: ["suspended", "archived"],
  suspended: ["active", "archived", "rejected"],
  rejected: ["pending", "archived"],
  archived: ["draft"],
};

/**
 * Predicate to verify if a product is purchasable in an order checkout transaction.
 * Must be in "active" status and have stock > 0.
 */
export function isPurchasable(product: { status?: string; stock?: number } | null | undefined): boolean {
  if (!product) return false;
  if (product.status !== PRODUCT_STATUSES.ACTIVE) return false;
  if (typeof product.stock === "number" && product.stock <= 0) return false;
  return true;
}

/**
 * Predicate to verify if a product is visible to public marketplace catalog buyers.
 */
export function isPubliclyVisible(product: { status?: string } | null | undefined): boolean {
  if (!product) return false;
  return product.status === PRODUCT_STATUSES.ACTIVE;
}

/**
 * Checks if a transition between two product statuses is permitted by the state machine.
 */
export function canTransitionProduct(from: ProductStatus, to: ProductStatus): boolean {
  const allowed = ALLOWED_PRODUCT_TRANSITIONS[from];
  return Boolean(allowed && allowed.includes(to));
}
