import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, MapPin, ShieldCheck } from "lucide-react";
import { AutoPartDto } from "../../../domains/auto/autoParts.types";
import { formatPriceDZD, getWilayaNameById } from "../../../domains/auto/auto.utils";

const CATEGORY_LABELS: Record<string, string> = {
  moteur: "Moteur & Boîte",
  carrosserie: "Carrosserie",
  optique: "Optiques & Phares",
  freinage: "Freinage",
  suspension: "Suspension",
  habitacle: "Habitacle",
  casse_depecage: "Casse Auto / Dépeçage",
  autre: "Accessoires & Autre",
};

const CONDITION_BADGES: Record<string, { label: string; color: string }> = {
  neuf: { label: "Neuf", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  tres_bon_etat: { label: "Très Bon État", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  bon_etat: { label: "Bon État", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  pour_pieces: { label: "Pour Pièces / Casse", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
};

interface AutoPartCardProps {
  part: AutoPartDto;
}

export const AutoPartCard: React.FC<AutoPartCardProps> = ({ part }) => {
  const wilayaName = getWilayaNameById(part.wilayaId);
  const condition = CONDITION_BADGES[part.condition] || { label: part.condition, color: "bg-slate-800 text-slate-300" };
  const primaryImage = part.images[0] || "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80";

  return (
    <Link
      to={`/auto/pieces/${part.id}`}
      className="group bg-slate-900 border border-slate-800 hover:border-orange-500/50 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col h-full hover:shadow-lg hover:shadow-orange-500/5"
    >
      {/* Photo & Badges */}
      <div className="relative aspect-16/10 bg-slate-950 overflow-hidden">
        <img
          src={primaryImage}
          alt={part.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${condition.color}`}>
            {condition.label}
          </span>
          {part.isJunkYard && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-600 text-white shadow-xs">
              Casse Auto
            </span>
          )}
        </div>

        <div className="absolute bottom-2.5 left-2.5">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-xs text-slate-300 border border-slate-800">
            {CATEGORY_LABELS[part.category] || part.category}
          </span>
        </div>
      </div>

      {/* Détails */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug">
            {part.title}
          </h3>

          {/* Compatibilités Mécaniques Certifiées */}
          {part.compatibilities.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {part.compatibilities.slice(0, 2).map((c, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                >
                  {c.isCertified ? (
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 text-slate-400" />
                  )}
                  <span>
                    {c.brand} {c.model}
                  </span>
                </span>
              ))}
              {part.compatibilities.length > 2 && (
                <span className="text-[10px] text-slate-400 px-1 py-0.5">
                  +{part.compatibilities.length - 2} autres
                </span>
              )}
            </div>
          )}
        </div>

        {/* Localisation & Prix */}
        <div className="pt-3 border-t border-slate-800/80 flex items-end justify-between">
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate max-w-[120px]">{part.commune}, {wilayaName}</span>
          </div>

          <div className="text-right">
            <p className="text-base font-black text-orange-400 tracking-tight">
              {formatPriceDZD(part.priceDZD)}
            </p>
            {part.isPriceNegotiable && (
              <span className="text-[10px] text-slate-400 font-medium">Négociable</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
