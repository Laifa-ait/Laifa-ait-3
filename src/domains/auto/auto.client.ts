import { apiGet, apiPost, apiPut } from "../../lib/api";
import {
  VehicleCatalogItemDto,
  VehiclePublicDetailDto,
  VehicleContactRevealDto,
  VehicleFilterParams,
  VehicleReportInput,
  VehicleSellerPrivateDto,
  VehicleListingStatus,
  CreateVehicleListingInput,
  UpdateVehicleListingInput,
} from "./auto.types";
import {
  AutoPartDto,
  AutoPartFilterParams,
  CreateAutoPartInput,
} from "./autoParts.types";

export interface PaginatedVehicleResult {
  items: VehicleCatalogItemDto[];
  total: number;
  page: number;
  limit: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export const autoClient = {
  async getPublicListings(params: VehicleFilterParams = {}): Promise<PaginatedVehicleResult> {
    const searchParams = new URLSearchParams();
    if (params.brand) searchParams.set("brand", params.brand);
    if (params.model) searchParams.set("model", params.model);
    if (params.fuel) searchParams.set("fuel", params.fuel);
    if (params.transmission) searchParams.set("transmission", params.transmission);
    if (params.paperStatus) searchParams.set("paperStatus", params.paperStatus);
    if (params.bodyCondition) searchParams.set("bodyCondition", params.bodyCondition);
    if (params.priceType) searchParams.set("priceType", params.priceType);
    if (params.minPrice !== undefined) searchParams.set("minPrice", String(params.minPrice));
    if (params.maxPrice !== undefined) searchParams.set("maxPrice", String(params.maxPrice));
    if (params.minYear !== undefined) searchParams.set("minYear", String(params.minYear));
    if (params.maxYear !== undefined) searchParams.set("maxYear", String(params.maxYear));
    if (params.maxMileage !== undefined) searchParams.set("maxMileage", String(params.maxMileage));
    if (params.wilayaId !== undefined) searchParams.set("wilayaId", String(params.wilayaId));
    if (params.sellerType) searchParams.set("sellerType", params.sellerType);
    if (params.onlyInspected) searchParams.set("onlyInspected", "true");
    if (params.page !== undefined) searchParams.set("page", String(params.page));
    if (params.limit !== undefined) searchParams.set("limit", String(params.limit));
    if (params.sort) searchParams.set("sort", params.sort);

    const qs = searchParams.toString();
    const endpoint = `/api/v1/auto/listings${qs ? `?${qs}` : ""}`;
    const res = await apiGet<ApiResponse<PaginatedVehicleResult>>(endpoint);
    return res.data;
  },

  async getPublicListingById(id: string): Promise<VehiclePublicDetailDto> {
    const res = await apiGet<ApiResponse<VehiclePublicDetailDto>>(`/api/v1/auto/listings/${id}`);
    return res.data;
  },

  async revealContact(listingId: string): Promise<VehicleContactRevealDto> {
    const res = await apiPost<ApiResponse<VehicleContactRevealDto>>(`/api/v1/auto/listings/${listingId}/contact`, {});
    return res.data;
  },

  async reportListing(input: VehicleReportInput): Promise<{ reportId: string }> {
    const res = await apiPost<ApiResponse<{ reportId: string }>>(`/api/v1/auto/listings/${input.listingId}/report`, {
      reason: input.reason,
      details: input.details,
    });
    return res.data;
  },

  async getMyListings(): Promise<VehicleSellerPrivateDto[]> {
    const res = await apiGet<ApiResponse<VehicleSellerPrivateDto[]>>("/api/v1/auto/my-listings");
    return res.data;
  },

  async createListing(
    input: CreateVehicleListingInput
  ): Promise<{ id: string; status: VehicleListingStatus }> {
    const res = await apiPost<ApiResponse<{ id: string; status: VehicleListingStatus }>>(
      "/api/v1/auto/listings",
      input
    );
    return res.data;
  },

  async updateListing(id: string, input: UpdateVehicleListingInput): Promise<void> {
    await apiPut<ApiResponse<{ message: string }>>(`/api/v1/auto/listings/${id}`, input);
  },

  async changeStatus(
    id: string,
    targetStatus: VehicleListingStatus,
    rejectionReason?: string
  ): Promise<void> {
    await apiPost<ApiResponse<{ message: string }>>(`/api/v1/auto/listings/${id}/status`, {
      targetStatus,
      rejectionReason,
    });
  },

  // --- Pièces Détachées & Casse (Phase 4) ---
  async getParts(params?: AutoPartFilterParams): Promise<{ items: AutoPartDto[]; total: number }> {
    const search = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          search.append(key, String(value));
        }
      });
    }
    const queryStr = search.toString() ? `?${search.toString()}` : "";
    const res = await apiGet<{ success: boolean; items: AutoPartDto[]; total: number }>(
      `/api/v1/auto/parts${queryStr}`
    );
    return { items: res.items || [], total: res.total || 0 };
  },

  async getPartById(id: string): Promise<AutoPartDto> {
    const res = await apiGet<ApiResponse<AutoPartDto>>(`/api/v1/auto/parts/${id}`);
    return res.data;
  },

  async revealPartContact(id: string): Promise<{ phone: string; whatsapp: string }> {
    const res = await apiPost<ApiResponse<{ phone: string; whatsapp: string }>>(
      `/api/v1/auto/parts/${id}/contact`,
      {}
    );
    return res.data;
  },

  async createPart(input: CreateAutoPartInput): Promise<{ partId: string }> {
    const res = await apiPost<ApiResponse<{ partId: string }>>("/api/v1/auto/parts", input);
    return res.data;
  },
};
