import React from "react";
import { Link } from "react-router-dom";
import { Car, ArrowLeft, Trash2, ArrowRight, ShieldCheck } from "lucide-react";
import { useVehicleComparison } from "../../hooks/useVehicleComparison";
import {
  formatPriceDZD,
  formatPriceMillions,
  formatMileage,
  FUEL_LABELS,
  TRANSMISSION_LABELS,
  PAPER_STATUS_LABELS,
  BODY_CONDITION_LABELS,
} from "../../domains/auto/auto.utils";
import { BrandImageLogo } from "../../domains/auto/data/brandLogosMap";

export const AutoComparePage: React.FC = () => {
  const { comparedVehicles, toggleCompare, clearComparison } = useVehicleComparison();

  if (comparedVehicles.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50/70 py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 text-center border border-slate-200/90 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#0B1730] text-[#D9F66F] flex items-center justify-center mx-auto mb-4">
            <Car className="w-7 h-7" />
          </div>
          <h1 className="text-lg font-black text-slate-900 mb-1">
            Aucun véhicule à comparer
          </h1>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Parcourez notre catalogue et cliquez sur l'icône « Comparer » sur les annonces pour comparer jusqu'à 3 véhicules simultanément.
          </p>
          <Link
            to="/auto/catalog"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D9F66F] to-[#C5E94F] text-[#0B1730] rounded-xl text-xs font-black shadow-xs hover:brightness-105 transition-all"
          >
            <span>Explorer le catalogue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link to="/auto" className="hover:text-[#172B4D] transition-colors">Showroom</Link>
              <span aria-hidden="true">/</span>
              <span className="text-slate-900 font-medium">Comparateur</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B1730] tracking-tight">
              Comparatif Véhicules ({comparedVehicles.length}/3)
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearComparison}
              className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-rose-600 bg-white border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vider</span>
            </button>
            <Link
              to="/auto/catalog"
              className="px-4 py-2 bg-[#172B4D] text-white hover:bg-[#0B1730] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ajouter un autre véhicule</span>
            </Link>
          </div>
        </div>

        {/* Tableau de Comparaison Responsive */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="p-4 text-xs font-bold text-slate-400 w-1/4">Critère</th>
                {comparedVehicles.map((v) => (
                  <th key={v.id} className="p-4 w-1/4 align-top">
                    <div className="relative group">
                      <div className="aspect-[16/10] bg-slate-900 rounded-xl overflow-hidden mb-2 relative">
                        {v.primaryImageUrl ? (
                          <img
                            src={v.primaryImageUrl}
                            alt={`${v.brand} ${v.model}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                            {v.brand} {v.model}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleCompare(v)}
                          className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-lg transition-colors cursor-pointer"
                          title="Retirer du comparateur"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 mb-1">
                        <BrandImageLogo brandName={v.brand} className="w-4 h-4 object-contain" />
                        <span className="text-xs font-black text-slate-900">{v.brand}</span>
                      </div>
                      <div className="text-sm font-black text-slate-950 truncate mb-1">{v.model}</div>
                      <div className="text-sm font-black text-[#172B4D]">
                        {formatPriceMillions(v.price)}
                      </div>
                      <Link
                        to={`/auto/vehicules/${v.id}`}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800"
                      >
                        <span>Fiche détaillée</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              <tr>
                <td className="p-4 font-bold text-slate-500">Prix DZD</td>
                {comparedVehicles.map((v) => (
                  <td key={v.id} className="p-4 font-bold text-slate-900">{formatPriceDZD(v.price)}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-500">Année</td>
                {comparedVehicles.map((v) => (
                  <td key={v.id} className="p-4 font-black text-slate-900">{v.year}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-500">Kilométrage</td>
                {comparedVehicles.map((v) => (
                  <td key={v.id} className="p-4 text-slate-700">{formatMileage(v.mileage)}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-500">Carburant</td>
                {comparedVehicles.map((v) => (
                  <td key={v.id} className="p-4 text-slate-700">{FUEL_LABELS[v.fuel] || v.fuel}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-500">Boîte de vitesse</td>
                {comparedVehicles.map((v) => (
                  <td key={v.id} className="p-4 text-slate-700">{TRANSMISSION_LABELS[v.transmission] || v.transmission}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-500">Statut Papiers</td>
                {comparedVehicles.map((v) => (
                  <td key={v.id} className="p-4">
                    {v.paperStatus === "safia" ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>100% Safia</span>
                      </span>
                    ) : (
                      <span>{PAPER_STATUS_LABELS[v.paperStatus]?.label || v.paperStatus}</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-500">Carrosserie (Tôle)</td>
                {comparedVehicles.map((v) => (
                  <td key={v.id} className="p-4 text-slate-700">{BODY_CONDITION_LABELS[v.bodyCondition]?.label || v.bodyCondition}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-500">Wilaya</td>
                {comparedVehicles.map((v) => (
                  <td key={v.id} className="p-4 font-semibold text-slate-800">{v.wilayaName}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
