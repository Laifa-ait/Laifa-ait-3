import { useState, useEffect, useRef, useCallback } from "react";
import { apiGet, apiPut, apiPost } from "../../../../lib/api";
import { useAuth } from "../../../../context/AuthContext";
import {
  StudioDataResponse,
  StoreConfig,
  CustomPageSection,
  StoreHistoryEntry,
  MediaGalleryItem,
  CustomPageSectionType,
} from "../../../../domains/seller/customPage.types";
import { Product } from "../../../../domains/product/product.types";
import { useStudioUndoRedo } from "./useStudioUndoRedo";
import { useStudioSaveManager } from "./useStudioSaveManager";
import { useStudioMediaManager } from "./useStudioMediaManager";
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
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const initialSectionsRef = useRef<CustomPageSection[]>([]);
  const isFetchingRef = useRef(false);
  const hasInitialFetchedRef = useRef(false);

  const {
    saveStatus,
    setSaveStatus,
    hasUnsavedChanges,
    triggerAutoSave,
  } = useStudioSaveManager();

  const { uploadMedia, deleteMedia } = useStudioMediaManager({
    userId: currentUser?.uid,
    mediaGallery,
    setMediaGallery,
    setStoreConfig,
  });

  const {
    sections,
    setSectionsDirectly,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useStudioUndoRedo(initialSectionsRef.current, triggerAutoSave);

  const fetchStudioData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      setLoading(true);
      const [studioRes, prodRes] = await Promise.all([
        apiGet<{ success: boolean; data: StudioDataResponse }>("/api/v1/seller/studio"),
        apiGet<{ success: boolean; products: Product[] }>("/api/v1/seller/products").catch(() => ({ success: true, products: [] })),
      ]);

      if (studioRes && studioRes.success && studioRes.data) {
        setStoreConfig(studioRes.data.storeConfig);
        const draftSections = studioRes.data.draftLayout?.sections || [];
        initialSectionsRef.current = draftSections;
        setSectionsDirectly(draftSections);
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
  }, [setSectionsDirectly]);

  useEffect(() => {
    if (hasInitialFetchedRef.current) return;
    hasInitialFetchedRef.current = true;
    void fetchStudioData();
  }, [fetchStudioData]);

  // Section actions
  const addSection = (type: CustomPageSectionType, defaultSettings: Record<string, unknown>, defaultTitle?: string) => {
    const newSection: CustomPageSection = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type,
      title: defaultTitle || `Section ${type}`,
      settings: defaultSettings as unknown as CustomPageSection["settings"],
      styles: { containerWidth: "contained", paddingY: "md", borderRadius: "none" },
      isVisible: true,
      order: sections.length,
    };
    const updated = [...sections, newSection];
    pushState(updated);
    setSelectedSectionId(newSection.id);
    toast.success("Nouvelle section ajoutée");
  };

  const updateSection = (sectionId: string, updates: Partial<CustomPageSection>) => {
    const updated = sections.map((sec) => (sec.id === sectionId ? { ...sec, ...updates } : sec));
    pushState(updated);
  };

  const reorderSections = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= sections.length) return;
    const updated = [...sections];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    const reordered = updated.map((sec, idx) => ({ ...sec, order: idx }));
    pushState(reordered);
  };

  const deleteSection = (sectionId: string) => {
    const updated = sections.filter((sec) => sec.id !== sectionId);
    pushState(updated);
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(updated[0]?.id || null);
    }
    toast.success("Section supprimée");
  };

  const toggleVisibility = (sectionId: string) => {
    const updated = sections.map((sec) => (sec.id === sectionId ? { ...sec, isVisible: !sec.isVisible } : sec));
    pushState(updated);
  };

  const duplicateSection = (sectionId: string) => {
    const targetIdx = sections.findIndex((sec) => sec.id === sectionId);
    if (targetIdx === -1) return;
    const original = sections[targetIdx];
    const copy: CustomPageSection = {
      ...original,
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: `${original.title || original.type} (Copie)`,
      settings: JSON.parse(JSON.stringify(original.settings || {})),
      styles: JSON.parse(JSON.stringify(original.styles || {})),
    };
    const updated = [...sections];
    updated.splice(targetIdx + 1, 0, copy);
    const reordered = updated.map((sec, idx) => ({ ...sec, order: idx }));
    pushState(reordered);
    setSelectedSectionId(copy.id);
    toast.success("Section dupliquée");
  };

  const replaceSections = (newSections: CustomPageSection[]) => {
    const normalized = newSections.map((sec, idx) => ({
      ...sec,
      order: idx,
    }));
    pushState(normalized);
    if (normalized.length > 0) {
      setSelectedSectionId(normalized[0].id);
    }
    toast.success("Architecture du thème appliquée avec succès !");
  };

  const saveStoreConfig = async (updatedConfigPayload: Partial<StoreConfig>) => {
    try {
      setSaveStatus("saving");
      const res = await apiPut<{ success: boolean; data: StoreConfig }>("/api/v1/seller/store/config", updatedConfigPayload);
      if (res && res.data) setStoreConfig(res.data);
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
      await apiPost("/api/v1/seller/studio/layout/publish", { changeSummary });
      setSaveStatus("saved");
      toast.success("🎉 Boutique publiée avec succès !");
      await fetchStudioData();
    } catch (err: unknown) {
      setSaveStatus("error");
      const msg = err instanceof Error ? err.message : "Échec de la publication";
      toast.error(msg);
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
      const msg = err instanceof Error ? err.message : "Échec de la restauration";
      toast.error(msg);
    }
  };

  return {
    loading,
    saveStatus,
    storeConfig,
    sections,
    products,
    historyList,
    mediaGallery,
    publishedLayout,
    selectedSectionId,
    setSelectedSectionId,
    hasUnsavedChanges,
    addSection,
    updateSection,
    reorderSections,
    deleteSection,
    duplicateSection,
    toggleVisibility,
    replaceSections,
    saveStoreConfig,
    uploadMedia,
    deleteMedia,
    publishStudio,
    rollbackVersion,
    triggerAutoSave,
    refreshData: fetchStudioData,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
