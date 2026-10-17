import React from "react";
import { Link } from "react-router-dom";
import { Scale, X, ArrowRight } from "lucide-react";
import { useVehicleComparison } from "../../hooks/useVehicleComparison";

export const AutoCompareBar: React.FC = () => {
  const { comparedVehicles, clearComparison } = useVehicleComparison();

  if (comparedVehicles.length === 0) return null;

  return (
    <div className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0B1730]/95 backdrop-blur-md text-white border border-[#23416A] shadow-2xl rounded-2xl px-3 sm:px-4 py-2 flex items-center gap-3 max-w-md w-[92%] sm:w-auto">
      <div className="flex items-center gap-1.5 shrink-0">
        <Scale className="w-4 h-4 text-[#D9F66F]" />
        <span className="text-xs font-black text-white">
          Comparateur ({comparedVehicles.length}/3)
        </span>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
        {comparedVehicles.map((v) => (
          <div
            key={v.id}
            className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shrink-0 relative"
            title={`${v.brand} ${v.model}`}
          >
            {v.primaryImageUrl ? (
              <img src={v.primaryImageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[9px] font-bold flex items-center justify-center h-full text-slate-300">
                {v.brand.slice(0, 2)}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 ml-auto shrink-0">
        <Link
          to="/auto/comparer"
          className="px-3 py-1 bg-gradient-to-r from-[#D9F66F] to-[#C5E94F] hover:brightness-105 text-[#0B1730] font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
        >
          <span>Comparer</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
        <button
          type="button"
          onClick={clearComparison}
          aria-label="Vider la sélection"
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
