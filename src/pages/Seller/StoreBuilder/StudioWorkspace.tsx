import React, { useState } from "react";
import "./studio-tokens.css";
import { StudioTopBar } from "./components/studio/StudioTopBar";
import { StudioSidebar } from "./components/studio/StudioSidebar";
import { SectionTreePanel } from "./components/studio/SectionTreePanel";
import { StudioPreview } from "./components/studio/StudioPreview";
import { PropertiesInspector } from "./components/studio/PropertiesInspector";
import { MobileStudioHeader } from "./components/studio/MobileStudioHeader";
import { MobileStudioNavigation, MobileStudioColumn } from "./components/studio/MobileStudioNavigation";
import { StudioMobileMenu } from "./components/studio/StudioMobileMenu";
import { StudioNavMode } from "./components/SectionTreePanel";
import { SaveStatus } from "./hooks/useSellerStudio";
import {
  CustomPageSection,
  CustomPageSectionType,
  CustomPageTheme,
  SellerStoreConfig,
} from "../../../domains/seller/customPage.types";
import { SubscriptionRequest } from "../../../domains/seller/subscription.types";

interface StudioWorkspaceProps {
  saveStatus: SaveStatus;
  storeConfig?: SellerStoreConfig | null;
  sections: CustomPageSection[];
  products?: unknown[];
  mediaGallery?: unknown[];
  selectedSectionId: string | null;
  setSelectedSectionId: (id: string | null) => void;
  addSection: (
    type: CustomPageSectionType,
    defaultSettings: Record<string, unknown>,
    defaultTitle?: string
  ) => void;
  updateSection: (id: string, updatedData: Partial<CustomPageSection>) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  deleteSection: (id: string) => void;
  duplicateSection?: (id: string) => void;
  toggleVisibility: (id: string) => void;
  saveStoreConfig: (updatedConfig: Partial<SellerStoreConfig>) => Promise<void>;
  publishStudio: () => void;
  pendingRequest?: SubscriptionRequest | null;
  onRequestPublication?: () => void;
}

export const StudioWorkspace: React.FC<StudioWorkspaceProps> = ({
  saveStatus,
  storeConfig,
  sections,
  products = [],
  mediaGallery = [],
  selectedSectionId,
  setSelectedSectionId,
  addSection,
  updateSection,
  reorderSections,
  deleteSection,
  duplicateSection,
  toggleVisibility,
  saveStoreConfig,
  publishStudio,
  pendingRequest,
  onRequestPublication,
}) => {
  const [navMode, setNavMode] = useState<StudioNavMode | "identity">("sections");
  const [viewport, setViewport] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [mobileColumn, setMobileColumn] = useState<MobileStudioColumn>("canvas");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [liveThemeOverride, setLiveThemeOverride] = useState<CustomPageTheme | null>(null);

  const selectedSection = sections.find((sec) => sec.id === selectedSectionId) || null;
  const currentTheme: CustomPageTheme = liveThemeOverride || storeConfig?.theme || {
    sector: "mode",
    primaryColor: "#F97316",
    canvasColor: "#F7F8FA",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  };

  const isPublished = Boolean(storeConfig?.isPublished);

  const handleSaveTheme = async (updatedTheme: CustomPageTheme) => {
    setLiveThemeOverride(updatedTheme);
    await saveStoreConfig({ theme: updatedTheme });
  };

  const handleSelectNavMode = (mode: StudioNavMode | "identity") => {
    setNavMode(mode);
    if (mode === "sections") {
      setMobileColumn("tree");
    } else {
      setMobileColumn("inspector");
    }
  };

  return (
    <div className="flex flex-col h-full md:h-[calc(100vh-10px)] bg-[#F7F8FA] text-[#17191C] overflow-hidden select-none min-w-0 min-h-0">
      {/* 1. Desktop TopBar (Visible strictly on Tablet/Desktop md+) */}
      <div className="hidden md:block shrink-0">
        <StudioTopBar
          viewport={viewport}
          setViewport={setViewport}
          saveStatus={saveStatus}
          shopName={storeConfig?.shopName || "Ma Boutique"}
          shopSlug={storeConfig?.shopSlug}
          isPublished={isPublished}
          pendingRequest={pendingRequest}
          onPublish={publishStudio}
          onRequestPublication={onRequestPublication}
        />
      </div>

      {/* 2. Mobile Header & Navigation (Visible strictly on Mobile < md) */}
      <div className="block md:hidden shrink-0">
        <MobileStudioHeader
          shopName={storeConfig?.shopName || "Ma Boutique"}
          isPublished={isPublished}
          onPublish={onRequestPublication || publishStudio}
          onOpenMenu={() => setIsMobileMenuOpen(true)}
        />
        <MobileStudioNavigation
          mobileColumn={mobileColumn}
          setMobileColumn={setMobileColumn}
          sectionCount={sections.length}
        />
      </div>

      {/* Mobile Drawer Menu */}
      <StudioMobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navMode={navMode}
        onSelectNavMode={handleSelectNavMode}
        shopName={storeConfig?.shopName}
      />

      {/* 3. Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden min-w-0 min-h-0">
        {/* Zone 1: Navigation globale (260px, Desktop >= 1200px xl+) */}
        <div className="h-full shrink-0 hidden xl:block w-[260px] min-w-[260px] max-w-[260px] border-r border-[#E5E7EB]">
          <StudioSidebar navMode={navMode} onSelectNavMode={handleSelectNavMode} />
        </div>

        {/* Zone 2: Arborescence des sections (100% on Mobile, 280px on Tablet/Desktop) */}
        <div
          className={`h-full min-w-0 ${
            mobileColumn === "tree"
              ? "block w-full flex-1"
              : "hidden md:block md:w-[280px] md:shrink-0"
          }`}
        >
          <SectionTreePanel
            sections={sections}
            selectedSectionId={selectedSectionId}
            navMode={navMode}
            onSelectNavMode={handleSelectNavMode}
            onSelectSection={(id) => {
              setSelectedSectionId(id);
              setNavMode("sections");
              setMobileColumn("inspector");
            }}
            onReorder={reorderSections}
            onToggleVisibility={toggleVisibility}
            onDeleteSection={deleteSection}
            onDuplicateSection={duplicateSection}
            onAddSection={addSection}
          />
        </div>

        {/* Zone 3: Aperçu central flexible (Central Canvas) */}
        <div
          className={`h-full flex-1 min-w-0 overflow-hidden ${
            mobileColumn === "canvas" ? "block w-full" : "hidden md:block"
          }`}
        >
          <StudioPreview
            sections={sections}
            theme={currentTheme}
            products={products}
            viewport={viewport}
            selectedSectionId={selectedSectionId}
            onSelectSection={(id) => {
              setSelectedSectionId(id);
              setNavMode("sections");
              setMobileColumn("inspector");
            }}
          />
        </div>

        {/* Zone 4: Inspecteur droit de propriétés (100% on Mobile, 320px on Tablet/Desktop) */}
        <div
          className={`h-full min-w-0 ${
            mobileColumn === "inspector"
              ? "block w-full flex-1"
              : "hidden md:block md:w-[320px] md:shrink-0"
          }`}
        >
          <PropertiesInspector
            navMode={navMode}
            selectedSection={selectedSection}
            products={products}
            storeConfig={storeConfig}
            mediaGallery={mediaGallery}
            onUpdateSection={updateSection}
            onSaveTheme={handleSaveTheme}
            onThemeChangeLive={(newTheme) => setLiveThemeOverride(newTheme)}
            onSaveConfig={saveStoreConfig}
          />
        </div>
      </div>
    </div>
  );
};

export default StudioWorkspace;
