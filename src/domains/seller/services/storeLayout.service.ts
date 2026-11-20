import { db, admin } from "../../../config/firebase-admin";
import {
  StoreConfig, StoreLayoutDocument, StoreLayoutVersion, StoreHistoryEntry,
  StudioDataResponse, MediaGalleryItem, CustomPageSection, StoreCustomPageItem,
} from "../customPage.types";
import { LegacyStoreAdapter, stripUndefinedDeep } from "./legacyStore.adapter";
import { StorePublicService, invalidatePublicStorefrontCache } from "./storePublic.service";
import { safeLogger } from "../../../utils/logger";
import { sanitizeStudioPayloadDeep, sanitizePixelId } from "../../../security/studioCyberSecurity";
import { extractAllReferencedProductIds } from "../../../security/storeVipAccessGuard";

const MAX_HISTORY_RETENTION = 10;

export class StoreLayoutService {
  static async getOrInitStudioData(sellerId: string): Promise<StudioDataResponse> {
    const [configDoc, layoutDoc, userDoc, pubDoc, sellerProductsRes, historySnap] = await Promise.all([
      db.collection("store_configs").doc(sellerId).get(),
      db.collection("store_layouts").doc(sellerId).get(),
      db.collection("users").doc(sellerId).get(),
      db.collection("publicProfiles").doc(sellerId).get(),
      StorePublicService.fetchSellerPublicProductsPaginated(sellerId, { limit: 50 }).catch(() => ({ products: [], nextCursor: null, totalCount: 0 })),
      db.collection("store_layouts").doc(sellerId).collection("history").orderBy("versionNumber", "desc").limit(MAX_HISTORY_RETENTION).get(),
    ]);

    const activeProductIds = sellerProductsRes.products.map((p) => p.id);
    let storeConfig: StoreConfig;
    let layoutDocData: StoreLayoutDocument;

    if (!configDoc.exists) {
      safeLogger.info(`[StoreStudio] Initializing legacy store config for seller: ${sellerId}`);
      storeConfig = stripUndefinedDeep(LegacyStoreAdapter.buildStoreConfig(sellerId, userDoc.data() || {}, pubDoc.data() || {}));
      await db.runTransaction(async (t) => {
        const slugRef = db.collection("store_slugs").doc(storeConfig.shopSlug);
        const slugDoc = await t.get(slugRef);
        if (!slugDoc.exists) t.set(slugRef, { sellerId, slug: storeConfig.shopSlug, createdAt: admin.firestore.FieldValue.serverTimestamp() });
        t.set(db.collection("store_configs").doc(sellerId), storeConfig);
      });
    } else storeConfig = configDoc.data() as StoreConfig;

    if (!layoutDoc.exists) {
      safeLogger.info(`[StoreStudio] Initializing legacy draft layout for seller: ${sellerId}`);
      const initialDraft = stripUndefinedDeep({ ...LegacyStoreAdapter.buildInitialLayoutVersion(storeConfig, activeProductIds), draftRevision: 1 });
      layoutDocData = { sellerId, draft: initialDraft, published: null, currentVersion: 1, updatedAt: new Date().toISOString() };
      await db.collection("store_layouts").doc(sellerId).set(layoutDocData);
    } else layoutDocData = layoutDoc.data() as StoreLayoutDocument;

    const historyList: StoreHistoryEntry[] = historySnap.docs.map((d) => {
      const data = d.data();
      return {
        versionId: d.id, versionNumber: data.versionNumber || 1, sellerId,
        snapshot: data.snapshot, publishedAt: data.publishedAt || new Date().toISOString(), changeSummary: data.changeSummary,
      };
    });

    const mediaGallery: MediaGalleryItem[] = [];
    if (Array.isArray(storeConfig.mediaGallery)) {
      storeConfig.mediaGallery.forEach((item) => { if (item?.url && !mediaGallery.some((m) => m.id === item.id)) mediaGallery.push(item); });
    }
    if (storeConfig.logoUrl && !mediaGallery.some((m) => m.url === storeConfig.logoUrl)) {
      mediaGallery.push({ id: "logo", url: storeConfig.logoUrl, type: "image", name: "Logo officiel", uploadedAt: storeConfig.updatedAt });
    }
    if (storeConfig.bannerUrl && !mediaGallery.some((m) => m.url === storeConfig.bannerUrl)) {
      mediaGallery.push({ id: "banner", url: storeConfig.bannerUrl, type: "image", name: "Bannière d'en-tête", uploadedAt: storeConfig.updatedAt });
    }
    sellerProductsRes.products.forEach((p) => {
      if (p.image && !mediaGallery.some((m) => m.url === p.image)) {
        mediaGallery.push({ id: `prod_${p.id}`, url: p.image, type: "image", name: String(p.name || p.title || "Produit"), uploadedAt: storeConfig.updatedAt });
      }
    });

    return { storeConfig, draftLayout: layoutDocData.draft, publishedLayout: layoutDocData.published, historyList, mediaGallery };
  }

