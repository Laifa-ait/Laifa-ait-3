import {
  CustomPageSection,
  CustomPageTheme,
} from "../../../../domains/seller/customPage.types";

export interface ArtisticStudioPreset {
  id: string;
  nameFr: string;
  nameAr: string;
  subtitleFr: string;
  subtitleAr: string;
  heroLayout: "editorial-split" | "cinema-full" | "atelier-collage";
  theme: CustomPageTheme;
}

/**
 * Les 5 Presets Artistiques Officiels d'Olmart Studio
 * Règle 60-30-10 + Textures subtiles + Silhouettes architecturales (Zéro ovale sur les cartes produits)
 */
export const ARTISTIC_STUDIO_PRESETS: ArtisticStudioPreset[] = [
  {
    id: "casbah_atelier",
    nameFr: "Casbah Atelier (Chaleur & Patrimoine)",
    nameAr: "أتيليه القصبة (الأصالة والدفء)",
    subtitleFr: "Sable Chaud 60% • Papier Coton • Arche Casbah • Or Ambré 10%",
    subtitleAr: "رمل دافئ 60% • ورق قطني • قوس القصبة • ذهبي كهرماني 10%",
    heroLayout: "editorial-split",
    theme: {
      sector: "artisanat",
      canvasColor: "#FAF6F0",
      surfaceColor: "#FFFFFF",
      primaryColor: "#B45309",
      secondaryColor: "#18181B",
      accentColor: "#B45309",
      accentBadgeColor: "#B45309",
      fontFamily: "'Cormorant Garamond', 'Plus Jakarta Sans', serif",
      borderRadiusPx: 16,
      spacingYPx: 28,
      titleFontSizePx: 36,
      bodyFontSizePx: 15,
      surfaceTexture: "cotton-paper",
      ambientLighting: "golden-hour",
      cardMaterial: "solid-matte",
      frameShape: "casbah-arch",
      letterSpacing: 0.01,
      lineHeight: 1.12,
      headingAccentStyle: "metallic-gold",
      headingUnderlineStyle: "brush-stroke",
    },
  },
  {
    id: "alger_couture",
    nameFr: "Alger Couture (Luxe & Minimalisme)",
    nameAr: "الجزائر كوتور (فخامة وبساطة)",
    subtitleFr: "Albâtre 60% • Grain 35mm • Coupe Galerie 0px • Noir Couture 10%",
    subtitleAr: "مرمر نقي 60% • حبيبات سينمائية • إطار معرض حاد • أسود فاخر 10%",
    heroLayout: "editorial-split",
    theme: {
      sector: "mode",
      canvasColor: "#F8F8F6",
      surfaceColor: "#FFFFFF",
      primaryColor: "#18181B",
      secondaryColor: "#09090B",
      accentColor: "#18181B",
      accentBadgeColor: "#18181B",
      fontFamily: "'Playfair Display', 'Plus Jakarta Sans', serif",
      borderRadiusPx: 0,
      spacingYPx: 32,
      titleFontSizePx: 38,
      bodyFontSizePx: 15,
      surfaceTexture: "film-grain",
      ambientLighting: "spotlight-atelier",
      cardMaterial: "solid-matte",
      frameShape: "sharp-couture",
      letterSpacing: -0.02,
      lineHeight: 1.08,
      headingAccentStyle: "accent-color",
      headingUnderlineStyle: "golden-wave",
    },
  },
  {
    id: "sahara_glow",
    nameFr: "Sahara Glow (Beauté, Parfums & Cosmétiques)",
    nameAr: "وهج الصحراء (العطور والتجميل)",
    subtitleFr: "Rose Poudré 60% • Soie Nacrée • Cristal Dépoli • Terracotta 10%",
    subtitleAr: "وردي رملي 60% • حرير لؤلؤي • زجاج مصنفر • تيراكوتا 10%",
    heroLayout: "atelier-collage",
    theme: {
      sector: "beaute",
      canvasColor: "#FDF8F5",
      surfaceColor: "#FFFFFF",
      primaryColor: "#C2410C",
      secondaryColor: "#27272A",
      accentColor: "#C2410C",
      accentBadgeColor: "#C2410C",
      fontFamily: "'Cormorant Garamond', 'Plus Jakarta Sans', serif",
      borderRadiusPx: 20,
      spacingYPx: 28,
      titleFontSizePx: 36,
      bodyFontSizePx: 15,
      surfaceTexture: "silk-mesh",
      ambientLighting: "golden-hour",
      cardMaterial: "frosted-crystal",
      frameShape: "casbah-arch",
      letterSpacing: 0.02,
      lineHeight: 1.15,
      headingAccentStyle: "copper-bronze",
      headingUnderlineStyle: "brush-stroke",
    },
  },
  {
    id: "cyber_djazair",
    nameFr: "Cyber Djazaïr (Tech, Gaming & Streetwear)",
    nameAr: "سايبر دزاير (التقنية والستريت وير)",
    subtitleFr: "Gris Glace 60% • Grille 1px • Biseauté Cyber • Bleu Électrique 10%",
    subtitleAr: "رمادي جليدي 60% • شبكة هندسية • زوايا مشطوفة • أزرق كهربائي 10%",
    heroLayout: "editorial-split",
    theme: {
      sector: "tech",
      canvasColor: "#F8FAFC",
      surfaceColor: "#FFFFFF",
      primaryColor: "#2563EB",
      secondaryColor: "#0F172A",
      accentColor: "#2563EB",
      accentBadgeColor: "#2563EB",
      fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif",
      borderRadiusPx: 12,
      spacingYPx: 24,
      titleFontSizePx: 34,
      bodyFontSizePx: 15,
      surfaceTexture: "architectural-grid",
      ambientLighting: "neon-aura",
      cardMaterial: "frosted-crystal",
      frameShape: "chamfered-tech",
      letterSpacing: -0.02,
      lineHeight: 1.1,
      headingAccentStyle: "accent-color",
      headingUnderlineStyle: "brush-stroke",
    },
  },
  {
    id: "emeraude_prestige",
    nameFr: "Émeraude Prestige (Joaillerie, Déco & Gastronomie)",
    nameAr: "زمرد برستيج (المجوهرات والديكور الفاخر)",
    subtitleFr: "Ivoire Sauge 60% • Zellige 5% • Velours & Filet Or • Émeraude 10%",
    subtitleAr: "عاجي ناعم 60% • زليج مائي • بطاقات مخملية • أخضر زمردي 10%",
    heroLayout: "editorial-split",
    theme: {
      sector: "maison",
      canvasColor: "#F4F7F4",
      surfaceColor: "#FFFFFF",
      primaryColor: "#065F46",
      secondaryColor: "#14261C",
      accentColor: "#065F46",
      accentBadgeColor: "#B45309",
      fontFamily: "'Playfair Display', 'Plus Jakarta Sans', serif",
      borderRadiusPx: 16,
      spacingYPx: 28,
      titleFontSizePx: 36,
      bodyFontSizePx: 15,
      surfaceTexture: "zellige-watermark",
      ambientLighting: "natural",
      cardMaterial: "velvet-shadow",
      frameShape: "casbah-arch",
      letterSpacing: 0.01,
      lineHeight: 1.15,
      headingAccentStyle: "metallic-gold",
      headingUnderlineStyle: "golden-wave",
    },
  },
];

