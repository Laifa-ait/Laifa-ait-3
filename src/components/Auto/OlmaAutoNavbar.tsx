import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  Menu,
  SlidersHorizontal,
  Plus,
  Heart,
  Scale,
  Calculator,
} from "lucide-react";
import { SuperAppSwitcherModal } from "../common/SuperAppSwitcherModal";
import { OlmaAutoDrawerMenu } from "./OlmaAutoDrawerMenu";
import { OlmaAutoEmblem } from "../../domains/auto/data/carBrandLogos";
import { useVehicleFavorites } from "../../hooks/useVehicleFavorites";
import { useVehicleComparison } from "../../hooks/useVehicleComparison";

export const OlmaAutoNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { count: favoritesCount } = useVehicleFavorites();
  const { count: compareCount } = useVehicleComparison();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/auto/catalog?query=${encodeURIComponent(query)}`);
    } else {
      navigate("/auto/catalog");
    }
  };

  const isCatalog = location.pathname.startsWith("/auto/catalog");
  const isParts = location.pathname.startsWith("/auto/pieces") || location.pathname.startsWith("/auto/parts");
  const isShowroom = location.pathname === "/auto";
  const isEstimation = location.pathname.startsWith("/auto/estimation");
  const isComparer = location.pathname.startsWith("/auto/comparer");

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0B1730]/98 backdrop-blur-md border-b border-[#172B4D] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
            {/* Gauche : Emblème Officiel & Branding Olma Auto */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Link to="/auto" className="flex items-center gap-2.5 group">
                <div className="group-hover:scale-105 transition-transform duration-200">
                  <OlmaAutoEmblem className="w-8 h-8 sm:w-9 sm:h-9" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-slate-100">
                    OLMA
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#0B1730] bg-gradient-to-r from-[#D9F66F] to-[#C5E94F] px-1.5 py-0.5 rounded-md shadow-[0_2px_8px_rgba(217,246,111,0.35)]">
                    AUTO
                  </span>
                </div>
              </Link>
            </div>

            {/* Centre : Recherche Desktop */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex-1 max-w-md mx-3 hidden md:block relative"
            >
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher marque, modèle (ex: Golf, Clio, Tucson)..."
                  className="w-full pl-9 pr-20 py-2 bg-[#101E3D] hover:bg-[#132347] focus:bg-[#101E3D] border border-[#23416A] focus:border-[#D9F66F] rounded-xl text-xs text-white placeholder-slate-400 outline-none transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-3 bg-gradient-to-r from-[#D9F66F] to-[#C5E94F] hover:brightness-105 text-[#0B1730] rounded-lg text-[11px] font-black transition-all cursor-pointer shadow-2xs"
                >
                  Trouver
                </button>
              </div>
            </form>

            {/* Droite : Liens Desktop & Actions Mobile */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Liens de navigation Desktop */}
              <nav className="hidden lg:flex items-center gap-1">
                <Link
                  to="/auto"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isShowroom ? "text-white bg-[#172B4D]" : "text-slate-300 hover:text-white"
                  }`}
                >
                  Accueil
                </Link>
                <Link
                  to="/auto/catalog"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isCatalog ? "text-white bg-[#172B4D]" : "text-slate-300 hover:text-white"
                  }`}
                >
                  Catalogue
                </Link>
                <Link
                  to="/auto/pieces"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isParts ? "text-white bg-[#172B4D]" : "text-slate-300 hover:text-white"
                  }`}
                >
                  Pièces
                </Link>
                <Link
                  to="/auto/estimation"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
                    isEstimation ? "text-[#D9F66F] bg-[#172B4D]" : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Argus</span>
                </Link>
                <Link
                  to="/auto/comparer"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 relative ${
                    isComparer ? "text-[#D9F66F] bg-[#172B4D]" : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Comparer</span>
                  {compareCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#D9F66F] text-[#0B1730] text-[10px] font-black flex items-center justify-center">
                      {compareCount}
                    </span>
                  )}
                </Link>
              </nav>

              {/* Bouton Favoris Rapide Desktop & Tablette */}
              <Link
                to="/auto/catalog?tab=favorites"
                className="relative p-2 rounded-xl bg-[#172B4D] border border-[#23416A] text-slate-300 hover:text-white transition-colors"
                title="Mes favoris"
              >
                <Heart className="w-4 h-4" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                    {favoritesCount}
                  </span>
                )}
              </Link>

              {/* Bouton Filtres rapide pour mobile */}
              <Link
                to="/auto/catalog"
                className="md:hidden p-2 rounded-xl bg-[#172B4D] border border-[#23416A] text-slate-300 hover:text-white transition-colors"
                title="Catalogue & Filtres"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </Link>

              {/* Icône Cloche Notification */}
              <button
                type="button"
                onClick={() => navigate("/dashboard/seller/auto")}
                aria-label="Notifications"
                className="p-2 rounded-xl bg-[#172B4D] border border-[#23416A] text-slate-300 hover:text-white relative transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D9F66F]" />
              </button>

              {/* Bouton Hamburger Menu */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                aria-label="Menu principal"
                className="p-2 rounded-xl bg-[#172B4D] border border-[#23416A] text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <Menu className="w-4 h-4" />
              </button>

              {/* Bouton Publier CTA Desktop Élite */}
              <Link
                to="/auto/deposer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-[#D9F66F] via-[#E2FB7D] to-[#C5E94F] hover:from-[#E2FB7D] hover:to-[#BEE545] text-[#0B1730] transition-all duration-200 shadow-[0_4px_14px_rgba(217,246,111,0.4)] hover:shadow-[0_6px_20px_rgba(217,246,111,0.55)] ml-1 border-t border-white/50"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Déposer</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Menu / Profil Drawer */}
      <OlmaAutoDrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenSwitcher={() => setIsSwitcherOpen(true)}
      />

      {/* SuperApp Switcher Modal */}
      <SuperAppSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />
    </>
  );
};
