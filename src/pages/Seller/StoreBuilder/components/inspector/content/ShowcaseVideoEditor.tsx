import React, { useRef, useState } from "react";
import { Film, Upload } from "lucide-react";
import { Product } from "../../../../../../domains/product/product.types";
import { StudioImagePicker } from "./StudioImagePicker";
import { useStudioMediaContext } from "../../../context/StudioMediaContext";
import { isValidDirectVideoUrl, validateMediaFile } from "../../../utils/studioMediaValidation";

interface ShowcaseVideoEditorProps {
  settings: Record<string, unknown>;
  products?: Product[];
  inputClass: string;
  labelClass: string;
  onSettingsChange: (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => void;
}

export const ShowcaseVideoEditor: React.FC<ShowcaseVideoEditorProps> = ({
  settings,
  products = [],
  inputClass,
  labelClass,
  onSettingsChange,
}) => {
  const { mediaGallery, onUploadMedia } = useStudioMediaContext();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const videoUrl = String(settings.videoUrl || "").trim();
  const isUrlValid = isValidDirectVideoUrl(videoUrl);
  const isAutoplay = Boolean(settings.autoplay);
  const libraryVideos = mediaGallery.filter((m) => m.type === "video");

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoError(null);
    setIsUploading(true);
    try {
      const desc = await validateMediaFile(file, { allowVideo: true });
      if (desc.kind !== "video") {
        throw new Error("Sélectionnez un fichier vidéo MP4 ou WebM (25 Mo max).");
      }
      if (!onUploadMedia) {
        throw new Error("Import vidéo indisponible hors contexte Studio.");
      }
      const item = await onUploadMedia(file, { folder: "videos", allowVideo: true });
      onSettingsChange("videoUrl", item.url);
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : "Échec de l'import vidéo.");
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3 pt-1 select-none" data-testid="showcase-video-editor">
      <div>
        <label className={labelClass}>Titre de la section vidéo</label>
        <input
          value={(settings.title as string) || ""}
          onChange={(e) => onSettingsChange("title", e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Sous-titre</label>
        <input
          value={(settings.subtitle as string) || ""}
          onChange={(e) => onSettingsChange("subtitle", e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label className={labelClass}>Lien Vidéo directe (MP4 / WebM)</label>
          {onUploadMedia && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="video/mp4,video/webm"
                onChange={handleVideoFileChange}
                className="hidden"
                data-testid="showcase-video-file-input"
              />
              <button
                type="button"
                disabled={isUploading}
                data-testid="showcase-video-upload-btn"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900 text-white text-[10px] font-semibold cursor-pointer disabled:opacity-60"
              >
                <Upload className="w-3 h-3" />
                <span>{isUploading ? "Envoi..." : "Importer MP4/WebM"}</span>
              </button>
            </>
          )}
        </div>
        <input
          data-testid="showcase-video-url-input"
          value={videoUrl}
          onChange={(e) => onSettingsChange("videoUrl", e.target.value)}
          className={inputClass}
          placeholder="https://.../studio.mp4"
        />
        {!isUrlValid && (
          <p data-testid="showcase-video-url-error" className="text-[10.5px] font-medium text-rose-600">
            Adresse vidéo invalide : utilisez un lien HTTPS (.mp4 / .webm) sans script ni Base64.
          </p>
        )}
        {videoError && (
          <p data-testid="showcase-video-upload-error" className="text-[10.5px] font-medium text-rose-600">
            {videoError}
          </p>
        )}
        {libraryVideos.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {libraryVideos.map((vid) => (
              <button
                key={vid.id}
                type="button"
                onClick={() => onSettingsChange("videoUrl", vid.url)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-medium cursor-pointer ${
                  videoUrl === vid.url ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                <Film className="w-3 h-3" />
                <span className="max-w-[120px] truncate">{vid.name || vid.id}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-700 cursor-pointer">
          <span>Lecture auto (muet)</span>
          <input
            type="checkbox"
            data-testid="showcase-video-autoplay"
            checked={isAutoplay}
            onChange={(e) => onSettingsChange({ autoplay: e.target.checked, ...(e.target.checked ? { muted: true } : {}) })}
            className="accent-[var(--studio-primary)]"
          />
        </label>
        <label className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-700 cursor-pointer">
          <span>En boucle</span>
          <input
            type="checkbox"
            data-testid="showcase-video-loop"
            checked={Boolean(settings.loop)}
            onChange={(e) => onSettingsChange("loop", e.target.checked)}
            className="accent-[var(--studio-primary)]"
          />
        </label>
      </div>
      <StudioImagePicker
        label="Image de couverture"
        value={(settings.coverImageUrl as string) || ""}
        onChange={(val) => onSettingsChange("coverImageUrl", val)}
        products={products}
      />
    </div>
  );
};
