import {
  VehicleListingStatus,
  AutoSellerType,
  VehicleCatalogItemDto,
  VehiclePublicDetailDto,
  VehicleSellerPrivateDto,
} from "./auto.types";

/**
 * Validation des transitions FSM côté serveur
 */
export function canTransitionStatus(
  current: VehicleListingStatus,
  target: VehicleListingStatus,
  isAdmin: boolean,
  isOwner: boolean
): { allowed: boolean; reason?: string } {
  if (current === target) return { allowed: true };

  if (current === "draft" && target === "pending_review") {
    if (isOwner || isAdmin) return { allowed: true };
    return { allowed: false, reason: "Seul le propriétaire peut soumettre son brouillon" };
  }

  if (current === "pending_review") {
    if (!isAdmin) return { allowed: false, reason: "Seul un administrateur peut valider ou refuser une annonce" };
    if (target === "active" || target === "rejected") return { allowed: true };
  }

  if (current === "rejected") {
    if (target === "draft" && (isOwner || isAdmin)) return { allowed: true };
    if (target === "active" && isAdmin) return { allowed: true };
  }

  if (current === "active") {
    if (target === "sold" && (isOwner || isAdmin)) return { allowed: true };
    if (target === "archived" && (isOwner || isAdmin)) return { allowed: true };
    if (target === "expired" && isAdmin) return { allowed: true };
    if (target === "rejected" && isAdmin) return { allowed: true };
  }

  return { allowed: false, reason: `Transition non autorisée de "${current}" vers "${target}"` };
}

/**
 * Projections DTO strictes (Whitelist pure - Zéro fuite de PII)
 */
export function toCatalogItemDto(id: string, d: Record<string, unknown>): VehicleCatalogItemDto {
  return {
    id,
    title: String(d.title || ""),
    brand: String(d.brand || ""),
    model: String(d.model || ""),
    year: Number(d.year || 0),
    mileage: Number(d.mileage || 0),
    fuel: (d.fuel as VehicleCatalogItemDto["fuel"]) || "essence",
    transmission: (d.transmission as VehicleCatalogItemDto["transmission"]) || "manuelle",
    price: Number(d.price || 0),
    priceType: (d.priceType as VehicleCatalogItemDto["priceType"]) || "fixe",
    currentOfferPrice: typeof d.currentOfferPrice === "number" ? d.currentOfferPrice : undefined,
    currency: "DZD",
    paperStatus: (d.paperStatus as VehicleCatalogItemDto["paperStatus"]) || "safia",
    bodyCondition: (d.bodyCondition as VehicleCatalogItemDto["bodyCondition"]) || "origine",
    wilayaId: Number(d.wilayaId || 16),
    wilayaName: String(d.wilayaName || "Alger"),
    sellerType: (d.sellerType as AutoSellerType) || "particulier",
    primaryImageUrl: Array.isArray(d.images) && d.images[0] ? String(d.images[0]) : "",
    isSellerVerified: Boolean(d.isSellerVerified),
    isVehicleInspected: Boolean(d.isVehicleInspected),
    status: (d.status as VehicleListingStatus) || "active",
    createdAt: String(d.createdAt || new Date().toISOString()),
  };
}

export function toPublicDetailDto(id: string, d: Record<string, unknown>): VehiclePublicDetailDto {
  const catalog = toCatalogItemDto(id, d);
  return {
    ...catalog,
    images: Array.isArray(d.images) ? (d.images as string[]) : [],
    options: Array.isArray(d.options) ? (d.options as string[]) : [],
    description: String(d.description || ""),
    commune: String(d.commune || ""),
    sellerId: String(d.ownerUid || ""),
    sellerDisplayName: String(d.sellerDisplayName || "Vendeur Olma"),
    sellerType: (d.sellerType as VehiclePublicDetailDto["sellerType"]) || "particulier",
    isListingModerated: Boolean(d.isListingModerated),
    inspectionReportUrl: typeof d.inspectionReportUrl === "string" ? d.inspectionReportUrl : undefined,
    viewCount: Number(d.viewCount || 0),
    favoriteCount: Number(d.favoriteCount || 0),
    publishedAt: typeof d.publishedAt === "string" ? d.publishedAt : undefined,
  };
}

export function toSellerPrivateDto(id: string, d: Record<string, unknown>): VehicleSellerPrivateDto {
  return {
    id,
    ownerUid: String(d.ownerUid || ""),
    status: (d.status as VehicleListingStatus) || "draft",
    sellerPhoneNumber: String(d.sellerPhoneNumber || ""),
    sellerWhatsappNumber: String(d.sellerWhatsappNumber || ""),
    rejectionReason: typeof d.rejectionReason === "string" ? d.rejectionReason : undefined,
    expiresAt: String(d.expiresAt || ""),
    deletedAt: (d.deletedAt as string | null) || null,
    publicData: toPublicDetailDto(id, d),
  };
}
