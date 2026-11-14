import {
  HeroBannerSettings,
  HeroColorPaletteId,
  HeroLayoutModelId,
  StoreThemeSector,
} from "../../../../domains/seller/customPage.types";
import { Product } from "../../../../domains/product/product.types";
import { normalizeHeroLayoutModelId } from "../../../../components/Store/sections/hero/heroResponsiveHelper";

export interface HeroModelCapabilities {
  supportsOverlayControls: boolean;
  supportsSplitControls: boolean;
  supportsArchControls: boolean;
  supportsGalleryControls: boolean;
  supportsDiptychControls: boolean;
  uniqueConfigLabel: string;
  roleSummary: string;
}

export interface HeroLayoutModelPreset {
  id: HeroLayoutModelId;
  componentName: "HeroFullBleed" | "HeroSplit" | "HeroArch" | "HeroGallery" | "HeroDiptych";
  label: string;
  subtitle: string;
  badge: string;
  inspiration: string;
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
  { id: "pure-white", label: "Blanc Pur & Noir", bannerBgColor: "#FFFFFF", bannerBgGradient: "", titleColor: "#111827", subtitleColor: "#4B5563", ctaBgColor: "#111827", ctaTextColor: "#FFFFFF" },
  { id: "cream-earth", label: "Crème & Terre", bannerBgColor: "#FAF6F0", bannerBgGradient: "linear-gradient(135deg, #FAF6F0 0%, #F2EAE0 100%)", titleColor: "#2C1E16", subtitleColor: "#6E5647", ctaBgColor: "#8C4A27", ctaTextColor: "#FFFFFF" },
  { id: "luxury-black", label: "Noir Luxe & Ivoire", bannerBgColor: "#121214", bannerBgGradient: "linear-gradient(135deg, #121214 0%, #1F1F23 100%)", titleColor: "#FAF8F5", subtitleColor: "#A1A1AA", ctaBgColor: "#FAF8F5", ctaTextColor: "#121214" },
  { id: "midnight-silver", label: "Bleu Nuit & Argent", bannerBgColor: "#0F172A", bannerBgGradient: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)", titleColor: "#F8FAFC", subtitleColor: "#94A3B8", ctaBgColor: "#E2E8F0", ctaTextColor: "#0F172A" },
  { id: "sage-linen", label: "Vert Sauge & Lin", bannerBgColor: "#F2F5F0", bannerBgGradient: "linear-gradient(135deg, #F2F5F0 0%, #E5ECE1 100%)", titleColor: "#1C2E24", subtitleColor: "#4A6354", ctaBgColor: "#264634", ctaTextColor: "#FFFFFF" },
];

const BASE_CAPS: HeroModelCapabilities = {
  supportsOverlayControls: false,
  supportsSplitControls: false,
  supportsArchControls: false,
  supportsGalleryControls: false,
  supportsDiptychControls: false,
  uniqueConfigLabel: "Configuration du style",
  roleSummary: "",
};

export const HERO_LAYOUT_MODELS: HeroLayoutModelPreset[] = [
  {
    id: "cinema-full",
    componentName: "HeroFullBleed",
    label: "Plein Cadre Cinéma",
    subtitle: "Immersion 100% Surface",
    badge: "STYLE 1",
    inspiration: "HeroFullBleed",
    description: "Grand rectangle panoramique où l'image occupe 100% de la surface avec voile dégradé doux localisé sous l'écriture.",
    capabilities: { ...BASE_CAPS, supportsOverlayControls: true, uniqueConfigLabel: "Style 1 — Plein Cadre Cinéma (HeroFullBleed)", roleSummary: "Photographie plein cadre 100% surface + écriture positionnée sur grille 9 points" },
    defaultSettings: { heroLayout: "cinema-full", containerMode: "full", borderRadiusPx: 0, innerPaddingPx: 32, textPosition9: "bottom-left", textAlignment: "left", overlayOpacity: 25, titleColor: "#FFFFFF", subtitleColor: "#E4E4E7", ctaBgColor: "#FFFFFF", ctaTextColor: "#111827" },
  },
  {
    id: "editorial-split",
    componentName: "HeroSplit",
    label: "Split Côte-à-Côte",
    subtitle: "2 Blocs Distincts",
    badge: "STYLE 2",
    inspiration: "HeroSplit",
    description: "Divisé en 2 blocs côte à côte : aplat de couleur pure pour l'écriture d'un côté, photographie 100% dégagée de l'autre.",
    capabilities: { ...BASE_CAPS, supportsSplitControls: true, uniqueConfigLabel: "Style 2 — Split Éditorial Côte-à-Côte (HeroSplit)", roleSummary: "Séparation stricte entre l'aplat d'écriture et le bloc photographique (50/50, 60/40, 70/30)" },
    defaultSettings: { heroLayout: "editorial-split", containerMode: "contained", splitProportion: "50-50", imageSide: "right", borderRadiusPx: 24, innerPaddingPx: 32, textPosition9: "center-left", textAlignment: "left", overlayOpacity: 0 },
  },
  {
    id: "arch-palace",
    componentName: "HeroArch",
    label: "Arche & Forme Organique",
    subtitle: "Découpe Architecturale",
    badge: "STYLE 3",
    inspiration: "HeroArch",
    description: "Fond uni raffiné où la photo est découpée en Arche Romaine, Capsule Oblongue, Feuille Asymétrique ou Cadre Flottant.",
    capabilities: { ...BASE_CAPS, supportsSplitControls: true, supportsArchControls: true, uniqueConfigLabel: "Style 3 — Arche & Forme Organique (HeroArch)", roleSummary: "Découpe géométrique d'art (Arche, Capsule, Feuille, Flottant) face au bloc d'écriture" },
    defaultSettings: { heroLayout: "arch-palace", containerMode: "contained", archShape: "roman-arch", splitProportion: "50-50", imageSide: "right", borderRadiusPx: 24, innerPaddingPx: 32, textPosition9: "center-left", textAlignment: "left", overlayOpacity: 0 },
  },
  {
    id: "atelier-collage",
    componentName: "HeroGallery",
    label: "Cadre Galerie",
    subtitle: "Passe-Partout Luxe",
    badge: "STYLE 4",
    inspiration: "HeroGallery",
    description: "Photographie entourée d'une marge intérieure uniforme (Passe-partout de 16px à 48px) avec cartouche d'écriture épuré.",
    capabilities: { ...BASE_CAPS, supportsGalleryControls: true, uniqueConfigLabel: "Style 4 — Cadre Galerie Minimaliste (HeroGallery)", roleSummary: "Marge passe-partout réglable (16px à 48px) et cartouche typographique minimaliste" },
    defaultSettings: { heroLayout: "atelier-collage", containerMode: "contained", innerPaddingPx: 32, borderRadiusPx: 24, textPosition9: "bottom-center", textAlignment: "center", overlayOpacity: 0 },
  },
  {
    id: "bento-hero",
    componentName: "HeroDiptych",
    label: "Diptyque Double Visuel",
    subtitle: "2 Photos Complémentaires",
    badge: "STYLE 5",
    inspiration: "HeroDiptych",
    description: "Met en valeur 2 photographies complémentaires côte à côte (gap réglable) accompagnées d'un bloc d'écriture minimaliste.",
    capabilities: { ...BASE_CAPS, supportsDiptychControls: true, uniqueConfigLabel: "Style 5 — Diptyque Double Visuel (HeroDiptych)", roleSummary: "Exposition simultanée de 2 visuels complémentaires avec espacement réglable" },
    defaultSettings: { heroLayout: "bento-hero", containerMode: "contained", diptychGapPx: 16, innerPaddingPx: 24, borderRadiusPx: 24, textPosition9: "center-left", textAlignment: "left", overlayOpacity: 0 },
  },
];

