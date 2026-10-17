import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Car,
  PlusCircle,
  Loader2,
  LogIn,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { autoClient } from "../../domains/auto/auto.client";
import {
  VehicleSellerPrivateDto,
  VehicleListingStatus,
} from "../../domains/auto/auto.types";
import { SellerGarageStats } from "../../components/Auto/SellerGarageStats";
import { SellerGarageCard } from "../../components/Auto/SellerGarageCard";

export const SellerGaragePage: React.FC = () => {
  const { currentUser, openAuthModal } = useAuth();
  const [listings, setListings] = useState<VehicleSellerPrivateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const loadListings = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await autoClient.getMyListings();
      setListings(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur lors du chargement de votre garage";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const handleStatusChange = async (id: string, targetStatus: VehicleListingStatus) => {
    try {
      await autoClient.changeStatus(id, targetStatus);
      await loadListings();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur de changement de statut";
      setError(msg);
    }
  };

  const filteredListings = listings.filter((l) => {
    if (selectedFilter === "all") return true;
    return l.status === selectedFilter;
  });

  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Car className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Mon Garage Olma Auto</h1>
        <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
          Connectez-vous pour accéder à la gestion de vos véhicules, suivre les modérations en direct et publier des annonces.
        </p>
        {openAuthModal && (
          <button
            onClick={openAuthModal}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-all shadow-md inline-flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Se connecter à mon compte
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Car className="w-6 h-6 text-emerald-600" />
            Mon Garage Automobile
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez vos annonces, vos statuts de vente et vos véhicules en vérification.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadListings}
            disabled={loading}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            to="/auto/deposer"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Déposer une annonce
          </Link>
        </div>
      </div>

      <SellerGarageStats listings={listings} />

      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none border-b border-slate-200">
        {[
          { id: "all", label: "Tous" },
          { id: "active", label: "En Ligne" },
          { id: "pending_review", label: "En Modération" },
          { id: "rejected", label: "Refusés" },
          { id: "sold", label: "Vendus" },
          { id: "draft", label: "Brouillons" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedFilter === tab.id
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-500">Chargement de votre garage...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-slate-200/80 p-8">
          <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Aucun véhicule dans cette section</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6 max-w-sm mx-auto">
            Vous n'avez pas de véhicule correspondant à ce filtre. Publiez votre première annonce en 3 étapes.
          </p>
          <Link
            to="/auto/deposer"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Publier mon véhicule
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredListings.map((item) => (
            <SellerGarageCard
              key={item.id}
              listing={item}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};
