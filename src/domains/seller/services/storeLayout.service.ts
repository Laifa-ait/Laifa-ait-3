import { db, admin } from "../../../config/firebase-admin";
import {
  StoreConfig,
  StoreLayoutDocument,
  StoreLayoutVersion,
  StoreHistoryEntry,
  StudioDataResponse,
  MediaGalleryItem,
  CustomPageSection,
} from "../customPage.types";
import { LegacyStoreAdapter, stripUndefinedDeep } from "./legacyStore.adapter";
import { invalidatePublicStorefrontCache } from "./storePublic.service";
import { safeLogger } from "../../../utils/logger";

const MAX_HISTORY_RETENTION = 10;

export class StoreLayoutService {
  static async getOrInitStudioData(sellerId: string): Promise<StudioDataResponse> {
    const [configDoc, layoutDoc, userDoc, pubDoc, productsSnap, historySnap] = await Promise.all([
      db.collection("store_configs").doc(sellerId).get(),
      db.collection("store_layouts").doc(sellerId).get(),
      db.collection("users").doc(sellerId).get(),
      db.collection("publicProfiles").doc(sellerId).get(),
      db.collection("products").where("sellerId", "==", sellerId).where("status", "==", "active").limit(20).get(),
      db.collection("store_layouts").doc(sellerId).collection("history").orderBy("versionNumber", "desc").limit(MAX_HISTORY_RETENTION).get(),
    ]);

    const activeProductIds = productsSnap.docs.map((d) => d.id);
    let storeConfig: StoreConfig;
    let layoutDocData: StoreLayoutDocument;

    if (!configDoc.exists) {
      safeLogger.info(`[StoreStudio] Initializing legacy store config for seller: ${sellerId}`);
      storeConfig = stripUndefinedDeep(
        LegacyStoreAdapter.buildStoreConfig(sellerId, userDoc.data() || {}, pubDoc.data() || {})
      );
      await db.runTransaction(async (t) => {
        const slugRef = db.collection("store_slugs").doc(storeConfig.shopSlug);
        const slugDoc = await t.get(slugRef);
        if (!slugDoc.exists) {
          t.set(slugRef, { sellerId, slug: storeConfig.shopSlug, createdAt: admin.firestore.FieldValue.serverTimestamp() });
        }
        t.set(db.collection("store_configs").doc(sellerId), storeConfig);
      });
    } else {
      storeConfig = configDoc.data() as StoreConfig;
    }

    if (!layoutDoc.exists) {
      safeLogger.info(`[StoreStudio] Initializing legacy draft layout for seller: ${sellerId}`);
      const initialDraft = stripUndefinedDeep(
        LegacyStoreAdapter.buildInitialLayoutVersion(storeConfig, activeProductIds)
      );
      layoutDocData = {
        sellerId,
        draft: initialDraft,
        published: null,
        currentVersion: 1,
        updatedAt: new Date().toISOString(),
      };
      await db.collection("store_layouts").doc(sellerId).set(layoutDocData);
    } else {
      layoutDocData = layoutDoc.data() as StoreLayoutDocument;
    }

    const historyList: StoreHistoryEntry[] = historySnap.docs.map((d) => {
      const data = d.data();
      return {
        versionId: d.id,
        versionNumber: data.versionNumber || 1,
        sellerId,
        snapshot: data.snapshot,
        publishedAt: data.publishedAt || new Date().toISOString(),
        changeSummary: data.changeSummary,
      };
    });

    const mediaGallery: MediaGalleryItem[] = [];
    if (Array.isArray(storeConfig.mediaGallery)) {
      storeConfig.mediaGallery.forEach((item) => {
        if (item && item.url && !mediaGallery.some((m) => m.id === item.id)) mediaGallery.push(item);
      });
    }
    if (storeConfig.logoUrl && !mediaGallery.some((m) => m.url === storeConfig.logoUrl)) {
      mediaGallery.push({ id: "logo", url: storeConfig.logoUrl, type: "image", name: "Logo officiel", uploadedAt: storeConfig.updatedAt });
    }
    if (storeConfig.bannerUrl && !mediaGallery.some((m) => m.url === storeConfig.bannerUrl)) {
      mediaGallery.push({ id: "banner", url: storeConfig.bannerUrl, type: "image", name: "Bannière d'en-tête", uploadedAt: storeConfig.updatedAt });
    }
    productsSnap.docs.forEach((d) => {
      const p = d.data();
      if (p.image && typeof p.image === "string" && !mediaGallery.some((m) => m.url === p.image)) {
        mediaGallery.push({ id: `prod_${d.id}`, url: p.image, type: "image", name: String(p.name || "Produit"), uploadedAt: storeConfig.updatedAt });
      }
    });

    return { storeConfig, draftLayout: layoutDocData.draft, publishedLayout: layoutDocData.published, historyList, mediaGallery };
  }

