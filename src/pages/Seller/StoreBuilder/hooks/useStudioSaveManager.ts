import { useState, useEffect, useRef, useCallback } from "react";
import { apiPut, ApiError } from "../../../../lib/api";
import { CustomPageSection, StoreLayoutVersion } from "../../../../domains/seller/customPage.types";
import { toast } from "react-hot-toast";
import {
  areStudioValuesEqual,
  fastDeepClone,
  readLocalStudioBackup,
  removeLocalStudioBackup,
  sanitizeStudioSections,
  StudioLocalBackupData,
  writeLocalStudioBackup,
} from "./studioBackupStorage";

export type { StudioLocalBackupData };
export type SaveStatus = "idle" | "unsaved" | "saving" | "retrying" | "saved" | "offline" | "error" | "conflict";

export interface StudioSaveManagerOptions {
  debounceMs?: number;
  maxRetries?: number;
  retryDelayBaseMs?: number;
  backupKey?: string;
  onConflict?: (serverRev?: number) => void;
}

const LOCAL_BACKUP_DEBOUNCE_MS = 600;

export function useStudioSaveManager(options?: StudioSaveManagerOptions) {
  const debounceMs = options?.debounceMs ?? 1500;
  const maxRetries = options?.maxRetries ?? 3;
  const retryDelayBaseMs = options?.retryDelayBaseMs ?? 1000;
  const backupKey = options?.backupKey ?? "olmart_studio_unsaved_backup";
  const onConflictCallback = options?.onConflict;

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastSaveError, setLastSaveError] = useState<string | null>(null);
  const [recoverableBackup, setRecoverableBackup] = useState<StudioLocalBackupData | null>(null);

  const latestRequestedRevisionRef = useRef(0);
  const lastSavedRevisionRef = useRef(0);
  const confirmedServerRevisionRef = useRef<number | undefined>(undefined);
  const lastSavedSectionsRef = useRef<CustomPageSection[] | null>(null);

  const pendingSectionsRef = useRef<CustomPageSection[] | null>(null);
  const pendingBackupRef = useRef<{ sections: CustomPageSection[]; rev: number } | null>(null);
  const localBackupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);
  const hasUnsavedChangesRef = useRef(false);
  const waitersRef = useRef<Array<(rev: number | null) => void>>([]);

  useEffect(() => { hasUnsavedChangesRef.current = hasUnsavedChanges; }, [hasUnsavedChanges]);

  const notifyWaiters = useCallback((rev: number | null) => {
    waitersRef.current.splice(0, waitersRef.current.length).forEach((cb) => cb(rev));
  }, []);

  const readLocalBackup = useCallback(() => readLocalStudioBackup(backupKey), [backupKey]);

  const flushPendingLocalBackup = useCallback(() => {
    if (localBackupTimerRef.current) { clearTimeout(localBackupTimerRef.current); localBackupTimerRef.current = null; }
    const pending = pendingBackupRef.current;
    if (!pending) return;
    pendingBackupRef.current = null;
    writeLocalStudioBackup(backupKey, pending.sections, pending.rev);
  }, [backupKey]);

  const clearLocalBackup = useCallback(() => {
    if (localBackupTimerRef.current) { clearTimeout(localBackupTimerRef.current); localBackupTimerRef.current = null; }
    pendingBackupRef.current = null;
    removeLocalStudioBackup(backupKey);
    setRecoverableBackup(null);
  }, [backupKey]);

  const dismissRecoveryBanner = useCallback(() => setRecoverableBackup(null), []);

  const checkRecoverableBackup = useCallback((serverUpdatedAtIso?: string, serverSections?: CustomPageSection[]): StudioLocalBackupData | null => {
    const backup = readLocalBackup();
    if (!backup) { setRecoverableBackup(null); return null; }
    const serverMs = serverUpdatedAtIso ? new Date(serverUpdatedAtIso).getTime() : 0;
    const isNewerThanServer = Number.isNaN(serverMs) || backup.updatedAt > serverMs;
    const isDifferent = Boolean(backup.theme) || !serverSections || !areStudioValuesEqual(backup.sections, serverSections);
    if (isNewerThanServer && isDifferent) { setRecoverableBackup(backup); return backup; }
    clearLocalBackup();
    return null;
  }, [clearLocalBackup, readLocalBackup]);

  const clearAllTimers = useCallback(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    if (localBackupTimerRef.current) clearTimeout(localBackupTimerRef.current);
    autoSaveTimerRef.current = null; retryTimerRef.current = null; localBackupTimerRef.current = null;
  }, []);

  const syncServerDraftRevision = useCallback((revision?: number) => {
    if (typeof revision === "number" && Number.isFinite(revision)) confirmedServerRevisionRef.current = revision;
  }, []);

  const executeSave = useCallback(async (
    targetSections: CustomPageSection[], targetRevision: number, currentRetry = 0, forceOverwrite = false, isInternalContinuation = false
  ): Promise<number | null> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      pendingSectionsRef.current = targetSections; isSavingRef.current = false;
      setSaveStatus("offline"); setHasUnsavedChanges(true); notifyWaiters(null); return null;
    }
    if (isSavingRef.current && !isInternalContinuation) {
      pendingSectionsRef.current = targetSections;
      return new Promise<number | null>((resolve) => { waitersRef.current.push(resolve); });
    }
    isSavingRef.current = true; setRetryCount(currentRetry); setLastSaveError(null); setSaveStatus(currentRetry > 0 ? "retrying" : "saving");
    const payload = {
      sections: sanitizeStudioSections(targetSections),
      ...(typeof confirmedServerRevisionRef.current === "number" ? { expectedRevision: confirmedServerRevisionRef.current } : {}),
      ...(forceOverwrite ? { forceOverwrite: true } : {}),
    };
    try {
      const res = await apiPut<{ success?: boolean; data?: StoreLayoutVersion }>("/api/v1/seller/studio/layout/draft", payload);
      confirmedServerRevisionRef.current = typeof res?.data?.draftRevision === "number" ? res.data.draftRevision : (confirmedServerRevisionRef.current ?? 0) + 1;
      lastSavedRevisionRef.current = targetRevision;
      lastSavedSectionsRef.current = fastDeepClone(targetSections);
      setRetryCount(0);
      if (pendingSectionsRef.current && latestRequestedRevisionRef.current > targetRevision) {
        const nextSections = pendingSectionsRef.current; const nextRev = latestRequestedRevisionRef.current; pendingSectionsRef.current = null;
        return await executeSave(nextSections, nextRev, 0, forceOverwrite, true);
      }
      isSavingRef.current = false; setSaveStatus("saved"); setHasUnsavedChanges(false); setLastSaveError(null); clearLocalBackup();
      const confirmed = confirmedServerRevisionRef.current ?? 1; notifyWaiters(confirmed); return confirmed;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Échec de la sauvegarde du brouillon";
      const errStatus = typeof (err as ApiError)?.status === "number" ? (err as ApiError).status : undefined;
      if (msg.includes("CONFLICT_NEWER_VERSION") || msg.includes("Conflit de version")) {
        isSavingRef.current = false; setSaveStatus("conflict"); setLastSaveError(msg); setRetryCount(0); clearAllTimers();
        onConflictCallback?.(confirmedServerRevisionRef.current);
        toast.error("Conflit de version : votre boutique a été modifiée sur un autre écran."); notifyWaiters(null); return null;
      }
      if (errStatus === 400 || errStatus === 401 || errStatus === 403 || errStatus === 404 || errStatus === 422 || msg.includes("401") || msg.includes("403") || msg.includes("Non autorisé") || msg.includes("Violation d'accès")) {
        isSavingRef.current = false; setSaveStatus("error"); setLastSaveError(msg); setRetryCount(0); clearAllTimers();
        toast.error(msg); notifyWaiters(null); return null;
      }
      if (pendingSectionsRef.current && latestRequestedRevisionRef.current > targetRevision) {
        const nextSections = pendingSectionsRef.current; const nextRev = latestRequestedRevisionRef.current; pendingSectionsRef.current = null;
        return await executeSave(nextSections, nextRev, 0, forceOverwrite, true);
      }
      if (currentRetry < maxRetries) {
        const nextRetry = currentRetry + 1; setSaveStatus("retrying"); setRetryCount(nextRetry);
        await new Promise<void>((resolve) => { retryTimerRef.current = setTimeout(resolve, nextRetry * retryDelayBaseMs); });
        retryTimerRef.current = null;
        return await executeSave(targetSections, targetRevision, nextRetry, forceOverwrite, true);
      }
      isSavingRef.current = false; setSaveStatus("error"); setLastSaveError(msg); setRetryCount(0); toast.error(msg); notifyWaiters(null); return null;
    }
  }, [clearAllTimers, clearLocalBackup, maxRetries, notifyWaiters, onConflictCallback, retryDelayBaseMs]);

  const saveDraft = useCallback(async (sectionsToSave: CustomPageSection[], forceOverwrite = false): Promise<number | null> => {
    latestRequestedRevisionRef.current += 1;
    const targetRevision = latestRequestedRevisionRef.current;
    if (localBackupTimerRef.current) { clearTimeout(localBackupTimerRef.current); localBackupTimerRef.current = null; }
    pendingBackupRef.current = null;
    writeLocalStudioBackup(backupKey, sectionsToSave, targetRevision);
    if (autoSaveTimerRef.current) { clearTimeout(autoSaveTimerRef.current); autoSaveTimerRef.current = null; }
    return await executeSave(sectionsToSave, targetRevision, 0, forceOverwrite);
  }, [backupKey, executeSave]);

  const triggerAutoSave = useCallback((updatedSections: CustomPageSection[]) => {
    if (!pendingSectionsRef.current && lastSavedSectionsRef.current && areStudioValuesEqual(updatedSections, lastSavedSectionsRef.current) && !isSavingRef.current) {
      setSaveStatus("saved"); setHasUnsavedChanges(false); return;
    }
    latestRequestedRevisionRef.current += 1;
    const thisRevision = latestRequestedRevisionRef.current;
    pendingSectionsRef.current = updatedSections;
    setHasUnsavedChanges(true);
    pendingBackupRef.current = { sections: updatedSections, rev: thisRevision };
    if (localBackupTimerRef.current) clearTimeout(localBackupTimerRef.current);
    localBackupTimerRef.current = setTimeout(() => flushPendingLocalBackup(), LOCAL_BACKUP_DEBOUNCE_MS);
    if (!isSavingRef.current) setSaveStatus(typeof navigator !== "undefined" && navigator.onLine === false ? "offline" : "unsaved");
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      if (pendingSectionsRef.current) {
        const toSave = pendingSectionsRef.current; pendingSectionsRef.current = null;
        if (lastSavedSectionsRef.current && areStudioValuesEqual(toSave, lastSavedSectionsRef.current) && !isSavingRef.current) {
          setSaveStatus("saved"); setHasUnsavedChanges(false); return;
        }
        void executeSave(toSave, thisRevision);
      }
    }, debounceMs);
  }, [debounceMs, executeSave, flushPendingLocalBackup]);

  useEffect(() => {
    const handleOnline = () => {
      if (pendingSectionsRef.current) {
        const toSave = pendingSectionsRef.current; pendingSectionsRef.current = null;
        void executeSave(toSave, latestRequestedRevisionRef.current);
      } else setSaveStatus((prev) => (prev === "offline" ? "idle" : prev));
    };
    const handleOffline = () => setSaveStatus("offline");
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      flushPendingLocalBackup();
      if (hasUnsavedChangesRef.current || isSavingRef.current) { e.preventDefault(); e.returnValue = ""; }
    };
    const handlePageHide = () => flushPendingLocalBackup();
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("online", handleOnline); window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeunload", handleBeforeUnload); window.removeEventListener("pagehide", handlePageHide);
    };
  }, [executeSave, flushPendingLocalBackup]);

  useEffect(() => () => clearAllTimers(), [clearAllTimers]);

  return {
    saveStatus, setSaveStatus, hasUnsavedChanges: hasUnsavedChanges || isSavingRef.current,
    setHasUnsavedChanges, saveDraft, triggerAutoSave, syncServerDraftRevision, retryCount, lastSaveError,
    recoverableBackup, checkRecoverableBackup, clearLocalBackup, dismissRecoveryBanner, readLocalBackup,
    currentRevision: latestRequestedRevisionRef.current, lastSavedRevision: lastSavedRevisionRef.current,
    confirmedServerRevision: confirmedServerRevisionRef.current,
  };
}

