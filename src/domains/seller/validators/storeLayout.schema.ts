import { z } from "zod";

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const SAFE_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Safe URL validator ensuring no javascript: or data:text/html is permitted, while allowing empty, relative, or http/https URLs
const safeMediaUrl = z
  .string()
  .max(500000)
  .refine((val) => {
    const trimmed = val.trim();
    if (!trimmed) return true;
    const lower = trimmed.toLowerCase();
    if (lower.includes("javascript:") || lower.includes("data:text/html") || lower.includes("vbscript:")) {
      return false;
    }
    if (trimmed.startsWith("/") || trimmed.startsWith("data:image/")) {
      return true;
    }
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
      return false;
    }
  }, "L'URL du média doit être un lien sécurisé HTTPS ou un chemin valide");

const optionalSafeMediaUrl = z
  .union([safeMediaUrl, z.literal(""), z.null()])
  .optional()
  .transform((val) => (val === null ? undefined : val));

const hexColor = z
  .union([
    z.string().regex(HEX_COLOR_REGEX, "Format hexadécimal invalide (#RRGGBB)"),
    z.literal(""),
    z.null(),
  ])
  .optional()
  .transform((val) => (val === null || val === "" ? undefined : val));

const optStr = (max = 500) =>
  z
    .union([z.string().max(max), z.null()])
    .optional()
    .transform((val) => (val === null ? undefined : val));

export const sectionStylesSchema = z
  .object({
    backgroundColor: hexColor,
    textColor: hexColor,
    paddingY: z.union([z.enum(["sm", "md", "lg", "xl"]), z.number().min(0).max(240), z.null()]).optional().transform((v) => (v === null ? undefined : v)),
    paddingX: z.union([z.number().min(0).max(200), z.null()]).optional().transform((v) => (v === null ? undefined : v)),
    containerWidth: z.union([z.enum(["contained", "full", "narrow"]), z.null()]).optional().transform((v) => (v === null ? undefined : v)),
    borderRadius: z.union([z.enum(["none", "sm", "md", "lg"]), z.null()]).optional().transform((v) => (v === null ? undefined : v)),
    divider: z.union([z.enum(["none", "wave", "slant", "curve"]), z.null()]).optional().transform((v) => (v === null ? undefined : v)),
    animation: z.union([z.enum(["none", "fade", "slide-up", "zoom"]), z.null()]).optional().transform((v) => (v === null ? undefined : v)),
    shadow: z.union([z.enum(["none", "sm", "floating", "brutal"]), z.null()]).optional().transform((v) => (v === null ? undefined : v)),
  })
  .passthrough()
  .optional();

const commonSectionSettings = {
  hideOnMobile: z.boolean().nullable().optional().transform((v) => Boolean(v)),
  hideOnDesktop: z.boolean().nullable().optional().transform((v) => Boolean(v)),
  anchorId: optStr(120),
  textAlignment: z.union([z.enum(["left", "center", "right"]), z.null()]).optional().transform((v) => v ?? undefined),
};

const productCardDesignSchemaFields = {
  cardStyle: z.enum(["modern", "minimal", "bordered", "elevated"]).nullable().optional().transform((v) => v ?? undefined),
  cardAspectRatio: z.enum(["1/1", "4/5", "4/3"]).nullable().optional().transform((v) => v ?? undefined),
  cardImagePosition: z.enum(["top", "center", "bottom"]).nullable().optional().transform((v) => v ?? undefined),
  cardImageFit: z.enum(["cover", "contain"]).nullable().optional().transform((v) => v ?? undefined),
  columnsDesktop: z.union([z.literal(2), z.literal(3), z.literal(4), z.number().int().min(1).max(6)]).nullable().optional().transform((v) => v ?? undefined),
  cardAccentColor: hexColor,
  showStockBadge: z.boolean().nullable().optional().transform((v) => (v === null ? undefined : v)),
  showCategory: z.boolean().nullable().optional().transform((v) => (v === null ? undefined : v)),
  showCtaButton: z.boolean().nullable().optional().transform((v) => (v === null ? undefined : v)),
  ctaLabel: optStr(60),
  showCountdown: z.boolean().nullable().optional().transform((v) => (v === null ? undefined : v)),
  countdownLabel: optStr(120),
  countdownSubtitle: optStr(240),
  countdownEndDate: optStr(60),
  countdownStyle: z.enum(["dark-pro", "minimal-pill", "warm-sunset", "nordic-fresh", "y2k-pink", "theme-match"]).nullable().optional().transform((v) => v ?? undefined),
  countdownBgColor: hexColor,
  countdownTextColor: hexColor,
  countdownAccentColor: hexColor,
  showColorSwatches: z.boolean().nullable().optional().transform((v) => (v === null ? undefined : v)),
  colorSwatches: z.array(z.string()).max(10).optional(),
  showSizeChips: z.boolean().nullable().optional().transform((v) => (v === null ? undefined : v)),
  sizeChips: z.array(z.string()).max(10).optional(),
  showStockProgress: z.boolean().nullable().optional().transform((v) => (v === null ? undefined : v)),
  soldCount: z.number().int().min(0).optional(),
  totalStock: z.number().int().min(1).optional(),
  showWishlistButton: z.boolean().nullable().optional().transform((v) => (v === null ? undefined : v)),
  showRatingStars: z.boolean().nullable().optional().transform((v) => (v === null ? undefined : v)),
  ratingValue: z.number().min(0).max(5).optional(),
};

