import React, { useEffect, useState, useCallback } from "react";
import { Megaphone, CheckCircle2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { ArtisanProfile } from "../../../types/artisan";
import {
  ArtisanAdCampaign,
  ArtisanAdPack,
  ArtisanQualityBreakdown,
  INDIVIDUAL_ARTISAN_AD_PACKS,
} from "../../../types/artisanAds";
import {
  createMyArtisanBoost,
  fetchMyArtisanAdDashboard,
  toggleMyArtisanBoost,
} from "../../../services/artisanAds.api";
import { ALGERIA_WILAYAS } from "../../../constants/wilayas";
import {
  ArtisanCampaignsHistoryList,
  ArtisanQualityScoreCard,
} from "./ArtisanQualityScoreCard";

interface ArtisanAdsCampaignTabProps {
  profile: ArtisanProfile;
}

export const ArtisanAdsCampaignTab: React.FC<ArtisanAdsCampaignTabProps> = ({ profile }) => {
  const [campaigns, setCampaigns] = useState<ArtisanAdCampaign[]>([]);
  const [quality, setQuality] = useState<ArtisanQualityBreakdown>({ score: 50, items: [] });
  const [packs, setPacks] = useState<ArtisanAdPack[]>(INDIVIDUAL_ARTISAN_AD_PACKS);
  const [selectedPackId, setSelectedPackId] = useState<string>("lsa_week_7d");
  const [selectedWilayas, setSelectedWilayas] = useState<string[]>([profile.wilaya]);
  const [paymentRef, setPaymentRef] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyArtisanAdDashboard();
      if (data) {
        setCampaigns(data.campaigns);
        setQuality(data.quality);
        if (data.packs.length > 0) setPacks(data.packs);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleToggleWilaya = (wilayaName: string) => {
    setSelectedWilayas((prev) => {
      if (prev.includes(wilayaName)) {
        return prev.length > 1 ? prev.filter((w) => w !== wilayaName) : prev;
      }
      if (prev.length >= 3) {
        toast.error("Maximum 3 wilayas par campagne");
        return prev;
      }
      return [...prev, wilayaName];
    });
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createMyArtisanBoost({
        packId: selectedPackId,
        targetWilayas: selectedWilayas,
        paymentReference: paymentRef.trim() || undefined,
      });
      if (res.success) {
        toast.success("Campagne enregistrée ! Elle sera activée dès validation du règlement.");
        setPaymentRef("");
        await loadDashboard();
      } else {
        toast.error(res.error || "Impossible de créer la campagne");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePause = async (campaignId: string) => {
    const res = await toggleMyArtisanBoost(campaignId);
    if (res.success) {
      toast.success(
        res.data?.status === "paused" ? "Campagne mise en pause" : "Campagne relancée"
      );
      await loadDashboard();
    } else {
      toast.error(res.error || "Action impossible");
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-600 mx-auto" />
      </div>
    );
  }

  const selectedPack = packs.find((p) => p.id === selectedPackId) || packs[0];

  return (
    <div className="space-y-6">
      <ArtisanQualityScoreCard quality={quality} />

      <form
        onSubmit={handleCreateCampaign}
        className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-5"
      >
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm sm:text-base font-bold text-[#1E293B] flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-amber-600" />
            <span>Booster mon profil d&apos;artisan indépendant</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Choisissez un petit budget adapté aux particuliers (CCP / BaridiMob) — pause possible à tout moment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {packs.map((pack) => {
            const isSelected = pack.id === selectedPackId;
            return (
              <button
                key={pack.id}
                type="button"
                onClick={() => setSelectedPackId(pack.id)}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? "bg-amber-50/70 border-amber-500 shadow-xs"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900">{pack.name}</span>
                    {pack.popular && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                        Populaire
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-black text-[#1E293B] tabular-nums">
                    {new Intl.NumberFormat("fr-FR").format(pack.priceDzd)} DA
                  </p>
                  <p className="text-[11px] text-slate-500 leading-snug">{pack.tagline}</p>
                </div>

                <ul className="space-y-1 text-[11px] text-slate-600 border-t border-slate-200/60 pt-2">
                  {pack.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Wilayas ciblées ({selectedWilayas.length}/3)
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) handleToggleWilaya(e.target.value);
                e.target.value = "";
              }}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
              defaultValue=""
            >
              <option value="">+ Ajouter une wilaya voisine...</option>
              {ALGERIA_WILAYAS.map((w) => (
                <option key={w.code} value={w.name}>
                  {w.code} — {w.name}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedWilayas.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => handleToggleWilaya(w)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium cursor-pointer"
                >
                  {w} ×
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Référence CCP / BaridiMob (facultatif lors de la demande)
            </label>
            <input
              type="text"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              placeholder="Ex: RIP / Reçu BaridiMob ou payer après confirmation"
              className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
            />
            <p className="text-[11px] text-slate-500">
              Montant sélectionné : <strong>{selectedPack?.priceDzd} DA</strong> pour{" "}
              <strong>{selectedPack?.durationDays} jour(s)</strong>.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={submitting}
            className="h-10 px-6 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            {submitting
              ? "Enregistrement..."
              : `Activer « ${selectedPack?.name} » (${selectedPack?.priceDzd} DA)`}
          </button>
        </div>
      </form>

      <ArtisanCampaignsHistoryList campaigns={campaigns} onTogglePause={handleTogglePause} />
    </div>
  );
};
