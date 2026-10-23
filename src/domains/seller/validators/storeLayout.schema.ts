import { z } from "zod";

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const SAFE_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Safe URL validator ensuring only https: or trusted storage is permitted (no javascript: or data:text/html)
const safeMediaUrl = z.string().url("URL de média invalide").refine((val) => {
  try {
    const parsed = new URL(val);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    const lower = val.toLowerCase();
    return !lower.includes("javascript:") && !lower.includes("data:text/html");
  } catch {
    return false;
  }
}, "L'URL du média doit être un lien sécurisé HTTPS");

const hexColor = z.string().regex(HEX_COLOR_REGEX, "Format hexadécimal invalide (#RRGGBB)").optional();

export const sectionStylesSchema = z.object({
  backgroundColor: hexColor,
  textColor: hexColor,
  paddingY: z.enum(["sm", "md", "lg", "xl"]).optional(),
  containerWidth: z.enum(["contained", "full"]).optional(),
  borderRadius: z.enum(["none", "sm", "md", "lg"]).optional(),
}).strict();

// 1. Hero Banner
const heroBannerSchema = z.object({
  id: z.string().min(1),
  type: z.literal("hero_banner"),
  title: z.string().max(120).optional(),
  settings: z.object({
    title: z.string().min(1, "Le titre est obligatoire").max(120),
    subtitle: z.string().max(250).optional(),
    badgeText: z.string().max(40).optional(),
    imageUrl: safeMediaUrl,
    mobileImageUrl: safeMediaUrl.optional(),
    ctaText: z.string().max(40).optional(),
    ctaLink: z.string().max(200).optional(),
    textAlignment: z.enum(["left", "center", "right"]).optional().default("center"),
    overlayOpacity: z.number().min(0).max(80).optional().default(30),
  }).strict(),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative(),
});

// 2. Promo Carousel
const promoSlideSchema = z.object({
  id: z.string().min(1),
  imageUrl: safeMediaUrl,
  title: z.string().max(100).optional(),
  link: z.string().max(200).optional(),
}).strict();

const promoCarouselSchema = z.object({
  id: z.string().min(1),
  type: z.literal("promo_carousel"),
  title: z.string().max(100).optional(),
  settings: z.object({
    slides: z.array(promoSlideSchema).min(1, "Au moins 1 diapositive").max(5, "Maximum 5 diapositives"),
    autoplay: z.boolean().optional().default(true),
    intervalSec: z.number().min(2).max(15).optional().default(5),
  }).strict(),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative(),
});

// 3. Featured Categories
const categoryItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50),
  imageUrl: safeMediaUrl.optional(),
  slug: z.string().regex(SAFE_SLUG_REGEX),
}).strict();

const featuredCategoriesSchema = z.object({
  id: z.string().min(1),
  type: z.literal("featured_categories"),
  title: z.string().max(100).optional(),
  settings: z.object({
    title: z.string().max(100).optional(),
    categories: z.array(categoryItemSchema).min(1).max(12),
    layout: z.enum(["grid", "carousel"]).optional().default("grid"),
  }).strict(),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative(),
});

// 4. Curated Collections
const curatedCollectionItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(80),
  imageUrl: safeMediaUrl.optional(),
  productIds: z.array(z.string().min(1)).min(1).max(20),
}).strict();

const curatedCollectionsSchema = z.object({
  id: z.string().min(1),
  type: z.literal("curated_collections"),
  title: z.string().max(100).optional(),
  settings: z.object({
    title: z.string().max(100).optional(),
    collections: z.array(curatedCollectionItemSchema).min(1).max(6),
  }).strict(),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative(),
});

