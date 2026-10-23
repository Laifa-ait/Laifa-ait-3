import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  X,
  Heart,
  Bookmark,
  Bell,
  Warehouse,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  LogIn,
  LayoutGrid,
  ChevronRight,
  Car,
  Wrench,
  Calculator,
  Scale,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

import { OlmaAutoEmblem } from "../../domains/auto/data/carBrandLogos";

interface OlmaAutoDrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSwitcher: () => void;
}

export const OlmaAutoDrawerMenu: React.FC<OlmaAutoDrawerMenuProps> = ({
  isOpen,
  onClose,
  onOpenSwitcher,
}) => {
  const navigate = useNavigate();
  const { currentUser, userProfile, logout, openAuthModal } = useAuth();

  if (!isOpen) return null;

  const displayName: string =
    (typeof userProfile?.name === "string" && userProfile.name) ||
    (typeof currentUser?.displayName === "string" && currentUser.displayName) ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "Visiteur");

  const handleAuthAction = async () => {
    onClose();
    if (currentUser) {
      if (logout) await logout();
    } else {
      if (openAuthModal) openAuthModal();
      else window.dispatchEvent(new CustomEvent("auth:openModal", { detail: { mode: "login" } }));
    }
  };

  const menuSections = [
    {
      title: "Mon Activité Auto",
      items: [
        { label: "Mes annonces", icon: Car, path: "/dashboard/seller/auto" },
        { label: "Mes favoris", icon: Heart, path: "/auto/catalog?tab=favorites" },
        { label: "Recherches sauvegardées", icon: Bookmark, path: "/auto/catalog?tab=saved" },
        { label: "Mes alertes", icon: Bell, path: "/auto/catalog?tab=alerts" },
        { label: "Mon garage vendeur", icon: Warehouse, path: "/dashboard/seller/auto" },
        { label: "Mes messages", icon: MessageSquare, path: "/messages" },
      ],
    },
    {
      title: "Services & Univers",
      items: [
        { label: "Pièces détachées & Casse", icon: Wrench, path: "/auto/pieces" },
        { label: "Estimation (Cote argus)", icon: Calculator, path: "/auto/estimation" },
        { label: "Comparateur de véhicules", icon: Scale, path: "/auto/comparer" },
      ],
    },
    {
      title: "Compte & Assistance",
      items: [
        { label: "Paramètres du compte", icon: Settings, path: "/dashboard/buyer/settings" },
        { label: "Aide & support", icon: HelpCircle, path: "/aide" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
        {/* Header Profil avec Logo Olma Auto */}
        <div className="p-4 bg-[#0B1730] text-white flex items-center justify-between border-b border-[#172B4D]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-[#172B4D] border-2 border-[#D9F66F] flex items-center justify-center text-[#D9F66F] font-black text-base shadow-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1">
                <OlmaAutoEmblem className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-sm font-black text-white leading-tight truncate max-w-[170px]">
                {displayName}
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(currentUser ? "/profile" : "/auth");
                }}
                className="text-[11px] text-slate-300 hover:text-[#D9F66F] transition-colors font-medium mt-0.5 cursor-pointer block text-left"
              >
                {currentUser ? "Voir mon profil" : "Se connecter / S'inscrire"}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#172B4D] text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bouton SuperApp Univers Olmart */}
        <div className="p-3 bg-slate-50 border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSwitcher();
            }}
            className="w-full flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 hover:border-[#172B4D] transition-colors cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-[#0B1730]" />
              <span>Changer d'univers (Olmart)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Liste des sections de navigation */}
        <div className="flex-1 p-3 space-y-4">
          {menuSections.map((sec) => (
            <div key={sec.title}>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 mb-1.5">
                {sec.title}
              </div>
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={onClose}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0B1730] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-slate-500" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Déconnexion / Connexion */}
        <div className="p-3 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={handleAuthAction}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              currentUser
                ? "text-rose-600 hover:bg-rose-50 border border-rose-200"
                : "bg-gradient-to-r from-[#D9F66F] to-[#C5E94F] text-[#0B1730] hover:brightness-105 shadow-[0_4px_14px_rgba(217,246,111,0.4)] active:scale-[0.98]"
            }`}
          >
            {currentUser ? (
              <>
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Se connecter</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

