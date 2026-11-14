import React, { useEffect } from "react";
import { CustomPageSection } from "../../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../../domains/product/product.types";
import { PromoSlidesListEditor } from "./PromoSlidesListEditor";
import { FaqListStepPanel } from "./FaqListStepPanel";
import { CuratedCollectionsStepPanel } from "./CuratedCollectionsStepPanel";
import { AlgeriaEcommercePresets } from "../controls/AlgeriaEcommercePresets";
import { useStudioStore } from "../../../store/useStudioStore";
import { useSectionStepProgress } from "../../../hooks/useSectionStepProgress";
import { StepWizardBar, StepWizardFooter, StepDefinition } from "../controls/StepWizardControls";

interface ListContentEditorProps {
  sectionId?: string;
  sectionType?: string;
  settings: Record<string, unknown>;
  sections?: CustomPageSection[];
  products: Product[];
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  onSaveStep?: () => unknown | Promise<unknown>;
  inputClass: string;
}

export const ListContentEditor: React.FC<ListContentEditorProps> = ({
  sectionId,
  sectionType,
  settings,
  sections = [],
  products,
  onSettingsChange,
  onSaveStep,
  inputClass,
}) => {
  const selectedSubElement = useStudioStore((s) => s.selectedSubElement);
  const {
    activeStep,
    unlockedStep,
    completedSteps,
    isExpert,
    justSavedStep,
    isSavingStep,
    saveStepError,
    selectStep,
    goToPrevStep,
    saveAndAdvanceStep,
  } = useSectionStepProgress("list", 2, sectionId);

  useEffect(() => {
    if (!selectedSubElement) return;
    if (selectedSubElement === "title") selectStep(1);
    else if (
      selectedSubElement.startsWith("cat-") ||
      selectedSubElement.startsWith("collection-") ||
      selectedSubElement.startsWith("faq-")
    ) {
      selectStep(2);
    }
  }, [selectedSubElement, selectStep]);

  const updateRecordList = <T extends Record<string, unknown>>(
    field: string,
    index: number,
    patch: Partial<T>
  ) => {
    const items = Array.isArray(settings[field]) ? [...(settings[field] as T[])] : [];
    items[index] = { ...items[index], ...patch };
    onSettingsChange(field, items);
  };

  if (sectionType === "promo_carousel" || "slides" in settings) {
    return (
      <PromoSlidesListEditor
        sectionId={sectionId}
        settings={settings}
        sections={sections}
        products={products}
        onSettingsChange={onSettingsChange}
        updateRecordList={updateRecordList}
        onSaveStep={onSaveStep}
        inputClass={inputClass}
      />
    );
  }

  if (sectionType === "curated_collections" || "collections" in settings) {
    const collections = Array.isArray(settings.collections)
      ? (settings.collections as Array<Record<string, unknown>>)
      : [];
    const stepDefs: StepDefinition[] = [
      { id: 1, shortLabel: "1. En-tête", title: "Titre Section Collections" },
      { id: 2, shortLabel: "2. Cartes", title: "Cartes Collections & Produits" },
    ];
    return (
      <div className="space-y-3 select-none" data-testid="list-content-stepper">
        <StepWizardBar
          steps={stepDefs}
          activeStep={activeStep}
          unlockedStep={unlockedStep}
          completedSteps={completedSteps}
          isExpert={isExpert}
          testIdPrefix="list-step"
          onSelectStep={selectStep}
        />

        {activeStep === 1 && (
          <label className="block space-y-1 text-xs font-semibold text-slate-700">
            <span>Titre de la section Collections</span>
            <input
              value={String(settings.title || "")}
              onChange={(e) => onSettingsChange("title", e.target.value)}
              placeholder="Nos Collections Éditoriales"
              className={inputClass}
            />
          </label>
        )}

        {activeStep === 2 && (
          <CuratedCollectionsStepPanel
            collections={collections}
            products={products}
            selectedSubElement={selectedSubElement}
            inputClass={inputClass}
            onAdd={() =>
              onSettingsChange("collections", [
                ...collections,
                {
                  id: `collection_${Date.now()}`,
                  title: `Collection #${collections.length + 1}`,
                  imageUrl: products[0]?.images?.[0] || products[0]?.image || "",
                  productIds: [],
                },
              ])
            }
            onUpdate={(idx, patch) => updateRecordList("collections", idx, patch)}
            onDelete={(idx) =>
              onSettingsChange(
                "collections",
                collections.filter((_, i) => i !== idx)
              )
            }
          />
        )}

        <StepWizardFooter
          activeStep={activeStep}
          totalSteps={2}
          justSavedStep={justSavedStep}
          isSavingStep={isSavingStep}
          saveStepError={saveStepError}
          saveTestId="list-save-step-btn"
          onPrev={goToPrevStep}
          onSaveAndNext={() => void saveAndAdvanceStep(onSaveStep)}
        />
      </div>
    );
  }

  if (sectionType === "faq_accordion" || "items" in settings) {
    const items = Array.isArray(settings.items) ? (settings.items as Array<Record<string, unknown>>) : [];
    const faqStepDefs: StepDefinition[] = [
      { id: 1, shortLabel: "1. Titre", title: "Titre & Presets FAQ" },
      { id: 2, shortLabel: "2. Questions", title: "Questions / Réponses" },
    ];
    return (
      <div className="space-y-3 select-none" data-testid="list-content-stepper">
        <StepWizardBar
          steps={faqStepDefs}
          activeStep={activeStep}
          unlockedStep={unlockedStep}
          completedSteps={completedSteps}
          isExpert={isExpert}
          testIdPrefix="list-step"
          onSelectStep={selectStep}
        />

        {activeStep === 1 && (
          <div className="space-y-3">
            <AlgeriaEcommercePresets sectionType="faq_accordion" onApplyPreset={(patch) => onSettingsChange(patch)} />
            <label className="block space-y-1 text-xs font-semibold text-slate-700">
              <span>Titre de la Foire Aux Questions</span>
              <input
                value={String(settings.title || "")}
                onChange={(e) => onSettingsChange("title", e.target.value)}
                placeholder="Questions Fréquentes"
                className={inputClass}
              />
            </label>
          </div>
        )}

        {activeStep === 2 && (
          <FaqListStepPanel
            items={items}
            selectedSubElement={selectedSubElement}
            inputClass={inputClass}
            onAdd={() =>
              onSettingsChange("items", [
                ...items,
                { question: "Nouvelle question ?", answer: "Votre réponse ici." },
              ])
            }
            onUpdate={(idx, patch) => updateRecordList("items", idx, patch)}
            onDelete={(idx) => onSettingsChange("items", items.filter((_, i) => i !== idx))}
          />
        )}

        <StepWizardFooter
          activeStep={activeStep}
          totalSteps={2}
          justSavedStep={justSavedStep}
          isSavingStep={isSavingStep}
          saveStepError={saveStepError}
          saveTestId="list-save-step-btn"
          onPrev={goToPrevStep}
          onSaveAndNext={() => void saveAndAdvanceStep(onSaveStep)}
        />
      </div>
    );
  }

  return null;
};
