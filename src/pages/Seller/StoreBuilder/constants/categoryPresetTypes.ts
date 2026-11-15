export type CategoryImagePosition = "top" | "center" | "bottom";
export type CategoryImageFit = "cover" | "contain";
export type CategoryDeviceViewport = "desktop" | "tablet" | "mobile";

export interface CategoryItem {
  id: string;
  name: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  imagePosition?: CategoryImagePosition;
  imageFit?: CategoryImageFit;
  slug: string;
  link?: string;
  iconName?: string;
  badge?: string;
  badgeColor?: string;
  itemCount?: number | string;
  colSpan?: 1 | 2;
  accentColor?: string;
  selectionMode?: "manual" | "auto";
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

export interface CategoryLayoutCapabilities {
  supportsAspectRatio: boolean;
  supportsColumnsDesktop: boolean;
  supportsColumnsTablet: boolean;
  supportsColumnsMobile: boolean;
  supportsBorderRadius: boolean;
  supportsTextPositionChoice: boolean;
  supportsOverlayContrast: boolean;
  supportsGlassDockToggle: boolean;
  recommendedDesktopCols: number[];
  recommendedTabletCols: number[];
  recommendedMobileCols: number[];
}

export interface CategoryDeviceProfile {
  device: CategoryDeviceViewport;
  layout: CategoryLayoutType;
  cardSize: CategoryCardSize;
  aspectRatio: CategoryAspectRatio;
  columns: number;
  hasCustomLayout: boolean;
  hasCustomCardSize: boolean;
  hasCustomAspectRatio: boolean;
}

export interface CategoryPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  tag: string;
  sector?: string;
  settings: {
    title: string;
    subtitle?: string;
    layout: CategoryLayoutType;
    layoutTablet?: CategoryLayoutType | "inherit";
    layoutMobile?: CategoryLayoutType | "inherit";
    cardSize?: CategoryCardSize;
    cardSizeTablet?: CategoryCardSize | "inherit";
    cardSizeMobile?: CategoryCardSize | "inherit";
    aspectRatio: CategoryAspectRatio;
    aspectRatioTablet?: CategoryAspectRatio | "inherit";
    aspectRatioMobile?: CategoryAspectRatio | "inherit";
    columnsDesktop?: number;
    columnsTablet?: number;
    columnsMobile?: number;
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
