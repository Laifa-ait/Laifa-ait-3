import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { AutoJourneyStepperBar } from "../../components/Auto/AutoJourneyStepperBar";
import { useEphemeralAutoStudio } from "../../hooks/useEphemeralAutoStudio";
import toast from "react-hot-toast";

export const AutoEstimationPage: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const { customConfig, updateCustomConfig } = useEphemeralAutoStudio();

  const [brand, setBrand] = useState(customConfig.brand || "Renault");
  const [model, setModel] = useState(customConfig.model || "Clio 5");
  const [year, setYear] = useState(customConfig.year || 2023);
  const [mileage, setMileage] = useState(customConfig.mileage || 34000);
  const [fuel, setFuel] = useState<VehicleFuel>(customConfig.fuel || "essence");
  const [transmission, setTransmission] = useState<VehicleTransmission>(customConfig.transmission || "automatique");
  const [paperStatus, setPaperStatus] = useState<VehiclePaperStatus>(customConfig.paperStatus || "safia");
  const [bodyCondition, setBodyCondition] = useState<VehicleBodyCondition>(customConfig.bodyCondition || "origine");

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

  const handleApplyToEphemeral = () => {
    if (!estimate) return;
    updateCustomConfig({
      brand,
      model,
      year,
      mileage,
      fuel,
      transmission,
      paperStatus,
      bodyCondition,
      price: estimate.estimatedPrice,
      title: `${brand} ${model} ${year}`,
    });
    toast.success("Estimation appliquée au Modèle Éphémère !");
    navigate("/auto/vehicules/ephemeral-custom");
  };

  return (
    <div className="min-h-screen bg-[#FAF7F8] pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        <AutoJourneyStepperBar />

        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
            <Link to="/auto" className="hover:text-[#1A1836] transition-colors">Showroom</Link>
            <span aria-hidden="true">/</span>
            <span className="text-[#1A1836] font-bold">02. Cote &amp; Argus Automobile</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1836] tracking-tight flex items-center gap-2.5">
                <Calculator className="w-7 h-7 text-[#A54055]" />
                <span>Cote Argus Automobile en Algérie</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                Étape 02 : Estimez la valeur marchande de votre véhicule et appliquez-la en 1 clic au Modèle Éphémère.
              </p>
            </div>
            <Link
              to="/auto/deposer"
              className="self-start sm:self-auto px-4 py-2.5 bg-gradient-to-r from-[#E99856] to-[#d8823e] text-[#1A1836] text-xs font-extrabold rounded-xl shadow-xs hover:brightness-105 transition-all flex items-center gap-1.5"
            >
              <span>Étape 03 : Déposer l'annonce</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E0B4B2]/50 p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-extrabold text-[#1A1836] uppercase tracking-wider flex items-center gap-2 border-b border-[#FAF7F8] pb-3">
              <Car className="w-4 h-4 text-[#A54055]" />
              <span>Caractéristiques techniques à évaluer</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#1A1836] mb-1">Marque</label>
                <select
                  value={brand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F8] border border-[#E0B4B2]/60 rounded-xl text-xs font-bold text-[#1A1836] outline-none cursor-pointer"
                >
                  {POPULAR_AUTO_BRAND_NAMES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1836] mb-1">Modèle</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F8] border border-[#E0B4B2]/60 rounded-xl text-xs font-bold text-[#1A1836] outline-none cursor-pointer"
                >
                  {availableModels.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#1A1836] mb-1">Année</label>
                <input
                  type="number"
                  min={1990}
                  max={currentYear + 1}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value) || currentYear)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F8] border border-[#E0B4B2]/60 rounded-xl text-xs font-bold text-[#1A1836] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1836] mb-1">Kilométrage (km)</label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={mileage}
                  onChange={(e) => setMileage(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F8] border border-[#E0B4B2]/60 rounded-xl text-xs font-bold text-[#1A1836] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#1A1836] mb-1">Carburant</label>
                <select
                  value={fuel}
                  onChange={(e) => setFuel(e.target.value as VehicleFuel)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F8] border border-[#E0B4B2]/60 rounded-xl text-xs font-semibold text-[#1A1836] outline-none cursor-pointer"
                >
                  {(Object.keys(FUEL_LABELS) as VehicleFuel[]).map((f) => (
                    <option key={f} value={f}>{FUEL_LABELS[f]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1836] mb-1">Boîte de vitesse</label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value as VehicleTransmission)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F8] border border-[#E0B4B2]/60 rounded-xl text-xs font-semibold text-[#1A1836] outline-none cursor-pointer"
                >
                  {(Object.keys(TRANSMISSION_LABELS) as VehicleTransmission[]).map((t) => (
                    <option key={t} value={t}>{TRANSMISSION_LABELS[t]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#1A1836] mb-1">Statut des Papiers</label>
                <select
                  value={paperStatus}
                  onChange={(e) => setPaperStatus(e.target.value as VehiclePaperStatus)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F8] border border-[#E0B4B2]/60 rounded-xl text-xs font-semibold text-[#1A1836] outline-none cursor-pointer"
                >
                  {(Object.keys(PAPER_STATUS_LABELS) as VehiclePaperStatus[]).map((p) => (
                    <option key={p} value={p}>{PAPER_STATUS_LABELS[p].label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1836] mb-1">État de la carrosserie (Tôle)</label>
                <select
                  value={bodyCondition}
                  onChange={(e) => setBodyCondition(e.target.value as VehicleBodyCondition)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F8] border border-[#E0B4B2]/60 rounded-xl text-xs font-semibold text-[#1A1836] outline-none cursor-pointer"
                >
                  {(Object.keys(BODY_CONDITION_LABELS) as VehicleBodyCondition[]).map((b) => (
                    <option key={b} value={b}>{BODY_CONDITION_LABELS[b].label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            {estimate && (
              <ArgusResultCard
                estimate={estimate}
                brand={brand}
                model={model}
                year={year}
                onApplyToEphemeral={handleApplyToEphemeral}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
