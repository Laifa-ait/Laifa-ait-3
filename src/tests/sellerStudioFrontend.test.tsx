import { describe, it, expect } from "vitest";
import React from "react";
import { StoreSectionRenderer } from "../components/Store/sections/StoreSectionRenderer";
import { CustomPageSection, CustomPageTheme } from "../domains/seller/customPage.types";
import { Product } from "../domains/product/product.types";

describe("Store Studio Frontend Components (Phase 2B)", () => {
  const mockTheme: CustomPageTheme = {
    sector: "mode",
    primaryColor: "#5B3765",
    secondaryColor: "#D4AF37",
    fontFamily: "Inter, sans-serif",
  };

  it("instantiates hero_banner section component without errors", () => {
    const heroSection: CustomPageSection<"hero_banner"> = {
      id: "sec_hero_test",
      type: "hero_banner",
      title: "Hero Banner Test",
      settings: {
        title: "Bienvenue sur Olmart Studio",
        subtitle: "L'excellence artisanale",
        imageUrl: "https://images.unsplash.com/photo-1",
        ctaText: "Découvrir",
        textAlignment: "center",
      },
      styles: { containerWidth: "contained" },
      isVisible: true,
      order: 0,
    };

    const element = (
      <StoreSectionRenderer
        section={heroSection}
        theme={mockTheme}
        products={[]}
      />
    );

    expect(element).toBeDefined();
    expect(element.props.section.id).toBe("sec_hero_test");
    expect(element.props.section.settings.title).toBe("Bienvenue sur Olmart Studio");
  });

  it("instantiates product feed section component with mock products", () => {
    const feedSection: CustomPageSection<"featured_products"> = {
      id: "sec_featured_test",
      type: "featured_products",
      title: "Nos Sélections",
      settings: {
        title: "Produits Vedettes",
        productIds: ["p1"],
        layout: "grid",
      },
      styles: {},
      isVisible: true,
      order: 1,
    };

    const mockProducts = [
      {
        id: "p1",
        name: "Karakou Traditionnel",
        price: 25000,
        sellerId: "seller_1",
        image: "https://images.unsplash.com/photo-1",
      } as unknown as Product,
    ];

    const element = (
      <StoreSectionRenderer
        section={feedSection}
        theme={mockTheme}
        products={mockProducts}
      />
    );

    expect(element).toBeDefined();
    expect(element.props.products.length).toBe(1);
  });

  it("returns null when invisible section is rendered in non-editable public mode", () => {
    const hiddenSection: CustomPageSection<"brand_story"> = {
      id: "sec_hidden",
      type: "brand_story",
      settings: {
        heading: "Section Masquée",
        bodyText: "Texte masqué",
      },
      styles: {},
      isVisible: false,
      order: 2,
    };

    const rendered = StoreSectionRenderer({
      section: hiddenSection,
      theme: mockTheme,
      products: [],
      isEditable: false,
    });

    expect(rendered).toBeNull();
  });
});
