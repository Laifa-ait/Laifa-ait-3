import React, { useState } from "react";
import {
  FileText,
  Calendar,
  MapPin,
  MessageSquare,
  CheckCircle2,
  Send,
} from "lucide-react";
import { ArtisanQuoteRequest } from "../../../types/artisan";
import { updateArtisanQuoteStatus } from "../../../services/artisan.api";
import { messagingApi } from "../../../services/messagingApi";

interface ArtisanQuotesTabProps {
  quotes: ArtisanQuoteRequest[];
  onRefreshQuotes: () => Promise<void>;
  onOpenChat?: (conversationId?: string) => void;
}

export const ArtisanQuotesTab: React.FC<ArtisanQuotesTabProps> = ({
  quotes,
  onRefreshQuotes,
  onOpenChat,
}) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [proposedPrice, setProposedPrice] = useState<string>("");
  const [proposedDelay, setProposedDelay] = useState<string>("Sous 48h");
  const [artisanNote, setArtisanNote] = useState<string>("");

  const handleStatusChange = async (
    quoteId: string,
    status: ArtisanQuoteRequest["status"],
    extra?: { estimatedPrice?: number; artisanNotes?: string; proposedDelay?: string }
  ) => {
    setUpdatingId(quoteId);
    try {
      await updateArtisanQuoteStatus(quoteId, status, extra);
      setReplyingId(null);
      setProposedPrice("");
      setArtisanNote("");
      await onRefreshQuotes();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenChat = async (quote: ArtisanQuoteRequest) => {
    if (quote.conversationId) {
      onOpenChat?.(quote.conversationId);
      return;
    }
    setUpdatingId(quote.id);
    try {
      const res = await messagingApi.initiateConversation({
        type: "BRICOLAGE_QUOTE",
        recipientId: quote.clientId,
        context: { quoteRequestId: quote.id },
        initialMessage: `Bonjour ${quote.clientName}, j'ai bien reçu votre demande pour « ${quote.offerTitle || quote.title} ».`,
      });
      const convPayload = res?.data as unknown as {
        conversation?: { id?: string };
        id?: string;
      };
      onOpenChat?.(convPayload?.conversation?.id || convPayload?.id);
    } catch {
      onOpenChat?.();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#0F172A]">Demandes de devis reçues</h2>
          <p className="text-xs text-slate-500">
            Chiffrez chaque demande et poursuivez la discussion dans la messagerie intégrée.
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-500 tabular-nums">
          {quotes.length} demande{quotes.length > 1 ? "s" : ""}
        </span>
      </div>

      {quotes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
          <FileText className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-sm font-bold text-[#0F172A]">Aucune demande de devis reçue</p>
          <p className="text-xs max-w-md mx-auto">
            Dès qu&apos;un demandeur soumet un devis depuis l&apos;une de vos offres, il apparaît ici.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((q) => {
            const isReplying = replyingId === q.id;
            const busy = updatingId === q.id;
            return (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-[#0F172A]">
                        {q.offerTitle || q.title}
                      </span>
                      {q.urgency === "urgent" && (
                        <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[10px] font-semibold">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                      <span className="font-semibold text-slate-700">{q.clientName}</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {q.commune}, {q.wilaya}
                      </span>
                      {q.preferredDate && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {q.preferredDate}
                        </span>
                      )}
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 self-start">
                    {q.status === "pending"
                      ? "En attente"
                      : q.status === "responded"
                      ? "Devis envoyé"
                      : q.status === "accepted"
                      ? "Accepté"
                      : q.status === "completed"
                      ? "Terminé"
                      : "Décliné"}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {q.description}
                </p>

                {q.proposedPriceDzd && (
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-[#1E3A8A] tabular-nums">
                      Votre estimation : {q.proposedPriceDzd.toLocaleString("fr-DZ")} DA
                    </span>
                    {q.proposedDelay && <span className="text-slate-600">{q.proposedDelay}</span>}
                  </div>
                )}

                {isReplying && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <p className="text-xs font-bold text-[#0F172A]">Envoyer votre estimation chiffrée</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="number"
                        min={100}
                        placeholder="Montant proposé (DA)"
                        value={proposedPrice}
                        onChange={(e) => setProposedPrice(e.target.value)}
                        className="h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs tabular-nums"
                      />
                      <input
                        type="text"
                        placeholder="Délai proposé (ex: Sous 48h)"
                        value={proposedDelay}
                        onChange={(e) => setProposedDelay(e.target.value)}
                        className="h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Précisions sur votre devis (matériel, durée, conditions)..."
                      value={artisanNote}
                      onChange={(e) => setArtisanNote(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-white border border-slate-200 text-xs"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setReplyingId(null)}
                        className="h-8 px-3 rounded-lg bg-white border border-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handleStatusChange(q.id, "responded", {
                            estimatedPrice: proposedPrice ? Number(proposedPrice) : undefined,
                            artisanNotes: artisanNote,
                            proposedDelay,
                          })
                        }
                        className="h-8 px-3.5 rounded-lg bg-[#1E3A8A] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Envoyer le devis</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleOpenChat(q)}
                    className="h-9 px-3.5 rounded-xl border border-slate-200 hover:border-[#1E3A8A] text-slate-800 hover:text-[#1E3A8A] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ouvrir la messagerie</span>
                  </button>

                  {q.status === "pending" && !isReplying && (
                    <>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleStatusChange(q.id, "declined")}
                        className="h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 text-xs font-semibold cursor-pointer"
                      >
                        Décliner
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setReplyingId(q.id)}
                        className="h-9 px-4 rounded-xl bg-[#1E3A8A] hover:bg-blue-950 text-white text-xs font-semibold cursor-pointer"
                      >
                        Proposer un devis
                      </button>
                    </>
                  )}

                  {q.status === "accepted" && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleStatusChange(q.id, "completed")}
                      className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Marquer comme terminé</span>
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
