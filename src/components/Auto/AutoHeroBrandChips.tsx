import React from "react";
import { BrandImageLogo } from "../../domains/auto/data/brandLogosMap";
import { BUDGET_PRESETS, BudgetPreset } from "../../domains/auto/auto.utils";

export interface AutoHeroBrandChipsProps {
  brands: readonly string[];
  onSelectBrand: (brand: string) => void;
  onSelectBudget: (preset: BudgetPreset) => void;
}

export const AutoHeroBrandChips: React.FC<AutoHeroBrandChipsProps> = ({
  brands,
  onSelectBrand,
  onSelectBudget,
}) => {
  return (
    <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-[11px]">
      <span className="text-slate-400 font-semibold shrink-0">Marques :</span>
      {brands.map((brandName) => (
        <button
          key={brandName}
          type="button"
          onClick={() => onSelectBrand(brandName)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#172B4D]/80 hover:bg-[#172B4D] hover:border-[#D9F66F]/50 text-slate-200 hover:text-white border border-[#23416A] shrink-0 transition-all duration-200 cursor-pointer shadow-2xs group"
        >
          <div className="w-4 h-4 bg-white/90 rounded-sm p-0.5 flex items-center justify-center shrink-0">
            <BrandImageLogo brandName={brandName} className="w-3.5 h-3.5 object-contain" />
          </div>
          <span className="font-semibold">{brandName}</span>
        </button>
      ))}
      {BUDGET_PRESETS.slice(0, 2).map((b) => (
        <button
          key={b.id}
          type="button"
          onClick={() => onSelectBudget(b)}
          className="px-3 py-1.5 rounded-xl bg-[#172B4D]/80 hover:bg-[#172B4D] text-[#D9F66F] border border-[#23416A] shrink-0 transition-all cursor-pointer font-bold shadow-2xs"
        >
          {b.label}
        </button>
      ))}
    </div>
  );
};
