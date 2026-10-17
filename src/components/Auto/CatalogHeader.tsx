import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export interface CatalogHeaderProps {
  total: number;
  favoritesCount: number;
  isFavoritesMode: boolean;
  displayedCount: number;
  onTabChange: (tab: "all" | "favorites") => void;
}

export const CatalogHeader: React.FC<CatalogHeaderProps> = ({
  total,
  favoritesCount,
  isFavoritesMode,
  displayedCount,
  onTabChange,
}) => {
  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link to="/auto" className="hover:text-[#172B4D] transition-colors">Showroom</Link>
            <span aria-hidden="true">/</span>
            <span className="text-slate-900 font-medium">Catalogue Véhicules</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1730] tracking-tight">
            {isFavoritesMode ? "Mes Véhicules Favoris" : "Véhicules Neufs & Occasion en Algérie"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isFavoritesMode
              ? `${displayedCount} véhicule(s) sauvegardé(s)`
              : `${total} annonces trouvées à travers les 69 wilayas.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/auto/deposer"
            className="px-4 py-2.5 bg-[#D9F66F] hover:bg-[#C5E94F] text-[#0B1730] rounded-xl text-xs font-black shadow-xs transition-colors min-h-[44px] flex items-center justify-center cursor-pointer"
          >
            Déposer une annonce
          </Link>
        </div>
      </div>

      {/* Onglets rapides : Toutes les annonces / Favoris */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => onTabChange("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            !isFavoritesMode
              ? "bg-[#0B1730] text-[#D9F66F] shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Toutes les annonces ({total})
        </button>
        <button
          type="button"
          onClick={() => onTabChange("favorites")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            isFavoritesMode
              ? "bg-[#0B1730] text-[#D9F66F] shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Mes Favoris ({favoritesCount})</span>
        </button>
      </div>
    </>
  );
};
