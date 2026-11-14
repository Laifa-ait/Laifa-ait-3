import React, { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Product } from "../../../../../../domains/product/product.types";
import { CountdownCardEditor } from "./CountdownCardEditor";
import { ProductPickerSubTab } from "./ProductPickerSubTab";
import { VisualLayoutPicker } from "../controls/VisualLayoutPicker";
import { ProductCardStyleController } from "../controls/ProductCardStyleController";
import { useStudioStore } from "../../../store/useStudioStore";
import { useSectionStepProgress } from "../../../hooks/useSectionStepProgress";
import { StepWizardBar, StepWizardFooter, StepDefinition } from "../controls/StepWizardControls";

interface ProductSelectionEditorProps {
  sectionId?: string;
  sectionType?: string;
  settings: Record<string, unknown>;
  products: Product[];
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  onSaveStep?: () => unknown | Promise<unknown>;
  inputClass: string;
  labelClass: string;
}

const PRODUCT_STEP_DEFS: StepDefinition[] = [
  { id: 1, shortLabel: "1. Produits", title: "Titre & Sélection", subtitle: "Nommez la section et choisissez les articles." },
  { id: 2, shortLabel: "2. Grille", title: "Disposition & Colonnes", subtitle: "Grille, carrousel ou liste par écran." },
  { id: 3, shortLabel: "3. Cartes", title: "Cadrage & Design Carte", subtitle: "Ajustement photo et apparence des cartes." },
  { id: 4, shortLabel: "4. Chrono", title: "Compte à Rebours", subtitle: "Minuteur optionnel d'offre flash." },
];

export const ProductSelectionEditor: React.FC<ProductSelectionEditorProps> = ({
  sectionId,
  sectionType,
  settings,
  products,
  onSettingsChange,
  onSaveStep,
  inputClass,
  labelClass,
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
  } = useSectionStepProgress("product", 4, sectionId);

  useEffect(() => {
    if (!selectedSubElement) return;
    if (selectedSubElement === "card-model" || selectedSubElement === "product-card-design") {
      selectStep(3);
    } else if (selectedSubElement === "product-layout") {
      selectStep(2);
    } else if (selectedSubElement === "countdown-card" || selectedSubElement === "countdown") {
      selectStep(4);
    } else if (selectedSubElement === "selection" || selectedSubElement.startsWith("card-") || selectedSubElement === "title") {
      selectStep(1);
    }
  }, [selectedSubElement, selectStep]);

  const isProductSection =
    sectionType === "featured_products" ||
    sectionType === "new_arrivals" ||
    sectionType === "best_sellers" ||
    sectionType === "product_grid" ||
    "productIds" in settings ||
    "maxItems" in settings;

  if (!isProductSection) {
    return null;
  }

  const activeLayout = (settings.layout as string) || "grid";
  const cardImageFit = (settings.cardImageFit as string) || "cover";

  return (
    <div className="space-y-3.5 select-none" data-testid="product-selection-editor">
      <StepWizardBar
        steps={PRODUCT_STEP_DEFS}
        activeStep={activeStep}
        unlockedStep={unlockedStep}
        completedSteps={completedSteps}
        isExpert={isExpert}
        testIdPrefix="product-step"
        onSelectStep={selectStep}
      />

      {activeStep === 1 && (
        <div className="space-y-3" data-testid="product-step-panel-1">
          <div className="space-y-2.5 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
            <label className={labelClass}>
              <span>Titre de la section</span>
              <input
                type="text"
                value={typeof settings.title === "string" ? settings.title : ""}
                onChange={(e) => onSettingsChange("title", e.target.value)}
                placeholder="Nos Produits Vedettes"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              <span>Sous-titre (optionnel)</span>
              <input
                type="text"
                value={typeof settings.subtitle === "string" ? settings.subtitle : ""}
                onChange={(e) => onSettingsChange("subtitle", e.target.value)}
                placeholder="Découvrez notre sélection"
                className={inputClass}
              />
            </label>
          </div>

          <ProductPickerSubTab
            sectionType={sectionType}
            settings={settings}
            products={products}
            onSettingsChange={(f, v) => onSettingsChange(f, v)}
            inputClass={inputClass}
            labelClass={labelClass}
          />
        </div>
      )}

      {activeStep === 2 && (
        <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2.5" data-testid="product-step-panel-2">
          <VisualLayoutPicker
            mode="product"
            activeLayout={activeLayout}
            aspectRatio={String(settings.cardAspectRatio || "4/5")}
            columnsDesktop={Number(settings.columnsDesktop || 4)}
            onSelectLayout={(nextLayout) => onSettingsChange("layout", nextLayout)}
            onChangeAspectRatio={(r) => onSettingsChange("cardAspectRatio", r)}
            onChangeColumnsDesktop={(cols) => onSettingsChange("columnsDesktop", cols)}
          />
        </div>
      )}

      {activeStep === 3 && (
        <div className="space-y-3" data-testid="product-step-panel-3">
          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2.5">
            <span className="text-[11px] font-bold text-[#011C40] block">
              Ajustement de la photo produit
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "cover", label: "Remplir le cadre" },
                { id: "contain", label: "Photo entière" },
              ].map((fit) => (
                <button
                  key={fit.id}
                  type="button"
                  onClick={() => onSettingsChange("cardImageFit", fit.id)}
                  className={`h-8 rounded-lg border text-[11px] font-semibold cursor-pointer ${
                    cardImageFit === fit.id
                      ? "border-[#023859] bg-[#F8FBFC] text-[#011C40] font-bold"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {fit.label}
                </button>
              ))}
            </div>

            {cardImageFit === "cover" && (
              <div className="p-2 rounded-lg bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-[#023859] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Zone prioritaire de la photo
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: "top", label: "Haut" },
                    { id: "center", label: "Centre" },
                    { id: "bottom", label: "Bas" },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => onSettingsChange("cardImagePosition", pos.id)}
                      className={`h-7 rounded border text-[10px] font-bold cursor-pointer ${
                        (settings.cardImagePosition || "center") === pos.id
                          ? "border-[#023859] bg-[#023859] text-white"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <ProductCardStyleController
            settings={settings}
            onSettingsChange={onSettingsChange}
            inputClass={inputClass}
          />
        </div>
      )}

      {activeStep === 4 && (
        <div data-testid="product-step-panel-4">
          <CountdownCardEditor
            settings={settings}
            onSettingsChange={onSettingsChange}
            inputClass={inputClass}
            labelClass={labelClass}
          />
        </div>
      )}

      <StepWizardFooter
        activeStep={activeStep}
        totalSteps={4}
        justSavedStep={justSavedStep}
        isSavingStep={isSavingStep}
        saveStepError={saveStepError}
        saveTestId="product-save-step-btn"
        onPrev={goToPrevStep}
        onSaveAndNext={() => void saveAndAdvanceStep(onSaveStep)}
      />
    </div>
  );
};
