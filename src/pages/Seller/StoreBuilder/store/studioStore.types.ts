export type StudioViewport = "desktop" | "tablet" | "mobile";

export type StudioInspectorTab =
  | "content"
  | "style"
  | "layout"
  | "responsive"
  | "advanced";

export type StudioSectionActionType =
  | "move-up"
  | "move-down"
  | "cycle-color-scheme"
  | "duplicate"
  | "toggle-visibility"
  | "toggle-lock"
  | "delete";

export interface PendingSectionAction {
  sectionId: string;
  action: StudioSectionActionType;
  timestamp: number;
}

export type StudioExperienceMode = "guided" | "expert";

export interface SectionStepProgressEntry {
  activeStep: number;
  unlockedStep: number;
  completedSteps: number[];
}

export interface StudioStoreState {
  selectedSectionId: string | null;
  selectedSubElement: string | null;
  hoveredSectionId: string | null;
  hoveredSubElement: string | null;
  viewport: StudioViewport;
  isInteractiveMode: boolean;
  isDraggingSection: boolean;
  zoom: number;
  activeInspectorTab: StudioInspectorTab;
  pendingSectionAction: PendingSectionAction | null;
  studioExperienceMode: StudioExperienceMode;
  activeStudioStep: 1 | 2 | 3 | 4;
  unlockedStudioStep: 1 | 2 | 3 | 4;
  completedStudioSteps: number[];
  sectionStepProgress: Record<string, SectionStepProgressEntry>;

  selectSection: (sectionId: string | null, subElement?: string | null) => void;
  hoverElement: (sectionId: string | null, subElement?: string | null) => void;
  clearHover: () => void;
  setViewport: (viewport: StudioViewport) => void;
  setIsInteractiveMode: (isInteractive: boolean | ((prev: boolean) => boolean)) => void;
  toggleInteractiveMode: () => void;
  setIsDraggingSection: (isDragging: boolean) => void;
  setZoom: (zoom: number) => void;
  setActiveInspectorTab: (tab: StudioInspectorTab) => void;
  triggerSectionAction: (sectionId: string, action: StudioSectionActionType) => void;
  clearPendingSectionAction: () => void;
  setStudioExperienceMode: (mode: StudioExperienceMode) => void;
  setActiveStudioStep: (step: 1 | 2 | 3 | 4) => void;
  completeAndAdvanceStudioStep: (step: 1 | 2 | 3 | 4) => 1 | 2 | 3 | 4;
  setSectionActiveStep: (key: string, step: number) => void;
  completeAndAdvanceSectionStep: (key: string, step: number, maxStep: number) => number;
  resetStepProgress: () => void;
}
