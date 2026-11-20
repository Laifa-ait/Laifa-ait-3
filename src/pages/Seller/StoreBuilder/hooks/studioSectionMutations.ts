import {
  CustomPageSection,
  CustomPageSectionType,
  CustomPageTheme,
  StoreThemeSector,
} from "../../../../domains/seller/customPage.types";
import { Product } from "../../../../domains/product/product.types";
import {
  buildSectorAwareSectionDefaults,
  DEFAULT_STUDIO_SECTOR,
} from "../constants/sectorCoherenceDefaults";
import { fastDeepClone } from "./studioBackupStorage";
import { toast } from "react-hot-toast";

export function createNewStudioSection(params: {
  type: CustomPageSectionType;
  defaultSettings: Record<string, unknown>;
  defaultTitle?: string;
  activeSector?: StoreThemeSector;
  storeWilaya?: string;
  products: Product[];
  order: number;
}): CustomPageSection {
  const { type, defaultSettings, defaultTitle, activeSector, storeWilaya, products, order } = params;
  const title = defaultTitle || `Section ${type}`;
  const requestedSector =
    (defaultSettings._sector as StoreThemeSector | undefined) ||
    activeSector ||
    DEFAULT_STUDIO_SECTOR;
  const cleanDefaults = { ...defaultSettings };
  delete cleanDefaults._sector;
  const coherentSettings = buildSectorAwareSectionDefaults(
    type,
    cleanDefaults,
    requestedSector,
    storeWilaya || "",
    products
  );
  return {
    id: `sec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    title,
    settings: coherentSettings as unknown as CustomPageSection["settings"],
    styles: { containerWidth: "contained", paddingY: "md", borderRadius: "none" },
    isVisible: true,
    order,
  };
}

export function getSectionCompletenessStatus(
  sec: CustomPageSection,
  products: Product[] = []
): { isEmpty: boolean; reason?: string } {
  const s = (sec.settings || {}) as Record<string, unknown>;
  if (sec.type === "promo_carousel") {
    const slides = Array.isArray(s.slides) ? s.slides : [];
    if (slides.length === 0) return { isEmpty: true, reason: "0 slide" };
  }
  if (sec.type === "kinetic_marquee") {
    if ("textFr" in s && String(s.textFr || "").trim() === "" && String(s.textAr || "").trim() === "") {
      return { isEmpty: true, reason: "Texte vide" };
    }
  }
  if (sec.type === "featured_categories") {
    const cats = Array.isArray(s.categories) ? s.categories : [];
    if (cats.length === 0) return { isEmpty: true, reason: "0 rayon" };
  }
  if (sec.type === "curated_collections") {
    const cols = Array.isArray(s.collections) ? s.collections : [];
    if (cols.length === 0) return { isEmpty: true, reason: "0 collection" };
  }
  if (
    sec.type === "featured_products" ||
    sec.type === "new_arrivals" ||
    sec.type === "best_sellers" ||
    sec.type === "product_grid"
  ) {
    const ids = Array.isArray(s.productIds) ? (s.productIds as string[]) : [];
    if (ids.length > 0 && products.length > 0) {
      const validCount = ids.filter((id) => products.some((p) => p.id === id)).length;
      if (validCount === 0) return { isEmpty: true, reason: "Produits introuvables" };
    } else if (sec.type === "featured_products" && ids.length === 0 && products.length === 0) {
      return { isEmpty: true, reason: "Aucun produit" };
    }
  }
  if (sec.type === "showcase_video" && !String(s.videoUrl || "").trim()) {
    return { isEmpty: true, reason: "Vidéo manquante" };
  }
  if (sec.type === "verified_reviews") {
    const revs = Array.isArray(s.customReviews) ? s.customReviews : [];
    if (revs.length === 0) return { isEmpty: true, reason: "Aucun avis" };
  }
  if (sec.type === "faq_accordion") {
    const items = Array.isArray(s.items) ? s.items : [];
    if (items.length === 0) return { isEmpty: true, reason: "0 question" };
  }
  if (sec.type === "contact_footer") {
    if (
      !String(s.workingHours || "").trim() &&
      !String(s.wilaya || "").trim() &&
      !String(s.address || "").trim() &&
      !String(s.title || "").trim()
    ) {
      return { isEmpty: true, reason: "Horaires manquants" };
    }
  }
  return { isEmpty: false };
}

export function createDuplicatedStudioSection(original: CustomPageSection): CustomPageSection {
  return {
    ...original,
    id: `sec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: `${original.title || original.type} (Copie)`,
    settings: fastDeepClone(original.settings || {}),
    styles: fastDeepClone(original.styles || {}),
  };
}

