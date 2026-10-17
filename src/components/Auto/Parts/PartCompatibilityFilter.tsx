import React, { useState } from "react";
import { CheckCircle2, RotateCcw, Wrench, ShieldCheck } from "lucide-react";
import { POPULAR_BRANDS } from "../ListingWizardStep1";

interface PartCompatibilityFilterProps {
  selectedBrand?: string;
  selectedModel?: string;
  selectedYear?: number;
  onChange: (brand?: string, model?: string, year?: number) => void;
}

export const PartCompatibilityFilter: React.FC<PartCompatibilityFilterProps> = ({
  selectedBrand,
  selectedModel,
  selectedYear,
  onChange,
}) => {
  const [brand, setBrand] = useState(selectedBrand || "");
  const [model, setModel] = useState(selectedModel || "");
  const [year, setYear] = useState<number | undefined>(selectedYear);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(brand || undefined, model || undefined, year || undefined);
  };

  const handleReset = () => {
    setBrand("");
    setModel("");
    setYear(undefined);
    onChange(undefined, undefined, undefined);
  };

  const isFiltering = Boolean(selectedBrand || selectedModel || selectedYear);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">
              Vérificateur de Compatibilité Mécanique
            </h4>
            <p className="text-[11px] text-slate-400">
              Trouvez uniquement les pièces qui s'adaptent à votre véhicule
            </p>
          </div>
        </div>

        {isFiltering && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Effacer</span>
          </button>
        )}
      </div>

      <form onSubmit={handleApply} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Marque
          </label>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-orange-500 transition-colors"
          >
            <option value="">Toutes les marques</option>
            {POPULAR_BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Modèle
          </label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Ex: Golf 7, Clio 4, 208..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Année
          </label>
          <input
            type="number"
            min="1980"
            max="2026"
            value={year || ""}
            onChange={(e) => setYear(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Ex: 2017"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full py-2 px-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-600/20 cursor-pointer border-none flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Vérifier Compatibilité</span>
          </button>
        </div>
      </form>

      {isFiltering && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            Filtre actif : {selectedBrand || "Toute marque"} {selectedModel ? `• ${selectedModel}` : ""} {selectedYear ? `(${selectedYear})` : ""}
          </span>
        </div>
      )}
    </div>
  );
};
