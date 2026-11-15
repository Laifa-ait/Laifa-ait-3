import { CustomPageSection, SellerStoreConfig } from "../../../../domains/seller/customPage.types";

export const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const ALLOWED_VIDEO_MIMES = ["video/mp4", "video/webm"] as const;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_VIDEO_SIZE_BYTES = 25 * 1024 * 1024;

export interface ValidatedMediaDescriptor {
  kind: "image" | "video";
  mimeType: string;
  extension: string;
}

export function isSystemOrCatalogMedia(id: string): boolean {
  return id === "logo" || id === "banner" || id.startsWith("prod_");
}

function matchesMagicBytes(bytes: Uint8Array, mime: string): boolean {
  if (bytes.length < 4) return false;
  if (mime === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === "image/png") {
    return bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  }
  if (mime === "image/webp") {
    return bytes.length >= 12 &&
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  }
  if (mime === "image/avif" || mime === "video/mp4") {
    return bytes.length >= 8 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70;
  }
  if (mime === "video/webm") {
    return bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
  }
  return false;
}

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif", "video/mp4": "mp4", "video/webm": "webm",
};

export async function validateMediaFile(
  file: File,
  options: { allowVideo?: boolean } = {}
): Promise<ValidatedMediaDescriptor> {
  if (!file || file.size <= 0) throw new Error("Le fichier sélectionné est vide.");
  const mime = (file.type || "").toLowerCase();
  const isImage = (ALLOWED_IMAGE_MIMES as readonly string[]).includes(mime);
  const isVideo = (ALLOWED_VIDEO_MIMES as readonly string[]).includes(mime);
  if (!isImage && !isVideo) {
    throw new Error(options.allowVideo
      ? "Format non autorisé. Images : JPG, PNG, WebP, AVIF. Vidéos : MP4, WebM."
      : "Format non autorisé. Utilisez JPG, PNG, WebP ou AVIF.");
  }
  if (isVideo && !options.allowVideo) {
    throw new Error("Les fichiers vidéo ne sont pas acceptés dans ce champ image.");
  }
  const maxBytes = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
  if (file.size > maxBytes) {
    throw new Error(isVideo ? "Vidéo trop lourde (25 Mo maximum)." : "Image trop lourde (5 Mo maximum).");
  }
  if (typeof file.slice === "function" && typeof file.arrayBuffer === "function") {
    const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    if (!matchesMagicBytes(bytes, mime)) {
      throw new Error(`Signature binaire invalide : le contenu réel du fichier ne correspond pas au format ${mime}.`);
    }
  }
  return { kind: isVideo ? "video" : "image", mimeType: mime, extension: EXT_BY_MIME[mime] || "bin" };
}

export async function optimizeImageFileAndReadDimensions(
  file: File,
  maxDimension = 1920
): Promise<{ blob: Blob; mimeType: string; width?: number; height?: number }> {
  if (typeof document === "undefined" || typeof Image === "undefined" || typeof URL.createObjectURL !== "function") {
    return { blob: file, mimeType: file.type };
  }
  return await new Promise((resolve) => {
    let objectUrl = "";
    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      resolve({ blob: file, mimeType: file.type });
      return;
    }
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const origW = img.naturalWidth || img.width || 0;
      const origH = img.naturalHeight || img.height || 0;
      if (!origW || !origH) {
        resolve({ blob: file, mimeType: file.type });
        return;
      }
      const needsResize = origW > maxDimension || origH > maxDimension;
      const needsCompress = file.size > 1.5 * 1024 * 1024;
      if (!needsResize && !needsCompress) {
        resolve({ blob: file, mimeType: file.type, width: origW, height: origH });
        return;
      }
      const ratio = needsResize ? Math.min(maxDimension / origW, maxDimension / origH) : 1;
      const targetW = Math.max(1, Math.round(origW * ratio));
      const targetH = Math.max(1, Math.round(origH * ratio));
      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve({ blob: file, mimeType: file.type, width: origW, height: origH });
        return;
      }
      ctx.drawImage(img, 0, 0, targetW, targetH);
      const outputMime = file.type === "image/png" ? "image/png" : "image/webp";
      canvas.toBlob(
        (outBlob) => {
          if (outBlob && outBlob.size > 0 && (needsResize || outBlob.size < file.size)) {
            resolve({ blob: outBlob, mimeType: outputMime, width: targetW, height: targetH });
          } else {
            resolve({ blob: file, mimeType: file.type, width: origW, height: origH });
          }
        },
        outputMime,
        0.84
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ blob: file, mimeType: file.type });
    };
    img.src = objectUrl;
  });
}

function containsExactUrlValue(node: unknown, targetUrl: string): boolean {
  if (typeof node === "string") return node.trim() === targetUrl;
  if (Array.isArray(node)) return node.some((el) => containsExactUrlValue(el, targetUrl));
  if (node && typeof node === "object") {
    return Object.values(node as Record<string, unknown>).some((v) => containsExactUrlValue(v, targetUrl));
  }
  return false;
}

export function findMediaUsageInSections(
  url: string,
  sections: CustomPageSection[] = [],
  storeConfig?: SellerStoreConfig | null
): string[] {
  const cleanUrl = (url || "").trim();
  if (!cleanUrl) return [];
  const usages: string[] = [];
  if (storeConfig?.logoUrl?.trim() === cleanUrl) usages.push("Logo de la boutique");
  if (storeConfig?.bannerUrl?.trim() === cleanUrl) usages.push("Bannière de profil");
  if (storeConfig?.seo?.ogImage?.trim() === cleanUrl) usages.push("Image OpenGraph SEO");

  sections.forEach((sec) => {
    if (containsExactUrlValue(sec.settings, cleanUrl)) {
      usages.push(sec.title || `Section ${sec.type}`);
    }
  });
  return usages;
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
    const res = replaceUrlDeep(sec.settings, oldUrl, newUrl);
    if (res.count === 0) return sec;
    replacedCount += res.count;
    return { ...sec, settings: res.value as CustomPageSection["settings"] };
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
  return { nextSections, updatedConfigPatch: configChanged ? configPatch : null, replacedCount };
}

export function isValidDirectVideoUrl(rawUrl: string): boolean {
  const trimmed = (rawUrl || "").trim();
  if (!trimmed) return true;
  if (trimmed.toLowerCase().startsWith("javascript:") || trimmed.toLowerCase().startsWith("data:")) {
    return false;
  }
  return /^https?:\/\/.+/i.test(trimmed) || trimmed.startsWith("/");
}
