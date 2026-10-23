import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { AutoFilterDrawer } from "../../components/Auto/AutoFilterDrawer";
import { VehicleCard } from "../../components/Auto/VehicleCard";
import { autoClient } from "../../domains/auto/auto.client";
import { autoSearchCache } from "../../domains/auto/auto.cache";
import { VehicleCatalogItemDto, VehicleFilterParams } from "../../domains/auto/auto.types";
import { searchBrandsAndModels } from "../../domains/auto/auto.brands";

export const AutoHome: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<VehicleCatalogItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<VehicleFilterParams>({});

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

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => key !== "page" && key !== "limit" && key !== "sort" && value !== undefined && value !== ""
  ).length;

  const openResults = () => {
    const next = { ...filters };
    const term = searchText.trim();
    if (term) {
      const match = searchBrandsAndModels(term, 1)[0];
      if (match && match.model.toLocaleLowerCase().includes(term.toLocaleLowerCase())) {
        next.brand = match.brand;
        next.model = match.model;
      } else if (match && match.brand.toLocaleLowerCase() === term.toLocaleLowerCase()) {
        next.brand = match.brand;
      } else {
        next.brand = term;
      }
    }
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value !== undefined && value !== "") params.set(key, String(value));
    });
    navigate(`/auto/catalog${params.size ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fb] pb-24">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            openResults();
          }}
          className="mb-8 flex gap-2 rounded-[1.35rem] border border-slate-200 bg-white p-2 shadow-sm sm:mb-10 sm:p-2.5"
          role="search"
          aria-label="Rechercher un véhicule"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3 pl-3">
            <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Marque ou modèle"
              aria-label="Marque ou modèle du véhicule"
              className="h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              aria-label={`Ouvrir les filtres${activeFilterCount ? `, ${activeFilterCount} actifs` : ""}`}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 transition hover:border-[#172B4D]/30 hover:bg-slate-100"
            >
              <SlidersHorizontal className="h-4 w-4 text-[#172B4D]" />
              <span className="hidden sm:inline">Filtres</span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0B1730] px-1 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
          <button
            type="submit"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0B1730] px-4 text-sm font-semibold text-white transition hover:bg-[#172B4D] sm:px-5"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Rechercher</span>
          </button>
        </form>

        <section aria-labelledby="auto-recent-heading">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h1 id="auto-recent-heading" className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                Annonces récentes
              </h1>
              <p className="mt-1 text-xs text-slate-500">Les derniers véhicules publiés sur Olma Auto</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white p-4"
                />
              ))}
            </div>
          ) : vehicles.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
              <h2 className="text-base font-bold text-slate-900">Aucune annonce pour le moment</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Les nouveaux véhicules publiés apparaîtront ici. Lancez une recherche pour parcourir tout le catalogue.
              </p>
            </div>
          )}
        </section>

        <AutoFilterDrawer
          isOpen={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          filters={filters}
          onChange={(updated) => setFilters((current) => ({ ...current, ...updated }))}
          onReset={() => setFilters({})}
          onApply={openResults}
        />
      </div>
    </div>
  );
};
