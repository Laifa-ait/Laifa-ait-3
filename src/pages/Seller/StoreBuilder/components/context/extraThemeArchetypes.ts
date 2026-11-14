import { MasterThemeArchetype } from "./themeArchetypes";
import { StoreThemeSector } from "../../../../../domains/seller/customPage.types";
import { getSectorCategoryPreset } from "../../constants/sectorCoherenceDefaults";

function buildQuickBannerSvg(bg1: string, bg2: string, accent: string, title: string, sub: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 650" width="1200" height="650"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/></linearGradient></defs><rect width="1200" height="650" fill="url(#g)"/><circle cx="960" cy="325" r="240" fill="${accent}" opacity="0.16"/><text x="90" y="290" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="52" font-weight="800">${title}</text><text x="90" y="350" fill="rgba(255,255,255,0.82)" font-family="Plus Jakarta Sans, sans-serif" font-size="22" font-weight="500">${sub}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createUniverseArchetype(cfg: {
  id: string;
  name: string;
  tagline: string;
  sector: StoreThemeSector;
  badge: string;
  bg1: string;
  bg2: string;
  primary: string;
  secondary: string;
  accent: string;
  canvas: string;
  font: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  heroVariant: string;
  deliveryTitle: string;
}): MasterThemeArchetype {
  const thumb = buildQuickBannerSvg(cfg.bg1, cfg.bg2, cfg.accent, cfg.name.toUpperCase(), cfg.tagline);
  const sectorPreset = getSectorCategoryPreset(cfg.sector);
  const isSquareCard = cfg.sector === "alimentation" || cfg.sector === "enfants";

  return {
    id: cfg.id,
    name: cfg.name,
    tagline: cfg.tagline,
    sector: cfg.sector,
    badge: cfg.badge,
    layoutPreviewType: "editorial",
    thumbnailUrl: thumb,
    features: [
      "Palette Métier Dédiée",
      "Rayons Spécialisés Inclus",
      "Grille Produits Optimisée",
      "Livraison 69 Wilayas",
    ],
    theme: {
      sector: cfg.sector,
      primaryColor: cfg.primary,
      secondaryColor: cfg.secondary,
      accentColor: cfg.accent,
      accentBadgeColor: cfg.primary,
      canvasColor: cfg.canvas,
      surfaceColor: "#FFFFFF",
      fontFamily: cfg.font,
      borderRadiusPx: 14,
      spacingYPx: 28,
      titleFontSizePx: 32,
      bodyFontSizePx: 15,
    },
    generateSections: (customHeroImageUrl?: string) => {
      const ts = Date.now();
      return [
        {
          id: `sec_hero_${ts}_0`,
          type: "hero_banner",
          title: `Bannière ${cfg.name}`,
          isVisible: true,
          order: 0,
          styles: { borderRadius: "md", paddingY: "lg", containerWidth: "contained" },
          settings: {
            heroVariant: cfg.heroVariant,
            heroLayout: "editorial-split",
            title: cfg.heroTitle,
            subtitle: cfg.heroSubtitle,
            badgeText: cfg.heroBadge,
            imageUrl: customHeroImageUrl || thumb,
            imageAlt: cfg.name,
            ctaText: "Découvrir le Catalogue",
            ctaLink: "#catalog",
            ctaStyle: "solid",
            overlayOpacity: 28,
            textAlignment: "left",
          },
        },
        {
          id: `sec_cats_${ts}_1`,
          type: "featured_categories",
          title: sectorPreset.settings.title,
          isVisible: true,
          order: 1,
          styles: { borderRadius: "md", paddingY: "md", containerWidth: "contained" },
          settings: {
            ...sectorPreset.settings,
            activePresetId: sectorPreset.id,
            categories: sectorPreset.settings.categories.map((c) => ({ ...c })),
          },
        },
        {
          id: `sec_feed_${ts}_2`,
          type: "featured_products",
          title: `Sélection ${cfg.name}`,
          isVisible: true,
          order: 2,
          styles: { borderRadius: "md", paddingY: "lg", containerWidth: "contained" },
          settings: {
            title: "Nos Articles Phares",
            subtitle: "Disponibilité immédiate en stock avec livraison 69 Wilayas",
            productIds: [],
            layout: "grid",
            columnsDesktop: 4,
            cardStyle: cfg.sector === "accessoires" ? "elevated" : "modern",
            cardAspectRatio: isSquareCard ? "1/1" : "4/5",
            showStockBadge: true,
            showCtaButton: false,
            showWishlistButton: true,
            showRatingStars: true,
          },
        },
        {
          id: `sec_trust_${ts}_3`,
          type: "delivery_info",
          title: "Livraison & Garanties 69 Wilayas",
          isVisible: true,
          order: 3,
          styles: { borderRadius: "md", paddingY: "md", containerWidth: "contained" },
          settings: {
            title: cfg.deliveryTitle,
            defaultTimeframe: "Expédition rapide en 24h à 72h (Domicile & Stop-Desk)",
            stopDeskPrice: 400,
            homeDeliveryPrice: 600,
            freeShippingAbove: 10000,
            customTariffs: [
              { wilayaName: "Alger, Blida, Tipaza", estimatedDays: "24h", priceDZD: 400, homeDeliveryAvailable: true },
              { wilayaName: "Oran, Constantine, Sétif", estimatedDays: "24h - 48h", priceDZD: 500, homeDeliveryAvailable: true },
              { wilayaName: "Toutes les 69 Wilayas", estimatedDays: "48h - 72h", priceDZD: 650, homeDeliveryAvailable: true },
            ],
          },
        },
      ];
    },
  };
}

