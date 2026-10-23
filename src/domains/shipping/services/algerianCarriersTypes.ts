/**
 * Types & Interfaces pour le système logistique algérien
 */

export interface CarrierPricingZone {
  zoneIndex: number;
  name: string;
  yalidine: { home: number; desk: number; delay: string };
  zr_express: { home: number; desk: number; delay: string };
  maystro: { home: number; desk: number; delay: string };
}

export interface AlgerianCarrierInfo {
  id: "yalidine" | "zr_express" | "maystro";
  name: string;
  nameAr: string;
  logoUrl?: string;
  badge: string;
  website: string;
  phone: string;
  hasOnlinePricing: true;
  supportsHomeDelivery: boolean;
  supportsStopDesk: boolean;
  baseWeightKg: number;
  extraKgFeeNorth: number;
  extraKgFeeSouth: number;
  description: string;
}

export interface CarrierWithoutOnlinePricing {
  id: string;
  name: string;
  nameAr: string;
  website?: string;
  reason: string;
}

export interface SeasonalTariffAdjustment {
  id: string; // ex: "ramadan_2026", "summer_sales", "standard"
  name: string;
  nameAr: string;
  isActive: boolean;
  discountPercent?: number; // e.g. 10 for -10%
  surchargePercent?: number; // e.g. 5 for +5%
  validFrom?: string;
  validUntil?: string;
  notice?: string;
}

export interface ShippingSettingsDocument {
  updatedAt: string;
  updatedBy?: string;
  activeSeason: SeasonalTariffAdjustment;
  customZoneTariffs?: Record<number, Partial<CarrierPricingZone>>;
  volumetricDivisor: number; // 5000 standard IATA
}
