import {
  BANNER_COLOR_THEMES,
  BannerColorThemePreset,
  BannerContentPosition,
  BannerImageFit,
  BannerImagePosition,
  BannerRedirectType,
  BannerShadowIntensity,
  BannerTextAlign,
  BannerTranslationFields,
  BannerZone,
  CompressResult,
  DbBanner,
  PromoBanner,
  TagType,
  WilayaBannerData,
  WilayaCampaign,
} from "../../types/bannerAdmin";

export type {
  BannerColorThemePreset,
  BannerContentPosition,
  BannerImageFit,
  BannerImagePosition,
  BannerRedirectType,
  BannerShadowIntensity,
  BannerTextAlign,
  BannerTranslationFields,
  BannerZone,
  CompressResult,
  DbBanner,
  PromoBanner,
  TagType,
  WilayaBannerData,
  WilayaCampaign,
};
export { BANNER_COLOR_THEMES };

export const compressAndResizeImage = (
  file: File,
  targetW: number,
  targetH: number
): Promise<CompressResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Impossible d'initialiser le processeur d'image"));
          return;
        }
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const targetRatio = targetW / targetH;
        let drawW = targetW;
        let drawH = targetH;
        let offsetX = 0;
        let offsetY = 0;
        if (imgRatio > targetRatio) {
          drawW = targetH * imgRatio;
          offsetX = (targetW - drawW) / 2;
        } else {
          drawH = targetW / imgRatio;
          offsetY = (targetH - drawH) / 2;
        }
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve({ blob, base64: dataUrl });
            else reject(new Error("Échec de la compression de l'image"));
          },
          "image/jpeg",
          0.85
        );
      };
      img.onerror = () => reject(new Error("Impossible de lire l'image sélectionnée"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
    reader.readAsDataURL(file);
  });
};
