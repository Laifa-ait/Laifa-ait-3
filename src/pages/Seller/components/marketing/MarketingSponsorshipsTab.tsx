import React from "react";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { AdSpotConfig } from "../../services/sellerMarketing.service";
import { SponsorshipRequest } from "../../sponsorship.types";

interface MarketingSponsorshipsTabProps {
  adSpots?: AdSpotConfig[];
  sponsorshipRequests: SponsorshipRequest[];
  onSelectSpot: (spot: AdSpotConfig) => void;
}

export const MarketingSponsorshipsTab: React.FC<MarketingSponsorshipsTabProps> = ({
  adSpots,
  sponsorshipRequests,
  onSelectSpot,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 text-start">
      <div>
        <h3 className="text-lg font-bold text-zinc-950 uppercase tracking-wide">
          {t("Catalogue des Emplacements Publicitaires Olmart")}
        </h3>
        <p className="text-xs text-zinc-500">
          {t("Achetez de la visibilité garantie sur Olmart. Règlement sécurisé par virement CCP / BaridiMob / RIB.")}
        </p>
      </div>

      {/* Ad Spots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adSpots?.map((spot) => (
          <div key={spot.id} className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl w-fit">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-zinc-950">{spot.title}</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">{spot.description}</p>
              <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full w-fit">
                {spot.estimatedDailyImpressions}
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-zinc-100">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-zinc-500">A partir de</span>
                <span className="text-lg font-black text-zinc-950">{spot.pricePerDayDZD} DZD<span className="text-xs text-zinc-400 font-normal">/jour</span></span>
              </div>

              <button
                onClick={() => onSelectSpot(spot)}
                className="w-full py-2.5 bg-zinc-950 hover:bg-orange-600 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                {t("Réserver cet Emplacement")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Existing Sponsorship Requests */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm space-y-4">
        <h4 className="text-base font-bold text-zinc-950 uppercase tracking-wide">
          {t("Vos Demandes de Publicité & Suivi de Modération")}
        </h4>

        {sponsorshipRequests.length === 0 ? (
          <p className="text-xs text-zinc-400 py-6 text-center">{t("Aucune demande de sponsoring en cours.")}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sponsorshipRequests.map((req) => (
              <div key={req.id} className="border border-zinc-200 rounded-2xl p-4 space-y-3 bg-zinc-50/50">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-zinc-900">Demande #{req.id.substring(0, 8)}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      req.status === "approved" || req.status === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : req.status === "rejected"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {req.status === "approved" || req.status === "active"
                      ? "ACTIVE / APPROUVÉE"
                      : req.status === "rejected"
                      ? "REFUSÉE"
                      : "EN ATTENTE VALIDATION"}
                  </span>
                </div>

                <div className="text-xs text-zinc-600 space-y-1">
                  <p>Prix : <strong>{req.priceAmount} DZD</strong> ({req.durationDays} jours)</p>
                  {req.rejectionReason && (
                    <p className="text-rose-600 font-bold bg-rose-50 p-2 rounded-lg mt-2">
                      Motif du refus : {req.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
