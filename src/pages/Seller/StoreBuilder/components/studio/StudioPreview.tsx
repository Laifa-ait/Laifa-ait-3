import React from "react";
import { LiveCanvasPreview } from "../LiveCanvasPreview";
import {
  CustomPageSection,
  CustomPageTheme,
  SellerStoreConfig,
} from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/product/product.types";

interface StudioPreviewProps {
  sections: CustomPageSection[];
  theme: CustomPageTheme;
  products?: Product[];
  storeConfig?: SellerStoreConfig | null;
  viewport: "mobile" | "tablet" | "desktop";
  onViewportChange?: (vp: "mobile" | "tablet" | "desktop") => void;
  selectedSectionId: string | null;
  shopSlug?: string;
  shopName?: string;
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
  storeConfig,
  viewport,
  onViewportChange,
  selectedSectionId,
  shopSlug,
  shopName,
  onSelectSection,
  showLeftSidebar,
  onToggleLeftSidebar,
  showRightSidebar,
  onToggleRightSidebar,
}) => {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#F7F8FA]">
      <LiveCanvasPreview
        sections={sections}
        theme={theme}
        products={products}
        storeConfig={storeConfig}
        viewport={viewport}
        onViewportChange={onViewportChange}
        selectedSectionId={selectedSectionId}
        shopSlug={shopSlug}
        shopName={shopName}
        onSelectSection={onSelectSection}
        showLeftSidebar={showLeftSidebar}
        onToggleLeftSidebar={onToggleLeftSidebar}
        showRightSidebar={showRightSidebar}
        onToggleRightSidebar={onToggleRightSidebar}
      />
    </div>
  );
};
