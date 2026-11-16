import React, { useState, useRef } from "react";
import {
  CustomPageSection,
  MediaFolderCategory,
  MediaGalleryItem,
  SellerStoreConfig,
} from "../../../../../domains/seller/customPage.types";
import { Image as ImageIcon, Loader2, Search, Upload } from "lucide-react";
import { MediaCard } from "./MediaCard";
import { MediaSelectedInspector } from "./MediaSelectedInspector";
import {
  findMediaUsageInSections,
  isSystemOrCatalogMedia,
  validateMediaFile,
} from "../../utils/studioMediaValidation";

export { findMediaUsageInSections };

interface MediaInspectorPanelProps {
  mediaGallery: MediaGalleryItem[];
  sections?: CustomPageSection[];
  storeConfig?: SellerStoreConfig | null;
  onSelectMediaUrl?: (url: string) => void;
  onReplaceMediaUrl?: (oldUrl: string, newUrl: string) => Promise<number>;
  onUploadMedia?: (file: File, options?: { folder?: MediaFolderCategory; allowVideo?: boolean }) => Promise<MediaGalleryItem>;
  onDeleteMedia?: (id: string) => Promise<void>;
  isUploading?: boolean;
  uploadProgress?: number;
  uploadError?: string | null;
  onSaveConfig?: (updatedConfig: Partial<SellerStoreConfig>) => Promise<void>;
}

const FOLDER_TABS: Array<{ id: "all" | MediaFolderCategory; label: string }> = [
  { id: "all", label: "Tous" },
  { id: "images", label: "Images" },
  { id: "logos", label: "Logos" },
  { id: "banners", label: "Bannières" },
  { id: "collections", label: "Collections" },
  { id: "videos", label: "Vidéos" },
];

