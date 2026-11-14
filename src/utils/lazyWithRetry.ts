import React from "react";

let isReloadingInCurrentWindow = false;

export function isDynamicChunkLoadError(error: unknown): boolean {
  const errStr = error instanceof Error ? `${error.name}: ${error.message}` : String(error || "");
  return (
    errStr.includes("Failed to fetch dynamically imported module") ||
    errStr.includes("Loading chunk") ||
    errStr.includes("Loading CSS chunk") ||
    errStr.includes("Importing a module script failed") ||
    errStr.includes("error loading dynamically imported module") ||
    errStr.includes("Unable to preload CSS")
  );
}

export function triggerStaleChunkReload(): boolean {
  if (typeof window === "undefined") return false;
  if (isReloadingInCurrentWindow) return true;

  try {
    const lastReload = Number(window.sessionStorage.getItem("page_reloaded_timestamp") || "0");
    const now = Date.now();
    if (now - lastReload < 10000) {
      return false;
    }
    isReloadingInCurrentWindow = true;
    window.sessionStorage.setItem("page_reloaded_timestamp", String(now));
    window.location.reload();
    return true;
  } catch {
    isReloadingInCurrentWindow = true;
    window.location.reload();
    return true;
  }
}

export interface LazyWithRetryOptions {
  fallbackToNull?: boolean;
}

/**
 * Wraps React.lazy to automatically handle chunk loading errors
 * caused by server redeployments or stale asset hashes.
 */
export function lazyWithRetry<
  P = Record<string, unknown>,
  T extends React.ComponentType<P> = React.ComponentType<P>
>(
  componentImport: () => Promise<Record<string, unknown> | { default: T } | T>,
  exportName?: string,
  options?: LazyWithRetryOptions
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    if (isReloadingInCurrentWindow) {
      return new Promise<never>(() => {});
    }

    let attempts = 0;
    while (attempts < 2) {
      try {
        attempts++;
        const loaded = await componentImport();
        try {
          window.sessionStorage.removeItem("page_reloaded_timestamp");
        } catch {
          // ignore storage restriction
        }

        if (exportName && loaded && typeof loaded === "object" && exportName in loaded) {
          const namedExport = (loaded as Record<string, unknown>)[exportName] as T;
          return { default: namedExport };
        }
        if (loaded && typeof loaded === "object" && "default" in loaded) {
          return loaded as { default: T };
        }
        return { default: loaded as T };
      } catch (error: unknown) {
        if (isReloadingInCurrentWindow) {
          return new Promise<never>(() => {});
        }
        if (attempts < 2) {
          await new Promise((resolve) => setTimeout(resolve, 350));
          continue;
        }

        if (isDynamicChunkLoadError(error)) {
          if (triggerStaleChunkReload()) {
            return new Promise<never>(() => {});
          }
          if (options?.fallbackToNull) {
            const NullFallback: React.FC = () => null;
            return { default: NullFallback as unknown as T };
          }
        }

        if (options?.fallbackToNull) {
          const NullFallback: React.FC = () => null;
          return { default: NullFallback as unknown as T };
        }

        throw error;
      }
    }
    throw new Error("Failed to load component");
  });
}
