import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Car, ChevronLeft, ChevronRight } from "lucide-react";
import { VehicleCard } from "../../components/Auto/VehicleCard";
import { AutoFilterBar } from "../../components/Auto/AutoFilterBar";
import { AutoFilterDrawer } from "../../components/Auto/AutoFilterDrawer";
import { AutoCompareBar } from "../../components/Auto/AutoCompareBar";
import { CatalogHeader } from "../../components/Auto/CatalogHeader";
import { autoClient } from "../../domains/auto/auto.client";
import { useVehicleFavorites } from "../../hooks/useVehicleFavorites";
import {
  VehicleCatalogItemDto,
  VehicleFilterParams,
  VehicleFuel,
  VehicleTransmission,
  VehiclePaperStatus,
  VehicleBodyCondition,
  VehiclePriceType,
} from "../../domains/auto/auto.types";

export const VehicleCatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [items, setItems] = useState<VehicleCatalogItemDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { favorites, isFavorite, count: favoritesCount } = useVehicleFavorites();

  const isFavoritesMode = searchParams.get("tab") === "favorites";

  const filters: VehicleFilterParams = useMemo(() => {
    return {
      brand: searchParams.get("brand") || undefined,
      model: searchParams.get("model") || undefined,
      fuel: (searchParams.get("fuel") as VehicleFuel) || undefined,
      transmission: (searchParams.get("transmission") as VehicleTransmission) || undefined,
      paperStatus: (searchParams.get("paperStatus") as VehiclePaperStatus) || undefined,
      bodyCondition: (searchParams.get("bodyCondition") as VehicleBodyCondition) || undefined,
      priceType: (searchParams.get("priceType") as VehiclePriceType) || undefined,
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      minYear: searchParams.get("minYear") ? Number(searchParams.get("minYear")) : undefined,
      maxYear: searchParams.get("maxYear") ? Number(searchParams.get("maxYear")) : undefined,
      maxMileage: searchParams.get("maxMileage") ? Number(searchParams.get("maxMileage")) : undefined,
      wilayaId: searchParams.get("wilayaId") ? Number(searchParams.get("wilayaId")) : undefined,
      sort: (searchParams.get("sort") as VehicleFilterParams["sort"]) || "date_desc",
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: 12,
    };
  }, [searchParams]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.brand) count++;
    if (filters.fuel) count++;
    if (filters.transmission) count++;
    if (filters.paperStatus) count++;
    if (filters.bodyCondition) count++;
    if (filters.priceType) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.minYear || filters.maxYear) count++;
    if (filters.maxMileage) count++;
    if (filters.wilayaId) count++;
    return count;
  }, [filters]);

  const updateFilters = useCallback(
    (updated: Partial<VehicleFilterParams>) => {
      const nextParams = new URLSearchParams(searchParams);
      Object.entries(updated).forEach(([k, v]) => {
        if (v === undefined || v === "") nextParams.delete(k);
        else nextParams.set(k, String(v));
      });
      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams]
  );

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const handleTabChange = (tab: "all" | "favorites") => {
    const next = new URLSearchParams(searchParams);
    if (tab === "favorites") next.set("tab", "favorites");
    else next.delete("tab");
    setSearchParams(next);
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    autoClient
      .getPublicListings(filters)
      .then((res) => {
        if (active) {
          setItems(res.items || []);
          setTotal(res.total || 0);
        }
      })
      .catch(() => {
        if (active) {
          setItems([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters]);

  const displayedItems = useMemo(() => {
    if (!isFavoritesMode) return items;
    return items.filter((item) => favorites.includes(item.id));
  }, [items, isFavoritesMode, favorites]);

  const currentPage = filters.page || 1;
  const totalPages = Math.max(1, Math.ceil(total / 12));

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <CatalogHeader
          total={total}
          favoritesCount={favoritesCount}
          isFavoritesMode={isFavoritesMode}
          displayedCount={displayedItems.length}
          onTabChange={handleTabChange}
        />

        <AutoFilterBar
          filters={filters}
          onChange={updateFilters}
          onReset={resetFilters}
          onOpenDrawer={() => setDrawerOpen(true)}
          activeFilterCount={activeFilterCount}
        />

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 h-80 animate-pulse" />
            ))}
          </div>
        ) : displayedItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {displayedItems.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  isFavorite={isFavorite(vehicle.id)}
                />
              ))}
            </div>

            {!isFavoritesMode && totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => updateFilters({ page: currentPage - 1 })}
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Précédent</span>
                </button>
                <span className="text-xs text-slate-500">
                  Page <strong className="text-slate-900">{currentPage}</strong> sur {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => updateFilters({ page: currentPage + 1 })}
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Suivant</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto mt-6">
            <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {isFavoritesMode
                ? "Vous n'avez aucun véhicule dans vos favoris"
                : "Aucun véhicule ne correspond à vos critères"}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              {isFavoritesMode
                ? "Cliquez sur l'icône cœur sur n'importe quelle annonce pour la retrouver ici facilement."
                : "Essayez d'élargir votre sélection géographique ou d'ajuster votre budget."}
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Réinitialiser tous les filtres
            </button>
          </div>
        )}

        <AutoFilterDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          filters={filters}
          onChange={updateFilters}
          onReset={resetFilters}
          totalResults={total}
        />

        <AutoCompareBar />
      </div>
    </div>
  );
};
