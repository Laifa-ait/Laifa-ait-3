import { useState, useCallback, useEffect, useRef } from "react";
import { CustomPageSection, CustomPageTheme } from "../../../../domains/seller/customPage.types";

const MAX_HISTORY_STEPS = 40;
const COALESCE_WINDOW_MS = 500;
const STRUCTURAL_ACTION_PREFIXES = [
  "Ajout", "Suppression", "Duplication", "Réorganisation", "Application", "Restauration", "Visibilité", "Publication",
];

export interface StudioHistorySnapshot {
  sections: CustomPageSection[];
  theme?: CustomPageTheme;
  actionLabel?: string;
  timestamp: number;
}

export interface StudioUndoRedoOptions {
  storageKey?: string;
  initialTheme?: CustomPageTheme;
  onThemeChange?: (newTheme: CustomPageTheme) => void;
}

function deepClone<T>(val: T): T {
  return JSON.parse(JSON.stringify(val)) as T;
}

function isStructuralBoundary(actionLabel: string, prevSections: CustomPageSection[], nextSections: CustomPageSection[]): boolean {
  if (prevSections.length !== nextSections.length) return true;
  for (let i = 0; i < prevSections.length; i++) {
    if (prevSections[i]?.id !== nextSections[i]?.id || prevSections[i]?.type !== nextSections[i]?.type) return true;
  }
  return STRUCTURAL_ACTION_PREFIXES.some((prefix) => actionLabel.startsWith(prefix));
}

function loadSessionHistory(storageKey?: string): {
  past: StudioHistorySnapshot[];
  present: StudioHistorySnapshot | null;
  future: StudioHistorySnapshot[];
} | null {
  if (!storageKey || typeof window === "undefined" || !window.sessionStorage) return null;
  try {
    const raw = window.sessionStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { past?: StudioHistorySnapshot[]; present?: StudioHistorySnapshot; future?: StudioHistorySnapshot[] };
    if (!parsed?.present || !Array.isArray(parsed.present.sections)) return null;
    return {
      past: Array.isArray(parsed.past) ? parsed.past.slice(-MAX_HISTORY_STEPS) : [],
      present: parsed.present,
      future: Array.isArray(parsed.future) ? parsed.future.slice(0, MAX_HISTORY_STEPS) : [],
    };
  } catch { return null; }
}

function saveSessionHistory(storageKey: string | undefined, past: StudioHistorySnapshot[], present: StudioHistorySnapshot, future: StudioHistorySnapshot[]): void {
  if (!storageKey || typeof window === "undefined" || !window.sessionStorage) return;
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify({ past: past.slice(-20), present, future: future.slice(0, 20) }));
  } catch { /* Quota safety */ }
}

