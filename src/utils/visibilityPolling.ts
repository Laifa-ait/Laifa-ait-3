/**
 * Starts a visibility-aware polling interval that automatically pauses
 * whenever the browser tab is hidden (`document.hidden === true`) and
 * triggers a catch-up refresh when the user returns to the tab.
 */
export function startVisibilityAwarePolling(
  callback: () => void | Promise<void>,
  intervalMs: number
): () => void {
  let lastRunAt = Date.now();

  const runIfVisible = () => {
    if (typeof document !== "undefined" && document.hidden) {
      return;
    }
    lastRunAt = Date.now();
    void callback();
  };

  const timer = setInterval(runIfVisible, intervalMs);

  const handleVisibilityChange = () => {
    if (typeof document !== "undefined" && !document.hidden) {
      if (Date.now() - lastRunAt >= Math.min(intervalMs, 10_000)) {
        runIfVisible();
      }
    }
  };

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }

  return () => {
    clearInterval(timer);
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  };
}
