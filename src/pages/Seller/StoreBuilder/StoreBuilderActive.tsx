import React, { useState } from "react";
import { useSellerStudio } from "./hooks/useSellerStudio";
import { StudioTopBar } from "./components/StudioTopBar";
import { SectionTreePanel } from "./components/SectionTreePanel";
import { LiveCanvasPreview } from "./components/LiveCanvasPreview";
import { SectionInspectorPanel } from "./components/SectionInspectorPanel";
import { StoreIdentityEditor } from "./components/StoreIdentityEditor";
import { MediaGalleryModal } from "./components/MediaGalleryModal";

export const StoreBuilderActive: React.FC = () => {
  const {
    loading,
    saveStatus,
    storeConfig,
    sections,
    products,
    historyList,
    mediaGallery,
    selectedSectionId,
    setSelectedSectionId,
    addSection,
    updateSection,
    reorderSections,
    deleteSection,
    toggleVisibility,
    saveStoreConfig,
    publishStudio,
    rollbackVersion,
  } = useSellerStudio();

  const [activeTab, setActiveTab] = useState<"editor" | "theme" | "media">("editor");
  const [viewport, setViewport] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [mobileColumn, setMobileColumn] = useState<"tree" | "canvas" | "inspector">("canvas");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Chargement du Studio Vendeur...</p>
        </div>
      </div>
    );
  }

  const selectedSection = sections.find((sec) => sec.id === selectedSectionId) || null;
  const theme = storeConfig?.theme || {
    sector: "mode",
    primaryColor: "#5B3765",
    fontFamily: "Inter, sans-serif",
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-950 font-sans">
      {/* Top Bar */}
      <StudioTopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        viewport={viewport}
        setViewport={setViewport}
        saveStatus={saveStatus}
        historyList={historyList}
        onPublish={publishStudio}
        onRollback={rollbackVersion}
        shopSlug={storeConfig?.shopSlug}
      />

      {/* Main Content Area */}
      {activeTab === "theme" && (
        <StoreIdentityEditor storeConfig={storeConfig} onSaveConfig={saveStoreConfig} />
      )}

      {activeTab === "media" && (
        <MediaGalleryModal mediaGallery={mediaGallery} />
      )}

      {activeTab === "editor" && (
        <>
          {/* Mobile column selector */}
          <div className="lg:hidden flex border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-bold">
            <button
              onClick={() => setMobileColumn("tree")}
              className={`flex-1 py-2 text-center ${mobileColumn === "tree" ? "bg-purple-50 text-purple-700 dark:text-purple-300 font-extrabold" : "text-gray-500"}`}
            >
              📋 Sections ({sections.length})
            </button>
            <button
              onClick={() => setMobileColumn("canvas")}
              className={`flex-1 py-2 text-center ${mobileColumn === "canvas" ? "bg-purple-50 text-purple-700 dark:text-purple-300 font-extrabold" : "text-gray-500"}`}
            >
              👁️ Aperçu
            </button>
            <button
              onClick={() => setMobileColumn("inspector")}
              className={`flex-1 py-2 text-center ${mobileColumn === "inspector" ? "bg-purple-50 text-purple-700 dark:text-purple-300 font-extrabold" : "text-gray-500"}`}
            >
              ⚙️ Propriétés
            </button>
          </div>

          {/* 3-Column Desktop Grid */}
          <div className="flex-1 flex overflow-hidden">
            {/* Column 1: Tree */}
            <div className={`h-full ${mobileColumn === "tree" ? "block w-full" : "hidden lg:block"}`}>
              <SectionTreePanel
                sections={sections}
                selectedSectionId={selectedSectionId}
                onSelectSection={(id) => {
                  setSelectedSectionId(id);
                  setMobileColumn("inspector");
                }}
                onReorder={reorderSections}
                onToggleVisibility={toggleVisibility}
                onDeleteSection={deleteSection}
                onAddSection={addSection}
              />
            </div>

            {/* Column 2: Live Canvas */}
            <div className={`h-full flex-1 ${mobileColumn === "canvas" ? "block w-full" : "hidden lg:block"}`}>
              <LiveCanvasPreview
                sections={sections}
                theme={theme}
                products={products}
                viewport={viewport}
                selectedSectionId={selectedSectionId}
                onSelectSection={(id) => {
                  setSelectedSectionId(id);
                  setMobileColumn("inspector");
                }}
              />
            </div>

            {/* Column 3: Inspector */}
            <div className={`h-full ${mobileColumn === "inspector" ? "block w-full" : "hidden lg:block"}`}>
              <SectionInspectorPanel
                section={selectedSection}
                products={products}
                onUpdateSection={updateSection}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StoreBuilderActive;
