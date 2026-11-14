import {
  CustomPageSection,
  StoreThemeSector,
} from "../../../../domains/seller/customPage.types";
import {
  buildSectorAwareSectionDefaults,
  getSectorCategoriesForArchetype,
} from "./sectorCoherenceDefaults";

export {
  ARTISTIC_STUDIO_PRESETS,
  type ArtisticStudioPreset,
} from "./artisticStudioPresets";

/**
 * Génère la Mise en Scène d'Accueil en 5 Actes (Actes 1 à 5)
 * 100% cohérente avec le secteur/univers choisi (9 secteurs supportés)
 */
export function buildFiveActsHomeLayout(
  shopName = "Notre Maison",
  shopDescription = "Créations authentiques façonnées avec passion, expédiées dans les 69 wilayas avec paiement à la livraison.",
  bannerUrl?: string,
  activeProductIds: string[] = [],
  heroLayout: "editorial-split" | "cinema-full" | "atelier-collage" = "editorial-split",
  sector: StoreThemeSector = "artisanat"
): CustomPageSection[] {
  const sectorHero = buildSectorAwareSectionDefaults("hero_banner", {}, sector);
  const sectorCategories = getSectorCategoriesForArchetype(sector).slice(0, 4);

  const cleanBanner =
    bannerUrl && bannerUrl.trim()
      ? bannerUrl
      : (sectorHero.imageUrl as string) ||
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80";

  return [
    // ACTE 1 — Le Hero Scénographique adapté à l'univers
    {
      id: "sec_act1_hero",
      type: "hero_banner",
      title: "Acte 1 — Hero Scénographique",
      settings: {
        heroLayout,
        badgeText: (sectorHero.badgeText as string) || "BOUTIQUE OFFICIELLE",
        title:
          shopName && shopName !== "Notre Maison"
            ? `${shopName} — Collection & Produits Phares`
            : (sectorHero.title as string) || "Notre Sélection de Produits Phares",
        subtitle: shopDescription || (sectorHero.subtitle as string),
        imageUrl: cleanBanner,
        ctaText: (sectorHero.ctaText as string) || "Voir les Produits",
        ctaLink: "#catalog",
        secondaryCtaText: "Nos Catégories",
        secondaryCtaLink: "#collections",
        socialProofBadge: "LIVRAISON 69 WILAYAS • PAIEMENT À LA LIVRAISON",
        showSocialProofBadge: false,
        overlayOpacity: 0,
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

    // ACTE 3 — Les Portes des Collections (Cohérentes avec le Secteur choisi)
    {
      id: "sec_act3_categories",
      type: "featured_categories",
      title: "Acte 3 — Portes des Collections",
      settings: {
        title: "Nos *Rayons* & {Collections}",
        subtitle: "Parcourez nos sélections thématiques pensées pour votre univers.",
        layout: sector === "tech" || sector === "sport" ? "bento" : "arch",
        categories: sectorCategories,
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
        subtitle: "Nos articles les plus convoités, disponibles immédiatement.",
        productIds: activeProductIds.slice(0, 4),
        layout: "grid",
        cardAspectRatio: sector === "tech" ? "1/1" : "4/5",
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
        title: "Tout le *Catalogue* de la {Boutique}",
        subtitle: "Commandez en ligne en toute confiance avec livraison rapide dans votre wilaya.",
        maxItems: 12,
        layout: "grid",
        cardAspectRatio: sector === "tech" ? "1/1" : "4/5",
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
          "Chaque article de notre sélection est contrôlé avec la plus grande exigence pour vous offrir une expérience irréprochable dans les 69 Wilayas.",
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
