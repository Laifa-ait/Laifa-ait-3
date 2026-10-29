import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CarFront, X, PlusCircle, RotateCcw } from "lucide-react";
import { OlmaAutoSearchBar } from "../../components/Auto/OlmaAutoSearchBar";
import { OlmaAutoBrandBar } from "../../components/Auto/OlmaAutoBrandBar";
import { AutoFilterDrawer } from "../../components/Auto/AutoFilterDrawer";
import { AutoCompareBar } from "../../components/Auto/AutoCompareBar";
import { VehicleCard } from "../../components/Auto/VehicleCard";
import { autoClient } from "../../domains/auto/auto.client";
import {
  VehicleCatalogItemDto,
  VehicleFilterParams,
  VehicleFuel,
  VehicleTransmission,
  VehiclePaperStatus,
} from "../../domains/auto/auto.types";
import { useEphemeralAutoStudio } from "../../hooks/useEphemeralAutoStudio";
import { useVehicleFavorites } from "../../hooks/useVehicleFavorites";
import { getWilayaNameById } from "../../domains/auto/auto.utils";

const SORT_TABS: Array<{ id: NonNullable<VehicleFilterParams["sort"]>; label: string }> = [
  { id: "date_desc", label: "Récents" },
  { id: "price_asc", label: "Prix ↑" },
  { id: "price_desc", label: "Prix ↓" },
  { id: "mileage_asc", label: "Km min" },
];

