import type {
  ArtisticAmbientLighting,
  ArtisticCardMaterial,
  ArtisticFrameShape,
  ArtisticSurfaceTexture,
  EditorialHeadingAccentStyle,
  EditorialUnderlineStyle,
  KineticMarqueeSettings,
} from "../../types/studio.types";

export type {
  ArtisticAmbientLighting,
  ArtisticCardMaterial,
  ArtisticFrameShape,
  ArtisticSurfaceTexture,
  EditorialHeadingAccentStyle,
  EditorialUnderlineStyle,
  KineticMarqueeSeparator,
  KineticMarqueeSettings,
  KineticMarqueeSpeed,
  KineticMarqueeTextStyle,
} from "../../types/studio.types";

export type CustomPageSectionType =
  | "hero_banner"
  | "promo_carousel"
  | "kinetic_marquee"
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
  headingColor?: string;
  subtitleColor?: string;
  kickerColor?: string;
  cardBgColor?: string;
  cardTextColor?: string;
  cardBorderColor?: string;
  priceColor?: string;
  badgeBgColor?: string;
  badgeTextColor?: string;
  iconColor?: string;
  overlayColor?: string;
  dividerColor?: string;
  colorScheme?: StudioColorSchemeId;
  useCornerColors?: boolean;
  cornerColorTl?: string;
  cornerColorTr?: string;
  cornerColorBr?: string;
  cornerColorBl?: string;
  sectionBorderColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonBorderColor?: string;
  buttonBorderWidthPx?: number;
  buttonBorderRadiusPx?: number;
  buttonSize?: "sm" | "md" | "lg";
  buttonShadow?: "none" | "sm" | "md" | "lg" | "xl" | "floating" | "glow" | "brutal";
  buttonShowArrow?: boolean;
  buttonStyle?: "solid" | "outline" | "inverse" | "pill" | "sharp";
  paddingY?: "sm" | "md" | "lg" | "xl" | number;
  paddingX?: number;
  containerWidth?: "contained" | "full" | "narrow";
  borderRadius?: "none" | "sm" | "md" | "lg";
  usePerCornerRadius?: boolean;
  borderRadiusTlPx?: number;
  borderRadiusTrPx?: number;
  borderRadiusBrPx?: number;
  borderRadiusBlPx?: number;
  divider?: "none" | "wave" | "slant" | "curve";
  animation?: "none" | "fade" | "slide-up" | "zoom";
  shadow?: HeroShadowToken;
  cardShadow?: HeroShadowToken;
  imageFilterPreset?: HeroImageFilterPreset;
  imageBrightness?: number;
  imageContrast?: number;
  imageSaturation?: number;
  imageSepia?: number;
  imageBlurPx?: number;
  surfaceTexture?: ArtisticSurfaceTexture;
  ambientLighting?: ArtisticAmbientLighting;
  cardMaterial?: ArtisticCardMaterial;
  frameShape?: ArtisticFrameShape;
  letterSpacing?: number;
  lineHeight?: number;
  headingAccentStyle?: EditorialHeadingAccentStyle;
  headingUnderlineStyle?: EditorialUnderlineStyle;
}

export type HeroShadowToken = "none" | "sm" | "md" | "lg" | "xl" | "floating" | "glow" | "brutal";
export type HeroImageFilterPreset = "none" | "warm-editorial" | "vivid-contrast" | "bw-art" | "soft-matte" | "golden-film";

export type HeroSubElement =
  | "background"
  | "badge"
  | "title"
  | "subtitle"
  | "cta"
  | "ctaPrimary"
  | "ctaSecondary";

export type HeroLayoutModelId =
  | "cinema-full"
  | "editorial-split"
  | "arch-palace"
  | "atelier-collage"
  | "bento-hero"
  | "full-bleed"
  | "split"
  | "arch"
  | "gallery"
  | "diptych"
  | "glass-dock"
  | "product-spotlight"
  | "magazine-ssense"
  | "flash-offer"
  | "lookbook-hotspots";

