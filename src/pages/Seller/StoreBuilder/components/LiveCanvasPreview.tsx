import React, { useState } from "react";
import {
  CustomPageSection,
  CustomPageTheme,
} from "../../../../domains/seller/customPage.types";
import { Product } from "../../../../domains/product/product.types";
import { StoreSectionRenderer } from "../../../../components/Store/sections/StoreSectionRenderer";
import { Sparkles } from "lucide-react";
import {
  PreviewControlToolbar,
  PreviewDevice,
  PreviewOrientation,
} from "./preview/PreviewControlToolbar";
import { PreviewQrModal } from "./preview/PreviewQrModal";
import { PreviewAuditModal } from "./preview/PreviewAuditModal";
import { CanvasGridOverlay } from "./preview/CanvasGridOverlay";
import { InteractiveCartSimulator } from "./preview/InteractiveCartSimulator";

interface LiveCanvasPreviewProps {
  sections: CustomPageSection[];
  theme: CustomPageTheme;
  products: Product[];
  viewport?: "mobile" | "tablet" | "desktop";
  selectedSectionId: string | null;
  shopSlug?: string;
  shopName?: string;
  onSelectSection: (id: string) => void;
}

export const LiveCanvasPreview: React.FC<LiveCanvasPreviewProps> = ({
  sections,
  theme,
  products,
  viewport: initialViewport = "desktop",
  selectedSectionId,
  shopSlug,
  shopName,
  onSelectSection,
}) => {
  const [device, setDevice] = useState<PreviewDevice>(initialViewport);
  const [orientation, setOrientation] = useState<PreviewOrientation>("portrait");
  const [zoom, setZoom] = useState<number>(1);
  const [isInteractiveMode, setIsInteractiveMode] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [simulatedCart, setSimulatedCart] = useState<Product[]>([]);

  const toggleOrientation = () => {
    setOrientation((prev) => (prev === "portrait" ? "landscape" : "portrait"));
  };

  const getContainerWidthClass = () => {
    if (device === "mobile") {
      return orientation === "portrait"
        ? "w-full max-w-[390px] min-h-[720px] rounded-[36px] border-[10px] border-[#1F2937]"
        : "w-full max-w-[720px] min-h-[390px] rounded-[36px] border-[10px] border-[#1F2937]";
    }
    if (device === "tablet") {
      return orientation === "portrait"
        ? "w-full max-w-[768px] min-h-[900px] rounded-[24px] border-[8px] border-[#374151]"
        : "w-full max-w-[960px] min-h-[640px] rounded-[24px] border-[8px] border-[#374151]";
    }
    return "w-full max-w-5xl rounded-xl border border-[#E4E7EC]";
  };

  const canvasStyle: React.CSSProperties = {
    fontFamily: theme.fontFamily || "'Plus Jakarta Sans', sans-serif",
    backgroundColor: isDarkMode ? "#0F172A" : theme.canvasColor || "#FFFFFF",
    color: isDarkMode ? "#F8FAFC" : undefined,
    borderRadius:
      device === "desktop" && theme.borderRadiusPx !== undefined
        ? `${theme.borderRadiusPx}px`
        : undefined,
  };

  const handleSimulatedAction = (prod?: Product) => {
    if (isInteractiveMode && prod) {
      setSimulatedCart((prev) => [...prev, prod]);
    }
  };

  return (
    <div
      className={`flex flex-col min-h-0 min-w-0 flex-1 overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-50 bg-[#F5F6F8]" : "relative h-full"
      }`}
    >
      {/* Visual Controls Toolbar */}
      <PreviewControlToolbar
        device={device}
        setDevice={setDevice}
        orientation={orientation}
        toggleOrientation={toggleOrientation}
        zoom={zoom}
        setZoom={setZoom}
        isInteractiveMode={isInteractiveMode}
        setIsInteractiveMode={setIsInteractiveMode}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        isFullscreen={isFullscreen}
        toggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
      />

      {/* Main Canvas Scroll Area */}
      <div
        className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain touch-pan-y bg-[#EEF2F6] p-2 sm:p-6 relative flex flex-col items-center"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <CanvasGridOverlay showGrid={showGrid} />

        {/* Scaled Device Frame Wrapper */}
        <div
          className="transition-transform duration-200 origin-top flex justify-center w-full my-auto py-2"
          style={{ transform: `scale(${zoom})` }}
        >
          <div
            className={`transition-all duration-300 relative shadow-xl bg-white overflow-hidden ${getContainerWidthClass()}`}
            data-studio-preview-viewport={device}
            style={canvasStyle}
          >
            {sections.length === 0 ? (
              <div className="p-16 text-center text-[#667085] space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] text-[#F97316] border border-[#FDBA74] flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <p className="font-bold text-[14px] text-[#17191C]">
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
                  paddingBottom: theme.spacingYPx ? `${theme.spacingYPx / 2}px` : undefined,
                }}
              >
                {sections.map((section) => {
                  const responsive = section.settings as unknown as {
                    hideOnMobile?: boolean;
                    hideOnDesktop?: boolean;
                  };
                  if (
                    (device === "mobile" && responsive.hideOnMobile) ||
                    (device === "desktop" && responsive.hideOnDesktop)
                  ) {
                    return null;
                  }
                  return (
                    <StoreSectionRenderer
                      key={section.id}
                      section={section}
                      theme={theme}
                      products={products}
                      isEditable={!isInteractiveMode}
                      isSelected={!isInteractiveMode && section.id === selectedSectionId}
                      previewViewport={device}
                      onSelectSection={
                        isInteractiveMode
                          ? () => handleSimulatedAction(products[0])
                          : onSelectSection
                      }
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Simulated Cart */}
      <InteractiveCartSimulator
        isInteractiveMode={isInteractiveMode}
        cartItems={simulatedCart}
        onClearCart={() => setSimulatedCart([])}
      />

      {/* QR Code Phone Modal */}
      <PreviewQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        shopSlug={shopSlug}
        shopName={shopName}
      />

      {/* Pre-Flight Audit Modal */}
      <PreviewAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        sections={sections}
        theme={theme}
        products={products}
        shopName={shopName}
        shopSlug={shopSlug}
      />
    </div>
  );
};
