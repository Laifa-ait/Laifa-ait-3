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
const PHONE_LEAK_REGEX = /(?:(?:\+|00)213|0)[\s.-]?[2-79](?:[\s.-]?\d{2}){4}/gi;

// Détection des réseaux sociaux et messageries privées directes
const SOCIAL_LEAK_REGEX = /\b(whatsapp|viber|telegram|t\.me|instagram(?:\.com)?|insta|facebook(?:\.com)?|fb(?:\.com)?|tiktok(?:\.com)?|snapchat|appel[e]?[- ]?moi)\b/gi;

// Détection des URLs externes (hors domaines olmart officiels)
const URL_LEAK_REGEX = /(https?:\/\/(?!([a-z0-9-]+\.)?olmart\.dz)[^\s]+|www\.(?!olmart\.dz)[^\s]+)/gi;

// Détection des adresses email
const EMAIL_LEAK_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

/**
 * Vérifie si un texte contient des coordonnées de contact interdites.
 */
export function hasForbiddenContactInfo(text: string | null | undefined): boolean {
  if (!text || typeof text !== "string") return false;
  const normalized = text.toLowerCase();
  return (
    PHONE_LEAK_REGEX.test(normalized) ||
    SOCIAL_LEAK_REGEX.test(normalized) ||
    URL_LEAK_REGEX.test(normalized) ||
    EMAIL_LEAK_REGEX.test(normalized)
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

  if (PHONE_LEAK_REGEX.test(cleanText)) {
    violations.push("NUMERO_TELEPHONE_DETECTE");
    cleanText = cleanText.replace(PHONE_LEAK_REGEX, "[TÉLÉPHONE MASQUÉ]");
  }

  if (SOCIAL_LEAK_REGEX.test(cleanText)) {
    violations.push("RESEAU_SOCIAL_DETECTE");
    cleanText = cleanText.replace(SOCIAL_LEAK_REGEX, "[CONTACT EXTERNE MASQUÉ]");
  }

  if (URL_LEAK_REGEX.test(cleanText)) {
    violations.push("LIEN_EXTERNE_DETECTE");
    cleanText = cleanText.replace(URL_LEAK_REGEX, "[LIEN INTERDIT]");
  }

  if (EMAIL_LEAK_REGEX.test(cleanText)) {
    violations.push("EMAIL_DETECTE");
    cleanText = cleanText.replace(EMAIL_LEAK_REGEX, "[EMAIL MASQUÉ]");
  }

  return {
    hasForbiddenContact: violations.length > 0,
    cleanText,
    violations,
  };
}
