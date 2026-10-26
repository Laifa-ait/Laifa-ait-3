import {
  CustomPageSection,
  CustomPageTheme,
  StoreThemeSector,
} from "../../../../../domains/seller/customPage.types";

export interface MasterThemeArchetype {
  id: string;
  name: string;
  tagline: string;
  sector: StoreThemeSector;
  badge: string;
  layoutPreviewType: "bento" | "bubbles" | "editorial" | "tech";
  thumbnailUrl: string;
  theme: CustomPageTheme;
  features: string[];
  generateSections: (customHeroImageUrl?: string) => CustomPageSection[];
}

/**
 * Generates a high-definition editorial SVG artwork data URI so themes never suffer from
 * broken external links or accidental UI screenshots, while supporting 1-click user photo replacement.
 */
function createEditorialSvgArtwork(config: {
  bgStart: string;
  bgEnd: string;
  accent1: string;
  accent2: string;
  kicker: string;
  headline: string;
  subline: string;
  motif: "arch" | "minimal" | "tech" | "botanical" | "luxury";
}): string {
  const { bgStart, bgEnd, accent1, accent2, kicker, headline, subline, motif } = config;

  const motifShapes =
    motif === "arch"
      ? `<path d="M760 480 V210 A150 150 0 0 1 1060 210 V480 Z" fill="${accent1}" fill-opacity="0.22" stroke="${accent2}" stroke-opacity="0.35" stroke-width="2"/>
         <circle cx="910" cy="215" r="78" fill="${accent2}" fill-opacity="0.18"/>
         <rect x="820" y="290" width="180" height="190" rx="18" fill="#FFFFFF" fill-opacity="0.10"/>`
      : motif === "tech"
      ? `<rect x="730" y="95" width="360" height="240" rx="22" fill="${accent1}" fill-opacity="0.18" stroke="${accent2}" stroke-opacity="0.4" stroke-width="2"/>
         <circle cx="910" cy="215" r="68" fill="none" stroke="${accent2}" stroke-opacity="0.55" stroke-width="10"/>
         <circle cx="910" cy="215" r="26" fill="${accent2}" fill-opacity="0.4"/>
         <rect x="770" y="360" width="280" height="56" rx="14" fill="#FFFFFF" fill-opacity="0.08"/>`
      : motif === "botanical"
      ? `<circle cx="910" cy="240" r="155" fill="${accent1}" fill-opacity="0.20"/>
         <path d="M910 100 C975 160 975 290 910 380 C845 290 845 160 910 100 Z" fill="${accent2}" fill-opacity="0.26"/>
         <path d="M820 200 C880 210 930 260 950 340 C870 330 830 270 820 200 Z" fill="#FFFFFF" fill-opacity="0.16"/>`
      : motif === "luxury"
      ? `<polygon points="910,75 1075,240 910,405 745,240" fill="${accent1}" fill-opacity="0.18" stroke="${accent2}" stroke-opacity="0.45" stroke-width="2"/>
         <circle cx="910" cy="240" r="84" fill="none" stroke="${accent2}" stroke-opacity="0.6" stroke-width="2"/>
         <circle cx="910" cy="240" r="42" fill="${accent2}" fill-opacity="0.25"/>`
      : `<rect x="740" y="80" width="170" height="320" rx="20" fill="${accent1}" fill-opacity="0.24"/>
         <rect x="930" y="130" width="165" height="270" rx="20" fill="${accent2}" fill-opacity="0.22"/>
         <circle cx="825" cy="200" r="46" fill="#FFFFFF" fill-opacity="0.14"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 540" width="1200" height="540">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgStart}"/>
        <stop offset="100%" stop-color="${bgEnd}"/>
      </linearGradient>
      <radialGradient id="glow" cx="78%" cy="38%" r="52%">
        <stop offset="0%" stop-color="${accent2}" stop-opacity="0.32"/>
        <stop offset="100%" stop-color="${bgEnd}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="540" fill="url(#bg)"/>
    <rect width="1200" height="540" fill="url(#glow)"/>
    <g opacity="0.12" stroke="#FFFFFF" stroke-width="1">
      <line x1="0" y1="135" x2="1200" y2="135"/>
      <line x1="0" y1="405" x2="1200" y2="405"/>
      <line x1="680" y1="0" x2="680" y2="540"/>
    </g>
    ${motifShapes}
    <rect x="72" y="110" width="220" height="32" rx="16" fill="${accent1}" fill-opacity="0.35"/>
    <text x="92" y="131" fill="#FFFFFF" font-family="sans-serif" font-size="13" font-weight="700" letter-spacing="1.5">${kicker}</text>
    <text x="72" y="215" fill="#FFFFFF" font-family="sans-serif" font-size="44" font-weight="800" letter-spacing="-0.5">${headline}</text>
    <text x="72" y="265" fill="#E2E8F0" font-family="sans-serif" font-size="20" font-weight="400">${subline}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createCategorySvgCard(title: string, bgStart: string, bgEnd: string, accent: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
    <defs>
      <linearGradient id="cbg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgStart}"/>
        <stop offset="100%" stop-color="${bgEnd}"/>
      </linearGradient>
    </defs>
    <rect width="600" height="450" fill="url(#cbg)"/>
    <circle cx="460" cy="140" r="120" fill="${accent}" fill-opacity="0.22"/>
    <rect x="340" y="180" width="180" height="200" rx="24" fill="#FFFFFF" fill-opacity="0.12" stroke="#FFFFFF" stroke-opacity="0.22"/>
    <text x="42" y="385" fill="#FFFFFF" font-family="sans-serif" font-size="26" font-weight="700" opacity="0.25">${title}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const MASTER_THEME_ARCHETYPES: MasterThemeArchetype[] = [
  {
    id: "azur-prestige",
    name: "Azur Prestige Olmart",
    tagline: "Design clair architectural, bleu océan profond et lisibilité e-commerce optimale",
    sector: "mode",
    badge: "01 · Signature Moderne",
    layoutPreviewType: "bento",
    thumbnailUrl: createEditorialSvgArtwork({
      bgStart: "#011C40",
      bgEnd: "#023859",
      accent1: "#26658C",
      accent2: "#54ACBF",
      kicker: "COLLECTION SIGNATURE",
      headline: "AZUR PRESTIGE",
      subline: "Architecture claire & moderne haute conversion",
      motif: "minimal",
    }),
    features: ["Palette Azur Raffinée", "Bento Rayons Épuré", "Cartes Produits Modernes", "Livraison 58 Wilayas"],
    theme: {
      sector: "mode",
      primaryColor: "#023859",
      secondaryColor: "#011C40",
      accentColor: "#26658C",
      accentBadgeColor: "#54ACBF",
      canvasColor: "#F8FBFC",
      surfaceColor: "#FFFFFF",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      borderRadiusPx: 14,
      spacingYPx: 28,
      titleFontSizePx: 32,
      bodyFontSizePx: 15,
    },
    generateSections: (customHeroImageUrl?: string) => {
      const ts = Date.now();
      const defaultHero = createEditorialSvgArtwork({
        bgStart: "#011C40",
        bgEnd: "#023859",
        accent1: "#26658C",
        accent2: "#54ACBF",
        kicker: "NOUVELLE COLLECTION",
        headline: "ÉLÉGANCE & MODERNITÉ",
        subline: "Sélection officielle expédiée dans les 58 Wilayas",
        motif: "minimal",
      });
      return [
        {
          id: `sec_hero_${ts}_0`,
          type: "hero_banner",
          title: "Bannière Azur Prestige",
          isVisible: true,
          order: 0,
          styles: { borderRadius: "md", paddingY: "lg", containerWidth: "contained" },
          settings: {
            title: "COLLECTION CONTEMPORAINE & PIÈCES CHOISIES",
            subtitle: "Une expérience d'achat claire, soignée et pensée pour mettre en valeur chaque produit avec livraison rapide sur 58 Wilayas.",
            badgeText: "SÉLECTION OFFICIELLE",
            imageUrl: customHeroImageUrl || defaultHero,
            ctaText: "Explorer le Catalogue",
            ctaLink: "#catalog",
            ctaStyle: "solid",
            overlayOpacity: 30,
            textAlignment: "left",
            socialProofBadge: "Qualité contrôlée · Paiement à la livraison disponible",
          },
        },
        {
          id: `sec_cats_${ts}_1`,
          type: "featured_categories",
          title: "Rayons Principaux",
          isVisible: true,
          order: 1,
          styles: { borderRadius: "md", paddingY: "md", containerWidth: "contained" },
          settings: {
            title: "Parcourir par Rayon",
            subtitle: "Accédez directement à nos univers phares",
            layout: "bento",
            categories: [
              {
                id: "az_1",
                name: "Nouveautés & Exclusivités",
                subtitle: "Arrivages de la semaine",
                slug: "nouveautes",
                imageUrl: createCategorySvgCard("NOUVEAUTÉS", "#011C40", "#023859", "#54ACBF"),
                colSpan: 2,
                badge: "PHARE",
              },
              {
                id: "az_2",
                name: "Essentiels Quotidien",
                subtitle: "Qualité durable",
                slug: "essentiels",
                imageUrl: createCategorySvgCard("ESSENTIELS", "#023859", "#26658C", "#54ACBF"),
                colSpan: 1,
              },
              {
                id: "az_3",
                name: "Accessoires Signature",
                subtitle: "Finitions soignées",
                slug: "accessoires",
                imageUrl: createCategorySvgCard("ACCESSOIRES", "#1E3A5F", "#011C40", "#38BDF8"),
                colSpan: 1,
              },
            ],
          },
        },
        {
          id: `sec_feed_${ts}_2`,
          type: "featured_products",
          title: "Catalogue Vedette",
          isVisible: true,
          order: 2,
          styles: { borderRadius: "md", paddingY: "lg", containerWidth: "contained" },
          settings: {
            title: "Nos Articles à la Une",
            subtitle: "Disponibilité immédiate en stock avec expédition rapide",
            productIds: [],
            layout: "grid",
            columnsDesktop: 4,
            cardStyle: "modern",
            cardAspectRatio: "4/5",
            showStockBadge: true,
            showCtaButton: false,
            showWishlistButton: true,
            showRatingStars: true,
          },
        },
        {
          id: `sec_trust_${ts}_3`,
          type: "delivery_info",
          title: "Livraison & Garanties",
          isVisible: true,
          order: 3,
          styles: { borderRadius: "md", paddingY: "md", containerWidth: "contained" },
          settings: {
            title: "Expédition Rapide 58 Wilayas",
            defaultTimeframe: "Livraison à domicile ou bureau stop-desk en 24h à 72h",
            freeShippingAbove: 10000,
            customTariffs: [
              { wilayaName: "Alger, Blida, Tipaza", estimatedDays: "24h", priceDZD: 400, homeDeliveryAvailable: true },
              { wilayaName: "Oran, Constantine, Sétif", estimatedDays: "24h - 48h", priceDZD: 600, homeDeliveryAvailable: true },
            ],
          },
        },
      ];
    },
  },
  {
    id: "and-shop",
    name: "Atelier Couture & Lookbook",
    tagline: "Éditorial mode chaleureux, grille bento asymétrique et typographie Playfair Display",
    sector: "mode",
    badge: "02 · Éditorial Luxe",
    layoutPreviewType: "editorial",
    thumbnailUrl: createEditorialSvgArtwork({
      bgStart: "#1C1917",
      bgEnd: "#44403C",
      accent1: "#9A5B25",
      accent2: "#D4AF37",
      kicker: "ATELIER ÉDITORIAL",
      headline: "HAUTE SILHOUETTE",
      subline: "Matières nobles, tons sable chaud & typographie serif",
      motif: "arch",
    }),
    features: ["Typo Playfair Display", "Bento Asymétrique", "Fond Ivoire Chaud", "Wishlist & Avis"],
    theme: {
      sector: "mode",
      primaryColor: "#9A5B25",
      secondaryColor: "#1C1917",
      accentColor: "#D4AF37",
      accentBadgeColor: "#9A5B25",
      canvasColor: "#FAF7F2",
      surfaceColor: "#FFFFFF",
      fontFamily: "'Playfair Display', serif",
      borderRadiusPx: 12,
      spacingYPx: 32,
      titleFontSizePx: 36,
      bodyFontSizePx: 16,
    },
    generateSections: (customHeroImageUrl?: string) => {
      const ts = Date.now();
      const defaultHero = createEditorialSvgArtwork({
        bgStart: "#1C1917",
        bgEnd: "#44403C",
        accent1: "#9A5B25",
        accent2: "#D4AF37",
        kicker: "ÉDITION LIMITÉE",
        headline: "L'ALLURE INTEMPORELLE",
        subline: "Coupes fluides et matières naturelles sélectionnées avec soin",
        motif: "arch",
      });
      return [
        {
          id: `sec_hero_${ts}_0`,
          type: "hero_banner",
          title: "Lookbook Atelier",
          isVisible: true,
          order: 0,
          styles: { borderRadius: "md", paddingY: "xl", containerWidth: "contained" },
          settings: {
            title: "L'ALLURE CONTEMPORAINE · ÉDITION ATELIER",
            subtitle: "Matières fluides, coupes architecturales et nuances naturelles pensées pour durer.",
            badgeText: "COLLECTION SIGNATURE",
            imageUrl: customHeroImageUrl || defaultHero,
            ctaText: "Découvrir le Lookbook",
            ctaLink: "#catalog",
            ctaStyle: "solid",
            overlayOpacity: 28,
            textAlignment: "left",
            socialProofBadge: "★★★★★ Noté 4.9/5 par notre clientèle vérifiée",
          },
        },
        {
          id: `sec_bento_${ts}_1`,
          type: "featured_categories",
          title: "Sélections Éditoriales",
          isVisible: true,
          order: 1,
          styles: { borderRadius: "md", paddingY: "lg", containerWidth: "contained" },
          settings: {
            title: "Univers de la Maison",
            subtitle: "Explorez nos pièces maîtresses par catégorie",
            layout: "bento",
            categories: [
              {
                id: "b_1",
                name: "Maroquinerie & Sacs",
                subtitle: "Cuir pleine fleur",
                slug: "maroquinerie",
                imageUrl: createCategorySvgCard("MAROQUINERIE", "#292524", "#44403C", "#D4AF37"),
                colSpan: 2,
                badge: "ATELIER",
              },
              {
                id: "b_2",
                name: "Prêt-à-Porter",
                subtitle: "Coupes fluides",
                slug: "pret-a-porter",
                imageUrl: createCategorySvgCard("SILHOUETTES", "#44403C", "#78350F", "#F59E0B"),
                colSpan: 1,
              },
              {
                id: "b_3",
                name: "Accessoires Dorés",
                subtitle: "Finitions précieuses",
                slug: "accessoires",
                imageUrl: createCategorySvgCard("ACCESSOIRES", "#1C1917", "#57534E", "#D4AF37"),
                colSpan: 1,
              },
            ],
          },
        },
        {
          id: `sec_grid_${ts}_2`,
          type: "new_arrivals",
          title: "Nouvelles Pièces",
          isVisible: true,
          order: 2,
          styles: { borderRadius: "md", paddingY: "lg", containerWidth: "contained" },
          settings: {
            title: "Nouveautés de la Saison",
            subtitle: "Pièces disponibles immédiatement en quantité limitée",
            layout: "grid",
            columnsDesktop: 4,
            cardStyle: "elevated",
            cardAspectRatio: "4/5",
            showStockBadge: true,
            showCtaButton: false,
            showWishlistButton: true,
            showRatingStars: true,
          },
        },
      ];
    },
  },
  {
    id: "anvogue",
    name: "Séoul Studio Minimal",
    tagline: "Minimalisme urbain contemporain, navigation par bulles et contraste architectural",
    sector: "mode",
    badge: "03 · Urban Minimal",
    layoutPreviewType: "bubbles",
    thumbnailUrl: createEditorialSvgArtwork({
      bgStart: "#09090B",
      bgEnd: "#1E293B",
      accent1: "#2563EB",
      accent2: "#38BDF8",
      kicker: "URBAN CONCEPT STORE",
      headline: "SEOUL MINIMAL",
      subline: "Lignes pures, typographie géométrique & essentiels urbains",
      motif: "minimal",
    }),
    features: ["Bulles Rayons Stories", "Typo Géométrique Outfit", "Cartes Minimalistes", "Grille Épurée"],
    theme: {
      sector: "mode",
      primaryColor: "#2563EB",
      secondaryColor: "#09090B",
      accentColor: "#38BDF8",
      accentBadgeColor: "#2563EB",
      canvasColor: "#F8FAFC",
      surfaceColor: "#FFFFFF",
      fontFamily: "'Outfit', sans-serif",
      borderRadiusPx: 12,
      spacingYPx: 26,
      titleFontSizePx: 32,
      bodyFontSizePx: 15,
    },
    generateSections: (customHeroImageUrl?: string) => {
      const ts = Date.now();
      const defaultHero = createEditorialSvgArtwork({
        bgStart: "#09090B",
        bgEnd: "#1E293B",
        accent1: "#2563EB",
        accent2: "#38BDF8",
        kicker: "SAISON URBAINE",
        headline: "MODERN ESSENTIALS",
        subline: "Conçu pour le quotidien contemporain avec des coupes nettes",
        motif: "minimal",
      });
      return [
        {
          id: `sec_hero_${ts}_0`,
          type: "hero_banner",
          title: "Hero Urban Minimal",
          isVisible: true,
          order: 0,
          styles: { borderRadius: "md", paddingY: "lg", containerWidth: "contained" },
          settings: {
            title: "VESTIAIRE URBAIN & ESSENTIELS ARCHITECTURAUX",
            subtitle: "Des lignes épurées, des textiles techniques et un confort pensé pour le mouvement.",
            badgeText: "NOUVEAU DROP",
            imageUrl: customHeroImageUrl || defaultHero,
            ctaText: "Explorer le Drop",
            ctaLink: "#catalog",
            ctaStyle: "pill",
            overlayOpacity: 25,
            textAlignment: "center",
          },
        },
        {
          id: `sec_stories_${ts}_1`,
          type: "featured_categories",
          title: "Rayons en Direct",
          isVisible: true,
          order: 1,
          styles: { borderRadius: "none", paddingY: "md", containerWidth: "contained" },
          settings: {
            title: "Collections par Univers",
            subtitle: "Navigation directe par catégorie",
            layout: "bubbles",
            categories: [
              { id: "st_1", name: "Vestes & Outerwear", subtitle: "Coupes structurées", slug: "vestes", imageUrl: createCategorySvgCard("OUTERWEAR", "#09090B", "#1E293B", "#2563EB") },
              { id: "st_2", name: "Tops & Maille", subtitle: "Coton lourd", slug: "tops", imageUrl: createCategorySvgCard("TOPS", "#1E293B", "#334155", "#38BDF8") },
              { id: "st_3", name: "Pantalons & Cargo", subtitle: "Ligne fluide", slug: "pantalons", imageUrl: createCategorySvgCard("DENIM", "#0F172A", "#1E3A8A", "#60A5FA") },
              { id: "st_4", name: "Sneakers & Sacs", subtitle: "Édition studio", slug: "sneakers", imageUrl: createCategorySvgCard("FOOTWEAR", "#18181B", "#27272A", "#2563EB") },
            ],
          },
        },
        {
          id: `sec_deals_${ts}_2`,
          type: "featured_products",
          title: "Sélection Concept Store",
          isVisible: true,
          order: 2,
          styles: { borderRadius: "md", paddingY: "lg", containerWidth: "contained" },
          settings: {
            title: "Sélection Studio de la Semaine",
            subtitle: "Nos pièces les plus recherchées du moment",
            productIds: [],
            layout: "grid",
            columnsDesktop: 4,
            cardStyle: "minimal",
            cardAspectRatio: "4/5",
            showStockBadge: true,
            showCtaButton: false,
            showWishlistButton: true,
            showRatingStars: true,
          },
        },
      ];
    },
  },
  {
    id: "flashmart",
    name: "Tech & Audio Pro Lab",
    tagline: "Vitrine high-tech de précision, jauge de disponibilité en direct et offres chronométrées",
    sector: "tech",
    badge: "04 · High-Tech & Pro",
    layoutPreviewType: "tech",
    thumbnailUrl: createEditorialSvgArtwork({
      bgStart: "#090D16",
      bgEnd: "#0F172A",
      accent1: "#0284C7",
      accent2: "#38BDF8",
      kicker: "HIGH-TECH & INNOVATION",
      headline: "PRECISION LAB",
      subline: "Équipements audio, informatique & mobilité certifiés",
      motif: "tech",
    }),
    features: ["Jauge de Stock Réel", "Compte à Rebours Offre", "Grille 4 Colonnes", "Garantie & Livraison"],
    theme: {
      sector: "tech",
      primaryColor: "#0284C7",
      secondaryColor: "#0F172A",
      accentColor: "#38BDF8",
      accentBadgeColor: "#0284C7",
      canvasColor: "#F8FAFC",
      surfaceColor: "#FFFFFF",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      borderRadiusPx: 10,
      spacingYPx: 26,
      titleFontSizePx: 32,
      bodyFontSizePx: 15,
    },
    generateSections: (customHeroImageUrl?: string) => {
      const ts = Date.now();
      const defaultHero = createEditorialSvgArtwork({
        bgStart: "#090D16",
        bgEnd: "#0F172A",
        accent1: "#0284C7",
        accent2: "#38BDF8",
        kicker: "PERFORMANCE & DESIGN",
        headline: "TECHNOLOGIE DE POINTE",
        subline: "Matériel original garanti avec expédition sécurisée",
        motif: "tech",
      });
      return [
        {
          id: `sec_hero_${ts}_0`,
          type: "hero_banner",
          title: "Bannière Tech Lab",
          isVisible: true,
          order: 0,
          styles: { borderRadius: "md", paddingY: "lg", containerWidth: "contained" },
          settings: {
            title: "ÉQUIPEMENTS HIGH-TECH & AUDIO HAUTE PRÉCISION",
            subtitle: "Découvrez notre sélection d'appareils certifiés, accessoires pro et innovations avec garantie officielle.",
            badgeText: "ARRIVAGE TECH CERTIFIÉ",
            imageUrl: customHeroImageUrl || defaultHero,
            ctaText: "Voir les Équipements",
            ctaLink: "#catalog",
            ctaStyle: "solid",
            overlayOpacity: 30,
            textAlignment: "left",
          },
        },
        {
          id: `sec_cats_${ts}_1`,
          type: "featured_categories",
          title: "Univers Technologiques",
          isVisible: true,
          order: 1,
          styles: { borderRadius: "sm", paddingY: "md", containerWidth: "contained" },
          settings: {
            title: "Parcourir par Catégorie",
            subtitle: "Trouvez rapidement le matériel adapté à vos besoins",
            layout: "grid",
            categories: [
              { id: "cat_1", name: "Smartphones & Mobilité", subtitle: "Dernières générations", slug: "smartphones", imageUrl: createCategorySvgCard("MOBILITÉ", "#0F172A", "#1E293B", "#38BDF8") },
              { id: "cat_2", name: "Audio & Studio", subtitle: "Casques & enceintes", slug: "audio", imageUrl: createCategorySvgCard("AUDIO PRO", "#090D16", "#1E3A8A", "#0284C7") },
              { id: "cat_3", name: "Informatique & Setup", subtitle: "Stations & périphériques", slug: "informatique", imageUrl: createCategorySvgCard("WORKSTATION", "#111827", "#0F172A", "#38BDF8") },
            ],
          },
        },
        {
          id: `sec_deals_${ts}_2`,
          type: "featured_products",
          title: "Sélection Tech du Moment",
          isVisible: true,
          order: 2,
          styles: { borderRadius: "sm", paddingY: "lg", containerWidth: "contained" },
          settings: {
            title: "Offres & Équipements en Stock",
            subtitle: "Quantités suivies en temps réel et expédition protégée",
            productIds: [],
            layout: "grid",
            columnsDesktop: 4,
            cardStyle: "modern",
            cardAspectRatio: "1/1",
            showStockBadge: true,
            showCtaButton: false,
            showCountdown: true,
            countdownLabel: "OFFRE SPÉCIALE EN COURS",
            countdownEndDate: "2026-12-31T23:59:59",
            showStockProgress: true,
          },
        },
        {
          id: `sec_trust_${ts}_3`,
          type: "delivery_info",
          title: "Garanties & Expédition",
          isVisible: true,
          order: 3,
          styles: { borderRadius: "sm", paddingY: "md", containerWidth: "contained" },
          settings: {
            title: "Livraison Protégée & Garantie",
            defaultTimeframe: "Expédition sous 24h/48h avec vérification à la réception",
            freeShippingAbove: 12000,
            customTariffs: [
              { wilayaName: "Alger", estimatedDays: "24h", priceDZD: 400, homeDeliveryAvailable: true },
              { wilayaName: "58 Wilayas", estimatedDays: "24h - 72h", priceDZD: 600, homeDeliveryAvailable: true },
            ],
          },
        },
      ];
    },
  },
  {
    id: "chicwave",
    name: "Terre d'Artisanat & Maison",
    tagline: "Tons travertin & terre cuite douce, savoir-faire authentique et décoration intérieure",
    sector: "artisanat",
    badge: "05 · Maison & Artisanat",
    layoutPreviewType: "editorial",
    thumbnailUrl: createEditorialSvgArtwork({
      bgStart: "#431407",
      bgEnd: "#7C2D12",
      accent1: "#B85B35",
      accent2: "#D4AF37",
      kicker: "SAVOIR-FAIRE & DÉCORATION",
      headline: "TERRE & MATIÈRES",
      subline: "Créations authentiques, matières brutes et chaleur méditerranéenne",
      motif: "arch",
    }),
    features: ["Nuancier Travertin & Terracotta", "Preuve Sociale Hero", "Tarifs Livraison Clairs", "Cartes Élégantes"],
    theme: {
      sector: "artisanat",
      primaryColor: "#B85B35",
      secondaryColor: "#1C2A39",
      accentColor: "#D4AF37",
      accentBadgeColor: "#B85B35",
      canvasColor: "#FAF6F0",
      surfaceColor: "#FFFFFF",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      borderRadiusPx: 16,
      spacingYPx: 32,
      titleFontSizePx: 34,
      bodyFontSizePx: 16,
    },
    generateSections: (customHeroImageUrl?: string) => {
      const ts = Date.now();
      const defaultHero = createEditorialSvgArtwork({
        bgStart: "#431407",
        bgEnd: "#7C2D12",
        accent1: "#B85B35",
        accent2: "#D4AF37",
        kicker: "COLLECTION MAISON",
        headline: "ARTISANAT D'EXCEPTION",
        subline: "Pièces façonnées avec passion pour sublimer votre intérieur",
        motif: "arch",
      });
      return [
        {
          id: `sec_hero_${ts}_0`,
          type: "hero_banner",
          title: "Hero Terre d'Artisanat",
          isVisible: true,
          order: 0,
          styles: { borderRadius: "lg", paddingY: "xl", containerWidth: "contained" },
          settings: {
            title: "CRÉATIONS AUTHENTIQUES & ART DE VIVRE",
            subtitle: "Découvrez des pièces uniques façonnées avec soin et expédiées directement de notre atelier vers les 58 Wilayas.",
            badgeText: "SAVOIR-FAIRE AUTHENTIQUE",
            imageUrl: customHeroImageUrl || defaultHero,
            ctaText: "Explorer nos Créations",
            ctaLink: "#catalog",
            ctaStyle: "solid",
            overlayOpacity: 30,
            textAlignment: "left",
            socialProofBadge: "★★★★★ Plus de 2 500 clients satisfaits à travers l'Algérie",
          },
        },
        {
          id: `sec_cats_${ts}_1`,
          type: "featured_categories",
          title: "Univers Décoration & Atelier",
          isVisible: true,
          order: 1,
          styles: { borderRadius: "md", paddingY: "md", containerWidth: "contained" },
          settings: {
            title: "Nos Collections Artisanales",
            subtitle: "Des matières nobles travaillées dans le respect de la tradition",
            layout: "grid",
            categories: [
              { id: "c_1", name: "Céramique & Art de la Table", subtitle: "Façonné main", slug: "ceramique", imageUrl: createCategorySvgCard("CÉRAMIQUE", "#7C2D12", "#9A3412", "#D4AF37") },
              { id: "c_2", name: "Textiles & Tissages", subtitle: "Fibres naturelles", slug: "tissages", imageUrl: createCategorySvgCard("TISSAGES", "#431407", "#78350F", "#F59E0B") },
              { id: "c_3", name: "Mobilier & Luminaires", subtitle: "Bois & laiton", slug: "mobilier", imageUrl: createCategorySvgCard("MOBILIER", "#1C2A39", "#334155", "#B85B35") },
            ],
          },
        },
        {
          id: `sec_feed_${ts}_2`,
          type: "best_sellers",
          title: "Créations les Plus Demandées",
          isVisible: true,
          order: 2,
          styles: { borderRadius: "md", paddingY: "lg", containerWidth: "contained" },
          settings: {
            title: "Pièces Favorites de nos Clients",
            subtitle: "Disponibles en série limitée",
            layout: "grid",
            columnsDesktop: 4,
            cardStyle: "modern",
            cardAspectRatio: "4/5",
            showStockBadge: true,
            showCtaButton: false,
            showRatingStars: true,
          },
        },
        {
          id: `sec_trust_${ts}_3`,
          type: "delivery_info",
          title: "Expédition Soignée",
          isVisible: true,
          order: 3,
          styles: { borderRadius: "lg", paddingY: "md", containerWidth: "contained" },
          settings: {
            title: "Emballage Renforcé & Livraison 58 Wilayas",
            defaultTimeframe: "Livraison protégée en 2 à 4 jours ouvrés",
            freeShippingAbove: 10000,
            customTariffs: [
              { wilayaName: "Alger & Environs", estimatedDays: "24-48h", priceDZD: 400, homeDeliveryAvailable: true },
              { wilayaName: "Toutes Wilayas", estimatedDays: "48-72h", priceDZD: 600, homeDeliveryAvailable: true },
            ],
          },
        },
      ];
    },
  },
  {
    id: "carrot",
    name: "Botanica Pure Skincare",
    tagline: "Esthétique laboratoire botanique scandinave, vert sauge apaisant et transparence bio",
    sector: "beaute",
    badge: "06 · Botanique & Soins",
    layoutPreviewType: "bubbles",
    thumbnailUrl: createEditorialSvgArtwork({
      bgStart: "#064E3B",
      bgEnd: "#047857",
      accent1: "#10B981",
      accent2: "#A7F3D0",
      kicker: "LABORATOIRE BOTANIQUE",
      headline: "BOTANICA PURE",
      subline: "Formules naturelles, soins dermo-cosmétiques & bien-être",
      motif: "botanical",
    }),
    features: ["Palette Sauge & Émeraude", "Navigation par Besoins", "Cartes Carrées 1:1", "Engagements Qualité"],
    theme: {
      sector: "beaute",
      primaryColor: "#059669",
      secondaryColor: "#064E3B",
      accentColor: "#34D399",
      accentBadgeColor: "#059669",
      canvasColor: "#F7F9F7",
      surfaceColor: "#FFFFFF",
      fontFamily: "'DM Sans', sans-serif",
      borderRadiusPx: 14,
      spacingYPx: 28,
      titleFontSizePx: 30,
      bodyFontSizePx: 15,
    },
    generateSections: (customHeroImageUrl?: string) => {
      const ts = Date.now();
      const defaultHero = createEditorialSvgArtwork({
        bgStart: "#064E3B",
        bgEnd: "#047857",
        accent1: "#10B981",
        accent2: "#A7F3D0",
        kicker: "100% ORIGINE NATURELLE",
        headline: "SOINS BOTANIQUES PURS",
        subline: "Ingrédients actifs sélectionnés pour une routine saine et transparente",
        motif: "botanical",
      });
      return [
        {
          id: `sec_hero_${ts}_0`,
          type: "hero_banner",
          title: "Hero Botanica Pure",
          isVisible: true,
          order: 0,
          styles: { borderRadius: "md", paddingY: "lg", containerWidth: "contained" },
          settings: {
            title: "PURETÉ BOTANIQUE & SOINS CERTIFIÉS",
            subtitle: "Des formules douces, riches en actifs naturels et respectueuses de votre équilibre.",
            badgeText: "FORMULATION PROPRE",
            imageUrl: customHeroImageUrl || defaultHero,
            ctaText: "Découvrir la Gamme",
            ctaLink: "#catalog",
            ctaStyle: "solid",
            overlayOpacity: 25,
            textAlignment: "left",
          },
        },
        {
          id: `sec_cats_${ts}_1`,
          type: "featured_categories",
          title: "Routines par Besoin",
          isVisible: true,
          order: 1,
          styles: { borderRadius: "md", paddingY: "md", containerWidth: "contained" },
          settings: {
            title: "Choisir par Rituel",
            subtitle: "Des soins ciblés pour chaque étape quotidienne",
            layout: "pills",
            categories: [
              { id: "c_1", name: "Sérums & Éclat", subtitle: "Actifs concentrés", slug: "serums", imageUrl: createCategorySvgCard("SÉRUMS", "#064E3B", "#047857", "#34D399") },
              { id: "c_2", name: "Hydratation Visage", subtitle: "Barrière cutanée", slug: "hydratation", imageUrl: createCategorySvgCard("HYDRATATION", "#047857", "#059669", "#A7F3D0") },
              { id: "c_3", name: "Huiles & Corps", subtitle: "Extraction à froid", slug: "huiles", imageUrl: createCategorySvgCard("HUILES BIO", "#065F46", "#064E3B", "#10B981") },
              { id: "c_4", name: "Coffrets Découverte", subtitle: "Routine complète", slug: "coffrets", imageUrl: createCategorySvgCard("COFFRETS", "#115E59", "#0F766E", "#5EEAD4") },
            ],
          },
        },
        {
          id: `sec_deals_${ts}_2`,
          type: "new_arrivals",
          title: "Essentiels Botanica",
          isVisible: true,
          order: 2,
          styles: { borderRadius: "md", paddingY: "lg", containerWidth: "contained" },
          settings: {
            title: "Nos Formules Phares",
            subtitle: "Plébiscitées pour leur efficacité et leur douceur",
            layout: "grid",
            columnsDesktop: 4,
            cardStyle: "modern",
            cardAspectRatio: "1/1",
            showStockBadge: true,
            showCtaButton: false,
            showRatingStars: true,
          },
        },
      ];
    },
  },
  {
    id: "clothing",
    name: "Maison Horlogerie & Joaillerie",
    tagline: "Contrastes profonds onyx & or champagne, présentation prestige et garde-temps",
    sector: "mode",
    badge: "07 · Haute Horlogerie",
    layoutPreviewType: "bento",
    thumbnailUrl: createEditorialSvgArtwork({
      bgStart: "#141413",
      bgEnd: "#292524",
      accent1: "#854D0E",
      accent2: "#D4AF37",
      kicker: "MAISON DE PRESTIGE",
      headline: "ONOMATO & OR",
      subline: "Haute horlogerie, parfums rares & accessoires d'exception",
      motif: "luxury",
    }),
    features: ["Onyx & Or Champagne", "Typo Prestige Playfair", "Bento Collection Privée", "Avis 5.0 Vérifiés"],
    theme: {
      sector: "mode",
      primaryColor: "#854D0E",
      secondaryColor: "#141413",
      accentColor: "#D4AF37",
      accentBadgeColor: "#854D0E",
      canvasColor: "#F9F8F6",
      surfaceColor: "#FFFFFF",
      fontFamily: "'Playfair Display', serif",
      borderRadiusPx: 10,
      spacingYPx: 32,
      titleFontSizePx: 34,
      bodyFontSizePx: 16,
    },
    generateSections: (customHeroImageUrl?: string) => {
      const ts = Date.now();
      const defaultHero = createEditorialSvgArtwork({
        bgStart: "#141413",
        bgEnd: "#292524",
        accent1: "#854D0E",
        accent2: "#D4AF37",
        kicker: "COLLECTION PRESTIGE",
        headline: "PRÉCISION & ÉLÉGANCE",
        subline: "Garde-temps, parfums de niche et pièces d'exception",
        motif: "luxury",
      });
      return [
        {
          id: `sec_hero_${ts}_0`,
          type: "hero_banner",
          title: "Hero Maison Prestige",
          isVisible: true,
          order: 0,
          styles: { borderRadius: "md", paddingY: "xl", containerWidth: "contained" },
          settings: {
            title: "L'EXCELLENCE DU DÉTAIL · COLLECTION PRIVÉE",
            subtitle: "Une sélection rigoureuse de pièces horlogères, fragrances rares et accessoires intemporels.",
            badgeText: "ÉDITION PRESTIGE",
            imageUrl: customHeroImageUrl || defaultHero,
            ctaText: "Découvrir la Sélection",
            ctaLink: "#catalog",
            ctaStyle: "solid",
            overlayOpacity: 30,
            textAlignment: "left",
            socialProofBadge: "★★★★★ Certifié authentique · Coffret inclus",
          },
        },
        {
          id: `sec_bento_${ts}_1`,
          type: "featured_categories",
          title: "Galeries Privées",
          isVisible: true,
          order: 1,
          styles: { borderRadius: "md", paddingY: "lg", containerWidth: "contained" },
          settings: {
            title: "Nos Univers Signature",
            subtitle: "Chaque pièce est contrôlée et livrée dans son écrin",
            layout: "bento",
            categories: [
              { id: "e_1", name: "Montres & Chronographes", subtitle: "Mouvements de précision", slug: "montres", imageUrl: createCategorySvgCard("HORLOGERIE", "#141413", "#292524", "#D4AF37"), colSpan: 2 },
              { id: "e_2", name: "Parfums & Extraits", subtitle: "Sillages rares", slug: "parfums", imageUrl: createCategorySvgCard("PARFUMS", "#292524", "#44403C", "#854D0E"), colSpan: 1 },
              { id: "e_3", name: "Bijoux & Coffrets", subtitle: "Finitions nobles", slug: "bijoux", imageUrl: createCategorySvgCard("JOAILLERIE", "#1C1917", "#292524", "#D4AF37"), colSpan: 1 },
            ],
          },
        },
        {
          id: `sec_feed_${ts}_2`,
          type: "best_sellers",
          title: "Pièces d'Exception",
          isVisible: true,
          order: 2,
          styles: { borderRadius: "md", paddingY: "lg", containerWidth: "contained" },
          settings: {
            title: "Sélection de la Maison",
            subtitle: "Livraison sécurisée avec vérification à la remise",
            layout: "grid",
            columnsDesktop: 4,
            cardStyle: "elevated",
            cardAspectRatio: "4/5",
            showStockBadge: true,
            showCtaButton: false,
            showRatingStars: true,
          },
        },
      ];
    },
  },
  {
    id: "beaulook",
    name: "Rose Poudré & Beauté Chic",
    tagline: "Cosmétique parisienne lumineuse, nuances poudrées et mise en page délicate",
    sector: "beaute",
    badge: "08 · Beauté & Parfums",
    layoutPreviewType: "editorial",
    thumbnailUrl: createEditorialSvgArtwork({
      bgStart: "#4A1525",
      bgEnd: "#881337",
      accent1: "#E11D48",
      accent2: "#FDA4AF",
      kicker: "MAISON DE BEAUTÉ",
      headline: "ROSE POUDRÉ CHIC",
      subline: "Cosmétiques lumineux, parfumerie fine & rituels d'éclat",
      motif: "arch",
    }),
    features: ["Nuancier Rose Poudré", "Cartes Minimalistes", "Bouton Favoris", "Typo Moderne Outfit"],
    theme: {
      sector: "beaute",
      primaryColor: "#E11D48",
      secondaryColor: "#4A1525",
      accentColor: "#FB7185",
      accentBadgeColor: "#E11D48",
      canvasColor: "#FDF8F9",
      surfaceColor: "#FFFFFF",
      fontFamily: "'Outfit', sans-serif",
      borderRadiusPx: 14,
      spacingYPx: 28,
      titleFontSizePx: 32,
      bodyFontSizePx: 15,
    },
    generateSections: (customHeroImageUrl?: string) => {
      const ts = Date.now();
      const defaultHero = createEditorialSvgArtwork({
        bgStart: "#4A1525",
        bgEnd: "#881337",
        accent1: "#E11D48",
        accent2: "#FDA4AF",
        kicker: "ÉDITION BEAUTÉ",
        headline: "ÉCLAT & DOUCEUR",
        subline: "Vos essentiels maquillage, parfums et soins réunis",
        motif: "arch",
      });
      return [
        {
          id: `sec_hero_${ts}_0`,
          type: "hero_banner",
          title: "Hero Rose Poudré",
          isVisible: true,
          order: 0,
          styles: { borderRadius: "md", paddingY: "lg", containerWidth: "contained" },
          settings: {
            title: "COLLECTION ÉCLAT & BEAUTÉ CONTEMPORAINE",
            subtitle: "Textures soyeuses, nuances lumineuses et soins experts pour sublimer chaque instant.",
            badgeText: "NOUVEAUTÉS BEAUTÉ",
            imageUrl: customHeroImageUrl || defaultHero,
            ctaText: "Découvrir la Collection",
            ctaLink: "#catalog",
            ctaStyle: "pill",
            overlayOpacity: 25,
            textAlignment: "left",
          },
        },
        {
          id: `sec_cats_${ts}_1`,
          type: "featured_categories",
          title: "Collections Beauté",
          isVisible: true,
          order: 1,
          styles: { borderRadius: "md", paddingY: "md", containerWidth: "contained" },
          settings: {
            title: "Explorer par Univers",
            subtitle: "Trouvez votre coup de cœur parmi nos rayons",
            layout: "grid",
            categories: [
              { id: "b_1", name: "Maquillage & Teint", subtitle: "Textures satinées", slug: "maquillage", imageUrl: createCategorySvgCard("MAQUILLAGE", "#881337", "#9F1239", "#FDA4AF") },
              { id: "b_2", name: "Parfums & Brumes", subtitle: "Notes florales", slug: "parfums", imageUrl: createCategorySvgCard("PARFUMS", "#4A1525", "#881337", "#FB7185") },
              { id: "b_3", name: "Soins Visage & Lèvres", subtitle: "Hydratation intense", slug: "soins", imageUrl: createCategorySvgCard("SOINS", "#500724", "#831843", "#F43F5E") },
            ],
          },
        },
        {
          id: `sec_feed_${ts}_2`,
          type: "best_sellers",
          title: "Incontournables Beauté",
          isVisible: true,
          order: 2,
          styles: { borderRadius: "md", paddingY: "lg", containerWidth: "contained" },
          settings: {
            title: "Les Favoris de nos Clientes",
            subtitle: "Sélectionnés pour leur tenue et leur éclat",
            layout: "grid",
            columnsDesktop: 4,
            cardStyle: "minimal",
            cardAspectRatio: "4/5",
            showStockBadge: true,
            showCtaButton: false,
            showWishlistButton: true,
            showRatingStars: true,
          },
        },
      ];
    },
  },
];
