import { CustomPageSection, SellerStoreConfig } from "../../../../domains/seller/customPage.types";

function collectExactUrlValues(node: unknown, out: Set<string>): void {
  if (typeof node === "string") {
    const trimmed = node.trim();
    if (trimmed) out.add(trimmed);
    return;
  }
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i += 1) {
      collectExactUrlValues(node[i], out);
    }
    return;
  }
  if (node && typeof node === "object") {
    const values = Object.values(node as Record<string, unknown>);
    for (let i = 0; i < values.length; i += 1) {
      collectExactUrlValues(values[i], out);
    }
  }
}

export function buildMediaUsageIndex(
  sections: CustomPageSection[] = [],
  storeConfig?: SellerStoreConfig | null
): Map<string, string[]> {
  const index = new Map<string, string[]>();
  const addUsage = (rawUrl: string | undefined, label: string) => {
    const clean = (rawUrl || "").trim();
    if (!clean) return;
    const list = index.get(clean);
    if (list) list.push(label);
    else index.set(clean, [label]);
  };

  addUsage(storeConfig?.logoUrl, "Logo de la boutique");
  addUsage(storeConfig?.bannerUrl, "Bannière de profil");
  addUsage(storeConfig?.seo?.ogImage, "Image OpenGraph SEO");
  if (Array.isArray(storeConfig?.customPages)) {
    for (const page of storeConfig.customPages) {
      addUsage(page.bannerUrl, `Page : ${page.title || page.slug}`);
    }
  }

  for (const sec of sections) {
    const urls = new Set<string>();
    collectExactUrlValues(sec.settings, urls);
    collectExactUrlValues(sec.styles, urls);
    const label = sec.title || `Section ${sec.type}`;
    urls.forEach((url) => addUsage(url, label));
  }
  return index;
}

export function findMediaUsageInSections(
  url: string,
  sections: CustomPageSection[] = [],
  storeConfig?: SellerStoreConfig | null
): string[] {
  const cleanUrl = (url || "").trim();
  if (!cleanUrl) return [];
  return buildMediaUsageIndex(sections, storeConfig).get(cleanUrl) || [];
}

function replaceUrlDeep(node: unknown, oldUrl: string, newUrl: string): { value: unknown; count: number } {
  if (typeof node === "string") {
    if (node.trim() === oldUrl) return { value: newUrl, count: 1 };
    return { value: node, count: 0 };
  }
  if (Array.isArray(node)) {
    let total = 0;
    const mapped = node.map((item) => {
      const res = replaceUrlDeep(item, oldUrl, newUrl);
      total += res.count;
      return res.value;
    });
    return { value: mapped, count: total };
  }
  if (node && typeof node === "object") {
    let total = 0;
    const nextObj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      const res = replaceUrlDeep(v, oldUrl, newUrl);
      total += res.count;
      nextObj[k] = res.value;
    }
    return { value: nextObj, count: total };
  }
  return { value: node, count: 0 };
}

export function replaceMediaUrlInSections(
  sections: CustomPageSection[],
  storeConfig: SellerStoreConfig | null | undefined,
  rawOldUrl: string,
  rawNewUrl: string
): { nextSections: CustomPageSection[]; updatedConfigPatch: Partial<SellerStoreConfig> | null; replacedCount: number } {
  const oldUrl = rawOldUrl.trim();
  const newUrl = rawNewUrl.trim();
  if (!oldUrl || !newUrl || oldUrl === newUrl) {
    return { nextSections: sections, updatedConfigPatch: null, replacedCount: 0 };
  }
  let replacedCount = 0;
  const nextSections = sections.map((sec) => {
    const resSettings = replaceUrlDeep(sec.settings, oldUrl, newUrl);
    const resStyles = replaceUrlDeep(sec.styles, oldUrl, newUrl);
    const sectionReplacements = resSettings.count + resStyles.count;
    if (sectionReplacements === 0) return sec;
    replacedCount += sectionReplacements;
    return {
      ...sec,
      settings: resSettings.value as CustomPageSection["settings"],
      ...(sec.styles ? { styles: resStyles.value as CustomPageSection["styles"] } : {}),
    };
  });

  const configPatch: Partial<SellerStoreConfig> = {};
  let configChanged = false;
  if (storeConfig?.logoUrl?.trim() === oldUrl) { configPatch.logoUrl = newUrl; configChanged = true; replacedCount += 1; }
  if (storeConfig?.bannerUrl?.trim() === oldUrl) { configPatch.bannerUrl = newUrl; configChanged = true; replacedCount += 1; }
  if (storeConfig?.seo?.ogImage?.trim() === oldUrl && storeConfig.seo) {
    configPatch.seo = { ...storeConfig.seo, ogImage: newUrl };
    configChanged = true;
    replacedCount += 1;
  }
  if (Array.isArray(storeConfig?.customPages)) {
    let pageBannerChanged = false;
    const nextPages = storeConfig.customPages.map((p) => {
      if (p.bannerUrl?.trim() === oldUrl) {
        pageBannerChanged = true;
        replacedCount += 1;
        return { ...p, bannerUrl: newUrl };
      }
      return p;
    });
    if (pageBannerChanged) {
      configPatch.customPages = nextPages;
      configChanged = true;
    }
  }
  return { nextSections, updatedConfigPatch: configChanged ? configPatch : null, replacedCount };
}
