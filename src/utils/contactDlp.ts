/**
 * OLMART — Filtre Anti-Désintermédiation Transversal (DLP / Anti-Leak)
 * Empêche l'injection non sollicitée de coordonnées personnelles directes
 * (téléphone, WhatsApp, Viber, liens externes, emails) dans les zones de texte libre
 * (titres de produits, descriptions véhicules, annonces immobilières, devis bricolage).
 */

export interface ContactDlpResult {
  hasForbiddenContact: boolean;
  cleanText: string;
  violations: string[];
}

// Détection des téléphones algériens (formats variés avec espaces, points ou tirets)
const PHONE_LEAK_TEST_REGEX = /(?:(?:\+|00)213|0)[\s.-]?[2-79](?:[\s.-]?\d{2}){4}/i;

// Détection des réseaux sociaux et messageries privées directes
const SOCIAL_LEAK_TEST_REGEX = /\b(whatsapp|viber|telegram|t\.me|instagram(?:\.com)?|insta|facebook(?:\.com)?|fb(?:\.com)?|tiktok(?:\.com)?|snapchat|appel[e]?[- ]?moi)\b/i;

// Détection des URLs externes (hors domaines olmart officiels)
const URL_LEAK_TEST_REGEX = /(https?:\/\/(?!([a-z0-9-]+\.)?olmart\.dz)[^\s]+|www\.(?!olmart\.dz)[^\s]+)/i;

// Détection des adresses email
const EMAIL_LEAK_TEST_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;

/**
 * Vérifie si un texte contient des coordonnées de contact interdites.
 */
export function hasForbiddenContactInfo(text: string | null | undefined): boolean {
  if (!text || typeof text !== "string") return false;
  return (
    PHONE_LEAK_TEST_REGEX.test(text) ||
    SOCIAL_LEAK_TEST_REGEX.test(text) ||
    URL_LEAK_TEST_REGEX.test(text) ||
    EMAIL_LEAK_TEST_REGEX.test(text)
  );
}

/**
 * Analyse et filtre un texte en masquant les données de contact sensibles.
 */
export function sanitizeContactDlp(text: string | null | undefined): ContactDlpResult {
  if (!text || typeof text !== "string") {
    return { hasForbiddenContact: false, cleanText: "", violations: [] };
  }

  let cleanText = text;
  const violations: string[] = [];

  if (PHONE_LEAK_TEST_REGEX.test(cleanText)) {
    violations.push("NUMERO_TELEPHONE_DETECTE");
    cleanText = cleanText.replace(new RegExp(PHONE_LEAK_TEST_REGEX.source, "gi"), "[TÉLÉPHONE MASQUÉ]");
  }

  if (SOCIAL_LEAK_TEST_REGEX.test(cleanText)) {
    violations.push("RESEAU_SOCIAL_DETECTE");
    cleanText = cleanText.replace(new RegExp(SOCIAL_LEAK_TEST_REGEX.source, "gi"), "[CONTACT EXTERNE MASQUÉ]");
  }

  if (URL_LEAK_TEST_REGEX.test(cleanText)) {
    violations.push("LIEN_EXTERNE_DETECTE");
    cleanText = cleanText.replace(new RegExp(URL_LEAK_TEST_REGEX.source, "gi"), "[LIEN INTERDIT]");
  }

  if (EMAIL_LEAK_TEST_REGEX.test(cleanText)) {
    violations.push("EMAIL_DETECTE");
    cleanText = cleanText.replace(new RegExp(EMAIL_LEAK_TEST_REGEX.source, "gi"), "[EMAIL MASQUÉ]");
  }

  return {
    hasForbiddenContact: violations.length > 0,
    cleanText,
    violations,
  };
}
