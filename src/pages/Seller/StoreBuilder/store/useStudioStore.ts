import { create } from "zustand";
import { StudioStoreState } from "./studioStore.types";

export type {
  StudioViewport,
  StudioInspectorTab,
  StudioSectionActionType,
  PendingSectionAction,
  StudioExperienceMode,
  SectionStepProgressEntry,
  StudioStoreState,
} from "./studioStore.types";

export const useStudioStore = create<StudioStoreState>((set, get) => ({
  selectedSectionId: null,
  selectedSubElement: null,
  hoveredSectionId: null,
  hoveredSubElement: null,
  viewport: "desktop",
  isInteractiveMode: false,
  isDraggingSection: false,
  zoom: 1,
  activeInspectorTab: "content",
  pendingSectionAction: null,
  studioExperienceMode: "guided",
  activeStudioStep: 1,
  unlockedStudioStep: 1,
  completedStudioSteps: [],
  sectionStepProgress: {},

  selectSection: (sectionId, subElement) =>
    set((state) => {
      const nextSubElement =
        subElement !== undefined
          ? subElement
          : state.selectedSectionId === sectionId
          ? state.selectedSubElement
          : null;
      if (
        state.selectedSectionId === sectionId &&
        state.selectedSubElement === nextSubElement
      ) {
        return state;
      }
      return {
        selectedSectionId: sectionId,
        selectedSubElement: nextSubElement,
      };
    }),

  hoverElement: (sectionId, subElement = null) =>
    set((state) => {
      const nextSub = subElement ?? null;
      if (
        state.hoveredSectionId === sectionId &&
        state.hoveredSubElement === nextSub
      ) {
        return state;
      }
      return {
        hoveredSectionId: sectionId,
        hoveredSubElement: nextSub,
      };
    }),

  clearHover: () =>
    set((state) => {
      if (state.hoveredSectionId === null && state.hoveredSubElement === null) {
        return state;
      }
      return {
        hoveredSectionId: null,
        hoveredSubElement: null,
      };
    }),

  setViewport: (viewport) =>
    set((state) => {
      if (state.viewport === viewport) return state;
      return { viewport };
    }),

  setIsInteractiveMode: (next) =>
    set((state) => {
      const resolved = typeof next === "function" ? next(state.isInteractiveMode) : next;
      if (state.isInteractiveMode === resolved) return state;
      return { isInteractiveMode: resolved };
    }),

  toggleInteractiveMode: () =>
    set((state) => ({ isInteractiveMode: !state.isInteractiveMode })),

  setIsDraggingSection: (isDraggingSection) =>
    set((state) => {
      const targetZoom = isDraggingSection ? 0.88 : state.zoom === 0.88 ? 1 : state.zoom;
      if (state.isDraggingSection === isDraggingSection && state.zoom === targetZoom) {
        return state;
      }
      return {
        isDraggingSection,
        zoom: targetZoom,
      };
    }),

  setZoom: (zoom) =>
    set((state) => {
      const clamped = Math.min(1.5, Math.max(0.5, zoom));
      if (state.zoom === clamped) return state;
      return { zoom: clamped };
    }),

  setActiveInspectorTab: (activeInspectorTab) =>
    set((state) => {
      if (state.activeInspectorTab === activeInspectorTab) return state;
      return { activeInspectorTab };
    }),

  triggerSectionAction: (sectionId, action) =>
    set({
      pendingSectionAction: {
        sectionId,
        action,
        timestamp: Date.now(),
      },
    }),

  clearPendingSectionAction: () =>
    set((state) => {
      if (state.pendingSectionAction === null) return state;
      return { pendingSectionAction: null };
    }),

  setStudioExperienceMode: (studioExperienceMode) =>
    set({ studioExperienceMode }),

  setActiveStudioStep: (step) =>
    set((state) => {
      if (state.studioExperienceMode === "guided" && step > state.unlockedStudioStep) {
        return state;
      }
      return { activeStudioStep: step };
    }),

  completeAndAdvanceStudioStep: (step) => {
    const nextStep = (step < 4 ? step + 1 : 4) as 1 | 2 | 3 | 4;
    set((state) => {
      const completedStudioSteps = state.completedStudioSteps.includes(step)
        ? state.completedStudioSteps
        : [...state.completedStudioSteps, step];
      const unlockedStudioStep = Math.max(state.unlockedStudioStep, nextStep) as 1 | 2 | 3 | 4;
      return {
        completedStudioSteps,
        unlockedStudioStep,
        activeStudioStep: nextStep,
      };
    });
    return nextStep;
  },

  setSectionActiveStep: (key, step) =>
    set((state) => {
      const prev = state.sectionStepProgress[key] || {
        activeStep: 1,
        unlockedStep: 1,
        completedSteps: [],
      };
      if (state.studioExperienceMode === "guided" && step > prev.unlockedStep) {
        return state;
      }
      return {
        sectionStepProgress: {
          ...state.sectionStepProgress,
          [key]: { ...prev, activeStep: step },
        },
      };
    }),

  completeAndAdvanceSectionStep: (key, step, maxStep) => {
    const clampedNext = Math.min(maxStep, step + 1);
    const cur = get().sectionStepProgress[key] || {
      activeStep: 1,
      unlockedStep: 1,
      completedSteps: [],
    };
    const nextCompleted = cur.completedSteps.includes(step)
      ? cur.completedSteps
      : [...cur.completedSteps, step];
    const nextUnlocked = Math.max(cur.unlockedStep, clampedNext);
    set((state) => ({
      sectionStepProgress: {
        ...state.sectionStepProgress,
        [key]: {
          activeStep: clampedNext,
          unlockedStep: nextUnlocked,
          completedSteps: nextCompleted,
        },
      },
    }));
    return clampedNext;
  },

  resetStepProgress: () =>
    set({
      studioExperienceMode: "guided",
      activeStudioStep: 1,
      unlockedStudioStep: 1,
      completedStudioSteps: [],
      sectionStepProgress: {},
    }),
}));
