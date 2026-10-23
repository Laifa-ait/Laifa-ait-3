import React from "react";
import { FilterState } from "../SearchFilters";
import { PropertySortOption } from "../../../types/realEstate";
import { TransactionTypeFilter } from "./TransactionTypeFilter";
import { LocationFilterSelects } from "./LocationFilterSelects";
import { PriceRangeFilter } from "./PriceRangeFilter";
import { LegalPapersFilter } from "./LegalPapersFilter";
import { PropertySpecsFilter } from "./PropertySpecsFilter";

interface OlmaImmoFilterStepProps {
  step: number;
  filters: FilterState;
  isAr: boolean;
  updateFilters: (update: (current: FilterState) => FilterState) => void;
}

export const OlmaImmoFilterStep: React.FC<OlmaImmoFilterStepProps> = ({ step, filters, isAr, updateFilters }) => {
  if (step === 0) {
    return (
      <TransactionTypeFilter
        value={filters.listingType}
        onChange={(listingType) => updateFilters((current) => ({ ...current, listingType }))}
      />
    );
  }

  if (step === 1) {
    return (
      <LocationFilterSelects
        wilaya={filters.wilaya}
        daira={filters.daira}
        commune={filters.commune}
        onWilayaChange={(wilaya) =>
          updateFilters((current) => ({ ...current, wilaya, daira: undefined, commune: undefined }))
        }
        onDairaChange={(daira) => updateFilters((current) => ({ ...current, daira, commune: undefined }))}
        onCommuneChange={(commune) => updateFilters((current) => ({ ...current, commune }))}
        idPrefix="modal-loc"
        showHelpButton={false}
      />
    );
  }

  if (step === 2) {
    return (
      <PriceRangeFilter
        minPrice={filters.minPrice}
        maxPrice={filters.maxPrice}
        listingType={filters.listingType}
        onChange={(minPrice, maxPrice) => updateFilters((current) => ({ ...current, minPrice, maxPrice }))}
        idPrefix="modal-price"
      />
    );
  }

  if (step === 3) {
    return (
      <PropertySpecsFilter
        propertyType={filters.propertyType}
        minRooms={filters.minRooms}
        minArea={filters.minArea}
        onPropertyTypeChange={(propertyType) => updateFilters((current) => ({ ...current, propertyType }))}
        onMinRoomsChange={(minRooms) => updateFilters((current) => ({ ...current, minRooms }))}
        onMinAreaChange={(minArea) => updateFilters((current) => ({ ...current, minArea }))}
      />
    );
  }

  return (
    <div className="space-y-6">
      <LegalPapersFilter
        hasActeNotarie={filters.hasActeNotarie}
        hasLivretFoncier={filters.hasLivretFoncier}
        legalPaperType={filters.legalPaperType}
        onToggleActeNotarie={(checked) =>
          updateFilters((current) => ({ ...current, hasActeNotarie: checked ? true : undefined }))
        }
        onToggleLivretFoncier={(checked) =>
          updateFilters((current) => ({ ...current, hasLivretFoncier: checked ? true : undefined }))
        }
        onSelectLegalPaper={(legalPaperType) => updateFilters((current) => ({ ...current, legalPaperType }))}
      />
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
          {isAr ? "ترتيب العرض" : "Ordre d'affichage"}
        </label>
        <select
          value={filters.sort || "recent"}
          onChange={(event) =>
            updateFilters((current) => ({ ...current, sort: event.target.value as PropertySortOption }))
          }
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3.5 py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
        >
          <option value="recent">{isAr ? "الأحدث أولاً" : "Plus récents en premier"}</option>
          <option value="price_asc">{isAr ? "السعر تصاعدي (دج)" : "Prix croissant (DZD)"}</option>
          <option value="price_desc">{isAr ? "السعر تنازلي (دج)" : "Prix décroissant (DZD)"}</option>
          <option value="popularity">{isAr ? "الأكثر مشاهدة" : "Popularité / Nombre de vues"}</option>
        </select>
      </div>
    </div>
  );
};
