import {
  SUPPORTED_ALGERIAN_CARRIERS,
  WILAYA_ZONE_MAPPING,
  CARRIER_ZONE_TARIFFS,
  BULKY_PRODUCT_CATEGORIES,
  SEASONAL_TARIFF_PROFILES,
  AlgerianCarrierInfo,
  CarrierPricingZone
} from "./algerianCarriersData";

export interface CalculateCarrierRateInput {
  carrierId?: "yalidine" | "zr_express" | "maystro" | string;
  originWilaya?: string;
  originDaira?: string;
  originCommune?: string;
  destWilaya?: string;
  destDaira?: string;
  destCommune?: string;
  weightKg?: number;
  dimensions?: string;
  category?: string;
  deliveryMethod?: "domicile" | "stopdesk";
  freeShipping?: boolean;
  seasonId?: string;
}

export interface RateBreakdown {
  fee: number;
  baseFee: number;
  weightFee: number;
  remoteAreaFee: number;
  delay: string;
  available: boolean;
}

export interface WeightCalculationDetails {
  realWeightKg: number;
  volumetricWeightKg: number;
  chargeableWeightKg: number;
  isVolumetricApplied: boolean;
  isBulkyCategory: boolean;
  dimensions?: string;
}

export interface CalculateCarrierRateOutput {
  carrier: AlgerianCarrierInfo;
  origin: {
    code: string;
    name: string;
    daira: string;
    commune: string;
  };
  destination: {
    code: string;
    name: string;
    daira: string;
    commune: string;
  };
  zoneIndex: number;
  zoneName: string;
  isIntraWilaya: boolean;
  weightKg: number;
  weightDetails: WeightCalculationDetails;
  homeDelivery: RateBreakdown;
  stopDeskDelivery: RateBreakdown;
  selectedFee: number;
  selectedDelay: string;
  deliveryMethod: "domicile" | "stopdesk";
  isFreeShipping: boolean;
}

/**
 * Calcule le poids volumétrique officiel des transporteurs : (L x l x h) / 5000 (en cm)
 * Accepte les formats "120x80x60", "120 x 80 x 60", "120*80*60"
 */
export function computeVolumetricWeight(dimensions?: string): number {
  if (!dimensions || typeof dimensions !== "string") return 0;
  const parts = dimensions.replace(/[cCmMoO\s]/g, "").split(/[xX*]/);
  if (parts.length === 3) {
    const l = parseFloat(parts[0]);
    const w = parseFloat(parts[1]);
    const h = parseFloat(parts[2]);
    if (!isNaN(l) && !isNaN(w) && !isNaN(h) && l > 0 && w > 0 && h > 0) {
      return Math.round(((l * w * h) / 5000) * 100) / 100;
    }
  }
  return 0;
}

/**
 * Vérifie si la catégorie fait partie des articles encombrants (ex: canapés, gros électroménager)
 */
export function isBulkyCategory(category?: string): boolean {
  if (!category) return false;
  const normalized = category.toLowerCase().trim();
  return BULKY_PRODUCT_CATEGORIES.some((c) => normalized.includes(c));
}

/**
 * Extrait le code numérique à 2 chiffres de la wilaya depuis une chaîne
 */
export function extractWilayaCode(identifier?: string): string {
  if (!identifier) return "16";
  const clean = identifier.trim();
  const match = clean.match(/^(\d{1,2})/);
  if (match) return match[1].padStart(2, "0");

  const nameToCode: Record<string, string> = {
    adrar: "01", chlef: "02", laghouat: "03", "oum el bouaghi": "04", batna: "05",
    "béjaïa": "06", bejaia: "06", biskra: "07", "béchar": "08", bechar: "08",
    blida: "09", bouira: "10", tamanrasset: "11", "tébessa": "12", tebessa: "12",
    tlemcen: "13", tiaret: "14", "tizi ouzou": "15", alger: "16", djelfa: "17",
    jijel: "18", "sétif": "19", setif: "19", "saïda": "20", saida: "20",
    skikda: "21", "sidi bel abbès": "22", annaba: "23", guelma: "24",
    constantine: "25", "médéa": "26", mostaganem: "27", "m'sila": "28",
    mascara: "29", ouargla: "30", oran: "31", "el bayadh": "32", illizi: "33",
    "bordj bou arréridj": "34", "boumerdès": "35", "el tarf": "36", tindouf: "37",
    tissemsilt: "38", "el oued": "39", khenchela: "40", "souk ahras": "41",
    tipaza: "42", mila: "43", "aïn defla": "44", "naâma": "45",
    "aïn témouchent": "46", "ghardaïa": "47", relizane: "48", timimoun: "49",
    "bordj badji mokhtar": "50", "ouled djellal": "51", "béni abbès": "52",
    "in salah": "53", "in guezzam": "54", touggourt: "55", djanet: "56",
    "el m'ghair": "57", "el meniaa": "58"
  };

  const lower = clean.toLowerCase();
  for (const [key, code] of Object.entries(nameToCode)) {
    if (lower.includes(key)) return code;
  }
  return "16";
}

