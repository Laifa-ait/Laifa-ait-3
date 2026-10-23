import React from "react";
import { CustomPageSection, CustomPageTheme } from "../../../domains/seller/customPage.types";
import { Product } from "../../../domains/product/product.types";

interface SectionProductFeedsProps {
  section: CustomPageSection<"featured_products" | "new_arrivals" | "best_sellers" | "product_grid">;
  theme: CustomPageTheme;
  products: Product[];
  isEditable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const SectionProductFeeds: React.FC<SectionProductFeedsProps> = ({
  section,
  theme,
  products,
  isEditable,
  isSelected,
  onSelect,
}) => {
  const settings = section.settings as {
    title?: string;
    subtitle?: string;
    productIds?: string[];
    maxItems?: number;
    layout?: "grid" | "carousel";
  };
  const styles = section.styles;

  let displayProducts: Product[] = [];
  if (section.type === "featured_products" && Array.isArray(settings.productIds)) {
    const idSet = new Set(settings.productIds);
    displayProducts = products.filter((p) => idSet.has(p.id));
  } else {
    const limit = settings.maxItems || 8;
    displayProducts = products.slice(0, limit);
  }

  return (
    <div
      onClick={isEditable ? onSelect : undefined}
      className={`py-8 px-4 transition-all cursor-pointer rounded-2xl ${
        isEditable && isSelected ? "ring-4 ring-emerald-500 shadow-2xl z-10" : ""
      }`}
      style={{
        backgroundColor: styles.backgroundColor || "transparent",
        color: styles.textColor || "#1F2937",
      }}
    >
      <div className={styles.containerWidth === "contained" ? "max-w-6xl mx-auto" : "w-full"}>
        {settings.title && (
          <div className="mb-6 text-center">
            <h2 className="text-xl md:text-3xl font-extrabold" style={{ color: theme.primaryColor }}>
              {settings.title}
            </h2>
            {settings.subtitle && (
              <p className="text-sm md:text-base text-gray-500 mt-1">{settings.subtitle}</p>
            )}
          </div>
        )}

        {displayProducts.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl text-gray-400 font-medium">
            Aucun produit à afficher dans cette section.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {displayProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
              >
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-900">
                  <img
                    src={product.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                      PROMO
                    </span>
                  )}
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="font-semibold text-xs md:text-sm line-clamp-1 text-gray-900 dark:text-gray-100">
                    {product.name}
                  </h3>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="font-extrabold text-sm md:text-base text-purple-700 dark:text-purple-400">
                      {product.price.toLocaleString("fr-DZ")} DZD
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
