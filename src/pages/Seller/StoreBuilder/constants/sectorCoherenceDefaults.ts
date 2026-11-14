import {
  CustomPageSectionType,
  CustomPageTheme,
  StoreThemeSector,
} from "../../../../domains/seller/customPage.types";
import { Product } from "../../../../domains/product/product.types";
import { CategoryItem, CategoryPreset } from "./categoryPresetTypes";
import { CATEGORY_PRESETS_PART1 } from "./categoryPresetsPart1";
import { CATEGORY_PRESETS_PART2 } from "./categoryPresetsPart2";

/**
 * A10 — Source unique de vérité pour le secteur et le thème par défaut du Studio.
 */
export const DEFAULT_STUDIO_SECTOR: StoreThemeSector = "artisanat";

export const DEFAULT_STUDIO_THEME: CustomPageTheme = {
  sector: DEFAULT_STUDIO_SECTOR,
  primaryColor: "#B85B35",
  secondaryColor: "#1C2A39",
  accentColor: "#D4AF37",
  canvasColor: "#FAF6F0",
  surfaceColor: "#FFFFFF",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

function makeSectorSvgCard(label: string, bg1: string, bg2: string, accent: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/></linearGradient></defs><rect width="600" height="450" fill="url(#g)"/><circle cx="460" cy="130" r="115" fill="${accent}" fill-opacity="0.24"/><rect x="330" y="175" width="190" height="195" rx="22" fill="#FFFFFF" fill-opacity="0.12" stroke="#FFFFFF" stroke-opacity="0.22"/><text x="40" y="385" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="26" font-weight="800" opacity="0.32">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const SECTOR_HERO_DEFAULTS: Record<
  StoreThemeSector,
  { badgeText: string; title: string; subtitle: string; imageUrl: string }
> = {
  mode: {
    badgeText: "NOUVELLE COLLECTION",
    title: "Collection Prêt-à-Porter & Pièces Phares",
    subtitle: "Sélection disponible immédiatement avec livraison rapide 69 Wilayas.",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
  },
  tech: {
    badgeText: "BOUTIQUE OFFICIELLE • GARANTIE",
    title: "Équipements High-Tech & Nouveautés",
    subtitle: "Produits neufs certifiés avec paiement à la livraison dans les 69 Wilayas.",
    imageUrl: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1200&q=80",
  },
  beaute: {
    badgeText: "SOINS DERMO-COSMÉTIQUES & BEAUTÉ",
    title: "Vos Soins & Essentiels Beauté Authentiques",
    subtitle: "Produits originaux sélectionnés avec soin, livrés rapidement chez vous.",
    imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
  },
  artisanat: {
    badgeText: "BOUTIQUE OFFICIELLE",
    title: "Notre Sélection de Produits Phares",
    subtitle: "Commandez en ligne facilement avec paiement à la réception du colis.",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
  },
  maison: {
    badgeText: "MAISON & DÉCORATION",
    title: "Mobilier, Luminaires & Essentiels Maison",
    subtitle: "Des articles durables et élégants pour aménager votre intérieur.",
    imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
  },
  alimentation: {
    badgeText: "PRODUITS DU TERROIR & ÉPICERIE FINE",
    title: "Saveurs Naturelles & Produits Sélectionnés",
    subtitle: "Qualité garantie et fraîcheur préservée jusqu'à la livraison.",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
  },
  sport: {
    badgeText: "SPORT, FITNESS & PERFORMANCE",
    title: "Équipements & Tenues de Sport Pro",
    subtitle: "Matériel haute résistance disponible avec expédition rapide.",
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
  },
  accessoires: {
    badgeText: "MONTRES, SACS & ACCESSOIRES",
    title: "Sélection Maroquinerie & Accessoires",
    subtitle: "Articles vérifiés avant expédition et livrés en coffret protégé.",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
  },
  enfants: {
    badgeText: "UNIVERS BÉBÉS & ENFANTS",
    title: "Vêtements, Puériculture & Éveil",
    subtitle: "Articles doux et certifiés pour le confort quotidien des enfants.",
    imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1200&q=80",
  },
};

export const SECTOR_EXTRA_CATEGORY_PRESETS: Record<
  "maison" | "sport" | "accessoires" | "enfants",
  CategoryPreset
> = {
  maison: {
    id: "maison_interieur", name: "Maison, Mobilier & Décoration",
    description: "Grille Bento chaleureuse pour mobilier, luminaires, tapis et art de la table",
    icon: "Home", tag: "Maison & Déco", sector: "maison",
    settings: {
      title: "Rayons Maison & Art de Vivre", subtitle: "Aménagez chaque pièce avec des matières durables et chaleureuses",
      layout: "bento", aspectRatio: "4/5", borderRadius: "lg", hoverEffect: "zoom",
      textPosition: "overlay-bottom", textTransform: "none", overlayOpacity: 40,
      glassmorphism: false, showBadge: true, showItemCount: true, showIcon: false, gapSize: "normal",
      categories: [
        { id: "cat_ma1", name: "Salon, Fauteuils & Tables", subtitle: "Bois noble & tissus doux", slug: "salon-mobilier", imageUrl: makeSectorSvgCard("SALON", "#292524", "#57534E", "#D97706"), badge: "Phare", badgeColor: "#D97706", itemCount: 24, colSpan: 2 },
        { id: "cat_ma2", name: "Luminaires & Ambiance", subtitle: "Suspensions & lampes", slug: "luminaires", imageUrl: makeSectorSvgCard("LUMINAIRES", "#44403C", "#78350F", "#F59E0B"), badge: "Chaleureux", badgeColor: "#92400E", itemCount: 18, colSpan: 1 },
        { id: "cat_ma3", name: "Linge de Maison & Tapis", subtitle: "Coton lavé & tissages", slug: "linge-tapis", imageUrl: makeSectorSvgCard("TEXTILES", "#1C1917", "#44403C", "#D97706"), badge: "Confort", badgeColor: "#B45309", itemCount: 32, colSpan: 1 },
        { id: "cat_ma4", name: "Art de la Table & Cuisine", subtitle: "Vaisselle & accessoires", slug: "art-table", imageUrl: makeSectorSvgCard("ART DE TABLE", "#57534E", "#292524", "#F59E0B"), badge: "Nouveau", badgeColor: "#059669", itemCount: 29, colSpan: 1 },
      ],
    },
  },
  sport: {
    id: "sport_performance", name: "Sport, Fitness & Outdoor",
    description: "Grille dynamique haute lisibilité pour équipements sportifs, musculation et running",
    icon: "Activity", tag: "Sport & Training", sector: "sport",
    settings: {
      title: "Rayons Sport & Performance", subtitle: "Équipements, tenues techniques et accessoires pour dépasser vos objectifs",
      layout: "bento", aspectRatio: "4/5", borderRadius: "md", hoverEffect: "lift",
      textPosition: "overlay-bottom", textTransform: "uppercase", overlayOpacity: 45,
      glassmorphism: false, showBadge: true, showItemCount: true, showIcon: false, gapSize: "normal",
      categories: [
        { id: "cat_sp1", name: "Tenues Training & Running", subtitle: "Textiles respirants Pro", slug: "tenues-training", imageUrl: makeSectorSvgCard("TRAINING", "#0F172A", "#1E293B", "#F97316"), badge: "Performance", badgeColor: "#EA580C", itemCount: 36, colSpan: 2 },
        { id: "cat_sp2", name: "Musculation & Home Gym", subtitle: "Haltères, bancs & bandes", slug: "musculation", imageUrl: makeSectorSvgCard("HOME GYM", "#1E293B", "#334155", "#FB923C"), badge: "Robuste", badgeColor: "#2563EB", itemCount: 22, colSpan: 1 },
        { id: "cat_sp3", name: "Chaussures & Running", subtitle: "Amorti & stabilité", slug: "chaussures-sport", imageUrl: makeSectorSvgCard("RUNNING", "#090D16", "#1E3A8A", "#38BDF8"), badge: "Top Ventes", badgeColor: "#10B981", itemCount: 28, colSpan: 1 },
        { id: "cat_sp4", name: "Sacs, Gourdes & Accessoires", subtitle: "Hydratation & mobilité", slug: "accessoires-sport", imageUrl: makeSectorSvgCard("GEAR", "#18181B", "#27272A", "#F97316"), badge: "Essentiel", badgeColor: "#EA580C", itemCount: 19, colSpan: 1 },
      ],
    },
  },
  accessoires: {
    id: "accessoires_signature", name: "Maroquinerie, Montres & Bijoux",
    description: "Écrin éditorial élégant pour sacs, montres, lunettes et accessoires de prestige",
    icon: "Watch", tag: "Accessoires Chic", sector: "accessoires",
    settings: {
      title: "Collections Maroquinerie & Accessoires", subtitle: "Les pièces signatures qui subliment votre allure au quotidien",
      layout: "bento", aspectRatio: "4/5", borderRadius: "lg", hoverEffect: "zoom",
      textPosition: "overlay-bottom", textTransform: "none", overlayOpacity: 40,
      glassmorphism: true, showBadge: true, showItemCount: true, showIcon: false, gapSize: "normal",
      categories: [
        { id: "cat_ac_1", name: "Sacs & Petite Maroquinerie", subtitle: "Cuir véritable & finitions soignées", slug: "sacs-maroquinerie", imageUrl: makeSectorSvgCard("MAROQUINERIE", "#18181B", "#27272A", "#CA8A04"), badge: "Signature", badgeColor: "#854D0E", itemCount: 31, colSpan: 2 },
        { id: "cat_ac_2", name: "Montres & Garde-Temps", subtitle: "Précision & bracelet acier/cuir", slug: "montres", imageUrl: makeSectorSvgCard("HORLOGERIE", "#27272A", "#3F3F46", "#D4AF37"), badge: "Coffret Inclus", badgeColor: "#CA8A04", itemCount: 24, colSpan: 1 },
        { id: "cat_ac_3", name: "Lunettes & Solaire", subtitle: "Protection UV400 & montures", slug: "lunettes", imageUrl: makeSectorSvgCard("OPTIQUE", "#09090B", "#18181B", "#A16207"), badge: "Tendance", badgeColor: "#2563EB", itemCount: 18, colSpan: 1 },
        { id: "cat_ac_4", name: "Bijoux & Parures", subtitle: "Acier inoxydable & argent", slug: "bijoux", imageUrl: makeSectorSvgCard("BIJOUX", "#292524", "#1C1917", "#EAB308"), badge: "Idée Cadeau", badgeColor: "#E11D48", itemCount: 40, colSpan: 1 },
      ],
    },
  },
  enfants: {
    id: "enfants_eveil", name: "Univers Enfants, Bébés & Éveil",
    description: "Présentation douce et rassurante pour vêtements enfants, puériculture et jouets éducatifs",
    icon: "Smile", tag: "Enfants & Bébés", sector: "enfants",
    settings: {
      title: "Rayons Enfants, Bébés & Éveil", subtitle: "Des matières douces et des articles sûrs pour accompagner chaque âge",
      layout: "grid", aspectRatio: "1/1", borderRadius: "lg", hoverEffect: "lift",
      textPosition: "below", textTransform: "none", overlayOpacity: 20,
      glassmorphism: false, showBadge: true, showItemCount: true, showIcon: false, gapSize: "normal",
      categories: [
        { id: "cat_kd1", name: "Bébés & Puériculture (0-24 mois)", subtitle: "Coton bio & trousseau naissance", slug: "bebes-puericulture", imageUrl: makeSectorSvgCard("BÉBÉS", "#1E3A8A", "#0284C7", "#38BDF8"), badge: "Douceur", badgeColor: "#0284C7", itemCount: 28, colSpan: 1 },
        { id: "cat_kd2", name: "Mode Fille & Garçon (2-12 ans)", subtitle: "Tenues confortables & résistantes", slug: "mode-enfants", imageUrl: makeSectorSvgCard("MODE ENFANT", "#0284C7", "#0369A1", "#F59E0B"), badge: "Nouvelle Collection", badgeColor: "#F59E0B", itemCount: 45, colSpan: 1 },
        { id: "cat_kd3", name: "Jouets d'Éveil & Éducatifs", subtitle: "Montessori, bois & créativité", slug: "jouets-eveil", imageUrl: makeSectorSvgCard("ÉVEIL", "#0F766E", "#0D9488", "#FBBF24"), badge: "Éducatif", badgeColor: "#10B981", itemCount: 34, colSpan: 1 },
        { id: "cat_kd4", name: "Chambre Enfant & Rangement", subtitle: "Veilleuses, parures & déco", slug: "chambre-enfant", imageUrl: makeSectorSvgCard("CHAMBRE", "#312E81", "#4338CA", "#38BDF8"), badge: "Pratique", badgeColor: "#6366F1", itemCount: 19, colSpan: 1 },
      ],
    },
  },
};

export function getSectorCategoryPreset(sector: StoreThemeSector = DEFAULT_STUDIO_SECTOR): CategoryPreset {
  if (sector === "tech") return CATEGORY_PRESETS_PART1[1];
  if (sector === "beaute") return CATEGORY_PRESETS_PART1[2];
  if (sector === "artisanat") return CATEGORY_PRESETS_PART2[0];
  if (sector === "alimentation") return CATEGORY_PRESETS_PART2[3];
  if (sector === "maison") return SECTOR_EXTRA_CATEGORY_PRESETS.maison;
  if (sector === "sport") return SECTOR_EXTRA_CATEGORY_PRESETS.sport;
  if (sector === "accessoires") return SECTOR_EXTRA_CATEGORY_PRESETS.accessoires;
  if (sector === "enfants") return SECTOR_EXTRA_CATEGORY_PRESETS.enfants;
  return CATEGORY_PRESETS_PART1[0];
}

export function buildSectorAwareSectionDefaults(
  type: CustomPageSectionType,
  baseSettings: Record<string, unknown> = {},
  sector: StoreThemeSector = DEFAULT_STUDIO_SECTOR,
  storeWilaya = "Alger",
  products: Product[] = []
): Record<string, unknown> {
  const preset = getSectorCategoryPreset(sector);
  const heroDef = SECTOR_HERO_DEFAULTS[sector] || SECTOR_HERO_DEFAULTS[DEFAULT_STUDIO_SECTOR];

  if (type === "hero_banner") {
    return {
      ...baseSettings, badgeText: heroDef.badgeText, title: heroDef.title, subtitle: heroDef.subtitle,
      imageUrl: (baseSettings.imageUrl as string) || heroDef.imageUrl,
      ctaText: (baseSettings.ctaText as string) || "Explorer la Collection",
      ctaLink: (baseSettings.ctaLink as string) || "#catalog",
    };
  }
  if (type === "featured_categories") {
    return { ...baseSettings, ...preset.settings, activePresetId: preset.id, categories: preset.settings.categories.map((c) => ({ ...c })) };
  }
  if (type === "curated_collections") {
    const sampleIds = products.slice(0, 3).map((p) => p.id);
    return {
      ...baseSettings, title: preset.settings.title || "Nos *Collections* {Signature}",
      collections: preset.settings.categories.slice(0, 3).map((cat, idx) => ({
        id: `col_${sector}_${idx + 1}`, title: cat.name,
        imageUrl: cat.imageUrl || products[idx]?.images?.[0] || products[idx]?.image || "",
        productIds: sampleIds,
      })),
    };
  }
  if (type === "featured_products" || type === "new_arrivals" || type === "best_sellers" || type === "product_grid") {
    const isSquare = sector === "tech" || sector === "beaute" || sector === "alimentation" || sector === "enfants";
    return {
      ...baseSettings, cardAspectRatio: isSquare ? "1/1" : "4/5",
      cardStyle: sector === "mode" || sector === "accessoires" ? "elevated" : "modern",
      columnsDesktop: 4, showStockBadge: true,
    };
  }
  if (type === "delivery_info") {
    return {
      ...baseSettings, title: "Livraison Rapide sur les {69 Wilayas}", defaultTimeframe: "24h à 72h selon la Wilaya",
      stopDeskPrice: 400, homeDeliveryPrice: 600, freeShippingAbove: 10000,
      customTariffs: [
        { wilayaName: "16 - Alger & Blida", estimatedDays: "24h", priceDZD: 400, homeDeliveryAvailable: true },
        { wilayaName: "Oran, Constantine, Sétif", estimatedDays: "24h - 48h", priceDZD: 500, homeDeliveryAvailable: true },
        { wilayaName: "Sud & Autres Wilayas (69)", estimatedDays: "48h - 72h", priceDZD: 650, homeDeliveryAvailable: true },
      ],
    };
  }
  if (type === "contact_footer") {
    const wilaya = (storeWilaya || "").trim();
    return {
      ...baseSettings,
      title: (baseSettings.title as string) || "Service Client & Contact",
      wilaya: (baseSettings.wilaya as string) ?? wilaya,
      address: (baseSettings.address as string) ?? (wilaya ? `${wilaya}, Algérie` : ""),
      shopPhone: (baseSettings.shopPhone as string) ?? "",
      shopEmail: (baseSettings.shopEmail as string) ?? "",
      workingHours: (baseSettings.workingHours as string) || "Samedi au Jeudi de 09h00 à 18h00",
    };
  }
  return { ...baseSettings };
}

export function getSectorCategoriesForArchetype(sector: StoreThemeSector): CategoryItem[] {
  return getSectorCategoryPreset(sector).settings.categories.map((c) => ({ ...c }));
}

export const getSectorPresetCategories = getSectorCategoriesForArchetype;
