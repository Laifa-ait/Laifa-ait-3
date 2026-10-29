import React from "react";
import { Compass, LayoutGrid, ShieldCheck, Gauge, Fuel } from "lucide-react";
import { BrandImageLogo, LOGOTEKA_BRAND_LOGOS } from "../../domains/auto/data/brandLogosMap";

export interface OlmaAutoBrandBarProps {
  selectedBrand?: string;
  selectedTransmission?: string;
  selectedFuel?: string;
  selectedPaperStatus?: string;
  onSelectBrand: (brand?: string) => void;
  onToggleQuickFilter: (type: "automatique" | "diesel" | "essence" | "safia") => void;
  onOpenBrandPicker: () => void;
}

const TOP_BRANDS = LOGOTEKA_BRAND_LOGOS.slice(0, 14);

export const OlmaAutoBrandBar: React.FC<OlmaAutoBrandBarProps> = ({
  selectedBrand,
  selectedTransmission,
  selectedFuel,
  selectedPaperStatus,
  onSelectBrand,
  onToggleQuickFilter,
  onOpenBrandPicker,
}) => {
  const isAllActive =
    !selectedBrand && !selectedTransmission && !selectedFuel && !selectedPaperStatus;

  return (
    <div className="w-full pt-1 pb-1">
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none touch-pan-x overscroll-x-contain scroll-smooth">
        {/* Tout voir */}
        <button
          type="button"
          onClick={() => onSelectBrand(undefined)}
          className={`rounded-2xl h-11 px-3.5 border flex items-center gap-2 font-extrabold text-xs transition-all active:scale-95 cursor-pointer shrink-0 whitespace-nowrap ${
            isAllActive
              ? "bg-slate-900 text-white border-slate-900 shadow-xs"
              : "bg-white text-slate-700 border-slate-200/90 hover:border-blue-400"
          }`}
        >
          <Compass className={`w-4 h-4 ${isAllActive ? "text-sky-400" : "text-slate-500"}`} />
          <span>Tout</span>
        </button>

        {/* Bouton Toutes les Marques (39 constructeurs) */}
        <button
          type="button"
          onClick={onOpenBrandPicker}
          className="rounded-2xl h-11 px-3.5 border border-blue-200 bg-blue-50/90 hover:bg-blue-100 text-blue-700 flex items-center gap-2 font-extrabold text-xs transition-all active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
        >
          <LayoutGrid className="w-4 h-4 text-blue-600" />
          <span>39 Marques</span>
        </button>

        {/* Marques populaires en squircles d'application */}
        {TOP_BRANDS.map((b) => {
          const active = selectedBrand?.toLowerCase() === b.name.toLowerCase();
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onSelectBrand(active ? undefined : b.name)}
              className={`rounded-2xl h-11 pl-2 pr-3.5 border flex items-center gap-2 font-extrabold text-xs transition-all active:scale-95 cursor-pointer shrink-0 whitespace-nowrap ${
                active
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs shadow-blue-600/20"
                  : "bg-white text-slate-800 border-slate-200/90 hover:border-blue-300 hover:bg-slate-50"
              }`}
            >
              <div className="w-7 h-7 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center p-1 shrink-0">
                <BrandImageLogo brandName={b.name} className="w-4 h-4 object-contain" />
              </div>
              <span>{b.name}</span>
            </button>
          );
        })}

        {/* Filtres rapides 1-tap */}
        <button
          type="button"
          onClick={() => onToggleQuickFilter("automatique")}
          className={`rounded-2xl h-11 px-3.5 border flex items-center gap-1.5 font-extrabold text-xs transition-all active:scale-95 cursor-pointer shrink-0 whitespace-nowrap ${
            selectedTransmission === "automatique"
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-700 border-slate-200/90 hover:border-blue-300"
          }`}
        >
          <Gauge className="w-3.5 h-3.5 text-blue-500" />
          <span>Boîte Auto</span>
        </button>

        <button
          type="button"
          onClick={() => onToggleQuickFilter("diesel")}
          className={`rounded-2xl h-11 px-3.5 border flex items-center gap-1.5 font-extrabold text-xs transition-all active:scale-95 cursor-pointer shrink-0 whitespace-nowrap ${
            selectedFuel === "diesel"
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-700 border-slate-200/90 hover:border-blue-300"
          }`}
        >
          <Fuel className="w-3.5 h-3.5 text-sky-500" />
          <span>Diesel</span>
        </button>

        <button
          type="button"
          onClick={() => onToggleQuickFilter("safia")}
          className={`rounded-2xl h-11 px-3.5 border flex items-center gap-1.5 font-extrabold text-xs transition-all active:scale-95 cursor-pointer shrink-0 whitespace-nowrap ${
            selectedPaperStatus === "safia"
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white text-slate-700 border-slate-200/90 hover:border-emerald-300"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Carte Grise Safia</span>
        </button>
      </div>
    </div>
  );
};
