import React from "react";
import { SlidersHorizontal, Sparkles, X } from "lucide-react";

interface StepItem {
  label: string;
  title: string;
}

interface OlmaImmoFilterModalHeaderProps {
  isAr: boolean;
  titleText: string;
  countActiveDraft: number;
  currentStep: number;
  steps: StepItem[];
  onClose: () => void;
}

export const OlmaImmoFilterModalHeader: React.FC<OlmaImmoFilterModalHeaderProps> = ({
  isAr,
  titleText,
  countActiveDraft,
  currentStep,
  steps,
  onClose,
}) => {
  return (
    <>
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-200 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--olma-brand-primary-light)] text-[var(--olma-brand-primary)] flex items-center justify-center">
            <SlidersHorizontal className="w-[1.15rem] h-[1.15rem]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 id="filter-modal-title" className="text-base sm:text-lg font-bold text-[var(--olma-text-primary)]">
                {titleText}
              </h2>
              {countActiveDraft > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--olma-brand-accent-soft)] text-[var(--olma-brand-accent-hover)] border border-amber-300/60">
                  <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                  {isAr ? `${countActiveDraft} نشط` : `${countActiveDraft} filtre${countActiveDraft > 1 ? "s" : ""}`}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">Choisissez vos critères, puis appliquez les filtres</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-stone-100 cursor-pointer transition min-w-[40px] min-h-[40px] flex items-center justify-center"
          aria-label="Fermer la fenêtre des filtres"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Step progress */}
      <div
        className="px-4 sm:px-6 pt-3 pb-2 bg-white shrink-0"
        aria-label={
          isAr ? `الخطوة ${currentStep + 1} من ${steps.length}` : `Étape ${currentStep + 1} sur ${steps.length}`
        }
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-[var(--olma-text-muted)]">
            {isAr ? `الخطوة ${currentStep + 1} من ${steps.length}` : `Étape ${currentStep + 1} sur ${steps.length}`}
          </span>
          <span className="text-xs font-bold text-[var(--olma-brand-primary)]">{steps[currentStep].label}</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5" aria-hidden="true">
          {steps.map((step, index) => (
            <div
              key={step.label}
              className={`h-1.5 rounded-full ${index <= currentStep ? "bg-[var(--olma-brand-primary)]" : "bg-stone-200"}`}
            />
          ))}
        </div>
      </div>
    </>
  );
};
