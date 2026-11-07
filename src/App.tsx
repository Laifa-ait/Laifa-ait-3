/**
 * OLMART — Design System Reference
 * @see DESIGN_SYSTEM.md at the root of the project
 * Colors: primary=#f97316, bg=#f9f4e8, surface=#ffffff
 * Icons: lucide-react only
 */

import React, { Suspense, useEffect, useState } from "react";
import { AppRouter } from "./AppRouter";
import { useTranslation } from "react-i18next";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { MetaTags } from "./components/MetaTags";
import { useTranslationRealtimeSync } from "./hooks/useTranslationRealtimeSync";

const GlobalSearchModal = React.lazy(() =>
  import("./components/common/GlobalSearchModal").then((m) => ({ default: m.GlobalSearchModal }))
);
const DataConsentBanner = React.lazy(() =>
  import("./components/Consent/DataConsentBanner").then((m) => ({ default: m.DataConsentBanner }))
);
const InstallPrompt = React.lazy(() =>
  import("./components/InstallPrompt").then((m) => ({ default: m.InstallPrompt }))
);

const App = () => {
  const { i18n } = useTranslation();
  const [deferredReady, setDeferredReady] = useState(false);

  // Instant real-time Firestore synchronization for translations (deferred internally after first paint)
  useTranslationRealtimeSync();

  useEffect(() => {
    const timer = setTimeout(() => setDeferredReady(true), 450);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleLangChange = (lng: string) => {
      if (!lng) return;
      const cleanLng = lng.split("-")[0];
      document.documentElement.dir = cleanLng === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = cleanLng;
    };

    i18n.on("languageChanged", handleLangChange);
    handleLangChange(i18n.language || "fr");

    return () => {
      i18n.off("languageChanged", handleLangChange);
    };
  }, [i18n]);

  return (
    <ErrorBoundary>
      <MetaTags
        schema={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Olma Marketplace",
          url: "https://olma-dz.com",
          logo: "https://olma-dz.com/assets/icon.png",
          sameAs: [
            "https://facebook.com/olmadz",
            "https://instagram.com/olmadz",
          ],
        }}
      />
      <AppRouter />
      {deferredReady && (
        <Suspense fallback={null}>
          <GlobalSearchModal />
          <DataConsentBanner />
          <InstallPrompt />
        </Suspense>
      )}
    </ErrorBoundary>
  );
};

export default App;
