import React from "react";
import { VehicleFuel, VehicleTransmission } from "../../domains/auto/auto.types";
import { FUEL_LABELS, TRANSMISSION_LABELS } from "../../domains/auto/auto.utils";
import { getAllBrandNames, getModelsForBrand } from "../../domains/auto/auto.brands";
import { POPULAR_AUTO_BRAND_NAMES } from "../../domains/auto/data/brandLogosMap";
import { BrandModelSelector } from "./BrandModelSelector";
import { WilayaSelectorField } from "./WilayaSelectorField";

export interface Step1Data {
  title: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  mileage: number;
  fuel: VehicleFuel;
  transmission: VehicleTransmission;
  wilayaId?: number;
  wilayaName?: string;
}

interface Step1Props {
  data: Step1Data;
  onChange: (updates: Partial<Step1Data>) => void;
  onNext: () => void;
}

const ALL_NAMES = getAllBrandNames();
const remainingBrands = ALL_NAMES.filter(
  (b) => !POPULAR_AUTO_BRAND_NAMES.some((pb) => pb.toLowerCase() === b.toLowerCase())
);

export const POPULAR_BRANDS: readonly string[] = Object.freeze([
  ...POPULAR_AUTO_BRAND_NAMES,
  ...remainingBrands,
  "Autre",
]);

export const ListingWizardStep1: React.FC<Step1Props> = ({ data, onChange, onNext }) => {
  const currentYear = new Date().getFullYear();

  const computeTitle = (brand: string, model: string, version: string, year: number | "") => {
    return [brand, model, version, year ? String(year) : ""].filter(Boolean).join(" ").trim();
  };

  const handleBrandChange = (brand: string) => {
    const models = brand && brand !== "Autre" ? getModelsForBrand(brand) : [];
    const matchingModel = models.find((m) => m.toLowerCase() === data.model.toLowerCase()) || "";
    onChange({
      brand,
      model: matchingModel,
      title: computeTitle(brand, matchingModel, data.version, data.year),
    });
  };

  const handleModelChange = (model: string) => {
    onChange({
      model,
      title: computeTitle(data.brand, model, data.version, data.year),
    });
  };

  const handleVersionChange = (version: string) => {
    onChange({
      version,
      title: computeTitle(data.brand, data.model, version, data.year),
    });
  };

  const handleYearChange = (year: number) => {
    onChange({
      year,
      title: computeTitle(data.brand, data.model, data.version, year),
    });
  };

  const isValid =
    data.brand.trim().length >= 2 &&
    data.model.trim().length >= 1 &&
    data.year >= 1960 &&
    data.year <= currentYear + 1 &&
    data.mileage >= 0;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-lg font-bold text-slate-900">1. Identité & Caractéristiques du Véhicule</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Renseignez les données techniques principales de votre voiture pour le Showroom Olma Auto.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sélecteurs Marque & Modèle dynamique */}
        <BrandModelSelector
          brand={data.brand}
          model={data.model}
          brandsList={POPULAR_BRANDS}
          onBrandChange={handleBrandChange}
          onModelChange={handleModelChange}
        />

        {/* Finition / Version */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Finition / Version (Optionnel)
          </label>
          <input
            type="text"
            placeholder="Ex: GT Line, Stepway, R-Line, Highline..."
            value={data.version}
            onChange={(e) => handleVersionChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#172B4D]"
          />
        </div>

        {/* Année */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Année de mise en circulation <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1960}
            max={currentYear + 1}
            value={data.year || ""}
            onChange={(e) => handleYearChange(parseInt(e.target.value) || currentYear)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#172B4D]"
          />
        </div>

        {/* Kilométrage */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Kilométrage (km) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            max={1000000}
            placeholder="Ex: 85000"
            value={data.mileage || ""}
            onChange={(e) => onChange({ mileage: parseInt(e.target.value) || 0 })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#172B4D]"
          />
        </div>

        {/* Carburant */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Carburant <span className="text-red-500">*</span>
          </label>
          <select
            value={data.fuel}
            onChange={(e) => onChange({ fuel: e.target.value as VehicleFuel })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#172B4D] bg-white cursor-pointer"
          >
            {(Object.keys(FUEL_LABELS) as VehicleFuel[]).map((f) => (
              <option key={f} value={f}>{FUEL_LABELS[f]}</option>
            ))}
          </select>
        </div>

        {/* Boîte de vitesse */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Boîte de vitesse <span className="text-red-500">*</span>
          </label>
          <select
            value={data.transmission}
            onChange={(e) => onChange({ transmission: e.target.value as VehicleTransmission })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#172B4D] bg-white cursor-pointer"
          >
            {(Object.keys(TRANSMISSION_LABELS) as VehicleTransmission[]).map((t) => (
              <option key={t} value={t}>{TRANSMISSION_LABELS[t]}</option>
            ))}
          </select>
        </div>

        {/* Wilaya de localisation */}
        <WilayaSelectorField
          selectedWilayaId={data.wilayaId || 16}
          onWilayaChange={(id, name) => onChange({ wilayaId: id, wilayaName: name })}
        />

        {/* Titre de l'annonce */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Titre de l'annonce <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Ex: Kia Sportage GT Line 2019"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#172B4D] font-medium"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="px-6 py-2.5 bg-gradient-to-r from-[#D9F66F] to-[#C5E94F] hover:from-[#E2FB7D] hover:to-[#BEE545] disabled:opacity-50 text-[#0B1730] rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98] cursor-pointer min-h-[44px]"
        >
          Continuer vers l'Étape 2 &rarr;
        </button>
      </div>
    </div>
  );
};