// 1. Hero Banner
const heroBannerSchema = z.object({
  id: z.string().min(1),
  type: z.literal("hero_banner"),
  title: optStr(160),
  settings: z
    .object({
      ...commonSectionSettings,
      title: z.string().max(200).nullable().optional().transform((v) => v ?? "Bienvenue dans notre boutique"),
      subtitle: optStr(400),
      badgeText: optStr(80),
      imageUrl: optionalSafeMediaUrl.transform((v) => v || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80"),
      mobileImageUrl: optionalSafeMediaUrl,
      ctaText: optStr(80),
      ctaLink: optStr(300),
      textAlignment: z.enum(["left", "center", "right"]).nullable().optional().transform((v) => v || "center"),
      overlayOpacity: z.number().min(0).max(100).nullable().optional().transform((v) => v ?? 35),
      imagePositionDesktop: optStr(60),
      imagePositionTablet: optStr(60),
      imagePositionMobile: optStr(60),
      imageFit: z.enum(["cover", "contain"]).nullable().optional().transform((v) => v ?? undefined),
      bannerHeightDesktop: z.enum(["sm", "md", "lg", "xl"]).nullable().optional().transform((v) => v ?? undefined),
      bannerHeightMobile: z.enum(["sm", "md", "lg"]).nullable().optional().transform((v) => v ?? undefined),
      badgeBgColor: hexColor,
      badgeTextColor: hexColor,
      titleColor: hexColor,
      subtitleColor: hexColor,
      ctaBgColor: hexColor,
      ctaTextColor: hexColor,
      ctaStyle: z.enum(["solid", "outline", "pill", "glass"]).nullable().optional().transform((v) => v ?? undefined),
      showBadge: z.boolean().nullable().optional().transform((v) => (v === null ? undefined : v)),
      showSubtitle: z.boolean().nullable().optional().transform((v) => (v === null ? undefined : v)),
      showCta: z.boolean().nullable().optional().transform((v) => (v === null ? undefined : v)),
      socialProofBadge: optStr(160),
      secondaryCtaText: optStr(80),
      secondaryCtaLink: optStr(300),
      secondaryCtaStyle: z.enum(["solid", "outline", "pill", "glass"]).nullable().optional().transform((v) => v ?? undefined),
    })
    .passthrough(),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative().default(0),
});

// 2. Promo Carousel
const promoSlideSchema = z
  .object({
    id: z.string().min(1),
    imageUrl: optionalSafeMediaUrl.transform((v) => v || ""),
    title: optStr(160),
    link: optStr(300),
  })
  .passthrough();

const promoCarouselSchema = z.object({
  id: z.string().min(1),
  type: z.literal("promo_carousel"),
  title: optStr(160),
  settings: z
    .object({
      ...commonSectionSettings,
      slides: z.array(promoSlideSchema).max(12).default([]),
      autoplay: z.boolean().nullable().optional().transform((v) => v ?? true),
      intervalSec: z.number().min(1).max(30).nullable().optional().transform((v) => v ?? 5),
    })
    .passthrough(),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative().default(0),
});

// 3. Featured Categories
const categoryItemSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().max(120).default("Catégorie"),
    subtitle: optStr(200),
    imageUrl: optionalSafeMediaUrl,
    slug: z.string().max(120).default("categorie"),
    iconName: optStr(60),
    badge: optStr(60),
    badgeColor: optStr(40),
    itemCount: z.union([z.number(), z.string(), z.null()]).optional().transform((v) => (v === null ? undefined : v)),
    colSpan: z.union([z.literal(1), z.literal(2), z.null()]).optional().transform((v) => (v === null ? undefined : v)),
    accentColor: optStr(40),
  })
  .passthrough();

