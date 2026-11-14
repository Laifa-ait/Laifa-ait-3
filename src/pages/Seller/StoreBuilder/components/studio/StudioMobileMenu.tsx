import React from "react";
import { useNavigate } from "react-router-dom";
import {
  X, Layers, FileText, Palette, Image as ImageIcon, Settings,
  Store, Sparkles, ShoppingBag, ClipboardList, ArrowLeft,
  ListChecks, PanelTop,
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
    `w-full h-11 px-3 rounded-lg text-[13px] font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
      navMode === mode
        ? "bg-slate-900 text-white"
        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-900/50 backdrop-blur-xs md:hidden">
      <div className="w-[280px] max-w-[82vw] bg-white h-full flex flex-col border-r border-slate-200 shadow-xl">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="min-w-0">
            <span className="block text-[14px] font-semibold text-slate-900 truncate">
              {shopName}
            </span>
            <span className="block text-[11px] text-slate-500">
              Éditeur de boutique
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          <button type="button" onClick={() => handleSelect("launchpad")} className={navClass("launchpad")}>
            <ListChecks className="w-4 h-4 shrink-0" />
            <span>Check-list de lancement</span>
          </button>

          <div className="space-y-1">
            <span className="block text-[11px] font-medium text-slate-400 px-3 pb-1">
              Apparence &amp; Structure
            </span>
            <button type="button" onClick={() => handleSelect("sections")} className={navClass("sections")}>
              <Layers className="w-4 h-4 shrink-0" />
              <span>Sections de la page</span>
            </button>
            <button type="button" onClick={() => handleSelect("theme")} className={navClass("theme")}>
              <Palette className="w-4 h-4 shrink-0" />
              <span>Thème &amp; Couleurs</span>
            </button>
            <button type="button" onClick={() => handleSelect("atelier")} className={navClass("atelier")}>
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Atelier &amp; Matières</span>
            </button>
            <button type="button" onClick={() => handleSelect("header")} className={navClass("header")}>
              <PanelTop className="w-4 h-4 shrink-0" />
              <span>En-tête &amp; Menu</span>
            </button>
            <button type="button" onClick={() => handleSelect("identity")} className={navClass("identity")}>
              <Store className="w-4 h-4 shrink-0" />
              <span>Identité boutique</span>
            </button>
            <button type="button" onClick={() => handleSelect("pages")} className={navClass("pages")}>
              <FileText className="w-4 h-4 shrink-0" />
              <span>Pages &amp; Navigation</span>
            </button>
          </div>

          <div className="space-y-1">
            <span className="block text-[11px] font-medium text-slate-400 px-3 pb-1">
              Commerce &amp; Fichiers
            </span>
            <button type="button" onClick={() => handleSelect("catalog")} className={navClass("catalog")}>
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Catalogue produits</span>
            </button>
            <button type="button" onClick={() => handleSelect("orders")} className={navClass("orders")}>
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span>Commandes &amp; Suivi</span>
            </button>
            <button type="button" onClick={() => handleSelect("media")} className={navClass("media")}>
              <ImageIcon className="w-4 h-4 shrink-0" />
              <span>Médiathèque</span>
            </button>
            <button type="button" onClick={() => handleSelect("settings")} className={navClass("settings")}>
              <Settings className="w-4 h-4 shrink-0" />
              <span>Livraison, Pixels &amp; SEO</span>
            </button>
          </div>
        </div>

        <div className="p-3 border-t border-slate-200">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/dashboard/seller");
            }}
            className="w-full h-11 px-3 rounded-lg bg-white border border-slate-200 text-slate-800 font-medium text-[13px] flex items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au Tableau de Bord</span>
          </button>
        </div>
      </div>

      <div className="flex-1 h-full cursor-pointer" onClick={onClose} />
    </div>
  );
};
