import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  CarFront,
  PlusCircle,
  LogOut,
  LogIn,
  Search,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { autoClient } from "../../domains/auto/auto.client";
import {
  VehicleCatalogItemDto,
  VehicleSellerPrivateDto,
  VehicleListingStatus,
} from "../../domains/auto/auto.types";
import { useVehicleFavorites } from "../../hooks/useVehicleFavorites";
import { useEphemeralAutoStudio } from "../../hooks/useEphemeralAutoStudio";
import { AutoDashboardPanels } from "../../components/Auto/AutoDashboardPanels";

export interface AutoUserDashboardPageProps {
  defaultTab?: "favorites" | "garage" | "brands";
}

export const AutoUserDashboardPage: React.FC<AutoUserDashboardPageProps> = ({
  defaultTab = "favorites",
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, userProfile, logout, openAuthModal } = useAuth();
  const { favorites, isFavorite, toggleFavorite } = useVehicleFavorites();
  const { ephemeralVehicles, ephemeralSellerListings } = useEphemeralAutoStudio();

  const tabParam = searchParams.get("tab") as "favorites" | "garage" | "brands" | null;
  const activeTab = tabParam || defaultTab;

  const setActiveTab = (tab: "favorites" | "garage" | "brands") => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    setSearchParams(next);
  };

  const [publicVehicles, setPublicVehicles] = useState<VehicleCatalogItemDto[]>([]);
  const [myListings, setMyListings] = useState<VehicleSellerPrivateDto[]>([]);
  const [loadingGarage, setLoadingGarage] = useState(false);
  const [garageError, setGarageError] = useState<string | null>(null);

  useEffect(() => {
    autoClient
      .getPublicListings({ limit: 24 })
      .then((res) => setPublicVehicles(res.items || []))
      .catch(() => setPublicVehicles([]));
  }, []);

  const loadMyListings = useCallback(async () => {
    if (!currentUser) return;
    setLoadingGarage(true);
    setGarageError(null);
    try {
      const data = await autoClient.getMyListings();
      setMyListings(data);
    } catch (err) {
      setGarageError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoadingGarage(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeTab === "garage") {
      loadMyListings();
    }
  }, [activeTab, loadMyListings]);

  const handleStatusChange = async (id: string, targetStatus: VehicleListingStatus) => {
    if (id.startsWith("ephemeral-")) return;
    try {
      await autoClient.changeStatus(id, targetStatus);
      await loadMyListings();
    } catch (err) {
      setGarageError(err instanceof Error ? err.message : "Erreur de changement de statut");
    }
  };

  const favoriteVehicles = useMemo(() => {
    const all = [...publicVehicles, ...ephemeralVehicles];
    return all.filter((v) => favorites.includes(v.id));
  }, [publicVehicles, ephemeralVehicles, favorites]);

  const combinedGarageListings = useMemo(() => {
    return [...myListings, ...ephemeralSellerListings];
  }, [myListings, ephemeralSellerListings]);

  const displayName =
    (typeof userProfile?.displayName === "string" && userProfile.displayName) ||
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "Utilisateur Olma Auto";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/auto")}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span>Retour à la recherche de véhicules</span>
          </button>
        </div>

        {/* En-tête Utilisateur (Style Olma Immo) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-extrabold text-xl uppercase shrink-0 shadow-xs">
              {displayName.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {displayName}
                </h1>
                <span className="text-xs font-bold text-blue-600">· Dashboard Auto</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentUser?.email || "Retrouvez vos véhicules favoris et gérez vos annonces auto simplement"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/auto/deposer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ajouter un véhicule</span>
            </Link>

            {currentUser ? (
              <button
                type="button"
                onClick={async () => {
                  if (logout) await logout();
                  navigate("/auto");
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-xs font-bold cursor-pointer bg-white"
              >
                <LogOut className="w-4 h-4 text-slate-500" />
                <span>Déconnexion</span>
              </button>
            ) : (
              openAuthModal && (
                <button
                  type="button"
                  onClick={openAuthModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 text-xs font-bold cursor-pointer border-none"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Se connecter</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Layout 2 Colonnes : Menu Latéral Simple (Gauche) + Contenu (Droite) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-4 lg:col-span-3 space-y-2">
            {[
              { id: "favorites" as const, label: `Mes Véhicules Favoris (${favorites.length})`, icon: Heart },
              { id: "garage" as const, label: "Mes Annonces Publiées", icon: CarFront },
              { id: "brands" as const, label: "Recherche par Marque", icon: Search },
            ].map((item) => {
              const Icon = item.icon;
              const selected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl font-extrabold text-xs transition cursor-pointer border text-left ${
                    selected
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${selected ? "text-sky-400" : "text-blue-600"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="md:col-span-8 lg:col-span-9">
            <AutoDashboardPanels
              activeTab={activeTab}
              favoriteVehicles={favoriteVehicles}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
              combinedGarageListings={combinedGarageListings}
              loadingGarage={loadingGarage}
              garageError={garageError}
              onRefreshGarage={loadMyListings}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
