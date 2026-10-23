import React, { useState, useMemo } from "react";
import { Search, Car, MapPin, SlidersHorizontal, Wallet, ChevronDown, ArrowRight } from "lucide-react";
import { WILAYAS_69 } from "../../domains/auto/auto.wilayas";
import { CAR_BRANDS, searchBrandsAndModels } from "../../domains/auto/auto.brands";
import { BrandImageLogo } from "../../domains/auto/data/brandLogosMap";

export interface AutoHeroSearchFormProps {
  quickSearch: string;
  onQuickSearchChange: (val: string) => void;
  selectedBrand: string;
  selectedModel: string;
  selectedWilaya: string;
  selectedBudget: string;
  availableModels: string[];
  onBrandChange: (brand: string) => void;
  onModelChange: (model: string) => void;
  onWilayaChange: (wilaya: string) => void;
  onBudgetChange: (budget: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AutoHeroSearchForm: React.FC<AutoHeroSearchFormProps> = ({
  quickSearch,
  onQuickSearchChange,
  selectedBrand,
  selectedModel,
  selectedWilaya,
  selectedBudget,
  availableModels,
  onBrandChange,
  onModelChange,
  onWilayaChange,
  onBudgetChange,
  onSubmit,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchSuggestions = useMemo(() => {
    if (!quickSearch || quickSearch.trim().length < 2) return [];
    return searchBrandsAndModels(quickSearch.trim(), 4);
  }, [quickSearch]);

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 text-slate-900"
    >
      {/* 1. Barre de recherche textuelle intégrée dans le cadre */}
      <div className="relative mb-3">
        <div className="relative group">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#172B4D] transition-colors" />
          <input
            type="text"
            value={quickSearch}
            onChange={(e) => onQuickSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            placeholder="Rechercher marque ou modèle (ex: Golf, Dashing, Tucson, K01S, Corsa, Tipo)..."
            className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#172B4D]/20 focus:border-[#172B4D] focus:bg-white transition-all font-medium"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 bg-gradient-to-r from-[#D9F66F] to-[#C5E94F] text-[#0B1730] font-black rounded-lg text-[11px] shadow-2xs hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1"
          >
            <span>Explorer</span>
          </button>
        </div>

        {/* Suggestions instantanées sous la barre intégrée */}
        {isSearchFocused && searchSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-30">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1">
              Modèles & Marques Détectés
            </div>
            {searchSuggestions.map((s) => (
              <button
                key={`${s.brand}-${s.model}`}
                type="button"
                onMouseDown={() => {
                  onBrandChange(s.brand);
                  onModelChange(s.model);
                  onQuickSearchChange(`${s.brand} ${s.model}`);
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-slate-100 rounded-sm p-0.5 flex items-center justify-center">
                    <BrandImageLogo brandName={s.brand} className="w-4 h-4 object-contain" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {s.brand} <span className="text-slate-600 font-normal">{s.model}</span>
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Grille des sélecteurs contextuels */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {/* Marque */}
        <div className="relative">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-xl focus-within:border-[#172B4D] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#172B4D]/20 transition-all">
            <Car className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={selectedBrand}
              onChange={(e) => onBrandChange(e.target.value)}
              aria-label="Marque du véhicule"
              className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer py-0.5 truncate appearance-none"
            >
              <option value="">Marque</option>
              {CAR_BRANDS.map((b) => (
                <option key={`brand-${b.brandName}`} value={b.brandName}>
                  {b.brandName}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 pointer-events-none" />
          </div>
        </div>

        {/* Modèle */}
        <div className="relative">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-xl focus-within:border-[#172B4D] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#172B4D]/20 transition-all">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              disabled={!selectedBrand}
              aria-label="Modèle du véhicule"
              className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer py-0.5 truncate disabled:opacity-50 appearance-none"
            >
              <option value="">Modèle</option>
              {availableModels.map((m) => (
                <option key={`model-${m}`} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 pointer-events-none" />
          </div>
        </div>

        {/* Wilaya (69 Wilayas) */}
        <div className="relative">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-xl focus-within:border-[#172B4D] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#172B4D]/20 transition-all">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={selectedWilaya}
              onChange={(e) => onWilayaChange(e.target.value)}
              aria-label="Wilaya"
              className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer py-0.5 truncate appearance-none"
            >
              <option value="">Toutes les 69 Wilayas</option>
              {WILAYAS_69.map((w) => (
                <option key={`wilaya-${w.code}`} value={w.code}>
                  {w.code} - {w.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 pointer-events-none" />
          </div>
        </div>

        {/* Budget max */}
        <div className="relative">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-xl focus-within:border-[#172B4D] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#172B4D]/20 transition-all">
            <Wallet className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={selectedBudget}
              onChange={(e) => onBudgetChange(e.target.value)}
              aria-label="Budget max en DZD"
              className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer py-0.5 truncate appearance-none"
            >
              <option value="">Budget max (DZD)</option>
              <option value="1000000">&lt; 100M (1 000 000 DZD)</option>
              <option value="2000000">&lt; 200M (2 000 000 DZD)</option>
              <option value="3500000">&lt; 350M (3 500 000 DZD)</option>
              <option value="5000000">&lt; 500M (5 000 000 DZD)</option>
              <option value="8000000">&lt; 800M (8 000 000 DZD)</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. Bouton CTA Principal */}
      <button
        type="submit"
        className="w-full bg-[#D9F66F] bg-gradient-to-r from-[#D9F66F] via-[#E2FB7D] to-[#C5E94F] hover:from-[#E2FB7D] hover:to-[#BEE545] text-[#0B1730] font-black rounded-xl sm:rounded-2xl py-3 px-5 min-h-[44px] sm:min-h-[46px] flex items-center justify-center gap-2 shadow-[0_8px_25px_-4px_rgba(217,246,111,0.5)] hover:shadow-[0_12px_30px_-4px_rgba(217,246,111,0.7)] transition-all duration-200 active:scale-[0.98] cursor-pointer mt-3.5 border-t border-white/60"
      >
        <Search className="w-4 h-4 text-[#0B1730] stroke-[2.5]" />
        <span className="text-xs uppercase tracking-wider">
          Rechercher parmi les véhicules vérifiés
        </span>
      </button>
    </form>
  );
};
