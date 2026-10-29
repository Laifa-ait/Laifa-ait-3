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

export interface CategoryCardData {
  key: string;
  title: string;
  subtitle?: string;
  image?: string;
}

export interface CategoryTheme {
  bgCard: string;
  radialGlow: string;
  border: string;
  discBg: string;
  iconColor: string;
  numColor: string;
  btnBg: string;
  icon: React.ComponentType<LucideProps>;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultCount: string;
}

const normalize = (val: string): string =>
  val
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

/**
 * Curated Mindazzle Twilight & Sunset Amber Category Themes
 * Palette: #E0B4B2 (Blush), #E99856 (Amber), #A54055 (Crimson),
 *          #622347 (Mulberry), #42164B (Aubergine), #1A1836 (Midnight)
 */
const LUXURY_PALETTE_VARIANTS = {
  blushSilk: {
    bgCard: "bg-gradient-to-br from-[#FAF2F2] via-[#F5E4E3] to-[#FDF9F8]",
    radialGlow: "bg-[radial-gradient(ellipse_at_top_right,rgba(224,180,178,0.55),transparent_70%)]",
    border: "border-[#E0B4B2]/55 hover:border-[#A54055]/60",
    discBg: "bg-white/60 backdrop-blur-md border border-white/80 shadow-2xs",
    iconColor: "text-[#622347]",
    numColor: "text-[#1A1836]",
    btnBg: "bg-[#622347] hover:bg-[#42164B]",
  },
  sunsetAmber: {
    bgCard: "bg-gradient-to-br from-[#FDF4EC] via-[#FAE6D4] to-[#FFFBF7]",
    radialGlow: "bg-[radial-gradient(ellipse_at_top_right,rgba(233,152,86,0.42),transparent_70%)]",
    border: "border-[#E99856]/45 hover:border-[#E99856]",
    discBg: "bg-white/65 backdrop-blur-md border border-white/80 shadow-2xs",
    iconColor: "text-[#A54055]",
    numColor: "text-[#1A1836]",
    btnBg: "bg-[#A54055] hover:bg-[#622347]",
  },
  royalAubergine: {
    bgCard: "bg-gradient-to-br from-[#F4EEF6] via-[#EAE0EE] to-[#FAF7FB]",
    radialGlow: "bg-[radial-gradient(ellipse_at_top_right,rgba(98,35,71,0.28),transparent_70%)]",
    border: "border-[#622347]/25 hover:border-[#42164B]/60",
    discBg: "bg-white/65 backdrop-blur-md border border-white/80 shadow-2xs",
    iconColor: "text-[#42164B]",
    numColor: "text-[#1A1836]",
    btnBg: "bg-[#42164B] hover:bg-[#1A1836]",
  },
  midnightVelvet: {
    bgCard: "bg-gradient-to-br from-[#EFEFF6] via-[#E4E3F0] to-[#F8F8FC]",
    radialGlow: "bg-[radial-gradient(ellipse_at_top_right,rgba(26,24,54,0.22),transparent_70%)]",
    border: "border-[#1A1836]/20 hover:border-[#42164B]/55",
    discBg: "bg-white/65 backdrop-blur-md border border-white/80 shadow-2xs",
    iconColor: "text-[#1A1836]",
    numColor: "text-[#1A1836]",
    btnBg: "bg-[#1A1836] hover:bg-[#42164B]",
  },
  crimsonRose: {
    bgCard: "bg-gradient-to-br from-[#FCEEF1] via-[#F7DDE2] to-[#FFF7F8]",
    radialGlow: "bg-[radial-gradient(ellipse_at_top_right,rgba(165,64,85,0.32),transparent_70%)]",
    border: "border-[#A54055]/30 hover:border-[#A54055]/70",
    discBg: "bg-white/65 backdrop-blur-md border border-white/80 shadow-2xs",
    iconColor: "text-[#A54055]",
    numColor: "text-[#1A1836]",
    btnBg: "bg-gradient-to-r from-[#622347] to-[#A54055] hover:from-[#42164B] hover:to-[#622347]",
  },
};

