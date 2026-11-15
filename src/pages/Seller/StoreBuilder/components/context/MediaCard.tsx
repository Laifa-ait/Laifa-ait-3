import React, { useState } from "react";
import { MediaGalleryItem } from "../../../../../domains/seller/customPage.types";
import { AlertCircle, Check, Copy, Film, Link2 } from "lucide-react";

interface MediaCardProps {
  item: MediaGalleryItem;
  isSelected: boolean;
  isCopied: boolean;
  inUseCount?: number;
  onSelect: () => void;
  onCopy: (url: string) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  isSelected,
  isCopied,
  inUseCount = 0,
  onSelect,
  onCopy,
}) => {
  const [hasBrokenPreview, setHasBrokenPreview] = useState(false);

  return (
    <div
      onClick={onSelect}
      data-testid={`media-card-${item.id}`}
      className={`group relative border rounded-xl overflow-hidden bg-[#FFFFFF] transition-all cursor-pointer ${
        isSelected
          ? "border-[#023859] ring-2 ring-[#023859]/25 shadow-xs"
          : "border-[#E5E7EB] hover:border-[#D0D5DD]"
      }`}
    >
      <div className="aspect-square bg-[#F9FAFB] overflow-hidden relative flex items-center justify-center">
        {hasBrokenPreview ? (
          <div
            data-testid={`media-broken-fallback-${item.id}`}
            className="w-full h-full flex flex-col items-center justify-center gap-1 p-2 text-center bg-rose-50 text-rose-700"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-bold leading-tight">Image introuvable</span>
          </div>
        ) : item.type === "video" ? (
          <>
            <video
              src={item.url}
              muted
              playsInline
              preload="metadata"
              onError={() => setHasBrokenPreview(true)}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-1.5 right-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-900/85 text-white text-[9px] font-bold uppercase">
              <Film className="w-2.5 h-2.5" />
              Vidéo
            </span>
          </>
        ) : (
          <img
            src={item.url}
            alt={item.name || "Média vitrine"}
            onError={() => setHasBrokenPreview(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        )}
        {inUseCount > 0 && (
          <span
            data-testid={`media-in-use-badge-${item.id}`}
            className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#023859]/90 text-white text-[9px] font-bold"
            title={`Utilisé dans ${inUseCount} emplacement(s)`}
          >
            <Link2 className="w-2.5 h-2.5" />
            <span>Utilisé ({inUseCount})</span>
          </span>
        )}
        {item.folder && (
          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-semibold uppercase">
            {item.folder}
          </span>
        )}
      </div>
      <div className="p-2 flex items-center justify-between bg-[#FFFFFF] text-[12px]">
        <span className="truncate text-[#17191C] font-semibold text-[11px]" title={item.name || item.url}>
          {item.name || "Visuel"}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCopy(item.url);
          }}
          className="p-1 rounded text-[#667085] hover:text-[#023859] transition-colors cursor-pointer"
          title="Copier le lien"
        >
          {isCopied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
