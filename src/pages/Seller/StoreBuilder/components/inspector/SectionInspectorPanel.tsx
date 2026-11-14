import React, { useEffect } from "react";
import {
  Sliders, Type, SlidersHorizontal, Layout, Smartphone, Settings, ChevronRight, X,
} from "lucide-react";
import {
  CustomPageSection, CustomPageSectionStyles, CustomPageTheme,
} from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/product/product.types";
import { SectionContentTab } from "./SectionContentTab";
import { SectionStyleTab } from "./SectionStyleTab";
import { SectionLayoutTab } from "./SectionLayoutTab";
import { SectionResponsiveTab } from "./SectionResponsiveTab";
import { SectionAdvancedTab } from "./SectionAdvancedTab";
import { useStudioStore } from "../../store/useStudioStore";
import {
  SECTION_TYPE_LABELS,
  formatSubElementLabel,
  syncHeroStylesFromSettingsPatch,
  syncHeroSettingsFromStylesPatch,
} from "./inspectorSectionLabels";

interface SectionInspectorPanelProps {
  section: CustomPageSection | null;
  sections?: CustomPageSection[];
  products: Product[];
  currentTheme?: CustomPageTheme;
  onUpdateSection: (sectionId: string, updates: Partial<CustomPageSection>) => void;
  onSaveStep?: () => void;
}

export const SectionInspectorPanel: React.FC<SectionInspectorPanelProps> = ({
  section, sections = [], products, currentTheme, onUpdateSection, onSaveStep,
}) => {
  const activeTab = useStudioStore((s) => s.activeInspectorTab);
  const setActiveTab = useStudioStore((s) => s.setActiveInspectorTab);
  const selectedSubElement = useStudioStore((s) => s.selectedSubElement);
  const selectSection = useStudioStore((s) => s.selectSection);

  useEffect(() => {
    if (selectedSubElement && activeTab !== "content") {
      setActiveTab("content");
    }
  }, [selectedSubElement, activeTab, setActiveTab]);

  if (!section) {
    return (
      <div className="w-full bg-white p-6 text-center text-[13px] flex flex-col items-center justify-center h-full space-y-2.5 min-w-0 min-h-0">
        <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-500 border border-slate-200 flex items-center justify-center">
          <Sliders className="w-4 h-4" />
        </div>
        <p className="font-semibold text-[13.5px] text-slate-900">Aucune section sélectionnée</p>
        <p className="text-[12px] text-slate-500 leading-relaxed max-w-xs">
          Cliquez directement sur une section dans l&apos;aperçu ou dans la liste pour en modifier les propriétés.
        </p>
      </div>
    );
  }

  const handleSettingsChange = (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => {
    const patch = typeof fieldOrPatch === "string" ? { [fieldOrPatch]: value } : fieldOrPatch;
    const nextSettings = { ...section.settings, ...patch };
    if (section.type === "hero_banner") {
      onUpdateSection(section.id, {
        settings: nextSettings,
        styles: syncHeroStylesFromSettingsPatch(section.styles, patch),
      });
      return;
    }
    onUpdateSection(section.id, { settings: nextSettings });
  };

  const handleStylesChange = (
    fieldOrPatch: keyof CustomPageSectionStyles | Partial<CustomPageSectionStyles>,
    value?: unknown
  ) => {
    const patch: Partial<CustomPageSectionStyles> =
      typeof fieldOrPatch === "string" ? { [fieldOrPatch]: value } : fieldOrPatch;
    const nextStyles: CustomPageSectionStyles = { ...section.styles, ...patch };

    if (section.type === "hero_banner") {
      onUpdateSection(section.id, {
        styles: nextStyles,
        settings: syncHeroSettingsFromStylesPatch(
          (section.settings || {}) as Record<string, unknown>,
          patch
        ),
      });
      return;
    }

    onUpdateSection(section.id, { styles: nextStyles });
  };

  const settings = (section.settings || {}) as Record<string, unknown>;
  const styles = section.styles || {};
  const sectionTypeLabel = SECTION_TYPE_LABELS[section.type] || section.type.replace(/_/g, " ");
  const sectionDisplayName = section.title || sectionTypeLabel;

  return (
    <aside className="w-full bg-white flex flex-col h-full shrink-0 min-w-0 min-h-0" data-testid="section-inspector-panel">
      <div className="px-3.5 pt-3 pb-2.5 border-b border-slate-200 bg-white space-y-1.5">
        <div className="min-w-0">
          <input
            type="text"
            value={section.title || ""}
            onChange={(e) => onUpdateSection(section.id, { title: e.target.value })}
            placeholder={sectionTypeLabel}
            className="font-semibold text-[13.5px] text-slate-900 w-full bg-transparent hover:bg-slate-50 focus:bg-white focus:border-slate-300 border border-transparent rounded px-1.5 py-0.5 focus:outline-none truncate"
          />
          <span className="text-[11px] text-slate-500 px-1.5 block">
            {sectionTypeLabel}
          </span>
        </div>

        {selectedSubElement && (
          <div className="flex items-center justify-between gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[11px]">
            <div className="flex items-center gap-1 min-w-0">
              <button
                type="button"
                onClick={() => selectSection(section.id, null)}
                className="font-medium text-slate-500 hover:text-slate-900 truncate max-w-[115px] cursor-pointer"
              >
                {sectionDisplayName}
              </button>
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-900 truncate">
                {formatSubElementLabel(selectedSubElement)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => selectSection(section.id, null)}
              className="p-0.5 rounded hover:bg-slate-200/70 text-slate-500 cursor-pointer shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      <div className="flex border-b border-slate-200 px-2 gap-1 overflow-x-auto no-scrollbar shrink-0">
        {[
          { id: "content" as const, label: "Contenu", icon: Type },
          { id: "style" as const, label: "Style", icon: SlidersHorizontal },
          { id: "layout" as const, label: "Disposition", icon: Layout },
          { id: "responsive" as const, label: "Appareils", icon: Smartphone },
          { id: "advanced" as const, label: "Avancé", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isAct = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              data-testid={`inspector-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`h-9 px-2 text-[11.5px] border-b-2 transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 ${
                isAct
                  ? "border-slate-900 text-slate-900 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-900 font-medium"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-[13px]">
        {activeTab === "content" && (
          <SectionContentTab
            sectionId={section.id}
            sectionType={section.type}
            settings={settings}
            sections={sections}
            products={products}
            onSettingsChange={handleSettingsChange}
            onSaveStep={onSaveStep}
          />
        )}
        {activeTab === "style" && (
          <SectionStyleTab
            sectionId={section.id}
            sectionType={section.type}
            styles={styles}
            settings={settings}
            theme={currentTheme}
            onStylesChange={handleStylesChange}
            onSettingsChange={handleSettingsChange}
            onSaveStep={onSaveStep}
          />
        )}
        {activeTab === "layout" && (
          <SectionLayoutTab sectionType={section.type} styles={styles} settings={settings} onStylesChange={handleStylesChange} onSettingsChange={handleSettingsChange} />
        )}
        {activeTab === "responsive" && (
          <SectionResponsiveTab section={section} settings={settings} styles={styles} theme={currentTheme} onSettingsChange={handleSettingsChange} onStylesChange={handleStylesChange} />
        )}
        {activeTab === "advanced" && (
          <SectionAdvancedTab sectionId={section.id} settings={settings} styles={styles} onSettingsChange={handleSettingsChange} onStylesChange={handleStylesChange} />
        )}
      </div>
    </aside>
  );
};
