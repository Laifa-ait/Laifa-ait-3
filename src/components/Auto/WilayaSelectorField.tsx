import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";
import { WILAYAS_69, searchWilayas, getWilayaById } from "../../domains/auto/auto.wilayas";

export interface WilayaSelectorFieldProps {
  selectedWilayaId: number;
  onWilayaChange: (id: number, name: string) => void;
  required?: boolean;
  className?: string;
}

const POPULAR_WILAYA_IDS = [16, 31, 9, 19, 25, 15, 6, 35];

export const WilayaSelectorField: React.FC<WilayaSelectorFieldProps> = ({
  selectedWilayaId,
  onWilayaChange,
  required = true,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedWilaya = useMemo(() => {
    return getWilayaById(selectedWilayaId) || getWilayaById(16);
  }, [selectedWilayaId]);

  const filteredWilayas = useMemo(() => {
    if (!searchQuery.trim()) return WILAYAS_69;
    return searchWilayas(searchQuery.trim());
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (id: number, name: string) => {
    onWilayaChange(id, name);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Wilaya de résidence {required && <span className="text-red-500">*</span>}
        </label>
        {selectedWilaya && (
          <span className="text-[11px] font-bold text-[#172B4D] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            {selectedWilaya.code} · {selectedWilaya.name_ar}
          </span>
        )}
      </div>

      {/* Bouton de sélection interactif */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 hover:border-[#172B4D] rounded-xl text-left flex items-center justify-between shadow-2xs focus:ring-2 focus:ring-[#172B4D]/20 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-7 h-7 rounded-lg bg-[#0B1730] text-[#D9F66F] font-black text-xs flex items-center justify-center shrink-0">
            {selectedWilaya ? selectedWilaya.code : "16"}
          </div>
          <div className="truncate">
            <span className="text-sm font-bold text-slate-900">
              {selectedWilaya ? selectedWilaya.name : "Sélectionner une wilaya"}
            </span>
            {selectedWilaya && (
              <span className="text-xs text-slate-500 ml-1.5 font-normal">
                ({selectedWilaya.name_ar})
              </span>
            )}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Menu Déroulant avec Recherche des 69 Wilayas */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-40 max-h-80 flex flex-col animate-in fade-in zoom-in-95 duration-150">
          {/* Barre de recherche interne tolérante (code, nom FR ou AR) */}
          <div className="relative mb-2 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par code (ex: 16, 31) ou nom (Alger, وهران)..."
              className="w-full pl-9 pr-7 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#172B4D] focus:bg-white text-slate-900 placeholder-slate-400 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Raccourcis Wilayas Populaires */}
          {!searchQuery && (
            <div className="mb-2 shrink-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-1">
                Régions Fréquentes
              </div>
              <div className="flex flex-wrap gap-1">
                {POPULAR_WILAYA_IDS.map((pId) => {
                  const w = getWilayaById(pId);
                  if (!w) return null;
                  const isCur = w.id === selectedWilayaId;
                  return (
                    <button
                      key={`pop-${w.id}`}
                      type="button"
                      onClick={() => handleSelect(w.id, w.name)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isCur
                          ? "bg-[#0B1730] text-[#D9F66F]"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      <span className="text-[10px] opacity-70">{w.code}</span>
                      <span>{w.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Liste complète des 69 Wilayas */}
          <div className="overflow-y-auto space-y-1 pr-1 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-1">
              Toutes les 69 Wilayas ({filteredWilayas.length})
            </div>
            {filteredWilayas.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-500">
                Aucune wilaya trouvée pour "{searchQuery}"
              </div>
            ) : (
              filteredWilayas.map((w) => {
                const isSelected = w.id === selectedWilayaId;
                return (
                  <button
                    key={`wilaya-opt-${w.id}`}
                    type="button"
                    onClick={() => handleSelect(w.id, w.name)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#0B1730] text-white"
                        : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className={`text-xs font-black px-1.5 py-0.5 rounded-md ${
                          isSelected
                            ? "bg-[#D9F66F] text-[#0B1730]"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {w.code}
                      </span>
                      <span className="text-xs font-bold truncate">{w.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs ${
                          isSelected ? "text-slate-200" : "text-slate-400"
                        }`}
                      >
                        {w.name_ar}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#D9F66F]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
