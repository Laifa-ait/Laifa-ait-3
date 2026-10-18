import React, { useState } from "react";
import {
  Sliders,
  Type,
  SlidersHorizontal,
  Layout,
  Smartphone,
  Settings,
} from "lucide-react";
import {
  CustomPageSection,
  CustomPageSectionStyles,
} from "../../../../domains/seller/customPage.types";
import { Product } from "../../../../domains/product/product.types";
import { SectionContentTab } from "./inspector/SectionContentTab";
import { SectionStyleTab } from "./inspector/SectionStyleTab";
import { SectionLayoutTab } from "./inspector/SectionLayoutTab";
import { SectionResponsiveTab } from "./inspector/SectionResponsiveTab";
import { SectionAdvancedTab } from "./inspector/SectionAdvancedTab";

interface SectionInspectorPanelProps {
  section: CustomPageSection | null;
  products: Product[];
  onUpdateSection: (sectionId: string, updates: Partial<CustomPageSection>) => void;
}

export const SectionInspectorPanel: React.FC<SectionInspectorPanelProps> = ({
  section,
  products,
  onUpdateSection,
}) => {
  const [activeTab, setActiveTab] = useState<"content" | "style" | "layout" | "responsive" | "advanced">("content");

  if (!section) {
    return (
      <div className="w-full md:w-[320px] md:min-w-[320px] md:max-w-[320px] bg-[#FFFFFF] border-l border-[#E4E7EC] p-6 text-center text-[14px] flex flex-col items-center justify-center h-full space-y-3 min-w-0 min-h-0">
        <div className="w-12 h-12 rounded-[10px] bg-[#FFF7ED] text-[#F97316] border border-[#FDBA74] flex items-center justify-center">
          <Sliders className="w-5 h-5" />
        </div>
        <p className="font-[600] text-[14px] text-[#17191C]">Inspecteur de Propriétés</p>
        <p className="text-[13px] text-[#667085] leading-relaxed max-w-xs">
          Sélectionnez une section dans la vitrine ou dans l'arborescence à gauche pour modifier son contenu, son style et sa disposition.
        </p>
      </div>
    );
  }

  const handleSettingsChange = (field: string, value: unknown) => {
    onUpdateSection(section.id, {
      settings: { ...section.settings, [field]: value },
    });
  };

  const handleStylesChange = (
    field: keyof CustomPageSectionStyles,
    value: unknown
  ) => {
    onUpdateSection(section.id, {
      styles: { ...section.styles, [field]: value },
    });
  };

  const settings = (section.settings || {}) as Record<string, unknown>;
  const styles = section.styles || {};

  return (
    <aside className="w-full md:w-[320px] md:min-w-[320px] md:max-w-[320px] bg-[#FFFFFF] border-l border-[#E4E7EC] flex flex-col h-full shrink-0 min-w-0 min-h-0">
      {/* Header */}
      <div className="p-3.5 border-b border-[#E4E7EC] bg-[#FFFFFF]">
        <h2 className="font-[600] text-[14px] text-[#17191C] truncate">
          {section.title || section.type}
        </h2>
        <span className="text-[12px] text-[#F97316] font-medium">
          Section • {section.type.replace("_", " ")}
        </span>
      </div>

      {/* Tabs Switcher */}
      <div className="flex p-1 bg-[#F5F6F8] border-b border-[#E4E7EC] text-[12px] font-[500] gap-0.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("content")}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-colors cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
            activeTab === "content"
              ? "bg-[#FFFFFF] text-[#17191C] font-semibold shadow-xs"
              : "text-[#667085] hover:text-[#17191C]"
          }`}
          title="Contenu"
        >
          <Type className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Contenu</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("style")}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-colors cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
            activeTab === "style"
              ? "bg-[#FFFFFF] text-[#17191C] font-semibold shadow-xs"
              : "text-[#667085] hover:text-[#17191C]"
          }`}
          title="Style"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Style</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("layout")}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-colors cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
            activeTab === "layout"
              ? "bg-[#FFFFFF] text-[#17191C] font-semibold shadow-xs"
              : "text-[#667085] hover:text-[#17191C]"
          }`}
          title="Mise en page"
        >
          <Layout className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Layout</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("responsive")}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-colors cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
            activeTab === "responsive"
              ? "bg-[#FFFFFF] text-[#17191C] font-semibold shadow-xs"
              : "text-[#667085] hover:text-[#17191C]"
          }`}
          title="Responsive"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Mobile</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("advanced")}
          className={`p-1.5 rounded-lg text-center transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
            activeTab === "advanced"
              ? "bg-[#FFFFFF] text-[#17191C] font-semibold shadow-xs"
              : "text-[#667085] hover:text-[#17191C]"
          }`}
          title="Avancé"
        >
          <Settings className="w-3.5 h-3.5 text-[#667085]" />
        </button>
      </div>

      {/* Form Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-[14px]">
        {activeTab === "content" && (
          <SectionContentTab
            settings={settings}
            products={products}
            onSettingsChange={handleSettingsChange}
          />
        )}

        {activeTab === "style" && (
          <SectionStyleTab styles={styles} onStylesChange={handleStylesChange} />
        )}

        {activeTab === "layout" && (
          <SectionLayoutTab
            styles={styles}
            settings={settings}
            onStylesChange={handleStylesChange}
            onSettingsChange={handleSettingsChange}
          />
        )}

        {activeTab === "responsive" && (
          <SectionResponsiveTab
            settings={settings}
            onSettingsChange={handleSettingsChange}
          />
        )}

        {activeTab === "advanced" && (
          <SectionAdvancedTab
            sectionId={section.id}
            settings={settings}
            onSettingsChange={handleSettingsChange}
          />
        )}
      </div>
    </aside>
  );
};
