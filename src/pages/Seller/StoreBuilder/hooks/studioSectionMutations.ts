import {
  CustomPageSection,
  CustomPageSectionType,
  StoreThemeSector,
} from "../../../../domains/seller/customPage.types";
import { Product } from "../../../../domains/product/product.types";
import {
  buildSectorAwareSectionDefaults,
  DEFAULT_STUDIO_SECTOR,
} from "../constants/sectorCoherenceDefaults";

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
  const coherentSettings = buildSectorAwareSectionDefaults(
    type,
    defaultSettings,
    activeSector || DEFAULT_STUDIO_SECTOR,
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

export function createDuplicatedStudioSection(original: CustomPageSection): CustomPageSection {
  return {
    ...original,
    id: `sec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: `${original.title || original.type} (Copie)`,
    settings: JSON.parse(JSON.stringify(original.settings || {})),
    styles: JSON.parse(JSON.stringify(original.styles || {})),
  };
}