  static async verifyProductOwnership(sellerId: string, sections: CustomPageSection[], customPages?: StoreCustomPageItem[]): Promise<void> {
    const idList = extractAllReferencedProductIds(sections, customPages);
    if (idList.length === 0) return;
    for (let i = 0; i < idList.length; i += 30) {
      const chunk = idList.slice(i, i + 30);
      const snap = await db.collection("products").where(admin.firestore.FieldPath.documentId(), "in", chunk).get();
      const docMap = new Map<string, Record<string, unknown>>(snap.docs.map((doc) => [doc.id, doc.data() || {}]));
      for (const reqId of chunk) {
        const prod = docMap.get(reqId);
        if (!prod) { safeLogger.warn(`[StoreStudio] Skipping ownership check for deleted/missing product '${reqId}' in store '${sellerId}'`); continue; }
        const ownerId = [prod.sellerId, prod.sellerUid, prod.userId, prod.storeId, prod.shopId]
          .find((v): v is string => typeof v === "string" && v.trim().length > 0)?.trim() || "";
        if (ownerId && ownerId !== sellerId) throw new Error(`Violation d'accès : Le produit '${reqId}' n'appartient pas à votre boutique.`);
      }
    }
  }

  static async updateStoreConfig(sellerId: string, rawPayload: Partial<StoreConfig>): Promise<StoreConfig> {
    const payload = sanitizeStudioPayloadDeep(rawPayload);
    if (Array.isArray(payload.customPages) && payload.customPages.length > 0) await this.verifyProductOwnership(sellerId, [], payload.customPages);

    return await db.runTransaction(async (t) => {
      const configRef = db.collection("store_configs").doc(sellerId);
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
      const rawPixels = { ...(baseConfig.pixelsConfig || {}), ...(payload.pixelsConfig || {}) };
      const sanitizedPixels = {
        metaPixelId: sanitizePixelId(rawPixels.metaPixelId),
        tiktokPixelId: sanitizePixelId(rawPixels.tiktokPixelId),
        ga4MeasurementId: sanitizePixelId(rawPixels.ga4MeasurementId),
      };

      const mergedConfig = stripUndefinedDeep<StoreConfig>({
        ...baseConfig, ...payload,
        theme: { ...baseConfig.theme, ...(payload.theme || {}) },
        seo: { ...baseConfig.seo, ...(payload.seo || {}) },
        ...(payload.announcementBar || baseConfig.announcementBar ? { announcementBar: { ...(baseConfig.announcementBar || { enabled: false, text: "" }), ...(payload.announcementBar || {}) } } : {}),
        ...(payload.headerConfig || baseConfig.headerConfig ? { headerConfig: { ...(baseConfig.headerConfig || { layout: "left", sticky: true, showSearch: true, showTrustBar: true, navLinks: [] }), ...(payload.headerConfig || {}) } } : {}),
        ...(payload.commerceConfig || baseConfig.commerceConfig ? { commerceConfig: { ...(baseConfig.commerceConfig || { codEnabled: true, whatsappOrderEnabled: false }), ...(payload.commerceConfig || {}) } } : {}),
        ...(payload.storeStatus || baseConfig.storeStatus ? { storeStatus: { ...(baseConfig.storeStatus || { mode: "open" }), ...(payload.storeStatus || {}) } } : {}),
        ...(payload.pixelsConfig || baseConfig.pixelsConfig ? { pixelsConfig: sanitizedPixels } : {}),
        socialLinks: { ...(baseConfig.socialLinks || {}), ...(payload.socialLinks || {}) },
        contacts: { ...(baseConfig.contacts || {}), ...(payload.contacts || {}) },
        sellerId, updatedAt: new Date().toISOString(),
      });

      t.set(configRef, mergedConfig);
      const syncFields: Record<string, unknown> = {
        shopName: mergedConfig.shopName, storeName: mergedConfig.shopName, displayName: mergedConfig.shopName,
        shopSlug: mergedConfig.shopSlug, slug: mergedConfig.shopSlug,
        shopDescription: mergedConfig.shopDescription || "", description: mergedConfig.shopDescription || "",
        wilaya: mergedConfig.wilaya || "", commune: mergedConfig.commune || "",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        ...(mergedConfig.logoUrl ? { logoUrl: mergedConfig.logoUrl, photoURL: mergedConfig.logoUrl, avatarUrl: mergedConfig.logoUrl } : {}),
        ...(mergedConfig.bannerUrl ? { bannerUrl: mergedConfig.bannerUrl, coverUrl: mergedConfig.bannerUrl } : {}),
      };

      t.set(db.collection("users").doc(sellerId), syncFields, { merge: true });
      t.set(db.collection("publicProfiles").doc(sellerId), syncFields, { merge: true });
      invalidatePublicStorefrontCache(sellerId, mergedConfig.shopSlug);
      return mergedConfig;
    });
  }

