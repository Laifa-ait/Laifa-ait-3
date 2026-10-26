import { useCallback } from "react";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { apiPut } from "../../../../lib/api";
import { storage } from "../../../../lib/firebase";
import { MediaGalleryItem, StoreConfig } from "../../../../domains/seller/customPage.types";

interface UseStudioMediaManagerProps {
  userId?: string;
  mediaGallery: MediaGalleryItem[];
  setMediaGallery: React.Dispatch<React.SetStateAction<MediaGalleryItem[]>>;
  setStoreConfig: React.Dispatch<React.SetStateAction<StoreConfig | null>>;
}

export function useStudioMediaManager({
  userId,
  mediaGallery,
  setMediaGallery,
  setStoreConfig,
}: UseStudioMediaManagerProps) {
  const uploadMedia = useCallback(
    async (file: File): Promise<MediaGalleryItem> => {
      if (!userId) throw new Error("Connectez-vous pour importer un média.");
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        throw new Error("Formats acceptés : JPG, PNG, WebP.");
      }
      if (file.size > 5 * 1024 * 1024) throw new Error("5 Mo maximum par image.");

      const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_").slice(-70).replace(/\.[^.]+$/, "") || "image";
      const fileName = `studio_${Date.now()}_${safeName}.${extension}`;
      const fileRef = ref(storage, `shops/${userId}/${fileName}`);

      await uploadBytes(fileRef, file, { contentType: file.type });
      const item: MediaGalleryItem = {
        id: fileName,
        url: await getDownloadURL(fileRef),
        type: "image",
        name: file.name.slice(0, 160),
        sizeBytes: file.size,
        uploadedAt: new Date().toISOString(),
      };

      const nextGallery = [item, ...mediaGallery.filter((e) => e.id !== item.id)].slice(0, 60);
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
    },
    [userId, mediaGallery, setMediaGallery, setStoreConfig]
  );

  const deleteMedia = useCallback(
    async (id: string) => {
      if (!userId || !id.startsWith("studio_")) return;
      const item = mediaGallery.find((entry) => entry.id === id);
      const nextGallery = mediaGallery.filter((entry) => entry.id !== id);
      await apiPut("/api/v1/seller/store/config", {
        mediaGallery: nextGallery.filter((entry) => entry.id.startsWith("studio_")),
      });
      setMediaGallery(nextGallery);
      if (item) await deleteObject(ref(storage, `shops/${userId}/${id}`)).catch(() => undefined);
    },
    [userId, mediaGallery, setMediaGallery]
  );

  return { uploadMedia, deleteMedia };
}