export const EXTRA_UNIVERSE_ARCHETYPES: MasterThemeArchetype[] = [
  createUniverseArchetype({
    id: "maison-decor",
    name: "Intérieur & Décoration Contemporaine",
    tagline: "Mobilier, luminaires et linge de maison dans une ambiance chaleureuse",
    sector: "maison",
    badge: "09 · Maison & Décoration",
    bg1: "#292524",
    bg2: "#57534E",
    primary: "#92400E",
    secondary: "#292524",
    accent: "#D97706",
    canvas: "#FAF8F5",
    font: "'Plus Jakarta Sans', sans-serif",
    heroTitle: "SUBLIMEZ CHAQUE PIÈCE DE VOTRE INTÉRIEUR",
    heroSubtitle: "Mobilier durable, luminaires chaleureux et décoration livrés sur 69 Wilayas.",
    heroBadge: "COLLECTION MAISON",
    heroVariant: "minimalist",
    deliveryTitle: "Emballage Renforcé & Livraison Maison 69 Wilayas",
  }),
  createUniverseArchetype({
    id: "terroir-gourmet",
    name: "Épicerie Fine & Terroir Algérien",
    tagline: "Huile d'olive, dattes Deglet Nour, miels purs et produits gourmets certifiés",
    sector: "alimentation",
    badge: "10 · Alimentation & Terroir",
    bg1: "#14532D",
    bg2: "#166534",
    primary: "#166534",
    secondary: "#14532D",
    accent: "#CA8A04",
    canvas: "#F9FBF7",
    font: "'DM Sans', sans-serif",
    heroTitle: "SAVEURS AUTHENTIQUES & PRODUITS DU TERROIR",
    heroSubtitle: "Sélection rigoureuse de miels, huiles d'olive, dattes et spécialités gourmandes.",
    heroBadge: "100% NATUREL & CONTRÔLÉ",
    heroVariant: "promo-commercial",
    deliveryTitle: "Conditionnement Frais & Expédition 69 Wilayas",
  }),
  createUniverseArchetype({
    id: "athletic-pulse",
    name: "Performance Sport & Fitness",
    tagline: "Équipements sportifs, vêtements d'entraînement et nutrition avec design dynamique",
    sector: "sport",
    badge: "11 · Sport & Fitness",
    bg1: "#0F172A",
    bg2: "#1E293B",
    primary: "#EA580C",
    secondary: "#0F172A",
    accent: "#F97316",
    canvas: "#F8FAFC",
    font: "'Outfit', sans-serif",
    heroTitle: "ÉQUIPEMENTS SPORTIFS & TENUES DE PERFORMANCE",
    heroSubtitle: "Conçus pour l'endurance, la salle et l'outdoor avec livraison rapide 69 Wilayas.",
    heroBadge: "COLLECTION TRAINING",
    heroVariant: "promo-commercial",
    deliveryTitle: "Expédition Express Équipements Sport 69 Wilayas",
  }),
  createUniverseArchetype({
    id: "signature-accessories",
    name: "Maroquinerie, Montres & Accessoires",
    tagline: "Sacs, lunettes, montres et bijoux présentés dans un écrin éditorial soigné",
    sector: "accessoires",
    badge: "12 · Accessoires & Maroquinerie",
    bg1: "#18181B",
    bg2: "#27272A",
    primary: "#854D0E",
    secondary: "#18181B",
    accent: "#CA8A04",
    canvas: "#FAF9F6",
    font: "'Playfair Display', serif",
    heroTitle: "MAROQUINERIE, MONTRES & ACCESSOIRES D'ALLURE",
    heroSubtitle: "La touche finale qui signe votre style, expédiée en coffret protégé.",
    heroBadge: "SÉLECTION ACCESSOIRES",
    heroVariant: "fashion-elegant",
    deliveryTitle: "Livraison en Coffret Protégé sur 69 Wilayas",
  }),
  createUniverseArchetype({
    id: "kids-wonder",
    name: "Univers Enfants, Bébés & Éveil",
    tagline: "Vêtements doux, jouets éducatifs et puériculture dans une palette rassurante",
    sector: "enfants",
    badge: "13 · Enfants & Puériculture",
    bg1: "#1E3A8A",
    bg2: "#0284C7",
    primary: "#0284C7",
    secondary: "#1E3A8A",
    accent: "#F59E0B",
    canvas: "#F8FAFC",
    font: "'Plus Jakarta Sans', sans-serif",
    heroTitle: "TOUT POUR L'ÉVEIL & LE CONFORT DES ENFANTS",
    heroSubtitle: "Coton doux, jouets d'éveil et articles de puériculture sélectionnés avec soin.",
    heroBadge: "SPÉCIAL ENFANTS & BÉBÉS",
    heroVariant: "split-left-image",
    deliveryTitle: "Expédition Soignée Famille & Enfants 69 Wilayas",
  }),
];
