import type {
  CustomPageTheme,
  SellerStoreConfig,
  StoreCommerceConfig,
  StorePixelsConfig,
  StoreStatusConfig,
} from "../../../../domains/seller/customPage.types";

const HEX_COLOR_PATTERN = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export function sanitizeShopSlug(rawSlug: string | undefined): string {
  return (rawSlug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function resolveLiveShopSlugPatch(
  rawSlug: string | undefined,
  fallbackSlug?: string
): { shopSlug?: string } {
  const cleaned = sanitizeShopSlug(rawSlug);
  if (cleaned.length >= 2) return { shopSlug: cleaned };
  const fallbackClean = sanitizeShopSlug(fallbackSlug);
  if (fallbackClean.length >= 2) return { shopSlug: fallbackClean };
  return {};
}

export function resolveSubmitShopSlug(
  rawSlug: string | undefined,
  fallbackSlug?: string
): string {
  const cleaned = sanitizeShopSlug(rawSlug);
  if (cleaned.length >= 2) return cleaned;
  const fallbackClean = sanitizeShopSlug(fallbackSlug);
  if (fallbackClean.length >= 2) return fallbackClean;
  return "ma-boutique";
}

export function sanitizeShopName(rawName: string | undefined): string {
  return (rawName || "").trim() || "Ma Boutique";
}

export function isValidThemeHexColor(val: unknown): boolean {
  if (val === undefined || val === null || val === "") return true;
  if (typeof val !== "string") return false;
  return HEX_COLOR_PATTERN.test(val.trim());
}

export function validateThemeHexColors(theme: CustomPageTheme): string | null {
  const checks: Array<[keyof CustomPageTheme, string]> = [
    ["primaryColor", "Couleur principale"],
    ["secondaryColor", "Couleur secondaire"],
    ["accentColor", "Couleur d'accent"],
    ["canvasColor", "Arrière-plan global"],
    ["surfaceColor", "Surface / Cartes"],
    ["textColor", "Couleur du texte"],
  ];
  for (const [key, label] of checks) {
    if (!isValidThemeHexColor(theme[key])) {
      return `${label} invalide : utilisez un code hexadécimal (#RGB ou #RRGGBB).`;
    }
  }
  return null;
}

export function extractSaveErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message.trim().length > 0) {
    return err.message.trim();
  }
  return fallback;
}

export function buildStoreSettingsFormDefaults(storeConfig?: SellerStoreConfig | null): {
  shopName: string;
  shopSlug: string;
  shopDescription: string;
  wilaya: string;
  commune: string;
  metaTitle: string;
  commerce: StoreCommerceConfig;
  storeStatus: StoreStatusConfig;
  pixels: StorePixelsConfig;
} {
  return {
    shopName: storeConfig?.shopName || "",
    shopSlug: storeConfig?.shopSlug || "",
    shopDescription: storeConfig?.shopDescription || "",
    wilaya: storeConfig?.wilaya || "Alger",
    commune: storeConfig?.commune || "",
    metaTitle: storeConfig?.seo?.metaTitle || "",
    commerce: {
      codEnabled: storeConfig?.commerceConfig?.codEnabled ?? true,
      freeShippingThresholdDZD: storeConfig?.commerceConfig?.freeShippingThresholdDZD ?? 8000,
      minOrderAmountDZD: storeConfig?.commerceConfig?.minOrderAmountDZD ?? 0,
      preparationTimeHours: storeConfig?.commerceConfig?.preparationTimeHours ?? 24,
      whatsappOrderEnabled: storeConfig?.commerceConfig?.whatsappOrderEnabled ?? false,
      whatsappNumber: storeConfig?.commerceConfig?.whatsappNumber || "",
    },
    storeStatus: {
      mode: storeConfig?.storeStatus?.mode || "open",
      vacationMessage:
        storeConfig?.storeStatus?.vacationMessage ||
        "Notre boutique est momentanément en pause logistique. De retour très vite !",
      passwordProtectionCode: storeConfig?.storeStatus?.passwordProtectionCode || "",
    },
    pixels: {
      metaPixelId: storeConfig?.pixelsConfig?.metaPixelId || "",
      tiktokPixelId: storeConfig?.pixelsConfig?.tiktokPixelId || "",
      ga4MeasurementId: storeConfig?.pixelsConfig?.ga4MeasurementId || "",
    },
  };
}

export function buildHeaderNavDefaults(storeConfig?: SellerStoreConfig | null) {
  return {
    announcement: {
      enabled: storeConfig?.announcementBar?.enabled ?? true,
      text: storeConfig?.announcementBar?.text || "Livraison rapide 69 Wilayas • Paiement à la livraison (COD)",
      bgColor: storeConfig?.announcementBar?.bgColor || "#0F172A",
      textColor: storeConfig?.announcementBar?.textColor || "#FFFFFF",
    },
    headerCfg: {
      layout: storeConfig?.headerConfig?.layout || ("left" as const),
      sticky: storeConfig?.headerConfig?.sticky ?? true,
      showSearch: storeConfig?.headerConfig?.showSearch ?? true,
      showTrustBar: storeConfig?.headerConfig?.showTrustBar ?? true,
      navLinks: storeConfig?.headerConfig?.navLinks?.length
        ? storeConfig.headerConfig.navLinks
        : [{ id: "nav-home", label: "Accueil", target: "home" as const }, { id: "nav-cat", label: "Catalogue", target: "collection" as const }],
    },
  };
}

export function buildPendingStoreConfigPatch(
  liveStorePatch: Partial<SellerStoreConfig> | null,
  liveThemeOverride: CustomPageTheme | null
): Partial<SellerStoreConfig> {
  return { ...(liveStorePatch || {}), ...(liveThemeOverride ? { theme: liveThemeOverride } : {}) };
}

export function hasPendingStoreConfigChanges(
  mergedPatch: Partial<SellerStoreConfig>,
  storeConfig: SellerStoreConfig | null | undefined,
  isEqual: (a: unknown, b: unknown) => boolean
): boolean {
  const keys = Object.keys(mergedPatch) as Array<keyof SellerStoreConfig>;
  if (keys.length === 0) return false;
  return storeConfig ? keys.some((k) => !isEqual(mergedPatch[k], storeConfig[k])) : true;
}
