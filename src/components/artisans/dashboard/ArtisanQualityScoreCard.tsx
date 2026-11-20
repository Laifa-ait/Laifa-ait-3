import React from "react";
import {
  TrendingUp,
  CheckCircle2,
  Circle,
  Pause,
  Play,
  Eye,
  MousePointerClick,
  PhoneCall,
} from "lucide-react";
import {
  ArtisanAdCampaign,
  ArtisanQualityBreakdown,
} from "../../../types/artisanAds";

const STATUS_LABELS: Record<string, { label: string; style: string }> = {
  active: { label: "En diffusion", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  pending_payment: { label: "En attente validation", style: "bg-amber-50 text-amber-800 border-amber-200" },
  paused: { label: "En pause", style: "bg-slate-100 text-slate-600 border-slate-200" },
  ended: { label: "Terminée", style: "bg-slate-100 text-slate-500 border-slate-200" },
  rejected: { label: "Refusée", style: "bg-red-50 text-red-700 border-red-200" },
};

export const ArtisanQualityScoreCard: React.FC<{ quality: ArtisanQualityBreakdown }> = ({
  quality,
}) => (
  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
    <div className="space-y-1.5 max-w-xl">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
        <TrendingUp className="w-4 h-4 text-amber-600" />
        <span>Score de Qualité Olma Ads : {quality.score}/100</span>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">
        Comme sur Google Local Services, un profil complet et bien noté passe devant les autres
        <strong> sans payer plus cher</strong>. Aucun registre de commerce ni entreprise requis.
      </p>
      <div className="w-full max-w-md h-2 rounded-full bg-slate-100 overflow-hidden mt-2">
        <div
          className="h-full bg-amber-500 rounded-full transition-all duration-300"
          style={{ width: `${quality.score}%` }}
        />
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
      {quality.items.map((item) => (
        <div key={item.key} className="flex items-center gap-1.5 text-slate-700">
          {item.completed ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          ) : (
            <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          )}
          <span className={item.completed ? "text-slate-800" : "text-slate-500"}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export const ArtisanCampaignsHistoryList: React.FC<{
  campaigns: ArtisanAdCampaign[];
  onTogglePause: (campaignId: string) => void;
}> = ({ campaigns, onTogglePause }) => (
  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3">
    <h3 className="text-sm font-bold text-[#1E293B]">Mes campagnes ({campaigns.length})</h3>

    {campaigns.length === 0 ? (
      <p className="text-xs text-slate-500 py-4">
        Vous n&apos;avez pas encore lancé de boost publicitaire. Choisissez un pack ci-dessus pour
        apparaître en tête dans votre wilaya.
      </p>
    ) : (
      <div className="space-y-2.5">
        {campaigns.map((c) => {
          const badge = STATUS_LABELS[c.status] || STATUS_LABELS.paused;
          const ctr =
            c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(1) : "0.0";
          return (
            <div
              key={c.id}
              className="p-3.5 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900">{c.title}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.style}`}
                  >
                    {badge.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Wilayas : {c.targetWilayas.join(", ")} · Budget : {c.budgetDzd} DA · Score :{" "}
                  {c.qualityScore}/100
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs tabular-nums">
                <span className="inline-flex items-center gap-1 text-slate-600" title="Impressions">
                  <Eye className="w-3.5 h-3.5 text-slate-400" /> {c.impressions}
                </span>
                <span className="inline-flex items-center gap-1 text-slate-600" title="Clics">
                  <MousePointerClick className="w-3.5 h-3.5 text-slate-400" /> {c.clicks} ({ctr}%)
                </span>
                <span
                  className="inline-flex items-center gap-1 text-emerald-700 font-semibold"
                  title="Demandes"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> {c.leadsCount}
                </span>

                {(c.status === "active" || c.status === "paused") && (
                  <button
                    type="button"
                    onClick={() => onTogglePause(c.id)}
                    className="h-8 px-3 rounded-full border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    {c.status === "active" ? (
                      <>
                        <Pause className="w-3 h-3" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" /> Reprendre
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);
