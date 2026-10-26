import {
  Grid,
  Columns3,
  Layers,
  CircleDot,
  SlidersHorizontal,
  Bookmark,
  Shirt,
  Smartphone,
  Sparkles,
  Palette,
  Apple,
  Car,
  Headphones,
  Laptop,
  Gamepad2,
  Gem,
  Award,
  Flame,
  Wrench,
  ShieldCheck,
  ShoppingBag,
  Coffee,
  Heart,
  Baby,
  LucideIcon,
} from "lucide-react";
import { CategoryLayoutType, CategoryAspectRatio, CategoryHoverEffect, CategoryCardRadius } from "./categoryPresets";

export interface LayoutOptionItem {
  id: CategoryLayoutType;
  label: string;
  sublabel: string;
  icon: LucideIcon;
}

export const CATEGORY_LAYOUT_OPTIONS: LayoutOptionItem[] = [
  { id: "mesh-3d", label: "Cartes Split Studio", sublabel: "Format horizontal photo & texte", icon: Sparkles },
  { id: "grid", label: "Grille Moderne", sublabel: "2 à 6 colonnes fluides", icon: Grid },
  { id: "bento", label: "Bento Grid", sublabel: "Carte vedette asymétrique", icon: Columns3 },
  { id: "bubbles", label: "Stories Instagram", sublabel: "Bulles rondes animées", icon: CircleDot },
  { id: "overlay", label: "Cartes Immersives", sublabel: "Photo plein cadre & verre", icon: Layers },
  { id: "carousel", label: "Carrousel Défilant", sublabel: "Défilement horizontal doux", icon: SlidersHorizontal },
  { id: "pills", label: "Capsules Pills", sublabel: "Boutons épurés avec icônes", icon: Bookmark },
];

export interface AspectRatioOption {
  id: CategoryAspectRatio;
  label: string;
  ratioClass: string;
}

export const CATEGORY_ASPECT_RATIOS: AspectRatioOption[] = [
  { id: "1/1", label: "Carré (1:1)", ratioClass: "aspect-square" },
  { id: "4/5", label: "Portrait Chic (4:5)", ratioClass: "aspect-[4/5]" },
  { id: "16/9", label: "Bannière (16:9)", ratioClass: "aspect-[16/9]" },
  { id: "4/3", label: "Standard (4:3)", ratioClass: "aspect-[4/3]" },
  { id: "circle", label: "Cercle Parfait", ratioClass: "aspect-square rounded-full" },
];

export interface HoverEffectOption {
  id: CategoryHoverEffect;
  label: string;
  effectClass: string;
}

export const CATEGORY_HOVER_EFFECTS: HoverEffectOption[] = [
  { id: "lift", label: "Standard (Élévation)", effectClass: "hover:-translate-y-0.5 hover:shadow-md" },
  { id: "zoom", label: "Subtil (1.02x)", effectClass: "group-hover:scale-[1.02]" },
  { id: "glow", label: "Bordure Nette", effectClass: "hover:border-slate-900" },
  { id: "none", label: "Statique (Aucun)", effectClass: "" },
];

export interface RadiusOption {
  id: CategoryCardRadius;
  label: string;
  radiusClass: string;
}

export const CATEGORY_RADIUS_OPTIONS: RadiusOption[] = [
  { id: "none", label: "Droit (0px)", radiusClass: "rounded-none" },
  { id: "sm", label: "Léger (8px)", radiusClass: "rounded-lg" },
  { id: "md", label: "Moderne (16px)", radiusClass: "rounded-2xl" },
  { id: "lg", label: "Très Arrondi (24px)", radiusClass: "rounded-3xl" },
  { id: "full", label: "Capsule (Pill)", radiusClass: "rounded-full" },
];

export const CATEGORY_ICON_CATALOG: Array<{ name: string; icon: LucideIcon }> = [
  { name: "ShoppingBag", icon: ShoppingBag },
  { name: "Shirt", icon: Shirt },
  { name: "Smartphone", icon: Smartphone },
  { name: "Sparkles", icon: Sparkles },
  { name: "Palette", icon: Palette },
  { name: "Apple", icon: Apple },
  { name: "Car", icon: Car },
  { name: "Laptop", icon: Laptop },
  { name: "Headphones", icon: Headphones },
  { name: "Gamepad2", icon: Gamepad2 },
  { name: "Gem", icon: Gem },
  { name: "Award", icon: Award },
  { name: "Flame", icon: Flame },
  { name: "Wrench", icon: Wrench },
  { name: "ShieldCheck", icon: ShieldCheck },
  { name: "Coffee", icon: Coffee },
  { name: "Heart", icon: Heart },
  { name: "Baby", icon: Baby },
];

export const getLucideCategoryIcon = (iconName?: string): LucideIcon => {
  const match = CATEGORY_ICON_CATALOG.find((item) => item.name === iconName);
  return match ? match.icon : ShoppingBag;
};
