import { ArtisanProfile } from "./artisan";

export type ArtisanAdFormat =
  | "lsa_top_rank"
  | "urgency_spotlight"
  | "contextual_material_ad"
  | "in_feed_native_banner"
  | "broadcast_priority";

export type ArtisanAdBillingModel = "flat_pack" | "cpc" | "cpl" | "cpm";

export type ArtisanAdStatus =
  | "pending_payment"
  | "active"
  | "paused"
  | "ended"
  | "rejected";

export type ArtisanAdOwnerType = "artisan" | "external_brand" | "olmart_store";

export interface ArtisanAdPack {
  id: string;
  name: string;
  format: ArtisanAdFormat;
  durationDays: number;
  priceDzd: number;
  tierWeight: number;
  tagline: string;
  benefits: string[];
  popular?: boolean;
}

export interface ArtisanAdCampaign {
  id: string;
  ownerType: ArtisanAdOwnerType;
  ownerUserId: string;
  artisanId?: string;
  advertiserName: string;
  format: ArtisanAdFormat;
  billingModel: ArtisanAdBillingModel;
  status: ArtisanAdStatus;
  packId?: string;
  title: string;
  description: string;
  ctaLabel: string;
  targetUrl?: string;
  imageUrl?: string;
  targetTrades: string[];
  targetWilayas: string[];
  budgetDzd: number;
  spentDzd: number;
  unitPriceDzd?: number;
  tierWeight: number;
  qualityScore: number;
  adRankScore: number;
  impressions: number;
  clicks: number;
  leadsCount: number;
  paymentReference?: string;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArtisanSponsoredLsaItem {
  campaign: ArtisanAdCampaign;
  artisan: ArtisanProfile;
}

export interface ArtisanSponsoredFeedResponse {
  lsaArtisans: ArtisanSponsoredLsaItem[];
  contextualAds: ArtisanAdCampaign[];
  inFeedBanners: ArtisanAdCampaign[];
  boostedArtisanIds: Record<
    string,
    {
      campaignId: string;
      format: ArtisanAdFormat;
      label: string;
    }
  >;
}

export interface CreateArtisanBoostPayload {
  packId: string;
  targetWilayas: string[];
  headline?: string;
  paymentReference?: string;
}

export interface AdminCreateSponsorAdPayload {
  ownerType: "external_brand" | "olmart_store";
  advertiserName: string;
  format: "contextual_material_ad" | "in_feed_native_banner";
  billingModel: ArtisanAdBillingModel;
  title: string;
  description: string;
  ctaLabel: string;
  targetUrl: string;
  imageUrl?: string;
  targetTrades: string[];
  targetWilayas: string[];
  budgetDzd: number;
  unitPriceDzd?: number;
  durationDays: number;
}

export interface ArtisanAdsAdminSummary {
  totalRevenueDzd: number;
  pendingRevenueDzd: number;
  activeCampaignsCount: number;
  pendingPaymentCount: number;
  totalImpressions: number;
  totalClicks: number;
  avgCtrPercent: number;
  totalLeads: number;
}

export interface ArtisanQualityBreakdown {
  score: number;
  items: Array<{
    key: string;
    label: string;
    points: number;
    maxPoints: number;
    completed: boolean;
  }>;
}

export const INDIVIDUAL_ARTISAN_AD_PACKS: ArtisanAdPack[] = [
  {
    id: "urgency_24h",
    name: "Boost Urgence 24h",
    format: "urgency_spotlight",
    durationDays: 1,
    priceDzd: 250,
    tierWeight: 1.35,
    tagline: "Idéal pour remplir votre journée immédiatement",
    benefits: [
      "Affichage prioritaire sur le filtre « Disponible / Urgence »",
      "Badge discret « Sponsorisé · Dispo aujourd'hui »",
      "Aucun registre de commerce requis",
    ],
  },
  {
    id: "lsa_express_3d",
    name: "Top Local 3 Jours",
    format: "lsa_top_rank",
    durationDays: 3,
    priceDzd: 500,
    tierWeight: 1.15,
    tagline: "Testez les appels clients dans votre wilaya à petit prix",
    benefits: [
      "Apparition dans le bloc Top 3 Sponsorisé de votre métier",
      "Classement dopé par votre Score de Qualité",
      "Statistiques vues, clics et demandes en direct",
    ],
  },
  {
    id: "lsa_week_7d",
    name: "Pack Wilaya 7 Jours",
    format: "lsa_top_rank",
    durationDays: 7,
    priceDzd: 1200,
    tierWeight: 1.45,
    popular: true,
    tagline: "Le meilleur équilibre coût / appels pour un artisan indépendant",
    benefits: [
      "Top 3 Sponsorisé sur votre métier et jusqu'à 2 wilayas",
      "Priorité sur le fil des annonces de chantiers clients",
      "Pause et reprise en 1 clic depuis votre tableau de bord",
    ],
  },
  {
    id: "lsa_month_30d",
    name: "Présence Locale 30 Jours",
    format: "lsa_top_rank",
    durationDays: 30,
    priceDzd: 3500,
    tierWeight: 1.65,
    tagline: "Visibilité continue tout le mois au tarif le plus bas par jour",
    benefits: [
      "Top 3 Sponsorisé continu + priorité chantiers clients",
      "Couverture multi-wilayas (jusqu'à 3 wilayas voisines)",
      "Suivi complet du coût par demande de devis",
    ],
  },
];
