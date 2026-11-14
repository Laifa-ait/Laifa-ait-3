import { CustomPageSection } from "../../../../domains/seller/customPage.types";

export interface StudioLocalBackupData {
  sections: CustomPageSection[];
  localRevision: number;
  updatedAt: number;
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

export function writeLocalStudioBackup(backupKey: string, sections: CustomPageSection[], localRevision: number) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(backupKey, JSON.stringify({ sections, localRevision, updatedAt: Date.now() }));
  } catch { /* Quota ignored */ }
}

export function readLocalStudioBackup(backupKey: string): StudioLocalBackupData | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(backupKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StudioLocalBackupData>;
    if (!Array.isArray(parsed?.sections) || parsed.sections.length === 0 || typeof parsed.updatedAt !== "number") return null;
    return {
      sections: parsed.sections,
      localRevision: typeof parsed.localRevision === "number" ? parsed.localRevision : 1,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

export function removeLocalStudioBackup(backupKey: string) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.removeItem(backupKey);
  } catch { /* Ignore */ }
}
