import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, Plus, Heart, CarFront, LayoutGrid, User, Search } from "lucide-react";
import { SuperAppSwitcherModal } from "../common/SuperAppSwitcherModal";
import { OlmaAutoDrawerMenu } from "./OlmaAutoDrawerMenu";
import { AutoBrandPickerModal } from "./AutoBrandPickerModal";
import { useVehicleFavorites } from "../../hooks/useVehicleFavorites";

export const OlmaAutoNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { count: favoritesCount } = useVehicleFavorites();

  const isExplore =
    location.pathname === "/auto" ||
    location.pathname.startsWith("/auto/catalog") ||
    location.pathname.startsWith("/auto/vehicules");
  const isParts =
    location.pathname.startsWith("/auto/pieces") ||
    location.pathname.startsWith("/auto/parts");
  const isDashboard =
    location.pathname.startsWith("/auto/dashboard") ||
    location.pathname.startsWith("/auto/mon-garage") ||
    location.pathname.startsWith("/dashboard/seller/auto");

  const openBrandPicker = () => {
    window.dispatchEvent(new CustomEvent("olmart:open-auto-brand-picker"));
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-3">
            {/* Left: App Icon Squircle + Identity */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                to="/auto"
                className="flex items-center gap-2.5 group active:scale-[0.98] transition-transform"
              >
                <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/80 via-blue-600/20 to-transparent" />
                  <CarFront className="w-4 h-4 text-white relative z-10" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 select-none">
                    Olma
                  </span>
                  <span className="text-xs font-extrabold tracking-tight text-blue-600">
                    Auto
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setIsSwitcherOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-bold bg-slate-100/90 text-slate-700 hover:text-slate-950 hover:bg-slate-200/70 transition-all active:scale-95 cursor-pointer border-none"
                title="Applications Olmart"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
                <span>Apps</span>
              </button>
            </div>

            {/* Center: App Segmented Navigation Rail (Desktop) */}
            <nav className="hidden lg:flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60">
              <Link
                to="/auto"
                className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  isExplore
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Explorer
              </Link>

              <button
                type="button"
                onClick={openBrandPicker}
                className="px-4 py-1.5 text-xs font-bold rounded-xl text-slate-600 hover:text-blue-600 hover:bg-white/60 transition-all cursor-pointer bg-transparent border-none flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5 text-blue-600" />
                <span>Par Marque</span>
              </button>

              <Link
                to="/auto/pieces"
                className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  isParts
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pièces Auto
              </Link>

              <Link
                to="/auto/dashboard"
                className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  isDashboard
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Dashboard
              </Link>
            </nav>

            {/* Right: Tactile App Action Controls (44x44px hitboxes) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={openBrandPicker}
                className="sm:hidden inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-blue-50 text-blue-700 text-xs font-extrabold active:scale-95 transition-transform cursor-pointer border border-blue-200/60"
                aria-label="Rechercher par marque"
              >
                <CarFront className="w-3.5 h-3.5 text-blue-600" />
                <span>Marques</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/auto/dashboard?tab=favorites")}
                aria-label="Mes véhicules favoris"
                className="relative w-10 h-10 rounded-xl bg-slate-100/90 hover:bg-slate-200/70 text-slate-700 flex items-center justify-center transition-all active:scale-95 cursor-pointer border-none"
                title="Mes favoris"
              >
                <Heart className="w-4 h-4" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center tabular-nums">
                    {favoritesCount}
                  </span>
                )}
              </button>

              <Link
                to="/auto/deposer"
                className="hidden sm:inline-flex items-center gap-1.5 h-10 px-4 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95 whitespace-nowrap shadow-xs shadow-blue-600/20"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Ajouter un véhicule</span>
              </Link>

              <button
                type="button"
                onClick={() => navigate("/auto/dashboard")}
                aria-label="Mon Dashboard Auto"
                className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100/90 hover:bg-slate-200/70 text-slate-700 transition-all active:scale-95 cursor-pointer border-none"
                title="Mon Dashboard Utilisateur"
              >
                <User className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                aria-label="Ouvrir le menu latéral"
                className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer border-none"
                title="Menu latéral"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <OlmaAutoDrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenSwitcher={() => setIsSwitcherOpen(true)}
        onOpenBrandPicker={openBrandPicker}
      />

      <AutoBrandPickerModal />

      <SuperAppSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />
    </>
  );
};
