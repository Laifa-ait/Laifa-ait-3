import { CustomPageTheme, HeroBannerSettings, HeroColorPaletteId, HeroLayoutModelId, StoreThemeSector } from "../../../../domains/seller/customPage.types";
import { Product } from "../../../../domains/product/product.types";
import { isCatalogProductPubliclyActive } from "../../../../domains/seller/studioCatalogResolver";
import { normalizeHeroLayoutModelId } from "../../../../components/Store/sections/hero/heroResponsiveHelper";
import { DEFAULT_MODERN_SECTOR, DEFAULT_MODERN_THEME } from "./studioThemeDefaults";

export interface HeroModelCapabilities {
  supportsOverlayControls: boolean;
  supportsOverlayDirection: boolean;
  supportsSplitControls: boolean;
  supportsArchControls: boolean;
  supportsGalleryControls: boolean;
  supportsDiptychControls: boolean;
  supportsBadgeAndSecondaryCta: boolean;
  supportsImageShadow: boolean;
  maxImages: 1 | 2 | 3;
  uniqueConfigLabel: string;
  roleSummary: string;
}

export interface HeroLayoutModelPreset {
  id: HeroLayoutModelId;
  componentName: "HeroFullBleed" | "HeroSplit" | "HeroArch" | "HeroGallery" | "HeroDiptych";
  label: string;
  subtitle: string;
  badge: string;
  description: string;
  capabilities: HeroModelCapabilities;
  defaultSettings: Partial<HeroBannerSettings>;
}

export interface HeroColorPalettePreset {
  id: Exclude<HeroColorPaletteId, "custom">;
  label: string;
  bannerBgColor: string;
  bannerBgGradient: string;
  titleColor: string;
  subtitleColor: string;
  ctaBgColor: string;
  ctaTextColor: string;
}

export const HERO_COLOR_PALETTES: HeroColorPalettePreset[] = [
  { id: "pure-white", label: "Clair", bannerBgColor: "#FFFFFF", bannerBgGradient: "", titleColor: "#0F172A", subtitleColor: "#475569", ctaBgColor: "#0F172A", ctaTextColor: "#FFFFFF" },
  { id: "cream-earth", label: "Gris doux", bannerBgColor: "#F4F4F5", bannerBgGradient: "linear-gradient(135deg, #F8FAFC 0%, #E4E4E7 100%)", titleColor: "#18181B", subtitleColor: "#52525B", ctaBgColor: "#18181B", ctaTextColor: "#FFFFFF" },
  { id: "luxury-black", label: "Sombre", bannerBgColor: "#121214", bannerBgGradient: "linear-gradient(135deg, #121214 0%, #1F1F23 100%)", titleColor: "#FAF8F5", subtitleColor: "#D4D4D8", ctaBgColor: "#FAF8F5", ctaTextColor: "#121214" },
  { id: "midnight-silver", label: "Bleu nuit", bannerBgColor: "#0F172A", bannerBgGradient: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)", titleColor: "#F8FAFC", subtitleColor: "#CBD5E1", ctaBgColor: "#E2E8F0", ctaTextColor: "#0F172A" },
  { id: "sage-linen", label: "Vert sauge", bannerBgColor: "#F2F5F3", bannerBgGradient: "linear-gradient(135deg, #F2F5F3 0%, #E2EBE5 100%)", titleColor: "#14261D", subtitleColor: "#40594C", ctaBgColor: "#1B4332", ctaTextColor: "#FFFFFF" },
];

export function buildThemeHeroPalette(theme?: CustomPageTheme): HeroColorPalettePreset {
  const t = theme || DEFAULT_MODERN_THEME;
  return {
    id: "pure-white",
    label: "Thème du site",
    bannerBgColor: t.surfaceColor || t.canvasColor || "#FFFFFF",
    bannerBgGradient: "",
    titleColor: t.secondaryColor || t.textColor || "#0F172A",
    subtitleColor: t.mutedTextColor || "#475569",
    ctaBgColor: t.buttonColor || t.primaryColor || "#0F172A",
    ctaTextColor: t.buttonTextColor || "#FFFFFF",
  };
}

const BASE_CAPS: HeroModelCapabilities = {
  supportsOverlayControls: false, supportsOverlayDirection: false, supportsSplitControls: false,
  supportsArchControls: false, supportsGalleryControls: false, supportsDiptychControls: false,
  supportsBadgeAndSecondaryCta: true, supportsImageShadow: true, maxImages: 1,
  uniqueConfigLabel: "Réglages de ce modèle", roleSummary: "",
};

