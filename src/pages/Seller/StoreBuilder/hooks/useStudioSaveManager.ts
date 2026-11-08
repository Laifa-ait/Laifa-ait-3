import { useState, useEffect, useRef, useCallback } from "react";
import { apiPut } from "../../../../lib/api";
import {
  CustomPageSection,
  StoreLayoutVersion,
} from "../../../../domains/seller/customPage.types";
import { toast } from "react-hot-toast";

export type SaveStatus =
  | "idle"
  | "unsaved"
  | "saving"
  | "retrying"
  | "saved"
  | "offline"
  | "error"
  | "conflict";

export interface StudioSaveManagerOptions {
  debounceMs?: number;
  maxRetries?: number;
  backupKey?: string;
  onConflict?: (serverRev?: number) => void;
}

function sanitizeSections(targetSections: CustomPageSection[]) {
  return targetSections.map((sec, idx) => ({
    id: sec.id || `sec_${idx}`,
    type: sec.type,
    title: typeof sec.title === "string" ? sec.title : undefined,
    settings: sec.settings && typeof sec.settings === "object" ? sec.settings : {},
    styles: sec.styles && typeof sec.styles === "object" ? sec.styles : {},
    isVisible: typeof sec.isVisible === "boolean" ? sec.isVisible : true,
    order: typeof sec.order === "number" && Number.isFinite(sec.order) ? Math.max(0, Math.round(sec.order)) : idx,
  }));
}

