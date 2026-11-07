import toast from "react-hot-toast";
import { compressAndResizeImage } from "./useBannerTypes";
import { generateClientUUID } from "../../utils/secureCrypto";
import { uploadFileWithProgress } from "../../services/storage.service";

export async function uploadBannerImageAsset(
  file: File | undefined,
  variant: "desktop" | "mobile",
  maxW: number,
  maxH: number,
  toastId: string,
  setUploading: (val: boolean) => void,
  setProgress: (val: number) => void,
  setTargetUrl: (val: string) => void
): Promise<void> {
  if (!file) return;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    toast.error("Format de fichier non supporté. JPG, PNG et WebP uniquement.");
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    toast.error("Le fichier dépasse la limite maximale de 10 Mo.");
    return;
  }
  setUploading(true);
  setProgress(0);
  try {
    toast.loading("Optimisation, redimensionnement et compression...", { id: toastId });
    const { blob } = await compressAndResizeImage(file, maxW, maxH);
    const uuid = generateClientUUID().substring(0, 12);
    const storagePath = `banners/${variant}_${uuid}_${file.name.replace(/\s+/g, "_")}`;
    const finalUrl = await new Promise<string>((resolve, reject) => {
      uploadFileWithProgress(
        storagePath,
        blob,
        (progress) => setProgress(Math.round(progress)),
        (error) => reject(error),
        (url) => resolve(url)
      );
    });
    setTargetUrl(finalUrl);
    toast.success(
      variant === "desktop"
        ? "Image Desktop importée et optimisée (1920x1080) !"
        : "Image Mobile importée et optimisée (1080x1080) !",
      { id: toastId }
    );
  } catch (err: unknown) {
    toast.error(
      `Erreur d'importation: ${err instanceof Error ? err.message : "Veuillez réessayer."}`,
      { id: toastId }
    );
  } finally {
    setUploading(false);
  }
}
