import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { apiPut } from "../../../../lib/api";
import { deleteStorageFile, uploadFileStrictWithProgress } from "../../../../services/storage.service";
import { MediaFolderCategory, MediaGalleryItem, StoreConfig } from "../../../../domains/seller/customPage.types";
import {
  isSystemOrCatalogMedia,
  optimizeImageFileAndReadDimensions,
  validateMediaFile,
} from "../utils/studioMediaValidation";

export const MAX_STUDIO_GALLERY_ITEMS = 500;

export interface UploadStudioMediaOptions {
  folder?: MediaFolderCategory;
  allowVideo?: boolean;
}

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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadMedia = useCallback(
    async (file: File, options: UploadStudioMediaOptions = {}): Promise<MediaGalleryItem> => {
      if (!userId) {
        const msg = "Connectez-vous pour importer un média.";
        setUploadError(msg);
        throw new Error(msg);
      }
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      try {
        const allowVideo = options.allowVideo ?? true;
        const descriptor = await validateMediaFile(file, { allowVideo });

        let payloadBlob: Blob = file;
        let finalMime = descriptor.mimeType;
        let finalExt = descriptor.extension;
        let width: number | undefined;
        let height: number | undefined;

        if (descriptor.kind === "image") {
          const optimized = await optimizeImageFileAndReadDimensions(file);
          payloadBlob = optimized.blob;
          finalMime = optimized.mimeType || descriptor.mimeType;
          width = optimized.width;
          height = optimized.height;
          if (finalMime === "image/webp") finalExt = "webp";
          else if (finalMime === "image/png") finalExt = "png";
        }

        const safeName =
          file.name.replace(/[^a-zA-Z0-9_.-]/g, "_").slice(-70).replace(/\.[^.]+$/, "") ||
          (descriptor.kind === "video" ? "video" : "image");
        const fileName = `studio_${Date.now()}_${safeName}.${finalExt}`;
        const storagePath =
          descriptor.kind === "video" ? `shops/${userId}/videos/${fileName}` : `shops/${userId}/${fileName}`;

        const resolvedUrl = await uploadFileStrictWithProgress(storagePath, payloadBlob, {
          contentType: finalMime,
          customMetadata: { sellerId: userId, kind: descriptor.kind },
          onProgress: (pct) => setUploadProgress(pct),
        });

        const item: MediaGalleryItem = {
          id: fileName,
          url: resolvedUrl,
          type: descriptor.kind,
          name: file.name.slice(0, 160),
          folder: options.folder || (descriptor.kind === "video" ? "videos" : "images"),
          width,
          height,
          mimeType: finalMime,
          sizeBytes: payloadBlob.size || file.size,
          storagePath,
          uploadedAt: new Date().toISOString(),
        };

        const deduplicated = [item, ...mediaGallery.filter((e) => e.id !== item.id)];
        if (deduplicated.length > MAX_STUDIO_GALLERY_ITEMS) {
          toast("Capacité maximale de la médiathèque atteinte (500 médias). Les éléments les plus anciens ne sont plus listés.");
        }
        const nextGallery = deduplicated.slice(0, MAX_STUDIO_GALLERY_ITEMS);
        try {
          const response = await apiPut<{ success: boolean; data: StoreConfig }>("/api/v1/seller/store/config", {
            mediaGallery: nextGallery.filter((entry) => !isSystemOrCatalogMedia(entry.id)),
          });
          if (response?.data) setStoreConfig(response.data);
          setMediaGallery(nextGallery);
          setUploadProgress(100);
          return item;
        } catch (configError) {
          await deleteStorageFile(storagePath).catch(() => undefined);
          throw configError;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Échec de l'import média.";
        setUploadError(msg);
        throw err instanceof Error ? err : new Error(msg);
      } finally {
        setIsUploading(false);
      }
    },
    [userId, mediaGallery, setMediaGallery, setStoreConfig]
  );

  const deleteMedia = useCallback(
    async (id: string) => {
      if (!userId || isSystemOrCatalogMedia(id)) return;
      const item = mediaGallery.find((entry) => entry.id === id);
      const nextGallery = mediaGallery.filter((entry) => entry.id !== id);
      await apiPut("/api/v1/seller/store/config", {
        mediaGallery: nextGallery.filter((entry) => !isSystemOrCatalogMedia(entry.id)),
      });
      setMediaGallery(nextGallery);
      const targetPath =
        item?.storagePath ||
        (item?.type === "video" ? `shops/${userId}/videos/${id}` : `shops/${userId}/${id}`);
      if (targetPath && (id.startsWith("studio_") || Boolean(item?.storagePath))) {
        await deleteStorageFile(targetPath).catch(() => undefined);
      }
    },
    [userId, mediaGallery, setMediaGallery]
  );

  return { uploadMedia, deleteMedia, isUploading, uploadProgress, uploadError };
}
