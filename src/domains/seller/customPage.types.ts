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

export type StudioColorSchemeId = "scheme_1" | "scheme_2" | "scheme_3" | "scheme_4" | "custom";

export type BannerContentPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface CustomPageSectionStyles {
  backgroundColor?: string;
  textColor?: string;
  colorScheme?: StudioColorSchemeId;
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonStyle?: "solid" | "outline" | "inverse";
  paddingY?: "sm" | "md" | "lg" | "xl" | number;
  paddingX?: number;
  containerWidth?: "contained" | "full" | "narrow";
  borderRadius?: "none" | "sm" | "md" | "lg";
  divider?: "none" | "wave" | "slant" | "curve";
  animation?: "none" | "fade" | "slide-up" | "zoom";
  shadow?: "none" | "sm" | "floating" | "brutal";
}

export type HeroSubElement =
  | "background"
  | "badge"
  | "title"
  | "subtitle"
  | "cta"
  | "ctaPrimary"
  | "ctaSecondary";

export interface HeroBannerSettings {
  title: string;
  subtitle?: string;
  badgeText?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  textAlignment?: "left" | "center" | "right";
  verticalAlignment?: "top" | "center" | "bottom";
  contentPosition?: BannerContentPosition;
  overlayOpacity?: number;
  // Per-device image focal point positioning ("50% 50%", "50% 0%", etc.)
  imagePositionDesktop?: string;
  imagePositionTablet?: string;
  imagePositionMobile?: string;
  imageFit?: "cover" | "contain";
  bannerHeightDesktop?: "sm" | "md" | "lg" | "xl";
  bannerHeightMobile?: "sm" | "md" | "lg";
  // Individual sub-component styling
  badgeBgColor?: string;
  badgeTextColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  ctaBgColor?: string;
  ctaTextColor?: string;
  ctaStyle?: "solid" | "outline" | "pill" | "glass";
  showBadge?: boolean;
  showSubtitle?: boolean;
  showCta?: boolean;
  // E-Commerce 2.2 Studio Features
  socialProofBadge?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  secondaryCtaStyle?: "solid" | "outline" | "pill" | "glass";
}

export interface PromoSlide {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  link?: string;
  contentPosition?: BannerContentPosition;
}

export interface PromoCarouselSettings {
  slides: PromoSlide[];
  autoplay?: boolean;
  intervalSec?: number;
  contentPosition?: BannerContentPosition;
  textAlignment?: "left" | "center" | "right";
  verticalAlignment?: "top" | "center" | "bottom";
}

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
}

export interface FeaturedCategoriesSettings {
  title?: string;
  subtitle?: string;
  categories: CategoryItem[];
  layout?: "grid" | "bento" | "bubbles" | "overlay" | "carousel" | "pills";
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

export type ProductFeedLayoutMode = "grid" | "carousel" | "vertical";
export type ProductCardStyleVariant = "modern" | "minimal" | "bordered" | "elevated";
export type ProductCardAspectRatio = "1/1" | "4/5" | "4/3";

export interface ProductCardDesignSettings {
  cardStyle?: ProductCardStyleVariant;
  cardAspectRatio?: ProductCardAspectRatio;
  cardImagePosition?: "top" | "center" | "bottom";
  cardImageFit?: "cover" | "contain";
  columnsDesktop?: 2 | 3 | 4;
  cardAccentColor?: string;
  showStockBadge?: boolean;
  showCategory?: boolean;
  showCtaButton?: boolean;
  ctaLabel?: string;
  textAlignment?: "left" | "center" | "right";
  // E-Commerce 2.2 Studio Features
  showCountdown?: boolean;
  countdownLabel?: string;
  countdownSubtitle?: string;
  countdownEndDate?: string;
  countdownStyle?: "dark-pro" | "minimal-pill" | "warm-sunset" | "nordic-fresh" | "y2k-pink" | "theme-match";
  countdownBgColor?: string;
  countdownTextColor?: string;
  countdownAccentColor?: string;
  showColorSwatches?: boolean;
  colorSwatches?: string[];
  showSizeChips?: boolean;
  showSizes?: boolean;
  sizeChips?: string[];
  showStockProgress?: boolean;
  showCompareAtPrice?: boolean;
  soldCount?: number;
  totalStock?: number;
  showWishlistButton?: boolean;
  showRatingStars?: boolean;
  ratingValue?: number;
}

export interface ProductFeedSettings extends ProductCardDesignSettings {
  title?: string;
  subtitle?: string;
  maxItems?: number;
  layout?: ProductFeedLayoutMode;
  filterCategoryId?: string;
}

export interface FeaturedProductsSettings extends ProductCardDesignSettings {
  title?: string;
  subtitle?: string;
  productIds: string[];
  layout?: ProductFeedLayoutMode;
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

export interface CollectionPageDesignConfig {
  headerStyle?: "hero-image" | "minimal" | "split-banner";
  headerHeight?: "sm" | "md" | "lg";
  headerOverlayOpacity?: number;
  showSearch?: boolean;
  showSortDropdown?: boolean;
  showCategoryPills?: boolean;
  columnsDesktop?: 2 | 3 | 4;
  cardStyle?: ProductCardStyleVariant;
  cardAspectRatio?: ProductCardAspectRatio;
  showStockBadge?: boolean;
  showCtaButton?: boolean;
  ctaLabel?: string;
}

export interface StoreCustomPageItem {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  bannerUrl?: string;
  productIds?: string[];
  isHome?: boolean;
  isPublished?: boolean;
  sectionIds?: string[];
  updatedAt: string;
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
  customPages?: StoreCustomPageItem[];
  collectionPageConfig?: CollectionPageDesignConfig;
  mediaGallery?: MediaGalleryItem[];
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

export type SellerStoreConfig = StoreConfig;

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
