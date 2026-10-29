import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Calculator,
  PlusCircle,
  Eye,
  SlidersHorizontal,
  CheckCircle2,
} from "lucide-react";
import { useEphemeralAutoStudio, EPHEMERAL_PRESETS } from "../../hooks/useEphemeralAutoStudio";
import { formatPriceDZD, formatPriceMillions } from "../../domains/auto/auto.utils";
import { EphemeralCustomizerDrawer } from "./EphemeralCustomizerDrawer";

export interface AutoJourneyStepperBarProps {
  activeStep?: 1 | 2 | 3 | 4;
}

export const AutoJourneyStepperBar: React.FC<AutoJourneyStepperBarProps> = ({ activeStep }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    enabled,
    setEnabled,
    selectedPresetId,
    selectPreset,
    customConfig,
    updateCustomConfig,
    resetCustomConfig,
  } = useEphemeralAutoStudio();
  const [customizerOpen, setCustomizerOpen] = useState(false);

  const steps = [
    {
      num: "01",
      stepIndex: 1,
      title: "Exploration & Filtres",
      subtitle: "Showroom & 69 Wilayas",
      path: "/auto/catalog",
      active:
        activeStep === 1 ||
        (!activeStep && (location.pathname === "/auto" || location.pathname.startsWith("/auto/catalog"))),
      icon: Search,
    },
    {
      num: "02",
      stepIndex: 2,
      title: "Cote Argus & Marché",
      subtitle: "Estimation Algérie",
      path: "/auto/estimation",
      active:
        activeStep === 2 ||
        (!activeStep && (location.pathname.startsWith("/auto/estimation") || location.pathname.startsWith("/auto/argus"))),
      icon: Calculator,
    },
    {
      num: "03",
      stepIndex: 3,
      title: "Configuration 3-Étapes",
      subtitle: "Studio de publication",
      path: "/auto/deposer",
      active: activeStep === 3 || (!activeStep && location.pathname.startsWith("/auto/deposer")),
      icon: PlusCircle,
    },
    {
      num: "04",
      stepIndex: 4,
      title: "Résultat & Fiche Live",
      subtitle: "Inspection & Garage",
      path: "/auto/vehicules/ephemeral-custom",
      active:
        activeStep === 4 ||
        (!activeStep &&
          (location.pathname.startsWith("/auto/vehicules/") ||
            location.pathname.startsWith("/dashboard/seller/auto") ||
            location.pathname.startsWith("/auto/mon-garage"))),
      icon: Eye,
    },
  ];

  return (
    <div className="mb-6 rounded-3xl bg-white border border-[#E0B4B2]/50 shadow-2xs overflow-hidden">
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1A1836] via-[#42164B] to-[#622347] text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-[11px] font-semibold text-[#E99856] tracking-wide">
              Parcours Interactif Olma Auto · Simulation & Aperçu en Temps Réel
            </p>
            <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
              Visualisez chaque étape du parcours automobile avec le Modèle Éphémère
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                enabled
                  ? "bg-[#E99856] text-[#1A1836] border-[#E99856]"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }`}
            >
              {enabled ? "Modèle Éphémère : Actif" : "Activer le Modèle Éphémère"}
            </button>

            <button
              type="button"
              onClick={() => setCustomizerOpen((v) => !v)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#E99856]" />
              <span>Configurer le modèle</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEnabled(true);
                navigate("/auto/vehicules/ephemeral-custom");
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-white text-[#1A1836] hover:bg-[#FAF7F8] transition-all flex items-center gap-1.5 cursor-pointer border-none"
            >
              <Eye className="w-3.5 h-3.5 text-[#A54055]" />
              <span>Voir le résultat final</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => navigate(step.path)}
                className={`p-3 rounded-2xl text-left transition-all flex items-center justify-between gap-2 cursor-pointer border ${
                  step.active
                    ? "bg-white text-[#1A1836] border-[#E99856] shadow-sm"
                    : "bg-white/10 hover:bg-white/15 text-white border-white/15"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-extrabold shrink-0 ${
                      step.active ? "bg-[#1A1836] text-[#E99856]" : "bg-white/15 text-[#E99856]"
                    }`}
                  >
                    {step.num}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold truncate">{step.title}</p>
                    <p className={`text-[11px] truncate ${step.active ? "text-zinc-500" : "text-[#E0B4B2]"}`}>
                      {step.subtitle}
                    </p>
                  </div>
                </div>
                <Icon className={`w-4 h-4 shrink-0 ${step.active ? "text-[#A54055]" : "text-[#E0B4B2]"}`} />
              </button>
            );
          })}
        </div>
      </div>

      {enabled && (
        <div className="px-4 py-3 bg-[#FAF7F8] border-t border-[#E0B4B2]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#1A1836]">
            <CheckCircle2 className="w-4 h-4 text-[#A54055] shrink-0" />
            <span className="font-extrabold">
              {customConfig.brand} {customConfig.model} ({customConfig.year})
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono font-bold text-[#622347] tabular-nums">
              {formatPriceMillions(customConfig.price)} ({formatPriceDZD(customConfig.price)})
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-zinc-600 tabular-nums">
              {customConfig.mileage.toLocaleString("fr-FR")} km · {customConfig.wilayaName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {EPHEMERAL_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => selectPreset(preset.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer border ${
                  selectedPresetId === preset.id
                    ? "bg-[#1A1836] text-[#E99856] border-[#1A1836]"
                    : "bg-white text-zinc-700 border-[#E0B4B2]/60 hover:bg-zinc-100"
                }`}
              >
                {preset.brand} {preset.model}
              </button>
            ))}
          </div>
        </div>
      )}

      {customizerOpen && (
        <EphemeralCustomizerDrawer
          customConfig={customConfig}
          updateCustomConfig={updateCustomConfig}
          resetCustomConfig={resetCustomConfig}
        />
      )}
    </div>
  );
};
