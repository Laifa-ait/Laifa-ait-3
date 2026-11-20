import {
  CustomPageSection,
  StoreThemeSector,
} from "../../../../domains/seller/customPage.types";
import {
  DEFAULT_STUDIO_SECTOR,
  buildSectorAwareSectionDefaults,
  getSectorCategoriesForArchetype,
} from "./sectorCoherenceDefaults";
import { getSectorMediaAsset } from "./studioThemeDefaults";

export {
  ARTISTIC_STUDIO_PRESETS,
  type ArtisticStudioPreset,
} from "./artisticStudioPresets";

export function buildFiveActsHomeLayout(
  shopName = "Notre Boutique",
  shopDescription = "Sélection contemporaine préparée avec soin, expédiée sous 24h à 72h avec paiement à la livraison.",
  bannerUrl?: string,
  activeProductIds: string[] = [],
  heroLayout: "editorial-split" | "cinema-full" | "atelier-collage" = "editorial-split",
  sector: StoreThemeSector = DEFAULT_STUDIO_SECTOR
): CustomPageSection[] {
  const sectorHero = buildSectorAwareSectionDefaults("hero_banner", {}, sector);
  const sectorCategories = getSectorCategoriesForArchetype(sector).slice(0, 4);

  const cleanBanner =
    bannerUrl && bannerUrl.trim()
      ? bannerUrl
      : (sectorHero.imageUrl as string) || getSectorMediaAsset(sector);

  const modernHeadingStyle = {
    headingAccentStyle: "accent-color" as const,
    headingUnderlineStyle: "hairline" as const,
  };

  return [
    {
      id: "sec_act1_hero",
      type: "hero_banner",
      title: "Bannière Principale",
      settings: {
        heroLayout,
        badgeText: (sectorHero.badgeText as string) || "NOUVELLE COLLECTION",
        title:
          shopName && shopName !== "Notre Boutique" && shopName !== "Notre Maison"
            ? `${shopName} — Collection & Essentiels`
            : (sectorHero.title as string) || "Sélection Contemporaine & Pièces Phares",
        subtitle: shopDescription || (sectorHero.subtitle as string),
        imageUrl: cleanBanner,
        ctaText: (sectorHero.ctaText as string) || "Découvrir le Catalogue",
        ctaLink: "#catalog",
        secondaryCtaText: "Nos Rayons",
        secondaryCtaLink: "#collections",
        socialProofBadge: "LIVRAISON 69 WILAYAS • PAIEMENT À LA RÉCEPTION",
        showSocialProofBadge: false,
        overlayOpacity: 0,
        ctaStyle: "solid",
        showBadge: true,
        showSubtitle: true,
        showCta: true,
      },
      styles: {
        containerWidth: heroLayout === "cinema-full" ? "full" : "contained",
        paddingY: "lg",
        borderRadius: heroLayout === "cinema-full" ? "none" : "md",
        ...modernHeadingStyle,
      },
      isVisible: true,
      order: 0,
    },
    {
      id: "sec_act2_marquee",
      type: "kinetic_marquee",
      title: "Bandeau d'Information",
      settings: {
        textFr: "LIVRAISON 69 WILAYAS • PAIEMENT À LA LIVRAISON • QUALITÉ CONTRÔLÉE",
        textAr: "توصيل إلى 69 ولاية • الدفع عند الاستلام • جودة مضمونة",
        showBilingual: true,
        speed: "normal",
        textStyle: "alternating",
        separator: "dot",
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
    {
      id: "sec_act3_categories",
      type: "featured_categories",
      title: "Rayons & Collections",
      settings: {
        title: "Nos *Rayons* & {Collections}",
        subtitle: "Parcourez nos sélections structurées par univers.",
        layout: sector === "tech" || sector === "sport" ? "bento" : "grid",
        categories: sectorCategories,
      },
      styles: {
        containerWidth: "contained",
        paddingY: "lg",
        ...modernHeadingStyle,
      },
      isVisible: true,
      order: 2,
    },
    {
      id: "sec_act4_featured",
      type: "featured_products",
      title: "Sélection Vedette",
      settings: {
        title: "Pièces *Phares* & {Nouveautés}",
        subtitle: "Nos articles les plus demandés, disponibles immédiatement.",
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
        ...modernHeadingStyle,
      },
      isVisible: true,
      order: 3,
    },
    {
      id: "sec_act5_catalog",
      type: "product_grid",
      title: "Catalogue Complet",
      settings: {
        title: "Tout le *Catalogue*",
        subtitle: "Commandez en ligne avec expédition suivie dans votre wilaya.",
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
        ...modernHeadingStyle,
      },
      isVisible: true,
      order: 4,
    },
    {
      id: "sec_act5_story",
      type: "brand_story",
      title: "Manifeste de Marque",
      settings: {
        heading: `L'Approche *${shopName}* — Design & {Qualité}`,
        bodyText:
          shopDescription ||
          "Chaque référence est contrôlée selon nos standards d'exigence afin de garantir durabilité, justesse des matériaux et expérience client irréprochable.",
        imageUrl: cleanBanner,
        signature: shopName,
        yearsOfExperience: 5,
        dropCap: true,
      },
      styles: {
        containerWidth: "contained",
        paddingY: "lg",
        borderRadius: "lg",
        ...modernHeadingStyle,
      },
      isVisible: true,
      order: 5,
    },
  ];
}
