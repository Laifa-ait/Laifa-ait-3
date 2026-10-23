import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
import { CHECKOUT_TRANSLATIONS } from "./locales/checkoutTranslations";

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "fr",
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

const injectCheckoutTranslations = (lng: string) => {
  const cleanLng = (lng || "fr").split("-")[0];
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

i18n.on("loaded", (loaded) => {
  if (loaded) {
    Object.keys(loaded).forEach(injectCheckoutTranslations);
  }
});

i18n.on("languageChanged", (lng) => {
  if (typeof document !== "undefined") {
    const cleanLng = (lng || "fr").split("-")[0];
    document.documentElement.lang = cleanLng;
    document.documentElement.dir = cleanLng === "ar" ? "rtl" : "ltr";
    injectCheckoutTranslations(cleanLng);
  }
});

export default i18n;

