import React, { useEffect, useRef, useState } from "react";
import {
  Sliders, Type, Palette, Smartphone, ChevronRight, X, Layout, Settings,
} from "lucide-react";
import {
  CustomPageSection, CustomPageSectionStyles, CustomPageTheme, SellerStoreConfig,
} from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/product/product.types";
import { SectionContentTab } from "./SectionContentTab";
import { SectionStyleTab } from "./SectionStyleTab";
import { SectionLayoutTab } from "./SectionLayoutTab";
import { SectionResponsiveTab } from "./SectionResponsiveTab";
import { SectionAdvancedTab } from "./SectionAdvancedTab";
import { useStudioStore, StudioInspectorTab } from "../../store/useStudioStore";
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
  storeConfig?: SellerStoreConfig | null;
  currentTheme?: CustomPageTheme;
  onUpdateSection: (sectionId: string, updates: Partial<CustomPageSection>) => void;
  onSelectSection?: (sectionId: string) => void;
  onSaveStep?: () => unknown | Promise<unknown>;
}

type UnifiedTabGroup = "content" | "design" | "options";

function resolveUnifiedGroup(tab: StudioInspectorTab): UnifiedTabGroup {
  if (tab === "style" || tab === "layout") return "design";
  if (tab === "responsive" || tab === "advanced") return "options";
  return "content";
}

