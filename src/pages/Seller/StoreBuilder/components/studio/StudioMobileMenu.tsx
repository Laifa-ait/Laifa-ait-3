import React from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Layers,
  FileText,
  Palette,
  Image as ImageIcon,
  Settings,
  Store,
  Sparkles,
  ShoppingBag,
  ClipboardList,
  ArrowLeft,
} from "lucide-react";
import { StudioNavMode } from "./studio.types";

interface StudioMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navMode: StudioNavMode;
  onSelectNavMode: (mode: StudioNavMode) => void;
  shopName?: string;
}

export const StudioMobileMenu: React.FC<StudioMobileMenuProps> = ({
  isOpen,
  onClose,
  navMode,
  onSelectNavMode,
  shopName = "Ma Boutique",
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSelect = (mode: StudioNavMode) => {
    onSelectNavMode(mode);
    onClose();
  };

  const navClass = (mode: StudioNavMode) =>
    `w-full h-10 px-3 rounded-xl text-[13px] font-semibold flex items-center gap-3 transition-all cursor-pointer ${
      navMode === mode
        ? "bg-[#FFF1E7] text-[#EA580C] border-l-4 border-[#F97316] shadow-2xs"
        : "text-[#344054] hover:bg-[#F7F8FA]"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200">
      <div className="w-[280px] max-w-[82vw] bg-[#FFFFFF] h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-250">
        {/* Header */}
        <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F7F8FA]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#F97316] flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
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
          <div>
            <span className="block text-[11px] font-bold uppercase text-[#667085] tracking-wider mb-2 px-2">
              Design & Vitrine
            </span>
            <div className="space-y-1">
              <button type="button" onClick={() => handleSelect("sections")} className={navClass("sections")}>
                <Layers className="w-4 h-4 text-[#F97316]" />
                <span>Sections de la page</span>
              </button>
              <button type="button" onClick={() => handleSelect("theme")} className={navClass("theme")}>
                <Palette className="w-4 h-4 text-[#F97316]" />
                <span>Thème & Couleurs</span>
              </button>
              <button type="button" onClick={() => handleSelect("identity")} className={navClass("identity")}>
                <Store className="w-4 h-4 text-[#F97316]" />
                <span>Identité Visuelle</span>
              </button>
              <button type="button" onClick={() => handleSelect("pages")} className={navClass("pages")}>
                <FileText className="w-4 h-4 text-[#F97316]" />
                <span>Pages & Navigation</span>
              </button>
            </div>
          </div>

          <div>
            <span className="block text-[11px] font-bold uppercase text-[#667085] tracking-wider mb-2 px-2">
              Boutique & Activité
            </span>
            <div className="space-y-1">
              <button type="button" onClick={() => handleSelect("catalog")} className={navClass("catalog")}>
                <ShoppingBag className="w-4 h-4 text-[#F97316]" />
                <span>Catalogue Produits</span>
              </button>
              <button type="button" onClick={() => handleSelect("orders")} className={navClass("orders")}>
                <ClipboardList className="w-4 h-4 text-[#F97316]" />
                <span>Commandes & Suivi</span>
              </button>
              <button type="button" onClick={() => handleSelect("media")} className={navClass("media")}>
                <ImageIcon className="w-4 h-4 text-[#F97316]" />
                <span>Médiathèque</span>
              </button>
              <button type="button" onClick={() => handleSelect("settings")} className={navClass("settings")}>
                <Settings className="w-4 h-4 text-[#F97316]" />
                <span>Coordonnées & SEO</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Back to Seller Space */}
        <div className="p-3 border-t border-[#E5E7EB] bg-[#F7F8FA]">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/dashboard/seller");
            }}
            className="w-full h-10 px-3 rounded-xl bg-white border border-[#E5E7EB] text-[#17191C] font-semibold text-[13px] flex items-center justify-center gap-2 hover:bg-[#F1F5F9] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#F97316]" />
            <span>Retour au Tableau de Bord</span>
          </button>
        </div>
      </div>

      <div className="flex-1 h-full cursor-pointer" onClick={onClose} />
    </div>
  );
};
