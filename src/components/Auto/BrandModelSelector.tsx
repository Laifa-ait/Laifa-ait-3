import React, { useState, useMemo } from "react";
import { getModelsForBrand } from "../../domains/auto/auto.brands";
import { BrandImageLogo } from "../../domains/auto/data/brandLogosMap";

export interface BrandModelSelectorProps {
  brand: string;
  model: string;
  brandsList: readonly string[];
  onBrandChange: (brand: string) => void;
  onModelChange: (model: string) => void;
}

export const BrandModelSelector: React.FC<BrandModelSelectorProps> = ({
  brand,
  model,
  brandsList,
  onBrandChange,
  onModelChange,
}) => {
  const availableModels = useMemo(() => {
    return brand && brand !== "Autre" ? getModelsForBrand(brand) : [];
  }, [brand]);

  const [isCustomModel, setIsCustomModel] = useState<boolean>(() => {
    if (!model) return false;
    if (!brand || brand === "Autre") return true;
    const models = getModelsForBrand(brand);
    return models.length > 0 && !models.includes(model);
  });

  return (
    <>
      {/* 1. Sélection Marque avec Logo officiel */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Marque <span className="text-red-500">*</span>
          </label>
          {brand && brand !== "Autre" && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
              <BrandImageLogo brandName={brand} className="w-4 h-4 object-contain" />
              <span className="font-bold text-[11px] text-slate-800">{brand}</span>
            </div>
          )}
        </div>
        <select
          value={brand}
          onChange={(e) => {
            setIsCustomModel(false);
            onBrandChange(e.target.value);
          }}
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#172B4D] bg-white cursor-pointer"
        >
          <option value="">Sélectionnez une marque</option>
          {brandsList.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* 2. Sélection Modèle dynamique par marque */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Modèle <span className="text-red-500">*</span>
          </label>
          {brand && availableModels.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setIsCustomModel(!isCustomModel);
                if (!isCustomModel) {
                  onModelChange("");
                }
              }}
              className="text-[11px] font-semibold text-[#172B4D] hover:underline cursor-pointer"
            >
              {isCustomModel ? "← Choisir dans la liste" : "+ Saisie manuelle"}
            </button>
          )}
        </div>

        {availableModels.length > 0 && !isCustomModel ? (
          <select
            value={model}
            onChange={(e) => {
              if (e.target.value === "__custom__") {
                setIsCustomModel(true);
                onModelChange("");
              } else {
                onModelChange(e.target.value);
              }
            }}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#172B4D] bg-white cursor-pointer"
          >
            <option value="">
              {brand
                ? `Sélectionnez un modèle ${brand} (${availableModels.length} disponibles)`
                : "Sélectionnez d'abord une marque"}
            </option>
            {availableModels.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
            <option value="__custom__">+ Autre modèle non répertorié...</option>
          </select>
        ) : (
          <input
            type="text"
            placeholder={
              brand
                ? `Saisissez le modèle de ${brand}...`
                : "Sélectionnez d'abord une marque"
            }
            value={model}
            disabled={!brand}
            onChange={(e) => onModelChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#172B4D] disabled:bg-slate-50 disabled:text-slate-400"
          />
        )}
        {brand && availableModels.length > 0 && !isCustomModel && (
          <p className="text-[11px] text-slate-500 mt-1">
            {availableModels.length} modèles intégrés pour {brand}.
          </p>
        )}
      </div>
    </>
  );
};
