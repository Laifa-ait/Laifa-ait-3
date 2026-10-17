import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Factory, Award, Truck } from "lucide-react";
import { LOGOTEKA_BRAND_LOGOS, LogotekaBrandMeta } from "../../domains/auto/data/brandLogosMap";

type BrandCategory = "all" | "factories" | "leaders" | "suv_pro";

interface CategoryFilter {
  id: BrandCategory;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const CATEGORIES: readonly CategoryFilter[] = [
  { id: "all", label: "Toutes (30)", icon: Sparkles },
  { id: "factories", label: "Usines & Récentes", icon: Factory },
  { id: "leaders", label: "Historiques & Leaders", icon: Award },
  { id: "suv_pro", label: "SUV, Pick-up & Pro", icon: Truck },
];

export const AutoPopularBrandsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<BrandCategory>("all");
  const [isExpanded, setIsExpanded] = useState(false);

  // Filtrage selon la catégorie demandée
  const displayedBrands = useMemo(() => {
    // Les 30 marques demandées spécifiquement par l'utilisateur
    const primary30 = LOGOTEKA_BRAND_LOGOS.slice(0, 30);

    if (activeCategory === "factories") {
      // Fiat, Chery, Opel, Geely, DFSK
      return primary30.slice(0, 5);
    }
    if (activeCategory === "leaders") {
      // Renault, Peugeot, Volkswagen, Dacia, Hyundai, Kia, Toyota, SEAT, Citroën, Ford, Mercedes-Benz, BMW, Audi
      return primary30.slice(5, 18);
    }
    if (activeCategory === "suv_pro") {
      // JAC, JMC, Sokon, Jetour, BAIC, Great Wall, Haval, Dongfeng, Joyear, MG, Bestune, Exeed
      return primary30.slice(18, 30);
    }

    // Toutes les marques (30 au total)
    return isExpanded ? primary30 : primary30.slice(0, 18);
  }, [activeCategory, isExpanded]);

  return (
    <section className="mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
              Explorer par Marque
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#172B4D]/10 text-[#0B1730] text-[10px] font-bold">
              <Sparkles className="w-3 h-3 text-[#172B4D]" />
              <span>30 Marques Officielles</span>
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Logos vectoriels haute définition importés depuis le répertoire officiel de référence.
          </p>
        </div>

        <Link
          to="/auto/catalog"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#172B4D] hover:text-[#0B1730] group transition-colors shrink-0"
        >
          <span>Toutes les marques</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Onglets Filtres des Groupes de Marques */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                setIsExpanded(false);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-[#0B1730] text-[#D9F66F] shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#D9F66F]" : "text-slate-400"}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grille Responsive des Marques avec Vrais Logos SVG Téléchargés */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3.5">
        {displayedBrands.map((brand: LogotekaBrandMeta) => (
          <Link
            key={brand.id}
            to={`/auto/catalog?brand=${encodeURIComponent(brand.name)}`}
            className="group relative bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 hover:border-[#172B4D] hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center text-center focus:outline-none focus:ring-2 focus:ring-[#172B4D] min-h-[110px] sm:min-h-[125px] cursor-pointer"
          >
            {/* Badge contextuel marché algérien */}
            {brand.badge && (
              <span className="absolute top-1.5 right-1.5 text-[9px] font-black uppercase tracking-wider text-[#0B1730] bg-[#D9F66F] px-1.5 py-0.5 rounded shadow-2xs opacity-90 group-hover:opacity-100 hidden sm:inline-block">
                {brand.badge}
              </span>
            )}

            {/* Logo Officiel importé depuis le répertoire */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-50/80 border border-slate-100 group-hover:bg-white group-hover:border-slate-200 p-2 flex items-center justify-center transition-all duration-200 group-hover:scale-105 shadow-2xs mb-2">
              <img
                src={brand.file}
                alt={`Logo officiel ${brand.name}`}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>

            {/* Nom de la Marque */}
            <span className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#172B4D] tracking-tight leading-tight transition-colors">
              {brand.name}
            </span>

            {/* Modèles phares sur desktop */}
            <span className="text-[10px] text-slate-400 group-hover:text-slate-600 truncate max-w-full hidden sm:block mt-0.5">
              {brand.models.split(",")[0]}
            </span>
          </Link>
        ))}
      </div>

      {/* Bouton d'extension si affichage partiel de la catégorie "all" */}
      {activeCategory === "all" && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-[#0B1730] bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <span>{isExpanded ? "Afficher moins" : "Afficher les 30 marques"}</span>
            <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "-rotate-90" : "rotate-90"}`} />
          </button>
        </div>
      )}
    </section>
  );
};
