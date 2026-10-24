import React from "react";
import { CustomPageSection, CustomPageTheme } from "../../../domains/seller/customPage.types";
import { Product } from "../../../domains/product/product.types";
import { SectionHeroBanner } from "./SectionHeroBanner";
import { SectionPromoCarousel } from "./SectionPromoCarousel";
import { SectionProductFeeds } from "./SectionProductFeeds";
import { SectionContentAndTrust } from "./SectionContentAndTrust";

interface StoreSectionRendererProps {
  section: CustomPageSection;
  theme: CustomPageTheme;
  products: Product[];
  isEditable?: boolean;
  isSelected?: boolean;
  onSelectSection?: (sectionId: string) => void;
  previewViewport?: "mobile" | "tablet" | "desktop";
}

export const StoreSectionRenderer: React.FC<StoreSectionRendererProps> = ({
  section,
  theme,
  products,
  isEditable,
  isSelected,
  onSelectSection,
}) => {
  if (!section.isVisible && !isEditable) {
    return null;
  }

  const handleSelect = () => {
    if (onSelectSection) {
      onSelectSection(section.id);
    }
  };

  const hiddenOpacityClass = !section.isVisible && isEditable ? "opacity-50 grayscale" : "";

  return (
    <div className={`relative transition-all ${hiddenOpacityClass}`}>
      {!section.isVisible && isEditable && (
        <span className="absolute top-2 right-2 z-20 bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
          Masquée
        </span>
      )}

      {section.type === "hero_banner" && (
        <SectionHeroBanner
          section={section as CustomPageSection<"hero_banner">}
          theme={theme}
          isEditable={isEditable}
          isSelected={isSelected}
          onSelect={handleSelect}
        />
      )}

      {section.type === "promo_carousel" && (
        <SectionPromoCarousel
          section={section as CustomPageSection<"promo_carousel">}
          theme={theme}
          isEditable={isEditable}
          isSelected={isSelected}
          onSelect={handleSelect}
        />
      )}

      {(section.type === "featured_products" ||
        section.type === "new_arrivals" ||
        section.type === "best_sellers" ||
        section.type === "product_grid") && (
        <SectionProductFeeds
          section={section as CustomPageSection<"featured_products" | "new_arrivals" | "best_sellers" | "product_grid">}
          theme={theme}
          products={products}
          isEditable={isEditable}
          isSelected={isSelected}
          onSelect={handleSelect}
        />
      )}

      {section.type !== "hero_banner" &&
        section.type !== "promo_carousel" &&
        section.type !== "featured_products" &&
        section.type !== "new_arrivals" &&
        section.type !== "best_sellers" &&
        section.type !== "product_grid" && (
          <SectionContentAndTrust
            section={section}
            theme={theme}
            isEditable={isEditable}
            isSelected={isSelected}
            onSelect={handleSelect}
          />
        )}
    </div>
  );
};
