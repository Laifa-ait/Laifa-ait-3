import {
  CustomPageSection,
  CustomPageSectionType,
  CustomPageTheme,
} from "../../../../domains/seller/customPage.types";

export const KNOWN_STUDIO_SECTION_TYPES: ReadonlySet<CustomPageSectionType> = new Set<CustomPageSectionType>([
  "hero_banner",
  "promo_carousel",
  "featured_categories",
  "curated_collections",
  "featured_products",
  "new_arrivals",
  "best_sellers",
  "product_grid",
  "brand_story",
  "showcase_video",
  "verified_reviews",
  "delivery_info",
  "return_policy",
  "faq_accordion",
  "contact_footer",
  "kinetic_marquee",
]);

export interface StudioLocalBackupData {
  sections: CustomPageSection[];
  localRevision: number;
  updatedAt: number;
  theme?: CustomPageTheme;
}

export function isValidStudioBackupSection(candidate: unknown): candidate is CustomPageSection {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return false;
  const sec = candidate as Record<string, unknown>;
  if (typeof sec.id !== "string" || sec.id.trim().length === 0) return false;
  if (typeof sec.type !== "string" || !KNOWN_STUDIO_SECTION_TYPES.has(sec.type as CustomPageSectionType)) {
    return false;
  }
  if (!sec.settings || typeof sec.settings !== "object" || Array.isArray(sec.settings)) {
    return false;
  }
  return true;
}

export function sanitizeStudioSections(targetSections: CustomPageSection[]) {
  return targetSections.map((sec, idx) => ({
    id: sec.id || `sec_${idx}`,
    type: sec.type,
    title: typeof sec.title === "string" ? sec.title : undefined,
    settings: sec.settings && typeof sec.settings === "object" ? sec.settings : {},
    styles: sec.styles && typeof sec.styles === "object" ? sec.styles : {},
    isVisible: typeof sec.isVisible === "boolean" ? sec.isVisible : true,
    order: typeof sec.order === "number" && Number.isFinite(sec.order) ? Math.max(0, Math.round(sec.order)) : idx,
  }));
}

export function writeLocalStudioBackup(
  backupKey: string,
  sections: CustomPageSection[],
  localRevision: number,
  theme?: CustomPageTheme
) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const existing = readLocalStudioBackup(backupKey);
    const nextTheme = theme ?? existing?.theme;
    window.localStorage.setItem(
      backupKey,
      JSON.stringify({
        sections,
        localRevision,
        updatedAt: Date.now(),
        ...(nextTheme ? { theme: nextTheme } : {}),
      })
    );
  } catch {
    /* Quota ignored */
  }
}

export function writeLocalStudioThemeBackup(
  backupKey: string,
  theme: CustomPageTheme,
  fallbackSections: CustomPageSection[]
) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const existing = readLocalStudioBackup(backupKey);
    const sections = existing?.sections && existing.sections.length > 0 ? existing.sections : fallbackSections;
    const localRevision = (existing?.localRevision ?? 0) + 1;
    window.localStorage.setItem(
      backupKey,
      JSON.stringify({
        sections,
        localRevision,
        updatedAt: Date.now(),
        theme,
      })
    );
  } catch {
    /* Quota ignored */
  }
}

export function readLocalStudioBackup(backupKey: string): StudioLocalBackupData | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(backupKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StudioLocalBackupData>;
    if (
      !Array.isArray(parsed?.sections) ||
      parsed.sections.length === 0 ||
      typeof parsed.updatedAt !== "number" ||
      !Number.isFinite(parsed.updatedAt)
    ) {
      return null;
    }
    if (!parsed.sections.every(isValidStudioBackupSection)) {
      return null;
    }
    const validTheme =
      parsed.theme && typeof parsed.theme === "object" && !Array.isArray(parsed.theme)
        ? (parsed.theme as CustomPageTheme)
        : undefined;
    return {
      sections: parsed.sections,
      localRevision: typeof parsed.localRevision === "number" ? parsed.localRevision : 1,
      updatedAt: parsed.updatedAt,
      ...(validTheme ? { theme: validTheme } : {}),
    };
  } catch {
    return null;
  }
}

export function removeLocalStudioBackup(backupKey: string) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.removeItem(backupKey);
  } catch {
    /* Ignore */
  }
}

export function fastDeepClone<T>(val: T): T {
  if (val === null || typeof val !== "object") return val;
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(val);
    } catch {
      /* Fallback if non-cloneable property present */
    }
  }
  return JSON.parse(JSON.stringify(val)) as T;
}

export function areStudioValuesEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (a === null || b === null || typeof a !== "object" || typeof b !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (!areStudioValuesEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i += 1) {
    const key = keysA[i];
    if (!Object.prototype.hasOwnProperty.call(objB, key)) return false;
    if (!areStudioValuesEqual(objA[key], objB[key])) return false;
  }
  return true;
}

export interface StudioSessionSnapshot {
  sections: CustomPageSection[];
  theme?: CustomPageTheme;
  actionLabel?: string;
  timestamp: number;
}

export function loadStudioSessionHistory(storageKey: string | undefined, maxSteps: number): {
  past: StudioSessionSnapshot[];
  present: StudioSessionSnapshot | null;
  future: StudioSessionSnapshot[];
} | null {
  if (!storageKey || typeof window === "undefined" || !window.sessionStorage) return null;
  try {
    const raw = window.sessionStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      past?: StudioSessionSnapshot[];
      present?: StudioSessionSnapshot;
      future?: StudioSessionSnapshot[];
    };
    if (!parsed?.present || !Array.isArray(parsed.present.sections)) return null;
    return {
      past: Array.isArray(parsed.past) ? parsed.past.slice(-maxSteps) : [],
      present: parsed.present,
      future: Array.isArray(parsed.future) ? parsed.future.slice(0, maxSteps) : [],
    };
  } catch {
    return null;
  }
}

export function saveStudioSessionHistory(
  storageKey: string | undefined,
  past: StudioSessionSnapshot[],
  present: StudioSessionSnapshot,
  future: StudioSessionSnapshot[]
): void {
  if (!storageKey || typeof window === "undefined" || !window.sessionStorage) return;
  try {
    const serialized = JSON.stringify({
      past: past.slice(-10),
      present,
      future: future.slice(0, 10),
    });
    if (serialized.length > 262_144) return;
    window.sessionStorage.setItem(storageKey, serialized);
  } catch {
    /* Quota safety */
  }
}

