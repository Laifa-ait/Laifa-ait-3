import React, { useState } from "react";
import { Upload, X, Plus, CheckCircle2 } from "lucide-react";
import { ArtisanOfferPricingType } from "../../../types/artisanOffers";

interface ArtisanOfferMediaAndPricingProps {
  images: string[];
  uploading: boolean;
  onUploadFiles: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  pricingType: ArtisanOfferPricingType;
  onPricingTypeChange: (value: ArtisanOfferPricingType) => void;
  priceDzd: string;
  onPriceDzdChange: (value: string) => void;
  includedItems: string[];
  onAddIncludedItem: (item: string) => void;
  onRemoveIncludedItem: (index: number) => void;
}

export const ArtisanOfferMediaAndPricing: React.FC<ArtisanOfferMediaAndPricingProps> = ({
  images,
  uploading,
  onUploadFiles,
  onRemoveImage,
  pricingType,
  onPricingTypeChange,
  priceDzd,
  onPriceDzdChange,
  includedItems,
  onAddIncludedItem,
  onRemoveIncludedItem,
}) => {
  const [newIncluded, setNewIncluded] = useState("");

  const handleAdd = () => {
    if (!newIncluded.trim()) return;
    onAddIncludedItem(newIncluded.trim());
    setNewIncluded("");
  };

  return (
    <>
      <div className="space-y-2.5 border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#0F172A]">
            Photos de vos réalisations ({images.length}/6)
          </label>
          <label className="h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? "Import en cours..." : "Ajouter des photos"}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading || images.length >= 6}
              onChange={onUploadFiles}
              className="hidden"
            />
          </label>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {images.map((url, idx) => (
              <div
                key={`${url}-${idx}`}
                className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
              >
                <img
                  src={url}
                  alt={`Photo ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {idx === 0 && (
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-[#0F172A]/80 text-white text-[9px] font-semibold">
                    Couverture
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onRemoveImage(idx)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/65 text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-5">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Mode de tarification *</label>
          <select
            value={pricingType}
            onChange={(e) => onPricingTypeChange(e.target.value as ArtisanOfferPricingType)}
            className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
          >
            <option value="a_partir_de">À partir de (DA)</option>
            <option value="forfait">Forfait fixe (DA)</option>
            <option value="au_m2">Tarif au m² (DA / m²)</option>
            <option value="sur_devis">Sur devis uniquement</option>
          </select>
        </div>

        {pricingType !== "sur_devis" && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Montant indicatif (DA) *</label>
            <input
              type="number"
              min={100}
              value={priceDzd}
              onChange={(e) => onPriceDzdChange(e.target.value)}
              placeholder="Ex: 4500"
              className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 tabular-nums"
            />
          </div>
        )}

        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-semibold text-slate-700">Prestations incluses</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newIncluded}
              onChange={(e) => setNewIncluded(e.target.value)}
              placeholder="Ex: Nettoyage fin de chantier inclus"
              className="flex-1 h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            />
            <button
              type="button"
              onClick={handleAdd}
              className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {includedItems.map((item, idx) => (
              <span
                key={`${item}-${idx}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => onRemoveIncludedItem(idx)}
                  className="text-slate-400 hover:text-red-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
