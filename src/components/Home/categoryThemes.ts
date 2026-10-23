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
  bgBlob: string;
  border: string;
  iconColor: string;
  numColor: string;
  btnBg: string;
  icon: React.ComponentType<LucideProps>;
  defaultTitle: string;
  defaultSubtitle: string;
}

const normalize = (val: string): string =>
  val
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

export const THEMES_BY_KEY: Record<string, CategoryTheme> = {
  "Maison & Déco": {
    bgCard: "bg-[#edf6f0]",
    bgBlob: "bg-[#cee8d6]",
    border: "border-emerald-800/10",
    iconColor: "text-[#1f563b]",
    numColor: "text-[#1f563b]/70",
    btnBg: "bg-[#1f563b]",
    icon: Armchair,
    defaultTitle: "Maison & Décoration",
    defaultSubtitle: "Salons, Mobilier, Linge de maison...",
  },
  "Électronique": {
    bgCard: "bg-[#edf4fb]",
    bgBlob: "bg-[#cfe1f6]",
    border: "border-blue-900/10",
    iconColor: "text-[#1e3e62]",
    numColor: "text-[#1e3e62]/70",
    btnBg: "bg-[#1e3e62]",
    icon: Smartphone,
    defaultTitle: "Tech & Performance",
    defaultSubtitle: "Gadgets connectés, Audio & PC...",
  },
  "Mode": {
    bgCard: "bg-[#fcf1ee]",
    bgBlob: "bg-[#fcdcd4]",
    border: "border-rose-900/10",
    iconColor: "text-[#7c2d20]",
    numColor: "text-[#7c2d20]/70",
    btnBg: "bg-[#7c2d20]",
    icon: Shirt,
    defaultTitle: "Mode & Élégance",
    defaultSubtitle: "Prêt-à-porter, Chaussures & Sacs...",
  },
  "Supermarché": {
    bgCard: "bg-[#fdf7ea]",
    bgBlob: "bg-[#faeed0]",
    border: "border-amber-900/10",
    iconColor: "text-[#6e4616]",
    numColor: "text-[#6e4616]/70",
    btnBg: "bg-[#6e4616]",
    icon: ShoppingBasket,
    defaultTitle: "Épicerie & Terroir",
    defaultSubtitle: "Saveurs locales, Café & Douceurs...",
  },
  "Beauté & Santé": {
    bgCard: "bg-[#fbf0f7]",
    bgBlob: "bg-[#f6d7ee]",
    border: "border-fuchsia-900/10",
    iconColor: "text-[#6a205a]",
    numColor: "text-[#6a205a]/70",
    btnBg: "bg-[#6a205a]",
    icon: Sparkles,
    defaultTitle: "Beauté & Soins",
    defaultSubtitle: "Parfums, Cosmétiques & Bien-être...",
  },
  "Électroménager": {
    bgCard: "bg-[#eef7f7]",
    bgBlob: "bg-[#cfeded]",
    border: "border-teal-900/10",
    iconColor: "text-[#185358]",
    numColor: "text-[#185358]/70",
    btnBg: "bg-[#185358]",
    icon: Refrigerator,
    defaultTitle: "Électroménager",
    defaultSubtitle: "Froid, Cuisson & Petit déjeuner...",
  },
  "Auto & Moto": {
    bgCard: "bg-[#edf1f6]",
    bgBlob: "bg-[#d3dfec]",
    border: "border-slate-800/10",
    iconColor: "text-[#233b52]",
    numColor: "text-[#233b52]/70",
    btnBg: "bg-[#233b52]",
    icon: CarFront,
    defaultTitle: "Auto & Moto",
    defaultSubtitle: "Pièces détachées, Huiles & Entretien...",
  },
  "Bricolage & Outillage": {
    bgCard: "bg-[#f6f3ed]",
    bgBlob: "bg-[#ece3d3]",
    border: "border-stone-800/10",
    iconColor: "text-[#5c4a2a]",
    numColor: "text-[#5c4a2a]/70",
    btnBg: "bg-[#5c4a2a]",
    icon: Hammer,
    defaultTitle: "Outillage & Travaux",
    defaultSubtitle: "Outillage pro, Jardin & Maison...",
  },
  "Sport & Loisirs": {
    bgCard: "bg-[#eff7ec]",
    bgBlob: "bg-[#d7efce]",
    border: "border-lime-900/10",
    iconColor: "text-[#2a5b1e]",
    numColor: "text-[#2a5b1e]/70",
    btnBg: "bg-[#2a5b1e]",
    icon: Dumbbell,
    defaultTitle: "Sport & Fitness",
    defaultSubtitle: "Musculation, Running & Plein air...",
  },
  "Bébé & Puériculture": {
    bgCard: "bg-[#edf5fb]",
    bgBlob: "bg-[#d5eaf8]",
    border: "border-sky-900/10",
    iconColor: "text-[#1d4970]",
    numColor: "text-[#1d4970]/70",
    btnBg: "bg-[#1d4970]",
    icon: Baby,
    defaultTitle: "Bébé & Puériculture",
    defaultSubtitle: "Poussettes, Sommeil, Éveil & Jeux...",
  },
  "Artisanat & Tradition": {
    bgCard: "bg-[#fdf3ee]",
    bgBlob: "bg-[#f8ded1]",
    border: "border-orange-900/10",
    iconColor: "text-[#873b18]",
    numColor: "text-[#873b18]/70",
    btnBg: "bg-[#873b18]",
    icon: Palette,
    defaultTitle: "Artisanat & Tradition",
    defaultSubtitle: "Céramique, Tissage, Cuir & Terroir...",
  },
  "Jeux & Jouets": {
    bgCard: "bg-[#f5f0fb]",
    bgBlob: "bg-[#e5d8f6]",
    border: "border-purple-900/10",
    iconColor: "text-[#52297a]",
    numColor: "text-[#52297a]/70",
    btnBg: "bg-[#52297a]",
    icon: Gamepad2,
    defaultTitle: "Jeux & Jouets",
    defaultSubtitle: "Consoles, Puzzles, Figurines & Jeux...",
  },
  "Scolaire & Bureau": {
    bgCard: "bg-[#eff4fa]",
    bgBlob: "bg-[#d3e3f5]",
    border: "border-indigo-900/10",
    iconColor: "text-[#1e3a66]",
    numColor: "text-[#1e3a66]/70",
    btnBg: "bg-[#1e3a66]",
    icon: GraduationCap,
    defaultTitle: "Scolaire & Bureau",
    defaultSubtitle: "Papeterie, Fournitures & Organisation...",
  },
};

