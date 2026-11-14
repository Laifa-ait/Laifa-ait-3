import { useCallback, useMemo, useState } from "react";
import { useStudioStore } from "../store/useStudioStore";

export interface UseSectionStepProgressResult {
  activeStep: number;
  unlockedStep: number;
  completedSteps: number[];
  isExpert: boolean;
  justSavedStep: number | null;
  selectStep: (step: number) => void;
  goToPrevStep: () => void;
  saveAndAdvanceStep: (onSaveStep?: () => void | Promise<void>) => Promise<void>;
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
    (step: number) => {
      if (!isExpert && step > unlockedStep) return;
      setSectionActiveStep(progressKey, Math.min(totalSteps, Math.max(1, step)));
    },
    [isExpert, progressKey, setSectionActiveStep, totalSteps, unlockedStep]
  );

  const goToPrevStep = useCallback(() => {
    if (activeStep > 1) {
      setSectionActiveStep(progressKey, activeStep - 1);
    }
  }, [activeStep, progressKey, setSectionActiveStep]);

  const saveAndAdvanceStep = useCallback(
    async (onSaveStep?: () => void | Promise<void>) => {
      const current = activeStep;
      await onSaveStep?.();
      completeAndAdvanceSectionStep(progressKey, current, totalSteps);
      setJustSavedStep(current);
      setTimeout(() => setJustSavedStep((prev) => (prev === current ? null : prev)), 2200);
    },
    [activeStep, completeAndAdvanceSectionStep, progressKey, totalSteps]
  );

  return {
    activeStep,
    unlockedStep,
    completedSteps: entry.completedSteps,
    isExpert,
    justSavedStep,
    selectStep,
    goToPrevStep,
    saveAndAdvanceStep,
  };
}
