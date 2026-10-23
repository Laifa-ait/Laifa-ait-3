import React from "react";
import { RotateCcw, ChevronLeft, ChevronRight, Check } from "lucide-react";

interface OlmaImmoFilterModalFooterProps {
  currentStep: number;
  totalSteps: number;
  isAr: boolean;
  countActiveDraft: number;
  resetText: string;
  onReset: () => void;
  onPrev: () => void;
  onNext: () => void;
  onApply: () => void;
}

export const OlmaImmoFilterModalFooter: React.FC<OlmaImmoFilterModalFooterProps> = ({
  currentStep,
  totalSteps,
  isAr,
  countActiveDraft,
  resetText,
  onReset,
  onPrev,
  onNext,
  onApply,
}) => {
  return (
    <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-stone-200 bg-white flex items-center justify-between gap-2 shrink-0 pb-[calc(.75rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
      <button
        type="button"
        onClick={onReset}
        className="px-2.5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer rounded-xl hover:bg-stone-100 transition active:scale-95"
      >
        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
        <span>{resetText}</span>
      </button>

      {currentStep > 0 ? (
        <button
          type="button"
          onClick={onPrev}
          className="px-3 py-2.5 text-xs font-semibold text-slate-600 rounded-full hover:bg-stone-100 flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          {isAr ? "السابق" : "Retour"}
        </button>
      ) : (
        <span className="w-16" aria-hidden="true" />
      )}

      {currentStep < totalSteps - 1 ? (
        <button
          type="button"
          onClick={onNext}
          className="px-5 py-3 bg-[var(--olma-brand-primary)] hover:bg-[var(--olma-brand-primary-dark)] text-white rounded-full text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          {isAr ? "التالي" : "Continuer"}
          <ChevronRight className="w-4 h-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onApply}
          className="px-4 sm:px-5 py-3 bg-[var(--olma-brand-primary)] hover:bg-[var(--olma-brand-primary-dark)] text-white rounded-full text-xs font-bold shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Check className="w-4 h-4 text-[var(--olma-brand-accent)] stroke-[2.5]" />
          <span>
            {isAr
              ? `عرض العقارات ${countActiveDraft > 0 ? `(${countActiveDraft})` : ""}`
              : `Afficher les biens ${countActiveDraft > 0 ? `(${countActiveDraft})` : ""}`}
          </span>
        </button>
      )}
    </div>
  );
};