  static async updateStoreConfig(sellerId: string, payload: Partial<StoreConfig>): Promise<StoreConfig> {
    return await db.runTransaction(async (t) => {
      const configRef = db.collection("store_configs").doc(sellerId);
      const userRef = db.collection("users").doc(sellerId);
      const pubRef = db.collection("publicProfiles").doc(sellerId);

      const existingConfigDoc = await t.get(configRef);
      const existingConfig = existingConfigDoc.exists ? (existingConfigDoc.data() as StoreConfig) : null;
      const targetSlug = payload.shopSlug || existingConfig?.shopSlug;

      if (targetSlug && targetSlug !== existingConfig?.shopSlug) {
        const newSlugRef = db.collection("store_slugs").doc(targetSlug);
        const newSlugDoc = await t.get(newSlugRef);
        if (newSlugDoc.exists && newSlugDoc.data()?.sellerId !== sellerId) {
          throw new Error(`Le lien personnalisé '${targetSlug}' est déjà utilisé par une autre boutique.`);
        }
        t.set(newSlugRef, { sellerId, slug: targetSlug, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        if (existingConfig?.shopSlug) t.delete(db.collection("store_slugs").doc(existingConfig.shopSlug));
      }

      const baseConfig = existingConfig || LegacyStoreAdapter.buildStoreConfig(sellerId, {});
      const mergedConfig = stripUndefinedDeep<StoreConfig>({
        ...baseConfig,
        ...payload,
        theme: { ...baseConfig.theme, ...(payload.theme || {}) },
        seo: { ...baseConfig.seo, ...(payload.seo || {}) },
        ...(payload.announcementBar || baseConfig.announcementBar
          ? { announcementBar: { ...(baseConfig.announcementBar || { enabled: false, text: "" }), ...(payload.announcementBar || {}) } }
          : {}),
        ...(payload.headerConfig || baseConfig.headerConfig
          ? {
              headerConfig: {
                ...(baseConfig.headerConfig || { layout: "left", sticky: true, showSearch: true, showTrustBar: true, navLinks: [] }),
                ...(payload.headerConfig || {}),
              },
            }
          : {}),
        ...(payload.commerceConfig || baseConfig.commerceConfig
          ? { commerceConfig: { ...(baseConfig.commerceConfig || { codEnabled: true, whatsappOrderEnabled: false }), ...(payload.commerceConfig || {}) } }
          : {}),
        ...(payload.storeStatus || baseConfig.storeStatus
          ? { storeStatus: { ...(baseConfig.storeStatus || { mode: "open" }), ...(payload.storeStatus || {}) } }
          : {}),
        ...(payload.pixelsConfig || baseConfig.pixelsConfig
          ? { pixelsConfig: { ...(baseConfig.pixelsConfig || {}), ...(payload.pixelsConfig || {}) } }
          : {}),
        socialLinks: { ...(baseConfig.socialLinks || {}), ...(payload.socialLinks || {}) },
        contacts: { ...(baseConfig.contacts || {}), ...(payload.contacts || {}) },
        sellerId,
        updatedAt: new Date().toISOString(),
      });

      t.set(configRef, mergedConfig);

      const syncFields: Record<string, unknown> = {
        shopName: mergedConfig.shopName,
        storeName: mergedConfig.shopName,
        displayName: mergedConfig.shopName,
        shopSlug: mergedConfig.shopSlug,
        slug: mergedConfig.shopSlug,
        shopDescription: mergedConfig.shopDescription || "",
        description: mergedConfig.shopDescription || "",
        wilaya: mergedConfig.wilaya || "",
        commune: mergedConfig.commune || "",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        ...(mergedConfig.logoUrl
          ? { logoUrl: mergedConfig.logoUrl, photoURL: mergedConfig.logoUrl, avatarUrl: mergedConfig.logoUrl }
          : {}),
        ...(mergedConfig.bannerUrl ? { bannerUrl: mergedConfig.bannerUrl, coverUrl: mergedConfig.bannerUrl } : {}),
      };

      t.set(userRef, syncFields, { merge: true });
      t.set(pubRef, syncFields, { merge: true });
      invalidatePublicStorefrontCache(sellerId, mergedConfig.shopSlug);
      return mergedConfig;
    });
  }

  private static async verifyProductOwnership(sellerId: string, sections: CustomPageSection[]): Promise<void> {
    const referencedProductIds = new Set<string>();
    sections.forEach((sec) => {
      if (sec.type === "featured_products" && Array.isArray((sec.settings as { productIds?: string[] }).productIds)) {
        (sec.settings as { productIds: string[] }).productIds.forEach((id) => referencedProductIds.add(id));
      }
      if (sec.type === "curated_collections" && Array.isArray((sec.settings as { collections?: Array<{ productIds?: string[] }> }).collections)) {
        (sec.settings as { collections: Array<{ productIds: string[] }> }).collections.forEach((col) => {
          col.productIds.forEach((id) => referencedProductIds.add(id));
        });
      }
    });
    if (referencedProductIds.size === 0) return;

    const idList = Array.from(referencedProductIds);
    for (let i = 0; i < idList.length; i += 30) {
      const chunk = idList.slice(i, i + 30);
      const snap = await db.collection("products").where(admin.firestore.FieldPath.documentId(), "in", chunk).get();
      snap.docs.forEach((doc) => {
        const prod = doc.data();
        if (prod.sellerId && prod.sellerId !== sellerId) {
          throw new Error(`Violation d'accès : Le produit '${doc.id}' n'appartient pas à votre boutique.`);
        }
      });
    }
  }

  static async saveDraftLayout(
    sellerId: string,
    sections: CustomPageSection[],
    options?: { expectedRevision?: number; expectedUpdatedAt?: string; forceOverwrite?: boolean }
  ): Promise<StoreLayoutVersion> {
    const cleanSections = stripUndefinedDeep(sections);
    await this.verifyProductOwnership(sellerId, cleanSections);

    const layoutRef = db.collection("store_layouts").doc(sellerId);
    return await db.runTransaction(async (t) => {
      const layoutDoc = await t.get(layoutRef);
      const currentData = layoutDoc.data() as StoreLayoutDocument | undefined;
      const currentDraftRev = currentData?.draft?.draftRevision ?? 0;

      if (
        !options?.forceOverwrite &&
        typeof options?.expectedRevision === "number" &&
        currentDraftRev > 0 &&
        options.expectedRevision !== currentDraftRev
      ) {
        throw new Error(
          `Conflit de version (CONFLICT_NEWER_VERSION) : Le brouillon sur le serveur (rév. #${currentDraftRev}) est plus récent que votre copie locale (rév. #${options.expectedRevision}).`
        );
      }

      const nextDraftRev = currentDraftRev + 1;
      const draftVersion: StoreLayoutVersion = {
        versionNumber: currentData?.currentVersion || 1,
        draftRevision: nextDraftRev,
        sections: cleanSections,
        status: "draft",
        updatedAt: new Date().toISOString(),
      };

      t.set(
        layoutRef,
        { sellerId, draft: draftVersion, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
      return draftVersion;
    });
  }

  static async publishLayout(sellerId: string, changeSummary?: string): Promise<StoreLayoutVersion> {
    const layoutRef = db.collection("store_layouts").doc(sellerId);
    return await db.runTransaction(async (t) => {
      const doc = await t.get(layoutRef);
      if (!doc.exists) throw new Error("Aucun agencement trouvé pour cette boutique.");
      const data = doc.data() as StoreLayoutDocument;
      if (!data.draft || data.draft.sections.length === 0) {
        throw new Error("Le brouillon est vide. Impossible de publier un agencement sans sections.");
      }

      const newVersionNumber = (data.currentVersion || 1) + 1;
      const publishedVersion: StoreLayoutVersion = stripUndefinedDeep({
        versionNumber: newVersionNumber,
        sections: data.draft.sections,
        status: "published" as const,
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        changeSummary: changeSummary || "Mise en ligne de l'agencement",
      });

      t.update(layoutRef, { published: publishedVersion, currentVersion: newVersionNumber, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      t.set(layoutRef.collection("history").doc(String(newVersionNumber)), {
        versionNumber: newVersionNumber,
        sellerId,
        snapshot: publishedVersion,
        publishedAt: publishedVersion.publishedAt,
        changeSummary: publishedVersion.changeSummary,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      invalidatePublicStorefrontCache(sellerId);
      return publishedVersion;
    });
  }

  static async rollbackLayout(sellerId: string, versionNumber: number): Promise<StoreLayoutVersion> {
    const layoutRef = db.collection("store_layouts").doc(sellerId);
    const historyDoc = await layoutRef.collection("history").doc(String(versionNumber)).get();
    if (!historyDoc.exists) throw new Error(`La version historique #${versionNumber} est introuvable.`);

    const snapshot = historyDoc.data()?.snapshot as StoreLayoutVersion;
    const restoredDraft: StoreLayoutVersion = stripUndefinedDeep({
      versionNumber: snapshot.versionNumber,
      sections: snapshot.sections,
      status: "draft" as const,
      updatedAt: new Date().toISOString(),
      changeSummary: `Restauration depuis la version #${versionNumber}`,
    });

    await layoutRef.update({ draft: restoredDraft, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    return restoredDraft;
  }
}
