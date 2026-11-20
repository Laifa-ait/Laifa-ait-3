import React, { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
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
  setIsCommandPaletteOpen: React.Dispatch<React.SetStateAction<boolean>>;
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

  useEffect(() => {
    if (selectedSectionId && selectedSubElement) {
      setShowRightSidebar(true);
      setNavMode("sections");
      setMobileColumn("inspector");
    }
  }, [selectedSectionId, selectedSubElement, setShowRightSidebar, setNavMode, setMobileColumn]);

  useEffect(() => {
    if (!pendingSectionAction) return;
    const { sectionId, action } = pendingSectionAction;
    const idx = sections.findIndex((s) => s.id === sectionId);
    const targetSec = idx >= 0 ? sections[idx] : undefined;
    const isLocked = Boolean((targetSec?.settings as Record<string, unknown> | undefined)?.isLocked);

    if (action === "toggle-lock" && targetSec && updateSection) {
      const nextLocked = !isLocked;
      updateSection(sectionId, {
        settings: {
          ...((targetSec.settings as unknown as Record<string, unknown>) || {}),
          isLocked: nextLocked,
        } as unknown as CustomPageSection["settings"],
      });
      toast.success(nextLocked ? "Section verrouillée" : "Section déverrouillée");
    } else if ((action === "move-up" || action === "move-down" || action === "delete") && isLocked) {
      toast.error("Cette section est verrouillée. Déverrouillez-la avant de la déplacer ou la supprimer.");
    } else if (action === "move-up" && idx > 0) {
      reorderSections(idx, idx - 1);
    } else if (action === "move-down" && idx >= 0 && idx < sections.length - 1) {
      reorderSections(idx, idx + 1);
    } else if (action === "cycle-color-scheme" && targetSec && updateSection) {
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
      window.dispatchEvent(
        new CustomEvent("studio:request-delete-section", { detail: { sectionId } })
      );
    }
    clearPendingSectionAction();
  }, [
    pendingSectionAction, sections, currentTheme, reorderSections,
    updateSection, duplicateSection, toggleVisibility, deleteSection, clearPendingSectionAction,
  ]);

  const latestRef = useRef({
    sections,
    updateSection,
    addSection,
    setShowRightSidebar,
    setNavMode,
    setMobileColumn,
    setIsCommandPaletteOpen,
  });
  latestRef.current = {
    sections,
    updateSection,
    addSection,
    setShowRightSidebar,
    setNavMode,
    setMobileColumn,
    setIsCommandPaletteOpen,
  };

  useEffect(() => {
    const navPageHandler = (event: Event) => {
      const custom = event as CustomEvent<{ openCustomizer?: boolean }>;
      if (custom.detail?.openCustomizer) {
        latestRef.current.setShowRightSidebar(true);
        latestRef.current.setNavMode("pages");
        latestRef.current.setMobileColumn("inspector");
      }
    };

    const selectNavModeHandler = (event: Event) => {
      const mode = (event as CustomEvent<{ mode?: StudioNavMode }>).detail?.mode;
      if (!mode) return;
      latestRef.current.setShowRightSidebar(true);
      latestRef.current.setNavMode(mode);
      latestRef.current.setMobileColumn(mode === "sections" ? "tree" : "inspector");
    };

    const cmdHandler = () => latestRef.current.setIsCommandPaletteOpen(true);

    const autoFixHandler = (event: Event) => {
      const custom = event as CustomEvent<{
        fixType: "add-hero" | "add-categories" | "add-products" | "add-trust" | "fix-contrast" | "open-seo";
      }>;
      const fixType = custom.detail?.fixType;
      if (fixType === "fix-contrast") {
        latestRef.current.setShowRightSidebar(true);
        latestRef.current.setNavMode("theme");
        latestRef.current.setMobileColumn("inspector");
        return;
      }
      if (fixType === "open-seo") {
        latestRef.current.setShowRightSidebar(true);
        latestRef.current.setNavMode("settings");
        latestRef.current.setMobileColumn("inspector");
        return;
      }
      const typeMap: Record<string, CustomPageSectionType> = {
        "add-hero": "hero_banner",
        "add-categories": "featured_categories",
        "add-products": "featured_products",
        "add-trust": "delivery_info",
      };
      const targetType = typeMap[fixType || ""];
      if (!targetType) return;
      const found = SECTION_CATALOG.find((s) => s.type === targetType);
      if (found) latestRef.current.addSection(found.type, found.defaultSettings, found.title);
    };

    const patchSettingsHandler = (event: Event) => {
      const { updateSection: updateSec, sections: currentSecs } = latestRef.current;
      if (!updateSec) return;
      const custom = event as CustomEvent<{ sectionId: string; patch: Record<string, unknown> }>;
      const { sectionId, patch } = custom.detail || {};
      if (!sectionId || !patch) return;
      const targetSec = currentSecs.find((s) => s.id === sectionId);
      if (!targetSec) return;
      const { __sectionTitle, ...cleanPatch } = patch;
      updateSec(sectionId, {
        ...(typeof __sectionTitle === "string" ? { title: __sectionTitle } : {}),
        settings: {
          ...((targetSec.settings as unknown as Record<string, unknown>) || {}),
          ...cleanPatch,
        } as unknown as CustomPageSection["settings"],
      });
    };

    const openInspectorTabHandler = (event: Event) => {
      const custom = event as CustomEvent<{
        sectionId?: string;
        tab?: "content" | "style" | "layout" | "responsive" | "advanced";
      }>;
      if (custom.detail?.sectionId) {
        useStudioStore.getState().selectSection(custom.detail.sectionId, null);
      }
      if (custom.detail?.tab) {
        useStudioStore.getState().setActiveInspectorTab(custom.detail.tab);
      }
      latestRef.current.setShowRightSidebar(true);
      latestRef.current.setNavMode("sections");
      latestRef.current.setMobileColumn("inspector");
    };

    const keyDownHandler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        latestRef.current.setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener("studio:navigate-page", navPageHandler);
    window.addEventListener("studio:select-nav-mode", selectNavModeHandler);
    window.addEventListener("studio:open-command-palette", cmdHandler);
    window.addEventListener("studio:audit-autofix", autoFixHandler);
    window.addEventListener("studio:patch-section-settings", patchSettingsHandler);
    window.addEventListener("studio:open-inspector-tab", openInspectorTabHandler);
    window.addEventListener("keydown", keyDownHandler);

    return () => {
      window.removeEventListener("studio:navigate-page", navPageHandler);
      window.removeEventListener("studio:select-nav-mode", selectNavModeHandler);
      window.removeEventListener("studio:open-command-palette", cmdHandler);
      window.removeEventListener("studio:audit-autofix", autoFixHandler);
      window.removeEventListener("studio:patch-section-settings", patchSettingsHandler);
      window.removeEventListener("studio:open-inspector-tab", openInspectorTabHandler);
      window.removeEventListener("keydown", keyDownHandler);
    };
  }, []);
}
