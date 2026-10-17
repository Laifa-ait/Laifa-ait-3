import {
  VehicleFuel,
  VehicleTransmission,
  VehiclePaperStatus,
  VehicleBodyCondition,
} from "./auto.types";

export interface ArgusEstimationInput {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuel: VehicleFuel;
  transmission: VehicleTransmission;
  paperStatus: VehiclePaperStatus;
  bodyCondition: VehicleBodyCondition;
}

export interface ArgusEstimationResult {
  minPrice: number;
  estimatedPrice: number;
  maxPrice: number;
  minPriceMillions: number;
  estimatedPriceMillions: number;
  maxPriceMillions: number;
  liquidity: "tres_elevee" | "elevee" | "moyenne" | "faible";
  liquidityLabel: string;
  averageSellingDays: number;
  paperImpactLabel: string;
  bodyImpactLabel: string;
}

// Prix de base de référence neuf/récent estimé sur le marché algérien (en DZD)
const BRAND_BASE_BENCHMARKS: Record<string, number> = {
  // Usines & Récentes
  fiat: 3200000,
  chery: 3100000,
  opel: 4200000,
  geely: 3500000,
  dfsk: 2100000,
  // Leaders
  renault: 3300000,
  peugeot: 3500000,
  volkswagen: 5200000,
  dacia: 2800000,
  hyundai: 4300000,
  kia: 4100000,
  toyota: 5600000,
  seat: 4200000,
  citroen: 3200000,
  ford: 4500000,
  // Prestige & Luxe
  "mercedes-benz": 8900000,
  bmw: 8500000,
  audi: 8200000,
  // Utilitaires & SUV
  jac: 2800000,
  jmc: 2900000,
  sokon: 1900000,
  jetour: 4100000,
  baic: 3800000,
  "great-wall": 3700000,
  haval: 4300000,
  dongfeng: 2900000,
  joyear: 2700000,
  mg: 3900000,
  bestune: 4200000,
  exeed: 5800000,
};

/**
 * Calculateur de Cote Argus Algérie (Moteur déterministe d'estimation de valeur vénale)
 */
export function calculateArgusEstimate(input: ArgusEstimationInput): ArgusEstimationResult {
  const currentYear = new Date().getFullYear();
  const brandKey = input.brand.trim().toLowerCase().replace(/[\s_]+/g, "-");
  const basePrice = BRAND_BASE_BENCHMARKS[brandKey] || 3200000;

  // 1. Dépréciation selon l'âge du véhicule
  const age = Math.max(0, currentYear - input.year);
  let ageFactor = 1.0;
  if (age === 0) ageFactor = 0.96;
  else if (age === 1) ageFactor = 0.88;
  else if (age === 2) ageFactor = 0.80;
  else if (age <= 5) ageFactor = 0.72 - (age - 3) * 0.06;
  else if (age <= 10) ageFactor = 0.55 - (age - 6) * 0.04;
  else ageFactor = Math.max(0.20, 0.38 - (age - 11) * 0.02);

  // 2. Facteur de kilométrage (Norme algérienne moyenne : 20 000 km/an)
  const expectedMileage = Math.max(15000, age * 20000);
  const mileageDiff = input.mileage - expectedMileage;
  let mileageFactor = 1.0;
  if (mileageDiff < -30000) mileageFactor = 1.08;
  else if (mileageDiff < 0) mileageFactor = 1.04;
  else if (mileageDiff > 50000) mileageFactor = 0.90;
  else if (mileageDiff > 20000) mileageFactor = 0.95;

  // 3. Facteur Carburant & Boîte
  let fuelFactor = 1.0;
  if (input.fuel === "diesel") fuelFactor = 1.04;
  if (input.fuel === "gpl") fuelFactor = 0.97;
  if (input.fuel === "hybride") fuelFactor = 1.06;
  if (input.transmission === "automatique") fuelFactor += 0.05;

  // 4. Facteur Papiers (Spécificité Marché Algérien)
  let paperFactor = 1.0;
  let paperImpactLabel = "Dossier 100% régulier (valeur nominale)";
  if (input.paperStatus === "safia") {
    paperFactor = 1.0;
    paperImpactLabel = "Carte grise Safia (+5% sur liquidité)";
  } else if (input.paperStatus === "moudjahid") {
    paperFactor = 0.90;
    paperImpactLabel = "Licence Moudjahid (-10% pour contraintes de cession)";
  } else if (input.paperStatus === "procuration") {
    paperFactor = 0.87;
    paperImpactLabel = "Vente sous procuration (-13%)";
  } else if (input.paperStatus === "en_cours") {
    paperFactor = 0.84;
    paperImpactLabel = "Dossier en cours d'immatriculation (-16%)";
  }

  // 5. Facteur Carrosserie (Sbigha 00 vs Retouches)
  let bodyFactor = 1.0;
  let bodyImpactLabel = "Tôle standard";
  if (input.bodyCondition === "origine") {
    bodyFactor = 1.06;
    bodyImpactLabel = "Peinture d'origine sans retouche (Sbigha 00 : +6%)";
  } else if (input.bodyCondition === "a_froid") {
    bodyFactor = 0.98;
    bodyImpactLabel = "Débosselage à froid léger (-2%)";
  } else if (input.bodyCondition === "retouches") {
    bodyFactor = 0.92;
    bodyImpactLabel = "Quelques retouches de carrosserie (-8%)";
  } else if (input.bodyCondition === "masque_avant") {
    bodyFactor = 0.85;
    bodyImpactLabel = "Masque avant refait (-15%)";
  } else if (input.bodyCondition === "repeinte") {
    bodyFactor = 0.80;
    bodyImpactLabel = "Voile complet / Voiture repeinte (-20%)";
  }

  // Calcul du prix médian estimé
  const rawPrice = basePrice * ageFactor * mileageFactor * fuelFactor * paperFactor * bodyFactor;
  // Arrondi au palier de 50 000 DZD
  const estimatedPrice = Math.round(rawPrice / 50000) * 50000;
  const minPrice = Math.round((estimatedPrice * 0.93) / 50000) * 50000;
  const maxPrice = Math.round((estimatedPrice * 1.07) / 50000) * 50000;

  // Calcul de la liquidité marché
  let liquidity: ArgusEstimationResult["liquidity"] = "elevee";
  let liquidityLabel = "Très recherché sur le marché algérien";
  let averageSellingDays = 12;

  const popularLeaders = ["renault", "dacia", "volkswagen", "peugeot", "hyundai", "toyota", "kia", "seat", "fiat"];
  if (popularLeaders.includes(brandKey) && input.paperStatus === "safia") {
    liquidity = "tres_elevee";
    liquidityLabel = "Véhicule extrêmement liquide (vente rapide)";
    averageSellingDays = 7;
  } else if (input.bodyCondition === "repeinte" || input.paperStatus === "en_cours") {
    liquidity = "faible";
    liquidityLabel = "Négociations plus longues prévues";
    averageSellingDays = 28;
  }

  return {
    minPrice,
    estimatedPrice,
    maxPrice,
    minPriceMillions: minPrice / 10000,
    estimatedPriceMillions: estimatedPrice / 10000,
    maxPriceMillions: maxPrice / 10000,
    liquidity,
    liquidityLabel,
    averageSellingDays,
    paperImpactLabel,
    bodyImpactLabel,
  };
}
