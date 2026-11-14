import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { safeLogger } from "../utils/logger";
import { fetchWithClientCache } from "../utils/clientReadCache";

const TRANSLATION_SYNC_TTL_MS = 15 * 60 * 1000; // 15 minutes sessionStorage cache

/**
 * Hook to synchronize Firestore translation overrides with a 15-minute sessionStorage cache.
 * Prevents opening a live Firestore onSnapshot listener on every page refresh (F5).
 */
export function useTranslationRealtimeSync(): void {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!db || typeof db !== "object") return;

    const rawLang = i18n.language || "fr";
    const cleanLng = rawLang.split("-")[0];
    if (!["fr", "ar", "en"].includes(cleanLng)) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const dynamicOverrides = await fetchWithClientCache<Record<string, string>>(
          `i18n:overrides:${cleanLng}`,
          async () => {
            const translationDocRef = doc(db, "translations", cleanLng);
            const snapshot = await getDoc(translationDocRef);
            if (!snapshot.exists()) return {};
            const data = snapshot.data();
            if (!data) return {};

            const overrides: Record<string, string> = {};
            for (const [key, value] of Object.entries(data)) {
              if (
                typeof value === "string" &&
                !["updatedAt", "updatedBy", "createdAt"].includes(key)
              ) {
                overrides[key] = value;
              }
            }
            return overrides;
          },
          TRANSLATION_SYNC_TTL_MS
        );

        if (!cancelled && Object.keys(dynamicOverrides).length > 0) {
          i18n.addResourceBundle(cleanLng, "translation", dynamicOverrides, true, true);
          i18n.emit("added", cleanLng, "translation");
          i18n.emit("loaded", [cleanLng]);
        }
      } catch (error: unknown) {
        safeLogger.debug("[TranslationRealtimeSync] Cached sync fallback active", {
          lang: cleanLng,
          err: error instanceof Error ? error.message : String(error),
        });
      }
    }, 1200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [i18n, i18n.language]);
}
