import React from "react";
import { Link } from "react-router-dom";
import { CarFront, ArrowLeft, Trash2, ArrowRight, ShieldCheck } from "lucide-react";
import { useVehicleComparison } from "../../hooks/useVehicleComparison";
import { useEphemeralAutoStudio } from "../../hooks/useEphemeralAutoStudio";
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
  const { ephemeralVehicles } = useEphemeralAutoStudio();

  const vehiclesToCompare =
    comparedVehicles.length > 0 ? comparedVehicles : ephemeralVehicles.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {vehiclesToCompare.length === 0 ? (
          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-2xs space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <CarFront className="w-7 h-7" />
            </div>
            <h1 className="text-lg font-extrabold text-slate-900">Aucun véhicule à comparer</h1>
            <Link
              to="/auto"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-extrabold"
            >
              <span>Explorer les véhicules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Comparateur de Véhicules ({vehiclesToCompare.length}/3)
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comparez les caractéristiques et prix des annonces côte à côte
                </p>
              </div>

              <div className="flex items-center gap-2">
                {comparedVehicles.length > 0 && (
                  <button
                    type="button"
                    onClick={clearComparison}
                    className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-rose-600 bg-white border border-slate-200 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Vider</span>
                  </button>
                )}
                <Link
                  to="/auto"
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour aux véhicules</span>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="p-4 text-xs font-bold text-slate-500 w-1/4">Critère</th>
                    {vehiclesToCompare.map((v) => (
                      <th key={v.id} className="p-4 w-1/4 align-top">
                        <div className="relative">
                          <div className="aspect-[16/10] bg-slate-900 rounded-2xl overflow-hidden mb-2.5 relative">
                            {v.primaryImageUrl && (
                              <img
                                src={v.primaryImageUrl}
                                alt={`${v.brand} ${v.model}`}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            )}
                            {comparedVehicles.length > 0 && (
                              <button
                                type="button"
                                onClick={() => toggleCompare(v)}
                                className="absolute top-2 right-2 p-1.5 bg-slate-900/70 hover:bg-rose-600 text-white rounded-lg cursor-pointer border-none"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <BrandImageLogo brandName={v.brand} className="w-4 h-4 object-contain" />
                            <span className="text-xs font-extrabold text-blue-600">{v.brand}</span>
                          </div>
                          <div className="text-sm font-extrabold text-slate-900 truncate mb-1">{v.model}</div>
                          <div className="text-sm font-extrabold text-slate-900 tabular-nums">
                            {formatPriceMillions(v.price)}
                          </div>
                          <Link
                            to={`/auto/vehicules/${v.id}`}
                            className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800"
                          >
                            <span>Voir l'annonce</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs tabular-nums">
                  <tr>
                    <td className="p-4 font-bold text-slate-500">Prix DZD</td>
                    {vehiclesToCompare.map((v) => (
                      <td key={v.id} className="p-4 font-extrabold text-slate-900">{formatPriceDZD(v.price)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-500">Année</td>
                    {vehiclesToCompare.map((v) => (
                      <td key={v.id} className="p-4 font-extrabold text-slate-900">{v.year}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-500">Kilométrage</td>
                    {vehiclesToCompare.map((v) => (
                      <td key={v.id} className="p-4 text-slate-700">{formatMileage(v.mileage)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-500">Motorisation</td>
                    {vehiclesToCompare.map((v) => (
                      <td key={v.id} className="p-4 text-slate-700">
                        {FUEL_LABELS[v.fuel] || v.fuel} · {TRANSMISSION_LABELS[v.transmission] || v.transmission}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-500">Papiers & Tôle</td>
                    {vehiclesToCompare.map((v) => (
                      <td key={v.id} className="p-4">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{PAPER_STATUS_LABELS[v.paperStatus]?.label || v.paperStatus}</span>
                        </span>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {BODY_CONDITION_LABELS[v.bodyCondition]?.label || v.bodyCondition}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-500">Wilaya</td>
                    {vehiclesToCompare.map((v) => (
                      <td key={v.id} className="p-4 font-bold text-slate-900">{v.wilayaName}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
