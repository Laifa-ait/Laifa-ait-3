import React from "react";
import { CustomPageSection, CustomPageTheme } from "../../../../domains/seller/customPage.types";
import { Product } from "../../../../domains/product/product.types";
import { StoreSectionRenderer } from "../../../../components/Store/sections/StoreSectionRenderer";

interface LiveCanvasPreviewProps {
  sections: CustomPageSection[];
  theme: CustomPageTheme;
  products: Product[];
  viewport: "mobile" | "tablet" | "desktop";
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
}

export const LiveCanvasPreview: React.FC<LiveCanvasPreviewProps> = ({
  sections,
  theme,
  products,
  viewport,
  selectedSectionId,
  onSelectSection,
}) => {
  const widthClass =
    viewport === "mobile"
      ? "max-w-[375px] shadow-2xl rounded-[32px] border-[8px] border-gray-800 my-6"
      : viewport === "tablet"
      ? "max-w-[768px] shadow-xl rounded-2xl border-[6px] border-gray-700 my-6"
      : "w-full";

  return (
    <div className="flex-1 bg-gray-100 dark:bg-gray-950 overflow-y-auto p-4 md:p-8 flex justify-center items-start min-h-[calc(100vh-60px)]">
      <div
        className={`bg-white dark:bg-gray-900 transition-all duration-300 min-h-[600px] overflow-hidden ${widthClass}`}
        style={{
          fontFamily: theme.fontFamily || "Inter, sans-serif",
        }}
      >
        {sections.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <span className="text-4xl block mb-2">🎨</span>
            <p className="font-semibold text-sm">Votre aperçu apparaîtra ici</p>
            <p className="text-xs text-gray-400 mt-1">Ajoutez des sections depuis la colonne de gauche.</p>
          </div>
        ) : (
          <div className="space-y-4 p-2">
            {sections.map((section) => (
              <StoreSectionRenderer
                key={section.id}
                section={section}
                theme={theme}
                products={products}
                isEditable={true}
                isSelected={section.id === selectedSectionId}
                onSelectSection={onSelectSection}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