export function buildSectionMutationHandlers(params: {
  sections: CustomPageSection[];
  selectedSectionId: string | null;
  setSelectedSectionId: (id: string | null) => void;
  pushState: (newSections: CustomPageSection[], newTheme?: CustomPageTheme, label?: string) => void;
  activeSector?: StoreThemeSector;
  storeWilaya?: string;
  products: Product[];
}) {
  const { sections, selectedSectionId, setSelectedSectionId, pushState, activeSector, storeWilaya, products } = params;

  const addSection = (
    type: CustomPageSectionType,
    defaultSettings: Record<string, unknown>,
    defaultTitle?: string,
    insertAtIndex?: number
  ) => {
    const targetIdx =
      typeof insertAtIndex === "number" && insertAtIndex >= 0 && insertAtIndex <= sections.length
        ? insertAtIndex
        : sections.length;
    const newSection = createNewStudioSection({
      type, defaultSettings, defaultTitle, activeSector, storeWilaya, products, order: targetIdx,
    });
    const nextSections = [...sections];
    nextSections.splice(targetIdx, 0, newSection);
    const normalized = nextSections.map((sec, idx) => ({ ...sec, order: idx }));
    pushState(normalized, undefined, `Ajout section: ${newSection.title || type}`);
    setSelectedSectionId(newSection.id);
    toast.success("Nouvelle section ajoutée");
  };

  const updateSection = (sectionId: string, updates: Partial<CustomPageSection>) => {
    const target = sections.find((s) => s.id === sectionId);
    const updated = sections.map((sec) => (sec.id === sectionId ? { ...sec, ...updates } : sec));
    pushState(updated, undefined, `Édition: ${target?.title || target?.type || "Section"}`);
  };

  const reorderSections = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= sections.length) return;
    const movingSec = sections[fromIndex];
    if (movingSec && Boolean((movingSec.settings as Record<string, unknown> | undefined)?.isLocked)) return;
    const updated = [...sections];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    pushState(updated.map((sec, idx) => ({ ...sec, order: idx })), undefined, "Réorganisation des sections");
  };

  const deleteSection = (sectionId: string) => {
    const target = sections.find((s) => s.id === sectionId);
    if (target && Boolean((target.settings as Record<string, unknown> | undefined)?.isLocked)) return;
    const updated = sections.filter((sec) => sec.id !== sectionId);
    pushState(updated, undefined, `Suppression: ${target?.title || target?.type || "Section"}`);
    if (selectedSectionId === sectionId) setSelectedSectionId(updated[0]?.id || null);
    toast.success("Section supprimée");
  };

  const toggleVisibility = (sectionId: string) => {
    const updated = sections.map((sec) => (sec.id === sectionId ? { ...sec, isVisible: !sec.isVisible } : sec));
    pushState(updated, undefined, "Visibilité section");
  };

  const duplicateSection = (sectionId: string) => {
    const targetIdx = sections.findIndex((sec) => sec.id === sectionId);
    if (targetIdx === -1) return;
    const original = sections[targetIdx];
    const copy = createDuplicatedStudioSection(original);
    const updated = [...sections];
    updated.splice(targetIdx + 1, 0, copy);
    pushState(updated.map((sec, idx) => ({ ...sec, order: idx })), undefined, `Duplication: ${original.title || original.type}`);
    setSelectedSectionId(copy.id);
    toast.success("Section dupliquée");
  };

  const replaceSections = (newSections: CustomPageSection[], newTheme?: CustomPageTheme) => {
    const normalized = newSections.map((sec, idx) => ({ ...sec, order: idx }));
    pushState(normalized, newTheme, "Application modèle de sections");
    if (normalized.length > 0) setSelectedSectionId(normalized[0].id);
    toast.success("Architecture du thème appliquée avec succès !");
  };

  return { addSection, updateSection, reorderSections, deleteSection, toggleVisibility, duplicateSection, replaceSections };
}
