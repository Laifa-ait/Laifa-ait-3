import { USER_STATUSES } from "../../user/user.status";

export interface PublicStoreProjectionSources {
  userData?: Record<string, unknown> | null;
  pubData?: Record<string, unknown> | null;
  sellerData?: Record<string, unknown> | null;
  shopData?: Record<string, unknown> | null;
  fallbackName?: string;
}

const PUBLIC_STORE_ALLOWED_KEYS = [
  "shopName",
  "storeName",
  "displayName",
  "shopSlug",
  "shopDescription",
  "storeDescription",
  "description",
  "bio",
  "logoUrl",
  "bannerUrl",
  "coverUrl",
  "coverImage",
  "bannerImage",
  "wilaya",
  "commune",
  "status",
  "rating",
  "reviewCount",
  "followersCount",
  "isVerified",
  "verifiedSeller",
  "badges",
  "categories",
  "specialty",
  "socialLinks",
  "storeLayout",
  "avgPreparationTime",
  "returnPolicy",
  "shippingPolicy",
  "supportPhone",
  "createdAt",
] as const;

/**
 * Projects a strictly public store/seller representation from Firestore documents.
 * Never exposes sensitive fields from `users/{sellerId}` such as `email`, `phone`,
 * `phoneNumber`, `rib`, `nif`, `nis`, `commercialRegister`, `documents`, `fcmToken`,
 * `fcmTokens`, `verification`, `is2FAEnabled`, `twoFactorSecret`, `soldes`, or `address`.
 */
export function projectPublicStoreProfile(
  sellerId: string,
  sources: PublicStoreProjectionSources
): Record<string, unknown> {
  const uData = sources.userData || {};
  const pData = sources.pubData || {};
  const sData = sources.sellerData || {};
  const shData = sources.shopData || {};

  const combinedSafe: Record<string, unknown> = {};
  for (const source of [uData, pData, sData, shData]) {
    for (const key of PUBLIC_STORE_ALLOWED_KEYS) {
      if (source[key] !== undefined && source[key] !== null && source[key] !== "") {
        combinedSafe[key] = source[key];
      }
    }
  }

  const resolvedId =
    (typeof shData.id === "string" && shData.id) ||
    (typeof pData.id === "string" && pData.id) ||
    (typeof uData.id === "string" && uData.id) ||
    sellerId;

  const shopName =
    shData.shopName ||
    sData.shopName ||
    pData.shopName ||
    uData.shopName ||
    shData.storeName ||
    pData.storeName ||
    uData.storeName ||
    pData.displayName ||
    uData.displayName ||
    sources.fallbackName ||
    "Boutique Vendeur";

  const shopDescription =
    shData.shopDescription ||
    sData.shopDescription ||
    pData.shopDescription ||
    uData.shopDescription ||
    shData.storeDescription ||
    pData.storeDescription ||
    uData.storeDescription ||
    pData.description ||
    uData.description ||
    "";

  const logoUrl =
    shData.logoUrl ||
    sData.logoUrl ||
    pData.logoUrl ||
    pData.photoURL ||
    pData.avatarUrl ||
    uData.logoUrl ||
    uData.photoURL ||
    uData.avatarUrl ||
    uData.photoUrl ||
    "";

  const bannerUrl =
    shData.bannerUrl ||
    sData.bannerUrl ||
    pData.bannerUrl ||
    pData.coverUrl ||
    pData.coverImage ||
    uData.bannerUrl ||
    uData.coverUrl ||
    uData.coverImage ||
    uData.bannerImage ||
    "";

  const wilaya =
    shData.wilaya ||
    sData.wilaya ||
    pData.wilaya ||
    uData.wilaya ||
    "16 - Alger";

  const status =
    shData.status ||
    sData.status ||
    pData.status ||
    uData.status ||
    USER_STATUSES.ACTIVE;

  const supportPhone =
    shData.supportPhone ||
    pData.supportPhone ||
    null;

  return {
    ...combinedSafe,
    id: resolvedId,
    sellerId: resolvedId,
    shopName,
    shopDescription,
    logoUrl,
    bannerUrl,
    wilaya,
    status,
    ...(supportPhone ? { supportPhone } : {}),
  };
}
