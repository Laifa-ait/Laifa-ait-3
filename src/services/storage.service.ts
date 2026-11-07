import { ref, uploadBytes, getDownloadURL, uploadBytesResumable, UploadTaskSnapshot } from "firebase/storage";
import { storage } from "../lib/firebase";

/**
 * Converts an image Blob/File into a compressed JPEG Data URL (max 960px, quality 0.72)
 * so it can be persisted directly in Firestore when Firebase Storage is unavailable
 * (e.g. HTTP 402 Delinquent Billing on the bucket).
 */
export async function blobToCompressedDataUrl(file: Blob | File, maxDim = 960, quality = 0.72): Promise<string> {
  if (typeof document === "undefined" || typeof Image === "undefined") {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Impossible de lire le fichier image."));
      reader.readAsDataURL(file);
    });
  }

  return new Promise<string>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.max(1, Math.round(width * ratio));
        height = Math.max(1, Math.round(height * ratio));
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Contexte Canvas 2D indisponible."));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Impossible de décoder l'image."));
      reader.readAsDataURL(file);
    };
    img.src = objectUrl;
  });
}

async function isStorageUrlAccessible(url: string): Promise<boolean> {
  if (typeof fetch !== "function" || !url.startsWith("http")) return true;
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function uploadFile(
  path: string,
  file: Blob | File,
  metadata?: Record<string, string>
): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file, metadata ? { customMetadata: metadata } : undefined);
    const downloadUrl = await getDownloadURL(storageRef);
    if (await isStorageUrlAccessible(downloadUrl)) {
      return downloadUrl;
    }
    return await blobToCompressedDataUrl(file);
  } catch {
    return await blobToCompressedDataUrl(file);
  }
}

export function uploadFileWithProgress(
  path: string,
  file: Blob | File,
  onProgress: (progress: number) => void,
  onError: (err: Error) => void,
  onComplete: (url: string) => void
): () => void {
  let cancelled = false;
  try {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot: UploadTaskSnapshot) => {
        if (cancelled) return;
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      async () => {
        if (cancelled) return;
        try {
          onProgress(90);
          const fallbackDataUrl = await blobToCompressedDataUrl(file);
          onProgress(100);
          onComplete(fallbackDataUrl);
        } catch (fallbackErr) {
          onError(fallbackErr instanceof Error ? fallbackErr : new Error(String(fallbackErr)));
        }
      },
      async () => {
        if (cancelled) return;
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          if (await isStorageUrlAccessible(downloadUrl)) {
            onComplete(downloadUrl);
          } else {
            const fallbackDataUrl = await blobToCompressedDataUrl(file);
            onComplete(fallbackDataUrl);
          }
        } catch {
          try {
            const fallbackDataUrl = await blobToCompressedDataUrl(file);
            onComplete(fallbackDataUrl);
          } catch (fallbackErr) {
            onError(fallbackErr instanceof Error ? fallbackErr : new Error(String(fallbackErr)));
          }
        }
      }
    );

    return () => {
      cancelled = true;
      uploadTask.cancel();
    };
  } catch {
    blobToCompressedDataUrl(file)
      .then((dataUrl) => {
        if (!cancelled) {
          onProgress(100);
          onComplete(dataUrl);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          onError(err instanceof Error ? err : new Error(String(err)));
        }
      });
    return () => {
      cancelled = true;
    };
  }
}

