import React from "react";
import { X } from "lucide-react";
import {
  VehicleFilterParams,
  VehiclePriceType,
  AutoSellerType,
} from "../../domains/auto/auto.types";
import { PRICE_TYPE_LABELS } from "../../domains/auto/auto.utils";
import { WILAYAS_69 } from "../../domains/auto/auto.wilayas";
import { PaperFilterBlock, BodyFilterBlock } from "./AutoFilterSectionBlocks";

export interface AutoFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: VehicleFilterParams;
  onChange: (updated: Partial<VehicleFilterParams>) => void;
  onReset: () => void;
  totalResults?: number;
}

export const AutoFilterDrawer: React.FC<AutoFilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onChange,
  onReset,
  totalResults,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-[#0B1730]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-[#0B1730] text-white">
            <h2 className="text-base font-bold">
              Filtres Spécifiques Algérie
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
            {/* 1. Wilaya (69 Wilayas) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Wilaya (69 Wilayas)
              </label>
              <select
                value={filters.wilayaId || ""}
                onChange={(e) =>
                  onChange({
                    wilayaId: e.target.value ? Number(e.target.value) : undefined,
                    page: 1,
                  })
                }
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#172B4D] min-h-[44px]"
              >
                <option value="">Toute l'Algérie (69 Wilayas)</option>
                {WILAYAS_69.map((w) => (
                  <option key={w.code} value={w.id}>
                    {w.code} - {w.name} ({w.name_ar})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Statut Papiers */}
            <PaperFilterBlock
              selected={filters.paperStatus}
              onSelect={(p) => onChange({ paperStatus: p, page: 1 })}
            />

            {/* 3. État de la Tôle / Carrosserie */}
            <BodyFilterBlock
              selected={filters.bodyCondition}
              onSelect={(b) => onChange({ bodyCondition: b, page: 1 })}
            />

            {/* 4. Type de Prix */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Modalités de Prix
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(PRICE_TYPE_LABELS) as VehiclePriceType[]).map((pt) => {
                  const isChecked = filters.priceType === pt;
                  return (
                    <button
                      key={pt}
                      type="button"
                      onClick={() =>
                        onChange({ priceType: isChecked ? undefined : pt, page: 1 })
                      }
                      className={`p-2.5 rounded-lg border text-xs text-center transition-colors min-h-[44px] cursor-pointer ${
                        isChecked
                          ? "bg-[#0B1730] border-[#0B1730] text-white font-semibold"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {PRICE_TYPE_LABELS[pt]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Kilométrage Max */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Kilométrage Maximum
              </label>
              <input
                type="number"
                placeholder="Ex: 120000 km"
                value={filters.maxMileage || ""}
                onChange={(e) =>
                  onChange({
                    maxMileage: e.target.value ? Number(e.target.value) : undefined,
                    page: 1,
                  })
                }
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 min-h-[44px]"
              />
            </div>

            {/* 6. Type de Vendeur */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Type de Vendeur
              </label>
              <select
                value={filters.sellerType || ""}
                onChange={(e) =>
                  onChange({
                    sellerType: (e.target.value as AutoSellerType) || undefined,
                    page: 1,
                  })
                }
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 min-h-[44px]"
              >
                <option value="">Tous les vendeurs</option>
                <option value="particulier">Particulier uniquement</option>
                <option value="professionnel">Showroom Professionnel</option>
                <option value="concessionnaire">Concessionnaire agréé</option>
              </select>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3">
            <button
              type="button"
              onClick={onReset}
              className="flex-1 py-2.5 px-3 border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 hover:bg-white transition-colors min-h-[44px] cursor-pointer"
            >
              Réinitialiser
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-2 py-2.5 px-4 bg-[#D9F66F] hover:bg-[#C5E94F] text-[#0B1730] font-bold rounded-lg text-xs sm:text-sm transition-colors shadow-xs min-h-[44px] cursor-pointer"
            >
              Appliquer {totalResults !== undefined ? `(${totalResults} annonces)` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
