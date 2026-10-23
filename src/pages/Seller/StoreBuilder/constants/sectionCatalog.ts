import React from "react";
import {
  Image as ImageIcon,
  Grid,
  BookOpen,
  ShieldCheck,
  ShoppingBag,
  HelpCircle,
  Phone,
  Sparkles,
  Layers,
} from "lucide-react";
import { CustomPageSectionType } from "../../../../domains/seller/customPage.types";
import { CATEGORY_PRESETS } from "./categoryPresets";

export interface SectionOption {
  type: CustomPageSectionType;
  title: string;
  category: "Bannières & Vitrine" | "Catalogue Produits" | "Marque & Histoire" | "Confiance & Contact";
  description: string;
  icon: React.ElementType;
  defaultSettings: Record<string, unknown>;
}

export const SECTION_CATALOG: SectionOption[] = [
  {
    type: "hero_banner",
    title: "Bannière Hero Plein Écran",
    category: "Bannières & Vitrine",
    icon: ImageIcon,
    description: "Grande image d'impact avec titre accrocheur, sous-titre et bouton d'action principal.",
    defaultSettings: {
      title: "Collection Exclusive",
      subtitle: "Qualité supérieure livrée dans les 69 Wilayas",
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
      ctaText: "Découvrir nos articles",
      ctaLink: "#catalog",
      textAlignment: "center",
      overlayOpacity: 35,
    },
  },
  {
    type: "promo_carousel",
    title: "Carrousel Promotionnel",
    category: "Bannières & Vitrine",
    icon: Sparkles,
    description: "Diaporama animé pour mettre en valeur vos offres du moment et réductions.",
    defaultSettings: {
      slides: [
        {
          id: "s1",
          imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80",
          title: "Offres Spéciales Semaine",
        },
      ],
      autoplay: true,
      intervalSec: 5,
    },
  },
  {
    type: "featured_products",
    title: "Grille d'Articles en Vedette",
    category: "Catalogue Produits",
    icon: ShoppingBag,
    description: "Sélection de produits phares avec prix en DZD, badge de stock et ajout rapide au panier.",
    defaultSettings: {
      title: "Nos Meilleures Ventes",
      productIds: [],
      layout: "grid",
    },
  },
  {
    type: "featured_categories",
    title: "Navigation par Catégories",
    category: "Catalogue Produits",
    icon: Grid,
    description: "Blocs visuels Canva de vos rayons ou collections phares pour faciliter la découverte.",
    defaultSettings: {
      ...CATEGORY_PRESETS[0].settings,
    },
  },
  {
    type: "curated_collections",
    title: "Collections éditoriales",
    category: "Catalogue Produits",
    icon: Layers,
    description: "Créez des sélections de produits autour d'un thème ou d'une saison.",
    defaultSettings: { title: "Nos collections", collections: [] },
  },
  {
    type: "new_arrivals",
    title: "Nouveautés",
    category: "Catalogue Produits",
    icon: ShoppingBag,
    description: "Mettez automatiquement vos derniers produits en avant.",
    defaultSettings: { title: "Nouveautés", subtitle: "Les dernières arrivées", maxItems: 8, layout: "grid" },
  },
  {
    type: "best_sellers",
    title: "Meilleures ventes",
    category: "Catalogue Produits",
    icon: ShoppingBag,
    description: "Présentez les articles que vos clients préfèrent.",
    defaultSettings: { title: "Les plus appréciés", maxItems: 8, layout: "grid" },
  },
  {
    type: "product_grid",
    title: "Catalogue complet",
    category: "Catalogue Produits",
    icon: Grid,
    description: "Affichez une grille de produits filtrable par catégorie.",
    defaultSettings: {
      title: "Tous nos produits",
      subtitle: "Découvrez toute la boutique",
      maxItems: 12,
      layout: "grid",
    },
  },
  {
    type: "brand_story",
    title: "Histoire de Marque & Valeurs",
    category: "Marque & Histoire",
    icon: BookOpen,
    description: "Racontez l'histoire de votre entreprise artisanale, vos origines et votre savoir-faire.",
    defaultSettings: {
      heading: "Notre passion & notre atelier",
      bodyText: "Présentez l'histoire, les valeurs et le savoir-faire de votre boutique.",
      imageUrl: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80",
    },
  },
  {
    type: "showcase_video",
    title: "Vidéo de présentation",
    category: "Marque & Histoire",
    icon: ImageIcon,
    description: "Ajoutez une vidéo de votre atelier, de vos produits ou de votre marque.",
    defaultSettings: { title: "Découvrez notre atelier", autoplay: false, loop: false, muted: true },
  },
  {
    type: "verified_reviews",
    title: "Avis clients vérifiés",
    category: "Confiance & Contact",
    icon: ShieldCheck,
    description: "Réservez un espace pour les retours d'expérience de vos clients.",
    defaultSettings: { title: "Ils nous font confiance", maxReviews: 6, filterMinRating: 4 },
  },
  {
    type: "delivery_info",
    title: "Livraison & délais",
    category: "Confiance & Contact",
    icon: Phone,
    description: "Expliquez vos délais, vos zones de livraison et vos offres de livraison.",
    defaultSettings: { title: "Livraison partout en Algérie", defaultTimeframe: "24h à 72h", freeShippingAbove: 15000 },
  },
  {
    type: "return_policy",
    title: "Retours & échanges",
    category: "Confiance & Contact",
    icon: ShieldCheck,
    description: "Présentez clairement vos conditions de retour et d'échange.",
    defaultSettings: {
      title: "Retours & échanges",
      delayDays: 14,
      conditions: "Décrivez ici les conditions de retour.",
      returnShippingFeeBy: "buyer",
    },
  },
  {
    type: "faq_accordion",
    title: "Foire Aux Questions (FAQ)",
    category: "Confiance & Contact",
    icon: HelpCircle,
    description: "Répondez aux questions fréquentes sur vos délais, tailles et garanties.",
    defaultSettings: {
      title: "Questions Fréquentes",
      items: [
        { question: "Quels sont vos délais de livraison ?", answer: "Entre 24h et 72h selon votre wilaya." },
        { question: "Comment contacter la boutique ?", answer: "Retrouvez nos coordonnées dans la section contact." },
      ],
    },
  },
  {
    type: "contact_footer",
    title: "Coordonnées & Support Boutique",
    category: "Confiance & Contact",
    icon: Phone,
    description: "Affichez votre numéro de service client, adresse, email et horaires d'ouverture.",
    defaultSettings: {
      workingHours: "Samedi au Jeudi de 09h00 à 18h00",
    },
  },
];