export const SectionInspectorPanel: React.FC<SectionInspectorPanelProps> = ({
  section, sections = [], products, storeConfig, currentTheme, onUpdateSection, onSelectSection, onSaveStep,
}) => {
  const activeTab = useStudioStore((s) => s.activeInspectorTab);
  const setActiveTab = useStudioStore((s) => s.setActiveInspectorTab);
  const selectedSubElement = useStudioStore((s) => s.selectedSubElement);
  const selectSection = useStudioStore((s) => s.selectSection);
  const latestSectionRef = useRef<CustomPageSection | null>(section);
  latestSectionRef.current = section;

  const activeGroup = resolveUnifiedGroup(activeTab);
  const [showAdvancedInOptions, setShowAdvancedInOptions] = useState<boolean>(activeTab === "advanced");

  useEffect(() => {
    if (activeTab === "advanced") setShowAdvancedInOptions(true);
  }, [activeTab]);

  useEffect(() => {
    if (selectedSubElement && activeTab !== "content") {
      setActiveTab("content");
    }
  }, [selectedSubElement, activeTab, setActiveTab]);

  if (!section) {
    const firstSection = sections[0];
    return (
      <div className="w-full bg-white p-6 text-center text-[13px] flex flex-col items-center justify-center h-full space-y-3 min-w-0 min-h-0" data-testid="inspector-empty-state">
        <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-500 border border-slate-200 flex items-center justify-center">
          <Sliders className="w-4 h-4" />
        </div>
        <p className="font-semibold text-[13.5px] text-slate-900">Aucune section sélectionnée</p>
        <p className="text-[12px] text-slate-500 leading-relaxed max-w-xs">
          Cliquez directement sur une section dans l&apos;aperçu ou choisissez une action rapide ci-dessous.
        </p>
        <div className="flex flex-col gap-2 w-full max-w-[230px] pt-1">
          {firstSection && (
            <button
              type="button" data-testid="inspector-select-first-section-btn"
              onClick={() => { selectSection(firstSection.id, null); onSelectSection?.(firstSection.id); }}
              className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-medium transition-colors cursor-pointer"
            >
              Modifier la 1re section
            </button>
          )}
          <button
            type="button" data-testid="inspector-empty-add-section-btn"
            onClick={() => window.dispatchEvent(new CustomEvent("studio:open-add-section-modal"))}
            className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[12px] font-medium transition-colors cursor-pointer"
          >
            + Ajouter une section
          </button>
        </div>
      </div>
    );
  }

  const handleSettingsChange = (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => {
    const cur = latestSectionRef.current || section;
    const patch = typeof fieldOrPatch === "string" ? { [fieldOrPatch]: value } : fieldOrPatch;
    const nextSettings = { ...(cur.settings || {}), ...patch };
    if (cur.type === "hero_banner") {
      const nextStyles = syncHeroStylesFromSettingsPatch(cur.styles, patch);
      latestSectionRef.current = { ...cur, settings: nextSettings, styles: nextStyles };
      onUpdateSection(cur.id, { settings: nextSettings, styles: nextStyles });
      return;
    }
    latestSectionRef.current = { ...cur, settings: nextSettings };
    onUpdateSection(cur.id, { settings: nextSettings });
  };

  const handleStylesChange = (
    fieldOrPatch: keyof CustomPageSectionStyles | Partial<CustomPageSectionStyles>,
    value?: unknown
  ) => {
    const cur = latestSectionRef.current || section;
    const patch: Partial<CustomPageSectionStyles> =
      typeof fieldOrPatch === "string" ? { [fieldOrPatch]: value } : fieldOrPatch;
    const nextStyles: CustomPageSectionStyles = { ...(cur.styles || {}), ...patch };

    if (cur.type === "hero_banner") {
      const nextSettings = syncHeroSettingsFromStylesPatch((cur.settings || {}) as Record<string, unknown>, patch);
      latestSectionRef.current = { ...cur, styles: nextStyles, settings: nextSettings };
      onUpdateSection(cur.id, { styles: nextStyles, settings: nextSettings });
      return;
    }

    latestSectionRef.current = { ...cur, styles: nextStyles };
    onUpdateSection(cur.id, { styles: nextStyles });
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
            type="text" value={section.title || ""}
            onChange={(e) => onUpdateSection(section.id, { title: e.target.value })}
            placeholder={sectionTypeLabel}
            className="font-semibold text-[13.5px] text-slate-900 w-full bg-transparent hover:bg-slate-50 focus:bg-white focus:border-slate-300 border border-transparent rounded px-1.5 py-0.5 focus:outline-none truncate"
          />
          <span className="text-[11px] text-slate-500 px-1.5 block">{sectionTypeLabel}</span>
        </div>

        {selectedSubElement && (
          <div className="flex items-center justify-between gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[11px]">
            <div className="flex items-center gap-1 min-w-0">
              <button
                type="button" onClick={() => selectSection(section.id, null)}
                className="font-medium text-slate-500 hover:text-slate-900 truncate max-w-[115px] cursor-pointer"
              >
                {sectionDisplayName}
              </button>
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-900 truncate">{formatSubElementLabel(selectedSubElement)}</span>
            </div>
            <button
              type="button" onClick={() => selectSection(section.id, null)}
              className="p-0.5 rounded hover:bg-slate-200/70 text-slate-500 cursor-pointer shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* 3 Onglets Principaux Fluides : 1. Contenu | 2. Design | 3. Appareils */}
      <div className="px-3 py-2 border-b border-[#E3E5E8] bg-[#F6F7F9] shrink-0">
        <div className="grid grid-cols-3 gap-1 p-0.5 rounded-lg bg-[#E9ECEF]" data-testid="inspector-unified-3-tabs">
          {[
            { group: "content" as const, targetTab: "content" as const, testId: "inspector-tab-content", label: "1. Contenu", icon: Type },
            { group: "design" as const, targetTab: "style" as const, testId: "inspector-tab-style", label: "2. Design", icon: Palette },
            { group: "options" as const, targetTab: "responsive" as const, testId: "inspector-tab-responsive", label: "3. Appareils", icon: Smartphone },
          ].map((tab) => {
            const Icon = tab.icon;
            const isAct = activeGroup === tab.group;
            return (
              <button
                key={tab.group} type="button" data-testid={tab.testId}
                onClick={() => setActiveTab(tab.targetTab)}
                className={`h-8 px-1.5 rounded-md text-[11.5px] transition-colors cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
                  isAct ? "bg-white text-[#111827] font-semibold shadow-2xs" : "text-slate-600 hover:text-[#111827] font-medium"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-5 text-[13px]">
        {activeGroup === "content" && (
          <SectionContentTab
            sectionId={section.id} sectionType={section.type} settings={settings} sections={sections}
            products={products} storeConfig={storeConfig} theme={currentTheme}
            onSettingsChange={handleSettingsChange} onSaveStep={onSaveStep}
          />
        )}

        {activeGroup === "design" && (
          <div className="space-y-5" data-testid="unified-design-tab-panel">
            {activeTab !== "layout" && (
              <SectionStyleTab
                sectionId={section.id} sectionType={section.type} styles={styles} settings={settings}
                theme={currentTheme} onStylesChange={handleStylesChange}
                onSettingsChange={handleSettingsChange} onSaveStep={onSaveStep}
              />
            )}
            <div className={activeTab !== "layout" ? "pt-4 border-t border-[#E3E5E8] space-y-3" : "space-y-3"}>
              <span className="text-[12px] font-semibold text-slate-800 flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-slate-500" />
                <span>Espacement &amp; disposition</span>
              </span>
              <SectionLayoutTab sectionType={section.type} styles={styles} settings={settings} onStylesChange={handleStylesChange} onSettingsChange={handleSettingsChange} />
            </div>
          </div>
        )}

        {activeGroup === "options" && (
          <div className="space-y-5" data-testid="unified-options-tab-panel">
            {activeTab !== "advanced" && (
              <SectionResponsiveTab section={section} settings={settings} styles={styles} theme={currentTheme} onSettingsChange={handleSettingsChange} onStylesChange={handleStylesChange} />
            )}
            <div className={activeTab !== "advanced" ? "pt-4 border-t border-[#E3E5E8] space-y-3" : "space-y-3"}>
              <button
                type="button" data-testid="inspector-tab-advanced"
                onClick={() => setShowAdvancedInOptions((prev) => !prev)}
                className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-[#F6F7F9] hover:bg-[#EEF0F3] border border-[#E3E5E8] text-[11.5px] font-semibold text-slate-800 cursor-pointer"
              >
                <span className="flex items-center gap-1.5"><Settings className="w-3.5 h-3.5 text-slate-500" /><span>Options avancées (Programmation, Ancre, CSS)</span></span>
                <span className="text-[10.5px] text-slate-500">{showAdvancedInOptions || activeTab === "advanced" ? "Masquer" : "Afficher"}</span>
              </button>
              {(showAdvancedInOptions || activeTab === "advanced") && (
                <SectionAdvancedTab sectionId={section.id} settings={settings} styles={styles} onSettingsChange={handleSettingsChange} onStylesChange={handleStylesChange} />
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
