import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Edit3,
  Trash2,
  PauseCircle,
  PlayCircle,
  Eye,
  ExternalLink,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import {
  ArtisanOffer,
  ArtisanOfferStatus,
  formatOfferPriceLabel,
} from "../../../types/artisanOffers";
import {
  deleteArtisanOffer,
  updateArtisanOffer,
} from "../../../services/artisanOffers.api";

interface ArtisanOffersTabProps {
  offers: ArtisanOffer[];
  onCreateNew: () => void;
  onEditOffer: (offer: ArtisanOffer) => void;
  onRefresh: () => Promise<void>;
}

const STATUS_BADGES: Record<ArtisanOfferStatus, { label: string; cls: string }> = {
  active: { label: "Active", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  pending_review: { label: "En validation", cls: "bg-amber-50 text-amber-800 border-amber-200" },
  paused: { label: "En pause", cls: "bg-slate-100 text-slate-700 border-slate-200" },
  draft: { label: "Brouillon", cls: "bg-slate-100 text-slate-600 border-slate-200" },
  rejected: { label: "Refusée", cls: "bg-red-50 text-red-700 border-red-200" },
};

export const ArtisanOffersTab: React.FC<ArtisanOffersTabProps> = ({
  offers,
  onCreateNew,
  onEditOffer,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<ArtisanOfferStatus | "all">("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = offers.filter((o) => filterStatus === "all" || o.status === filterStatus);

  const handleTogglePause = async (offer: ArtisanOffer) => {
    setBusyId(offer.id);
    try {
      const nextStatus = offer.status === "active" ? "paused" : "active";
      await updateArtisanOffer(offer.id, { status: nextStatus });
      await onRefresh();
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (offerId: string) => {
    setBusyId(offerId);
    try {
      await deleteArtisanOffer(offerId);
      await onRefresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", "active", "pending_review", "paused", "draft", "rejected"] as const).map(
            (st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  filterStatus === st
                    ? "bg-[#0F172A] text-white border-[#0F172A]"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {st === "all" ? `Toutes (${offers.length})` : STATUS_BADGES[st].label}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          onClick={onCreateNew}
          className="h-9 px-4 rounded-xl bg-[#1E3A8A] hover:bg-blue-950 text-white text-xs font-semibold inline-flex items-center gap-1.5 self-start cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Publier une offre</span>
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#1E3A8A] flex items-center justify-center mx-auto">
            <Briefcase className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#0F172A]">
            {offers.length === 0
              ? "Vous n'avez pas encore publié d'offre de travaux"
              : "Aucune offre dans ce statut"}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Créez une fiche d&apos;offre complète avec photos de vos réalisations, tarif indicatif et wilaya pour recevoir des demandes de devis.
          </p>
          <button
            type="button"
            onClick={onCreateNew}
            className="h-9 px-4 rounded-xl bg-[#1E3A8A] hover:bg-blue-950 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Publier ma première offre</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((offer) => {
            const badge = STATUS_BADGES[offer.status] || STATUS_BADGES.draft;
            const isBusy = busyId === offer.id;
            return (
              <div
                key={offer.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-4"
              >
                <div className="w-full sm:w-36 h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                  {offer.coverImageUrl || offer.images[0] ? (
                    <img
                      src={offer.coverImageUrl || offer.images[0]}
                      alt={offer.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Briefcase className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between gap-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {offer.tradeName} · {offer.wilaya}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#0F172A] truncate mt-1">
                        {offer.title}
                      </h3>
                    </div>

                    <p className="text-sm font-bold text-[#0F172A] tabular-nums shrink-0">
                      {formatOfferPriceLabel(offer)}
                    </p>
                  </div>

                  {offer.status === "rejected" && offer.rejectionReason && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Motif : {offer.rejectionReason}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-xs text-slate-500 tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {offer.viewsCount || 0} vues
                      </span>
                      <span>{offer.quoteRequestsCount || 0} devis</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {offer.status === "active" && (
                        <button
                          type="button"
                          onClick={() => navigate(`/artisans/offres/${offer.id}`)}
                          className="h-8 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Voir</span>
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onEditOffer(offer)}
                        className="h-8 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Modifier</span>
                      </button>

                      {(offer.status === "active" || offer.status === "paused") && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleTogglePause(offer)}
                          className="h-8 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          {offer.status === "active" ? (
                            <>
                              <PauseCircle className="w-3.5 h-3.5" />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Activer</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleDelete(offer.id)}
                        className="h-8 px-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
