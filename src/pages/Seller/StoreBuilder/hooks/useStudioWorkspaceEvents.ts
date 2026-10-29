import { useEffect } from "react";
import { SECTION_CATALOG } from "../constants/sectionCatalog";
import {
  CustomPageSection,
  CustomPageSectionType,
  CustomPageTheme,
} from "../../../../domains/seller/customPage.types";
import { StudioNavMode } from "../components/studio/studio.types";
import { MobileStudioColumn } from "../components/studio/MobileStudioNavigation";
import { useStudioStore } from "../store/useStudioStore";
import { buildHarmoniousColorSchemes } from "../components/inspector/controls/ColorSchemePicker";

interface UseStudioWorkspaceEventsProps {
  sections: CustomPageSection[];
  currentTheme?: CustomPageTheme;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  updateSection?: (id: string, updatedData: Partial<CustomPageSection>) => void;
  duplicateSection?: (id: string) => void;
  toggleVisibility: (id: string) => void;
  deleteSection: (id: string) => void;
  addSection: (
    type: CustomPageSectionType,
    defaultSettings: Record<string, unknown>,
    defaultTitle?: string
  ) => void;
  setShowRightSidebar: (show: boolean) => void;
  setNavMode: (mode: StudioNavMode) => void;
  setMobileColumn: (col: MobileStudioColumn) => void;
  setIsCommandPaletteOpen: (open: boolean) => void;
}

export function useStudioWorkspaceEvents({
  sections,
  currentTheme,
  reorderSections,
  updateSection,
  duplicateSection,
  toggleVisibility,
  deleteSection,
  addSection,
  setShowRightSidebar,
  setNavMode,
  setMobileColumn,
  setIsCommandPaletteOpen,
}: UseStudioWorkspaceEventsProps) {
  const selectedSectionId = useStudioStore((s) => s.selectedSectionId);
  const selectedSubElement = useStudioStore((s) => s.selectedSubElement);
  const pendingSectionAction = useStudioStore((s) => s.pendingSectionAction);
  const clearPendingSectionAction = useStudioStore((s) => s.clearPendingSectionAction);

  // React to sub-element selection in Zustand store -> open inspector sidebar on sections tab
  useEffect(() => {
    if (selectedSectionId && selectedSubElement) {
      setShowRightSidebar(true);
      setNavMode("sections");
      setMobileColumn("inspector");
    }
  }, [selectedSectionId, selectedSubElement, setShowRightSidebar, setNavMode, setMobileColumn]);

  // React to pending section actions dispatched via Zustand store
  useEffect(() => {
    if (!pendingSectionAction) return;
    const { sectionId, action } = pendingSectionAction;
    const idx = sections.findIndex((s) => s.id === sectionId);
    if (action === "move-up" && idx > 0) {
      reorderSections(idx, idx - 1);
    } else if (action === "move-down" && idx >= 0 && idx < sections.length - 1) {
      reorderSections(idx, idx + 1);
    } else if (action === "cycle-color-scheme" && idx >= 0 && updateSection) {
      const targetSec = sections[idx];
      const schemes = buildHarmoniousColorSchemes(currentTheme);
      const currentSchemeId = targetSec.styles?.colorScheme;
      const currentIdx = schemes.findIndex((s) => s.id === currentSchemeId);
      const nextScheme = schemes[(currentIdx + 1) % schemes.length];
      updateSection(sectionId, {
        styles: {
          ...(targetSec.styles || {}),
          colorScheme: nextScheme.id,
          backgroundColor: nextScheme.backgroundColor,
          textColor: nextScheme.textColor,
          buttonBgColor: nextScheme.buttonBgColor,
          buttonTextColor: nextScheme.buttonTextColor,
        },
      });
    } else if (action === "duplicate" && duplicateSection) {
      duplicateSection(sectionId);
    } else if (action === "toggle-visibility") {
      toggleVisibility(sectionId);
    } else if (action === "delete") {
      deleteSection(sectionId);
    }
    clearPendingSectionAction();
  }, [
    pendingSectionAction,
    sections,
    currentTheme,
    reorderSections,
    updateSection,
    duplicateSection,
    toggleVisibility,
    deleteSection,
    clearPendingSectionAction,
  ]);

  useEffect(() => {
    const navPageHandler = (event: Event) => {
      const custom = event as CustomEvent<{ openCustomizer?: boolean }>;
      if (custom.detail?.openCustomizer) {
        setShowRightSidebar(true);
        setNavMode("pages");
        setMobileColumn("inspector");
      }
    };

    const cmdHandler = () => {
      setIsCommandPaletteOpen(true);
    };

    const autoFixHandler = (event: Event) => {
      const custom = event as CustomEvent<{
        fixType: "add-hero" | "add-categories" | "add-products" | "add-trust";
      }>;
      const typeMap: Record<string, CustomPageSectionType> = {
        "add-hero": "hero_banner",
        "add-categories": "featured_categories",
        "add-products": "featured_products",
        "add-trust": "delivery_info",
      };
      const targetType = typeMap[custom.detail?.fixType || ""];
      if (!targetType) return;
      const found = SECTION_CATALOG.find((s) => s.type === targetType);
      if (found) {
        addSection(found.type, found.defaultSettings, found.title);
      }
    };

    const patchSettingsHandler = (event: Event) => {
      if (!updateSection) return;
      const custom = event as CustomEvent<{
        sectionId: string;
        patch: Record<string, unknown>;
      }>;
      const { sectionId, patch } = custom.detail || {};
      if (!sectionId || !patch) return;
      const targetSec = sections.find((s) => s.id === sectionId);
      if (!targetSec) return;
      updateSection(sectionId, {
        settings: {
          ...((targetSec.settings as unknown as Record<string, unknown>) || {}),
          ...patch,
        } as unknown as CustomPageSection["settings"],
      });
    };

    const openInspectorTabHandler = (event: Event) => {
      const custom = event as CustomEvent<{
        sectionId?: string;
        tab?: "content" | "style" | "layout" | "responsive" | "advanced";
      }>;
      if (custom.detail?.tab) {
        useStudioStore.getState().setActiveInspectorTab(custom.detail.tab);
      }
      setShowRightSidebar(true);
      setNavMode("sections");
      setMobileColumn("inspector");
    };

    window.addEventListener("studio:navigate-page", navPageHandler);
    window.addEventListener("studio:open-command-palette", cmdHandler);
    window.addEventListener("studio:audit-autofix", autoFixHandler);
    window.addEventListener("studio:patch-section-settings", patchSettingsHandler);
    window.addEventListener("studio:open-inspector-tab", openInspectorTabHandler);

    return () => {
      window.removeEventListener("studio:navigate-page", navPageHandler);
      window.removeEventListener("studio:open-command-palette", cmdHandler);
      window.removeEventListener("studio:audit-autofix", autoFixHandler);
      window.removeEventListener("studio:patch-section-settings", patchSettingsHandler);
      window.removeEventListener("studio:open-inspector-tab", openInspectorTabHandler);
    };
  }, [
    sections,
    updateSection,
    addSection,
    setShowRightSidebar,
    setNavMode,
    setMobileColumn,
    setIsCommandPaletteOpen,
  ]);
}

