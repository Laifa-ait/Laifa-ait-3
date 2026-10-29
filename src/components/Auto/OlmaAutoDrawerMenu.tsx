import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  X,
  Heart,
  CarFront,
  LogOut,
  LogIn,
  LayoutGrid,
  ChevronRight,
  Compass,
  Wrench,
  PlusCircle,
  User,
  Scale,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface OlmaAutoDrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSwitcher: () => void;
  onOpenBrandPicker: () => void;
}

export const OlmaAutoDrawerMenu: React.FC<OlmaAutoDrawerMenuProps> = ({
  isOpen,
  onClose,
  onOpenSwitcher,
  onOpenBrandPicker,
}) => {
  const navigate = useNavigate();
  const { currentUser, userProfile, logout, openAuthModal } = useAuth();

  if (!isOpen) return null;

  const displayName: string =
    (typeof userProfile?.displayName === "string" && userProfile.displayName) ||
    (typeof userProfile?.name === "string" && userProfile.name) ||
    (typeof currentUser?.displayName === "string" && currentUser.displayName) ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "Visiteur Olma Auto");

  const handleAuthAction = async () => {
    onClose();
    if (currentUser) {
      if (logout) await logout();
    } else if (openAuthModal) {
      openAuthModal();
    } else {
      navigate("/auth");
    }
  };

  const navLinks = [
    {
      label: "Explorer les véhicules",
      subtitle: "Toutes les annonces en Algérie",
      icon: Compass,
      onClick: () => { onClose(); navigate("/auto"); },
    },
    {
      label: "Rechercher par marque",
      subtitle: "Volkswagen, Renault, Peugeot, Fiat...",
      icon: CarFront,
      onClick: () => { onClose(); onOpenBrandPicker(); },
    },
    {
      label: "Ajouter un véhicule",
      subtitle: "Publier votre annonce gratuitement",
      icon: PlusCircle,
      highlight: true,
      onClick: () => { onClose(); navigate("/auto/deposer"); },
    },
    {
      label: "Mon Dashboard Utilisateur",
      subtitle: "Favoris, mes annonces & profil",
      icon: User,
      onClick: () => { onClose(); navigate("/auto/dashboard"); },
    },
    {
      label: "Mes Véhicules Favoris",
      subtitle: "Voitures enregistrées",
      icon: Heart,
      onClick: () => { onClose(); navigate("/auto/dashboard?tab=favorites"); },
    },
    {
      label: "Pièces Détachées",
      subtitle: "Pièces neuves & casse auto",
      icon: Wrench,
      onClick: () => { onClose(); navigate("/auto/pieces"); },
    },
    {
      label: "Comparateur",
      subtitle: "Comparer jusqu'à 3 voitures",
      icon: Scale,
      onClick: () => { onClose(); navigate("/auto/comparer"); },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <aside className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto border-l border-slate-200">
        {/* Header Utilisateur App */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-base shrink-0 shadow-xs">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-white truncate">{displayName}</div>
              <Link
                to="/auto/dashboard"
                onClick={onClose}
                className="text-xs text-sky-300 hover:text-white font-semibold mt-0.5 block"
              >
                Mon Dashboard →
              </Link>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border-none"
            aria-label="Fermer le menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Liste des actions d'application */}
        <div className="flex-1 p-4 space-y-2">
          <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-2 mb-1">
            Menu Application
          </div>

          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all active:scale-[0.99] cursor-pointer border ${
                  item.highlight
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs hover:bg-blue-700"
                    : "bg-slate-50/80 hover:bg-slate-100 text-slate-900 border-slate-200/70"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      item.highlight
                        ? "bg-white/20 text-white"
                        : "bg-white text-blue-600 border border-slate-200/80"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold truncate">{item.label}</div>
                    <div className={`text-[11px] truncate ${item.highlight ? "text-blue-100" : "text-slate-500"}`}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 ${item.highlight ? "text-white" : "text-slate-400"}`} />
              </button>
            );
          })}

          <div className="pt-3 mt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { onClose(); onOpenSwitcher(); }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-100 hover:bg-slate-200/70 text-slate-800 text-xs font-bold transition-colors cursor-pointer border border-slate-200/70"
            >
              <div className="flex items-center gap-2.5">
                <LayoutGrid className="w-4 h-4 text-blue-600" />
                <span>Changer d'application (Immo, Market...)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={handleAuthAction}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
              currentUser
                ? "text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200"
                : "bg-slate-900 text-white hover:bg-slate-800 border-none"
            }`}
          >
            {currentUser ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{currentUser ? "Se déconnecter" : "Se connecter / S'inscrire"}</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