export type HeroTextPosition9 =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type HeroArchShapeId =
  | "roman-arch"
  | "capsule"
  | "asymmetric-leaf"
  | "floating-frame";

export type HeroColorPaletteId =
  | "pure-white"
  | "cream-earth"
  | "luxury-black"
  | "midnight-silver"
  | "sage-linen"
  | "custom";

export interface HeroDeviceMeasureConfig {
  styleId?: HeroLayoutModelId;
  heightPx?: number;
  innerPaddingPx?: number;
  borderRadiusPx?: number;
  textPosition9?: HeroTextPosition9;
  textAlign?: "left" | "center" | "right";
  titleSize?: "sm" | "md" | "lg" | "xl";
  textBoxMaxWidth?: 360 | 480 | 620;
  textVerticalGap?: 8 | 16 | 24;
  focalX?: number;
  focalY?: number;
  zoom?: number;
}

export interface HeroHotspotItem {
  id: string;
  x: number;
  y: number;
  label: string;
  price?: string;
  badge?: string;
  link?: string;
  productId?: string;
}

export interface HeroBannerSettings {
  title: string;
  subtitle?: string;
  badgeText?: string;
  imageUrl: string;
  tabletImageUrl?: string;
  mobileImageUrl?: string;
  backgroundImage?: string;
  backgroundImageMobile?: string;
  backgroundVideoUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  textAlignment?: "left" | "center" | "right";
  verticalAlignment?: "top" | "center" | "bottom";
  contentPosition?: BannerContentPosition;
  textPosition9?: HeroTextPosition9;
  overlayOpacity?: number;
  // Per-device image focal point positioning ("50% 50%", "50% 0%", etc.)
  imagePositionDesktop?: string;
  imagePositionTablet?: string;
  imagePositionMobile?: string;
  backgroundPosition?: string;
  backgroundPositionTablet?: string;
  backgroundPositionMobile?: string;
  imageFit?: "cover" | "contain";
  imageZoomDesktop?: number;
  imageZoomTablet?: number;
  imageZoomMobile?: number;
  imageAspectRatio?: "4/5" | "1/1" | "3/4" | "16/9";
  imageAspectRatioTablet?: "inherit" | "4/5" | "1/1" | "3/4" | "16/9";
  imageAspectRatioMobile?: "inherit" | "4/5" | "1/1" | "3/4" | "16/9";
  imageSide?: "right" | "left";
  splitRatio?: "60-40" | "50-50" | "40-60" | "70-30" | "30-70";
  splitProportion?: "50-50" | "60-40" | "70-30";
  archShape?: HeroArchShapeId;
  diptychGapPx?: number;
  containerMode?: "full" | "contained";
  innerPaddingPx?: number;
  borderRadiusPx?: number;
  usePerCornerRadius?: boolean;
  borderRadiusTlPx?: number;
  borderRadiusTrPx?: number;
  borderRadiusBrPx?: number;
  borderRadiusBlPx?: number;
  paletteId?: HeroColorPaletteId;
  bannerBgColor?: string;
  bannerBgGradient?: string;
  bannerBorderColor?: string;
  useCornerColors?: boolean;
  cornerColorTl?: string;
  cornerColorTr?: string;
  cornerColorBr?: string;
  cornerColorBl?: string;
  bannerShadow?: "none" | "sm" | "md" | "lg" | "xl" | "floating" | "glow" | "brutal";
  textBoxMaxWidth?: 360 | 480 | 620;
  textVerticalGap?: 8 | 16 | 24;
  showCompositionGuides?: boolean;
  ctaButtonSize?: "sm" | "md" | "lg";
  ctaTargetType?: "category" | "catalog" | "product";
  ctaTargetCategory?: string;
  ctaTargetProductId?: string;
  heroDesktopConfig?: HeroDeviceMeasureConfig;
  heroTabletConfig?: HeroDeviceMeasureConfig;
  heroMobileConfig?: HeroDeviceMeasureConfig;
  mobileStackOrder?: "image-first" | "text-first";
  imageShadow?: "none" | "sm" | "md" | "lg" | "xl" | "glow" | "brutal";
  imageMargin?: number;
  imageFilterPreset?: "none" | "warm-editorial" | "vivid-contrast" | "bw-art" | "soft-matte" | "golden-film";
  imageBrightness?: number;
  imageContrast?: number;
  imageSaturation?: number;
  imageSepia?: number;
  imageBlurPx?: number;
  bannerHeightDesktop?: "sm" | "md" | "lg" | "xl";
  bannerHeightTablet?: "inherit" | "sm" | "md" | "lg";
  bannerHeightMobile?: "sm" | "md" | "lg";
  // Individual sub-component styling
  badgeBgColor?: string;
  badgeTextColor?: string;
  badgeStyle?: "solid" | "soft" | "outline";
  titleColor?: string;
  titleSizeDesktop?: "sm" | "md" | "lg" | "xl";
  titleSizeTablet?: "inherit" | "sm" | "md" | "lg" | "xl";
  titleSizeMobile?: "sm" | "md" | "lg" | "xl";
  textShadow?: "none" | "sm" | "md" | "lg";
  subtitleColor?: string;
  ctaBgColor?: string;
  ctaTextColor?: string;
  ctaBorderColor?: string;
  ctaBorderWidthPx?: number;
  ctaBorderRadiusPx?: number;
  ctaShowArrow?: boolean;
  ctaStyle?: "solid" | "outline" | "pill" | "glass" | "sharp";
  ctaShadow?: "none" | "sm" | "md" | "lg" | "glow" | "brutal";
  showBadge?: boolean;
  showSubtitle?: boolean;
  showCta?: boolean;
  // Legacy & Extended Compatibility Fields
  socialProofBadge?: string;
  showSocialProofBadge?: boolean;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  secondaryCtaStyle?: "solid" | "outline" | "pill" | "glass" | "sharp";
  secondaryCtaShadow?: "none" | "sm" | "md" | "lg" | "glow" | "brutal";
  secondaryCtaBgColor?: string;
  secondaryCtaTextColor?: string;
  showSecondaryCta?: boolean;
  heroLayout?: HeroLayoutModelId;
  heroLayoutTablet?: "inherit" | HeroLayoutModelId;
  heroLayoutMobile?: "inherit" | HeroLayoutModelId;
  heroVariant?:
    | "minimalist"
    | "fullscreen-image"
    | "split-left-image"
    | "centered-text"
    | "promo-commercial"
    | "fashion-elegant"
    | "tech-precision";
  imageAlt?: string;
  bentoTopCardBadge?: string;
  bentoTopCardTitle?: string;
  bentoTopCardSubtitle?: string;
  bentoTopCardImage?: string;
  bentoTopCardLink?: string;
  bentoBottomCardBadge?: string;
  bentoBottomCardTitle?: string;
  bentoBottomCardMetric?: string;
  bentoBottomCardSubtext?: string;
  bentoBottomCardImage?: string;
  bentoBottomCardLink?: string;
  spotlightProductId?: string;
  spotlightProductTitle?: string;
  spotlightProductPrice?: string;
  spotlightProductOldPrice?: string;
  spotlightProductBadge?: string;
  spotlightProductImage?: string;
  spotlightFeatures?: string[];
  showSpotlightFeatures?: boolean;
  spotlightCardPosition?: "right" | "left" | "bottom-floating";
  secondaryImageUrl?: string;
  tertiaryImageUrl?: string;
  collageCaption?: string;
  collageCaption2?: string;
  collageCaption3?: string;
  collageSerialCode?: string;
  collageStyle?: "polaroid" | "floating";
  magazineIssueText?: string;
  magazineTags?: string[];
  showMagazineTags?: boolean;
  showTicker?: boolean;
  tickerText?: string;
  flashDiscountBadge?: string;
  flashPriceLabel?: string;
  flashPriceText?: string;
  flashOldPriceText?: string;
  flashUrgencyText?: string;
  showFlashUrgency?: boolean;
  hotspots?: HeroHotspotItem[];
  archBorderStyle?: "gold-double" | "cream-fine" | "minimal";
  archPills?: string[];
  showArchPills?: boolean;
  dockPosition?: "bottom-bar" | "center-card" | "bottom-left";
  dockGlassStyle?: "frosted-light" | "frosted-dark" | "tinted-accent";
  dockMetricText?: string;
  showDockMetric?: boolean;
  cinemaLetterbox?: boolean;
  showCodTrustStrip?: boolean;
  codTrustItems?: string[];
  imageStudioBg?: string;
  hideAllText?: boolean;
  titleFontFamily?: "sans" | "serif" | "display";
  titleFontWeight?: "normal" | "semibold" | "bold" | "black";
  showPriceTag?: boolean;
  bannerLayoutMode?: "compact-bottom" | "stacked-below" | "image-only";
  collagePrice1?: string;
  collagePrice2?: string;
  collagePrice3?: string;
  collageLink1?: string;
  collageLink2?: string;
  collageLink3?: string;
  heroSwapImages?: string[];
  enableImageSwap?: boolean;
  swapIntervalSec?: number;
  fullTopWidth?: boolean;
}

