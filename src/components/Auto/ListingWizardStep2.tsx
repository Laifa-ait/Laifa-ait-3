import React from "react";
import {
  VehiclePaperStatus,
  VehicleBodyCondition,
  VehiclePriceType,
} from "../../domains/auto/auto.types";
import {
  PAPER_STATUS_LABELS,
  BODY_CONDITION_LABELS,
  PRICE_TYPE_LABELS,
  formatPriceDZD,
} from "../../domains/auto/auto.utils";
import { WilayaSelectorField } from "./WilayaSelectorField";

export interface Step2Data {
  wilayaId: number;
  wilayaName: string;
  commune: string;
  paperStatus: VehiclePaperStatus;
  bodyCondition: VehicleBodyCondition;
  price: number;
  priceType: VehiclePriceType;
  currentOfferPrice?: number;
}

interface Step2Props {
  data: Step2Data;
  onChange: (updates: Partial<Step2Data>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const ListingWizardStep2: React.FC<Step2Props> = ({
  data,
  onChange,
  onNext,
  onPrev,
}) => {
  const isValid =
    data.wilayaId >= 1 &&
    data.wilayaId <= 69 &&
    data.commune.trim().length >= 2 &&
    data.price > 0;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-lg font-bold text-slate-900">2. Situation Administrative, Wilaya & Prix</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Précisez les papiers légaux, la localisation algérienne et vos prétentions tarifaires.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WilayaSelectorField
          selectedWilayaId={data.wilayaId}
          onWilayaChange={(id, name) => onChange({ wilayaId: id, wilayaName: name })}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Commune <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ex: Hydra, Chéraga, El Biar..."
            value={data.commune}
            onChange={(e) => onChange({ commune: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Statut des papiers / Carte Grise <span className="text-red-500">*</span>
          </label>
          <select
            value={data.paperStatus}
            onChange={(e) => onChange({ paperStatus: e.target.value as VehiclePaperStatus })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            {(Object.keys(PAPER_STATUS_LABELS) as VehiclePaperStatus[]).map((p) => (
              <option key={p} value={p}>
                {PAPER_STATUS_LABELS[p].label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500 mt-1">
            Les véhicules avec Carte Grise Safia bénéficient d'une visibilité prioritaire sur Olmart.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            État de la tôlerie / Carrosserie <span className="text-red-500">*</span>
          </label>
          <select
            value={data.bodyCondition}
            onChange={(e) => onChange({ bodyCondition: e.target.value as VehicleBodyCondition })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            {(Object.keys(BODY_CONDITION_LABELS) as VehicleBodyCondition[]).map((b) => (
              <option key={b} value={b}>
                {BODY_CONDITION_LABELS[b].label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Prix demandé (DZD) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min={10000}
              step={10000}
              placeholder="Ex: 2450000"
              value={data.price || ""}
              onChange={(e) => onChange({ price: parseInt(e.target.value) || 0 })}
              className="w-full pl-3.5 pr-14 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 font-semibold"
            />
            <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-500">DA</span>
          </div>
          {data.price > 0 && (
            <p className="text-xs text-emerald-700 font-medium mt-1">
              Affichage : {formatPriceDZD(data.price)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Type de transaction / Modalité <span className="text-red-500">*</span>
          </label>
          <select
            value={data.priceType}
            onChange={(e) => onChange({ priceType: e.target.value as VehiclePriceType })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            {(Object.keys(PRICE_TYPE_LABELS) as VehiclePriceType[]).map((pt) => (
              <option key={pt} value={pt}>
                {PRICE_TYPE_LABELS[pt]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onPrev}
          className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors"
        >
          &larr; Retour
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
        >
          Continuer vers l'Étape 3 &rarr;
        </button>
      </div>
    </div>
  );
};