export const AutoHome: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [remoteVehicles, setRemoteVehicles] = useState<VehicleCatalogItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [whatTerm, setWhatTerm] = useState(searchParams.get("q") || searchParams.get("brand") || "");

  const { ephemeralVehicles } = useEphemeralAutoStudio();
  const { favorites, isFavorite, toggleFavorite } = useVehicleFavorites();
  const isFavoritesOnly = searchParams.get("tab") === "favorites";

  const filters: VehicleFilterParams = useMemo(() => ({
    brand: searchParams.get("brand") || undefined,
    model: searchParams.get("model") || undefined,
    fuel: (searchParams.get("fuel") as VehicleFuel) || undefined,
    transmission: (searchParams.get("transmission") as VehicleTransmission) || undefined,
    paperStatus: (searchParams.get("paperStatus") as VehiclePaperStatus) || undefined,
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    minYear: searchParams.get("minYear") ? Number(searchParams.get("minYear")) : undefined,
    maxYear: searchParams.get("maxYear") ? Number(searchParams.get("maxYear")) : undefined,
    maxMileage: searchParams.get("maxMileage") ? Number(searchParams.get("maxMileage")) : undefined,
    wilayaId: searchParams.get("wilayaId") ? Number(searchParams.get("wilayaId")) : undefined,
    sort: (searchParams.get("sort") as VehicleFilterParams["sort"]) || "date_desc",
    limit: 24,
  }), [searchParams]);

  const updateFilters = useCallback((updated: Partial<VehicleFilterParams>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updated).forEach(([k, v]) => {
      if (v === undefined || v === "") next.delete(k);
      else next.set(k, String(v));
    });
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const resetAllFilters = useCallback(() => {
    setWhatTerm("");
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    autoClient
      .getPublicListings(filters)
      .then((res) => { if (active) setRemoteVehicles(res.items || []); })
      .catch(() => { if (active) setRemoteVehicles([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filters]);

  const displayedVehicles = useMemo(() => {
    const merged = [...remoteVehicles, ...ephemeralVehicles];
    const queryLower = whatTerm.trim().toLowerCase();

    const filtered = merged.filter((v) => {
      if (isFavoritesOnly && !favorites.includes(v.id)) return false;
      if (filters.brand && v.brand.toLowerCase() !== filters.brand.toLowerCase()) return false;
      if (filters.fuel && v.fuel !== filters.fuel) return false;
      if (filters.transmission && v.transmission !== filters.transmission) return false;
      if (filters.paperStatus && v.paperStatus !== filters.paperStatus) return false;
      if (filters.wilayaId && v.wilayaId !== filters.wilayaId) return false;
      if (filters.minPrice && v.price < filters.minPrice) return false;
      if (filters.maxPrice && v.price > filters.maxPrice) return false;
      if (filters.minYear && v.year < filters.minYear) return false;
      if (filters.maxMileage && v.mileage > filters.maxMileage) return false;
      if (queryLower) {
        const haystack = `${v.brand} ${v.model} ${v.title || ""} ${v.wilayaName || ""}`.toLowerCase();
        if (!haystack.includes(queryLower)) return false;
      }
      return true;
    });

    if (filters.sort === "price_asc") return [...filtered].sort((a, b) => a.price - b.price);
    if (filters.sort === "price_desc") return [...filtered].sort((a, b) => b.price - a.price);
    if (filters.sort === "mileage_asc") return [...filtered].sort((a, b) => a.mileage - b.mileage);
    return filtered;
  }, [remoteVehicles, ephemeralVehicles, whatTerm, isFavoritesOnly, favorites, filters]);

  const activeFilterCount = useMemo(() => [
    filters.brand, filters.fuel, filters.transmission, filters.paperStatus,
    filters.wilayaId, filters.minPrice || filters.maxPrice, filters.minYear || filters.maxMileage,
  ].filter(Boolean).length, [filters]);

  const openBrandPicker = () => window.dispatchEvent(new CustomEvent("olmart:open-auto-brand-picker"));

  const handleToggleQuickFilter = (type: "automatique" | "diesel" | "essence" | "safia") => {
    if (type === "automatique") updateFilters({ transmission: filters.transmission === "automatique" ? undefined : "automatique" });
    else if (type === "diesel") updateFilters({ fuel: filters.fuel === "diesel" ? undefined : "diesel" });
    else if (type === "essence") updateFilters({ fuel: filters.fuel === "essence" ? undefined : "essence" });
    else if (type === "safia") updateFilters({ paperStatus: filters.paperStatus === "safia" ? undefined : "safia" });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      <OlmaAutoSearchBar
        whatTerm={whatTerm}
        whereWilayaId={filters.wilayaId}
        onWhatChange={(val) => {
          setWhatTerm(val);
          if (!val && filters.brand) updateFilters({ brand: undefined });
        }}
        onWilayaChange={(wilayaId) => updateFilters({ wilayaId })}
        onOpenBrandPicker={openBrandPicker}
        onOpenFilters={() => setFiltersOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-2 space-y-3">
        <OlmaAutoBrandBar
          selectedBrand={filters.brand}
          selectedTransmission={filters.transmission}
          selectedFuel={filters.fuel}
          selectedPaperStatus={filters.paperStatus}
          onSelectBrand={(brand) => { setWhatTerm(""); updateFilters({ brand }); }}
          onToggleQuickFilter={handleToggleQuickFilter}
          onOpenBrandPicker={openBrandPicker}
        />

        <div className="flex flex-wrap items-center justify-between gap-2.5 py-2 border-b border-slate-200/70">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs sm:text-sm font-black text-slate-900 tabular-nums">
              {displayedVehicles.length} annonce{displayedVehicles.length > 1 ? "s" : ""}
            </span>

            {filters.brand && (
              <button
                type="button"
                onClick={() => updateFilters({ brand: undefined })}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer border-none"
              >
                <span>{filters.brand}</span>
                <X className="w-3 h-3" />
              </button>
            )}

            {filters.wilayaId && (
              <button
                type="button"
                onClick={() => updateFilters({ wilayaId: undefined })}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer border-none"
              >
                <span>{getWilayaNameById(filters.wilayaId)}</span>
                <X className="w-3 h-3" />
              </button>
            )}

            {(activeFilterCount > 0 || whatTerm) && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer bg-transparent border-none px-1.5 py-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Effacer</span>
              </button>
            )}
          </div>

          <div className="inline-flex items-center p-1 bg-slate-200/75 rounded-2xl">
            {SORT_TABS.map((tab) => {
              const active = (filters.sort || "date_desc") === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => updateFilters({ sort: tab.id })}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer border-none ${
                    active ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900 bg-transparent"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading && displayedVehicles.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-white p-4" />
            ))}
          </div>
        ) : displayedVehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
            {displayedVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} isFavorite={isFavorite(vehicle.id)} onToggleFavorite={toggleFavorite} />
            ))}
          </div>
        ) : (
          <div className="max-w-lg mx-auto my-8 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <CarFront className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Aucun véhicule trouvé</h3>
            <p className="text-xs text-slate-500">Essayez une autre marque ou réinitialisez les filtres.</p>
            <div className="flex flex-wrap justify-center gap-3 pt-1">
              <button type="button" onClick={resetAllFilters} className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold cursor-pointer border-none">
                Tout afficher
              </button>
              <Link to="/auto/deposer" className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold inline-flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4" />
                <span>Ajouter un véhicule</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      <AutoFilterDrawer
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onChange={updateFilters}
        onReset={resetAllFilters}
        onApply={() => setFiltersOpen(false)}
        totalResults={displayedVehicles.length}
      />
      <AutoCompareBar />
    </div>
  );
};