export type PromoCarouselStyleVariant =
  | "editorial_luxury"
  | "floating_glass"
  | "split_magazine"
  | "offer_spotlight"
  | "lookbook_peek";

export interface PromoSlide {
  id: string;
  imageUrl: string;
  badge?: string;
  title?: string;
  subtitle?: string;
  highlightPrice?: string;
  ctaText?: string;
  link?: string;
  contentPosition?: BannerContentPosition;
  overlayOpacity?: number;
}

export interface PromoCarouselSettings {
  slides: PromoSlide[];
  carouselStyle?: PromoCarouselStyleVariant;
  bannerHeight?: "sm" | "md" | "lg" | "xl";
  overlayOpacity?: number;
  showArrows?: boolean;
  showDots?: boolean;
  showSlideCounter?: boolean;
  autoplay?: boolean;
  intervalSec?: number;
  contentPosition?: BannerContentPosition;
  textAlignment?: "left" | "center" | "right";
  verticalAlignment?: "top" | "center" | "bottom";
  activePresetId?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  title?: string;
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
  titleColor?: string;
  subtitleColor?: string;
  categories: CategoryItem[];
  layout?:
    | "grid"
    | "bento"
    | "bubbles"
    | "overlay"
    | "carousel"
    | "pills"
    | "arch"
    | "polaroid"
    | "index"
    | "mesh3d"
    | "split"
    | "accordion";
  [key: string]: unknown;
}

