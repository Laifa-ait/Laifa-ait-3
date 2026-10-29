export interface CategoryItem {
  id: string;
  name: string;
  subtitle?: string;
  imageUrl?: string;
  slug: string;
  link?: string;
  iconName?: string;
  badge?: string;
  badgeColor?: string;
  itemCount?: number | string;
  colSpan?: 1 | 2;
  accentColor?: string;
  productIds?: string[];
  categoryFilter?: string;
  description?: string;
  hidden?: boolean;
}

export type CategoryCardSize = "compact" | "balanced" | "large";

export type CategoryLayoutType =
  | "grid"
  | "bento"
  | "bubbles"
  | "overlay"
  | "carousel"
  | "pills"
  | "mesh-3d"
  | "accordion"
  | "arch"
  | "polaroid"
  | "magazine"
  | "glass-dock";

export type CategoryAspectRatio = "1/1" | "4/5" | "16/9" | "circle" | "4/3";
export type CategoryHoverEffect = "zoom" | "lift" | "glow" | "shine" | "grayscale-reveal" | "none";
export type CategoryTextPosition = "below" | "overlay-bottom" | "overlay-center" | "card-inside" | "none";
export type CategoryCardRadius = "none" | "sm" | "md" | "lg" | "full";

export interface CategoryPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  tag: string;
  settings: {
    title: string;
    subtitle?: string;
    layout: CategoryLayoutType;
    aspectRatio: CategoryAspectRatio;
    borderRadius: CategoryCardRadius;
    hoverEffect: CategoryHoverEffect;
    textPosition: CategoryTextPosition;
    textTransform: "none" | "uppercase" | "capitalize";
    overlayOpacity: number;
    glassmorphism: boolean;
    showTitle?: boolean;
    showBadge: boolean;
    showItemCount: boolean;
    showIcon: boolean;
    gapSize: "compact" | "normal" | "spacious";
    categories: CategoryItem[];
  };
}
