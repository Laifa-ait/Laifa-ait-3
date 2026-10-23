import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Calculator, ArrowRight, Car } from "lucide-react";
import {
  VehicleFuel,
  VehicleTransmission,
  VehiclePaperStatus,
  VehicleBodyCondition,
} from "../../domains/auto/auto.types";
import {
  FUEL_LABELS,
  TRANSMISSION_LABELS,
  PAPER_STATUS_LABELS,
  BODY_CONDITION_LABELS,
} from "../../domains/auto/auto.utils";
import { getModelsForBrand } from "../../domains/auto/auto.brands";
import { POPULAR_AUTO_BRAND_NAMES } from "../../domains/auto/data/brandLogosMap";
import { calculateArgusEstimate } from "../../domains/auto/auto.argus";
import { ArgusResultCard } from "../../components/Auto/ArgusResultCard";

export const AutoEstimationPage: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const [brand, setBrand] = useState("Renault");
  const [model, setModel] = useState("Clio 4");
  const [year, setYear] = useState(2019);
  const [mileage, setMileage] = useState(95000);
  const [fuel, setFuel] = useState<VehicleFuel>("diesel");
  const [transmission, setTransmission] = useState<VehicleTransmission>("manuelle");
  const [paperStatus, setPaperStatus] = useState<VehiclePaperStatus>("safia");
  const [bodyCondition, setBodyCondition] = useState<VehicleBodyCondition>("origine");

  const availableModels = useMemo(() => {
    return brand ? getModelsForBrand(brand) : [];
  }, [brand]);

  const handleBrandChange = (newBrand: string) => {
    setBrand(newBrand);
    const models = getModelsForBrand(newBrand);
    setModel(models[0] || "");
  };

  const estimate = useMemo(() => {
    if (!brand || !model) return null;
    return calculateArgusEstimate({
      brand,
      model,
      year,
      mileage,
      fuel,
      transmission,
      paperStatus,
      bodyCondition,
    });
  }, [brand, model, year, mileage, fuel, transmission, paperStatus, bodyCondition]);

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        {/* En-tête */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link to="/auto" className="hover:text-[#172B4D] transition-colors">Showroom</Link>
            <span aria-hidden="true">/</span>
            <span className="text-slate-900 font-medium">Cote &amp; Argus Automobile</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B1730] tracking-tight flex items-center gap-2">
                <Calculator className="w-7 h-7 text-[#172B4D]" />
                <span>Cote Argus Automobile en Algérie</span>
              </h1>
              <p className="text-xs text-sm text-slate-600 mt-1">
                Estimez la valeur marchande réelle de votre véhicule selon les tendances du marché des 69 wilayas.
              </p>
            </div>
            <Link
              to="/auto/deposer"
              className="self-start sm:self-auto px-4 py-2 bg-gradient-to-r from-[#D9F66F] to-[#C5E94F] text-[#0B1730] text-xs font-black rounded-xl shadow-xs hover:brightness-105 transition-all flex items-center gap-1.5"
            >
              <span>Vendre mon véhicule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Formulaire de configuration du véhicule */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Car className="w-4 h-4 text-[#172B4D]" />
              <span>Caractéristiques du véhicule</span>
            </h2>

            {/* Marque & Modèle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Marque</label>
                <select
                  value={brand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  {POPULAR_AUTO_BRAND_NAMES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Modèle</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  {availableModels.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Année & Kilométrage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Année</label>
                <input
                  type="number"
                  min={1990}
                  max={currentYear + 1}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value) || currentYear)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kilométrage (km)</label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={mileage}
                  onChange={(e) => setMileage(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                />
              </div>
            </div>

            {/* Carburant & Boîte */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Carburant</label>
                <select
                  value={fuel}
                  onChange={(e) => setFuel(e.target.value as VehicleFuel)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none cursor-pointer"
                >
                  {(Object.keys(FUEL_LABELS) as VehicleFuel[]).map((f) => (
                    <option key={f} value={f}>{FUEL_LABELS[f]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Boîte de vitesse</label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value as VehicleTransmission)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none cursor-pointer"
                >
                  {(Object.keys(TRANSMISSION_LABELS) as VehicleTransmission[]).map((t) => (
                    <option key={t} value={t}>{TRANSMISSION_LABELS[t]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Statut Papiers & État Carrosserie */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Statut des Papiers</label>
                <select
                  value={paperStatus}
                  onChange={(e) => setPaperStatus(e.target.value as VehiclePaperStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none cursor-pointer"
                >
                  {(Object.keys(PAPER_STATUS_LABELS) as VehiclePaperStatus[]).map((p) => (
                    <option key={p} value={p}>{PAPER_STATUS_LABELS[p].label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">État de la tôle (Sbigha)</label>
                <select
                  value={bodyCondition}
                  onChange={(e) => setBodyCondition(e.target.value as VehicleBodyCondition)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none cursor-pointer"
                >
                  {(Object.keys(BODY_CONDITION_LABELS) as VehicleBodyCondition[]).map((b) => (
                    <option key={b} value={b}>{BODY_CONDITION_LABELS[b].label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Carte Résultat d'Estimation */}
          <div className="lg:col-span-5">
            {estimate && (
              <ArgusResultCard
                estimate={estimate}
                brand={brand}
                model={model}
                year={year}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
