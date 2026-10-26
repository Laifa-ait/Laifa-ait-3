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

export const THEMES_BY_KEY: Record<string, CategoryTheme> = {
  "Jeux & Jouets": {
    bgCard: "bg-gradient-to-br from-[#E9D5FF] via-[#DDD6FE] to-[#F3E8FF]",
    radialGlow: "bg-[radial-gradient(ellipse_at_top_right,rgba(192,132,252,0.5),transparent_70%)]",
    border: "border-purple-300/50 hover:border-purple-400",
    discBg: "bg-white/30 backdrop-blur-md border border-white/50 shadow-xs",
    iconColor: "text-purple-900/80",
    numColor: "text-purple-900",
    btnBg: "bg-[#581C87] hover:bg-[#4C1D95]",
    icon: Gamepad2,
    defaultTitle: "Jeux & Jouets",
    defaultSubtitle: "Découvrez notre collection",
    defaultCount: "11",
  },
  "Supermarché": {
    bgCard: "bg-gradient-to-br from-[#FED7AA] via-[#FDBA74]/80 to-[#FFEDD5]",
    radialGlow: "bg-[radial-gradient(ellipse_at_top_right,rgba(251,146,60,0.5),transparent_70%)]",
    border: "border-orange-300/50 hover:border-orange-400",
    discBg: "bg-white/30 backdrop-blur-md border border-white/50 shadow-xs",
    iconColor: "text-amber-950/80",
    numColor: "text-amber-950",
    btnBg: "bg-[#7C2D12] hover:bg-[#9A3412]",
    icon: ShoppingBasket,
    defaultTitle: "Supermarché",
    defaultSubtitle: "Produits frais & quotidien",
    defaultCount: "12",
  },
  "Scolaire & Bureau": {
    bgCard: "bg-gradient-to-br from-[#BAE6FD] via-[#A5F3FC]/80 to-[#E0F2FE]",
    radialGlow: "bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.5),transparent_70%)]",
    border: "border-sky-300/50 hover:border-sky-400",
    discBg: "bg-white/30 backdrop-blur-md border border-white/50 shadow-xs",
    iconColor: "text-sky-950/80",
    numColor: "text-sky-950",
    btnBg: "bg-[#0C4A6E] hover:bg-[#0369A1]",
    icon: GraduationCap,
    defaultTitle: "Scolaire & Bureau",
    defaultSubtitle: "Livres, fournitures & rentrée",
    defaultCount: "18",
  },
  "Mode": {
    bgCard: "bg-gradient-to-br from-[#FECDD3] via-[#FBCFE8]/80 to-[#FFF1F2]",
    radialGlow: "bg-[radial-gradient(ellipse_at_top_right,rgba(244,63,94,0.45),transparent_70%)]",
    border: "border-rose-300/50 hover:border-rose-400",
    discBg: "bg-white/30 backdrop-blur-md border border-white/50 shadow-xs",
    iconColor: "text-rose-950/80",
    numColor: "text-rose-950",
    btnBg: "bg-[#881337] hover:bg-[#9F1239]",
    icon: Shirt,
    defaultTitle: "Mode & Élégance",
    defaultSubtitle: "Prêt-à-porter, Chaussures & Sacs",
    defaultCount: "24",
  },
  "Maison & Déco": {
    bgCard: "bg-gradient-to-br from-[#D1FAE5] via-[#A7F3D0]/80 to-[#ECFDF5]",
    radialGlow: "bg-[radial-gradient(ellipse_at_top_right,rgba(52,211,153,0.45),transparent_70%)]",
    border: "border-emerald-300/50 hover:border-emerald-400",
    discBg: "bg-white/30 backdrop-blur-md border border-white/50 shadow-xs",
    iconColor: "text-emerald-950/80",
    numColor: "text-emerald-950",
    btnBg: "bg-[#064E3B] hover:bg-[#047857]",
    icon: Armchair,
    defaultTitle: "Maison & Décoration",
    defaultSubtitle: "Salons, Mobilier & Linge de maison",
    defaultCount: "15",
  },
  "Électronique": {
    bgCard: "bg-gradient-to-br from-[#E0E7FF] via-[#C7D2FE]/80 to-[#EEF2FF]",
    radialGlow: "bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.45),transparent_70%)]",
    border: "border-indigo-300/50 hover:border-indigo-400",
    discBg: "bg-white/30 backdrop-blur-md border border-white/50 shadow-xs",
    iconColor: "text-indigo-950/80",
    numColor: "text-indigo-950",
    btnBg: "bg-[#1E1B4B] hover:bg-[#312E81]",
    icon: Smartphone,
    defaultTitle: "Tech & Performance",
    defaultSubtitle: "Gadgets connectés, Audio & PC",
    defaultCount: "20",
  },
  "Électroménager": {
    bgCard: "bg-gradient-to-br from-[#CCFBF1] via-[#99F6E4]/80 to-[#F0FDFA]",
    radialGlow: "bg-[radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.45),transparent_70%)]",
    border: "border-teal-300/50 hover:border-teal-400",
    discBg: "bg-white/30 backdrop-blur-md border border-white/50 shadow-xs",
    iconColor: "text-teal-950/80",
    numColor: "text-teal-950",
    btnBg: "bg-[#134E4A] hover:bg-[#0F766E]",
    icon: Refrigerator,
    defaultTitle: "Électroménager",
    defaultSubtitle: "Froid, Cuisson & Petit déjeuner",
    defaultCount: "14",
  },
  "Beauté & Santé": {
    bgCard: "bg-gradient-to-br from-[#FCE7F3] via-[#FBCFE8]/80 to-[#FDF2F8]",
    radialGlow: "bg-[radial-gradient(ellipse_at_top_right,rgba(236,72,153,0.45),transparent_70%)]",
    border: "border-pink-300/50 hover:border-pink-400",
    discBg: "bg-white/30 backdrop-blur-md border border-white/50 shadow-xs",
    iconColor: "text-pink-950/80",
    numColor: "text-pink-950",
    btnBg: "bg-[#701A75] hover:bg-[#86198F]",
    icon: Sparkles,
    defaultTitle: "Beauté & Soins",
    defaultSubtitle: "Parfums, Cosmétiques & Bien-être",
    defaultCount: "16",
  },
  "Auto & Moto": {
    bgCard: "bg-gradient-to-br from-[#E2E8F0] via-[#CBD5E1]/80 to-[#F1F5F9]",
    radialGlow: "bg-[radial-gradient(ellipse_at_top_right,rgba(100,116,139,0.4),transparent_70%)]",
    border: "border-slate-300/60 hover:border-slate-400",
    discBg: "bg-white/30 backdrop-blur-md border border-white/50 shadow-xs",
    iconColor: "text-slate-900/80",
    numColor: "text-slate-900",
    btnBg: "bg-[#0F172A] hover:bg-[#1E293B]",
    icon: CarFront,
    defaultTitle: "Auto & Moto",
    defaultSubtitle: "Pièces détachées & Entretien",
    defaultCount: "19",
  },
  "Bricolage & Outillage": {
    bgCard: "bg-gradient-to-br from-[#FEF3C7] via-[#FDE68A]/80 to-[#FFFBEB]",
    radialGlow: "bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.45),transparent_70%)]",
    border: "border-amber-300/60 hover:border-amber-400",
    discBg: "bg-white/30 backdrop-blur-md border border-white/50 shadow-xs",
    iconColor: "text-amber-950/80",
    numColor: "text-amber-950",
    btnBg: "bg-[#78350F] hover:bg-[#92400E]",
    icon: Hammer,
    defaultTitle: "Outillage & Travaux",
    defaultSubtitle: "Outillage pro, Jardin & Maison",
    defaultCount: "13",
  },
  "Sport & Loisirs": {
    bgCard: "bg-gradient-to-br from-[#DCFCE7] via-[#BBF7D0]/80 to-[#F0FDF4]",
    radialGlow: "bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.45),transparent_70%)]",
    border: "border-green-300/60 hover:border-green-400",
    discBg: "bg-white/30 backdrop-blur-md border border-white/50 shadow-xs",
    iconColor: "text-green-950/80",
    numColor: "text-green-950",
    btnBg: "bg-[#14532D] hover:bg-[#166534]",
    icon: Dumbbell,
    defaultTitle: "Sport & Fitness",
    defaultSubtitle: "Musculation, Running & Plein air",
    defaultCount: "17",
  },
  "Bébé & Puériculture": {
    bgCard: "bg-gradient-to-br from-[#E0F2FE] via-[#BAE6FD]/80 to-[#F0F9FF]",
    radialGlow: "bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.45),transparent_70%)]",
    border: "border-sky-300/60 hover:border-sky-400",
    discBg: "bg-white/30 backdrop-blur-md border border-white/50 shadow-xs",
    iconColor: "text-sky-950/80",
    numColor: "text-sky-950",
    btnBg: "bg-[#075985] hover:bg-[#0284C7]",
    icon: Baby,
    defaultTitle: "Bébé & Puériculture",
    defaultSubtitle: "Poussettes, Sommeil, Éveil & Jeux",
    defaultCount: "10",
  },
  "Artisanat & Tradition": {
    bgCard: "bg-gradient-to-br from-[#FFEDD5] via-[#FED7AA]/80 to-[#FFF7ED]",
    radialGlow: "bg-[radial-gradient(ellipse_at_top_right,rgba(234,88,12,0.45),transparent_70%)]",
    border: "border-orange-300/60 hover:border-orange-400",
    discBg: "bg-white/30 backdrop-blur-md border border-white/50 shadow-xs",
    iconColor: "text-orange-950/80",
    numColor: "text-orange-950",
    btnBg: "bg-[#7C2D12] hover:bg-[#9A3412]",
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
