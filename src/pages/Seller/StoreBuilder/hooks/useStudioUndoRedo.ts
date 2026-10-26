import { useState, useCallback, useEffect, useRef } from "react";
import { CustomPageSection } from "../../../../domains/seller/customPage.types";

const MAX_HISTORY_STEPS = 30;

function deepCloneSections(sections: CustomPageSection[]): CustomPageSection[] {
  return JSON.parse(JSON.stringify(sections)) as CustomPageSection[];
}

export function useStudioUndoRedo(
  initialSections: CustomPageSection[],
  onSectionsChange: (newSections: CustomPageSection[]) => void
) {
  const [past, setPast] = useState<CustomPageSection[][]>([]);
  const [present, setPresent] = useState<CustomPageSection[]>(() => deepCloneSections(initialSections));
  const [future, setFuture] = useState<CustomPageSection[][]>([]);

  const lastPushTimeRef = useRef<number>(0);

  useEffect(() => {
    if (initialSections.length > 0 && present.length === 0 && past.length === 0) {
      setPresent(deepCloneSections(initialSections));
    }
  }, [initialSections, present.length, past.length]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const pushState = useCallback((newSections: CustomPageSection[]) => {
    setPresent((currentPresent) => {
      const currentJSON = JSON.stringify(currentPresent);
      const nextJSON = JSON.stringify(newSections);

      if (currentJSON === nextJSON) return currentPresent;

      const now = Date.now();
      const isFastTyping = now - lastPushTimeRef.current < 400;
      lastPushTimeRef.current = now;

      const clonedCurrent = deepCloneSections(currentPresent);
      const clonedNext = deepCloneSections(newSections);

      if (!isFastTyping) {
        setPast((currentPast) => {
          const updatedPast = [...currentPast, clonedCurrent];
          return updatedPast.slice(-MAX_HISTORY_STEPS);
        });
      }

      setFuture([]);
      onSectionsChange(clonedNext);
      return clonedNext;
    });
  }, [onSectionsChange]);

  const undo = useCallback(() => {
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    const clonedPresent = deepCloneSections(present);

    setPast(newPast);
    setFuture([clonedPresent, ...future].slice(0, MAX_HISTORY_STEPS));
    setPresent(deepCloneSections(previous));

    onSectionsChange(deepCloneSections(previous));
  }, [past, present, future, onSectionsChange]);

  const redo = useCallback(() => {
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);
    const clonedPresent = deepCloneSections(present);

    setPast([...past, clonedPresent].slice(-MAX_HISTORY_STEPS));
    setPresent(deepCloneSections(next));
    setFuture(newFuture);

    onSectionsChange(deepCloneSections(next));
  }, [past, present, future, onSectionsChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;

      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

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

  const setSectionsDirectly = useCallback((s: CustomPageSection[]) => {
    setPresent(deepCloneSections(s));
  }, []);

  return {
    sections: present,
    setSectionsDirectly,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    historyDepth: past.length,
  };
}
