import { useCallback, useState } from "react";
import { StudioNavMode } from "../components/studio/studio.types";
import { STUDIO_JOURNEY_STEPS } from "../components/studio/studioSidebarSteps";
import { useStudioStore } from "../store/useStudioStore";

interface UseStudioGuidedNavigationOptions {
  onSelectNavMode: (mode: StudioNavMode) => void;
  onSaveDraft?: () => unknown | Promise<unknown>;
  onAfterStepChange?: () => void;
  externalSaveError?: string | null;
}

export function useStudioGuidedNavigation({
  onSelectNavMode,
  onSaveDraft,
  onAfterStepChange,
  externalSaveError,
}: UseStudioGuidedNavigationOptions) {
  const mode = useStudioStore((s) => s.studioExperienceMode);
  const setMode = useStudioStore((s) => s.setStudioExperienceMode);
  const activeStep = useStudioStore((s) => s.activeStudioStep);
  const unlockedStep = useStudioStore((s) => s.unlockedStudioStep);
  const completedSteps = useStudioStore((s) => s.completedStudioSteps);
  const setActiveStudioStep = useStudioStore((s) => s.setActiveStudioStep);
  const completeAndAdvance = useStudioStore((s) => s.completeAndAdvanceStudioStep);

  const [isSavingStep, setIsSavingStep] = useState(false);
  const [saveStepError, setSaveStepError] = useState<string | null>(null);

  const clearStepError = useCallback(() => setSaveStepError(null), []);

  const selectStep = useCallback(
    (step: 1 | 2 | 3 | 4) => {
      const isDone = completedSteps.includes(step);
      const isLocked = step > unlockedStep && !isDone;
      if (isLocked) return;
      setSaveStepError(null);
      setActiveStudioStep(step);
      const meta = STUDIO_JOURNEY_STEPS.find((s) => s.step === step);
      if (meta) onSelectNavMode(meta.defaultNav);
    },
    [completedSteps, onSelectNavMode, setActiveStudioStep, unlockedStep]
  );

  const handleSaveAndAdvance = useCallback(async (): Promise<boolean> => {
    if (isSavingStep) return false;
    setIsSavingStep(true);
    setSaveStepError(null);

    try {
      const saveOutcome = await onSaveDraft?.();
      if (saveOutcome === null || saveOutcome === false) {
        setSaveStepError(
          externalSaveError?.trim() ||
            "La sauvegarde a échoué. L'étape reste ouverte : vérifiez votre connexion ou les champs saisis puis réessayez."
        );
        return false;
      }

      const nextStep = completeAndAdvance(activeStep);
      const nextMeta = STUDIO_JOURNEY_STEPS.find((s) => s.step === nextStep);
      if (nextMeta && activeStep < 4) {
        onSelectNavMode(nextMeta.defaultNav);
      }
      onAfterStepChange?.();
      return true;
    } catch (err: unknown) {
      const msg =
        err instanceof Error && err.message.trim()
          ? err.message
          : externalSaveError?.trim() || "Impossible d'enregistrer cette étape. Veuillez réessayer.";
      setSaveStepError(msg);
      return false;
    } finally {
      setIsSavingStep(false);
    }
  }, [activeStep, completeAndAdvance, externalSaveError, isSavingStep, onAfterStepChange, onSaveDraft, onSelectNavMode]);

  return {
    mode,
    setMode,
    activeStep,
    unlockedStep,
    completedSteps,
    isSavingStep,
    saveStepError,
    clearStepError,
    selectStep,
    handleSaveAndAdvance,
  };
}
