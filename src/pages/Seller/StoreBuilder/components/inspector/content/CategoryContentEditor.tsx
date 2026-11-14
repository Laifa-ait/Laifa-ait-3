import React, { useState, useEffect } from "react";
import { CustomPageSection } from "../../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../../domains/product/product.types";
import { CategoryCanvaStyleControls } from "../category/CategoryCanvaStyleControls";
import { CategoryItemListManager } from "../category/CategoryItemListManager";
import { CategoryPresetSelector } from "../category/CategoryPresetSelector";
import { CategoryPreset, CategoryItem } from "../../../constants/categoryPresets";
import { CategorySmartSyncBar } from "../controls/CategorySmartSyncBar";
import { useStudioStore } from "../../../store/useStudioStore";
import { useSectionStepProgress } from "../../../hooks/useSectionStepProgress";
import { StepWizardBar, StepWizardFooter, StepDefinition } from "../controls/StepWizardControls";

interface CategoryContentEditorProps {
  sectionId?: string;
  settings: Record<string, unknown>;
  sections?: CustomPageSection[];
  products: Product[];
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  onSaveStep?: () => void;
  inputClass: string;
}

const CATEGORY_STEP_DEFS: StepDefinition[] = [
  { id: 1, shortLabel: "1. Rayons", title: "Titre & Rayons", subtitle: "Nommez et organisez vos catégories." },
  { id: 2, shortLabel: "2. Modèle", title: "Modèle & Taille", subtitle: "Choisissez 1 style d'affichage et sa taille." },
  { id: 3, shortLabel: "3. Cadrage", title: "Photo & Titre Carte", subtitle: "Cadrage image et emplacement du titre." },
  { id: 4, shortLabel: "4. Finition", title: "Animation & Packs", subtitle: "Effet au survol, badges et packs prêts." },
];

export const CategoryContentEditor: React.FC<CategoryContentEditorProps> = ({
  sectionId,
  settings,
  sections = [],
  products,
  onSettingsChange,
  onSaveStep,
  inputClass,
}) => {
  const selectedSubElement = useStudioStore((s) => s.selectedSubElement);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const {
    activeStep,
    unlockedStep,
    completedSteps,
    isExpert,
    justSavedStep,
    selectStep,
    goToPrevStep,
    saveAndAdvanceStep,
  } = useSectionStepProgress("category", 4, sectionId);

  useEffect(() => {
    if (!selectedSubElement) return;
    if (selectedSubElement === "category-style") {
      selectStep(2);
    } else if (selectedSubElement === "category-presets") {
      selectStep(4);
    } else if (
      selectedSubElement.startsWith("category-items") ||
      selectedSubElement.startsWith("cat-")
    ) {
      selectStep(1);
      const rawIdx = selectedSubElement.includes(":")
        ? selectedSubElement.split(":")[1]
        : selectedSubElement.replace("cat-", "");
      const parsedIdx = parseInt(rawIdx, 10);
      if (!Number.isNaN(parsedIdx)) setFocusedIndex(parsedIdx);
    }
  }, [selectedSubElement, selectStep]);

  const categories = Array.isArray(settings.categories)
    ? (settings.categories as CategoryItem[])
    : [];

  const handleApplyPreset = (preset: CategoryPreset, keepExistingItems: boolean) => {
    const patch: Record<string, unknown> = {
      activePresetId: preset.id,
      layout: preset.settings.layout,
      aspectRatio: preset.settings.aspectRatio,
      borderRadius: preset.settings.borderRadius,
      hoverEffect: preset.settings.hoverEffect,
      textPosition: preset.settings.textPosition,
      textTransform: preset.settings.textTransform,
      overlayOpacity: preset.settings.overlayOpacity,
      glassmorphism: preset.settings.glassmorphism,
      showBadge: preset.settings.showBadge,
      showItemCount: preset.settings.showItemCount,
      showIcon: preset.settings.showIcon,
      gapSize: preset.settings.gapSize,
    };

    if (!keepExistingItems || categories.length === 0) {
      patch.title = preset.settings.title;
      patch.subtitle = preset.settings.subtitle || "";
      patch.categories = preset.settings.categories;
    }

    onSettingsChange(patch);
  };

  const handleImportFromProducts = (imported: Array<Record<string, unknown>>) => {
    onSettingsChange("categories", imported);
    selectStep(1);
    setFocusedIndex(0);
  };

  return (
    <div className="space-y-3.5 select-none" data-testid="category-content-editor">
      <StepWizardBar
        steps={CATEGORY_STEP_DEFS}
        activeStep={activeStep}
        unlockedStep={unlockedStep}
        completedSteps={completedSteps}
        isExpert={isExpert}
        testIdPrefix="category-step"
        onSelectStep={selectStep}
      />

      {activeStep === 1 && (
        <div className="space-y-3" data-testid="category-step-panel-1">
          <CategorySmartSyncBar
            categories={categories}
            products={products}
            onSyncCategories={(synced) => {
              onSettingsChange("categories", synced);
              setFocusedIndex(0);
            }}
          />

          <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <label className="block space-y-1">
              <span className="text-[11px] font-bold text-slate-700">Titre de la section</span>
              <input
                value={String(settings.title || "")}
                onChange={(e) => onSettingsChange("title", e.target.value)}
                placeholder="Ex: Parcourir nos Rayons"
                className={inputClass}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-bold text-slate-700">Sous-titre (optionnel)</span>
              <input
                value={String(settings.subtitle || "")}
                onChange={(e) => onSettingsChange("subtitle", e.target.value)}
                placeholder="Ex: Nos univers sélectionnés"
                className={inputClass}
              />
            </label>
          </div>

          <CategoryItemListManager
            categories={categories}
            sections={sections}
            products={products}
            focusedIndex={focusedIndex}
            onUpdateCategories={(newCats) => onSettingsChange("categories", newCats)}
            inputClass={inputClass}
          />
        </div>
      )}

      {(activeStep === 2 || activeStep === 3) && (
        <CategoryCanvaStyleControls
          step={activeStep as 2 | 3}
          settings={settings}
          onSettingsChange={(f, v) => onSettingsChange(f, v)}
        />
      )}

      {activeStep === 4 && (
        <div className="space-y-4" data-testid="category-step-panel-4">
          <CategoryCanvaStyleControls
            step={4}
            settings={settings}
            onSettingsChange={(f, v) => onSettingsChange(f, v)}
          />
          <div className="pt-2 border-t border-slate-200">
            <CategoryPresetSelector
              currentLayout={String(settings.layout || "")}
              activePresetId={typeof settings.activePresetId === "string" ? settings.activePresetId : undefined}
              products={products}
              hasExistingCategories={categories.length > 0}
              onApplyPreset={handleApplyPreset}
              onImportFromProducts={handleImportFromProducts}
            />
          </div>
        </div>
      )}

      <StepWizardFooter
        activeStep={activeStep}
        totalSteps={4}
        justSavedStep={justSavedStep}
        saveTestId="category-save-step-btn"
        onPrev={goToPrevStep}
        onSaveAndNext={() => void saveAndAdvanceStep(onSaveStep)}
      />
    </div>
  );
};
