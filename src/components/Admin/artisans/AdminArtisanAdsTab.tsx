import React, { useEffect, useState, useCallback } from "react";
import { CheckCircle2, Pause, XCircle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { ArtisanTrade } from "../../../types/artisan";
import {
  ArtisanAdCampaign,
  ArtisanAdStatus,
  ArtisanAdsAdminSummary,
} from "../../../types/artisanAds";
import {
  adminFetchArtisanAds,
  adminUpdateArtisanAdStatus,
} from "../../../services/artisanAds.api";
import { AdminSponsorAdForm } from "./AdminSponsorAdForm";

interface AdminArtisanAdsTabProps {
  trades: ArtisanTrade[];
}

export const AdminArtisanAdsTab: React.FC<AdminArtisanAdsTabProps> = ({ trades }) => {
  const [campaigns, setCampaigns] = useState<ArtisanAdCampaign[]>([]);
  const [summary, setSummary] = useState<ArtisanAdsAdminSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAds = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetchArtisanAds();
      setCampaigns(data.campaigns);
      setSummary(data.summary);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAds();
  }, [loadAds]);

  const handleStatusChange = async (id: string, status: ArtisanAdStatus) => {
    const res = await adminUpdateArtisanAdStatus(id, status);
    if (res.success) {
      toast.success("Statut publicitaire mis à jour");
      await loadAds();
    } else {
      toast.error(res.error || "Erreur de mise à jour");
    }
  };

  return (
    <div className="space-y-6">
      {/* Google Ad Manager Revenue KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Revenus Publicitaires</p>
          <p className="text-2xl font-black text-emerald-700 mt-1 tabular-nums">
            {new Intl.NumberFormat("fr-FR").format(summary?.totalRevenueDzd || 0)} DA
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-amber-600 uppercase">En attente paiement</p>
          <p className="text-2xl font-black text-amber-600 mt-1 tabular-nums">
            {new Intl.NumberFormat("fr-FR").format(summary?.pendingRevenueDzd || 0)} DA
            <span className="text-xs font-semibold text-slate-400 ml-1">
              ({summary?.pendingPaymentCount || 0})
            </span>
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Campagnes Actives</p>
          <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
            {summary?.activeCampaignsCount || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Impressions · CTR</p>
          <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
            {summary?.totalImpressions || 0}
            <span className="text-xs font-bold text-emerald-600 ml-1.5">
              {summary?.avgCtrPercent || 0}% CTR
            </span>
          </p>
        </div>
      </div>

      {/* Create External Brand / Hardware / Olmart Store Contextual Ad */}
      <AdminSponsorAdForm trades={trades} onCreated={loadAds} />

      {/* All Campaigns List (Artisan Boosts + Brand Sponsors) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900">
            Toutes les campagnes ({campaigns.length})
          </h3>
          <button
            type="button"
            onClick={loadAds}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        </div>

        {campaigns.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            Aucune campagne publicitaire enregistrée pour le moment.
          </p>
        ) : (
          <div className="space-y-2.5">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl border border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900">{c.advertiserName}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {c.format}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium truncate">{c.title}</p>
                  <p className="text-[11px] text-slate-500">
                    Budget : {c.budgetDzd} DA · Dépensé : {c.spentDzd} DA · Vues : {c.impressions} ·
                    Clics : {c.clicks} · Demandes : {c.leadsCount}
                    {c.paymentReference ? ` · Réf : ${c.paymentReference}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {c.status !== "active" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(c.id, "active")}
                      className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Activer
                    </button>
                  )}
                  {c.status === "active" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(c.id, "paused")}
                      className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Pause className="w-3.5 h-3.5" /> Pause
                    </button>
                  )}
                  {c.status !== "rejected" && c.status !== "ended" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(c.id, "rejected")}
                      className="h-8 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Refuser
                    </button>
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