export const THEMES_BY_KEY: Record<string, CategoryTheme> = {
  "Jeux & Jouets": {
    ...LUXURY_PALETTE_VARIANTS.royalAubergine,
    icon: Gamepad2,
    defaultTitle: "Jeux & Jouets",
    defaultSubtitle: "Découvrez notre collection",
    defaultCount: "11",
  },
  "Supermarché": {
    ...LUXURY_PALETTE_VARIANTS.sunsetAmber,
    icon: ShoppingBasket,
    defaultTitle: "Supermarché",
    defaultSubtitle: "Produits frais & quotidien",
    defaultCount: "12",
  },
  "Scolaire & Bureau": {
    ...LUXURY_PALETTE_VARIANTS.midnightVelvet,
    icon: GraduationCap,
    defaultTitle: "Scolaire & Bureau",
    defaultSubtitle: "Livres, fournitures & rentrée",
    defaultCount: "18",
  },
  "Mode": {
    ...LUXURY_PALETTE_VARIANTS.crimsonRose,
    icon: Shirt,
    defaultTitle: "Mode & Élégance",
    defaultSubtitle: "Prêt-à-porter, Chaussures & Sacs",
    defaultCount: "24",
  },
  "Maison & Déco": {
    ...LUXURY_PALETTE_VARIANTS.blushSilk,
    icon: Armchair,
    defaultTitle: "Maison & Décoration",
    defaultSubtitle: "Salons, Mobilier & Linge de maison",
    defaultCount: "15",
  },
  "Électronique": {
    ...LUXURY_PALETTE_VARIANTS.midnightVelvet,
    icon: Smartphone,
    defaultTitle: "Tech & Performance",
    defaultSubtitle: "Gadgets connectés, Audio & PC",
    defaultCount: "20",
  },
  "Électroménager": {
    ...LUXURY_PALETTE_VARIANTS.royalAubergine,
    icon: Refrigerator,
    defaultTitle: "Électroménager",
    defaultSubtitle: "Froid, Cuisson & Petit déjeuner",
    defaultCount: "14",
  },
  "Beauté & Santé": {
    ...LUXURY_PALETTE_VARIANTS.blushSilk,
    icon: Sparkles,
    defaultTitle: "Beauté & Soins",
    defaultSubtitle: "Parfums, Cosmétiques & Bien-être",
    defaultCount: "16",
  },
  "Auto & Moto": {
    ...LUXURY_PALETTE_VARIANTS.midnightVelvet,
    icon: CarFront,
    defaultTitle: "Auto & Moto",
    defaultSubtitle: "Pièces détachées & Entretien",
    defaultCount: "19",
  },
  "Bricolage & Outillage": {
    ...LUXURY_PALETTE_VARIANTS.sunsetAmber,
    icon: Hammer,
    defaultTitle: "Outillage & Travaux",
    defaultSubtitle: "Outillage pro, Jardin & Maison",
    defaultCount: "13",
  },
  "Sport & Loisirs": {
    ...LUXURY_PALETTE_VARIANTS.crimsonRose,
    icon: Dumbbell,
    defaultTitle: "Sport & Fitness",
    defaultSubtitle: "Musculation, Running & Plein air",
    defaultCount: "17",
  },
  "Bébé & Puériculture": {
    ...LUXURY_PALETTE_VARIANTS.blushSilk,
    icon: Baby,
    defaultTitle: "Bébé & Puériculture",
    defaultSubtitle: "Poussettes, Sommeil, Éveil & Jeux",
    defaultCount: "10",
  },
  "Artisanat & Tradition": {
    ...LUXURY_PALETTE_VARIANTS.sunsetAmber,
    icon: Palette,
    defaultTitle: "Artisanat & Tradition",
    defaultSubtitle: "Céramique, Tissage, Cuir & Terroir",
    defaultCount: "15",
  },
};

const ALIASES: Record<string, string> = {
  vehiculespieces: "Auto & Moto",
  autoequipement: "Auto & Moto",
  automoto: "Auto & Moto",
  auto: "Auto & Moto",
  bricolagejardin: "Bricolage & Outillage",
  outillagetravaux: "Bricolage & Outillage",
  bricolage: "Bricolage & Outillage",
  maisondecoration: "Maison & Déco",
  maison: "Maison & Déco",
  techperformance: "Électronique",
  tech: "Électronique",
  modeelegance: "Mode",
  epicerieterroir: "Supermarché",
  beautesoins: "Beauté & Santé",
  homeappliances: "Électroménager",
  sportfitness: "Sport & Loisirs",
  bebeenfants: "Bébé & Puériculture",
  artisanat: "Artisanat & Tradition",
  jouets: "Jeux & Jouets",
  scolaire: "Scolaire & Bureau",
};

export const getCategoryTheme = (rawKey: string, indexFallback = 0): CategoryTheme => {
  if (THEMES_BY_KEY[rawKey]) return THEMES_BY_KEY[rawKey];
  const norm = normalize(rawKey);
  const aliasTarget = ALIASES[norm];
  if (aliasTarget && THEMES_BY_KEY[aliasTarget]) return THEMES_BY_KEY[aliasTarget];

  const foundEntry = Object.entries(THEMES_BY_KEY).find(([k]) => {
    const kNorm = normalize(k);
    return kNorm.includes(norm) || norm.includes(kNorm);
  });
  if (foundEntry) return foundEntry[1];

  const themeList = Object.values(THEMES_BY_KEY);
  return themeList[indexFallback % themeList.length];
};