/**
 * Génère la Mise en Scène d'Accueil en 5 Actes (Actes 1 à 5)
 * Connectée de bout en bout au Studio Vendeur et à la Boutique Publique (/store/:sellerId)
 */
export function buildFiveActsHomeLayout(
  shopName = "Notre Maison",
  shopDescription = "Créations authentiques façonnées avec passion, expédiées dans les 69 wilayas avec paiement à la livraison.",
  bannerUrl?: string,
  activeProductIds: string[] = [],
  heroLayout: "editorial-split" | "cinema-full" | "atelier-collage" = "editorial-split"
): CustomPageSection[] {
  const cleanBanner =
    bannerUrl && bannerUrl.trim()
      ? bannerUrl
      : "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80";

  return [
    // ACTE 1 — Le Hero Scénographique (Editorial Split + Arche Casbah + Sceau Rotatif)
    {
      id: "sec_act1_hero",
      type: "hero_banner",
      title: "Acte 1 — Hero Scénographique",
      settings: {
        heroLayout,
        badgeText: "MAISON D'EXCELLENCE • ALGÉRIE",
        title: `L'Art de *${shopName}* — Pièces {Authentiques}`,
        subtitle: shopDescription,
        imageUrl: cleanBanner,
        ctaText: "Explorer la Collection",
        ctaLink: "#catalog",
        secondaryCtaText: "Notre Savoir-Faire",
        secondaryCtaLink: "#story",
        socialProofBadge: "FAIT MAIN EN ALGÉRIE • ÉDITION LIMITÉE •",
        ctaStyle: "pill",
        showBadge: true,
        showSubtitle: true,
        showCta: true,
      },
      styles: {
        containerWidth: "full",
        paddingY: "lg",
        borderRadius: "none",
        headingAccentStyle: "metallic-gold",
        headingUnderlineStyle: "brush-stroke",
      },
      isVisible: true,
      order: 0,
    },

    // ACTE 2 — Le Ruban Cinétique de Réassurance (KineticMarqueeSection)
    {
      id: "sec_act2_marquee",
      type: "kinetic_marquee",
      title: "Acte 2 — Ruban Cinétique",
      settings: {
        textFr:
          "LIVRAISON 69 WILAYAS • PAIEMENT À LA LIVRAISON (COD) • PIÈCES CERTIFIÉES & VÉRIFIÉES",
        textAr: "توصيل إلى 69 ولاية • الدفع عند الاستلام • قطع أصلية ومضمونة",
        showBilingual: true,
        speed: "normal",
        textStyle: "alternating",
        separator: "star",
        direction: "ltr",
        tiltDeg: 0,
        uppercase: true,
      },
      styles: {
        containerWidth: "full",
        paddingY: "sm",
      },
      isVisible: true,
      order: 1,
    },

    // ACTE 3 — Les Portes des Collections (3 Arches ou Cadres Galerie)
    {
      id: "sec_act3_categories",
      type: "featured_categories",
      title: "Acte 3 — Portes des Collections",
      settings: {
        title: "Nos *Collections* & {Univers}",
        subtitle: "Parcourez nos sélections thématiques façonnées pour chaque instant.",
        layout: "arch",
        categories: [
          {
            id: "cat_signature",
            name: "Pièces Signature",
            subtitle: "Créations iconiques de la maison",
            slug: "pieces-signature",
            badge: "N° 01",
            imageUrl:
              "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
          },
          {
            id: "cat_nouveautes",
            name: "Nouvelle Édition",
            subtitle: "Arrivages & séries limitées",
            slug: "nouvelle-edition",
            badge: "N° 02",
            imageUrl:
              "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
          },
          {
            id: "cat_essentiels",
            name: "Les Intemporels",
            subtitle: "Savoir-faire & élégance durable",
            slug: "les-intemporels",
            badge: "N° 03",
            imageUrl:
              "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800&q=80",
          },
        ],
      },
      styles: {
        containerWidth: "contained",
        paddingY: "lg",
        headingAccentStyle: "metallic-gold",
        headingUnderlineStyle: "brush-stroke",
      },
      isVisible: true,
      order: 2,
    },

    // ACTE 4 — La Sélection Pièces Maîtresses (Lookbook & Produits Vedettes)
    {
      id: "sec_act4_featured",
      type: "featured_products",
      title: "Acte 4 — Pièces Maîtresses",
      settings: {
        title: "Pièces *Maîtresses* & {Sélection}",
        subtitle: "Nos créations les plus convoitées, disponibles immédiatement.",
        productIds: activeProductIds.slice(0, 4),
        layout: "grid",
        cardAspectRatio: "4/5",
        columnsDesktop: 4,
        showCategory: true,
        showStockBadge: true,
      },
      styles: {
        containerWidth: "contained",
        paddingY: "md",
        headingAccentStyle: "metallic-gold",
        headingUnderlineStyle: "brush-stroke",
      },
      isVisible: true,
      order: 3,
    },

    // ACTE 5A — Le Catalogue Complet
    {
      id: "sec_act5_catalog",
      type: "product_grid",
      title: "Acte 5 — Catalogue Complet",
      settings: {
        title: "Tout le *Catalogue* de la {Maison}",
        subtitle: "Commandez en ligne en toute confiance avec livraison rapide dans votre wilaya.",
        maxItems: 12,
        layout: "grid",
        cardAspectRatio: "4/5",
        columnsDesktop: 4,
        showCategory: true,
        showStockBadge: true,
      },
      styles: {
        containerWidth: "contained",
        paddingY: "lg",
        headingAccentStyle: "metallic-gold",
        headingUnderlineStyle: "brush-stroke",
      },
      isVisible: true,
      order: 4,
    },

    // ACTE 5B — L'Histoire de la Maison & Sceau d'Atelier
    {
      id: "sec_act5_story",
      type: "brand_story",
      title: "Acte 5 — Manifeste & Histoire",
      settings: {
        heading: `L'Esprit de *${shopName}* — Savoir-Faire {Algérien}`,
        bodyText:
          shopDescription ||
          "Chaque pièce de notre collection est sélectionnée et contrôlée avec la plus grande exigence pour vous offrir une expérience digne des grandes maisons.",
        imageUrl: cleanBanner,
        signature: shopName,
        yearsOfExperience: 5,
        dropCap: true,
      },
      styles: {
        containerWidth: "contained",
        paddingY: "lg",
        borderRadius: "lg",
        headingAccentStyle: "metallic-gold",
        headingUnderlineStyle: "brush-stroke",
      },
      isVisible: true,
      order: 5,
    },
  ];
}
