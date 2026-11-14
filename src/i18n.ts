import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
import { CHECKOUT_TRANSLATIONS } from "./locales/checkoutTranslations";
import { HOME_TRANSLATIONS } from "./locales/homeTranslations";
import { LAYOUT_TRANSLATIONS } from "./locales/layoutTranslations";
import { MOBILE_MENU_TRANSLATIONS } from "./locales/mobileMenuTranslations";
import { SUBCATEGORY_TRANSLATIONS } from "./locales/subcategoryTranslations";

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "fr",
    supportedLngs: ["fr", "ar", "en"],
    load: "languageOnly",
    backend: {
      loadPath: "/locales/{{lng}}.json",
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

const injectCoreTranslations = (lng: string) => {
  const cleanLng = (lng || "fr").split("-")[0] as "fr" | "ar" | "en";
  if (HOME_TRANSLATIONS[cleanLng]) {
    i18n.addResourceBundle(cleanLng, "translation", HOME_TRANSLATIONS[cleanLng], true, true);
  }
  if (LAYOUT_TRANSLATIONS[cleanLng]) {
    i18n.addResourceBundle(cleanLng, "translation", LAYOUT_TRANSLATIONS[cleanLng], true, true);
  }
  if (MOBILE_MENU_TRANSLATIONS[cleanLng]) {
    i18n.addResourceBundle(cleanLng, "translation", MOBILE_MENU_TRANSLATIONS[cleanLng], true, true);
  }
  if (SUBCATEGORY_TRANSLATIONS[cleanLng]) {
    i18n.addResourceBundle(cleanLng, "translation", SUBCATEGORY_TRANSLATIONS[cleanLng], true, true);
  }
  if (CHECKOUT_TRANSLATIONS[cleanLng as keyof typeof CHECKOUT_TRANSLATIONS]) {
    i18n.addResourceBundle(
      cleanLng,
      "translation",
      CHECKOUT_TRANSLATIONS[cleanLng as keyof typeof CHECKOUT_TRANSLATIONS],
      true,
      true
    );
  }
};

// Pre-inject synchronous bundles for all 3 supported languages to prevent any untranslated flash
(["fr", "ar", "en"] as const).forEach(injectCoreTranslations);

i18n.on("loaded", (loaded) => {
  if (loaded) {
    Object.keys(loaded).forEach(injectCoreTranslations);
  }
});

i18n.on("languageChanged", (lng) => {
  if (typeof document !== "undefined") {
    const cleanLng = (lng || "fr").split("-")[0];
    document.documentElement.lang = cleanLng;
    document.documentElement.dir = cleanLng === "ar" ? "rtl" : "ltr";
    injectCoreTranslations(cleanLng);
  }
});

export default i18n;
