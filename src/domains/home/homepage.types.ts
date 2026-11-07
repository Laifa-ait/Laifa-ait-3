import { AppTimestamp } from "../../utils/date";

export type View =
  | "shop"
  | "checkout"
  | "thank-you"
  | "product-detail"
  | "profile"
  | "orders"
  | "seller-dashboard"
  | "seller-shop"
  | "auth"
  | "admin-dashboard"
  | "complete-profile"
  | "search";

export type Language = "fr" | "ar" | "en";

export interface BannerTranslationFields {
  title?: string;
  subtitle?: string;
  button_text?: string;
  badge?: string;
}

export type BannerRedirectType = "tag" | "campaign" | "category" | "custom_url" | "shop";
export type BannerShadowIntensity = "none" | "soft" | "medium" | "strong" | "glow";
export type BannerTextAlign = "left" | "center" | "right";
export type BannerContentPosition = "bottom" | "center" | "top";
export type BannerImageFit = "cover" | "contain";
export type BannerImagePosition = "center" | "top" | "bottom" | "left" | "right";
export type BannerZone = "carousel_main" | "grid_top" | "grid_bottom" | "sidebar";

export interface HomepageSection {
  id: string;
  name: string;
  type:
    | "top_picks"
    | "flash_sale"
    | "new_arrivals"
    | "trending"
    | "recommended"
    | "brands"
    | "sellers"
    | "collections";
  orderIndex: number;
  isActive: boolean;
  is_active?: boolean;
  startDate?: AppTimestamp;
  endDate?: AppTimestamp;
  targetAudience?: "all" | "new" | "logged_in" | "vip";
  targetRegions?: string[];
  title?: string;
  subtitle?: string;
  icon?: string;
  layout?: "compact" | "standard" | "large" | "minimal" | "small";
  backgroundColor?: string;
  theme?: string;
  themeName?: string;
  themeImage?: string;
  margin?: string;
  columns?: number;
  limit?: number;
  tag?: string;
  category?: string;
  imageUrl?: string;
  bannerImage?: string;
  manualProducts?: string[];
  style?: string;
  rules?: {
    type: "manual" | "auto";
    category?: string;
    brand?: string;
    seller?: string;
    minRating?: number;
    minDiscount?: number;
    daysSinceAdded?: number;
    maxItems?: number;
  };
  createdAt?: AppTimestamp;
  updatedAt?: AppTimestamp;
  adminId?: string;
}

export interface Banner {
  id: string;
  name?: string;
  badge?: string;
  badge_color?: string;
  discount_label?: string;
  type?: "carousel" | "static" | "video";
  position?:
    | "hero"
    | "intermediate"
    | "sidebar"
    | "footer"
    | "top_bar"
    | "popup";
  zone?: BannerZone;
  layout?: string;
  imageUrl?: string;
  desktop_image?: string;
  desktopImage?: string;
  mobileImageUrl?: string;
  mobile_image?: string | null;
  videoUrl?: string;
  title?: string;
  title_color?: string;
  subtitle?: string;
  subtitle_color?: string;
  button_text?: string;
  buttonText?: string;
  btn_bg_color?: string;
  btn_text_color?: string;
  secondary_button_text?: string;
  secondary_cta_link?: string;
  ctaText?: string;
  ctaLink?: string;
  cta_link?: string;
  redirect_type?: BannerRedirectType;
  target_category?: string;
  tag_id?: string;
  linkedProductIds?: string[];
  backgroundColor?: string;
  bg_color?: string;
  textColor?: string;
  text_align?: BannerTextAlign;
  content_position?: BannerContentPosition;
  overlay_opacity?: number;
  overlay_color?: string;
  shadow_intensity?: BannerShadowIntensity;
  image_margin?: number;
  image_fit?: BannerImageFit;
  image_position?: BannerImagePosition;
  show_countdown?: boolean;
  orderIndex?: number;
  sort_order?: number;
  isActive?: boolean;
  is_active?: boolean;
  startDate?: AppTimestamp;
  start_date?: string | null;
  endDate?: AppTimestamp;
  end_date?: string | null;
  targetUserType?: "all" | "new" | "logged_in";
  target_user_type?: "all" | "new" | "logged_in";
  targetRegions?: string[];
  target_regions?: string[];
  clickCount?: number;
  impressionCount?: number;
  views?: number;
  clicks?: number;
  ab_group?: "all" | "A" | "B";
  featured_products?: string[];
  translations?: Record<string, Record<string, string>>;
  createdAt?: AppTimestamp;
  created_at?: AppTimestamp;
}

export interface CustomCategory {
  id: string;
  name?: string;
  slug?: string;
  image_url?: string;
  imageUrl?: string;
  sort_order?: number;
  is_active?: boolean;
  [key: string]: unknown;
}
