import { PromoCarouselStyleVariant, PromoSlide, BannerContentPosition } from "../../../../domains/seller/customPage.types";

export interface CarouselStyleOption {
  id: PromoCarouselStyleVariant;
  label: string;
  sublabel: string;
  badge: string;
  description: string;
}

export interface CarouselCampaignPreset {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  carouselStyle: PromoCarouselStyleVariant;
  bannerHeight: "sm" | "md" | "lg" | "xl";
  overlayOpacity: number;
  contentPosition: BannerContentPosition;
  slides: PromoSlide[];
}

export const CAROUSEL_STYLE_OPTIONS: CarouselStyleOption[] = [
  {
    id: "editorial_luxury",
    label: "Éditorial Luxe",
    sublabel: "Cinéma & barre animée",
    badge: "Signature",
    description: "Plein cadre immersif avec dégradé intelligent, badge capsule, compteur 01/04 et barre de progression.",
  },
  {
    id: "floating_glass",
    label: "Capsule Glass",
    sublabel: "Carte givrée flottante",
    badge: "Tendance",
    description: "Vos textes et boutons flottent dans un écrin en verre dépoli positionnable sur 9 points.",
  },
  {
    id: "split_magazine",
    label: "Split Magazine",
    sublabel: "Éditorial 50/50",
    badge: "Magazine",
    description: "Mise en page asymétrique haute couture : colonne typographique dédiée à gauche et visuel encadré à droite.",
  },
  {
    id: "offer_spotlight",
    label: "Spotlight Promo",
    sublabel: "Étiquette prix & flash",
    badge: "Conversion",
    description: "Idéal pour les ventes flash : macaron de remise détaché, accroche prix DZD et CTA très contrasté.",
  },
  {
    id: "lookbook_peek",
    label: "Galerie Lookbook",
    sublabel: "Cadre & aperçu suivant",
    badge: "Lookbook",
    description: "Présente la diapositive active dans un cadre galerie avec aperçu de la diapositive suivante.",
  },
];

export const QUICK_SLIDE_BADGES = [
  "OFFRE FLASH -30%",
  "NOUVELLE COLLECTION",
  "LIVRAISON 69 WILAYAS",
  "ÉDITION LIMITÉE",
  "MEILLEURE VENTE",
  "PAIEMENT À LA LIVRAISON",
];

export const CAROUSEL_CAMPAIGN_PRESETS: CarouselCampaignPreset[] = [
  {
    id: "preset_flash_weekend",
    name: "Vente Flash Week-end (-30%)",
    tagline: "3 slides orientées conversion immédiate avec prix DZD et urgence",
    badge: "Haute Conversion",
    carouselStyle: "offer_spotlight",
    bannerHeight: "md",
    overlayOpacity: 50,
    contentPosition: "bottom-left",
    slides: [
      {
        id: "flash_1",
        imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80",
        badge: "VENTES PRIVÉES • -30%",
        title: "Offres Spéciales de la Semaine",
        subtitle: "Profitez de remises immédiates sur nos articles les plus demandés. Quantités limitées.",
        highlightPrice: "Jusqu'à -30% dès aujourd'hui",
        ctaText: "Profiter des offres",
        link: "#catalog",
        contentPosition: "bottom-left",
      },
      {
        id: "flash_2",
        imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
        badge: "PACKS EXCLUSIFS",
        title: "Nos Coffrets & Sélections",
        subtitle: "Économisez sur nos ensembles préparés avec soin et livrés chez vous en 24h/48h.",
        highlightPrice: "À partir de 3 900 DA",
        ctaText: "Voir les coffrets",
        link: "#catalog",
        contentPosition: "bottom-left",
      },
      {
        id: "flash_3",
        imageUrl: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80",
        badge: "SERVICE CLIENT 7J/7",
        title: "Paiement à la Livraison 69 Wilayas",
        subtitle: "Vérifiez votre commande à la réception en toute sérénité partout en Algérie.",
        highlightPrice: "Livraison Rapide",
        ctaText: "Découvrir le catalogue",
        link: "#catalog",
        contentPosition: "bottom-left",
      },
    ],
  },
  {
    id: "preset_editorial_launch",
    name: "Lancement Nouvelle Collection",
    tagline: "Style Éditorial Luxe plein cadre pour valoriser votre image de marque",
    badge: "Prestige",
    carouselStyle: "editorial_luxury",
    bannerHeight: "lg",
    overlayOpacity: 40,
    contentPosition: "bottom-left",
    slides: [
      {
        id: "lux_1",
        imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
        badge: "NOUVELLE SAISON",
        title: "L'Élégance dans Chaque Détail",
        subtitle: "Découvrez nos nouvelles pièces conçues avec des matériaux nobles et un savoir-faire authentique.",
        highlightPrice: "Édition Limitée",
        ctaText: "Explorer la collection",
        link: "#catalog",
        contentPosition: "bottom-left",
      },
      {
        id: "lux_2",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
        badge: "SÉLECTION SIGNATURE",
        title: "Les Incontournables de la Maison",
        subtitle: "Les créations plébiscitées par nos clients fidèles à travers toute l'Algérie.",
        highlightPrice: "Qualité Garantie",
        ctaText: "Voir les best-sellers",
        link: "#catalog",
        contentPosition: "center",
      },
    ],
  },
  {
    id: "preset_split_magazine",
    name: "Lookbook Magazine 50/50",
    tagline: "Mise en page Split Magazine ultra-lisible sans aucun texte sur la photo",
    badge: "Éditorial",
    carouselStyle: "split_magazine",
    bannerHeight: "md",
    overlayOpacity: 25,
    contentPosition: "center-left",
    slides: [
      {
        id: "mag_1",
        imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
        badge: "LOOKBOOK N°01",
        title: "Tendances & Nouveautés",
        subtitle: "Une présentation épurée qui laisse respirer vos photos produits tout en mettant vos arguments en valeur.",
        highlightPrice: "Nouveaux Arrivages",
        ctaText: "Parcourir le lookbook",
        link: "#catalog",
      },
      {
        id: "mag_2",
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
        badge: "LOOKBOOK N°02",
        title: "Confort & Finitions Premium",
        subtitle: "Chaque article est contrôlé avant expédition pour vous garantir une satisfaction totale.",
        highlightPrice: "Expédition 24h/48h",
        ctaText: "Commander maintenant",
        link: "#catalog",
      },
    ],
  },
];
