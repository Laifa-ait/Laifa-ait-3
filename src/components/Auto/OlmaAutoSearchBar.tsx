import React from "react";
import { Search, MapPin, SlidersHorizontal, X, CarFront } from "lucide-react";
import { ALGERIA_WILAYAS } from "../../constants/wilayas";

export interface OlmaAutoSearchBarProps {
  whatTerm: string;
  whereWilayaId?: number;
  onWhatChange: (val: string) => void;
  onWilayaChange: (wilayaId?: number) => void;
  onOpenBrandPicker: () => void;
  onOpenFilters: () => void;
  activeFilterCount?: number;
}

export const OlmaAutoSearchBar: React.FC<OlmaAutoSearchBarProps> = ({
  whatTerm,
  whereWilayaId,
  onWhatChange,
  onWilayaChange,
  onOpenBrandPicker,
  onOpenFilters,
  activeFilterCount = 0,
}) => {
  return (
    <div className="w-full bg-white/85 backdrop-blur-md pt-2.5 pb-2.5 border-b border-slate-200/60">
      <div className="max-w-4xl mx-auto px-3.5 sm:px-6">
        <div className="bg-slate-100/90 hover:bg-slate-100 rounded-2xl p-1.5 border border-slate-200/80 flex items-center justify-between gap-1.5 transition-all duration-200 focus-within:bg-white focus-within:border-blue-500 focus-within:shadow-[0_8px_24px_-6px_rgba(37,99,235,0.18)]">
          {/* Left: App Search Input */}
          <div className="flex-1 min-w-0 flex items-center gap-2.5 pl-2.5">
            <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Chercher marque, modèle (Clio 5, Golf 8...)"
              value={whatTerm}
              onChange={(e) => onWhatChange(e.target.value)}
              className="w-full text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
              aria-label="Rechercher par marque ou modèle"
            />
            {whatTerm && (
              <button
                type="button"
                onClick={() => onWhatChange("")}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-full cursor-pointer shrink-0 bg-slate-200/70 border-none"
                title="Effacer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="w-px h-6 bg-slate-200 shrink-0" aria-hidden="true" />

          {/* Middle: Compact Wilaya Selector */}
          <div className="max-w-[130px] sm:max-w-[190px] min-w-0 flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-white/80 border border-slate-200/60">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <select
              value={whereWilayaId || ""}
              onChange={(e) =>
                onWilayaChange(e.target.value ? Number(e.target.value) : undefined)
              }
              aria-label="Filtrer par Wilaya"
              className="w-full text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer truncate"
            >
              <option value="">Algérie (69)</option>
              {ALGERIA_WILAYAS.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.code.padStart(2, "0")} - {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Sheet Trigger (Tablet/Desktop) */}
          <button
            type="button"
            onClick={onOpenBrandPicker}
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 text-xs font-extrabold transition-all active:scale-95 cursor-pointer border border-slate-200/80 shrink-0 shadow-2xs"
            title="Choisir une marque"
          >
            <CarFront className="w-3.5 h-3.5 text-blue-600" />
            <span>Marques</span>
          </button>

          {/* Far Right: Tactile Filter Sheet Trigger */}
          <button
            type="button"
            onClick={onOpenFilters}
            className={`relative h-9 px-3 rounded-xl transition-all active:scale-95 cursor-pointer shrink-0 flex items-center gap-1.5 border ${
              activeFilterCount > 0
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-slate-900 hover:bg-slate-800 text-white border-slate-900"
            }`}
            title="Filtres avancés"
            aria-label="Ouvrir les filtres avancés"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-xs font-extrabold">Filtres</span>
            {activeFilterCount > 0 && (
              <span className="min-w-4 h-4 px-1 rounded-full bg-white text-blue-600 text-[10px] font-black flex items-center justify-center tabular-nums">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
