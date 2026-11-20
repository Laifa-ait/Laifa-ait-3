import { PromoCarouselStyleVariant, PromoSlide, BannerContentPosition } from "../../../../domains/seller/customPage.types";
import { STUDIO_MEDIA_ASSETS } from "./studioThemeDefaults";

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
    description: "Plein cadre immersif avec dégradé mesuré, compteur 01/04 et barre de progression.",
  },
  {
    id: "floating_glass",
    label: "Capsule Glass",
    sublabel: "Carte givrée flottante",
    badge: "Moderne",
    description: "Textes et bouton dans un écrin en verre dépoli positionnable sur 9 points.",
  },
  {
    id: "split_magazine",
    label: "Split Magazine",
    sublabel: "Éditorial 50/50",
    badge: "Magazine",
    description: "Mise en page asymétrique : colonne typographique dédiée et visuel pleine hauteur.",
  },
  {
    id: "offer_spotlight",
    label: "Spotlight Offre",
    sublabel: "Accroche prix & CTA net",
    badge: "Conversion",
    description: "Mise en avant directe d'une offre limitée avec tarif DZD clair et appel à l'action contrasté.",
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
  "OFFRE LIMITÉE",
  "NOUVELLE COLLECTION",
  "LIVRAISON 69 WILAYAS",
  "ÉDITION STUDIO",
  "MEILLEURE VENTE",
  "PAIEMENT À LA LIVRAISON",
];

export const CAROUSEL_CAMPAIGN_PRESETS: CarouselCampaignPreset[] = [
  {
    id: "preset_flash_weekend",
    name: "Sélection Temporaire",
    tagline: "3 slides orientées conversion avec tarif clair et délais 24h-48h",
    badge: "Conversion",
    carouselStyle: "offer_spotlight",
    bannerHeight: "md",
    overlayOpacity: 50,
    contentPosition: "bottom-left",
    slides: [
      {
        id: "flash_1",
        imageUrl: STUDIO_MEDIA_ASSETS.fashion,
        badge: "VENTES PRIVÉES",
        title: "Sélection *Exclusive* de la {Semaine}",
        subtitle: "Profitez de remises immédiates sur nos pièces phares en quantité limitée.",
        highlightPrice: "Jusqu'à -30%",
        ctaText: "Découvrir l'offre",
        link: "#catalog",
        contentPosition: "bottom-left",
      },
      {
        id: "flash_2",
        imageUrl: STUDIO_MEDIA_ASSETS.beauty,
        badge: "COFFRETS STUDIO",
        title: "Les *Essentiels* en {Coffret}",
        subtitle: "Ensembles préparés avec soin et expédiés en 24h/48h.",
        highlightPrice: "À partir de 3 900 DA",
        ctaText: "Voir les coffrets",
        link: "#catalog",
        contentPosition: "bottom-left",
      },
      {
        id: "flash_3",
        imageUrl: STUDIO_MEDIA_ASSETS.tech,
        badge: "SERVICE 69 WILAYAS",
        title: "Paiement à la Livraison Contrôlée",
        subtitle: "Vérifiez votre commande à la réception en toute sérénité.",
        highlightPrice: "Livraison Rapide",
        ctaText: "Voir le catalogue",
        link: "#catalog",
        contentPosition: "bottom-left",
      },
    ],
  },
  {
    id: "preset_editorial_launch",
    name: "Lancement Nouvelle Saison",
    tagline: "Plein cadre éditorial haute lisibilité pour valoriser votre marque",
    badge: "Prestige",
    carouselStyle: "editorial_luxury",
    bannerHeight: "lg",
    overlayOpacity: 40,
    contentPosition: "bottom-left",
    slides: [
      {
        id: "lux_1",
        imageUrl: STUDIO_MEDIA_ASSETS.fashion,
        badge: "NOUVELLE SAISON",
        title: "La *Précision* dans Chaque {Détail}",
        subtitle: "Découvrez nos nouvelles pièces aux lignes architecturales et finitions maîtrisées.",
        highlightPrice: "Édition Studio",
        ctaText: "Explorer la collection",
        link: "#catalog",
        contentPosition: "bottom-left",
      },
      {
        id: "lux_2",
        imageUrl: STUDIO_MEDIA_ASSETS.interior,
        badge: "SÉLECTION SIGNATURE",
        title: "Les *Incontournables* de la {Galerie}",
        subtitle: "Des pièces pensées pour durer et s'intégrer naturellement à votre quotidien.",
        highlightPrice: "Qualité Certifiée",
        ctaText: "Voir la sélection",
        link: "#catalog",
        contentPosition: "center",
      },
    ],
  },
  {
    id: "preset_split_magazine",
    name: "Lookbook Magazine 50/50",
    tagline: "Mise en page Split Magazine sans superposition sur la photo",
    badge: "Éditorial",
    carouselStyle: "split_magazine",
    bannerHeight: "md",
    overlayOpacity: 20,
    contentPosition: "center-left",
    slides: [
      {
        id: "mag_1",
        imageUrl: STUDIO_MEDIA_ASSETS.fashion,
        badge: "LOOKBOOK 01",
        title: "Silhouettes & Nouveautés",
        subtitle: "Une présentation aérée qui laisse respirer vos visuels produits tout en clarifiant votre offre.",
        highlightPrice: "Nouveaux Arrivages",
        ctaText: "Parcourir le lookbook",
        link: "#catalog",
      },
      {
        id: "mag_2",
        imageUrl: STUDIO_MEDIA_ASSETS.sport,
        badge: "LOOKBOOK 02",
        title: "Design & Matières Techniques",
        subtitle: "Chaque article est inspecté avant expédition.",
        highlightPrice: "Expédition 24h/48h",
        ctaText: "Commander",
        link: "#catalog",
      },
    ],
  },
];
