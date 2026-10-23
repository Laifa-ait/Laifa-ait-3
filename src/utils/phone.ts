/**
 * OLMART — Validateur & Normalisateur Téléphone Algérien Centralisé
 * Prise en charge universelle :
 * - Mobiles : 05, 06, 07 (ex: 0550123456, 0661123456, 0770123456)
 * - Fixes : 02X, 03X, 04X, 09X (ex: 021, 023, 031, etc.)
 * - International : +213 ou 00213 (ex: +213550123456, 0021321123456)
 */

// Regex de validation tolérante (avec ou sans espaces / tirets / préfixe international)
export const ALGERIA_PHONE_REGEX = /^(?:(?:\+|00)213|0)([2-79]\d{8})$/;

// Regex stricte pour les numéros de mobile uniquement (SMS OTP, contact WhatsApp)
export const ALGERIA_MOBILE_STRICT_REGEX = /^(?:(?:\+|00)213|0)([5-7]\d{8})$/;

/**
 * Nettoie une chaîne de caractères en ne conservant que les chiffres et le '+'
 */
export function cleanPhoneNumber(phone: string | null | undefined): string {
  if (!phone || typeof phone !== "string") return "";
  return phone.replace(/[\s\-.()]/g, "").trim();
}

/**
 * Vérifie si le numéro est un numéro de téléphone algérien valide (mobile ou fixe).
 */
export function isValidAlgerianPhone(phone: string | null | undefined): boolean {
  const cleaned = cleanPhoneNumber(phone);
  return ALGERIA_PHONE_REGEX.test(cleaned);
}

/**
 * Vérifie si le numéro est un numéro mobile algérien valide (05, 06, 07).
 */
export function isValidAlgerianMobile(phone: string | null | undefined): boolean {
  const cleaned = cleanPhoneNumber(phone);
  return ALGERIA_MOBILE_STRICT_REGEX.test(cleaned);
}

/**
 * Normalise un numéro algérien au format national standard à 10 chiffres (ex: "0550123456").
 * Retourne une chaîne vide si le format est invalide.
 */
export function normalizeAlgerianPhone(phone: string | null | undefined): string {
  const cleaned = cleanPhoneNumber(phone);
  const match = cleaned.match(ALGERIA_PHONE_REGEX);
  if (!match || !match[1]) return "";
  return `0${match[1]}`;
}

/**
 * Normalise un numéro algérien au format international E.164 (ex: "+213550123456").
 * Utile pour les SMS Twilio/Firebase et les liens WhatsApp `https://wa.me/213550123456`.
 */
export function toE164AlgerianPhone(phone: string | null | undefined): string {
  const cleaned = cleanPhoneNumber(phone);
  const match = cleaned.match(ALGERIA_PHONE_REGEX);
  if (!match || !match[1]) return "";
  return `+213${match[1]}`;
}

/**
 * Formate un numéro algérien pour l'affichage UI avec espacements lisibles (ex: "0550 12 34 56").
 */
export function formatPhoneDisplay(phone: string | null | undefined): string {
  const normalized = normalizeAlgerianPhone(phone);
  if (!normalized || normalized.length !== 10) return phone || "";
  return `${normalized.slice(0, 4)} ${normalized.slice(4, 6)} ${normalized.slice(6, 8)} ${normalized.slice(8, 10)}`;
}
