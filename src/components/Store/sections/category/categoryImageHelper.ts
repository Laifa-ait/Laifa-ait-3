import React from "react";
import {
  CategoryItem,
  CategoryImagePosition,
  CategoryImageFit,
} from "../../../../pages/Seller/StoreBuilder/constants/categoryPresetTypes";
import { STUDIO_MEDIA_ASSETS } from "../../../../pages/Seller/StoreBuilder/constants/studioThemeDefaults";

const CURATED_CATEGORY_PHOTOS: Array<{ keywords: string[]; url: string }> = [
  {
    keywords: ["beaute", "sante", "soin", "visage", "cosmetique", "serum", "maquillage", "skin", "parfum", "fragrance"],
    url: STUDIO_MEDIA_ASSETS.beauty,
  },
  {
    keywords: ["maison", "cuisine", "deco", "interieur", "mobilier", "salon", "table", "ceramique", "design", "luminaire", "epicerie", "cafe", "gourmet"],
    url: STUDIO_MEDIA_ASSETS.interior,
  },
  {
    keywords: ["mode", "femme", "homme", "couture", "robe", "veste", "blazer", "outerwear", "sac", "maroquinerie", "cuir", "accessoire", "enfant"],
    url: STUDIO_MEDIA_ASSETS.fashion,
  },
  {
    keywords: ["smartphone", "telephone", "mobile", "audio", "casque", "ecouteur", "pc", "ordinateur", "tech", "horlogerie", "montre", "studio"],
    url: STUDIO_MEDIA_ASSETS.tech,
  },
  {
    keywords: ["sport", "fitness", "training", "outdoor", "running", "chaussure", "sneaker"],
    url: STUDIO_MEDIA_ASSETS.sport,
  },
];

export const FALLBACK_EDITORIAL_PHOTOS = [
  STUDIO_MEDIA_ASSETS.fashion,
  STUDIO_MEDIA_ASSETS.interior,
  STUDIO_MEDIA_ASSETS.beauty,
  STUDIO_MEDIA_ASSETS.tech,
  STUDIO_MEDIA_ASSETS.sport,
];

export function resolveCategoryPhoto(cat: CategoryItem, index = 0): string {
  const raw = (cat.imageUrl || "").trim();
  const isLegacyGeometricSvg = raw.startsWith("data:image/svg+xml") && raw.includes("cbg");

  if (raw && !isLegacyGeometricSvg) {
    return raw;
  }

  const normalized = `${cat.name || ""} ${cat.slug || ""} ${cat.subtitle || ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  for (const entry of CURATED_CATEGORY_PHOTOS) {
    if (entry.keywords.some((kw) => normalized.includes(kw))) {
      return entry.url;
    }
  }

  return FALLBACK_EDITORIAL_PHOTOS[index % FALLBACK_EDITORIAL_PHOTOS.length];
}

export function resolveCategoryImageClasses(
  cat: CategoryItem,
  defaultPos: CategoryImagePosition = "center",
  defaultFit: CategoryImageFit = "cover"
): { posClass: string; fitClass: string } {
  const pos = cat.imagePosition || defaultPos;
  const fit = cat.imageFit || defaultFit;

  const posClass =
    pos === "top" ? "object-top" : pos === "bottom" ? "object-bottom" : "object-center";

  const fitClass = fit === "contain" ? "object-contain p-2 bg-slate-50" : "object-cover";

  return { posClass, fitClass };
}

export function handleCategoryImageError(
  e: React.SyntheticEvent<HTMLImageElement>,
  index = 0
): void {
  const target = e.currentTarget;
  const fallback = FALLBACK_EDITORIAL_PHOTOS[index % FALLBACK_EDITORIAL_PHOTOS.length];
  if (target.src !== fallback) {
    target.src = fallback;
  }
}

export const QUICK_READY_CATEGORY_CARDS: Array<{
  name: string;
  subtitle: string;
  slug: string;
  badge: string;
  badgeColor: string;
  iconName: string;
  imageUrl: string;
}> = [
  {
    name: "Beauté & Soins",
    subtitle: "Cosmétiques & sérums actifs",
    slug: "beaute-soins",
    badge: "Clean Lab",
    badgeColor: "#0F172A",
    iconName: "Sparkles",
    imageUrl: STUDIO_MEDIA_ASSETS.beauty,
  },
  {
    name: "Mode & Silhouettes",
    subtitle: "Lignes contemporaines",
    slug: "mode-pret-a-porter",
    badge: "Saison",
    badgeColor: "#0F172A",
    iconName: "Shirt",
    imageUrl: STUDIO_MEDIA_ASSETS.fashion,
  },
  {
    name: "Architecture Intérieure",
    subtitle: "Design objet & mobilier",
    slug: "maison-design",
    badge: "Galerie",
    badgeColor: "#0F172A",
    iconName: "Coffee",
    imageUrl: STUDIO_MEDIA_ASSETS.interior,
  },
  {
    name: "High-Tech & Audio",
    subtitle: "Équipements & précision",
    slug: "high-tech-audio",
    badge: "Pro",
    badgeColor: "#1D4ED8",
    iconName: "Smartphone",
    imageUrl: STUDIO_MEDIA_ASSETS.tech,
  },
  {
    name: "Parfums & Extraits",
    subtitle: "Fragrances signature",
    slug: "parfums-prestige",
    badge: "Édition",
    badgeColor: "#0F172A",
    iconName: "Gem",
    imageUrl: STUDIO_MEDIA_ASSETS.beauty,
  },
  {
    name: "Sport & Performance",
    subtitle: "Training & équipement",
    slug: "sport-performance",
    badge: "Studio",
    badgeColor: "#DC2626",
    iconName: "ShoppingBag",
    imageUrl: STUDIO_MEDIA_ASSETS.sport,
  },
];
