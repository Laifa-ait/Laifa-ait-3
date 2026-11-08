import { useState, useCallback, useEffect, useRef } from "react";
import {
  CustomPageSection,
  CustomPageTheme,
} from "../../../../domains/seller/customPage.types";

const MAX_HISTORY_STEPS = 40;

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

function loadSessionHistory(storageKey?: string): {
  past: StudioHistorySnapshot[];
  present: StudioHistorySnapshot | null;
  future: StudioHistorySnapshot[];
} | null {
  if (!storageKey || typeof window === "undefined" || !window.sessionStorage) return null;
  try {
    const raw = window.sessionStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      past?: StudioHistorySnapshot[];
      present?: StudioHistorySnapshot;
      future?: StudioHistorySnapshot[];
    };
    if (!parsed?.present || !Array.isArray(parsed.present.sections)) return null;
    return {
      past: Array.isArray(parsed.past) ? parsed.past.slice(-MAX_HISTORY_STEPS) : [],
      present: parsed.present,
      future: Array.isArray(parsed.future) ? parsed.future.slice(0, MAX_HISTORY_STEPS) : [],
    };
  } catch {
    return null;
  }
}

function saveSessionHistory(
  storageKey: string | undefined,
  past: StudioHistorySnapshot[],
  present: StudioHistorySnapshot,
  future: StudioHistorySnapshot[]
): void {
  if (!storageKey || typeof window === "undefined" || !window.sessionStorage) return;
  try {
    window.sessionStorage.setItem(
      storageKey,
      JSON.stringify({ past: past.slice(-20), present, future: future.slice(0, 20) })
    );
  } catch {
    // Quota safety
  }
}

export function useStudioUndoRedo(
  initialSections: CustomPageSection[],
  onSectionsChange: (newSections: CustomPageSection[]) => void,
  options?: StudioUndoRedoOptions
) {
  const storageKey = options?.storageKey;
  const onThemeChange = options?.onThemeChange;

  const [past, setPast] = useState<StudioHistorySnapshot[]>(() => {
    const cached = loadSessionHistory(storageKey);
    return cached ? cached.past : [];
  });

  const [present, setPresent] = useState<StudioHistorySnapshot>(() => {
    const cached = loadSessionHistory(storageKey);
    if (cached?.present && cached.present.sections.length > 0) {
      return cached.present;
    }
    return {
      sections: deepClone(initialSections),
      theme: options?.initialTheme ? deepClone(options.initialTheme) : undefined,
      actionLabel: "Initialisation",
      timestamp: Date.now(),
    };
  });

  const [future, setFuture] = useState<StudioHistorySnapshot[]>(() => {
    const cached = loadSessionHistory(storageKey);
    return cached ? cached.future : [];
  });

  const presentRef = useRef<StudioHistorySnapshot>(present);
  useEffect(() => {
    presentRef.current = present;
  }, [present]);

  useEffect(() => {
    saveSessionHistory(storageKey, past, present, future);
  }, [storageKey, past, present, future]);

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

      if (
        JSON.stringify(currentPresent.sections) === JSON.stringify(nextSnap.sections) &&
        JSON.stringify(currentPresent.theme) === JSON.stringify(nextSnap.theme)
      ) {
        return;
      }

      // Regroupement adaptatif des frappes rapides (< 500ms sur même type d'action)
      const isRapidSuccession =
        now - lastPushTimeRef.current < 500 && lastActionLabelRef.current === actionLabel;
      lastPushTimeRef.current = now;
      lastActionLabelRef.current = actionLabel;

      const clonedCurrent = deepClone(currentPresent);
      presentRef.current = nextSnap;
      setPresent(nextSnap);

      if (!isRapidSuccession) {
        setPast((currentPast) => [...currentPast, clonedCurrent].slice(-MAX_HISTORY_STEPS));
      }

      setFuture([]);
      onSectionsChange(deepClone(nextSnap.sections));
      if (nextTheme && onThemeChange) onThemeChange(deepClone(nextTheme));
    },
    [onSectionsChange, onThemeChange]
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

    presentRef.current = clonedPrev;
    setPast(newPast);
    setFuture((prevFuture) => [clonedPresent, ...prevFuture].slice(0, MAX_HISTORY_STEPS));
    setPresent(clonedPrev);

    onSectionsChange(deepClone(clonedPrev.sections));
    if (clonedPrev.theme && onThemeChange) onThemeChange(deepClone(clonedPrev.theme));
  }, [past, onSectionsChange, onThemeChange]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    const clonedPresent = deepClone(presentRef.current);
    const clonedNext = deepClone(next);

    presentRef.current = clonedNext;
    setPast((prevPast) => [...prevPast, clonedPresent].slice(-MAX_HISTORY_STEPS));
    setPresent(clonedNext);
    setFuture(newFuture);

    onSectionsChange(deepClone(clonedNext.sections));
    if (clonedNext.theme && onThemeChange) onThemeChange(deepClone(clonedNext.theme));
  }, [future, onSectionsChange, onThemeChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (isInputFocused) return;

      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const setSectionsDirectly = useCallback((s: CustomPageSection[], theme?: CustomPageTheme) => {
    const nextSnap: StudioHistorySnapshot = {
      sections: deepClone(s),
      theme: theme ? deepClone(theme) : presentRef.current.theme,
      actionLabel: "Synchronisation",
      timestamp: Date.now(),
    };
    presentRef.current = nextSnap;
    setPresent(nextSnap);
  }, []);

  return {
    sections: present.sections,
    theme: present.theme,
    currentActionLabel: present.actionLabel,
    setSectionsDirectly,
    pushState,
    pushThemeState,
    undo,
    redo,
    canUndo,
    canRedo,
    historyDepth: past.length,
    futureDepth: future.length,
  };
}
