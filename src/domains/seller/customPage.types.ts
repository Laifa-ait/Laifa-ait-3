export type CustomPageSectionType =
  | "hero_banner"
  | "promo_carousel"
  | "featured_categories"
  | "curated_collections"
  | "new_arrivals"
  | "featured_products"
  | "best_sellers"
  | "product_grid"
  | "brand_story"
  | "showcase_video"
  | "verified_reviews"
  | "delivery_info"
  | "return_policy"
  | "faq_accordion"
  | "contact_footer";

export interface CustomPageSectionStyles {
  backgroundColor?: string;
  textColor?: string;
  paddingY?: "sm" | "md" | "lg" | "xl";
  containerWidth?: "contained" | "full";
  borderRadius?: "none" | "sm" | "md" | "lg";
}

export interface HeroBannerSettings {
  title: string;
  subtitle?: string;
  badgeText?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  textAlignment?: "left" | "center" | "right";
  overlayOpacity?: number; // 0 to 80
}

export interface PromoSlide {
  id: string;
  imageUrl: string;
  title?: string;
  link?: string;
}

export interface PromoCarouselSettings {
  slides: PromoSlide[];
  autoplay?: boolean;
  intervalSec?: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  imageUrl?: string;
  slug: string;
}

export interface FeaturedCategoriesSettings {
  title?: string;
  categories: CategoryItem[];
  layout?: "grid" | "carousel";
}

export interface CuratedCollectionItem {
  id: string;
  title: string;
  imageUrl?: string;
  productIds: string[];
}

export interface CuratedCollectionsSettings {
  title?: string;
  collections: CuratedCollectionItem[];
}

export interface ProductFeedSettings {
  title?: string;
  subtitle?: string;
  maxItems?: number;
  layout?: "grid" | "carousel";
  filterCategoryId?: string;
}

export interface FeaturedProductsSettings {
  title?: string;
  productIds: string[];
  layout?: "grid" | "carousel";
}

export interface BrandStorySettings {
  heading: string;
  bodyText: string;
  imageUrl?: string;
  videoUrl?: string;
  signature?: string;
  yearsOfExperience?: number;
}

export interface ShowcaseVideoSettings {
  title?: string;
  videoUrl: string;
  posterUrl?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export interface VerifiedReviewsSettings {
  title?: string;
  maxReviews?: number;
  filterMinRating?: number;
}

export interface DeliveryInfoItem {
  wilayaName: string;
  estimatedDays: string;
  priceDZD: number;
  homeDeliveryAvailable: boolean;
}

export interface DeliveryInfoSettings {
  title?: string;
  defaultTimeframe?: string;
  customTariffs?: DeliveryInfoItem[];
  freeShippingAbove?: number;
}

export interface ReturnPolicySettings {
  title?: string;
  delayDays: number;
  conditions: string;
  returnShippingFeeBy: "buyer" | "seller" | "free";
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqAccordionSettings {
  title?: string;
  items: FaqItem[];
}

export interface ContactFooterSettings {
  shopPhone?: string;
  shopEmail?: string;
  address?: string;
  wilaya?: string;
  workingHours?: string;
  socialInstagram?: string;
  socialFacebook?: string;
  socialTiktok?: string;
}

export type SectionSettingsMap = {
  hero_banner: HeroBannerSettings;
  promo_carousel: PromoCarouselSettings;
  featured_categories: FeaturedCategoriesSettings;
  curated_collections: CuratedCollectionsSettings;
  new_arrivals: ProductFeedSettings;
  featured_products: FeaturedProductsSettings;
  best_sellers: ProductFeedSettings;
  product_grid: ProductFeedSettings;
  brand_story: BrandStorySettings;
  showcase_video: ShowcaseVideoSettings;
  verified_reviews: VerifiedReviewsSettings;
  delivery_info: DeliveryInfoSettings;
  return_policy: ReturnPolicySettings;
  faq_accordion: FaqAccordionSettings;
  contact_footer: ContactFooterSettings;
};

export interface CustomPageSection<T extends CustomPageSectionType = CustomPageSectionType> {
  id: string;
  type: T;
  title?: string;
  settings: SectionSettingsMap[T];
  styles: CustomPageSectionStyles;
  isVisible: boolean;
  order: number;
}

export type StoreThemeSector = "mode" | "beaute" | "artisanat" | "tech" | "maison";

export interface CustomPageTheme {
  sector: StoreThemeSector;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  canvasColor?: string;
  surfaceColor?: string;
  fontFamily: string;
  accentBadgeColor?: string;
  borderRadiusPx?: number;
  spacingYPx?: number;
  titleFontSizePx?: number;
  bodyFontSizePx?: number;
}

export interface CustomPageSeo {
  metaTitle: string;
  metaDescription: string;
  ogImage?: string;
}

export interface StoreConfig {
  sellerId: string;
  shopName: string;
  shopSlug: string;
  shopDescription?: string;
  wilaya?: string;
  commune?: string;
  logoUrl?: string;
  bannerUrl?: string;
  brandStory?: string;
  returnPolicy?: string;
  avgPreparationTime?: string;
  legalStatus?: string;
  theme: CustomPageTheme;
  seo: CustomPageSeo;
  previousSlugs?: string[];
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    website?: string;
  };
  contacts?: {
    phone?: string;
    email?: string;
  };
  updatedAt: string;
}

export interface StoreLayoutVersion {
  versionNumber: number;
  sections: CustomPageSection[];
  status: "draft" | "published";
  publishedAt?: string;
  updatedAt: string;
  changeSummary?: string;
}

export interface StoreLayoutDocument {
  sellerId: string;
  draft: StoreLayoutVersion;
  published: StoreLayoutVersion | null;
  currentVersion: number;
  updatedAt: string;
}

export interface StoreHistoryEntry {
  versionId: string;
  versionNumber: number;
  sellerId: string;
  snapshot: StoreLayoutVersion;
  publishedAt: string;
  changeSummary?: string;
}

export interface MediaGalleryItem {
  id: string;
  url: string;
  type: "image" | "video";
  name?: string;
  sizeBytes?: number;
  uploadedAt: string;
}

export interface StudioDataResponse {
  storeConfig: StoreConfig;
  draftLayout: StoreLayoutVersion;
  publishedLayout: StoreLayoutVersion | null;
  historyList: StoreHistoryEntry[];
  mediaGallery: MediaGalleryItem[];
}
