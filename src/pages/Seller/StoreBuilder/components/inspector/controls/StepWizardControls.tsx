import React from "react";
import { ArrowLeft, ArrowRight, Check, Lock } from "lucide-react";

export interface StepDefinition {
  id: number;
  shortLabel: string;
  title: string;
  subtitle?: string;
}

interface StepWizardBarProps {
  steps: StepDefinition[];
  activeStep: number;
  unlockedStep: number;
  completedSteps: number[];
  isExpert?: boolean;
  testIdPrefix: string;
  onSelectStep: (stepId: number) => void;
}

export const StepWizardBar: React.FC<StepWizardBarProps> = ({
  steps,
  activeStep,
  unlockedStep,
  completedSteps,
  isExpert = false,
  testIdPrefix,
  onSelectStep,
}) => {
  const currentMeta = steps.find((s) => s.id === activeStep) || steps[0];

  return (
    <div className="space-y-2 select-none" data-testid={`${testIdPrefix}-bar`}>
      <div className="flex items-center gap-1 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {steps.map((st) => {
          const isActive = st.id === activeStep;
          const isCompleted = completedSteps.includes(st.id);
          const isLocked = !isExpert && st.id > unlockedStep && !isCompleted;

          return (
            <button
              key={st.id}
              type="button"
              disabled={isLocked}
              data-testid={`${testIdPrefix}-tab-${st.id}`}
              title={
                isLocked
                  ? "Terminez et enregistrez l'étape précédente pour débloquer celle-ci"
                  : st.title
              }
              onClick={() => {
                if (!isLocked) onSelectStep(st.id);
              }}
              className={`flex-1 min-w-0 h-7 px-2 rounded-md text-[11px] font-medium flex items-center justify-center gap-1 whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? "bg-slate-900 text-white cursor-pointer"
                  : isLocked
                  ? "bg-slate-50 text-slate-400 cursor-not-allowed opacity-65"
                  : isCompleted
                  ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
              }`}
            >
              {isCompleted && !isActive ? (
                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
              ) : isLocked ? (
                <Lock className="w-2.5 h-2.5 shrink-0" />
              ) : null}
              <span className="truncate">{st.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {currentMeta && (
        <div className="px-0.5">
          <span className="block text-[12px] font-semibold text-slate-900 truncate tabular-nums">
            Étape {activeStep}/{steps.length} · {currentMeta.title}
          </span>
          {currentMeta.subtitle && (
            <span className="block text-[11px] text-slate-500 leading-snug mt-0.5">
              {currentMeta.subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

interface StepWizardFooterProps {
  activeStep: number;
  totalSteps: number;
  justSavedStep?: number | null;
  saveTestId?: string;
  onPrev: () => void;
  onSaveAndNext: () => void;
}

export const StepWizardFooter: React.FC<StepWizardFooterProps> = ({
  activeStep,
  totalSteps,
  justSavedStep,
  saveTestId = "step-save-and-continue-btn",
  onPrev,
  onSaveAndNext,
}) => {
  const isFinalStep = activeStep >= totalSteps;

  return (
    <div className="pt-3 mt-3 border-t border-slate-200 space-y-2 select-none">
      {justSavedStep !== null && justSavedStep !== undefined && (
        <div
          data-testid="step-saved-confirmation"
          className="text-[11.5px] font-medium text-emerald-700 flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5 shrink-0" />
          <span>
            {justSavedStep >= totalSteps
              ? `Étape ${justSavedStep} enregistrée.`
              : `Étape ${justSavedStep} enregistrée — étape suivante ouverte.`}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        {activeStep > 1 && (
          <button
            type="button"
            data-testid="step-prev-btn"
            onClick={onPrev}
            className="h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[12px] font-medium flex items-center gap-1 shrink-0 cursor-pointer transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Précédent</span>
          </button>
        )}

        <button
          type="button"
          data-testid={saveTestId}
          onClick={onSaveAndNext}
          className="flex-1 h-9 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
        >
          {isFinalStep ? (
            <>
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Enregistrer l&apos;étape finale</span>
            </>
          ) : (
            <>
              <span className="truncate">Enregistrer &amp; Étape suivante</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