// Generic product feed schema for new_arrivals, best_sellers, product_grid
const productFeedSchema = (type: "new_arrivals" | "best_sellers" | "product_grid") =>
  z.object({
    id: z.string().min(1),
    type: z.literal(type),
    title: z.string().max(100).optional(),
    settings: z.object({
      title: z.string().max(100).optional(),
      subtitle: z.string().max(200).optional(),
      maxItems: z.number().int().min(2).max(24).optional().default(8),
      layout: z.enum(["grid", "carousel"]).optional().default("grid"),
      filterCategoryId: z.string().optional(),
    }).strict(),
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
    title: z.string().max(100).optional(),
    productIds: z.array(z.string().min(1)).min(1, "Au moins 1 produit sélectionné").max(20, "Maximum 20 produits"),
    layout: z.enum(["grid", "carousel"]).optional().default("grid"),
  }).strict(),
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
    heading: z.string().min(1).max(120),
    bodyText: z.string().min(1).max(2000),
    imageUrl: safeMediaUrl.optional(),
    videoUrl: safeMediaUrl.optional(),
    signature: z.string().max(80).optional(),
    yearsOfExperience: z.number().int().min(0).max(100).optional(),
  }).strict(),
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
    title: z.string().max(100).optional(),
    videoUrl: safeMediaUrl,
    posterUrl: safeMediaUrl.optional(),
    autoplay: z.boolean().optional().default(false),
    loop: z.boolean().optional().default(false),
    muted: z.boolean().optional().default(true),
  }).strict(),
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
    title: z.string().max(100).optional(),
    maxReviews: z.number().int().min(1).max(12).optional().default(6),
    filterMinRating: z.number().min(1).max(5).optional().default(4),
  }).strict(),
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
}).strict();

const deliveryInfoSchema = z.object({
  id: z.string().min(1),
  type: z.literal("delivery_info"),
  title: z.string().max(100).optional(),
  settings: z.object({
    title: z.string().max(100).optional(),
    defaultTimeframe: z.string().max(60).optional(),
    customTariffs: z.array(deliveryInfoItemSchema).max(69).optional(),
    freeShippingAbove: z.number().positive().optional(),
  }).strict(),
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
    title: z.string().max(100).optional(),
    delayDays: z.number().int().min(1).max(90).default(14),
    conditions: z.string().min(1).max(1500),
    returnShippingFeeBy: z.enum(["buyer", "seller", "free"]).default("buyer"),
  }).strict(),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative(),
});

// 14. FAQ Accordion
const faqItemSchema = z.object({
  question: z.string().min(1).max(150),
  answer: z.string().min(1).max(800),
}).strict();

const faqAccordionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("faq_accordion"),
  title: z.string().max(100).optional(),
  settings: z.object({
    title: z.string().max(100).optional(),
    items: z.array(faqItemSchema).min(1, "Au moins une question/réponse").max(10, "Maximum 10 questions"),
  }).strict(),
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
    shopPhone: z.string().max(30).optional(),
    shopEmail: z.string().email("Email invalide").max(100).optional().or(z.literal("")),
    address: z.string().max(200).optional(),
    wilaya: z.string().max(50).optional(),
    workingHours: z.string().max(100).optional(),
    socialInstagram: z.string().max(100).optional(),
    socialFacebook: z.string().max(100).optional(),
    socialTiktok: z.string().max(100).optional(),
  }).strict(),
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
  spacingYPx: z.number().min(0).max(100).optional(),
  titleFontSizePx: z.number().min(8).max(100).optional(),
  bodyFontSizePx: z.number().min(8).max(50).optional(),
});

export const storeConfigSeoSchema = z.object({
  metaTitle: z.string().min(1).max(120).optional(),
  metaDescription: z.string().max(400).optional(),
  ogImage: safeMediaUrl.optional(),
});

export const storeConfigSchema = z.object({
  shopName: z.string().min(2, "Le nom de la boutique doit comporter au moins 2 caractères").max(80).optional(),
  shopSlug: z.string().min(3).max(50).regex(SAFE_SLUG_REGEX, "Le slug doit contenir uniquement lettres minuscules, chiffres et tirets").optional(),
  shopDescription: z.string().max(500).optional(),
  wilaya: z.string().max(50).optional(),
  commune: z.string().max(50).optional(),
  logoUrl: safeMediaUrl.optional(),
  bannerUrl: safeMediaUrl.optional(),
  brandStory: z.string().max(2000).optional(),
  returnPolicy: z.string().max(1500).optional(),
  avgPreparationTime: z.string().max(40).optional(),
  legalStatus: z.string().max(60).optional(),
  theme: storeConfigThemeSchema.optional(),
  seo: storeConfigSeoSchema.optional(),
  socialLinks: z.object({
    instagram: z.string().max(100).optional(),
    facebook: z.string().max(100).optional(),
    tiktok: z.string().max(100).optional(),
    website: safeMediaUrl.optional(),
  }).optional(),
  contacts: z.object({
    phone: z.string().max(30).optional(),
    email: z.string().email().max(100).optional().or(z.literal("")),
  }).optional(),
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
