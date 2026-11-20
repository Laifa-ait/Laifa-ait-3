import React from "react";
import { ArtisanOfferPricingType } from "../../../types/artisanOffers";

export type OfferSortOption = "relevance" | "rating" | "price_asc" | "price_desc" | "recent";

interface OfferCatalogFilterBarProps {
  availableOnly?: boolean;
  minRating?: number;
  pricingFilter: ArtisanOfferPricingType | "";
  offerSort: OfferSortOption;
  onToggleAvailable: () => void;
  onToggleTopRated: () => void;
  onPricingChange: (val: ArtisanOfferPricingType | "") => void;
  onSortChange: (val: OfferSortOption) => void;
}

export const OfferCatalogFilterBar: React.FC<OfferCatalogFilterBarProps> = ({
  availableOnly,
  minRating,
  pricingFilter,
  offerSort,
  onToggleAvailable,
  onToggleTopRated,
  onPricingChange,
  onSortChange,
}) => (
  <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white px-3.5 py-2.5 rounded-2xl border border-slate-200">
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onToggleAvailable}
        className={`h-8 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
          availableOnly
            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
        }`}
      >
        Disponibles maintenant
      </button>

      <button
        type="button"
        onClick={onToggleTopRated}
        className={`h-8 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
          minRating && minRating >= 4.5
            ? "bg-amber-50 text-amber-800 border-amber-300"
            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
        }`}
      >
        Note 4.5+
      </button>

      <select
        aria-label="Type de tarification"
        value={pricingFilter}
        onChange={(e) => onPricingChange(e.target.value as ArtisanOfferPricingType | "")}
        className="h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
      >
        <option value="">Tous les tarifs</option>
        <option value="forfait">Forfait fixe</option>
        <option value="a_partir_de">À partir de...</option>
        <option value="au_m2">Tarif au m²</option>
        <option value="sur_devis">Sur devis</option>
      </select>
    </div>

    <select
      aria-label="Trier les offres"
      value={offerSort}
      onChange={(e) => onSortChange(e.target.value as OfferSortOption)}
      className="h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer"
    >
      <option value="relevance">Trier : Pertinence</option>
      <option value="rating">Mieux notés</option>
      <option value="price_asc">Tarif croissant</option>
      <option value="price_desc">Tarif décroissant</option>
      <option value="recent">Plus récentes</option>
    </select>
  </div>
);
