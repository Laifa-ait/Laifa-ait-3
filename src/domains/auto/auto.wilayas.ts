import wilayasRaw from "./data/wilayas69.json";

export interface WilayaItemDto {
  id: number;
  code: string;
  name: string;
  name_ar: string;
  lat: number;
  lng: number;
}

export const WILAYAS_69: readonly WilayaItemDto[] = Object.freeze(
  wilayasRaw as WilayaItemDto[]
);

/**
 * Normalise une chaîne de recherche pour la comparaison tolérante
 * Supprime les accents et diacritiques français, et uniformise les caractères arabes
 */
export function normalizeSearchText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Enlève accents français
    .replace(/[\u064B-\u065F]/g, "") // Enlève tashkeel (voyelles arabes)
    .replace(/[أإآ]/g, "ا") // Uniformise alef
    .replace(/ة/g, "ه") // Ta marbuta -> ha
    .replace(/ى/g, "ي") // Alef maqsura -> ya
    .replace(/[-'\s_]/g, "") // Supprime séparateurs pour tolérance (ex: "el-m'ghair" -> "elmghair")
    .trim();
}

/**
 * Recherche textuelle tolérante sur les 69 wilayas en français et arabe
 */
export function searchWilayas(query: string): WilayaItemDto[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return [...WILAYAS_69];
  }

  const normalizedQuery = normalizeSearchText(trimmed);

  return WILAYAS_69.filter((w) => {
    // 1. Correspondance par code exact ou partiel
    if (w.code === trimmed || w.code.startsWith(trimmed) || String(w.id) === trimmed) {
      return true;
    }
    // 2. Correspondance par nom français normalisé
    const normFr = normalizeSearchText(w.name);
    if (normFr.includes(normalizedQuery)) {
      return true;
    }
    // 3. Correspondance par nom arabe normalisé
    const normAr = normalizeSearchText(w.name_ar);
    if (normAr.includes(normalizedQuery)) {
      return true;
    }
    return false;
  });
}

/**
 * Récupère une wilaya par son identifiant numérique ou son code officiel
 */
export function getWilayaById(idOrCode: number | string): WilayaItemDto | undefined {
  const numId = typeof idOrCode === "number" ? idOrCode : parseInt(idOrCode, 10);
  const strCode = typeof idOrCode === "string" ? idOrCode.padStart(2, "0") : String(idOrCode).padStart(2, "0");

  return WILAYAS_69.find((w) => w.id === numId || w.code === strCode);
}

/**
 * Récupère le nom d'une wilaya dans la langue demandée
 */
export function getWilayaDisplayName(
  idOrCode: number | string,
  lang: "fr" | "ar" = "fr"
): string {
  const found = getWilayaById(idOrCode);
  if (!found) {
    return `Wilaya ${idOrCode}`;
  }
  return lang === "ar" ? found.name_ar : found.name;
}