  static async saveDraftLayout(
    sellerId: string, sections: CustomPageSection[],
    options?: { expectedRevision?: number; expectedUpdatedAt?: string; forceOverwrite?: boolean }
  ): Promise<StoreLayoutVersion> {
    const cleanSections = stripUndefinedDeep(sanitizeStudioPayloadDeep(sections));
    await this.verifyProductOwnership(sellerId, cleanSections);
    const layoutRef = db.collection("store_layouts").doc(sellerId);
    return await db.runTransaction(async (t) => {
      const layoutDoc = await t.get(layoutRef);
      const currentData = layoutDoc.data() as StoreLayoutDocument | undefined;
      const currentDraftRev = currentData?.draft?.draftRevision ?? 0;
      if (!options?.forceOverwrite) {
        if (typeof options?.expectedRevision === "number" && currentDraftRev > 0 && options.expectedRevision !== currentDraftRev) {
          throw new Error(`Conflit de version (CONFLICT_NEWER_VERSION) : Le brouillon sur le serveur (rév. #${currentDraftRev}) est plus récent que votre copie locale (rév. #${options.expectedRevision}).`);
        }
        if (options?.expectedUpdatedAt && currentData?.draft?.updatedAt && options.expectedUpdatedAt !== currentData.draft.updatedAt) {
          throw new Error(`Conflit de version (CONFLICT_NEWER_VERSION) : Le brouillon a été modifié (${currentData.draft.updatedAt}).`);
        }
      }
      const draftVersion: StoreLayoutVersion = {
        versionNumber: currentData?.currentVersion || 1, draftRevision: currentDraftRev + 1,
        sections: cleanSections, status: "draft", updatedAt: new Date().toISOString(),
      };
      t.set(layoutRef, { sellerId, draft: draftVersion, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      invalidatePublicStorefrontCache(sellerId);
      return draftVersion;
    });
  }

  static async publishLayout(sellerId: string, changeSummary?: string, expectedRevision?: number): Promise<StoreLayoutVersion> {
    const layoutRef = db.collection("store_layouts").doc(sellerId);
    const [preSnap, configSnap] = await Promise.all([layoutRef.get(), db.collection("store_configs").doc(sellerId).get().catch(() => null)]);
    if (!preSnap.exists) throw new Error("Aucun agencement trouvé pour cette boutique.");
    const preData = preSnap.data() as StoreLayoutDocument;
    if (!preData.draft?.sections?.length) throw new Error("Le brouillon est vide. Impossible de publier un agencement sans sections.");
    await this.verifyProductOwnership(sellerId, preData.draft.sections);
    const shopSlug = configSnap?.exists ? (configSnap.data() as StoreConfig | undefined)?.shopSlug : undefined;

    return await db.runTransaction(async (t) => {
      const doc = await t.get(layoutRef);
      if (!doc.exists) throw new Error("Aucun agencement trouvé pour cette boutique.");
      const data = doc.data() as StoreLayoutDocument;
      if (!data.draft?.sections?.length) throw new Error("Le brouillon est vide. Impossible de publier un agencement sans sections.");
      if (typeof expectedRevision === "number" && typeof data.draft.draftRevision === "number" && data.draft.draftRevision !== expectedRevision) {
        throw new Error(`Conflit de révision (CONFLICT_NEWER_VERSION) lors de la publication : rév. serveur #${data.draft.draftRevision} vs soumise #${expectedRevision}.`);
      }
      const newVersionNumber = (data.currentVersion || 1) + 1;
      const publishedVersion: StoreLayoutVersion = stripUndefinedDeep({
        versionNumber: newVersionNumber, sections: data.draft.sections, status: "published" as const,
        publishedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        changeSummary: changeSummary || "Mise en ligne de l'agencement",
      });
      t.update(layoutRef, { published: publishedVersion, currentVersion: newVersionNumber, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      t.set(layoutRef.collection("history").doc(String(newVersionNumber)), {
        versionNumber: newVersionNumber, sellerId, snapshot: publishedVersion,
        publishedAt: publishedVersion.publishedAt, changeSummary: publishedVersion.changeSummary,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      invalidatePublicStorefrontCache(sellerId, shopSlug);
      return publishedVersion;
    });
  }

  static async rollbackLayout(sellerId: string, versionNumber: number, expectedRevision?: number): Promise<StoreLayoutVersion> {
    const layoutRef = db.collection("store_layouts").doc(sellerId);
    const historyRef = layoutRef.collection("history").doc(String(versionNumber));
    const historyPreSnap = await historyRef.get();
    if (!historyPreSnap.exists) throw new Error(`La version historique #${versionNumber} est introuvable.`);
    await this.verifyProductOwnership(sellerId, (historyPreSnap.data()?.snapshot as StoreLayoutVersion)?.sections || []);

    return await db.runTransaction(async (t) => {
      const [layoutDoc, historyDoc] = await Promise.all([t.get(layoutRef), t.get(historyRef)]);
      if (!historyDoc.exists) throw new Error(`La version historique #${versionNumber} est introuvable.`);
      const currentData = layoutDoc.data() as StoreLayoutDocument | undefined;
      const currentDraftRev = currentData?.draft?.draftRevision ?? 0;
      if (typeof expectedRevision === "number" && currentDraftRev > 0 && expectedRevision !== currentDraftRev) {
        throw new Error(`Conflit de version (CONFLICT_NEWER_VERSION) lors de la restauration : rév. serveur #${currentDraftRev} vs attendue #${expectedRevision}.`);
      }
      const snapshot = historyDoc.data()?.snapshot as StoreLayoutVersion;
      const restoredDraft: StoreLayoutVersion = stripUndefinedDeep({
        versionNumber: snapshot.versionNumber, draftRevision: currentDraftRev + 1,
        sections: snapshot.sections, status: "draft" as const, updatedAt: new Date().toISOString(),
        changeSummary: `Restauration depuis la version #${versionNumber} par ${sellerId}`,
      });
      t.set(layoutRef, { sellerId, draft: restoredDraft, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      invalidatePublicStorefrontCache(sellerId);
      return restoredDraft;
    });
  }
}
