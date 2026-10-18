import React from "react";
import {
  CustomPageSection,
  CustomPageTheme,
} from "../../../../domains/seller/customPage.types";
import { Product } from "../../../../domains/product/product.types";
import { StoreSectionRenderer } from "../../../../components/Store/sections/StoreSectionRenderer";
import { Sparkles } from "lucide-react";

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
  const containerClass =
    viewport === "mobile"
      ? "w-full max-w-[390px] rounded-[10px] border border-[#E4E7EC] my-4 shadow-sm bg-[#FFFFFF]"
      : viewport === "tablet"
      ? "w-full max-w-[768px] rounded-[10px] border border-[#E4E7EC] my-4 shadow-sm bg-[#FFFFFF]"
      : "w-full max-w-5xl rounded-[10px] border border-[#E4E7EC] my-3 shadow-xs bg-[#FFFFFF]";

  const canvasStyle: React.CSSProperties = {
    fontFamily: theme.fontFamily || "'Plus Jakarta Sans', sans-serif",
    backgroundColor: theme.canvasColor || "#FFFFFF",
    borderRadius:
      theme.borderRadiusPx !== undefined ? `${theme.borderRadiusPx}px` : undefined,
  };

  return (
    <div
      className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain touch-pan-y bg-[#F5F6F8] p-2 sm:p-6"
      style={{
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Web Fonts for real-time live preview */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=DM+Sans:wght@400;500;700&family=Outfit:wght@400;600;700&family=Playfair+Display:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');
      `}</style>

      <div className="flex flex-col items-center justify-start min-h-full w-full">
        {/* Frame wrapper */}
        <div
          className={`transition-all duration-200 ${containerClass}`}
          style={canvasStyle}
        >
          {sections.length === 0 ? (
            <div className="p-16 text-center text-[#667085] space-y-3">
              <div className="w-12 h-12 rounded-[10px] bg-[#FFF7ED] text-[#F97316] border border-[#FDBA74] flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="font-[600] text-[14px] text-[#17191C]">
                Prévisualisation en direct
              </p>
              <p className="text-[13px] text-[#667085] max-w-sm mx-auto leading-relaxed">
                Ajoutez des sections depuis la colonne gauche pour composer votre vitrine.
              </p>
            </div>
          ) : (
            <div
              className="space-y-4 p-2 sm:p-4"
              style={{
                paddingTop: theme.spacingYPx ? `${theme.spacingYPx / 2}px` : undefined,
                paddingBottom: theme.spacingYPx
                  ? `${theme.spacingYPx / 2}px`
                  : undefined,
              }}
            >
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
    </div>
  );
};
