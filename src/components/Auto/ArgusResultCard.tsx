import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, TrendingUp, Clock } from "lucide-react";
import { ArgusEstimationResult } from "../../domains/auto/auto.argus";
import { formatPriceDZD, formatPriceMillions } from "../../domains/auto/auto.utils";
import { BrandImageLogo } from "../../domains/auto/data/brandLogosMap";

export interface ArgusResultCardProps {
  estimate: ArgusEstimationResult;
  brand: string;
  model: string;
  year: number;
}

export const ArgusResultCard: React.FC<ArgusResultCardProps> = ({
  estimate,
  brand,
  model,
  year,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-[#0B1730] via-[#101E3D] to-[#0B1730] text-white rounded-3xl p-6 shadow-xl border border-[#172B4D] sticky top-24">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BrandImageLogo brandName={brand} className="w-6 h-6 object-contain" />
          <span className="text-sm font-black text-white">{brand} {model}</span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D9F66F] text-[#0B1730]">
          {year}
        </span>
      </div>

      <div className="text-xs text-slate-400 font-medium mb-1">Fourchette de prix estimée :</div>
      <div className="text-2xl sm:text-3xl font-black text-[#D9F66F] tracking-tight">
        {formatPriceMillions(estimate.estimatedPrice)}
      </div>
      <div className="text-xs text-slate-300 mt-0.5">
        soit <strong className="text-white">{formatPriceDZD(estimate.minPrice)}</strong> à{" "}
        <strong className="text-white">{formatPriceDZD(estimate.maxPrice)}</strong>
      </div>

      {/* Métriques Algérie */}
      <div className="mt-5 space-y-2.5 pt-4 border-t border-[#172B4D] text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#D9F66F]" />
            Liquidité marché :
          </span>
          <span className="font-bold text-white text-[11px]">{estimate.liquidityLabel}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Délai de vente moyen :
          </span>
          <span className="font-bold text-slate-200 text-[11px]">~{estimate.averageSellingDays} jours</span>
        </div>

        <div className="pt-2 text-[11px] text-slate-300 bg-white/5 rounded-xl p-2.5 space-y-1">
          <div>• {estimate.paperImpactLabel}</div>
          <div>• {estimate.bodyImpactLabel}</div>
        </div>
      </div>

      {/* Boutons d'Action Directs */}
      <div className="mt-6 space-y-2">
        <button
          type="button"
          onClick={() => navigate(`/auto/deposer`)}
          className="w-full py-3 bg-gradient-to-r from-[#D9F66F] to-[#C5E94F] hover:brightness-105 text-[#0B1730] font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Déposer mon annonce à ce prix</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <Link
          to={`/auto/catalog?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`}
          className="w-full py-2.5 bg-[#172B4D] hover:bg-[#23416A] text-slate-200 hover:text-white font-bold text-xs rounded-xl transition-colors text-center block"
        >
          Voir les {brand} {model} en vente
        </Link>
      </div>
    </div>
  );
};
