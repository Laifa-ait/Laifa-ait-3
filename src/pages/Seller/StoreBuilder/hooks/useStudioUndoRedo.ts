import { useState, useCallback, useEffect, useRef } from "react";
import { CustomPageSection, CustomPageTheme } from "../../../../domains/seller/customPage.types";
import {
  areStudioValuesEqual,
  fastDeepClone,
  loadStudioSessionHistory,
  saveStudioSessionHistory,
  StudioSessionSnapshot,
} from "./studioBackupStorage";

const MAX_HISTORY_STEPS = 20;
const COALESCE_WINDOW_MS = 500;
const SESSION_SAVE_DEBOUNCE_MS = 650;
const STRUCTURAL_ACTION_PREFIXES = [
  "Ajout", "Suppression", "Duplication", "Réorganisation", "Application", "Restauration", "Visibilité", "Publication",
];

export type StudioHistorySnapshot = StudioSessionSnapshot;

export interface StudioUndoRedoOptions {
  storageKey?: string;
  initialTheme?: CustomPageTheme;
  onThemeChange?: (newTheme: CustomPageTheme) => void;
}

function isStructuralBoundary(actionLabel: string, prevSections: CustomPageSection[], nextSections: CustomPageSection[]): boolean {
  if (prevSections.length !== nextSections.length) return true;
  for (let i = 0; i < prevSections.length; i++) {
    if (prevSections[i]?.id !== nextSections[i]?.id || prevSections[i]?.type !== nextSections[i]?.type) return true;
  }
  return STRUCTURAL_ACTION_PREFIXES.some((prefix) => actionLabel.startsWith(prefix));
}

