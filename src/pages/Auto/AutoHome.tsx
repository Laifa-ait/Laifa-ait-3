import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Building2, Flame } from "lucide-react";
import { AutoHeroShowroom } from "../../components/Auto/AutoHeroShowroom";
import { AutoPopularBrandsSection } from "../../components/Auto/AutoPopularBrandsSection";
import { AutoBodyTypesSection } from "../../components/Auto/AutoBodyTypesSection";
import { AutoShowroomsSection } from "../../components/Auto/AutoShowroomsSection";
import { AutoTrustSection } from "../../components/Auto/AutoTrustSection";
import { VehicleCard } from "../../components/Auto/VehicleCard";
import { autoClient } from "../../domains/auto/auto.client";
import { autoSearchCache } from "../../domains/auto/auto.cache";
import { VehicleCatalogItemDto } from "../../domains/auto/auto.types";

type VitrineFilterTab = "all" | "safia" | "showroom" | "budget200";

export const AutoHome: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleCatalogItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<VitrineFilterTab>("all");

  useEffect(() => {
    let isMounted = true;
    const cached = autoSearchCache.getShowcase();
    if (cached.data && cached.data.length > 0) {
      setVehicles(cached.data);
      setLoading(false);
      if (!cached.isStale) return;
    }

    autoClient
      .getPublicListings({ limit: 12, sort: "date_desc" })
      .then((res) => {
        if (!isMounted) return;
        const items = res.items || [];
        setVehicles(items);
        autoSearchCache.setShowcase(items);
      })
      .catch(() => {
        if (isMounted && !cached.data) setVehicles([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredVehicles = useMemo(() => {
    switch (activeTab) {
      case "safia":
        return vehicles.filter((v) => v.paperStatus === "safia");
      case "showroom":
        return vehicles.filter((v) => v.sellerType === "concessionnaire" || v.sellerType === "professionnel");
      case "budget200":
        return vehicles.filter((v) => v.price <= 2000000);
      default:
        return vehicles;
    }
  }, [vehicles, activeTab]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* 1. Hero Showroom avec Recherche Épurée et Badges Logos */}
        <AutoHeroShowroom />

        {/* 2. Section Exclusive des Marques Automobiles avec Vrais Logos Vectoriels */}
        <AutoPopularBrandsSection />

        {/* Raccourcis Univers Auto : Safia & Pièces */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <Link
            to="/auto/catalog?paperStatus=safia"
            className="group flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-200/90 hover:border-[#172B4D] hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B1730] text-[#D9F66F] flex items-center justify-center font-black">
                <ShieldCheck className="w-5 h-5 text-[#D9F66F]" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#172B4D]">
                  Véhicules Carte Grise Safia
                </h3>
                <p className="text-[11px] text-slate-500">100% Papiers garantis et contrôlés</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#172B4D] group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/auto/pieces"
            className="group flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-200/90 hover:border-[#172B4D] hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#172B4D] text-[#D9F66F] flex items-center justify-center font-black">
                <Building2 className="w-5 h-5 text-[#D9F66F]" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#172B4D]">
                  Pièces Détachées Mécaniques
                </h3>
                <p className="text-[11px] text-slate-500">Casse auto & pièces d'origine certifiées</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#172B4D] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* 3. Silhouettes de Carrosserie en Grille Aérée */}
        <AutoBodyTypesSection />

        {/* 4. Vitrine des Dernières Annonces Automobiles */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                  Véhicules Récents en Algérie
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                  <Flame className="w-3 h-3 text-emerald-600" />
                  <span>En direct</span>
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Annonces vérifiées par des particuliers et professionnels · 69 Wilayas
              </p>
            </div>

            <Link
              to="/auto/catalog"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#172B4D] hover:text-[#0B1730] group transition-colors shrink-0"
            >
              <span>Voir tout le catalogue</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Filtres de vitrine segmentés au design moderne et tactile */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 min-h-[40px] cursor-pointer whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-[#0B1730] text-white shadow-md shadow-[#0B1730]/20 border border-[#0B1730]"
                  : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 shadow-2xs"
              }`}
            >
              Toutes les annonces
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("safia")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 min-h-[40px] cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "safia"
                  ? "bg-[#0B1730] text-[#D9F66F] shadow-md shadow-[#0B1730]/20 border border-[#23416A]"
                  : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 shadow-2xs"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#D9F66F]" />
              <span>Carte Grise Safia</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("showroom")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 min-h-[40px] cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "showroom"
                  ? "bg-[#0B1730] text-[#D9F66F] shadow-md shadow-[#0B1730]/20 border border-[#23416A]"
                  : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 shadow-2xs"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#D9F66F]" />
              <span>Showrooms Pro</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("budget200")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 min-h-[40px] cursor-pointer whitespace-nowrap ${
                activeTab === "budget200"
                  ? "bg-[#0B1730] text-[#D9F66F] shadow-md shadow-[#0B1730]/20 border border-[#23416A]"
                  : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 shadow-2xs"
              }`}
            >
              Moins de 200M
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 p-4 h-64 animate-pulse"
                />
              ))}
            </div>
          ) : filteredVehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#0B1730] text-[#D9F66F] flex items-center justify-center mx-auto mb-4 shadow-sm">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1.5">
                Aucun véhicule dans cette sélection pour le moment
              </h3>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                Le catalogue se remplit quotidiennement d'annonces certifiées en Algérie. Vous
                pouvez être le premier à proposer votre voiture dans cette catégorie !
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/auto/deposer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#D9F66F] to-[#C5E94F] text-[#0B1730] shadow-[0_4px_14px_rgba(217,246,111,0.4)] hover:brightness-105 transition-all"
                >
                  Déposer une annonce gratuite
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  Réinitialiser le filtre
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 5. Showrooms Partenaires Certifiés */}
        <AutoShowroomsSection />

        {/* 6. Guide de Confiance & Sécurité Transactionnelle */}
        <AutoTrustSection />
      </div>
    </div>
  );
};
