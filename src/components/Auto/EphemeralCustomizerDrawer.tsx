import React from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, ChevronRight } from "lucide-react";
import { EphemeralVehicleConfig } from "../../types/ephemeralAuto.types";
import { POPULAR_AUTO_BRAND_NAMES } from "../../domains/auto/data/brandLogosMap";
import { getModelsForBrand } from "../../domains/auto/auto.brands";
import { VehicleFuel, VehicleTransmission } from "../../domains/auto/auto.types";

export interface EphemeralCustomizerDrawerProps {
  customConfig: EphemeralVehicleConfig;
  updateCustomConfig: (patch: Partial<EphemeralVehicleConfig>) => void;
  resetCustomConfig: () => void;
}

export const EphemeralCustomizerDrawer: React.FC<EphemeralCustomizerDrawerProps> = ({
  customConfig,
  updateCustomConfig,
  resetCustomConfig,
}) => {
  const navigate = useNavigate();
  const availableModels = getModelsForBrand(customConfig.brand);

  return (
    <div className="p-4 sm:p-5 bg-white border-t border-[#E0B4B2]/40 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold text-[#1A1836] uppercase tracking-wider">
          Studio de Personnalisation Éphémère (Mise à jour instantanée sur toutes les étapes)
        </h3>
        <button
          type="button"
          onClick={resetCustomConfig}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#A54055] hover:text-[#622347] cursor-pointer bg-transparent border-none"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Réinitialiser</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-zinc-600 mb-1">Marque</label>
          <select
            value={customConfig.brand}
            onChange={(e) => {
              const nextBrand = e.target.value;
              const models = getModelsForBrand(nextBrand);
              updateCustomConfig({ brand: nextBrand, model: models[0] || "Modèle" });
            }}
            className="w-full px-2.5 py-2 bg-[#FAF7F8] border border-[#E0B4B2]/60 rounded-xl text-xs font-bold text-[#1A1836]"
          >
            {POPULAR_AUTO_BRAND_NAMES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-zinc-600 mb-1">Modèle</label>
          <select
            value={customConfig.model}
            onChange={(e) => updateCustomConfig({ model: e.target.value })}
            className="w-full px-2.5 py-2 bg-[#FAF7F8] border border-[#E0B4B2]/60 rounded-xl text-xs font-bold text-[#1A1836]"
          >
            {availableModels.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-zinc-600 mb-1">Année</label>
          <input
            type="number"
            min={2000}
            max={2026}
            value={customConfig.year}
            onChange={(e) => updateCustomConfig({ year: Number(e.target.value) || 2023 })}
            className="w-full px-2.5 py-2 bg-[#FAF7F8] border border-[#E0B4B2]/60 rounded-xl text-xs font-bold text-[#1A1836]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-zinc-600 mb-1">Kilométrage (km)</label>
          <input
            type="number"
            step={5000}
            min={0}
            value={customConfig.mileage}
            onChange={(e) => updateCustomConfig({ mileage: Math.max(0, Number(e.target.value) || 0) })}
            className="w-full px-2.5 py-2 bg-[#FAF7F8] border border-[#E0B4B2]/60 rounded-xl text-xs font-bold text-[#1A1836]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-zinc-600 mb-1">Prix (DZD)</label>
          <input
            type="number"
            step={50000}
            min={100000}
            value={customConfig.price}
            onChange={(e) => updateCustomConfig({ price: Math.max(100000, Number(e.target.value) || 2500000) })}
            className="w-full px-2.5 py-2 bg-[#FAF7F8] border border-[#E0B4B2]/60 rounded-xl text-xs font-bold text-[#1A1836]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-zinc-600 mb-1">Énergie & Boîte</label>
          <select
            value={`${customConfig.fuel}:${customConfig.transmission}`}
            onChange={(e) => {
              const [f, tr] = e.target.value.split(":") as [VehicleFuel, VehicleTransmission];
              updateCustomConfig({ fuel: f, transmission: tr });
            }}
            className="w-full px-2.5 py-2 bg-[#FAF7F8] border border-[#E0B4B2]/60 rounded-xl text-xs font-bold text-[#1A1836]"
          >
            <option value="essence:automatique">Essence · Auto</option>
            <option value="essence:manuelle">Essence · Manuelle</option>
            <option value="diesel:automatique">Diesel · Auto</option>
            <option value="diesel:manuelle">Diesel · Manuelle</option>
            <option value="hybride:automatique">Hybride · Auto</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={() => navigate("/auto/estimation")}
          className="px-3.5 py-2 rounded-xl bg-[#FAF7F8] hover:bg-[#E0B4B2]/30 text-[#1A1836] text-xs font-bold border border-[#E0B4B2]/60 cursor-pointer flex items-center gap-1"
        >
          <span>Tester dans la Cote Argus</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => navigate("/auto/vehicules/ephemeral-custom")}
          className="px-4 py-2 rounded-xl bg-[#1A1836] hover:bg-[#42164B] text-[#E99856] text-xs font-extrabold cursor-pointer border-none flex items-center gap-1"
        >
          <span>Inspecter la Fiche Finale</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
