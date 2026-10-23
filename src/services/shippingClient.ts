import { apiGet, apiPost } from "../lib/api";
import {
  AlgerianCarrierInfo,
  CarrierWithoutOnlinePricing,
  SUPPORTED_ALGERIAN_CARRIERS
} from "../domains/shipping/services/algerianCarriersData";
import {
  calculateCarrierShippingRates,
  CalculateCarrierRateInput,
  CalculateCarrierRateOutput
} from "../domains/shipping/services/shippingCalculatorService";

export interface ShippingLocation {
  id: number;
  code?: string;
  name: string;
  rawName?: string;
  name_ar?: string;
  zone?: number;
}

export interface ShippingLocationsResponse {
  success: boolean;
  data: {
    wilayas: ShippingLocation[];
    communes: Array<{ id: number; wilaya_id: number; name: string }>;
    centers: string[];
  };
}

export interface ShippingRateDetail {
  home_fee: number;
  desk_fee: number;
  delay: string;
  home_delivery_fee?: number;
  carrier?: string;
  zoneName?: string;
  isVolumetricApplied?: boolean;
  chargeableWeightKg?: number;
}

export interface ShippingRatesResponse {
  success?: boolean;
  data?: ShippingRateDetail;
  rates?: Array<{
    carrierId?: string;
    carrierName?: string;
    homePrice?: number;
    deskPrice?: number;
    [key: string]: unknown;
  }>;
}

export interface CarriersApiResponse {
  success: boolean;
  data: {
    carriers: AlgerianCarrierInfo[];
    unsupportedCarriers: CarrierWithoutOnlinePricing[];
    notice: string;
  };
}

export interface CalculateCarrierRateResponse {
  success: boolean;
  data: CalculateCarrierRateOutput;
}

export const getShippingCarriersApi = async (): Promise<CarriersApiResponse> => {
  try {
    return await apiGet<CarriersApiResponse>("/api/v1/shipping/carriers");
  } catch {
    return {
      success: true,
      data: {
        carriers: SUPPORTED_ALGERIAN_CARRIERS,
        unsupportedCarriers: [],
        notice: "Calculateur autonome actif"
      }
    };
  }
};

export const getShippingLocations = async (): Promise<ShippingLocationsResponse> => {
  const res = await apiGet<ShippingLocationsResponse>("/api/v1/shipping/locations");
  return res;
};

export const calculateShippingRates = async (
  wilaya_id: number | string,
  carrier_id?: string
): Promise<ShippingRatesResponse> => {
  const res = await apiPost<ShippingRatesResponse>("/api/v1/shipping/rates", {
    wilaya_id,
    carrier_id
  });
  return res;
};

export const calculateCarrierRateApi = async (
  input: CalculateCarrierRateInput
): Promise<CalculateCarrierRateResponse> => {
  try {
    const res = await apiPost<CalculateCarrierRateResponse>(
      "/api/v1/shipping/calculate-rate",
      input
    );
    if (res && res.data) return res;
  } catch (err) {
    console.warn("API calculate rate fallback to client calculation:", err);
  }
  return {
    success: true,
    data: calculateCarrierShippingRates(input)
  };
};

export {
  calculateCarrierShippingRates,
  type CalculateCarrierRateInput,
  type CalculateCarrierRateOutput,
  type AlgerianCarrierInfo
};
