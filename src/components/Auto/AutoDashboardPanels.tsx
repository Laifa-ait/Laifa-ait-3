import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import {
  VehicleCatalogItemDto,
  VehicleSellerPrivateDto,
  VehicleListingStatus,
} from "../../domains/auto/auto.types";
import { VehicleCard } from "./VehicleCard";
import { SellerGarageStats } from "./SellerGarageStats";
import { SellerGarageCard } from "./SellerGarageCard";
import { LOGOTEKA_BRAND_LOGOS, BrandImageLogo } from "../../domains/auto/data/brandLogosMap";

export interface AutoDashboardPanelsProps {
  activeTab: "favorites" | "garage" | "brands";
  favoriteVehicles: VehicleCatalogItemDto[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  combinedGarageListings: VehicleSellerPrivateDto[];
  loadingGarage: boolean;
  garageError: string | null;
  onRefreshGarage: () => void;
  onStatusChange: (id: string, status: VehicleListingStatus) => Promise<void>;
}

export const AutoDashboardPanels: React.FC<AutoDashboardPanelsProps> = ({
  activeTab,
  favoriteVehicles,
  isFavorite,
  toggleFavorite,
  combinedGarageListings,
  loadingGarage,
  garageError,
  onRefreshGarage,
  onStatusChange,
}) => {
  const navigate = useNavigate();

  if (activeTab === "favorites") {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Mes Véhicules Favoris</h2>
            <p className="text-xs text-slate-500">
              Les voitures sauvegardées pour contacter le vendeur rapidement
            </p>
          </div>
          <Link
            to="/auto"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
          >
            Explorer plus
          </Link>
        </div>

        {favoriteVehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {favoriteVehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                isFavorite={isFavorite(v.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
            <Heart className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-extrabold text-slate-900">
              Aucun véhicule dans vos favoris
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Cliquez sur le cœur en haut à droite d'une annonce pour l'enregistrer ici.
            </p>
            <Link
              to="/auto"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-extrabold mt-2"
            >
              <span>Parcourir les véhicules</span>
            </Link>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "garage") {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Mes Véhicules Publiés</h2>
            <p className="text-xs text-slate-500">
              Suivez vos annonces publicitaires en ligne et gérez leur statut
            </p>
          </div>
          <button
            type="button"
            onClick={onRefreshGarage}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${loadingGarage ? "animate-spin" : ""}`} />
          </button>
        </div>

        <SellerGarageStats listings={combinedGarageListings} />

        {garageError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{garageError}</span>
          </div>
        )}

        {loadingGarage && combinedGarageListings.length === 0 ? (
          <div className="py-12 text-center">
            <Loader2 className="w-7 h-7 text-blue-600 animate-spin mx-auto" />
          </div>
        ) : (
          <div className="space-y-3">
            {combinedGarageListings.map((item) => (
              <SellerGarageCard
                key={item.id}
                listing={item}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
      <div>
        <h2 className="text-base font-extrabold text-slate-900">
          Rechercher directement par Marque
        </h2>
        <p className="text-xs text-slate-500">
          Cliquez sur un constructeur pour afficher toutes ses voitures disponibles
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {LOGOTEKA_BRAND_LOGOS.slice(0, 24).map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => navigate(`/auto?brand=${encodeURIComponent(b.name)}`)}
            className="p-3 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 bg-slate-50/50 flex items-center gap-3 text-left transition cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0">
              <BrandImageLogo brandName={b.name} className="w-5 h-5 object-contain" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-slate-900 truncate">{b.name}</div>
              <div className="text-[10px] text-slate-500 truncate">{b.models}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