export function useStudioSaveManager(options?: StudioSaveManagerOptions) {
  const debounceMs = options?.debounceMs ?? 1500;
  const maxRetries = options?.maxRetries ?? 3;
  const backupKey = options?.backupKey ?? "olmart_studio_unsaved_backup";
  const onConflictCallback = options?.onConflict;

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const latestRequestedRevisionRef = useRef(0);
  const lastSavedRevisionRef = useRef(0);
  const confirmedServerRevisionRef = useRef<number | undefined>(undefined);
  const lastSavedHashRef = useRef("");

  const pendingSectionsRef = useRef<CustomPageSection[] | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const waitersRef = useRef<Array<(rev: number | null) => void>>([]);

  const notifyWaiters = useCallback((rev: number | null) => {
    waitersRef.current.splice(0, waitersRef.current.length).forEach((cb) => cb(rev));
  }, []);

  const persistLocalBackup = useCallback(
    (sections: CustomPageSection[], localRev: number) => {
      if (typeof window === "undefined" || !window.localStorage) return;
      try {
        window.localStorage.setItem(backupKey, JSON.stringify({ sections, localRevision: localRev, updatedAt: Date.now() }));
      } catch {
        // Quota localStorage ignoré
      }
    },
    [backupKey]
  );

  const clearLocalBackup = useCallback(() => {
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      window.localStorage.removeItem(backupKey);
    } catch {
      // Ignore
    }
  }, [backupKey]);

  const clearAllTimers = useCallback(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    autoSaveTimerRef.current = null;
    retryTimerRef.current = null;
  }, []);

  const syncServerDraftRevision = useCallback((revision?: number) => {
    if (typeof revision === "number" && Number.isFinite(revision)) {
      confirmedServerRevisionRef.current = revision;
    }
  }, []);

  const executeSave = useCallback(
    async (
      targetSections: CustomPageSection[],
      targetRevision: number,
      currentRetry = 0,
      forceOverwrite = false
    ): Promise<number | null> => {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        pendingSectionsRef.current = targetSections;
        setSaveStatus("offline");
        setHasUnsavedChanges(true);
        notifyWaiters(null);
        return null;
      }

      if (isSavingRef.current) {
        pendingSectionsRef.current = targetSections;
        return new Promise<number | null>((resolve) => {
          waitersRef.current.push(resolve);
        });
      }

      isSavingRef.current = true;
      setRetryCount(currentRetry);
      setSaveStatus(currentRetry > 0 ? "retrying" : "saving");

      const payload = {
        sections: sanitizeSections(targetSections),
        ...(typeof confirmedServerRevisionRef.current === "number" ? { expectedRevision: confirmedServerRevisionRef.current } : {}),
        ...(forceOverwrite ? { forceOverwrite: true } : {}),
      };

      try {
        const res = await apiPut<{ success?: boolean; data?: StoreLayoutVersion }>("/api/v1/seller/studio/layout/draft", payload);
        if (res?.data && typeof res.data.draftRevision === "number") {
          confirmedServerRevisionRef.current = res.data.draftRevision;
        } else {
          confirmedServerRevisionRef.current = (confirmedServerRevisionRef.current ?? 0) + 1;
        }

        lastSavedRevisionRef.current = targetRevision;
        lastSavedHashRef.current = JSON.stringify(targetSections);
        isSavingRef.current = false;
        setRetryCount(0);

        if (pendingSectionsRef.current && latestRequestedRevisionRef.current > targetRevision) {
          const nextSections = pendingSectionsRef.current;
          const nextRev = latestRequestedRevisionRef.current;
          pendingSectionsRef.current = null;
          return await executeSave(nextSections, nextRev, 0, forceOverwrite);
        }

        setSaveStatus("saved");
        setHasUnsavedChanges(false);
        clearLocalBackup();
        const confirmed = confirmedServerRevisionRef.current ?? 1;
        notifyWaiters(confirmed);
        return confirmed;
      } catch (err: unknown) {
        isSavingRef.current = false;
        const msg = err instanceof Error ? err.message : "Échec de la sauvegarde du brouillon";

        if (msg.includes("CONFLICT_NEWER_VERSION") || msg.includes("Conflit de version")) {
          setSaveStatus("conflict");
          setRetryCount(0);
          clearAllTimers();
          onConflictCallback?.(confirmedServerRevisionRef.current);
          toast.error("Conflit de version : votre boutique a été modifiée sur un autre écran.");
          notifyWaiters(null);
          return null;
        }

        if (msg.includes("401") || msg.includes("403") || msg.includes("Non autorisé")) {
          setSaveStatus("error");
          setRetryCount(0);
          clearAllTimers();
          toast.error("Session expirée. Veuillez vous reconnecter.");
          notifyWaiters(null);
          return null;
        }

        if (pendingSectionsRef.current && latestRequestedRevisionRef.current > targetRevision) {
          const nextSections = pendingSectionsRef.current;
          const nextRev = latestRequestedRevisionRef.current;
          pendingSectionsRef.current = null;
          return await executeSave(nextSections, nextRev, 0, forceOverwrite);
        }

        if (currentRetry < maxRetries) {
          setSaveStatus("retrying");
          setRetryCount(currentRetry + 1);
          notifyWaiters(null);
          retryTimerRef.current = setTimeout(() => {
            void executeSave(targetSections, targetRevision, currentRetry + 1, forceOverwrite);
          }, (currentRetry + 1) * 1000);
          return null;
        }

        setSaveStatus("error");
        setRetryCount(0);
        toast.error(msg);
        notifyWaiters(null);
        return null;
      }
    },
    [clearAllTimers, clearLocalBackup, maxRetries, notifyWaiters, onConflictCallback]
  );

  const saveDraft = useCallback(
    async (sectionsToSave: CustomPageSection[], forceOverwrite = false): Promise<number | null> => {
      latestRequestedRevisionRef.current += 1;
      const targetRevision = latestRequestedRevisionRef.current;
      persistLocalBackup(sectionsToSave, targetRevision);
      clearAllTimers();
      return await executeSave(sectionsToSave, targetRevision, 0, forceOverwrite);
    },
    [clearAllTimers, executeSave, persistLocalBackup]
  );

  const triggerAutoSave = useCallback(
    (updatedSections: CustomPageSection[]) => {
      if (JSON.stringify(updatedSections) === lastSavedHashRef.current && !isSavingRef.current) {
        setSaveStatus("saved");
        setHasUnsavedChanges(false);
        return;
      }
      latestRequestedRevisionRef.current += 1;
      const thisRevision = latestRequestedRevisionRef.current;
      pendingSectionsRef.current = updatedSections;
      setHasUnsavedChanges(true);
      persistLocalBackup(updatedSections, thisRevision);
      if (!isSavingRef.current) {
        setSaveStatus(typeof navigator !== "undefined" && navigator.onLine === false ? "offline" : "unsaved");
      }
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        if (pendingSectionsRef.current) {
          const toSave = pendingSectionsRef.current;
          pendingSectionsRef.current = null;
          void executeSave(toSave, thisRevision);
        }
      }, debounceMs);
    },
    [debounceMs, executeSave, persistLocalBackup]
  );

  useEffect(() => {
    const handleOnline = () => {
      if (pendingSectionsRef.current) {
        const toSave = pendingSectionsRef.current;
        pendingSectionsRef.current = null;
        void executeSave(toSave, latestRequestedRevisionRef.current);
      } else {
        setSaveStatus((prev) => (prev === "offline" ? "idle" : prev));
      }
    };
    const handleOffline = () => setSaveStatus("offline");
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges || isSavingRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges, executeSave]);

  useEffect(() => () => clearAllTimers(), [clearAllTimers]);

  return {
    saveStatus, setSaveStatus, hasUnsavedChanges: hasUnsavedChanges || isSavingRef.current,
    setHasUnsavedChanges, saveDraft, triggerAutoSave, syncServerDraftRevision, retryCount,
    currentRevision: latestRequestedRevisionRef.current, lastSavedRevision: lastSavedRevisionRef.current,
    confirmedServerRevision: confirmedServerRevisionRef.current,
  };
}
