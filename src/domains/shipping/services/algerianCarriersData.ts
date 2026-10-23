/**
 * Données publiques des compagnies de livraison algériennes et matrices tarifaires
 * issues de l'analyse des grilles publiques en ligne (sans clés API privées).
 * Version des barèmes : 2026.10 (Support révision saisonnière Ramadan & Soldes)
 */

import { WILAYA_ZONE_MAPPING } from "./carrierZoneMapping";

export { WILAYA_ZONE_MAPPING };

export const LAST_UPDATED_TARIFFS_DATE = "2026-10-18";
export const CURRENT_TARIFF_VERSION = "2026.10-PUBLIC";

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

export interface SeasonalTariffProfile {
  seasonId: "standard" | "ramadan" | "soldes" | "black_friday";
  label: string;
  description: string;
  active: boolean;
  homeDiscountPercent?: number;
  deskDiscountPercent?: number;
}

/**
 * Catégories très volumineuses soumises au calcul volumétrique (L x l x h) / 5000
 */
export const BULKY_PRODUCT_CATEGORIES = [
  "canape",
  "canapé",
  "fauteuil",
  "meubles",
  "mobilier",
  "literie",
  "matelas",
  "gros electromenager",
  "gros électroménager",
  "electromenager",
  "électroménager",
  "refrigerateur",
  "réfrigérateur",
  "lave-linge",
  "machine à laver",
  "cuisiniere",
  "cuisinière",
  "climatiseur",
  "televiseur",
  "téléviseur"
];

/**
 * Profils saisonniers activables (Ramadan, Soldes d'été, Black Friday)
 */
export const SEASONAL_TARIFF_PROFILES: Record<string, SeasonalTariffProfile> = {
  standard: {
    seasonId: "standard",
    label: "Tarifs Standard Publics",
    description: "Grille officielle continue 2026",
    active: true,
    homeDiscountPercent: 0,
    deskDiscountPercent: 0
  },
  ramadan: {
    seasonId: "ramadan",
    label: "Promotion Spéciale Ramadan Kareem",
    description: "Réduction saisonnière sur Stop Desk et livraisons gourmandes",
    active: false,
    homeDiscountPercent: 5,
    deskDiscountPercent: 10
  },
  soldes: {
    seasonId: "soldes",
    label: "Soldes Nationales d'Été",
    description: "Frais réduits pour booster les commandes inter-wilayas",
    active: false,
    homeDiscountPercent: 10,
    deskDiscountPercent: 15
  }
};

/**
 * Compagnies qui publient leurs grilles tarifaires en ligne
 */
export const SUPPORTED_ALGERIAN_CARRIERS: AlgerianCarrierInfo[] = [
  {
    id: "yalidine",
    name: "Yalidine Express",
    nameAr: "ياليدين إكسبريس",
    badge: "Yalidine",
    website: "https://yalidine-express.com.dz",
    phone: "0982 40 40 40",
    hasOnlinePricing: true,
    supportsHomeDelivery: true,
    supportsStopDesk: true,
    baseWeightKg: 5,
    extraKgFeeNorth: 50,
    extraKgFeeSouth: 100,
    description: "Leader national avec couverture complète des 58/69 wilayas, livraison à domicile et réseau de plus de 150 agences Stop Desk."
  },
  {
    id: "zr_express",
    name: "ZR Express",
    nameAr: "زد آر إكسبريس",
    badge: "ZR Express",
    website: "https://zrexpress.dz",
    phone: "0770 12 12 12",
    hasOnlinePricing: true,
    supportsHomeDelivery: true,
    supportsStopDesk: true,
    baseWeightKg: 5,
    extraKgFeeNorth: 50,
    extraKgFeeSouth: 100,
    description: "Réseau national de messagerie e-commerce, livraison porte-à-porte 54 wilayas et 77 agences bureaux relais Stop Desk."
  },
  {
    id: "maystro",
    name: "Maystro Delivery",
    nameAr: "مايسترو دليفري",
    badge: "Maystro",
    website: "https://maystro-delivery.com",
    phone: "0982 20 20 20",
    hasOnlinePricing: true,
    supportsHomeDelivery: true,
    supportsStopDesk: true,
    baseWeightKg: 5,
    extraKgFeeNorth: 50,
    extraKgFeeSouth: 100,
    description: "Plateforme technologique de livraison rapide urbaine et inter-wilayas avec suivi en temps réel et option Stop Desk."
  }
];