export interface CuratedCollectionItem {
  id: string;
  title: string;
  imageUrl?: string;
  productIds: string[];
}

export interface CuratedCollectionsSettings {
  title?: string;
  subtitle?: string;
  collections: CuratedCollectionItem[];
}

export type ProductFeedLayoutMode = "grid" | "carousel" | "vertical" | "list";
export type ProductCardStyleVariant = "modern" | "minimal" | "bordered" | "elevated";
export type ProductCardAspectRatio = "1/1" | "4/5" | "4/3" | "16/9";

export interface ProductCardDesignSettings {
  cardStyle?: ProductCardStyleVariant;
  cardAspectRatio?: ProductCardAspectRatio;
  cardImagePosition?: "top" | "center" | "bottom";
  cardImageFit?: "cover" | "contain";
  columnsDesktop?: 2 | 3 | 4;
  cardAccentColor?: string;
  titleColor?: string;
  subtitleColor?: string;
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
  dropCap?: boolean;
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
  kinetic_marquee: KineticMarqueeSettings;
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
  schemaVersion?: number;
}

export type StoreThemeSector =
  | "mode"
  | "beaute"
  | "artisanat"
  | "tech"
  | "maison"
  | "alimentation"
  | "sport"
  | "accessoires"
  | "enfants";

