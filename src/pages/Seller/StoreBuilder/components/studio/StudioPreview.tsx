import React from "react";
import { LiveCanvasPreview } from "../LiveCanvasPreview";
import {
  CustomPageSection,
  CustomPageTheme,
  SellerStoreConfig,
} from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/product/product.types";
import { CatalogLoadStatus } from "../../hooks/studioCatalogLoader";

interface StudioPreviewProps {
  sections: CustomPageSection[];
  theme: CustomPageTheme;
  products?: Product[];
  catalogStatus?: CatalogLoadStatus;
  storeConfig?: SellerStoreConfig | null;
  viewport: "mobile" | "tablet" | "desktop";
  onViewportChange?: (vp: "mobile" | "tablet" | "desktop") => void;
  selectedSectionId: string | null;
  shopSlug?: string;
  shopName?: string;
  isMobileSplitCompact?: boolean;
  onSelectSection: (id: string) => void;
  showLeftSidebar?: boolean;
  onToggleLeftSidebar?: () => void;
  showRightSidebar?: boolean;
  onToggleRightSidebar?: () => void;
}

export const StudioPreview: React.FC<StudioPreviewProps> = ({
  sections,
  theme,
  products = [],
  catalogStatus,
  storeConfig,
  viewport,
  onViewportChange,
  selectedSectionId,
  shopSlug,
  shopName,
  isMobileSplitCompact,
  onSelectSection,
  showLeftSidebar,
  onToggleLeftSidebar,
  showRightSidebar,
  onToggleRightSidebar,
}) => {
  return (
    <div data-testid="studio-preview-stage" className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--studio-background)]">
      <LiveCanvasPreview
        sections={sections}
        theme={theme}
        products={products}
        catalogStatus={catalogStatus}
        storeConfig={storeConfig}
        viewport={viewport}
        onViewportChange={onViewportChange}
        selectedSectionId={selectedSectionId}
        shopSlug={shopSlug}
        shopName={shopName}
        isMobileSplitCompact={isMobileSplitCompact}
        onSelectSection={onSelectSection}
        showLeftSidebar={showLeftSidebar}
        onToggleLeftSidebar={onToggleLeftSidebar}
        showRightSidebar={showRightSidebar}
        onToggleRightSidebar={onToggleRightSidebar}
      />
    </div>
  );
};
