import {
  CustomPageSection,
  CustomPageTheme,
  StoreThemeSector,
} from "../../../../../domains/seller/customPage.types";
import { getSectorCategoryPreset } from "../../constants/sectorCoherenceDefaults";
import { getSectorMediaAsset } from "../../constants/studioThemeDefaults";

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

export interface ArchetypeBlueprint {
  id: string;
  name: string;
  tagline: string;
  sector: StoreThemeSector;
  badge: string;
  layoutPreviewType: "bento" | "bubbles" | "editorial" | "tech";
  thumbnailUrl?: string;
  primary: string;
  secondary: string;
  accent: string;
  canvas: string;
  surface?: string;
  font: string;
  borderRadiusPx?: number;
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  heroVariant: string;
  heroLayout?: "editorial-split" | "cinema-full" | "atelier-collage";
  categoryLayout?: "grid" | "bento" | "bubbles" | "overlay" | "arch" | "accordion" | "magazine" | "pills";
  deliveryTitle: string;
  features: string[];
}

export function createModernArchetype(cfg: ArchetypeBlueprint): MasterThemeArchetype {
  const thumb = cfg.thumbnailUrl || getSectorMediaAsset(cfg.sector);
  const sectorPreset = getSectorCategoryPreset(cfg.sector);
  const isSquareCard = cfg.sector === "tech" || cfg.sector === "beaute" || cfg.sector === "alimentation" || cfg.sector === "enfants";

  return {
    id: cfg.id,
    name: cfg.name,
    tagline: cfg.tagline,
    sector: cfg.sector,
    badge: cfg.badge,
    layoutPreviewType: cfg.layoutPreviewType,
    thumbnailUrl: thumb,
    features: cfg.features,
    theme: {
      sector: cfg.sector,
      primaryColor: cfg.primary,
      secondaryColor: cfg.secondary,
      accentColor: cfg.accent,
      accentBadgeColor: cfg.primary,
      canvasColor: cfg.canvas,
      surfaceColor: cfg.surface || "#FFFFFF",
      fontFamily: cfg.font,
      borderRadiusPx: cfg.borderRadiusPx ?? 12,
      spacingYPx: 28,
      titleFontSizePx: 34,
      bodyFontSizePx: 15,
      surfaceTexture: "none",
      ambientLighting: "natural",
      cardMaterial: "solid-matte",
      frameShape: cfg.borderRadiusPx === 0 ? "sharp-couture" : "soft-modern",
      headingAccentStyle: "accent-color",
      headingUnderlineStyle: "hairline",
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
            heroLayout: cfg.heroLayout || "editorial-split",
            title: cfg.heroTitle,
            subtitle: cfg.heroSubtitle,
            badgeText: cfg.heroBadge,
            imageUrl: customHeroImageUrl || thumb,
            imageAlt: cfg.name,
            ctaText: "Découvrir le Catalogue",
            ctaLink: "#catalog",
            ctaStyle: "solid",
            overlayOpacity: 25,
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
            ...(cfg.categoryLayout ? { layout: cfg.categoryLayout } : {}),
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
            title: "Pièces *Phares* & {Sélection}",
            subtitle: "Disponibilité immédiate avec livraison rapide",
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
          title: "Livraison & Garanties",
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