export interface CustomPageTheme {
  sector: StoreThemeSector;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  canvasColor?: string;
  surfaceColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  borderColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  priceColor?: string;
  fontFamily: string;
  headingFontFamily?: string;
  bodyFontFamily?: string;
  accentBadgeColor?: string;
  badgeTextColor?: string;
  borderRadiusPx?: number;
  spacingYPx?: number;
  titleFontSizePx?: number;
  bodyFontSizePx?: number;
  surfaceTexture?: ArtisticSurfaceTexture;
  ambientLighting?: ArtisticAmbientLighting;
  cardMaterial?: ArtisticCardMaterial;
  frameShape?: ArtisticFrameShape;
  letterSpacing?: number;
  lineHeight?: number;
  headingAccentStyle?: EditorialHeadingAccentStyle;
  headingUnderlineStyle?: EditorialUnderlineStyle;
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

export type StorePageType =
  | "home"
  | "catalogue"
  | "collections"
  | "about"
  | "contact"
  | "faq"
  | "delivery"
  | "returns"
  | "custom";

export type StorePageTemplateId =
  | "default"
  | "collection"
  | "editorial"
  | "faq"
  | "contact"
  | "policy";

export interface StoreCustomPageItem {
  id: string;
  title: string;
  slug: string;
  pageType?: StorePageType;
  templateId?: StorePageTemplateId;
  subtitle?: string;
  bannerUrl?: string;
  productIds?: string[];
  isHome?: boolean;
  isPublished?: boolean;
  sectionIds?: string[];
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  updatedAt: string;
}

export interface StoreAnnouncementBarConfig {
  enabled: boolean;
  text: string;
  link?: string;
  bgColor?: string;
  textColor?: string;
  dismissible?: boolean;
}

export interface StoreNavMenuLink {
  id: string;
  label: string;
  target:
    | "home"
    | "collection"
    | "about"
    | "contact"
    | "faq"
    | "delivery"
    | "returns"
    | "page"
    | "url";
  pageSlug?: string;
  url?: string;
}

export interface StoreHeaderNavConfig {
  layout: "left" | "center" | "minimal";
  sticky: boolean;
  showSearch: boolean;
  showTrustBar: boolean;
  navLinks: StoreNavMenuLink[];
}

export interface StoreCommerceConfig {
  codEnabled: boolean;
  freeShippingThresholdDZD?: number;
  minOrderAmountDZD?: number;
  whatsappOrderEnabled: boolean;
  whatsappNumber?: string;
  preparationTimeHours?: string | number;
  showTrustBadges?: boolean;
}

export interface StoreStatusConfig {
  mode: "open" | "vacation" | "password";
  vacationMessage?: string;
  storefrontPassword?: string;
  passwordProtectionCode?: string;
}

export interface StorePixelsConfig {
  metaPixelId?: string;
  tiktokPixelId?: string;
  ga4MeasurementId?: string;
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
  announcementBar?: StoreAnnouncementBarConfig;
  headerConfig?: StoreHeaderNavConfig;
  commerceConfig?: StoreCommerceConfig;
  storeStatus?: StoreStatusConfig;
  pixelsConfig?: StorePixelsConfig;
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
  updatedAt?: string;
}

export type SellerStoreConfig = StoreConfig;
export type StoreHeaderConfig = StoreHeaderNavConfig;

export interface StoreLayoutVersion {
  versionNumber: number;
  draftRevision?: number;
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
  sectionsCount?: number;
}

export type MediaFolderCategory = "images" | "logos" | "banners" | "collections";

export interface MediaGalleryItem {
  id: string;
  url: string;
  type: "image" | "video";
  name?: string;
  folder?: MediaFolderCategory;
  width?: number;
  height?: number;
  mimeType?: string;
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
