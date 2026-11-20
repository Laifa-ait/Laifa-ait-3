import { useCallback, useMemo, useState } from "react";
import { useStudioStore } from "../store/useStudioStore";

export interface UseSectionStepProgressResult {
  activeStep: number;
  unlockedStep: number;
  completedSteps: number[];
  isExpert: boolean;
  justSavedStep: number | null;
  isSavingStep: boolean;
  saveStepError: string | null;
  selectStep: (step: number, forceUnlock?: boolean) => void;
  goToPrevStep: () => void;
  saveAndAdvanceStep: (onSaveStep?: () => unknown | Promise<unknown>) => Promise<boolean>;
}

export function useSectionStepProgress(
  scope: string,
  totalSteps: number,
  sectionId?: string | null
): UseSectionStepProgressResult {
  const storeSelectedId = useStudioStore((s) => s.selectedSectionId);
  const experienceMode = useStudioStore((s) => s.studioExperienceMode);
  const sectionStepProgress = useStudioStore((s) => s.sectionStepProgress);
  const setSectionActiveStep = useStudioStore((s) => s.setSectionActiveStep);
  const completeAndAdvanceSectionStep = useStudioStore((s) => s.completeAndAdvanceSectionStep);

  const [justSavedStep, setJustSavedStep] = useState<number | null>(null);
  const [isSavingStep, setIsSavingStep] = useState(false);
  const [saveStepError, setSaveStepError] = useState<string | null>(null);
  const resolvedId = sectionId || storeSelectedId || "standalone";
  const progressKey = useMemo(() => `${resolvedId}:${scope}`, [resolvedId, scope]);

  const entry = sectionStepProgress[progressKey] || {
    activeStep: 1,
    unlockedStep: 1,
    completedSteps: [],
  };

  const isExpert = experienceMode === "expert";
  const activeStep = Math.min(totalSteps, Math.max(1, entry.activeStep));
  const unlockedStep = Math.min(totalSteps, Math.max(1, entry.unlockedStep));

  const selectStep = useCallback(
    (step: number, forceUnlock = false) => {
      if (!forceUnlock && !isExpert && step > unlockedStep) return;
      setSaveStepError(null);
      setSectionActiveStep(progressKey, Math.min(totalSteps, Math.max(1, step)), forceUnlock);
    },
    [isExpert, progressKey, setSectionActiveStep, totalSteps, unlockedStep]
  );

  const goToPrevStep = useCallback(() => {
    if (activeStep > 1) {
      setSaveStepError(null);
      setSectionActiveStep(progressKey, activeStep - 1);
    }
  }, [activeStep, progressKey, setSectionActiveStep]);

  const saveAndAdvanceStep = useCallback(
    async (onSaveStep?: () => unknown | Promise<unknown>): Promise<boolean> => {
      if (isSavingStep) return false;
      const current = activeStep;
      setIsSavingStep(true);
      setSaveStepError(null);
      try {
        const res = await onSaveStep?.();
        if (res === null || res === false) {
          setSaveStepError("Échec de l'enregistrement. L'étape reste ouverte.");
          return false;
        }
        completeAndAdvanceSectionStep(progressKey, current, totalSteps);
        setJustSavedStep(current);
        setTimeout(() => setJustSavedStep((prev) => (prev === current ? null : prev)), 2200);
        return true;
      } catch (err: unknown) {
        setSaveStepError(err instanceof Error ? err.message : "Échec de l'enregistrement.");
        return false;
      } finally {
        setIsSavingStep(false);
      }
    },
    [activeStep, completeAndAdvanceSectionStep, isSavingStep, progressKey, totalSteps]
  );

  return {
    activeStep,
    unlockedStep,
    completedSteps: entry.completedSteps,
    isExpert,
    justSavedStep,
    isSavingStep,
    saveStepError,
    selectStep,
    goToPrevStep,
    saveAndAdvanceStep,
  };
}