const featuredCategoriesSchema = z.object({
  id: z.string().min(1),
  type: z.literal("featured_categories"),
  title: optStr(160),
  settings: z
    .object({
      ...commonSectionSettings,
      title: optStr(160),
      subtitle: optStr(300),
      categories: z.array(categoryItemSchema).max(24).default([]),
      layout: z
        .enum([
          "grid",
          "bento",
          "bubbles",
          "overlay",
          "carousel",
          "pills",
          "mesh-3d",
          "accordion",
          "arch",
          "polaroid",
          "magazine",
          "glass-dock",
        ])
        .nullable()
        .optional()
        .transform((v) => v || "grid"),
      aspectRatio: z.enum(["1/1", "4/5", "16/9", "circle", "4/3"]).nullable().optional().transform((v) => v ?? undefined),
      borderRadius: z.enum(["none", "sm", "md", "lg", "full"]).nullable().optional().transform((v) => v ?? undefined),
      hoverEffect: z.enum(["zoom", "lift", "glow", "shine", "grayscale-reveal", "none"]).nullable().optional().transform((v) => v ?? undefined),
      textPosition: z.enum(["below", "overlay-bottom", "overlay-center", "card-inside", "none"]).nullable().optional().transform((v) => v ?? undefined),
      textTransform: z.enum(["none", "uppercase", "capitalize"]).nullable().optional().transform((v) => v ?? undefined),
      overlayOpacity: z.number().min(0).max(100).nullable().optional().transform((v) => v ?? undefined),
      glassmorphism: z.boolean().nullable().optional().transform((v) => (v === null ? undefined : v)),
      showBadge: z.boolean().nullable().optional().transform((v) => (v === null ? undefined : v)),
      showItemCount: z.boolean().nullable().optional().transform((v) => (v === null ? undefined : v)),
      showIcon: z.boolean().nullable().optional().transform((v) => (v === null ? undefined : v)),
      gapSize: z.enum(["compact", "normal", "spacious"]).nullable().optional().transform((v) => v ?? undefined),
      columnsDesktop: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.number().int().min(1).max(6)]).nullable().optional().transform((v) => v ?? undefined),
      columnsMobile: z.union([z.literal(1), z.literal(2)]).nullable().optional().transform((v) => v ?? undefined),
    })
    .passthrough(),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative().default(0),
});

// 4. Curated Collections
const curatedCollectionItemSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().max(120).default("Collection"),
    imageUrl: optionalSafeMediaUrl,
    productIds: z.array(z.string()).max(50).default([]),
  })
  .passthrough();

const curatedCollectionsSchema = z.object({
  id: z.string().min(1),
  type: z.literal("curated_collections"),
  title: optStr(160),
  settings: z
    .object({
      ...commonSectionSettings,
      title: optStr(160),
      collections: z.array(curatedCollectionItemSchema).max(16).default([]),
    })
    .passthrough(),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative().default(0),
});

// 5, 7, 8. Generic product feed schema
const productFeedSchema = (type: "new_arrivals" | "best_sellers" | "product_grid") =>
  z.object({
    id: z.string().min(1),
    type: z.literal(type),
    title: optStr(160),
    settings: z
      .object({
        ...commonSectionSettings,
        ...productCardDesignSchemaFields,
        title: optStr(160),
        subtitle: optStr(300),
        maxItems: z.number().int().min(1).max(48).nullable().optional().transform((v) => v ?? 8),
        layout: z.enum(["grid", "carousel", "vertical"]).nullable().optional().transform((v) => v || "grid"),
        filterCategoryId: optStr(120),
      })
      .passthrough(),
    styles: sectionStylesSchema,
    isVisible: z.boolean().default(true),
    order: z.number().int().nonnegative().default(0),
  });

// 6. Featured Products
const featuredProductsSchema = z.object({
  id: z.string().min(1),
  type: z.literal("featured_products"),
  title: optStr(160),
  settings: z
    .object({
      ...commonSectionSettings,
      ...productCardDesignSchemaFields,
      title: optStr(160),
      subtitle: optStr(300),
      productIds: z.array(z.string()).max(48).default([]),
      layout: z.enum(["grid", "carousel", "vertical"]).nullable().optional().transform((v) => v || "grid"),
    })
    .passthrough(),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative().default(0),
});

