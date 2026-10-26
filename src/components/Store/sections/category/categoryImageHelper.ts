import { CategoryItem } from "../../../../pages/Seller/StoreBuilder/constants/categoryPresetTypes";

const CURATED_CATEGORY_PHOTOS: Array<{ keywords: string[]; url: string }> = [
  {
    keywords: ["beaute", "sante", "soin", "visage", "cosmetique", "serum", "maquillage", "skin"],
    url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
  },
  {
    keywords: ["parfum", "fragrance", "senteur", "oud", "musc", "extrait"],
    url: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80",
  },
  {
    keywords: ["maison", "cuisine", "deco", "interieur", "mobilier", "salon", "table"],
    url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
  },
  {
    keywords: ["caftan", "karakou", "robe", "femme", "soiree", "couture", "mode"],
    url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
  },
  {
    keywords: ["homme", "costume", "blazer", "chemise", "veste", "outerwear"],
    url: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80",
  },
  {
    keywords: ["sac", "maroquinerie", "cuir", "bagage", "pochette"],
    url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
  },
  {
    keywords: ["chaussure", "sneaker", "basket", "escarpin", "botte", "footwear"],
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    keywords: ["smartphone", "telephone", "mobile", "5g", "tablette"],
    url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
  },
  {
    keywords: ["audio", "casque", "ecouteur", "enceinte", "son", "studio"],
    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  },
  {
    keywords: ["pc", "ordinateur", "informatique", "laptop", "setup", "gaming", "tech"],
    url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
  },
  {
    keywords: ["bijou", "montre", "horlogerie", "joaillerie", "or", "argent"],
    url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
  },
  {
    keywords: ["artisanat", "poterie", "ceramique", "tapis", "berbere", "tradition", "cuivre"],
    url: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
  },
  {
    keywords: ["sport", "fitness", "training", "outdoor"],
    url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
  },
  {
    keywords: ["auto", "moto", "piece", "vehicule", "pneu"],
    url: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80",
  },
  {
    keywords: ["terroir", "epicerie", "huile", "miel", "datte", "bio", "alimentation"],
    url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80",
  },
];

const FALLBACK_EDITORIAL_PHOTOS = [
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
];

/**
 * Resolves a high-definition editorial image for a category card.
 * Preserves any user-uploaded or custom HTTP/data image, while replacing empty or
 * legacy geometric SVG placeholders (`id="cbg"`) with curated studio photography.
 */
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
    subtitle: "Cosmétiques & rituels",
    slug: "beaute-soins",
    badge: "Tendance",
    badgeColor: "#E11D48",
    iconName: "Sparkles",
    imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Mode & Prêt-à-Porter",
    subtitle: "Silhouettes & couture",
    slug: "mode-pret-a-porter",
    badge: "Nouveau",
    badgeColor: "#023859",
    iconName: "Shirt",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Maison & Cuisine",
    subtitle: "Décoration & art de vivre",
    slug: "maison-cuisine",
    badge: "Populaire",
    badgeColor: "#059669",
    iconName: "Coffee",
    imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "High-Tech & Audio",
    subtitle: "Smartphones & accessoires",
    slug: "high-tech-audio",
    badge: "Pro",
    badgeColor: "#2563EB",
    iconName: "Smartphone",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Parfums & Prestige",
    subtitle: "Fragrances d'exception",
    slug: "parfums-prestige",
    badge: "Exclusif",
    badgeColor: "#D97706",
    iconName: "Gem",
    imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Sacs & Maroquinerie",
    subtitle: "Cuir & accessoires",
    slug: "sacs-maroquinerie",
    badge: "Best-seller",
    badgeColor: "#9A3412",
    iconName: "ShoppingBag",
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
  },
];
