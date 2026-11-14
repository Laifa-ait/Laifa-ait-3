import { Product, CartItem } from "../domains/product/product.types";

export function getTranslatedField(product: Product | CartItem, field: 'name' | 'description', lang: string): string {
  const shortLang = (lang || 'fr').split('-')[0].toLowerCase();

  // For French (primary base language), product.name / product.description is the canonical source
  if (shortLang === 'fr') {
    if (field === 'description') {
      const desc = ('description' in product && typeof product.description === 'string') ? product.description : "";
      return desc.trim() || product.translations?.fr?.description || "";
    }
    return product.name || product.translations?.fr?.name || "";
  }

  if (product.translations) {
    if (product.translations[shortLang] && product.translations[shortLang][field]) {
      return product.translations[shortLang][field];
    }
    if (product.translations[lang] && product.translations[lang][field]) {
      return product.translations[lang][field];
    }
  }
  if (field === 'description') {
    return ('description' in product && typeof product.description === 'string') ? product.description : "";
  }
  return product.name || "";
}

const CATEGORY_KEY_MAP: Record<string, string> = {
  "Maison & Déco": "cat_maison_deco",
  "Maison & Décoration": "cat_maison_deco",
  Électronique: "cat_tech",
  "Électronique & High-Tech": "cat_tech",
  Électroménager: "cat_electromenager",
  Mode: "cat_fashion_title",
  "Mode & Élégance": "cat_fashion_title",
  "Mode & Accessoires": "cat_fashion_title",
  "Artisanat & Tradition": "cat_artisanat",
  Artisanat: "cat_artisanat",
  "Beauté & Santé": "cat_beaute",
  "Beauté & Bien-être": "cat_beaute",
  "Auto & Moto": "cat_auto",
  "Sport & Loisirs": "cat_sport",
  "Bébé & Puériculture": "cat_bebe",
  "Bricolage & Outillage": "cat_bricolage",
  "Jeux & Jouets": "cat_jouets",
  Supermarché: "cat_supermarche",
  "Scolaire & Bureau": "cat_scolaire",
  Scolaire: "cat_scolaire",
};

export const getCategoryTranslation = (text: string, t: (key: string) => string) => {
  if (!text) return "";

  if (text === "Tous" || text === "all" || text === "Toutes" || text === "Toutes les catégories") {
    return t("all_categories") || "Toutes les catégories";
  }

  const mappedKey = CATEGORY_KEY_MAP[text];
  if (mappedKey) {
    const mappedVal = t(mappedKey);
    if (mappedVal && mappedVal !== mappedKey) {
      return mappedVal;
    }
  }

  return t(text);
};