// Aliases lookup to match any database / route key variation
const ALIASES: Record<string, string> = {
  "vehiculespieces": "Auto & Moto",
  "autoequipement": "Auto & Moto",
  "automoto": "Auto & Moto",
  "auto": "Auto & Moto",
  "bricolagejardin": "Bricolage & Outillage",
  "outillagetravaux": "Bricolage & Outillage",
  "bricolage": "Bricolage & Outillage",
  "maisondecoration": "Maison & Déco",
  "maison": "Maison & Déco",
  "techperformance": "Électronique",
  "tech": "Électronique",
  "modeelegance": "Mode",
  "epicerieterroir": "Supermarché",
  "beautesoins": "Beauté & Santé",
  "homeappliances": "Électroménager",
  "sportfitness": "Sport & Loisirs",
  "bebeenfants": "Bébé & Puériculture",
  "artisanat": "Artisanat & Tradition",
  "jouets": "Jeux & Jouets",
  "scolaire": "Scolaire & Bureau",
};

export const getCategoryTheme = (rawKey: string, indexFallback = 0): CategoryTheme => {
  if (THEMES_BY_KEY[rawKey]) return THEMES_BY_KEY[rawKey];

  const norm = normalize(rawKey);
  const aliasTarget = ALIASES[norm];
  if (aliasTarget && THEMES_BY_KEY[aliasTarget]) return THEMES_BY_KEY[aliasTarget];

  // Try partial normalized search
  const foundEntry = Object.entries(THEMES_BY_KEY).find(([k]) => {
    const kNorm = normalize(k);
    return kNorm.includes(norm) || norm.includes(kNorm);
  });
  if (foundEntry) return foundEntry[1];

  const themeList = Object.values(THEMES_BY_KEY);
  return themeList[indexFallback % themeList.length];
};
