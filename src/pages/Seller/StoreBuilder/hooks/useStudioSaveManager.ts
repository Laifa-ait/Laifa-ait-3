import { useState, useEffect, useRef, useCallback } from "react";
import { apiPut } from "../../../../lib/api";
import {
  CustomPageSection,
  StoreLayoutVersion,
} from "../../../../domains/seller/customPage.types";
import { toast } from "react-hot-toast";

export type SaveStatus = "idle" | "saving" | "saved" | "error" | "conflict";

export interface StudioSaveManagerOptions {
  debounceMs?: number;
  maxRetries?: number;
  onConflict?: (serverRev?: number) => void;
}

export function useStudioSaveManager(options?: StudioSaveManagerOptions) {
  const debounceMs = options?.debounceMs ?? 1500;
  const maxRetries = options?.maxRetries ?? 3;
  const onConflictCallback = options?.onConflict;

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Compteurs atomiques de révision
  const latestRequestedRevisionRef = useRef(0);
  const inFlightRevisionRef = useRef<number | null>(null);
  const confirmedServerRevisionRef = useRef<number | undefined>(undefined);
  const lastSavedHashRef = useRef("");

  // Tampon de sections en attente (FIFO dernière version souhaitée)
  const pendingSectionsRef = useRef<CustomPageSection[] | null>(null);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

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
      retryCount = 0,
      forceOverwrite = false
    ): Promise<void> => {
      if (isSavingRef.current) {
        // Enregistrement déjà en vol : conserver ce snapshot comme le plus récent en attente
        pendingSectionsRef.current = targetSections;
        return;
      }

      isSavingRef.current = true;
      inFlightRevisionRef.current = targetRevision;
      setSaveStatus("saving");

      const sanitizedSections = targetSections.map((sec, idx) => ({
        id: sec.id || `sec_${idx}`,
        type: sec.type,
        title: typeof sec.title === "string" ? sec.title : undefined,
        settings: sec.settings && typeof sec.settings === "object" ? sec.settings : {},
        styles: sec.styles && typeof sec.styles === "object" ? sec.styles : {},
        isVisible: typeof sec.isVisible === "boolean" ? sec.isVisible : true,
        order:
          typeof sec.order === "number" && Number.isFinite(sec.order)
            ? Math.max(0, Math.round(sec.order))
            : idx,
      }));

      const payload: {
        sections: typeof sanitizedSections;
        expectedRevision?: number;
        forceOverwrite?: boolean;
      } = {
        sections: sanitizedSections,
        ...(typeof confirmedServerRevisionRef.current === "number"
          ? { expectedRevision: confirmedServerRevisionRef.current }
          : {}),
        ...(forceOverwrite ? { forceOverwrite: true } : {}),
      };

      try {
        const res = await apiPut<{ success?: boolean; data?: StoreLayoutVersion }>(
          "/api/v1/seller/studio/layout/draft",
          payload
        );

        if (res?.data && typeof res.data.draftRevision === "number") {
          confirmedServerRevisionRef.current = res.data.draftRevision;
        } else if (typeof confirmedServerRevisionRef.current === "number") {
          confirmedServerRevisionRef.current += 1;
        }

        lastSavedHashRef.current = JSON.stringify(targetSections);
        isSavingRef.current = false;
        inFlightRevisionRef.current = null;

        // Si une révision plus récente a été demandée pendant la requête, l'exécuter immédiatement
        if (
          pendingSectionsRef.current &&
          latestRequestedRevisionRef.current > targetRevision
        ) {
          const nextSections = pendingSectionsRef.current;
          const nextRev = latestRequestedRevisionRef.current;
          pendingSectionsRef.current = null;
          void executeSave(nextSections, nextRev, 0, forceOverwrite);
        } else {
          setSaveStatus("saved");
          setHasUnsavedChanges(false);
        }
      } catch (err: unknown) {
        isSavingRef.current = false;
        inFlightRevisionRef.current = null;

        const msg =
          err instanceof Error
            ? err.message
            : "Échec de la sauvegarde du brouillon";

        // Détection de conflit de révision multi-appareils
        if (msg.includes("CONFLICT_NEWER_VERSION") || msg.includes("Conflit de version")) {
          setSaveStatus("conflict");
          clearAllTimers();
          onConflictCallback?.(confirmedServerRevisionRef.current);
          toast.error(
            "Conflit de version : votre boutique a été modifiée sur un autre écran. Rechargez ou confirmez votre écrasement."
          );
          return;
        }

        // Si l'utilisateur a déjà demandé une révision plus récente, tenter directement celle-ci
        if (
          pendingSectionsRef.current &&
          latestRequestedRevisionRef.current > targetRevision
        ) {
          const nextSections = pendingSectionsRef.current;
          const nextRev = latestRequestedRevisionRef.current;
          pendingSectionsRef.current = null;
          void executeSave(nextSections, nextRev, 0, forceOverwrite);
          return;
        }

        // Politique de réessais exponentiels (1s, 2s, 3s)
        if (retryCount < maxRetries) {
          retryTimerRef.current = setTimeout(() => {
            void executeSave(targetSections, targetRevision, retryCount + 1, forceOverwrite);
          }, (retryCount + 1) * 1000);
          return;
        }

        setSaveStatus("error");
        toast.error(msg);
      }
    },
    [clearAllTimers, maxRetries, onConflictCallback]
  );

  const saveDraft = useCallback(
    async (
      sectionsToSave: CustomPageSection[],
      forceOverwrite = false
    ): Promise<void> => {
      latestRequestedRevisionRef.current += 1;
      const targetRevision = latestRequestedRevisionRef.current;
      clearAllTimers();
      await executeSave(sectionsToSave, targetRevision, 0, forceOverwrite);
    },
    [clearAllTimers, executeSave]
  );

  const triggerAutoSave = useCallback(
    (updatedSections: CustomPageSection[]) => {
      const newHash = JSON.stringify(updatedSections);
      if (newHash === lastSavedHashRef.current) {
        setSaveStatus("saved");
        setHasUnsavedChanges(false);
        return;
      }

      latestRequestedRevisionRef.current += 1;
      const thisRevision = latestRequestedRevisionRef.current;
      pendingSectionsRef.current = updatedSections;
      setHasUnsavedChanges(true);

      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

      autoSaveTimerRef.current = setTimeout(() => {
        if (pendingSectionsRef.current) {
          const toSave = pendingSectionsRef.current;
          pendingSectionsRef.current = null;
          void executeSave(toSave, thisRevision);
        }
      }, debounceMs);
    },
    [debounceMs, executeSave]
  );

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges || isSavingRef.current) {
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
    hasUnsavedChanges: hasUnsavedChanges || isSavingRef.current,
    setHasUnsavedChanges,
    saveDraft,
    triggerAutoSave,
    syncServerDraftRevision,
    currentRevision: latestRequestedRevisionRef.current,
    confirmedServerRevision: confirmedServerRevisionRef.current,
  };
}
