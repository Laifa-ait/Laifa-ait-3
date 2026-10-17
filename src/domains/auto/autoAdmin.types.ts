import { VehicleListingStatus, VehiclePaperStatus, VehiclePriceType } from "./auto.types";

export interface AdminModerationListingItemDto {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  priceDZD: number;
  priceType: VehiclePriceType;
  wilayaId: number;
  commune: string;
  paperStatus: VehiclePaperStatus;
  primaryImageUrl: string;
  images: string[];
  ownerUid: string;
  sellerDisplayName: string;
  sellerPhoneNumber: string;
  status: VehicleListingStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  isVerifiedDealer?: boolean;
}

export interface AdminReportItemDto {
  id: string;
  listingId: string;
  reporterUid: string;
  reason: string;
  details?: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
}

export interface AdminRejectListingInput {
  reason: string;
}
