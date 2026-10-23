import { useState, useEffect, useRef, useCallback } from "react";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { apiGet, apiPut, apiPost } from "../../../../lib/api";
import { storage } from "../../../../lib/firebase";
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
import { toast } from "react-hot-toast";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useSellerStudio() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null);
  const [sections, setSections] = useState<CustomPageSection[]>([]);
  const [historyList, setHistoryList] = useState<StoreHistoryEntry[]>([]);
  const [mediaGallery, setMediaGallery] = useState<MediaGalleryItem[]>([]);
  const [publishedLayout, setPublishedLayout] = useState<StudioDataResponse["publishedLayout"]>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const initialLoadDone = useRef(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStudioData = useCallback(async () => {
    try {
      setLoading(true);
      const [studioRes, prodRes] = await Promise.all([
        apiGet<{ success: boolean; data: StudioDataResponse }>("/api/v1/seller/studio"),
        apiGet<{ success: boolean; products: Product[] }>("/api/v1/seller/products").catch(() => ({ success: true, products: [] })),
      ]);

      if (studioRes && studioRes.success && studioRes.data) {
        setStoreConfig(studioRes.data.storeConfig);
        const draftSections = studioRes.data.draftLayout?.sections || [];
        setSections(draftSections);
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
      setLoading(false);
      initialLoadDone.current = true;
    }
  }, []);

  useEffect(() => {
    fetchStudioData();
  }, [fetchStudioData]);

  // Debounced auto-save for sections draft (1500ms)
  const saveDraft = useCallback(async (currentSections: CustomPageSection[]) => {
    try {
      setSaveStatus("saving");
      await apiPut("/api/v1/seller/studio/layout/draft", { sections: currentSections });
      setSaveStatus("saved");
      setHasUnsavedChanges(false);
    } catch (err: unknown) {
      setSaveStatus("error");
      const msg = err instanceof Error ? err.message : "Échec de la sauvegarde du brouillon";
      toast.error(msg);
    }
  }, []);

  const triggerAutoSave = useCallback((updatedSections: CustomPageSection[]) => {
    setSections(updatedSections);
    setHasUnsavedChanges(true);

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveDraft(updatedSections);
    }, 1500);
  }, [saveDraft]);

  // Actions on sections
  const addSection = (type: CustomPageSectionType, defaultSettings: Record<string, unknown>, defaultTitle?: string) => {
    const newSection: CustomPageSection = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type,
      title: defaultTitle || `Section ${type}`,
      settings: defaultSettings as unknown as CustomPageSection["settings"],
      styles: {
        containerWidth: "contained",
        paddingY: "md",
        borderRadius: "none",
      },
      isVisible: true,
      order: sections.length,
    };

    const updated = [...sections, newSection];
    triggerAutoSave(updated);
    setSelectedSectionId(newSection.id);
    toast.success("Nouvelle section ajoutée");
  };

  const updateSection = (sectionId: string, updates: Partial<CustomPageSection>) => {
    const updated = sections.map((sec) => (sec.id === sectionId ? { ...sec, ...updates } : sec));
    triggerAutoSave(updated);
  };

  const reorderSections = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= sections.length) return;
    const updated = [...sections];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    const reordered = updated.map((sec, idx) => ({ ...sec, order: idx }));
    triggerAutoSave(reordered);
  };

  const deleteSection = (sectionId: string) => {
    const updated = sections.filter((sec) => sec.id !== sectionId);
    triggerAutoSave(updated);
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(updated[0]?.id || null);
    }
    toast.success("Section supprimée");
  };

  const toggleVisibility = (sectionId: string) => {
    const updated = sections.map((sec) => (sec.id === sectionId ? { ...sec, isVisible: !sec.isVisible } : sec));
    triggerAutoSave(updated);
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
    triggerAutoSave(reordered);
    setSelectedSectionId(copy.id);
    toast.success("Section dupliquée");
  };

  // Actions on Config & Studio Lifecycle
  const saveStoreConfig = async (updatedConfigPayload: Partial<StoreConfig>) => {
    try {
      setSaveStatus("saving");
      const res = await apiPut<{ success: boolean; data: StoreConfig }>("/api/v1/seller/store/config", updatedConfigPayload);
      if (res && res.data) {
        setStoreConfig(res.data);
      }
      setSaveStatus("saved");
      toast.success("Paramètres de la boutique mis à jour !");
    } catch (err: unknown) {
      setSaveStatus("error");
      const msg = err instanceof Error ? err.message : "Erreur de mise à jour";
      toast.error(msg);
      throw err;
    }
  };

  const uploadMedia = useCallback(async (file: File): Promise<MediaGalleryItem> => {
    if (!currentUser?.uid) throw new Error("Connectez-vous pour importer un média.");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      throw new Error("Formats acceptés : JPG, PNG et WebP.");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Chaque image doit faire 5 Mo maximum.");
    }

    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_").slice(-70).replace(/\.[^.]+$/, "") || "image";
    const fileName = `studio_${Date.now()}_${safeName}.${extension}`;
    const fileRef = ref(storage, `shops/${currentUser.uid}/${fileName}`);
    await uploadBytes(fileRef, file, { contentType: file.type });
    const item: MediaGalleryItem = {
      id: fileName,
      url: await getDownloadURL(fileRef),
      type: "image",
      name: file.name.slice(0, 160),
      sizeBytes: file.size,
      uploadedAt: new Date().toISOString(),
    };

    const nextGallery = [item, ...mediaGallery.filter((existing) => existing.id !== item.id)].slice(0, 60);
    try {
      const response = await apiPut<{ success: boolean; data: StoreConfig }>("/api/v1/seller/store/config", {
        mediaGallery: nextGallery.filter((entry) => entry.id.startsWith("studio_")),
      });
      if (response?.data) setStoreConfig(response.data);
      setMediaGallery(nextGallery);
      return item;
    } catch (error) {
      await deleteObject(fileRef).catch(() => undefined);
      throw error;
    }
  }, [currentUser?.uid, mediaGallery]);

  const deleteMedia = useCallback(async (id: string) => {
    if (!currentUser?.uid || !id.startsWith("studio_")) return;
    const item = mediaGallery.find((entry) => entry.id === id);
    const nextGallery = mediaGallery.filter((entry) => entry.id !== id);
    await apiPut("/api/v1/seller/store/config", {
      mediaGallery: nextGallery.filter((entry) => entry.id.startsWith("studio_")),
    });
    setMediaGallery(nextGallery);
    if (item) await deleteObject(ref(storage, `shops/${currentUser.uid}/${id}`)).catch(() => undefined);
  }, [currentUser?.uid, mediaGallery]);

  const publishStudio = async (changeSummary?: string) => {
    try {
      setSaveStatus("saving");
      await apiPost("/api/v1/seller/studio/layout/publish", { changeSummary });
      setSaveStatus("saved");
      toast.success("🎉 Votre boutique a été publiée avec succès !");
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
      toast.success(`Restauration vers la version #${versionNumber} effectuée !`);
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
    saveStoreConfig,
    uploadMedia,
    deleteMedia,
    publishStudio,
    rollbackVersion,
    triggerAutoSave,
    refreshData: fetchStudioData,
  };
}
