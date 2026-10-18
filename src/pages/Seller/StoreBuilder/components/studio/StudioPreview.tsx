import React from "react";
import { LiveCanvasPreview } from "../LiveCanvasPreview";
import { CustomPageSection, CustomPageTheme } from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/products/product.types";

interface StudioPreviewProps {
  sections: CustomPageSection[];
  theme: CustomPageTheme;
  products?: Product[];
  viewport: "mobile" | "tablet" | "desktop";
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
}

export const StudioPreview: React.FC<StudioPreviewProps> = ({
  sections,
  theme,
  products = [],
  viewport,
  selectedSectionId,
  onSelectSection,
}) => {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#F7F8FA]">
      <LiveCanvasPreview
        sections={sections}
        theme={theme}
        products={products}
        viewport={viewport}
        selectedSectionId={selectedSectionId}
        onSelectSection={onSelectSection}
      />
    </div>
  );
};
