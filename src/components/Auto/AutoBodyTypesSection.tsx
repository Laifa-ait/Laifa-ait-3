import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { BODY_TYPE_OPTIONS, VehicleBodyType } from "../../domains/auto/auto.utils";

const BodyTypeSilhouette: React.FC<{ type: VehicleBodyType; className?: string }> = ({
  type,
  className = "w-12 h-7",
}) => {
  switch (type) {
    case "citadine":
      return (
        <svg viewBox="0 0 56 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M7 23h42M12 23l3.5-11h18l6 11M16 12l2.5-6h11l3.5 6" />
          <circle cx="15" cy="23" r="4" fill="currentColor" fillOpacity="0.15" />
          <circle cx="39" cy="23" r="4" fill="currentColor" fillOpacity="0.15" />
        </svg>
      );
    case "berline":
      return (
        <svg viewBox="0 0 58 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M5 23h48M9 23l6-9h24l8 9M16 14l3.5-7h16l4.5 7" />
          <circle cx="14" cy="23" r="4" fill="currentColor" fillOpacity="0.15" />
          <circle cx="44" cy="23" r="4" fill="currentColor" fillOpacity="0.15" />
        </svg>
      );
    case "suv":
      return (
        <svg viewBox="0 0 58 32" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4 23h50M8 23l3.5-12h27l8 12M13 11l2.5-6h20l4.5 6" />
          <circle cx="15" cy="23" r="4.5" fill="currentColor" fillOpacity="0.2" />
          <circle cx="43" cy="23" r="4.5" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );
    case "break":
      return (
        <svg viewBox="0 0 60 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4 23h52M9 23l4.5-9h31l4.5 9M14 14l2.5-7h25l3 7" />
          <circle cx="15" cy="23" r="4" fill="currentColor" fillOpacity="0.15" />
          <circle cx="45" cy="23" r="4" fill="currentColor" fillOpacity="0.15" />
        </svg>
      );
    case "coupe":
      return (
        <svg viewBox="0 0 58 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M5 23h48M10 23l7-9h18l10 9M18 14l4.5-7h13l6 7" />
          <circle cx="14" cy="23" r="4" fill="currentColor" fillOpacity="0.15" />
          <circle cx="44" cy="23" r="4" fill="currentColor" fillOpacity="0.15" />
        </svg>
      );
    case "cabriolet":
      return (
        <svg viewBox="0 0 58 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M5 23h48M10 23l5-6h23l8 6M24 17v-5h1" />
          <circle cx="14" cy="23" r="4" fill="currentColor" fillOpacity="0.15" />
          <circle cx="44" cy="23" r="4" fill="currentColor" fillOpacity="0.15" />
        </svg>
      );
    case "utilitaire":
      return (
        <svg viewBox="0 0 60 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4 23h52M7 23V8h29l9 7v8M11 8h25M36 15h9" />
          <circle cx="15" cy="23" r="4.5" fill="currentColor" fillOpacity="0.2" />
          <circle cx="45" cy="23" r="4.5" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );
  }
};

export const AutoBodyTypesSection: React.FC = () => {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Par type de carrosserie</span>
            <span className="hidden sm:inline-block text-xs font-normal text-slate-400">
              · Recherche par Silhouette
            </span>
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Sélectionnez votre type de véhicule adapté aux routes d'Algérie.
          </p>
        </div>

        <Link
          to="/auto/catalog"
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-[#0B1730] transition-colors"
        >
          <span>Voir tout</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-2.5">
        {BODY_TYPE_OPTIONS.map((item) => (
          <Link
            key={item.id}
            to={`/auto/catalog?bodyType=${item.id}`}
            className="group p-2.5 sm:p-3 bg-white rounded-2xl border border-slate-200/80 hover:border-[#172B4D] hover:shadow-md transition-all flex flex-col items-center text-center focus:outline-none focus:ring-2 focus:ring-[#172B4D] min-h-[96px] justify-between cursor-pointer"
          >
            <div className="text-[#172B4D] group-hover:text-[#0B1730] group-hover:scale-105 transition-all my-1">
              <BodyTypeSilhouette type={item.id} className="w-11 h-6 sm:w-12 sm:h-7" />
            </div>
            <div className="w-full">
              <span className="text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-[#0B1730] block truncate">
                {item.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
