import { describe, it, expect } from "vitest";
import {
  customPageSectionSchema,
  storeConfigSchema,
  saveDraftLayoutSchema,
  publishLayoutSchema,
  rollbackLayoutSchema,
} from "../domains/seller/validators/storeLayout.schema";
import { LegacyStoreAdapter } from "../domains/seller/services/legacyStore.adapter";
import { CustomPageSection } from "../domains/seller/customPage.types";

describe("Seller Studio Backend & Zod Validation (Phase 2A)", () => {
  describe("1. Zod Validation for 15 Sections & Security Constraints", () => {
    it("accepts a valid hero_banner section", () => {
      const validHero = {
        id: "hero_1",
        type: "hero_banner",
        title: "Bannière Principale",
        settings: {
          title: "Collection Été 2026",
          subtitle: "Artisanat d'Algérie",
          imageUrl: "https://images.unsplash.com/photo-1",
          ctaText: "Découvrir",
          ctaLink: "/products",
          textAlignment: "center",
          overlayOpacity: 30,
        },
        styles: {
          containerWidth: "full",
          paddingY: "lg",
          backgroundColor: "#5B3765",
          textColor: "#FFFFFF",
        },
        isVisible: true,
        order: 0,
      };

      const result = customPageSectionSchema.safeParse(validHero);
      expect(result.success).toBe(true);
    });

    it("rejects malicious URLs (javascript: or data:text/html)", () => {
      const maliciousHero = {
        id: "hero_xss",
        type: "hero_banner",
        settings: {
          title: "Malicious Banner",
          imageUrl: "javascript:alert(1)",
        },
        styles: {},
        isVisible: true,
        order: 0,
      };

      const result = customPageSectionSchema.safeParse(maliciousHero);
      expect(result.success).toBe(false);
    });

    it("rejects invalid hex colors in section styles", () => {
      const invalidColorHero = {
        id: "hero_bad_color",
        type: "hero_banner",
        settings: {
          title: "Bad Color Banner",
          imageUrl: "https://images.unsplash.com/photo-1",
        },
        styles: {
          backgroundColor: "rgb(255,0,0)",
        },
        isVisible: true,
        order: 0,
      };

      const result = customPageSectionSchema.safeParse(invalidColorHero);
      expect(result.success).toBe(false);
    });

    it("enforces array bounds on promo_carousel (max 5 slides)", () => {
      const tooManySlides = {
        id: "promo_1",
        type: "promo_carousel",
        settings: {
          slides: [
            { id: "s1", imageUrl: "https://images.unsplash.com/1" },
            { id: "s2", imageUrl: "https://images.unsplash.com/2" },
            { id: "s3", imageUrl: "https://images.unsplash.com/3" },
            { id: "s4", imageUrl: "https://images.unsplash.com/4" },
            { id: "s5", imageUrl: "https://images.unsplash.com/5" },
            { id: "s6", imageUrl: "https://images.unsplash.com/6" },
          ],
        },
        styles: {},
        isVisible: true,
        order: 1,
      };

      const result = customPageSectionSchema.safeParse(tooManySlides);
      expect(result.success).toBe(false);
    });

    it("validates storeConfigSchema with safe slug requirements", () => {
      const validConfig = {
        shopName: "Atelier Alger",
        shopSlug: "atelier-alger",
        wilaya: "Alger",
        theme: {
          sector: "mode",
          primaryColor: "#5B3765",
          fontFamily: "Inter, sans-serif",
        },
        seo: {
          metaTitle: "Atelier Alger - Olmart",
          metaDescription: "Boutique d'artisanat et mode à Alger.",
        },
      };

      expect(storeConfigSchema.safeParse(validConfig).success).toBe(true);

      const invalidSlugConfig = {
        ...validConfig,
        shopSlug: "Atelier Alger!!", // Contains uppercase and invalid special chars
      };

      expect(storeConfigSchema.safeParse(invalidSlugConfig).success).toBe(false);
    });

    it("validates saveDraftLayoutSchema, publishLayoutSchema, and rollbackLayoutSchema", () => {
      const validSection: CustomPageSection = {
        id: "sec_story",
        type: "brand_story",
        settings: {
          heading: "Notre Histoire",
          bodyText: "Artisans passionnés depuis 2020.",
        },
        styles: {},
        isVisible: true,
        order: 0,
      };

      expect(saveDraftLayoutSchema.safeParse({ sections: [validSection] }).success).toBe(true);
      expect(publishLayoutSchema.safeParse({ changeSummary: "Version initiale" }).success).toBe(true);
      expect(rollbackLayoutSchema.safeParse({ versionNumber: 2 }).success).toBe(true);
      expect(rollbackLayoutSchema.safeParse({ versionNumber: -1 }).success).toBe(false);
    });

    it("validates advanced Inspector styles, responsive flags, and Canva featured_categories presets", () => {
      const canvaCategorySection = {
        id: "sec_cat_canva",
        type: "featured_categories",
        title: "Navigation par Catégories",
        settings: {
          title: "Nos Rayons",
          subtitle: "Découvrez nos univers",
          layout: "bento",
          aspectRatio: "4/5",
          borderRadius: "lg",
          hoverEffect: "zoom",
          textPosition: "overlay-bottom",
          textTransform: "uppercase",
          overlayOpacity: 40,
          glassmorphism: true,
          showBadge: true,
          showItemCount: true,
          showIcon: false,
          gapSize: "normal",
          hideOnMobile: false,
          anchorId: "rayons",
          categories: [
            {
              id: "cat_1",
              name: "Artisanat",
              slug: "artisanat",
              badge: "Populaire",
              itemCount: 12,
              colSpan: 2,
            },
          ],
        },
        styles: {
          containerWidth: "narrow",
          paddingY: 48,
          paddingX: 24,
          borderRadius: "lg",
          divider: "wave",
          animation: "fade",
          shadow: "floating",
        },
        isVisible: true,
        order: 0,
      };

      expect(customPageSectionSchema.safeParse(canvaCategorySection).success).toBe(true);
    });
  });

  describe("2. LegacyStoreAdapter Synthesis", () => {
    it("synthesizes clean StoreConfig and initial sections from legacy profile", () => {
      const config = LegacyStoreAdapter.buildStoreConfig("seller_123", {
        shopName: "Maison Oran",
        wilaya: "Oran",
        description: "Boutique de vêtements traditionnels.",
      });

      expect(config.sellerId).toBe("seller_123");
      expect(config.shopName).toBe("Maison Oran");
      expect(config.shopSlug).toContain("maison-oran");
      expect(config.wilaya).toBe("Oran");

      const sections = LegacyStoreAdapter.buildDefaultSections(config, ["prod_1", "prod_2"]);
      expect(sections.length).toBeGreaterThanOrEqual(5);
      expect(sections[0].type).toBe("hero_banner");

      const initialLayout = LegacyStoreAdapter.buildInitialLayoutVersion(config, ["prod_1"]);
      expect(initialLayout.versionNumber).toBe(1);
      expect(initialLayout.status).toBe("draft");
    });
  });
});
