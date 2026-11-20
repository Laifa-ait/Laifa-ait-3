import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { ArtisanQuoteRequest } from "../../../types/artisan";
import { updateArtisanQuoteStatus } from "../../../services/artisan.api";
import { messagingApi } from "../../../services/messagingApi";

interface ClientQuoteCardProps {
  quote: ArtisanQuoteRequest;
  onUpdated?: () => Promise<void>;
}

export const ClientQuoteCard: React.FC<ClientQuoteCardProps> = ({ quote, onUpdated }) => {
  const navigate = useNavigate();
  const [openingChat, setOpeningChat] = useState(false);
  const [accepting, setAccepting] = useState(false);

  const handleOpenChat = async () => {
    if (quote.conversationId) {
      navigate(`/artisans/messages?conversationId=${encodeURIComponent(quote.conversationId)}`);
      return;
    }
    setOpeningChat(true);
    try {
      const res = await messagingApi.initiateConversation({
        type: "BRICOLAGE_QUOTE",
        recipientId: quote.artisanUserId || quote.artisanId,
        context: { quoteRequestId: quote.id },
        initialMessage: `Bonjour, je vous contacte au sujet de ma demande de devis : ${quote.offerTitle || quote.title}.`,
      });
      const convPayload = res?.data as unknown as {
        conversation?: { id?: string };
        id?: string;
      };
      const convId = convPayload?.conversation?.id || convPayload?.id;
      navigate(convId ? `/artisans/messages?conversationId=${encodeURIComponent(convId)}` : "/artisans/messages");
    } catch {
      navigate("/artisans/messages");
    } finally {
      setOpeningChat(false);
    }
  };

  const handleAcceptProposal = async () => {
    setAccepting(true);
    try {
      await updateArtisanQuoteStatus(quote.id, "accepted");
      if (onUpdated) await onUpdated();
    } finally {
      setAccepting(false);
    }
  };

  const statusMeta = {
    pending: { label: "En attente de devis", cls: "bg-amber-50 text-amber-800 border-amber-200", Icon: Clock },
    responded: { label: "Devis reçu", cls: "bg-blue-50 text-[#1E3A8A] border-blue-200", Icon: MessageSquare },
    accepted: { label: "Devis accepté", cls: "bg-emerald-50 text-emerald-800 border-emerald-200", Icon: CheckCircle2 },
    completed: { label: "Travaux terminés", cls: "bg-slate-100 text-slate-800 border-slate-200", Icon: CheckCircle2 },
    declined: { label: "Décliné", cls: "bg-red-50 text-red-700 border-red-200", Icon: XCircle },
  }[quote.status] || {
    label: "En attente",
    cls: "bg-amber-50 text-amber-800 border-amber-200",
    Icon: Clock,
  };

  const StatusIcon = statusMeta.Icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">
              {quote.offerTitle || quote.serviceTitle || quote.title || "Demande de devis"}
            </h3>
            {quote.urgency === "urgent" && (
              <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[10px] font-semibold">
                Urgent
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Envoyée le {new Date(quote.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>

        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border self-start ${statusMeta.cls}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{statusMeta.label}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500">Artisan</span>
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-[#0F172A]">{quote.artisanName || "Artisan Olmart"}</span>
            {quote.offerId && (
              <button
                type="button"
                onClick={() => navigate(`/artisans/offres/${quote.offerId}`)}
                className="text-[#1E3A8A] hover:underline inline-flex items-center gap-1 font-semibold cursor-pointer"
              >
                <span>Voir l&apos;offre</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
          <p className="text-slate-500 text-[11px]">{quote.tradeName || "Travaux & Services"}</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500">Localisation</span>
          <p className="font-semibold text-[#0F172A] flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{quote.commune}, {quote.wilaya}</span>
          </p>
          {quote.preferredDate && (
            <p className="text-slate-500 text-[11px] flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Date souhaitée : {quote.preferredDate}</span>
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
        {quote.description}
      </p>

      {(quote.proposedPriceDzd || quote.artisanResponse || quote.proposedDelay) && (
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs space-y-1.5">
          <p className="font-bold text-[#1E3A8A]">Proposition de l&apos;artisan</p>
          {quote.proposedPriceDzd && (
            <p className="text-sm font-bold text-[#0F172A] tabular-nums">
              Montant estimé : {quote.proposedPriceDzd.toLocaleString("fr-DZ")} DA
            </p>
          )}
          {quote.proposedDelay && (
            <p className="text-slate-700">Délai proposé : {quote.proposedDelay}</p>
          )}
          {quote.artisanResponse && (
            <p className="text-slate-700 leading-relaxed">{quote.artisanResponse}</p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
        {quote.status === "responded" && (
          <button
            type="button"
            disabled={accepting}
            onClick={handleAcceptProposal}
            className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{accepting ? "Validation..." : "Accepter le devis"}</span>
          </button>
        )}

        <button
          type="button"
          disabled={openingChat}
          onClick={handleOpenChat}
          className="h-9 px-4 rounded-xl bg-[#1E3A8A] hover:bg-blue-950 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{openingChat ? "Ouverture..." : "Ouvrir la messagerie"}</span>
        </button>
      </div>
    </div>
  );
};
