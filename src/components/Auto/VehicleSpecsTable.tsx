import React from "react";
import { FileText, Shield, Check } from "lucide-react";
import { VehiclePublicDetailDto } from "../../domains/auto/auto.types";
import {
  formatMileage,
  FUEL_LABELS,
  TRANSMISSION_LABELS,
  PAPER_STATUS_LABELS,
  BODY_CONDITION_LABELS,
} from "../../domains/auto/auto.utils";

export interface VehicleSpecsTableProps {
  vehicle: VehiclePublicDetailDto;
}

export const VehicleSpecsTable: React.FC<VehicleSpecsTableProps> = ({ vehicle }) => {
  const paper = PAPER_STATUS_LABELS[vehicle.paperStatus];
  const body = BODY_CONDITION_LABELS[vehicle.bodyCondition];

  return (
    <div className="space-y-5">
      {/* Algerian Administrative & Body Highlights (App Inspection Tiles) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80">
          <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-900 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Statut Administratif</span>
          </div>
          <div className="text-base font-extrabold text-slate-900">{paper?.label || vehicle.paperStatus}</div>
          <div className="text-xs text-slate-600 mt-0.5">{paper?.description}</div>
        </div>

        <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/80">
          <div className="flex items-center gap-2 text-xs font-extrabold text-blue-900 uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>État de la Tôle (Sbigha)</span>
          </div>
          <div className="text-base font-extrabold text-slate-900">{body?.label || vehicle.bodyCondition}</div>
          <div className="text-xs text-slate-600 mt-0.5">Déclaration vérifiée de l'annonceur</div>
        </div>
      </div>

      {/* Identity Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">
          Caractéristiques Techniques
        </h3>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs sm:text-sm tabular-nums">
          <div>
            <dt className="text-slate-400 font-medium">Année</dt>
            <dd className="font-extrabold text-slate-900 mt-0.5">{vehicle.year}</dd>
          </div>
          <div>
            <dt className="text-slate-400 font-medium">Kilométrage</dt>
            <dd className="font-extrabold text-slate-900 mt-0.5">{formatMileage(vehicle.mileage)}</dd>
          </div>
          <div>
            <dt className="text-slate-400 font-medium">Carburant</dt>
            <dd className="font-extrabold text-slate-900 mt-0.5">{FUEL_LABELS[vehicle.fuel] || vehicle.fuel}</dd>
          </div>
          <div>
            <dt className="text-slate-400 font-medium">Transmission</dt>
            <dd className="font-extrabold text-slate-900 mt-0.5">{TRANSMISSION_LABELS[vehicle.transmission] || vehicle.transmission}</dd>
          </div>
          <div>
            <dt className="text-slate-400 font-medium">Wilaya</dt>
            <dd className="font-extrabold text-slate-900 mt-0.5">{vehicle.wilayaName}</dd>
          </div>
          <div>
            <dt className="text-slate-400 font-medium">Commune</dt>
            <dd className="font-extrabold text-slate-900 mt-0.5">{vehicle.commune || "Non précisée"}</dd>
          </div>
        </dl>
      </div>

      {/* Options & Equipment */}
      {vehicle.options && vehicle.options.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
            Équipements & Options
          </h3>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-semibold text-slate-700">
            {vehicle.options.map((opt, i) => (
              <li key={i} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{opt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Seller Description */}
      {vehicle.description && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">
            Notes de l'annonceur
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {vehicle.description}
          </p>
        </div>
      )}
    </div>
  );
};
