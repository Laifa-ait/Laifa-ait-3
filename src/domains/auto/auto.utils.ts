import {
  VehicleFuel,
  VehicleTransmission,
  VehiclePaperStatus,
  VehicleBodyCondition,
  VehiclePriceType,
} from "./auto.types";
import { getWilayaById, getWilayaDisplayName } from "./auto.wilayas";

export function formatPriceDZD(amount: number): string {
  if (isNaN(amount) || amount === 0) return "0 DZD";
  return `${amount.toLocaleString("fr-FR")} DZD`;
}

/**
 * Formatage en Millions de centimes algériens (1 Million centimes = 10 000 DZD)
 * Ex: 3 500 000 DZD -> "350 Millions"
 */
export function formatPriceMillions(amount: number): string {
  if (isNaN(amount) || amount === 0) return "0 DZD";
  const millions = amount / 10000;
  if (millions >= 1) {
    const formatted = Number.isInteger(millions) ? millions.toString() : millions.toFixed(1);
    return `${formatted} Millions`;
  }
  return `${amount.toLocaleString("fr-FR")} DZD`;
}

export interface BudgetPreset {
  id: string;
  label: string;
  minPrice?: number;
  maxPrice?: number;
}

export const BUDGET_PRESETS: readonly BudgetPreset[] = [
  { id: "sub_100m", label: "< 100M", maxPrice: 1000000 },
  { id: "100m_200m", label: "100M - 200M", minPrice: 1000000, maxPrice: 2000000 },
  { id: "200m_350m", label: "200M - 350M", minPrice: 2000000, maxPrice: 3500000 },
  { id: "plus_350m", label: "+ 350M", minPrice: 3500000 },
];

export function getWilayaNameById(id: number): string {
  const found = getWilayaById(id);
  return found ? found.name : `Wilaya ${id}`;
}

export { getWilayaById, getWilayaDisplayName };

export type VehicleBodyType =
  | "citadine"
  | "berline"
  | "suv"
  | "break"
  | "coupe"
  | "cabriolet"
  | "utilitaire";

export const BODY_TYPE_OPTIONS: readonly {
  id: VehicleBodyType;
  label: string;
  description: string;
}[] = [
  { id: "citadine", label: "Citadine", description: "Agile, économique, urbaine" },
  { id: "berline", label: "Berline", description: "Confort, routière, familiale" },
  { id: "suv", label: "SUV / 4x4", description: "Surélevé, polyvalent, tout-chemin" },
  { id: "break", label: "Break", description: "Grand volume, coffre spacieux" },
  { id: "coupe", label: "Coupé", description: "Sportif, profil racé" },
  { id: "cabriolet", label: "Cabriolet", description: "Décapotable, plein air" },
  { id: "utilitaire", label: "Utilitaire", description: "Fourgon, transport & pickup" },
];

export function formatMileage(km: number): string {
  if (isNaN(km)) return "0 km";
  return `${km.toLocaleString("fr-FR")} km`;
}

export const FUEL_LABELS: Record<VehicleFuel, string> = {
  essence: "Essence",
  diesel: "Diesel",
  gpl: "GPL",
  hybride: "Hybride",
  electrique: "Électrique",
};

export const TRANSMISSION_LABELS: Record<VehicleTransmission, string> = {
  manuelle: "Manuelle",
  automatique: "Automatique",
};

export const PAPER_STATUS_LABELS: Record<VehiclePaperStatus, { label: string; description: string }> = {
  safia: { label: "Carte grise Safia", description: "Dossier 100% en règle, cessible immédiatement" },
  moudjahid: { label: "Licence Moudjahid", description: "Véhicule sous licence avec délai légal de cession" },
  en_cours: { label: "Carte grise en cours", description: "Dossier en traitement administratif" },
  procuration: { label: "Avec procuration (Wekala)", description: "Vente sous procuration notariée" },
  autre: { label: "Autre statut", description: "Consulter la description du vendeur" },
};

export const BODY_CONDITION_LABELS: Record<VehicleBodyCondition, { label: string; badge: string }> = {
  origine: { label: "Peinture d'origine (Sbigha 00)", badge: "Zéro retouche" },
  a_froid: { label: "Débosselage à froid", badge: "À froid" },
  retouches: { label: "Quelques retouches", badge: "Retouches" },
  masque_avant: { label: "Masque avant refait", badge: "Masque avant" },
  repeinte: { label: "Voile complet / Repeinte", badge: "Repeinte" },
};

export const PRICE_TYPE_LABELS: Record<VehiclePriceType, string> = {
  fixe: "Prix fixe",
  negociable: "Négociable",
  offert: "Offert (Aataw)",
  echange: "Accepte l'échange",
};