// 9. Brand Story
const brandStorySchema = z.object({
  id: z.string().min(1),
  type: z.literal("brand_story"),
  title: optStr(160),
  settings: z
    .object({
      ...commonSectionSettings,
      heading: z.string().max(200).nullable().optional().transform((v) => v ?? "Notre Histoire"),
      bodyText: z.string().max(4000).nullable().optional().transform((v) => v ?? ""),
      imageUrl: optionalSafeMediaUrl,
      videoUrl: optionalSafeMediaUrl,
      signature: optStr(120),
      yearsOfExperience: z.number().int().min(0).max(200).nullable().optional().transform((v) => v ?? undefined),
    })
    .passthrough(),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative().default(0),
});

// 10. Showcase Video
const showcaseVideoSchema = z.object({
  id: z.string().min(1),
  type: z.literal("showcase_video"),
  title: optStr(160),
  settings: z
    .object({
      ...commonSectionSettings,
      title: optStr(160),
      videoUrl: optionalSafeMediaUrl.transform((v) => v || ""),
      posterUrl: optionalSafeMediaUrl,
      autoplay: z.boolean().nullable().optional().transform((v) => Boolean(v)),
      loop: z.boolean().nullable().optional().transform((v) => Boolean(v)),
      muted: z.boolean().nullable().optional().transform((v) => v ?? true),
    })
    .passthrough(),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative().default(0),
});

// 11. Verified Reviews
const verifiedReviewsSchema = z.object({
  id: z.string().min(1),
  type: z.literal("verified_reviews"),
  title: optStr(160),
  settings: z
    .object({
      ...commonSectionSettings,
      title: optStr(160),
      maxReviews: z.number().int().min(1).max(24).nullable().optional().transform((v) => v ?? 6),
      filterMinRating: z.number().min(1).max(5).nullable().optional().transform((v) => v ?? 4),
    })
    .passthrough(),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative().default(0),
});

// 12. Delivery Info
const deliveryInfoItemSchema = z
  .object({
    wilayaName: z.string().max(80).default(""),
    estimatedDays: z.string().max(60).default("24h - 48h"),
    priceDZD: z.number().nonnegative().default(0),
    homeDeliveryAvailable: z.boolean().default(true),
  })
  .passthrough();

const deliveryInfoSchema = z.object({
  id: z.string().min(1),
  type: z.literal("delivery_info"),
  title: optStr(160),
  settings: z
    .object({
      ...commonSectionSettings,
      title: optStr(160),
      defaultTimeframe: optStr(100),
      customTariffs: z.array(deliveryInfoItemSchema).max(69).nullable().optional().transform((v) => v ?? undefined),
      freeShippingAbove: z.number().nonnegative().nullable().optional().transform((v) => v ?? undefined),
    })
    .passthrough(),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative().default(0),
});

// 13. Return Policy
const returnPolicySchema = z.object({
  id: z.string().min(1),
  type: z.literal("return_policy"),
  title: optStr(160),
  settings: z
    .object({
      ...commonSectionSettings,
      title: optStr(160),
      delayDays: z.number().int().min(0).max(365).nullable().optional().transform((v) => v ?? 14),
      conditions: z.string().max(3000).nullable().optional().transform((v) => v ?? ""),
      returnShippingFeeBy: z.enum(["buyer", "seller", "free"]).nullable().optional().transform((v) => v || "buyer"),
    })
    .passthrough(),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative().default(0),
});

// 14. FAQ Accordion
const faqItemSchema = z
  .object({
    question: z.string().max(300).default(""),
    answer: z.string().max(2000).default(""),
  })
  .passthrough();

const faqAccordionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("faq_accordion"),
  title: optStr(160),
  settings: z
    .object({
      ...commonSectionSettings,
      title: optStr(160),
      items: z.array(faqItemSchema).max(24).default([]),
    })
    .passthrough(),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative().default(0),
});