export function useStudioUndoRedo(
  initialSections: CustomPageSection[],
  onSectionsChange: (newSections: CustomPageSection[]) => void,
  options?: StudioUndoRedoOptions
) {
  const storageKey = options?.storageKey;
  const onThemeChange = options?.onThemeChange;

  const [past, setPast] = useState<StudioHistorySnapshot[]>(() => loadStudioSessionHistory(storageKey, MAX_HISTORY_STEPS)?.past ?? []);
  const [present, setPresent] = useState<StudioHistorySnapshot>(() => {
    const cached = loadStudioSessionHistory(storageKey, MAX_HISTORY_STEPS);
    if (cached?.present && cached.present.sections.length > 0) return cached.present;
    return {
      sections: fastDeepClone(initialSections),
      theme: options?.initialTheme ? fastDeepClone(options.initialTheme) : undefined,
      actionLabel: "Initialisation",
      timestamp: Date.now(),
    };
  });
  const [future, setFuture] = useState<StudioHistorySnapshot[]>(() => loadStudioSessionHistory(storageKey, MAX_HISTORY_STEPS)?.future ?? []);

  const presentRef = useRef<StudioHistorySnapshot>(present);
  const latestHistoryRef = useRef({ storageKey, past, present, future, dirty: false });
  const sessionSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRenderRef = useRef(true);

  useEffect(() => { presentRef.current = present; }, [present]);
  useEffect(() => {
    latestHistoryRef.current = { storageKey, past, present, future, dirty: latestHistoryRef.current.dirty };
  }, [storageKey, past, present, future]);

  const flushSessionHistory = useCallback(() => {
    if (sessionSaveTimerRef.current) {
      clearTimeout(sessionSaveTimerRef.current);
      sessionSaveTimerRef.current = null;
    }
    if (!latestHistoryRef.current.dirty) return;
    const { storageKey: key, past: p, present: cur, future: f } = latestHistoryRef.current;
    latestHistoryRef.current.dirty = false;
    saveStudioSessionHistory(key, p, cur, f);
  }, []);

  useEffect(() => {
    if (!storageKey) return;
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    latestHistoryRef.current = { storageKey, past, present, future, dirty: true };
    if (sessionSaveTimerRef.current) clearTimeout(sessionSaveTimerRef.current);
    sessionSaveTimerRef.current = setTimeout(() => {
      sessionSaveTimerRef.current = null;
      flushSessionHistory();
    }, SESSION_SAVE_DEBOUNCE_MS);
  }, [storageKey, past, present, future, flushSessionHistory]);

  useEffect(() => {
    const onUnload = () => flushSessionHistory();
    window.addEventListener("pagehide", onUnload);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("pagehide", onUnload);
      window.removeEventListener("beforeunload", onUnload);
      flushSessionHistory();
    };
  }, [flushSessionHistory]);

  const lastPushTimeRef = useRef<number>(0);
  const lastActionLabelRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (initialSections.length > 0 && present.sections.length === 0 && past.length === 0) {
      const nextSnap: StudioHistorySnapshot = {
        sections: fastDeepClone(initialSections),
        theme: options?.initialTheme ? fastDeepClone(options.initialTheme) : presentRef.current.theme,
        actionLabel: "Chargement de la vitrine",
        timestamp: Date.now(),
      };
      presentRef.current = nextSnap;
      setPresent(nextSnap);
    }
  }, [initialSections, options?.initialTheme, present.sections.length, past.length]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const pushState = useCallback(
    (newSections: CustomPageSection[], nextTheme?: CustomPageTheme, actionLabel = "Modification") => {
      const currentPresent = presentRef.current;
      const resolvedTheme = nextTheme !== undefined ? nextTheme : currentPresent.theme;

      const sectionsChanged = !areStudioValuesEqual(currentPresent.sections, newSections);
      const themeChanged = !areStudioValuesEqual(currentPresent.theme, resolvedTheme);
      if (!sectionsChanged && !themeChanged) return;

      const now = Date.now();
      const nextSnap: StudioHistorySnapshot = {
        sections: fastDeepClone(newSections),
        theme: resolvedTheme ? fastDeepClone(resolvedTheme) : undefined,
        actionLabel,
        timestamp: now,
      };

      const structural = isStructuralBoundary(actionLabel, currentPresent.sections, nextSnap.sections);
      const isRapidCoalesce = !structural && now - lastPushTimeRef.current < COALESCE_WINDOW_MS && lastActionLabelRef.current === actionLabel;

      lastPushTimeRef.current = now;
      lastActionLabelRef.current = actionLabel;
      presentRef.current = nextSnap;
      setPresent(nextSnap);

      if (!isRapidCoalesce) {
        setPast((currentPast) => [...currentPast, currentPresent].slice(-MAX_HISTORY_STEPS));
      }
      setFuture([]);
      if (sectionsChanged) onSectionsChange(nextSnap.sections);
    },
    [onSectionsChange]
  );

  const pushThemeState = useCallback(
    (newTheme: CustomPageTheme, actionLabel = "Thème & Couleurs") => {
      pushState(presentRef.current.sections, newTheme, actionLabel);
    },
    [pushState]
  );

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const currentPresent = presentRef.current;
    const sectionsDiff = !areStudioValuesEqual(currentPresent.sections, previous.sections);
    const themeDiff = !areStudioValuesEqual(currentPresent.theme, previous.theme);

    presentRef.current = previous;
    setPast(past.slice(0, past.length - 1));
    setFuture((prevFuture) => [currentPresent, ...prevFuture].slice(0, MAX_HISTORY_STEPS));
    setPresent(previous);

    if (sectionsDiff) onSectionsChange(previous.sections);
    if (themeDiff && previous.theme && onThemeChange) onThemeChange(fastDeepClone(previous.theme));
  }, [past, onSectionsChange, onThemeChange]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const currentPresent = presentRef.current;
    const sectionsDiff = !areStudioValuesEqual(currentPresent.sections, next.sections);
    const themeDiff = !areStudioValuesEqual(currentPresent.theme, next.theme);

    presentRef.current = next;
    setPast((prevPast) => [...prevPast, currentPresent].slice(-MAX_HISTORY_STEPS));
    setPresent(next);
    setFuture(future.slice(1));

    if (sectionsDiff) onSectionsChange(next.sections);
    if (themeDiff && next.theme && onThemeChange) onThemeChange(fastDeepClone(next.theme));
  }, [future, onSectionsChange, onThemeChange]);

  const resetHistory = useCallback((s: CustomPageSection[], theme?: CustomPageTheme, label = "Restauration") => {
    if (sessionSaveTimerRef.current) { clearTimeout(sessionSaveTimerRef.current); sessionSaveTimerRef.current = null; }
    latestHistoryRef.current.dirty = false;
    const nextSnap: StudioHistorySnapshot = {
      sections: fastDeepClone(s),
      theme: theme ? fastDeepClone(theme) : presentRef.current.theme,
      actionLabel: label,
      timestamp: Date.now(),
    };
    presentRef.current = nextSnap;
    lastPushTimeRef.current = 0;
    lastActionLabelRef.current = undefined;
    setPast([]);
    setFuture([]);
    setPresent(nextSnap);
    saveStudioSessionHistory(storageKey, [], nextSnap, []);
  }, [storageKey]);

  const setSectionsDirectly = useCallback((s: CustomPageSection[], theme?: CustomPageTheme, preserveHistory = false) => {
    const nextSnap: StudioHistorySnapshot = {
      sections: fastDeepClone(s),
      theme: theme ? fastDeepClone(theme) : presentRef.current.theme,
      actionLabel: "Synchronisation",
      timestamp: Date.now(),
    };
    presentRef.current = nextSnap;
    lastPushTimeRef.current = 0;
    lastActionLabelRef.current = undefined;
    if (!preserveHistory) {
      if (sessionSaveTimerRef.current) { clearTimeout(sessionSaveTimerRef.current); sessionSaveTimerRef.current = null; }
      latestHistoryRef.current.dirty = false;
      setPast([]);
      setFuture([]);
      saveStudioSessionHistory(storageKey, [], nextSnap, []);
    }
    setPresent(nextSnap);
  }, [storageKey]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.key.toLowerCase() === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      else if (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey)) { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return {
    sections: present.sections, theme: present.theme, currentActionLabel: present.actionLabel,
    setSectionsDirectly, resetHistory, pushState, pushThemeState, undo, redo, canUndo, canRedo,
    historyDepth: past.length, futureDepth: future.length,
  };
}

