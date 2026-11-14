import { apiPost } from "../../../lib/api";
import type {
  CollectionPageDesignConfig,
  CustomPageSeo,
  CustomPageTheme,
  StoreAnnouncementBarConfig,
  StoreCommerceConfig,
  StoreCustomPageItem,
  StoreHeaderConfig,
  StoreStatusConfig,
} from "../../../domains/seller/customPage.types";

export interface PublicStoreInfo {
  id: string;
  sellerId: string;
  shopName: string;
  shopDescription?: string;
  wilaya: string;
  commune?: string;
  legalStatus?: string;
  avgPreparationTime?: string;
  returnPolicy?: string;
  followersCount?: number;
  rating?: number | null;
  status?: string;
  logoUrl?: string;
  bannerUrl?: string;
  shopSlug?: string;
  coverImage?: string;
  displayName?: string;
  description?: string;
  avatarUrl?: string;
  coverUrl?: string;
  uid?: string;
  userUid?: string;
  error?: string;
  photoURL?: string;
  photoUrl?: string;
  avatar?: string;
  banner?: string;
  storeBanner?: string;
  sellerBanner?: string;
  bannerImage?: string;
  brand?: string;
  hasPaidStudioSubscription?: boolean;
  isVipLocked?: boolean;
  theme?: CustomPageTheme;
  seo?: CustomPageSeo;
  collectionPageConfig?: CollectionPageDesignConfig;
  announcementBar?: StoreAnnouncementBarConfig;
  headerConfig?: StoreHeaderConfig;
  commerceConfig?: StoreCommerceConfig;
  storeStatus?: StoreStatusConfig;
  customPages?: StoreCustomPageItem[];
}

export const DEFAULT_CASBAH_THEME: CustomPageTheme = {
  sector: "artisanat",
  primaryColor: "#B45309",
  secondaryColor: "#18181B",
  accentColor: "#B45309",
  canvasColor: "#FAF6F0",
  surfaceColor: "#FFFFFF",
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  headingFontFamily: "'Cormorant Garamond', Georgia, serif",
  bodyFontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  borderRadiusPx: 16,
  spacingYPx: 28,
  titleFontSizePx: 36,
  bodyFontSizePx: 15,
  surfaceTexture: "cotton-paper",
  ambientLighting: "golden-hour",
  cardMaterial: "solid-matte",
  frameShape: "casbah-arch",
  headingAccentStyle: "metallic-gold",
  headingUnderlineStyle: "brush-stroke",
};

const VIP_STORAGE_PREFIX = "olmart_store_vip_token_";

export function getStoredVipToken(sellerIdOrSlug?: string | null): string | undefined {
  if (!sellerIdOrSlug || typeof window === "undefined" || !window.sessionStorage) return undefined;
  try {
    const raw = window.sessionStorage.getItem(`${VIP_STORAGE_PREFIX}${sellerIdOrSlug}`);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { token?: string; expiresAt?: number };
    if (!parsed?.token) return undefined;
    if (typeof parsed.expiresAt === "number" && Date.now() > parsed.expiresAt) {
      window.sessionStorage.removeItem(`${VIP_STORAGE_PREFIX}${sellerIdOrSlug}`);
      return undefined;
    }
    return parsed.token;
  } catch {
    return undefined;
  }
}

export function saveStoredVipToken(
  keys: Array<string | undefined | null>,
  token: string,
  expiresAt?: number
): void {
  if (typeof window === "undefined" || !window.sessionStorage || !token) return;
  const payload = JSON.stringify({ token, expiresAt: expiresAt ?? Date.now() + 2 * 3600 * 1000 });
  for (const k of keys) {
    if (k && k.trim()) {
      try {
        window.sessionStorage.setItem(`${VIP_STORAGE_PREFIX}${k.trim()}`, payload);
      } catch {
        // Ignore quota errors
      }
    }
  }
}

export async function verifyAndStoreVipAccess(
  slugOrId: string,
  password: string,
  additionalKeys: Array<string | undefined | null> = []
): Promise<{ granted: boolean; vipToken?: string; error?: string }> {
  try {
    const res = await apiPost<{
      success?: boolean;
      data?: { granted?: boolean; vipToken?: string; expiresAt?: number };
      error?: string;
    }>(`/api/v1/public/stores/${encodeURIComponent(slugOrId)}/verify-access`, {
      password: password.trim(),
    });

    if (res?.success && res.data?.granted && res.data.vipToken) {
      saveStoredVipToken([slugOrId, ...additionalKeys], res.data.vipToken, res.data.expiresAt);
      return { granted: true, vipToken: res.data.vipToken };
    }
    return { granted: false, error: res?.error || "Code d'accès VIP invalide." };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Code d'accès VIP invalide.";
    return { granted: false, error: msg };
  }
}
