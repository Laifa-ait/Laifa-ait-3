import { z } from "zod";

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const SAFE_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Safe URL validator ensuring only https: or http: is permitted (no javascript: or data:text/html)
const safeMediaUrl = z
  .string()
  .url("URL de média invalide")
  .refine((val) => {
    try {
      const parsed = new URL(val);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
      const lower = val.toLowerCase();
      return !lower.includes("javascript:") && !lower.includes("data:text/html");
    } catch {
      return false;
    }
  }, "L'URL du média doit être un lien sécurisé HTTPS");

const optionalSafeMediaUrl = z.union([safeMediaUrl, z.literal("")]).optional();
const hexColor = z.string().regex(HEX_COLOR_REGEX, "Format hexadécimal invalide (#RRGGBB)").optional();

export const sectionStylesSchema = z.object({
  backgroundColor: hexColor,
  textColor: hexColor,
  paddingY: z.union([z.enum(["sm", "md", "lg", "xl"]), z.number().min(0).max(200)]).optional(),
  paddingX: z.number().min(0).max(120).optional(),
  containerWidth: z.enum(["contained", "full", "narrow"]).optional(),
  borderRadius: z.enum(["none", "sm", "md", "lg"]).optional(),
  divider: z.enum(["none", "wave", "slant", "curve"]).optional(),
  animation: z.enum(["none", "fade", "slide-up", "zoom"]).optional(),
  shadow: z.enum(["none", "sm", "floating", "brutal"]).optional(),
});

const commonSectionSettings = {
  hideOnMobile: z.boolean().optional(),
  hideOnDesktop: z.boolean().optional(),
  anchorId: z.string().max(80).optional(),
  textAlignment: z.enum(["left", "center", "right"]).optional(),
};

// 1. Hero Banner
const heroBannerSchema = z.object({
  id: z.string().min(1),
  type: z.literal("hero_banner"),
  title: z.string().max(120).optional(),
  settings: z.object({
    ...commonSectionSettings,
    title: z.string().min(1, "Le titre est obligatoire").max(120),
    subtitle: z.string().max(250).optional(),
    badgeText: z.string().max(40).optional(),
    imageUrl: safeMediaUrl,
    mobileImageUrl: optionalSafeMediaUrl,
    ctaText: z.string().max(60).optional(),
    ctaLink: z.string().max(200).optional(),
    textAlignment: z.enum(["left", "center", "right"]).optional().default("center"),
    overlayOpacity: z.number().min(0).max(90).optional().default(30),
  }),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative(),
});

// 2. Promo Carousel
const promoSlideSchema = z.object({
  id: z.string().min(1),
  imageUrl: safeMediaUrl,
  title: z.string().max(120).optional(),
  link: z.string().max(200).optional(),
});

const promoCarouselSchema = z.object({
  id: z.string().min(1),
  type: z.literal("promo_carousel"),
  title: z.string().max(100).optional(),
  settings: z.object({
    ...commonSectionSettings,
    slides: z.array(promoSlideSchema).min(1, "Au moins 1 diapositive").max(5, "Maximum 5 diapositives"),
    autoplay: z.boolean().optional().default(true),
    intervalSec: z.number().min(2).max(15).optional().default(5),
  }),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative(),
});

// 3. Featured Categories (supports Canva presets & custom category cards)
const categoryItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(80),
  subtitle: z.string().max(140).optional(),
  imageUrl: optionalSafeMediaUrl,
  slug: z.string().min(1).max(80),
  iconName: z.string().max(50).optional(),
  badge: z.string().max(40).optional(),
  badgeColor: z.string().max(30).optional(),
  itemCount: z.union([z.number(), z.string()]).optional(),
  colSpan: z.union([z.literal(1), z.literal(2)]).optional(),
  accentColor: z.string().max(30).optional(),
});

const featuredCategoriesSchema = z.object({
  id: z.string().min(1),
  type: z.literal("featured_categories"),
  title: z.string().max(100).optional(),
  settings: z.object({
    ...commonSectionSettings,
    title: z.string().max(120).optional(),
    subtitle: z.string().max(200).optional(),
    categories: z.array(categoryItemSchema).max(16).default([]),
    layout: z.enum(["grid", "bento", "bubbles", "overlay", "carousel", "pills"]).optional().default("grid"),
    aspectRatio: z.enum(["1/1", "4/5", "16/9", "circle", "4/3"]).optional(),
    borderRadius: z.enum(["none", "sm", "md", "lg", "full"]).optional(),
    hoverEffect: z.enum(["zoom", "lift", "glow", "shine", "grayscale-reveal", "none"]).optional(),
    textPosition: z.enum(["below", "overlay-bottom", "overlay-center", "card-inside"]).optional(),
    textTransform: z.enum(["none", "uppercase", "capitalize"]).optional(),
    overlayOpacity: z.number().min(0).max(90).optional(),
    glassmorphism: z.boolean().optional(),
    showBadge: z.boolean().optional(),
    showItemCount: z.boolean().optional(),
    showIcon: z.boolean().optional(),
    gapSize: z.enum(["compact", "normal", "spacious"]).optional(),
  }),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative(),
});