export function useStudioUndoRedo(
  initialSections: CustomPageSection[],
  onSectionsChange: (newSections: CustomPageSection[]) => void,
  options?: StudioUndoRedoOptions
) {
  const storageKey = options?.storageKey;
  const onThemeChange = options?.onThemeChange;

  const [past, setPast] = useState<StudioHistorySnapshot[]>(() => loadSessionHistory(storageKey)?.past ?? []);
  const [present, setPresent] = useState<StudioHistorySnapshot>(() => {
    const cached = loadSessionHistory(storageKey);
    if (cached?.present && cached.present.sections.length > 0) return cached.present;
    return {
      sections: deepClone(initialSections),
      theme: options?.initialTheme ? deepClone(options.initialTheme) : undefined,
      actionLabel: "Initialisation",
      timestamp: Date.now(),
    };
  });
  const [future, setFuture] = useState<StudioHistorySnapshot[]>(() => loadSessionHistory(storageKey)?.future ?? []);

  const presentRef = useRef<StudioHistorySnapshot>(present);
  useEffect(() => { presentRef.current = present; }, [present]);
  useEffect(() => { saveSessionHistory(storageKey, past, present, future); }, [storageKey, past, present, future]);

  const lastPushTimeRef = useRef<number>(0);
  const lastActionLabelRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (initialSections.length > 0 && present.sections.length === 0 && past.length === 0) {
      const nextSnap: StudioHistorySnapshot = {
        sections: deepClone(initialSections),
        theme: options?.initialTheme ? deepClone(options.initialTheme) : presentRef.current.theme,
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
      const now = Date.now();

      const nextSnap: StudioHistorySnapshot = {
        sections: deepClone(newSections),
        theme: resolvedTheme ? deepClone(resolvedTheme) : undefined,
        actionLabel,
        timestamp: now,
      };

      const sectionsChanged = JSON.stringify(currentPresent.sections) !== JSON.stringify(nextSnap.sections);
      const themeChanged = JSON.stringify(currentPresent.theme) !== JSON.stringify(nextSnap.theme);
      if (!sectionsChanged && !themeChanged) return;

      const structural = isStructuralBoundary(actionLabel, currentPresent.sections, nextSnap.sections);
      const isRapidCoalesce = !structural && now - lastPushTimeRef.current < COALESCE_WINDOW_MS && lastActionLabelRef.current === actionLabel;

      lastPushTimeRef.current = now;
      lastActionLabelRef.current = actionLabel;

      const clonedCurrent = deepClone(currentPresent);
      presentRef.current = nextSnap;
      setPresent(nextSnap);

      if (!isRapidCoalesce) {
        setPast((currentPast) => [...currentPast, clonedCurrent].slice(-MAX_HISTORY_STEPS));
      }
      setFuture([]);
      if (sectionsChanged) onSectionsChange(deepClone(nextSnap.sections));
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
    const newPast = past.slice(0, past.length - 1);
    const clonedPresent = deepClone(presentRef.current);
    const clonedPrev = deepClone(previous);

    const sectionsDiff = JSON.stringify(clonedPresent.sections) !== JSON.stringify(clonedPrev.sections);
    const themeDiff = JSON.stringify(clonedPresent.theme) !== JSON.stringify(clonedPrev.theme);

    presentRef.current = clonedPrev;
    setPast(newPast);
    setFuture((prevFuture) => [clonedPresent, ...prevFuture].slice(0, MAX_HISTORY_STEPS));
    setPresent(clonedPrev);

    if (sectionsDiff) onSectionsChange(deepClone(clonedPrev.sections));
    if (themeDiff && clonedPrev.theme && onThemeChange) onThemeChange(deepClone(clonedPrev.theme));
  }, [past, onSectionsChange, onThemeChange]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    const clonedPresent = deepClone(presentRef.current);
    const clonedNext = deepClone(next);

    const sectionsDiff = JSON.stringify(clonedPresent.sections) !== JSON.stringify(clonedNext.sections);
    const themeDiff = JSON.stringify(clonedPresent.theme) !== JSON.stringify(clonedNext.theme);

    presentRef.current = clonedNext;
    setPast((prevPast) => [...prevPast, clonedPresent].slice(-MAX_HISTORY_STEPS));
    setPresent(clonedNext);
    setFuture(newFuture);

    if (sectionsDiff) onSectionsChange(deepClone(clonedNext.sections));
    if (themeDiff && clonedNext.theme && onThemeChange) onThemeChange(deepClone(clonedNext.theme));
  }, [future, onSectionsChange, onThemeChange]);

  const resetHistory = useCallback((s: CustomPageSection[], theme?: CustomPageTheme, label = "Restauration") => {
    const nextSnap: StudioHistorySnapshot = {
      sections: deepClone(s),
      theme: theme ? deepClone(theme) : presentRef.current.theme,
      actionLabel: label,
      timestamp: Date.now(),
    };
    presentRef.current = nextSnap;
    lastPushTimeRef.current = 0;
    lastActionLabelRef.current = undefined;
    setPast([]);
    setFuture([]);
    setPresent(nextSnap);
    saveSessionHistory(storageKey, [], nextSnap, []);
  }, [storageKey]);

  const setSectionsDirectly = useCallback((s: CustomPageSection[], theme?: CustomPageTheme, preserveHistory = false) => {
    const nextSnap: StudioHistorySnapshot = {
      sections: deepClone(s),
      theme: theme ? deepClone(theme) : presentRef.current.theme,
      actionLabel: "Synchronisation",
      timestamp: Date.now(),
    };
    presentRef.current = nextSnap;
    lastPushTimeRef.current = 0;
    lastActionLabelRef.current = undefined;
    if (!preserveHistory) {
      setPast([]);
      setFuture([]);
      saveSessionHistory(storageKey, [], nextSnap, []);
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
