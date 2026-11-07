import { AppTimestamp } from "../utils/date";
import {
  BannerContentPosition,
  BannerImageFit,
  BannerImagePosition,
  BannerRedirectType,
  BannerShadowIntensity,
  BannerTextAlign,
  BannerTranslationFields,
  BannerZone,
} from "../domains/home/homepage.types";

export type {
  BannerContentPosition,
  BannerImageFit,
  BannerImagePosition,
  BannerRedirectType,
  BannerShadowIntensity,
  BannerTextAlign,
  BannerTranslationFields,
  BannerZone,
};

export interface DbBanner {
  id: string;
  title: string;
  title_color?: string;
  subtitle?: string;
  subtitle_color?: string;
  badge?: string;
  badge_color?: string;
  discount_label?: string;
  button_text: string;
  btn_bg_color?: string;
  btn_text_color?: string;
  secondary_button_text?: string;
  secondary_cta_link?: string;
  desktop_image: string;
  mobile_image?: string | null;
  redirect_type?: BannerRedirectType;
  tag_id: string;
  cta_link?: string;
  ctaLink?: string;
  target_category?: string;
  sort_order: number;
  order?: number;
  is_active: boolean;
  isActive?: boolean;
  featured_products?: string[];
  created_at?: AppTimestamp;
  start_date?: string | null;
  end_date?: string | null;
  show_countdown?: boolean;
  views?: number;
  clicks?: number;
  ab_group?: "all" | "A" | "B";
  zone?: BannerZone;
  target_user_type?: "all" | "new" | "logged_in";
  target_regions?: string[];
  text_align?: BannerTextAlign;
  content_position?: BannerContentPosition;
  overlay_opacity?: number;
  overlay_color?: string;
  shadow_intensity?: BannerShadowIntensity;
  image_margin?: number;
  image_fit?: BannerImageFit;
  image_position?: BannerImagePosition;
  bg_color?: string;
  translations?: Record<string, Record<string, string>>;
}

export interface TagType {
  id: string;
  name: string;
  slug: string;
}

export interface CompressResult {
  blob: Blob;
  base64: string;
}

export interface PromoBanner {
  title?: string;
  subtitle?: string;
  badge?: string;
  ctaLink?: string;
  image?: string;
  bgColor?: string;
  textColor?: string;
}

export interface WilayaCampaign {
  heroTitle?: string;
  heroSubtitle?: string;
  heroButtonText?: string;
  heroImage?: string;
  promoLeft?: PromoBanner;
  promoRight?: PromoBanner;
}

export interface WilayaBannerData {
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText: string;
  heroImage: string;
  promoLeftTitle: string;
  promoLeftSubtitle: string;
  promoLeftImage: string;
  promoRightTitle: string;
  promoRightSubtitle: string;
  promoRightImage: string;
}

export interface BannerColorThemePreset {
  id: string;
  name: string;
  primaryCircle: string;
  secondaryCircle: string;
  titleColor: string;
  subtitleColor: string;
  btnBgColor: string;
  btnTextColor: string;
  badgeColor: string;
  bgColor: string;
  overlayColor: string;
}

export const BANNER_COLOR_THEMES: BannerColorThemePreset[] = [
  {
    id: "plum_gold",
    name: "Prune Impérial & Or",
    primaryCircle: "#1A1836",
    secondaryCircle: "#E99856",
    titleColor: "#FFFFFF",
    subtitleColor: "#F3E8EE",
    btnBgColor: "#E99856",
    btnTextColor: "#1A1836",
    badgeColor: "#E99856",
    bgColor: "#1A1836",
    overlayColor: "#1A1836",
  },
  {
    id: "emerald_prestige",
    name: "Émeraude d'Alger",
    primaryCircle: "#064E3B",
    secondaryCircle: "#F59E0B",
    titleColor: "#FFFFFF",
    subtitleColor: "#D1FAE5",
    btnBgColor: "#F59E0B",
    btnTextColor: "#064E3B",
    badgeColor: "#34D399",
    bgColor: "#064E3B",
    overlayColor: "#022C22",
  },
  {
    id: "ivory_sand",
    name: "Sable & Terracotta",
    primaryCircle: "#F59E0B",
    secondaryCircle: "#C2410C",
    titleColor: "#FFFFFF",
    subtitleColor: "#FDE68A",
    btnBgColor: "#EA580C",
    btnTextColor: "#FFFFFF",
    badgeColor: "#FBBF24",
    bgColor: "#292524",
    overlayColor: "#1C1917",
  },
  {
    id: "crimson_flash",
    name: "Rubis Vente Flash",
    primaryCircle: "#881337",
    secondaryCircle: "#FB7185",
    titleColor: "#FFFFFF",
    subtitleColor: "#FFE4E6",
    btnBgColor: "#E11D48",
    btnTextColor: "#FFFFFF",
    badgeColor: "#FDA4AF",
    bgColor: "#4C0519",
    overlayColor: "#4C0519",
  },
  {
    id: "obsidian_luxe",
    name: "Obsidienne & Platine",
    primaryCircle: "#09090B",
    secondaryCircle: "#E4E4E7",
    titleColor: "#FFFFFF",
    subtitleColor: "#D4D4D8",
    btnBgColor: "#FFFFFF",
    btnTextColor: "#09090B",
    badgeColor: "#F4F4F5",
    bgColor: "#09090B",
    overlayColor: "#09090B",
  },
  {
    id: "mediterranean_blue",
    name: "Azur Méditerranée",
    primaryCircle: "#0F172A",
    secondaryCircle: "#38BDF8",
    titleColor: "#FFFFFF",
    subtitleColor: "#E0F2FE",
    btnBgColor: "#0284C7",
    btnTextColor: "#FFFFFF",
    badgeColor: "#38BDF8",
    bgColor: "#0F172A",
    overlayColor: "#0F172A",
  },
];