// 4. Curated Collections
const curatedCollectionItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(80),
  imageUrl: optionalSafeMediaUrl,
  productIds: z.array(z.string().min(1)).max(24).default([]),
});

const curatedCollectionsSchema = z.object({
  id: z.string().min(1),
  type: z.literal("curated_collections"),
  title: z.string().max(100).optional(),
  settings: z.object({
    ...commonSectionSettings,
    title: z.string().max(100).optional(),
    collections: z.array(curatedCollectionItemSchema).max(8).default([]),
  }),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative(),
});

// 5, 7, 8. Generic product feed schema for new_arrivals, best_sellers, product_grid
const productFeedSchema = (type: "new_arrivals" | "best_sellers" | "product_grid") =>
  z.object({
    id: z.string().min(1),
    type: z.literal(type),
    title: z.string().max(100).optional(),
    settings: z.object({
      ...commonSectionSettings,
      title: z.string().max(100).optional(),
      subtitle: z.string().max(200).optional(),
      maxItems: z.number().int().min(2).max(24).optional().default(8),
      layout: z.enum(["grid", "carousel"]).optional().default("grid"),
      filterCategoryId: z.string().optional(),
    }),
    styles: sectionStylesSchema,
    isVisible: z.boolean().default(true),
    order: z.number().int().nonnegative(),
  });

// 6. Featured Products
const featuredProductsSchema = z.object({
  id: z.string().min(1),
  type: z.literal("featured_products"),
  title: z.string().max(100).optional(),
  settings: z.object({
    ...commonSectionSettings,
    title: z.string().max(100).optional(),
    subtitle: z.string().max(200).optional(),
    productIds: z.array(z.string().min(1)).max(24, "Maximum 24 produits").default([]),
    layout: z.enum(["grid", "carousel"]).optional().default("grid"),
  }),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative(),
});

// 9. Brand Story
const brandStorySchema = z.object({
  id: z.string().min(1),
  type: z.literal("brand_story"),
  title: z.string().max(100).optional(),
  settings: z.object({
    ...commonSectionSettings,
    heading: z.string().min(1).max(120),
    bodyText: z.string().min(1).max(2000),
    imageUrl: optionalSafeMediaUrl,
    videoUrl: optionalSafeMediaUrl,
    signature: z.string().max(80).optional(),
    yearsOfExperience: z.number().int().min(0).max(100).optional(),
  }),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative(),
});

// 10. Showcase Video
const showcaseVideoSchema = z.object({
  id: z.string().min(1),
  type: z.literal("showcase_video"),
  title: z.string().max(100).optional(),
  settings: z.object({
    ...commonSectionSettings,
    title: z.string().max(100).optional(),
    videoUrl: optionalSafeMediaUrl,
    posterUrl: optionalSafeMediaUrl,
    autoplay: z.boolean().optional().default(false),
    loop: z.boolean().optional().default(false),
    muted: z.boolean().optional().default(true),
  }),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative(),
});

// 11. Verified Reviews
const verifiedReviewsSchema = z.object({
  id: z.string().min(1),
  type: z.literal("verified_reviews"),
  title: z.string().max(100).optional(),
  settings: z.object({
    ...commonSectionSettings,
    title: z.string().max(100).optional(),
    maxReviews: z.number().int().min(1).max(12).optional().default(6),
    filterMinRating: z.number().min(1).max(5).optional().default(4),
  }),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative(),
});

// 12. Delivery Info
const deliveryInfoItemSchema = z.object({
  wilayaName: z.string().min(1).max(50),
  estimatedDays: z.string().min(1).max(30),
  priceDZD: z.number().nonnegative(),
  homeDeliveryAvailable: z.boolean().default(true),
});

const deliveryInfoSchema = z.object({
  id: z.string().min(1),
  type: z.literal("delivery_info"),
  title: z.string().max(100).optional(),
  settings: z.object({
    ...commonSectionSettings,
    title: z.string().max(100).optional(),
    defaultTimeframe: z.string().max(60).optional(),
    customTariffs: z.array(deliveryInfoItemSchema).max(69).optional(),
    freeShippingAbove: z.number().positive().optional(),
  }),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative(),
});

// 13. Return Policy
const returnPolicySchema = z.object({
  id: z.string().min(1),
  type: z.literal("return_policy"),
  title: z.string().max(100).optional(),
  settings: z.object({
    ...commonSectionSettings,
    title: z.string().max(100).optional(),
    delayDays: z.number().int().min(1).max(90).default(14),
    conditions: z.string().min(1).max(1500),
    returnShippingFeeBy: z.enum(["buyer", "seller", "free"]).default("buyer"),
  }),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative(),
});

// 14. FAQ Accordion
const faqItemSchema = z.object({
  question: z.string().min(1).max(150),
  answer: z.string().min(1).max(800),
});

const faqAccordionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("faq_accordion"),
  title: z.string().max(100).optional(),
  settings: z.object({
    ...commonSectionSettings,
    title: z.string().max(100).optional(),
    items: z.array(faqItemSchema).min(1, "Au moins une question/réponse").max(12, "Maximum 12 questions"),
  }),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative(),
});

