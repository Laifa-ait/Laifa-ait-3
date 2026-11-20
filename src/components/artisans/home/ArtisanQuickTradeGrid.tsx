import React from "react";
import { Check } from "lucide-react";
import { BOOKING_CATEGORIES } from "../data/artisanBookingCategories";

interface ArtisanQuickTradeGridProps {
  activeTradeId?: string;
  onSelectTradeFilter: (tradeKey: string) => void;
}

const SHORT_LABELS: Record<string, string> = {
  "plomberie-chauffage": "Plomberie",
  "electricite-batiment": "Électricité",
  "climatisation-froid": "Climatisation",
  "peinture-decoration": "Peinture",
  "menuiserie-aluminium": "Menuiserie",
  "maconnerie-gros-oeuvre": "Maçonnerie",
  "carrelage-faience": "Carrelage",
  "serrurerie-securite": "Serrurerie",
};

const TRADE_FILTER_KEYS: Record<string, string> = {
  "plomberie-chauffage": "plomberie",
  "electricite-batiment": "electricite",
  "climatisation-froid": "climatisation",
  "peinture-decoration": "peinture",
  "menuiserie-aluminium": "menuiserie",
  "maconnerie-gros-oeuvre": "maconnerie",
  "carrelage-faience": "carrelage",
  "serrurerie-securite": "serrurerie",
};

export const ArtisanQuickTradeGrid: React.FC<ArtisanQuickTradeGridProps> = ({
  activeTradeId,
  onSelectTradeFilter,
}) => {
  return (
    <section aria-label="Filtrer par corps de métier">
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-2.5">
        {BOOKING_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const filterKey = TRADE_FILTER_KEYS[category.id] || category.id;
          const isSelected = Boolean(
            activeTradeId &&
              (activeTradeId.toLowerCase() === filterKey ||
                activeTradeId.toLowerCase().includes(filterKey))
          );
          const shortName = SHORT_LABELS[category.id] || category.name.split(" ")[0];

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectTradeFilter(isSelected ? "" : filterKey)}
              className={`group flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl border text-center transition-all duration-150 cursor-pointer select-none ${
                isSelected
                  ? "bg-blue-50/80 border-[#1E3A8A] text-[#0F172A] shadow-2xs"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  isSelected
                    ? "bg-[#1E3A8A] text-white"
                    : "bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-[#1E3A8A]"
                }`}
              >
                {isSelected ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <Icon className="w-4 h-4 stroke-[1.9]" />
                )}
              </div>
              <span
                className={`text-[11px] sm:text-xs leading-tight truncate w-full ${
                  isSelected ? "font-bold text-[#0F172A]" : "font-medium text-slate-700"
                }`}
              >
                {shortName}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
