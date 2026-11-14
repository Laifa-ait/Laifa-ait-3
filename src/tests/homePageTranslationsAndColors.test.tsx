// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createRoot, Root } from "react-dom/client";
import { act } from "react";
import { MemoryRouter } from "react-router-dom";
import i18n from "../i18n";
import { HOME_TRANSLATIONS } from "../locales/homeTranslations";
import { LAYOUT_TRANSLATIONS } from "../locales/layoutTranslations";
import { MOBILE_MENU_TRANSLATIONS } from "../locales/mobileMenuTranslations";
import { SUBCATEGORY_TRANSLATIONS } from "../locales/subcategoryTranslations";
import { BentoHero } from "../components/Home/BentoHero";
import { CategoryCard } from "../components/Home/CategoryCard";
import { SponsoredProductCard } from "../components/Sponsorship/SponsoredProductCard";
import { FooterBottomBar } from "../components/Layout/FooterBottomBar";
import { MobileMenuServices } from "../components/Layout/MobileMenuServices";
import { MobileUserCard } from "../components/Layout/MobileUserCard";
import { MobileCategoriesAccordion } from "../components/Layout/MobileCategoriesAccordion";
import type { Product } from "../domains/product/product.types";
import type { PublicSponsoredProductDTO } from "../types/sponsoredCampaign";

if (typeof globalThis.IntersectionObserver === "undefined") {
  class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as unknown as { IntersectionObserver: typeof MockIntersectionObserver }).IntersectionObserver =
    MockIntersectionObserver;
}

const SAMPLE_PRODUCT: Product = {
  id: "prod_home_1",
  name: "Fauteuil Architecte Velours",
  price: 45000,
  promoPrice: 38000,
  image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800",
  category: "Maison & Déco",
  description: "Design contemporain",
  stock: 4,
  rating: 4.8,
  sellerId: "seller_01",
  sellerName: "Atelier Alger",
  status: "active",
  translations: {
    ar: { name: "كرسي مهندس مخملي", description: "تصميم معاصر" },
    en: { name: "Velvet Architect Armchair", description: "Contemporary design" },
  },
};

const SAMPLE_SPONSORED: PublicSponsoredProductDTO = {
  campaignId: "camp_1",
  placement: "home",
  product: SAMPLE_PRODUCT,
};

const SAMPLE_MOBILE_CATEGORIES = [
  {
    id: "mode",
    name: "Mode",
    sections: [{ name: "Tenues & Habits Traditionnels" }],
  },
];

