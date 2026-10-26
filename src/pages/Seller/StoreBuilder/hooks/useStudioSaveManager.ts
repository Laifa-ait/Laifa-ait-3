import { useState, useEffect, useRef, useCallback } from "react";
import { apiPut } from "../../../../lib/api";
import { CustomPageSection } from "../../../../domains/seller/customPage.types";
import { toast } from "react-hot-toast";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useStudioSaveManager() {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const revisionRef = useRef(0);
  const lastSavedRevisionRef = useRef(0);
  const lastSavedHashRef = useRef("");

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isSavingRef = useRef(false);
  const latestSectionsRef = useRef<CustomPageSection[]>([]);

  const clearAllTimers = useCallback(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    autoSaveTimerRef.current = null;
    retryTimerRef.current = null;
  }, []);

  const saveDraft = useCallback(async (sectionsToSave?: CustomPageSection[], retryCount = 0) => {
    const targetSections = sectionsToSave || latestSectionsRef.current;
    if (!targetSections) return;

    if (isSavingRef.current) {
      // Single write in flight mutex: queue save for when active save finishes
      return;
    }

    const currentHash = JSON.stringify(targetSections);
    if (currentHash === lastSavedHashRef.current && revisionRef.current === lastSavedRevisionRef.current) {
      setSaveStatus("saved");
      setHasUnsavedChanges(false);
      return;
    }

    isSavingRef.current = true;
    setSaveStatus("saving");

    const savingRevision = revisionRef.current;
    const sanitizedSections = targetSections.map((sec, idx) => ({
      id: sec.id || `sec_${idx}`,
      type: sec.type,
      title: typeof sec.title === "string" ? sec.title : undefined,
      settings: sec.settings && typeof sec.settings === "object" ? sec.settings : {},
      styles: sec.styles && typeof sec.styles === "object" ? sec.styles : {},
      isVisible: typeof sec.isVisible === "boolean" ? sec.isVisible : true,
      order: typeof sec.order === "number" && Number.isFinite(sec.order) ? Math.max(0, Math.round(sec.order)) : idx,
    }));

    try {
      await apiPut("/api/v1/seller/studio/layout/draft", { sections: sanitizedSections });

      lastSavedRevisionRef.current = savingRevision;
      lastSavedHashRef.current = JSON.stringify(targetSections);
      isSavingRef.current = false;

      if (revisionRef.current === savingRevision) {
        setSaveStatus("saved");
        setHasUnsavedChanges(false);
      } else {
        // Newer revision was edited during HTTP write: save latest revision immediately
        void saveDraft(latestSectionsRef.current);
      }
    } catch (err: unknown) {
      isSavingRef.current = false;

      if (revisionRef.current > savingRevision) {
        // Obsolete revision failed, but a newer revision exists: save newer revision
        void saveDraft(latestSectionsRef.current);
        return;
      }

      if (retryCount < 3) {
        retryTimerRef.current = setTimeout(() => {
          void saveDraft(targetSections, retryCount + 1);
        }, (retryCount + 1) * 1000);
        return;
      }

      setSaveStatus("error");
      const msg = err instanceof Error ? err.message : "Échec de la sauvegarde du brouillon";
      toast.error(msg);
    }
  }, []);

  const triggerAutoSave = useCallback((updatedSections: CustomPageSection[]) => {
    const newHash = JSON.stringify(updatedSections);
    if (newHash === lastSavedHashRef.current) {
      setSaveStatus("saved");
      setHasUnsavedChanges(false);
      return;
    }

    latestSectionsRef.current = updatedSections;
    revisionRef.current += 1;
    setHasUnsavedChanges(true);

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(() => {
      void saveDraft(updatedSections);
    }, 1500);
  }, [saveDraft]);

  // Tab exit guard for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges || revisionRef.current !== lastSavedRevisionRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearAllTimers();
    };
  }, [hasUnsavedChanges, clearAllTimers]);

  return {
    saveStatus,
    setSaveStatus,
    hasUnsavedChanges: hasUnsavedChanges || revisionRef.current !== lastSavedRevisionRef.current,
    setHasUnsavedChanges,
    saveDraft,
    triggerAutoSave,
    currentRevision: revisionRef.current,
    lastSavedRevision: lastSavedRevisionRef.current,
  };
}
