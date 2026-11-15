import { useState, useEffect, useRef, useCallback } from "react";
import { apiPut, apiPost } from "../../../../lib/api";
import { useAuth } from "../../../../context/AuthContext";
import {
  StudioDataResponse, StoreConfig, CustomPageSection, CustomPageTheme,
  StoreHistoryEntry, MediaGalleryItem,
} from "../../../../domains/seller/customPage.types";
import { Product } from "../../../../domains/product/product.types";
import { useStudioUndoRedo } from "./useStudioUndoRedo";
import { useStudioSaveManager } from "./useStudioSaveManager";
import { useStudioMediaManager } from "./useStudioMediaManager";
import { useStudioStore } from "../store/useStudioStore";
import { buildSectionMutationHandlers } from "./studioSectionMutations";
import { CatalogLoadStatus, fetchSellerCatalogSafely, fetchStudioBundle } from "./studioCatalogLoader";
import { toast } from "react-hot-toast";

export type { SaveStatus } from "./useStudioSaveManager";
export type { CatalogLoadStatus } from "./studioCatalogLoader";

export function useSellerStudio() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null);
  const [historyList, setHistoryList] = useState<StoreHistoryEntry[]>([]);
  const [mediaGallery, setMediaGallery] = useState<MediaGalleryItem[]>([]);
  const [publishedLayout, setPublishedLayout] = useState<StudioDataResponse["publishedLayout"]>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogStatus, setCatalogStatus] = useState<CatalogLoadStatus>("idle");
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const selectedSectionId = useStudioStore((s) => s.selectedSectionId);
  const selectSectionInStore = useStudioStore((s) => s.selectSection);
  const setSelectedSectionId = useCallback((id: string | null) => selectSectionInStore(id), [selectSectionInStore]);

  const initialSectionsRef = useRef<CustomPageSection[]>([]);
  const fetchRequestIdRef = useRef(0);
  const activeUserIdRef = useRef<string | undefined>(currentUser?.uid);
  const isPublishingRef = useRef(false);

  const {
    saveStatus, setSaveStatus, hasUnsavedChanges, saveDraft, triggerAutoSave,
    syncServerDraftRevision, recoverableBackup, checkRecoverableBackup, clearLocalBackup,
    confirmedServerRevision,
  } = useStudioSaveManager({
    backupKey: currentUser?.uid ? `olmart_studio_unsaved_backup_${currentUser.uid}` : "olmart_studio_unsaved_backup",
  });

  const {
    uploadMedia, deleteMedia, isUploading: isMediaUploading,
    uploadProgress: mediaUploadProgress, uploadError: mediaUploadError,
  } = useStudioMediaManager({
    userId: currentUser?.uid, mediaGallery, setMediaGallery, setStoreConfig,
  });

  const handleRestoreThemeFromHistory = useCallback((restoredTheme: CustomPageTheme) => {
    setStoreConfig((prev) => (prev ? { ...prev, theme: restoredTheme } : prev));
    setSaveStatus("saving");
    void apiPut<{ success: boolean; data: StoreConfig }>("/api/v1/seller/store/config", { theme: restoredTheme })
      .then((res) => { if (res?.data) setStoreConfig(res.data); setSaveStatus("saved"); })
      .catch((err: unknown) => {
        setSaveStatus("error");
        toast.error(err instanceof Error ? err.message : "Échec de la synchronisation du thème restauré avec le serveur");
      });
  }, [setSaveStatus]);

  const {
    sections, setSectionsDirectly, resetHistory, pushState, pushThemeState,
    undo, redo, canUndo, canRedo, currentActionLabel,
  } = useStudioUndoRedo(initialSectionsRef.current, triggerAutoSave, {
    storageKey: currentUser?.uid ? `olmart_studio_undo_${currentUser.uid}` : "olmart_studio_undo_session",
    initialTheme: storeConfig?.theme,
    onThemeChange: handleRestoreThemeFromHistory,
  });

  const fetchStudioData = useCallback(async (resetUndoHistory = false) => {
    const reqId = ++fetchRequestIdRef.current;
    try {
      setLoading(true);
      setCatalogStatus("loading");
      setCatalogError(null);
      const { studioRes, catalog } = await fetchStudioBundle();
      if (reqId !== fetchRequestIdRef.current) return;

      if (studioRes?.success && studioRes.data) {
        setStoreConfig(studioRes.data.storeConfig);
        const draftSections = studioRes.data.draftLayout?.sections || [];
        syncServerDraftRevision(studioRes.data.draftLayout?.draftRevision ?? 1);
        initialSectionsRef.current = draftSections;
        if (resetUndoHistory) {
          resetHistory(draftSections, studioRes.data.storeConfig?.theme, "Version restaurée");
          clearLocalBackup();
          setSaveStatus("saved");
        } else {
          setSectionsDirectly(draftSections, studioRes.data.storeConfig?.theme, false);
          checkRecoverableBackup(studioRes.data.draftLayout?.updatedAt, draftSections);
        }
        setHistoryList(studioRes.data.historyList || []);
        setMediaGallery(studioRes.data.mediaGallery || []);
        setPublishedLayout(studioRes.data.publishedLayout || null);
        if (draftSections.length > 0) setSelectedSectionId(draftSections[0].id);
      }

      if (catalog.ok) {
        setProducts(catalog.products);
        setCatalogStatus("loaded");
        setCatalogError(null);
      } else {
        setCatalogStatus("error");
        setCatalogError(catalog.errorMessage);
      }
    } catch (err: unknown) {
      if (reqId !== fetchRequestIdRef.current) return;
      const errMsg = err instanceof Error ? err.message : "Erreur lors du chargement du Studio";
      setCatalogStatus("error");
      setCatalogError(errMsg);
      toast.error(errMsg);
    } finally {
      if (reqId === fetchRequestIdRef.current) setLoading(false);
    }
  }, [checkRecoverableBackup, clearLocalBackup, resetHistory, setSaveStatus, setSectionsDirectly, setSelectedSectionId, syncServerDraftRevision]);

  const reloadCatalog = useCallback(async () => {
    setCatalogStatus("loading");
    setCatalogError(null);
    const catalog = await fetchSellerCatalogSafely();
    if (catalog.ok) {
      setProducts(catalog.products);
      setCatalogStatus("loaded");
    } else {
      setCatalogStatus("error");
      setCatalogError(catalog.errorMessage);
      toast.error(catalog.errorMessage || "Impossible de recharger le catalogue");
    }
  }, []);

  useEffect(() => {
    const uid = currentUser?.uid;
    if (activeUserIdRef.current !== uid) {
      activeUserIdRef.current = uid;
      setStoreConfig(null);
      setProducts([]);
      setCatalogStatus("idle");
      setCatalogError(null);
      setHistoryList([]);
      setMediaGallery([]);
      setPublishedLayout(null);
      resetHistory([], undefined, "Changement de session");
    }
    void fetchStudioData();
  }, [currentUser?.uid, fetchStudioData, resetHistory]);

  const applyRecoveredBackup = useCallback(() => {
    if (!recoverableBackup) return;
    pushState(recoverableBackup.sections, undefined, "Restauration sauvegarde locale");
    clearLocalBackup();
    toast.success("Modifications locales non sauvegardées restaurées !");
  }, [clearLocalBackup, pushState, recoverableBackup]);

  const dismissRecoveredBackup = useCallback(() => { clearLocalBackup(); }, [clearLocalBackup]);

  const {
    addSection, updateSection, reorderSections, deleteSection, toggleVisibility, duplicateSection, replaceSections,
  } = buildSectionMutationHandlers({
    sections, selectedSectionId, setSelectedSectionId, pushState,
    activeSector: storeConfig?.theme?.sector, storeWilaya: storeConfig?.wilaya, products,
  });

  const saveStoreConfig = async (
    updatedConfigPayload: Partial<StoreConfig>,
    options?: { skipUndoPush?: boolean }
  ) => {
    try {
      setSaveStatus("saving");
      if (updatedConfigPayload.theme && !options?.skipUndoPush) {
        pushThemeState(updatedConfigPayload.theme, "Palette & Typographie");
      }
      const res = await apiPut<{ success: boolean; data: StoreConfig }>("/api/v1/seller/store/config", updatedConfigPayload);
      if (res?.data) setStoreConfig(res.data);
      setSaveStatus("saved");
      toast.success("Paramètres de la boutique mis à jour !");
    } catch (err: unknown) {
      setSaveStatus("error");
      toast.error(err instanceof Error ? err.message : "Échec de la mise à jour");
      throw err;
    }
  };

  const publishStudio = async (changeSummary?: string): Promise<boolean> => {
    if (isPublishingRef.current) return false;
    isPublishingRef.current = true;
    setIsPublishing(true);
    try {
      setSaveStatus("saving");
      const confirmedRevision = await saveDraft(sections);
      if (confirmedRevision === null) return false;
      await apiPost("/api/v1/seller/studio/layout/publish", {
        changeSummary: changeSummary || "Mise en ligne de la vitrine",
        expectedRevision: confirmedRevision,
      });
      setSaveStatus("saved");
      const targetSlug = storeConfig?.shopSlug || storeConfig?.sellerId || "";
      toast.success(targetSlug ? `Boutique publiée en direct sur /store/${targetSlug} !` : "Boutique publiée avec succès !");
      await fetchStudioData();
      return true;
    } catch (err: unknown) {
      setSaveStatus("error");
      toast.error(err instanceof Error ? err.message : "Échec de la publication");
      return false;
    } finally {
      isPublishingRef.current = false;
      setIsPublishing(false);
    }
  };

  const rollbackVersion = async (versionNumber: number) => {
    try {
      setSaveStatus("saving");
      await apiPost("/api/v1/seller/studio/layout/rollback", {
        versionNumber,
        ...(typeof confirmedServerRevision === "number" ? { expectedRevision: confirmedServerRevision } : {}),
      });
      setSaveStatus("saved");
      toast.success(`Restauration vers version #${versionNumber} effectuée !`);
      await fetchStudioData(true);
    } catch (err: unknown) {
      setSaveStatus("error");
      toast.error(err instanceof Error ? err.message : "Échec de la restauration");
    }
  };

  const saveDraftNow = useCallback(async () => await saveDraft(sections), [saveDraft, sections]);
  const forceOverwriteDraft = useCallback(async () => await saveDraft(sections, true), [saveDraft, sections]);

  return {
    loading, saveStatus, isPublishing, storeConfig, sections, products, catalogStatus, catalogError,
    reloadCatalog, historyList, mediaGallery, publishedLayout, selectedSectionId, setSelectedSectionId,
    hasUnsavedChanges, recoverableBackup, applyRecoveredBackup, dismissRecoveredBackup, addSection,
    updateSection, reorderSections, deleteSection, duplicateSection, toggleVisibility, replaceSections,
    saveStoreConfig, uploadMedia, deleteMedia, isMediaUploading, mediaUploadProgress, mediaUploadError,
    publishStudio, rollbackVersion, saveDraftNow, forceOverwriteDraft, confirmedServerRevision,
    triggerAutoSave, refreshData: fetchStudioData, undo, redo, canUndo, canRedo, currentActionLabel,
  };
}
