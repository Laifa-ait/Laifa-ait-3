import React from "react";
import { MediaGalleryItem } from "../../../../../domains/seller/customPage.types";
import { Copy, Check } from "lucide-react";

interface MediaCardProps {
  item: MediaGalleryItem;
  isSelected: boolean;
  isCopied: boolean;
  onSelect: () => void;
  onCopy: (url: string) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  isSelected,
  isCopied,
  onSelect,
  onCopy,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`group relative border rounded-xl overflow-hidden bg-[#FFFFFF] transition-all cursor-pointer ${
        isSelected
          ? "border-[#F97316] ring-2 ring-[#F97316]/30 shadow-xs"
          : "border-[#E5E7EB] hover:border-[#D0D5DD]"
      }`}
    >
      <div className="aspect-square bg-[#F9FAFB] overflow-hidden relative">
        <img
          src={item.url}
          alt={item.name || "Média vitrine"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
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
          className="p-1 rounded text-[#667085] hover:text-[#F97316] transition-colors"
          title="Copier le lien"
        >
          {isCopied ? (
            <Check className="w-3.5 h-3.5 text-[#16A34A]" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};
