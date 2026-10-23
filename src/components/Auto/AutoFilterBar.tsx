import React from "react";
import { SlidersHorizontal, RotateCcw, Search } from "lucide-react";
import { VehicleFilterParams, VehicleFuel, VehicleTransmission } from "../../domains/auto/auto.types";
import { FUEL_LABELS, TRANSMISSION_LABELS } from "../../domains/auto/auto.utils";

export interface AutoFilterBarProps {
  filters: VehicleFilterParams;
  onChange: (updated: Partial<VehicleFilterParams>) => void;
  onReset: () => void;
  onOpenDrawer: () => void;
  activeFilterCount: number;
}

export const AutoFilterBar: React.FC<AutoFilterBarProps> = ({
  filters,
  onChange,
  onReset,
  onOpenDrawer,
  activeFilterCount,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-3 sm:p-4 mb-6 shadow-xs">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Champ de recherche */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.brand || ""}
            onChange={(e) => onChange({ brand: e.target.value || undefined, page: 1 })}
            placeholder="Rechercher marque ou modèle..."
            className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#172B4D] focus:border-[#172B4D] transition-colors min-h-[44px]"
          />
        </div>

        {/* Sélecteurs rapides */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Carburant */}
          <select
            value={filters.fuel || ""}
            onChange={(e) =>
              onChange({ fuel: (e.target.value as VehicleFuel) || undefined, page: 1 })
            }
            className="px-3 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#172B4D] focus:border-[#172B4D] cursor-pointer min-h-[44px]"
          >
            <option value="">Carburant (Tous)</option>
            {(Object.keys(FUEL_LABELS) as VehicleFuel[]).map((f) => (
              <option key={f} value={f}>
                {FUEL_LABELS[f]}
              </option>
            ))}
          </select>

          {/* Boîte */}
          <select
            value={filters.transmission || ""}
            onChange={(e) =>
              onChange({
                transmission: (e.target.value as VehicleTransmission) || undefined,
                page: 1,
              })
            }
            className="px-3 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#172B4D] focus:border-[#172B4D] cursor-pointer min-h-[44px]"
          >
            <option value="">Boîte (Toutes)</option>
            {(Object.keys(TRANSMISSION_LABELS) as VehicleTransmission[]).map((t) => (
              <option key={t} value={t}>
                {TRANSMISSION_LABELS[t]}
              </option>
            ))}
          </select>

          {/* Tri */}
          <select
            value={filters.sort || "date_desc"}
            onChange={(e) =>
              onChange({
                sort: e.target.value as VehicleFilterParams["sort"],
                page: 1,
              })
            }
            className="px-3 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#172B4D] focus:border-[#172B4D] cursor-pointer min-h-[44px]"
          >
            <option value="date_desc">Plus récents</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="mileage_asc">Kilométrage croissant</option>
            <option value="year_desc">Année récente</option>
          </select>

          {/* Tiroir de filtres avancés */}
          <button
            type="button"
            onClick={onOpenDrawer}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition-all min-h-[44px] cursor-pointer ${
              activeFilterCount > 0
                ? "bg-[#0B1730] border-[#0B1730] text-white"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtres</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#D9F66F] text-[#0B1730] text-[11px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Bouton de réinitialisation */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              title="Réinitialiser tous les filtres"
              className="p-2.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
