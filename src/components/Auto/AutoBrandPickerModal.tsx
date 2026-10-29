import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X, Search, CheckCircle2 } from "lucide-react";
import { LOGOTEKA_BRAND_LOGOS, BrandImageLogo } from "../../domains/auto/data/brandLogosMap";

export interface AutoBrandPickerModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  selectedBrand?: string;
  onSelectBrand?: (brand?: string) => void;
}

export const AutoBrandPickerModal: React.FC<AutoBrandPickerModalProps> = ({
  isOpen: controlledOpen,
  onClose,
  selectedBrand,
  onSelectBrand,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const activeBrand = selectedBrand !== undefined ? selectedBrand : searchParams.get("brand") || undefined;

  useEffect(() => {
    const handleOpenEvent = () => setInternalOpen(true);
    window.addEventListener("olmart:open-auto-brand-picker", handleOpenEvent);
    return () => window.removeEventListener("olmart:open-auto-brand-picker", handleOpenEvent);
  }, []);

  const handleClose = () => {
    setInternalOpen(false);
    if (onClose) onClose();
  };

  const filteredBrands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LOGOTEKA_BRAND_LOGOS;
    return LOGOTEKA_BRAND_LOGOS.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.models.toLowerCase().includes(q)
    );
  }, [query]);

  if (!isOpen) return null;

  const handleChoose = (brandName?: string) => {
    if (onSelectBrand) {
      onSelectBrand(brandName);
    } else {
      const next = new URLSearchParams(searchParams);
      if (brandName) next.set("brand", brandName);
      else next.delete("brand");
      navigate(`/auto${next.size ? `?${next.toString()}` : ""}`);
    }
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl z-10 max-h-[85vh] flex flex-col overflow-hidden">
        {/* Bottom Sheet Grab Handle (Mobile App Pattern) */}
        <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              Choisir une marque
            </h3>
            <p className="text-xs text-slate-500">
              39 constructeurs automobiles disponibles en Algérie
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer border-none"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-3.5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/60">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une marque ou un modèle (Golf, Clio, Tucson...)"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 transition-all"
            />
          </div>
          {activeBrand && (
            <button
              type="button"
              onClick={() => handleChoose(undefined)}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-extrabold whitespace-nowrap cursor-pointer border-none"
            >
              Tout voir
            </button>
          )}
        </div>

        {/* Brands Squircle Grid */}
        <div className="p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {filteredBrands.map((brand) => {
            const isSelected = activeBrand?.toLowerCase() === brand.name.toLowerCase();
            return (
              <button
                key={brand.id}
                type="button"
                onClick={() => handleChoose(brand.name)}
                className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.98] flex items-center gap-3 cursor-pointer ${
                  isSelected
                    ? "bg-blue-50/90 border-blue-600 text-slate-900 shadow-2xs"
                    : "bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800 hover:border-blue-300"
                }`}
              >
                <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-center shrink-0">
                  <BrandImageLogo brandName={brand.name} className="w-6 h-6 object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-extrabold text-slate-900 truncate">
                      {brand.name}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{brand.models}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