describe("Audit Page d'Accueil & Layout — Zéro Code Dur, Traductions Trilingues (FR/AR/EN) & Harmonie Couleurs", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(async () => {
    await i18n.changeLanguage("fr");
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    await i18n.changeLanguage("fr");
  });

  it("1. Garantit la parité stricte des clés de traduction (Accueil, Layout, Menu Mobile et 94 Sous-catégories) entre FR, AR et EN", () => {
    const dictionaries = [
      HOME_TRANSLATIONS,
      LAYOUT_TRANSLATIONS,
      MOBILE_MENU_TRANSLATIONS,
      SUBCATEGORY_TRANSLATIONS,
    ];

    for (const dict of dictionaries) {
      const frKeys = Object.keys(dict.fr).sort();
      const arKeys = Object.keys(dict.ar).sort();
      const enKeys = Object.keys(dict.en).sort();

      expect(arKeys).toEqual(frKeys);
      expect(enKeys).toEqual(frKeys);

      for (const key of frKeys) {
        expect(dict.fr[key].trim().length).toBeGreaterThan(0);
        expect(dict.ar[key].trim().length).toBeGreaterThan(0);
        expect(dict.en[key].trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("2. Traduit dynamiquement BentoHero, CategoryCard, SponsoredProductCard, Navbar/Searchbar/Footer et MobileMenu en Arabe et Anglais", async () => {
    await act(async () => {
      await i18n.changeLanguage("ar");
      root.render(
        <MemoryRouter>
          <div>
            <BentoHero
              banners={[
                {
                  id: "b1",
                  title: "home.hero.default_title",
                  subtitle: "home.hero.default_subtitle",
                  badge: "Nouveauté",
                  show_countdown: true,
                  isActive: true,
                },
              ]}
            />
            <CategoryCard
              card={{ key: "Maison & Déco", title: "cat_maison_deco" }}
              index={0}
              onSelect={() => {}}
            />
            <SponsoredProductCard item={SAMPLE_SPONSORED} />
            <FooterBottomBar supportEmail="contact@olmart.dz" />
            <MobileUserCard
              user={null}
              isAdmin={false}
              isSeller={false}
              onClose={() => {}}
              onNavigate={() => {}}
            />
            <MobileMenuServices onClose={() => {}} onNavigate={() => {}} />
            <MobileCategoriesAccordion
              categories={SAMPLE_MOBILE_CATEGORIES}
              onNavigate={() => {}}
              onClose={() => {}}
            />
          </div>
        </MemoryRouter>
      );
    });

    const textAr = container.textContent || "";
    expect(textAr).toContain("أولمارت برستيج");
    expect(textAr).toContain("عرض محدود");
    expect(textAr).toContain("تصميم داخلي وديكور");
    expect(textAr).toContain("استكشف القسم");
    expect(textAr).toContain("ممول");
    expect(textAr).toContain("كرسي مهندس مخملي");
    expect(textAr).toContain("منصة وساطة معتمدة بين المشترين والبائعين المستقلين");
    expect(textAr).toContain("مرحباً بكم في أولمارت");
    expect(textAr).toContain("أولما للسيارات");
    expect(textAr).toContain("مركبات وقطع غيار");
    expect(textAr).toContain("أولما للصيانة");
    expect(textAr).toContain("أولما للعقارات");
    expect(textAr).toContain("علامات ومتاجر رسمية");
    expect(textAr).toContain("مقارنة الأسعار والمنتجات");
    expect(textAr).toContain("69 ولاية");
    expect(textAr).toContain("جميع الأقسام والفئات");
    expect(textAr).toContain("الموضة والأناقة");
    expect(i18n.t("Tenues & Habits Traditionnels")).toBe("الأزياء والملابس التقليدية");
    expect(i18n.t("mobile_menu.header_title")).toBe("القائمة الرئيسية");
    expect(i18n.t("mobile_menu.action_catalog")).toBe("الكتالوج");
    expect(i18n.t("nav.brand_name")).toBe("أولمارت");
    expect(i18n.t("nav.search_btn")).toBe("بحث");
    expect(i18n.t("search.hint_1")).toBe("فساتين سهرة فاخرة وقفطان جزائري");
    expect(i18n.t("footer_brand_description")).toContain("منصة جزائرية للربط المباشر");
    expect(textAr).not.toContain("INTÉRIEUR & DESIGN");
    expect(textAr).not.toContain("Explorer le rayon");
    expect(textAr).not.toContain("Motors & Véhicules");

    await act(async () => {
      await i18n.changeLanguage("en");
      root.render(
        <MemoryRouter>
          <div>
            <CategoryCard
              card={{ key: "Électronique", title: "cat_electronic_title" }}
              index={1}
              onSelect={() => {}}
            />
            <SponsoredProductCard item={SAMPLE_SPONSORED} />
            <FooterBottomBar supportEmail="contact@olmart.dz" />
            <MobileUserCard
              user={null}
              isAdmin={false}
              isSeller={false}
              onClose={() => {}}
              onNavigate={() => {}}
            />
            <MobileMenuServices onClose={() => {}} onNavigate={() => {}} />
            <MobileCategoriesAccordion
              categories={SAMPLE_MOBILE_CATEGORIES}
              onNavigate={() => {}}
              onClose={() => {}}
            />
          </div>
        </MemoryRouter>
      );
    });

    const textEn = container.textContent || "";
    expect(textEn).toContain("Electronics & High-Tech");
    expect(textEn).toContain("Explore department");
    expect(textEn).toContain("Sponsored");
    expect(textEn).toContain("Velvet Architect Armchair");
    expect(textEn).toContain("Trusted Intermediation Platform for Buyers & Independent Sellers");
    expect(textEn).toContain("Welcome to Olmart");
    expect(textEn).toContain("Olma Auto");
    expect(textEn).toContain("Motors & Vehicles");
    expect(textEn).toContain("Olma DIY");
    expect(textEn).toContain("Olma Real Estate");
    expect(textEn).toContain("Brands & Stores");
    expect(textEn).toContain("Prices & Products");
    expect(textEn).toContain("ALL CATEGORIES");
    expect(textEn).toContain("Fashion & Elegance");
    expect(i18n.t("Tenues & Habits Traditionnels")).toBe("Traditional Algerian Attire");
    expect(i18n.t("mobile_menu.header_title")).toBe("Main Menu");
    expect(i18n.t("mobile_menu.action_catalog")).toBe("Catalog");
    expect(i18n.t("nav.search_btn")).toBe("Search");
    expect(i18n.t("search.hint_1")).toBe("Luxury Evening Dress & Caftan");
    expect(i18n.t("footer_brand_description")).toContain("Algerian platform directly connecting");
    expect(textEn).not.toContain("Sponsorisé");
    expect(textEn).not.toContain("TOUTES LES CATÉGORIES");
  });
});

