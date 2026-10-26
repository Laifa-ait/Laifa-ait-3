import { create } from "zustand";

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
  | "delete";

export interface PendingSectionAction {
  sectionId: string;
  action: StudioSectionActionType;
  timestamp: number;
}

export interface StudioStoreState {
  selectedSectionId: string | null;
  selectedSubElement: string | null;
  hoveredSectionId: string | null;
  hoveredSubElement: string | null;
  viewport: StudioViewport;
  isDraggingSection: boolean;
  zoom: number;
  activeInspectorTab: StudioInspectorTab;
  pendingSectionAction: PendingSectionAction | null;

  selectSection: (sectionId: string | null, subElement?: string | null) => void;
  hoverElement: (sectionId: string | null, subElement?: string | null) => void;
  clearHover: () => void;
  setViewport: (viewport: StudioViewport) => void;
  setIsDraggingSection: (isDragging: boolean) => void;
  setZoom: (zoom: number) => void;
  setActiveInspectorTab: (tab: StudioInspectorTab) => void;
  triggerSectionAction: (sectionId: string, action: StudioSectionActionType) => void;
  clearPendingSectionAction: () => void;
}

export const useStudioStore = create<StudioStoreState>((set) => ({
  selectedSectionId: null,
  selectedSubElement: null,
  hoveredSectionId: null,
  hoveredSubElement: null,
  viewport: "desktop",
  isDraggingSection: false,
  zoom: 1,
  activeInspectorTab: "content",
  pendingSectionAction: null,

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

  setViewport: (viewport) => set({ viewport }),

  setIsDraggingSection: (isDraggingSection) =>
    set((state) => ({
      isDraggingSection,
      zoom: isDraggingSection ? 0.88 : state.zoom === 0.88 ? 1 : state.zoom,
    })),

  setZoom: (zoom) => set({ zoom: Math.min(1.5, Math.max(0.5, zoom)) }),

  setActiveInspectorTab: (activeInspectorTab) => set({ activeInspectorTab }),

  triggerSectionAction: (sectionId, action) =>
    set({
      pendingSectionAction: {
        sectionId,
        action,
        timestamp: Date.now(),
      },
    }),

  clearPendingSectionAction: () => set({ pendingSectionAction: null }),
}));
