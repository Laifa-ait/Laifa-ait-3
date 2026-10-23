import React from "react";
import { useTranslation } from "react-i18next";
import { BarChart3 } from "lucide-react";
import { AdSpotConfig } from "../../services/sellerMarketing.service";

interface MarketingOverviewTabProps {
  overview: {
    kpis: {
      activeCampaignsCount: number;
      totalSpentDZD: number;
      totalImpressions: number;
      totalClicks: number;
      ctrPct: number;
      conversionsCount: number;
    };
    eventsLog: Array<{ timestamp: string; campaignTitle: string; status: string; actor: string; details: string }>;
    adSpots: AdSpotConfig[];
  } | null;
}

export const MarketingOverviewTab: React.FC<MarketingOverviewTabProps> = ({ overview }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 text-start">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t("Campagnes Actives")}</span>
          <p className="text-2xl font-black text-zinc-900">{overview?.kpis.activeCampaignsCount ?? 0}</p>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t("Budget Engagé")}</span>
          <p className="text-2xl font-black text-orange-600">{(overview?.kpis.totalSpentDZD ?? 0).toLocaleString()} DZD</p>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t("Impressions Totales")}</span>
          <p className="text-2xl font-black text-zinc-900">{(overview?.kpis.totalImpressions ?? 0).toLocaleString()}</p>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t("Clics Générés")}</span>
          <p className="text-2xl font-black text-zinc-900">{(overview?.kpis.totalClicks ?? 0).toLocaleString()}</p>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t("Taux de Clic (CTR)")}</span>
          <p className="text-2xl font-black text-emerald-600">{overview?.kpis.ctrPct ?? 0}%</p>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t("Conversions Estimées")}</span>
          <p className="text-2xl font-black text-amber-600">{overview?.kpis.conversionsCount ?? 0}</p>
        </div>
      </div>

      {/* Audit Events & Logs */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-zinc-950 uppercase tracking-wide flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-orange-600" />
          <span>{t("Journal d'Événements & Historique des Campagnes")}</span>
        </h3>

        {!overview?.eventsLog || overview.eventsLog.length === 0 ? (
          <p className="text-xs text-zinc-400 py-6 text-center">{t("Aucun événement marketing enregistré pour le moment.")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <th className="py-3 px-4">{t("Date & Heure")}</th>
                  <th className="py-3 px-4">{t("Campagne")}</th>
                  <th className="py-3 px-4">{t("Statut")}</th>
                  <th className="py-3 px-4">{t("Détails & Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {overview.eventsLog.map((ev, i) => (
                  <tr key={i} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-zinc-500 text-[11px]">
                      {new Date(ev.timestamp).toLocaleString("fr-FR")}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-zinc-900">{ev.campaignTitle}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ev.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : ev.status === "pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {ev.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600 font-medium">{ev.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
