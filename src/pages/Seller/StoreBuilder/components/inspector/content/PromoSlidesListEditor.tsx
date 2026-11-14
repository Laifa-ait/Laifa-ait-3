import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import {
  BannerContentPosition,
  CustomPageSection,
} from "../../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../../domains/product/product.types";
import { CarouselDesignAndPresetTab } from "../carousel/CarouselDesignAndPresetTab";
import { PromoActiveSlideForm } from "../carousel/PromoActiveSlideForm";
import { useStudioStore } from "../../../store/useStudioStore";
import { ELEGANT_HERO_FALLBACK_IMG } from "../../../../../../components/Store/sections/hero/HeroMinimalTextAndGuides";
import { useSectionStepProgress } from "../../../hooks/useSectionStepProgress";
import { StepWizardBar, StepWizardFooter, StepDefinition } from "../controls/StepWizardControls";

interface PromoSlidesListEditorProps {
  sectionId?: string;
  settings: Record<string, unknown>;
  sections?: CustomPageSection[];
  products: Product[];
  onSettingsChange: (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => void;
  updateRecordList: <T extends Record<string, unknown>>(field: string, index: number, patch: Partial<T>) => void;
  onSaveStep?: () => void;
  inputClass: string;
}

const PROMO_STEP_DEFS: StepDefinition[] = [
  { id: 1, shortLabel: "1. Slides", title: "Diapositives & Contenu", subtitle: "Ajoutez ou modifiez 1 slide à la fois." },
  { id: 2, shortLabel: "2. Design", title: "Design & Mise en Forme", subtitle: "Style visuel et cadence du carrousel." },
  { id: 3, shortLabel: "3. Modèles", title: "Packs Carrousel", subtitle: "Modèles prêts à l'emploi." },
];

export const PromoSlidesListEditor: React.FC<PromoSlidesListEditorProps> = ({
  sectionId, settings, sections = [], products, onSettingsChange, updateRecordList, onSaveStep, inputClass,
}) => {
  const selectedSectionId = useStudioStore((s) => s.selectedSectionId);
  const selectedSubElement = useStudioStore((s) => s.selectedSubElement);
  const selectSection = useStudioStore((s) => s.selectSection);

  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const {
    activeStep, unlockedStep, completedSteps, isExpert, justSavedStep,
    selectStep, goToPrevStep, saveAndAdvanceStep,
  } = useSectionStepProgress("promo", 3, sectionId);

  const slides = Array.isArray(settings.slides) ? (settings.slides as Array<Record<string, unknown>>) : [];

  useEffect(() => {
    if (selectedSubElement?.startsWith("slide-")) {
      const parsed = parseInt(selectedSubElement.replace("slide-", ""), 10);
      if (!Number.isNaN(parsed) && parsed >= 0 && parsed < slides.length) {
        setActiveSlideIdx(parsed);
        selectStep(1);
      }
    }
  }, [selectedSubElement, slides.length, selectStep]);

  const safeIdx = activeSlideIdx < slides.length ? activeSlideIdx : Math.max(0, slides.length - 1);
  const currentSlide = slides[safeIdx];

  const focusSlide = (idx: number) => {
    setActiveSlideIdx(idx);
    if (selectedSectionId) selectSection(selectedSectionId, `slide-${idx}`);
  };

  const handleAddSlide = () => {
    if (slides.length >= 12) return;
    const nextNum = slides.length + 1;
    const prod = products[(nextNum - 1) % Math.max(1, products.length)];
    const newSlide = {
      id: `slide_${Date.now()}`,
      imageUrl: prod?.images?.[0] || prod?.image || ELEGANT_HERO_FALLBACK_IMG,
      badge: `OFFRE SPÉCIALE #${nextNum}`,
      title: prod?.name || `Offre Spéciale #${nextNum}`,
      subtitle: "Profitez de notre sélection exclusive avec livraison rapide 69 Wilayas.",
      highlightPrice: prod?.price ? `${Number(prod.price).toLocaleString("fr-DZ")} DA` : "Offre Limitée",
      ctaText: "Découvrir l'offre",
      link: prod?.id ? `/product/${prod.id}` : "#catalog",
    };
    const next = [...slides, newSlide];
    onSettingsChange("slides", next);
    focusSlide(next.length - 1);
  };

  const handleMoveSlide = (dir: -1 | 1) => {
    const target = safeIdx + dir;
    if (target < 0 || target >= slides.length) return;
    const next = [...slides];
    const tmp = next[safeIdx];
    next[safeIdx] = next[target];
    next[target] = tmp;
    onSettingsChange("slides", next);
    focusSlide(target);
  };

  return (
    <div className="space-y-3.5 select-none" data-testid="promo-slides-editor">
      <StepWizardBar
        steps={PROMO_STEP_DEFS}
        activeStep={activeStep}
        unlockedStep={unlockedStep}
        completedSteps={completedSteps}
        isExpert={isExpert}
        testIdPrefix="promo-step"
        onSelectStep={selectStep}
      />

      {activeStep === 1 && (
        <div className="space-y-3">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold text-[#011C40]">
                Choisir la slide ({slides.length}/12)
              </span>
              <button
                type="button"
                disabled={slides.length >= 12}
                onClick={handleAddSlide}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#023859] hover:bg-[#011C40] text-white text-[10px] font-bold cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-3 h-3" />
                <span>Ajouter</span>
              </button>
            </div>

            {slides.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {slides.map((s, idx) => {
                  const isAct = idx === safeIdx;
                  return (
                    <button
                      key={String(s.id || idx)}
                      type="button"
                      onClick={() => focusSlide(idx)}
                      className={`flex items-center gap-1.5 p-1 pr-2.5 rounded-lg border text-left shrink-0 cursor-pointer transition-all ${
                        isAct
                          ? "bg-[#023859] border-[#023859] text-white shadow-2xs font-bold"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {s.imageUrl ? (
                        <img src={String(s.imageUrl)} alt="" className="w-6 h-6 rounded object-cover bg-slate-200 shrink-0" />
                      ) : (
                        <span className="w-6 h-6 rounded bg-slate-200 shrink-0" />
                      )}
                      <span className="text-[11px] whitespace-nowrap">Slide #{idx + 1}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {!currentSlide ? (
            <div className="p-6 text-center rounded-xl border border-dashed border-slate-300 bg-white space-y-2">
              <p className="text-xs font-bold text-slate-800">Aucune diapositive dans ce carrousel</p>
              <button
                type="button"
                onClick={handleAddSlide}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#023859] text-white text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Créer la première slide</span>
              </button>
            </div>
          ) : (
            <PromoActiveSlideForm
              slide={currentSlide}
              slideIndex={safeIdx}
              totalSlides={slides.length}
              globalContentPosition={settings.contentPosition as BannerContentPosition | undefined}
              sections={sections}
              products={products}
              inputClass={inputClass}
              onUpdateField={(patch) => updateRecordList("slides", safeIdx, patch)}
              onMove={handleMoveSlide}
              onDuplicate={() => {
                const copy = { ...currentSlide, id: `slide_${Date.now()}` };
                const next = [...slides];
                next.splice(safeIdx + 1, 0, copy);
                onSettingsChange("slides", next);
                focusSlide(safeIdx + 1);
              }}
              onDelete={() => {
                const next = slides.filter((_, idx) => idx !== safeIdx);
                onSettingsChange("slides", next);
                focusSlide(Math.max(0, safeIdx - 1));
              }}
            />
          )}
        </div>
      )}

      {activeStep !== 1 && (
        <CarouselDesignAndPresetTab
          mode={activeStep === 2 ? "design" : "presets"}
          settings={settings}
          products={products}
          onSettingsChange={onSettingsChange}
          onSwitchToSlides={() => selectStep(1)}
        />
      )}

      <StepWizardFooter
        activeStep={activeStep}
        totalSteps={3}
        justSavedStep={justSavedStep}
        saveTestId="promo-save-step-btn"
        onPrev={goToPrevStep}
        onSaveAndNext={() => void saveAndAdvanceStep(onSaveStep)}
      />
    </div>
  );
};