// 15. Contact Footer
const contactFooterSchema = z.object({
  id: z.string().min(1),
  type: z.literal("contact_footer"),
  title: z.string().max(100).optional(),
  settings: z.object({
    ...commonSectionSettings,
    shopPhone: z.string().max(30).optional(),
    shopEmail: z.string().email("Email invalide").max(100).optional().or(z.literal("")),
    address: z.string().max(200).optional(),
    wilaya: z.string().max(50).optional(),
    workingHours: z.string().max(100).optional(),
    socialInstagram: z.string().max(100).optional(),
    socialFacebook: z.string().max(100).optional(),
    socialTiktok: z.string().max(100).optional(),
  }),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative(),
});

export const customPageSectionSchema = z.discriminatedUnion("type", [
  heroBannerSchema,
  promoCarouselSchema,
  featuredCategoriesSchema,
  curatedCollectionsSchema,
  productFeedSchema("new_arrivals"),
  featuredProductsSchema,
  productFeedSchema("best_sellers"),
  productFeedSchema("product_grid"),
  brandStorySchema,
  showcaseVideoSchema,
  verifiedReviewsSchema,
  deliveryInfoSchema,
  returnPolicySchema,
  faqAccordionSchema,
  contactFooterSchema,
]);

export const storeConfigThemeSchema = z.object({
  sector: z.enum(["mode", "beaute", "artisanat", "tech", "maison"]).optional(),
  primaryColor: z.string().regex(HEX_COLOR_REGEX, "Couleur primaire hexadécimale invalide").optional(),
  secondaryColor: z.string().regex(HEX_COLOR_REGEX, "Couleur secondaire hexadécimale invalide").optional(),
  accentColor: z.string().regex(HEX_COLOR_REGEX, "Couleur accent hexadécimale invalide").optional(),
  canvasColor: z.string().regex(HEX_COLOR_REGEX, "Couleur canvas hexadécimale invalide").optional(),
  surfaceColor: z.string().regex(HEX_COLOR_REGEX, "Couleur surface hexadécimale invalide").optional(),
  fontFamily: z.string().max(100).optional(),
  accentBadgeColor: z.string().regex(HEX_COLOR_REGEX, "Couleur badge hexadécimale invalide").optional(),
  borderRadiusPx: z.number().min(0).max(50).optional(),
  spacingYPx: z.number().min(0).max(120).optional(),
  titleFontSizePx: z.number().min(8).max(100).optional(),
  bodyFontSizePx: z.number().min(8).max(50).optional(),
});

export const storeConfigSeoSchema = z.object({
  metaTitle: z.string().min(1).max(120).optional(),
  metaDescription: z.string().max(400).optional(),
  ogImage: optionalSafeMediaUrl,
});

const customPageItemSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  isHome: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  sectionIds: z.array(z.string()).optional(),
  updatedAt: z.string().max(80),
});

const mediaGalleryItemSchema = z.object({
  id: z.string().min(1).max(160),
  url: safeMediaUrl,
  type: z.enum(["image", "video"]),
  name: z.string().max(160).optional(),
  sizeBytes: z.number().nonnegative().optional(),
  uploadedAt: z.string().max(80),
});

export const storeConfigSchema = z.object({
  shopName: z.string().min(2, "Le nom de la boutique doit comporter au moins 2 caractères").max(80).optional(),
  shopSlug: z
    .string()
    .min(3)
    .max(50)
    .regex(SAFE_SLUG_REGEX, "Le slug doit contenir uniquement lettres minuscules, chiffres et tirets")
    .optional(),
  shopDescription: z.string().max(500).optional(),
  wilaya: z.string().max(50).optional(),
  commune: z.string().max(50).optional(),
  logoUrl: optionalSafeMediaUrl,
  bannerUrl: optionalSafeMediaUrl,
  brandStory: z.string().max(2000).optional(),
  returnPolicy: z.string().max(1500).optional(),
  avgPreparationTime: z.string().max(40).optional(),
  legalStatus: z.string().max(60).optional(),
  theme: storeConfigThemeSchema.optional(),
  seo: storeConfigSeoSchema.optional(),
  customPages: z.array(customPageItemSchema).max(20).optional(),
  mediaGallery: z.array(mediaGalleryItemSchema).max(60).optional(),
  socialLinks: z
    .object({
      instagram: z.string().max(100).optional(),
      facebook: z.string().max(100).optional(),
      tiktok: z.string().max(100).optional(),
      website: optionalSafeMediaUrl,
    })
    .optional(),
  contacts: z
    .object({
      phone: z.string().max(30).optional(),
      email: z.string().email().max(100).optional().or(z.literal("")),
    })
    .optional(),
});

export const saveDraftLayoutSchema = z.object({
  sections: z.array(customPageSectionSchema).max(30, "Maximum 30 sections autorisées"),
});

export const publishLayoutSchema = z.object({
  changeSummary: z.string().max(200).optional(),
});

export const rollbackLayoutSchema = z.object({
  versionNumber: z.number().int().positive("Le numéro de version doit être positif"),
});
