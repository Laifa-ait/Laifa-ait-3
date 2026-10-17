import React from "react";
import { Check } from "lucide-react";
import { VehiclePaperStatus, VehicleBodyCondition } from "../../domains/auto/auto.types";
import { PAPER_STATUS_LABELS, BODY_CONDITION_LABELS } from "../../domains/auto/auto.utils";

export interface PaperFilterBlockProps {
  selected?: VehiclePaperStatus;
  onSelect: (val?: VehiclePaperStatus) => void;
}

export const PaperFilterBlock: React.FC<PaperFilterBlockProps> = ({ selected, onSelect }) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
      Statut Administratif / Papiers
    </label>
    <div className="space-y-1.5">
      {(Object.keys(PAPER_STATUS_LABELS) as VehiclePaperStatus[]).map((p) => {
        const isChecked = selected === p;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onSelect(isChecked ? undefined : p)}
            className={`w-full text-left p-2.5 rounded-lg border text-xs sm:text-sm flex items-center justify-between transition-colors min-h-[44px] cursor-pointer ${
              isChecked
                ? "bg-[#0B1730] border-[#0B1730] text-white font-medium"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <div>
              <div className={isChecked ? "text-white font-semibold" : "text-slate-900 font-medium"}>
                {PAPER_STATUS_LABELS[p].label}
              </div>
              <div className={`text-[11px] ${isChecked ? "text-slate-300" : "text-slate-500"}`}>
                {PAPER_STATUS_LABELS[p].description}
              </div>
            </div>
            {isChecked && <Check className="w-4 h-4 text-[#D9F66F] shrink-0 ml-2" />}
          </button>
        );
      })}
    </div>
  </div>
);

export interface BodyFilterBlockProps {
  selected?: VehicleBodyCondition;
  onSelect: (val?: VehicleBodyCondition) => void;
}

export const BodyFilterBlock: React.FC<BodyFilterBlockProps> = ({ selected, onSelect }) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
      État de la Tôle (Sbigha)
    </label>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {(Object.keys(BODY_CONDITION_LABELS) as VehicleBodyCondition[]).map((b) => {
        const isChecked = selected === b;
        return (
          <button
            key={b}
            type="button"
            onClick={() => onSelect(isChecked ? undefined : b)}
            className={`p-2.5 rounded-lg border text-xs text-left transition-colors flex items-center justify-between min-h-[44px] cursor-pointer ${
              isChecked
                ? "bg-[#0B1730] border-[#0B1730] text-white font-medium"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span>{BODY_CONDITION_LABELS[b].label}</span>
            {isChecked && <Check className="w-3.5 h-3.5 text-[#D9F66F] shrink-0" />}
          </button>
        );
      })}
    </div>
  </div>
);
