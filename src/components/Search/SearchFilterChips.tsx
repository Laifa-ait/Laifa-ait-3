import React from "react";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";

interface SearchFilterChipsProps {
  selectedScope: string;
  onScopeChange: (scope: string) => void;
}

export const SEARCH_SCOPES = [
  { id: "all", label: "Tout le catalogue", icon: Sparkles },
  { id: "products", label: "Produits" },
  { id: "stores", label: "Boutiques certifiées" },
  { id: "mode", label: "Mode & Vêtements" },
  { id: "tech", label: "High-Tech" },
  { id: "maison", label: "Maison & Électro" },
  { id: "artisanat", label: "Artisanat DZ" },
];

export const SearchFilterChips: React.FC<SearchFilterChipsProps> = ({
  selectedScope,
  onScopeChange
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs">
      {SEARCH_SCOPES.map((scope) => {
        const Icon = scope.icon;
        const isActive = selectedScope === scope.id;
        return (
          <button
            key={scope.id}
            type="button"
            onClick={() => onScopeChange(scope.id)}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all duration-150 cursor-pointer text-xs font-semibold shrink-0 border ${
              isActive
                ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            {Icon && <Icon className="w-3 h-3 inline me-1 -mt-0.5" />}
            <span>{t(scope.label, scope.label)}</span>
          </button>
        );
      })}
    </div>
  );
};
