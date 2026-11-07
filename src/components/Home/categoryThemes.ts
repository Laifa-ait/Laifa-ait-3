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
    icon: Armchair,
    defaultTitle: "Maison & Déco",
    defaultSubtitle: "Salons d'architecte, Mobilier & Luminaires",
    defaultImage: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800",
    defaultSubcategories: ["Mobilier de Salon", "Luminaires", "Linge de Maison"],
  },
  Électronique: {
    accentHex: "#38BDF8",
    editionTag: "HIGH-TECH & PRO",
    icon: Smartphone,
    defaultTitle: "Électronique",
    defaultSubtitle: "Smartphones, PC Pro, Audio & Domotique",
    defaultImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800",
    defaultSubcategories: ["Smartphones", "Ordinateurs & PC", "Audio & Casques"],
  },
  Électroménager: {
    accentHex: "#A78BFA",
    editionTag: "ÉQUIPEMENT MAISON",
    icon: Refrigerator,
    defaultTitle: "Électroménager",
    defaultSubtitle: "Froid, Cuisson encastrable & Caféterie",
    defaultImage: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800",
    defaultSubcategories: ["TV & Home Cinéma", "Froid & Lavage", "Cuisson"],
  },
  Mode: {
    accentHex: "#F472B6",
    editionTag: "VESTIAIRE & STYLE",
    icon: Shirt,
    defaultTitle: "Mode",
    defaultSubtitle: "Prêt-à-porter, Maroquinerie & Horlogerie",
    defaultImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800",
    defaultSubcategories: ["Mode Femme", "Mode Homme", "Accessoires & Bijoux"],
  },
  "Artisanat & Tradition": {
    accentHex: "#F59E0B",
    editionTag: "PATRIMOINE D'ALGÉRIE",
    icon: Palette,
    defaultTitle: "Artisanat & Tradition",
    defaultSubtitle: "Haute couture algérienne, Dinanderie & Tapis",
    defaultImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800",
    defaultSubcategories: ["Tenues Traditionnelles", "Poterie", "Tapis Berbères"],
  },
  "Beauté & Santé": {
    accentHex: "#FB7185",
    editionTag: "SOINS & PARFUMERIE",
    icon: Sparkles,
    defaultTitle: "Beauté & Santé",
    defaultSubtitle: "Haute Parfumerie, Dermo-cosmétique & Soins",
    defaultImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800",
    defaultSubcategories: ["Soins du visage", "Parfums", "Maquillage"],
  },
  "Auto & Moto": {
    accentHex: "#EF4444",
    editionTag: "MÉCANIQUE & ÉQUIPEMENT",
    icon: CarFront,
    defaultTitle: "Auto & Moto",
    defaultSubtitle: "Pièces OEM, Pneumatiques & Équipement",
    defaultImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800",
    defaultSubcategories: ["Pièces & Entretien", "Pneumatiques", "Moto & Scooter"],
  },
  "Sport & Loisirs": {
    accentHex: "#10B981",
    editionTag: "PERFORMANCE & OUTDOOR",
    icon: Dumbbell,
    defaultTitle: "Sport & Loisirs",
    defaultSubtitle: "Musculation, Running, Cyclisme & Outdoor",
    defaultImage: "https://images.unsplash.com/photo-1517649763962-0c6232662000?auto=format&fit=crop&q=80&w=800",
    defaultSubcategories: ["Fitness & Musculation", "Sports Collectifs", "Randonnée"],
  },
  "Bébé & Puériculture": {
    accentHex: "#38BDF8",
    editionTag: "UNIVERS PREMIER ÂGE",
    icon: Baby,
    defaultTitle: "Bébé & Puériculture",
    defaultSubtitle: "Poussettes Trio, Chambre & Premier Âge",
    defaultImage: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=800",
    defaultSubcategories: ["Poussettes & Voyage", "Chambre & Sommeil", "Éveil"],
  },
  "Bricolage & Outillage": {
    accentHex: "#F97316",
    editionTag: "ATELIER & CHANTIER",
    icon: Hammer,
    defaultTitle: "Bricolage & Outillage",
    defaultSubtitle: "Électroportatif Pro, Plomberie & Chantier",
    defaultImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800",
    defaultSubcategories: ["Électroportatif", "Outillage à Main", "Plomberie"],
  },
  "Jeux & Jouets": {
    accentHex: "#C084FC",
    editionTag: "ÉVEIL & PASSIONS",
    icon: Gamepad2,
    defaultTitle: "Jeux & Jouets",
    defaultSubtitle: "Jeux éducatifs, Figurines & Plein air",
    defaultImage: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=800",
    defaultSubcategories: ["Jeux éducatifs", "Jeux de société", "Plein air"],
  },
  Supermarché: {
    accentHex: "#34D399",
    editionTag: "ÉPICERIE & TERROIR",
    icon: ShoppingBasket,
    defaultTitle: "Supermarché",
    defaultSubtitle: "Épicerie fine, Huile de Kabylie & Quotidien",
    defaultImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
    defaultSubcategories: ["Épicerie & Terroir", "Boissons & Cafés", "Entretien"],
  },
  "Scolaire & Bureau": {
    accentHex: "#FBBF24",
    editionTag: "SAVOIR & PAPETERIE",
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