// 15. Contact Footer
const contactFooterSchema = z.object({
  id: z.string().min(1),
  type: z.literal("contact_footer"),
  title: optStr(160),
  settings: z
    .object({
      ...commonSectionSettings,
      shopPhone: optStr(60),
      shopEmail: optStr(150),
      address: optStr(300),
      wilaya: optStr(80),
      workingHours: optStr(150),
      socialInstagram: optStr(150),
      socialFacebook: optStr(150),
      socialTiktok: optStr(150),
    })
    .passthrough(),
  styles: sectionStylesSchema,
  isVisible: z.boolean().default(true),
  order: z.number().int().nonnegative().default(0),
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

export const storeConfigThemeSchema = z
  .object({
    sector: z.enum(["mode", "beaute", "artisanat", "tech", "maison"]).nullable().optional().transform((v) => v ?? undefined),
    primaryColor: hexColor,
    secondaryColor: hexColor,
    accentColor: hexColor,
    canvasColor: hexColor,
    surfaceColor: hexColor,
    fontFamily: optStr(120),
    accentBadgeColor: hexColor,
    borderRadiusPx: z.number().min(0).max(60).nullable().optional().transform((v) => v ?? undefined),
    spacingYPx: z.number().min(0).max(160).nullable().optional().transform((v) => v ?? undefined),
    titleFontSizePx: z.number().min(8).max(120).nullable().optional().transform((v) => v ?? undefined),
    bodyFontSizePx: z.number().min(8).max(60).nullable().optional().transform((v) => v ?? undefined),
  })
  .passthrough();

export const storeConfigSeoSchema = z
  .object({
    metaTitle: optStr(160),
    metaDescription: optStr(500),
    ogImage: optionalSafeMediaUrl,
  })
  .passthrough();

const customPageItemSchema = z
  .object({
    id: z.string().min(1).max(120),
    title: z.string().min(1).max(140),
    slug: z.string().min(1).max(140),
    subtitle: optStr(300),
    bannerUrl: optionalSafeMediaUrl,
    productIds: z.array(z.string()).max(100).optional(),
    isHome: z.boolean().optional(),
    isPublished: z.boolean().optional(),
    sectionIds: z.array(z.string()).optional(),
    updatedAt: z.string().max(100),
  })
  .passthrough();

const collectionPageConfigSchema = z
  .object({
    headerStyle: z.enum(["hero-image", "minimal", "split-banner"]).optional(),
    headerHeight: z.enum(["sm", "md", "lg"]).optional(),
    headerOverlayOpacity: z.number().min(0).max(100).optional(),
    showSearch: z.boolean().optional(),
    showSortDropdown: z.boolean().optional(),
    showCategoryPills: z.boolean().optional(),
    columnsDesktop: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    cardStyle: z.enum(["modern", "minimal", "bordered", "elevated"]).optional(),
    cardAspectRatio: z.enum(["1/1", "4/5", "4/3"]).optional(),
    showStockBadge: z.boolean().optional(),
    showCtaButton: z.boolean().optional(),
    ctaLabel: optStr(60),
  })
  .passthrough();

const mediaGalleryItemSchema = z
  .object({
    id: z.string().min(1).max(200),
    url: safeMediaUrl,
    type: z.enum(["image", "video"]),
    name: optStr(200),
    sizeBytes: z.number().nonnegative().nullable().optional().transform((v) => v ?? undefined),
    uploadedAt: z.string().max(100),
  })
  .passthrough();

export const storeConfigSchema = z
  .object({
    shopName: z.string().min(1, "Le nom de la boutique est requis").max(120).optional(),
    shopSlug: z
      .string()
      .min(2)
      .max(80)
      .regex(SAFE_SLUG_REGEX, "Le slug doit contenir uniquement lettres minuscules, chiffres et tirets")
      .optional(),
    shopDescription: optStr(1000),
    wilaya: optStr(80),
    commune: optStr(80),
    logoUrl: optionalSafeMediaUrl,
    bannerUrl: optionalSafeMediaUrl,
    brandStory: optStr(4000),
    returnPolicy: optStr(3000),
    avgPreparationTime: optStr(80),
    legalStatus: optStr(100),
    theme: storeConfigThemeSchema.optional(),
    seo: storeConfigSeoSchema.optional(),
    customPages: z.array(customPageItemSchema).max(30).optional(),
    collectionPageConfig: collectionPageConfigSchema.optional(),
    mediaGallery: z.array(mediaGalleryItemSchema).max(100).optional(),
    socialLinks: z
      .object({
        instagram: optStr(150),
        facebook: optStr(150),
        tiktok: optStr(150),
        website: optionalSafeMediaUrl,
      })
      .passthrough()
      .optional(),
    contacts: z
      .object({
        phone: optStr(50),
        email: optStr(150),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const saveDraftLayoutSchema = z.object({
  sections: z.array(customPageSectionSchema).max(40, "Maximum 40 sections autorisées"),
});

export const publishLayoutSchema = z.object({
  changeSummary: optStr(300),
});

export const rollbackLayoutSchema = z.object({
  versionNumber: z.number().int().positive("Le numéro de version doit être positif"),
});
