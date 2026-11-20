import React from "react";
import {
  Briefcase,
  Eye,
  FileText,
  Star,
  PlusCircle,
  MessageSquare,
  Megaphone,
  ArrowRight,
  Clock,
} from "lucide-react";
import { ArtisanProfile, ArtisanQuoteRequest } from "../../../types/artisan";
import { ArtisanOffer } from "../../../types/artisanOffers";
import { ArtisanDashboardTab } from "./ArtisanDashboardLayout";

interface ArtisanOverviewTabProps {
  profile: ArtisanProfile;
  offers: ArtisanOffer[];
  quotes: ArtisanQuoteRequest[];
  onNavigateTab: (tab: ArtisanDashboardTab) => void;
}

export const ArtisanOverviewTab: React.FC<ArtisanOverviewTabProps> = ({
  profile,
  offers,
  quotes,
  onNavigateTab,
}) => {
  const activeOffersCount = offers.filter((o) => o.status === "active").length;
  const totalOfferViews = offers.reduce((acc, o) => acc + (o.viewsCount || 0), 0);
  const pendingQuotes = quotes.filter((q) => q.status === "pending");

  const kpis = [
    {
      label: "Offres actives",
      value: activeOffersCount,
      sub: `${offers.length} au total`,
      Icon: Briefcase,
      tone: "text-[#1E3A8A] bg-blue-50",
    },
    {
      label: "Vues sur vos offres",
      value: totalOfferViews,
      sub: "Demandeur de travaux",
      Icon: Eye,
      tone: "text-slate-700 bg-slate-100",
    },
    {
      label: "Demandes de devis",
      value: quotes.length,
      sub: `${pendingQuotes.length} en attente`,
      Icon: FileText,
      tone: "text-amber-700 bg-amber-50",
    },
    {
      label: "Note moyenne",
      value: `${(profile.rating || 5).toFixed(1)} / 5`,
      sub: `${profile.reviewCount || 0} avis vérifiés`,
      Icon: Star,
      tone: "text-emerald-700 bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-6">
      {profile.status !== "approved" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950 space-y-1">
            <p className="font-bold">Votre profil artisan est en cours de validation</p>
            <p className="leading-relaxed">
              Vous pouvez déjà préparer et publier vos offres de travaux : elles seront soumises à validation et visibles dès approbation de votre profil.
            </p>
          </div>
        </div>
      )}

      {/* 4 Tabular KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.Icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{kpi.label}</span>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.tone}`}>
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F172A] tabular-nums">{kpi.value}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => onNavigateTab("publish")}
          className="bg-white rounded-2xl border border-slate-200 hover:border-[#1E3A8A] p-4 text-left transition-colors cursor-pointer space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
            <PlusCircle className="w-4 h-4" />
          </div>
          <p className="text-sm font-bold text-[#0F172A]">Publier une offre de travaux</p>
          <p className="text-xs text-slate-500">
            Ajoutez photos, tarif indicatif et wilaya pour apparaître dans le catalogue demandeur.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab("messages")}
          className="bg-white rounded-2xl border border-slate-200 hover:border-[#1E3A8A] p-4 text-left transition-colors cursor-pointer space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <p className="text-sm font-bold text-[#0F172A]">Répondre dans la messagerie</p>
          <p className="text-xs text-slate-500">
            Discutez directement avec les clients qui ont demandé un devis sur vos prestations.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab("ads")}
          className="bg-white rounded-2xl border border-slate-200 hover:border-amber-400 p-4 text-left transition-colors cursor-pointer space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Megaphone className="w-4 h-4" />
          </div>
          <p className="text-sm font-bold text-[#0F172A]">Booster ma visibilité (Olma Ads)</p>
          <p className="text-xs text-slate-500">
            Placez vos offres en tête de votre wilaya grâce aux packs Express adaptés aux particuliers.
          </p>
        </button>
      </div>

      {/* Pending Quotes Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#0F172A]">
              Dernières demandes de devis en attente
            </h2>
            <p className="text-xs text-slate-500">
              Répondez rapidement pour améliorer votre score de réactivité.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab("quotes")}
            className="text-xs font-semibold text-[#1E3A8A] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Tout voir</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingQuotes.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 rounded-xl border border-slate-100">
            Aucune demande de devis en attente. Publiez ou enrichissez vos offres pour attirer davantage de demandes.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingQuotes.slice(0, 4).map((q) => (
              <div
                key={q.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#0F172A] truncate">
                    {q.offerTitle || q.title}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {q.clientName} · {q.commune}, {q.wilaya}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab("quotes")}
                  className="h-8 px-3 rounded-lg bg-[#1E3A8A] text-white text-xs font-semibold self-start sm:self-auto cursor-pointer"
                >
                  Chiffrer le devis
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
