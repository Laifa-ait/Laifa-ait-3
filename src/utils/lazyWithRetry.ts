import React from "react";

/**
 * Wraps React.lazy to automatically handle chunk loading errors
 * caused by server redeployments or stale asset hashes.
 */
export function lazyWithRetry<
  P = Record<string, unknown>,
  T extends React.ComponentType<P> = React.ComponentType<P>
>(
  componentImport: () => Promise<Record<string, unknown> | { default: T } | T>,
  exportName?: string
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    let attempts = 0;
    while (attempts < 2) {
      try {
        attempts++;
        const loaded = await componentImport();
        window.sessionStorage.removeItem("page_reloaded_timestamp");

        if (exportName && loaded && typeof loaded === "object" && exportName in loaded) {
          const namedExport = (loaded as Record<string, unknown>)[exportName] as T;
          return { default: namedExport };
        }
        if (loaded && typeof loaded === "object" && "default" in loaded) {
          return loaded as { default: T };
        }
        return { default: loaded as T };
      } catch (error: unknown) {
        if (attempts < 2) {
          await new Promise((resolve) => setTimeout(resolve, 400));
          continue;
        }

        const errStr = error instanceof Error ? error.message : String(error);
        const isChunkError =
          errStr.includes("Failed to fetch dynamically imported module") ||
          errStr.includes("Loading chunk") ||
          errStr.includes("Importing a module script failed") ||
          errStr.includes("error loading dynamically imported module");

        const lastReload = Number(window.sessionStorage.getItem("page_reloaded_timestamp") || "0");
        const now = Date.now();
        const reloadedRecently = now - lastReload < 10000;

        if (isChunkError && !reloadedRecently) {
          console.warn("[LazyWithRetry] Chunk loading failed. Reloading page...", error);
          window.sessionStorage.setItem("page_reloaded_timestamp", String(now));
          window.location.reload();
          return new Promise(() => {});
        }

        console.error("[LazyWithRetry] Dynamic import failed:", error);
        throw error;
      }
    }
    throw new Error("Failed to load component");
  });
}
