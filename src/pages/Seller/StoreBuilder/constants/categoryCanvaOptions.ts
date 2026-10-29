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
  { id: "bento", label: "Bento Apple Flagship", sublabel: "Mosaïque asymétrique sans trou", icon: Columns3 },
  { id: "accordion", label: "Galerie Accordéon", sublabel: "Expansion interactive au survol", icon: SlidersHorizontal },
  { id: "arch", label: "Arche Boutique Palace", sublabel: "Dôme architectural de luxe", icon: Gem },
  { id: "polaroid", label: "Polaroid Studio", sublabel: "Cadre photo & moodboard", icon: Palette },
  { id: "magazine", label: "Index Magazine Luxe", sublabel: "Répertoire numéroté SSENSE", icon: Award },
  { id: "glass-dock", label: "Vitrine Glass Dock", sublabel: "Capsule givrée flottante", icon: Layers },
  { id: "mesh-3d", label: "Split Studio Éditorial", sublabel: "Format horizontal photo & index", icon: Sparkles },
  { id: "grid", label: "Grille Prestige", sublabel: "Cadre éditorial & barre d'action", icon: Grid },
  { id: "overlay", label: "Affiche Cinéma", sublabel: "Poster plein cadre & liseré", icon: Flame },
  { id: "bubbles", label: "Médaillons Podium", sublabel: "Cercles bague luxe sur socle", icon: CircleDot },
  { id: "pills", label: "Dock Capsules Pro", sublabel: "Bandeaux rapides avec photo", icon: Bookmark },
  { id: "carousel", label: "Lookbook Slider", sublabel: "Défilement horizontal fluide", icon: SlidersHorizontal },
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
