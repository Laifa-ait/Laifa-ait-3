import React, { useEffect, useState, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  PauseCircle,
  RefreshCw,
  Briefcase,
  Search,
} from "lucide-react";
import { ArtisanTrade } from "../../../types/artisan";
import {
  ArtisanOffer,
  ArtisanOfferStatus,
  formatOfferPriceLabel,
} from "../../../types/artisanOffers";
import {
  adminFetchArtisanOffers,
  adminModerateArtisanOffer,
} from "../../../services/artisanOffers.api";

interface AdminArtisanOffersTabProps {
  trades: ArtisanTrade[];
}

export const AdminArtisanOffersTab: React.FC<AdminArtisanOffersTabProps> = ({ trades }) => {
  const [offers, setOffers] = useState<ArtisanOffer[]>([]);
  const [statusFilter, setStatusFilter] = useState<ArtisanOfferStatus | "all">("all");
  const [tradeFilter, setTradeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const loadOffers = useCallback(async () => {
    setLoading(true);
    try {
      const list = await adminFetchArtisanOffers({
        status: statusFilter,
        tradeId: tradeFilter || undefined,
        search: search.trim() || undefined,
      });
      setOffers(list);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, tradeFilter, search]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const handleModerate = async (
    offerId: string,
    status: ArtisanOfferStatus,
    reason?: string
  ) => {
    setBusyId(offerId);
    try {
      await adminModerateArtisanOffer(offerId, status, reason);
      setRejectingId(null);
      setRejectReason("");
      await loadOffers();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ArtisanOfferStatus | "all")}
          className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending_review">En attente de validation</option>
          <option value="active">Actives (Publiées)</option>
          <option value="paused">En pause</option>
          <option value="rejected">Refusées</option>
          <option value="draft">Brouillons</option>
        </select>

        <select
          value={tradeFilter}
          onChange={(e) => setTradeFilter(e.target.value)}
          className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer"
        >
          <option value="">Tous les métiers</option>
          {trades.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <div className="flex-1 min-w-[200px] flex gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par titre, artisan ou wilaya..."
              className="w-full h-10 pl-8 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            />
          </div>
          <button
            type="button"
            onClick={loadOffers}
            className="px-3.5 h-10 rounded-xl bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
          <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-900">Aucune offre de travaux trouvée</p>
          <p className="text-xs text-slate-500">
            Toutes les offres soumises par les artisans s&apos;affichent ici pour validation.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => {
            const busy = busyId === offer.id;
            return (
              <div
                key={offer.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-32 h-22 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                    {offer.coverImageUrl || offer.images[0] ? (
                      <img
                        src={offer.coverImageUrl || offer.images[0]}
                        alt={offer.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Briefcase className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                          {offer.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          {offer.tradeName} · {offer.wilaya}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-900 tabular-nums">
                        {formatOfferPriceLabel(offer)}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{offer.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2">{offer.description}</p>
                    <p className="text-[11px] text-slate-500">
                      Publié par <strong className="text-slate-800">{offer.artisanName}</strong> ·{" "}
                      {new Date(offer.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>

                {rejectingId === offer.id && (
                  <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Motif du refus (visible par l'artisan)..."
                      className="flex-1 h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                    />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleModerate(offer.id, "rejected", rejectReason)}
                      className="h-9 px-3.5 rounded-lg bg-red-600 text-white text-xs font-semibold cursor-pointer"
                    >
                      Confirmer le refus
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectingId(null)}
                      className="h-9 px-3 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Annuler
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  {offer.status !== "active" && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleModerate(offer.id, "active")}
                      className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approuver</span>
                    </button>
                  )}

                  {offer.status === "active" && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleModerate(offer.id, "paused")}
                      className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <PauseCircle className="w-3.5 h-3.5" />
                      <span>Suspendre</span>
                    </button>
                  )}

                  {offer.status !== "rejected" && rejectingId !== offer.id && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setRejectingId(offer.id)}
                      className="h-8 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Refuser</span>
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
};