export const MediaInspectorPanel: React.FC<MediaInspectorPanelProps> = ({
  mediaGallery, sections = [], storeConfig, onSelectMediaUrl, onReplaceMediaUrl,
  onUploadMedia, onDeleteMedia, isUploading: externalUploading = false,
  uploadProgress = 0, uploadError: externalUploadError = null, onSaveConfig,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [folderFilter, setFolderFilter] = useState<"all" | MediaFolderCategory>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video">("all");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [localOverrides, setLocalOverrides] = useState<Record<string, { name?: string; folder?: MediaFolderCategory; dims?: string }>>({});
  const [localUploading, setLocalUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localUploadError, setLocalUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUploading = localUploading || externalUploading;
  const displayedError = localUploadError || externalUploadError;

  const enrichedGallery: MediaGalleryItem[] = mediaGallery.map((m) => ({
    ...m,
    name: localOverrides[m.id]?.name ?? m.name,
    folder: localOverrides[m.id]?.folder ?? m.folder ?? (m.type === "video" ? "videos" : "images"),
  }));

  const filteredMedia = enrichedGallery.filter((item) => {
    const matchesSearch = (item.name || item.url).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = folderFilter === "all" || (item.folder || "images") === folderFilter;
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesFolder && matchesType;
  });

  const selectedMedia = enrichedGallery.find((m) => m.id === selectedMediaId) || null;
  const selectedUsages = selectedMedia ? findMediaUsageInSections(selectedMedia.url, sections, storeConfig) : [];

  const handleCopy = (url: string) => {
    if (navigator.clipboard) navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    if (onSelectMediaUrl) onSelectMediaUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadMedia) return;
    setLocalUploadError(null);
    setLocalUploading(true);
    try {
      const descriptor = await validateMediaFile(file, { allowVideo: true });
      const targetFolder: MediaFolderCategory =
        descriptor.kind === "video"
          ? "videos"
          : folderFilter !== "all" && folderFilter !== "videos"
          ? folderFilter
          : "images";
      const uploaded = await onUploadMedia(file, { folder: targetFolder, allowVideo: true });
      setSelectedMediaId(uploaded.id);
    } catch (err) {
      setLocalUploadError(err instanceof Error ? err.message : "Échec de l'import");
    } finally {
      setLocalUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveRenameOrFolder = async (item: MediaGalleryItem, patch: { name?: string; folder?: MediaFolderCategory }) => {
    setLocalOverrides((prev) => ({ ...prev, [item.id]: { ...prev[item.id], ...patch } }));
    if (onSaveConfig && !isSystemOrCatalogMedia(item.id)) {
      const source = storeConfig?.mediaGallery && storeConfig.mediaGallery.length > 0
        ? storeConfig.mediaGallery
        : enrichedGallery.filter((entry) => !isSystemOrCatalogMedia(entry.id));
      const updated = source.some((m) => m.id === item.id)
        ? source.map((m) => (m.id === item.id ? { ...m, ...patch } : m))
        : [{ ...item, ...patch }, ...source];
      await onSaveConfig({ mediaGallery: updated });
    }
  };

  const executeDelete = async (id: string) => {
    if (!onDeleteMedia || isSystemOrCatalogMedia(id)) return;
    setDeletingId(id);
    try {
      await onDeleteMedia(id);
      if (selectedMediaId === id) setSelectedMediaId(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 space-y-4 select-none" data-testid="media-inspector-panel">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-900">Médiathèque</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Images, vidéos et vérification d&apos;usage</p>
        </div>
        {onUploadMedia && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
              onChange={handleFileChange}
              className="hidden"
              data-testid="media-file-input"
            />
            <button
              type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}
              data-testid="media-upload-btn"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11.5px] font-medium disabled:opacity-60 cursor-pointer"
            >
              {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span>Importer</span>
            </button>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5" data-testid="media-upload-progress">
          <div className="flex justify-between text-[11px] font-semibold text-slate-700">
            <span>Envoi sécurisé en cours...</span>
            <span>{Math.max(0, Math.min(100, Math.round(uploadProgress)))}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full bg-[#023859] transition-all duration-200" style={{ width: `${Math.max(5, Math.min(100, uploadProgress))}%` }} />
          </div>
        </div>
      )}

      {displayedError && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-700 font-medium" data-testid="media-upload-error">
          {displayedError}
        </div>
      )}

      <div className="space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom de fichier..." data-testid="media-search-input"
            className="w-full h-8.5 ps-8 pe-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:border-slate-900 focus:outline-none"
          />
        </div>
        <div className="flex gap-1" data-testid="media-type-tabs">
          {(["all", "image", "video"] as const).map((t) => (
            <button
              key={t} type="button" data-testid={`media-type-tab-${t}`} onClick={() => setTypeFilter(t)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer ${typeFilter === t ? "bg-[#023859] text-white border-[#023859]" : "bg-slate-50 text-slate-600 border-slate-200"}`}
            >
              {t === "all" ? "Tout" : t === "image" ? "Images" : "Vidéos"}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1" data-testid="media-folder-tabs">
          {FOLDER_TABS.map((tab) => (
            <button
              key={tab.id} type="button" data-testid={`media-folder-tab-${tab.id}`} onClick={() => setFolderFilter(tab.id)}
              className={`px-2 py-1 rounded-md text-[10.5px] font-medium border cursor-pointer ${folderFilter === tab.id ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {selectedMedia && (
        <MediaSelectedInspector
          key={selectedMedia.id}
          selectedMedia={selectedMedia}
          allMedia={enrichedGallery}
          selectedUsages={selectedUsages}
          copiedUrl={copiedUrl}
          dims={localOverrides[selectedMedia.id]?.dims}
          deletingId={deletingId}
          onCopy={handleCopy}
          onDetectedDimensions={(id, dims) => setLocalOverrides((prev) => ({ ...prev, [id]: { ...prev[id], dims } }))}
          onSaveRenameOrFolder={handleSaveRenameOrFolder}
          onConfirmDelete={onDeleteMedia ? executeDelete : undefined}
          onReplaceUrl={onReplaceMediaUrl}
        />
      )}

      {filteredMedia.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/60 p-4">
          <ImageIcon className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
          <p className="text-xs font-medium text-slate-700">Aucun média dans ce filtre</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {filteredMedia.map((item) => (
            <MediaCard
              key={item.id} item={item} isSelected={selectedMediaId === item.id} isCopied={copiedUrl === item.url}
              inUseCount={findMediaUsageInSections(item.url, sections, storeConfig).length}
              onSelect={() => { setSelectedMediaId(item.id); if (onSelectMediaUrl) onSelectMediaUrl(item.url); }}
              onCopy={handleCopy}
            />
          ))}
        </div>
      )}
    </div>
  );
};
