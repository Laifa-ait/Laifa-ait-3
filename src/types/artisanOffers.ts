export type ArtisanOfferPricingType = "forfait" | "a_partir_de" | "au_m2" | "sur_devis";

export type ArtisanOfferStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "paused"
  | "rejected";

export interface ArtisanOffer {
  id: string;
  artisanId: string;
  ownerId: string;
  artisanName: string;
  artisanAvatarUrl?: string;
  artisanVerified: boolean;
  artisanRating: number;
  artisanReviewCount: number;
  artisanYearsExp: number;
  title: string;
  tradeId: string;
  tradeName: string;
  description: string;
  includedItems: string[];
  images: string[];
  coverImageUrl: string;
  pricingType: ArtisanOfferPricingType;
  priceDzd?: number;
  wilaya: string;
  wilayaCode: string;
  communes: string[];
  interventionDelay: string;
  isAvailable: boolean;
  isSponsored?: boolean;
  status: ArtisanOfferStatus;
  rejectionReason?: string;
  viewsCount: number;
  quoteRequestsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArtisanOfferPayload {
  title: string;
  tradeId: string;
  tradeName: string;
  description: string;
  includedItems: string[];
  images: string[];
  coverImageUrl?: string;
  pricingType: ArtisanOfferPricingType;
  priceDzd?: number;
  wilaya: string;
  wilayaCode: string;
  communes: string[];
  interventionDelay: string;
  isAvailable?: boolean;
  status?: "draft" | "active" | "paused";
}

export interface ArtisanOfferFilters {
  q?: string;
  tradeId?: string;
  wilaya?: string;
  commune?: string;
  pricingType?: ArtisanOfferPricingType;
  maxPrice?: number;
  availableOnly?: boolean;
  sort?: "relevance" | "rating" | "price_asc" | "price_desc" | "recent";
  limit?: number;
}

export interface OfferQuoteSubmissionPayload {
  offerId: string;
  artisanId: string;
  tradeId: string;
  offerTitle: string;
  offerImageUrl?: string;
  clientName: string;
  description: string;
  wilaya: string;
  commune: string;
  address?: string;
  urgency: "urgent" | "standard" | "flexible";
  preferredDate?: string;
  estimatedBudget?: number;
}

export function formatOfferPriceLabel(offer: Pick<ArtisanOffer, "pricingType" | "priceDzd">): string {
  if (offer.pricingType === "sur_devis" || !offer.priceDzd || offer.priceDzd <= 0) {
    return "Sur devis";
  }
  const formatted = offer.priceDzd.toLocaleString("fr-DZ");
  if (offer.pricingType === "a_partir_de") {
    return `À partir de ${formatted} DA`;
  }
  if (offer.pricingType === "au_m2") {
    return `${formatted} DA / m²`;
  }
  return `Forfait ${formatted} DA`;
}