/**
 * Compagnies analysées ne communiquant PAS de grille tarifaire publique en libre accès
 */
export const CARRIERS_WITHOUT_ONLINE_PRICING: CarrierWithoutOnlinePricing[] = [
  {
    id: "procolis",
    name: "Procolis",
    nameAr: "بروكوليس",
    website: "https://procolis.com",
    reason: "Grille tarifaire non publiée en libre accès : accessible uniquement via devis personnalisé ou compte pro privé."
  },
  {
    id: "kazitour",
    name: "Kazitour Express",
    nameAr: "كازيتور إكسبريس",
    website: "https://kazi-tour.com",
    reason: "Tarification de messagerie sur devis physique en agence (à partir de 200 DA) selon volume, sans matrice wilaya publique."
  },
  {
    id: "nord_sud",
    name: "Nord & Sud Livraison",
    nameAr: "شمال وجنوب",
    reason: "Tarifs réservés aux partenaires contractuels sous convention entreprise."
  }
];

/**
 * Grille tarifaire de base (par zone de destination) pour les colis jusqu'à 5 kg
 */
export const CARRIER_ZONE_TARIFFS: Record<number, CarrierPricingZone> = {
  0: {
    zoneIndex: 0,
    name: "Intra-Wilaya (Même Wilaya)",
    yalidine: { home: 600, desk: 350, delay: "24h" },
    zr_express: { home: 550, desk: 400, delay: "24h" },
    maystro: { home: 550, desk: 350, delay: "24h" }
  },
  1: {
    zoneIndex: 1,
    name: "Centre (Alger, Blida, Boumerdès, Tipaza)",
    yalidine: { home: 650, desk: 400, delay: "24-48h" },
    zr_express: { home: 650, desk: 450, delay: "24-48h" },
    maystro: { home: 600, desk: 400, delay: "24-48h" }
  },
  2: {
    zoneIndex: 2,
    name: "Nord Métropoles (Oran, Constantine, Sétif, Annaba...)",
    yalidine: { home: 750, desk: 450, delay: "24-48h" },
    zr_express: { home: 750, desk: 500, delay: "24-48h" },
    maystro: { home: 700, desk: 450, delay: "24-48h" }
  },
  3: {
    zoneIndex: 3,
    name: "Nord & Côtes Élargies (Tlemcen, Béjaïa, Skikda, Batna...)",
    yalidine: { home: 850, desk: 500, delay: "48h" },
    zr_express: { home: 800, desk: 520, delay: "48h" },
    maystro: { home: 750, desk: 500, delay: "48h" }
  },
  4: {
    zoneIndex: 4,
    name: "Hauts Plateaux & Portes du Sud (Djelfa, Biskra, M'Sila, Tébessa...)",
    yalidine: { home: 950, desk: 650, delay: "48-72h" },
    zr_express: { home: 950, desk: 700, delay: "48-72h" },
    maystro: { home: 850, desk: 650, delay: "48-72h" }
  },
  5: {
    zoneIndex: 5,
    name: "Sud Oasien (Ghardaïa, Ouargla, Béchar, Touggourt...)",
    yalidine: { home: 1100, desk: 800, delay: "48-96h" },
    zr_express: { home: 1200, desk: 850, delay: "48-96h" },
    maystro: { home: 950, desk: 750, delay: "48-96h" }
  },
  6: {
    zoneIndex: 6,
    name: "Grand Sud (Tamanrasset, Adrar, Tindouf, Illizi, Djanet...)",
    yalidine: { home: 1600, desk: 1050, delay: "3-5 jours" },
    zr_express: { home: 1600, desk: 1120, delay: "3-5 jours" },
    maystro: { home: 1600, desk: 1100, delay: "3-5 jours" }
  }
};
