import React, { useState } from "react";
import {
  Sliders,
  Type,
  SlidersHorizontal,
  Layout,
  Smartphone,
  Settings,
  Sparkles,
} from "lucide-react";
import {
  CustomPageSection,
  CustomPageSectionStyles,
} from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/product/product.types";
import { SectionContentTab } from "./SectionContentTab";
import { SectionStyleTab } from "./SectionStyleTab";
import { SectionLayoutTab } from "./SectionLayoutTab";
import { SectionResponsiveTab } from "./SectionResponsiveTab";
import { SectionAdvancedTab } from "./SectionAdvancedTab";

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
  const [isExpertMode, setIsExpertMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"content" | "style" | "layout" | "responsive" | "advanced">("content");

  if (!section) {
    return (
      <div className="w-full bg-[#FFFFFF] p-6 text-center text-[14px] flex flex-col items-center justify-center h-full space-y-3 min-w-0 min-h-0">
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
    <aside className="w-full bg-[#FFFFFF] flex flex-col h-full shrink-0 min-w-0 min-h-0">
      {/* Header with Mode Toggle Switch */}
      <div className="p-3.5 border-b border-[#E4E7EC] bg-[#FFFFFF] flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-[600] text-[14px] text-[#17191C] truncate">
            {section.title || section.type}
          </h2>
          <span className="text-[12px] text-[#F97316] font-medium">
            Section • {section.type.replace("_", " ")}
          </span>
        </div>

        {/* Commutateur discret Mode Simple / Mode Expert */}
        <button
          type="button"
          onClick={() => {
            const nextMode = !isExpertMode;
            setIsExpertMode(nextMode);
            if (!nextMode) setActiveTab("content");
          }}
          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
            isExpertMode
              ? "bg-[#FFF7ED] text-[#EA580C] border-[#FDBA74]"
              : "bg-[#F2F4F7] text-[#344054] border-[#D0D5DD] hover:bg-[#E4E7EC]"
          }`}
          title={isExpertMode ? "Basculer en Mode Simple" : "Débloquer le Mode Expert"}
        >
          <Sparkles className="w-3 h-3 text-[#F97316]" />
          <span>{isExpertMode ? "Expert" : "Simple"}</span>
        </button>
      </div>

      {/* Tabs Switcher (Shown fully in Expert Mode, reduced in Simple Mode) */}
      {isExpertMode ? (
        <div className="flex p-1 bg-[#F5F6F8] border-b border-[#E4E7EC] text-[12px] font-[500] gap-0.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-colors cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
              activeTab === "content"
                ? "bg-[#FFFFFF] text-[#17191C] font-semibold shadow-xs"
                : "text-[#667085] hover:text-[#17191C]"
            }`}
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
      ) : (
        <div className="px-3.5 py-2 bg-[#F9FAFB] border-b border-[#E4E7EC] flex items-center justify-between text-[12px] text-[#475467]">
          <span className="font-medium text-[#17191C]">Réglages Essentiels</span>
          <span className="text-[11px] text-[#667085]">Activez Expert pour le style & layout</span>
        </div>
      )}

      {/* Form Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-[14px]">
        {activeTab === "content" && (
          <SectionContentTab
            sectionType={section.type}
            settings={settings}
            products={products}
            onSettingsChange={handleSettingsChange}
          />
        )}

        {isExpertMode && activeTab === "style" && (
          <SectionStyleTab styles={styles} onStylesChange={handleStylesChange} />
        )}

        {isExpertMode && activeTab === "layout" && (
          <SectionLayoutTab
            styles={styles}
            settings={settings}
            onStylesChange={handleStylesChange}
            onSettingsChange={handleSettingsChange}
          />
        )}

        {isExpertMode && activeTab === "responsive" && (
          <SectionResponsiveTab
            settings={settings}
            onSettingsChange={handleSettingsChange}
          />
        )}

        {isExpertMode && activeTab === "advanced" && (
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
