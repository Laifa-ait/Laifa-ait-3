import React from "react";
import {
  Armchair,
  Smartphone,
  Shirt,
  ShoppingBasket,
  Sparkles,
  Refrigerator,
  CarFront,
  Hammer,
  Dumbbell,
  Baby,
  Palette,
  Gamepad2,
  GraduationCap,
  LucideProps,
} from "lucide-react";
import { resolveCanonicalCategoryKey } from "../../utils/categoryCanonical";

export interface CategoryCardData {
  key: string;
  title: string;
  subtitle?: string;
  image?: string;
  subcategoriesPreview?: string[];
}

export interface CategoryTheme {
  accentHex: string;
  editionTag: string;
  editionTagKey: string;
  titleKey: string;
  icon: React.ComponentType<LucideProps>;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultImage: string;
  defaultSubcategories: string[];
}

export const THEMES_BY_KEY: Record<string, CategoryTheme> = {
  "Maison & Déco": {
    accentHex: "#E99856",
    editionTag: "INTÉRIEUR & DESIGN",
    editionTagKey: "cat_tag.maison",
    titleKey: "cat_maison_deco",
    icon: Armchair,
    defaultTitle: "Maison & Déco",
    defaultSubtitle: "Salons d'architecte, Mobilier & Luminaires",
    defaultImage: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800",
    defaultSubcategories: ["Mobilier de Salon", "Luminaires", "Linge de Maison"],
  },
  Électronique: {
    accentHex: "#E99856",
    editionTag: "HIGH-TECH & PRO",
    editionTagKey: "cat_tag.tech",
    titleKey: "cat_electronic_title",
    icon: Smartphone,
    defaultTitle: "Électronique",
    defaultSubtitle: "Smartphones, PC Pro, Audio & Domotique",
    defaultImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800",
    defaultSubcategories: ["Smartphones", "Ordinateurs & PC", "Audio & Casques"],
  },
  Électroménager: {
    accentHex: "#E0B4B2",
    editionTag: "ÉQUIPEMENT MAISON",
    editionTagKey: "cat_tag.electromenager",
    titleKey: "cat_appliance_title",
    icon: Refrigerator,
    defaultTitle: "Électroménager",
    defaultSubtitle: "Froid, Cuisson encastrable & Caféterie",
    defaultImage: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800",
    defaultSubcategories: ["TV & Home Cinéma", "Froid & Lavage", "Cuisson"],
  },
  Mode: {
    accentHex: "#A54055",
    editionTag: "VESTIAIRE & STYLE",
    editionTagKey: "cat_tag.mode",
    titleKey: "cat_fashion_title",
    icon: Shirt,
    defaultTitle: "Mode",
    defaultSubtitle: "Prêt-à-porter, Maroquinerie & Horlogerie",
    defaultImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800",
    defaultSubcategories: ["Mode Femme", "Mode Homme", "Accessoires & Bijoux"],
  },
  "Artisanat & Tradition": {
    accentHex: "#E99856",
    editionTag: "PATRIMOINE D'ALGÉRIE",
    editionTagKey: "cat_tag.artisanat",
    titleKey: "cat_craft_title",
    icon: Palette,
    defaultTitle: "Artisanat & Tradition",
    defaultSubtitle: "Haute couture algérienne, Dinanderie & Tapis",
    defaultImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800",
    defaultSubcategories: ["Tenues Traditionnelles", "Poterie", "Tapis Berbères"],
  },
  "Beauté & Santé": {
    accentHex: "#E0B4B2",
    editionTag: "SOINS & PARFUMERIE",
    editionTagKey: "cat_tag.beaute",
    titleKey: "cat_beauty_title",
    icon: Sparkles,
    defaultTitle: "Beauté & Santé",
    defaultSubtitle: "Haute Parfumerie, Dermo-cosmétique & Soins",
    defaultImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800",
    defaultSubcategories: ["Soins du visage", "Parfums", "Maquillage"],
  },
  "Auto & Moto": {
    accentHex: "#A54055",
    editionTag: "MÉCANIQUE & ÉQUIPEMENT",
    editionTagKey: "cat_tag.auto",
    titleKey: "cat_auto",
    icon: CarFront,
    defaultTitle: "Auto & Moto",
    defaultSubtitle: "Pièces OEM, Pneumatiques & Équipement",
    defaultImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800",
    defaultSubcategories: ["Pièces & Entretien", "Pneumatiques", "Moto & Scooter"],
  },
  "Sport & Loisirs": {
    accentHex: "#E99856",
    editionTag: "PERFORMANCE & OUTDOOR",
    editionTagKey: "cat_tag.sport",
    titleKey: "cat_sport",
    icon: Dumbbell,
    defaultTitle: "Sport & Loisirs",
    defaultSubtitle: "Musculation, Running, Cyclisme & Outdoor",
    defaultImage: "https://images.unsplash.com/photo-1517649763962-0c6232662000?auto=format&fit=crop&q=80&w=800",
    defaultSubcategories: ["Fitness & Musculation", "Sports Collectifs", "Randonnée"],
  },
  "Bébé & Puériculture": {
    accentHex: "#E0B4B2",
    editionTag: "UNIVERS PREMIER ÂGE",
    editionTagKey: "cat_tag.bebe",
    titleKey: "cat_bebe",
    icon: Baby,
    defaultTitle: "Bébé & Puériculture",
    defaultSubtitle: "Poussettes Trio, Chambre & Premier Âge",
    defaultImage: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=800",
    defaultSubcategories: ["Poussettes & Voyage", "Chambre & Sommeil", "Éveil"],
  },
  "Bricolage & Outillage": {
    accentHex: "#E99856",
    editionTag: "ATELIER & CHANTIER",
    editionTagKey: "cat_tag.bricolage",
    titleKey: "cat_bricolage",
    icon: Hammer,
    defaultTitle: "Bricolage & Outillage",
    defaultSubtitle: "Électroportatif Pro, Plomberie & Chantier",
    defaultImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800",
    defaultSubcategories: ["Électroportatif", "Outillage à Main", "Plomberie"],
  },
  "Jeux & Jouets": {
    accentHex: "#A54055",
    editionTag: "ÉVEIL & PASSIONS",
    editionTagKey: "cat_tag.jouets",
    titleKey: "cat_jeux",
    icon: Gamepad2,
    defaultTitle: "Jeux & Jouets",
    defaultSubtitle: "Jeux éducatifs, Figurines & Plein air",
    defaultImage: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=800",
    defaultSubcategories: ["Jeux éducatifs", "Jeux de société", "Plein air"],
  },
  Supermarché: {
    accentHex: "#E99856",
    editionTag: "ÉPICERIE & TERROIR",
    editionTagKey: "cat_tag.supermarche",
    titleKey: "cat_supermarche",
    icon: ShoppingBasket,
    defaultTitle: "Supermarché",
    defaultSubtitle: "Épicerie fine, Huile de Kabylie & Quotidien",
    defaultImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
    defaultSubcategories: ["Épicerie & Terroir", "Boissons & Cafés", "Entretien"],
  },
  "Scolaire & Bureau": {
    accentHex: "#E0B4B2",
    editionTag: "SAVOIR & PAPETERIE",
    editionTagKey: "cat_tag.scolaire",
    titleKey: "cat_scolaire_title",
    icon: GraduationCap,
    defaultTitle: "Scolaire & Bureau",
    defaultSubtitle: "Papeterie, Livres, Manuels & Maroquinerie",
    defaultImage: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&q=80&w=800",
    defaultSubcategories: ["Rentrée Scolaire", "Papeterie & Bureau", "Livres"],
  },
};

export const getCategoryTheme = (rawKey: string, indexFallback = 0): CategoryTheme => {
  const canonical = resolveCanonicalCategoryKey(rawKey);
  if (THEMES_BY_KEY[canonical]) return THEMES_BY_KEY[canonical];

  const themeList = Object.values(THEMES_BY_KEY);
  return themeList[indexFallback % themeList.length];
};
