import type { CustomPageSectionStyles, CustomPageTheme } from "../../../../../../domains/seller/customPage.types";

export type SectionColorFieldKey =
  | "backgroundColor"
  | "sectionBorderColor"
  | "dividerColor"
  | "headingColor"
  | "subtitleColor"
  | "kickerColor"
  | "textColor"
  | "cardBgColor"
  | "cardTextColor"
  | "cardBorderColor"
  | "priceColor"
  | "badgeBgColor"
  | "badgeTextColor"
  | "iconColor"
  | "overlayColor"
  | "buttonBgColor"
  | "buttonTextColor"
  | "buttonBorderColor";

export interface ColorSlotItem {
  key: SectionColorFieldKey;
  label: string;
  fallback: string;
  heroSyncKey?: string;
}

export interface ColorSlotGroup {
  id: string;
  title: string;
  items: ColorSlotItem[];
}

const CARD_SECTIONS = new Set<string>([
  "featured_categories", "curated_collections", "new_arrivals", "featured_products",
  "best_sellers", "product_grid", "brand_story", "showcase_video",
  "verified_reviews", "delivery_info", "return_policy", "faq_accordion", "contact_footer",
]);

export const PRICE_SECTIONS = new Set<string>([
  "hero_banner", "promo_carousel", "curated_collections", "new_arrivals",
  "featured_products", "best_sellers", "product_grid", "delivery_info",
]);

const OVERLAY_SECTIONS = new Set<string>([
  "hero_banner", "promo_carousel", "featured_categories", "showcase_video",
]);

const BUTTON_SECTIONS = new Set<string>([
  "hero_banner", "promo_carousel", "curated_collections", "new_arrivals",
  "featured_products", "best_sellers", "product_grid", "brand_story", "showcase_video",
]);

export function buildSectionColorGroups(
  sectionType: string | undefined,
  theme?: CustomPageTheme
): ColorSlotGroup[] {
  const hasCards = !sectionType || CARD_SECTIONS.has(sectionType);
  const hasPrices = !sectionType || PRICE_SECTIONS.has(sectionType);
  const hasOverlay = !sectionType || OVERLAY_SECTIONS.has(sectionType);
  const hasButtons = !sectionType || BUTTON_SECTIONS.has(sectionType);

  const primary = theme?.primaryColor || "#0F172A";
  const secondary = theme?.secondaryColor || "#1E293B";
  const accent = theme?.accentColor || primary;
  const surface = theme?.surfaceColor || "#FFFFFF";
  const canvas = theme?.canvasColor || "#F8FAFC";
  const border = theme?.borderColor || "#E5E7EB";

  return [
    {
      id: "surface",
      title: "1. Fond, Cadre & Séparateur",
      items: [
        { key: "backgroundColor", label: "Fond de la section", fallback: canvas, heroSyncKey: "bannerBgColor" },
        { key: "sectionBorderColor", label: "Bordure de la section", fallback: border, heroSyncKey: "bannerBorderColor" },
        { key: "dividerColor", label: "Séparateur bas", fallback: primary },
        ...(hasOverlay ? [{ key: "overlayColor" as const, label: "Voile photo / vidéo", fallback: "#090D16" }] : []),
      ],
    },
    {
      id: "typography",
      title: "2. Titres, Surtitres & Textes",
      items: [
        { key: "headingColor", label: "Titre principal (H1/H2)", fallback: secondary, heroSyncKey: "titleColor" },
        { key: "subtitleColor", label: "Sous-titre", fallback: "#475467", heroSyncKey: "subtitleColor" },
        { key: "kickerColor", label: "Surtitre & soulignement", fallback: accent },
        { key: "textColor", label: "Texte courant", fallback: secondary },
      ],
    },
    ...(hasCards
      ? [
          {
            id: "cards",
            title: "3. Cartes, Blocs & Prix",
            items: [
              { key: "cardBgColor" as const, label: "Fond des cartes", fallback: surface },
              { key: "cardTextColor" as const, label: "Texte des cartes", fallback: secondary },
              { key: "cardBorderColor" as const, label: "Bordure des cartes", fallback: border },
              ...(hasPrices ? [{ key: "priceColor" as const, label: "Prix & tarifs (DA)", fallback: primary }] : []),
            ],
          },
        ]
      : []),
    {
      id: "badges",
      title: "4. Badges & Icônes",
      items: [
        { key: "badgeBgColor", label: "Fond des badges", fallback: primary, heroSyncKey: "badgeBgColor" },
        { key: "badgeTextColor", label: "Texte des badges", fallback: "#FFFFFF", heroSyncKey: "badgeTextColor" },
        { key: "iconColor", label: "Icônes & étoiles", fallback: accent },
      ],
    },
    ...(hasButtons
      ? [
          {
            id: "buttons",
            title: "5. Boutons d'Action (CTA)",
            items: [
              { key: "buttonBgColor" as const, label: "Fond du bouton", fallback: primary, heroSyncKey: "ctaBgColor" },
              { key: "buttonTextColor" as const, label: "Texte du bouton", fallback: "#FFFFFF", heroSyncKey: "ctaTextColor" },
              { key: "buttonBorderColor" as const, label: "Bordure du bouton", fallback: primary, heroSyncKey: "ctaBorderColor" },
            ],
          },
        ]
      : []),
  ];
}

export type { CustomPageSectionStyles };
