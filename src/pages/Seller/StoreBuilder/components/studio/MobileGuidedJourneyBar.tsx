import React from "react";
import { AlertCircle, ArrowRight, Check, Loader2, Lock } from "lucide-react";
import { StudioNavMode } from "./studio.types";
import { STUDIO_JOURNEY_STEPS } from "./studioSidebarSteps";
import { useStudioGuidedNavigation } from "../../hooks/useStudioGuidedNavigation";

interface MobileGuidedJourneyBarProps {
  navMode: StudioNavMode;
  onSelectNavMode: (mode: StudioNavMode) => void;
  onSaveDraft?: () => unknown | Promise<unknown>;
  lastSaveError?: string | null;
}

export const MobileGuidedJourneyBar: React.FC<MobileGuidedJourneyBarProps> = ({
  navMode,
  onSelectNavMode,
  onSaveDraft,
  lastSaveError,
}) => {
  const {
    mode,
    setMode,
    activeStep,
    unlockedStep,
    completedSteps,
    isSavingStep,
    saveStepError,
    selectStep,
    handleSaveAndAdvance,
  } = useStudioGuidedNavigation({ onSelectNavMode, onSaveDraft, externalSaveError: lastSaveError });

  if (mode !== "guided") {
    return null;
  }

  const currentMeta = STUDIO_JOURNEY_STEPS.find((s) => s.step === activeStep) || STUDIO_JOURNEY_STEPS[0];

  return (
    <section
      data-testid="mobile-guided-journey-bar"
      aria-label="Parcours guidé mobile"
      className="md:hidden bg-slate-50 border-b border-slate-200 px-3 py-2 space-y-2 select-none"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {STUDIO_JOURNEY_STEPS.map((st) => {
            const isCurrent = st.step === activeStep;
            const isDone = completedSteps.includes(st.step);
            const isLocked = st.step > unlockedStep && !isDone;
            return (
              <button
                key={st.step}
                type="button"
                disabled={isLocked}
                data-testid={`mobile-journey-step-${st.step}`}
                onClick={() => selectStep(st.step)}
                title={st.title}
                className={`h-7 px-2.5 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-colors shrink-0 ${
                  isCurrent
                    ? "bg-slate-900 text-white cursor-pointer"
                    : isLocked
                    ? "bg-white border border-slate-200 text-slate-400 opacity-60 cursor-not-allowed"
                    : isDone
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-700 cursor-pointer"
                    : "bg-white border border-slate-200 text-slate-700 cursor-pointer"
                }`}
              >
                {isDone && !isCurrent ? (
                  <Check className="w-3 h-3" />
                ) : isLocked ? (
                  <Lock className="w-2.5 h-2.5" />
                ) : null}
                <span>{st.step}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          data-testid="mobile-bar-mode-toggle"
          onClick={() => setMode("expert")}
          className="text-[11px] font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
        >
          Accès Libre
        </button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="block text-[11.5px] font-semibold text-slate-900 truncate">
            Étape {activeStep}/4 · {currentMeta.title}
          </span>
          <div className="flex items-center gap-1 mt-1 overflow-x-auto no-scrollbar">
            {currentMeta.subLinks.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSelectNavMode(sub.id)}
                className={`px-2 py-0.5 rounded text-[10.5px] font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                  navMode === sub.id
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-slate-200 text-slate-600"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={isSavingStep}
          data-testid="mobile-save-and-advance-btn"
          onClick={() => void handleSaveAndAdvance()}
          className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 whitespace-nowrap cursor-pointer"
        >
          {isSavingStep ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Enregistrement...</span>
            </>
          ) : activeStep < 4 ? (
            <>
              <span>Étape {activeStep + 1}</span>
              <ArrowRight className="w-3 h-3" />
            </>
          ) : (
            <>
              <Check className="w-3 h-3" />
              <span>Enregistrer</span>
            </>
          )}
        </button>
      </div>

      {saveStepError && (
        <div
          role="alert"
          data-testid="mobile-step-save-error"
          className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] font-medium text-rose-700 flex items-start gap-1.5"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{saveStepError}</span>
        </div>
      )}
    </section>
  );
};
