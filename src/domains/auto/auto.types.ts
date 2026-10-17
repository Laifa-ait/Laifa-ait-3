export type VehicleFuel = "essence" | "diesel" | "gpl" | "hybride" | "electrique";
export type VehicleTransmission = "manuelle" | "automatique";
export type VehiclePaperStatus = "safia" | "moudjahid" | "en_cours" | "procuration" | "autre";
export type VehicleBodyCondition = "origine" | "a_froid" | "retouches" | "masque_avant" | "repeinte";
export type VehiclePriceType = "fixe" | "negociable" | "offert" | "echange";
export type VehicleListingStatus = "draft" | "pending_review" | "active" | "sold" | "rejected" | "expired" | "archived";
export type AutoSellerType = "particulier" | "professionnel" | "concessionnaire";

// Référentiel normalisé Marque / Modèle
export interface VehicleBrandModelRef {
  brandId: string;
  brandName: string;
  modelId: string;
  modelName: string;
  generations?: { id: string; name: string; startYear: number; endYear: number }[];
}

// 1. DTO Public Catalogue (Grilles et Cartes de recherche - Zéro PII)
export interface VehicleCatalogItemDto {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuel: VehicleFuel;
  transmission: VehicleTransmission;
  price: number;
  priceType: VehiclePriceType;
  currentOfferPrice?: number;
  currency: "DZD";
  paperStatus: VehiclePaperStatus;
  bodyCondition: VehicleBodyCondition;
  wilayaId: number;
  wilayaName: string;
  sellerType?: AutoSellerType;
  primaryImageUrl: string;
  isSellerVerified: boolean;
  isVehicleInspected: boolean;
  status: VehicleListingStatus;
  createdAt: string;
}

// 2. DTO Public Fiche Détail (Consultation publique détaillée - Zéro PII)
export interface VehiclePublicDetailDto extends VehicleCatalogItemDto {
  images: string[];
  options: string[];
  description: string;
  commune: string;
  sellerId: string;
  sellerDisplayName: string;
  sellerType: AutoSellerType;
  isListingModerated: boolean;
  inspectionReportUrl?: string;
  viewCount: number;
  favoriteCount: number;
  publishedAt?: string;
}

// 3. DTO Privé Vendeur Propriétaire (Accessible uniquement par req.user.uid === ownerUid)
export interface VehicleSellerPrivateDto {
  id: string;
  ownerUid: string;
  status: VehicleListingStatus;
  sellerPhoneNumber: string;
  sellerWhatsappNumber: string;
  rejectionReason?: string;
  expiresAt: string;
  deletedAt?: string | null;
  publicData: VehiclePublicDetailDto;
}

// 4. DTO Dévoilement Contact Sécurisé (Après passage du rate limiter et token auth)
export interface VehicleContactRevealDto {
  listingId: string;
  sellerDisplayName: string;
  phoneNumber: string;
  whatsappUrl: string;
  expiresInSeconds: number;
}

// 5. Critères de Recherche Filtrée
export interface VehicleFilterParams {
  brand?: string;
  model?: string;
  fuel?: VehicleFuel;
  transmission?: VehicleTransmission;
  paperStatus?: VehiclePaperStatus;
  bodyCondition?: VehicleBodyCondition;
  priceType?: VehiclePriceType;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
  wilayaId?: number;
  sellerType?: AutoSellerType;
  onlyInspected?: boolean;
  page?: number;
  limit?: number;
  cursor?: string;
  sort?: "date_desc" | "price_asc" | "price_desc" | "mileage_asc" | "year_desc";
}

// 6. Signalement d'Annonce
export interface VehicleReportInput {
  listingId: string;
  reason: "already_sold" | "wrong_price" | "suspicious_fraud" | "bad_condition" | "other";
  details?: string;
}

// 7. Inputs de Publication & Édition Vendeur
export interface CreateVehicleListingInput {
  title: string;
  brand: string;
  model: string;
  version?: string;
  year: number;
  mileage: number;
  fuel: VehicleFuel;
  transmission: VehicleTransmission;
  paperStatus: VehiclePaperStatus;
  bodyCondition: VehicleBodyCondition;
  price: number;
  priceType: VehiclePriceType;
  currentOfferPrice?: number;
  wilayaId: number;
  wilayaName: string;
  commune: string;
  images: string[];
  options: string[];
  description: string;
  sellerPhoneNumber: string;
  sellerWhatsappNumber: string;
  sellerType: AutoSellerType;
  submitForReview: boolean;
}

export type UpdateVehicleListingInput = Partial<CreateVehicleListingInput>;
