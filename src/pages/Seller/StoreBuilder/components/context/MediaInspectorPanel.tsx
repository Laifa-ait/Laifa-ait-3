import React, { useState, useRef } from "react";
import { MediaGalleryItem } from "../../../../../domains/seller/customPage.types";
import {
  Upload,
  Search,
  Trash2,
  CheckCircle2,
  FileImage,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { MediaCard } from "./MediaCard";

interface MediaInspectorPanelProps {
  mediaGallery: MediaGalleryItem[];
  onSelectMediaUrl?: (url: string) => void;
  onUploadMedia?: (files: FileList) => Promise<void>;
  onDeleteMedia?: (id: string) => void;
}

export const MediaInspectorPanel: React.FC<MediaInspectorPanelProps> = ({
  mediaGallery,
  onSelectMediaUrl,
  onDeleteMedia,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "images" | "logos" | "banners">("all");
  const [selectedMedia, setSelectedMedia] = useState<MediaGalleryItem | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [localItems, setLocalItems] = useState<MediaGalleryItem[]>(mediaGallery);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = (url: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedUrl(url);
    toast.success("Adresse de l'image copiée !");
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newItem: MediaGalleryItem = {
            id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: file.name,
            url: event.target.result as string,
            type: "image",
            sizeBytes: file.size,
          };
          setLocalItems((prev) => [newItem, ...prev]);
        }
      };
      reader.readAsDataURL(file);
    });

    toast.success(`${files.length} média(s) importé(s) avec succès !`);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = (id: string) => {
    setLocalItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedMedia?.id === id) {
      setSelectedMedia(null);
    }
    if (onDeleteMedia) {
      onDeleteMedia(id);
    }
    toast.success("Visuel supprimé de la médiathèque");
  };

  const handleUseImage = (url: string) => {
    if (onSelectMediaUrl) {
      onSelectMediaUrl(url);
      toast.success("Image appliquée au champ actif");
    } else {
      handleCopy(url);
    }
  };

  const filteredItems = localItems.filter((item) => {
    const matchesSearch = (item.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    if (activeCategory === "logos") return matchesSearch && (item.name || "").toLowerCase().includes("logo");
    if (activeCategory === "banners") return matchesSearch && (item.name || "").toLowerCase().includes("banner");
    return matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] select-none">
      {/* Header */}
      <div className="p-4 border-b border-[#E5E7EB] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-bold text-[#17191C]">Médiathèque</h2>
            <p className="text-[12px] text-[#667085]">
              {localItems.length} fichier{localItems.length > 1 ? "s" : ""} disponible{localItems.length > 1 ? "s" : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] px-3.5 text-[13px] font-semibold text-white transition-colors cursor-pointer shadow-xs shrink-0"
          >
            <Upload className="h-4 w-4" />
            <span>Importer</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only hidden"
            onChange={handleFilesSelected}
          />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un média par nom..."
            className="w-full h-9 pl-9 pr-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[13px] text-[#17191C] focus:outline-none focus:border-[#F97316]"
          />
        </div>

        {/* Filter Categories */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[12px] font-medium no-scrollbar">
          {(["all", "images", "logos", "banners"] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-md shrink-0 transition-colors cursor-pointer capitalize ${
                activeCategory === cat
                  ? "bg-[#FFF1E7] text-[#F97316] font-semibold"
                  : "text-[#667085] hover:bg-[#F3F4F6]"
              }`}
            >
              {cat === "all" ? "Tous" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Media Inspector Card */}
      {selectedMedia && (
        <div className="p-3 bg-[#FFF7ED] border-b border-[#FDBA74] space-y-2 text-[12px]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#17191C] truncate">{selectedMedia.name || "Visuel sélectionné"}</span>
            <button
              type="button"
              onClick={() => setSelectedMedia(null)}
              className="text-[#667085] hover:text-[#17191C] font-bold"
            >
              ×
            </button>
          </div>
          <div className="space-y-1">
            <label className="text-[#667085] block font-medium">Texte alternatif (Alt SEO)</label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Description de l'image..."
              className="w-full h-8 px-2 bg-[#FFFFFF] border border-[#E5E7EB] rounded-md text-[12px]"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleUseImage(selectedMedia.url)}
              className="flex-1 h-8 bg-[#F97316] hover:bg-[#EA580C] text-white text-[12px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Utiliser cette image</span>
            </button>
            <button
              type="button"
              onClick={() => handleDelete(selectedMedia.id)}
              className="h-8 px-2.5 bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg cursor-pointer"
              title="Supprimer du serveur"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {filteredItems.length === 0 ? (
          <div className="p-6 text-center bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] space-y-2 my-4">
            <FileImage className="w-8 h-8 text-[#9CA3AF] mx-auto" />
            <p className="text-[14px] font-bold text-[#17191C]">Aucun média trouvé</p>
            <p className="text-[12px] text-[#667085]">
              Importez des photos ou modifiez vos termes de recherche.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-9 px-4 bg-[#FFFFFF] border border-[#E5E7EB] text-[#F97316] font-semibold text-[12px] rounded-lg mt-2 transition-colors cursor-pointer"
            >
              + Importer une image
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredItems.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                isSelected={selectedMedia?.id === item.id}
                isCopied={copiedUrl === item.url}
                onSelect={() => {
                  setSelectedMedia(item);
                  setAltText(item.name || "");
                }}
                onCopy={handleCopy}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

