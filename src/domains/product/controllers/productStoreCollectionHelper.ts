import { admin, db } from "../../../config/firebase-admin";
import { HomepageSection, Banner } from "../product.types";
import { isPubliclyVisible } from "../product.status";
import { safeLogger } from "../../../utils/logger";

export interface MappedCollectionProduct {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  category?: string;
  stock?: number;
  sellerId?: string;
  wilaya?: string;
  status?: string;
  tags?: string[];
  [key: string]: unknown;
}

const normalizeStr = (str: string): string => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
};

const mapDocToMappedProduct = (docId: string, data: admin.firestore.DocumentData): MappedCollectionProduct => ({
  id: docId,
  tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
  category: data.category ? String(data.category) : undefined,
  status: data.status ? String(data.status) : undefined,
  ...data,
});

export async function resolveCollectionPagePayload(
  collectionId: string
): Promise<{ title: string; bannerImage: string; products: MappedCollectionProduct[] }> {
  const decodedName = decodeURIComponent(collectionId);
  const normalizedDecoded = normalizeStr(decodedName);
  const normalizedCollection = normalizeStr(collectionId);

  const matchesSlugOrTitle = (docId: string, data: admin.firestore.DocumentData): boolean => {
    const docIdNorm = normalizeStr(docId);
    const titleNorm = normalizeStr(data.title || "");
    const nameNorm = normalizeStr(data.name || "");
    return (
      docId === collectionId ||
      docId === decodedName ||
      docIdNorm === normalizedCollection ||
      docIdNorm === normalizedDecoded ||
      titleNorm === normalizedDecoded ||
      titleNorm === normalizedCollection ||
      nameNorm === normalizedDecoded ||
      nameNorm === normalizedCollection
    );
  };

  const sectionsSnap = await db.collection("homepage_sections").limit(50).get();
  let matchingSection: HomepageSection | null = null;
  for (const doc of sectionsSnap.docs) {
    const data = doc.data();
    if (matchesSlugOrTitle(doc.id, data)) {
      matchingSection = { id: doc.id, ...data } as HomepageSection;
      break;
    }
  }

  const bannersSnap = await db.collection("banners").limit(30).get();
  let matchingBanner: Banner | null = null;
  for (const doc of bannersSnap.docs) {
    const data = doc.data();
    if (matchesSlugOrTitle(doc.id, data)) {
      matchingBanner = { id: doc.id, ...data } as Banner;
      break;
    }
  }

  let title = decodedName;
  let bannerImage = "/images/placeholders/product.svg";

  if (matchingSection) {
    title = matchingSection.title || matchingSection.name || decodedName;
    if (matchingSection.themeImage) {
      bannerImage = matchingSection.themeImage;
    } else if (matchingSection.theme && matchingSection.theme !== "none") {
      try {
        const tDoc = await db.collection("seasonal_themes").doc(matchingSection.theme).get();
        if (tDoc.exists && tDoc.data()?.imageUrl) {
          bannerImage = tDoc.data()!.imageUrl;
        }
      } catch (themeErr) {
        safeLogger.error("Error loading seasonal theme", {
          err: themeErr instanceof Error ? themeErr.message : String(themeErr),
        });
      }
    }
    if (!bannerImage || bannerImage === "/images/placeholders/product.svg") {
      bannerImage = matchingSection.imageUrl || matchingSection.bannerImage || "/images/placeholders/product.svg";
    }
  } else if (matchingBanner) {
    title = matchingBanner.title || matchingBanner.name || decodedName;
    bannerImage = matchingBanner.imageUrl || matchingBanner.mobileImageUrl || "/images/placeholders/product.svg";
  }

  let curatedProducts: MappedCollectionProduct[] = [];
  const sectionTag = matchingSection?.tag || null;
  const sectionCategory = matchingSection?.category || null;

  if (matchingSection?.manualProducts && matchingSection.manualProducts.length > 0) {
    const productPromises = matchingSection.manualProducts.slice(0, 50).map(async (pid: string) => {
      const d = await db.collection("products").doc(pid).get();
      if (d.exists && d.data()) {
        const mapped = mapDocToMappedProduct(d.id, d.data()!);
        return isPubliclyVisible(mapped) ? mapped : null;
      }
      return null;
    });
    const productDocs = await Promise.all(productPromises);
    curatedProducts = productDocs.filter((p): p is MappedCollectionProduct => p !== null);
  }

  if (curatedProducts.length === 0) {
    if (sectionCategory) {
      const catSnap = await db.collection("products").where("category", "==", sectionCategory).limit(24).get();
      curatedProducts = catSnap.docs
        .map((doc) => mapDocToMappedProduct(doc.id, doc.data()))
        .filter((p) => isPubliclyVisible(p));
    } else if (sectionTag) {
      const tagSnap = await db.collection("products").where("tags", "array-contains", sectionTag).limit(24).get();
      curatedProducts = tagSnap.docs
        .map((doc) => mapDocToMappedProduct(doc.id, doc.data()))
        .filter((p) => isPubliclyVisible(p));
    }
  }

  const targetTags = new Set<string>();
  if (sectionTag) targetTags.add(sectionTag);
  curatedProducts.forEach((p) => {
    if (Array.isArray(p.tags)) p.tags.forEach((t) => targetTags.add(t));
  });

  const allProductsSnap = await db.collection("products").limit(100).get();
  const allProducts = allProductsSnap.docs
    .map((doc) => mapDocToMappedProduct(doc.id, doc.data()))
    .filter((p) => isPubliclyVisible(p));

  const curatedIds = new Set(curatedProducts.map((p) => p.id));
  const sameTagProducts = allProducts.filter((p) => {
    if (curatedIds.has(p.id)) return false;
    const pTags = p.tags || [];
    return pTags.some((t) => targetTags.has(t)) || Boolean(sectionCategory && p.category === sectionCategory);
  });

  const remainderProducts = allProducts.filter(
    (p) => !curatedIds.has(p.id) && !sameTagProducts.some((st) => st.id === p.id)
  );

  const combined = [...curatedProducts, ...sameTagProducts, ...remainderProducts];
  const seenIds = new Set<string>();
  const products: MappedCollectionProduct[] = [];
  combined.forEach((p) => {
    if (p && p.id && !seenIds.has(p.id)) {
      seenIds.add(p.id);
      products.push(p);
    }
  });

  return { title, bannerImage, products };
}
