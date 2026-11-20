import { useState, useEffect, useCallback, useRef } from "react";
import { apiPut, apiPost } from "../../../../lib/api";
import { useAuth } from "../../../../context/AuthContext";
import {
  StoreConfig, StoreLayoutVersion,
  StoreHistoryEntry, MediaGalleryItem, CustomPageTheme,
} from "../../../../domains/seller/customPage.types";
import { Product } from "../../../../domains/product/product.types";
import { toast } from "react-hot-toast";
import { useStudioSaveManager, SaveStatus } from "./useStudioSaveManager";
import { writeLocalStudioThemeBackup } from "./studioBackupStorage";
import { useStudioUndoRedo } from "./useStudioUndoRedo";
import { buildSectionMutationHandlers } from "./studioSectionMutations";
import { useStudioMediaManager } from "./useStudioMediaManager";
import { useStudioStore } from "../store/useStudioStore";
import { CatalogLoadStatus, fetchSellerCatalogSafely, fetchStudioBundle } from "./studioCatalogLoader";

export type { SaveStatus, CatalogLoadStatus };

export function useSellerStudio() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null);
  const [draftLayout, setDraftLayout] = useState<StoreLayoutVersion | null>(null);
  const [publishedLayout, setPublishedLayout] = useState<StoreLayoutVersion | null>(null);
  const [historyList, setHistoryList] = useState<StoreHistoryEntry[]>([]);
  const [mediaGallery, setMediaGallery] = useState<MediaGalleryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogStatus, setCatalogStatus] = useState<CatalogLoadStatus>("loading");
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [catalogTruncated, setCatalogTruncated] = useState<boolean>(false);
  const [selectedSectionId, setSelectedSectionIdState] = useState<string | null>(null);

  const isPublishingRef = useRef<boolean>(false);
  const isRollingBackRef = useRef<boolean>(false);

  const selectSectionInStore = useStudioStore((s) => s.selectSection);
  const setSelectedSectionId = useCallback(
    (id: string | null) => { setSelectedSectionIdState(id); selectSectionInStore(id); },
    [selectSectionInStore]
  );

  const backupKey = currentUser?.uid ? `olmart_studio_backup_${currentUser.uid}` : "olmart_studio_unsaved_backup";
  const saveManager = useStudioSaveManager({ debounceMs: 1500, maxRetries: 3, backupKey });
  const {
    saveStatus, setSaveStatus, hasUnsavedChanges, setHasUnsavedChanges,
    saveDraft, triggerAutoSave, syncServerDraftRevision, retryCount, lastSaveError,
    recoverableBackup, checkRecoverableBackup, clearLocalBackup, dismissRecoveryBanner, confirmedServerRevision,
  } = saveManager;

  const persistThemeRestore = useCallback(async (restoredTheme: CustomPageTheme) => {
    setStoreConfig((prev) => (prev ? { ...prev, theme: restoredTheme } : prev));
    try {
      const response = await apiPut<{ success: boolean; data: StoreConfig }>("/api/v1/seller/store/config", { theme: restoredTheme });
      if (response?.data) setStoreConfig(response.data);
    } catch { /* Silent restore fallback */ }
  }, []);

  const historyStorageKey = currentUser?.uid ? `olmart_studio_history_${currentUser.uid}` : "olmart_studio_history_session";
  const {
    sections, setSectionsDirectly, resetHistory, pushState, pushThemeState,
    undo, redo, canUndo, canRedo, currentActionLabel, historyDepth, futureDepth,
  } = useStudioUndoRedo(draftLayout?.sections || [], triggerAutoSave, {
    storageKey: historyStorageKey,
    initialTheme: storeConfig?.theme,
    onThemeChange: (restoredTheme) => { void persistThemeRestore(restoredTheme); },
  });

  const reloadCatalog = useCallback(async () => {
    setCatalogStatus("loading");
    setCatalogError(null);
    const outcome = await fetchSellerCatalogSafely();
    if (outcome.ok) {
      setProducts(outcome.products);
      setCatalogTruncated(outcome.truncated);
      setCatalogStatus("loaded");
    } else {
      setCatalogStatus("error");
      setCatalogError(outcome.errorMessage);
    }
  }, []);

  const refreshData = useCallback(async (discardLocalBackup = false, preserveUndoHistory = false) => {
    if (!currentUser?.uid) { setLoading(false); return; }
    try {
      setLoading(true);
      setCatalogStatus("loading");
      setCatalogError(null);
      const { studioRes, catalog } = await fetchStudioBundle();
      if (studioRes?.data) {
        const data = studioRes.data;
        setStoreConfig(data.storeConfig);
        setDraftLayout(data.draftLayout);
        setPublishedLayout(data.publishedLayout);
        setHistoryList(data.historyList || []);
        setMediaGallery(data.mediaGallery || []);
        syncServerDraftRevision(data.draftLayout?.draftRevision);

        const loadedSections = data.draftLayout?.sections || [];
        setSectionsDirectly(loadedSections, data.storeConfig?.theme, preserveUndoHistory);
        if (discardLocalBackup) clearLocalBackup();
        else checkRecoverableBackup(data.draftLayout?.updatedAt, loadedSections);
        if (loadedSections.length > 0) {
          setSelectedSectionIdState((prev) => {
            if (!prev) { selectSectionInStore(loadedSections[0].id); return loadedSections[0].id; }
            return prev;
          });
        }
      }
      if (catalog.ok) {
        setProducts(catalog.products);
        setCatalogTruncated(catalog.truncated);
        setCatalogStatus("loaded");
      } else {
        setProducts([]);
        setCatalogTruncated(false);
        setCatalogStatus("error");
        setCatalogError(catalog.errorMessage);
      }
      setSaveStatus("idle");
      setHasUnsavedChanges(false);
    } catch {
      toast.error("Impossible de charger votre studio boutique");
      setSaveStatus("error");
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, setSectionsDirectly, selectSectionInStore, setSaveStatus, setHasUnsavedChanges, syncServerDraftRevision, clearLocalBackup, checkRecoverableBackup]);

  useEffect(() => { void refreshData(); }, [refreshData]);

  const applyRecoveredBackup = useCallback(() => {
    if (!recoverableBackup?.sections) return;
    if (recoverableBackup.theme) void persistThemeRestore(recoverableBackup.theme);
    pushState(recoverableBackup.sections, recoverableBackup.theme || storeConfig?.theme);
    dismissRecoveryBanner();
    toast.success("Modifications locales restaurées");
  }, [recoverableBackup, pushState, storeConfig?.theme, persistThemeRestore, dismissRecoveryBanner]);

  const dismissRecoveredBackup = useCallback(() => {
    clearLocalBackup();
    toast.success("Sauvegarde locale ignorée");
  }, [clearLocalBackup]);

  const saveStoreConfig = async (updatedConfig: Partial<StoreConfig>, options?: { skipUndoPush?: boolean }) => {
    try {
      setSaveStatus("saving");
      if (updatedConfig.theme && !options?.skipUndoPush) pushState(sections, updatedConfig.theme);
      const response = await apiPut<{ success: boolean; data: StoreConfig }>("/api/v1/seller/store/config", updatedConfig);
      if (response?.data) setStoreConfig(response.data);
      setSaveStatus("saved");
      toast.success("Paramètres de la boutique enregistrés");
    } catch (err: unknown) {
      if (updatedConfig.theme) writeLocalStudioThemeBackup(backupKey, updatedConfig.theme, sections);
      setSaveStatus("error");
      toast.error(err instanceof Error ? err.message : "Erreur de sauvegarde des paramètres");
      throw err;
    }
  };

  const sectionMutations = buildSectionMutationHandlers({
    sections, selectedSectionId, setSelectedSectionId, pushState,
    activeSector: storeConfig?.theme?.sector, storeWilaya: storeConfig?.wilaya, products,
  });

  const mediaManager = useStudioMediaManager({
    userId: currentUser?.uid, mediaGallery, setMediaGallery, setStoreConfig,
  });

  const publishStudio = async (changeSummary = "Mise à jour depuis le Studio"): Promise<boolean> => {
    if (isPublishingRef.current) return false;
    isPublishingRef.current = true;
    try {
      setIsPublishing(true);
      const confirmedRevision = await saveDraft(sections);
      if (confirmedRevision === null) return false;
      setSaveStatus("saving");
      const publishRes = await apiPost<{ success: boolean; data?: StoreLayoutVersion }>("/api/v1/seller/studio/layout/publish", {
        changeSummary, expectedRevision: confirmedRevision,
      });
      if (publishRes && publishRes.success === false) throw new Error("La publication n'a pas été confirmée par le serveur.");
      if (publishRes?.data) setPublishedLayout(publishRes.data);
      setSaveStatus("saved");
      setHasUnsavedChanges(false);
      toast.success("Votre boutique est publiée en ligne !");
      await refreshData(true, true);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Échec de la publication";
      if (msg.includes("CONFLICT_NEWER_VERSION") || msg.includes("Conflit de version") || msg.includes("Conflit de révision")) setSaveStatus("conflict");
      else setSaveStatus("error");
      toast.error(msg);
      return false;
    } finally {
      isPublishingRef.current = false;
      setIsPublishing(false);
    }
  };

  const rollbackVersion = async (versionNumber: number): Promise<boolean> => {
    if (isRollingBackRef.current) return false;
    isRollingBackRef.current = true;
    try {
      setSaveStatus("saving");
      const res = await apiPost<{ success: boolean; data?: StoreLayoutVersion }>("/api/v1/seller/studio/layout/rollback", {
        versionNumber,
        ...(typeof confirmedServerRevision === "number" ? { expectedRevision: confirmedServerRevision } : {}),
      });
      if (res && res.success === false) throw new Error("La restauration n'a pas été confirmée par le serveur.");
      if (typeof res?.data?.draftRevision === "number") syncServerDraftRevision(res.data.draftRevision);
      if (Array.isArray(res?.data?.sections)) {
        setDraftLayout(res.data);
        pushState(res.data.sections, storeConfig?.theme, `Restauration v${versionNumber}`);
      }
      setSaveStatus("saved");
      setHasUnsavedChanges(false);
      toast.success(`Version v${versionNumber} restaurée !`);
      await refreshData(true, true);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Échec de la restauration";
      if (msg.includes("CONFLICT_NEWER_VERSION") || msg.includes("Conflit de version") || msg.includes("Conflit de révision")) setSaveStatus("conflict");
      else setSaveStatus("error");
      toast.error(msg);
      return false;
    } finally {
      isRollingBackRef.current = false;
    }
  };

  return {
    loading, saveStatus, isPublishing, hasUnsavedChanges, retryCount, lastSaveError, recoverableBackup,
    applyRecoveredBackup, dismissRecoveredBackup, storeConfig, draftLayout, publishedLayout,
    sections, historyList, mediaGallery, products, catalogStatus, catalogError, catalogTruncated, reloadCatalog,
    selectedSectionId, setSelectedSectionId, ...sectionMutations, saveStoreConfig,
    saveDraftNow: () => saveDraft(sections), forceOverwriteDraft: () => saveDraft(sections, true),
    uploadMedia: mediaManager.uploadMedia, deleteMedia: mediaManager.deleteMedia,
    isMediaUploading: mediaManager.isUploading, mediaUploadProgress: mediaManager.uploadProgress,
    mediaUploadError: mediaManager.uploadError, publishStudio, rollbackVersion, refreshData,
    undo, redo, canUndo, canRedo, resetHistory, pushThemeState, currentActionLabel, historyDepth, futureDepth,
  };
}