export const HERO_LAYOUT_MODELS: HeroLayoutModelPreset[] = [
  {
    id: "cinema-full",
    componentName: "HeroFullBleed",
    label: "Grande photo fond entier",
    subtitle: "Texte posé sur la photo",
    badge: "Modèle 1",
    description: "Une grande photo occupe toute la bannière, avec votre texte et votre bouton par-dessus.",
    capabilities: {
      ...BASE_CAPS,
      supportsOverlayControls: true,
      supportsOverlayDirection: true,
      supportsBadgeAndSecondaryCta: false,
      supportsImageShadow: false,
      maxImages: 1,
      uniqueConfigLabel: "Voile sombre pour lire le texte sur la photo",
      roleSummary: "Grande photo plein format avec texte et bouton unique",
    },
    defaultSettings: {
      heroLayout: "cinema-full",
      containerMode: "full",
      borderRadiusPx: 0,
      innerPaddingPx: 32,
      textPosition9: "bottom-left",
      textAlignment: "left",
      overlayOpacity: 35,
    },
  },
  {
    id: "editorial-split",
    componentName: "HeroSplit",
    label: "Texte et photo côte à côte",
    subtitle: "Deux zones bien séparées",
    badge: "Modèle 2",
    description: "Le texte est sur un fond uni d'un côté et la photo est affichée nette de l'autre.",
    capabilities: {
      ...BASE_CAPS,
      supportsSplitControls: true,
      maxImages: 1,
      uniqueConfigLabel: "Répartition entre le texte et la photo",
      roleSummary: "Séparation claire entre texte sur fond uni et photo nette",
    },
    defaultSettings: {
      heroLayout: "editorial-split",
      containerMode: "contained",
      splitProportion: "50-50",
      imageSide: "right",
      borderRadiusPx: 16,
      innerPaddingPx: 32,
      textPosition9: "center-left",
      textAlignment: "left",
      overlayOpacity: 0,
    },
  },
  {
    id: "arch-palace",
    componentName: "HeroArch",
    label: "Photo avec forme découpée",
    subtitle: "Arche, rond ou cadre arrondi",
    badge: "Modèle 3",
    description: "La photo est découpée dans une forme élégante à côté de votre texte.",
    capabilities: {
      ...BASE_CAPS,
      supportsSplitControls: true,
      supportsArchControls: true,
      maxImages: 1,
      uniqueConfigLabel: "Forme et position de la photo découpée",
      roleSummary: "Découpe en arche, ovale ou cadre arrondi face au texte",
    },
    defaultSettings: {
      heroLayout: "arch-palace",
      containerMode: "contained",
      archShape: "roman-arch",
      splitProportion: "50-50",
      imageSide: "right",
      borderRadiusPx: 16,
      innerPaddingPx: 32,
      textPosition9: "center-left",
      textAlignment: "left",
      overlayOpacity: 0,
    },
  },
  {
    id: "atelier-collage",
    componentName: "HeroGallery",
    label: "Photo encadrée",
    subtitle: "Bordure colorée tout autour",
    badge: "Modèle 4",
    description: "Une ou plusieurs photos entourées d'une marge uniforme avec un bloc texte.",
    capabilities: {
      ...BASE_CAPS,
      supportsOverlayControls: true,
      supportsGalleryControls: true,
      maxImages: 3,
      uniqueConfigLabel: "Marge et écart entre les photos",
      roleSummary: "Encadrement avec marge uniforme et jusqu'à 3 photos",
    },
    defaultSettings: {
      heroLayout: "atelier-collage",
      containerMode: "contained",
      innerPaddingPx: 32,
      borderRadiusPx: 16,
      textPosition9: "bottom-center",
      textAlignment: "center",
      overlayOpacity: 0,
    },
  },
  {
    id: "bento-hero",
    componentName: "HeroDiptych",
    label: "Deux photos ensemble",
    subtitle: "Deux visuels côte à côte",
    badge: "Modèle 5",
    description: "Affiche deux photos complémentaires côte à côte avec votre texte.",
    capabilities: {
      ...BASE_CAPS,
      supportsSplitControls: true,
      supportsDiptychControls: true,
      maxImages: 2,
      uniqueConfigLabel: "Répartition et écart des deux photos",
      roleSummary: "Affichage simultané de deux photos complémentaires",
    },
    defaultSettings: {
      heroLayout: "bento-hero",
      containerMode: "contained",
      diptychGapPx: 16,
      innerPaddingPx: 24,
      borderRadiusPx: 16,
      textPosition9: "center-left",
      textAlignment: "left",
      overlayOpacity: 0,
    },
  },
];

export function getHeroModelCapabilities(layout?: HeroLayoutModelId): HeroModelCapabilities {
  const canonical = normalizeHeroLayoutModelId(layout) || "cinema-full";
  const found = HERO_LAYOUT_MODELS.find((m) => m.id === canonical);
  return found ? found.capabilities : HERO_LAYOUT_MODELS[0].capabilities;
}

export function buildSmartHeroFromCatalog(
  products: Product[],
  sector: StoreThemeSector = DEFAULT_MODERN_SECTOR,
  _storeLocation?: string,
  targetModel?: HeroLayoutModelId
): Partial<HeroBannerSettings> {
  const activeProducts = products.filter(isCatalogProductPubliclyActive);
  const p1 = activeProducts[0];
  const p2 = activeProducts[1] || p1;
  const img1 = p1?.images?.[0] || p1?.image || "";
  const img2 = p2?.images?.[0] || p2?.image || img1;

  return {
    ...(targetModel ? { heroLayout: normalizeHeroLayoutModelId(targetModel) || targetModel } : {}),
    overlayOpacity: targetModel === "cinema-full" ? 35 : 0,
    enableImageSwap: Boolean(img1 && img2 && img1 !== img2),
    heroSwapImages: Array.from(new Set([img1, img2].filter(Boolean))),
    imageUrl: img1,
    secondaryImageUrl: img2,
    title: p1?.name || "Nouvelle collection",
    subtitle: p1?.description
      ? p1.description.slice(0, 110)
      : "Découvrez nos nouveautés et pièces essentielles disponibles dès maintenant.",
    ctaText: "Découvrir",
    ctaTargetType: p1 ? "product" : "catalog",
    ctaTargetProductId: p1?.id,
    spotlightProductId: p1?.id,
    spotlightProductTitle: p1?.name || "",
    bentoTopCardTitle: p2?.name || "",
    bentoTopCardImage: img2,
    ...(sector === "tech" ? { ctaStyle: "sharp" as const } : {}),
  };
}
