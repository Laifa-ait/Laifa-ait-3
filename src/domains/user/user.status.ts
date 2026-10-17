/**
 * OLMART User & Seller Status State Machine & Predicates
 * Canonical statuses: pending -> active -> (suspended | blocked)
 */

export type UserStatus = "pending" | "active" | "suspended" | "blocked";

export const USER_STATUSES = {
  PENDING: "pending",
  ACTIVE: "active",
  SUSPENDED: "suspended",
  BLOCKED: "blocked",
} as const;

export const ALL_USER_STATUSES: readonly UserStatus[] = [
  USER_STATUSES.PENDING,
  USER_STATUSES.ACTIVE,
  USER_STATUSES.SUSPENDED,
  USER_STATUSES.BLOCKED,
] as const;

export const ALLOWED_USER_TRANSITIONS: Record<UserStatus, readonly UserStatus[]> = {
  pending: ["active", "blocked"],
  active: ["suspended", "blocked"],
  suspended: ["active", "blocked"],
  blocked: ["suspended", "active"],
};

export interface SellerSellableCheckInput {
  status?: string;
  isActive?: boolean;
  is_active?: boolean;
  velocitySuspended?: boolean;
  shopName?: string;
  displayName?: string;
  [key: string]: unknown;
}

/**
 * Predicate to verify if a seller is authorized to accept orders in checkout.
 * Unifies status === "active", isActive !== false, and velocitySuspended !== true.
 */
export function isSellerSellable(seller: SellerSellableCheckInput | null | undefined): boolean {
  if (!seller) return false;
  if (seller.status && seller.status !== USER_STATUSES.ACTIVE) return false;
  if (seller.isActive === false || seller.is_active === false) return false;
  if (seller.velocitySuspended === true) return false;
  return true;
}

/**
 * Checks if a transition between two user statuses is permitted.
 */
export function canTransitionUser(from: UserStatus, to: UserStatus): boolean {
  const allowed = ALLOWED_USER_TRANSITIONS[from];
  return Boolean(allowed && allowed.includes(to));
}
