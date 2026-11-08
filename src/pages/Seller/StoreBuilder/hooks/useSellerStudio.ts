import { useState, useEffect, useRef, useCallback } from "react";
import { apiGet, apiPut, apiPost } from "../../../../lib/api";
import { useAuth } from "../../../../context/AuthContext";
import {
  StudioDataResponse,
  StoreConfig,
  CustomPageSection,
  CustomPageTheme,
  StoreHistoryEntry,
  MediaGalleryItem,
  CustomPageSectionType,
} from "../../../../domains/seller/customPage.types";
import { Product } from "../../../../domains/product/product.types";
import { useStudioUndoRedo } from "./useStudioUndoRedo";
import { useStudioSaveManager } from "./useStudioSaveManager";
import { useStudioMediaManager } from "./useStudioMediaManager";
import { useStudioStore } from "../store/useStudioStore";
import { toast } from "react-hot-toast";

export type { SaveStatus } from "./useStudioSaveManager";

export function useSellerStudio() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null);
  const [historyList, setHistoryList] = useState<StoreHistoryEntry[]>([]);
  const [mediaGallery, setMediaGallery] = useState<MediaGalleryItem[]>([]);
  const [publishedLayout, setPublishedLayout] = useState<StudioDataResponse["publishedLayout"]>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const selectedSectionId = useStudioStore((s) => s.selectedSectionId);
  const selectSectionInStore = useStudioStore((s) => s.selectSection);
  const setSelectedSectionId = useCallback((id: string | null) => {
    selectSectionInStore(id);
  }, [selectSectionInStore]);

  const initialSectionsRef = useRef<CustomPageSection[]>([]);
  const isFetchingRef = useRef(false);
  const hasInitialFetchedRef = useRef(false);

  const {
    saveStatus,
    setSaveStatus,
    hasUnsavedChanges,
    saveDraft,
    triggerAutoSave,
    syncServerDraftRevision,
    confirmedServerRevision,
  } = useStudioSaveManager();

  const { uploadMedia, deleteMedia } = useStudioMediaManager({
    userId: currentUser?.uid,
    mediaGallery,
    setMediaGallery,
    setStoreConfig,
  });

  const handleRestoreThemeFromHistory = useCallback((restoredTheme: CustomPageTheme) => {
    setStoreConfig((prev) => (prev ? { ...prev, theme: restoredTheme } : prev));
    void apiPut<{ success: boolean; data: StoreConfig }>("/api/v1/seller/store/config", {
      theme: restoredTheme,
    }).catch(() => {});
  }, []);

  const {
    sections,
    setSectionsDirectly,
    pushState,
    pushThemeState,
    undo,
    redo,
    canUndo,
    canRedo,
    currentActionLabel,
  } = useStudioUndoRedo(initialSectionsRef.current, triggerAutoSave, {
    storageKey: currentUser?.uid ? `olmart_studio_undo_${currentUser.uid}` : "olmart_studio_undo_session",
    initialTheme: storeConfig?.theme,
    onThemeChange: handleRestoreThemeFromHistory,
  });

  const fetchStudioData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      setLoading(true);
      const [studioRes, prodRes] = await Promise.all([
        apiGet<{ success: boolean; data: StudioDataResponse }>("/api/v1/seller/studio"),
        apiGet<{ success: boolean; products: Product[] }>("/api/v1/seller/products").catch(() => ({ success: true, products: [] })),
      ]);

      if (studioRes?.success && studioRes.data) {
        setStoreConfig(studioRes.data.storeConfig);
        const draftSections = studioRes.data.draftLayout?.sections || [];
        syncServerDraftRevision(studioRes.data.draftLayout?.draftRevision ?? 1);
        initialSectionsRef.current = draftSections;
        setSectionsDirectly(draftSections, studioRes.data.storeConfig?.theme);
        setHistoryList(studioRes.data.historyList || []);
        setMediaGallery(studioRes.data.mediaGallery || []);
        setPublishedLayout(studioRes.data.publishedLayout || null);
        if (draftSections.length > 0) {
          setSelectedSectionId(draftSections[0].id);
        }
      }
      if (prodRes && Array.isArray(prodRes.products)) {
        setProducts(prodRes.products);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors du chargement du Studio";
      toast.error(msg);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [setSectionsDirectly, setSelectedSectionId, syncServerDraftRevision]);

  useEffect(() => {
    if (hasInitialFetchedRef.current) return;
    hasInitialFetchedRef.current = true;
    void fetchStudioData();
  }, [fetchStudioData]);

  const addSection = (type: CustomPageSectionType, defaultSettings: Record<string, unknown>, defaultTitle?: string) => {
    const title = defaultTitle || `Section ${type}`;
    const newSection: CustomPageSection = {
      id: `sec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      title,
      settings: defaultSettings as unknown as CustomPageSection["settings"],
      styles: { containerWidth: "contained", paddingY: "md", borderRadius: "none" },
      isVisible: true,
      order: sections.length,
    };
    const updated = [...sections, newSection];
    pushState(updated, undefined, `Ajout section: ${title}`);
    setSelectedSectionId(newSection.id);
    toast.success("Nouvelle section ajoutée");
  };

  const updateSection = (sectionId: string, updates: Partial<CustomPageSection>) => {
    const target = sections.find((s) => s.id === sectionId);
    const label = `Édition: ${target?.title || target?.type || "Section"}`;
    const updated = sections.map((sec) => (sec.id === sectionId ? { ...sec, ...updates } : sec));
    pushState(updated, undefined, label);
  };

  const reorderSections = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= sections.length) return;
    const updated = [...sections];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    const reordered = updated.map((sec, idx) => ({ ...sec, order: idx }));
    pushState(reordered, undefined, "Réorganisation des sections");
  };

  const deleteSection = (sectionId: string) => {
    const target = sections.find((s) => s.id === sectionId);
    const updated = sections.filter((sec) => sec.id !== sectionId);
    pushState(updated, undefined, `Suppression: ${target?.title || target?.type || "Section"}`);
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(updated[0]?.id || null);
    }
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
    const copy: CustomPageSection = {
      ...original,
      id: `sec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: `${original.title || original.type} (Copie)`,
      settings: JSON.parse(JSON.stringify(original.settings || {})),
      styles: JSON.parse(JSON.stringify(original.styles || {})),
    };
    const updated = [...sections];
    updated.splice(targetIdx + 1, 0, copy);
    const reordered = updated.map((sec, idx) => ({ ...sec, order: idx }));
    pushState(reordered, undefined, `Duplication: ${original.title || original.type}`);
    setSelectedSectionId(copy.id);
    toast.success("Section dupliquée");
  };

  const replaceSections = (newSections: CustomPageSection[]) => {
    const normalized = newSections.map((sec, idx) => ({ ...sec, order: idx }));
    pushState(normalized, undefined, "Application modèle de sections");
    if (normalized.length > 0) setSelectedSectionId(normalized[0].id);
    toast.success("Architecture du thème appliquée avec succès !");
  };

  const saveStoreConfig = async (updatedConfigPayload: Partial<StoreConfig>) => {
    try {
      setSaveStatus("saving");
      if (updatedConfigPayload.theme) {
        pushThemeState(updatedConfigPayload.theme, "Palette & Typographie");
      }
      const res = await apiPut<{ success: boolean; data: StoreConfig }>("/api/v1/seller/store/config", updatedConfigPayload);
      if (res?.data) setStoreConfig(res.data);
      setSaveStatus("saved");
      toast.success("Paramètres de la boutique mis à jour !");
    } catch (err: unknown) {
      setSaveStatus("error");
      const msg = err instanceof Error ? err.message : "Erreur de mise à jour";
      toast.error(msg);
      throw err;
    }
  };

  const publishStudio = async (changeSummary?: string) => {
    try {
      setSaveStatus("saving");
      // 1. Garantir l'enregistrement de la révision la plus récente avant publication
      await saveDraft(sections);

      // 2. Publier la révision exacte confirmée par le serveur
      await apiPost("/api/v1/seller/studio/layout/publish", {
        changeSummary: changeSummary || "Mise en ligne de la vitrine",
        expectedRevision: confirmedServerRevision,
      });

      setSaveStatus("saved");
      const targetSlug = storeConfig?.shopSlug || storeConfig?.sellerId || "";
      toast.success(targetSlug ? `Boutique publiée en direct sur /store/${targetSlug} !` : "Boutique publiée avec succès !");
      await fetchStudioData();
    } catch (err: unknown) {
      setSaveStatus("error");
      toast.error(err instanceof Error ? err.message : "Échec de la publication");
    }
  };

  const rollbackVersion = async (versionNumber: number) => {
    try {
      setSaveStatus("saving");
      await apiPost("/api/v1/seller/studio/layout/rollback", { versionNumber });
      setSaveStatus("saved");
      toast.success(`Restauration vers version #${versionNumber} effectuée !`);
      await fetchStudioData();
    } catch (err: unknown) {
      setSaveStatus("error");
      toast.error(err instanceof Error ? err.message : "Échec de la restauration");
    }
  };

  return {
    loading, saveStatus, storeConfig, sections, products, historyList, mediaGallery,
    publishedLayout, selectedSectionId, setSelectedSectionId, hasUnsavedChanges,
    addSection, updateSection, reorderSections, deleteSection, duplicateSection,
    toggleVisibility, replaceSections, saveStoreConfig, uploadMedia, deleteMedia,
    publishStudio, rollbackVersion, triggerAutoSave, refreshData: fetchStudioData,
    undo, redo, canUndo, canRedo, currentActionLabel,
  };
}
