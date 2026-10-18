import React from "react";
import {
  X,
  Layers,
  FileText,
  Palette,
  Image as ImageIcon,
  Settings,
  Store,
  Sparkles,
} from "lucide-react";
import { StudioNavMode } from "../SectionTreePanel";

interface StudioMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navMode: StudioNavMode | "identity";
  onSelectNavMode: (mode: StudioNavMode | "identity") => void;
  shopName?: string;
}

export const StudioMobileMenu: React.FC<StudioMobileMenuProps> = ({
  isOpen,
  onClose,
  navMode,
  onSelectNavMode,
  shopName = "Ma Boutique",
}) => {
  if (!isOpen) return null;

  const handleSelect = (mode: StudioNavMode | "identity") => {
    onSelectNavMode(mode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200">
      <div className="w-[280px] max-w-[80vw] bg-[#FFFFFF] h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-250">
        {/* Header */}
        <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F7F8FA]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F97316] flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[14px] font-bold text-[#17191C] truncate">
                {shopName}
              </span>
              <span className="block text-[10px] text-[#667085] uppercase tracking-wider font-semibold">
                Studio Olmart
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#667085] hover:bg-[#E5E7EB] hover:text-[#17191C] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* CRÉATION */}
          <div>
            <span className="block text-[11px] font-bold uppercase text-[#667085] tracking-wider mb-2 px-2">
              Création
            </span>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleSelect("sections")}
                className={`w-full h-11 px-3 rounded-xl text-[14px] font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                  navMode === "sections"
                    ? "bg-[#FFF1E7] text-[#EA580C] border-l-4 border-[#F97316] shadow-2xs"
                    : "text-[#344054] hover:bg-[#F7F8FA]"
                }`}
              >
                <Layers className="w-5 h-5 text-[#F97316]" />
                <span>Structure</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelect("pages")}
                className={`w-full h-11 px-3 rounded-xl text-[14px] font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                  navMode === "pages"
                    ? "bg-[#FFF1E7] text-[#EA580C] border-l-4 border-[#F97316] shadow-2xs"
                    : "text-[#344054] hover:bg-[#F7F8FA]"
                }`}
              >
                <FileText className="w-5 h-5 text-[#F97316]" />
                <span>Pages</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelect("theme")}
                className={`w-full h-11 px-3 rounded-xl text-[14px] font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                  navMode === "theme"
                    ? "bg-[#FFF1E7] text-[#EA580C] border-l-4 border-[#F97316] shadow-2xs"
                    : "text-[#344054] hover:bg-[#F7F8FA]"
                }`}
              >
                <Palette className="w-5 h-5 text-[#F97316]" />
                <span>Thèmes</span>
              </button>
            </div>
          </div>

          {/* GESTION */}
          <div>
            <span className="block text-[11px] font-bold uppercase text-[#667085] tracking-wider mb-2 px-2">
              Gestion
            </span>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleSelect("media")}
                className={`w-full h-11 px-3 rounded-xl text-[14px] font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                  navMode === "media"
                    ? "bg-[#FFF1E7] text-[#EA580C] border-l-4 border-[#F97316] shadow-2xs"
                    : "text-[#344054] hover:bg-[#F7F8FA]"
                }`}
              >
                <ImageIcon className="w-5 h-5 text-[#F97316]" />
                <span>Médias</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelect("identity")}
                className={`w-full h-11 px-3 rounded-xl text-[14px] font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                  navMode === "identity"
                    ? "bg-[#FFF1E7] text-[#EA580C] border-l-4 border-[#F97316] shadow-2xs"
                    : "text-[#344054] hover:bg-[#F7F8FA]"
                }`}
              >
                <Store className="w-5 h-5 text-[#F97316]" />
                <span>Identité</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelect("settings")}
                className={`w-full h-11 px-3 rounded-xl text-[14px] font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                  navMode === "settings"
                    ? "bg-[#FFF1E7] text-[#EA580C] border-l-4 border-[#F97316] shadow-2xs"
                    : "text-[#344054] hover:bg-[#F7F8FA]"
                }`}
              >
                <Settings className="w-5 h-5 text-[#F97316]" />
                <span>Réglages</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#E5E7EB] bg-[#F7F8FA] text-[12px] text-[#667085] text-center">
          Studio Olmart Vendeur
        </div>
      </div>

      {/* Backdrop click to close */}
      <div className="flex-1 h-full cursor-pointer" onClick={onClose} />
    </div>
  );
};
