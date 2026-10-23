/**
 * Optimiseur d'images pour Olma Auto avec vérification des Magic Bytes (Anti-Spoofing)
 * et compression client en WebP haute définition (<500 Ko).
 */

export interface MagicBytesResult {
  valid: boolean;
  format?: "jpeg" | "png" | "webp" | "gif";
  error?: string;
}

export function checkImageMagicBytes(buffer: ArrayBuffer): MagicBytesResult {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 12) {
    return { valid: false, error: "Fichier trop court ou corrompu" };
  }

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { valid: true, format: "jpeg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { valid: true, format: "png" };
  }

  // GIF: 47 49 46 38
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return { valid: true, format: "gif" };
  }

  // WEBP: RIFF....WEBP (52 49 46 46 .... 57 45 42 50)
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { valid: true, format: "webp" };
  }

  return {
    valid: false,
    error: "Signature binaire invalide. Seuls JPEG, PNG et WebP réels sont acceptés.",
  };
}

export async function validateAndCompressAutoImage(
  file: File,
  maxWidth = 1440,
  maxHeight = 1440,
  quality = 0.8
): Promise<string> {
  // 1. Contrôle des Magic Bytes sur les 16 premiers octets
  const headerSlice = await file.slice(0, 16).arrayBuffer();
  const magicCheck = checkImageMagicBytes(headerSlice);
  if (!magicCheck.valid) {
    throw new Error(magicCheck.error || "Type de fichier non autorisé ou en-tête altéré");
  }

  // 2. Décodage et compression Canvas
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Erreur de lecture du fichier image"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Impossible de décoder les pixels de l'image"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(e.target?.result as string);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const webpData = canvas.toDataURL("image/webp", quality);
          if (webpData.startsWith("data:image/webp")) {
            return resolve(webpData);
          }
        } catch {
          // Fallback silencieux
        }

        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
