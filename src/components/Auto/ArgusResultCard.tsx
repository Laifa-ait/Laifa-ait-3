import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, TrendingUp, Clock, Eye } from "lucide-react";
import { ArgusEstimationResult } from "../../domains/auto/auto.argus";
import { formatPriceDZD, formatPriceMillions } from "../../domains/auto/auto.utils";
import { BrandImageLogo } from "../../domains/auto/data/brandLogosMap";

export interface ArgusResultCardProps {
  estimate: ArgusEstimationResult;
  brand: string;
  model: string;
  year: number;
  onApplyToEphemeral?: () => void;
}

export const ArgusResultCard: React.FC<ArgusResultCardProps> = ({
  estimate,
  brand,
  model,
  year,
  onApplyToEphemeral,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-[#1A1836] via-[#42164B] to-[#622347] text-white rounded-3xl p-6 shadow-xl border border-[#A54055]/30 sticky top-24 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BrandImageLogo brandName={brand} className="w-6 h-6 object-contain" />
          <span className="text-base font-extrabold text-white">{brand} {model}</span>
        </div>
        <span className="text-xs font-mono font-bold text-[#E99856] tabular-nums">
          Année {year}
        </span>
      </div>

      <div className="tabular-nums">
        <div className="text-xs text-[#E0B4B2] font-medium mb-1">Valeur marchande estimée (Cote Argus) :</div>
        <div className="text-2xl sm:text-3xl font-extrabold text-[#E99856] tracking-tight">
          {formatPriceMillions(estimate.estimatedPrice)}
        </div>
        <div className="text-xs text-[#E0B4B2] mt-1">
          Fourchette : <strong className="text-white">{formatPriceDZD(estimate.minPrice)}</strong> à{" "}
          <strong className="text-white">{formatPriceDZD(estimate.maxPrice)}</strong>
        </div>
      </div>

      <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs tabular-nums">
        <div className="flex items-center justify-between">
          <span className="text-[#E0B4B2] flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#E99856]" />
            Liquidité marché :
          </span>
          <span className="font-bold text-white">{estimate.liquidityLabel}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#E0B4B2] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#E0B4B2]" />
            Délai de vente moyen :
          </span>
          <span className="font-bold text-white">~{estimate.averageSellingDays} jours</span>
        </div>

        <div className="pt-2 text-[11px] text-[#E0B4B2] bg-white/10 rounded-2xl p-3 space-y-1">
          <div>• {estimate.paperImpactLabel}</div>
          <div>• {estimate.bodyImpactLabel}</div>
        </div>
      </div>

      <div className="space-y-2.5 pt-1">
        {onApplyToEphemeral && (
          <button
            type="button"
            onClick={onApplyToEphemeral}
            className="w-full py-3 bg-gradient-to-r from-[#E99856] to-[#d8823e] hover:brightness-105 text-[#1A1836] font-extrabold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 border-none"
          >
            <Eye className="w-4 h-4" />
            <span>Appliquer au Modèle Éphémère & Voir Résultat</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => navigate("/auto/deposer")}
          className="w-full py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/20"
        >
          <span>Passer à l'Étape 03 : Déposer à ce prix</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#E99856]" />
        </button>

        <Link
          to={`/auto/catalog?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`}
          className="w-full py-2.5 bg-transparent hover:bg-white/10 text-[#E0B4B2] hover:text-white font-semibold text-xs rounded-xl transition-colors text-center block"
        >
          Voir les {brand} {model} du catalogue
        </Link>
      </div>
    </div>
  );
};