/**
 * Détermine si une commune est excentrée par rapport au chef-lieu
 */
export function isRemoteCommune(communeName?: string, dairaName?: string): boolean {
  if (!communeName) return false;
  const c = communeName.toLowerCase();
  const d = (dairaName || "").toLowerCase();
  return Boolean(d && !c.includes(d) && !d.includes(c));
}

/**
 * Calculateur officiel des tarifs de livraison algériens
 */
export function calculateCarrierShippingRates(
  input: CalculateCarrierRateInput
): CalculateCarrierRateOutput {
  const carrierId = (input.carrierId || "yalidine").toLowerCase() as "yalidine" | "zr_express" | "maystro";
  const carrier = SUPPORTED_ALGERIAN_CARRIERS.find((c) => c.id === carrierId) || SUPPORTED_ALGERIAN_CARRIERS[0];

  const originCode = extractWilayaCode(input.originWilaya || "16");
  const destCode = extractWilayaCode(input.destWilaya || "16");
  const isIntraWilaya = originCode === destCode;

  const targetZoneIndex = isIntraWilaya ? 0 : (WILAYA_ZONE_MAPPING[destCode] ?? 3);
  const zoneTariff: CarrierPricingZone = CARRIER_ZONE_TARIFFS[targetZoneIndex] || CARRIER_ZONE_TARIFFS[2];
  const carrierZoneRates = zoneTariff[carrier.id] || zoneTariff.yalidine;

  // Calcul du poids réel vs poids volumétrique (L x l x h) / 5000 pour les articles volumineux
  const rawWeight = typeof input.weightKg === "number" && !isNaN(input.weightKg) ? input.weightKg : 1.0;
  const realWeight = Math.max(0.1, rawWeight);
  const volumetricWeight = computeVolumetricWeight(input.dimensions);
  const bulky = isBulkyCategory(input.category);
  const isVolumetricApplied = volumetricWeight > realWeight || (bulky && volumetricWeight > 0);
  const chargeableWeight = isVolumetricApplied ? Math.max(realWeight, volumetricWeight) : realWeight;

  const extraWeightKg = Math.max(0, Math.ceil(chargeableWeight - carrier.baseWeightKg));
  const isSouthZone = targetZoneIndex >= 4;
  const feePerExtraKg = isSouthZone ? carrier.extraKgFeeSouth : carrier.extraKgFeeNorth;
  const weightFee = extraWeightKg * feePerExtraKg;

  const remote = isRemoteCommune(input.destCommune, input.destDaira);
  const remoteAreaFee = remote ? 100 : 0;
  const isFree = Boolean(input.freeShipping);

  // Remise saisonnière éventuelle (ex: Ramadan, Soldes)
  const season = input.seasonId ? SEASONAL_TARIFF_PROFILES[input.seasonId] : undefined;
  const homeDiscount = season ? (carrierZoneRates.home * (season.homeDiscountPercent || 0)) / 100 : 0;
  const deskDiscount = season ? (carrierZoneRates.desk * (season.deskDiscountPercent || 0)) / 100 : 0;

  const homeBase = Math.max(0, Math.round(carrierZoneRates.home - homeDiscount));
  const homeTotal = isFree ? 0 : (homeBase + weightFee + remoteAreaFee);

  const deskBase = Math.max(0, Math.round(carrierZoneRates.desk - deskDiscount));
  const deskTotal = isFree ? 0 : (deskBase + weightFee);

  const deliveryMethod = input.deliveryMethod === "stopdesk" ? "stopdesk" : "domicile";
  const selectedFee = deliveryMethod === "stopdesk" ? deskTotal : homeTotal;

  return {
    carrier,
    origin: {
      code: originCode,
      name: input.originWilaya || `Wilaya ${originCode}`,
      daira: input.originDaira || "",
      commune: input.originCommune || ""
    },
    destination: {
      code: destCode,
      name: input.destWilaya || `Wilaya ${destCode}`,
      daira: input.destDaira || "",
      commune: input.destCommune || ""
    },
    zoneIndex: targetZoneIndex,
    zoneName: zoneTariff.name,
    isIntraWilaya,
    weightKg: chargeableWeight,
    weightDetails: {
      realWeightKg: realWeight,
      volumetricWeightKg: volumetricWeight,
      chargeableWeightKg: chargeableWeight,
      isVolumetricApplied,
      isBulkyCategory: bulky,
      dimensions: input.dimensions
    },
    homeDelivery: {
      fee: homeTotal,
      baseFee: homeBase,
      weightFee,
      remoteAreaFee,
      delay: carrierZoneRates.delay,
      available: carrier.supportsHomeDelivery
    },
    stopDeskDelivery: {
      fee: deskTotal,
      baseFee: deskBase,
      weightFee,
      remoteAreaFee: 0,
      delay: carrierZoneRates.delay,
      available: carrier.supportsStopDesk
    },
    selectedFee,
    selectedDelay: carrierZoneRates.delay,
    deliveryMethod,
    isFreeShipping: isFree
  };
}