export const HERO_VISUAL_VARIANTS: Array<{
  id: NonNullable<HeroBannerSettings["heroVariant"]>;
  label: string;
  patch: Partial<HeroBannerSettings>;
}> = [
  { id: "minimalist", label: "Split Épuré", patch: { heroVariant: "minimalist", heroLayout: "editorial-split", splitProportion: "50-50", overlayOpacity: 0 } },
  { id: "fullscreen-image", label: "Plein Cadre", patch: { heroVariant: "fullscreen-image", heroLayout: "cinema-full", containerMode: "full", overlayOpacity: 20 } },
  { id: "split-left-image", label: "Split Gauche", patch: { heroVariant: "split-left-image", heroLayout: "editorial-split", imageSide: "left", overlayOpacity: 0 } },
  { id: "centered-text", label: "Cadre Galerie", patch: { heroVariant: "centered-text", heroLayout: "atelier-collage", textAlignment: "center", overlayOpacity: 0 } },
  { id: "promo-commercial", label: "Diptyque", patch: { heroVariant: "promo-commercial", heroLayout: "bento-hero", overlayOpacity: 0 } },
  { id: "fashion-elegant", label: "Arche Romaine", patch: { heroVariant: "fashion-elegant", heroLayout: "arch-palace", archShape: "roman-arch", overlayOpacity: 0 } },
  { id: "tech-precision", label: "Split 60/40", patch: { heroVariant: "tech-precision", heroLayout: "editorial-split", splitRatio: "60-40", splitProportion: "60-40", ctaStyle: "sharp", overlayOpacity: 0 } },
];

export function getHeroModelCapabilities(layout?: HeroLayoutModelId): HeroModelCapabilities {
  const canonical = normalizeHeroLayoutModelId(layout) || "cinema-full";
  const found = HERO_LAYOUT_MODELS.find((m) => m.id === canonical);
  return found ? found.capabilities : HERO_LAYOUT_MODELS[0].capabilities;
}

export function buildSmartHeroFromCatalog(
  products: Product[],
  sector: StoreThemeSector = "artisanat",
  storeWilaya = "Alger",
  targetModel?: HeroLayoutModelId
): Partial<HeroBannerSettings> {
  const p1 = products[0];
  const p2 = products[1] || p1;
  const img1 = p1?.images?.[0] || p1?.image || "";
  const img2 = p2?.images?.[0] || p2?.image || img1;

  return {
    ...(targetModel ? { heroLayout: normalizeHeroLayoutModelId(targetModel) || targetModel } : {}),
    overlayOpacity: 0,
    enableImageSwap: true,
    heroSwapImages: Array.from(new Set([img1, img2].filter(Boolean))),
    imageUrl: img1,
    secondaryImageUrl: img2,
    title: p1?.name || "",
    subtitle: p1?.description ? p1.description.slice(0, 110) : storeWilaya ? `Collection officielle disponible — Expédition depuis ${storeWilaya}.` : "",
    ctaText: "Découvrir la collection",
    ctaTargetType: p1 ? "product" : "catalog",
    ctaTargetProductId: p1?.id,
    spotlightProductId: p1?.id,
    spotlightProductTitle: p1?.name || "",
    bentoTopCardTitle: p2?.name || "",
    bentoTopCardImage: img2,
    ...(sector === "tech" ? { ctaStyle: "sharp" as const } : {}),
  };
}
