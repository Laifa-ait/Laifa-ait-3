import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Product } from "../../../../../domains/product/product.types";
import {
  CustomPageSection,
  CustomPageSectionType,
  FeaturedProductsSettings,
  SellerStoreConfig,
  StoreThemeSector,
} from "../../../../../domains/seller/customPage.types";
import { CollectionPageCustomizer } from "./CollectionPageCustomizer";
import { CatalogCategoriesSubPanel } from "./CatalogCategoriesSubPanel";
import { CatalogProductsSubPanel } from "./CatalogProductsSubPanel";
import { Star, FolderTree, ExternalLink, Sliders } from "lucide-react";
import { CatalogLoadStatus } from "../../hooks/studioCatalogLoader";

interface CatalogInspectorPanelProps {
  products: Product[];
  catalogStatus?: CatalogLoadStatus;
  catalogError?: string | null;
  onReloadCatalog?: () => void | Promise<void>;
  sections: CustomPageSection[];
  storeConfig?: SellerStoreConfig | null;
  activeSector?: StoreThemeSector;
  onUpdateSection: (id: string, updatedData: Partial<CustomPageSection>) => void;
  onAddSection: (
    type: CustomPageSectionType,
    defaultSettings: Record<string, unknown>,
    defaultTitle?: string
  ) => void;
  onSaveConfig?: (updatedConfig: Partial<SellerStoreConfig>) => Promise<void>;
}

const FEED_TYPES: CustomPageSectionType[] = [
  "featured_products",
  "new_arrivals",
  "best_sellers",
  "product_grid",
];

export const CatalogInspectorPanel: React.FC<CatalogInspectorPanelProps> = ({
  products,
  catalogStatus,
  catalogError,
  onReloadCatalog,
  sections,
  storeConfig,
  activeSector = "mode",
  onUpdateSection,
  onAddSection,
  onSaveConfig,
}) => {
  const [subTab, setSubTab] = useState<"products" | "categories" | "page-design">("products");
  const productFeedSections = sections.filter((s) => FEED_TYPES.includes(s.type));
  const [selectedFeedId, setSelectedFeedId] = useState<string>(
    () => productFeedSections[0]?.id || ""
  );

  const activeFeedSection =
    productFeedSections.find((s) => s.id === selectedFeedId) || productFeedSections[0];
  const categoriesSection = sections.find((s) => s.type === "featured_categories");

  const featuredProductIds: string[] = Array.isArray(
    (activeFeedSection?.settings as FeaturedProductsSettings | undefined)?.productIds
  )
    ? (activeFeedSection?.settings as FeaturedProductsSettings).productIds
    : [];

  const handleToggleFeaturedProduct = (productId: string) => {
    const exists = featuredProductIds.includes(productId);
    const nextIds = exists
      ? featuredProductIds.filter((id) => id !== productId)
      : [...featuredProductIds, productId];

    if (activeFeedSection) {
      onUpdateSection(activeFeedSection.id, {
        settings: {
          ...(activeFeedSection.settings as Record<string, unknown>),
          productIds: nextIds,
        } as CustomPageSection["settings"],
      });
    } else {
      onAddSection(
        "featured_products",
        {
          title: "Nos Produits Vedettes",
          subtitle: "Sélection officielle de la boutique",
          productIds: [productId],
          layout: "grid",
        },
        "Produits Vedettes"
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-white select-none" data-testid="catalog-inspector-panel">
      <div className="px-4 pt-3.5 border-b border-slate-200 space-y-3 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-[13px] font-semibold text-slate-900">Catalogue &amp; Rayons</h3>
            <p className="text-[11px] text-slate-500">
              Épinglez vos produits et organisez vos collections
            </p>
          </div>
          <Link
            to="/seller/products"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-medium text-slate-700 transition-colors shrink-0"
          >
            <span>Stock</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex items-center gap-1 border-t border-slate-100">
          {[
            { id: "products" as const, label: `Produits (${featuredProductIds.length})`, icon: Star },
            { id: "categories" as const, label: "Rayons", icon: FolderTree },
            { id: "page-design" as const, label: "Design page", icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = subTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubTab(tab.id)}
                className={`flex-1 py-2.5 border-b-2 text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? "border-slate-900 text-slate-900 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-900 font-medium"
                }`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {subTab === "page-design" ? (
          <div className="p-4">
            <CollectionPageCustomizer
              config={storeConfig?.collectionPageConfig}
              onChange={(nextConfig) => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(
                    new CustomEvent("studio:collection-config-updated", {
                      detail: { collectionPageConfig: nextConfig },
                    })
                  );
                }
                if (onSaveConfig) void onSaveConfig({ collectionPageConfig: nextConfig });
              }}
              onPreviewCollectionPage={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(
                    new CustomEvent("studio:navigate-page", { detail: { viewMode: "collection" } })
                  );
                }
              }}
            />
          </div>
        ) : subTab === "categories" ? (
          <CatalogCategoriesSubPanel
            categoriesSection={categoriesSection}
            activeSector={activeSector || storeConfig?.theme?.sector || "mode"}
            onUpdateSection={onUpdateSection}
            onAddSection={onAddSection}
          />
        ) : (
          <CatalogProductsSubPanel
            products={products}
            catalogStatus={catalogStatus}
            catalogError={catalogError}
            onReloadCatalog={onReloadCatalog}
            productFeedSections={productFeedSections}
            activeFeedSection={activeFeedSection}
            selectedFeedId={selectedFeedId}
            onSelectFeedId={setSelectedFeedId}
            featuredProductIds={featuredProductIds}
            onToggleFeaturedProduct={handleToggleFeaturedProduct}
          />
        )}
      </div>
    </div>
  );
};
